let books = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Load sách
async function fetchBooks() {
  const res = await fetch('/library-static/books.json');
  books = await res.json();
  displayBooks(books);
  updateCartCount();
}

// Hiển thị sách trong thư viện
function displayBooks(bookList) {
  const container = document.getElementById('bookContainer');
  container.innerHTML = '';
  bookList.forEach(book => {
    container.innerHTML += `
      <div class="book">
        <img src="${book.cover}" alt="${book.title}">
        <h3>${book.title}</h3>
        <p class="author">Tác giả: ${book.author || 'Không rõ'}</p>
        <div class="action-row">
          <div class="quantity-controls-inline">
            <button onclick="changeQuantity('${book.title}', -1)">-</button>
            <span id="qty-${sanitizeTitle(book.title)}">1</span>
            <button onclick="changeQuantity('${book.title}', 1)">+</button>
          </div>
          <button class="borrow-btn" onclick="addToCart('${book.title}')">Mượn</button>
        </div>
      </div>
    `;
  });
}

// Thêm vào giỏ
function addToCart(title) {
  const qty = parseInt(document.getElementById(`qty-${sanitizeTitle(title)}`).innerText);
  const book = books.find(b => b.title === title);
  if (book) {
    let existing = cart.find(item => item.title === title);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({ ...book, quantity: qty });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert(`Đã thêm ${qty} cuốn "${book.title}" vào giỏ.`);
  }
}

// Tăng/giảm số lượng trong Library
function changeQuantity(title, delta) {
  const span = document.getElementById(`qty-${sanitizeTitle(title)}`);
  let current = parseInt(span.innerText);
  current = Math.max(1, current + delta);
  span.innerText = current;
}

// Tăng/giảm số lượng trong Cart
function changeCartQuantity(title, delta) {
  const item = cart.find(b => b.title === title);
  if (item) {
    item.quantity = Math.max(1, item.quantity + delta);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
  }
}

// Hiển thị giỏ hàng
function renderCart() {
  const container = document.getElementById('cart-list');
  container.innerHTML = '';
  cart.forEach(book => {
    container.innerHTML += `
      <div class="cart-item">
        <img src="${book.cover}" alt="${book.title}" width="50">
        <div>
          <strong>${book.title}</strong><br>
          <em>Tác giả: ${book.author || 'Không rõ'}</em>
        </div>
        <div class="quantity-controls">
          <button onclick="changeCartQuantity('${book.title}', -1)">-</button>
          <span>${book.quantity}</span>
          <button onclick="changeCartQuantity('${book.title}', 1)">+</button>
        </div>
        <button onclick="removeFromCart('${book.title}')">Xóa</button>
      </div>
    `;
  });
}

// Xóa khỏi giỏ
function removeFromCart(title) {
  cart = cart.filter(b => b.title !== title);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

// Cập nhật số lượng hiển thị trên icon giỏ
function updateCartCount() {
  const countEl = document.getElementById('cart-count');
  if (countEl) {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    countEl.innerText = total;
  }
}

// Công cụ phụ
function sanitizeTitle(title) {
  return title.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-]/g, '');
}

// Tìm kiếm + sắp xếp
document.getElementById('searchInput')?.addEventListener('input', () => {
  const keyword = document.getElementById('searchInput').value.toLowerCase();
  const filtered = books.filter(book =>
    book.title.toLowerCase().includes(keyword)
  );
  displayBooks(filtered);
});

function sortBooksAZ() {
  const sorted = [...books].sort((a, b) => a.title.localeCompare(b.title));
  displayBooks(sorted);
}

function sortBooksZA() {
  const sorted = [...books].sort((a, b) => b.title.localeCompare(a.title));
  displayBooks(sorted);
}

// Library hoặc Cart page
if (document.getElementById('bookContainer')) {
  fetchBooks();
}
if (document.getElementById('cart-list')) {
  renderCart();
}

// Confirm order
function confirmOrder() {
  if (cart.length === 0) {
    alert('Giỏ sách trống!');
    return;
  }
  alert(`Bạn đã mượn ${cart.reduce((sum, item) => sum + item.quantity, 0)} cuốn sách.`);
  cart = [];
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
  updateCartCount();
}