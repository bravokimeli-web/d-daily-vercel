import server from "../dist/server/server.js";

export default async function handler(req: any, res: any) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host ?? "localhost";
  const url = new URL(req.url ?? "", `${proto}://${host}`);

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
