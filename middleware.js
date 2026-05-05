export const config = {
  matcher: '/:path*',
}

export default function middleware(request) {
  const authHeader = request.headers.get('authorization')

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ')
    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded)
      const colonIndex = decoded.indexOf(':')
      const user = decoded.slice(0, colonIndex)
      const pass = decoded.slice(colonIndex + 1)
      if (user === 'gintetsu' && pass === 'gintetsu2024') {
        return
      }
    }
  }

  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="house-ai"',
    },
  })
}
