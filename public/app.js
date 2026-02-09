async function api(path, options) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) throw { status: res.status, data };
  return data;
}

// Funkce pro smazání knihy
async function deleteBook(id) {
  if (!confirm("Opravdu smazat knihu?")) return;

  try {
    await api(`/api/books/${id}`, { method: "DELETE" });
    window.location.href = "/";
  } catch (err) {
    alert("Chyba při mazání: " + (err.data?.error || JSON.stringify(err.data)));
  }
}

// EDITACE KNIHY (PUT /api/books/:id)
document.addEventListener("submit", async (e) => {
  const editForm = e.target.closest("#editForm");
  if (!editForm) return;

  e.preventDefault();
  const id = editForm.dataset.id;
  const fd = new FormData(editForm);
  const payload = {
    title: fd.get("title"),
    author: fd.get("author"),
    status: fd.get("status"),
    image: fd.get("image")
  };

  const msg = document.getElementById("editMsg");
  try {
    await api(`/api/books/${id}`, { method: "PUT", body: JSON.stringify(payload) });
    window.location.href = `/book/${id}`;
  } catch (err) {
    if (msg) msg.textContent = "Chyba: " + (err.data?.error || JSON.stringify(err.data));
    else alert("Chyba při ukládání.");
  }
});
