CREATE TYPE public.activation_status AS ENUM ('Unused', 'Reserved', 'Running', 'Activated', 'Expired', 'Cancelled');

CREATE TABLE public.activation_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  code text NOT NULL UNIQUE,
  driver text NOT NULL DEFAULT 'amazon-eg-prime-annual',
  card_id uuid REFERENCES public.cards(id) ON DELETE SET NULL,
  task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  status public.activation_status NOT NULL DEFAULT 'Unused',
  customer_email text NOT NULL DEFAULT '',
  customer_password_encrypted text NOT NULL DEFAULT '',
  renewal_date date,
  activated_at timestamp with time zone,
  expires_at timestamp with time zone,
  notes text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX activation_codes_card_idx ON public.activation_codes (card_id) WHERE card_id IS NOT NULL;
CREATE INDEX activation_codes_created_idx ON public.activation_codes (created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.activation_codes TO authenticated;
GRANT ALL ON public.activation_codes TO service_role;

ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages activation codes" ON public.activation_codes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER activation_codes_touch BEFORE UPDATE ON public.activation_codes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();