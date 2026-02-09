const store = require("../storage/booksStore");

function readBodyJson(req, cb) {
  let body = "";
  req.on("data", (ch) => (body += ch));
  req.on("end", () => {
    try {
      cb(null, JSON.parse(body || "{}"));
    } catch (e) {
      cb(e);
    }
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function handleApiBooks(req, res) {
  // GET /api/books – vrátí všechny knihy
  if (req.url === "/api/books" && req.method === "GET") {
    const books = store.getAll();
    return sendJson(res, 200, books);
  }

  // POST /api/books
  if (req.url === "/api/books" && req.method === "POST") {
    return readBodyJson(req, (err, data) => {
      if (err) return sendJson(res, 400, { error: "Neplatný JSON" });

      const title = String(data.title || "").trim();
      const author = String(data.author || "").trim();
      const image = String(data.image || "").trim();

      if (!title) {
        return sendJson(res, 400, { error: "Chybí název knihy" });
      }

      const created = store.create({ title, author, image });
      return sendJson(res, 201, created);
    });
  }

  // PUT /api/books/:id
  if (req.url.startsWith("/api/books/") && req.method === "PUT") {
    const id = Number(req.url.split("/")[3]);
    if (Number.isNaN(id)) return sendJson(res, 400, { error: "Neplatné ID" });

    return readBodyJson(req, (err, data) => {
      if (err) return sendJson(res, 400, { error: "Neplatný JSON" });

      const patch = {};
      if (data.title !== undefined) patch.title = String(data.title).trim();
      if (data.author !== undefined) patch.author = String(data.author).trim();
      if (data.status !== undefined) patch.status = String(data.status).trim();

      const updated = store.update(id, patch);
      if (!updated) return sendJson(res, 404, { error: "Kniha nenalezena" });

      return sendJson(res, 200, updated);
    });
  }

  // DELETE /api/books/:id
  if (req.url.startsWith("/api/books/") && req.method === "DELETE") {
    const id = Number(req.url.split("/")[3]);
    if (Number.isNaN(id)) return sendJson(res, 400, { error: "Neplatné ID" });

    const removed = store.remove(id);
    if (!removed) return sendJson(res, 404, { error: "Kniha nenalezena" });

    return sendJson(res, 200, { message: "Kniha smazána", book: removed });
  }

  return false; // neobslouženo
}

module.exports = { handleApiBooks };
