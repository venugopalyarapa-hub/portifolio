/**
 * main Application Script
 * Theme Toggling, Mobile Navigation, Interactive Custom Cursor,
 * GSAP ScrollTrigger Animations, and 3D Tilt Card Effects.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    initCustomCursor();
    initThemeToggle();
    initMobileNav();
    initScrollSpy();
    initTiltCards();
    initSkillsAnimation();
    initAcademicsTabs();
    initGSAPAnimations();
    initContactForm();
});

/* ==========================================================================
   Custom Cursor Setup
   ========================================================================== */
function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const outline = document.querySelector('.custom-cursor-outline');
    
    if (!cursor || !outline) return;

    // Detect touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
        cursor.style.display = 'none';
        outline.style.display = 'none';
        return;
    }

    let cursorX = 0;
    let cursorY = 0;
    let outlineX = 0;
    let outlineY = 0;

    window.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        
        // Move core point instantly
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
    });

    // Custom animation loop for smooth inertia trailing outline
    function updateOutline() {
        const dx = cursorX - outlineX;
        const dy = cursorY - outlineY;
        
        outlineX += dx * 0.15;
        outlineY += dy * 0.15;
        
        outline.style.left = `${outlineX}px`;
        outline.style.top = `${outlineY}px`;
        
        requestAnimationFrame(updateOutline);
    }
    updateOutline();

    // Scale up on hover elements
    const hoverTargets = document.querySelectorAll('a, button, input, textarea, .tilt-card, .timeline-content');
    hoverTargets.forEach(target => {
        target.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursor.style.backgroundColor = 'var(--accent-primary)';
            outline.style.transform = 'translate(-50%, -50%) scale(1.3)';
            outline.style.borderColor = 'var(--accent-secondary)';
            outline.style.backgroundColor = 'rgba(0, 242, 254, 0.05)';
        });
        
        target.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.backgroundColor = 'var(--accent-secondary)';
            outline.style.transform = 'translate(-50%, -50%) scale(1)';
            outline.style.borderColor = 'var(--accent-primary)';
            outline.style.backgroundColor = 'transparent';
        });
    });
}

/* ==========================================================================
   Theme Toggling (Dark / Light)
   ========================================================================== */
function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;

    const icon = themeBtn.querySelector('i');
    
    // Load persisted theme
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        icon.className = 'fa-solid fa-sun';
    } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        icon.className = 'fa-solid fa-moon';
    }

    themeBtn.addEventListener('click', () => {
        let activeTheme = 'dark';
        
        if (document.body.classList.contains('dark-theme')) {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            icon.className = 'fa-solid fa-sun';
            activeTheme = 'light';
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            icon.className = 'fa-solid fa-moon';
            activeTheme = 'dark';
        }
        
        localStorage.setItem('portfolio-theme', activeTheme);

        // Dispatch theme changed custom event for Three.js
        const event = new CustomEvent('themeChanged', { detail: { theme: activeTheme } });
        document.dispatchEvent(event);
    });
}

/* ==========================================================================
   Mobile Responsive Navigation Menu
   ========================================================================== */
function initMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const menu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navContainer = document.querySelector('.navbar-container');

    if (!hamburger || !menu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        menu.classList.toggle('active');
    });

    // Close menu when clicking items
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            menu.classList.remove('active');
        });
    });

    // Add scroll container class to style navbar background
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navContainer.classList.add('scrolled');
        } else {
            navContainer.classList.remove('scrolled');
        }
    });
}

/* ==========================================================================
   ScrollSpy Link Activation
   ========================================================================== */
function initScrollSpy() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 160;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
}

/* ==========================================================================
   3D Tilt Card Hover Effect
   ========================================================================== */
function initTiltCards() {
    const cards = document.querySelectorAll('.tilt-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            
            // Calculate coordinates relative to card center
            const x = e.clientX - rect.left - (rect.width / 2);
            const y = e.clientY - rect.top - (rect.height / 2);
            
            // Limit tilt angles (max 10 degrees)
            const rotateX = -(y / (rect.height / 2)) * 8;
            const rotateY = (x / (rect.width / 2)) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
        });

        card.addEventListener('mouseleave', () => {
            // Smoothly reset positioning
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            card.style.transition = 'transform 0.4s ease';
        });
        
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    });
}

/* ==========================================================================
   Academics Tab Switcher
   ========================================================================== */
