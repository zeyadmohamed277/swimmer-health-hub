-- Add new columns to profiles table for extended swimmer information
ALTER TABLE public.profiles
ADD COLUMN national_id TEXT,
ADD COLUMN gender TEXT,
ADD COLUMN blood_type TEXT,
ADD COLUMN father_name TEXT,
ADD COLUMN father_national_id TEXT,
ADD COLUMN mother_name TEXT,
ADD COLUMN mother_national_id TEXT,
ADD COLUMN allergies TEXT,
ADD COLUMN previous_surgeries TEXT,
ADD COLUMN chronic_diseases TEXT;