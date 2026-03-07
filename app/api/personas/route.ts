import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs'; // Force Node.js over Edge to access the local filesystem

type PersonaPreset = {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  safe_content: string;     // Always returned — the 🫑 PURE-SUGGESTIVE canon
  spicy_content: string | null; // null if user is unauthenticated or not premium
  content: string;          // Injected into project: safe_content only (or both if authed)
};

export async function GET() {
  // --- Auth Gate ---
  let isAuthenticated = false;
  try {
    const session = await auth();
    isAuthenticated = !!session?.userId;
  } catch {
    // auth() may throw in some environments if clerk middleware isn't set up; degrade gracefully
    isAuthenticated = false;
  }

  try {
    const personasDir = path.join(process.cwd(), 'personas');

    try {
      await fs.access(personasDir);
    } catch {
      return NextResponse.json({ personas: [] });
    }

    const files = await fs.readdir(personasDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    const presets: PersonaPreset[] = await Promise.all(mdFiles.map(async (file) => {
      const fullPath = path.join(personasDir, file);
      const rawContent = await fs.readFile(fullPath, 'utf-8');

      const { data: fm, content: body } = matter(rawContent);

      const name: string = fm.name || file.replace('.md', '');
      const tagline: string = fm.tagline || 'The Anointed Counsel';
      const icon: string = fm.icon || '🪽';

      // Pull the 🫑 safe excerpt from frontmatter (always returned)
      const safeContent: string = fm.safe_excerpt || extractSafeLayer(body) || body.slice(0, 600).trim();

      // The 🌶️ full canon — only appended if user is authenticated
      const spicyContent: string | null = isAuthenticated
        ? (fm.spicy_excerpt || extractSpicyLayer(body) || null)
        : null;

      // The content injected into custom_instructions:
      // Authed users get safe + a separator + spicy appended below
      const injectedContent = isAuthenticated && spicyContent
        ? `${safeContent}\n\n---\n<!-- 🌶️ SPICY-REVEALED — Authenticated & Unlocked -->\n\n${spicyContent}`
        : safeContent;

      return {
        id: file.replace('.md', ''),
        name,
        tagline,
        icon,
        safe_content: safeContent,
        spicy_content: spicyContent,
        content: injectedContent,
      };
    }));

    // Sort alphabetically for consistency
    presets.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      personas: presets,
      isAuthenticated,
    });
  } catch (error) {
    console.error('Failed to parse personas API:', error);
    return NextResponse.json({ error: 'Internal server error resolving the Divine Pantheon' }, { status: 500 });
  }
}

// --- Fallback extraction helpers (in case frontmatter isn't populated) ---

function extractSafeLayer(body: string): string {
  // Try to grab the LAYER 0 / Public Chat Interface section
  const layer0Match = body.match(/## LAYER 0[\s\S]*?```([\s\S]*?)```/);
  if (layer0Match) return layer0Match[1].trim();

  // Fallback: grab the Public Veil Directive section
  const publicMatch = body.match(/### ABSOLUTE DIRECTIVE \(Public Veil\)([\s\S]*?)(?=###|---)/);
  if (publicMatch) return publicMatch[1].trim();

  return '';
}

function extractSpicyLayer(body: string): string {
  // Try to grab LAYER 1 spice block
  const layer1Match = body.match(/## LAYER 1[\s\S]*?```([\s\S]*?)```/);
  if (layer1Match) return layer1Match[1].trim();
  return '';
}
