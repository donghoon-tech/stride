-- Update the goal progress trigger to support universal 'checkpoint' tracking.
-- If an activity provides a 'checkpoint', the trigger calculates the delta from the 'last_checkpoint'
-- and updates the cumulative progress and the new 'last_checkpoint'.

CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
DECLARE
    target_metric TEXT;
    old_val NUMERIC;
    new_val NUMERIC;
    goal_record RECORD;
    new_progress JSONB;
    prev_checkpoint NUMERIC;
    current_checkpoint NUMERIC;
    calculated_delta NUMERIC;
BEGIN
    -- Only process if an activity is explicitly linked to a goal
    IF (TG_OP = 'DELETE') THEN
        IF (OLD.goal_id IS NULL) THEN RETURN OLD; END IF;
        SELECT * INTO goal_record FROM goals WHERE id = OLD.goal_id;
    ELSE
        IF (NEW.goal_id IS NULL) THEN RETURN NEW; END IF;
        SELECT * INTO goal_record FROM goals WHERE id = NEW.goal_id;
    END IF;

    -- If the goal has a defined metric_name in its target JSON
    IF (goal_record.id IS NOT NULL AND goal_record.target ? 'metric_name') THEN
        target_metric := goal_record.target->>'metric_name';
        
        -- FOR INSERT OR UPDATE
        IF (TG_OP IN ('INSERT', 'UPDATE')) THEN
            -- CHECKPOINT LOGIC: If activity has a 'checkpoint' value
            IF (NEW.metrics ? 'checkpoint') THEN
                current_checkpoint := (NEW.metrics->>'checkpoint')::NUMERIC;
                
                -- Get previous checkpoint
                IF (TG_OP = 'INSERT') THEN
                    prev_checkpoint := COALESCE(
                        (goal_record.current_progress->>'last_checkpoint')::NUMERIC,
                        (goal_record.target->>'start_value')::NUMERIC,
                        0
                    );
                    calculated_delta := current_checkpoint - prev_checkpoint;
                ELSE -- UPDATE
                    prev_checkpoint := (OLD.metrics->>'checkpoint')::NUMERIC;
                    calculated_delta := current_checkpoint - prev_checkpoint;
                END IF;
                
                new_progress := jsonb_set(
                    COALESCE(goal_record.current_progress, '{}'::jsonb),
                    array[target_metric],
                    to_jsonb(COALESCE((goal_record.current_progress->>target_metric)::NUMERIC, 0) + calculated_delta)
                );
                new_progress := jsonb_set(new_progress, '{last_checkpoint}', to_jsonb(current_checkpoint));

                UPDATE goals SET current_progress = new_progress WHERE id = NEW.goal_id;

            -- REGULAR DELTA LOGIC: (Standard distance_km, etc.)
            ELSE
                IF (TG_OP = 'INSERT') THEN
                    new_val := COALESCE((NEW.metrics->>target_metric)::NUMERIC, 0);
                    calculated_delta := new_val;
                ELSE -- UPDATE
                    old_val := COALESCE((OLD.metrics->>target_metric)::NUMERIC, 0);
                    new_val := COALESCE((NEW.metrics->>target_metric)::NUMERIC, 0);
                    calculated_delta := new_val - old_val;
                END IF;
                
                UPDATE goals
                SET current_progress = jsonb_set(
                    COALESCE(current_progress, '{}'::jsonb),
                    array[target_metric],
                    to_jsonb(COALESCE((current_progress->>target_metric)::NUMERIC, 0) + calculated_delta)
                )
                WHERE id = NEW.goal_id;
            END IF;
        
        -- FOR DELETE
        ELSIF (TG_OP = 'DELETE') THEN
            IF (OLD.metrics ? 'checkpoint') THEN
                -- Revert checkpoint: finding the one before the deleted one
                SELECT (metrics->>'checkpoint')::NUMERIC INTO prev_checkpoint 
                FROM activities 
                WHERE goal_id = OLD.goal_id AND id != OLD.id
                ORDER BY recorded_at DESC LIMIT 1;

                calculated_delta := (OLD.metrics->>'checkpoint')::NUMERIC - COALESCE(prev_checkpoint, (goal_record.target->>'start_value')::NUMERIC, 0);

                new_progress := jsonb_set(
                    COALESCE(goal_record.current_progress, '{}'::jsonb),
                    array[target_metric],
                    to_jsonb(COALESCE((goal_record.current_progress->>target_metric)::NUMERIC, 0) - calculated_delta)
                );
                
                IF (prev_checkpoint IS NOT NULL) THEN
                    new_progress := jsonb_set(new_progress, '{last_checkpoint}', to_jsonb(prev_checkpoint));
                ELSE
                    new_progress := jsonb_set(new_progress, '{last_checkpoint}', goal_record.target->'start_value');
                END IF;

                UPDATE goals SET current_progress = new_progress WHERE id = OLD.goal_id;
            ELSE
                old_val := COALESCE((OLD.metrics->>target_metric)::NUMERIC, 0);
                UPDATE goals
                SET current_progress = jsonb_set(
                    COALESCE(current_progress, '{}'::jsonb),
                    array[target_metric],
                    to_jsonb(COALESCE((current_progress->>target_metric)::NUMERIC, 0) - old_val)
                )
                WHERE id = OLD.goal_id;
            END IF;
        END IF;
    END IF;
    
    IF (TG_OP = 'DELETE') THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql;

-- DROP if exists and CREATE the trigger properly
DROP TRIGGER IF EXISTS tr_update_goal_progress ON activities;
CREATE TRIGGER tr_update_goal_progress
AFTER INSERT OR UPDATE OR DELETE ON activities
FOR EACH ROW EXECUTE FUNCTION update_goal_progress();
