// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id && id.length > 1) {
      e.preventDefault();
      const el = document.querySelector(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Netlify forms robust AJAX (URL-encoded) with redirect fallback
const form = document.getElementById('quoteForm');
if (form) {
  const ok = document.getElementById('form-success');
  const err = document.getElementById('form-error');

  function toggle(el, show) {
    if (!el) return;
    el.hidden = !show;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const data = new FormData(form);
      const body = new URLSearchParams();
      for (const [k, v] of data.entries()) body.append(k, v);
      // Netlify form name must be encoded too
      body.append('form-name', form.getAttribute('name') || 'quote');

      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });

      if (res.ok) {
        toggle(ok, true); toggle(err, false);
        form.reset();
        // Also navigate to success page for a clean UX
        window.location.assign('/success.html');
      } else {
        throw new Error('Network error');
      }
    } catch (e) {
      toggle(err, true); toggle(ok, false);
      // Fall back to normal submit so Netlify still captures
      form.submit();
    }
  });
}

// Image credit captions: support data-credits (JSON) and data-credit (string)
function applyCredits() {
  document.querySelectorAll('figure[data-credits], figure[data-credit]').forEach(fig => {
    let text = '';
    const jsonAttr = fig.getAttribute('data-credits');
    if (jsonAttr) {
      try {
        const info = JSON.parse(jsonAttr);
        const parts = [];
        if (info.photography) parts.push(`Photography © ${info.photography}`);
        const roles = [];
        if (info.builder && info.builder !== '—') roles.push(`Builder: ${info.builder}`);
        if (info.architect && info.architect !== '—') roles.push(`Architect: ${info.architect}`);
        if (info.supplier && info.supplier !== '—') roles.push(`Supplier: ${info.supplier}`);
        if (roles.length) parts.push(roles.join(' • '));
        text = parts.join(' — ');
      } catch (_) { /* ignore */ }
    }
    if (!text) text = fig.getAttribute('data-credit') || '';
    if (text) {
      fig.classList.add('has-credit');
      let cap = fig.querySelector('.fig-credit');
      if (!cap) {
        cap = document.createElement('figcaption');
        cap.className = 'fig-credit';
        fig.appendChild(cap);
      }
      cap.textContent = text;
    }
  });
}
applyCredits();