document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.panel-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const sidePanel = document.getElementById('side-panel');



    // Toggle Side Panel & Scroll to Top
    const togglePanel = () => {
        const isOpen = sidePanel.classList.contains('open');
        
        // Smooth scroll to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        if (isOpen) {
            sidePanel.classList.remove('open');
            hamburgerMenu.classList.remove('open');
            hamburgerMenu.setAttribute('title', 'Open menu');
            hamburgerMenu.setAttribute('aria-label', 'Open menu');
        } else {
            sidePanel.classList.add('open');
            hamburgerMenu.classList.add('open');
            hamburgerMenu.setAttribute('title', 'Home');
            hamburgerMenu.setAttribute('aria-label', 'Home');
        }
    };

    const closePanel = () => {
        sidePanel.classList.remove('open');
        hamburgerMenu.classList.remove('open');
        hamburgerMenu.setAttribute('title', 'Open menu');
        hamburgerMenu.setAttribute('aria-label', 'Open menu');
    };

    hamburgerMenu.addEventListener('click', togglePanel);



    // Scroll to section on click
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            
            if (targetContent) {
                // Keep the panel open as per the request: Show/hide ONLY on hamburger click
                
                // Allow a tiny delay before scrolling
                setTimeout(() => {
                    targetContent.scrollIntoView({ behavior: 'smooth' });
                }, 100);
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

        // Close dropdown on scroll
        window.addEventListener('scroll', () => {
            if (logoDropdown.classList.contains('active')) {
                logoDropdown.classList.remove('active');
                logoTrigger.setAttribute('aria-expanded', 'false');
            }
        }, { passive: true });
    }

    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const designProcessImg = document.getElementById('design-process-img');
    const savedTheme = localStorage.getItem('theme');
    
    // Check system preference if no saved theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    // Function to update images based on theme
    const updateThemeImages = (theme) => {
        if (designProcessImg) {
            const src = theme === 'dark' 
                ? 'assets/icons/design-process-white.svg' 
                : 'assets/icons/design-process-black.svg';
            designProcessImg.src = src;
        }
    };

    // Apply initial theme
    if (initialTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeImages('dark');
    } else {
        updateThemeImages('light');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeImages(newTheme);
            
            // Close menu after selection
            if (logoDropdown) logoDropdown.classList.remove('active');
            if (logoTrigger) logoTrigger.setAttribute('aria-expanded', 'false');
        });
    }

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
    const btnBackToPrototype = document.getElementById('back-to-prototype');
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

            // Default view: Show Figma
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
            
            // Show floating actions and hide back button
            if (modalActions) modalActions.style.display = 'flex';
            if (btnBackToPrototype) btnBackToPrototype.style.display = 'none';
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

            // Hide floating actions and show back button
            if (modalActions) modalActions.style.display = 'none';
            if (btnBackToPrototype) btnBackToPrototype.style.display = 'flex';
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

    if (btnBackToPrototype) {
        btnBackToPrototype.addEventListener('click', showFigma);
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
