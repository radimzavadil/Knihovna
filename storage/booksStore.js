const fs = require("fs");
const path = require("path");

const BOOKS_FILE = path.join(__dirname, "..", "data", "books.json");

function loadBooks() {
  try {
    if (!fs.existsSync(BOOKS_FILE)) return [];
    const raw = fs.readFileSync(BOOKS_FILE, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.log("❌ Chyba při čtení books.json:", e.message);
    return [];
  }
}

function saveBooks(books) {
  fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2), "utf-8");
}

function getAll() {
  return loadBooks();
}

function getById(id) {
  const books = loadBooks();
  return books.find((b) => b.id === id) || null;
}

function create({ title, author, image }) {
  const books = loadBooks();
  const newId = books.length ? Math.max(...books.map((b) => b.id)) + 1 : 1;
  const book = {
    id: newId,
    title,
    author,
    image,
    status: "NOVÁ"
  };
  books.push(book);
  saveBooks(books);
  return book;
}

function update(id, patch) {
  const books = loadBooks();
  const idx = books.findIndex((b) => b.id === id);
  if (idx === -1) return null;

  if (patch.title !== undefined) books[idx].title = patch.title;
  if (patch.author !== undefined) books[idx].author = patch.author;
  if (patch.image !== undefined) books[idx].image = patch.image;
  if (patch.status !== undefined) books[idx].status = patch.status;

  saveBooks(books);
  return books[idx];
}

function remove(id) {
  const books = loadBooks();
  const idx = books.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  const removed = books.splice(idx, 1)[0];
  saveBooks(books);
  return removed;
}

module.exports = { getAll, getById, create, update, remove };
