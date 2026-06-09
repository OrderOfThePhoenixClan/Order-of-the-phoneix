const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.getElementById('nav-links');
const links = document.querySelectorAll('#nav-links li a');

mobileMenu.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenu.innerHTML = navLinks.classList.contains('active')
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
});

links.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenu.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });
});

// --- LOADING SCREEN & INTRO (ARQUITECTURA SÓLIDA) ---
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loaderBar');
const loaderPercent = document.getElementById('loaderPercent');
const introScreen = document.getElementById('introAnimation');
const mainContent = document.getElementById('mainContent');
const introTimerBar = document.getElementById('introTimerBar');
const introSkip = document.getElementById('introSkip');
const introAmbient = document.getElementById('introAmbient');
const introStab = document.getElementById('introStab');

let animStart = null;
const LOAD_DURATION = 2500;
const INTRO_DURATION = 1690;
let introEnded = false;

function animateLoader() {
    if (animStart === null) animStart = Date.now();

    const elapsed = Date.now() - animStart;
    const progress = Math.min(elapsed / LOAD_DURATION, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const percent = Math.round(eased * 100);

    loaderBar.style.width = percent + '%';
    loaderPercent.textContent = percent + '%';

    if (progress < 1) {
        requestAnimationFrame(animateLoader);
    } else {
        loader.classList.add('hidden');
        setTimeout(startIntro, 600);
    }
}

const introGif = document.getElementById('introGif');

function startIntro() {
    loader.style.display = 'none'; 
    introScreen.classList.add('active');
    createIntroParticles();

    introAmbient.volume = 0.15;
    introAmbient.loop = true;
    introAmbient.play().catch(() => {});

    // Stab a los 2.4s (40% de 6000ms)
    const stabTimer = setTimeout(() => {
        if (!introEnded) {
            introStab.volume = 0.5;
            introStab.currentTime = 0;
            introStab.play().catch(() => {});
        }
    }, INTRO_DURATION * 0.4);

    // Fin de la intro cuando termina el GIF
    setTimeout(endIntro, INTRO_DURATION);

    startTimerBar();
}

function startTimerBar() {
    const introStart = Date.now();
    function updateTimer() {
        if (introEnded) return;
        const elapsed = Date.now() - introStart;
        const progress = Math.min(elapsed / INTRO_DURATION, 1);
        introTimerBar.style.width = (progress * 100) + '%';
        
        if (progress < 1) {
            requestAnimationFrame(updateTimer);
        } else {
            endIntro();
        }
    }
    requestAnimationFrame(updateTimer);
}

function endIntro() {
    if (introEnded) return;
    introEnded = true;

    introAmbient.pause();
    introStab.pause();

    introScreen.classList.remove('active');
    introScreen.classList.add('hidden');

    // Transición segura e inquebrantable al contenido principal de la web
    setTimeout(() => {
        introScreen.style.display = 'none';
        mainContent.classList.add('active');
        document.body.style.overflow = 'auto';
        setTimeout(initPageEffects, 100);
    }, 600);
}

introSkip.addEventListener('click', endIntro);

// Intro background particles
function createIntroParticles() {
    const container = document.getElementById('introParticles');
    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.classList.add('intro-bg-particle');
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (Math.random() * 4 + 3) + 's';
        p.style.animationDelay = (Math.random() * 5) + 's';
        p.style.width = (Math.random() * 4 + 2) + 'px';
        p.style.height = p.style.width;
        container.appendChild(p);
    }
}

// --- CARRUSEL ---
const adminTrack = document.getElementById('adminTrack');
const adminCards = document.querySelectorAll('.admin-card');
const dotsContainer = document.getElementById('adminDots');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

adminCards.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => scrollToIndex(index));
    dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.dot');

function getCardWidth() {
    return adminCards[0].offsetWidth + (parseFloat(getComputedStyle(adminTrack).gap) || 0);
}

function scrollToIndex(index) {
    adminTrack.scrollTo({ left: index * getCardWidth(), behavior: 'smooth' });
}

