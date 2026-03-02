export const API_CONFIG = {
  // CONFIGURACIÓN:
  // - useProxy: true  → Usa el proxy de Angular (recomendado para desarrollo)
  // - useProxy: false → Usa URL directa (requiere CORS configurado en backend)

  // 👇 CAMBIA ESTE VALOR SEGÚN TU CONFIGURACIÓN
  useProxy: true, // true = usa proxy, false = URL directa

  // Si useProxy = false, especifica el puerto:
  // - Con gateway: usar puerto 8080
  // - Sin gateway: usar puerto 8081
  useGateway: true, // true = puerto 8080, false = puerto 8081

  gatewayUrl: 'http://localhost:8080',
  directUrl: 'http://localhost:8081',

  endpoints: {
    clientes: '/clientes',
    cuentas: '/cuentas',
    movimientos: '/movimientos',
    reportes: '/reportes'
  },

  // URL base dinámica según configuración
  get baseUrl(): string {
    // Si usa proxy, devuelve string vacío (las rutas son relativas)
    if (this.useProxy) {
      return '';
    }
    // Si no usa proxy, devuelve la URL completa
    return this.useGateway ? this.gatewayUrl : this.directUrl;
  }
};

// Helper para construir URLs completas
export function getApiUrl(endpoint: keyof typeof API_CONFIG.endpoints): string {
  return `${API_CONFIG.baseUrl}${API_CONFIG.endpoints[endpoint]}`;
}
