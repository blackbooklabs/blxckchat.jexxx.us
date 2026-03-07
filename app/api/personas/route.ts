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
      const { data: fm } = matter(rawContent);

      const name: string = fm.name || file.replace('.md', '');
      const tagline: string = fm.tagline || 'The Anointed Counsel';
      const icon: string = fm.icon || '🪽';
      const safeContent: string = fm.safe_excerpt || '';
      const spicyContent: string = fm.spicy_excerpt || '';

      return {
        id: file.replace('.md', ''),
        name,
        tagline,
        icon,
        safe_content: safeContent,
        spicy_content: spicyContent, // Always returned — client gates display based on auth state
      };
    }));

    presets.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ personas: presets });
  } catch (error) {
    console.error('Failed to parse personas:', error);
    return NextResponse.json({ error: 'Failed to load persona pantheon' }, { status: 500 });
  }
}
