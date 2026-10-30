/* ============================================================
   ⚙️  الإعدادات — عدّليها من هنا
   ============================================================ */
const WA_NUMBER = "201108121027";
const ADMIN_PASSWORD = "A&N 1572026";
const STORAGE_KEY = "lumina_products_v1";
const CART_KEY = "lumina_cart_v1";
const WISH_KEY = "lumina_wishlist_v1";

const GENERAL_MSG = "مرحباً 👋 شفت الكولكشن وعجبني، عايزة أستفسر أكتر.";
const PRODUCT_MSG = (p) =>
  `مرحباً 👋\nشفت منتج: ${p.name}\nالسعر: ${p.price} ج.م\nعجبني وعايزة أطلبه 🙌`;
const waLink = (msg) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

/* ============================================================
   📦 المنتجات الافتراضية
   ============================================================ */
const DEFAULTS = [
  {
    id: "p1",
    name: "سيروم فيتامين C المركز",
    category: "سيرومات",
    price: 450,
    oldPrice: 590,
    emoji: "🧪",
    image: "",
    desc: "تركيز 15% — بيوحّد لون البشرة ويقلل البقع الداكنة.",
  },
  {
    id: "p2",
    name: "مرطب حمض الهيالورونيك",
    category: "سكين كير",
    price: 380,
    oldPrice: 0,
    emoji: "💧",
    image: "",
    desc: "ترطيب عميق يدوم 24 ساعة، مناسب لكل أنواع البشرة.",
  },
  {
    id: "p3",
    name: "أحمر شفاه مات — Velvet",
    category: "ميكب",
    price: 220,
    oldPrice: 280,
    emoji: "💄",
    image: "",
    desc: "ثبات طويل وتركيبة مخملية مريحة من غير جفاف.",
  },
  {
    id: "p4",
    name: "باليت ظلال 18 لون",
    category: "ميكب",
    price: 550,
    oldPrice: 0,
    emoji: "🎨",
    image: "",
    desc: "درجات نود وبيرجوندي بجودة عالية وبيجمنت قوي.",
  },
  {
    id: "p5",
    name: "واقي شمس SPF 50+",
    category: "سكين كير",
    price: 420,
    oldPrice: 0,
    emoji: "☀️",
    image: "",
    desc: "حماية واسعة UVA/UVB من غير طبقة بيضاء.",
  },
  {
    id: "p6",
    name: "ماسكارا 4D Volume",
    category: "ميكب",
    price: 260,
    oldPrice: 320,
    emoji: "👁️",
    image: "",
    desc: "كثافة وحجم فوري من غير تكتل، مقاومة للماء.",
  },
  {
    id: "p7",
    name: "تونر حمض اللاكتيك 5%",
    category: "سيرومات",
    price: 340,
    oldPrice: 0,
    emoji: "🌿",
    image: "",
    desc: "يقشّر بلطف ويوحّد ملمس البشرة خلال أسبوعين.",
  },
  {
    id: "p8",
    name: "هايلايتر سائل — Glow",
    category: "ميكب",
    price: 290,
    oldPrice: 350,
    emoji: "✨",
    image: "",
    desc: "لمعة طبيعية تشبه إضاءة الاستوديو، سهلة الدمج.",
  },
];

/* ============================================================
   🗃️ STATE
   ============================================================ */
let products = [];
let cart = [];
let wishlist = [];
let activeFilter = "الكل";
let searchQuery = "";
let sortBy = "default";

/* ============================================================
   💾 STORAGE
   ============================================================ */
function loadAll() {
  try {
    const p = JSON.parse(localStorage.getItem(STORAGE_KEY));
    products = Array.isArray(p) && p.length ? p : [...DEFAULTS];
  } catch {
    products = [...DEFAULTS];
  }
  try {
    cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    cart = [];
  }
  try {
    wishlist = JSON.parse(localStorage.getItem(WISH_KEY)) || [];
  } catch {
    wishlist = [];
  }
  if (!localStorage.getItem(STORAGE_KEY))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS));
}

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateBadges();
}
function saveWish() {
  localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  updateBadges();
}

function updateBadges() {
  const c = document.getElementById("cartCount");
  const w = document.getElementById("wishlistCount");
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  c.textContent = totalQty;
  c.style.display = totalQty ? "grid" : "none";
  w.textContent = wishlist.length;
  w.style.display = wishlist.length ? "grid" : "none";
}

