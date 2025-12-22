# RADAR Research Library - Database Reference
*Last Updated: December 2024*

## Project Overview
Building a collaborative futures research platform that enables strategic foresight analysis using the Making Futures methodology. Users upload trend reports (PDFs) and the system automatically extracts structured research data categorized using the STEEP framework.

## Architecture Decision: File Storage
**RECOMMENDATION: Use Supabase Storage Buckets**

### Why Supabase Storage:
1. **Integrated with your database** - Files and metadata in same system
2. **Built-in access controls** - Can use RLS policies matching your visibility model
3. **Direct URLs** - Easy to generate signed URLs for downloads
4. **Cost effective** - Included in Supabase pricing
5. **API ready** - JavaScript SDK for uploads/downloads

### Implementation Plan:
- Create bucket: `trend-reports`
- File path pattern: `{user_id}/{timestamp}_{filename}.pdf`
- Store bucket path in `source_documents.file_url`
- Keep optional `google_drive_link` for backup/legacy

---

## Complete Database Schema

### Core Content Tables

#### source_documents
Stores uploaded trend reports and PDFs
```sql
- id: UUID (primary key)
- document_type: TEXT (default: 'trend_report')
- title: TEXT
- file_name: TEXT
- file_url: TEXT (Supabase Storage path)
- uploaded_by: UUID (references users)
- source_id: UUID (references sources table)
- visibility: ENUM (just_me, select_users, radar_members, public)
- visible_to: UUID[] (array of user UUIDs)
- publication_date: DATE
- type_specific_metadata: JSONB
- google_drive_link: TEXT
- processing_status: ENUM (uploaded, processing, completed, failed)
- extraction_date: TIMESTAMP
- extracted_data: JSONB
- error_log: TEXT
- header_image_id: UUID
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Sample Record:**
```json
{
  "id": "d1e593c3-b94d-499a-8aa1-65592afd4fa0",
  "document_type": "trend_report",
  "title": "UBS - Year Ahead 2025",
  "file_name": "UBS_Year_Ahead_2025.pdf",
  "uploaded_by": "user-uuid-here",
  "visibility": "radar_members",
  "processing_status": "completed",
  "publication_date": "2024-11-01"
}
```

#### drivers
Root causes extracted from reports
```sql
- id: UUID
- driver_name: TEXT
- description: TEXT
- header_image_id: UUID
- extracted_from: UUID (references source_documents)
- verification_status: TEXT
- verified_by: UUID
- verification_date: TIMESTAMP
- verification_notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- observation_date: DATE
```

**Sample Record:**
```json
{
  "id": "1b82ca57-267c-4ccb-870f-9d9cafa0998d",
  "driver_name": "Creator Economy Monetization Opportunities",
  "description": "The emergence of professional fan creators who earn revenue from their fan content represents a new economic model. This driver encompasses the financial incentives and career opportunities that have developed around fan content creation, enabling some fans to turn their passion into professional endeavors.",
  "extracted_from": "d6dcf958-123c-46af-8a97-fe658cd88336",
  "verification_status": "unverified",
  "observation_date": null
}
```

#### trends
Pattern observations
```sql
- id: UUID
- trend_name: TEXT
- description: TEXT
- header_image_id: UUID
- extracted_from: UUID
- trend_type: TEXT (weak_signal, emerging_trend, strong_trend)
- time_horizon: TEXT (short_term, medium_term, long_term)
- impact_potential: TEXT (low, medium, high)
- impact_description: TEXT
- likelihood: TEXT (low, medium, high)
- verification_status: TEXT
- verified_by: UUID
- verification_date: TIMESTAMP
- verification_notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- observation_date: DATE
```

**Sample Record:**
```json
{
  "id": "aaf619f4-4ee5-4078-9c2a-35a26db08f82",
  "trend_name": "Roaring 20s Market Resilience and Growth",
  "description": "Despite facing unprecedented challenges including a global pandemic, major wars, and significant interest rate volatility, global markets have demonstrated remarkable resilience and growth. This trend reflects the economy's adaptability, the power of technological innovation, and the effectiveness of policy responses. The pattern suggests continued potential for long-term market growth despite periodic volatility and challenges.",
  "extracted_from": "d1e593c3-b94d-499a-8aa1-65592afd4fa0",
  "trend_type": "strong_trend",
  "time_horizon": "medium_term",
  "impact_potential": "high",
  "likelihood": "high",
  "observation_date": "2024-11-01"
}
```

#### signals
Observable events
```sql
- id: UUID
- signal_name: TEXT
- description: TEXT
- header_image_id: UUID
- extracted_from: UUID
- strength: TEXT (weak_signal, moderate_signal, strong_signal)
- observation_date: DATE
- potential_impact: TEXT (low, medium, high)
- verification_status: TEXT
- verified_by: UUID
- verification_date: TIMESTAMP
- verification_notes: TEXT
- source: JSONB (array of source records)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Sample Record:**
```json
{
  "signal_name": "Brand Integration with Fan Culture",
  "description": "McDonald's WcDonalds campaign shows brands actively engaging with fan communities...",
  "strength": "strong_signal",
  "observation_date": "2023-06-01",
  "potential_impact": "medium",
  "verification_status": "unverified"
}
```

