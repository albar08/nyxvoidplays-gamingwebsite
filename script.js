const canvas=document.getElementById("particles");
const ctx=canvas.getContext("2d");

canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

let particles=[];

for(let i=0;i<70;i++){

particles.push({
x:Math.random()*canvas.width,
y:Math.random()*canvas.height,
size:Math.random()*3,
speedX:(Math.random()-0.5),
speedY:(Math.random()-0.5)
});

}

function animate(){

ctx.clearRect(0,0,canvas.width,canvas.height);

ctx.fillStyle="#7a3cff";

particles.forEach(p=>{

ctx.beginPath();
ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
ctx.fill();

p.x+=p.speedX;
p.y+=p.speedY;

if(p.x<0||p.x>canvas.width) p.speedX*=-1;
if(p.y<0||p.y>canvas.height) p.speedY*=-1;

});

requestAnimationFrame(animate);

}

animate();
window.addEventListener("resize",()=>{
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

});

// Navbar toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const closeBtn = document.querySelector('.close-btn');

function toggleMenu() {
    navLinks.classList.toggle('active');
}

hamburger.addEventListener('click', toggleMenu);
closeBtn.addEventListener('click', toggleMenu);

// Close menu when clicking a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', toggleMenu);
});

// Close menu when clicking outside (only when the menu is actually open)
document.addEventListener('click', (e) => {
    if (!navLinks.classList.contains('active')) return;
    if (!e.target.closest('nav')) {
        navLinks.classList.remove('active');
    }
});

// Close menu on window resize if it's wider than mobile
window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
        navLinks.classList.remove('active');
    }
});

document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href') || '';
        if(href.startsWith('#')){
            e.preventDefault();
            const target = document.querySelector(href);
            if(target){
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            // update the hash without causing a jump/reload
            if(history.replaceState){
                history.replaceState(null, '', href);
            }
        }
        this.classList.add('float-up');
    });
});

// Add this code (or integrate into existing script)

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

/* Site content: stats, featured games, schedule, testimonials */
function renderCarousel(featuredGames){
    const track = document.getElementById('carouselTrack');
    if(!track) return;
    featuredGames.forEach(g=>{
        const card = document.createElement('div');
        card.className = 'carousel-card fade-in';
        card.innerHTML = `<a href="${g.link}" aria-label="${g.title}"><img src="${g.image}" alt="${g.title}"><h3>${g.title}</h3></a>`;
        track.appendChild(card);
        observer.observe(card);
    });
}

