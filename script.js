const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function buildParticles() {
  particles = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2.6 + 1,
    speedX: (Math.random() - 0.5) * 1.1,
    speedY: (Math.random() - 0.5) * 1.1
  }));
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((particle) => {
    ctx.beginPath();
    ctx.fillStyle = 'rgba(138, 92, 255, 0.9)';
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();

    particle.x += particle.speedX;
    particle.y += particle.speedY;

    if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
    if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
  });

  requestAnimationFrame(animateParticles);
}

function applyTheme(mode) {
  document.body.setAttribute('data-theme', mode);
  localStorage.setItem('theme', mode);
}

function setupTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.textContent = savedTheme === 'light' ? '☀' : '☾';
    themeToggle.setAttribute('aria-pressed', String(savedTheme === 'light'));
    themeToggle.addEventListener('click', () => {
      const nextTheme = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme);
      themeToggle.textContent = nextTheme === 'light' ? '☀' : '☾';
      themeToggle.setAttribute('aria-pressed', String(nextTheme === 'light'));
    });
  }
}

function setupMobileNav() {
  const menuToggle = document.querySelector('.menu-toggle');
  const primaryNav = document.querySelector('.primary-nav');

  if (!menuToggle || !primaryNav) return;

  menuToggle.addEventListener('click', () => {
    const isOpen = primaryNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  primaryNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      primaryNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

async function renderContent() {
  try {
    const response = await fetch('data/content.json');
    const data = await response.json();

    const featured = data.featuredGames || [];
    const updates = data.updates || [];
    const schedule = data.schedule || [];
    const testimonials = data.testimonials || [];
    const stats = data.stats || {};

    const featuredGrid = document.getElementById('featuredGrid');
    if (featuredGrid) {
      featuredGrid.innerHTML = featured.map((item) => `
        <article class="featured-card">
          <a href="${item.link || '#'}" target="_blank" rel="noreferrer" aria-label="Open ${item.title}">
            <img src="${item.image}" alt="${item.title}">
          </a>
          <div class="content">
            <h3>${item.title}</h3>
            <p>Watch the full moment and follow the next ranked battle.</p>
          </div>
        </article>
      `).join('');
    }

    const updatesContainer = document.getElementById('updatesContainer');
    if (updatesContainer) {
      updatesContainer.innerHTML = updates.map((update) => {
        const media = (() => {
          if (update.video) {
            const isLocalVideo = /\.(mp4|webm|mov|mkv|ogg)$/i.test(update.video);
            if (isLocalVideo) {
              return `
                <video controls preload="metadata" playsinline poster="${update.image || ''}">
                  <source src="${update.video}" type="video/mp4">
                </video>
              `;
            }
            return `<iframe src="${update.video}" allowfullscreen title="${update.title}"></iframe>`;
          }
          if (update.image) {
            return `<img src="${update.image}" alt="${update.title}">`;
          }
          return '';
        })();

        return `
          <article class="update-card">
            <span class="update-close" aria-label="Dismiss update">×</span>
            <h3>${update.title}</h3>
            <p>${update.text}</p>
            ${media}
          </article>
        `;
      }).join('');

      updatesContainer.querySelectorAll('.update-close').forEach((button) => {
        button.addEventListener('click', () => button.closest('.update-card').remove());
      });
    }

    const scheduleContainer = document.getElementById('scheduleContainer');
    if (scheduleContainer) {
      scheduleContainer.innerHTML = schedule.map((item) => `
        <div class="schedule-item">
          <span class="schedule-day">${item.day}</span>
          <span class="schedule-time">${item.time}</span>
        </div>
      `).join('');
    }

    const testimonialsGrid = document.getElementById('testimonialsGrid');
    if (testimonialsGrid) {
      testimonialsGrid.innerHTML = testimonials.map((item) => `
        <article class="featured-card">
          <div class="content">
            <p>“${item.quote}”</p>
            <h3>— ${item.author}</h3>
          </div>
        </article>
      `).join('');
    }

    const ytCount = document.getElementById('ytCount');
    const ttCount = document.getElementById('ttCount');
    const fbCount = document.getElementById('fbCount');

    if (ytCount) ytCount.textContent = stats.youtube ?? 3;
    if (ttCount) ttCount.textContent = stats.tiktok ?? 689;
    if (fbCount) fbCount.textContent = stats.facebook ?? 1500;

    try {
      const liveResponse = await fetch('/.netlify/functions/get-stats', { cache: 'no-store' });
      if (liveResponse.ok) {
        const liveData = await liveResponse.json();
        if (liveData.youtube) ytCount.textContent = liveData.youtube;
        if (liveData.tiktok) ttCount.textContent = liveData.tiktok;
        if (liveData.facebook) fbCount.textContent = liveData.facebook;
      }
    } catch (error) {
      console.warn('Live stats unavailable, using local data instead.', error);
    }
  } catch (error) {
    console.error('Unable to load content:', error);
  }
}

function bindSocialTracking() {
  document.querySelectorAll('[data-platform]').forEach((link) => {
    link.addEventListener('click', () => {
      const platform = link.getAttribute('data-platform');
      const payload = JSON.stringify({ platform });

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/.netlify/functions/track-click', new Blob([payload], { type: 'application/json' }));
      } else {
        fetch('/.netlify/functions/track-click', { method: 'POST', body: payload, keepalive: true }).catch(() => {});
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  buildParticles();
  animateParticles();
  setupTheme();
  setupMobileNav();
  bindSocialTracking();
  renderContent();

  const copyrightYear = document.getElementById('copyrightYear');
  if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
    buildParticles();
  });
});
