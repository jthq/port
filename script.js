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
    brand: "# Yap // Quizard",
    type: "YAPPING VIDEO",
    rightMeta: "Scripting, Production",
    videoSrc: "vids/Yap Quizard.mp4",
    num: "02"
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
  },
  {
    brand: "# Skit // Gauth AI",
    type: "Comedic Skit",
    rightMeta: "Voiceover, Video Dev",
    videoSrc: "vids/gauth_ad.mp4?v=2",
    num: "06"
  }
];

let currentIndex = localStorage.getItem('carouselIndex') !== null 
  ? parseInt(localStorage.getItem('carouselIndex'), 10) 
  : 0; // Default to the very first brand if never visited before
let isAnimating = false;
const activeVideos = {}; // Stores video elements by index
const videoPlaybackState = new Map();

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
    let controls = null;

    if (proj.videoSrc) {
      box.classList.add("video-card");

      const video = document.createElement("video");
      video.className = "video-player";
      video.src = proj.videoSrc;
      video.preload = "metadata";
      video.playsInline = true;
      video.controls = false;
      video.setAttribute("aria-label", proj.brand);

      const playButton = document.createElement("button");
      playButton.type = "button";
      playButton.className = "video-play-button";
      playButton.setAttribute("aria-label", "Play video");
      playButton.textContent = "- play -";

      // Progress and controls container
      controls = document.createElement('div');
      controls.className = 'video-controls';

      const progressTrack = document.createElement('div');
      progressTrack.className = 'progress-track';
      const progressFill = document.createElement('div');
      progressFill.className = 'progress-fill';
      const progressHandle = document.createElement('div');
      progressHandle.className = 'progress-handle';
      progressTrack.appendChild(progressFill);
      progressTrack.appendChild(progressHandle);

      controls.appendChild(progressTrack);

      activeVideos[idx] = video;

      const syncPlayerState = () => {
        wrapper.classList.toggle("video-playing", !video.paused);

        if (currentIndex !== idx && !video.paused) {
          video.pause();
        }
      };

      const updateProgressUI = () => {
        if (!video.duration) return;
        const pct = (video.currentTime / video.duration) * 100;
        progressFill.style.width = pct + '%';
        progressHandle.style.left = pct + '%';
      };

      video.addEventListener('timeupdate', updateProgressUI);
      video.addEventListener('loadedmetadata', updateProgressUI);

      const seekToPct = (pct) => {
        if (!video.duration || !isFinite(video.duration)) return;
        video.currentTime = Math.max(0, Math.min(1, pct / 100)) * video.duration;
      };

      progressTrack.addEventListener('click', (ev) => {
        ev.stopPropagation(); // prevent clicking behind giving playOrPause
        const rect = progressTrack.getBoundingClientRect();
        const x = (ev.clientX - rect.left) / rect.width;
        seekToPct(x * 100);
      });

      let isDragging = false;
      const onPointerMove = (ev) => {
        if (!isDragging) return;
        ev.preventDefault();
        const rect = progressTrack.getBoundingClientRect();
        const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
        const x = (clientX - rect.left) / rect.width;
        const pct = Math.max(0, Math.min(1, x)) * 100;
        progressFill.style.width = pct + '%';
        progressHandle.style.left = pct + '%';
      };

      const onPointerUp = (ev) => {
        if (!isDragging) return;
        isDragging = false;
        document.removeEventListener('mousemove', onPointerMove);
        document.removeEventListener('mouseup', onPointerUp);
        document.removeEventListener('touchmove', onPointerMove);
        document.removeEventListener('touchend', onPointerUp);
        const rect = progressTrack.getBoundingClientRect();
        const clientX = ev.changedTouches ? ev.changedTouches[0].clientX : ev.clientX;
        const x = (clientX - rect.left) / rect.width;
        seekToPct(Math.max(0, Math.min(1, x)) * 100);
      };

      progressHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isDragging = true;
        document.addEventListener('mousemove', onPointerMove);
        document.addEventListener('mouseup', onPointerUp);
      });

      progressHandle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isDragging = true;
        document.addEventListener('touchmove', onPointerMove, {passive:false});
        document.addEventListener('touchend', onPointerUp);
      }, {passive:false});

      const playOrPause = async (event) => {
        event.stopPropagation();

        try {
          if (video.paused) {
            await video.play();
          } else {
            video.pause();
          }
          syncPlayerState();
        } catch (error) {
          console.error("Video playback failed:", error);
        }
      };

      playButton.addEventListener("click", playOrPause);
      video.addEventListener("click", playOrPause);
      video.addEventListener("play", syncPlayerState);
      video.addEventListener("pause", syncPlayerState);

      box.appendChild(video);
      box.appendChild(playButton);
    }
    
    const title = document.createElement("div");
    title.className = "video-title";
    title.textContent = "";
    
    wrapper.appendChild(topTitle);
    wrapper.appendChild(box);
    if (controls) wrapper.appendChild(controls);
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

    if (proj.videoSrc) {
      const mediaFrame = document.createElement("div");
      mediaFrame.className = "mobile-video-frame";

      const video = document.createElement("video");
      video.className = "mobile-video-player";
      video.src = proj.videoSrc;
      video.preload = "metadata";
      video.playsInline = true;
      video.controls = false;
      video.setAttribute("aria-label", proj.brand);

      const videoButton = document.createElement("button");
      videoButton.type = "button";
      videoButton.className = "mobile-video-button";
      videoButton.textContent = "play";
      videoButton.setAttribute("aria-label", "Play video");

      const mobileControls = document.createElement("div");
      mobileControls.className = "mobile-video-controls";

      const mobileProgressTrack = document.createElement("div");
      mobileProgressTrack.className = "mobile-progress-track";
      const mobileProgressFill = document.createElement("div");
      mobileProgressFill.className = "mobile-progress-fill";
      mobileProgressTrack.appendChild(mobileProgressFill);
      mobileControls.appendChild(mobileProgressTrack);

      const syncProgress = () => {
        if (!video.duration) return;
        const pct = (video.currentTime / video.duration) * 100;
        mobileProgressFill.style.width = pct + "%";
      };

      const seekTo = (pct) => {
        if (!video.duration || !Number.isFinite(video.duration)) return;
        video.currentTime = Math.max(0, Math.min(1, pct / 100)) * video.duration;
      };

      const togglePlayback = async (event) => {
        event.stopPropagation();

        try {
          if (video.paused) {
            await video.play();
          } else {
            video.pause();
          }
        } catch (error) {
          console.error("Mobile video playback failed:", error);
        }
      };

      video.addEventListener("timeupdate", syncProgress);
      video.addEventListener("loadedmetadata", () => {
        syncProgress();

        if (!video.duration || !Number.isFinite(video.duration)) return;

        try {
          video.currentTime = Math.min(0.15, Math.max(0.02, video.duration * 0.01));
        } catch (error) {
          console.error("Mobile preview frame setup failed:", error);
        }
      });
      video.addEventListener("play", () => {
        projectCard.classList.add("is-playing");
        videoButton.textContent = "pause";
      });
      video.addEventListener("pause", () => {
        projectCard.classList.remove("is-playing");
        videoButton.textContent = "play";
      });

      videoButton.addEventListener("click", togglePlayback);
      video.addEventListener("click", togglePlayback);

      mobileProgressTrack.addEventListener("click", (event) => {
        event.stopPropagation();
        const rect = mobileProgressTrack.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        seekTo(x * 100);
      });

      mediaFrame.appendChild(video);
      mediaFrame.appendChild(videoButton);
      projectCard.appendChild(mediaFrame);
      projectCard.appendChild(mobileControls);
    }

    projectCard.appendChild(projectHeader);
    projectCard.appendChild(projectType);
    projectCard.appendChild(projectMeta);
    mobileProjectsListEl.appendChild(projectCard);
  });
}

