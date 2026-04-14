# Mood Board

A shared, real-time mood board webapp for creating immersive daily moodscapes together. Each entry is an infinite canvas where you can place text, images, GIFs, and audio — and see each other’s cursors live.

## Features

- **Infinite Canvas** — Pan, zoom, and arrange free-form elements
- **Text, Image, GIF, Audio** — Drag, resize, and style everything
- **Real-time Collaboration** — See live cursors and instant updates
- **Multiple Entries** — Create as many moodscapes as you want
- **Figma-inspired Design** — Clean black-and-white UI with soft gradient backgrounds

## Tech Stack

- Next.js 16 + React + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Postgres, Realtime, Storage)
- Hosted free on Vercel

## Local Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Project Settings > API** and copy:
   - `Project URL`
   - `Project API anon key`

### 2. Run the database setup

In your Supabase dashboard, open the **SQL Editor > New query**, paste the entire contents of `supabase-setup.sql`, and click **Run**.

This creates:
- `profiles`, `boards`, `elements` tables
- Row Level Security policies
- Auto-profile creation on signup
- Realtime enabled for elements

### 3. Create the storage bucket

1. In Supabase dashboard, go to **Storage > New bucket**
2. Name it `media`
3. Set it to **Public**
4. Under **Policies**, add a policy:
   - Name: `Allow public uploads`
   - Allowed operation: `INSERT` (or `ALL` for simplicity)
   - Target roles: `authenticated`
   - Policy definition: `true`

### 4. Add environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Install and run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign up with email/password.

## Deploy to Vercel

1. Push this project to GitHub
2. Go to [vercel.com](https://vercel.com), import the repo
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**

## How to Use

1. **Sign up / Log in** on the landing page
2. **Create a new entry** from the gallery
3. **Add elements** using the toolbar:
   - **Text** — Double-click to edit inline
   - **Image** — Upload any image or GIF
   - **Audio** — Upload MP3 or WAV files
4. **Drag** to move, **resize** from the bottom-right handle
5. **Pan** the canvas by holding `Shift` + drag (or middle-mouse drag)
6. **Zoom** with `Ctrl/Cmd` + scroll, or use the zoom control
7. **Change background** from the toolbar to set the mood
8. **Watch live cursors** when someone else joins the same board

## Customizing the Design

The UI follows a Figma-inspired black-and-white aesthetic defined in `DESIGN.md`. Feel free to tweak colors, typography, and spacing in `app/globals.css`.

## Troubleshooting

- **Realtime not working?** Make sure you ran the SQL setup script to enable realtime on the `elements` table.
- **Images not uploading?** Check that the `media` bucket exists and is public with upload policies.
- **Build errors about missing Supabase URL?** Make sure `.env.local` exists with the correct keys before running `npm run build`.
