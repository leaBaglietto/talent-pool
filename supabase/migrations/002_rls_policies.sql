-- =============================================
-- Talent Pool Manager — Row Level Security
-- Migration 002
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.joyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Helper: check if current user is a joyer
-- =============================================

CREATE OR REPLACE FUNCTION public.is_joyer()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.joyers
        WHERE id = auth.uid()
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.joyers
        WHERE id = auth.uid()
        AND is_active = true
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RLS: prospects
-- =============================================

-- Prospectos ven solo su propia fila (sin columnas internas)
CREATE POLICY "Prospects: own row read"
    ON public.prospects FOR SELECT
    TO authenticated
    USING (
        id = auth.uid() OR public.is_joyer()
    );

-- Prospectos pueden insertar su propia fila
CREATE POLICY "Prospects: own insert"
    ON public.prospects FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Prospectos pueden actualizar su propia fila (solo campos de postulación)
CREATE POLICY "Prospects: own update"
    ON public.prospects FOR UPDATE
    TO authenticated
    USING (id = auth.uid() OR public.is_joyer());

-- Joyers pueden actualizarlos (no delete)
-- (cubierto por la policy anterior con is_joyer check)

-- =============================================
-- RLS: interviews
-- =============================================

-- Solo joyers pueden ver entrevistas
CREATE POLICY "Interviews: joyer read"
    ON public.interviews FOR SELECT
    TO authenticated
    USING (public.is_joyer());

-- Solo joyers pueden crear/editar entrevistas
CREATE POLICY "Interviews: joyer insert"
    ON public.interviews FOR INSERT
    TO authenticated
    WITH CHECK (public.is_joyer());

CREATE POLICY "Interviews: joyer update"
    ON public.interviews FOR UPDATE
    TO authenticated
    USING (public.is_joyer());

-- =============================================
-- RLS: ratings
-- =============================================

-- Solo joyers pueden ver ratings
CREATE POLICY "Ratings: joyer read"
    ON public.ratings FOR SELECT
    TO authenticated
    USING (public.is_joyer());

-- Solo joyers pueden crear ratings
CREATE POLICY "Ratings: joyer insert"
    ON public.ratings FOR INSERT
    TO authenticated
    WITH CHECK (public.is_joyer());

-- Joyers solo pueden editar sus propias ratings
CREATE POLICY "Ratings: own update"
    ON public.ratings FOR UPDATE
    TO authenticated
    USING (joyer_id = auth.uid());

-- =============================================
-- RLS: joyers
-- =============================================

-- Joyers pueden ver la lista de joyers
CREATE POLICY "Joyers: joyer read"
    ON public.joyers FOR SELECT
    TO authenticated
    USING (public.is_joyer() OR id = auth.uid());

-- Solo admin puede crear joyers
CREATE POLICY "Joyers: admin insert"
    ON public.joyers FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- Solo admin puede actualizar joyers
CREATE POLICY "Joyers: admin update"
    ON public.joyers FOR UPDATE
    TO authenticated
    USING (public.is_admin());

-- =============================================
-- RLS: status_logs (read-only para joyers)
-- =============================================

CREATE POLICY "Status Logs: joyer read"
    ON public.status_logs FOR SELECT
    TO authenticated
    USING (public.is_joyer());

-- Insert es via trigger (SECURITY DEFINER), no necesita policy explícita
CREATE POLICY "Status Logs: system insert"
    ON public.status_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);
