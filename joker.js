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

/* ===================================================
   PWA SERVICE WORKER REGISTRATION
   =================================================== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => {
        console.log('[PWA] Service Worker registered successfully with scope:', reg.scope);
      })
      .catch((err) => {
        console.error('[PWA] Service Worker registration failed:', err);
      });
  });
}

/* ===================================================
   PWA INSTALLATION PROMPT HANDLING
   =================================================== */
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  console.log('[PWA] beforeinstallprompt event captured');
  
  // Show standard install actions in modal
  const confirmBtn = document.getElementById('pwa-install-confirm-btn');
  if (confirmBtn) {
    confirmBtn.style.display = 'block';
  }
});

// Handle PWA installation trigger
document.addEventListener('DOMContentLoaded', () => {
  const downloadBtns = document.querySelectorAll('.download-pwa-btn');
  downloadBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.openPwaModal();
    });
  });
});

window.openPwaModal = function() {
  const modal = document.getElementById('pwaInstallModal');
  const confirmBtn = document.getElementById('pwa-install-confirm-btn');
  const instructionsList = document.getElementById('pwa-instructions-list');
  
  if (modal) {
    modal.classList.add('active');
    
    if (deferredPrompt) {
      // Browser supports native install prompt
      if (confirmBtn) confirmBtn.style.display = 'block';
      if (instructionsList) instructionsList.style.display = 'none';
    } else {
      // Browser does not support native install prompt (Safari iOS / manual install)
      if (confirmBtn) confirmBtn.style.display = 'none';
      if (instructionsList) {
        instructionsList.style.display = 'block';
        
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const step1 = document.getElementById('pwa-step-1');
        const step2 = document.getElementById('pwa-step-2');
        
        if (isIOS) {
          if (step1) step1.innerHTML = 'Tap the <strong>Share</strong> button <i class="ri-share-box-line" style="vertical-align: middle;"></i> at the bottom of the screen.';
          if (step2) step2.innerHTML = 'Scroll down the list and select <strong>"Add to Home Screen"</strong>.';
        } else {
          if (step1) step1.innerHTML = 'Open your browser menu options (usually click the three vertical dots <i class="ri-more-2-fill" style="vertical-align: middle;"></i>).';
          if (step2) step2.innerHTML = 'Select <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.';
        }
      }
    }
  }
};

window.closePwaModal = function() {
  const modal = document.getElementById('pwaInstallModal');
  if (modal) {
    modal.classList.remove('active');
  }
};

// Close modal on click outside
document.addEventListener('click', (e) => {
  const modal = document.getElementById('pwaInstallModal');
  if (modal && e.target === modal) {
    window.closePwaModal();
  }
});

// Bind installation prompt to confirm buttons
document.addEventListener('DOMContentLoaded', () => {
  const confirmBtn = document.getElementById('pwa-install-confirm-btn');
  const pageInstallBtn = document.getElementById('download-page-install-btn');
  
  const triggerInstall = (btn) => {
    if (deferredPrompt) {
      if (btn) btn.style.display = 'none';
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] User accepted the install prompt');
          showToastHelper('MedScan has been installed successfully!', 'success');
        } else {
          console.log('[PWA] User dismissed the install prompt');
        }
        deferredPrompt = null;
        window.closePwaModal();
      });
    } else {
      // Fallback to manual modal popup instructions
      window.openPwaModal();
    }
  };
  
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => triggerInstall(confirmBtn));
  }
  
  if (pageInstallBtn) {
    pageInstallBtn.addEventListener('click', () => triggerInstall(null));
  }
});

// Capture install success event
window.addEventListener('appinstalled', (evt) => {
  console.log('[PWA] App installed successfully');
  showToastHelper('MedScan has been installed successfully on your device!', 'success');
  window.closePwaModal();
});

/* ===================================================
   OPTIMIZED STICKY NAVBAR, SCROLL PROGRESS & HIGHLIGHTS
   =================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('nav');
  const scrollBar = document.getElementById('scroll-bar');
  const sections = document.querySelectorAll('section, footer');
  const navLinks = document.querySelectorAll('nav ul li a');

  let ticking = false;

  function handleScrollOperations() {
    const scrollY = window.scrollY;

    // 1. Sticky Navbar
    if (nav) {
      if (scrollY > 50) {
        nav.classList.add('sticky');
      } else {
        nav.classList.remove('sticky');
      }
    }

    // 2. Scroll Progress Bar
    if (scrollBar) {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      scrollBar.style.width = scrolled + '%';
    }

    // 3. Active Nav Highlighting
    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (scrollY >= (sectionTop - 150)) {
        const id = section.getAttribute('id');
        if (id) {
          currentSection = id;
        }
      }
    });

    // Detect if we are on download.html
    const isDownloadPage = window.location.pathname.includes('download.html');

    navLinks.forEach(link => {
      link.classList.remove('active-nav');
      const href = link.getAttribute('href');
      
      if (isDownloadPage) {
        if (href && href.includes('download.html')) {
          link.classList.add('active-nav');
        }
      } else {
        if (href === '#' && (currentSection === '' || currentSection === 'how-it-works' || currentSection === 'about')) {
          if (scrollY < 200) {
            link.classList.add('active-nav');
          }
        } else if (href === '#' + currentSection) {
          link.classList.add('active-nav');
        }
      }
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(handleScrollOperations);
      ticking = true;
    }
  }, { passive: true });

  // Initial call on load
  handleScrollOperations();
});

/* ===================================================
   CONTACT FORM VALIDATION & SUBMISSION
   =================================================== */
