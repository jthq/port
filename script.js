/**
 * JAMES THOMAS — OBYS STYLE CAROUSEL v2
 */

const projects = [
  {
    brand: "# Brand Name 1",
    type: "UGC Video",
    rightMeta: "Creative Direction, Editing",
    num: "01"
  },
  {
    brand: "# Brand Name 2",
    type: "AI Study Tool",
    rightMeta: "Scripting, Production",
    num: "02"
  },
  {
    brand: "# Brand Name 3",
    type: "Tech Hardware",
    rightMeta: "Voiceover, Video Dev",
    num: "03"
  },
  {
    brand: "# Brand Name 4",
    type: "App Promo",
    rightMeta: "Strategy, Production",
    num: "04"
  },
  {
    brand: "# Brand Name 5",
    type: "Lifestyle",
    rightMeta: "UGC, Creative Direction",
    num: "05"
  }
];

let currentIndex = localStorage.getItem('carouselIndex') !== null 
  ? parseInt(localStorage.getItem('carouselIndex'), 10) 
  : 0; // Default to the very first brand if never visited before
let isAnimating = false;

const carouselTrackEl = document.getElementById("carousel-track");
const metaRightEl = document.getElementById("meta-right");
const mobileProjectsListEl = document.getElementById("mobile-projects-list");
const mobileLayoutQuery = window.matchMedia("(max-width: 768px), (max-aspect-ratio: 3/4)");

function isMobileLayout() {
  return mobileLayoutQuery.matches;
}

// Initialize DOM
function init() {
  // Build Carousel and Meta List
  projects.forEach((proj, idx) => {
    // 1. Carousel Item
    const wrapper = document.createElement("div");
    wrapper.className = "carousel-item-wrapper";
    
    const topTitle = document.createElement("div");
    topTitle.className = "video-top-title";
    topTitle.textContent = `# ${proj.type}`;

    const box = document.createElement("div");
    box.className = "carousel-item-box";
    // Box is intentionally empty to not block future videos
    
    const title = document.createElement("div");
    title.className = "video-title";
    title.innerHTML = '<span style="color: #bbbbbb; font-weight: 400; text-transform: lowercase;"># example</span>';
    
    wrapper.appendChild(topTitle);
    wrapper.appendChild(box);
    wrapper.appendChild(title);
    wrapper.addEventListener("click", () => goToIndex(idx, true));
    carouselTrackEl.appendChild(wrapper);
    
    // 2. Sidebar Meta Item
    const metaItem = document.createElement("div");
    metaItem.className = "meta-item";
    metaItem.textContent = proj.brand;
    metaItem.addEventListener("click", () => goToIndex(idx, true));
    metaRightEl.appendChild(metaItem);
  });

  updateDOM();
}

function initMobileProjects() {
  if (!mobileProjectsListEl) return;

  mobileProjectsListEl.innerHTML = "";

  projects.forEach((proj) => {
    const projectCard = document.createElement("article");
    projectCard.className = "mobile-project-card";

    const projectHeader = document.createElement("div");
    projectHeader.className = "mobile-project-header";

    const projectNum = document.createElement("span");
    projectNum.className = "mobile-project-num";
    projectNum.textContent = proj.num;

    const projectBrand = document.createElement("span");
    projectBrand.className = "mobile-project-brand";
    projectBrand.textContent = proj.brand;

    projectHeader.appendChild(projectNum);
    projectHeader.appendChild(projectBrand);

    const projectType = document.createElement("div");
    projectType.className = "mobile-project-type";
    projectType.textContent = proj.type;

    const projectMeta = document.createElement("div");
    projectMeta.className = "mobile-project-meta";
    projectMeta.textContent = proj.rightMeta;

    projectCard.appendChild(projectHeader);
    projectCard.appendChild(projectType);
    projectCard.appendChild(projectMeta);
    mobileProjectsListEl.appendChild(projectCard);
  });
}

