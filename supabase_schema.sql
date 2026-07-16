-- ============================================================
-- TRAVELWISE — Supabase SQL Schema
-- Ekzekuto në SQL Editor të Supabase
-- ============================================================

-- 1. PASTRO (nëse ekziston) — i sigurt për ri-ekzekutim
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user;
DROP TABLE IF EXISTS public.saved_trips;
DROP TABLE IF EXISTS public.saved_checklists;
DROP TABLE IF EXISTS public.profiles;

-- 2. PROFILES — Zgjeron auth.users
-- ============================================================
CREATE TABLE public.profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   TEXT,
    nationality TEXT DEFAULT 'Shqiptare',
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Aktivizo RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politikat RLS
CREATE POLICY "Shiko profilin tend"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Perditeso profilin tend"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Fshi profilin tend"
    ON public.profiles FOR DELETE
    USING (auth.uid() = id);

CREATE POLICY "Krijo profilin tend"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 3. TRIGGER: Krijo profil automatikisht kur regjistrohet nje user
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, nationality)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Udhëtar'),
        COALESCE(NEW.raw_user_meta_data ->> 'nationality', 'Shqiptare')
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- 4. SAVED_CHECKLISTS — Ruaj listen e kontrollit per cdo user
-- ============================================================
CREATE TABLE public.saved_checklists (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    trip_name   TEXT DEFAULT 'Udhëtimi Im',
    items_json  JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.saved_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User shikon listen e tij"
    ON public.saved_checklists FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "User krijon listen e tij"
    ON public.saved_checklists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User perditeson listen e tij"
    ON public.saved_checklists FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "User fshin listen e tij"
    ON public.saved_checklists FOR DELETE
    USING (auth.uid() = user_id);

-- 5. SAVED_TRIPS — Ruaj planet e udhetimit nga planifikuesi
-- ============================================================
CREATE TABLE public.saved_trips (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    destination     TEXT NOT NULL,
    days            INT NOT NULL DEFAULT 7,
    trip_type       TEXT NOT NULL DEFAULT 'plesant',
    daily_budget    DECIMAL(10,2) DEFAULT 0,
    total_budget    DECIMAL(10,2) DEFAULT 0,
    visa_required   TEXT,
    clothes_tip     TEXT,
    start_date      DATE,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.saved_trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User shikon planet e tij"
    ON public.saved_trips FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "User krijon plan"
    ON public.saved_trips FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User perditeson plan"
    ON public.saved_trips FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "User fshin plan"
    ON public.saved_trips FOR DELETE
    USING (auth.uid() = user_id);

-- 6. INDEKSE për performancë
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_checklists_user_id ON public.saved_checklists(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.saved_trips(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_nationality ON public.profiles(nationality);

-- 7. FUNKSIONI: update_updated_at — azhurnon timestamp-in automatikisht
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Apliko trigger-in në të gjitha tabelat
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_checklists
    BEFORE UPDATE ON public.saved_checklists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_trips
    BEFORE UPDATE ON public.saved_trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- KONFIGURIMI I SUPABASE
-- ============================================================
-- 1. Shko te: Supabase Dashboard > SQL Editor
-- 2. Paste kete file dhe ekzekutoje (Run)
-- 3. Te Settings > API merr keto vlera:
--    - Project URL: https://XXXXXXXXXXXX.supabase.co
--    - anon public key: eyJhbGciOi...
-- 4. Vendosi ne auth.js si:
--    const SUPABASE_URL = 'https://XXXXXXXXXXXX.supabase.co';
--    const SUPABASE_ANON_KEY = 'eyJhbGciOi...';
-- ============================================================
