/* ====================================================
   SCENE 6: MEMORY ARCHIVE & LETTERS
   ==================================================== */

class ArchiveManager {
    constructor() {
        this.currentIdx = 0;
        this.romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

        // Track whether each letter's seal has been broken
        this.sealsBroken = Array(10).fill(false);
        this.letter10State = 0; // 0: folded, 1: page1, 2: page2, 3: typewriter, 4: final image revealed

        // 10 Memory Preserved Database
        this.memories = [
            {
                image: 'assets/images/achu.png',
                title: 'The Spark of Beginning',
                quote: 'Every story starts somewhere. Before the memories, Before the laughter - There was this little face quietly beginning the journey.'
            },
            {
                image: 'assets/images/crazy.png',
                title: 'Certified Troublemaker',
                quote: 'Some poses are planned, Some poses are legendary. This one clearly belongs in the second category.'
            },
            {
                image: 'assets/images/style.png',
                title: 'Mission: Look Cool',
                quote: 'A simple photo, A simple smile, Yet somehow, it became one of those pictures that never gets old.'
            },
            {
                image: 'assets/images/ground.png',
                title: 'The Bigger Display',
                quote: 'Why watch the match on a small screen, when a bigger display was already available right on the forehead?'
            },
            {
                image: 'assets/images/pose.png',
                title: 'The Signature Pose',
                quote: 'No matter the occasion, there is always one pose that never misses. The famous thumbs-up strikes again.'
            },
            {
                image: 'assets/images/campaign.png',
                title: 'Thalapathy Fan Forever',
                quote: 'Some people support a hero. Some people celebrate a hero. And then there are fans who proudly stand under the flag.'
            },
            {
                image: 'assets/images/celebrity.png',
                title: 'Unscripted',
                quote: 'No pose. No preparation. Just a genuine moment captured exactly as it was.'
            },
            {
                image: 'assets/images/tradition.png',
                title: 'Unexpected Update',
                quote: 'Software update complete.<br>Version:Traditional Aksh 2.0'
            },
            {
                image: 'assets/images/sleep.png',
                title: 'Mission Offline',
                quote: 'Battery low..<br>System shutting down..'
            },
            {
                // Letter 10 is special and handles image reveal dynamically
                image: 'assets/images/akshhh.png',
                title: 'The Smile That Stayed',
                quote: 'May this smile stay bright, Today, Tomorrow, and in every chapter yet to come. Happy 21 !!'
            }
        ];

        this.setupListeners();
    }

