-- =============================================
-- Talent Pool Manager — Add Pending Status
-- Migration 006
-- =============================================

-- Modificar el constraint del campo status en la tabla prospects
-- Primero, lo eliminamos con seguridad
ALTER TABLE public.prospects DROP CONSTRAINT IF EXISTS prospects_status_check;

-- Luego agregamos el nuevo constraint que incluye 'pending'
ALTER TABLE public.prospects ADD CONSTRAINT prospects_status_check 
    CHECK (status IN ('pending', 'unassigned', 'assigned', 'selected', 'rejected'));

-- Create an explicit RLS policy so prospects can read their own pending profile
-- In case it was strictly relying on unassigned previously
DROP POLICY IF EXISTS "Prospects: read own profile" ON public.prospects;
CREATE POLICY "Prospects: read own profile" 
    ON public.prospects FOR SELECT 
    TO authenticated 
    USING (auth.uid() = id);

-- Upsert policy (they can insert/update their own profile)
DROP POLICY IF EXISTS "Prospects: insert/update own profile" ON public.prospects;
CREATE POLICY "Prospects: insert/update own profile" 
    ON public.prospects FOR ALL 
    TO authenticated 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- =============================================
-- Fix Triggers for Foreign Key Violation
-- =============================================
-- Si un usuario (prospecto) o el sistema anónimo cambia el estado, 
-- auth.uid() no estará en la tabla joyers, lo que violaba la clave foránea.
-- Lo solucionamos comprobando si es Joyer, de lo contrario dejamos changed_by en NULL.

CREATE OR REPLACE FUNCTION public.log_prospect_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_is_joyer BOOLEAN;
BEGIN
    v_is_joyer := EXISTS (SELECT 1 FROM public.joyers WHERE id = auth.uid());
    
    INSERT INTO public.status_logs (prospect_id, old_status, new_status, changed_by)
    VALUES (NEW.id, NULL, NEW.status, CASE WHEN v_is_joyer THEN auth.uid() ELSE NULL END);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_prospect_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_is_joyer BOOLEAN;
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        v_is_joyer := EXISTS (SELECT 1 FROM public.joyers WHERE id = auth.uid());
        INSERT INTO public.status_logs (prospect_id, old_status, new_status, changed_by)
        VALUES (NEW.id, OLD.status, NEW.status, CASE WHEN v_is_joyer THEN auth.uid() ELSE NULL END);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
