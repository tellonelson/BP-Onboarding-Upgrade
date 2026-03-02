const PROXY_CONFIG = [
  {
    context: ['/clientes', '/cuentas'],
    target: 'http://localhost:8080',
    secure: false,
    changeOrigin: false,
    logLevel: 'debug',
    bypass: function (req, res, proxyOptions) {
      // Si la petición es de navegación HTML (Accept: text/html), no usar proxy
      const acceptHeader = req.headers.accept || '';
      if (acceptHeader.includes('text/html')) {
        console.log('[PROXY] Bypass - HTML navigation request:', req.url);
        return '/index.html'; // Devuelve el index.html de Angular
      }
      // Si no es HTML, usar el proxy normalmente
      console.log('[PROXY] Using proxy for:', req.url);
      return null;
    },
    onProxyReq: function (proxyReq, req, res) {
      console.log('[PROXY] Request:', req.method, req.url);
      console.log('[PROXY] Target:', 'http://localhost:8080' + req.url);
    },
    onProxyRes: function (proxyRes, req, res) {
      console.log('[PROXY] Response:', proxyRes.statusCode, req.url);
      console.log('[PROXY] Content-Type:', proxyRes.headers['content-type']);

      // Forzar el Content-Type a application/json si es necesario
      if (req.url.includes('/clientes') ||
          req.url.includes('/cuentas')) {
        proxyRes.headers['content-type'] = 'application/json';
      }
    },
    onError: function (err, req, res) {
      console.error('[PROXY] Error:', err.message);
    }
  },
  {
    context: ['/movimientos', '/reportes'],
    target: 'http://localhost:8083',
    secure: false,
    changeOrigin: false,
    logLevel: 'debug',
    bypass: function (req, res, proxyOptions) {
      // Si la petición es de navegación HTML (Accept: text/html), no usar proxy
      const acceptHeader = req.headers.accept || '';
      if (acceptHeader.includes('text/html')) {
        console.log('[PROXY] Bypass - HTML navigation request:', req.url);
        return '/index.html'; // Devuelve el index.html de Angular
      }
      // Si no es HTML, usar el proxy normalmente
      console.log('[PROXY 8083] Using proxy for:', req.url);
      return null;
    },
    onProxyReq: function (proxyReq, req, res) {
      console.log('[PROXY 8083] Request:', req.method, req.url);
      console.log('[PROXY 8083] Target:', 'http://localhost:8083' + req.url);
    },
    onProxyRes: function (proxyRes, req, res) {
      console.log('[PROXY 8083] Response:', proxyRes.statusCode, req.url);
      console.log('[PROXY 8083] Content-Type:', proxyRes.headers['content-type']);

      // Forzar el Content-Type a application/json solo para movimientos (no para reportes)
      if (req.url.includes('/movimientos') && !req.url.includes('/reportes')) {
        proxyRes.headers['content-type'] = 'application/json';
      }
    },
    onError: function (err, req, res) {
      console.error('[PROXY 8083] Error:', err.message);
    }
  }
];

module.exports = PROXY_CONFIG;
