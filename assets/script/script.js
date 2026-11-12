document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.panel-link, .mobile-nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const sidePanel = document.getElementById('side-panel');
    const mobileHeader = document.getElementById('mobile-header');
    const mobileBottomNav = document.getElementById('mobile-bottom-nav');

    let isScrollingToSection = false;
    let scrollTimeout = null;

    // Helper to lock/unlock scroll on mobile based on navigation menu visibility
    const updateBodyScrollLock = () => {
        if (window.innerWidth <= 768 && sidePanel) {
            const isMenuVisible = sidePanel.classList.contains('active') && !sidePanel.classList.contains('header-hidden');
            if (isMenuVisible) {
                document.body.classList.add('nav-menu-open');
            } else {
                document.body.classList.remove('nav-menu-open');
            }
        } else {
            document.body.classList.remove('nav-menu-open');
        }
    };

    // Branding Logo click logic to toggle navigation panel
    const logoLink = document.querySelector('.logo-link');
    if (logoLink && sidePanel) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.innerWidth <= 768) {
                sidePanel.classList.toggle('active');
            } else {
                sidePanel.classList.toggle('logo-hidden');
            }
            updateBodyScrollLock();
        });
    }

    // Close mobile side panel when clicking the background backdrop overlay
    const navOverlay = document.getElementById('nav-overlay');
    if (navOverlay) {
        navOverlay.addEventListener('click', () => {
            if (sidePanel) {
                sidePanel.classList.remove('active');
                updateBodyScrollLock();
            }
        });
    }

    // Touch swipe gestures for closing mobile panel (slide by finger to go back)
    let touchStartY = 0;
    let touchCurrentY = 0;
    let isDragging = false;

    if (sidePanel) {
        sidePanel.addEventListener('touchstart', (e) => {
            if (window.innerWidth <= 768) {
                touchStartY = e.touches[0].clientY;
                touchCurrentY = touchStartY;
                isDragging = true;
                sidePanel.style.transition = 'none'; // Disable transition during drag
            }
        }, { passive: true });

        sidePanel.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            touchCurrentY = e.touches[0].clientY;
            const diffY = touchCurrentY - touchStartY;

            // Only allow dragging upwards (negative diffY)
            if (diffY < 0) {
                sidePanel.style.transform = `translate(-50%, calc(-50% + ${diffY}px))`;
            }
        }, { passive: true });

        sidePanel.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            sidePanel.style.transition = ''; // Restore transitions

            const diffY = touchCurrentY - touchStartY;
            // Close if dragged up by more than 60px
            if (diffY < -60) {
                sidePanel.classList.remove('active');
                updateBodyScrollLock();
            }

            // Snap back or transition out completely
            sidePanel.style.transform = '';
        });
    }

    // Hamburger Dropdown (Options Menu) Logic
    const hamburgerDropdown = document.getElementById('hamburger-dropdown');

    if (hamburgerMenu && hamburgerDropdown) {
        hamburgerMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburgerDropdown.classList.toggle('active');
            const isExpanded = hamburgerDropdown.classList.contains('active');
            hamburgerMenu.setAttribute('aria-expanded', isExpanded);
            hamburgerMenu.classList.toggle('open', isExpanded);

            // Hide/Show navigation panel with the hamburger menu toggle on mobile
            if (window.innerWidth <= 768 && sidePanel) {
                if (isExpanded) {
                    sidePanel.classList.add('header-hidden');
                    updateBodyScrollLock();
                } else {
                    const currentScrollY = window.scrollY;
                    if (currentScrollY <= headerThreshold || currentScrollY < lastScrollY) {
                        sidePanel.classList.remove('header-hidden');
                        updateBodyScrollLock();
                    }
                }
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburgerDropdown.contains(e.target)) {
                const wasActive = hamburgerDropdown.classList.contains('active');
                hamburgerDropdown.classList.remove('active');
                hamburgerMenu.setAttribute('aria-expanded', 'false');
                hamburgerMenu.classList.remove('open');

                // Restore navigation panel visibility if menu was closed
                if (wasActive && window.innerWidth <= 768 && sidePanel) {
                    const currentScrollY = window.scrollY;
                    if (currentScrollY <= headerThreshold || currentScrollY < lastScrollY) {
                        sidePanel.classList.remove('header-hidden');
                        updateBodyScrollLock();
                    }
                }
            }
        });
    }



    // Scroll to section on click
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);

            if (targetContent) {
                // Temporarily disable hiding header during smooth scroll
                isScrollingToSection = true;
                if (scrollTimeout) clearTimeout(scrollTimeout);

                // Update active state immediately on all matching buttons
                tabButtons.forEach(btn => {
                    if (btn.getAttribute('data-target') === targetId) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });

                if (mobileHeader) {
                    mobileHeader.classList.remove('header-hidden');
                    if (window.scrollY > 20) {
                        mobileHeader.classList.add('scrolling-up');
                    }
                }

                if (mobileBottomNav) {
                    mobileBottomNav.classList.remove('nav-hidden');
                }

                targetContent.scrollIntoView({ behavior: 'smooth' });

                // Auto-close navigation panel on mobile section click
                if (window.innerWidth <= 768 && sidePanel) {
                    sidePanel.classList.remove('active');
                    updateBodyScrollLock();
                }

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
                const activeId = entry.target.getAttribute('id');

                // Update active on all matching desktop & mobile buttons
                tabButtons.forEach(btn => {
                    if (btn.getAttribute('data-target') === activeId) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
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
    window.addEventListener('load', () => {
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            updateBodyScrollLock();
        }, 100);
    });

    // Header & Side Panel Visibility on Scroll (requestAnimationFrame optimized)
    let lastScrollY = window.scrollY;
    const headerThreshold = 80;
    let scrollTicking = false;

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;

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
                    if (sidePanel) {
                        sidePanel.classList.remove('header-hidden');
                    }
                    if (mobileBottomNav) {
                        mobileBottomNav.classList.remove('nav-hidden');
                    }
                } else if (currentScrollY > lastScrollY && currentScrollY > headerThreshold) {
                    // Scrolling Down (Drag/Scroll Upward) - Hide
                    if (mobileHeader) {
                        mobileHeader.classList.add('header-hidden');
                        mobileHeader.classList.remove('scrolling-up');
                    }
                    if (sidePanel) {
                        sidePanel.classList.add('header-hidden');
                    }
                    if (mobileBottomNav) {
                        mobileBottomNav.classList.add('nav-hidden');
                    }
                } else if (currentScrollY < lastScrollY) {
                    // Scrolling Up (Drag/Scroll Downward) - Show
                    if (mobileHeader) {
                        mobileHeader.classList.remove('header-hidden');
                        // Apply floating background style only when scrolled away from top
                        if (currentScrollY > 20) {
                            mobileHeader.classList.add('scrolling-up');
                        } else {
                            mobileHeader.classList.remove('scrolling-up');
                        }
                    }
                    if (sidePanel) {
                        sidePanel.classList.remove('header-hidden');
                    }
                    if (mobileBottomNav) {
                        mobileBottomNav.classList.remove('nav-hidden');
                    }
                }

                // Always reveal nav when near the top of the page
                if (currentScrollY <= headerThreshold && mobileBottomNav) {
                    mobileBottomNav.classList.remove('nav-hidden');
                }

                // Close options dropdown on scroll
                if (hamburgerDropdown && hamburgerDropdown.classList.contains('active')) {
                    hamburgerDropdown.classList.remove('active');
                    if (hamburgerMenu) {
                        hamburgerMenu.setAttribute('aria-expanded', 'false');
                        hamburgerMenu.classList.remove('open');
                    }
                    // Restore navigation panel visibility if we auto-closed it on scroll
                    if (window.innerWidth <= 768 && sidePanel) {
                        if (currentScrollY <= headerThreshold || currentScrollY < lastScrollY) {
                            sidePanel.classList.remove('header-hidden');
                        }
                    }
                }

                updateBodyScrollLock();
                lastScrollY = currentScrollY;
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });

    // Touch drag tracking for mobile bottom navigation bar (drag upward to hide, drag downward to reveal)
    let touchDragStartY = 0;
    let touchDragStartX = 0;

    window.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length > 0) {
            touchDragStartY = e.touches[0].clientY;
            touchDragStartX = e.touches[0].clientX;
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (!e.touches || e.touches.length === 0 || isScrollingToSection || !mobileBottomNav) return;
        const currentY = e.touches[0].clientY;
        const currentX = e.touches[0].clientX;
        const diffY = currentY - touchDragStartY;
        const diffX = Math.abs(currentX - touchDragStartX);

        // Detect vertical drag when vertical movement is greater than horizontal
        if (Math.abs(diffY) > diffX && Math.abs(diffY) > 12) {
            if (diffY < -12 && window.scrollY > headerThreshold) {
                // Dragging upward (moving down into content) -> Hide nav bar
                mobileBottomNav.classList.add('nav-hidden');
            } else if (diffY > 12) {
                // Dragging downward (moving up towards top) -> Show nav bar
                mobileBottomNav.classList.remove('nav-hidden');
            }
        }
    }, { passive: true });

    // Direct swipe on bottom nav bar itself
    if (mobileBottomNav) {
        let navBarTouchStartY = 0;
        mobileBottomNav.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches.length > 0) {
                navBarTouchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        mobileBottomNav.addEventListener('touchmove', (e) => {
            if (!e.touches || e.touches.length === 0) return;
            const diffY = e.touches[0].clientY - navBarTouchStartY;
            // Swiping downward on the bottom bar hides it
            if (diffY > 15) {
                mobileBottomNav.classList.add('nav-hidden');
            }
        }, { passive: true });
    }

    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const bgBackdrop = document.querySelector('.bg-typography-backdrop');
    const savedTheme = localStorage.getItem('theme');

    // Check system preference if no saved theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || 'dark'; // Defaults to dark theme

    // Function to update theme appearance (meta tags and toggle icon/text)
    const updateThemeAppearance = (theme) => {
        // Update Theme Color Meta Tag
        const themeColorMetas = document.querySelectorAll('meta[name="theme-color"]');
        themeColorMetas.forEach(meta => {
            meta.setAttribute('content', theme === 'dark' ? '#151922' : '#fcfbf5');
        });

        // Update Theme Toggle Icon and Text
        if (themeToggle) {
            const textSpan = themeToggle.querySelector('.menu-item-text');
            const iconSpan = themeToggle.querySelector('.menu-item-icon');
            if (textSpan) {
                textSpan.textContent = theme === 'dark' ? 'Light Theme' : 'Dark Theme';
            }
            if (iconSpan) {
                iconSpan.innerHTML = theme === 'dark'
                    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
                    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
            }
        }
    };

    // Apply initial theme
    document.documentElement.setAttribute('data-theme', initialTheme);
    updateThemeAppearance(initialTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const runner = () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                updateThemeAppearance(newTheme);

                // Close menu after selection
                if (hamburgerDropdown) {
                    hamburgerDropdown.classList.remove('active');
                    if (hamburgerMenu) {
                        hamburgerMenu.setAttribute('aria-expanded', 'false');
                        hamburgerMenu.classList.remove('open');
                    }
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

    // Calm Mode Ambient Instrumental Engine (Warm Felt Piano / Rhodes + Soft Pad)
    const createCalmAudioEngine = () => {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) {
            return {
                setEffectEnabled: () => {},
                setMediaPaused: () => {}
            };
        }

        const CHORD_DURATION = 6.4; // seconds per chord (calm, unhurried pace)
        const FADE_IN_SECONDS = 2.0;
        const FADE_OUT_SECONDS = 0.85;

        // Warm Fmaj9 -> Dm9 -> Bbmaj9 -> C6/9 progression
        const progression = [
            {
                pad: [174.61, 261.63, 329.63, 392.00], // F3, C4, E4, G4
                bass: 174.61,
                keys: [220.00, 261.63, 329.63, 392.00, 440.00, 523.25]
            },
            {
                pad: [146.83, 220.00, 261.63, 329.63], // D3, A3, C4, E4
                bass: 146.83,
                keys: [174.61, 220.00, 261.63, 329.63, 349.23, 440.00]
            },
            {
                pad: [116.54, 174.61, 261.63, 293.66], // Bb2, F3, C4, D4
                bass: 116.54,
                keys: [233.08, 261.63, 293.66, 349.23, 440.00, 523.25]
            },
            {
                pad: [130.81, 196.00, 293.66, 329.63], // C3, G3, D4, E4
                bass: 130.81,
                keys: [196.00, 220.00, 293.66, 329.63, 392.00, 440.00]
            }
        ];

        let ctx = null;
        let masterGain = null;
        let dryBus = null;
        let reverbSend = null;
        let delaySend = null;

        let isEffectEnabled = false;
        let isMediaPaused = false;
        let currentSession = null;
        let sessionCounter = 0;
        let chordIndex = 0;
        let barCount = 0;
        let lastMelodicFreq = null;
        let suspendTimer = null;
        let unlockListenersAttached = false;

        const createReverbImpulse = (audioCtx, duration = 3.2, decay = 2.6) => {
            const sampleRate = audioCtx.sampleRate;
            const length = Math.floor(sampleRate * duration);
            const impulse = audioCtx.createBuffer(2, length, sampleRate);

            for (let ch = 0; ch < 2; ch++) {
                const data = impulse.getChannelData(ch);
                let prev = 0;
                for (let i = 0; i < length; i++) {
                    const progress = i / length;
                    const attack = Math.min(1, i / (sampleRate * 0.025));
                    const envelope = attack * Math.pow(1 - progress, decay);
                    const white = Math.random() * 2 - 1;
                    prev = prev * 0.65 + white * 0.35;
                    data[i] = prev * envelope;
                }
            }
            return impulse;
        };

        const ensureGraph = () => {
            if (ctx) return true;
            try {
                ctx = new AudioCtx();
            } catch (err) {
                return false;
            }

            masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(0.68, ctx.currentTime);

            const compressor = ctx.createDynamicsCompressor();
            compressor.threshold.setValueAtTime(-18, ctx.currentTime);
            compressor.knee.setValueAtTime(18, ctx.currentTime);
            compressor.ratio.setValueAtTime(3, ctx.currentTime);
            compressor.attack.setValueAtTime(0.02, ctx.currentTime);
            compressor.release.setValueAtTime(0.25, ctx.currentTime);

            const masterFilter = ctx.createBiquadFilter();
            masterFilter.type = 'lowpass';
            masterFilter.frequency.setValueAtTime(2100, ctx.currentTime);
            masterFilter.Q.setValueAtTime(0.5, ctx.currentTime);

            dryBus = ctx.createGain();
            dryBus.gain.setValueAtTime(0.72, ctx.currentTime);

            // Warm dark hall reverb
            const convolver = ctx.createConvolver();
            convolver.buffer = createReverbImpulse(ctx, 3.2, 2.6);

            const reverbFilter = ctx.createBiquadFilter();
            reverbFilter.type = 'lowpass';
            reverbFilter.frequency.setValueAtTime(1350, ctx.currentTime);

            const reverbReturn = ctx.createGain();
            reverbReturn.gain.setValueAtTime(0.55, ctx.currentTime);

            reverbSend = ctx.createGain();
            reverbSend.gain.setValueAtTime(0.42, ctx.currentTime);
            reverbSend.connect(convolver);
            convolver.connect(reverbFilter);
            reverbFilter.connect(reverbReturn);
            reverbReturn.connect(masterFilter);

            // Subtle warm stereo echo
            const delayNode = ctx.createDelay(1.0);
            delayNode.delayTime.setValueAtTime(0.42, ctx.currentTime);

            const delayFilter = ctx.createBiquadFilter();
            delayFilter.type = 'lowpass';
            delayFilter.frequency.setValueAtTime(900, ctx.currentTime);

            const delayFeedback = ctx.createGain();
            delayFeedback.gain.setValueAtTime(0.24, ctx.currentTime);

            const delayReturn = ctx.createGain();
            delayReturn.gain.setValueAtTime(0.32, ctx.currentTime);

            delaySend = ctx.createGain();
            delaySend.gain.setValueAtTime(0.18, ctx.currentTime);
            delaySend.connect(delayNode);
            delayNode.connect(delayFilter);
            delayFilter.connect(delayFeedback);
            delayFeedback.connect(delayNode);
            delayFilter.connect(delayReturn);
            delayReturn.connect(masterFilter);

            dryBus.connect(masterFilter);
            masterFilter.connect(compressor);
            compressor.connect(masterGain);
            masterGain.connect(ctx.destination);

            return true;
        };

        const registerSessionNode = (session, node, cleanupTarget = null) => {
            session.nodes.add(node);
            if (cleanupTarget) {
                cleanupTarget.onended = () => {
                    session.nodes.delete(node);
                    try {
                        node.disconnect();
                    } catch (e) {
                        // Node already disconnected
                    }
                };
            }
        };

        const playPadChord = (session, frequencies, startTime, duration) => {
            if (!ctx || !session.active) return;

            const padFilter = ctx.createBiquadFilter();
            padFilter.type = 'lowpass';
            padFilter.Q.setValueAtTime(0.55, startTime);
            padFilter.frequency.setValueAtTime(300, startTime);
            padFilter.frequency.linearRampToValueAtTime(580, startTime + duration * 0.45);
            padFilter.frequency.linearRampToValueAtTime(320, startTime + duration + 2.5);

            const padGain = ctx.createGain();
            const totalDuration = duration + 2.8;
            padGain.gain.setValueAtTime(0.0001, startTime);
            padGain.gain.linearRampToValueAtTime(0.068, startTime + 2.2);
            padGain.gain.setValueAtTime(0.068, startTime + duration - 0.2);
            padGain.gain.exponentialRampToValueAtTime(0.0001, startTime + totalDuration);

            const padDry = ctx.createGain();
            padDry.gain.setValueAtTime(0.45, startTime);
            const padWet = ctx.createGain();
            padWet.gain.setValueAtTime(0.75, startTime);

            padFilter.connect(padGain);
            padGain.connect(padDry);
            padGain.connect(padWet);
            padDry.connect(session.dryOut);
            padWet.connect(session.reverbOut);

            const perVoiceScale = 1 / Math.max(frequencies.length, 1);

            frequencies.forEach((freq) => {
                const voiceGain = ctx.createGain();
                voiceGain.gain.setValueAtTime(perVoiceScale, startTime);
                voiceGain.connect(padFilter);

                const oscTriangle = ctx.createOscillator();
                oscTriangle.type = 'triangle';
                oscTriangle.frequency.setValueAtTime(freq, startTime);
                oscTriangle.detune.setValueAtTime(-4, startTime);

                const oscSine = ctx.createOscillator();
                oscSine.type = 'sine';
                oscSine.frequency.setValueAtTime(freq, startTime);
                oscSine.detune.setValueAtTime(4, startTime);

                const triMix = ctx.createGain();
                triMix.gain.setValueAtTime(0.45, startTime);
                const sineMix = ctx.createGain();
                sineMix.gain.setValueAtTime(0.55, startTime);

                oscTriangle.connect(triMix);
                oscSine.connect(sineMix);
                triMix.connect(voiceGain);
                sineMix.connect(voiceGain);

                oscTriangle.start(startTime);
                oscSine.start(startTime);
                oscTriangle.stop(startTime + totalDuration + 0.05);
                oscSine.stop(startTime + totalDuration + 0.05);

                registerSessionNode(session, oscTriangle, oscTriangle);
                registerSessionNode(session, oscSine, oscSine);
            });
        };

        const playKeyNote = (session, freq, startTime, duration = 3.8, velocity = 0.75, pan = 0) => {
            if (!ctx || !session.active) return;

            const noteFilter = ctx.createBiquadFilter();
            noteFilter.type = 'lowpass';
            noteFilter.Q.setValueAtTime(0.6, startTime);
            const initialCutoff = Math.min(freq * 4.0, 1550);
            const settledCutoff = Math.max(freq * 1.25, 320);
            noteFilter.frequency.setValueAtTime(initialCutoff, startTime);
            noteFilter.frequency.exponentialRampToValueAtTime(settledCutoff, startTime + Math.min(1.6, duration * 0.6));

            const noteGain = ctx.createGain();
            const peakGain = Math.max(0.001, 0.115 * velocity);
            noteGain.gain.setValueAtTime(0.0001, startTime);
            noteGain.gain.linearRampToValueAtTime(peakGain, startTime + 0.034);
            noteGain.gain.exponentialRampToValueAtTime(Math.max(0.0005, peakGain * 0.32), startTime + Math.min(0.78, duration * 0.35));
            noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

            // Fundamental sine + warm 2nd harmonic + gentle Rhodes tine transient
            const oscFundamental = ctx.createOscillator();
            oscFundamental.type = 'sine';
            oscFundamental.frequency.setValueAtTime(freq, startTime);
            const g1 = ctx.createGain();
            g1.gain.setValueAtTime(0.78, startTime);

            const oscHarmonic = ctx.createOscillator();
            oscHarmonic.type = 'triangle';
            oscHarmonic.frequency.setValueAtTime(freq * 2, startTime);
            const g2 = ctx.createGain();
            g2.gain.setValueAtTime(0.15, startTime);
            g2.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.max(0.4, duration * 0.45));

            const oscTine = ctx.createOscillator();
            oscTine.type = 'sine';
            oscTine.frequency.setValueAtTime(freq * 3, startTime);
            const g3 = ctx.createGain();
            g3.gain.setValueAtTime(0.035, startTime);
            g3.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.12);

            oscFundamental.connect(g1);
            oscHarmonic.connect(g2);
            oscTine.connect(g3);
            g1.connect(noteFilter);
            g2.connect(noteFilter);
            g3.connect(noteFilter);
            noteFilter.connect(noteGain);

            let outputNode = noteGain;
            if (typeof ctx.createStereoPanner === 'function') {
                const panner = ctx.createStereoPanner();
                panner.pan.setValueAtTime(Math.max(-0.5, Math.min(0.5, pan)), startTime);
                noteGain.connect(panner);
                outputNode = panner;
            }

            outputNode.connect(session.dryOut);
            outputNode.connect(session.reverbOut);
            outputNode.connect(session.delayOut);

            oscFundamental.start(startTime);
            oscHarmonic.start(startTime);
            oscTine.start(startTime);

            oscFundamental.stop(startTime + duration + 0.05);
            oscHarmonic.stop(startTime + duration + 0.05);
            oscTine.stop(startTime + 0.18);

            registerSessionNode(session, oscFundamental, oscFundamental);
            registerSessionNode(session, oscHarmonic, oscHarmonic);
            registerSessionNode(session, oscTine, oscTine);
        };

        const pickMelodicNote = (pool, preferredIndices) => {
            const candidates = preferredIndices
                .map(i => pool[i])
                .filter(f => f && f !== lastMelodicFreq);
            const chosen = candidates.length > 0
                ? candidates[Math.floor(Math.random() * candidates.length)]
                : pool[preferredIndices[0]];
            lastMelodicFreq = chosen;
            return chosen;
        };

        const scheduleBar = (session) => {
            if (!ctx || !session.active || currentSession !== session) return;

            const chord = progression[chordIndex];
            const baseTime = ctx.currentTime + 0.06;
            const humanize = () => (Math.random() - 0.5) * 0.07;

            playPadChord(session, chord.pad, baseTime, CHORD_DURATION);

            // Soft felt-piano / Rhodes phrasing
            if (barCount % 2 === 0) {
                playKeyNote(session, chord.bass, baseTime + 0.04, 4.4, 0.72, -0.18);
                playKeyNote(session, chord.keys[1], baseTime + 0.12, 3.8, 0.62, -0.06);
                playKeyNote(session, pickMelodicNote(chord.keys, [2, 3]), baseTime + 1.55 + humanize(), 3.6, 0.58, 0.1);
                playKeyNote(session, pickMelodicNote(chord.keys, [4, 5]), baseTime + 3.25 + humanize(), 3.5, 0.54, 0.2);
                if (Math.random() < 0.7) {
                    playKeyNote(session, pickMelodicNote(chord.keys, [2, 3]), baseTime + 4.9 + humanize(), 3.1, 0.42, 0.14);
                }
            } else {
                playKeyNote(session, chord.bass, baseTime + 0.04, 4.4, 0.7, -0.18);
                playKeyNote(session, chord.keys[2], baseTime + 0.14, 3.9, 0.6, -0.04);
                playKeyNote(session, pickMelodicNote(chord.keys, [4, 5]), baseTime + 1.85 + humanize(), 3.6, 0.56, 0.22);
                playKeyNote(session, pickMelodicNote(chord.keys, [1, 3]), baseTime + 3.6 + humanize(), 3.4, 0.5, 0.08);
                if (Math.random() < 0.6) {
                    playKeyNote(session, pickMelodicNote(chord.keys, [3, 4]), baseTime + 5.1 + humanize(), 3.0, 0.4, 0.18);
                }
            }

            chordIndex = (chordIndex + 1) % progression.length;
            barCount++;

            session.timer = setTimeout(() => scheduleBar(session), CHORD_DURATION * 1000);
        };

        const detachUnlockListeners = () => {
            if (!unlockListenersAttached) return;
            unlockListenersAttached = false;
            document.removeEventListener('pointerdown', handleGestureUnlock, true);
            document.removeEventListener('keydown', handleGestureUnlock, true);
            document.removeEventListener('touchstart', handleGestureUnlock, true);
        };

        const handleGestureUnlock = (e) => {
            // Avoid starting audio for a split second if user is clicking the toggle to pause effects
            if (e && e.target && e.target.closest && e.target.closest('#animation-toggle')) {
                return;
            }
            detachUnlockListeners();
            if (isEffectEnabled && !isMediaPaused && !currentSession) {
                startSession();
            }
        };

        const attachUnlockListeners = () => {
            if (unlockListenersAttached) return;
            unlockListenersAttached = true;
            document.addEventListener('pointerdown', handleGestureUnlock, true);
            document.addEventListener('keydown', handleGestureUnlock, true);
            document.addEventListener('touchstart', handleGestureUnlock, true);
        };

        const stopSession = (fadeSeconds = FADE_OUT_SECONDS) => {
            const session = currentSession;
            currentSession = null;

            if (!session) return;
            session.active = false;
            if (session.timer) {
                clearTimeout(session.timer);
                session.timer = null;
            }

            if (ctx) {
                session.fadeToZero(fadeSeconds);
            }

            setTimeout(() => {
                session.nodes.forEach((node) => {
                    try {
                        node.stop();
                    } catch (e) {
                        // Already stopped
                    }
                    try {
                        node.disconnect();
                    } catch (e) {
                        // Already disconnected
                    }
                });
                session.nodes.clear();
                try {
                    session.dryOut.disconnect();
                    session.reverbOut.disconnect();
                    session.delayOut.disconnect();
                } catch (e) {
                    // Already disconnected
                }
            }, fadeSeconds * 1000 + 150);

            if (suspendTimer) clearTimeout(suspendTimer);
            suspendTimer = setTimeout(() => {
                if (!currentSession && ctx && ctx.state === 'running') {
                    ctx.suspend().catch(() => {});
                }
            }, fadeSeconds * 1000 + 1000);
        };

        const startSession = () => {
            if (currentSession) return;
            if (!ensureGraph()) return;

            if (suspendTimer) {
                clearTimeout(suspendTimer);
                suspendTimer = null;
            }

            const beginPlayback = () => {
                if (!isEffectEnabled || isMediaPaused || currentSession) return;

                const now = ctx.currentTime;
                const sDry = ctx.createGain();
                const sReverb = ctx.createGain();
                const sDelay = ctx.createGain();
                sDry.gain.setValueAtTime(0.0001, now);
                sReverb.gain.setValueAtTime(0.0001, now);
                sDelay.gain.setValueAtTime(0.0001, now);

                sDry.gain.linearRampToValueAtTime(1.0, now + FADE_IN_SECONDS);
                sReverb.gain.linearRampToValueAtTime(1.0, now + FADE_IN_SECONDS);
                sDelay.gain.linearRampToValueAtTime(1.0, now + FADE_IN_SECONDS);

                sDry.connect(dryBus);
                sReverb.connect(reverbSend);
                sDelay.connect(delaySend);

                const session = {
                    id: ++sessionCounter,
                    active: true,
                    dryOut: sDry,
                    reverbOut: sReverb,
                    delayOut: sDelay,
                    nodes: new Set(),
                    timer: null,
                    fadeToZero: (fadeDur) => {
                        const t = ctx.currentTime;
                        [sDry, sReverb, sDelay].forEach((g) => {
                            g.gain.cancelScheduledValues(t);
                            g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), t);
                            g.gain.linearRampToValueAtTime(0.0001, t + fadeDur);
                        });
                    }
                };

                currentSession = session;
                scheduleBar(session);
            };

            if (ctx.state === 'suspended') {
                ctx.resume().then(() => {
                    detachUnlockListeners();
                    beginPlayback();
                }).catch(() => {
                    attachUnlockListeners();
                });
            } else {
                detachUnlockListeners();
                beginPlayback();
            }
        };

        const syncPlayback = (fromUserGesture = false) => {
            const shouldPlay = isEffectEnabled && !isMediaPaused;
            if (shouldPlay) {
                if (!fromUserGesture && (!ctx || ctx.state === 'suspended')) {
                    attachUnlockListeners();
                    return;
                }
                startSession();
            } else {
                detachUnlockListeners();
                stopSession(isMediaPaused ? 0.5 : FADE_OUT_SECONDS);
            }
        };

        return {
            setEffectEnabled: (enabled, fromUserGesture = false) => {
                isEffectEnabled = Boolean(enabled);
                syncPlayback(fromUserGesture);
            },
            setMediaPaused: (paused, fromUserGesture = true) => {
                isMediaPaused = Boolean(paused);
                syncPlayback(fromUserGesture);
            }
        };
    };

    const calmAudio = createCalmAudioEngine();

    // Animation Toggle Logic
    const animationToggle = document.getElementById('animation-toggle');
    const animationStatusKey = 'animation_hidden';

    const updateAnimationState = (isHidden, fromUserGesture = false) => {
        const logo = document.querySelector('.site-logo');

        if (isHidden) {
            if (bgBackdrop) bgBackdrop.classList.add('bg-hidden');
            document.documentElement.classList.add('motion-hidden');
            if (logo) logo.classList.remove('logo-animate');
            if (animationToggle) {
                const textSpan = animationToggle.querySelector('.menu-item-text');
                const iconSpan = animationToggle.querySelector('.menu-item-icon');
                if (textSpan) textSpan.textContent = 'Active Effect';
                if (iconSpan) {
                    iconSpan.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
                }
            }
            calmAudio.setEffectEnabled(false, fromUserGesture);
        } else {
            if (bgBackdrop) bgBackdrop.classList.remove('bg-hidden');
            document.documentElement.classList.remove('motion-hidden');
            if (logo) logo.classList.add('logo-animate');
            if (animationToggle) {
                const textSpan = animationToggle.querySelector('.menu-item-text');
                const iconSpan = animationToggle.querySelector('.menu-item-icon');
                if (textSpan) textSpan.textContent = 'Pause Effect';
                if (iconSpan) {
                    iconSpan.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon"><polygon points="5 3 19 12 5 21 5 3"></polygon><line x1="2" y1="2" x2="22" y2="22"></line></svg>`;
                }
            }
            calmAudio.setEffectEnabled(true, fromUserGesture);
        }
    };

    // Apply initial animation state
    const isAnimationHidden = localStorage.getItem(animationStatusKey) !== 'false';
    updateAnimationState(isAnimationHidden, false);

    if (animationToggle) {
        animationToggle.addEventListener('click', () => {
            const isCurrentlyHidden = document.documentElement.classList.contains('motion-hidden');
            const newState = !isCurrentlyHidden;

            updateAnimationState(newState, true);
            localStorage.setItem(animationStatusKey, newState);

            // Close dropdown
            if (hamburgerDropdown) {
                hamburgerDropdown.classList.remove('active');
                if (hamburgerMenu) {
                    hamburgerMenu.setAttribute('aria-expanded', 'false');
                    hamburgerMenu.classList.remove('open');
                }
            }
        });
    }

    // Update layout states on window resize
    window.addEventListener('resize', () => {
        if (sidePanel) {
            sidePanel.classList.remove('active');
            sidePanel.classList.remove('logo-hidden');
        }
        updateBodyScrollLock();
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
            calmAudio.setMediaPaused(true, true);
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
        calmAudio.setMediaPaused(false, true);
    };

    if (projectVideo) {
        projectVideo.addEventListener('play', () => {
            calmAudio.setMediaPaused(true, true);
        });
    }

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
        let isLoopRunning = false;

        let ctx = cursorTrail ? cursorTrail.getContext('2d') : null;

        const resizeCanvas = () => {
            if (cursorTrail) {
                cursorTrail.width = window.innerWidth;
                cursorTrail.height = window.innerHeight;
            }
        };

        // Debounce utility to optimize resize events
        const debounce = (func, delay) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func(...args), delay);
            };
        };

        if (cursorTrail) {
            resizeCanvas();
            window.addEventListener('resize', debounce(resizeCanvas, 100));
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

        const startRenderLoop = () => {
            if (!isLoopRunning) {
                isLoopRunning = true;
                requestAnimationFrame(renderCursor);
            }
        };

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
            startRenderLoop();
        });

        window.addEventListener('mouseleave', () => {
            isCursorActive = false;
            document.body.classList.remove('cursor-active');
        });

        window.addEventListener('mouseenter', () => {
            isCursorActive = true;
            document.body.classList.add('cursor-active');
            startRenderLoop();
        });

        window.addEventListener('mousedown', () => {
            document.body.classList.add('cursor-click');
        });

        window.addEventListener('mouseup', () => {
            document.body.classList.remove('cursor-click');
        });

        // Event Delegation for Hover Target Detection (with safety type checks)
        const interactiveSelector = 'a, button, input, textarea, select, [role="button"], .project-card, .skill-card, .menu-item, .panel-link, .logo-trigger, .hamburger-menu, .tab-btn, .filter-chip, .btn, .nav-link';

        document.body.addEventListener('mouseover', (e) => {
            if (e.target && e.target.closest && e.target.closest(interactiveSelector)) {
                document.body.classList.add('cursor-hover');
            }
        });

        document.body.addEventListener('mouseout', (e) => {
            if (e.target && e.target.closest && e.target.closest(interactiveSelector)) {
                const relatedTarget = e.relatedTarget;
                if (!relatedTarget || !(relatedTarget instanceof Element) || !relatedTarget.closest || !relatedTarget.closest(interactiveSelector)) {
                    document.body.classList.remove('cursor-hover');
                }
            }
        });

        // Render loop for smooth cursor interpolation and glowing light tail (on-demand optimized)
        const renderCursor = () => {
            if (!isCursorActive) {
                // If inactive, clear canvas, reset arrays and stop the loop
                if (ctx && cursorTrail) {
                    ctx.clearRect(0, 0, cursorTrail.width, cursorTrail.height);
                }
                trailHistory.length = 0;
                particles.length = 0;
                isLoopRunning = false;
                return;
            }

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

            // Check if cursor has fully settled and particle tails have faded out
            const isIdle =
                Math.abs(dotX - mouseX) < 0.1 &&
                Math.abs(dotY - mouseY) < 0.1 &&
                Math.abs(ringX - mouseX) < 0.1 &&
                Math.abs(ringY - mouseY) < 0.1 &&
                particles.length === 0 &&
                trailHistory.length <= 1;

            if (isIdle) {
                // Snap to exact coordinates and pause requestAnimationFrame loop until next mouse movement
                dotX = mouseX;
                dotY = mouseY;
                ringX = mouseX;
                ringY = mouseY;
                cursorDot.style.left = `${dotX}px`;
                cursorDot.style.top = `${dotY}px`;
                cursorRing.style.left = `${ringX}px`;
                cursorRing.style.top = `${ringY}px`;
                if (ctx && cursorTrail) {
                    ctx.clearRect(0, 0, cursorTrail.width, cursorTrail.height);
                }
                trailHistory.length = 0;
                isLoopRunning = false;
                return;
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

// Function to show PWA installation instructions or browser prompt modal
const showPWAInstallModal = () => {
    let modal = document.getElementById('pwa-install-modal');

    if (!modal) {
        // Create modal container
        modal = document.createElement('div');
        modal.id = 'pwa-install-modal';
        modal.className = 'safari-install-modal'; // Reuse the existing PWA modal style
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('role', 'dialog');

        let bodyContent = '';
        if (isSafari) {
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
            bodyContent = instructions;
        } else {
            // Other modern mobile browsers (Chrome, Firefox, Edge, etc.)
            bodyContent = `
                <p class="safari-instruction-text">Install Suman Kanti Roy's portfolio on your home screen for offline access and a native app experience.</p>
                <div style="display: flex; gap: 15px; margin-top: 25px; justify-content: flex-end;">
                    <button class="btn btn-secondary" id="pwa-later-btn" style="padding: 10px 20px; border-radius: 8px; font-weight: 500; font-size: 0.95rem; border: 1px solid var(--border-color); background: transparent; color: var(--text-primary); cursor: pointer;">Maybe Later</button>
                    <button class="btn btn-primary" id="pwa-now-btn" style="padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.95rem; background: var(--accent-color); color: #fff; border: none; cursor: pointer;">Let's Install</button>
                </div>
            `;
        }

        modal.innerHTML = `
            <div class="safari-install-content">
                <button class="safari-install-close" id="pwa-install-close" aria-label="Close dialog">&times;</button>
                <div class="safari-install-header">
                    <h3>Install Application</h3>
                </div>
                <div class="safari-install-body">
                    ${bodyContent}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listener for close button
        const closeBtn = modal.querySelector('#pwa-install-close');
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

        // Event listeners for action buttons
        const laterBtn = modal.querySelector('#pwa-later-btn');
        const nowBtn = modal.querySelector('#pwa-now-btn');

        if (laterBtn) {
            laterBtn.addEventListener('click', () => {
                modal.classList.remove('open');
                document.body.style.overflow = '';
            });
        }

        if (nowBtn) {
            nowBtn.addEventListener('click', async () => {
                modal.classList.remove('open');
                document.body.style.overflow = '';
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`User response to the install prompt: ${outcome}`);
                    deferredPrompt = null;
                    if (pwaInstallBtn) {
                        pwaInstallBtn.style.display = 'none';
                    }
                }
            });
        }

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

const isMobile = window.innerWidth <= 768;
const isFirstTime = !localStorage.getItem('pwa_prompt_shown');

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;

    // Update UI to notify the user they can install the PWA (only if not Safari)
    if (pwaInstallBtn && !isSafari) {
        pwaInstallBtn.style.display = 'flex';
    }

    // Auto-prompt on first mobile load
    if (isMobile && isFirstTime && !isStandalone) {
        localStorage.setItem('pwa_prompt_shown', 'true');
        setTimeout(() => {
            showPWAInstallModal();
        }, 3000);
    }
});

// For mobile Safari: beforeinstallprompt never fires, so we trigger modal manually after page load
if (isMobile && isFirstTime && !isStandalone && isSafari) {
    localStorage.setItem('pwa_prompt_shown', 'true');
    window.addEventListener('load', () => {
        setTimeout(() => {
            showPWAInstallModal();
        }, 3000);
    });
}

if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener('click', () => {
        showPWAInstallModal();
    });
}

window.addEventListener('appinstalled', (event) => {
    console.log('PWA was installed');
    if (pwaInstallBtn) {
        pwaInstallBtn.style.display = 'none';
    }
    deferredPrompt = null;
});
