const hamburger = document.querySelector(".hamburger");
const menu = document.querySelector("ul");
const body = document.body;

// Toggle menu (only if both exist)
if (hamburger && menu) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    menu.classList.toggle("active");
    body.classList.toggle("menu-open");
  });

  // Close menu when clicking nav links (mobile fix)
  document.querySelectorAll("ul li a").forEach(link => {
    link.addEventListener("click", () => {
      menu.classList.remove("active");
      hamburger.classList.remove("active");
      body.classList.remove("menu-open");
    });
  });

  // Close menu when clicking outside (UX upgrade)
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
      menu.classList.remove("active");
      hamburger.classList.remove("active");
      body.classList.remove("menu-open");
    }
  });
}

const followWrap = document.querySelector(".follow-wrap");
const followBtn = document.querySelector(".follow-btn");

if (followWrap && followBtn) {
  followBtn.addEventListener("click", (e) => {
    e.preventDefault();
    followWrap.classList.toggle("active");
  });
}

// Scan and Result screen toggle
const scanScreen = document.querySelector(".scan");
const resultScreen = document.querySelector(".result");

if (scanScreen && resultScreen) {
  setInterval(() => {
    scanScreen.classList.toggle("active");
    resultScreen.classList.toggle("active");
  }, 4000);
}

// Global functions for inline HTML event handlers (bound to window)
window.doSomething = function() {
  console.log("Clicked 😎");
};

// Login Modal Logic
window.openLogin = function() {
  console.log("Login button clicked, opening modal");
  const modal = document.getElementById("loginModal");
  if (modal) {
    modal.classList.add("active");
    console.log("Modal class list after add:", modal.className);
  } else {
    console.error("Login modal not found in DOM");
  }
};

window.closeLogin = function() {
  const modal = document.getElementById("loginModal");
  if (modal) {
    modal.classList.remove("active");
  }
};

// Optional: close modal on click outside the container
document.addEventListener("click", (e) => {
  const modal = document.getElementById("loginModal");
  if (modal && e.target === modal) {
    window.closeLogin();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Automatically select important website elements (excluding hero section to prevent load delay)
  const elements = document.querySelectorAll(
    "section:not(.bolt), .feature-card, .trust-card, .step, .spot, .cta-section, footer, .about, .services"
  );

  // Add animation class automatically
  elements.forEach(el => {
    el.classList.add("scroll-animate");
  });

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15
  });

  elements.forEach(el => {
    observer.observe(el);
  });
});

// Lazy-load the heavy 50MB background video after the page has fully loaded
window.addEventListener("load", () => {
  const video = document.getElementById("hero-video");
  if (video) {
    const source = video.querySelector("source");
    if (source && source.dataset.src) {
      source.src = source.dataset.src;
      video.load();
    }
  }
});
