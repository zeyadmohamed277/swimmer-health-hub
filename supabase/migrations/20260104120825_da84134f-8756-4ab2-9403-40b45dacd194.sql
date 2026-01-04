-- Create app_role enum for role-based access
CREATE TYPE public.app_role AS ENUM ('swimmer', 'coach');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  phone TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medical_results table
CREATE TABLE public.medical_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swimmer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  examination_date DATE NOT NULL,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'normal', 'attention', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inbody_examinations table
CREATE TABLE public.inbody_examinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swimmer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  examination_date DATE NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  height DECIMAL(5,2),
  muscle_mass DECIMAL(5,2),
  body_fat_percentage DECIMAL(5,2),
  body_water_percentage DECIMAL(5,2),
  bone_mass DECIMAL(5,2),
  bmi DECIMAL(5,2),
  basal_metabolic_rate INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbody_examinations ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own role on signup"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Coaches can view all swimmer profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'coach'));

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- RLS Policies for medical_results
CREATE POLICY "Swimmers can view their own medical results"
  ON public.medical_results FOR SELECT
  TO authenticated
  USING (swimmer_id = auth.uid());

CREATE POLICY "Coaches can view all medical results"
  ON public.medical_results FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'coach'));

CREATE POLICY "Coaches can insert medical results"
  ON public.medical_results FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'coach'));

CREATE POLICY "Coaches can update medical results"
  ON public.medical_results FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'coach'));

-- RLS Policies for inbody_examinations
CREATE POLICY "Swimmers can view their own inbody examinations"
  ON public.inbody_examinations FOR SELECT
  TO authenticated
  USING (swimmer_id = auth.uid());

CREATE POLICY "Coaches can view all inbody examinations"
  ON public.inbody_examinations FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'coach'));

CREATE POLICY "Coaches can insert inbody examinations"
  ON public.inbody_examinations FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'coach'));

CREATE POLICY "Coaches can update inbody examinations"
  ON public.inbody_examinations FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'coach'));

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_results_updated_at
  BEFORE UPDATE ON public.medical_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inbody_examinations_updated_at
  BEFORE UPDATE ON public.inbody_examinations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();