/* ============================================================
   🎨 TOAST
   ============================================================ */
function showToast(message, type = "success") {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
  const toast = document.createElement("div");
  toast.className = "toast " + type;
  toast.textContent = message;
  wrap.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/* ============================================================
   🔍 FILTERING
   ============================================================ */
function getFilteredProducts() {
  let list = [...products];
  if (activeFilter !== "الكل")
    list = list.filter((p) => p.category === activeFilter);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.desc || "").toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }
  if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
  else if (sortBy === "newest")
    list.sort((a, b) => String(b.id).localeCompare(String(a.id)));
  return list;
}

/* ============================================================
   🖼️ RENDER
   ============================================================ */
const grid = document.getElementById("grid");
const filtersEl = document.getElementById("filters");

function renderFilters() {
  const cats = ["الكل", ...new Set(products.map((p) => p.category))];
  filtersEl.innerHTML = cats
    .map(
      (c) =>
        `<button class="chip ${c === activeFilter ? "active" : ""}" data-cat="${c}">${c}</button>`,
    )
    .join("");
  filtersEl.querySelectorAll(".chip").forEach((btn) => {
    btn.onclick = () => {
      activeFilter = btn.dataset.cat;
      renderFilters();
      renderProducts();
    };
  });
}

function cardHTML(p, i) {
  const hasDiscount = p.oldPrice && Number(p.oldPrice) > Number(p.price);
  const inWish = wishlist.includes(p.id);
  const inCart = cart.some((c) => c.id === p.id);
  const imgStyle = p.image
    ? `style="background-image:url('${p.image}');background-size:cover;background-position:center"`
    : "";
  const media = p.image
    ? `<div class="p-img" ${imgStyle}></div>`
    : `<div class="p-img"><span class="p-emoji">${p.emoji || "✨"}</span></div>`;
  const discountPct = hasDiscount
    ? Math.round((1 - p.price / p.oldPrice) * 100)
    : 0;

  return `
  <article class="p-card reveal" data-id="${p.id}" style="transition-delay:${Math.min(i * 60, 420)}ms">
    <div class="p-inner">
      <div class="p-face p-front">
        <button class="p-wish ${inWish ? "active" : ""}" data-wish="${p.id}" aria-label="المفضلة">
          <svg viewBox="0 0 24 24" fill="${inWish ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <span class="p-cat">${p.category}</span>
        ${media}
        <div class="p-fbody">
          <h3 class="p-name">${p.name}</h3>
          <div class="p-hint"><i>↻</i> مرري لرؤية السعر</div>
        </div>
      </div>
      <div class="p-face p-back">
        <h3>${p.name}</h3>
        <div class="p-price">${p.price} <small>ج.م</small></div>
        ${hasDiscount ? `<div class="p-old">${p.oldPrice} ج.م <span class="discount-tag">-${discountPct}%</span></div>` : ``}
        <p class="p-desc">${p.desc || ""}</p>
        <div class="p-actions">
          <button class="btn-add-cart ${inCart ? "added" : ""}" data-add-cart="${p.id}">${inCart ? "✓ في السلة" : "🛒 أضف للسلة"}</button>
          <a class="btn btn-wa" href="${waLink(PRODUCT_MSG(p))}" target="_blank" rel="noopener">اطلبيه على واتساب</a>
          <button class="btn-details" data-details="${p.id}">تفاصيل كاملة</button>
        </div>
      </div>
    </div>
  </article>`;
}

function renderProducts() {
  const list = getFilteredProducts();
  grid.innerHTML = list.length
    ? list.map(cardHTML).join("")
    : `<p style="grid-column:1/-1;text-align:center;color:var(--muted);padding:60px 0">مفيش منتجات مطابقة — جربي كلمة تانية ✨</p>`;

  const isTouch = !window.matchMedia("(hover:hover)").matches;
  grid.querySelectorAll(".p-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("a,button")) return;
      if (isTouch) card.classList.toggle("flipped");
    });
  });

  grid.querySelectorAll("[data-wish]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.wish;
      if (wishlist.includes(id)) wishlist = wishlist.filter((x) => x !== id);
      else wishlist.push(id);
      saveWish();
      btn.classList.toggle("active");
      const svg = btn.querySelector("svg");
      svg.setAttribute(
        "fill",
        btn.classList.contains("active") ? "currentColor" : "none",
      );
    });
  });

  grid.querySelectorAll("[data-add-cart]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(btn.dataset.addCart);
      btn.classList.add("added");
      btn.textContent = "✓ في السلة";
    });
  });

  grid.querySelectorAll("[data-details]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openProductModal(btn.dataset.details);
    });
  });

  observeReveals();
  initTilt();
}

