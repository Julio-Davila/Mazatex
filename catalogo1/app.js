/* MAZATEX — configuración de publicación.
   Escribe el número de la empresa en formato internacional SIN +, espacios ni guiones.
   Ejemplo peruano ficticio: '51999999999'. Dejar vacío muestra la opción de copiar el pedido. */
const BUSINESS_WHATSAPP = '';

const products = [
  {id:'cafarena',name:'Cafarena',category:'Polos',description:'Prenda versátil y abrigadora que ofrece comodidad y estilo en igual medida.',sizes:[1,2,4,6]},
  {id:'polo',name:'Polo manga larga / corta',category:'Polos',description:'Prenda de algodón, ligera, cómoda y transpirable para su uso diario.',sizes:[1,2,4,6]},
  {id:'biviri',name:'Bivirís',category:'Polos',description:'Diseño sutil y cómodo, confeccionado en paño de alta calidad.',sizes:[1,2,4,6]},
  {id:'body-clinico',name:'Body clínico',category:'Bodies',description:'Algodón 100% Pima, suave, fresco y transpirable para recién nacidos.',sizes:[1,2,4,6]},
  {id:'body-tortuga',name:'Body cuello tortuga',category:'Bodies',description:'Cuello alto doblado que ofrece protección adicional frente al frío.',sizes:[1,2,4,6]},
  {id:'body-ml',name:'Body MC / ML',category:'Bodies',description:'Body de paño de calidad que combina comodidad y un diseño delicado.',sizes:[1,2,4,6]},
  {id:'short',name:'Short',category:'Pantalones',description:'Liviano y fresco, diseñado para permitir libertad de movimiento.',sizes:[1,2,4,6]},
  {id:'pantalon-pie',name:'Pantalón con pie',category:'Pantalones',description:'Pantalón de algodón con pie, delicado y confortable.',sizes:[1,2,4,6]},
  {id:'pantalon',name:'Pantalón',category:'Pantalones',description:'Diseñado para la piel delicada del bebé, flexible y cómodo.',sizes:[1,2,4,6]},
  {id:'babero',name:'Baberos con pita',category:'Accesorios',description:'Ayudan a proteger la ropa durante la alimentación y el juego.',sizes:[]},
  {id:'babitas',name:'Babitas',category:'Accesorios',description:'Algodón Pima con reverso de felpa absorbente.',sizes:[]},
  {id:'hombreras',name:'Hombreras',category:'Accesorios',description:'Accesorio suave y práctico, confeccionado en algodón Pima.',sizes:[]},
  {id:'gorros',name:'Gorros',category:'Accesorios',description:'Gorritos de algodón que ofrecen abrigo suave.',sizes:[]},
  {id:'colcha',name:'Colcha burbuja',category:'Accesorios',description:'Manta acogedora con textura burbuja, pensada para el confort del bebé.',sizes:[]}
];

const colors = [
  ['Rosa pastel','#f4ccd4'],['Celeste suave','#bfd9f1'],['Beige arena','#e6ccb6'],['Blanco nube','#f8f7f3'],['Gris perla','#d6d5d8'],
  ['Lila lavanda','#d8c9e9'],['Verde menta','#c9dfd2'],['Amarillo vainilla','#f9e7b9'],['Durazno suave','#f5c9b6'],['Coral bebé','#f49da4'],
  ['Azul humo','#a9bcd1'],['Marfil suave','#eee7d9'],['Malva delicado','#cdb3c7'],['Arena tostada','#caa88c'],['Aqua claro','#bee8e4']
];

const imageUrl = p => `assets/products/${p.id}.webp`;
const byId = id => document.getElementById(id);
const getColorData = () => colors.find(c => c[0] === selectedColor) || colors[0];

let category = 'Todos', search = '', selectedColor = colors[0][0], modalProduct = null, modalSize = null;
let basket = [];

try {
  const stored = JSON.parse(localStorage.getItem('mazatex-cart-v1') || '[]');
  if (Array.isArray(stored)) basket = stored.filter(x => products.some(p => p.id === x.id)).slice(0, 100);
} catch {}

const save = () => {
  try { localStorage.setItem('mazatex-cart-v1', JSON.stringify(basket)); } catch {}
  renderCount();
};

