import type { FSWatcher, Stats } from "node:fs";
import { watch } from "node:fs";
import fs from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);
const SRC_DIR: string = path.join(__dirname, "src");
const ROOT_DIR: string = path.join(__dirname);

const PORT: number = Number(process.env.PORT) || 3000;
const HOST: string = process.env.HOST || "localhost";
const ENABLE_LIVE_RELOAD: boolean = process.env.LIVE_RELOAD !== "false";

// Track SSE clients for live reload
const sseClients = new Set<ServerResponse>();

const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER_ERROR: 500,
} as const;

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".otf": "font/otf",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".pdf": "application/pdf",
};

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Check if resolved path is within the base directory
 */
function isPathSafe(resolvedPath: string, baseDir: string): boolean {
  const relative = path.relative(baseDir, resolvedPath);
  return !relative.startsWith("..") && !path.isAbsolute(relative);
}

/**
 * Get file stats safely
 */
async function getFileStat(filePath: string): Promise<Stats | null> {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
}

/**
 * Serve a file with appropriate headers
 */
async function serveFile(
  filePath: string,
  res: http.ServerResponse,
  method: string,
): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || "application/octet-stream";
    let content = await fs.readFile(filePath);

    // Inject live reload script into HTML files
    if (ENABLE_LIVE_RELOAD && ext === ".html") {
      const htmlContent = content.toString("utf-8");
      const liveReloadScript = `
<script>
(function() {
  const eventSource = new EventSource('/__live_reload');
  eventSource.onmessage = (e) => {
    if (e.data === 'reload') {
      console.log('[Live Reload] Changes detected, reloading...');
      location.reload();
    }
  };
  eventSource.onerror = () => {
    eventSource.close();
    setTimeout(() => location.reload(), 1000);
  };
  console.log('[Live Reload] Connected');
})();
</script>`;

      // Inject before closing </body> or </html> tag
      const injected =
        htmlContent.replace(/<\/body>/i, `${liveReloadScript}</body>`) ||
        htmlContent.replace(/<\/html>/i, `${liveReloadScript}</html>`) ||
        htmlContent + liveReloadScript;

      content = Buffer.from(injected, "utf-8");
    }

    const headers: http.OutgoingHttpHeaders = {
      "Content-Type": mimeType,
      "Content-Length": content.length,
      "Cache-Control": "no-cache",
      "Last-Modified": stats.mtime.toUTCString(),
    };

    res.writeHead(HTTP_STATUS.OK, headers);

    // For HEAD requests, don't send body
    if (method === "HEAD") {
      res.end();
      return true;
    }

    res.end(content);
    return true;
  } catch (error) {
    console.error(`Error serving file ${filePath}:`, error);
    return false;
  }
}

/**
 * Serve 404 error page
 */
async function serve404(
  res: http.ServerResponse,
  pathname: string,
  method: string,
): Promise<void> {
  const notFoundPath = path.join(SRC_DIR, "404.html");
  const stats = await getFileStat(notFoundPath);

  if (stats?.isFile()) {
    const content = await fs.readFile(notFoundPath, "utf-8");
    // Replace placeholder with actual path
    const html = content.replace("{{pathname}}", escapeHtml(pathname));

    res.writeHead(HTTP_STATUS.NOT_FOUND, {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Length": Buffer.byteLength(html),
    });

    if (method !== "HEAD") {
      res.end(html);
    } else {
      res.end();
    }
  } else {
    // Fallback if 404.html doesn't exist
    const fallback = `<!DOCTYPE html>
<html><head><title>404 - Not Found</title></head>
<body><h1>404 - Not Found</h1><p>${escapeHtml(pathname)}</p></body></html>`;

    res.writeHead(HTTP_STATUS.NOT_FOUND, {
      "Content-Type": "text/html; charset=utf-8",
    });

    if (method !== "HEAD") {
      res.end(fallback);
    } else {
      res.end();
    }
  }
}

