const container = document.querySelector('.slider-container');
const track = document.getElementById('sliderTrack');
const prevBtn = document.querySelector('.arrow.left');
const nextBtn = document.querySelector('.arrow.right');

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
  startAutoplay();
}

function moveSlide(direction = 1) {
  if (isAnimating) return;
  isAnimating = true;
  currentIndex += direction;
  track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

  const onEnd = () => {
    track.removeEventListener('transitionend', onEnd);
    const totalWithClones = originalCount + slidesPerPage * 2;

    if (currentIndex < slidesPerPage) {
      currentIndex = currentIndex + originalCount;
      track.style.transition = 'none';
      track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
      void track.offsetWidth;
      track.style.transition = 'transform 0.5s ease-in-out';
    } else if (currentIndex >= originalCount + slidesPerPage) {
      currentIndex = currentIndex - originalCount;
      track.style.transition = 'none';
      track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
      void track.offsetWidth;
      track.style.transition = 'transform 0.5s ease-in-out';
    }
    isAnimating = false;
  };

  track.addEventListener('transitionend', onEnd);
}

function startAutoplay() {
  stopAutoplay();
  autoplayInterval = setInterval(() => moveSlide(1), 3500);
}
function stopAutoplay() {
  if (autoplayInterval) clearInterval(autoplayInterval);
}
function resetAutoplay() {
  stopAutoplay();
  startAutoplay();
}

// arrow listeners
prevBtn.addEventListener('click', () => { moveSlide(-1); resetAutoplay(); });
nextBtn.addEventListener('click', () => { moveSlide(1); resetAutoplay(); });

// pause on hover
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

let startX = 0;
let currentX = 0;
let isDragging = false;

function onDragStart(e) {
  stopAutoplay();
  isDragging = true;
  startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
  currentX = startX;
  track.style.transition = 'none'; // disable animation while dragging
}

function onDragMove(e) {
  if (!isDragging) return;
  currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
  const delta = currentX - startX;

  // Clamp: max ek slide ki width tak kheench sakte ho
  const limitedDelta = Math.max(Math.min(delta, slideWidth), -slideWidth);

  track.style.transform = `translateX(-${currentIndex * slideWidth - limitedDelta}px)`;
}

function onDragEnd() {
  if (!isDragging) return;
  isDragging = false;

  const delta = currentX - startX;
  const threshold = slideWidth * 0.25; // 25% drag threshold

  // Enable smooth transition for snap
  track.style.transition = 'transform 0.4s ease';

  if (Math.abs(delta) > threshold) {
    // Swipe left/right → always move exactly one slide
    if (delta > 0) {
      moveSlide(-1);
    } else {
      moveSlide(1);
    }
  } else {
    // Not enough swipe → snap back to currentIndex
    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
  }

  resetAutoplay();
}


function onDragMove(e) {
  if (!isDragging) return;
  currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
  const delta = currentX - startX;

  // Clamp delta so user never drags more than one slide visually
  const limitedDelta = Math.max(Math.min(delta, slideWidth), -slideWidth);

  track.style.transform = `translateX(-${currentIndex * slideWidth - limitedDelta}px)`;
}

function onDragEnd() {
  if (!isDragging) return;
  isDragging = false;

  const delta = currentX - startX;
  const threshold = slideWidth * 0.25; // 25% drag threshold

  // Enable smooth transition again
  track.style.transition = 'transform 0.4s ease';

  if (Math.abs(delta) > threshold) {
    if (delta > 0) {
      moveSlide(-1); // slide to previous
    } else {
      moveSlide(1); // slide to next
    }
  } else {
    // Snap back to current slide smoothly
    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
  }

  resetAutoplay();
}

function onDragEnd() {
  if (!isDragging) return;
  isDragging = false;

  const delta = currentX - startX;
  const threshold = slideWidth * 0.25; // 25% drag threshold

  // Enable smooth transition for snap
  track.style.transition = 'transform 0.4s ease';

  if (Math.abs(delta) > threshold) {
    if (delta > 0) {
      moveSlide(-1); // slide to previous
    } else {
      moveSlide(1); // slide to next
    }
  } else {
    // Snap back to current slide smoothly
    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
  }

  resetAutoplay();
}

// mouse events
track.addEventListener('mousedown', onDragStart);
window.addEventListener('mousemove', onDragMove);
window.addEventListener('mouseup', onDragEnd);

// touch events
track.addEventListener('touchstart', onDragStart);
track.addEventListener('touchmove', onDragMove);
track.addEventListener('touchend', onDragEnd);



// Hero section heading visibility based on image 
function checkHeroSize() {
  const hero = document.querySelector('.resize-hero-image');
  const heading = document.querySelector('.hero-heading-wrapper');

  if (!hero || !heading) return;

  const rect = hero.getBoundingClientRect();
  const currVW = (rect.width / window.innerWidth) * 100;
  const currVH = (rect.height / window.innerHeight) * 100;

  console.log("Current:", currVW.toFixed(2) + "vw", currVH.toFixed(2) + "vh");

  const targetVW = 71.1728;
  const targetVH = 79.9428;

  if (currVW < targetVW || currVH < targetVH) {
    console.log("-> HIDE");
    heading.style.opacity = "0";
  } else {
    console.log("-> SHOW");
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