// Configure your Formspree endpoint here. Replace with your form ID:
// e.g. const FORM_ENDPOINT = 'https://formspree.io/f/mnqwyzab';
const FORM_ENDPOINT = 'https://formspree.io/f/meebjekl';

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('main-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const subjectInput = document.getElementById('contact-subject');
      const messageInput = document.getElementById('contact-message');
      
      const nameError = document.getElementById('name-error');
      const emailError = document.getElementById('email-error');
      const subjectError = document.getElementById('subject-error');
      const messageError = document.getElementById('message-error');
      
      let isValid = true;
      
      // Helper to clear error logs
      const clearErrors = () => {
        if (nameError) nameError.textContent = '';
        if (emailError) emailError.textContent = '';
        if (subjectError) subjectError.textContent = '';
        if (messageError) messageError.textContent = '';
      };
      
      clearErrors();
      
      // Validate Name
      if (!nameInput.value.trim()) {
        if (nameError) nameError.textContent = 'Full Name is required.';
        isValid = false;
      }
      
      // Validate Email
      const email = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) {
        if (emailError) emailError.textContent = 'Email address is required.';
        isValid = false;
      } else if (!emailRegex.test(email)) {
        if (emailError) emailError.textContent = 'Please enter a valid email address.';
        isValid = false;
      }
      
      // Validate Subject
      if (!subjectInput.value.trim()) {
        if (subjectError) subjectError.textContent = 'Subject is required.';
        isValid = false;
      }
      
      // Validate Message
      if (!messageInput.value.trim()) {
        if (messageError) messageError.textContent = 'Message is required.';
        isValid = false;
      }
      
      if (!isValid) return;
      
      // Toggle button loading states
      const submitBtn = contactForm.querySelector('.contact-submit-btn');
      const originalBtnContent = submitBtn.innerHTML;
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Sending...</span><i class="ri-loader-4-line ri-spin" style="margin-left: 8px;"></i>`;
      }
      
      // Prepare payload for Formspree (or any endpoint that accepts JSON)
      // Ensure the hidden _replyto field is populated for HTML fallback
      const replyHidden = document.getElementById('_replyto_hidden');
      if (replyHidden) replyHidden.value = email;

      // Build FormData from the form to mirror native submission
      const formData = new FormData(contactForm);

      // POST to Formspree endpoint using FormData (no explicit Content-Type)
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      })
      .then(async (res) => {
        if (res.ok) {
          showToastHelper('Message sent successfully! Thank you for contacting MedScan.', 'success');
          // Clear inputs
          nameInput.value = '';
          emailInput.value = '';
          subjectInput.value = '';
          messageInput.value = '';
        } else {
          // If server responds but not OK, attempt native fallback submit
          console.error('Contact form submit error:', res.status);
          showToastHelper('Failed to send via AJAX — trying browser fallback...', 'error');
          // Native submit will bypass JS event handlers
          try { contactForm.submit(); } catch (e) { console.error('Fallback submit failed', e); }
        }
      })
      .catch((err) => {
        console.error('Network error submitting contact form:', err);
        showToastHelper('Network error. Attempting browser fallback...', 'error');
        // Browser fallback - native form submission (will perform POST to action URL)
        try { contactForm.submit(); } catch (e) { console.error('Fallback submit failed', e); }
      })
      .finally(() => {
        // Restore button state
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnContent;
        }
      });
    });
  }
});

/* ===================================================
   CONTACT FORM TEST HELPERS
   - Provides a console-invokable helper `runContactFormTest(count, interval)`
   - Sends `count` test submissions to `FORM_ENDPOINT` spaced by `interval` ms
   - Useful for verifying Formspree delivery from your browser
   Usage: open DevTools Console and run `runContactFormTest(3, 800)`
   =================================================== */

window.runContactFormTest = async function(count = 1, interval = 1000) {
  if (!window.FORM_ENDPOINT) window.FORM_ENDPOINT = typeof FORM_ENDPOINT !== 'undefined' ? FORM_ENDPOINT : null;
  const endpoint = window.FORM_ENDPOINT || FORM_ENDPOINT;
  if (!endpoint) {
    console.error('FORM_ENDPOINT not configured in joker.js');
    return;
  }

  const form = document.getElementById('main-contact-form');
  if (!form) {
    console.error('Contact form not found on this page');
    return;
  }

  for (let i = 1; i <= count; i++) {
    const testName = `Test User ${Date.now()}`;
    const testEmail = `test+${Date.now()}@example.com`;
    const testSubject = `Automated test #${i}`;
    const testMessage = `This is an automated test message (${i} of ${count}) sent at ${new Date().toISOString()}`;

    // Populate form fields if present (non-destructive)
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const subjectInput = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');
    if (nameInput) nameInput.value = testName;
    if (emailInput) emailInput.value = testEmail;
    if (subjectInput) subjectInput.value = testSubject;
    if (messageInput) messageInput.value = testMessage;

    // Ensure hidden replyto is set
    const replyHidden = document.getElementById('_replyto_hidden');
    if (replyHidden) replyHidden.value = testEmail;

    // Build FormData and POST
    const formData = new FormData(form);

    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Accept': 'application/json' }, body: formData });
      if (res.ok) {
        console.log(`Test ${i}/${count} submitted successfully (status ${res.status})`);
        showToastHelper(`Test ${i} sent — check Formspree inbox.`, 'success');
      } else {
        console.error(`Test ${i} returned status ${res.status}`);
        showToastHelper(`Test ${i} failed (status ${res.status}).`, 'error');
      }
    } catch (err) {
      console.error('Network error during test submit', err);
      showToastHelper(`Network error during test ${i}.`, 'error');
    }

    if (i < count) await new Promise(r => setTimeout(r, interval));
  }
  console.log('All test submissions completed.');
};

