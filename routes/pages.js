const fs = require("fs");
const path = require("path");
const store = require("../storage/usersStore");

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
    <div style="border: 1px solid #ccc; padding: 10px; margin: 10px; display: inline-block; width: 200px; vertical-align: top;">
      <img src="${b.image}" alt="${b.title}" style="width: 100%; height: auto; margin-bottom: 10px;">
      <h3>${b.title}</h3>
      <p>${b.author}</p>
      <button onclick="deleteBook(${b.id})">Smazat</button>
    </div>
  `).join("");

    const indexTpl = loadView("index.html");
    const content = render(indexTpl, {
      results: cards || `<p>Žádné knihy v databázi.</p>`
    });

    return sendHtml(
      res,
      renderLayout({
        title: "Moje Knihovna",
        heading: "Moje Knihy",
        content
      })
    );
  }


  // GET /user/:id (detail)
  if (req.url.startsWith("/user/") && req.method === "GET") {
    const id = Number(req.url.split("/")[2]);
    const user = store.getById(id);
    if (!user) {
      const errTpl = loadView("error.html");
      const content = render(errTpl, { message: "Uživatel nenalezen." });
      return sendHtml(res, renderLayout({ title: "Chyba", heading: "Chyba", content }), 404);
    }

    const tpl = loadView("detail.html");
    const content = render(tpl, user);
    return sendHtml(res, renderLayout({ title: "Detail", heading: "Detail uživatele", content }));
  }

  // GET /edit/:id (edit formulář)
  if (req.url.startsWith("/edit/") && req.method === "GET") {
    const id = Number(req.url.split("/")[2]);
    const user = store.getById(id);

    if (!user) {
      const errTpl = loadView("error.html");
      const content = render(errTpl, { message: "Uživatel nenalezen." });
      return sendHtml(res, renderLayout({ title: "Chyba", heading: "Chyba", content }), 404);
    }

    const tpl = loadView("edit.html");
    const content = render(tpl, user);
    return sendHtml(res, renderLayout({ title: "Editace", heading: "Editace uživatele", content }));
  }

  // GET /vybrat
  if (req.url === "/vybrat" && req.method === "GET") {
    const content = loadView("vybrat.html");
    return sendHtml(
      res,
      renderLayout({
        title: "Vybrat knihu",
        heading: "Hledej v Google Books",
        content
      })
    );
  }

  return false;
}

module.exports = { handlePages };
