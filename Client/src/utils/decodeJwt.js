// Lightweight JWT payload decoder (browser-safe)
export function decodeJwt(token) {
  if (!token || typeof token !== 'string') return {};
  try {
    const parts = token.split('.');
    if (parts.length < 2) return {};
    const payload = parts[1];
    // Add padding if necessary
    const padded = payload.padEnd(payload.length + (4 - (payload.length % 4)) % 4, '=');
    const json = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
    // Decode UTF-8
    const decoded = decodeURIComponent(
      json.split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    return JSON.parse(decoded);
  } catch (e) {
    return {};
  }
}