/* ============================================================
   🛒 CART
   ============================================================ */
function addToCart(id) {
  const item = cart.find((c) => c.id === id);
  if (item) item.qty++;
  else cart.push({ id, qty: 1 });
  saveCart();
  renderProducts();
  const p = products.find((x) => x.id === id);
  if (p) showToast(`تمت إضافة "${p.name}" للسلة`, "success");
}

function removeFromCart(id) {
  cart = cart.filter((c) => c.id !== id);
  saveCart();
  renderDrawer();
  renderProducts();
}

function changeQty(id, delta) {
  const item = cart.find((c) => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((c) => c.id !== id);
  saveCart();
  renderDrawer();
  renderProducts();
}

function cartTotal() {
  return cart.reduce((sum, item) => {
    const p = products.find((x) => x.id === item.id);
    return p ? sum + p.price * item.qty : sum;
  }, 0);
}

function buildCartMessage() {
  if (!cart.length) return GENERAL_MSG;
  let msg = "مرحباً 👋\nعايزة أستفسر عن المنتجات دي:\n\n";
  cart.forEach((item, i) => {
    const p = products.find((x) => x.id === item.id);
    if (!p) return;
    msg += `${i + 1}. ${p.name}\n   الكمية: ${item.qty} × ${p.price} ج.م = ${item.qty * p.price} ج.م\n`;
  });
  msg += `\n─────────────\nالإجمالي: ${cartTotal()} ج.م\n\nممكن تفاصيل التوصيل والدفع؟ 🙏`;
  return msg;
}
/* ============================================================
   📂 DRAWER
   ============================================================ */
let drawerMode = "cart";
const drawer = document.getElementById("drawer");
const drawerOverlay = document.getElementById("drawerOverlay");
const drawerBody = document.getElementById("drawerBody");
const drawerFoot = document.getElementById("drawerFoot");
const drawerTitle = document.getElementById("drawerTitle");

function openDrawer(mode) {
  drawerMode = mode || drawerMode;
  drawerTitle.textContent =
    drawerMode === "cart" ? "🛒 سلة الاستفسار" : "❤️ المفضلة";
  renderDrawer();
  drawer.classList.add("open");
  drawerOverlay.classList.add("open");
}

function closeDrawer() {
  drawer.classList.remove("open");
  drawerOverlay.classList.remove("open");
}

function renderDrawer() {
  if (drawerMode === "cart") {
    if (!cart.length) {
      drawerBody.innerHTML = `<div class="drawer-empty"><div>🛒</div>السلة فاضية — اختاري منتج وارجعي 🛍️</div>`;
      drawerFoot.innerHTML = "";
      return;
    }
    drawerBody.innerHTML = cart
      .map((item) => {
        const p = products.find((x) => x.id === item.id);
        if (!p) return "";
        const img = p.image
          ? `<div class="cart-item-img" style="background-image:url('${p.image}')"></div>`
          : `<div class="cart-item-img">${p.emoji || "✨"}</div>`;
        return `
        <div class="cart-item">
          ${img}
          <div class="cart-item-info">
            <b>${p.name}</b>
            <span>${p.price} ج.م</span>
          </div>
          <div class="cart-item-actions">
            <div class="qty-control">
              <button data-qty-minus="${p.id}">−</button>
              <span>${item.qty}</span>
              <button data-qty-plus="${p.id}">+</button>
            </div>
            <button class="remove-item" data-remove="${p.id}">حذف</button>
          </div>
        </div>`;
      })
      .join("");

    const total = cartTotal();
    drawerFoot.innerHTML = `
      <div class="cart-total"><b>الإجمالي</b><span>${total} ج.م</span></div>
      <a class="btn btn-wa" href="${waLink(buildCartMessage())}" target="_blank" rel="noopener">💬 اطلبي الكل على واتساب</a>
      <div class="cart-note">الأوردر ده للاستفسار — مش دفع أونلاين</div>`;

    drawerBody
      .querySelectorAll("[data-qty-plus]")
      .forEach((b) => (b.onclick = () => changeQty(b.dataset.qtyPlus, 1)));
    drawerBody
      .querySelectorAll("[data-qty-minus]")
      .forEach((b) => (b.onclick = () => changeQty(b.dataset.qtyMinus, -1)));
    drawerBody
      .querySelectorAll("[data-remove]")
      .forEach((b) => (b.onclick = () => removeFromCart(b.dataset.remove)));
  } else {
    const items = wishlist
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean);
    if (!items.length) {
      drawerBody.innerHTML = `<div class="drawer-empty"><div>❤️</div>مفيش منتجات في المفضلة لسه</div>`;
      drawerFoot.innerHTML = "";
      return;
    }
    drawerBody.innerHTML = items
      .map((p) => {
        const img = p.image
          ? `<div class="cart-item-img" style="background-image:url('${p.image}')"></div>`
          : `<div class="cart-item-img">${p.emoji || "✨"}</div>`;
        return `
        <div class="cart-item">
          ${img}
          <div class="cart-item-info">
            <b>${p.name}</b>
            <span>${p.price} ج.م</span>
          </div>
          <div class="cart-item-actions">
            <button class="btn-add-cart" data-add-cart-drawer="${p.id}" style="padding:5px 10px;font-size:11.5px">🛒 أضف</button>
            <button class="remove-item" data-unwish="${p.id}">حذف</button>
          </div>
        </div>`;
      })
      .join("");
    drawerFoot.innerHTML = `<button class="btn btn-primary" id="clearWishBtn">🗑️ إفراغ المفضلة</button>`;

    drawerBody.querySelectorAll("[data-add-cart-drawer]").forEach(
      (b) =>
        (b.onclick = () => {
          addToCart(b.dataset.addCartDrawer);
          renderDrawer();
        }),
    );
    drawerBody.querySelectorAll("[data-unwish]").forEach(
      (b) =>
        (b.onclick = () => {
          wishlist = wishlist.filter((x) => x !== b.dataset.unwish);
          saveWish();
          renderDrawer();
          renderProducts();
        }),
    );
    const clr = document.getElementById("clearWishBtn");
    if (clr)
      clr.onclick = () => {
        if (confirm("هتحذفي كل المفضلة. متأكدة؟")) {
          wishlist = [];
          saveWish();
          renderDrawer();
          renderProducts();
        }
      };
  }
}

