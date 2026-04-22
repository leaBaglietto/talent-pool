-- =============================================
-- Talent Pool Manager — Fix Storage RLS
-- Migration 005
-- =============================================

-- Borrar políticas viejas (por las dudas)
DROP POLICY IF EXISTS "CVs: prospect upload" ON storage.objects;
DROP POLICY IF EXISTS "CVs: joyer read" ON storage.objects;
DROP POLICY IF EXISTS "CVs: prospect update" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: prospect upload" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: public read" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: prospect update" ON storage.objects;

-- Nuevas políticas robustas usando `owner` de Supabase nativo

-- CVs
CREATE POLICY "CVs: prospect upload" 
    ON storage.objects FOR INSERT 
    TO authenticated 
    WITH CHECK (bucket_id = 'cvs' AND auth.uid() = owner);

CREATE POLICY "CVs: joyer read" 
    ON storage.objects FOR SELECT 
    TO authenticated 
    USING (bucket_id = 'cvs' AND (auth.uid() = owner OR public.is_joyer()));

CREATE POLICY "CVs: prospect update" 
    ON storage.objects FOR UPDATE 
    TO authenticated 
    USING (bucket_id = 'cvs' AND auth.uid() = owner);

-- Avatars
CREATE POLICY "Avatars: prospect upload" 
    ON storage.objects FOR INSERT 
    TO authenticated 
    WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

CREATE POLICY "Avatars: public read" 
    ON storage.objects FOR SELECT 
    TO public 
    USING (bucket_id = 'avatars');

CREATE POLICY "Avatars: prospect update" 
    ON storage.objects FOR UPDATE 
    TO authenticated 
    USING (bucket_id = 'avatars' AND auth.uid() = owner);
