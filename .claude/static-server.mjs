import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const ROOT = process.cwd();
const PORT = Number(process.env.PORT) || 4318;
const TYPES = { ".html":"text/html", ".css":"text/css", ".js":"text/javascript",
  ".json":"application/json", ".svg":"image/svg+xml", ".png":"image/png", ".ico":"image/x-icon",
  ".mp4":"video/mp4", ".webm":"video/webm", ".jpg":"image/jpeg", ".jpeg":"image/jpeg",
  ".webp":"image/webp", ".glb":"model/gltf-binary", ".gltf":"model/gltf+json" };

createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p === "/" || p.endsWith("/")) p += "index.html";
    const file = normalize(join(ROOT, p));
    if (!file.startsWith(ROOT)) { res.writeHead(403).end("Forbidden"); return; }
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream", "Cache-Control": "no-store, must-revalidate" });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
  }
}).listen(PORT, () => console.log(`Sthyra CPM static server → http://localhost:${PORT}`));
