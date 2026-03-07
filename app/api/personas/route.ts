import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Force Node.js over Edge to access the local filesystem

export async function GET() {
  try {
    const personasDir = path.join(process.cwd(), 'personas');
    
    // Safety check just in case the directory doesn't exist
    try {
      await fs.access(personasDir);
    } catch {
      return NextResponse.json({ personas: [] });
    }

    const files = await fs.readdir(personasDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    const presets = await Promise.all(mdFiles.map(async (file) => {
      const fullPath = path.join(personasDir, file);
      const content = await fs.readFile(fullPath, 'utf-8');
      
      const { data: frontmatter, content: body } = matter(content);

      // Extract explicit YAML or fallback intelligently
      const name = frontmatter.name || file.replace('.md', '');
      const tagline = frontmatter.tagline || 'The Anointed Counsel';
      const icon = frontmatter.icon || '🪽';

      return {
        id: file.replace('.md', ''),
        name,
        tagline,
        icon,
        content: content.trim(), // Return the entire raw MD (including frontmatter if needed, though we could return `body` - but you instructed the full payload should overwrite custom instructions)
      };
    }));

    // Sort by name for consistency
    presets.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ personas: presets });
  } catch (error) {
    console.error('Failed to parse personas API:', error);
    return NextResponse.json({ error: 'Internal server error resolving the Divine Pantheon' }, { status: 500 });
  }
}
