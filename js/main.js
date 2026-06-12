/* ====================================================
   MAIN APPLICATION CONTROL FLOW & CONFIGURATION
   ==================================================== */

const CONFIG = {
    herName: "Akshh",
    personalMessage: `To my Friend,<br>Every memory in this archive tells a different story. 
    From the tiny baby photos to the funny poses, each page captures a small part of the wonderful person you are.<br>May this year bring you 
    endless happiness, exciting adventures, success in everything you dream of, and countless new memories waiting to be made.`
};

class FlowManager {
    constructor() {
        this.currentScene = 'loading';

        // Initialize dynamic configurations
        document.getElementById('her-name').innerHTML = CONFIG.herName;
        document.getElementById('book-left-subheading').innerHTML = CONFIG.herName;
        document.getElementById('personal-message').innerHTML = CONFIG.personalMessage;

        this.runLoadingScreen();
    }

    /* ====================================================
       SCENE 1: LOADING SCREEN SEQUENCE
       ==================================================== */
    runLoadingScreen() {
        const line1 = document.getElementById('loading-text-1');
        const line2 = document.getElementById('loading-text-2');

        const txt1 = "ONCE UPON A TIME, A STAR WAS BORN...";
        const txt2 = "TODAY, WE CELEBRATE HER JOURNEY...";

        const typeText = (element, text, speed, callback) => {
            let idx = 0;
            const timer = setInterval(() => {
                element.innerHTML += text.charAt(idx);
                idx++;
                if (idx >= text.length) {
                    clearInterval(timer);
                    if (callback) callback();
                }
            }, speed);
        };

        // Sequence start
        setTimeout(() => {
            typeText(line1, txt1, 45, () => {
                setTimeout(() => {
                    typeText(line2, txt2, 45, () => {
                        // Hold for 1.5s, then transition
                        setTimeout(() => {
                            this.transitionToBirthdayScreen();
                        }, 1500);
                    });
                }, 800);
            });
        }, 500);
    }

    /* ====================================================
       TRANSITION: LOADING -> BIRTHDAY CEREMONY
       ==================================================== */
    transitionToBirthdayScreen() {
        this.currentScene = 'ceremony';

        const loading = document.getElementById('loading-screen');
        const birthday = document.getElementById('birthday-screen');

        // Fade out Loading Screen
        gsap.to(loading, {
            opacity: 0,
            duration: 1.2,
            onComplete: () => {
                loading.classList.remove('active');

                // Show Birthday Screen
                birthday.classList.add('active');
                birthday.style.opacity = 0;

                // Animate entrance elements
                gsap.to(birthday, { opacity: 1, duration: 1.2 });

                // Stagger animate title, subtitle, and cake
                gsap.from('.ceremony-title', { y: -50, opacity: 0, duration: 1.2, ease: "power2.out", delay: 0.2 });
                gsap.from('.ceremony-subtitle', { y: -30, opacity: 0, duration: 1.2, ease: "power2.out", delay: 0.4 });
                gsap.from('.cake-wrapper', { scale: 0.5, opacity: 0, duration: 1.8, ease: "back.out(1.2)", delay: 0.6 });
                gsap.from('#interaction-controls', { y: 30, opacity: 0, duration: 1.2, ease: "power2.out", delay: 0.9 });
            }
        });
    }

    /* ====================================================
       TRANSITION: CEREMONY -> ARCHIVE ENTRANCE
       ==================================================== */
    transitionToArchiveEntrance() {
        this.currentScene = 'archive-entrance';

        const birthday = document.getElementById('birthday-screen');
        const entrance = document.getElementById('archive-entrance');

        // Fade out Birthday Screen
        gsap.to(birthday, {
            opacity: 0,
            duration: 1.0,
            onComplete: () => {
                birthday.classList.remove('active');

                // Show Entrance Screen
                entrance.classList.add('active');
                entrance.style.opacity = 0;

                gsap.to(entrance, { opacity: 1, duration: 1.0 });

                // Stagger title and subtitle of entrance
                gsap.from('.entrance-title', { y: -30, opacity: 0, duration: 1.2, ease: "power2.out", delay: 0.3 });
                gsap.from('.entrance-subtitle', { y: 20, opacity: 0, duration: 1.2, ease: "power2.out", delay: 0.6 });

                // Wait 4 seconds, then slide gates open automatically
                setTimeout(() => {
                    this.transitionToMemoryArchive();
                }, 4000);
            }
        });
    }

