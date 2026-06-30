import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";

const ROOT = process.cwd();
const PORT = Number(process.env.PORT) || 4318;
const TYPES = { ".html":"text/html", ".css":"text/css", ".js":"text/javascript",
  ".json":"application/json", ".svg":"image/svg+xml", ".png":"image/png", ".ico":"image/x-icon",
  ".mp4":"video/mp4", ".webm":"video/webm", ".mov":"video/quicktime", ".jpg":"image/jpeg", ".jpeg":"image/jpeg",
  ".webp":"image/webp", ".glb":"model/gltf-binary", ".gltf":"model/gltf+json", ".ifc":"application/octet-stream", ".dxf":"application/dxf" };

createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p === "/" || p.endsWith("/")) p += "index.html";
    const file = normalize(join(ROOT, p));
    if (file !== ROOT && !file.startsWith(ROOT + sep)) { res.writeHead(403).end("Forbidden"); return; }
    const st = await stat(file);
    if (!st.isFile()) { res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found"); return; }

    const total = st.size;
    const base = {
      "Content-Type": TYPES[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store, must-revalidate",
      "Accept-Ranges": "bytes"                      // <-- tells the browser the resource is seekable
    };

    // HTTP Range support — required so <video> can seek (otherwise it snaps to 0)
    const range = req.headers.range;
    const m = range && /^bytes=(\d*)-(\d*)$/.exec(range);
    if (m) {
      let start = m[1] === "" ? null : parseInt(m[1], 10);
      let end   = m[2] === "" ? null : parseInt(m[2], 10);
      if (start === null) { start = Math.max(0, total - (end || 0)); end = total - 1; }   // suffix bytes=-N
      else if (end === null || end >= total) { end = total - 1; }
      if (start > end || start >= total) {
        res.writeHead(416, { ...base, "Content-Range": `bytes */${total}` }).end();
        return;
      }
      res.writeHead(206, { ...base, "Content-Range": `bytes ${start}-${end}/${total}`, "Content-Length": end - start + 1 });
      if (req.method === "HEAD") { res.end(); return; }
      createReadStream(file, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, { ...base, "Content-Length": total });
    if (req.method === "HEAD") { res.end(); return; }
    createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
  }
}).listen(PORT, () => console.log(`Sthyra CPM static server (Range-enabled) → http://localhost:${PORT}`));