/* ============================================================
   📋 MODAL
   ============================================================ */
const modal = document.getElementById("productModal");
const modalContent = document.getElementById("modalContent");

function openProductModal(id) {
  const p = products.find((x) => x.id === id);
  if (!p) return;
  const hasDiscount = p.oldPrice && Number(p.oldPrice) > Number(p.price);
  const imgStyle = p.image ? `style="background-image:url('${p.image}')"` : "";
  const media = p.image
    ? `<div class="modal-hero" ${imgStyle}></div>`
    : `<div class="modal-hero"><span class="emo">${p.emoji || "✨"}</span></div>`;
  modalContent.innerHTML = `
    ${media}
    <div class="modal-cat">${p.category}</div>
    <h2>${p.name}</h2>
    ${hasDiscount ? `<div class="modal-old">${p.oldPrice} ج.م</div>` : ""}
    <div class="modal-price">${p.price} <small>ج.م</small></div>
    <p class="modal-desc">${p.desc || "منتج مميز من مختارات LUMINA."}</p>
    <div class="modal-actions">
      <button class="btn btn-ghost" id="modalAddCart">🛒 أضف للسلة</button>
      <a class="btn btn-wa" href="${waLink(PRODUCT_MSG(p))}" target="_blank" rel="noopener">💬 اطلبيه واتساب</a>
    </div>`;
  modal.classList.add("open");
  document.getElementById("modalAddCart").onclick = () => {
    addToCart(p.id);
    document.getElementById("modalAddCart").textContent = "✓ في السلة";
  };
}

function closeModal() {
  modal.classList.remove("open");
}

/* ============================================================
   🖱️ 3D TILT
   ============================================================ */
