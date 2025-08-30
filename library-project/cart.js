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

function confirmOrder() {
  if (cart.length === 0) {
    alert('Giỏ sách trống!');
    return;
  }
  alert(`Bạn đã mượn ${cart.length} loại sách!`);
  cart = [];
  saveCart();
  renderCart();
}

renderCart();
