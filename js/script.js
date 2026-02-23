/* ==========================================================================
   INTERACTIVE SCRIPT - ENHANCED ANIMATIONS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Toggle ---
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    const navLinks = document.querySelectorAll('.nav-link');

    // Show Menu
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.add('show-menu');
            document.body.classList.add('no-scroll');
        });
    }

    // Hide Menu
    if (navClose) {
        navClose.addEventListener('click', () => {
            navMenu.classList.remove('show-menu');
            document.body.classList.remove('no-scroll');
        });
    }

    // Remove Menu on Link Click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('show-menu');
            document.body.classList.remove('no-scroll');
        });
    });

    // --- Header & Scroll Progress ---
    const header = document.getElementById('header');
    const scrollProgress = document.querySelector('.scroll-progress');

    window.addEventListener('scroll', () => {
        // Scroll Progress Bar
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if (scrollProgress) {
            scrollProgress.style.width = scrolled + "%";
        }

        // Header Style
        if (window.scrollY >= 50) {
            header.classList.add('scroll-active');
        } else {
            header.classList.remove('scroll-active');
        }
    });

    // --- Active Link Highlight on Scroll ---
    const sections = document.querySelectorAll('section[id]');

    function scrollActive() {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100;
            const sectionId = current.getAttribute('id');
            const sectionsClass = document.querySelector('.nav-list a[href*=' + sectionId + ']');

            if (sectionsClass) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    sectionsClass.classList.add('active');
                } else {
                    sectionsClass.classList.remove('active');
                }
            }
        });
    }
    window.addEventListener('scroll', scrollActive);


    // --- Advanced Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const animateCards = document.querySelectorAll('.feature-card, .service-card, .portfolio-item');

    // Add reveal class to cards if they don't have it manually added to parent
    animateCards.forEach((el, index) => {
        el.classList.add('reveal');

        // Add individual transition delay for staggering effect
        // Find position in current grid parent to reset stagger per grid
        const parent = el.parentElement;
        if (parent && parent.classList.contains('grid')) {
            const children = Array.from(parent.children);
            const gridIndex = children.indexOf(el);
            el.style.transitionDelay = `${gridIndex * 0.15}s`;
        }
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, observerOptions);

    // Observe manually marked elements
    revealElements.forEach(el => observer.observe(el));

    // Observe auto-marked cards
    animateCards.forEach(el => observer.observe(el));


    // --- Portfolio Filter ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active to clicked
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                portfolioItems.forEach(item => {
                    const itemCategory = item.querySelector('.portfolio-overlay span').textContent.toLowerCase();

                    if (filterValue === 'all' || itemCategory.includes(filterValue)) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                            item.classList.add('active');
                        }, 50);
                    } else {
                        item.classList.remove('active');
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 400);
                    }
                });
            });
        });
    }

    // --- Stats Counter Animation ---
    const experienceSection = document.querySelector('.experience-badge');
    if (experienceSection) {
        const observerStats = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add a pop animation to the badge
                    experienceSection.style.animation = "pulse-glow 2s infinite";
                    observerStats.unobserve(entry.target);
                }
            });
        });
        observerStats.observe(experienceSection);
    }

    // --- Scroll Down Button Click ---
    const scrollBtn = document.querySelector('.scroll-down');
    if (scrollBtn) {
        scrollBtn.addEventListener('click', () => {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                window.scrollTo({
                    top: aboutSection.offsetTop - 80, // Adjust for header height
                    behavior: 'smooth'
                });
            }
        });
    }

    // --- Preloader ---
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('hide');
            }, 800);
        });
    }

    // --- Swiper Portfolio Initialization ---
    // Make sure Swiper is defined before using it (it should be if script is loaded after CDN)
    if (typeof Swiper !== 'undefined' && document.querySelector('.portfolio-slider')) {
        const swiper = new Swiper('.portfolio-slider', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            centeredSlides: false, /* Align left like other sections */
            speed: 800,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                640: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 30,
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 40,
                },
            }
        });
    }

    // --- Swiper Testimonials Initialization ---
    if (typeof Swiper !== 'undefined' && document.querySelector('.testimonials-slider')) {
        new Swiper('.testimonials-slider', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            speed: 800,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                768: {
                    slidesPerView: 2,
                },
                1024: {
                    slidesPerView: 3,
                },
            }
        });
    }
});
