function backendOrigin(): string {
  return process.env.API_URL?.replace(/\/$/, '') || 'http://localhost:3000'
}

export async function proxyToBackend(request: Request): Promise<Response> {
  const incoming = new URL(request.url)
  const prefix = '/api/v1'
  const suffix = incoming.pathname.startsWith(prefix)
    ? incoming.pathname.slice(prefix.length)
    : incoming.pathname
  const target = `${backendOrigin()}${prefix}${suffix}${incoming.search}`

  const headers = new Headers()
  const allow = [
    'authorization',
    'content-type',
    'x-session-id',
    'cookie',
    'user-agent',
  ]
  for (const name of allow) {
    const value = request.headers.get(name)
    if (value) {
      headers.set(name, value)
    }
  }

  const method = request.method.toUpperCase()
  const hasBody = method !== 'GET' && method !== 'HEAD'

  let upstream: Response
  try {
    upstream = await fetch(target, {
      method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: 'manual',
    })
  } catch {
    return Response.json({ message: 'Failed to fetch' }, { status: 502 })
  }

  const outbound = new Headers()
  const contentType = upstream.headers.get('content-type')
  if (contentType) {
    outbound.set('content-type', contentType)
  }

  const cookies =
    typeof upstream.headers.getSetCookie === 'function'
      ? upstream.headers.getSetCookie()
      : []
  for (const cookie of cookies) {
    outbound.append('set-cookie', cookie)
  }

  return new Response(
    upstream.status === 204 ? null : await upstream.arrayBuffer(),
    {
      status: upstream.status,
      headers: outbound,
    },
  )
}
