# ExamPrep - Exam Preparation Manager

A multi-tenant exam preparation web app built with React and Supabase. Helps students manage exams, tasks, study sessions, progress tracking, and alarms.

## Tech Stack

- **Frontend:** React 19 + Vite
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Routing:** React Router
- **Styling:** DM Sans font, dark navy theme

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Configure Supabase

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Fill in your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run the database migration

In your Supabase dashboard, go to **SQL Editor** and run the contents of:

```
supabase/migrations/001_initial_schema.sql
```

This creates all tables (exams, tasks, study_sessions, alarms) with Row Level Security policies and auto-set user_id triggers.

### 4. Enable Auth

In your Supabase dashboard under **Authentication > Providers**, ensure Email auth is enabled.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
  components/    Reusable UI components (StatCard, BottomNav, etc.)
  context/       Auth context and session management
  hooks/         Custom hooks (useExams, useTasks, useStudySessions, useAlarms)
  lib/           Supabase client initialization
  pages/         One file per screen (Dashboard, ExamManager, Tasks, etc.)
supabase/
  migrations/    SQL migration files
```

## Features

- **Auth:** Sign up / sign in with email and password
- **Dashboard:** Stats overview, today's tasks, upcoming exam countdowns
- **Exam Manager:** Add/delete exams with countdown badges (color-coded by urgency)
- **Tasks:** Add/toggle/delete tasks with priority colors and today/all filter
- **Study Log:** Log study sessions, see today's total study time
- **Progress:** Bar charts for daily study hours, tasks completed vs total, subject pie chart
- **Alarms:** Set alarms with repeat days, toggle active/inactive, browser notifications

## Build for Production

```bash
npm run build
```

Output goes to `dist/`.
