class AudioSynthesizer {
    constructor() {
        this.ctx = null;
        this.mainGain = null;
        this.delayNode = null;

        this.isMuted = true;
        this.musicBoxInterval = null;
        this.pianoInterval = null;

        this.frequencies = {
            'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
            'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00
        };

        this.setupAudioToggle();
    }

    init() {
        if (this.ctx) return;

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContextClass();

        // Main Volume Control
        this.mainGain = this.ctx.createGain();
        this.mainGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
        this.mainGain.connect(this.ctx.destination);

        // Master Delay for magical echo (Music Box chime effect)
        this.delayNode = this.ctx.createDelay();
        this.delayNode.delayTime.setValueAtTime(0.35, this.ctx.currentTime);

        this.delayFeedback = this.ctx.createGain();
        this.delayFeedback.gain.setValueAtTime(0.4, this.ctx.currentTime);

        this.delayNode.connect(this.delayFeedback);
        this.delayFeedback.connect(this.delayNode); // feedback loop
        this.delayNode.connect(this.mainGain);
    }

    setupAudioToggle() {
        const toggleBtn = document.getElementById('audio-toggle');
        if (!toggleBtn) return;

        toggleBtn.addEventListener('click', () => {
            this.init();

            // Resume context if suspended (browser security)
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }

            this.isMuted = !this.isMuted;

            if (this.isMuted) {
                toggleBtn.classList.add('muted');
                this.mainGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
                // Update SVG path to muted state
                document.getElementById('speaker-path').setAttribute('d', 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM19 12c0 2.94-1.66 5.5-4 6.79v2.06c3.46-1.42 6-4.8 6-8.85s-2.54-7.43-6-8.85v2.06c2.34 1.29 4 3.85 4 6.79zM3 9v6h4l5 5V4L7 9H3zm7 3v3.17L7.83 13H5v-2h2.83L10 8.83V12z');
            } else {
                toggleBtn.classList.remove('muted');
                this.mainGain.gain.linearRampToValueAtTime(0.8, this.ctx.currentTime + 0.3);
                // Update SVG path to unmuted state
                document.getElementById('speaker-path').setAttribute('d', 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z');
            }
        });
    }

    playChime(noteName, timeOffset = 0, duration = 0.5) {
        if (!this.ctx || !this.frequencies[noteName]) return;

        const time = this.ctx.currentTime + timeOffset;

        // Primary oscillator (pure chime sound)
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(this.frequencies[noteName], time);

        // Secondary tone for harmonic brightness
        const oscBright = this.ctx.createOscillator();
        oscBright.type = 'triangle';
        oscBright.frequency.setValueAtTime(this.frequencies[noteName] * 2, time);

        // Envelope
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.2, time + 0.008); // Instant plucking strike
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration); // Long ring decay

        osc.connect(gainNode);
        oscBright.connect(gainNode);

        // Send a portion to the delay line and a portion directly
        gainNode.connect(this.mainGain);
        gainNode.connect(this.delayNode);

