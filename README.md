# DocPortal — Demo Document Upload & Retrieval System

> **⚠️ This setup is intended only for demo/POC usage and is not production-secure.**

A lightweight, modern full-stack web application for uploading, storing, searching, and downloading documents. Built with **Next.js**, **Supabase**, **TailwindCSS**, deployed on **Vercel**.

---

## ✨ Features

- 🔐 **Demo Authentication** — Restricted Supabase Email + Password login (no self-signup)
- 📤 **File Upload** — Drag-and-drop, multiple files, client + year tagging, auto-generated Reference IDs
- 🗄️ **Yearly Drive Simulation** — Files are organized by year and client to mimic separate hard drives per year
- 🔍 **Search** — Find files by client, year range (or last N years), email, name, or reference ID
- 📥 **Download** — Signed URLs from Supabase Storage
- 👁️ **Preview** — In-app preview for images and PDFs
- 🌙 **Dark Mode** — Toggle with persistence
- 📱 **Responsive** — Mobile-friendly layout
- 🔔 **Toast Notifications** — Upload feedback, errors, downloads

---

## 🗂️ Folder Structure

```
upload_fetch_web_portal/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (Toaster)
│   │   ├── page.tsx            # Redirect → /login
│   │   ├── globals.css
│   │   ├── login/
│   │   │   └── page.tsx        # Demo login page
│   │   ├── dashboard/
│   │   │   ├── layout.tsx      # Auth guard + Navbar
│   │   │   └── page.tsx        # Dashboard with recent uploads
│   │   ├── upload/
│   │   │   ├── layout.tsx      # Auth guard + Navbar
│   │   │   └── page.tsx        # Upload form with dropzone
│   │   └── files/
│   │       ├── layout.tsx      # Auth guard + Navbar
│   │       └── page.tsx        # Search + file cards
│   ├── components/
│   │   ├── DemoBanner.tsx      # "Demo Application" banner
│   │   ├── Navbar.tsx          # Navigation + dark mode
│   │   ├── FileDropzone.tsx    # react-dropzone wrapper
│   │   ├── FileCard.tsx        # File metadata + download card
│   │   ├── SearchBar.tsx       # Search by email/name/ref
│   │   ├── PreviewModal.tsx    # Image & PDF preview
│   │   ├── StatCard.tsx        # Dashboard stat tiles
│   │   ├── EmptyState.tsx      # Empty state UI
│   │   └── LoadingSpinner.tsx  # Loading indicator
│   ├── hooks/
│   │   ├── useAuth.ts          # localStorage-based demo auth
│   │   ├── useUpload.ts        # Supabase upload hook
│   │   └── useFiles.ts         # Search + download hook
│   └── lib/
│       ├── supabase.ts         # Supabase client
│       ├── types.ts            # TypeScript types
│       └── utils.ts            # Helpers (format, validate, etc.)
├── supabase/
│   └── schema.sql              # PostgreSQL schema
├── .env.example
├── .env.local                  # (gitignored)
└── README.md
```

---

## 🗄️ Database Schema

```sql
create table public.file_uploads (
  id            uuid primary key default gen_random_uuid(),
  reference_id  text not null,         -- e.g. REF-1042
   client_name   text not null,         -- e.g. Acme Industries
   record_year   integer not null,      -- e.g. 2024 (simulated hard-drive year)
  user_name     text not null,
  email         text not null,
  file_name     text not null,
   storage_path  text not null,         -- uploads/{year}/{client}/{email}/{ts}_{filename}
  uploaded_at   timestamptz default now(),
  notes         text,
  uploaded_by   text not null,
  file_size     bigint,
  file_type     text
);
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account (for deployment)

---

## ⚙️ Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a name, region, and database password
3. Wait for the project to provision (~1 min)

### 2. Run the SQL Schema

1. In your Supabase dashboard → **SQL Editor**
2. Paste the contents of `supabase/schema.sql`
3. Click **Run**

### 3. Create the Storage Bucket

1. Go to **Storage** in the Supabase sidebar
2. Click **New Bucket**
3. Name it: `uploads`
4. Check **Public bucket** (for demo; signed URLs also work)
5. Click **Save**

### 4. Get your API Keys

1. Go to **Project Settings → API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🔧 Local Development

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/upload_fetch_web_portal.git
cd upload_fetch_web_portal

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Run the dev server
npm run dev

# 5. Open http://localhost:3000
```

---

## 🌐 Vercel Deployment

### Option A — One-click via Vercel CLI

```bash
npm install -g vercel
vercel --prod
```

When prompted, add the environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Option B — GitHub Integration (Recommended)

1. Push the repository to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
5. Click **Deploy**

Vercel will auto-deploy on every push to `main`.

---

## 🔐 Authentication Notes

This demo uses a **restricted Supabase authentication flow**:

- User signs in with **email + password** (Supabase Auth)
- Only pre-created users can log in
- No self-signup UI is provided in this app
- Session is managed by Supabase Auth client SDK
- A banner **"Restricted Supabase Login Enabled"** is shown on protected pages

> **Do not use this authentication in production as-is.** Add proper password policy, reset flow, rate limiting, and authorization policies.

---

## 📦 Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public API key |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | TailwindCSS 3, lucide-react icons |
| Backend | Supabase (PostgreSQL + Storage) |
| Auth | localStorage demo session |
| Upload | react-dropzone |
| Notifications | react-hot-toast |
| Deployment | Vercel |
| Source Control | GitHub |

---

## 📝 License

MIT — Free to use for demos and prototypes.
