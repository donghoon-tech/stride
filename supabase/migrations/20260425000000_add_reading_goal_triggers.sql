-- 1. Add goal_id to activities
ALTER TABLE activities ADD COLUMN goal_id UUID REFERENCES goals(id);

-- 2. Add current_progress to goals
ALTER TABLE goals ADD COLUMN current_progress JSONB DEFAULT '{}'::jsonb;

-- 3. Create Trigger Function
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
DECLARE
    old_pages NUMERIC;
    new_pages NUMERIC;
    current_pages NUMERIC;
BEGIN
    -- Only process 'reading' activities
    IF (TG_OP = 'INSERT' AND NEW.activity_type = 'reading') THEN
        new_pages := COALESCE((NEW.metrics->>'pages_read')::NUMERIC, 0);
        
        UPDATE goals
        SET current_progress = jsonb_set(
            COALESCE(current_progress, '{}'::jsonb),
            '{pages_read}',
            to_jsonb(COALESCE((current_progress->>'pages_read')::NUMERIC, 0) + new_pages)
        )
        WHERE id = NEW.goal_id;

    ELSIF (TG_OP = 'UPDATE' AND NEW.activity_type = 'reading') THEN
        old_pages := COALESCE((OLD.metrics->>'pages_read')::NUMERIC, 0);
        new_pages := COALESCE((NEW.metrics->>'pages_read')::NUMERIC, 0);
        
        UPDATE goals
        SET current_progress = jsonb_set(
            COALESCE(current_progress, '{}'::jsonb),
            '{pages_read}',
            to_jsonb(COALESCE((current_progress->>'pages_read')::NUMERIC, 0) - old_pages + new_pages)
        )
        WHERE id = NEW.goal_id;

    ELSIF (TG_OP = 'DELETE' AND OLD.activity_type = 'reading') THEN
        old_pages := COALESCE((OLD.metrics->>'pages_read')::NUMERIC, 0);
        
        UPDATE goals
        SET current_progress = jsonb_set(
            COALESCE(current_progress, '{}'::jsonb),
            '{pages_read}',
            to_jsonb(COALESCE((current_progress->>'pages_read')::NUMERIC, 0) - old_pages)
        )
        WHERE id = OLD.goal_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create Trigger
CREATE TRIGGER on_activity_change
AFTER INSERT OR UPDATE OR DELETE ON activities
FOR EACH ROW EXECUTE FUNCTION update_goal_progress();