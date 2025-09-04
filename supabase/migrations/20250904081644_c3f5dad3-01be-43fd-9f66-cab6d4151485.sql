-- Fix function search path security issue
CREATE OR REPLACE FUNCTION update_learner_profile_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE learner_profiles 
  SET 
    last_active = now(),
    updated_at = now()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;