let toastTimer;
function toast(message) {
  const el = byId('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

const escapeText = str => String(str)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');

function renderProducts() {
  const currentColor = getColorData();
  const list = products.filter(p =>
    (category === 'Todos' || p.category === category) &&
    (p.name + ' ' + p.description).toLowerCase().includes(search)
  );

  byId('products-grid').innerHTML = list.length
    ? list.map(p => `
      <article class="product-card">
        <div class="product-photo tone-photo" style="--tone:${currentColor[1]}">
          <img src="${imageUrl(p)}" alt="${escapeText(p.name)} MAZATEX" loading="lazy">
          <span class="product-category">${escapeText(p.category)}</span>
          <span class="product-color-badge"><i style="background:${currentColor[1]}"></i> Vista previa en ${escapeText(currentColor[0])}</span>
        </div>
        <div class="product-data">
          <h3>${escapeText(p.name)}</h3>
          <p>${escapeText(p.description)}</p>
          <div class="product-meta">
            <span>${p.sizes.length ? 'Tallas: 1 · 2 · 4 · 6' : 'Consulta disponibilidad'}</span>
            <button data-product="${p.id}" aria-label="Ver ${escapeText(p.name)}">Ver prenda ↗</button>
          </div>
        </div>
      </article>`).join('')
    : '<div class="empty-state"><span>☁</span>No encontramos prendas con esa búsqueda. Prueba otra palabra.</div>';
}

byId('filters').addEventListener('click', e => {
  const b = e.target.closest('button[data-category]');
  if (!b) return;
  category = b.dataset.category;
  document.querySelectorAll('.filter').forEach(btn => btn.classList.toggle('active', btn === b));
  renderProducts();
});

byId('product-search').addEventListener('input', e => {
  search = e.target.value.trim().toLocaleLowerCase('es');
  renderProducts();
});

byId('products-grid').addEventListener('click', e => {
  const b = e.target.closest('[data-product]');
  if (b) openProduct(b.dataset.product);
});

function renderColors() {
  byId('color-grid').innerHTML = colors.map(([name, hex], i) => `
    <button class="color-option ${selectedColor === name ? 'selected' : ''}" data-color="${i}" aria-pressed="${selectedColor === name}">
      <span class="color-dot" style="background:${hex}"></span>
      <strong>${escapeText(name)}</strong>
      <small>TONO ${String(i + 1).padStart(2, '0')}</small>
    </button>`).join('');

  const entry = getColorData();
  document.documentElement.style.setProperty('--selected-tone', entry[1]);
  byId('selected-color-label').textContent = entry[0];
  byId('selected-color-dot').style.background = entry[1];
}

byId('color-grid').addEventListener('click', e => {
  const b = e.target.closest('[data-color]');
  if (!b) return;
  selectedColor = colors[Number(b.dataset.color)][0];
  renderColors();
  renderProducts();
  if (modalProduct) openProduct(modalProduct.id);
  renderCart();
  toast(`Color seleccionado: ${selectedColor}`);
});

byId('see-products').addEventListener('click', () => byId('coleccion').scrollIntoView({ behavior: 'smooth' }));

function openProduct(id) {
  modalProduct = products.find(p => p.id === id);
  if (!modalProduct) return;
  modalSize = modalProduct.sizes[0] || null;
  const col = getColorData();

  byId('modal-body').innerHTML = `
    <div class="modal-grid">
      <div class="modal-photo tone-photo" style="--tone:${col[1]}">
        <img src="${imageUrl(modalProduct)}" alt="${escapeText(modalProduct.name)}">
        <div class="modal-photo-badge"><i style="background:${col[1]}"></i><span>${escapeText(col[0])}</span></div>
      </div>
      <div class="modal-details">
        <span class="eyebrow">✧ ${escapeText(modalProduct.category.toUpperCase())}</span>
        <h2 id="modal-name">${escapeText(modalProduct.name)}</h2>
        <p>${escapeText(modalProduct.description)}</p>
        ${modalProduct.sizes.length ? `
          <label class="field-label">Selecciona tu talla</label>
          <div class="size-choices">
            ${modalProduct.sizes.map(s => `<button class="size-pill ${s === modalSize ? 'active' : ''}" data-size="${s}" aria-pressed="${s === modalSize}">${s}</button>`).join('')}
          </div>` : '<p>Este accesorio no utiliza las tallas 1–6.</p>'}
        <label class="field-label">Vista previa del color elegido</label>
        <div class="modal-color-preview">
          <span style="background:${col[1]}"></span>
          <strong>${escapeText(selectedColor)}</strong>
          <small>La prenda se muestra con el tono seleccionado como referencia visual.</small>
        </div>
        <p class="modal-note">Puedes cambiar el color en la sección “Elige el color perfecto” y verás la prenda actualizarse automáticamente.</p>
        <button class="btn primary full" id="add-product">Añadir a mi selección ♡</button>
        <p class="modal-note">No se realiza ningún cobro en esta web.</p>
      </div>
    </div>`;

  byId('product-modal').hidden = false;
  document.body.style.overflow = 'hidden';
}

byId('modal-body').addEventListener('click', e => {
  const b = e.target.closest('[data-size]');
  if (b) {
    modalSize = Number(b.dataset.size);
    document.querySelectorAll('.size-pill').forEach(n => {
      n.classList.toggle('active', n === b);
      n.setAttribute('aria-pressed', n === b ? 'true' : 'false');
    });
  }

  if (e.target.closest('#add-product') && modalProduct) {
    basket.push({ id: modalProduct.id, size: modalSize, color: selectedColor });
    save();
    closeModal();
    toast('Producto añadido a tu selección ♡');
  }
});

function closeModal() {
  byId('product-modal').hidden = true;
  document.body.style.overflow = '';
  modalProduct = null;
}

byId('modal-close').addEventListener('click', closeModal);
byId('product-modal').addEventListener('click', e => { if (e.target === byId('product-modal')) closeModal(); });

function renderCount() { byId('bag-count').textContent = basket.length; }

function cartText() {
  const name = byId('client-name').value.trim();
  return `Hola MAZATEX 👋\n${name ? 'Soy ' + name + '.\n' : ''}Quisiera consultar disponibilidad y precio de estas prendas:\n\n${basket.map((item, i) => {
    const p = products.find(p => p.id === item.id);
    return `${i + 1}. ${p.name}${item.size ? ' | Talla ' + item.size : ''} | Color de preferencia: ${item.color}`;
  }).join('\n')}\n\n¿Me confirman stock, colores, tallas y precios? ¡Gracias!`;
}

function renderCart() {
  const currentColor = getColorData();
  byId('cart-items').innerHTML = basket.length ? basket.map((item, index) => {
    const p = products.find(p => p.id === item.id);
    const colorInfo = colors.find(c => c[0] === item.color) || currentColor;
    return `
      <div class="cart-entry">
        <div class="cart-entry-photo tone-photo" style="--tone:${colorInfo[1]}"><img src="${imageUrl(p)}" alt="${escapeText(p.name)}"></div>
        <div>
          <strong>${escapeText(p.name)}</strong>
          <small>${item.size ? 'Talla ' + item.size + ' · ' : ''}<span class="cart-color-inline"><i style="background:${colorInfo[1]}"></i>${escapeText(item.color)}</span></small>
        </div>
        <button data-remove="${index}" aria-label="Eliminar ${escapeText(p.name)}">×</button>
      </div>`;
  }).join('') : '<div class="empty-state"><span>♡</span>Tu selección está vacía.<br>Explora nuestros productos y guarda tus favoritos.</div>';

  byId('send-order').disabled = !basket.length;
  byId('copy-order').disabled = !basket.length;
  byId('contact-hint').textContent = BUSINESS_WHATSAPP
    ? 'Se abrirá WhatsApp con el mensaje de consulta.'
    : 'WhatsApp aún no está configurado. Puedes copiar la lista y enviarla desde tu teléfono.';
}

function openDrawer() {
  renderCart();
  byId('drawer-backdrop').hidden = false;
  byId('cart-drawer').classList.add('open');
  byId('cart-drawer').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  byId('cart-drawer').classList.remove('open');
  byId('cart-drawer').setAttribute('aria-hidden', 'true');
  byId('drawer-backdrop').hidden = true;
  document.body.style.overflow = '';
}

byId('bag-open').addEventListener('click', openDrawer);
byId('contact-order').addEventListener('click', openDrawer);
byId('drawer-close').addEventListener('click', closeDrawer);
byId('drawer-backdrop').addEventListener('click', closeDrawer);
byId('cart-items').addEventListener('click', e => {
  const b = e.target.closest('[data-remove]');
  if (b) {
    basket.splice(Number(b.dataset.remove), 1);
    save();
    renderCart();
  }
});

byId('copy-order').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(cartText());
    toast('Pedido copiado al portapapeles');
  } catch {
    const input = document.createElement('textarea');
    input.value = cartText();
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
    toast('Pedido copiado');
  }
});

