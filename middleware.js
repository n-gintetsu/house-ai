export const config = {
  matcher: '/((?!api).*)',
}

export default function middleware(request) {
  const { pathname } = request.nextUrl || new URL(request.url)
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/assets/') ||
    /\.(js|mjs|css|svg|png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf)$/i.test(pathname) ||
    pathname === '/workspace' ||
    pathname === '/workspace/' ||
    pathname === '/login' ||
    pathname === '/login/' ||
    pathname === '/houses' ||
    pathname === '/houses/' ||
    pathname === '/clients' ||
    pathname === '/clients/' ||
    pathname.startsWith('/house/')
  ) return

  const authHeader = request.headers.get('authorization')

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ')
    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded)
      const colonIndex = decoded.indexOf(':')
      const user = decoded.slice(0, colonIndex)
      const pass = decoded.slice(colonIndex + 1)
      const expectedUser = process.env.BASIC_AUTH_USER
      const expectedPass = process.env.BASIC_AUTH_PASS
      if (expectedUser && expectedPass && user === expectedUser && pass === expectedPass) {
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
