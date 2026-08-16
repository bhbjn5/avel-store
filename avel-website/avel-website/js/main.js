/* ---------------- DATA ---------------- */
const PRODUCTS = [
  {id:'one', eyebrow:'Essentials', name:'AVEL ONE', short:'Classic leather slipper', desc:'A refined leather slipper built around a clean silhouette and everyday comfort. Premium leather. Minimal form. Made for everyday.', price:89, color:'Charcoal', colors:['#111111','#8f7c62'], rot:-2},
  {id:'two', eyebrow:'Essentials', name:'AVEL TWO', short:'Minimal everyday slipper', desc:'A pared-back everyday slipper, cut from soft full-grain leather with a low, easy profile.', price:95, color:'Sand', colors:['#B8A58C','#111111'], rot:2},
  {id:'three', eyebrow:'Signature', name:'AVEL THREE', short:'Premium comfort silhouette', desc:'Our most cushioned build — a contoured footbed under a considered, streamlined upper.', price:99, color:'Beige', colors:['#D8C8B2','#26384A'], rot:-1},
  {id:'signature', eyebrow:'Limited', name:'AVEL SIGNATURE', short:'Limited premium edition', desc:'A limited run in select leather, finished by hand. Numbered, boxed, and made to last.', price:129, color:'Slate', colors:['#26384A','#111111'], rot:1},
];
const SIZES = [39,40,41,42,43,44,45];
let cart = [];
let currentProduct = PRODUCTS[0];
let ppColorIdx = 0, ppSizeIdx = 2, ppQty = 1;

/* ---------------- SVG SLIPPER (reusable) ---------------- */
function slipperSVG(color, rot, alt){
  const r = alt ? rot*-1.6 : rot;
  return `<svg class="${alt?'alt':'base'}" viewBox="0 0 400 260" fill="none" stroke="${color}" stroke-width="6" style="transform:rotate(${r}deg)">
    <path d="M40 190 Q40 150 90 140 Q160 128 230 145 Q300 160 340 175 Q365 184 360 205 Q355 225 320 226 L70 226 Q42 224 40 190 Z" fill="${color}" fill-opacity="0.08"/>
    <path d="M40 190 Q40 150 90 140 Q160 128 230 145 Q300 160 340 175 Q365 184 360 205 Q355 225 320 226 L70 226 Q42 224 40 190 Z"/>
    <path d="M78 150 Q120 95 190 96 Q230 97 246 132" fill="${color}" fill-opacity="0.14"/>
    <line x1="70" y1="226" x2="330" y2="226"/>
  </svg>`;
}

/* ---------------- REUSABLE PRODUCT CARD ----------------
   Same markup/classes power the Essential Silhouettes grid AND the
   Trending Now carousel, so the hover image-swap + Quick Add reveal
   (see .product-media .base/.alt and .quick-add in style.css) only
   has to be defined once and works everywhere a .product-card is used.
   Today the "primary/secondary image" is the inline SVG pair
   (base = primary, alt = secondary); once real photography is added
   under assets/images/, swap slipperSVG(...) below for
   <img class="primary-img" ...> / <img class="secondary-img" ...>
   using the same primary-img/secondary-img classes so the CSS
   crossfade keeps working unchanged. ---------------- */
function productCardHTML(p){
  return `
    <div class="product-card" onclick="openProduct('${p.id}')">
      <div class="product-media">
        ${slipperSVG(p.colors[0], p.rot, false)}
        ${slipperSVG(p.colors[1], p.rot, true)}
        <div class="wishlist" onclick="event.stopPropagation()"><svg viewBox="0 0 24 24"><path d="M12 21s-7-4.5-9.5-9C1 8 2.5 4 6.5 4c2 0 3.5 1.2 4.5 2.7C12 5.2 13.5 4 15.5 4 19.5 4 21 8 19.5 12c-2.5 4.5-7.5 9-7.5 9z"/></svg></div>
        <div class="quick-add" onclick="quickAdd(event,'${p.id}')">Quick Add</div>
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <div class="desc">${p.short}</div>
        <div class="price-row">
          <span class="price">€${p.price}</span>
          <span class="color">${p.color}</span>
        </div>
      </div>
    </div>`;
}

/* ---------------- RENDER PRODUCT GRID ---------------- */
function renderGrid(){
  const grid = document.getElementById('productGrid');
  grid.innerHTML = PRODUCTS.map(productCardHTML).join('');
}
renderGrid();

/* ---------------- RENDER TRENDING NOW CAROUSEL ---------------- */
function renderTrending(){
  const track = document.getElementById('trendingTrack');
  if(!track) return;
  track.innerHTML = PRODUCTS.map(p => `<div class="trending-item">${productCardHTML(p)}</div>`).join('');
}
renderTrending();

function scrollTrending(dir){
  const track = document.getElementById('trendingTrack');
  if(!track) return;
  const card = track.querySelector('.trending-item');
  const step = card ? card.getBoundingClientRect().width + 24 : 280;
  track.scrollBy({left: dir*step, behavior:'smooth'});
}

