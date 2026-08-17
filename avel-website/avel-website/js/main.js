/* ---------------- SUPABASE CONFIG ---------------- */
const SUPABASE_URL = 'https://amypkyoglbkqeadpwmja.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Vim7Sond96Q-JtVGzubxXw_NsKz0b0c';

/* ---------------- DATA ----------------
   Products are no longer hard-coded: they are fetched live from the
   `products` table in Supabase (columns: title, price, image, description).
   PRODUCTS starts empty and is populated by loadProducts() below. */
let PRODUCTS = [];
const SIZES = [39,40,41,42,43,44,45];
let cart = [];
let currentProduct = null;
let ppSizeIdx = 2, ppQty = 1;

/* ---------------- HELPERS ---------------- */
function escapeHtml(str){
  if(str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function formatPrice(v){
  const n = Number(v);
  if(isNaN(n)) return escapeHtml(v);
  return Number.isInteger(n) ? n : n.toFixed(2);
}
/* Maps a Supabase `products` row onto the shape the UI expects */
function mapProduct(row){
  const desc = row.description || '';
  return {
    id: row.id,
    name: row.title || 'AVEL Slipper',
    price: row.price,
    image: row.image || '',
    desc: desc,
    short: desc.length > 68 ? desc.slice(0, 65).trim() + '…' : desc
  };
}

/* ---------------- FETCH FROM SUPABASE ---------------- */
async function fetchProductsFromSupabase(){
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=id.asc`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  if(!res.ok) throw new Error('Supabase request failed: ' + res.status);
  return res.json();
}

function skeletonCards(count){
  return Array.from({length:count}).map(() => `
    <div class="product-card skeleton" aria-hidden="true">
      <div class="product-media"></div>
      <div class="product-info">
        <h3>&nbsp;</h3>
        <div class="desc">&nbsp;</div>
      </div>
    </div>`).join('');
}
function stateBannerHTML(message, showRetry){
  return `
    <div class="products-state">
      <p>${escapeHtml(message)}</p>
      ${showRetry ? '<button class="btn btn-secondary" onclick="loadProducts()">Try Again</button>' : ''}
    </div>`;
}

async function loadProducts(){
  const grid = document.getElementById('productGrid');
  const trendingSection = document.querySelector('.trending');
  const track = document.getElementById('trendingTrack');

  grid.classList.remove('state-mode');
  grid.innerHTML = skeletonCards(4);
  if(track) track.innerHTML = skeletonCards(4);

  try{
    const rows = await fetchProductsFromSupabase();
    PRODUCTS = rows.map(mapProduct);

    if(PRODUCTS.length === 0){
      grid.classList.add('state-mode');
      grid.innerHTML = stateBannerHTML('No products yet — add some rows to your Supabase products table.', false);
      if(trendingSection) trendingSection.style.display = 'none';
      return;
    }

    if(trendingSection) trendingSection.style.display = '';
    renderGrid();
    renderTrending();
    renderCart();
  }catch(err){
    console.error('AVEL: could not load products from Supabase.', err);
    grid.classList.add('state-mode');
    grid.innerHTML = stateBannerHTML('Couldn\u2019t load products right now. Check your connection and try again.', true);
    if(trendingSection) trendingSection.style.display = 'none';
  }
}

/* ---------------- REUSABLE PRODUCT CARD ----------------
   Same markup/classes power the Essential Silhouettes grid AND the
   Trending Now carousel, so image handling, the Quick Add reveal,
   and the wishlist icon (see .product-media / .quick-add in
   style.css) only have to be defined once. The image comes straight
   from the product's `image` column in Supabase; if it fails to
   load, .img-fallback shows a quiet AVEL monogram instead of a
   broken-image icon. ---------------- */
function productCardHTML(p){
  return `
    <div class="product-card" onclick="openProduct('${p.id}')">
      <div class="product-media">
        <img class="primary-img" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy"
             onerror="this.style.opacity='0';this.parentElement.classList.add('img-fallback')">
        <div class="wishlist" onclick="event.stopPropagation()"><svg viewBox="0 0 24 24"><path d="M12 21s-7-4.5-9.5-9C1 8 2.5 4 6.5 4c2 0 3.5 1.2 4.5 2.7C12 5.2 13.5 4 15.5 4 19.5 4 21 8 19.5 12c-2.5 4.5-7.5 9-7.5 9z"/></svg></div>
        <div class="quick-add" onclick="quickAdd(event,'${p.id}')">Quick Add</div>
      </div>
      <div class="product-info">
        <h3>${escapeHtml(p.name)}</h3>
        <div class="desc">${escapeHtml(p.short)}</div>
        <div class="price-row">
          <span class="price">€${formatPrice(p.price)}</span>
        </div>
      </div>
    </div>`;
}

/* ---------------- RENDER PRODUCT GRID ---------------- */
function renderGrid(){
  const grid = document.getElementById('productGrid');
  grid.classList.remove('state-mode');
  grid.innerHTML = PRODUCTS.map(productCardHTML).join('');
}

/* ---------------- RENDER TRENDING NOW CAROUSEL ---------------- */
function renderTrending(){
  const track = document.getElementById('trendingTrack');
  if(!track) return;
  track.innerHTML = PRODUCTS.map(p => `<div class="trending-item">${productCardHTML(p)}</div>`).join('');
}

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
  currentProduct = PRODUCTS.find(p => String(p.id) === String(id));
  if(!currentProduct) return;
  ppSizeIdx = 2; ppQty = 1;
  document.getElementById('homeView').style.display='none';
  document.getElementById('productView').style.display='block';
  window.scrollTo(0,0);

  const p = currentProduct;
  document.getElementById('ppEyebrow').textContent = 'AVEL';
  document.getElementById('ppName').textContent = p.name;
  document.getElementById('ppPrice').textContent = '€' + formatPrice(p.price);
  document.getElementById('ppDesc').textContent = p.desc || 'Premium leather. Minimal form. Made for everyday.';
  document.getElementById('ppQty').textContent = ppQty;

  document.getElementById('ppGalleryMain').innerHTML =
    `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}"
          onerror="this.remove();this.parentElement.classList.add('img-fallback')">`;

  // The Supabase `products` table only stores one image and no color
  // variants, so the multi-angle thumbnail strip and color swatches
  // (relevant only when that data exists) are hidden rather than shown empty.
  const thumbs = document.getElementById('ppThumbs');
  thumbs.innerHTML = '';
  thumbs.style.display = 'none';
  const colorBlock = document.getElementById('ppColors').closest('.pp-block');
  if(colorBlock) colorBlock.style.display = 'none';

  document.getElementById('ppSizes').innerHTML = SIZES.map((s,i)=>
    `<div class="size-opt ${i===2?'active':''}" onclick="setPpSize(this,${i})">${s}</div>`
  ).join('');
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
function addToCart(id, size, qty){
  const p = PRODUCTS.find(x => String(x.id) === String(id));
  if(!p) return;
  const key = id + '-' + size;
  const existing = cart.find(c=>c.key===key);
  if(existing){ existing.qty += qty; }
  else{ cart.push({key, id, name:p.name, price:p.price, image:p.image, size, qty}); }
  renderCart();
  toggleCart(true);
}
function quickAdd(e, id){
  e.stopPropagation();
  addToCart(id, SIZES[2], 1);
}
function addPpToCart(){
  const p = currentProduct;
  if(!p) return;
  addToCart(p.id, SIZES[ppSizeIdx], ppQty);
}
function renderCart(){
  const items = document.getElementById('cartItems');
  const totalQty = cart.reduce((s,c)=>s+c.qty,0);
  document.getElementById('cartCount').textContent = totalQty;
  document.getElementById('cartHeadCount').textContent = totalQty;
  const subtotal = cart.reduce((s,c)=>s + c.qty * Number(c.price || 0), 0);
  document.getElementById('cartSubtotal').textContent = '€' + formatPrice(subtotal);
  document.getElementById('shipMsg').textContent = subtotal>=75 ? "You've unlocked free shipping." : `Free shipping on orders over €75 — €${formatPrice(75-subtotal)} away.`;

  if(cart.length===0){
    items.innerHTML = '<div class="cart-empty">Your bag is empty.</div>';
    return;
  }
  items.innerHTML = cart.map(c=>`
    <div class="cart-item">
      <div class="thumb"><img src="${escapeHtml(c.image)}" alt="${escapeHtml(c.name)}" onerror="this.remove()"></div>
      <div class="ci-info">
        <div>
          <h4>${escapeHtml(c.name)}</h4>
          <div class="meta">Size ${c.size}</div>
        </div>
        <div class="ci-bottom">
          <div class="qty-ctrl">
            <button onclick="updateQty('${c.key}',-1)">−</button>
            <span>${c.qty}</span>
            <button onclick="updateQty('${c.key}',1)">+</button>
          </div>
          <span style="font-weight:600;font-size:13px;">€${formatPrice(c.qty * Number(c.price || 0))}</span>
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
loadProducts();

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

/* ---------------- HERO AUTO-PLAY SLIDER + PROGRESS BARS (Task 10) ----------------
   Single source of truth: one requestAnimationFrame loop drives both the
   active slide's progress-fill width AND the auto-advance to the next
   slide. There is never more than one timer/rAF loop running — every
   slide change (auto, arrow-click, or indicator-click) goes through
   startTimer(), which cancels any previous loop before starting a new one. */
(function initHeroSlider(){
  const heroSection = document.getElementById('heroSlider');
  if(!heroSection) return;
  const slides = Array.from(heroSection.querySelectorAll('.hero-slide'));
  const dotsWrap = document.getElementById('heroDots');
  const AUTOPLAY_MS = 5000;

  let index = 0;
  let rafId = null;
  let startTime = 0;      // performance.now() when the current run began
  let elapsed = 0;        // ms already accumulated before the current run (for pause/resume)
  let paused = false;

  // Build one progress-bar button per slide (replaces the old plain dots)
  dotsWrap.innerHTML = slides.map((_, i) =>
    `<button class="hero-progress${i===0?' active':''}" onclick="goToHeroSlide(${i})"
             aria-label="Go to slide ${i+1}" aria-current="${i===0?'true':'false'}">
       <span class="hero-progress-fill"></span>
     </button>`
  ).join('');
  const bars = Array.from(dotsWrap.querySelectorAll('.hero-progress'));
  const fills = bars.map(b => b.querySelector('.hero-progress-fill'));

  function resetFills(){
    fills.forEach(f => { f.style.width = '0%'; });
  }

  function show(i){
    index = (i + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle('active', idx === index));
    bars.forEach((b, idx) => {
      b.classList.toggle('active', idx === index);
      b.setAttribute('aria-current', idx === index ? 'true' : 'false');
    });
  }

  function tick(now){
    if(paused){ rafId = requestAnimationFrame(tick); return; }
    const total = elapsed + (now - startTime);
    const pct = Math.min(total / AUTOPLAY_MS, 1) * 100;
    if(fills[index]) fills[index].style.width = pct + '%';
    if(total >= AUTOPLAY_MS){
      show(index + 1);
      startTimer();
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  function startTimer(){
    if(rafId) cancelAnimationFrame(rafId); // cancel any previous loop — one source of truth
    resetFills();
    elapsed = 0;
    paused = false;
    startTime = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function pause(){
    if(paused || !rafId) return;
    elapsed += performance.now() - startTime;
    paused = true;
  }
  function resume(){
    if(!paused) return;
    startTime = performance.now();
    paused = false;
  }

  window.heroNav = function(dir){ show(index + dir); startTimer(); };
  window.goToHeroSlide = function(i){ show(i); startTimer(); };

  // Pause on hover (desktop) — progress freezes and resumes from where it left off
  heroSection.addEventListener('mouseenter', pause);
  heroSection.addEventListener('mouseleave', resume);
  // Pause while touching (mobile), resume on release
  heroSection.addEventListener('touchstart', pause, {passive:true});
  heroSection.addEventListener('touchend', resume, {passive:true});

  startTimer();
})();