        osc.start(time);
        oscBright.start(time);
        osc.stop(time + duration + 0.1);
        oscBright.stop(time + duration + 0.1);
    }

    // Play a single soft Piano note
    playPianoNote(noteName, timeOffset = 0, duration = 1.8) {
        if (!this.ctx || !this.frequencies[noteName]) return;

        const time = this.ctx.currentTime + timeOffset;

        // Primary tone: warm triangle wave
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(this.frequencies[noteName], time);

        // Sub-octave resonance
        const subOsc = this.ctx.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(this.frequencies[noteName] / 2, time);

        // Low-pass filter to make it soft and rich
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, time);
        filter.frequency.exponentialRampToValueAtTime(150, time + duration);

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.35, time + 0.05); // Smooth finger press strike
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration); // Slow decay

        osc.connect(filter);
        subOsc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.mainGain);

        osc.start(time);
        subOsc.start(time);
        osc.stop(time + duration + 0.1);
        subOsc.stop(time + duration + 0.1);
    }

    startHappyBirthday() {
        this.init();
        this.stopAllMusic();

        const melody = [
            { note: 'C4', dur: 0.5 }, { note: 'C4', dur: 0.5 }, { note: 'D4', dur: 1 }, { note: 'C4', dur: 1 }, { note: 'F4', dur: 1 }, { note: 'E4', dur: 2 },
            { note: 'C4', dur: 0.5 }, { note: 'C4', dur: 0.5 }, { note: 'D4', dur: 1 }, { note: 'C4', dur: 1 }, { note: 'G4', dur: 1 }, { note: 'F4', dur: 2 },
            { note: 'C4', dur: 0.5 }, { note: 'C4', dur: 0.5 }, { note: 'C5', dur: 1 }, { note: 'A4', dur: 1 }, { note: 'F4', dur: 1 }, { note: 'E4', dur: 1 }, { note: 'D4', dur: 2 },
            { note: 'Bb4', dur: 0.5 }, { note: 'Bb4', dur: 0.5 }, { note: 'A4', dur: 1 }, { note: 'F4', dur: 1 }, { note: 'G4', dur: 1 }, { note: 'F4', dur: 3 }
        ];

        const bassRoots = [
            'C3', 'C3', 'C3', 'F3',
            'C3', 'C3', 'C3', 'F3',
            'C3', 'F3', 'F3', 'Bb3',
            'C3', 'F3', 'C3', 'F3'
        ];

        let noteIndex = 0;
        let bassIndex = 0;
        let nextNoteTime = 0.1;

        const scheduleNextMelodyNote = () => {
            if (this.isMuted) return; // Silent execution tracking

            const currentNote = melody[noteIndex];

            // Play melody note (music box chime)
            this.playChime(currentNote.note, nextNoteTime, currentNote.dur * 1.5);

            // Play a bass accompaniment chime occasionally (on start of major bars)
            if (noteIndex % 6 === 0) {
                const bassNote = bassRoots[bassIndex % bassRoots.length];
                this.playChime(bassNote, nextNoteTime, 2.5);
                bassIndex++;
            }

            nextNoteTime += currentNote.dur * 0.45; // Tempo control
            noteIndex = (noteIndex + 1) % melody.length;
        };

        // Pre-fill a few notes
        for (let i = 0; i < 4; i++) {
            scheduleNextMelodyNote();
        }

        this.musicBoxInterval = setInterval(() => {
            if (this.ctx && this.ctx.currentTime + 1.0 > this.ctx.currentTime + nextNoteTime) {
                scheduleNextMelodyNote();
            }
        }, 300);
    }

    startPianoTheme() {
        this.init();
        this.stopAllMusic();

        // Emotive ambient chord loops
        // Fmaj7 -> C -> G -> Am
        const chords = [
            ['F3', 'C4', 'E4', 'A4'], // Fmaj7
            ['C3', 'G3', 'D4', 'E4'], // Cadd9
            ['G2', 'D3', 'B3', 'G4'], // G6
            ['A2', 'E3', 'C4', 'B4']  // Am9
        ];

        let chordIndex = 0;
        let timeIncrement = 0;

        const scheduleNextPianoChord = () => {
            const currentChord = chords[chordIndex];

            // Arpeggiate the chord notes for ambient flow
            currentChord.forEach((note, idx) => {
                const stagger = idx * 0.25; // Roll chord notes
                this.playPianoNote(note, stagger, 3.5);
            });

            chordIndex = (chordIndex + 1) % chords.length;
        };

        // Immediate play
        scheduleNextPianoChord();

        // Loop every 4.5 seconds
        this.pianoInterval = setInterval(() => {
            scheduleNextPianoChord();
        }, 4500);
    }

    stopAllMusic() {
        if (this.musicBoxInterval) {
            clearInterval(this.musicBoxInterval);
            this.musicBoxInterval = null;
        }
        if (this.pianoInterval) {
            clearInterval(this.pianoInterval);
            this.pianoInterval = null;
        }
    }

    /* ====================================================
       SOUND EFFECTS (SFX)
       ==================================================== */

    // 1. Candle Blowing SFX (Synthesized White Noise)
    playBlowSFX() {
        if (!this.ctx || this.isMuted) return;

        const bufferSize = this.ctx.sampleRate * 1.2; // 1.2 seconds of blowing
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate white noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = this.ctx.createBufferSource(buffer);
        noiseNode.buffer = buffer;

        // Low-pass Filter to sound like breath
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 1.2);

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.8, this.ctx.currentTime + 0.15); // blow starts
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2); // blow fades

        noiseNode.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.mainGain);

        noiseNode.start();
    }

    // 2. Confetti Pop SFX
    playPopSFX() {
        if (!this.ctx || this.isMuted) return;

        const time = this.ctx.currentTime;

        // Synthesize a low frequency pop thump
        const popOsc = this.ctx.createOscillator();
        popOsc.type = 'sine';
        popOsc.frequency.setValueAtTime(160, time);
        popOsc.frequency.exponentialRampToValueAtTime(40, time + 0.15);

        const popGain = this.ctx.createGain();
        popGain.gain.setValueAtTime(0.8, time);
        popGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

        // Synthesize a high frequency sparkle burst
        const sizzleOsc = this.ctx.createOscillator();
        sizzleOsc.type = 'triangle';
        sizzleOsc.frequency.setValueAtTime(800, time);
        sizzleOsc.frequency.exponentialRampToValueAtTime(3000, time + 0.25);

        const sizzleGain = this.ctx.createGain();
        sizzleGain.gain.setValueAtTime(0, time);
        sizzleGain.gain.linearRampToValueAtTime(0.25, time + 0.02);
        sizzleGain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

        popOsc.connect(popGain);
        popGain.connect(this.mainGain);

        sizzleOsc.connect(sizzleGain);
        sizzleGain.connect(this.mainGain);

        popOsc.start();
        popOsc.stop(time + 0.2);
        sizzleOsc.start();
        sizzleOsc.stop(time + 0.35);
    }

    // 3. Wax Seal Crack SFX
    playCrackSFX() {
        if (!this.ctx || this.isMuted) return;

        const time = this.ctx.currentTime;

        // High pitched crystal sound
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400, time);
        osc.frequency.setValueAtTime(2200, time + 0.04);
        osc.frequency.setValueAtTime(1800, time + 0.08);

        // Distortion effect using gain
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.4, time + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

        osc.connect(gainNode);
        gainNode.connect(this.mainGain);

        osc.start();
        osc.stop(time + 0.3);
    }

    // 4. Page Flip / Letter unfold SFX (Brown noise sweep)
    playPageFlipSFX() {
        if (!this.ctx || this.isMuted) return;

        const bufferSize = this.ctx.sampleRate * 0.6; // 0.6 seconds page flip
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate brown/pink noise
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            // Brown filter
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5; // Compensate loss of amplitude
        }

        const noiseNode = this.ctx.createBufferSource(buffer);
        noiseNode.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(100, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.3);
        filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.6);

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

        noiseNode.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.mainGain);

        noiseNode.start();
    }
}

// Global initialization helper
window.addEventListener('DOMContentLoaded', () => {
    window.audioEngine = new AudioSynthesizer();
});
