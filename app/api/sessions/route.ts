import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('blxckchat_sessions')
    .select('id, title, created_at, updated_at') // omit messages for list view speed
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
    
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });
  
  const body = await req.json();
  const { title = 'New Chat', messages = [] } = body;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('blxckchat_sessions')
    .insert([{ user_id: userId, title, messages }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });
  
  const body = await req.json();
  const { id, title, messages } = body;
  
  if (!id) return new NextResponse('Missing session ID', { status: 400 });

  const updates: any = { updated_at: new Date().toISOString() };
  if (title !== undefined) updates.title = title;
  if (messages !== undefined) updates.messages = messages;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('blxckchat_sessions')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId) // Security check
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });
  
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) return new NextResponse('Missing session ID', { status: 400 });

  const supabase = getSupabase();
  const { error } = await supabase
    .from('blxckchat_sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
