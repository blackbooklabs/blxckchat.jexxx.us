import { NextResponse } from 'next/server';
import { getServerUserId } from '@/lib/serverAuth';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: Request) {
  const userId = await getServerUserId();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from('blxckchat_projects')
      .select('*, chats:blxckchat_chats(*)')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
      
    if (error) {
      if (process.env.NODE_ENV === 'development') {
        const mockProject = { id: 'mock_project_0', user_id: userId, title: 'Sovereign Lab', custom_instructions: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), chats: [] };
        return NextResponse.json([mockProject]);
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
       const mockProject = { id: 'mock_project_0', user_id: userId, title: 'Sovereign Lab', custom_instructions: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), chats: [] };
       return NextResponse.json([mockProject]);
    }
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = await getServerUserId();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });
  
  const body = await req.json();
  const { title = 'New Project', custom_instructions = '' } = body;

  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from('blxckchat_projects')
      .insert([{ user_id: userId, title, custom_instructions }])
      .select()
      .single();

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        const mockProject = { id: `mock_${Date.now()}`, user_id: userId, title, custom_instructions, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        return NextResponse.json(mockProject);
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
       const mockProject = { id: `mock_${Date.now()}`, user_id: userId, title, custom_instructions, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
       return NextResponse.json(mockProject);
    }
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const userId = await getServerUserId();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });
  
  const body = await req.json();
  const { id, title, custom_instructions, context_json } = body;
  
  if (!id) return new NextResponse('Missing project ID', { status: 400 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (title !== undefined) updates.title = title;
  if (custom_instructions !== undefined) updates.custom_instructions = custom_instructions;
  if (context_json !== undefined) updates.context_json = context_json;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('blxckchat_projects')
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
  
  if (!id) return new NextResponse('Missing project ID', { status: 400 });

  const supabase = getSupabase();
  const { error } = await supabase
    .from('blxckchat_projects')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
