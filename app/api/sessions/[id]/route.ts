import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const resolvedParams = await params;
  const id = resolvedParams.id;
  if (!id) return new NextResponse('Missing session ID', { status: 400 });

  const { data, error } = await supabase
    .from('blxckchat_sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
    
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
