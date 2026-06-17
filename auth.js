import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import firebaseConfig from "./firebase-config.js";

// Initialize Firebase
let app;
let auth;
let analytics;
let googleProvider;
let initializationError = null;

console.log("[Firebase] Initializing application with configuration:", {
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
    measurementId: firebaseConfig.measurementId,
    hasApiKey: !!firebaseConfig.apiKey,
    apiKeyLength: firebaseConfig.apiKey ? firebaseConfig.apiKey.length : 0
});

try {
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "AIzaSyD89E_pznM5-UsHCRdHlr9scJEgmhzQrMs") {
        console.warn("[Firebase] Warning: Using default or placeholder API Key. Ensure it is correct in firebase-config.js.");
    }
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    console.log("[Firebase] App and Auth initialized successfully.");
} catch (error) {
    initializationError = error;
    console.error("[Firebase] Core initialization failed:", error);
}

try {
    if (app) {
        analytics = getAnalytics(app);
        console.log("[Firebase] Analytics initialized successfully.");
    }
} catch (error) {
    console.warn("[Firebase] Analytics initialization skipped (unsupported environment or blocked):", error.message);
}

document.addEventListener('DOMContentLoaded', () => {
    // If initialization failed, we show a toast on load but DO NOT return early
    if (initializationError || !auth) {
        console.error("[Auth] Firebase Auth is not initialized. Actions will display configuration warnings.", initializationError);
        setTimeout(() => {
            showToast("Firebase configuration error. Please check your API key.", "error");
        }, 1000);
    }

    // Select specific forms by unique ID to completely avoid selector collisions
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const forgotForm = document.getElementById('forgot-password-form');
    const modalLoginForm = document.getElementById('modal-login-form');

    // Select social buttons safely
    const googleBtn = Array.from(document.querySelectorAll('.social-btn'))
        .find(btn => btn.querySelector('img[alt="G"]'));

    console.log("[Auth] Forms detected on page:", {
        loginForm: !!loginForm,
        signupForm: !!signupForm,
        forgotForm: !!forgotForm,
        modalLoginForm: !!modalLoginForm,
        googleBtn: !!googleBtn
    });

    // Handle Login Page Form
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!auth) {
                showToast("Firebase Authentication is not initialized. Please verify configuration.", "error");
                return;
            }
            const emailInput = loginForm.querySelector('input[type="email"]');
            const passwordInput = loginForm.querySelector('input[type="password"]');
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            
            if (!emailInput || !passwordInput) {
                console.error("[Auth] Login fields not found inside the form.");
                return;
            }

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showToast("Please enter a valid email address.", "error");
                return;
            }
            if (password.length < 6) {
                showToast("Password must be at least 6 characters.", "error");
                return;
            }

            // Set loading state
            const originalBtnText = submitBtn ? submitBtn.innerHTML : "Sign In";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i class="ri-loader-4-line ri-spin" style="margin-right: 8px;"></i> Signing In...`;
            }

            console.log(`[Auth] Attempting login for: ${email}`);
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                console.log("[Auth] Login successful:", userCredential.user);
                localStorage.setItem('medscan_logged_in', 'true');
                showToast("Welcome back!", "success");
                setTimeout(() => window.location.href = 'index.html', 150);
            } catch (error) {
                console.error("[Auth] Login error:", error.code, error.message);
                showToast(formatAuthError(error), "error");
                // Restore button state
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            }
        });
    }

    // Handle Modal Login Form (if present on index.html)
    if (modalLoginForm) {
        modalLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!auth) {
                showToast("Firebase Authentication is not initialized. Please verify configuration.", "error");
                return;
            }
            const emailInput = modalLoginForm.querySelector('input[type="email"]');
            const passwordInput = modalLoginForm.querySelector('input[type="password"]');
            const submitBtn = modalLoginForm.querySelector('button[type="submit"]');

            if (!emailInput || !passwordInput) {
                console.error("[Auth] Modal login fields not found.");
                return;
            }

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showToast("Please enter a valid email address.", "error");
                return;
            }
            if (password.length < 6) {
                showToast("Password must be at least 6 characters.", "error");
                return;
            }

            // Set loading state
            const originalBtnText = submitBtn ? submitBtn.innerHTML : "Continue";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i class="ri-loader-4-line ri-spin" style="margin-right: 8px;"></i> Continuing...`;
            }

            console.log(`[Auth] Attempting modal login for: ${email}`);
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                console.log("[Auth] Modal login successful:", userCredential.user);
                localStorage.setItem('medscan_logged_in', 'true');
                showToast("Welcome back!", "success");
                
                // Close modal and reload page state
                const modal = document.getElementById("loginModal");
                if (modal) modal.classList.remove("active");
                
                setTimeout(() => window.location.reload(), 150);
            } catch (error) {
                console.error("[Auth] Modal login error:", error.code, error.message);
                showToast(formatAuthError(error), "error");
                // Restore button state
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            }
        });
    }

    // Handle Signup Page Form
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!auth) {
                showToast("Firebase Authentication is not initialized. Please verify configuration.", "error");
                return;
            }
            const emailInput = signupForm.querySelector('input[type="email"]');
            const passwordInput = signupForm.querySelector('input[type="password"]');
            const nameInput = signupForm.querySelector('input[placeholder="Enter your full name"]');
            const submitBtn = signupForm.querySelector('button[type="submit"]');

            if (!emailInput || !passwordInput) {
                console.error("[Auth] Signup fields not found.");
                return;
            }

            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const fullName = nameInput ? nameInput.value.trim() : "";

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showToast("Please enter a valid email address.", "error");
                return;
            }
            if (password.length < 6) {
                showToast("Password must be at least 6 characters.", "error");
                return;
            }
            if (fullName.length < 2) {
                showToast("Please enter your full name.", "error");
                return;
            }

            // Set loading state
            const originalBtnText = submitBtn ? submitBtn.innerHTML : "Sign Up";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i class="ri-loader-4-line ri-spin" style="margin-right: 8px;"></i> Registering...`;
            }

            console.log(`[Auth] Attempting signup for: ${email}`);
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                console.log("[Auth] Signup successful:", userCredential.user);
                localStorage.setItem('medscan_logged_in', 'true');
                
                // If full name was provided, we can update the user profile displayName
                if (fullName && auth.currentUser) {
                    // Import updateProfile dynamically
                    const { updateProfile } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
                    await updateProfile(auth.currentUser, { displayName: fullName });
                    console.log("[Auth] Profile display name updated to:", fullName);
                }

                showToast("Account Created! Redirecting...", "success");
                setTimeout(() => window.location.href = 'index.html', 150);
            } catch (error) {
                console.error("[Auth] Signup error:", error.code, error.message);
                showToast(formatAuthError(error), "error");
                // Restore button state
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            }
        });
    }

    // Handle Forgot Password Form (Password Reset Link)
    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!auth) {
                showToast("Firebase Authentication is not initialized. Please verify configuration.", "error");
                return;
            }
            const emailInput = forgotForm.querySelector('input[type="email"]');
            const submitBtn = forgotForm.querySelector('button[type="submit"]');

            if (!emailInput) {
                console.error("[Auth] Recovery email input field not found.");
                return;
            }

            const email = emailInput.value.trim();

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showToast("Please enter a valid email address.", "error");
                return;
            }

            // Set loading state
            const originalBtnText = submitBtn ? submitBtn.innerHTML : "Send Recovery Link";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i class="ri-loader-4-line ri-spin" style="margin-right: 8px;"></i> Sending Link...`;
            }

            console.log(`[Auth] Attempting password reset for: ${email}`);

            try {
                await sendPasswordResetEmail(auth, email);
                console.log("[Auth] Password reset email sent successfully.");
                showToast("Password reset email sent. Please check your inbox.", "success");
                setTimeout(() => window.location.href = 'login.html', 1500);
            } catch (error) {
                console.error("[Auth] Password reset error:", error.code, error.message);
                showToast(formatAuthError(error), "error");
                // Restore button state
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            }
        });
    }

    // Handle Google Login Button Click
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            if (!auth) {
                showToast("Firebase Authentication is not initialized. Please verify configuration.", "error");
                return;
            }
            console.log("[Auth] Initiating Google sign-in popup...");
            const originalBtnText = googleBtn.innerHTML;
            googleBtn.disabled = true;
            googleBtn.innerHTML = `<i class="ri-loader-4-line ri-spin" style="margin-right: 8px;"></i> Connecting...`;

            try {
                const result = await signInWithPopup(auth, googleProvider);
                console.log("[Auth] Google login successful:", result.user);
                localStorage.setItem('medscan_logged_in', 'true');
                showToast(`Logged in as ${result.user.displayName || result.user.email}!`, "success");
                setTimeout(() => window.location.href = 'index.html', 150);
            } catch (error) {
                console.error("[Auth] Google login error:", error.code, error.message);
                showToast(formatAuthError(error), "error");
                googleBtn.disabled = false;
                googleBtn.innerHTML = originalBtnText;
            }
        });
    }



    // Hook Call-to-Action (CTA) scan buttons to either scan or open the homepage login modal
    const scanButtons = document.querySelectorAll(
        'a.apple-glass-btn.primary, a.apple-glass-btn.secondary[href="#download"], a.cta-btn.primary, a.cta-btn.secondary'
    );
    scanButtons.forEach(btn => {
        // Skip default anchor jumps for home links
        if (btn.getAttribute('href') && btn.getAttribute('href').startsWith('#') && btn.getAttribute('href') !== '#') {
            return;
        }

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (auth && auth.currentUser) {
                // User is authenticated, let them know scan is ready/coming soon
                showToast("AI Scanning feature is coming soon to web! Download the app for live camera support.", "success");
            } else {
                // User is not authenticated, show toast and trigger the gorgeous ChatGPT login modal
                showToast("Please sign in to scan medicines.", "error");
                const modal = document.getElementById("loginModal");
                if (modal) {
                    setTimeout(() => {
                        modal.classList.add("active");
                    }, 500);
                } else {
                    // Fallback to separate login page if modal is missing
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1000);
                }
            }
        });
    });

    // Monitor Auth State
    if (auth) {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("[Auth State] User is signed in:", user.email);
            } else {
                console.log("[Auth State] No active user session.");
            }
            updateAuthUI(user);
        });
    } else {
        updateAuthUI(null);
    }
});

