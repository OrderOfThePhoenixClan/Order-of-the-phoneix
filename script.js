const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.getElementById('nav-links');
const links = document.querySelectorAll('#nav-links li a');

mobileMenu.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    if (navLinks.classList.contains('active')) {
        mobileMenu.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    } else {
        mobileMenu.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }
});

links.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenu.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });
});

// --- LÓGICA DEL CARRUSEL (SOLO MANUAL) ---
const adminTrack = document.getElementById('adminTrack');
const adminCards = document.querySelectorAll('.admin-card');
const dotsContainer = document.getElementById('adminDots');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

adminCards.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    
    dot.addEventListener('click', () => {
        scrollToIndex(index);
    });
    dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.dot');

function getCardWidth() {
    return adminCards[0].offsetWidth + (parseFloat(getComputedStyle(adminTrack).gap) || 0);
}

function scrollToIndex(index) {
    adminTrack.scrollTo({
        left: index * getCardWidth(),
        behavior: 'smooth'
    });
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
    if(dots[currentIndex]) {
        dots[currentIndex].classList.add('active');
    }
});

// Lógica del Modal (Galería)
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
    if (event.target === modal) {
        cerrarModal();
    }
}

// Chispas
const sparksContainer = document.getElementById('sparks');
for (let i = 0; i < 30; i++) {
    let spark = document.createElement('div');
    spark.classList.add('spark');
    spark.style.left = Math.random() * 100 + 'vw';
    spark.style.animationDuration = (Math.random() * 3 + 2) + 's'; 
    spark.style.animationDelay = Math.random() * 5 + 's';
    sparksContainer.appendChild(spark);
}

// Humo
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

const appearOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, appearOptions);

faders.forEach(fader => {
    appearOnScroll.observe(fader);
});

// Sonidos
const hoverSound = document.getElementById('hoverSound');
const clickSound = document.getElementById('clickSound');

hoverSound.volume = 0.3;
clickSound.volume = 0.3;

const interactables = document.querySelectorAll('.glass-box, .btn, .scroll-down-btn, nav ul li a, .close-modal, ::selection, .dot, .carousel-control');

interactables.forEach(item => {
    item.addEventListener('mouseover', () => {
        hoverSound.currentTime = 0; 
        hoverSound.play().catch(e => {  });
    });
    if(item.classList.contains('carousel-control') || item.classList.contains('dot')){
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