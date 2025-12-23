# RADAR Research Library

A Next.js 15 application for exploring and managing futures research content.

## Features

✅ **Authentication** - Supabase magic link authentication (existing users only)
✅ **Upload Hub** - Grid layout for uploading different content types
✅ **Library** - Browse Uploaded Content, Drivers, Trends, and Signals
✅ **Visibility System** - Content inherits visibility from parent Trend Reports
✅ **Verification** - AI Generated vs Verified badges
✅ **Filtering** - Filter by visibility (My Content, Shared with Me, Community)
✅ **Brand Styling** - RADAR brand colors, fonts, and design system

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Run these SQL commands in your Supabase SQL editor:

```sql
-- Add version tracking fields
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES users(id);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ;
ALTER TABLE trends ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES users(id);
ALTER TABLE trends ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES users(id);
ALTER TABLE signals ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ;
ALTER TABLE evidence ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES users(id);
ALTER TABLE evidence ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ;

-- Add verification notes
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS verification_notes TEXT;
ALTER TABLE trends ADD COLUMN IF NOT EXISTS verification_notes TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS verification_notes TEXT;
ALTER TABLE evidence ADD COLUMN IF NOT EXISTS verification_notes TEXT;
```

### 3. Storage Buckets

Create these storage buckets in Supabase:

1. **card-images** (Public)
   - For custom header images
   - File size limit: 5MB
   - Allowed types: image/jpeg, image/png, image/webp

2. **version-history** (Private)
   - For version history JSON files
   - File size limit: 1MB
   - Allowed types: application/json

### 4. Brand Assets

Copy your brand assets to `/public/brand-assets/`:
- Fonts
- Logo
- Background images
- Any other brand materials

### 5. Environment Variables

The `.env.local` file is already configured with your Supabase credentials.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploy to Vercel

1. Push to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Connect repository to Vercel

3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Deploy!

## Project Structure

```
radar-library/
├── src/
│   ├── app/               # Next.js app router pages
│   │   ├── layout.tsx     # Root layout with navigation
│   │   ├── page.tsx       # Home (redirects to library)
│   │   ├── login/         # Login page
│   │   ├── auth/          # Auth callback
│   │   ├── upload/        # Upload Hub
│   │   ├── library/       # Main library page
│   │   └── visualizations/# Visualizations (placeholder)
│   ├── components/        # React components
│   │   ├── Navigation.tsx
│   │   ├── VerificationBadge.tsx
│   │   └── library/
│   │       └── LibraryPage.tsx
│   └── lib/               # Utilities and data functions
│       ├── supabase/      # Supabase clients
│       ├── data/          # Data loading functions
│       ├── types.ts       # TypeScript types
│       └── utils.ts       # Utility functions
├── public/
│   └── brand-assets/      # Brand assets (fonts, images, etc.)
├── middleware.ts          # Auth middleware
├── tailwind.config.ts     # Tailwind configuration
└── package.json

```

## Key Technologies

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Authentication, database, storage
- **Radix UI** - Accessible component primitives

## Support

For issues or questions, please contact the RADAR team.

---

Built with Claude API • December 2025
