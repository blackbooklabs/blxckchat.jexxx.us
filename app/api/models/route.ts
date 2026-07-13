import { NextResponse } from 'next/server';
import {
  fetchProviderModels,
  type ModelsProvider,
} from '@/lib/provider-models';

export const runtime = 'edge';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, x-openai-key, x-grok-key, x-gemini-key, x-kimi-key, x-groq-key, x-openrouter-key, x-anthropic-key, x-kingdom-key, x-ollama-url',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const provider = body.provider as ModelsProvider;

    const models = await fetchProviderModels({
      provider,
      openaiKey: req.headers.get('x-openai-key'),
      anthropicKey: req.headers.get('x-anthropic-key'),
      grokKey: req.headers.get('x-grok-key'),
      geminiKey: req.headers.get('x-gemini-key'),
      kimiKey: req.headers.get('x-kimi-key'),
      groqKey: req.headers.get('x-groq-key'),
      openrouterKey: req.headers.get('x-openrouter-key'),
      kingdomKey: req.headers.get('x-kingdom-key'),
      ollamaUrl: req.headers.get('x-ollama-url'),
    });

    if (!models.length) {
      throw new Error('No models found — verify your API key and try again');
    }

    return NextResponse.json({ models }, { headers: corsHeaders });
  } catch (error) {
    console.error('Models fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400, headers: corsHeaders },
    );
  }
}