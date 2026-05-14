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
            if (insightsImage) insightsImage.style.display = 'none';
            
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

});

// Service Worker Registration for PWA (Independent of DOMContentLoaded)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker: Registered successfully with scope:', reg.scope))
            .catch(err => console.error('Service Worker: Registration failed:', err));
    });
}