function renderHighlightsGrid(featuredGames){
    const ring = document.getElementById('highlightsTrack');
    const dotsWrap = document.getElementById('highlightsDots');
    if(!ring || !featuredGames || !featuredGames.length) return;
    const items = featuredGames;
    const count = items.length;

    // Coverflow tuning
    const spacingX = 245;   // horizontal offset per step away from center
    const spacingZ = 220;   // depth push-back per step
    const angleY   = 62;    // degrees each side card rotates back
    const maxVisible = 2;   // how many cards shown on each side

    items.forEach((g,i)=>{
        const card = document.createElement('div');
        card.className = 'hl3d-card';
        card.dataset.index = i;
        card.innerHTML = `<a href="${g.link}" aria-label="${g.title}"><img src="${g.image}" alt="${g.title}" draggable="false"><h3>${g.title}</h3></a>`;
        ring.appendChild(card);
    });

    // Build dots
    if(dotsWrap){
        items.forEach((_,i)=>{
            const dot = document.createElement('button');
            dot.className = 'hl3d-dot';
            dot.dataset.index = i;
            dot.setAttribute('aria-label','Go to highlight '+(i+1));
            dotsWrap.appendChild(dot);
        });
    }

    let current = 0;
    const cards = ring.querySelectorAll('.hl3d-card');
    const dots = dotsWrap ? dotsWrap.querySelectorAll('.hl3d-dot') : [];

    // Shortest signed distance from the active card (wraps around)
    function relOffset(i, active){
        let d = i - active;
        while(d >  count/2) d -= count;
        while(d < -count/2) d += count;
        return d;
    }

    function layout(active){
        cards.forEach((c,i)=>{
            const d = relOffset(i, active);
            const ad = Math.abs(d);
            if(ad > maxVisible){
                c.style.opacity = 0;
                c.style.pointerEvents = 'none';
                c.style.transform = `translateX(${d<0?-1:1}px) translateZ(${-spacingZ*3}px)`;
                return;
            }
            c.style.pointerEvents = '';
            const x = d * spacingX;
            const z = -Math.abs(d) * spacingZ;
            const ry = -d * angleY;
            const scale = 1 - ad * 0.05;
            const op = 1 - ad * 0.18;
            c.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${ry}deg) scale(${scale})`;
            c.style.opacity = op;
            c.classList.toggle('is-active', i===((Math.round(active)%count)+count)%count);
        });
        const rounded = ((Math.round(active)%count)+count)%count;
        dots.forEach((dd,i)=>dd.classList.toggle('is-active', i===rounded));
    }

    // Live fractional positioning (drag)
    function rotateTo(idx){
        layout(idx);
    }

    // Snap to a whole card index (wraps around)
    function goTo(index){
        const n = Math.round(index);
        current = ((n % count) + count) % count;
        layout(current);
    }

    ring._goTo = goTo;
    ring._rotateTo = rotateTo;
    ring._next = ()=>goTo(current+1);
    ring._prev = ()=>goTo(current-1);
    ring._current = ()=>current;
    ring._setCurrent = (v)=>{ current=v; };
    ring._count = count;

    goTo(0);
}

function renderSchedule(schedule){
    const container = document.getElementById('scheduleContainer');
    if(!container || !schedule) return;
    schedule.forEach(item=>{
        const row = document.createElement('div');
        row.className = 'schedule-item fade-in';
        row.innerHTML = `<span class="schedule-day">${item.day}</span><span class="schedule-time">${item.time}</span>`;
        container.appendChild(row);
        observer.observe(row);
    });
}

function renderTestimonials(testimonials){
    const grid = document.getElementById('testimonialsGrid');
    if(!grid || !testimonials) return;
    testimonials.forEach(t=>{
        const card = document.createElement('div');
        card.className = 'testimonial-card fade-in';
        card.innerHTML = `<p class="testimonial-quote">“${t.quote}”</p><p class="testimonial-author">— ${t.author}</p>`;
        grid.appendChild(card);
        observer.observe(card);
    });
}

function applyStats(stats){
    if(!stats) return;
    const yt = document.getElementById('ytCount');
    const tt = document.getElementById('ttCount');
    const fb = document.getElementById('fbCount');
    if(yt && stats.youtube != null) yt.textContent = stats.youtube;
    if(tt && stats.tiktok != null) tt.textContent = stats.tiktok;
    if(fb && stats.facebook != null) fb.textContent = stats.facebook;
}

fetch('data/content.json')
    .then(res => res.json())
    .then(data => {
        if(data.featuredGames){
            renderCarousel(data.featuredGames);
            renderHighlightsGrid(data.featuredGames);
        }
        renderSchedule(data.schedule);
        renderTestimonials(data.testimonials);
        applyStats(data.stats);
    })
    .catch(err => console.error('Failed to load site content:', err));

const track = document.getElementById('carouselTrack');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
function getCardScroll(){
    const card = track.querySelector('.carousel-card');
    if(!card) return 276;
    const gap = parseInt(getComputedStyle(track).gap) || 16;
    return card.offsetWidth + gap;
}

if(prevBtn && nextBtn && track){
    prevBtn.addEventListener('click', ()=>{
        const scroll = getCardScroll();
        track.scrollBy({ left: -scroll, behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', ()=>{
        const scroll = getCardScroll();
        track.scrollBy({ left: scroll, behavior: 'smooth' });
    });

    // Continuous autoplay carousel movement
    let autoScroll = true;
    let lastTime = performance.now();
    const speed = 700; // pixels per second

    function animateCarousel(time){
        const delta = (time - lastTime) / 1000;
        lastTime = time;
        if(autoScroll){
            track.scrollLeft += delta * speed;
            if(track.scrollLeft + track.clientWidth >= track.scrollWidth - 1){
                track.scrollLeft = 0;
            }
        }
        requestAnimationFrame(animateCarousel);
    }

    requestAnimationFrame(animateCarousel);

    const pauseCarousel = ()=> autoScroll = false;
    const resumeCarousel = ()=> autoScroll = true;

    track.addEventListener('mouseenter', pauseCarousel);
    track.addEventListener('mouseleave', resumeCarousel);
    track.addEventListener('touchstart', pauseCarousel, {passive:true});
    track.addEventListener('touchend', resumeCarousel);
}

/* All Highlights 3D carousel — swipe/drag only (no buttons) */
const hlRing = document.getElementById('highlightsTrack');
const hlStage = document.querySelector('.hl3d-stage');
const hlDots = document.getElementById('highlightsDots');

if(hlRing && hlStage){
    const ready = ()=> typeof hlRing._rotateTo === 'function';

    // Dots still jump directly to a highlight
    if(hlDots){
        hlDots.addEventListener('click', (e)=>{
            const dot = e.target.closest('.hl3d-dot');
            if(!dot || !ready()) return;
            hlRing._goTo(parseInt(dot.dataset.index,10)||0);
        });
    }

    // Drag/swipe: cover stack follows the pointer, then snaps to nearest card
    let isDown=false, startX=0, startIndex=0, moved=false, dragIndex=0;
    const perPx = 1/160; // card index change per pixel dragged
    const dragThreshold = 6;

    const onDown=(x)=>{
        if(!ready()) return;
        isDown=true; moved=false;
        startX=x;
        startIndex=hlRing._current();
        dragIndex=startIndex;
        hlStage.classList.add('is-dragging');
    };
    const onMove=(x, e)=>{
        if(!isDown || !ready()) return;
        const dx = x - startX;
        if(Math.abs(dx) > dragThreshold) moved=true;
        // drag left -> next; drag right -> prev
        dragIndex = startIndex - dx * perPx;
        hlRing._rotateTo(dragIndex);
        if(moved && e && e.cancelable) e.preventDefault();
    };
    const onUp=()=>{
        if(!isDown) return;
        isDown=false;
        hlStage.classList.remove('is-dragging');
        if(!ready()) return;
        hlRing._goTo(dragIndex);
    };

    // Mouse drag
    hlStage.addEventListener('mousedown',(e)=>{ e.preventDefault(); onDown(e.pageX); });
    hlStage.addEventListener('click',(e)=>{ if(moved){ e.preventDefault(); e.stopPropagation(); } }, true);
    window.addEventListener('mousemove',(e)=>onMove(e.pageX, e));
    window.addEventListener('mouseup', onUp);

    // Touch swipe
    hlStage.addEventListener('touchstart',(e)=>onDown(e.touches[0].clientX),{passive:true});
    hlStage.addEventListener('touchmove',(e)=>onMove(e.touches[0].clientX, e),{passive:false});
    hlStage.addEventListener('touchend', onUp);

    // Hover a side card -> auto-advance it to the front after a short delay
    let hoverTimer = null;
    const cancelHover = ()=>{ if(hoverTimer){ clearTimeout(hoverTimer); hoverTimer = null; } };

    hlRing.querySelectorAll('.hl3d-card').forEach(card=>{
        card.addEventListener('mouseenter', ()=>{
            if(!ready() || moved || isDown) return;
            const idx = parseInt(card.dataset.index,10);
            if(isNaN(idx)) return;
            // don't re-trigger if it's already the active card
            if(idx === hlRing._current()) return;
            cancelHover();
            hoverTimer = setTimeout(()=>{
                if(moved || isDown) return;
                hlRing._goTo(idx);
            }, 220);
        });
        card.addEventListener('mouseleave', cancelHover);
    });

    // Cancel any pending auto-advance while dragging/swiping
    hlStage.addEventListener('mousedown', cancelHover);
    hlStage.addEventListener('touchstart', cancelHover, {passive:true});

    // Prevent a link from opening right after a drag
    hlRing.querySelectorAll('a').forEach(a=>{
        a.addEventListener('click',(e)=>{ if(moved){ e.preventDefault(); } });
    });
}

/* Theme toggle (light/dark) */
const themeToggle = document.getElementById('themeToggle');
function applyTheme(mode){
    if(mode === 'light'){
        document.documentElement.classList.add('light-theme');
    } else {
        document.documentElement.classList.remove('light-theme');
    }
}
const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);
if(themeToggle){
    // set initial aria-pressed and icon
    themeToggle.setAttribute('role','button');
    themeToggle.setAttribute('aria-pressed', savedTheme === 'light');
    themeToggle.textContent = savedTheme === 'light' ? '🌙' : '🌓';

    themeToggle.addEventListener('click', ()=>{
        const isLight = document.documentElement.classList.contains('light-theme');
        const next = isLight ? 'dark' : 'light';
        applyTheme(next);
        localStorage.setItem('theme', next);
        themeToggle.setAttribute('aria-pressed', next === 'light');
        themeToggle.textContent = next === 'light' ? '🌙' : '🌓';
    });
}

/* Footer year */
const copyrightYear = document.getElementById('copyrightYear');
if(copyrightYear){
    copyrightYear.textContent = new Date().getFullYear();
}

/* Social click tracking (fire-and-forget) */
document.querySelectorAll('[data-platform]').forEach(link=>{
    link.addEventListener('click', ()=>{
        const platform = link.getAttribute('data-platform');
        const payload = JSON.stringify({ platform });
        if(navigator.sendBeacon){
            navigator.sendBeacon('/.netlify/functions/track-click', new Blob([payload], { type: 'application/json' }));
        } else {
            fetch('/.netlify/functions/track-click', { method: 'POST', body: payload, keepalive: true }).catch(()=>{});
        }
    });
});
