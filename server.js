import { createServer } from "node:http";
import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { extname, join, resolve } from "node:path";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const HOST = "0.0.0.0";
const ROOT = resolve(new URL(".", import.meta.url).pathname);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function getFilePath(urlPath) {
  const safePath = urlPath.split("?")[0].split("#")[0];
  const targetPath = safePath === "/" ? "/index.html" : safePath;
  return join(ROOT, targetPath);
}

const server = createServer(async (req, res) => {
  try {
    const filePath = getFilePath(req.url || "/");
    const fileStat = await stat(filePath);

    if (fileStat.isDirectory()) {
      res.writeHead(302, { Location: "/" });
      res.end();
      return;
    }

    const ext = extname(filePath).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    createReadStream(filePath).pipe(res);
  } catch (error) {
    if (error.code === "ENOENT") {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("未找到资源");
      return;
    }

    console.error("Serve error", error);
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("服务器内部错误");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Static site is running at http://${HOST}:${PORT}`);
});
