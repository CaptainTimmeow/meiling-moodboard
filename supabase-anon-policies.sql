-- Update RLS policies for simple passphrase auth (no email auth required)
-- Run this after switching to simple auth

-- Allow anonymous/authenticated access to profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Allow all access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- Allow anonymous/authenticated access to boards
DROP POLICY IF EXISTS "Boards are viewable by authenticated users" ON public.boards;
DROP POLICY IF EXISTS "Users can create boards" ON public.boards;
DROP POLICY IF EXISTS "Users can update own boards" ON public.boards;
DROP POLICY IF EXISTS "Users can delete own boards" ON public.boards;
CREATE POLICY "Allow all access to boards" ON public.boards FOR ALL USING (true) WITH CHECK (true);

-- Allow anonymous/authenticated access to elements
DROP POLICY IF EXISTS "Elements are viewable by authenticated users" ON public.elements;
DROP POLICY IF EXISTS "Authenticated users can insert elements" ON public.elements;
DROP POLICY IF EXISTS "Authenticated users can update elements" ON public.elements;
DROP POLICY IF EXISTS "Authenticated users can delete elements" ON public.elements;
CREATE POLICY "Allow all access to elements" ON public.elements FOR ALL USING (true) WITH CHECK (true);

-- Update storage policies for media bucket
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
CREATE POLICY "Allow all uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');
CREATE POLICY "Allow all reads" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Allow all deletes" ON storage.objects FOR DELETE USING (bucket_id = 'media');
