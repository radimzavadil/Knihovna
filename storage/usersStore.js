const fs = require("fs");
const path = require("path");

const USERS_FILE = path.join(__dirname, "..", "data", "users.json");

function loadUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, "utf-8");
    const data = JSON.parse(raw);

    if (!Array.isArray(data)) {
      return [];
    }
    return data;
  } catch (e) {
    console.log("❌ Chyba při čtení/parsu users.json:", e.message);
    return [];
  }
}



function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

function getAll() {
  return loadUsers();
}

function getById(id) {
  const users = loadUsers();
  return users.find((u) => u.id === id) || null;
}

function create({ title, author, image }) {
  const books = loadUsers();
  const newId = books.length ? Math.max(...books.map((b) => b.id)) + 1 : 1;
  const book = { id: newId, title, author, image };
  books.push(book);
  saveUsers(books);
  return book;
}

function update(id, patch) {
  const books = loadUsers();
  const idx = books.findIndex((b) => b.id === id);
  if (idx === -1) return null;

  if (patch.title !== undefined) books[idx].title = patch.title;
  if (patch.author !== undefined) books[idx].author = patch.author;
  if (patch.image !== undefined) books[idx].image = patch.image;

  saveUsers(books);
  return books[idx];
}

function remove(id) {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  const removed = users.splice(idx, 1)[0];
  saveUsers(users);
  return removed;
}


module.exports = { getAll, getById, create, update, remove };