function initAcademicsTabs() {
    const tabs = document.querySelectorAll('.acad-tab');
    const panels = document.querySelectorAll('.acad-panel');
    if (!tabs.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.target;

            // Update tab active states
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update panel active states
            panels.forEach(p => p.classList.remove('active'));
            const activePanel = document.getElementById(target);
            if (activePanel) activePanel.classList.add('active');
        });
    });
}

/* ==========================================================================
   Interactive Skills Bar Progress Animation
   ========================================================================== */
function initSkillsAnimation() {
    // Use fromTo so pills are guaranteed visible even if ScrollTrigger never fires
    gsap.fromTo('.skill-pill',
        { opacity: 0, scale: 0.8, y: 12 },
        {
            scrollTrigger: {
                trigger: '.about-skills',
                start: 'top 90%',
                once: true
            },
            opacity: 1,
            scale: 1,
            y: 0,
            stagger: 0.04,
            duration: 0.45,
            ease: 'back.out(1.5)',
            clearProps: 'all'  // Remove inline styles after animation completes
        }
    );
}

/* ==========================================================================
   GSAP Page Animations (ScrollTriggered)
   ========================================================================== */
function initGSAPAnimations() {
    // 1. Hero Load Entrance Animation
    const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });
    
    heroTimeline.fromTo('.navbar', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1.2 })
                .fromTo('.fade-in-init', { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.15 }, '-=0.8')
                .fromTo('.scroll-indicator', { opacity: 0 }, { opacity: 0.7, duration: 0.8 }, '-=0.4');

    // 2. Sections Header Animations
    const sections = document.querySelectorAll('section:not(#hero)');
    sections.forEach(section => {
        const header = section.querySelector('.section-header');
        if (header) {
            gsap.from(header, {
                scrollTrigger: {
                    trigger: header,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 40,
                duration: 1,
                ease: 'power3.out'
            });
        }
    });

    // 3. Services Grid Staggered Reveal
    gsap.from('.service-card', {
        scrollTrigger: {
            trigger: '.services-grid',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 50,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out'
    });

    // 4. Projects Grid Staggered Reveal
    gsap.from('.project-card', {
        scrollTrigger: {
            trigger: '.projects-grid',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 60,
        stagger: 0.2,
        duration: 0.9,
        ease: 'power3.out'
    });

    // 5. Timeline Nodes Sliding animations
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        const content = item.querySelector('.timeline-content');
        const xOffset = index % 2 === 0 ? -60 : 60;
        
        gsap.from(content, {
            scrollTrigger: {
                trigger: item,
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            x: xOffset,
            duration: 1,
            ease: 'power3.out'
        });
        
        gsap.from(item.querySelector('.timeline-dot'), {
            scrollTrigger: {
                trigger: item,
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            scale: 0.1,
            duration: 0.6,
            delay: 0.3,
            ease: 'back.out(2)'
        });
    });

    // 6. Certifications Grid Staggered Reveal
    gsap.from('.cert-card', {
        scrollTrigger: {
            trigger: '.certifications-grid',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 50,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out'
    });

    // 7. Contact Section components slide-in
    gsap.from('.contact-details', {
        scrollTrigger: {
            trigger: '.contact-grid',
            start: 'top 80%'
        },
        opacity: 0,
        x: -50,
        duration: 0.9,
        ease: 'power3.out'
    });

    gsap.from('.contact-form-container', {
        scrollTrigger: {
            trigger: '.contact-grid',
            start: 'top 80%'
        },
        opacity: 0,
        x: 50,
        duration: 0.9,
        ease: 'power3.out'
    });
}

/* ==========================================================================
   Contact Form Submissions (Mock Backend Success response)
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const toast = document.getElementById('toast');
    const submitBtn = document.getElementById('form-submit-btn');

    if (!form || !toast) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Check validation
        if (!form.checkValidity()) return;

        // Button feedback
        const origBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';

        // Mock ajax submission delay
        setTimeout(() => {
            // Show toast notification
            toast.classList.add('show');
            
            // Clear inputs
            form.reset();
            
            // Restore button
            submitBtn.disabled = false;
            submitBtn.innerHTML = origBtnText;

            // Hide toast after 4 seconds
            setTimeout(() => {
                toast.classList.remove('show');
            }, 4000);
        }, 1500);
    });
}
