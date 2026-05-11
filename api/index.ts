import { promises as fs } from "fs";
import path from "path";
import server from "../dist/server/server.js";

function getMimeType(filePath: string) {
  switch (path.extname(filePath).toLowerCase()) {
    case ".css":
      return "text/css";
    case ".js":
      return "application/javascript";
    case ".json":
      return "application/json";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".svg":
      return "image/svg+xml";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".ico":
      return "image/x-icon";
    case ".woff2":
      return "font/woff2";
    case ".woff":
      return "font/woff";
    case ".ttf":
      return "font/ttf";
    default:
      return "application/octet-stream";
  }
}

async function tryServeStaticFile(pathname: string) {
  const publicDir = path.join(process.cwd(), "public");
  const safePath = pathname.replace(/^\//, "");
  const filePath = path.join(publicDir, safePath);
  const normalized = path.normalize(filePath);

  if (!normalized.startsWith(publicDir + path.sep) && normalized !== publicDir) {
    return null;
  }

  try {
    const stat = await fs.stat(normalized);
    if (!stat.isFile()) return null;
    const body = await fs.readFile(normalized);
    return new Response(body, {
      status: 200,
      headers: {
        "content-type": getMimeType(normalized),
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return null;
  }
}

export default async function handler(req: any, res: any) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host ?? "localhost";
  const url = new URL(req.url ?? "", `${proto}://${host}`);

  const staticResponse = await tryServeStaticFile(url.pathname);
  if (staticResponse) {
    staticResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    res.statusCode = staticResponse.status;
    const body = await staticResponse.arrayBuffer();
    res.end(Buffer.from(body));
    return;
  }

  const request = new Request(url.toString(), {
    method: req.method,
    headers: req.headers as HeadersInit,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : req,
  });

  const response = await server.fetch(request, undefined, undefined);
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  res.statusCode = response.status;
  const body = await response.arrayBuffer();
  res.end(Buffer.from(body));
}
