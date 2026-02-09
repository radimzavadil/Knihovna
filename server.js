const http = require("http");
const { handleApiBooks } = require("./routes/apiBooks");
const { handlePages } = require("./routes/pages");

const server = http.createServer((req, res) => {
  // 1) API
  const apiHandled = handleApiBooks(req, res);
  if (apiHandled !== false) return;

  // 2) Pages + public
  const pageHandled = handlePages(req, res);
  if (pageHandled !== false) return;

  // 3) fallback 404
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not Found");
});

server.listen(3000, () => {
  console.log("Server běžící na http://localhost:3000");
});
