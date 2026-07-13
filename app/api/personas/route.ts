import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface PersonaFileRef {
  fullPath: string;
  relativePath: string;
}

function personaIdFromPath(relativePath: string): string {
  return relativePath.replace(/\.md$/i, '').replace(/\//g, '__');
}

function inferGroup(relativePath: string, fmGroup?: string): string {
  if (fmGroup) return fmGroup;
  if (relativePath.startsWith('Agents/')) return 'Agents';
  if (relativePath.startsWith('Biblical/')) return 'Biblical';
  return 'Other';
}

function inferFolder(relativePath: string, fmFolder?: string): string {
  if (fmFolder) return fmFolder;
  const parts = relativePath.replace(/\.md$/i, '').split('/');
  if (parts.length <= 1) return '';
  return parts.slice(0, -1).join('/');
}

async function walkPersonaMarkdown(
  dir: string,
  prefix = '',
): Promise<PersonaFileRef[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: PersonaFileRef[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      files.push(...(await walkPersonaMarkdown(fullPath, relativePath)));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push({ fullPath, relativePath });
    }
  }

  return files;
}

export async function GET() {
  try {
    const personasDir = path.join(process.cwd(), 'personas');

    try {
      await fs.access(personasDir);
    } catch {
      return NextResponse.json({ personas: [] });
    }

    const refs = await walkPersonaMarkdown(personasDir);

    const presets = await Promise.all(
      refs.map(async ({ fullPath, relativePath }) => {
        const rawContent = await fs.readFile(fullPath, 'utf-8');
        const { data: fm, content } = matter(rawContent);
        const fileBase = path.basename(relativePath, '.md');

        const name: string = fm.name || fileBase;
        const tagline: string = fm.tagline || 'The Anointed Counsel';
        const icon: string = fm.icon || '🪽';
        const group = inferGroup(relativePath, fm.group);
        const folder = inferFolder(relativePath, fm.folder);

        const safeContent: string = `name: ${name}\n\n${content || ''}`;
        const spicyContent: string = `name: ${name} (🌶️ SPICY)\n\n${content || ''}`;
        const safeExcerpt: string = fm.safe_excerpt || tagline;
        const spicyExcerpt: string = fm.spicy_excerpt || '';

        return {
          id: personaIdFromPath(relativePath),
          name,
          tagline,
          icon,
          group,
          folder,
          relativePath,
          safe_content: safeContent,
          spicy_content: spicyContent,
          safe_excerpt: safeExcerpt,
          spicy_excerpt: spicyExcerpt,
        };
      }),
    );

    presets.sort((a, b) => {
      const ga = a.group.localeCompare(b.group);
      if (ga !== 0) return ga;
      const fa = (a.folder || '').localeCompare(b.folder || '');
      if (fa !== 0) return fa;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ personas: presets });
  } catch (error) {
    console.error('Failed to parse personas:', error);
    return NextResponse.json({ error: 'Failed to load persona pantheon' }, { status: 500 });
  }
}