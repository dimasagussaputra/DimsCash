-- ============================================================================
-- DimsCash — Combined Migration
-- PostgreSQL / Supabase
--
-- Isi:
--   1. Enums & Extensions
--   2. Updated At Trigger Helper
--   3. Profiles Table + Trigger
--   4. Categories Table + Triggers + Index
--   5. Transactions Table + Triggers + Indexes + Constraint Function
--   6. Row Level Security (Profiles, Categories, Transactions)
--   7. handle_new_user() — Versi Indonesia
--   8. Trigger on_auth_user_created
--   9. Storage Bucket Avatars + Policies
--  10. Budgets Table + RLS
--  11. Update Categories Policies (allow manage default)
--  12. Translate Existing Default Categories
--  13. [Opsional] Seed Auth Users — Uncomment jika butuh demo
-- ============================================================================


-- ============================================================================
-- 1. ENUMS & EXTENSIONS
-- ============================================================================

create type transaction_type as enum ('income', 'expense');


-- ============================================================================
-- 2. UPDATED AT TRIGGER HELPER
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================================
-- 3. PROFILES TABLE + TRIGGER
-- ============================================================================

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();


-- ============================================================================
-- 4. CATEGORIES TABLE + TRIGGERS + INDEX
-- ============================================================================

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  type        transaction_type not null,
  icon        text,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists categories_user_id_idx on public.categories (user_id);

create trigger handle_categories_updated_at
  before update on public.categories
  for each row
  execute function public.set_updated_at();

-- Force ownership server-side when not supplied.
create or replace function public.set_categories_user_id()
returns trigger
language plpgsql
as $$
begin
  if new.user_id is null then
    new.user_id = auth.uid();
  end if;
  return new;
end;
$$;

create trigger handle_categories_user_id
  before insert on public.categories
  for each row
  execute function public.set_categories_user_id();


-- ============================================================================
-- 5. TRANSACTIONS TABLE + TRIGGERS + INDEXES + CONSTRAINT FUNCTION
-- ============================================================================

create table if not exists public.transactions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  category_id      uuid references public.categories (id) on delete set null,
  type             transaction_type not null,
  amount           numeric not null check (amount > 0),
  description      text,
  transaction_date date not null default current_date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists transactions_user_id_idx on public.transactions (user_id);
create index if not exists transactions_category_id_idx on public.transactions (category_id);
create index if not exists transactions_transaction_date_idx on public.transactions (transaction_date);
create index if not exists transactions_user_date_idx on public.transactions (user_id, transaction_date);

create trigger handle_transactions_updated_at
  before update on public.transactions
  for each row
  execute function public.set_updated_at();

-- Force ownership server-side when not supplied.
create or replace function public.set_transactions_user_id()
returns trigger
language plpgsql
as $$
begin
  if new.user_id is null then
    new.user_id = auth.uid();
  end if;
  return new;
end;
$$;

create trigger handle_transactions_user_id
  before insert on public.transactions
  for each row
  execute function public.set_transactions_user_id();

-- Enforce that the transaction type matches the category type.
create or replace function public.enforce_transaction_category_type()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  category_type transaction_type;
begin
  if new.category_id is null then
    return new;
  end if;

  select c.type into category_type
  from public.categories c
  where c.id = new.category_id;

  if category_type is null then
    raise exception 'category % does not exist', new.category_id;
  end if;

  if new.type <> category_type then
    raise exception 'transaction type % does not match category type %', new.type, category_type;
  end if;

  return new;
end;
$$;

create trigger handle_transactions_category_type
  before insert or update of type, category_id on public.transactions
  for each row
  execute function public.enforce_transaction_category_type();


-- ============================================================================
-- 6. ROW LEVEL SECURITY (Profiles, Categories, Transactions)
-- ============================================================================

alter table public.profiles     enable row level security;
alter table public.categories   enable row level security;
alter table public.transactions enable row level security;

-- Profiles: user can read and update their own profile.
create policy "profiles_select_own"   on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own"   on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own"   on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Categories: users manage their own categories.
create policy "categories_select_own" on public.categories
  for select using (auth.uid() = user_id);

create policy "categories_insert_own" on public.categories
  for insert with check (auth.uid() = user_id and is_default = false);

create policy "categories_update_own" on public.categories
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "categories_delete_own" on public.categories
  for delete using (auth.uid() = user_id);

-- Transactions: users manage only their own transactions.
create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);

