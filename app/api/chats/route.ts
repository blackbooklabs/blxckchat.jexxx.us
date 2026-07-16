import { NextResponse } from 'next/server';
import { getServerUserIdFromRequest } from '@/lib/serverAuth';
import { getSupabaseAdmin } from '@/lib/supabase';

const ALLOWED_ORIGINS = new Set([
  'https://mini.blxckchat.jexxx.us',
  'https://blxckchat.jexxx.us',
]);

function corsHeaders(origin: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://blxckchat.jexxx.us';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  };
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function GET(req: Request) {
  const origin = req.headers.get('origin');
  const userId = await getServerUserIdFromRequest(req);
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401, headers: corsHeaders(origin) });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  
  if (!projectId) return new NextResponse('Missing projectId', { status: 400, headers: corsHeaders(origin) });

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
         return NextResponse.json([], { headers: corsHeaders(origin) }); // Return empty chats for mock projects
       }
       return new NextResponse('Unauthorized project access', { status: 403, headers: corsHeaders(origin) });
    }

    const { data, error } = await supabase
      .from('blxckchat_chats')
      .select('*')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false });
      
    if (error) {
      if (process.env.NODE_ENV === 'development') return NextResponse.json([], { headers: corsHeaders(origin) });
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders(origin) });
    }
    return NextResponse.json(data, { headers: corsHeaders(origin) });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') return NextResponse.json([], { headers: corsHeaders(origin) });
    return NextResponse.json({ error: String(e) }, { status: 500, headers: corsHeaders(origin) });
  }
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  const userId = await getServerUserIdFromRequest(req);
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401, headers: corsHeaders(origin) });
  }
  
  const body = await req.json();
  const { projectId, title = 'New Chat', messages = [], custom_instructions } = body;
  
  if (!projectId) return new NextResponse('Missing projectId', { status: 400, headers: corsHeaders(origin) });
  
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
         return new NextResponse('Unauthorized project layout', { status: 403, headers: corsHeaders(origin) });
       }
     }

    const insertPayload: any = { project_id: projectId, title, messages };
    if (custom_instructions !== undefined) insertPayload.custom_instructions = custom_instructions;

    const { data, error } = await supabase
      .from('blxckchat_chats')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        const mockChat = { id: `mock_chat_${Date.now()}`, project_id: projectId, title, messages, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), custom_instructions };
        return NextResponse.json(mockChat, { headers: corsHeaders(origin) });
      }
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders(origin) });
    }
    return NextResponse.json(data, { headers: corsHeaders(origin) });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
       const mockChat = { id: `mock_chat_${Date.now()}`, project_id: projectId, title, messages, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), custom_instructions };
       return NextResponse.json(mockChat, { headers: corsHeaders(origin) });
    }
    return NextResponse.json({ error: String(e) }, { status: 500, headers: corsHeaders(origin) });
  }
}

export async function PUT(req: Request) {
  const origin = req.headers.get('origin');
  const userId = await getServerUserIdFromRequest(req);
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401, headers: corsHeaders(origin) });
  }
  
  const body = await req.json();
  const { id, title, messages, custom_instructions } = body;
  
  if (!id) return new NextResponse('Missing chat ID', { status: 400, headers: corsHeaders(origin) });

  const supabase = getSupabaseAdmin();

  const { data: chatData, error: chatError } = await supabase
      .from('blxckchat_chats')
      .select('project_id')
      .eq('id', id)
      .single();
      
  if (chatError || !chatData) return new NextResponse('Chat not found', { status: 404, headers: corsHeaders(origin) });

  const { data: projectCheck, error: projError } = await supabase
    .from('blxckchat_projects')
    .select('id')
    .eq('id', chatData.project_id)
    .eq('user_id', userId)
    .single();

  if (projError || !projectCheck) return new NextResponse('Unauthorized project layout', { status: 403, headers: corsHeaders(origin) });

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

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders(origin) });
  return NextResponse.json(data, { headers: corsHeaders(origin) });
}

export async function DELETE(req: Request) {
  const origin = req.headers.get('origin');
  const userId = await getServerUserIdFromRequest(req);
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401, headers: corsHeaders(origin) });
  }
  
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) return new NextResponse('Missing chat ID', { status: 400, headers: corsHeaders(origin) });

  const supabase = getSupabaseAdmin();

  const { data: chatData, error: chatError } = await supabase
      .from('blxckchat_chats')
      .select('project_id')
      .eq('id', id)
      .single();
      
  if (chatError || !chatData) return new NextResponse('Chat not found', { status: 404, headers: corsHeaders(origin) });

  const { data: projectCheck, error: projError } = await supabase
    .from('blxckchat_projects')
    .select('id')
    .eq('id', chatData.project_id)
    .eq('user_id', userId)
    .single();

  if (projError || !projectCheck) return new NextResponse('Unauthorized deletion attempt', { status: 403, headers: corsHeaders(origin) });

  const { error } = await supabase
    .from('blxckchat_chats')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders(origin) });
  return NextResponse.json({ success: true }, { headers: corsHeaders(origin) });
}