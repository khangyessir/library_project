// =====================
// Import modules
// =====================
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcrypt");
const { publishBook } = require("./mqtt-publish");

const app = express();

// =====================
// Middleware
// =====================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/library", express.static(path.join(__dirname, "../library-project")));

// =====================
// MongoDB Atlas
// =====================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Đã kết nối MongoDB Atlas thành công!"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// =====================
// Schema + Model
// =====================
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// =====================
// Routes (Pages)
// =====================
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "register.html"))
);
app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "login.html"))
);
app.get("/library", (req, res) =>
  res.sendFile(path.join(__dirname, "../library-project/library.html"))
);
app.get("/cart", (req, res) =>
  res.sendFile(path.join(__dirname, "../library-project/cart.html"))
);

// Redirect cho link thừa
app.get("/library/library.html", (req, res) => res.redirect("/library"));
app.get("/login.html", (req, res) => res.redirect("/login"));

// =====================
// Auth Routes
// =====================
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const existing = await User.findOne({ username });
    if (existing) {
      return res.send(
        '❌ Tên người dùng đã tồn tại. <a href="/login">Đăng nhập</a>'
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.redirect("/library");
  } catch (err) {
    res.send("❌ Lỗi đăng ký: " + err.message);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.redirect("/library");
    } else {
      res.send('❌ Sai tài khoản hoặc mật khẩu. <a href="/login">Thử lại</a>');
    }
  } catch (err) {
    res.send("❌ Lỗi đăng nhập: " + err.message);
  }
});

// =====================
// MQTT Publish Route
// =====================
app.post("/publish", (req, res) => {
  const { order_id, book, shelf, floor } = req.body;

  if (!order_id || !book || !shelf || !floor) {
    return res.status(400).send("❌ Thiếu order_id, book, shelf hoặc floor");
  }

  const payload = { order_id, book, shelf, floor };

  console.log("📤 Publish payload:", payload);

  // luôn publish vào topic "library/books"
  publishBook("library/books", JSON.stringify(payload));

  res.send("✅ Published thành công!");
});

// =====================
// Server start
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
});
