-- Replace the hardcoded 'reading' trigger with a dynamic one
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
DECLARE
    target_metric TEXT;
    old_val NUMERIC;
    new_val NUMERIC;
    goal_record RECORD;
BEGIN
    -- Only process if an activity is explicitly linked to a goal
    IF (NEW.goal_id IS NOT NULL AND TG_OP IN ('INSERT', 'UPDATE')) THEN
        SELECT * INTO goal_record FROM goals WHERE id = NEW.goal_id;
        
        -- If the goal has a defined metric_name in its target JSON
        IF (goal_record.target ? 'metric_name') THEN
            target_metric := goal_record.target->>'metric_name';
            
            -- For INSERT
            IF (TG_OP = 'INSERT') THEN
                new_val := COALESCE((NEW.metrics->>target_metric)::NUMERIC, 0);
                
                UPDATE goals
                SET current_progress = jsonb_set(
                    COALESCE(current_progress, '{}'::jsonb),
                    array[target_metric],
                    to_jsonb(COALESCE((current_progress->>target_metric)::NUMERIC, 0) + new_val)
                )
                WHERE id = NEW.goal_id;
            
            -- For UPDATE
            ELSIF (TG_OP = 'UPDATE') THEN
                old_val := COALESCE((OLD.metrics->>target_metric)::NUMERIC, 0);
                new_val := COALESCE((NEW.metrics->>target_metric)::NUMERIC, 0);
                
                UPDATE goals
                SET current_progress = jsonb_set(
                    COALESCE(current_progress, '{}'::jsonb),
                    array[target_metric],
                    to_jsonb(COALESCE((current_progress->>target_metric)::NUMERIC, 0) - old_val + new_val)
                )
                WHERE id = NEW.goal_id;
            END IF;
        END IF;
    END IF;

    -- For DELETE
    IF (TG_OP = 'DELETE' AND OLD.goal_id IS NOT NULL) THEN
        SELECT * INTO goal_record FROM goals WHERE id = OLD.goal_id;
        
        IF (goal_record.target ? 'metric_name') THEN
            target_metric := goal_record.target->>'metric_name';
            old_val := COALESCE((OLD.metrics->>target_metric)::NUMERIC, 0);
            
            UPDATE goals
            SET current_progress = jsonb_set(
                COALESCE(current_progress, '{}'::jsonb),
                array[target_metric],
                to_jsonb(COALESCE((current_progress->>target_metric)::NUMERIC, 0) - old_val)
            )
            WHERE id = OLD.goal_id;
        END IF;
        
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;