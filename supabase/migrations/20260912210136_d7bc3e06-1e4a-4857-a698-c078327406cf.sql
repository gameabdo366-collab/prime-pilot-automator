CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TYPE public.account_status AS ENUM ('Active','Inactive','Expired','Unknown');
CREATE TYPE public.card_status AS ENUM ('Available','Running','Consumed','Expired','Failed');
CREATE TYPE public.task_status AS ENUM ('Pending','Running','Paused','Completed','Failed','Cancelled');
CREATE TYPE public.task_priority AS ENUM ('Low','Normal','High','Urgent');
CREATE TYPE public.log_level AS ENUM ('debug','info','warn','error');

CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  email TEXT NOT NULL,
  password_encrypted TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  status public.account_status NOT NULL DEFAULT 'Unknown',
  prime_expiration DATE,
  last_execution TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounts TO authenticated;
GRANT ALL ON public.accounts TO service_role;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages accounts" ON public.accounts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER accounts_touch BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  alias TEXT NOT NULL,
  card_number_encrypted TEXT NOT NULL DEFAULT '',
  card_last4 TEXT NOT NULL DEFAULT '',
  expiry TEXT NOT NULL DEFAULT '',
  cvv_encrypted TEXT NOT NULL DEFAULT '',
  expires_at TIMESTAMPTZ,
  notes TEXT NOT NULL DEFAULT '',
  status public.card_status NOT NULL DEFAULT 'Available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cards TO authenticated;
GRANT ALL ON public.cards TO service_role;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages cards" ON public.cards FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER cards_touch BEFORE UPDATE ON public.cards FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  card_id UUID REFERENCES public.cards(id) ON DELETE SET NULL,
  workflow TEXT NOT NULL,
  status public.task_status NOT NULL DEFAULT 'Pending',
  progress INTEGER NOT NULL DEFAULT 0,
  priority public.task_priority NOT NULL DEFAULT 'Normal',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages tasks" ON public.tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  level public.log_level NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.logs TO authenticated;
GRANT ALL ON public.logs TO service_role;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages logs" ON public.logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX logs_created_idx ON public.logs (created_at DESC);

CREATE TABLE public.screenshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  image TEXT NOT NULL,
  step TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.screenshots TO authenticated;
GRANT ALL ON public.screenshots TO service_role;
ALTER TABLE public.screenshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages screenshots" ON public.screenshots FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.settings (
  user_id UUID NOT NULL DEFAULT auth.uid() PRIMARY KEY,
  headless_mode BOOLEAN NOT NULL DEFAULT true,
  visible_browser BOOLEAN NOT NULL DEFAULT false,
  timeout_seconds INTEGER NOT NULL DEFAULT 60,
  retries INTEGER NOT NULL DEFAULT 2,
  runner_url TEXT NOT NULL DEFAULT '',
  runner_token TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages settings" ON public.settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER settings_touch BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();