function goToIndex(index, force = false) {
  if (isMobileLayout()) return;

  if (index < 0) {
    index = projects.length - 1;
  } else if (index >= projects.length) {
    index = 0;
  }
  
  if (index === currentIndex || (!force && isAnimating)) return;
  
  currentIndex = index;
  localStorage.setItem('carouselIndex', currentIndex);
  updateDOM();
  
  isAnimating = true;
  // Strict 800ms lock to debounce trackpad scrolls and enforce one snap per scroll
  setTimeout(() => {
    isAnimating = false;
  }, 800); 
}

function updateDOM() {
  if (!carouselTrackEl || !metaRightEl) return;

  // Update Carousel Items
  Array.from(carouselTrackEl.children).forEach((el, i) => {
    el.classList.toggle("active", i === currentIndex);
  });

  // Move Track
  // Each item is 68vh height + 32vh gap = 100vh total shift
  const shiftAmount = -(currentIndex * 100); 
  carouselTrackEl.style.transform = `translateY(${shiftAmount}vh)`;

  // Update Meta List
  Array.from(metaRightEl.children).forEach((el, i) => {
    el.classList.toggle("active", i === currentIndex);
  });
}

// Scroll / Wheel Event handling
window.addEventListener("wheel", (e) => {
  if (isMobileLayout()) return;

  if (isAnimating) return;
  
  if (e.deltaY > 0) {
    goToIndex(currentIndex + 1);
  } else if (e.deltaY < 0) {
    goToIndex(currentIndex - 1);
  }
});

// Arrow Keys
window.addEventListener("keydown", (e) => {
  if (isMobileLayout()) return;

  if (e.key === "ArrowDown") goToIndex(currentIndex + 1, true);
  if (e.key === "ArrowUp") goToIndex(currentIndex - 1, true);
});

// Mobile Touch Swipe Support
let touchStartY = 0;
let touchEndY = 0;

window.addEventListener("touchstart", (e) => {
  if (isMobileLayout()) return;

  touchStartY = e.changedTouches[0].screenY;
}, {passive: true});

window.addEventListener("touchend", (e) => {
  if (isMobileLayout()) return;

  touchEndY = e.changedTouches[0].screenY;
  handleSwipe();
}, {passive: true});

function handleSwipe() {
  if (isAnimating) return;
  const swipeDistance = touchStartY - touchEndY;
  const swipeThreshold = 50; // minimum pixels to trigger a snap

  if (swipeDistance > swipeThreshold) {
    // Swiped up -> scroll down to next video
    goToIndex(currentIndex + 1);
  } else if (swipeDistance < -swipeThreshold) {
    // Swiped down -> scroll up to prev video
    goToIndex(currentIndex - 1);
  }
}

// Loader Typing Effect
function runLoader() {
  const loader = document.getElementById('loader');
  const loaderText = document.getElementById('loader-text');
  const bgText = document.getElementById('loader-bg-text');
  if (!loader || !loaderText) return;

  if (typeof asciiArt === 'undefined') {
    loader.classList.add('hidden');
    return;
  }

  const lines = asciiArt.split('\n');
  let i = 0;
  const speed = 2; // practically instant typing
  let isLoaderActive = true;

  function typeWriter() {
    if (i < lines.length) {
      loaderText.textContent += lines[i] + '\n';
      i++;
      setTimeout(typeWriter, speed);
    } else {
      setTimeout(() => {
        loader.classList.add('hidden');
        isLoaderActive = false;
      }, 150); // Hide almost immediately after finishing
    }
  }

  const bgString = "JAMESTHOMAS.me® ";
  let bgIndex = 0;

  function typeBg() {
    if (!isLoaderActive || !bgText) return;
    let chunk = "";
    // Dump huge chunks to fill background instantly
    for(let k = 0; k < 40; k++) {
      chunk += bgString.charAt(bgIndex % bgString.length);
      bgIndex++;
    }
    bgText.textContent += chunk;
    requestAnimationFrame(typeBg);
  }

  typeWriter();
  typeBg();
}

// Tab Title Animation
let titleToggle = false;
setInterval(() => {
  document.title = titleToggle ? "THOMAS" : "JAMES";
  titleToggle = !titleToggle;
}, 1000);

// Init
document.addEventListener('DOMContentLoaded', () => {
  runLoader();
  init(); // RESTORED init()
  initMobileProjects();
});
