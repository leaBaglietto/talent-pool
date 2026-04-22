-- =============================================
-- Talent Pool Manager — Storage Buckets
-- Migration 004
-- =============================================

-- Crear buckets de storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('cvs', 'cvs', false, 5242880, ARRAY['application/pdf']),
    ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- Storage Policies: CVs
-- =============================================

-- Prospectos pueden subir su propio CV
CREATE POLICY "CVs: prospect upload"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'cvs'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Joyers pueden leer todos los CVs
CREATE POLICY "CVs: joyer read"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'cvs'
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR public.is_joyer()
        )
    );

-- =============================================
-- Storage Policies: Avatars (public read for simplicity)
-- =============================================

-- Prospectos pueden subir su propia foto
CREATE POLICY "Avatars: prospect upload"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Lectura pública para avatars (necesario para mostrar fotos en cards)
CREATE POLICY "Avatars: public read"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'avatars');

-- Prospectos pueden actualizar su propia foto
CREATE POLICY "Avatars: prospect update"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- CVs: prospectos pueden actualizar su propio CV
CREATE POLICY "CVs: prospect update"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'cvs'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
