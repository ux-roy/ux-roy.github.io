document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.panel-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const sidePanel = document.getElementById('side-panel');
    const menuOverlay = document.getElementById('menu-overlay');
    const mobileHeader = document.getElementById('mobile-header');

    let isScrollingToSection = false;
    let scrollTimeout = null;


    let menuTimeout = null;

    const startMenuTimeout = () => {
        clearMenuTimeout();
        if (window.innerWidth > 768) {
            menuTimeout = setTimeout(() => {
                closePanel();
            }, 3000);
        }
    };

    const clearMenuTimeout = () => {
        if (menuTimeout) {
            clearTimeout(menuTimeout);
            menuTimeout = null;
        }
    };

    // Toggle Side Panel
    const togglePanel = () => {
        const isOpen = sidePanel.classList.contains('open');

        if (isOpen) {
            clearMenuTimeout();
            sidePanel.classList.remove('open');
            hamburgerMenu.classList.remove('open');
            if (menuOverlay) menuOverlay.classList.remove('open');
            document.body.classList.remove('menu-open');
            document.body.style.overflow = '';
            hamburgerMenu.setAttribute('title', 'Menu');
            hamburgerMenu.setAttribute('aria-label', 'Menu');
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

            hamburgerMenu.setAttribute('title', 'Close Menu');
            hamburgerMenu.setAttribute('aria-label', 'Close Menu');

            startMenuTimeout();
        }
    };

    const closePanel = () => {
        clearMenuTimeout();
        sidePanel.classList.remove('open');
        hamburgerMenu.classList.remove('open');
        if (menuOverlay) menuOverlay.classList.remove('open');
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
        hamburgerMenu.setAttribute('title', 'Menu');
        hamburgerMenu.setAttribute('aria-label', 'Menu');
    };

    hamburgerMenu.addEventListener('click', togglePanel);
    if (menuOverlay) menuOverlay.addEventListener('click', closePanel);

    // Reset auto-close timer on hover
    [hamburgerMenu, sidePanel].forEach(element => {
        if (element) {
            element.addEventListener('mouseenter', clearMenuTimeout);
            element.addEventListener('mouseleave', () => {
                if (sidePanel && sidePanel.classList.contains('open')) {
                    startMenuTimeout();
                }
            });
        }
    });



    // Scroll to section on click
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);

            if (targetContent) {
                const isMobile = window.innerWidth <= 768;

                // Close panel first for better visual feedback (mobile/tablet only)
                if (isMobile) {
                    closePanel();
                }

                // Temporarily disable hiding header during smooth scroll
                isScrollingToSection = true;
                if (scrollTimeout) clearTimeout(scrollTimeout);

                if (mobileHeader) {
                    mobileHeader.classList.remove('header-hidden');
                    if (window.scrollY > 20) {
                        mobileHeader.classList.add('scrolling-up');
                    }
                }

                // Allow a tiny delay before scrolling (only on mobile/tablet to wait for panel retraction)
                const delay = isMobile ? 300 : 0;
                setTimeout(() => {
                    targetContent.scrollIntoView({ behavior: 'smooth' });
                }, delay);

                // Reset scrolling to section flag when scroll ends
                const handleScrollEnd = () => {
                    isScrollingToSection = false;
                    window.removeEventListener('scrollend', handleScrollEnd);
                };
                window.addEventListener('scrollend', handleScrollEnd);

                scrollTimeout = setTimeout(() => {
                    isScrollingToSection = false;
                    window.removeEventListener('scrollend', handleScrollEnd);
                }, 1500);
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
        if (isScrollingToSection) {
            if (mobileHeader) {
                mobileHeader.classList.remove('header-hidden');
            }
        } else if (currentScrollY > lastScrollY && currentScrollY > headerThreshold && !isMenuOpen) {
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

        // Update Theme Toggle Text
        if (themeToggle) {
            const span = themeToggle.querySelector('span');
            if (span) {
                span.textContent = theme === 'dark' ? 'Light Theme' : 'Dark Theme';
            }
        }
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
        const logo = document.querySelector('.site-logo');

        if (isHidden) {
            if (bgBackdrop) bgBackdrop.classList.add('bg-hidden');
            document.documentElement.classList.add('motion-hidden');
            if (logo) logo.classList.remove('logo-animate');
            if (animationToggle) {
                animationToggle.querySelector('span').textContent = 'Enable Effect';
            }
        } else {
            if (bgBackdrop) bgBackdrop.classList.remove('bg-hidden');
            document.documentElement.classList.remove('motion-hidden');
            if (logo) logo.classList.add('logo-animate');
            if (animationToggle) {
                animationToggle.querySelector('span').textContent = 'Disable Effect';
            }
        }
    };

    // Apply initial animation state
    const isAnimationHidden = localStorage.getItem(animationStatusKey) === 'true';
    updateAnimationState(isAnimationHidden);

    if (animationToggle) {
        animationToggle.addEventListener('click', () => {
            const isCurrentlyHidden = document.documentElement.classList.contains('motion-hidden');
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

    // Initialize slide counter dynamically
    if (slides.length > 0) {
        updateSlide(currentSlideIndex);
    }
    // Modal Logic for multiple projects
    const modal = document.getElementById('project-modal');
    const projectVideo = document.getElementById('project-video');
    const insightsImage = document.getElementById('insights-image');
    const videoSource = projectVideo ? projectVideo.querySelector('source') : null;
    const openModalButtons = document.querySelectorAll('.open-project-modal');
    const closeModalBtn = document.querySelector('.close-modal');

    // Action buttons inside modal
    const btnOpenPrototype = document.getElementById('btn-open-prototype');
    const btnExpandModal = document.getElementById('btn-expand-modal');
    const modalActions = document.getElementById('modal-actions');
    const zoomControls = document.getElementById('zoom-controls');
    const btnZoomIn = document.getElementById('btn-zoom-in');
    const btnZoomOut = document.getElementById('btn-zoom-out');
    const btnZoomExpand = document.getElementById('btn-zoom-expand');
    const expandIconPath = document.getElementById('expand-icon-path');

    let currentProjectData = {
        videoUrl: '',
        prototypeUrl: '',
        insightsImageUrl: ''
    };

    // Zoom & Pan Variables
    let zoomScale = 1;
    let translateX = 0;
    let translateY = 0;
    let isPanning = false;
    let startX, startY;

    const updateImageTransform = () => {
        if (insightsImage) {
            insightsImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomScale})`;
        }
    };

    const resetZoom = () => {
        zoomScale = 1;
        translateX = 0;
        translateY = 0;
        if (insightsImage) {
            insightsImage.style.transition = 'none';
            updateImageTransform();
            // Force a reflow
            insightsImage.offsetHeight;
            insightsImage.style.transition = 'transform 0.1s ease-out';
            insightsImage.style.cursor = 'grab';
        }
    };

    const openModal = (videoUrl, prototypeUrl = '', insightsImageUrl = '') => {
        if (modal) {
            currentProjectData.videoUrl = videoUrl;
            currentProjectData.prototypeUrl = prototypeUrl;
            currentProjectData.insightsImageUrl = insightsImageUrl;

            // Default view: Show Video
            showVideo();

            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    };

    const showInsights = () => {
        if (projectVideo && insightsImage) {
            projectVideo.style.display = 'none';
            projectVideo.pause();

            insightsImage.style.display = 'block';
            insightsImage.src = currentProjectData.insightsImageUrl;
            resetZoom(); // Reset zoom when showing new insights

            // Show floating actions
            if (modalActions) modalActions.style.display = 'flex';
            if (zoomControls) zoomControls.style.display = 'flex';
            if (closeModalBtn) closeModalBtn.style.display = 'flex';

            // Update button text
            if (btnExpandModal) btnExpandModal.textContent = 'Watch Again';
        }
    };

    const showVideo = () => {
        if (projectVideo && videoSource) {
            if (insightsImage) {
                insightsImage.style.display = 'none';
                resetZoom();
            }

            projectVideo.style.display = 'block';
            videoSource.src = currentProjectData.videoUrl;
            projectVideo.load();
            projectVideo.play();

            // Show floating actions
            if (modalActions) modalActions.style.display = 'flex';
            if (zoomControls) zoomControls.style.display = 'none';
            if (closeModalBtn) closeModalBtn.style.display = 'flex';

            // Update button text
            if (btnExpandModal) btnExpandModal.textContent = 'Key Insights';
        }
    };

    const closeModal = () => {
        modal.classList.remove('open');
        document.body.style.overflow = '';
        if (zoomControls) zoomControls.style.display = 'none';
        if (insightsImage) {
            insightsImage.style.display = 'none';
            resetZoom();
        }
        if (projectVideo) {
            projectVideo.pause();
            projectVideo.currentTime = 0;
        }
    };

    openModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const videoUrl = button.getAttribute('data-video-url');
            const prototypeUrl = button.getAttribute('data-prototype-url') || '';
            const insightsImageUrl = button.getAttribute('data-insights-image') || '';
            openModal(videoUrl, prototypeUrl, insightsImageUrl);
        });
    });

    if (btnExpandModal) {
        btnExpandModal.addEventListener('click', () => {
            if (insightsImage && insightsImage.style.display === 'block') {
                showVideo();
            } else if (currentProjectData.insightsImageUrl) {
                showInsights();
            }
        });
    }

    if (btnOpenPrototype) {
        btnOpenPrototype.addEventListener('click', () => {
            if (currentProjectData.prototypeUrl) {
                window.open(currentProjectData.prototypeUrl, '_blank');
            }
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }


    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });

    if (btnZoomIn) {
        btnZoomIn.addEventListener('click', () => {
            if (insightsImage && insightsImage.style.display === 'block') {
                zoomScale = Math.min(zoomScale + 0.5, 5);
                updateImageTransform();
                insightsImage.style.cursor = zoomScale > 1 ? 'grab' : 'default';
            }
        });
    }

    if (btnZoomOut) {
        btnZoomOut.addEventListener('click', () => {
            if (insightsImage && insightsImage.style.display === 'block') {
                zoomScale = Math.max(1, zoomScale - 0.5);
                if (zoomScale === 1) {
                    translateX = 0;
                    translateY = 0;
                }
                updateImageTransform();
                insightsImage.style.cursor = zoomScale > 1 ? 'grab' : 'default';
            }
        });
    }

    if (btnZoomExpand) {
        btnZoomExpand.addEventListener('click', () => {
            if (insightsImage && insightsImage.style.display === 'block') {
                const modalContent = modal.querySelector('.modal-content');
                if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                    if (modalContent.requestFullscreen) {
                        modalContent.requestFullscreen();
                    } else if (modalContent.webkitRequestFullscreen) {
                        modalContent.webkitRequestFullscreen();
                    }
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                }
            }
        });
    }

    const updateFullscreenIcon = () => {
        if (!expandIconPath || !btnZoomExpand) return;

        resetZoom(); // Reset zoom on both entering and exiting fullscreen

        if (document.fullscreenElement || document.webkitFullscreenElement) {
            expandIconPath.setAttribute('d', 'M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7');
            btnZoomExpand.setAttribute('aria-label', 'Minimize Image');
            btnZoomExpand.setAttribute('title', 'Minimize Image');
            if (closeModalBtn) closeModalBtn.style.display = 'none';
        } else {
            expandIconPath.setAttribute('d', 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7');
            btnZoomExpand.setAttribute('aria-label', 'Expand Image');
            btnZoomExpand.setAttribute('title', 'Expand Image');
            if (closeModalBtn) closeModalBtn.style.display = 'flex';
        }
    };

    document.addEventListener('fullscreenchange', updateFullscreenIcon);
    document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);

    // Zoom & Pan Event Listeners
    if (insightsImage) {
        insightsImage.addEventListener('wheel', (e) => {
            if (insightsImage.style.display !== 'block') return;
            e.preventDefault();

            const zoomSpeed = 0.1;
            const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
            const prevScale = zoomScale;
            zoomScale = Math.min(Math.max(1, zoomScale + delta), 5);

            // Adjust translation to zoom towards center or maintain feel
            if (zoomScale === 1) {
                translateX = 0;
                translateY = 0;
            }

            updateImageTransform();
            insightsImage.style.cursor = zoomScale > 1 ? 'grab' : 'default';
        }, { passive: false });

        insightsImage.addEventListener('mousedown', (e) => {
            if (zoomScale > 1) {
                isPanning = true;
                startX = e.clientX - translateX;
                startY = e.clientY - translateY;
                insightsImage.style.transition = 'none';
                insightsImage.style.cursor = 'grabbing';
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!isPanning) return;
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateImageTransform();
        });

        window.addEventListener('mouseup', () => {
            if (isPanning) {
                isPanning = false;
                insightsImage.style.transition = 'transform 0.1s ease-out';
                insightsImage.style.cursor = zoomScale > 1 ? 'grab' : 'default';
            }
        });

        // Double click to reset
        insightsImage.addEventListener('dblclick', () => {
            resetZoom();
        });

        // Touch support for mobile panning
        insightsImage.addEventListener('touchstart', (e) => {
            if (zoomScale > 1 && e.touches.length === 1) {
                isPanning = true;
                startX = e.touches[0].clientX - translateX;
                startY = e.touches[0].clientY - translateY;
                insightsImage.style.transition = 'none';
            }
        }, { passive: true });

        insightsImage.addEventListener('touchmove', (e) => {
            if (!isPanning || e.touches.length !== 1) return;
            translateX = e.touches[0].clientX - startX;
            translateY = e.touches[0].clientY - startY;
            updateImageTransform();
        }, { passive: true });

        insightsImage.addEventListener('touchend', () => {
            isPanning = false;
            insightsImage.style.transition = 'transform 0.1s ease-out';
        });
    }

    // Back to Top Button
    const backToTopBtn = document.getElementById('back-to-top');

    if (backToTopBtn) {
        // Smooth scroll to top on click
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Custom Interactive Cursor System with Light Tail
    const cursorDot = document.getElementById('custom-cursor-dot');
    const cursorRing = document.getElementById('custom-cursor-ring');
    const cursorTrail = document.getElementById('custom-cursor-trail');

    if (cursorDot && cursorRing && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        let mouseX = -100;
        let mouseY = -100;
        let ringX = -100;
        let ringY = -100;
        let dotX = -100;
        let dotY = -100;
        let isCursorActive = false;

        let ctx = cursorTrail ? cursorTrail.getContext('2d') : null;

        const resizeCanvas = () => {
            if (cursorTrail) {
                cursorTrail.width = window.innerWidth;
                cursorTrail.height = window.innerHeight;
            }
        };
        if (cursorTrail) {
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
        }

        const trailHistory = [];
        const maxTrailLength = 20;
        const particles = [];
        let lastMouseX = -100;
        let lastMouseY = -100;

        const getAccentRGB = () => {
            const rgb = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim();
            return rgb || '226, 114, 58';
        };

        const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (!isCursorActive) {
                isCursorActive = true;
                document.body.classList.add('cursor-active');
                ringX = mouseX;
                ringY = mouseY;
                dotX = mouseX;
                dotY = mouseY;
                lastMouseX = mouseX;
                lastMouseY = mouseY;
            }
        });

        window.addEventListener('mouseleave', () => {
            isCursorActive = false;
            document.body.classList.remove('cursor-active');
        });

        window.addEventListener('mouseenter', () => {
            isCursorActive = true;
            document.body.classList.add('cursor-active');
        });

        window.addEventListener('mousedown', () => {
            document.body.classList.add('cursor-click');
        });

        window.addEventListener('mouseup', () => {
            document.body.classList.remove('cursor-click');
        });

        // Event Delegation for Hover Target Detection
        const interactiveSelector = 'a, button, input, textarea, select, [role="button"], .project-card, .skill-card, .menu-item, .panel-link, .logo-trigger, .hamburger-menu, .tab-btn, .filter-chip, .btn, .nav-link';
        
        document.body.addEventListener('mouseover', (e) => {
            if (e.target.closest(interactiveSelector)) {
                document.body.classList.add('cursor-hover');
            }
        });

        document.body.addEventListener('mouseout', (e) => {
            if (e.target.closest(interactiveSelector)) {
                const relatedTarget = e.relatedTarget;
                if (!relatedTarget || !relatedTarget.closest(interactiveSelector)) {
                    document.body.classList.remove('cursor-hover');
                }
            }
        });

        // Render loop for smooth cursor interpolation and glowing light tail
        const renderCursor = () => {
            if (isCursorActive) {
                // Dot follows closely with high precision
                dotX = lerp(dotX, mouseX, 0.4);
                dotY = lerp(dotY, mouseY, 0.4);
                cursorDot.style.left = `${dotX}px`;
                cursorDot.style.top = `${dotY}px`;

                // Ring follows with smooth lerp delay
                ringX = lerp(ringX, mouseX, 0.15);
                ringY = lerp(ringY, mouseY, 0.15);
                cursorRing.style.left = `${ringX}px`;
                cursorRing.style.top = `${ringY}px`;

                if (ctx && cursorTrail) {
                    const isMotionHidden = document.documentElement.classList.contains('motion-hidden');

                    if (isMotionHidden) {
                        ctx.clearRect(0, 0, cursorTrail.width, cursorTrail.height);
                        trailHistory.length = 0;
                        particles.length = 0;
                    } else {
                        ctx.clearRect(0, 0, cursorTrail.width, cursorTrail.height);

                        // Add point to trail history
                        trailHistory.unshift({ x: dotX, y: dotY });
                        if (trailHistory.length > maxTrailLength) {
                            trailHistory.pop();
                        }

                        // Check mouse movement speed to spawn light tail particles
                        const dx = mouseX - lastMouseX;
                        const dy = mouseY - lastMouseY;
                        const dist = Math.hypot(dx, dy);

                        if (dist > 1.5) {
                            const count = Math.min(Math.floor(dist / 5), 3) + 1;
                            for (let i = 0; i < count; i++) {
                                particles.push({
                                    x: dotX + (Math.random() - 0.5) * 6,
                                    y: dotY + (Math.random() - 0.5) * 6,
                                    vx: (Math.random() - 0.5) * 1.2 - dx * 0.04,
                                    vy: (Math.random() - 0.5) * 1.2 - dy * 0.04,
                                    size: Math.random() * 2.5 + 1.5,
                                    alpha: 1,
                                    maxLife: Math.random() * 18 + 18,
                                    life: 0
                                });
                            }
                        }
                        lastMouseX = mouseX;
                        lastMouseY = mouseY;

                        const accentRGB = getAccentRGB();

                        // 1. Draw glowing continuous light ribbon tail
                        if (trailHistory.length > 2) {
                            ctx.save();
                            ctx.shadowBlur = 10;
                            ctx.shadowColor = `rgba(${accentRGB}, 0.8)`;
                            ctx.lineCap = 'round';
                            ctx.lineJoin = 'round';

                            for (let i = 0; i < trailHistory.length - 1; i++) {
                                const p1 = trailHistory[i];
                                const p2 = trailHistory[i + 1];
                                const progress = i / trailHistory.length;
                                const alpha = (1 - progress) * 0.65;
                                const width = (1 - progress) * 4 + 0.5;

                                ctx.beginPath();
                                ctx.moveTo(p1.x, p1.y);
                                ctx.lineTo(p2.x, p2.y);
                                ctx.strokeStyle = `rgba(${accentRGB}, ${alpha})`;
                                ctx.lineWidth = width;
                                ctx.stroke();
                            }
                            ctx.restore();
                        }

                        // 2. Draw glowing light particles tail
                        for (let i = particles.length - 1; i >= 0; i--) {
                            const p = particles[i];
                            p.life++;
                            p.x += p.vx;
                            p.y += p.vy;
                            const lifeProgress = p.life / p.maxLife;
                            p.alpha = 1 - lifeProgress;
                            p.size *= 0.96;

                            if (lifeProgress >= 1 || p.size <= 0.2) {
                                particles.splice(i, 1);
                                continue;
                            }

                            ctx.save();
                            ctx.beginPath();
                            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                            ctx.fillStyle = `rgba(${accentRGB}, ${p.alpha * 0.85})`;
                            ctx.shadowBlur = 8;
                            ctx.shadowColor = `rgba(${accentRGB}, ${p.alpha})`;
                            ctx.fill();
                            ctx.restore();
                        }
                    }
                }
            } else if (ctx && cursorTrail) {
                ctx.clearRect(0, 0, cursorTrail.width, cursorTrail.height);
                trailHistory.length = 0;
                particles.length = 0;
            }
            requestAnimationFrame(renderCursor);
        };

        requestAnimationFrame(renderCursor);
    }

});

// Service Worker Registration for PWA (Independent of DOMContentLoaded)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker: Registered successfully with scope:', reg.scope))
            .catch(err => console.error('Service Worker: Registration failed:', err));
    });
}

// PWA Installation Handling
let deferredPrompt;
const pwaInstallBtn = document.getElementById('pwa-install');
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

// Function to show Safari-specific installation instructions modal
const showSafariInstallModal = () => {
    let modal = document.getElementById('safari-install-modal');

    if (!modal) {
        // Create modal container
        modal = document.createElement('div');
        modal.id = 'safari-install-modal';
        modal.className = 'safari-install-modal';
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('role', 'dialog');

        // Detect if macOS or iOS Safari
        const isMac = /Mac/i.test(navigator.userAgent) && !/iPhone|iPad|iPod/i.test(navigator.userAgent);

        const instructions = isMac
            ? `
                <p class="safari-instruction-text">To install Suman Kanti Roy's portfolio as an app on your Mac:</p>
                <ol class="safari-steps">
                    <li>
                        <span class="step-num">1</span>
                        <span class="step-desc">Click the <strong>Share</strong> icon in the Safari toolbar (or open the <strong>File</strong> menu).</span>
                    </li>
                    <li>
                        <span class="step-num">2</span>
                        <span class="step-desc">Select <strong>Add to Dock</strong> to launch it natively from your Dock.</span>
                    </li>
                </ol>
            `
            : `
                <p class="safari-instruction-text">To install Suman Kanti Roy's portfolio as an app on your iOS device:</p>
                <ol class="safari-steps">
                    <li>
                        <span class="step-num">1</span>
                        <span class="step-desc">Tap the <strong>Share</strong> icon in Safari's bottom toolbar.</span>
                    </li>
                    <li>
                        <span class="step-num">2</span>
                        <span class="step-desc">Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                    </li>
                </ol>
            `;

        modal.innerHTML = `
            <div class="safari-install-content">
                <button class="safari-install-close" id="safari-install-close" aria-label="Close dialog">&times;</button>
                <div class="safari-install-header">
                    <h3>Install Application</h3>
                </div>
                <div class="safari-install-body">
                    ${instructions}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listener for close button
        const closeBtn = modal.querySelector('#safari-install-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('open');
                document.body.style.overflow = '';
            });
        }

        // Event listener for clicking outside the content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('open');
                document.body.style.overflow = '';
            }
        });

        // Event listener for Escape key to close the modal
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.classList.contains('open')) {
                modal.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }

    // Show the modal with transition
    modal.offsetHeight; // force reflow
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
};

// Show the install button on page load in Safari if not already installed/standalone
if (isSafari && !isStandalone && pwaInstallBtn) {
    pwaInstallBtn.style.display = 'flex';
}

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;

    // Update UI to notify the user they can install the PWA (only if not Safari)
    if (pwaInstallBtn && !isSafari) {
        pwaInstallBtn.style.display = 'flex';
    }
});

if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener('click', async () => {
        if (isSafari) {
            showSafariInstallModal();
        } else if (deferredPrompt) {
            // Show the install prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            // We've used the prompt, and can't use it again
            deferredPrompt = null;
            // Hide the install button
            pwaInstallBtn.style.display = 'none';
        }
    });
}

window.addEventListener('appinstalled', (event) => {
    console.log('PWA was installed');
    if (pwaInstallBtn) {
        pwaInstallBtn.style.display = 'none';
    }
    deferredPrompt = null;
});
