/* =========================================================
   1. 페이지(메뉴) 전환
   ========================================================= */
const navLinks = document.querySelectorAll(".nav-link, .logo");
const pages = document.querySelectorAll(".page");

function showPage(target) {
  pages.forEach((page) => {
    page.classList.toggle("active", page.id === target);
  });
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.target === target);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.dataset.target;
    if (target) showPage(target);
  });
});

/* =========================================================
   2. 로그인 / 회원가입 버튼 (데모용 알림)
   ========================================================= */
document.getElementById("loginBtn").addEventListener("click", () => {
  alert("로그인 화면으로 이동합니다. (데모)");
});
document.getElementById("signupBtn").addEventListener("click", () => {
  alert("회원가입 화면으로 이동합니다. (데모)");
});

/* =========================================================
   3. 메인 화면 이미지 자동 슬라이드
   ========================================================= */
const slidesEl = document.getElementById("slides");
const dots = document.querySelectorAll(".dot");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const totalSlides = dots.length;
let currentSlide = 0;
let slideTimer = null;

function goToSlide(index) {
  currentSlide = (index + totalSlides) % totalSlides;
  slidesEl.style.transform = `translateX(-${currentSlide * (100 / totalSlides)}%)`;
  dots.forEach((dot, i) => dot.classList.toggle("active", i === currentSlide));
}

function startAutoSlide() {
  slideTimer = setInterval(() => goToSlide(currentSlide + 1), 3500);
}

function resetAutoSlide() {
  clearInterval(slideTimer);
  startAutoSlide();
}

nextBtn.addEventListener("click", () => {
  goToSlide(currentSlide + 1);
  resetAutoSlide();
});

prevBtn.addEventListener("click", () => {
  goToSlide(currentSlide - 1);
  resetAutoSlide();
});

dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    goToSlide(Number(dot.dataset.index));
    resetAutoSlide();
  });
});

goToSlide(0);
startAutoSlide();

/* =========================================================
   4. 상품 목록 데이터 생성 (5개 x 6줄 = 30개)
   ========================================================= */
const PRODUCT_ICONS = ["👕", "🎒", "📓", "🖊️", "☕", "🧢", "🧸", "🔑", "📚", "🍫"];
const PRODUCT_COLORS = [
  "#2f6fed", "#ff7a59", "#2ec4b6", "#a55eea",
  "#ff9f1a", "#26c6da", "#ef476f", "#06d6a0",
  "#5c7cfa", "#f76707",
];

const products = Array.from({ length: 30 }, (_, i) => {
  const idx = i + 1;
  return {
    id: idx,
    name: `학교 굿즈 상품 ${idx}`,
    price: 5000 + (i % 10) * 1500,
    icon: PRODUCT_ICONS[i % PRODUCT_ICONS.length],
    color: PRODUCT_COLORS[i % PRODUCT_COLORS.length],
  };
});

const productGrid = document.getElementById("productGrid");

function renderProducts() {
  productGrid.innerHTML = products
    .map(
      (p) => `
      <div class="product-card">
        <div class="product-thumb" style="background:${p.color}">${p.icon}</div>
        <div class="product-info">
          <div class="product-name">${p.name}</div>
          <div class="product-price">${p.price.toLocaleString()}원</div>
          <button class="product-add-btn" data-id="${p.id}">담기</button>
        </div>
      </div>`
    )
    .join("");
}

renderProducts();

/* =========================================================
   5. 장바구니 로직
   ========================================================= */
const cart = []; // { id, name, price, icon, qty }

const cartListEl = document.getElementById("cartList");
const cartTotalQtyEl = document.getElementById("cartTotalQty");
const cartTotalPriceEl = document.getElementById("cartTotalPrice");

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  renderCart();
}

function changeQty(productId, delta) {
  const item = cart.find((i) => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  renderCart();
}

function removeFromCart(productId) {
  const index = cart.findIndex((i) => i.id === productId);
  if (index !== -1) cart.splice(index, 1);
  renderCart();
}

function renderCart() {
  if (cart.length === 0) {
    cartListEl.innerHTML = `<li class="cart-empty" id="cartEmpty">담은 상품이 없습니다.</li>`;
  } else {
    cartListEl.innerHTML = cart
      .map(
        (item) => `
        <li class="cart-item" data-id="${item.id}">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.icon} ${item.name}</div>
            <div class="cart-item-price">${(item.price * item.qty).toLocaleString()}원</div>
          </div>
          <div class="cart-item-qty">
            <button class="qty-btn qty-minus" data-id="${item.id}">-</button>
            <span>${item.qty}</span>
            <button class="qty-btn qty-plus" data-id="${item.id}">+</button>
          </div>
          <button class="cart-item-remove" data-id="${item.id}">&times;</button>
        </li>`
      )
      .join("");
  }

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  cartTotalQtyEl.textContent = totalQty;
  cartTotalPriceEl.textContent = totalPrice.toLocaleString();
}

/* 상품 담기 버튼 클릭 (이벤트 위임) */
productGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".product-add-btn");
  if (!btn) return;
  addToCart(Number(btn.dataset.id));
});

/* 장바구니 수량 변경 / 삭제 (이벤트 위임) */
cartListEl.addEventListener("click", (e) => {
  const id = Number(e.target.dataset.id);
  if (!id) return;

  if (e.target.classList.contains("qty-plus")) {
    changeQty(id, 1);
  } else if (e.target.classList.contains("qty-minus")) {
    changeQty(id, -1);
  } else if (e.target.classList.contains("cart-item-remove")) {
    removeFromCart(id);
  }
});

/* 주문하기 버튼 (데모용) */
document.querySelector(".cart-order-btn").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("장바구니에 담긴 상품이 없습니다.");
    return;
  }
  alert("주문이 완료되었습니다! (데모)");
});

renderCart();
