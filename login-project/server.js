const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();

// =====================
// Kết nối MongoDB Atlas
// =====================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Đã kết nối MongoDB Atlas thành công!"))
  .catch(err => console.error("❌ Lỗi kết nối MongoDB:", err));

// =====================
// Schema + Model
// =====================
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// =====================
// Middleware
// =====================
app.use(bodyParser.urlencoded({ extended: true }));

// Phục vụ static files login-project/public
app.use(express.static(path.join(__dirname, 'public')));

// Phục vụ static files library-project
app.use('/library', express.static(path.join(__dirname, '../library-project')));

// =====================
// Routes
// =====================

// Trang đăng ký
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Trang đăng nhập
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Xử lý đăng ký
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existing = await User.findOne({ username });
    if (existing) {
      return res.send('Tên người dùng đã tồn tại. <a href="/login">Đăng nhập</a>');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.redirect('/library/library.html'); // chuyển sang thư viện
  } catch (err) {
    res.send('Lỗi đăng ký: ' + err.message);
  }
});

// Xử lý đăng nhập
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      res.redirect('/library/library.html');
    } else {
      res.send('Sai tài khoản hoặc mật khẩu. <a href="/login">Thử lại</a>');
    }
  } catch (err) {
    res.send('Lỗi đăng nhập: ' + err.message);
  }
});

// Trang giỏ hàng
app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, '../library-project/cart.html'));
});

// =====================
// Khởi động server
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