function initTilt() {
  if (!window.matchMedia("(hover: hover)").matches) return;
  document.querySelectorAll(".p-card").forEach((card) => {
    if (card.dataset.tiltBound === "1") return;
    card.dataset.tiltBound = "1";
    let rafId = null;
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rx = ((y - rect.height / 2) / (rect.height / 2)) * -6;
      const ry = ((x - rect.width / 2) / (rect.width / 2)) * 6;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
    });
    card.addEventListener("mouseleave", () => {
      if (rafId) cancelAnimationFrame(rafId);
      card.style.transform = "";
    });
  });
}

/* ============================================================
   📊 COUNTERS
   ============================================================ */
function animateCounters() {
  document.querySelectorAll(".stat b").forEach((el) => {
    if (el.dataset.animated === "true") return;
    el.dataset.animated = "true";
    const text = el.textContent;
    const match = text.match(/(\d+)/);
    if (!match) return;
    const target = parseInt(match[1]);
    const prefix = text.substring(0, match.index);
    const suffix = text.substring(match.index + match[1].length);
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / 1600, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = prefix + Math.floor(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target + suffix;
    }
    requestAnimationFrame(step);
  });
}
const statsEl = document.querySelector(".hero-stats");
if (statsEl) {
  const statsObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          setTimeout(animateCounters, 400);
          statsObs.unobserve(en.target);
        }
      });
    },
    { threshold: 0.4 },
  );
  statsObs.observe(statsEl);
}

/* ============================================================
   ⬆️ BACK TO TOP
   ============================================================ */
(function backToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  const ring = btn.querySelector("circle");
  const circumference = 2 * Math.PI * 25;
  ring.style.strokeDasharray = circumference;
  window.addEventListener(
    "scroll",
    () => {
      const st = window.scrollY;
      const dh = document.documentElement.scrollHeight - window.innerHeight;
      ring.style.strokeDashoffset =
        circumference - circumference * (dh > 0 ? st / dh : 0);
      btn.classList.toggle("show", st > 400);
    },
    { passive: true },
  );
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

/* ============================================================
   🎯 EVENTS
   ============================================================ */
document.getElementById("closeDrawer").onclick = closeDrawer;
drawerOverlay.onclick = closeDrawer;
document.getElementById("closeModal").onclick = closeModal;
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeDrawer();
    closeModal();
    closeAdmin();
  }
});

document.getElementById("cartBtn").onclick = () => openDrawer("cart");
document.getElementById("wishlistBtn").onclick = () => openDrawer("wishlist");

let searchTimer;
document.getElementById("searchInput").addEventListener("input", (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchQuery = e.target.value.trim();
    renderProducts();
  }, 200);
});
document.getElementById("sortSelect").addEventListener("change", (e) => {
  sortBy = e.target.value;
  renderProducts();
});

/* ============================================================
   🔗 WHATSAPP LINKS
   ============================================================ */
["navWa", "ctaWa", "floatWa", "footWa"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.href = waLink(GENERAL_MSG);
});

/* ============================================================
   ⏰ COUNTDOWN
   ============================================================ */
(function countdown() {
  const target = new Date();
  target.setMonth(target.getMonth() + 1, 1);
  target.setHours(0, 0, 0, 0);
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      target.setMonth(target.getMonth() + 1, 1);
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.getElementById("cd-d").textContent = String(d).padStart(2, "0");
    document.getElementById("cd-h").textContent = String(h).padStart(2, "0");
    document.getElementById("cd-m").textContent = String(m).padStart(2, "0");
    document.getElementById("cd-s").textContent = String(s).padStart(2, "0");
  }
  tick();
  setInterval(tick, 1000);
})();

/* ============================================================
   🎬 LOADER
   ============================================================ */
window.addEventListener("load", () =>
  setTimeout(
    () => document.getElementById("loader").classList.add("hide"),
    650,
  ),
);
setTimeout(() => document.getElementById("loader").classList.add("hide"), 3000);

/* ============================================================
   📜 SCROLL
   ============================================================ */
