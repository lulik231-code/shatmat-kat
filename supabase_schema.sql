-- ============================================================
-- CHESS KIDS — Supabase Schema
-- הרץ את הקובץ הזה ב-SQL Editor של Supabase
-- ============================================================

-- 1. PROFILES (מידע נוסף על משתמשים)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null check (role in ('super_admin','teacher','student')),
  display_name text,
  avatar_emoji text default '⭐',
  approved boolean default false,
  created_at timestamptz default now()
);

-- 2. CLASSROOMS (כיתות)
create table public.classrooms (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  emoji text default '🌟',
  invite_code text unique default upper(substring(md5(random()::text), 1, 6)),
  created_at timestamptz default now()
);

-- 3. STUDENTS (תלמידים — נרשמים ע"י מורה)
create table public.students (
  id uuid default gen_random_uuid() primary key,
  classroom_id uuid references public.classrooms(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  display_name text not null,
  avatar_emoji text default '🦁',
  parent_email text,
  approved boolean default true,
  created_at timestamptz default now()
);

-- 4. GAMES (משחקים)
create table public.games (
  id uuid default gen_random_uuid() primary key,
  classroom_id uuid references public.classrooms(id),
  white_student_id uuid references public.students(id),
  black_student_id uuid references public.students(id),
  fen text default 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  pgn text default '',
  status text default 'waiting' check (status in ('waiting','active','finished','draw')),
  winner_id uuid references public.students(id),
  turn text default 'w',
  last_move jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. ONLINE PRESENCE (מי מחובר)
create table public.presence (
  student_id uuid references public.students(id) on delete cascade primary key,
  classroom_id uuid references public.classrooms(id),
  online boolean default true,
  last_seen timestamptz default now()
);

-- 6. GAME INVITES (הזמנות)
create table public.game_invites (
  id uuid default gen_random_uuid() primary key,
  from_student_id uuid references public.students(id) on delete cascade,
  to_student_id uuid references public.students(id) on delete cascade,
  classroom_id uuid references public.classrooms(id),
  status text default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.classrooms enable row level security;
alter table public.students enable row level security;
alter table public.games enable row level security;
alter table public.presence enable row level security;
alter table public.game_invites enable row level security;

-- PROFILES: כל משתמש רואה רק את עצמו (לא רואים אימיילים!)
create policy "users_own_profile" on public.profiles
  for all using (auth.uid() = id);

-- Super admin רואה הכל
create policy "super_admin_all_profiles" on public.profiles
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

-- CLASSROOMS: מורה רואה רק את הכיתות שלו
create policy "teacher_own_classrooms" on public.classrooms
  for all using (teacher_id = auth.uid());

create policy "student_see_classroom" on public.classrooms
  for select using (
    exists (
      select 1 from public.students s
      where s.classroom_id = classrooms.id and s.profile_id = auth.uid()
    )
  );

-- STUDENTS: מורה מנהל תלמידים בכיתותיו
create policy "teacher_manage_students" on public.students
  for all using (
    exists (
      select 1 from public.classrooms c
      where c.id = students.classroom_id and c.teacher_id = auth.uid()
    )
  );

create policy "student_see_classmates" on public.students
  for select using (
    exists (
      select 1 from public.students me
      where me.classroom_id = students.classroom_id and me.profile_id = auth.uid()
    )
  );

-- GAMES
create policy "game_participants" on public.games
  for all using (
    exists (
      select 1 from public.students s
      where (s.id = games.white_student_id or s.id = games.black_student_id)
        and s.profile_id = auth.uid()
    )
  );

-- PRESENCE
create policy "presence_all_select" on public.presence
  for select using (true);

create policy "presence_own_update" on public.presence
  for all using (
    exists (
      select 1 from public.students s
      where s.id = presence.student_id and s.profile_id = auth.uid()
    )
  );

-- INVITES
create policy "invites_participants" on public.game_invites
  for all using (
    exists (
      select 1 from public.students s
      where (s.id = game_invites.from_student_id or s.id = game_invites.to_student_id)
        and s.profile_id = auth.uid()
    )
  );

-- ============================================================
-- REALTIME — הפעל Realtime לטבלאות הבאות
-- ============================================================
-- ב-Supabase Dashboard → Database → Replication → הוסף:
-- games, presence, game_invites

-- ============================================================
-- FUNCTION: יצירת פרופיל אוטומטית עם רישום
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, role, display_name, approved)
  values (
    new.id,
    case
      when new.email = 'lulik231@gmail.com' then 'super_admin'
      else coalesce(new.raw_user_meta_data->>'role', 'teacher')
    end,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    case
      when new.email = 'lulik231@gmail.com' then true
      else false
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