/* Mouse-drag scrolling for the Trending Now carousel (desktop) */
(function initTrendingDrag(){
  const track = document.getElementById('trendingTrack');
  if(!track) return;
  let isDown = false, startX = 0, startScroll = 0, dragged = false;
  track.addEventListener('mousedown', (e)=>{
    isDown = true; dragged = false;
    startX = e.pageX; startScroll = track.scrollLeft;
    track.classList.add('dragging');
  });
  window.addEventListener('mouseup', ()=>{ isDown = false; track.classList.remove('dragging'); });
  window.addEventListener('mousemove', (e)=>{
    if(!isDown) return;
    const dx = e.pageX - startX;
    if(Math.abs(dx) > 4) dragged = true;
    track.scrollLeft = startScroll - dx;
  });
  // Suppress the click-through to openProduct() when the user was dragging
  track.addEventListener('click', (e)=>{ if(dragged){ e.stopPropagation(); e.preventDefault(); dragged = false; } }, true);
})();

/* ---------------- PRODUCT VIEW ---------------- */
function openProduct(id){
  currentProduct = PRODUCTS.find(p=>p.id===id);
  ppColorIdx = 0; ppSizeIdx = 2; ppQty = 1;
  document.getElementById('homeView').style.display='none';
  document.getElementById('productView').style.display='block';
  window.scrollTo(0,0);

  const p = currentProduct;
  document.getElementById('ppEyebrow').textContent = p.eyebrow;
  document.getElementById('ppName').textContent = p.name;
  document.getElementById('ppPrice').textContent = '€'+p.price;
  document.getElementById('ppDesc').textContent = p.desc;
  document.getElementById('ppQty').textContent = ppQty;

  document.getElementById('ppGalleryMain').innerHTML = slipperSVG(p.colors[0], p.rot, false);
  document.getElementById('ppThumbs').innerHTML = [0,1,0,1].map((ci,i)=>
    `<div class="pp-thumb ${i===0?'active':''}" onclick="setPpThumb(this,${ci})">${slipperSVG(p.colors[ci], p.rot+(i*4), false)}</div>`
  ).join('');

  document.getElementById('ppColors').innerHTML = p.colors.map((c,i)=>
    `<div class="swatch ${i===0?'active':''}" style="background:${c}" onclick="setPpColor(this,${i})"></div>`
  ).join('');

  document.getElementById('ppSizes').innerHTML = SIZES.map((s,i)=>
    `<div class="size-opt ${i===2?'active':''}" onclick="setPpSize(this,${i})">${s}</div>`
  ).join('');
}
function setPpThumb(el,ci){
  document.querySelectorAll('.pp-thumb').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('ppGalleryMain').innerHTML = slipperSVG(currentProduct.colors[ci], currentProduct.rot, false);
}
function setPpColor(el,i){
  document.querySelectorAll('#ppColors .swatch').forEach(s=>s.classList.remove('active'));
  el.classList.add('active'); ppColorIdx = i;
}
function setPpSize(el,i){
  document.querySelectorAll('#ppSizes .size-opt').forEach(s=>s.classList.remove('active'));
  el.classList.add('active'); ppSizeIdx = i;
}
function changePpQty(d){
  ppQty = Math.max(1, ppQty+d);
  document.getElementById('ppQty').textContent = ppQty;
}
function showHome(){
  document.getElementById('productView').style.display='none';
  document.getElementById('homeView').style.display='block';
  window.scrollTo(0,0);
}
function toggleAccordion(head){
  const item = head.parentElement;
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.accordion-item').forEach(i=>i.classList.remove('open'));
  if(!wasOpen) item.classList.add('open');
}

/* ---------------- CART ---------------- */
function addToCart(id, color, size, qty){
  const p = PRODUCTS.find(x=>x.id===id);
  const key = id+'-'+color+'-'+size;
  const existing = cart.find(c=>c.key===key);
  if(existing){ existing.qty += qty; }
  else{ cart.push({key, id, name:p.name, price:p.price, color, size, qty, colorHex:p.colors[0], rot:p.rot}); }
  renderCart();
  toggleCart(true);
}
function quickAdd(e, id){
  e.stopPropagation();
  addToCart(id, PRODUCTS.find(p=>p.id===id).color, SIZES[2], 1);
}
function addPpToCart(){
  const p = currentProduct;
  addToCart(p.id, p.colors[ppColorIdx]==p.colors[0]?p.color:'Alt', SIZES[ppSizeIdx], ppQty);
}
function renderCart(){
  const items = document.getElementById('cartItems');
  const totalQty = cart.reduce((s,c)=>s+c.qty,0);
  document.getElementById('cartCount').textContent = totalQty;
  document.getElementById('cartHeadCount').textContent = totalQty;
  const subtotal = cart.reduce((s,c)=>s+c.qty*c.price,0);
  document.getElementById('cartSubtotal').textContent = '€'+subtotal;
  document.getElementById('shipMsg').textContent = subtotal>=75 ? "You've unlocked free shipping." : `Free shipping on orders over €75 — €${75-subtotal} away.`;

  if(cart.length===0){
    items.innerHTML = '<div class="cart-empty">Your bag is empty.</div>';
    return;
  }
  items.innerHTML = cart.map(c=>`
    <div class="cart-item">
      <div class="thumb">${slipperSVG(c.colorHex, c.rot, false)}</div>
      <div class="ci-info">
        <div>
          <h4>${c.name}</h4>
          <div class="meta">Size ${c.size} · ${c.color}</div>
        </div>
        <div class="ci-bottom">
          <div class="qty-ctrl">
            <button onclick="updateQty('${c.key}',-1)">−</button>
            <span>${c.qty}</span>
            <button onclick="updateQty('${c.key}',1)">+</button>
          </div>
          <span style="font-weight:600;font-size:13px;">€${c.qty*c.price}</span>
        </div>
        <button class="remove-btn" onclick="removeFromCart('${c.key}')">Remove</button>
      </div>
    </div>`).join('');
}
function updateQty(key,d){
  const c = cart.find(x=>x.key===key);
  c.qty += d;
  if(c.qty<=0) cart = cart.filter(x=>x.key!==key);
  renderCart();
}
function removeFromCart(key){
  cart = cart.filter(x=>x.key!==key);
  renderCart();
}
function toggleCart(open){
  document.getElementById('cartDrawer').classList.toggle('open', open);
  document.getElementById('overlay').classList.toggle('open', open);
  syncBodyScrollLock();
}
renderCart();

