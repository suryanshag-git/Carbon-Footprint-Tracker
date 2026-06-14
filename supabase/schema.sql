-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  username text unique not null,
  full_name text,
  avatar_url text,
  streak integer default 0 not null,
  points integer default 0 not null,
  last_active timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint username_length check (char_length(username) >= 3)
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

create policy "Allow public read access to profiles" on public.profiles
  for select using (true);

create policy "Allow users to update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- ACTIVITIES TABLE (Manual Tracking)
create table public.activities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category text not null check (category in ('travel', 'diet', 'shopping', 'energy', 'sustainable_action')),
  subcategory text not null, -- e.g., 'car', 'flight', 'beef', 'electricity', 'recycling'
  amount numeric not null check (amount >= 0),
  unit text not null, -- e.g., 'km', 'meals', 'kWh', 'usd', 'actions'
  co2_emission numeric not null check (co2_emission >= 0), -- in kg CO2e
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null,
  details jsonb default '{}'::jsonb not null, -- e.g. starting/ending point, energy source type
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Activities
alter table public.activities enable row level security;

create policy "Allow users to select their own activities" on public.activities
  for select using (auth.uid() = user_id);

create policy "Allow users to insert their own activities" on public.activities
  for insert with check (auth.uid() = user_id);

create policy "Allow users to update their own activities" on public.activities
  for update using (auth.uid() = user_id);

create policy "Allow users to delete their own activities" on public.activities
  for delete using (auth.uid() = user_id);

-- BADGES TABLE (Master Table)
create table public.badges (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  description text not null,
  icon_url text not null,
  category text not null, -- e.g., 'points', 'streak', 'travel', 'diet'
  threshold integer not null, -- threshold value to unlock (e.g. 500 points, 7-day streak)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Badges
alter table public.badges enable row level security;

create policy "Allow public read access to badges" on public.badges
  for select using (true);

-- USER_BADGES TABLE (User Achievements)
create table public.user_badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  badge_id uuid references public.badges(id) on delete cascade not null,
  awarded_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, badge_id)
);

-- Enable RLS on User Badges
alter table public.user_badges enable row level security;

create policy "Allow public read access to user badges" on public.user_badges
  for select using (true);

create policy "Allow system/users to assign badges" on public.user_badges
  for insert with check (auth.uid() = user_id);

-- AI CONVERSATIONS
create table public.ai_conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text default 'New Conversation' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on AI Conversations
alter table public.ai_conversations enable row level security;

create policy "Allow users to manage their conversations" on public.ai_conversations
  for all using (auth.uid() = user_id);

-- AI MESSAGES
create table public.ai_messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.ai_conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'model')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on AI Messages
alter table public.ai_messages enable row level security;

create policy "Allow users to view messages in their conversations" on public.ai_messages
  for select using (
    exists (
      select 1 from public.ai_conversations
      where ai_conversations.id = ai_messages.conversation_id
      and ai_conversations.user_id = auth.uid()
    )
  );

create policy "Allow users to insert messages in their conversations" on public.ai_messages
  for insert with check (
    exists (
      select 1 from public.ai_conversations
      where ai_conversations.id = ai_messages.conversation_id
      and ai_conversations.user_id = auth.uid()
    )
  );

-- AUTOMATIC PROFILE CREATION ON SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url, streak, points)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'eco_' || substring(md5(random()::text) from 1 for 8)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    0,
    100 -- starter bonus points
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- DEFAULT SEED DATA FOR BADGES
insert into public.badges (name, description, icon_url, category, threshold) values
  ('First Step', 'Log your first carbon activity', '/badges/first_step.png', 'activity', 1),
  ('Eco Novice', 'Reach 500 Eco Points', '/badges/eco_novice.png', 'points', 500),
  ('Eco Warrior', 'Reach 2500 Eco Points', '/badges/eco_warrior.png', 'points', 2500),
  ('Green Guardian', 'Reach 10000 Eco Points', '/badges/green_guardian.png', 'points', 10000),
  ('On Fire', 'Maintain a 7-day activity streak', '/badges/streak_7.png', 'streak', 7),
  ('Climate Champion', 'Maintain a 30-day activity streak', '/badges/streak_30.png', 'streak', 30)
on conflict (name) do nothing;
