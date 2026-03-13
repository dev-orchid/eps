# Exam Prep Manager — Project Prompt for Claude Code

## Project Overview

Build a **multi-tenant, account-based Exam Preparation Manager** web and mobile application. The app helps exam aspirants manage their exams, daily study sessions, tasks, progress tracking, and alarms — all under isolated per-user accounts backed by Supabase.

---

## Tech Stack

- **Frontend:** React (web), React Native (mobile) — share as much logic as possible
- **Backend / Database:** Supabase (PostgreSQL + Auth + Row Level Security)
- **Styling:** Professional & corporate aesthetic — dark navy/slate palette, clean card-based layout
- **Charts:** Recharts (web) / Victory Native (mobile)
- **State Management:** React Context or Zustand
- **Routing:** React Router (web), Expo Router (mobile)

---

## Multi-Tenancy Model

- Each **user account** is a self-contained tenant
- All data is **row-level isolated** using Supabase RLS policies (`auth.uid() = user_id`)
- Future-ready for **organisation-level tenancy** (coaching institutes, schools) — add an `org_id` column and org-level RLS when needed
- Authentication via **Supabase Auth** — email/password with optional OAuth (Google)

---

## Database Schema

Design and create the following tables in Supabase. All tables must have:
- `id` — UUID primary key, auto-generated
- `user_id` — UUID referencing `auth.users(id)`, set automatically via trigger
- `created_at` — timestamptz, default now()

### Tables

**`exams`**
- `name` — text, required
- `exam_date` — date
- `description` — text

**`tasks`**
- `title` — text, required
- `due_date` — date
- `priority` — text (`high`, `medium`, `low`), default `medium`
- `completed` — boolean, default false

**`study_sessions`**
- `subject` — text, required
- `duration_minutes` — integer, default 0
- `date` — date, default today
- `notes` — text

**`alarms`**
- `title` — text, required
- `alarm_time` — time, required
- `days` — text array (e.g. `["Mon", "Wed", "Fri"]`), default empty
- `active` — boolean, default true

Apply **Row Level Security** on all tables. Create policies so users can only SELECT, INSERT, UPDATE, DELETE their own rows. Use a `before insert` trigger on each table to auto-set `user_id` from `auth.uid()`.

---

## Application Screens & Features

### 1. Auth Flow
- **Sign Up** — full name, email, password
- **Sign In** — email, password
- **Sign Out**
- Persist session across page refreshes using Supabase session storage

---

### 2. Dashboard (Home)
- Greeting with user's first name and current date
- Summary stat cards:
  - Total exams registered
  - Tasks done vs total for today
  - Study hours logged today
  - Daily goal completion percentage
- Today's task list (quick view, toggle complete inline)
- Upcoming exam countdowns (next 3 exams)

---

### 3. Exam Manager
- List all exams with name, date, description, and a **days-left countdown badge**
  - Badge colour: red (≤7 days), yellow (≤30 days), green (>30 days)
- Add new exam form: name, date, description
- Delete exam
- Exam date in the past shows a "Completed" badge

---

### 4. Tasks
- Add task: title, due date, priority (high / medium / low)
- Toggle task complete/incomplete
- Delete task
- Filter view: Today's tasks / All tasks
- Priority colour coding: red = high, yellow = medium, green = low
- Show count of done vs total

---

### 5. Study Log
- Log a study session: subject, duration (minutes), date, notes
- Show today's total study time prominently
- List all past sessions grouped or sorted by date descending
- Delete session

---

### 6. Progress Tracker
- Date range: last 7 days (default), with option for last 30 days
- **Bar chart — Daily Study Hours** (last 7 / 30 days)
- **Bar chart — Tasks Completed vs Total** per day
- Summary stats: total hours this week, total tasks completed this week
- Subject-wise breakdown: which subjects studied most (pie or bar chart)

---

### 7. Alarms & Reminders
- Add alarm: label, time, repeat days (Mon–Sun toggles)
- Toggle alarm active/inactive (with animated toggle switch)
- Delete alarm
- Request browser notification permission
- Fire a browser `Notification` when the current time matches an active alarm's time and day
- Show a clear empty state when no alarms exist

---

## UI / UX Requirements

- **Theme:** Dark navy (`#0f172a`) background, slate card surfaces (`#1e293b`), muted borders (`#334155`)
- **Accent colour:** Blue (`#3b82f6`), with green, yellow, red for status indicators
- **Typography:** System font stack, clean hierarchy — large bold numbers for stats, muted labels
- **Layout:** Mobile-first, max content width ~680px centred on web
- **Navigation:** Fixed bottom tab bar with icons and labels for all 6 sections
- **Cards:** Rounded corners, subtle borders, consistent padding
- **Loading states:** Show a loading indicator while fetching data
- **Empty states:** Friendly illustrated or emoji-based empty state for each section
- **Responsive:** Works on mobile browsers and desktop browsers

---

## Environment Configuration

- All Supabase credentials (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) must be loaded from environment variables (`.env` file)
- Provide a `.env.example` file
- On first load, if credentials are missing, show a clear setup/configuration error screen

---

## Project Structure

Organise the project cleanly with separation of concerns:
- `/src/components` — reusable UI components
- `/src/pages` or `/src/screens` — one file per screen
- `/src/lib` — Supabase client initialisation, helpers, hooks
- `/src/context` — Auth context and session management
- `/src/hooks` — custom hooks (e.g. `useExams`, `useTasks`, `useStudySessions`)

---

## Non-Functional Requirements

- All Supabase queries must handle errors gracefully and show user-friendly error messages
- No data should be accessible without authentication (enforce both via RLS and frontend route guards)
- The app should work offline-gracefully — show a message if Supabase is unreachable
- Code must be clean, well-commented, and modular for easy future extension

---

## Future-Ready Considerations (do not build now, but keep architecture open)

- Organisation/institute-level multi-tenancy (multiple students under one org)
- Admin dashboard for institutions
- Push notifications (mobile)
- AI-powered study plan generator
- Exam syllabus tracker with topic-level completion
- Leaderboard among peers
- PDF progress report export

---

## Deliverables

1. Full working React web app connected to Supabase
2. Supabase SQL migration file for all tables, RLS policies, and triggers
3. `.env.example` file
4. `README.md` with setup instructions (Supabase setup, env config, run commands)
