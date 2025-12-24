# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered automated blog built with Astro 5, focused on AI tools, productivity, and hardware reviews. The blog is monetized through Amazon Associates affiliate links and designed for SEO optimization with automatic content generation capabilities.

**Tech Stack:** Astro 5 (SSG), MDX for content, TypeScript, deployed on Vercel

**Key Features:**
- AI-powered article generation with OpenAI GPT-4o
- Amazon Associates affiliate integration
- Google Analytics & Vercel Analytics
- SEO-optimized with sitemap, RSS, and OpenGraph support
- Monetization hub with comparison tables and affiliate components

## Development Commands

```bash
# Development
npm run dev              # Start dev server at localhost:4321

# Build & Preview
npm run build           # Build production site to ./dist/
npm run preview         # Preview production build locally

# Content Generation (requires .env setup)
node scripts/generate-smart-article.js              # Generate AI article with research
node scripts/generate-monetized-articles.js         # Generate template-based monetized articles
node scripts/add-internal-links.js                   # Add internal linking to existing posts

# Astro CLI
npm run astro check     # Type-check Astro files
npm run astro add       # Add integrations
```

## Environment Variables Required

Create a `.env` file in the root with:
```
OPENAI_API_KEY=           # For article generation (GPT-4o)
SERPER_API_KEY=           # For keyword research via Serper.dev (2500 free searches/month)
PEXELS_API_KEY=           # For hero image downloads (optional)
PUBLIC_GOOGLE_ANALYTICS_ID=  # GA4 tracking ID
```

## Architecture Overview

### Content Management System

**Blog Posts:** Located in `src/content/blog/` as `.md` or `.mdx` files

**Content Schema** (defined in `src/content.config.ts`):
- Uses Astro's Content Collections with glob loader
- Supports both `pubDate` and `publishDate` for backward compatibility
- Frontmatter fields: `title`, `description`, `pubDate`, `heroImage`, `tags`, `author`, `category`, `featured`
- Schema automatically transforms `publishDate` → `pubDate` if needed

**Content Flow:**
1. Articles generated via scripts → saved to `src/content/blog/`
2. Astro content collections validate schema at build time
3. Pages rendered via `src/pages/blog/[...slug].astro` (dynamic route)

### AI Article Generation System

**Two Generation Modes:**

1. **Smart Articles** (`generate-smart-article.js`):
   - Uses OpenAI GPT-4o (not mini) for quality content
   - Performs real keyword research via Serper API
   - Analyzes top 5 Google competitors for context
   - Extracts semantic keywords from related searches
   - Downloads relevant hero images from Pexels
   - Outputs in Argentine Spanish with voseo ("vos tenés", "elegí")
   - Estimated cost: ~$0.01-0.03 per article

2. **Template-Based** (`generate-monetized-articles.js`):
   - Uses curated product templates (keyboards, monitors, webcams, etc.)
   - No API costs, fully local generation
   - Generates comparison tables, product cards, FAQs
   - Includes Amazon affiliate components automatically
   - Skips existing files to avoid daily commits

**Key Design Principle:** Amazon affiliate tags are ONLY added in Astro components (single source of truth in `src/consts.ts`), never in scripts.

### Monetization Architecture

**Centralized Configuration:**
- `src/config/monetization.config.ts` - Main monetization settings (Amazon, Google, affiliates)
- `src/config/products.ts` - Digital products and affiliate program definitions
- `src/consts.ts` - Global site constants including `AFFILIATE_TAG`

**Monetization Components:**
- `AmazonAffiliate.astro` - Product cards with "Ver Precio en Amazon" buttons
- `ComparisonTable.astro` - Side-by-side product comparison tables
- `AffiliateDisclaimer.astro` - Legal disclosure (place at article bottom)
- `MonetizationHub.astro` - Contextual monetization based on category
- `GoogleAnalytics.astro` - GA4 tracking with Partytown web worker

**Important:** The Amazon affiliate tag (`AFFILIATE_TAG`) is injected client-side via components. Links in markdown/MDX should NOT include tags - components handle this automatically.

### Layout System

**Blog Post Layout** (`src/layouts/BlogPost.astro`):
- Responsive hero image with fallback
- Auto-generated table of contents (TOC) for posts with 3+ H2/H3 headings
- Reading progress bar (top of viewport)
- Reading time calculation (200 WPM)
- Related posts section (based on tags/category)
- Prev/Next post navigation
- MonetizationHub integration for contextual affiliate content
- Intersection Observer for active TOC highlighting

**Key UX Features:**
- Mobile TOC as collapsible `<details>` element
- Desktop TOC as sticky sidebar (appears at `1024px` breakpoint)
- Vercel Analytics + Speed Insights integration
- Fully responsive grid layout

