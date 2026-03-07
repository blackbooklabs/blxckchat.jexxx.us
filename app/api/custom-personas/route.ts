import { NextResponse } from 'next/server';
import { getServerUserId } from '@/lib/serverAuth';
import { getSupabase, getSupabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET() {
  const userId = await getServerUserId();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('custom_personas')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const userId = await getServerUserId();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const body = await req.json();
  const { name, icon = '🪽', tagline = '', safe_content = '', spicy_content = '' } = body;

  if (!name || name.length < 3) {
    return NextResponse.json({ error: 'Name must be at least 3 characters.' }, { status: 400 });
  }
  if (!safe_content || safe_content.length < 50) {
    return NextResponse.json({ error: 'Safe content must be at least 50 characters.' }, { status: 400 });
  }

  const header = `<!-- CUSTOM PERSONA: ${name} – Created by user ${userId} on ${new Date().toISOString().split('T')[0]} -->\n\n`;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('custom_personas')
    .insert([{
      user_id: userId,
      name,
      icon,
      tagline,
      safe_content: header + safe_content,
      spicy_content,
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const userId = await getServerUserId();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const body = await req.json();
  const { id, name, icon, tagline, safe_content, spicy_content } = body;

  if (!id) return new NextResponse('Missing id', { status: 400 });

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (icon !== undefined) updates.icon = icon;
  if (tagline !== undefined) updates.tagline = tagline;
  if (safe_content !== undefined) updates.safe_content = safe_content;
  if (spicy_content !== undefined) updates.spicy_content = spicy_content;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('custom_personas')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const userId = await getServerUserId();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return new NextResponse('Missing id', { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('custom_personas')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