/* ===================================================
   APP SCREENSHOTS CAROUSEL SLIDER (download.html)
   =================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');
  const dotsContainer = document.getElementById('dots-container');
  
  if (!track) return; // Only execute on download page
  
  const slides = Array.from(track.children);
  const slideCount = slides.length;
  let currentIndex = 0;
  let autoPlayTimer = null;
  
  // Create dots dynamically
  for (let i = 0; i < slideCount; i++) {
    const dot = document.createElement('div');
    dot.className = `dot ${i === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => {
      goToSlide(i);
      resetAutoplay();
    });
    dotsContainer.appendChild(dot);
  }
  
  const dots = Array.from(dotsContainer.children);
  
  function updateCarouselDimensions() {
    if (!track.children || !track.children.length) return;
    const slideWidth = slides[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
  }
  
  function goToSlide(index) {
    if (index < 0) {
      currentIndex = slideCount - 1;
    } else if (index >= slideCount) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }
    
    // Highlight active dot
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });
    
    updateCarouselDimensions();
  }
  
  // Set listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(currentIndex - 1);
      resetAutoplay();
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(currentIndex + 1);
      resetAutoplay();
    });
  }
  
  // Autoplay
  function startAutoplay() {
    autoPlayTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 4500);
  }
  
  function resetAutoplay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      startAutoplay();
    }
  }
  
  window.addEventListener('resize', updateCarouselDimensions);
  startAutoplay();
});

/* ===================================================
   FAQ ACCORDION PANEL TOGGLES
   =================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isActive = item.classList.contains('active');
      const answer = item.querySelector('.faq-answer');
      
      // Close other open FAQ items first
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        otherItem.classList.remove('active');
        const otherAnswer = otherItem.querySelector('.faq-answer');
        if (otherAnswer) otherAnswer.style.maxHeight = null;
      });
      
      if (!isActive) {
        item.classList.add('active');
        if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
      } else {
        item.classList.remove('active');
        if (answer) answer.style.maxHeight = null;
      }
    });
  });
});

/* ===================================================
   GLASS TOAST NOTIFICATION HELPER
   =================================================== */
function showToastHelper(message, type = "success") {
  const activeToasts = document.querySelectorAll('.app-toast');
  activeToasts.forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = 'app-toast';
  toast.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: ${type === 'success' ? 'rgba(0, 255, 174, 0.95)' : 'rgba(255, 60, 60, 0.95)'};
      color: #022b1f;
      padding: 16px 28px;
      border-radius: 14px;
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      font-weight: 700;
      z-index: 100001;
      box-shadow: 0 15px 40px rgba(0,0,0,0.45);
      transform: translateY(150px);
      transition: transform 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28);
      font-family: 'Inter', sans-serif;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.style.transform = 'translateY(0)', 100);
  setTimeout(() => {
      toast.style.transform = 'translateY(150px)';
      setTimeout(() => toast.remove(), 500);
  }, 4000);
}

