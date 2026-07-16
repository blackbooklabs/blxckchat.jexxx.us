# DOX framework - blxckchat.jexxx.us

## 1. Purpose

Encrypted and theme-harmonized AI Chat Interface for the JEXXXUS Ecosystem (`blxckchat.jexxx.us`). It serves as the gateway for devotees interacting with Luna Verde and Xena Azul AI personas, providing pricing tier upgrades and multi-model AI routing.

## 2. Ownership

Owned by the JEXXXUS Ecosystem team (Supreme Authority).

## 3. Local Contracts

- **Framework**: Built on Next.js 16.1.6, React 19.2.4, Motion 12.34.3, and Tailwind CSS v4.2.0.
- **AI Providers & Models**: Supports 25+ models across 10 providers: GPT (OpenAI), Claude (Anthropic), Gemini (Google), Grok (xAI), Kimi (Moonshot), Groq, OpenRouter, Ollama (Local), Bonsai (Local), and Hugging Face (Kingdom).
- **Authentication**: Clerk OAuth with Vercel Edge runtime compatibility. Sharing session cookies automatically across `*.jexxx.us` subdomains.
- **Database Schema**: Chat history and project domains are stored in public schema tables:
  - `public.blxckchat_projects`
  - `public.blxckchat_chats`
  - `public.blxckchat_user_settings` (for BYOK settings persistence)
- **Monetization**: Integrated with Paddle for subscription tiers: FREE → Mistress ($33) → Concu-bae-bae ($66) → Mid-Wife ($99).
- **Ecosystem Integration**: Vendors `jexxxus-cli` under `vendor/jexxxus-cli` for runtime imports inside `/api/agent` and `/api/mini/agent` (Kingdom Agent: VEIL, TV, Bible, Law, Docs, signed-in vault CRUD). Run `scripts/sync-vendor-cli.sh` to keep CLI runtime in parity. Mini uses Bearer JWT + server-side BYOK; full chat uses cookie session + client BYOK headers.
- **Aesthetic**: Strictly adheres to the JEXXXUS visual identity system. Accent colors must utilize the brand pink (#ec4899/#db2777), Syncopate for headings/nav, IBM Plex Sans for body text, and VT323/Pinyon Script for specific branding accents. Orange, green, or purple accents are forbidden. Theme toggling cookie `jexxxus-theme` must sync real-time across the ecosystem.
- **SEO & AEO**: Configured with dynamic `robots.ts` and `sitemap.ts` under `/app`. Meta description and structured JSON-LD data are kept optimized.

## 4. Work Guidance

- Refer to the global `AGENTS.md` in the root repository for all spelling rules and branding constraints (e.g. `JEXXXUS`, `BLXCKBOOK`, `wing6` lowercase).
- Master style hub: Obsidian `JEXXXUS/08-branding/JEXXXUS Style Guide Index.md`
- **Auto-Git Policy (binding)**: After every work session, update Obsidian docs in `jexxx.us-obsidian/` and push ALL touched repositories to GitHub.

## 5. Verification

- Run `pnpm run build` to verify Next.js compilations build successfully.
- Check Clerk authentication and Supabase database interactions before finalizing changes.

## 6. Child DOX Index

- (None)