byId('send-order').addEventListener('click', () => {
  if (!basket.length) return;
  const text = cartText();
  if (!/^\d{10,15}$/.test(BUSINESS_WHATSAPP)) {
    toast('Falta configurar el número de WhatsApp. Copia tu pedido.');
    return;
  }
  window.open(`https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
});

byId('search-toggle').addEventListener('click', () => {
  byId('coleccion').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => byId('product-search').focus({ preventScroll: true }), 400);
});

const mobileMenu = byId('mobile-menu');
const mobileBackdrop = byId('mobile-menu-backdrop');
const menuToggle = byId('menu-toggle');
function setMobileMenu(open) {
  mobileMenu.hidden = !open;
  mobileBackdrop.hidden = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  menuToggle.textContent = open ? '×' : '☰';
}
menuToggle.addEventListener('click', () => setMobileMenu(mobileMenu.hidden));
mobileBackdrop.addEventListener('click', () => setMobileMenu(false));
document.querySelectorAll('#mobile-menu a').forEach(a => a.addEventListener('click', () => setMobileMenu(false)));
window.addEventListener('resize', () => { if (window.innerWidth > 780) setMobileMenu(false); });

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    setMobileMenu(false);
    if (!byId('product-modal').hidden) closeModal();
    if (byId('cart-drawer').classList.contains('open')) closeDrawer();
  }
});

byId('year').textContent = new Date().getFullYear();
renderProducts();
renderColors();
renderCount();
renderCart();
