-- =============================================
-- Talent Pool Manager — Initial Schema
-- Migration 001
-- =============================================

-- Tabla: joyers (extends auth.users)
CREATE TABLE IF NOT EXISTS public.joyers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'joyer' CHECK (role IN ('joyer', 'interviewer', 'admin')),
    team TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla: prospects
CREATE TABLE IF NOT EXISTS public.prospects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    team TEXT NOT NULL DEFAULT 'creative' CHECK (team IN ('creative', 'accounts', 'digital')),
    profile_type TEXT NOT NULL,
    years_experience INTEGER NOT NULL DEFAULT 0 CHECK (years_experience >= 0),
    portfolio_url TEXT,
    cv_url TEXT,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'unassigned' CHECK (status IN ('unassigned', 'assigned', 'selected', 'rejected')),
    is_in_project BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla: interviews
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
    interviewer_id UUID NOT NULL REFERENCES public.joyers(id) ON DELETE CASCADE,
    outcome TEXT NOT NULL DEFAULT 'pending' CHECK (outcome IN ('pending', 'accepted', 'rejected')),
    notes TEXT,
    outcome_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla: ratings
CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
    joyer_id UUID NOT NULL REFERENCES public.joyers(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(prospect_id, joyer_id)
);

-- Tabla: status_logs (auditoría — nunca se borran)
CREATE TABLE IF NOT EXISTS public.status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES public.joyers(id),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- Triggers: auto-update updated_at
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prospects_updated_at
    BEFORE UPDATE ON public.prospects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER ratings_updated_at
    BEFORE UPDATE ON public.ratings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- Trigger: auto-log status changes in prospects
-- =============================================

CREATE OR REPLACE FUNCTION public.log_prospect_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.status_logs (prospect_id, old_status, new_status, changed_by)
        VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER prospect_status_log
    AFTER UPDATE OF status ON public.prospects
    FOR EACH ROW
    EXECUTE FUNCTION public.log_prospect_status_change();

-- =============================================
-- Trigger: auto-log initial status on insert
-- =============================================

CREATE OR REPLACE FUNCTION public.log_prospect_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.status_logs (prospect_id, old_status, new_status, changed_by)
    VALUES (NEW.id, NULL, NEW.status, auth.uid());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER prospect_insert_log
    AFTER INSERT ON public.prospects
    FOR EACH ROW
    EXECUTE FUNCTION public.log_prospect_insert();

-- =============================================
-- Indexes
-- =============================================

CREATE INDEX IF NOT EXISTS idx_prospects_status ON public.prospects(status);
CREATE INDEX IF NOT EXISTS idx_prospects_email ON public.prospects(email);
CREATE INDEX IF NOT EXISTS idx_prospects_team ON public.prospects(team);
CREATE INDEX IF NOT EXISTS idx_prospects_profile_type ON public.prospects(profile_type);
CREATE INDEX IF NOT EXISTS idx_interviews_prospect ON public.interviews(prospect_id);
CREATE INDEX IF NOT EXISTS idx_interviews_interviewer ON public.interviews(interviewer_id);
CREATE INDEX IF NOT EXISTS idx_ratings_prospect ON public.ratings(prospect_id);
CREATE INDEX IF NOT EXISTS idx_ratings_joyer ON public.ratings(joyer_id);
CREATE INDEX IF NOT EXISTS idx_status_logs_prospect ON public.status_logs(prospect_id);