/* ---------------- SEARCH DRAWER ---------------- */
function toggleSearch(open){
  document.getElementById('searchDrawer').classList.toggle('open', open);
  document.getElementById('searchOverlay').classList.toggle('open', open);
  syncBodyScrollLock();
  if(open) setTimeout(()=>document.getElementById('searchInput').focus(), 300);
}

/* Prevent background scrolling while any drawer is open */
function syncBodyScrollLock(){
  const anyOpen = document.getElementById('cartDrawer').classList.contains('open')
    || document.getElementById('searchDrawer').classList.contains('open')
    || document.getElementById('mobileMenu').classList.contains('open');
  document.body.style.overflow = anyOpen ? 'hidden' : '';
}

/* Escape closes whichever drawer is open */
document.addEventListener('keydown', (e)=>{
  if(e.key !== 'Escape') return;
  toggleSearch(false);
  toggleCart(false);
  toggleMobileMenu(false);
});

/* ---------------- MOBILE MENU ---------------- */
function toggleMobileMenu(open){
  document.getElementById('mobileMenu').classList.toggle('open', open);
  syncBodyScrollLock();
}
document.getElementById('hamburgerBtn').addEventListener('click', ()=>toggleMobileMenu(true));
document.getElementById('hamburgerBtn').style.display = window.innerWidth<=980 ? 'flex':'none';
window.addEventListener('resize', ()=>{
  document.getElementById('hamburgerBtn').style.display = window.innerWidth<=980 ? 'flex':'none';
});

/* ---------------- NEWSLETTER ---------------- */
function joinNewsletter(e){
  e.preventDefault();
  const btn = e.target.querySelector('button');
  const original = btn.textContent;
  btn.textContent = 'Joined!';
  setTimeout(()=>btn.textContent = original, 2200);
  e.target.reset();
}

/* ---------------- HEADER SCROLL ---------------- */
window.addEventListener('scroll', ()=>{
  document.getElementById('siteHeader').classList.toggle('scrolled', window.scrollY>40);
});

/* ---------------- SCROLL REVEAL ---------------- */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
},{threshold:0.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* ---------------- HERO AUTO-PLAY SLIDER ---------------- */
(function initHeroSlider(){
  const heroSection = document.getElementById('heroSlider');
  if(!heroSection) return;
  const slides = Array.from(heroSection.querySelectorAll('.hero-slide'));
  const dotsWrap = document.getElementById('heroDots');
  let index = 0, timer = null;
  const AUTOPLAY_MS = 4500;

  dotsWrap.innerHTML = slides.map((_, i) =>
    `<button class="hero-dot${i===0?' active':''}" onclick="goToHeroSlide(${i})" aria-label="Go to slide ${i+1}"></button>`
  ).join('');
  const dots = Array.from(dotsWrap.querySelectorAll('.hero-dot'));

  function show(i){
    index = (i + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle('active', idx === index));
    dots.forEach((d, idx) => d.classList.toggle('active', idx === index));
  }
  function start(){ timer = setInterval(()=>show(index+1), AUTOPLAY_MS); }
  function restart(){ clearInterval(timer); start(); }

  window.heroNav = function(dir){ show(index+dir); restart(); };
  window.goToHeroSlide = function(i){ show(i); restart(); };

  // Pause autoplay while the user is interacting with the slider, resume after
  heroSection.addEventListener('mouseenter', ()=>clearInterval(timer));
  heroSection.addEventListener('mouseleave', start);
  heroSection.addEventListener('touchstart', ()=>clearInterval(timer), {passive:true});
  heroSection.addEventListener('touchend', restart, {passive:true});

  start();
})();
