
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('viewer', 'analyst', 'admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create financial_records table
CREATE TABLE public.financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_financial_records_user_id ON public.financial_records(user_id);
CREATE INDEX idx_financial_records_type ON public.financial_records(type);
CREATE INDEX idx_financial_records_category ON public.financial_records(category);
CREATE INDEX idx_financial_records_date ON public.financial_records(record_date);
CREATE INDEX idx_financial_records_not_deleted ON public.financial_records(is_deleted) WHERE is_deleted = false;
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- Security definer function to check roles (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_records_updated_at
  BEFORE UPDATE ON public.financial_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for financial_records
CREATE POLICY "Viewers can view records"
  ON public.financial_records FOR SELECT
  TO authenticated
  USING (
    is_deleted = false AND (
      public.has_role(auth.uid(), 'viewer') OR
      public.has_role(auth.uid(), 'analyst') OR
      public.has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY "Admins can insert records"
  ON public.financial_records FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update records"
  ON public.financial_records FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete records"
  ON public.financial_records FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile and role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Dashboard summary function (security definer to bypass RLS for aggregation)
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  user_role app_role;
BEGIN
  SELECT role INTO user_role FROM public.user_roles WHERE user_id = _user_id LIMIT 1;
  
  IF user_role IS NULL THEN
    RETURN json_build_object('error', 'unauthorized');
  END IF;

  SELECT json_build_object(
    'total_income', COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
    'total_expenses', COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0),
    'net_balance', COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0),
    'record_count', COUNT(*),
    'category_totals', (
      SELECT COALESCE(json_agg(json_build_object('category', category, 'total', cat_total, 'type', type)), '[]'::json)
      FROM (
        SELECT category, type, SUM(amount) as cat_total
        FROM public.financial_records
        WHERE is_deleted = false
        GROUP BY category, type
        ORDER BY cat_total DESC
      ) cats
    ),
    'monthly_trends', (
      SELECT COALESCE(json_agg(json_build_object('month', month, 'income', monthly_income, 'expenses', monthly_expenses)), '[]'::json)
      FROM (
        SELECT to_char(record_date, 'YYYY-MM') as month,
               SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as monthly_income,
               SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as monthly_expenses
        FROM public.financial_records
        WHERE is_deleted = false
        GROUP BY to_char(record_date, 'YYYY-MM')
        ORDER BY month DESC
        LIMIT 12
      ) monthly
    ),
    'recent_activity', (
      SELECT COALESCE(json_agg(json_build_object('id', id, 'amount', amount, 'type', type, 'category', category, 'date', record_date, 'description', description)), '[]'::json)
      FROM (
        SELECT id, amount, type, category, record_date, description
        FROM public.financial_records
        WHERE is_deleted = false
        ORDER BY created_at DESC
        LIMIT 10
      ) recent
    )
  ) INTO result
  FROM public.financial_records
  WHERE is_deleted = false;

  RETURN result;
END;
$$;
