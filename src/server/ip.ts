import type { Request } from 'express';

export interface ClientIpInfo {
  ip: string;
  networkKey: string;
}

/**
 * Normalizes IPv4 or IPv6 address.
 * IPv4: kept as full /32 address (e.g. 198.51.100.14)
 * IPv6: truncated to /64 subnet prefix to prevent rate-limit bypass via IPv6 cycling.
 */
export function normalizeIp(rawIp: string): ClientIpInfo | null {
  if (!rawIp || typeof rawIp !== 'string') return null;

  let ip = rawIp.trim();

  // Strip IPv6-mapped IPv4 (::ffff:192.168.1.1)
  if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7);
  }

  // Handle IPv4
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.').map(Number);
    const valid = parts.every((p) => p >= 0 && p <= 255);
    if (!valid) return null;
    return { ip, networkKey: `ipv4:${ip}` };
  }

  // Handle IPv6
  // Normalize simple or shortened IPv6
  if (ip.includes(':')) {
    // Strip zone index (e.g. fe80::1%eth0)
    const zoneIndex = ip.indexOf('%');
    if (zoneIndex !== -1) {
      ip = ip.slice(0, zoneIndex);
    }

    // Expand IPv6 blocks to get /64 prefix (first 4 groups of 16-bit hextets)
    try {
      const expanded = expandIPv6(ip);
      if (!expanded) return null;
      // First 4 hextets constitute /64 prefix
      const prefix64 = expanded.slice(0, 4).join(':');
      return { ip, networkKey: `ipv6:${prefix64}::/64` };
    } catch {
      return null;
    }
  }

  return null;
}

function expandIPv6(ip: string): string[] | null {
  const parts = ip.split('::');
  if (parts.length > 2) return null; // Invalid multiple ::

  let head = parts[0] ? parts[0].split(':').filter(Boolean) : [];
  let tail = parts.length === 2 && parts[1] ? parts[1].split(':').filter(Boolean) : [];

  const missing = 8 - (head.length + tail.length);
  if (parts.length === 2 && missing < 0) return null;

  const middle = parts.length === 2 ? new Array(missing).fill('0000') : [];
  const full = [...head, ...middle, ...tail].map((h) => h.padStart(4, '0').toLowerCase());

  if (full.length !== 8) return null;
  return full;
}

/**
 * Extracts client IP using strictly trusted edge headers from Vercel / Cloudflare / reverse proxy.
 * Does NOT blindly accept client-supplied x-forwarded-for prefixes.
 */
export function extractClientIp(req: Request): ClientIpInfo | null {
  // 1. Vercel infrastructure header (trusted)
  const vercelIp = req.headers['x-vercel-forwarded-for'];
  if (vercelIp && typeof vercelIp === 'string') {
    const candidate = vercelIp.split(',')[0].trim();
    const normalized = normalizeIp(candidate);
    if (normalized) return normalized;
  }

  // 2. Real IP header from edge reverse proxy (trusted)
  const realIp = req.headers['x-real-ip'];
  if (realIp && typeof realIp === 'string') {
    const candidate = realIp.split(',')[0].trim();
    const normalized = normalizeIp(candidate);
    if (normalized) return normalized;
  }

  // 3. Fallback to direct connection socket address
  const socketIp = req.socket?.remoteAddress;
  if (socketIp) {
    const normalized = normalizeIp(socketIp);
    if (normalized) return normalized;
  }

  return null;
}
