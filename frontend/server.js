import express from "express";

const app = express();

// EJS ayarı
app.set("view engine", "ejs");
app.set("views", "./views");

// Formdan gelen veriyi almak için
app.use(express.urlencoded({ extended: true }));

// Django API adresi
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000/api/todos";

// Ana sayfa: Djangodan todoları çek, EJS ile HTML bas
app.get("/", async (req, res) => {
  try {
    const r = await fetch(BACKEND_URL);
    if (!r.ok) throw new Error(`Backend status: ${r.status}`);
    const todos = await r.json();
    res.render("index", { todos });
  } catch (err) {
    res.status(500).send("Can't reach Backend: " + err.message);
  }
});

// Form Submit: Djangoya POST at sonra tekrar ana sayfaya dön
app.post("/add", async (req, res) => {
  const title = (req.body.title || "").trim();
  if (!title) return res.redirect("/");

  try {
    const r = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (!r.ok) {
      const text = await r.text();
      throw new Error(`Backend status: ${r.status} body: ${text}`);
    }

    res.redirect("/");
  } catch (err) {
    res.status(500).send("Can't reach Backend while adding TODO: " + err.message);
  }
});

app.listen(3000, () => {
  console.log("Frontend running: http://localhost:3000");
});
