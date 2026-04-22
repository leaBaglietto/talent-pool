-- =============================================
-- Talent Pool Manager — RPC Functions (Atomic Operations)
-- Migration 003
-- =============================================

-- Función: assign_interviewer
-- Cambio atómico: status → assigned + crea interview + log
CREATE OR REPLACE FUNCTION public.assign_interviewer(
    p_prospect_id UUID,
    p_interviewer_id UUID
)
RETURNS VOID AS $$
BEGIN
    -- Validar que el prospecto existe y está en estado válido
    IF NOT EXISTS (
        SELECT 1 FROM public.prospects
        WHERE id = p_prospect_id
        AND status IN ('unassigned', 'assigned')
    ) THEN
        RAISE EXCEPTION 'El prospecto no existe o no está disponible para asignación';
    END IF;

    -- Validar que el entrevistador existe y está activo
    IF NOT EXISTS (
        SELECT 1 FROM public.joyers
        WHERE id = p_interviewer_id
        AND is_active = true
        AND role IN ('interviewer', 'admin')
    ) THEN
        RAISE EXCEPTION 'El entrevistador no existe o no está habilitado';
    END IF;

    -- Actualizar status del prospecto
    UPDATE public.prospects
    SET status = 'assigned'
    WHERE id = p_prospect_id;

    -- Crear o actualizar registro de entrevista
    INSERT INTO public.interviews (prospect_id, interviewer_id, outcome)
    VALUES (p_prospect_id, p_interviewer_id, 'pending')
    ON CONFLICT (prospect_id, interviewer_id)
    DO UPDATE SET
        outcome = 'pending',
        outcome_at = NULL;

    -- El trigger se encarga del log automáticamente
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: accept_prospect
-- Cambio atómico: status → selected + actualiza interview + log
CREATE OR REPLACE FUNCTION public.accept_prospect(
    p_prospect_id UUID,
    p_notes TEXT DEFAULT ''
)
RETURNS VOID AS $$
BEGIN
    -- Validar estado
    IF NOT EXISTS (
        SELECT 1 FROM public.prospects
        WHERE id = p_prospect_id
        AND status IN ('unassigned', 'assigned')
    ) THEN
        RAISE EXCEPTION 'El prospecto no está en estado válido para aceptar';
    END IF;

    -- Actualizar status
    UPDATE public.prospects
    SET status = 'selected'
    WHERE id = p_prospect_id;

    -- Actualizar interview
    UPDATE public.interviews
    SET outcome = 'accepted',
        notes = p_notes,
        outcome_at = now()
    WHERE prospect_id = p_prospect_id
    AND outcome = 'pending';

    -- Si no hay interview, el interviewer es el usuario actual
    IF NOT FOUND THEN
        INSERT INTO public.interviews (prospect_id, interviewer_id, outcome, notes, outcome_at)
        VALUES (p_prospect_id, auth.uid(), 'accepted', p_notes, now());
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: reject_prospect
-- Cambio atómico: status → rejected + actualiza interview + log
CREATE OR REPLACE FUNCTION public.reject_prospect(
    p_prospect_id UUID,
    p_notes TEXT DEFAULT ''
)
RETURNS VOID AS $$
BEGIN
    -- Validar estado
    IF NOT EXISTS (
        SELECT 1 FROM public.prospects
        WHERE id = p_prospect_id
        AND status IN ('unassigned', 'assigned')
    ) THEN
        RAISE EXCEPTION 'El prospecto no está en estado válido para rechazar';
    END IF;

    -- Actualizar status
    UPDATE public.prospects
    SET status = 'rejected'
    WHERE id = p_prospect_id;

    -- Actualizar interview
    UPDATE public.interviews
    SET outcome = 'rejected',
        notes = p_notes,
        outcome_at = now()
    WHERE prospect_id = p_prospect_id
    AND outcome = 'pending';

    -- Si no hay interview, el interviewer es el usuario actual
    IF NOT FOUND THEN
        INSERT INTO public.interviews (prospect_id, interviewer_id, outcome, notes, outcome_at)
        VALUES (p_prospect_id, auth.uid(), 'rejected', p_notes, now());
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION public.assign_interviewer(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_prospect(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_prospect(UUID, TEXT) TO authenticated;