/**
 * Clean UI Syncing
 */
function updateAuthUI(user) {
    document.documentElement.classList.remove('user-logged-in-loading');
    const navList = document.querySelector('nav ul');
    // Select the login button elements dynamically by relative path, completely bypassing hardcoded local ports
    const loginLinks = document.querySelectorAll('nav ul li a[href="login.html"], .apple-glass-btn[href="login.html"]');

    if (user) {
        localStorage.setItem('medscan_logged_in', 'true');
        // Hide standard Login buttons and their list items
        loginLinks.forEach(link => {
            link.style.display = 'none';
            if (link.parentElement && link.parentElement.tagName === 'LI') {
                link.parentElement.style.display = 'none';
            }
        });

        // Add Welcome DP with Dropdown if it doesn't exist yet
        if (navList && !document.querySelector('.welcome-user')) {
            const welcome = document.createElement('li');
            welcome.className = 'welcome-user';
            welcome.style.position = 'relative';

            const rawName = user.displayName || user.email.split('@')[0];
            const fullName = escapeHTML(rawName);
            const firstLetter = fullName.charAt(0).toUpperCase();
            const photoURL = user.photoURL ? escapeHTML(user.photoURL) : null;

            welcome.innerHTML = `
                <div class="user-menu-trigger" style="cursor: pointer; position: relative; display: flex; align-items: center;">
                    <div class="user-profile-circle" style="
                        width: 42px; height: 42px; border-radius: 50%; overflow: hidden;
                        border: 2px solid #00ffae; display: flex; align-items: center; justify-content: center;
                        background: rgba(0, 255, 174, 0.1); box-shadow: 0 0 20px rgba(0, 255, 174, 0.4);
                        transition: all 0.3s ease;
                    ">
                        ${photoURL ? `<img src="${photoURL}" referrerpolicy="no-referrer" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
                        <span style="color: #00ffae; font-size: 18px; font-weight: 800; display: ${photoURL ? 'none' : 'flex'}; align-items: center; justify-content: center;">${firstLetter}</span>
                    </div>
                    
                    <!-- Dropdown Menu -->
                    <div class="profile-dropdown" style="
                        position: absolute; top: 55px; right: 0; background: rgba(5, 20, 15, 0.95);
                        backdrop-filter: blur(25px); border: 1px solid rgba(0, 255, 170, 0.2);
                        border-radius: 16px; width: 180px; padding: 8px 0; display: none;
                        box-shadow: 0 15px 50px rgba(0,0,0,0.6); z-index: 10000;
                        animation: dropdownFade 0.3s ease;
                    ">
                        <div style="padding: 12px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 8px;">
                            <p style="color: #ffffff; font-size: 13px; font-weight: 700; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${fullName}</p>
                            <p style="color: #00ffae; font-size: 11px; margin: 2px 0 0 0; opacity: 0.8;">Member</p>
                        </div>
                        <a href="#" id="dropdown-logout" style="
                            display: flex; align-items: center; gap: 12px; padding: 12px 20px;
                            color: #ff5e5e; font-size: 14px; font-weight: 700; text-decoration: none;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.background='rgba(255,94,94,0.1)'; this.style.paddingLeft='24px'" 
                           onmouseout="this.style.background='transparent'; this.style.paddingLeft='20px'">
                             Logout
                        </a>
                    </div>
                </div>
            `;

            navList.insertBefore(welcome, navList.firstChild);

            // Toggle Logic
            const trigger = welcome.querySelector('.user-menu-trigger');
            const dropdown = welcome.querySelector('.profile-dropdown');

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            });

            document.addEventListener('click', () => {
                if (dropdown) dropdown.style.display = 'none';
            });

            // Logout Logic
            welcome.querySelector('#dropdown-logout').addEventListener('click', (e) => {
                e.preventDefault();
                signOut(auth).then(() => {
                    console.log("[Auth] User logged out successfully.");
                    localStorage.removeItem('medscan_logged_in');
                    showToast("Logged out successfully", "success");
                    setTimeout(() => window.location.reload(), 400);
                }).catch(err => {
                    console.error("[Auth] Logout error:", err);
                });
            });
        }
    } else {
        localStorage.removeItem('medscan_logged_in');
        // Show standard Login buttons and their list items
        loginLinks.forEach(link => {
            link.style.display = 'flex';
            if (link.parentElement && link.parentElement.tagName === 'LI') {
                link.parentElement.style.display = 'block';
            }
        });
        
        // Remove welcome element if it exists
        const welcomeUser = document.querySelector('.welcome-user');
        if (welcomeUser) welcomeUser.remove();
        
        if (navList) navList.style.gap = '22px';
    }
}

/**
 * Premium Feedback System (Toasts)
 */
function showToast(message, type = "success") {
    // Remove duplicate toasts first
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
        font-weight: 700;
        z-index: 10001;
        box-shadow: 0 15px 40px rgba(0,0,0,0.4);
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

/**
 * Format Firebase Auth errors into user-friendly messages
 */
function formatAuthError(error) {
    if (!error || !error.code) return error.message || "An unexpected error occurred.";
    
    switch (error.code) {
        case "auth/invalid-api-key":
            return "Invalid Firebase configuration or API Key. Please verify settings.";
        case "auth/invalid-email":
            return "Invalid email address format.";
        case "auth/user-disabled":
            return "This user account has been disabled.";
        case "auth/user-not-found":
            return "No account exists with this email.";
        case "auth/wrong-password":
            return "Incorrect password. Please try again.";
        case "auth/email-already-in-use":
            return "An account with this email already exists.";
        case "auth/weak-password":
            return "Password should be at least 6 characters.";
        case "auth/popup-closed-by-user":
            return "Sign-in popup closed before completion.";
        case "auth/network-request-failed":
            return "Network connection issue. Please check your internet.";
        case "auth/invalid-credential":
            return "Invalid login credentials provided.";
        case "auth/unauthorized-domain":
            return "This domain is not authorized for authentication operations in the Firebase Console.";
        case "auth/operation-not-allowed":
            return "This operation is not allowed. Enable the Email/Password provider in the Firebase Console.";
        default:
            // Strip firebase prefix: 'auth/error-code' -> 'Error Code'
            return error.code.replace('auth/', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
}

/**
 * Safely escapes HTML characters to prevent XSS.
 */
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
