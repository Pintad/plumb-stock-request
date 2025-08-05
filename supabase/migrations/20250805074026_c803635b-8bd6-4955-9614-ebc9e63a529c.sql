-- Create table for application settings
CREATE TABLE public.app_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies - only authenticated users can access
CREATE POLICY "Authenticated users can select app_settings" 
ON public.app_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert app_settings" 
ON public.app_settings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update app_settings" 
ON public.app_settings 
FOR UPDATE 
USING (true);

-- Insert default setting for SMS button visibility
INSERT INTO public.app_settings (setting_key, setting_value) 
VALUES ('sms_button_enabled', 'true')
ON CONFLICT (setting_key) DO NOTHING;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_app_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_app_settings_updated_at();