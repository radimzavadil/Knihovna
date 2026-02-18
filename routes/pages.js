const fs = require("fs");
const path = require("path");
const store = require("../storage/booksStore");

const VIEWS_DIR = path.join(__dirname, "..", "views");

function loadView(name) {
  return fs.readFileSync(path.join(VIEWS_DIR, name), "utf-8");
}

function render(template, vars) {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{{${k}}}`, String(v));
  }
  return out;
}

function renderLayout({ title, heading, content }) {
  const layout = loadView("layout.html");
  return render(layout, { title, heading, content });
}

function sendHtml(res, html, status = 200) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function handlePages(req, res) {
  // GET /public/app.js
  if (req.url === "/public/app.js" && req.method === "GET") {
    const file = path.join(__dirname, "..", "public", "app.js");
    const js = fs.readFileSync(file, "utf-8");
    res.writeHead(200, { "Content-Type": "application/javascript; charset=utf-8" });
    return res.end(js);
  }

  // GET /
  if (req.url === "/" && req.method === "GET") {
    const books = store.getAll();

    const cards = books.map(b => `
    <div class="book-card">
      <a href="/book/${b.id}" class="book-cover-link">
        <img src="${b.image}" alt="${b.title}" class="book-cover">
      </a>
      <div class="book-footer">
        <span class="status-tag">${b.status}</span>
        <button class="three-dots-btn" onclick="deleteBook(${b.id})" title="Smazat">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="19" cy="12" r="1"></circle>
            <circle cx="5" cy="12" r="1"></circle>
          </svg>
        </button>
      </div>
    </div>
  `).join("");

    const indexTpl = loadView("index.html");
    const content = render(indexTpl, {
      results: cards || `<p>Žádné knihy v databázi.</p>`
    });

    return sendHtml(
      res,
      renderLayout({
        title: "Library",
        heading: "Library",
        content
      })
    );
  }

  // GET /book/:id (detail)
  if (req.url.startsWith("/book/") && req.method === "GET") {
    const id = Number(req.url.split("/")[2]);
    const book = store.getById(id);
    if (!book) {
      const errTpl = loadView("error.html");
      const content = render(errTpl, { message: "Kniha nenalezena." });
      return sendHtml(res, renderLayout({ title: "Chyba", heading: "Chyba", content }), 404);
    }

    const tpl = loadView("bookDetail.html");
    const content = render(tpl, book);
    return sendHtml(res, renderLayout({ title: "Detail knihy", heading: "Detail knihy", content }));
  }

  // GET /edit/:id (edit formulář)
  if (req.url.startsWith("/edit/") && req.method === "GET") {
    const id = Number(req.url.split("/")[2]);
    const book = store.getById(id);

    if (!book) {
      const errTpl = loadView("error.html");
      const content = render(errTpl, { message: "Kniha nenalezena." });
      return sendHtml(res, renderLayout({ title: "Chyba", heading: "Chyba", content }), 404);
    }

    const tpl = loadView("bookEdit.html");
    const content = render(tpl, book);
    return sendHtml(res, renderLayout({ title: "Editace knihy", heading: "Editace knihy", content }));
  }

  // GET /vybrat
  if (req.url === "/vybrat" && req.method === "GET") {
    const content = loadView("vybrat.html");
    return sendHtml(
      res,
      renderLayout({
        title: "Vybrat knihu",
        heading: "Hledej v Open Library",
        content
      })
    );
  }

  return false;
}

module.exports = { handlePages };