const server = http.createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    const startTime = Date.now();
    const method = req.method || "GET";

    // Only allow GET and HEAD methods
    if (method !== "GET" && method !== "HEAD") {
      res.writeHead(HTTP_STATUS.METHOD_NOT_ALLOWED, {
        "Content-Type": "text/plain",
        Allow: "GET, HEAD",
      });
      res.end("Method Not Allowed");
      logRequest(
        method,
        req.url || "/",
        HTTP_STATUS.METHOD_NOT_ALLOWED,
        Date.now() - startTime,
      );
      return;
    }

    try {
      const url = new URL(req.url || "/", `http://${req.headers.host}`);
      let pathname = decodeURIComponent(url.pathname);

      // Handle SSE endpoint for live reload
      if (ENABLE_LIVE_RELOAD && pathname === "/__live_reload") {
        res.writeHead(HTTP_STATUS.OK, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
        });
        res.write("data: connected\n\n");
        sseClients.add(res);

        req.on("close", () => {
          sseClients.delete(res);
        });

        logRequest(method, pathname, HTTP_STATUS.OK, Date.now() - startTime);
        return;
      }

      // Normalize and remove leading slash
      pathname = path.normalize(pathname);
      if (pathname.startsWith("/")) {
        pathname = pathname.slice(1);
      }

      // Default to index.html for root path
      if (pathname === "" || pathname === ".") {
        pathname = "index.html";
      }

      // Resolve path (try src first, then fallback to project root if missing)
      let filePath = path.resolve(SRC_DIR, pathname);
      let baseDir = SRC_DIR;

      const resolveSafePath = (targetPath: string, base: string) => {
        if (!isPathSafe(targetPath, base)) return null;
        return targetPath;
      };

      let stats = null;

      const tryPath = resolveSafePath(filePath, baseDir);
      if (tryPath) {
        const found = await getFileStat(tryPath);
        if (found) {
          stats = found;
          filePath = tryPath;
        }
      }

      if (!stats) {
        const rootPath = resolveSafePath(
          path.resolve(ROOT_DIR, pathname),
          ROOT_DIR,
        );
        if (rootPath) {
          const rootStats = await getFileStat(rootPath);
          if (rootStats) {
            filePath = rootPath;
            baseDir = ROOT_DIR;
            stats = rootStats;
          }
        }
      }

      if (stats) {
        if (stats.isDirectory()) {
          // Try to serve index.html from directory
          const indexPath = path.join(filePath, "index.html");
          const indexStats = await getFileStat(indexPath);

          if (indexStats?.isFile()) {
            const success = await serveFile(indexPath, res, method);
            if (success) {
              logRequest(
                method,
                pathname,
                HTTP_STATUS.OK,
                Date.now() - startTime,
              );
              return;
            }
          }

          // Directory without index.html
          res.writeHead(HTTP_STATUS.FORBIDDEN, {
            "Content-Type": "text/plain",
          });
          res.end("Forbidden");
          logRequest(
            method,
            pathname,
            HTTP_STATUS.FORBIDDEN,
            Date.now() - startTime,
          );
          return;
        }

        if (stats.isFile()) {
          const success = await serveFile(filePath, res, method);
          if (success) {
            logRequest(
              method,
              pathname,
              HTTP_STATUS.OK,
              Date.now() - startTime,
            );
            return;
          }
        }
      }

      const ext = path.extname(pathname);
      if (!stats && (!ext || ext === "")) {
        const indexPath = path.join(SRC_DIR, "index.html");
        const indexExists = await getFileStat(indexPath);
        if (indexExists?.isFile()) {
          const success = await serveFile(indexPath, res, method);
          if (success) {
            logRequest(
              method,
              pathname,
              HTTP_STATUS.OK,
              Date.now() - startTime,
            );
            return;
          }
        }
      }

      if (!stats) {
        res.writeHead(HTTP_STATUS.NOT_FOUND, {
          "Content-Type": "text/plain",
        });
        res.end("Not Found");
        logRequest(
          method,
          pathname,
          HTTP_STATUS.NOT_FOUND,
          Date.now() - startTime,
        );
        return;
      }

      // File not found - serve 404.html
      await serve404(res, pathname, method);
      logRequest(
        method,
        pathname,
        HTTP_STATUS.NOT_FOUND,
        Date.now() - startTime,
      );
    } catch (error) {
      console.error("Server error:", error);
      res.writeHead(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        "Content-Type": "text/plain",
      });
      res.end("Internal Server Error");
      logRequest(
        method,
        req.url || "/",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        Date.now() - startTime,
      );
    }
  },
);

/**
 * Log HTTP request with colored output
 */
function logRequest(
  method: string,
  path: string,
  status: number,
  duration: number,
): void {
  const statusColor =
    status >= 500
      ? "\x1b[31m"
      : status >= 400
        ? "\x1b[33m"
        : status >= 300
          ? "\x1b[36m"
          : "\x1b[32m";
  const reset = "\x1b[0m";
  const timestamp = new Date().toLocaleTimeString();

  console.log(
    `[${timestamp}] ${method} ${path} ${statusColor}${status}${reset} ${duration}ms`,
  );
}

/**
 * Notify all connected SSE clients to reload
 */
function notifyReload(): void {
  if (sseClients.size > 0) {
    console.log(
      `\x1b[35m[Live Reload]\x1b[0m Notifying ${sseClients.size} client(s)`,
    );
    for (const client of sseClients) {
      client.write("data: reload\n\n");
    }
  }
}

/**
 * Setup file watcher for live reload
 */
function setupFileWatcher(): FSWatcher {
  const watcher = watch(SRC_DIR, { recursive: true });
  let reloadTimeout: NodeJS.Timeout | null = null;

  watcher.on("change", (_eventType, filename) => {
    if (!filename) return;

    // Ignore certain files and directories
    const ignored = [
      "node_modules",
      ".git",
      "server.ts",
      "server.js",
      ".DS_Store",
    ];

    if (ignored.some((pattern) => filename.includes(pattern))) {
      return;
    }

    // Debounce reload notifications
    if (reloadTimeout) {
      clearTimeout(reloadTimeout);
    }

    reloadTimeout = setTimeout(() => {
      console.log(`\x1b[35m[Live Reload]\x1b[0m ${filename} changed`);
      notifyReload();
    }, 100);
  });

  return watcher;
}

server.listen(PORT, HOST, () => {
  console.log("\x1b[36m%s\x1b[0m", "🚀 Development Server Started");
  console.log("\x1b[32m%s\x1b[0m", `   Local: http://${HOST}:${PORT}`);

  if (ENABLE_LIVE_RELOAD) {
    setupFileWatcher();
    console.log("\x1b[35m%s\x1b[0m", "   Live Reload: Enabled");
  }

  console.log("\x1b[90m%s\x1b[0m", "\n   Press Ctrl+C to stop\n");
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`\x1b[31mError: Port ${PORT} is already in use\x1b[0m`);
    process.exit(1);
  } else {
    console.error("\x1b[31mServer error:\x1b[0m", error);
    process.exit(1);
  }
});
