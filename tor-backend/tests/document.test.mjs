import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import helmet from 'helmet';
import { createDocumentHandler, prepareDocument } from '../src/controllers/document.controller.mjs';

const source = 'https://process.gprocurement.go.th/egp/announcement.html?id=00123&stage=D0';

test('PDF bytes take precedence over incorrect or missing upstream MIME headers', () => {
  const bytes = Buffer.from('%PDF-1.7\noriginal bytes');
  for (const type of [null, 'application/octet-stream', 'text/html']) {
    const document = prepareDocument(bytes, type, source);
    assert.equal(document.contentType, 'application/pdf');
    assert.equal(document.extension, 'pdf');
    assert.deepEqual(document.data, bytes);
  }
});

test('HTML keeps Thai text and resolves relative assets from the upstream URL', () => {
  const html = '<html><head><meta charset="utf-8"><base href="https://wrong.example/"></head><body>ประกาศโครงการ<img src="images/logo.png"><a href="file.pdf">เอกสาร</a></body></html>';
  const document = prepareDocument(Buffer.from(html), 'text/html; charset=utf-8', source);
  assert.equal(document.extension, 'html');
  assert.equal(document.contentType, 'text/html; charset=utf-8');
  const result = document.data.toString('utf8');
  assert.match(result, /ประกาศโครงการ/);
  assert.match(result, /<base href="https:\/\/process.gprocurement.go.th\/egp\/announcement.html\?id=00123&amp;stage=D0" target="_blank">/);
  assert.doesNotMatch(result, /wrong.example/);
  assert.equal((result.match(/<base /g) || []).length, 1);
  const thai = prepareDocument(Buffer.concat([Buffer.from('<html><head><meta charset="windows-874"></head><body>'), Buffer.from([0xa1]), Buffer.from('</body></html>')]), 'text/html', source);
  assert.match(thai.data.toString('utf8'), /ก/);
  assert.doesNotMatch(thai.data.toString('utf8'), /windows-874/);
  assert.equal(prepareDocument(Buffer.from('not a document'), 'application/octet-stream', source), null);
});

test('preview and download routes serve both formats with compatible frame headers', async t => {
  const app = express();
  app.use(helmet());
  const dependencies = {
    findProject: async id => ({ documentUrl: source.replace('00123', id) }),
    frontendOrigins: ['http://localhost:3000'],
    fetchDocument: async url => new Response(url.includes('pdf-id') ? '%PDF-1.7\nfixture' : '<html><body>HTML fixture</body></html>', { headers: { 'content-type': url.includes('pdf-id') ? 'application/octet-stream' : 'text/html' } })
  };
  app.get('/preview/:projectId', createDocumentHandler(dependencies));
  app.get('/download/:projectId', createDocumentHandler({ ...dependencies, disposition: 'attachment' }));
  const server = await new Promise(resolve => { const listener = app.listen(0, '127.0.0.1', () => resolve(listener)); });
  t.after(() => { server.closeAllConnections(); server.close(); });
  for (const route of ['preview', 'download']) {
    for (const [id, extension, type] of [['00123', 'html', 'text/html; charset=utf-8'], ['pdf-id', 'pdf', 'application/pdf']]) {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/${route}/${id}`);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), type);
      assert.equal(response.headers.get('content-disposition'), `${route === 'download' ? 'attachment' : 'inline'}; filename="${id}.${extension}"`);
      assert.equal(response.headers.get('x-frame-options'), null);
      const policy = response.headers.get('content-security-policy');
      assert.match(policy, /frame-ancestors 'self' http:\/\/localhost:3000/);
      if (extension === 'html') { assert.match(policy, /sandbox/); assert.doesNotMatch(policy, /allow-scripts|allow-same-origin/); }
      else assert.doesNotMatch(policy, /sandbox/);
      await response.arrayBuffer();
    }
  }
});

test('disallowed redirects and unavailable upstream documents return useful errors', async () => {
  const record = () => ({ code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; }, end() {} });
  let calls = 0;
  const unsafe = createDocumentHandler({ findProject: async () => ({ documentUrl: source }), fetchDocument: async () => {
    calls++; return new Response(null, { status: 302, headers: { location: 'http://127.0.0.1/private' } });
  } });
  const denied = record(); await unsafe({ params: { projectId: '00123' } }, denied);
  assert.equal(denied.code, 403); assert.equal(calls, 1);
  const unavailable = record();
  await createDocumentHandler({ findProject: async () => ({ documentUrl: source }), fetchDocument: async () => { throw new Error('timeout'); } })({ params: { projectId: '00123' } }, unavailable);
  assert.equal(unavailable.code, 502);
  assert.equal(unavailable.body.error.code, 'DOCUMENT_UNAVAILABLE');
});

test('legacy e-GP HTTP links are upgraded to HTTPS before fetching', async () => {
  let fetchedUrl;
  const response = { status() { return this; }, json() {}, end() {}, setHeader() {}, removeHeader() {}, send() {} };
  await createDocumentHandler({ findProject: async () => ({ url: 'http://process.gprocurement.go.th/legacy.html' }),
    fetchDocument: async url => { fetchedUrl = url; return new Response('<html><body>Legacy announcement</body></html>', { headers: { 'content-type': 'text/html' } }); }
  })({ params: { projectId: 'P69100024855' } }, response);
  assert.equal(fetchedUrl, 'https://process.gprocurement.go.th/legacy.html');
});
