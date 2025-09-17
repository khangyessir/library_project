let cart = JSON.parse(localStorage.getItem('cart')) || [];

function renderCart() {
  const cartList = document.getElementById('cart-list');
  cartList.innerHTML = '';

  cart.forEach((item, index) => {
    cartList.innerHTML += `
      <div class="cart-item">
        <img src="${item.cover}" alt="${item.title}">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-author">Tác giả: ${item.author}</div>
        </div>
        <div class="quantity-controls">
          <button onclick="changeQuantity(${index}, -1)">-</button>
          <span>${item.quantity || 1}</span>
          <button onclick="changeQuantity(${index}, 1)">+</button>
        </div>
        <div class="remove-btn" onclick="removeItem(${index})">Xóa</div>
      </div>
    `;
  });
}

function changeQuantity(index, delta) {
  if (!cart[index].quantity) cart[index].quantity = 1;
  cart[index].quantity += delta;
  if (cart[index].quantity < 1) cart[index].quantity = 1;
  saveCart();
  renderCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

async function confirmOrder() {
  if (cart.length === 0) {
    alert('Giỏ sách trống!');
    return;
  }

  try {
    // Gửi từng sách trong giỏ lên server
    for (let book of cart) {
      const payload = {
        order_id: book.character,   // lấy ký hiệu a, b, c... từ books.json
        book: book.title,           // tên sách
        shelf: book.shelf || "A1",   // mặc định để demo
        floor: book.floor
      };

      await fetch('/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    alert(`✅ Bạn đã mượn ${cart.length} loại sách!`);

    // Reset giỏ hàng
    cart = [];
    saveCart();
    renderCart();

  } catch (err) {
    console.error("❌ Lỗi khi gửi dữ liệu:", err);
    alert("Có lỗi xảy ra khi gửi thông tin mượn sách.");
  }
}

renderCart();
