-- Supabase Setup Script for Mood Board
-- Run this in the Supabase SQL Editor

-- 1. Profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_color text default '#000000',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Boards table
create table if not exists public.boards (
  id uuid default gen_random_uuid() primary key,
  title text not null default 'Untitled',
  cover_color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users on delete cascade not null
);

-- 3. Elements table
create table if not exists public.elements (
  id uuid default gen_random_uuid() primary key,
  board_id uuid references public.boards on delete cascade not null,
  type text not null check (type in ('text', 'image', 'audio')),
  content text,
  url text,
  x float not null default 0,
  y float not null default 0,
  width float not null default 100,
  height float not null default 100,
  rotation float not null default 0,
  style jsonb default '{}'::jsonb,
  z_index int not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable RLS
alter table public.profiles enable row level security;
alter table public.boards enable row level security;
alter table public.elements enable row level security;

-- 5. Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 6. Boards policies
create policy "Boards are viewable by authenticated users"
  on public.boards for select
  to authenticated
  using (true);

create policy "Users can create boards"
  on public.boards for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Users can update own boards"
  on public.boards for update
  to authenticated
  using (auth.uid() = created_by);

create policy "Users can delete own boards"
  on public.boards for delete
  to authenticated
  using (auth.uid() = created_by);

-- 7. Elements policies
create policy "Elements are viewable by authenticated users"
  on public.elements for select
  to authenticated
  using (true);

create policy "Authenticated users can insert elements"
  on public.elements for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update elements"
  on public.elements for update
  to authenticated
  using (true);

create policy "Authenticated users can delete elements"
  on public.elements for delete
  to authenticated
  using (true);

-- 8. Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    '#' || lpad(to_hex(floor(random()*16777215)::int), 6, '0')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 9. Enable Realtime for elements
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'elements'
  ) then
    alter publication supabase_realtime add table public.elements;
  end if;
end;
$$;
