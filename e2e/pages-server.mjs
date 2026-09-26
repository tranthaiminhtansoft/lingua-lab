import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, relative, resolve } from 'node:path';

const basePath = '/lingua-lab';
const distPath = resolve('dist');
const port = Number(process.env.PORT ?? '4176');
const contentTypes = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
};

function isWithinDist(path) {
  const pathFromDist = relative(distPath, path);
  return !pathFromDist.startsWith('..') && !pathFromDist.includes('../');
}

async function resolvePage(pathname) {
  const requestedPath = pathname.startsWith(`${basePath}/`) ? pathname.slice(basePath.length) : '/404.html';
  let filePath = resolve(distPath, `.${requestedPath}`);

  if (!isWithinDist(filePath)) return { filePath: resolve(distPath, '404.html'), statusCode: 404 };

  try {
    if ((await stat(filePath)).isDirectory()) filePath = resolve(filePath, 'index.html');
    return { filePath, statusCode: 200 };
  } catch {
    return { filePath: resolve(distPath, '404.html'), statusCode: 404 };
  }
}

createServer(async (request, response) => {
  const { filePath, statusCode } = await resolvePage(new URL(request.url ?? '/', `http://${request.headers.host}`).pathname);
  const body = await readFile(filePath);
  response.writeHead(statusCode, { 'content-type': contentTypes[extname(filePath)] ?? 'application/octet-stream' });
  response.end(body);
}).listen(port, '127.0.0.1');
