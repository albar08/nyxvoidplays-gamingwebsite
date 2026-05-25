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

/* Featured games carousel */
const featuredGames = [
    { title: "Shadow Assassin", image: "images/shadow_assassin.jpeg", link: "#" },
    { title: "Cover Montage", image: "images/Nyxvoid Cover.png", link: "#" },
    { title: "Gameplay Highlight", image: "images/shadow_assassin.jpeg", link: "#" },
    { title: "Ranked Clutch", image: "images/nyxvoid logo.png", link: "#" },
    { title: "New Hero Build", image: "images/facebook post.png", link: "#" }
];

function renderCarousel(){
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

renderCarousel();

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
