/* ===========================
   GALLERY.JS — FILTER + LIGHTBOX
   =========================== */

const galleryItems = document.querySelectorAll('.gallery-item');
const filterBtns = document.querySelectorAll('.filter-btn');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const lightboxBackdrop = document.getElementById('lightboxBackdrop');

let currentIndex = 0;
let visibleItems = [];

// ── GSAP ENTRANCE ──
gsap.from('.gallery-item', {
  opacity: 0,
  y: 50,
  duration: 0.6,
  stagger: 0.08,
  ease: 'power3.out',
  delay: 0.3
});

// ── FILTER ──
function updateVisibleItems() {
  visibleItems = Array.from(galleryItems).filter(item => !item.classList.contains('hidden'));
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    galleryItems.forEach(item => {
      const match = filter === 'all' || item.dataset.category === filter;
      if (match) {
        item.classList.remove('hidden');
        gsap.fromTo(item, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
      } else {
        gsap.to(item, {
          opacity: 0, y: -10, duration: 0.25, ease: 'power2.in',
          onComplete: () => item.classList.add('hidden')
        });
      }
    });

    setTimeout(updateVisibleItems, 300);
  });
});

updateVisibleItems();

// ── LIGHTBOX ──
function openLightbox(index) {
  currentIndex = index;
  const item = visibleItems[index];
  if (!item) return;

  const img = item.querySelector('img');
  const title = item.querySelector('.gallery-info h3')?.textContent || '';
  const sub = item.querySelector('.gallery-info p')?.textContent || '';

  lightboxImg.style.opacity = '0';
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = title + (sub ? ` — ${sub}` : '');

  lightboxImg.onload = () => {
    gsap.to(lightboxImg, { opacity: 1, duration: 0.3 });
  };

  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Update nav buttons
  lightboxPrev.style.display = index > 0 ? 'flex' : 'none';
  lightboxNext.style.display = index < visibleItems.length - 1 ? 'flex' : 'none';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function navigate(dir) {
  const newIndex = currentIndex + dir;
  if (newIndex >= 0 && newIndex < visibleItems.length) {
    openLightbox(newIndex);
  }
}

// Attach zoom buttons
galleryItems.forEach((item) => {
  const zoomBtn = item.querySelector('.gallery-zoom');
  if (zoomBtn) {
    zoomBtn.addEventListener('click', () => {
      updateVisibleItems();
      const idx = visibleItems.indexOf(item);
      if (idx !== -1) openLightbox(idx);
    });
  }
  // Also click on image
  const imgWrap = item.querySelector('.gallery-img-wrap');
  if (imgWrap) {
    imgWrap.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
        updateVisibleItems();
        const idx = visibleItems.indexOf(item);
        if (idx !== -1) openLightbox(idx);
      }
    });
  }
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxBackdrop.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => navigate(-1));
lightboxNext.addEventListener('click', () => navigate(1));

// Keyboard
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') navigate(-1);
  if (e.key === 'ArrowRight') navigate(1);
});
