const container = document.querySelector('.slider-container');
const track = document.getElementById('sliderTrack');
const dotsContainer = document.getElementById('sliderDots');

let originalSlides = Array.from(track.querySelectorAll('.slide'));
let originalCount = originalSlides.length;
let slidesPerPage = getSlidesPerPage();
let slideWidth = 0;
let currentIndex = 0;
let isAnimating = false;
let autoplayInterval = null;
let resizeTimeout = null;

function getSlidesPerPage() {
  const w = window.innerWidth;
  if (w <= 600) return 1;
  if (w <= 991) return 2;
  return 2;
}

// Number of slides to move per click
let slidesPerMove = 2;

// Calculate total dot pages
function getTotalPages() {
  return Math.ceil(originalCount / slidesPerMove);
}


function createClones() {
  Array.from(track.querySelectorAll('.slide.clone')).forEach(c => c.remove());
  const originals = Array.from(track.querySelectorAll('.slide:not(.clone)'));
  for (let i = 0; i < slidesPerPage; i++) {
    const node = originals[i].cloneNode(true);
    node.classList.add('clone');
    track.appendChild(node);
  }
  for (let i = 0; i < slidesPerPage; i++) {
    const node = originals[originals.length - 1 - i].cloneNode(true);
    node.classList.add('clone');
    track.insertBefore(node, track.firstChild);
  }
}

function setWidths() {
  const slidesAll = Array.from(track.querySelectorAll('.slide'));
  const containerWidth = container.clientWidth;
  slideWidth = containerWidth / slidesPerPage;
  slidesAll.forEach(s => {
    s.style.width = `${slideWidth}px`;
  });
}

function initCarousel() {
  originalSlides = Array.from(track.querySelectorAll('.slide:not(.clone)'));
  originalCount = originalSlides.length;
  slidesPerPage = getSlidesPerPage();

  createClones();
  setWidths();

  currentIndex = slidesPerPage;
  track.style.transition = 'none';
  track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
  setTimeout(() => { track.style.transition = 'transform 0.5s ease-in-out'; }, 20);

  createDots();
  updateDots();
  startAutoplay();
}

function moveSlide(direction = 1) {
  if (isAnimating) return;
  isAnimating = true;

  currentIndex += direction * slidesPerMove; // move by 2 (or slidesPerMove)

  track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

  const onEnd = () => {
    track.removeEventListener('transitionend', onEnd);
    const totalWithClones = originalCount + slidesPerPage * 2;

    if (currentIndex < slidesPerPage) {
      currentIndex += originalCount;
      track.style.transition = 'none';
      track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
      void track.offsetWidth;
      track.style.transition = 'transform 0.5s ease-in-out';
    } else if (currentIndex >= originalCount + slidesPerPage) {
      currentIndex -= originalCount;
      track.style.transition = 'none';
      track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
      void track.offsetWidth;
      track.style.transition = 'transform 0.5s ease-in-out';
    }

    updateDots();
    isAnimating = false;
  };

  track.addEventListener('transitionend', onEnd);
}


function goToSlide(index) {
  if (isAnimating) return;
  isAnimating = true;
  currentIndex = slidesPerPage + index;
  track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
  updateDots();

  setTimeout(() => { isAnimating = false; }, 500);
}

function createDots() {
  dotsContainer.innerHTML = '';
  const totalPages = getTotalPages();
  for (let i = 0; i < totalPages; i++) {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    dot.style.cssText = `
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #ccc;
      display: inline-block;
      cursor: pointer;
      transition: background-color 0.3s ease;
    `;
    dot.addEventListener('click', () => {
      goToSlide(i * slidesPerMove); // jump by group
      resetAutoplay();
    });
    dotsContainer.appendChild(dot);
  }
}


function updateDots() {
  const dots = Array.from(dotsContainer.children);
  const logicalIndex = Math.floor(((currentIndex - slidesPerPage) / slidesPerMove) % getTotalPages());
  dots.forEach((d, i) => {
    d.style.backgroundColor = i === logicalIndex ? '#987a5c' : '#47301f';
  });
}


function startAutoplay() {
  stopAutoplay();
  autoplayInterval = setInterval(() => {
    moveSlide(1);
  }, 3000);
}

function stopAutoplay() {
  if (autoplayInterval) clearInterval(autoplayInterval);
}

function resetAutoplay() {
  stopAutoplay();
  startAutoplay();
}

// Wrap the current initCarousel call inside a function triggered by IntersectionObserver
window.addEventListener('load', () => {
  const sliderObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        initCarousel();
        observer.disconnect();
      }
    });
  }, { threshold: 0.1 });
  sliderObserver.observe(container);
});

container.addEventListener('mouseenter', () => stopAutoplay());
container.addEventListener('mouseleave', () => startAutoplay());

window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    Array.from(track.querySelectorAll('.slide.clone')).forEach(n => n.remove());
    Array.from(track.querySelectorAll('.slide')).forEach(s => s.style.width = '');
    track.style.transition = 'none';
    initCarousel();
  }, 150);
});

window.addEventListener('load', () => {
  initCarousel();
});

// Hero section heading visibility based on image 
function checkHeroSize() {
  const hero = document.querySelector('.resize-hero-image');
  const heading = document.querySelector('.hero-heading-wrapper');

  if (!hero || !heading) return;

  const rect = hero.getBoundingClientRect();
  const currVW = (rect.width / window.innerWidth) * 100;
  const currVH = (rect.height / window.innerHeight) * 100;

  const targetVW = 71.1728;
  const targetVH = 79.9428;

  if (currVW < targetVW || currVH < targetVH) {
    heading.style.opacity = "0";
  } else {
    heading.style.opacity = "1";
  }
}

// Check on scroll, resize, and load
window.addEventListener("scroll", checkHeroSize);
window.addEventListener("resize", checkHeroSize);
window.addEventListener("load", checkHeroSize);

window.addEventListener('load', () => {
  speedUpHeroScroll();
  setTimeout(speedUpHeroScroll, 1000);
});
window.addEventListener("scroll", () => {
  const hero = document.querySelector(".hero");
  const second = document.querySelector(".second");

  let scrollY = window.scrollY;

  // Hero fade out gradually
  hero.style.opacity = 1 - scrollY / window.innerHeight;

  // Second section fade in gradually
  if (scrollY > window.innerHeight * 0.8) {
    second.style.opacity = 1;
  } else {
    second.style.opacity = 0;
  }
});

// Header
const toggleBtn = document.querySelector(".menu-toggle");
const sideMenu = document.getElementById("sideMenu");

toggleBtn.addEventListener("click", () => {
  sideMenu.classList.toggle("active");
});
window.addEventListener("scroll", () => {
  if (sideMenu.classList.contains("active")) {
    sideMenu.classList.remove("active");
  }
});
