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

// Close menu when clicking outside
document.addEventListener('click', (e) => {
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
    link.addEventListener('click', function() {
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
    const grid = document.getElementById('highlightsGrid');
    if(!grid) return;
    featuredGames.forEach(g=>{
        const card = document.createElement('div');
        card.className = 'highlight-card fade-in';
        card.innerHTML = `<a href="${g.link}" aria-label="${g.title}"><img src="${g.image}" alt="${g.title}"><h3>${g.title}</h3></a>`;
        grid.appendChild(card);
        observer.observe(card);
    });
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
