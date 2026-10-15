import 'server-only';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import https from 'node:https';
import http from 'node:http';
import { DeskError } from './auth';
// Pin each connection to an already validated public address, including every redirect.
export function publicAddress(address: string) {
  if (isIP(address) === 4) {
    const [a, b] = address.split('.').map(Number);
    return !(
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && [0, 168].includes(b)) ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 198 && [18, 19, 51].includes(b)) ||
      (a === 203 && b === 0)
    );
  }
  if (isIP(address) === 6) {
    const a = address.toLowerCase();
    return (
      /^[23]/.test(a) &&
      !a.startsWith('2001:db8') &&
      !a.startsWith('2002:') &&
      !a.startsWith('2001:0:')
    );
  }
  return false;
}
export function publicUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new DeskError('Enter a valid public URL.');
  }
  if (
    !['https:', 'http:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    (url.port && !['80', '443'].includes(url.port)) ||
    /localhost|\.local$|\.internal$|\.localhost$/i.test(url.hostname)
  )
    throw new DeskError('Only public HTTP(S) addresses are supported.');
  return url;
}
export async function safeFetch(
  value: string,
  headers: Record<string, string> = {},
  redirects = 0,
  deadline = Date.now() + 12000,
): Promise<{
  text: string;
  url: string;
  etag: string | null;
  status: number;
  type: string;
}> {
  const url = publicUrl(value);
  if (redirects > 3 || Date.now() > deadline)
    throw new DeskError(
      'The page timed out. Paste its description instead.',
      408,
    );
  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  const addresses = await Promise.race([
    lookup(hostname, { all: true }),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new DeskError('DNS lookup timed out.', 408)),
        Math.max(1, deadline - Date.now()),
      ).unref(),
    ),
  ]);
  if (!addresses.length || addresses.some((a) => !publicAddress(a.address)))
    throw new DeskError(
      'Private or reserved network addresses are blocked.',
      400,
    );
  const address = addresses[0];
  return new Promise((resolve, reject) => {
    const req = (url.protocol === 'https:' ? https : http).request(
      url,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'CoopDesk/1.0 (personal job organizer)',
          Accept: 'application/json,text/html,text/plain',
          ...headers,
        },
        lookup: ((
          _host: unknown,
          opts: { all?: boolean },
          cb: (
            e: null,
            value: string | { address: string; family: number }[],
            family?: number,
          ) => void,
        ) =>
          opts.all
            ? cb(null, [address])
            : cb(null, address.address, address.family)) as never,
      },
      (res) => {
        const status = res.statusCode || 500;
        if ([301, 302, 303, 307, 308].includes(status)) {
          res.resume();
          if (!res.headers.location) {
            reject(new DeskError('Invalid page redirect.'));
            return;
          }
          safeFetch(
            new URL(res.headers.location, url).href,
            {},
            redirects + 1,
            deadline,
          ).then(resolve, reject);
          return;
        }
        if (status === 304) {
          res.resume();
          resolve({
            text: '',
            url: url.href,
            etag: res.headers.etag || null,
            status,
            type: '',
          });
          return;
        }
        if (status < 200 || status >= 300) {
          res.resume();
          reject(
            new DeskError(
              status === 429
                ? 'Source rate limit reached. Try later.'
                : 'This page is unavailable or requires sign-in. Paste its description instead.',
              status === 429 ? 429 : 422,
            ),
          );
          return;
        }
        const type = String(res.headers['content-type'] || '');
        if (!/json|text\/|xml/.test(type)) {
          res.resume();
          reject(
            new DeskError(
              'Unsupported page format. Paste the description instead.',
            ),
          );
          return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        res.on('data', (chunk) => {
          size += chunk.length;
          if (size > 3000000) {
            req.destroy(new DeskError('Page exceeds the import size limit.'));
            return;
          }
          chunks.push(chunk);
        });
        res.on('end', () =>
          resolve({
            text: Buffer.concat(chunks).toString('utf8'),
            url: url.href,
            etag: res.headers.etag || null,
            status,
            type,
          }),
        );
        res.on('error', reject);
      },
    );
    const timer = setTimeout(
      () =>
        req.destroy(
          new DeskError(
            'The source timed out. Retry or paste the description.',
            408,
          ),
        ),
      Math.max(1, deadline - Date.now()),
    );
    req.on('close', () => clearTimeout(timer));
    req.on('error', reject);
    req.end();
  });
}
export function readable(html: string) {
  return html
    .replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6])\b[^>]*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(
      /&(?:amp|lt|gt|quot|apos|nbsp);/g,
      (x) =>
        ({
          '&amp;': '&',
          '&lt;': '<',
          '&gt;': '>',
          '&quot;': '"',
          '&apos;': "'",
          '&nbsp;': ' ',
        })[x]!,
    )
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, v) =>
      String.fromCodePoint(
        Math.min(
          parseInt(
            v.startsWith('x') ? v.slice(1) : v,
            v.startsWith('x') ? 16 : 10,
          ),
          0x10ffff,
        ),
      ),
    )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}