### Routing Structure

```
src/pages/
├── index.astro              # Homepage with featured posts
├── about.astro              # About page
├── dashboard.astro          # Analytics/monetization dashboard
├── blog/
│   ├── index.astro          # Blog listing page
│   └── [...slug].astro      # Dynamic blog post route
└── api/
    └── analytics-summary.json.ts  # API endpoint for analytics data
```

**Dynamic Route Logic** (`blog/[...slug].astro`):
- Fetches post by slug from content collections
- Renders with `BlogPost.astro` layout
- Calculates related posts (same tags/category)
- Generates prev/next navigation

## Important Development Notes

### Content Generation Best Practices

1. **Before generating new articles:** Always check if file exists to avoid overwriting
2. **Keyword research:** Use Serper API (free tier: 2500/month) before generating
3. **Cost awareness:** GPT-4o costs ~$5/1M input tokens, $15/1M output tokens
4. **Image licensing:** Pexels images are free but require attribution in some cases
5. **Frontmatter dates:** Use ISO format `YYYY-MM-DD` for `pubDate`

### Affiliate Link Guidelines

- Never hardcode Amazon affiliate tags in markdown/scripts
- Always use `AmazonAffiliate` component with `amazonUrl` prop
- Component automatically appends `?tag={AFFILIATE_TAG}` client-side
- Include `<AffiliateDisclaimer />` at bottom of monetized posts
- Track conversions via `trackConversion()` helper in products.ts

### SEO Optimization

Articles should follow this structure:
- Title: 50-60 characters, keyword at start
- Meta description: 150-155 characters with clear CTA
- Minimum 3 H2 headings with keyword variations
- Use semantic keywords naturally (avoid keyword stuffing)
- Include FAQ section (at least 3 questions)
- Add `tags` and `category` in frontmatter for internal linking

### Styling & Design System

- Uses CSS custom properties defined in `<style is:global>` blocks
- Color system: `--accent`, `--accent-light`, `--gray`, `--gray-dark`, `--gray-light`
- Responsive breakpoints: `768px` (tablets), `1024px` (desktop)
- Typography: System fonts with fallbacks
- Cards use soft shadows: `0 10px 30px rgba(0,0,0,0.06)`
- Hover effects: `translateY(-4px)` with shadow increase

### Integration Setup

**Astro Integrations** (defined in `astro.config.mjs`):
- `@astrojs/mdx` - MDX support for blog posts
- `@astrojs/sitemap` - Auto-generates sitemap.xml
- `@astrojs/partytown` - Offloads analytics to web worker

**Adding New Integrations:**
```bash
npm run astro add <integration-name>
```

### Git Workflow

- Main branch: `main`
- `.gitignore` excludes: `dist/`, `.astro/`, `node_modules/`, `.env`, `package-lock.json`
- Note: `.gitignore` has some malformed entries at the end (lines 27-37) that should be cleaned up

## Common Workflows

### Adding a New Blog Post Manually

1. Create file in `src/content/blog/YYYY-MM-DD-slug.md`
2. Add required frontmatter:
   ```yaml
   ---
   title: "Your Title"
   description: "Your description"
   pubDate: 2025-01-01
   heroImage: "/images/your-image.jpg"
   category: "Hardware"
   tags: ["tag1", "tag2"]
   featured: true
   ---
   ```
3. Write content in markdown/MDX
4. Run `npm run dev` to preview

### Adding Amazon Affiliate Products

In your `.mdx` file:
```mdx
import AmazonAffiliate from '../../components/AmazonAffiliate.astro';

<AmazonAffiliate
  productName="Product Name"
  amazonUrl="https://www.amazon.com/dp/ASIN123"
  price="$99"
  rating={4.5}
  description="Why this product is great"
  buttonText="Ver Precio en Amazon"
  ctaStyle="primary"
/>
```

### Generating AI Articles

```bash
# Set custom keyword (optional, defaults to predefined keyword)
export CUSTOM_KEYWORD="best wireless mice for programming"
node scripts/generate-smart-article.js
```

The script will:
1. Research keyword via Serper API
2. Analyze top 5 competitors
3. Fetch related searches
4. Generate 3000-4000 token article with GPT-4o
5. Download hero image from Pexels
6. Save to `src/content/blog/YYYY-MM-DD-{slug}.md`

### Deployment

**Platform:** Vercel (automatic deployment from Git)

**Build Process:**
1. Vercel runs `npm run build`
2. Static site generated to `./dist/`
3. Sitemap auto-generated at `/sitemap-index.xml`
4. RSS feed at `/rss.xml`

**Important:** Vercel injects environment variables automatically if configured in dashboard.