const header = document.getElementById("header");
const progress = document.getElementById("progress");
function onScroll() {
  const y = window.scrollY;
  header.classList.toggle("stuck", y > 40);
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
burger.onclick = () => {
  burger.classList.toggle("open");
  nav.classList.toggle("open");
};
nav.querySelectorAll("a").forEach(
  (a) =>
    (a.onclick = () => {
      burger.classList.remove("open");
      nav.classList.remove("open");
    }),
);

/* ============================================================
   ✨ CURSOR GLOW
   ============================================================ */
const glow = document.getElementById("cursor-glow");
let gx = innerWidth / 2,
  gy = innerHeight / 2,
  cx = gx,
  cy = gy;
window.addEventListener("mousemove", (e) => {
  gx = e.clientX;
  gy = e.clientY;
});
(function animGlow() {
  cx += (gx - cx) * 0.12;
  cy += (gy - cy) * 0.12;
  glow.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
  requestAnimationFrame(animGlow);
})();

/* ============================================================
   🌌 PARTICLES
   ============================================================ */
(function particles() {
  const canvas = document.getElementById("fx"),
    ctx = canvas.getContext("2d");
  let parts = [];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function resize() {
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    build();
  }
  function build() {
    const n = innerWidth < 768 ? 34 : 80;
    parts = Array.from({ length: n }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * 1.7 + 0.4,
      vy: -(Math.random() * 0.34 + 0.06),
      vx: (Math.random() - 0.5) * 0.14,
      a: Math.random() * 0.55 + 0.15,
      hue: Math.random() < 0.5 ? 190 : 275,
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) {
        p.y = innerHeight + 10;
        p.x = Math.random() * innerWidth;
      }
      if (p.x < -10) p.x = innerWidth + 10;
      if (p.x > innerWidth + 10) p.x = -10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},100%,72%,${p.a})`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = `hsla(${p.hue},100%,65%,${p.a})`;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    requestAnimationFrame(draw);
  }
  window.addEventListener("resize", resize);
  resize();
  if (!reduce) draw();
})();

/* ============================================================
   👁 REVEAL
   ============================================================ */
let io;
function observeReveals() {
  if (!io) {
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );
  }
  document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
}
/* ============================================================
   🔒 ADMIN (محمي بكلمة سر) — مع إضافة/تعديل/حذف المنتجات
   ============================================================ */
const admin = document.getElementById("admin");
const adminList = document.getElementById("adminList");
const countEl = document.getElementById("count");
let editingId = null;

function openAdmin() {
  const pwd = prompt("🔒 كلمة سر الأدمن:");
  if (pwd === null) return;
  if (pwd !== ADMIN_PASSWORD) {
    showToast("كلمة سر غلط", "error");
    return;
  }
  admin.classList.add("open");
  renderAdminList();
}

function closeAdmin() {
  admin.classList.remove("open");
  resetAdminForm();
}

document.getElementById("closeAdmin").onclick = closeAdmin;
admin.addEventListener("click", (e) => {
  if (e.target === admin) closeAdmin();
});

/* Trigger 1: Ctrl + Shift + A */
window.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
    e.preventDefault();
    openAdmin();
  }
});

/* Trigger 2: 5 ضغطات على اللوجو */
let logoTaps = 0,
  logoTimer;
document.getElementById("logoTrigger").addEventListener("click", (e) => {
  logoTaps++;
  clearTimeout(logoTimer);
  if (logoTaps >= 5) {
    logoTaps = 0;
    e.preventDefault();
    openAdmin();
    return;
  }
  logoTimer = setTimeout(() => (logoTaps = 0), 3000);
});

function renderAdminList() {
  countEl.textContent = products.length;
  adminList.innerHTML =
    products
      .map(
        (p) => `
    <div class="admin-item">
      <div>
        <b>${p.emoji || "✨"} ${p.name}</b><br>
        <small>${p.category} — ${p.price} ج.م${p.oldPrice ? ` (قبل: ${p.oldPrice})` : ""}</small>
      </div>
      <div class="admin-item-actions">
        <button class="edit-btn" data-edit="${p.id}">✏️ تعديل</button>
        <button class="del" data-del="${p.id}">حذف</button>
      </div>
    </div>`,
      )
      .join("") ||
    `<p style="color:var(--muted);font-size:13px">مفيش منتجات.</p>`;

  adminList.querySelectorAll("[data-del]").forEach((b) => {
    b.onclick = () => {
      if (!confirm("متأكدة من حذف المنتج؟")) return;
      products = products.filter((p) => p.id !== b.dataset.del);
      cart = cart.filter((c) => c.id !== b.dataset.del);
      wishlist = wishlist.filter((x) => x !== b.dataset.del);
      saveProducts();
      saveCart();
      saveWish();
      renderAdminList();
      renderFilters();
      renderProducts();
      showToast("تم حذف المنتج", "info");
    };
  });

  adminList.querySelectorAll("[data-edit]").forEach((b) => {
    b.onclick = () => startEdit(b.dataset.edit);
  });
}

function startEdit(id) {
  const p = products.find((x) => x.id === id);
  if (!p) return;
  editingId = id;
  document.getElementById("f-name").value = p.name;
  document.getElementById("f-cat").value = p.category;
  document.getElementById("f-price").value = p.price;
  document.getElementById("f-old").value = p.oldPrice || "";
  document.getElementById("f-emoji").value = p.emoji || "";
  document.getElementById("f-img").value = p.image || "";
  document.getElementById("f-desc").value = p.desc || "";
  const addBtn = document.getElementById("addBtn");
  addBtn.textContent = "💾 حفظ التعديل";
  document.getElementById("cancelEditBtn").style.display = "block";
  document
    .querySelector(".admin-form")
    .scrollIntoView({ behavior: "smooth", block: "start" });
  showToast("وضع التعديل — عدّلي وحافظي", "info");
}

function resetAdminForm() {
  editingId = null;
  ["f-name", "f-price", "f-old", "f-emoji", "f-img", "f-desc"].forEach((id) => {
    document.getElementById(id).value = "";
  });
  document.getElementById("f-cat").value = "ميكب";
  document.getElementById("addBtn").textContent = "➕ إضافة المنتج";
  document.getElementById("cancelEditBtn").style.display = "none";
}

document.getElementById("cancelEditBtn").onclick = () => {
  resetAdminForm();
  showToast("تم إلغاء التعديل", "info");
};

document.getElementById("addBtn").onclick = () => {
  const name = document.getElementById("f-name").value.trim();
  const price = document.getElementById("f-price").value.trim();
  if (!name || !price) {
    showToast("لازم اسم المنتج والسعر", "error");
    return;
  }

  const data = {
    name,
    category: document.getElementById("f-cat").value,
    price: Number(price),
    oldPrice: Number(document.getElementById("f-old").value) || 0,
    emoji: document.getElementById("f-emoji").value.trim() || "✨",
    image: document.getElementById("f-img").value.trim(),
    desc:
      document.getElementById("f-desc").value.trim() ||
      "منتج مميز من مختارات LUMINA.",
  };

  if (editingId) {
    const idx = products.findIndex((p) => p.id === editingId);
    if (idx > -1) {
      products[idx] = { ...products[idx], ...data };
      showToast("تم حفظ التعديل ✅", "success");
    }
  } else {
    products.unshift({
      id: "p" + Date.now() + Math.floor(Math.random() * 999),
      ...data,
    });
    showToast("تمت إضافة المنتج ✅", "success");
  }

  saveProducts();
  renderAdminList();
  renderFilters();
  renderProducts();
  resetAdminForm();
};

document.getElementById("resetBtn").onclick = () => {
  if (!confirm("هيرجع الافتراضي ويمسح اللي ضفتيه. متأكدة؟")) return;
  products = [...DEFAULTS];
  saveProducts();
  renderAdminList();
  renderFilters();
  renderProducts();
  showToast("تمت استعادة المنتجات الافتراضية", "info");
};

document.getElementById("exportBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(products, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "lumina-products-backup.json";
  a.click();
  URL.revokeObjectURL(a.href);
  showToast("تم تصدير النسخة الاحتياطية", "success");
};

document.getElementById("importBtn").onclick = () => {
  document.getElementById("fileInput").click();
};

document.getElementById("fileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const arr = JSON.parse(ev.target.result);
      if (!Array.isArray(arr)) throw new Error("bad");
      products = arr;
      saveProducts();
      renderAdminList();
      renderFilters();
      renderProducts();
      showToast("تم الاستيراد بنجاح", "success");
    } catch {
      showToast("ملف غير صالح", "error");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

/* ============================================================
   🚀 INIT
   ============================================================ */
document.getElementById("year").textContent = new Date().getFullYear();
loadAll();
renderFilters();
renderProducts();
updateBadges();
observeReveals();
renderDrawer();
