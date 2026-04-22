document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.panel-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const sidePanel = document.getElementById('side-panel');
    const menuOverlay = document.getElementById('menu-overlay');


    // Toggle Side Panel
    const togglePanel = () => {
        const isOpen = sidePanel.classList.contains('open');

        if (isOpen) {
            sidePanel.classList.remove('open');
            hamburgerMenu.classList.remove('open');
            if (menuOverlay) menuOverlay.classList.remove('open');
            document.body.classList.remove('menu-open');
            document.body.style.overflow = '';
            hamburgerMenu.setAttribute('title', 'Open menu');
            hamburgerMenu.setAttribute('aria-label', 'Open menu');
        } else {
            // Close logo dropdown when opening side panel
            if (logoDropdown) {
                logoDropdown.classList.remove('active');
                if (logoTrigger) logoTrigger.setAttribute('aria-expanded', 'false');
            }

            sidePanel.classList.add('open');
            hamburgerMenu.classList.add('open');
            if (menuOverlay) menuOverlay.classList.add('open');
            document.body.classList.add('menu-open');
            
            // Only disable scrolling on mobile
            if (window.innerWidth <= 768) {
                document.body.style.overflow = 'hidden';
            }
            
            hamburgerMenu.setAttribute('title', 'Home');
            hamburgerMenu.setAttribute('aria-label', 'Home');
        }
    };

    const closePanel = () => {
        sidePanel.classList.remove('open');
        hamburgerMenu.classList.remove('open');
        if (menuOverlay) menuOverlay.classList.remove('open');
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
        hamburgerMenu.setAttribute('title', 'Open menu');
        hamburgerMenu.setAttribute('aria-label', 'Open menu');
    };

    hamburgerMenu.addEventListener('click', togglePanel);
    if (menuOverlay) menuOverlay.addEventListener('click', closePanel);



    // Scroll to section on click
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            
            if (targetContent) {
                // Close panel first for better visual feedback
                closePanel();
                
                // Allow a tiny delay before scrolling
                setTimeout(() => {
                    targetContent.scrollIntoView({ behavior: 'smooth' });
                }, 300); // Slightly more delay for mobile panel retraction
            }
        });
    });

    // Update active tab based on scroll position using Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -70% 0px', // Trigger when section is in top 30% of viewport
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active from all tabs
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active to current section's button
                const activeId = entry.target.getAttribute('id');
                const activeButton = document.querySelector(`.panel-link[data-target="${activeId}"]`);
                if (activeButton) {
                    activeButton.classList.add('active');
                }
            }
        });
    }, observerOptions);

    tabContents.forEach(section => {
        observer.observe(section);
    });

    // Force scroll to top on refresh with smooth animation
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    
    // Smooth scroll to top on load/refresh
    window.onload = () => {
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 100);
    };

    // Logo Dropdown Logic
    const logoDropdown = document.getElementById('logo-dropdown');
    const logoTrigger = logoDropdown ? logoDropdown.querySelector('.logo-trigger') : null;

    if (logoTrigger && logoDropdown) {
        logoTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            logoDropdown.classList.toggle('active');
            const isExpanded = logoDropdown.classList.contains('active');
            logoTrigger.setAttribute('aria-expanded', isExpanded);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!logoDropdown.contains(e.target)) {
                logoDropdown.classList.remove('active');
                logoTrigger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Header Visibility on Scroll (Mobile Specific)
    let lastScrollY = window.scrollY;
    const headerThreshold = 80;
    const mobileHeader = document.getElementById('mobile-header');

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const isMenuOpen = sidePanel && sidePanel.classList.contains('open');
        
        // Background logic - separate from visibility
        if (currentScrollY > 10) { // Small threshold for background
            if (mobileHeader) mobileHeader.classList.add('header-floating');
        } else {
            if (mobileHeader) mobileHeader.classList.remove('header-floating');
        }

        // Visibility toggle logic
        if (currentScrollY > lastScrollY && currentScrollY > headerThreshold && !isMenuOpen) {
            // Scrolling Down - Hide
            if (mobileHeader) {
                mobileHeader.classList.add('header-hidden');
                mobileHeader.classList.remove('scrolling-up');
            }
        } else if (currentScrollY < lastScrollY) {
            // Scrolling Up - Show
            if (mobileHeader) {
                mobileHeader.classList.remove('header-hidden');
                // Apply floating background style only when scrolled away from top
                if (currentScrollY > 20) {
                    mobileHeader.classList.add('scrolling-up');
                } else {
                    mobileHeader.classList.remove('scrolling-up');
                }
            }
        }

        // Close logo dropdown on scroll
        if (logoDropdown && logoDropdown.classList.contains('active')) {
            logoDropdown.classList.remove('active');
            if (logoTrigger) logoTrigger.setAttribute('aria-expanded', 'false');
        }
        
        lastScrollY = currentScrollY;
    }, { passive: true });

    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const bgBackdrop = document.querySelector('.bg-typography-backdrop');
    

    const designProcessImg = document.getElementById('design-process-img');
    const savedTheme = localStorage.getItem('theme');
    
    // Check system preference if no saved theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || 'dark'; // Updated to default to dark theme as requested
    
    const profileImg = document.querySelector('.hero-profile-img');
    
    // Function to update images based on theme
    const updateThemeImages = (theme) => {
        if (designProcessImg) {
            const isMobile = window.innerWidth <= 600;
            const src = isMobile
                ? (theme === 'dark' ? 'assets/icon/mobile-process-white.svg' : 'assets/icon/mobile-process-black.svg')
                : (theme === 'dark' ? 'assets/icon/design-process-white.svg' : 'assets/icon/design-process-black.svg');
            designProcessImg.src = src;
        }

        if (profileImg) {
            profileImg.src = theme === 'dark'
                ? 'assets/image/profile-dark.png'
                : 'assets/image/profile-light.png';
        }

        // Update Theme Color Meta Tag
        const themeColorMetas = document.querySelectorAll('meta[name="theme-color"]');
        themeColorMetas.forEach(meta => {
            meta.setAttribute('content', theme === 'dark' ? '#0D0F14' : '#fcfbf5');
        });
    };

    // Apply initial theme
    document.documentElement.setAttribute('data-theme', initialTheme);
    updateThemeImages(initialTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const runner = () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                updateThemeImages(newTheme);
                
                // Close menu after selection
                if (logoDropdown) {
                    logoDropdown.classList.remove('active');
                    if (logoTrigger) logoTrigger.setAttribute('aria-expanded', 'false');
                }
            };

            // SMOOTH THEME CHANGE REVEAL
            if (!document.startViewTransition) {
                runner();
                return;
            }

            // Suppress all existing transitions during capture to avoid "ghosting"
            document.documentElement.classList.add('theme-transitioning');
            
            const transition = document.startViewTransition(runner);
            
            // Clean up when transition finishes
            transition.finished.finally(() => {
                document.documentElement.classList.remove('theme-transitioning');
            });
        });
    }

    // Animation Toggle Logic
    const animationToggle = document.getElementById('animation-toggle');
    const animationStatusKey = 'animation_hidden';
    
    const updateAnimationState = (isHidden) => {
        if (!bgBackdrop) return;
        
        const logo = document.querySelector('.site-logo');

        if (isHidden) {
            bgBackdrop.classList.add('bg-hidden');
            document.documentElement.classList.add('motion-hidden');
            if (logo) logo.classList.remove('logo-animate');
            if (animationToggle) {
                animationToggle.querySelector('span').textContent = 'Enable Motion';
            }
        } else {
            bgBackdrop.classList.remove('bg-hidden');
            document.documentElement.classList.remove('motion-hidden');
            if (logo) logo.classList.add('logo-animate');
            if (animationToggle) {
                animationToggle.querySelector('span').textContent = 'Disable Motion';
            }
        }
    };

    // Apply initial animation state
    const isAnimationHidden = localStorage.getItem(animationStatusKey) === 'true';
    updateAnimationState(isAnimationHidden);

    if (animationToggle) {
        animationToggle.addEventListener('click', () => {
            const isCurrentlyHidden = bgBackdrop.classList.contains('bg-hidden');
            const newState = !isCurrentlyHidden;
            
            updateAnimationState(newState);
            localStorage.setItem(animationStatusKey, newState);
            
            // Close dropdown
            if (logoDropdown) {
                logoDropdown.classList.remove('active');
                if (logoTrigger) logoTrigger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Update images on resize (for mobile/desktop process diagram swap)
    window.addEventListener('resize', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        updateThemeImages(currentTheme);
    }, { passive: true });

    // Carousel Logic
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track ? track.children : []);
    const nextButtons = document.querySelectorAll('.next-btn');
    const prevButtons = document.querySelectorAll('.prev-btn');
    const counters = document.querySelectorAll('.slide-counter');

    let currentSlideIndex = 0;

    const updateSlide = (index) => {
        if (!track || slides.length === 0) return;

        // Hide all slides
        slides.forEach(slide => {
            slide.classList.remove('active');
        });

        // Show current slide
        slides[index].classList.add('active');

        // Move track
        track.style.transform = `translateX(-${index * 100}%)`;

        // Update all counters
        counters.forEach(counter => {
            counter.textContent = `${index + 1} / ${slides.length}`;
        });
    };

    // Bind all next buttons
    nextButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentSlideIndex = (currentSlideIndex + 1) % slides.length;
            updateSlide(currentSlideIndex);
        });
    });

    // Bind all prev buttons
    prevButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
            updateSlide(currentSlideIndex);
        });
    });
    // Modal Logic for multiple projects
    const modal = document.getElementById('project-modal');
    const figmaIframe = document.getElementById('figma-iframe');
    const figmaContainer = document.getElementById('figma-container');
    const projectVideo = document.getElementById('project-video');
    const videoSource = projectVideo ? projectVideo.querySelector('source') : null;
    const openModalButtons = document.querySelectorAll('.open-project-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    
    // Action buttons inside modal
    const btnVideoOverview = document.getElementById('btn-video-overview');
    const btnOpenPrototype = document.getElementById('btn-open-prototype');
    const btnExpandModal = document.getElementById('btn-expand-modal');
    const modalActions = document.getElementById('modal-actions');

    let currentProjectData = {
        figmaUrl: '',
        videoUrl: '',
        prototypeUrl: ''
    };

    const openModal = (figmaUrl, videoUrl, prototypeUrl = '') => {
        if (modal) {
            currentProjectData.figmaUrl = figmaUrl;
            currentProjectData.videoUrl = videoUrl;
            currentProjectData.prototypeUrl = prototypeUrl;

            // Default view: Show Figma (Figjam) board
            showFigma();
            
            modal.classList.add('open');
            document.body.style.overflow = 'hidden'; 
        }
    };

    const showFigma = () => {
        if (figmaContainer && projectVideo) {
            figmaContainer.style.display = 'block';
            if (figmaIframe) figmaIframe.src = currentProjectData.figmaUrl;
            projectVideo.style.display = 'none';
            projectVideo.pause();
            
            // Show floating actions (only on desktop)
            if (modalActions) modalActions.style.display = 'flex';
            if (closeModalBtn) closeModalBtn.style.display = 'flex'; 
        }
    };

    const showVideo = () => {
        if (figmaContainer && projectVideo && videoSource) {
            figmaContainer.style.display = 'none';
            if (figmaIframe) figmaIframe.src = ''; // Stop loading/playing in iframe
            
            projectVideo.style.display = 'block';
            videoSource.src = currentProjectData.videoUrl;
            projectVideo.load();
            projectVideo.play();

            // Show close button
            if (modalActions) modalActions.style.display = 'none';
            if (closeModalBtn) closeModalBtn.style.display = 'flex';
        }
    };

    const closeModal = () => {
        modal.classList.remove('open');
        document.body.style.overflow = '';
        if (figmaIframe) figmaIframe.src = '';
        if (projectVideo) {
            projectVideo.pause();
            projectVideo.currentTime = 0;
        }
    };

    openModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const figmaUrl = button.getAttribute('data-figma-url');
            const videoUrl = button.getAttribute('data-video-url');
            const prototypeUrl = button.getAttribute('data-prototype-url') || '';
            openModal(figmaUrl, videoUrl, prototypeUrl);
        });
    });

    if (btnExpandModal) {
        btnExpandModal.addEventListener('click', () => {
            if (currentProjectData.figmaUrl) {
                window.open(currentProjectData.figmaUrl, '_blank');
            }
        });
    }

    if (btnVideoOverview) {
        btnVideoOverview.addEventListener('click', showVideo);
    }

    if (btnOpenPrototype) {
        btnOpenPrototype.addEventListener('click', () => {
            if (currentProjectData.prototypeUrl) {
                window.open(currentProjectData.prototypeUrl, '_blank');
            } else {
                showFigma();
            }
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });

});

// Service Worker Registration for PWA (Independent of DOMContentLoaded)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker: Registered successfully with scope:', reg.scope))
            .catch(err => console.error('Service Worker: Registration failed:', err));
    });
}