#### evidence
Supporting data points
```sql
- id: UUID
- evidence_text: TEXT
- evidence_type: JSONB (object with id/name/color)
- extracted_from: UUID
- header_image_id: UUID
- verification_status: TEXT
- verified_by: UUID
- verification_date: TIMESTAMP
- verification_notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Sample Record:**
```json
{
  "evidence_text": "By 2027, companies across AI value chain expected to generate $1.1T revenue...",
  "extracted_from": "uuid-here",
  "evidence_type": {"id": 1, "name": "Quantitative", "color": "#blue"},
  "verification_status": "unverified"
}
```

---

### Taxonomy Tables

#### topics
Research topics with existing assets
```sql
- id: UUID
- topic_name: TEXT
- existing_assets: TEXT[] (array)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Sample Records:**
- "Spirituality & Mysticism"
- "Sports Culture"
- "AI (Artificial intelligence)"

#### categories
Industry categories
```sql
- id: UUID
- category_name: TEXT
- industries: TEXT[] (array of related industries)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Sample Records:**
```json
{
  "category_name": "Communication & Social",
  "industries": ["Telecommunications", "Wireless"]
}
```

#### steep_categories
STEEP framework categories with color coding
```sql
- id: UUID
- steep_name: TEXT
- description: TEXT
- color_code: TEXT (hex color)
- sort_order: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Records:**
- Social (#8B5CF6)
- Technological (#3B82F6)
- Economic (#10B981)
- Environmental (#22C55E)
- Political (#EF4444)

#### geographical_focus
Geographic regions
```sql
- id: UUID
- region_name: TEXT
- description: TEXT
- sort_order: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Sample Records:**
- Global
- North America
- Europe
- Asia
- Middle East

#### hubspot_industries
Main industry classifications (displayed as "Industries" filter in UI)
```sql
- id: UUID
- industry_name: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### industries
More granular industry classifications (internal use)
```sql
- id: UUID
- industry_name: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

---

### Junction Tables (Many-to-Many Relationships)

All junction tables follow the pattern: `[content_type]_[taxonomy_type]`

#### Content-to-Taxonomy Junctions:

**Source Documents:**
- `source_documents_topics` (source_document_id, topic_id)
- `source_documents_categories` (source_document_id, category_id)
- `source_documents_geographical_focus` (source_document_id, geographical_focus_id)

**Drivers:**
- `drivers_topics`
- `drivers_categories`
- `drivers_steep_categories`
- `drivers_geographical_focus`
- `drivers_hubspot_industries`

**Trends:**
- `trends_topics`
- `trends_categories`
- `trends_steep_categories`
- `trends_geographical_focus`
- `trends_hubspot_industries`

**Signals:**
- `signals_topics`
- `signals_categories`
- `signals_steep_categories`
- `signals_geographical_focus`
- `signals_hubspot_industries`

**Evidence:**
- `evidence_topics`
- `evidence_categories`
- `evidence_steep_categories`
- `evidence_geographical_focus`
- `evidence_hubspot_industries`

#### Content-to-Content Relationships:
- `drivers_signals` (driver_id, signal_id)
- `drivers_trends` (driver_id, trend_id)
- `signals_evidence` (signal_id, evidence_id)
- `signals_trends` (signal_id, trend_id)
- `trends_evidence` (trend_id, evidence_id)

**Standard Junction Table Structure:**
```sql
- [content]_id: UUID (references content table)
- [taxonomy]_id: UUID (references taxonomy table)
- created_at: TIMESTAMP
```

---

### Users Table

```sql
- id: UUID
- email: TEXT
- full_name: TEXT
- can_verify: BOOLEAN
- can_upload: BOOLEAN
- is_admin: BOOLEAN
- favorite_drivers: UUID[] (array)
- favorite_signals: UUID[] (array)
- favorite_trends: UUID[] (array)
- favorite_evidence: UUID[] (array)
- favorites_public: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Notes:**
- All users can upload and verify by default
- Only some users are admins
- Favorites are stored as UUID arrays

---

## Visibility System

Lives in `source_documents.visibility` field (enum type):

| Value | Description | Access |
|-------|-------------|--------|
| `just_me` | Private to uploader | Only uploader sees it |
| `select_users` | Shared with specific users | `visible_to` array contains user UUIDs |
| `radar_members` | Default - all members | All authenticated users |
| `public` | Reserved for future | Open access (not implemented) |

**Cascading Rule:** Source document visibility applies to ALL extracted content (drivers, trends, signals, evidence)

---

## Making Futures Methodology

The system extracts four types of research content following the Making Futures framework:

1. **Drivers** - Root causes and underlying forces
2. **Signals** - Observable events and indicators
3. **Trends** - Patterns emerging from signals
4. **Evidence** - Supporting data and statistics

All content is categorized using **STEEP framework:**
- **S**ocial
- **T**echnological  
- **E**conomic
- **E**nvironmental
- **P**olitical

---

## Data Flow

1. **Upload:** User uploads PDF via Vercel frontend
2. **Storage:** PDF saved to Supabase Storage bucket
3. **Record Creation:** Metadata record created in `source_documents`
4. **Processing:** Google Cloud Function triggered
5. **Extraction:** Claude API extracts structured research data
6. **Writing:** Results written to drivers/trends/signals/evidence tables
7. **Linking:** Junction tables created for taxonomy relationships
8. **Display:** Frontend reads from Supabase and displays research

---

## R1 MVP Scope (Current Focus)

**IN SCOPE:**
- View/filter existing research (trends, drivers, signals, evidence)
- Preserve exact Zite look/feel
- Read-only from Supabase

**OUT OF SCOPE (Later):**
- Upload functionality
- Profile updates
- Two-way sync with Airtable

---

## Design Specifications

**Fonts:**
- Feature Display
- PP Neue Montreal
- Microgramma Extd D Bold

**Color Palette:**
Per STEEP categories above

---

## Connection Details

**You will need:**
- Supabase project URL
- Supabase anon/public key (for frontend)
- Supabase service role key (for backend operations)

**Environment variables for Next.js:**
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

---

## Sample Queries

### Get all trends with their STEEP categories:
```sql
SELECT 
  t.*,
  array_agg(sc.steep_name) as steep_categories
FROM trends t
LEFT JOIN trends_steep_categories tsc ON t.id = tsc.trend_id
LEFT JOIN steep_categories sc ON tsc.steep_category_id = sc.id
GROUP BY t.id;
```

### Get source document with all extracted content:
```sql
SELECT 
  sd.title,
  (SELECT count(*) FROM drivers WHERE extracted_from = sd.id) as driver_count,
  (SELECT count(*) FROM trends WHERE extracted_from = sd.id) as trend_count,
  (SELECT count(*) FROM signals WHERE extracted_from = sd.id) as signal_count,
  (SELECT count(*) FROM evidence WHERE extracted_from = sd.id) as evidence_count
FROM source_documents sd
WHERE sd.id = 'your-uuid-here';
```

### Get all content visible to a specific user:
```sql
SELECT * FROM source_documents
WHERE visibility = 'radar_members'
   OR uploaded_by = 'user-uuid'
   OR (visibility = 'select_users' AND 'user-uuid' = ANY(visible_to));
```

---

## Next Steps

1. ✅ Database schema documented
2. ✅ GitHub repository created (The RADAR Agency org, private)
3. ✅ Next.js project scaffolded (TypeScript + Tailwind + App Router) and running locally
4. ⏭️ Connect to Vercel (create project + set env vars)
5. ⏭️ Build data adapter layer for Supabase (UI consumes adapters, not raw rows)
   - ✅ Supabase client wired in frontend + `/test-supabase` route
   - ✅ Local env vars set via `.env.local` (not committed)
   - ✅ Confirmed RLS blocks anon reads as expected (returns empty array until Auth)
6. ⏭️ Implement frontend UI matching Zite design
7. ⏭️ Set up Supabase Storage bucket for PDFs
8. ⏭️ Implement file upload flow

---

## Frontend Implementation Status

- Repo: `radar-research-library-frontend` (in The RADAR Agency org)
- Local dev: `npm run dev` (default `http://localhost:3000`)
- Key files created:
  - `src/app/page.tsx` — RADAR homepage placeholder
  - `src/app/lib/supabase/client.ts` — Supabase client (anon, read-only)
  - `src/app/test-supabase/page.tsx` — connectivity test route
- Architecture note: shared folders currently live under `src/app/`:
  - `src/app/components/`
  - `src/app/lib/`
  - `src/app/styles/`
  (This is valid; keep consistent going forward.)

### Security / Access (current)

- `public.trends` has RLS enabled and a SELECT policy that depends on `auth.uid()`.
- When unauthenticated (anon), the policy returns no rows (expected).
- Step 6 should introduce Supabase Auth so `auth.uid()` is populated and policies allow access.

---

## Important Notes

- **Data Parity Maintained:** All data from Airtable successfully migrated to Supabase
- **Natural Logic Preferred:** AI-driven systems should use intuition over rigid field mapping
- **Community-Driven:** Topic lists can grow as community adds them
- **Step-by-Step Approach:** Build iteratively, test each phase before moving forward

---

## Reference Documents in Project

Located in `/mnt/project/`:
- `working_style_instructions.md`
- `airtable_supabase_integration_learnings.md`
- `airtable_supabase_sync_documentation.md`
- `Making_Futtage_1.pdf` (Making Futures methodology)
- `FieldGuide_Digital_BW_lite.pdf` (Futures professional guide)

---

*This document serves as the single source of truth for database schema and architectural decisions. Update as the project evolves.*