function goToIndex(index, force = false) {
  if (isMobileLayout()) return;

  let isWrapForward = false;
  let isWrapBackward = false;

  if (index < 0) {
    index = projects.length - 1;
    if (currentIndex === 0) isWrapBackward = true;
  } else if (index >= projects.length) {
    index = 0;
    if (currentIndex === projects.length - 1) isWrapForward = true;
  }
  
  if (index === currentIndex || (!force && isAnimating)) return;

  if (activeVideos[currentIndex]) {
    saveCurrentVideoState(currentIndex);
  }
  
  currentIndex = index;
  localStorage.setItem('carouselIndex', currentIndex);
  isAnimating = true;

  if (isWrapForward) {
    // Clone first item and append to the end for continuous scroll
    const clone = carouselTrackEl.children[0].cloneNode(true);
    clone.classList.remove('active');
    carouselTrackEl.appendChild(clone);
    updateClassesAndMeta();

    const shiftAmount = -(projects.length * 100);
    carouselTrackEl.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
    carouselTrackEl.style.transform = `translateY(${shiftAmount}vh)`;

    setTimeout(() => {
      carouselTrackEl.removeChild(clone);
      carouselTrackEl.style.transition = 'none';
      carouselTrackEl.style.transform = `translateY(0vh)`;
      setTimeout(() => { isAnimating = false; }, 50); 
    }, 500);

  } else if (isWrapBackward) {
    // Clone last item and prepend to the start for continuous scroll
    const clone = carouselTrackEl.children[projects.length - 1].cloneNode(true);
    clone.classList.remove('active');
    carouselTrackEl.insertBefore(clone, carouselTrackEl.firstChild);
    
    // Instantly shift track down so view doesn't jump
    carouselTrackEl.style.transition = 'none';
    carouselTrackEl.style.transform = `translateY(-100vh)`;
    void carouselTrackEl.offsetHeight; // force reflow

    updateClassesAndMeta();

    carouselTrackEl.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
    carouselTrackEl.style.transform = `translateY(0vh)`;

    setTimeout(() => {
      carouselTrackEl.removeChild(clone);
      carouselTrackEl.style.transition = 'none';
      const realShift = -((projects.length - 1) * 100);
      carouselTrackEl.style.transform = `translateY(${realShift}vh)`;
      setTimeout(() => { isAnimating = false; }, 50); 
    }, 500);

  } else {
    updateClassesAndMeta();
    const shiftAmount = -(currentIndex * 100); 
    carouselTrackEl.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
    carouselTrackEl.style.transform = `translateY(${shiftAmount}vh)`;
    setTimeout(() => {
      isAnimating = false;
    }, 550); 
  }
}