create policy "transactions_insert_own" on public.transactions
  for insert with check (auth.uid() = user_id);

create policy "transactions_update_own" on public.transactions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "transactions_delete_own" on public.transactions
  for delete using (auth.uid() = user_id);


-- ============================================================================
-- 7. handle_new_user() — VERSI INDONESIA
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));

  insert into public.categories (user_id, name, type, icon, is_default)
  values
    -- Pengeluaran
    (new.id, 'Makanan & Minuman', 'expense', 'Utensils', true),
    (new.id, 'Transportasi',      'expense', 'Car',        true),
    (new.id, 'Belanja',           'expense', 'ShoppingBag', true),
    (new.id, 'Pendidikan',        'expense', 'GraduationCap', true),
    (new.id, 'Kesehatan',         'expense', 'HeartPulse', true),
    (new.id, 'Hiburan',           'expense', 'Clapperboard', true),
    (new.id, 'Tagihan',           'expense', 'ReceiptText', true),
    (new.id, 'Lainnya',           'expense', 'Ellipsis',   true),
    -- Pemasukan
    (new.id, 'Gaji',              'income',  'Wallet',     true),
    (new.id, 'Freelance',         'income',  'Briefcase',  true),
    (new.id, 'Usaha',             'income',  'Store',      true),
    (new.id, 'Investasi',         'income',  'TrendingUp', true),
    (new.id, 'Hadiah',            'income',  'Gift',       true),
    (new.id, 'Lainnya',           'income',  'Ellipsis',   true);

  return new;
end;
$$;


-- ============================================================================
-- 8. TRIGGER ON_AUTH_USER_CREATED
-- ============================================================================

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


-- ============================================================================
-- 9. STORAGE BUCKET AVATARS + POLICIES
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152, -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public             = excluded.public,
    file_size_limit    = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_select_public" on storage.objects;
drop policy if exists "avatars_insert_own"    on storage.objects;
drop policy if exists "avatars_update_own"    on storage.objects;
drop policy if exists "avatars_delete_own"    on storage.objects;

-- Semua orang boleh membaca (bucket bersifat publik).
create policy "avatars_select_public"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

-- Pengguna hanya boleh mengunggah ke foldernya sendiri.
create policy "avatars_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Pengguna hanya boleh memperbarui objek di foldernya sendiri.
create policy "avatars_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Pengguna hanya boleh menghapus objek di foldernya sendiri.
create policy "avatars_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ============================================================================
-- 10. BUDGETS TABLE + RLS
-- ============================================================================

create table if not exists public.budgets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  amount      numeric not null check (amount > 0),
  month       text not null check (month ~ '^[0-9]{4}-[0-9]{2}$'),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- Satu budget per kategori per bulan per pengguna.
  unique (user_id, category_id, month)
);

create index if not exists budgets_user_month_idx
  on public.budgets (user_id, month);

create trigger handle_budgets_updated_at
  before update on public.budgets
  for each row
  execute function public.set_updated_at();

alter table public.budgets enable row level security;

create policy "budgets_select_own" on public.budgets
  for select using (auth.uid() = user_id);

create policy "budgets_insert_own" on public.budgets
  for insert with check (auth.uid() = user_id);

create policy "budgets_update_own" on public.budgets
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "budgets_delete_own" on public.budgets
  for delete using (auth.uid() = user_id);


-- ============================================================================
-- 11. UPDATE CATEGORIES POLICIES (Allow Manage Default)
-- ============================================================================

drop policy if exists "categories_update_own" on public.categories;

create policy "categories_update_own" on public.categories
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "categories_delete_own" on public.categories;

create policy "categories_delete_own" on public.categories
  for delete using (auth.uid() = user_id);


-- ============================================================================
-- 12. TRANSLATE EXISTING DEFAULT CATEGORIES
-- ============================================================================

update public.categories
set name = case name
  when 'Food & Beverage' then 'Makanan & Minuman'
  when 'Transportation'  then 'Transportasi'
  when 'Shopping'        then 'Belanja'
  when 'Education'       then 'Pendidikan'
  when 'Health'          then 'Kesehatan'
  when 'Entertainment'   then 'Hiburan'
  when 'Bills'           then 'Tagihan'
  when 'Salary'          then 'Gaji'
  when 'Freelance'       then 'Freelance'
  when 'Business'        then 'Usaha'
  when 'Investment'      then 'Investasi'
  when 'Gift'            then 'Hadiah'
  else name
end
where is_default = true;
