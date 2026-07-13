import { NextResponse } from 'next/server';

export const runtime = 'edge';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-openai-key, x-grok-key, x-gemini-key, x-kimi-key, x-groq-key, x-openrouter-key, x-anthropic-key, x-ollama-url',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { provider } = body;

    let models: string[] = [];
    
    if (provider === 'openai') {
      const key = req.headers.get('x-openai-key');
      if (!key) throw new Error("Missing key");
      const res = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${key}` } });
      const data = await res.json();
      if (data.data) {
        models = data.data.map((m: any) => m.id).filter((id: string) => id.includes('gpt') || id.includes('o1') || id.includes('o3')).sort().reverse();
      }
    } else if (provider === 'grok') {
      const key = req.headers.get('x-grok-key');
      if (!key) throw new Error("Missing key");
      const res = await fetch('https://api.x.ai/v1/models', { headers: { Authorization: `Bearer ${key}` } });
      const data = await res.json();
      if (data.models || data.data) {
        const list = data.data || data.models || [];
        models = list.map((m: any) => m.id).filter((id: string) => id.includes('grok')).sort().reverse();
      }
    } else if (provider === 'gemini') {
      const key = req.headers.get('x-gemini-key');
      if (!key) throw new Error("Missing key");
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      const data = await res.json();
      if (data.models) {
        models = data.models.map((m: any) => m.name.replace('models/', '')).filter((id: string) => id.includes('gemini') && !id.includes('vision')).sort().reverse();
      }
    } else if (provider === 'kimi') {
      const key = req.headers.get('x-kimi-key');
      if (!key) throw new Error("Missing key");
      const res = await fetch('https://api.moonshot.cn/v1/models', { headers: { Authorization: `Bearer ${key}` } });
      const data = await res.json();
      if (data.data) {
        models = data.data.map((m: any) => m.id).filter((id: string) => id.includes('moonshot') || id.includes('kimi')).sort().reverse();
      }
    } else if (provider === 'groq') {
      const key = req.headers.get('x-groq-key');
      if (!key) throw new Error("Missing key");
      const res = await fetch('https://api.groq.com/openai/v1/models', { headers: { Authorization: `Bearer ${key}` } });
      const data = await res.json();
      if (data.data) {
        models = data.data.map((m: any) => m.id).sort();
      }
    } else if (provider === 'openrouter') {
      const key = req.headers.get('x-openrouter-key');
      if (!key) throw new Error("Missing key");
      const res = await fetch('https://openrouter.ai/api/v1/models', { headers: { Authorization: `Bearer ${key}` } });
      const data = await res.json();
      if (data.data) {
        models = data.data.map((m: any) => m.id).sort(); // OpenRouter has hundreds, sort alphabetically
      }
    } else if (provider === 'anthropic') {
      const key = req.headers.get('x-anthropic-key');
      if (!key) throw new Error("Missing key");
      const res = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        }
      });
      const data = await res.json();
      if (data.data) {
        models = data.data.map((m: any) => m.id).sort();
      }
    } else {
      throw new Error(`Invalid provider: ${provider}`);
    }

    if (!models.length) {
      throw new Error("No models found or invalid key");
    }

    return NextResponse.json({ models }, { headers: corsHeaders });
  } catch (error) {
    console.error("Models fetch error:", error);
    return NextResponse.json({ error: String(error) }, { status: 400, headers: corsHeaders });
  }
}