function saveCurrentVideoState(idx) {
  const vid = activeVideos[idx];
  if (!vid) return;

  videoPlaybackState.set(idx, vid.currentTime || 0);
  vid.pause();
}

function restoreCurrentVideoState(idx) {
  const vid = activeVideos[idx];
  if (!vid) return;

  const savedTime = videoPlaybackState.get(idx);
  if (typeof savedTime !== "number") return;

  const seekToSavedTime = () => {
    if (Number.isFinite(savedTime)) {
      try {
        vid.currentTime = savedTime;
      } catch (error) {
        console.error("Video seek failed:", error);
      }
    }
  };

  if (vid.readyState >= 1) {
    seekToSavedTime();
  } else {
    vid.addEventListener("loadedmetadata", seekToSavedTime, { once: true });
  }
}

function updateDOM() {
  // Only called on init
  updateClassesAndMeta();
  carouselTrackEl.style.transition = 'none';
  const shiftAmount = -(currentIndex * 100); 
  carouselTrackEl.style.transform = `translateY(${shiftAmount}vh)`;
  void carouselTrackEl.offsetHeight;
}

function updateClassesAndMeta() {
  if (!carouselTrackEl || !metaRightEl) return;
  // Update Carousel Items
  // Ignore clones dynamically by only targeting real elements?
  // We can just iterate the real array since DOM index matches unless we have a clone
  const children = Array.from(carouselTrackEl.children);
  const offset = children.length > projects.length && children[0].classList.contains('carousel-item-wrapper') && !children[0].querySelector('.video-player') ? 1 : 0; 
  // actually, a safer way is to just grab elements by array index
  // but let's just let it toggle by removing all then setting the one true element.
  
  // Actually, a simpler way: the real DOM elements we keep track of, 
  // but it's okay to just clear all active then set the true index + offset.
  children.forEach(c => c.classList.remove('active'));
  let indexToActivate = currentIndex;
  if (children.length > projects.length) {
    if (children[0] && children[0].classList.contains('carousel-item-wrapper') && children[0].querySelector('.video-top-title').textContent.includes(projects[projects.length - 1].type)) {
       indexToActivate += 1;
    }
  }
  if (children[indexToActivate]) {
    children[indexToActivate].classList.add('active');
  }

  // Update Meta List
  Array.from(metaRightEl.children).forEach((el, i) => {
    el.classList.toggle("active", i === currentIndex);
  });

  if (activeVideos[currentIndex]) {
    restoreCurrentVideoState(currentIndex);
  }
}

// Scroll / Wheel Event handling
window.addEventListener("wheel", (e) => {
  if (isMobileLayout()) return;

  if (isAnimating) return;
  
  // Trackpad threshold to ignore tiny inertia jitters when lock opens
  if (Math.abs(e.deltaY) < 20) return;

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

  // Mobile optimization: skip heavy ASCII animation on mobile devices
  if (typeof isMobileLayout === 'function' && isMobileLayout()) {
    loader.classList.add('hidden');
    // Ensure background/loader text cleared to avoid rendering cost
    if (loaderText) loaderText.textContent = '';
    if (bgText) bgText.textContent = '';
    return;
  }

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
