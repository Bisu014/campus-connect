
-- Update the handle_new_user function to make the first user an admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
  assigned_role app_role;
BEGIN
  -- Count existing users to determine if this is the first user
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- First user becomes admin, others become students
  IF user_count = 0 THEN
    assigned_role := 'admin'::app_role;
  ELSE
    assigned_role := 'student'::app_role;
  END IF;

  -- Insert profile
  INSERT INTO public.profiles (user_id, email, name, branch)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'branch', 'General')
  );

  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role);

  RETURN NEW;
END;
$$;
