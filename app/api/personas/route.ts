import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const personasDir = path.join(process.cwd(), 'personas');

    try {
      await fs.access(personasDir);
    } catch {
      return NextResponse.json({ personas: [] });
    }

    const files = await fs.readdir(personasDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    const presets = await Promise.all(mdFiles.map(async (file) => {
      const fullPath = path.join(personasDir, file);
      const rawContent = await fs.readFile(fullPath, 'utf-8');
      const { data: fm, content } = matter(rawContent);

      const name: string = fm.name || file.replace('.md', '');
      const tagline: string = fm.tagline || 'The Anointed Counsel';
      const icon: string = fm.icon || '🪽';
      
      // The "Safe" version is the full body prompt.
      // If we want a separate safe vs spicy body, we'd need markers in the Markdown.
      // For now, we use the whole body as the prompt.
      const safeContent: string = content || '';
      // Excerpts are for the UI sidebar only (not used for AI prompts)
      const safeExcerpt: string = fm.safe_excerpt || tagline;
      const spicyExcerpt: string = fm.spicy_excerpt || '';

      return {
        id: file.replace('.md', ''),
        name,
        tagline,
        icon,
        safe_content: safeContent,
        spicy_content: content, // For presets, we use the same body (spice is in the prompt itself)
        safe_excerpt: safeExcerpt,
        spicy_excerpt: spicyExcerpt,
      };
    }));

    presets.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ personas: presets });
  } catch (error) {
    console.error('Failed to parse personas:', error);
    return NextResponse.json({ error: 'Failed to load persona pantheon' }, { status: 500 });
  }
}