    /* ====================================================
       TRANSITION: ARCHIVE ENTRANCE -> MEMORY ARCHIVE
       ==================================================== */
    transitionToMemoryArchive() {
        this.currentScene = 'archive';

        const entrance = document.getElementById('archive-entrance');
        const archive = document.getElementById('archive-screen');

        // Play creaking gates slide sound
        if (window.audioEngine) {
            window.audioEngine.playPageFlipSFX();
        }

        // Split gates slide open left and right
        gsap.to('.left-gate', { xPercent: -100, rotateY: -45, duration: 2.2, ease: "power2.inOut" });
        gsap.to('.right-gate', { xPercent: 100, rotateY: 45, duration: 2.2, ease: "power2.inOut" });

        // Camera Zoom In and Fade Text
        gsap.to('.gates-content-overlay', { scale: 1.3, opacity: 0, duration: 1.8, ease: "power2.in" });

        setTimeout(() => {
            // Setup and fade in Archive table environment
            archive.classList.add('active');
            archive.style.opacity = 0;

            gsap.to(archive, {
                opacity: 1,
                duration: 1.5,
                onComplete: () => {
                    // Remove entrance gate elements to save processing power
                    entrance.classList.remove('active');

                    // Initialize memory index details
                    if (window.archiveManager) {
                        window.archiveManager.currentIdx = 0;
                        window.archiveManager.loadCurrentMemory();
                    }
                }
            });

            // Animate props entrance
            gsap.from('.archive-header', { y: -30, opacity: 0, duration: 1.0, delay: 0.2 });
            gsap.from('.letter-outer-container', { scale: 0.8, opacity: 0, duration: 1.5, ease: "back.out(1.0)", delay: 0.4 });
            gsap.from('.archive-navigation', { y: 30, opacity: 0, duration: 1.0, delay: 0.7 });
            gsap.to('.table-prop', { opacity: 0.6, duration: 1.5, stagger: 0.2, delay: 0.3 });

        }, 1200); // Overlay table slightly before gates finish slide
    }

    /* ====================================================
       TRANSITION: MEMORY ARCHIVE -> FINAL BOOK
       ==================================================== */
    transitionToFinalBook() {
        this.currentScene = 'book';

        const archive = document.getElementById('archive-screen');
        const bookScreen = document.getElementById('book-screen');

        // Stop birthday music box and dim background props
        if (window.audioEngine) {
            window.audioEngine.stopAllMusic();
        }

        gsap.to(archive, {
            opacity: 0,
            duration: 1.0,
            onComplete: () => {
                archive.classList.remove('active');

                // Show Book Screen
                bookScreen.classList.add('active');
                bookScreen.style.opacity = 0;

                gsap.to(bookScreen, { opacity: 1, duration: 1.2 });

                // Set particle mode to book (glowing falling stars)
                if (window.particles) {
                    window.particles.setMode('book');
                }

                // Emerge and Open the Book
                const book = document.getElementById('magical-book');
                book.style.display = 'flex';

                gsap.fromTo(book,
                    { scale: 0.6, rotateX: 30, opacity: 0 },
                    {
                        scale: window.innerWidth <= 768 ? 1 : 0.9,
                        rotateX: window.innerWidth <= 768 ? 0 : 12,
                        opacity: 1,
                        duration: 2.0,
                        ease: "back.out(1.2)",
                        onComplete: () => {
                            // Loop slow piano chords
                            if (window.audioEngine) {
                                window.audioEngine.startPianoTheme();
                            }

                            // Play page flip sound
                            if (window.audioEngine) {
                                window.audioEngine.playPageFlipSFX();
                            }

                            // Run the typewriter ending lines
                            this.runEndingSequence();
                        }
                    }
                );
            }
        });
    }

    /* ====================================================
       SCENE 7: ENDING SEQUENCE TYPEWRITER
       ==================================================== */
    runEndingSequence() {
        const line1 = document.getElementById('final-line-1');
        const line2 = document.getElementById('final-line-2');
        const line3 = document.getElementById('final-line-3');

        const txt1 = `Happy Birthday, ${CONFIG.herName}!!`;
        const txt2 = "Stay Happy Forever...";
        const txt3 = "";

        const typeText = (element, text, speed, callback) => {
            let idx = 0;
            const timer = setInterval(() => {
                element.innerHTML += text.charAt(idx);
                idx++;
                if (idx >= text.length) {
                    clearInterval(timer);
                    if (callback) callback();
                }
            }, speed);
        };

        // Sequential delay schedule
        setTimeout(() => {
            typeText(line1, txt1, 60, () => {
                setTimeout(() => {
                    typeText(line2, txt2, 70, () => {
                        setTimeout(() => {
                            typeText(line3, txt3, 60, () => {
                                // Fade in glowing Heart button
                                gsap.to('#heart-container', {
                                    opacity: 1,
                                    y: -10,
                                    duration: 1.2,
                                    ease: "power2.out",
                                    onComplete: () => {
                                        this.setupHeartClick();
                                    }
                                });
                            });
                        }, 1200);
                    });
                }, 1400);
            });
        }, 2200); // Allow personal message to be read first
    }

    setupHeartClick() {
        const heart = document.querySelector('.glowing-heart');
        if (!heart) return;

        heart.addEventListener('click', () => {
            if (window.particles) {
                window.particles.triggerConfetti(80);
            }
            if (window.audioEngine) {
                window.audioEngine.playPopSFX();
                // Play a bright high chime
                window.audioEngine.playChime('C5', 0, 0.4);
                window.audioEngine.playChime('E5', 0.1, 0.4);
                window.audioEngine.playChime('G5', 0.2, 0.6);
                window.audioEngine.playChime('C5', 0.35, 1.2);
            }

            // Pulse jump heart
            gsap.fromTo(heart,
                { scale: 1 },
                { scale: 1.5, duration: 0.15, yoyo: true, repeat: 1 }
            );
        });
    }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
    window.flowManager = new FlowManager();
});
