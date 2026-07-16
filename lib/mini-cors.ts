const ALLOWED_ORIGINS = new Set([
  'https://mini.blxckchat.jexxx.us',
  'https://blxckchat.jexxx.us',
  'https://blxckbook.jexxx.us',
  'https://dxsh.blxckbook.jexxx.us',
]);

export function miniCorsHeaders(origin: string | null) {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://blxckchat.jexxx.us';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  };
}

export function miniOptionsResponse(req: Request) {
  const origin = req.headers.get('origin');
  return new Response(null, { status: 204, headers: miniCorsHeaders(origin) });
}