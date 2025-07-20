/**
 * SoundMaze Audio System
 * Handles spatial audio, sound effects, and accessibility features
 */

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.volume = 0.8;
        this.audioEnabled = true;
        this.sounds = {};
        this.spatialAudio = true;
        this.hapticEnabled = false;
        this.speechEnabled = true;
        this.speechRate = 1.0;
        this.speechVolume = 0.8;
        
        // Audio settings
        this.settings = {
            volume: 0.8,
            speed: 1.0,
            spatialAudio: true,
            hapticFeedback: false,
            screenReaderMode: false,
            speechGuidance: true,
            speechRate: 1.0,
            speechVolume: 0.8
        };
        
        this.init();
    }

    async init() {
        try {
            // Initialize Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;

            // Create spatial audio panner
            this.panner = this.audioContext.createPanner();
            this.panner.panningModel = 'HRTF';
            this.panner.distanceModel = 'inverse';
            this.panner.refDistance = 1;
            this.panner.maxDistance = 10000;
            this.panner.rolloffFactor = 1;
            this.panner.coneInnerAngle = 360;
            this.panner.coneOuterAngle = 0;
            this.panner.coneOuterGain = 0;
            this.panner.connect(this.masterGain);

            // Initialize speech synthesis
            this.initSpeechSynthesis();

            // Initialize sounds
            await this.createSounds();
            
            console.log('Audio system initialized successfully');
        } catch (error) {
            console.error('Failed to initialize audio system:', error);
            this.audioEnabled = false;
        }
    }

    async createSounds() {
        // Create audio buffers for different sounds
        const soundData = {
            wall: this.createWallSound(),
            exit: this.createExitSound(),
            movement: this.createMovementSound(),
            success: this.createSuccessSound(),
            error: this.createErrorSound(),
            menu: this.createMenuSound(),
            beacon: this.createBeaconSound()
        };

        for (const [name, data] of Object.entries(soundData)) {
            this.sounds[name] = await this.createAudioBuffer(data);
        }
    }

    // Initialize speech synthesis
    initSpeechSynthesis() {
        if ('speechSynthesis' in window) {
            this.speechSynthesis = window.speechSynthesis;
            this.speechUtterance = null;
            
            // Get available voices
            this.loadVoices();
            
            // Listen for voice changes
            this.speechSynthesis.addEventListener('voiceschanged', () => {
                this.loadVoices();
            });
            
            console.log('Speech synthesis initialized');
        } else {
            console.warn('Speech synthesis not supported');
            this.speechEnabled = false;
        }
    }

    // Load available voices
    loadVoices() {
        if (this.speechSynthesis) {
            this.voices = this.speechSynthesis.getVoices();
            // Prefer English voices
            this.selectedVoice = this.voices.find(voice => 
                voice.lang.startsWith('en') && voice.default
            ) || this.voices.find(voice => 
                voice.lang.startsWith('en')
            ) || this.voices[0];
        }
    }

    // Speak text with directional guidance
    speakDirection(text, options = {}) {
        if (!this.speechEnabled || !this.speechSynthesis || !this.settings.speechGuidance) {
            return;
        }

        // Cancel any current speech
        if (this.speechUtterance) {
            this.speechSynthesis.cancel();
        }

        // Create new utterance
        this.speechUtterance = new SpeechSynthesisUtterance(text);
        
        // Configure speech settings
        this.speechUtterance.voice = this.selectedVoice;
        this.speechUtterance.rate = this.settings.speechRate;
        this.speechUtterance.volume = this.settings.speechVolume;
        this.speechUtterance.pitch = options.pitch || 1.0;
        
        // Add directional emphasis for navigation words
        if (options.direction) {
            this.speechUtterance.pitch = 1.2; // Slightly higher pitch for directions
        }

        // Speak the text
        this.speechSynthesis.speak(this.speechUtterance);
    }

    // Provide directional guidance
    provideDirectionalGuidance(availableMoves, exitInfo) {
        if (!this.speechEnabled || !this.settings.speechGuidance) return;

        let guidance = '';
        
        // If no moves available
        if (availableMoves.length === 0) {
            guidance = 'You are trapped. No moves available.';
        }
        // If only one move available
        else if (availableMoves.length === 1) {
            guidance = `You can only move ${availableMoves[0]}.`;
        }
        // If multiple moves available, suggest best direction
        else {
            const bestDirection = this.getBestDirection(availableMoves, exitInfo);
            guidance = `You can move ${availableMoves.join(', ')}. I suggest moving ${bestDirection}.`;
        }

        // Add exit information
        if (exitInfo.isNearby) {
            guidance += ' The exit is very close.';
        } else if (exitInfo.distance < 5) {
            guidance += ` The exit is ${Math.round(exitInfo.distance)} steps away.`;
        }

        this.speakDirection(guidance, { direction: true });
    }

    // Get the best direction to move based on exit location
    getBestDirection(availableMoves, exitInfo) {
        if (!exitInfo || !exitInfo.direction) {
            return availableMoves[0]; // Return first available if no exit info
        }

        // Prefer moving toward exit
        if (availableMoves.includes(exitInfo.direction)) {
            return exitInfo.direction;
        }

        // If can't move toward exit, choose perpendicular direction
        const perpendicularDirections = {
            'north': ['east', 'west'],
            'south': ['east', 'west'],
            'east': ['north', 'south'],
            'west': ['north', 'south']
        };

        const perpendicular = perpendicularDirections[exitInfo.direction] || [];
        for (const dir of perpendicular) {
            if (availableMoves.includes(dir)) {
                return dir;
            }
        }

        // Fallback to first available move
        return availableMoves[0];
    }

    // Announce wall collision with direction
    announceWallCollision(direction) {
        const message = `Wall to the ${direction}. Try a different direction.`;
        this.speakDirection(message, { direction: true });
    }

    // Announce successful movement
    announceMovement(direction) {
        const message = `Moved ${direction}.`;
        this.speakDirection(message, { direction: true });
    }

    // Announce exit proximity
    announceExitProximity(exitInfo) {
        if (!exitInfo.isNearby) return;

        let message = '';
        if (exitInfo.isVisible) {
            message = 'You can see the exit! Move toward it.';
        } else {
            message = 'The exit is very close. Keep exploring.';
        }
        
        this.speakDirection(message, { direction: true });
    }

    // Announce level completion
    announceLevelComplete(moves, time) {
        const message = `Congratulations! Level complete in ${moves} moves and ${time}.`;
        this.speakDirection(message, { pitch: 1.3 });
    }

    // Announce level restart
    announceLevelRestart() {
        const message = 'Level restarted. You are back at the starting position.';
        this.speakDirection(message);
    }

    // Generate different wall sounds for different directions
    createWallSound() {
        const sampleRate = 44100;
        const duration = 0.3;
        const samples = Math.floor(sampleRate * duration);
        const buffer = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            const frequency = 200 + Math.sin(t * 10) * 50;
            buffer[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 3);
        }
        
        return buffer;
    }

    createExitSound() {
        const sampleRate = 44100;
        const duration = 0.5;
        const samples = Math.floor(sampleRate * duration);
        const buffer = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            const frequency = 400 + t * 200;
            buffer[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 2) * 0.5;
        }
        
        return buffer;
    }

    createMovementSound() {
        const sampleRate = 44100;
        const duration = 0.1;
        const samples = Math.floor(sampleRate * duration);
        const buffer = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            const frequency = 150 + Math.sin(t * 20) * 30;
            buffer[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 10);
        }
        
        return buffer;
    }

    createSuccessSound() {
        const sampleRate = 44100;
        const duration = 1.0;
        const samples = Math.floor(sampleRate * duration);
        const buffer = new Float32Array(samples);
        
        const frequencies = [523, 659, 784, 1047]; // C, E, G, C
        const noteDuration = duration / frequencies.length;
        
        for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            const noteIndex = Math.floor(t / noteDuration);
            const noteT = (t % noteDuration) / noteDuration;
            
            if (noteIndex < frequencies.length) {
                const frequency = frequencies[noteIndex];
                buffer[i] = Math.sin(2 * Math.PI * frequency * t) * 
                           Math.exp(-noteT * 2) * 0.3;
            }
        }
        
        return buffer;
    }

    createErrorSound() {
        const sampleRate = 44100;
        const duration = 0.3;
        const samples = Math.floor(sampleRate * duration);
        const buffer = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            const frequency = 300 - t * 200;
            buffer[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 4);
        }
        
        return buffer;
    }

    createMenuSound() {
        const sampleRate = 44100;
        const duration = 0.2;
        const samples = Math.floor(sampleRate * duration);
        const buffer = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            const frequency = 600;
            buffer[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 5);
        }
        
        return buffer;
    }

    createBeaconSound() {
        const sampleRate = 44100;
        const duration = 2.0;
        const samples = Math.floor(sampleRate * duration);
        const buffer = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            const pulseRate = 2; // 2 pulses per second
            const pulse = Math.sin(2 * Math.PI * pulseRate * t);
            const frequency = 800 + pulse * 100;
            buffer[i] = Math.sin(2 * Math.PI * frequency * t) * 
                       (0.3 + 0.2 * pulse) * Math.exp(-t * 0.5);
        }
        
        return buffer;
    }

    async createAudioBuffer(data) {
        const buffer = this.audioContext.createBuffer(1, data.length, 44100);
        buffer.getChannelData(0).set(data);
        return buffer;
    }

    // Play a sound with optional spatial positioning
    playSound(soundName, options = {}) {
        if (!this.audioEnabled || !this.audioContext || !this.sounds[soundName]) {
            return null;
        }

        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = this.sounds[soundName];
            source.playbackRate.value = this.settings.speed;
            
            // Apply volume
            gainNode.gain.value = (options.volume || 1.0) * this.volume;
            
            // Connect nodes
            if (options.spatial && this.spatialAudio) {
                const panner = this.audioContext.createPanner();
                panner.panningModel = 'HRTF';
                panner.distanceModel = 'inverse';
                panner.refDistance = 1;
                panner.maxDistance = 10000;
                panner.rolloffFactor = 1;
                
                // Set position if provided
                if (options.position) {
                    panner.setPosition(options.position.x, options.position.y, options.position.z);
                }
                
                source.connect(gainNode);
                gainNode.connect(panner);
                panner.connect(this.masterGain);
            } else {
                source.connect(gainNode);
                gainNode.connect(this.masterGain);
            }
            
            source.start();
            
            // Trigger haptic feedback if enabled
            if (this.hapticEnabled && options.haptic) {
                this.triggerHapticFeedback(options.haptic);
            }
            
            return source;
        } catch (error) {
            console.error('Error playing sound:', error);
            return null;
        }
    }

    // Play wall sound based on direction
    playWallSound(direction) {
        const directions = {
            'north': { x: 0, y: 0, z: -1 },
            'south': { x: 0, y: 0, z: 1 },
            'east': { x: 1, y: 0, z: 0 },
            'west': { x: -1, y: 0, z: 0 }
        };
        
        const position = directions[direction] || { x: 0, y: 0, z: 0 };
        
        this.playSound('wall', {
            spatial: true,
            position: position,
            volume: 0.6,
            haptic: 'light'
        });
    }

    // Play exit beacon sound
    playExitBeacon(distance, direction) {
        const volume = Math.max(0.1, 1.0 - distance / 10);
        const position = {
            x: Math.cos(direction) * distance,
            y: 0,
            z: Math.sin(direction) * distance
        };
        
        this.playSound('beacon', {
            spatial: true,
            position: position,
            volume: volume
        });
    }

    // Play movement sound
    playMovementSound() {
        this.playSound('movement', {
            spatial: false,
            volume: 0.3,
            haptic: 'light'
        });
    }

    // Play success sound
    playSuccessSound() {
        this.playSound('success', {
            spatial: false,
            volume: 0.8,
            haptic: 'success'
        });
    }

    // Play error sound
    playErrorSound() {
        this.playSound('error', {
            spatial: false,
            volume: 0.6,
            haptic: 'error'
        });
    }

    // Play menu navigation sound
    playMenuSound() {
        this.playSound('menu', {
            spatial: false,
            volume: 0.4
        });
    }

    // Haptic feedback support
    triggerHapticFeedback(type) {
        if (!navigator.vibrate) return;
        
        const patterns = {
            'light': [50],
            'medium': [100],
            'heavy': [200],
            'success': [100, 50, 100],
            'error': [200, 100, 200],
            'warning': [300, 100, 300]
        };
        
        const pattern = patterns[type] || [100];
        navigator.vibrate(pattern);
    }

    // Volume control
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.masterGain.gain.value = this.volume;
        this.settings.volume = this.volume;
        this.saveSettings();
    }

    // Audio speed control
    setSpeed(speed) {
        this.settings.speed = Math.max(0.5, Math.min(2, speed));
        this.saveSettings();
    }

    // Toggle audio on/off
    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        if (this.audioEnabled && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        this.saveSettings();
        return this.audioEnabled;
    }

    // Toggle spatial audio
    toggleSpatialAudio() {
        this.spatialAudio = !this.spatialAudio;
        this.settings.spatialAudio = this.spatialAudio;
        this.saveSettings();
        return this.spatialAudio;
    }

    // Toggle haptic feedback
    toggleHapticFeedback() {
        this.hapticEnabled = !this.hapticEnabled;
        this.settings.hapticFeedback = this.hapticEnabled;
        this.saveSettings();
        return this.hapticEnabled;
    }

    // Toggle screen reader mode
    toggleScreenReaderMode() {
        this.settings.screenReaderMode = !this.settings.screenReaderMode;
        this.saveSettings();
        return this.settings.screenReaderMode;
    }

    // Load settings from localStorage
    loadSettings() {
        try {
            const saved = localStorage.getItem('soundmaze_audio_settings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.settings = { ...this.settings, ...settings };
                this.volume = this.settings.volume;
                this.spatialAudio = this.settings.spatialAudio;
                this.hapticEnabled = this.settings.hapticFeedback;
                
                if (this.masterGain) {
                    this.masterGain.gain.value = this.volume;
                }
            }
        } catch (error) {
            console.error('Error loading audio settings:', error);
        }
    }

    // Save settings to localStorage
    saveSettings() {
        try {
            localStorage.setItem('soundmaze_audio_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving audio settings:', error);
        }
    }

    // Get current settings
    getSettings() {
        return { ...this.settings };
    }

    // Reset to default settings
    resetSettings() {
        this.settings = {
            volume: 0.8,
            speed: 1.0,
            spatialAudio: true,
            hapticFeedback: false,
            screenReaderMode: false
        };
        this.volume = this.settings.volume;
        this.spatialAudio = this.settings.spatialAudio;
        this.hapticEnabled = this.settings.hapticFeedback;
        
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
        
        this.saveSettings();
    }

    // Cleanup
    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// Create global audio manager instance
window.audioManager = new AudioManager(); 