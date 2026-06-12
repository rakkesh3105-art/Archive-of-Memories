/* ====================================================
   SCENE 2 & 3 & 4: CAKE, CANDLES, MIC, AND SEAL REVEAL
   ==================================================== */

class CakeManager {
    constructor() {
        this.micStream = null;
        this.audioContext = null;
        this.analyser = null;
        this.microphoneActive = false;
        this.candlesLit = true;
        this.sequenceTriggered = false;
        
        this.setupButtons();
        this.initMicrophone();
    }

    setupButtons() {
        const blowBtn = document.getElementById('blow-btn');
        if (blowBtn) {
            blowBtn.addEventListener('click', () => {
                this.triggerCountdown();
            });
        }

        // Seal Touch Event
        const royalSeal = document.getElementById('royal-seal');
        if (royalSeal) {
            royalSeal.addEventListener('click', () => {
                this.triggerSealRevealTransition();
            });
        }
    }

    /* ====================================================
       MICROPHONE BLOW DETECTION
       ==================================================== */
    async initMicrophone() {
        const micIndicator = document.getElementById('mic-indicator');
        
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                
                // Set up Web Audio for analysis
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioContextClass();
                const source = this.audioContext.createMediaStreamSource(this.micStream);
                
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 256;
                source.connect(this.analyser);
                
                this.microphoneActive = true;
                
                if (micIndicator) {
                    micIndicator.style.display = 'flex';
                }
                
                this.listenForBlow();
            }
        } catch (e) {
            console.warn("Microphone access denied or unsupported, using button fallback.", e);
            if (micIndicator) {
                micIndicator.style.display = 'none';
            }
        }
    }

    listenForBlow() {
        if (!this.microphoneActive || this.sequenceTriggered) return;
        
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        let consecutiveBlowTicks = 0;
        
        const checkVolume = () => {
            if (this.sequenceTriggered) return;
            
            this.analyser.getByteFrequencyData(dataArray);
            
            // Calculate average volume in the high-frequency/middle range (blowing sound signature)
            let sum = 0;
            for (let i = 8; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / (bufferLength - 8);
            
            // Blow threshold: values usually range from 0 to 255. A strong blow is typically > 100
            if (average > 110) {
                consecutiveBlowTicks++;
                if (consecutiveBlowTicks > 6) { // Must blow consistently for ~100ms
                    this.triggerCountdown();
                    return;
                }
            } else {
                consecutiveBlowTicks = Math.max(0, consecutiveBlowTicks - 1);
            }
            
            requestAnimationFrame(checkVolume);
        };
        
        checkVolume();
    }

    stopMicrophone() {
        this.microphoneActive = false;
        if (this.micStream) {
            this.micStream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }

    /* ====================================================
       CINEMATIC COUNTDOWN & EXTINCTION
       ==================================================== */
    triggerCountdown() {
        if (this.sequenceTriggered) return;
        this.sequenceTriggered = true;
        
        this.stopMicrophone();
        
        // Hide interaction controls
        gsap.to('#interaction-controls', {
            opacity: 0,
            y: 20,
            duration: 0.5,
            onComplete: () => {
                document.getElementById('interaction-controls').style.display = 'none';
            }
        });

        // Initialize audio engine (resumes ctx on user interaction)
        if (window.audioEngine) {
            window.audioEngine.init();
            if (window.audioEngine.ctx && window.audioEngine.ctx.state === 'suspended') {
                window.audioEngine.ctx.resume();
            }
        }

        const countdownOverlay = document.getElementById('countdown-overlay');
        const countdownNumber = document.getElementById('countdown-number');
        
        countdownOverlay.style.display = 'flex';
        
        let count = 3;
        
        const countStep = () => {
            countdownNumber.innerHTML = count > 0 ? count : "";
            
            // Play a soft ticking chime for the countdown
            if (count > 0 && window.audioEngine) {
                window.audioEngine.playChime('C5', 0, 0.2);
            }
            
            gsap.fromTo(countdownNumber, 
                { scale: 0.3, opacity: 0 },
                { 
                    scale: 1.2, 
                    opacity: 1, 
                    duration: 0.8, 
                    ease: "power2.out",
                    onComplete: () => {
                        gsap.to(countdownNumber, { 
                            scale: 1.5, 
                            opacity: 0, 
                            duration: 0.2, 
                            ease: "power2.in" 
                        });
                    }
                }
            );
            
            count--;
            
            if (count >= 0) {
                setTimeout(countStep, 1000);
            } else {
                setTimeout(() => {
                    this.extinguishCandles();
                }, 1000);
            }
        };
        
        countStep();
    }

    extinguishCandles() {
        // Extinguish visual flames
        const flames = document.querySelectorAll('.flame-wrapper');
        flames.forEach(f => f.classList.add('extinguished'));
        this.candlesLit = false;
        
        // Play Blow SFX
        if (window.audioEngine) {
            window.audioEngine.playBlowSFX();
        }
        
        // Brief dark transition (1 second)
        const darken = document.getElementById('darken-transition');
        darken.style.display = 'block';
        
        gsap.to(darken, {
            opacity: 1,
            duration: 0.4,
            onComplete: () => {
                // Hide countdown overlay
                document.getElementById('countdown-overlay').style.display = 'none';
                
                // Prepare Scene 3
                this.triggerMagicMoment();
                
                setTimeout(() => {
                    gsap.to(darken, {
                        opacity: 0,
                        duration: 0.6,
                        onComplete: () => {
                            darken.style.display = 'none';
                        }
                    });
                }, 400);
            }
        });
    }

    /* ====================================================
       SCENE 3: MAGIC MOMENT
       ==================================================== */
    triggerMagicMoment() {
        // Change instruction subtitle
        const subtitle = document.getElementById('ceremony-instruction');
        subtitle.style.opacity = 0;
        subtitle.innerHTML = "A wish has been made...";
        
        gsap.to(subtitle, { opacity: 1, duration: 1, delay: 0.5 });
        
        // Trigger particles
        if (window.particles) {
            window.particles.triggerConfetti(140);
        }
        
        // Play birthday song
        if (window.audioEngine) {
            window.audioEngine.playPopSFX();
            setTimeout(() => {
                window.audioEngine.startHappyBirthday();
            }, 800);
        }
        
        // Brighten Aurora borealis background
        const aurora = document.querySelector('.aurora');
        if (aurora) {
            gsap.to(aurora, { filter: "brightness(1.4)", duration: 2 });
        }
        
        // Sparkles and Cake glows intensely
        if (window.particles) {
            window.particles.startCakeSparks();
        }
        
        gsap.to('.cake-img', {
            filter: 'drop-shadow(0 0 35px rgba(212, 175, 55, 0.85)) brightness(1.2)',
            duration: 2,
            repeat: -1,
            yoyo: true
        });

        // Delay then transition to "Gift is waiting" and crack cake
        setTimeout(() => {
            gsap.to(subtitle, {
                opacity: 0,
                duration: 0.8,
                onComplete: () => {
                    subtitle.innerHTML = "But your gift is still waiting.";
                    gsap.to(subtitle, { opacity: 1, duration: 1 });
                    
                    // Show cue to touch the cake/seal
                    setTimeout(() => {
                        this.crackCakeOpen();
                    }, 1500);
                }
            });
        }, 4500);
    }

    /* ====================================================
       SCENE 4: ROYAL SEAL REVEAL
       ==================================================== */
    crackCakeOpen() {
        // Play crack sound
        if (window.audioEngine) {
            window.audioEngine.playCrackSFX();
        }
        
        // Split the cake halves apart
        gsap.to('.cake-half.left', {
            x: -80,
            rotate: -10,
            opacity: 0.5,
            duration: 1.8,
            ease: "power2.out"
        });
        
        gsap.to('.cake-half.right', {
            x: 80,
            rotate: 10,
            opacity: 0.5,
            duration: 1.8,
            ease: "power2.out"
        });
        
        // Fade out candles container
        gsap.to('#candles-container', {
            opacity: 0,
            duration: 0.5
        });

        // Emerge floating wax seal
        const sealContainer = document.getElementById('floating-seal-container');
        sealContainer.style.display = 'flex';
        sealContainer.style.opacity = 0;
        
        gsap.fromTo(sealContainer, 
            { scale: 0.4, y: 50 },
            { 
                scale: 1, 
                y: 0,
                opacity: 1, 
                duration: 2.0, 
                ease: "back.out(1.5)",
                onComplete: () => {
                    // Floating idle animation
                    gsap.to('.floating-seal', {
                        y: -12,
                        duration: 1.8,
                        repeat: -1,
                        yoyo: true,
                        ease: "power1.inOut"
                    });
                }
            }
        );

        // Update instruction
        const subtitle = document.getElementById('ceremony-instruction');
        gsap.to(subtitle, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                subtitle.innerHTML = "";
            }
        });
    }

    triggerSealRevealTransition() {
        // Play crack sound and explode sparks
        if (window.audioEngine) {
            window.audioEngine.playCrackSFX();
            window.audioEngine.playPopSFX();
        }
        
        if (window.particles) {
            window.particles.triggerConfetti(60); // burst of sparks
        }

        // Pulse scale seal
        gsap.to('#floating-seal-container', {
            scale: 1.4,
            opacity: 0,
            duration: 0.8,
            ease: "power2.in",
            onComplete: () => {
                // Stop cake spark particle stream
                if (window.particles) {
                    window.particles.stopCakeSparks();
                }
                
                // Tell main flow manager to transition to Scene 5
                if (window.flowManager) {
                    window.flowManager.transitionToArchiveEntrance();
                }
            }
        });
    }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
    window.cakeManager = new CakeManager();
});
