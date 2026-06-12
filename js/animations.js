class ParticleEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.activeMode = 'ambient'; 
        this.cakeSparksActive = false;
        this.cakePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.loop();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        const cakeWrapper = document.getElementById('cake-wrapper');
        if (cakeWrapper) {
            const rect = cakeWrapper.getBoundingClientRect();
            this.cakePos.x = rect.left + rect.width / 2;
            this.cakePos.y = rect.top + rect.height / 2;
        }
    }

    setMode(mode) {
        this.activeMode = mode;
        if (mode === 'ambient') {
            this.particles = this.particles.filter(p => p.type === 'dust');
            for (let i = 0; i < 40; i++) {
                this.particles.push(this.createDustParticle(true));
            }
        }
    }

    createDustParticle(randomY = false) {
        return {
            type: 'dust',
            x: Math.random() * this.canvas.width,
            y: randomY ? Math.random() * this.canvas.height : this.canvas.height + 10,
            size: Math.random() * 2 + 0.8,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -(Math.random() * 0.5 + 0.2),
            color: `rgba(212, 175, 55, ${Math.random() * 0.4 + 0.15})`,
            life: Math.random() * 200 + 100,
            maxLife: 300
        };
    }

    createCakeSparkParticle() {
        return {
            type: 'spark',
            x: this.cakePos.x + (Math.random() - 0.5) * 60,
            y: this.cakePos.y + (Math.random() - 0.5) * 30,
            size: Math.random() * 3 + 1,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -(Math.random() * 2 + 1),
            color: `rgba(212, 175, 55, ${Math.random() * 0.7 + 0.3})`,
            alpha: 1,
            decay: Math.random() * 0.02 + 0.01
        };
    }

    createConfettiParticle() {
        const colors = [
            '#FFD4AF37', // Gold
            '#FF00D084', // Emerald
            '#FF5A189A', // Purple
            '#FFFA26A3', // Pink
            '#FF00D2FC', // Light blue
            '#FFFFFFFF'  // White
        ];
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 12 + 6;
        
        return {
            type: 'confetti',
            x: this.cakePos.x,
            y: this.cakePos.y - 30,
            size: Math.random() * 6 + 4,
            width: Math.random() * 8 + 6,
            height: Math.random() * 12 + 8,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity - 4, // Bias upward
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            opacity: 1,
            gravity: 0.28,
            friction: 0.96
        };
    }

    createBookStarParticle() {
        return {
            type: 'star',
            x: Math.random() * this.canvas.width,
            y: -20,
            size: Math.random() * 1.5 + 0.5,
            length: Math.random() * 80 + 40,
            vx: Math.random() * 2 + 1,
            vy: Math.random() * 4 + 4,
            alpha: Math.random() * 0.5 + 0.3,
            color: '#FFFFFF'
        };
    }

    triggerConfetti(count = 120) {
        // Find fresh cake position
        const cakeWrapper = document.getElementById('cake-wrapper');
        if (cakeWrapper) {
            const rect = cakeWrapper.getBoundingClientRect();
            this.cakePos.x = rect.left + rect.width / 2;
            this.cakePos.y = rect.top + rect.height / 2;
        }

        // Add confetti burst
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createConfettiParticle());
        }
        
        // Add sparkles around the screen
        for (let i = 0; i < 40; i++) {
            this.particles.push({
                type: 'sparkle',
                x: this.cakePos.x + (Math.random() - 0.5) * 200,
                y: this.cakePos.y + (Math.random() - 0.5) * 200,
                size: Math.random() * 5 + 2,
                alpha: 1,
                decay: Math.random() * 0.03 + 0.015,
                color: '#FFD4AF37',
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4
            });
        }
    }

    startCakeSparks() {
        this.cakeSparksActive = true;
    }

    stopCakeSparks() {
        this.cakeSparksActive = false;
    }

    loop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Spawning logic based on mode
        if (this.activeMode === 'ambient') {
            if (this.particles.filter(p => p.type === 'dust').length < 60 && Math.random() < 0.15) {
                this.particles.push(this.createDustParticle(false));
            }
        } else if (this.activeMode === 'book') {
            // Ambient dust + falling stars
            if (this.particles.filter(p => p.type === 'dust').length < 40 && Math.random() < 0.1) {
                this.particles.push(this.createDustParticle(false));
            }
            if (Math.random() < 0.04) {
                this.particles.push(this.createBookStarParticle());
            }
        }
        
        // Continuous cake sparks
        if (this.cakeSparksActive && Math.random() < 0.4) {
            this.particles.push(this.createCakeSparkParticle());
        }

        // Update and Draw
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            if (p.type === 'dust') {
                p.x += p.vx;
                p.y += p.vy;
                p.life--;
                
                // Draw
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.shadowBlur = 4;
                this.ctx.shadowColor = 'rgba(212, 175, 55, 0.5)';
                this.ctx.fill();
                
                if (p.life <= 0 || p.x < 0 || p.x > this.canvas.width || p.y < 0) {
                    this.particles.splice(i, 1);
                }
            } 
            else if (p.type === 'spark') {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= p.decay;
                
                // Draw
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
                this.ctx.fill();
                
                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                }
            }
            else if (p.type === 'confetti') {
                p.vx *= p.friction;
                p.vy *= p.friction;
                p.vy += p.gravity;
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;
                p.opacity -= 0.008;

                // Draw
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rotation * Math.PI / 180);
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = Math.max(0, p.opacity);
                this.ctx.shadowBlur = 0;
                
                // Rotating rectangular confetti ribbon
                this.ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height);
                this.ctx.restore();

                if (p.y > this.canvas.height + 20 || p.opacity <= 0) {
                    this.particles.splice(i, 1);
                }
            }
            else if (p.type === 'sparkle') {
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.95;
                p.vy *= 0.95;
                p.alpha -= p.decay;

                // Draw star-like shape (four pointed sparkle)
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.globalAlpha = Math.max(0, p.alpha);
                this.ctx.fillStyle = p.color;
                this.ctx.shadowBlur = 6;
                this.ctx.shadowColor = '#FFD4AF37';

                this.ctx.beginPath();
                this.ctx.moveTo(0, -p.size);
                this.ctx.lineTo(p.size * 0.2, -p.size * 0.2);
                this.ctx.lineTo(p.size, 0);
                this.ctx.lineTo(p.size * 0.2, p.size * 0.2);
                this.ctx.lineTo(0, p.size);
                this.ctx.lineTo(-p.size * 0.2, p.size * 0.2);
                this.ctx.lineTo(-p.size, 0);
                this.ctx.lineTo(-p.size * 0.2, -p.size * 0.2);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.restore();

                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                }
            }
            else if (p.type === 'star') {
                // Diagonal streak downwards right
                p.x += p.vx;
                p.y += p.vy;

                // Draw streak line
                this.ctx.save();
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha})`;
                this.ctx.lineWidth = p.size;
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                // Angle projection
                this.ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
                this.ctx.stroke();
                this.ctx.restore();

                if (p.y > this.canvas.height + 20 || p.x > this.canvas.width + 20) {
                    this.particles.splice(i, 1);
                }
            }
        }

        // Reset canvas context values just in case
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;

        requestAnimationFrame(() => this.loop());
    }
}

// Global initialization helper
window.addEventListener('DOMContentLoaded', () => {
    window.particles = new ParticleEngine('particle-canvas');
    window.particles.setMode('ambient');
});