function scrollNext() {
    const maxScroll = adminTrack.scrollWidth - adminTrack.clientWidth;
    if (adminTrack.scrollLeft >= maxScroll - 10) {
        adminTrack.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
        adminTrack.scrollBy({ left: getCardWidth(), behavior: 'smooth' });
    }
}

function scrollPrev() {
    if (adminTrack.scrollLeft <= 10) {
        const maxScroll = adminTrack.scrollWidth - adminTrack.clientWidth;
        adminTrack.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
        adminTrack.scrollBy({ left: -getCardWidth(), behavior: 'smooth' });
    }
}

nextBtn.addEventListener('click', scrollNext);
prevBtn.addEventListener('click', scrollPrev);

adminTrack.addEventListener('scroll', () => {
    const scrollPosition = adminTrack.scrollLeft;
    const totalCardWidth = getCardWidth();
    let currentIndex = Math.round(scrollPosition / totalCardWidth);
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[currentIndex]) dots[currentIndex].classList.add('active');
});

// --- MODAL ---
const modal = document.getElementById("miModalGaleria");
const imagenModal = document.getElementById("imagenEnModal");
const textoModal = document.getElementById("textoEnModal");

function abrirModal(rutaImagen, textoDescripcion) {
    modal.style.display = "block";
    imagenModal.src = rutaImagen;
    textoModal.innerHTML = textoDescripcion;
    document.body.style.overflow = "hidden";
}

function cerrarModal() {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
}

window.onclick = function(event) {
    if (event.target === modal) cerrarModal();
};

// --- PAGE EFFECTS (sparks & smoke) ---
function initPageEffects() {
    const sparksContainer = document.getElementById('sparks');
    for (let i = 0; i < 30; i++) {
        let spark = document.createElement('div');
        spark.classList.add('spark');
        spark.style.left = Math.random() * 100 + 'vw';
        spark.style.animationDuration = (Math.random() * 3 + 2) + 's';
        spark.style.animationDelay = Math.random() * 5 + 's';
        sparksContainer.appendChild(spark);
    }

    const smokeContainer = document.getElementById('smoke');
    for (let i = 0; i < 15; i++) {
        let smoke = document.createElement('div');
        smoke.classList.add('smoke-particle');
        let size = Math.random() * 200 + 150 + 'px';
        smoke.style.width = size;
        smoke.style.height = size;
        smoke.style.left = Math.random() * 100 + 'vw';
        smoke.style.bottom = (Math.random() * -30 - 20) + 'vh';
        smoke.style.animationDuration = (Math.random() * 8 + 6) + 's';
        smoke.style.animationDelay = Math.random() * 8 + 's';
        smokeContainer.appendChild(smoke);
    }

    // Fade in on scroll
    const faders = document.querySelectorAll('.fade-in');
    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };
    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        });
    }, appearOptions);
    faders.forEach(fader => appearOnScroll.observe(fader));

    // Sonidos
    const hoverSound = document.getElementById('hoverSound');
    const clickSound = document.getElementById('clickSound');
    hoverSound.volume = 0.3;
    clickSound.volume = 0.3;

    const interactables = document.querySelectorAll('.glass-box, .btn, .scroll-down-btn, nav ul li a, .close-modal, .dot, .carousel-control');
    interactables.forEach(item => {
        item.addEventListener('mouseover', () => {
            hoverSound.currentTime = 0;
            hoverSound.play().catch(() => {});
        });
        if (item.classList.contains('carousel-control') || item.classList.contains('dot')) {
            item.addEventListener('click', () => {
                clickSound.currentTime = 0;
                clickSound.play();
            });
        }
    });

    const contactButtons = document.querySelectorAll('.contact-btn .btn');
    contactButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            clickSound.currentTime = 0;
            clickSound.play();
        });
    });
}

// --- START LOGIC ---
document.body.style.overflow = 'hidden';
requestAnimationFrame(animateLoader);
