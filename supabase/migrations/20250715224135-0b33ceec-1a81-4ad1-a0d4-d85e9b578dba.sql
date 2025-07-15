-- Create tables for Telegram Mini App Freelance Platform

-- Create enum for service types
CREATE TYPE public.service_type AS ENUM (
  'graphic_design',
  'article_writing', 
  'translation',
  'video_editing',
  'website_development'
);

-- Create enum for order status
CREATE TYPE public.order_status AS ENUM (
  'new',
  'in_progress', 
  'completed',
  'cancelled'
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  service_type service_type NOT NULL,
  starting_price INTEGER NOT NULL, -- Price in cents
  delivery_time_days INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_user_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  contact_info TEXT NOT NULL, -- Email or WhatsApp
  service_id UUID NOT NULL REFERENCES public.services(id),
  deadline DATE,
  notes TEXT,
  status order_status NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  result_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for admin access
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(telegram_user_id)
);

-- Enable Row Level Security
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for services (public read)
CREATE POLICY "Services are publicly readable" 
ON public.services 
FOR SELECT 
USING (true);

-- Create policies for orders
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (telegram_user_id = current_setting('app.telegram_user_id', true));

CREATE POLICY "Users can create their own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (telegram_user_id = current_setting('app.telegram_user_id', true));

CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE telegram_user_id = current_setting('app.telegram_user_id', true) 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update all orders" 
ON public.orders 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE telegram_user_id = current_setting('app.telegram_user_id', true) 
    AND role = 'admin'
  )
);

-- Create policies for user_roles
CREATE POLICY "Users can view their own role" 
ON public.user_roles 
FOR SELECT 
USING (telegram_user_id = current_setting('app.telegram_user_id', true));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample services
INSERT INTO public.services (name, description, service_type, starting_price, delivery_time_days) VALUES
('Logo & Branding Design', 'Desain logo profesional dan brand identity yang menarik untuk bisnis Anda', 'graphic_design', 15000000, 3),
('Social Media Design', 'Desain konten untuk Instagram, Facebook, dan platform media sosial lainnya', 'graphic_design', 5000000, 2),
('Artikel SEO & Blog', 'Penulisan artikel berkualitas tinggi yang SEO-friendly untuk website Anda', 'article_writing', 10000000, 5),
('Copywriting Marketing', 'Penulisan copy yang persuasif untuk iklan, landing page, dan kampanye marketing', 'article_writing', 12000000, 3),
('Terjemahan ID-EN', 'Layanan terjemahan profesional dari Bahasa Indonesia ke Bahasa Inggris', 'translation', 8000000, 3),
('Terjemahan EN-ID', 'Layanan terjemahan profesional dari Bahasa Inggris ke Bahasa Indonesia', 'translation', 8000000, 3),
('Edit Video Promosi', 'Editing video promosi, iklan, dan konten marketing yang engaging', 'video_editing', 20000000, 7),
('Edit Video YouTube', 'Editing video untuk YouTube dengan thumbnail dan optimasi engagement', 'video_editing', 15000000, 5),
('Landing Page', 'Pembuatan landing page yang konversi tinggi dan mobile-friendly', 'website_development', 25000000, 10),
('Website Company Profile', 'Pembuatan website company profile profesional dengan CMS', 'website_development', 50000000, 14);