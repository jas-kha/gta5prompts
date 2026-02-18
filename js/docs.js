/* ===========================
   DOCS.JS — MARKDOWN READER
   =========================== */

// ── CONFIG ──
// Path to the markdown files (server runs from image-gen-prompts/)
const DOCS_BASE = 'GTA 5 Artwork/';

const DOCS = [
  {
    id: 'README',
    file: 'README.md',
    title: 'Overview',
    label: 'Overview'
  },
  {
    id: 'Loading Scene (Call)',
    file: 'Loading Scene (Call).md',
    title: 'Scene: Call',
    label: 'Loading Scene (Call)'
  },
  {
    id: 'Loading Scene (Weapon Take)',
    file: 'Loading Scene (Weapon Take).md',
    title: 'Scene: Weapon Take',
    label: 'Loading Scene (Weapon Take)'
  },
  {
    id: 'Loading Scene (Run)',
    file: 'Loading Scene (Run).md',
    title: 'Scene: Run',
    label: 'Loading Scene (Run)'
  }
];

// ── ELEMENTS ──
const docsBody = document.getElementById('docsBody');
const docsLoading = document.getElementById('docsLoading');
const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const prevDocBtn = document.getElementById('prevDoc');
const nextDocBtn = document.getElementById('nextDoc');
const prevDocTitle = document.getElementById('prevDocTitle');
const nextDocTitle = document.getElementById('nextDocTitle');
const sidebarToggle = document.getElementById('sidebarToggle');
const docsSidebar = document.getElementById('docsSidebar');
const mobileSidebarBtn = document.getElementById('mobileSidebarBtn');

// ── MARKED CONFIG ──
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true
});

// ── LOAD DOC ──
let currentDocIndex = 0;

async function loadDoc(docId) {
  const idx = DOCS.findIndex(d => d.id === docId);
  if (idx === -1) return loadDoc('README');
  currentDocIndex = idx;
  const doc = DOCS[idx];

  // Show loading
  docsLoading.style.display = 'flex';
  docsBody.style.display = 'none';
  docsBody.innerHTML = '';

  // Update sidebar active
  sidebarLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.doc === docId);
  });

  // Update breadcrumb
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = doc.label;

  // Update URL (without reload)
  const url = new URL(window.location);
  url.searchParams.set('doc', docId);
  window.history.pushState({}, '', url);

  try {
    const response = await fetch(DOCS_BASE + doc.file);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const markdown = await response.text();

    // Fix relative image paths — markdown syntax ![alt](src)
    let fixedMarkdown = markdown.replace(
      /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g,
      (match, alt, src) => {
        const fixedSrc = DOCS_BASE + src.trim();
        return `![${alt}](${fixedSrc})`;
      }
    );
    // Fix HTML img tags: src="images/..."
    fixedMarkdown = fixedMarkdown.replace(
      /(<img[^>]+src=["'])(?!https?:\/\/)([^"']+)(["'])/g,
      (match, pre, src, post) => {
        return `${pre}${DOCS_BASE}${src.trim()}${post}`;
      }
    );

    // Parse and render
    docsBody.innerHTML = marked.parse(fixedMarkdown);

    // Highlight code blocks + inject copy buttons
    docsBody.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block);

      // Wrap pre in relative container for button positioning
      const pre = block.parentElement;
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrap';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      // Create copy button
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.innerHTML = '<i class="fas fa-copy"></i><span>Copy</span>';
      wrapper.appendChild(copyBtn);

      copyBtn.addEventListener('click', async () => {
        const text = block.innerText;
        try {
          await navigator.clipboard.writeText(text);
          copyBtn.innerHTML = '<i class="fas fa-check"></i><span>Copied!</span>';
          copyBtn.classList.add('copied');
          gsap.fromTo(copyBtn,
            { scale: 0.9 },
            { scale: 1, duration: 0.3, ease: 'back.out(2)' }
          );
        } catch {
          // Fallback
          const ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          copyBtn.innerHTML = '<i class="fas fa-check"></i><span>Copied!</span>';
          copyBtn.classList.add('copied');
        }
        setTimeout(() => {
          copyBtn.innerHTML = '<i class="fas fa-copy"></i><span>Copy</span>';
          copyBtn.classList.remove('copied');
        }, 2000);
      });
    });


    // Hide loading, show content
    docsLoading.style.display = 'none';
    docsBody.style.display = 'block';

    // Animate in
    gsap.from(docsBody, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: 'power3.out'
    });

    // Scroll to top of content
    docsBody.scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    docsLoading.style.display = 'none';
    docsBody.style.display = 'block';
    docsBody.innerHTML = `
      <div style="text-align:center; padding: 60px 0; color: var(--text-muted);">
        <i class="fas fa-exclamation-triangle" style="font-size:48px; color:var(--orange); margin-bottom:16px; display:block;"></i>
        <h2 style="color:var(--text); margin-bottom:8px;">Could not load document</h2>
        <p>Make sure you're running this site through a local server.</p>
        <p style="margin-top:8px; font-family:var(--font-mono); font-size:13px; color:var(--text-dim);">${err.message}</p>
        <div style="margin-top:24px; padding:20px; background:var(--bg-card); border:1px solid var(--border); border-radius:12px; text-align:left; max-width:400px; margin-left:auto; margin-right:auto;">
          <p style="font-weight:600; color:var(--text); margin-bottom:8px;">Run with a local server:</p>
          <code style="display:block; background:rgba(255,107,0,0.1); border:1px solid rgba(255,107,0,0.2); color:var(--orange); padding:10px 14px; border-radius:8px; font-family:var(--font-mono); font-size:13px;">npx serve .</code>
          <p style="margin-top:8px; font-size:12px; color:var(--text-dim);">Run from the <strong style="color:var(--text)">web/</strong> folder</p>
        </div>
      </div>
    `;
  }

  // Update pagination
  updatePagination(idx);
}

function updatePagination(idx) {
  const prev = DOCS[idx - 1];
  const next = DOCS[idx + 1];

  if (prev) {
    prevDocBtn.style.display = 'flex';
    prevDocTitle.textContent = prev.label;
    prevDocBtn.onclick = (e) => { e.preventDefault(); loadDoc(prev.id); };
  } else {
    prevDocBtn.style.display = 'none';
  }

  if (next) {
    nextDocBtn.style.display = 'flex';
    nextDocTitle.textContent = next.label;
    nextDocBtn.onclick = (e) => { e.preventDefault(); loadDoc(next.id); };
  } else {
    nextDocBtn.style.display = 'none';
  }
}

// ── SIDEBAR LINKS ──
sidebarLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    loadDoc(link.dataset.doc);
    // Close mobile sidebar
    docsSidebar.classList.remove('open');
  });
});

// ── SIDEBAR TOGGLE (desktop) ──
if (sidebarToggle) {
  sidebarToggle.addEventListener('click', () => {
    docsSidebar.classList.toggle('collapsed');
    const icon = sidebarToggle.querySelector('i');
    icon.classList.toggle('fa-chevron-left');
    icon.classList.toggle('fa-chevron-right');
  });
}

// ── MOBILE SIDEBAR ──
if (mobileSidebarBtn) {
  mobileSidebarBtn.addEventListener('click', () => {
    docsSidebar.classList.toggle('open');
  });
}

// ── INIT: read URL param ──
const params = new URLSearchParams(window.location.search);
const initialDoc = params.get('doc') || 'README';
loadDoc(initialDoc);