    setupListeners() {
        const sealContainer = document.getElementById('letter-seal-container');
        if (sealContainer) {
            sealContainer.addEventListener('click', () => {
                this.breakSeal();
            });
        }

        const prevBtn = document.getElementById('prev-mem-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.navigateLetter(-1);
            });
        }

        const nextBtn = document.getElementById('next-mem-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.navigateLetter(1);
            });
        }
    }

    loadCurrentMemory() {
        const progressTag = document.getElementById('memory-progress');
        const letter = document.getElementById('memory-letter');
        const sealContainer = document.getElementById('letter-seal-container');
        const contentLayout = document.getElementById('letter-content');

        const prevBtn = document.getElementById('prev-mem-btn');
        const nextBtn = document.getElementById('next-mem-btn');

        // Update Roman Numerals Progress
        progressTag.innerHTML = `Memory ${this.romanNumerals[this.currentIdx]} of X`;

        // Update Prev Button state
        prevBtn.disabled = this.currentIdx === 0;

        // Hide next button during loading/seal state
        nextBtn.style.display = 'none';

        // Check if seal is broken for this memory
        if (this.sealsBroken[this.currentIdx]) {
            // Immediately open
            sealContainer.style.display = 'none';
            contentLayout.style.display = 'flex';
            contentLayout.style.opacity = 1;

            this.fillMemoryDetails();
            nextBtn.style.display = 'flex';

            // Adjust Letter 10 special nav button if opened
            if (this.currentIdx === 9) {
                nextBtn.innerHTML = `Open Final Chapter <span class="gold-arrow">&#x276F;</span>`;
            } else {
                nextBtn.innerHTML = `Next <span class="gold-arrow">&#x276F;</span>`;
            }
        } else {
            // Folded state
            sealContainer.style.display = 'flex';
            sealContainer.style.opacity = 1;
            contentLayout.style.display = 'none';
            contentLayout.style.opacity = 0;

            // Reset cracking image rotation/transform
            const sealImg = document.getElementById('letter-seal');
            if (sealImg) {
                sealImg.style.transform = 'scale(1)';
                sealImg.style.filter = 'drop-shadow(0 0 15px rgba(0, 0, 0, 0.8))';
            }
        }
    }

    fillMemoryDetails() {
        const mem = this.memories[this.currentIdx];

        const imgTag = document.getElementById('memory-image');
        const titleTag = document.getElementById('memory-title');
        const quoteTag = document.getElementById('memory-quote');

        // Letter 10 special layout details
        if (this.currentIdx === 9) {
            // Under special letter 10 flow, content is loaded dynamically
            imgTag.src = "";
            imgTag.style.opacity = 0;
            titleTag.innerHTML = "Preserved in Time";
            quoteTag.innerHTML = "You have reached the final memory.";

            // Append a sub-button for letter 10 flow navigation
            this.handleLetter10SpecialFlow();
        } else {
            imgTag.src = mem.image;
            imgTag.style.opacity = 0.9;
            titleTag.innerHTML = mem.title;
            quoteTag.innerHTML = `"${mem.quote}"`;

            // Clean up any temporary letter 10 continue buttons
            const oldContBtn = document.getElementById('letter10-continue-btn');
            if (oldContBtn) oldContBtn.remove();
        }
    }

    /* ====================================================
       SEAL BREAKING MECHANICS
       ==================================================== */
    breakSeal() {
        const sealImg = document.getElementById('letter-seal');

        if (window.audioEngine) {
            window.audioEngine.playCrackSFX();
        }

        // Shake animation
        gsap.to(sealImg, {
            x: 5,
            repeat: 5,
            yoyo: true,
            duration: 0.05,
            onComplete: () => {
                // Fade out seal
                gsap.to('#letter-seal-container', {
                    opacity: 0,
                    duration: 0.4,
                    onComplete: () => {
                        document.getElementById('letter-seal-container').style.display = 'none';
                        this.sealsBroken[this.currentIdx] = true;

                        // Unfold parchment animation
                        const contentLayout = document.getElementById('letter-content');
                        contentLayout.style.display = 'flex';
                        contentLayout.style.opacity = 0;

                        this.fillMemoryDetails();

                        if (window.audioEngine) {
                            window.audioEngine.playPageFlipSFX();
                        }

                        // GSAP unfold zoom
                        gsap.fromTo('#memory-letter',
                            { scaleY: 0.8, rotateX: 25 },
                            { scaleY: 1, rotateX: 10, duration: 0.8, ease: "power2.out" }
                        );

                        gsap.to(contentLayout, {
                            opacity: 1,
                            duration: 0.6,
                            delay: 0.2,
                            onComplete: () => {
                                // Show next button if not Letter 10
                                if (this.currentIdx < 9) {
                                    const nextBtn = document.getElementById('next-mem-btn');
                                    nextBtn.innerHTML = `Next <span class="gold-arrow">&#x276F;</span>`;
                                    nextBtn.style.display = 'flex';
                                    gsap.fromTo(nextBtn, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 });
                                }
                            }
                        });
                    }
                });
            }
        });
    }

    /* ====================================================
       PAGE TRANSITION / FOLDING NAVIGATION
       ==================================================== */
    navigateLetter(direction) {
        if (this.currentIdx === 9 && direction === 1 && this.letter10State < 4) {
            // Intercept next click on Letter 10 if not fully revealed
            return;
        }

        if (this.currentIdx === 9 && direction === 1 && this.letter10State === 4) {
            // Letter 10 fully complete -> Proceed to Final Scene (Magical Book)
            if (window.flowManager) {
                window.flowManager.transitionToFinalBook();
            }
            return;
        }

        // Standard navigation with Page-Turn unfold
        if (window.audioEngine) {
            window.audioEngine.playPageFlipSFX();
        }

        // Fold up animation (scaleX to 0)
        gsap.to('#memory-letter', {
            scaleX: 0,
            rotateY: direction * 45,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
                this.currentIdx += direction;
                this.loadCurrentMemory();

                // Unfold animation (scaleX back to 1)
                gsap.to('#memory-letter', {
                    scaleX: 1,
                    rotateY: 0,
                    duration: 0.6,
                    ease: "power2.out"
                });
            }
        });
    }

    /* ====================================================
       LETTER 10 SPECIAL SEQUENCES
       ==================================================== */
    handleLetter10SpecialFlow() {
        this.letter10State = 1; // Stage 1: You have reached the final memory

        const quoteTag = document.getElementById('memory-quote');
        const textSide = document.querySelector('.letter-text-side');

        // Create custom Letter 10 internal navigation button
        const oldContBtn = document.getElementById('letter10-continue-btn');
        if (oldContBtn) oldContBtn.remove();

        const contBtn = document.createElement('button');
        contBtn.id = 'letter10-continue-btn';
        contBtn.className = 'fantasy-btn';
        contBtn.style.marginTop = '20px';
        contBtn.style.padding = '8px 20px';
        contBtn.style.fontSize = '0.85rem';
        contBtn.innerHTML = "Continue";

        textSide.appendChild(contBtn);

        contBtn.addEventListener('click', () => {
            this.advanceLetter10SpecialFlow();
        });
    }

    advanceLetter10SpecialFlow() {
        const quoteTag = document.getElementById('memory-quote');
        const titleTag = document.getElementById('memory-title');
        const contBtn = document.getElementById('letter10-continue-btn');

        if (window.audioEngine) {
            window.audioEngine.playPageFlipSFX();
        }

        if (this.letter10State === 1) {
            // Stage 2: But memories are not the real gift
            this.letter10State = 2;
            gsap.to([titleTag, quoteTag], {
                opacity: 0,
                duration: 0.4,
                onComplete: () => {
                    titleTag.innerHTML = "A Hidden Secret";
                    quoteTag.innerHTML = "But memories are not the real gift.";
                    gsap.to([titleTag, quoteTag], { opacity: 1, duration: 0.4 });
                }
            });
        }
        else if (this.letter10State === 2) {
            // Stage 3: Darken and Typewriter sequence
            this.letter10State = 3;
            contBtn.style.display = 'none';

            // Hide the letter text elements temporarily
            gsap.to('#memory-letter', {
                opacity: 0,
                scale: 0.9,
                duration: 0.8,
                onComplete: () => {
                    document.getElementById('memory-letter').style.visibility = 'hidden';
                }
            });

            // Darken screen and intensify aurora
            const darken = document.getElementById('darken-transition');
            darken.style.display = 'block';
            gsap.to(darken, { opacity: 0.88, duration: 2.0 });

            const aurora = document.querySelector('.aurora');
            if (aurora) {
                gsap.to(aurora, { filter: "brightness(1.8)", duration: 2.5 });
            }

            // Create temporary typewriter lines overlay
            const typewriterOverlay = document.createElement('div');
            typewriterOverlay.id = 'typewriter-overlay';
            typewriterOverlay.style.position = 'fixed';
            typewriterOverlay.style.inset = '0';
            typewriterOverlay.style.display = 'flex';
            typewriterOverlay.style.flexDirection = 'column';
            typewriterOverlay.style.justifyContent = 'center';
            typewriterOverlay.style.alignItems = 'center';
            typewriterOverlay.style.zIndex = '120';
            typewriterOverlay.style.padding = window.innerWidth <= 480 ? '40px 24px' : '40px 48px';
            typewriterOverlay.style.textAlign = 'center';
            typewriterOverlay.style.maxWidth = '100vw';

            const line1 = document.createElement('h2');
            line1.className = 'typewriter-line';
            line1.style.fontFamily = "'Cinzel', serif";
            line1.style.color = 'var(--parchment-beige)';
            line1.style.fontSize = 'clamp(1.1rem, 3.5vw, 1.9rem)';
            line1.style.textTransform = 'uppercase';
            line1.style.letterSpacing = '2.5px';
            line1.style.lineHeight = '1.6';
            line1.style.marginBottom = '28px';
            line1.style.fontWeight = '600';

            const line2 = document.createElement('h2');
            line2.className = 'typewriter-line';
            line2.style.fontFamily = "'Cormorant Garamond', serif";
            line2.style.color = 'var(--antique-gold)';
            line2.style.fontSize = 'clamp(1.4rem, 5.5vw, 2.6rem)';
            line2.style.marginBottom = '28px';
            line2.style.fontWeight = '600';
            line2.style.fontStyle = 'normal';
            line2.style.lineHeight = '1.5';
            line2.style.letterSpacing = '1px';
            line2.style.textTransform = 'none';

            const line3 = document.createElement('h2');
            line3.className = 'typewriter-line';
            line3.style.fontFamily = "'Cinzel', serif";
            line3.style.color = 'var(--parchment-beige)';
            line3.style.fontSize = 'clamp(1rem, 3vw, 1.6rem)';
            line3.style.textTransform = 'uppercase';
            line3.style.letterSpacing = '2px';
            line3.style.lineHeight = '1.6';
            line3.style.fontWeight = '600';

            typewriterOverlay.appendChild(line1);
            typewriterOverlay.appendChild(line2);
            typewriterOverlay.appendChild(line3);
            document.body.appendChild(typewriterOverlay);

            // Execute typewriter sequence
            const txt1 = "The real gift was never hidden inside these letters.";
            const txt2 = "It was every smile, every laugh and every memory.";
            const txt3 = "And today is a celebration of them all.";

            const typeText = (element, text, speed, callback) => {
                let charIdx = 0;
                const timer = setInterval(() => {
                    element.innerHTML += text.charAt(charIdx);
                    charIdx++;
                    if (charIdx >= text.length) {
                        clearInterval(timer);
                        if (callback) callback();
                    }
                }, speed);
            };

            // Schedule the lines sequentially
            setTimeout(() => {
                typeText(line1, txt1, 45, () => {
                    setTimeout(() => {
                        typeText(line2, txt2, 55, () => {
                            setTimeout(() => {
                                typeText(line3, txt3, 50, () => {
                                    // Sequence complete: Transition back to show letter 10 final image
                                    setTimeout(() => {
                                        this.revealLetter10FinalImage(typewriterOverlay, darken);
                                    }, 2800);
                                });
                            }, 1000);
                        });
                    }, 1200);
                });
            }, 800);
        }
    }

    revealLetter10FinalImage(typewriterOverlay, darken) {
        this.letter10State = 4; // Final revealed state

        // Remove typewriter overlay
        gsap.to(typewriterOverlay, {
            opacity: 0,
            duration: 1.0,
            onComplete: () => {
                typewriterOverlay.remove();
            }
        });

        // Fade out darken overlay back to normal library light
        gsap.to(darken, {
            opacity: 0,
            duration: 1.2,
            onComplete: () => {
                darken.style.display = 'none';
            }
        });

        const aurora = document.querySelector('.aurora');
        if (aurora) {
            gsap.to(aurora, { filter: "brightness(1.2)", duration: 1.5 });
        }

        // Setup the final letter elements
        const titleTag = document.getElementById('memory-title');
        const quoteTag = document.getElementById('memory-quote');
        const imgTag = document.getElementById('memory-image');
        const contBtn = document.getElementById('letter10-continue-btn');

        titleTag.innerHTML = "The Smile That Stayed";
        quoteTag.innerHTML = `"${this.memories[9].quote}"`;
        imgTag.src = this.memories[9].image;

        if (contBtn) contBtn.remove(); // Clean up intermediate button

        // Make letter visible and scale it back in with a gold shine
        const letter = document.getElementById('memory-letter');
        letter.style.visibility = 'visible';

        gsap.fromTo(letter,
            { opacity: 0, scale: 0.6 },
            {
                opacity: 1,
                scale: 1,
                duration: 1.5,
                ease: "back.out(1.2)",
                onComplete: () => {
                    // Explode sparks
                    if (window.particles) {
                        window.particles.triggerConfetti(50);
                    }
                    if (window.audioEngine) {
                        window.audioEngine.playPopSFX();
                    }

                    // Animate the image fade in
                    gsap.to(imgTag, { opacity: 0.9, duration: 1.0 });

                    // Reveal Next button styled for Final Book
                    const nextBtn = document.getElementById('next-mem-btn');
                    nextBtn.innerHTML = `Open Final Chapter <span class="gold-arrow">&#x276F;</span>`;
                    nextBtn.style.display = 'flex';
                    gsap.fromTo(nextBtn, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6 });
                }
            }
        );
    }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
    window.archiveManager = new ArchiveManager();
});
