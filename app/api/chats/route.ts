import { NextResponse } from 'next/server';
import { getServerUserIdFromRequest } from '@/lib/serverAuth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { miniCorsHeaders, miniOptionsResponse } from '@/lib/mini-cors';

export async function OPTIONS(req: Request) {
  return miniOptionsResponse(req);
}

export async function GET(req: Request) {
  const origin = req.headers.get('origin');
  const userId = await getServerUserIdFromRequest(req);
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401, headers: miniCorsHeaders(origin) });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return new NextResponse('Missing projectId', { status: 400, headers: miniCorsHeaders(origin) });
  }

  const supabase = getSupabaseAdmin();
  try {
    const { data: projectCheck, error: projError } = await supabase
      .from('blxckchat_projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projError || !projectCheck) {
      if (process.env.NODE_ENV === 'development' && projectId.startsWith('mock_')) {
        return NextResponse.json([], { headers: miniCorsHeaders(origin) });
      }
      return new NextResponse('Unauthorized project access', { status: 403, headers: miniCorsHeaders(origin) });
    }

    const { data, error } = await supabase
      .from('blxckchat_chats')
      .select('*')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false });

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json([], { headers: miniCorsHeaders(origin) });
      }
      return NextResponse.json({ error: error.message }, { status: 500, headers: miniCorsHeaders(origin) });
    }
    return NextResponse.json(data, { headers: miniCorsHeaders(origin) });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json([], { headers: miniCorsHeaders(origin) });
    }
    return NextResponse.json({ error: String(e) }, { status: 500, headers: miniCorsHeaders(origin) });
  }
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  const userId = await getServerUserIdFromRequest(req);
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401, headers: miniCorsHeaders(origin) });
  }

  const body = await req.json();
  const { projectId, title = 'New Chat', messages = [], custom_instructions } = body;

  if (!projectId) {
    return new NextResponse('Missing projectId', { status: 400, headers: miniCorsHeaders(origin) });
  }

  const supabase = getSupabaseAdmin();
  try {
    const { data: projectCheck, error: projError } = await supabase
      .from('blxckchat_projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projError || !projectCheck) {
      if (!(process.env.NODE_ENV === 'development' && projectId.startsWith('mock_'))) {
        return new NextResponse('Unauthorized project layout', { status: 403, headers: miniCorsHeaders(origin) });
      }
    }

    const insertPayload: Record<string, unknown> = { project_id: projectId, title, messages };
    if (custom_instructions !== undefined) insertPayload.custom_instructions = custom_instructions;

    const { data, error } = await supabase
      .from('blxckchat_chats')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        const mockChat = {
          id: `mock_chat_${Date.now()}`,
          project_id: projectId,
          title,
          messages,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          custom_instructions,
        };
        return NextResponse.json(mockChat, { headers: miniCorsHeaders(origin) });
      }
      return NextResponse.json({ error: error.message }, { status: 500, headers: miniCorsHeaders(origin) });
    }
    return NextResponse.json(data, { headers: miniCorsHeaders(origin) });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      const mockChat = {
        id: `mock_chat_${Date.now()}`,
        project_id: projectId,
        title,
        messages,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        custom_instructions,
      };
      return NextResponse.json(mockChat, { headers: miniCorsHeaders(origin) });
    }
    return NextResponse.json({ error: String(e) }, { status: 500, headers: miniCorsHeaders(origin) });
  }
}

export async function PUT(req: Request) {
  const origin = req.headers.get('origin');
  const userId = await getServerUserIdFromRequest(req);
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401, headers: miniCorsHeaders(origin) });
  }

  const body = await req.json();
  const { id, title, messages, custom_instructions } = body;

  if (!id) {
    return new NextResponse('Missing chat ID', { status: 400, headers: miniCorsHeaders(origin) });
  }

  const supabase = getSupabaseAdmin();

  const { data: chatData, error: chatError } = await supabase
    .from('blxckchat_chats')
    .select('project_id')
    .eq('id', id)
    .single();

  if (chatError || !chatData) {
    return new NextResponse('Chat not found', { status: 404, headers: miniCorsHeaders(origin) });
  }

  const { data: projectCheck, error: projError } = await supabase
    .from('blxckchat_projects')
    .select('id')
    .eq('id', chatData.project_id)
    .eq('user_id', userId)
    .single();

  if (projError || !projectCheck) {
    return new NextResponse('Unauthorized project layout', { status: 403, headers: miniCorsHeaders(origin) });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (title !== undefined) updates.title = title;
  if (messages !== undefined) updates.messages = messages;
  if (custom_instructions !== undefined) updates.custom_instructions = custom_instructions;

  const { data, error } = await supabase
    .from('blxckchat_chats')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: miniCorsHeaders(origin) });
  }
  return NextResponse.json(data, { headers: miniCorsHeaders(origin) });
}

export async function DELETE(req: Request) {
  const origin = req.headers.get('origin');
  const userId = await getServerUserIdFromRequest(req);
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401, headers: miniCorsHeaders(origin) });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return new NextResponse('Missing chat ID', { status: 400, headers: miniCorsHeaders(origin) });
  }

  const supabase = getSupabaseAdmin();

  const { data: chatData, error: chatError } = await supabase
    .from('blxckchat_chats')
    .select('project_id')
    .eq('id', id)
    .single();

  if (chatError || !chatData) {
    return new NextResponse('Chat not found', { status: 404, headers: miniCorsHeaders(origin) });
  }

  const { data: projectCheck, error: projError } = await supabase
    .from('blxckchat_projects')
    .select('id')
    .eq('id', chatData.project_id)
    .eq('user_id', userId)
    .single();

  if (projError || !projectCheck) {
    return new NextResponse('Unauthorized deletion attempt', { status: 403, headers: miniCorsHeaders(origin) });
  }

  const { error } = await supabase
    .from('blxckchat_chats')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: miniCorsHeaders(origin) });
  }
  return NextResponse.json({ success: true }, { headers: miniCorsHeaders(origin) });
}