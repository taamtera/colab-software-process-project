const ALLOWED_HOSTS = new Set(['process.gprocurement.go.th', 'process5.gprocurement.go.th']);

function allowedUrl(value) {
  try {
    const url = new URL(value);
    // Legacy RSS documents use HTTP URLs for these same e-GP hosts.
    // Upgrade them before fetching, keeping all actual requests on HTTPS.
    if (url.protocol === 'http:' && ALLOWED_HOSTS.has(url.hostname) && (!url.port || url.port === '80')) url.protocol = 'https:';
    return url.protocol === 'https:' && ALLOWED_HOSTS.has(url.hostname) && !url.username && !url.password ? url : null;
  } catch { return null; }
}

const escapeAttribute = value => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export function prepareDocument(buffer, contentType, sourceUrl) {
  if (buffer.subarray(0, 1024).includes(Buffer.from('%PDF-'))) {
    return { data: buffer, contentType: 'application/pdf', extension: 'pdf' };
  }
  const prefix = buffer.subarray(0, 2048).toString('utf8').replace(/^\uFEFF/, '').trimStart();
  if (!/\bhtml\b/i.test(contentType || '') && !/^<(?:!doctype\s+html|html\b|head\b|body\b|table\b|div\b)/i.test(prefix)) return null;

  // e-GP pages may declare their Thai encoding in HTTP headers or HTML metadata.
  const charset = contentType?.match(/charset\s*=\s*["']?([\w-]+)/i)?.[1]
    || buffer.subarray(0, 4096).toString('latin1').match(/charset\s*=\s*["']?([\w-]+)/i)?.[1] || 'utf-8';
  let html;
  try { html = new TextDecoder(charset).decode(buffer); }
  catch { html = new TextDecoder('utf-8').decode(buffer); }
  html = html.replace(/<base\b[^>]*>/gi, '')
    .replace(/<meta\b[^>]*(?:charset\s*=|http-equiv\s*=\s*["']?(?:content-type|refresh)\b)[^>]*>/gi, '');
  const metadata = `<meta charset="utf-8"><base href="${escapeAttribute(sourceUrl)}" target="_blank">`;
  if (/<head\b[^>]*>/i.test(html)) html = html.replace(/<head\b[^>]*>/i, match => match + metadata);
  else if (/<html\b[^>]*>/i.test(html)) html = html.replace(/<html\b[^>]*>/i, match => match + `<head>${metadata}</head>`);
  else html = `<!doctype html><html><head>${metadata}</head><body>${html}</body></html>`;
  return { data: Buffer.from(html, 'utf8'), contentType: 'text/html; charset=utf-8', extension: 'html' };
}

export function createDocumentHandler({ findProject, fetchDocument = fetch, frontendOrigins = [], disposition = 'inline' }) {
  return async (request, response) => {
    const project = await findProject(request.params.projectId);
    const documentUrl = project?.documentUrl || project?.url;
    if (!documentUrl) return response.status(404).end();
    let source = allowedUrl(documentUrl);
    if (!source) return response.status(403).json({ error: { code: 'DOCUMENT_HOST_NOT_ALLOWED', message: 'The document host is not allowed.' } });
    const signal = AbortSignal.timeout(20000);
    let upstream;
    try {
      // Validate every redirect rather than letting fetch leave the allowed hosts.
      for (let redirects = 0; redirects <= 5; redirects++) {
        upstream = await fetchDocument(source.href, { redirect: 'manual', signal });
        if (![301, 302, 303, 307, 308].includes(upstream.status)) break;
        const location = upstream.headers.get('location');
        await upstream.body?.cancel();
        source = location ? allowedUrl(new URL(location, source).href) : null;
        if (!source) return response.status(403).json({ error: { code: 'DOCUMENT_HOST_NOT_ALLOWED', message: 'The document redirect is not allowed.' } });
      }
      if (!upstream?.ok) return response.status(502).json({ error: { code: 'DOCUMENT_UNAVAILABLE', message: 'The source document is currently unavailable.' } });
      const document = prepareDocument(Buffer.from(await upstream.arrayBuffer()), upstream.headers.get('content-type'), source.href);
      if (!document) return response.status(415).json({ error: { code: 'UNSUPPORTED_DOCUMENT', message: 'The source document must be PDF or HTML.' } });
      response.setHeader('Content-Type', document.contentType);
      response.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(request.params.projectId)}.${document.extension}"`);
      response.setHeader('Cache-Control', 'no-store');
      const ancestors = `frame-ancestors 'self' ${frontendOrigins.join(' ')};`;
      response.setHeader('Content-Security-Policy', document.extension === 'html'
        ? `${ancestors} sandbox allow-popups allow-popups-to-escape-sandbox; default-src 'none'; style-src 'unsafe-inline' https:; img-src https: data:; font-src https: data:; frame-src https:; base-uri https:; form-action 'none';`
        : ancestors);
      response.removeHeader('X-Frame-Options');
      response.removeHeader('Cross-Origin-Opener-Policy');
      return response.send(document.data);
    } catch {
      return response.status(502).json({ error: { code: 'DOCUMENT_UNAVAILABLE', message: 'The source document is currently unavailable.' } });
    }
  };
}
