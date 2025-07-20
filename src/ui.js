/**
 * SoundMaze UI Manager
 * Handles screen transitions, menu navigation, and settings management
 */

class UIManager {
    constructor() {
        this.currentScreen = 'main-menu';
        this.screens = {};
        this.settings = {};
        
        this.init();
    }

    init() {
        // Initialize screens
        this.screens = {
            'main-menu': document.getElementById('main-menu'),
            'game-screen': document.getElementById('game-screen'),
            'instructions-screen': document.getElementById('instructions-screen'),
            'settings-screen': document.getElementById('settings-screen'),
            'about-screen': document.getElementById('about-screen'),
            'loading-screen': document.getElementById('loading-screen')
        };
        
        // Load settings
        this.loadSettings();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize audio manager settings
        if (window.audioManager) {
            window.audioManager.loadSettings();
        }
        
        console.log('UI manager initialized');
    }

    setupEventListeners() {
        // Main menu buttons
        const startGame = document.getElementById('start-game');
        const instructions = document.getElementById('instructions');
        const settings = document.getElementById('settings');
        const about = document.getElementById('about');
        
        if (startGame) {
            startGame.addEventListener('click', () => this.startGame());
        }
        if (instructions) {
            instructions.addEventListener('click', () => this.showInstructions());
        }
        if (settings) {
            settings.addEventListener('click', () => this.showSettings());
        }
        if (about) {
            about.addEventListener('click', () => this.showAbout());
        }
        
        // Instructions screen
        const closeInstructions = document.getElementById('close-instructions');
        const startFromInstructions = document.getElementById('start-from-instructions');
        
        if (closeInstructions) {
            closeInstructions.addEventListener('click', () => this.showMainMenu());
        }
        if (startFromInstructions) {
            startFromInstructions.addEventListener('click', () => this.startGame());
        }
        
        // Settings screen
        const closeSettings = document.getElementById('close-settings');
        const saveSettings = document.getElementById('save-settings');
        const resetSettings = document.getElementById('reset-settings');
        
        if (closeSettings) {
            closeSettings.addEventListener('click', () => this.showMainMenu());
        }
        if (saveSettings) {
            saveSettings.addEventListener('click', () => this.saveSettings());
        }
        if (resetSettings) {
            resetSettings.addEventListener('click', () => this.resetSettings());
        }
        
        // About screen
        const closeAbout = document.getElementById('close-about');
        
        if (closeAbout) {
            closeAbout.addEventListener('click', () => this.showMainMenu());
        }
        
        // Pause overlay
        const resumeGame = document.getElementById('resume-game');
        const restartFromPause = document.getElementById('restart-from-pause');
        const menuFromPause = document.getElementById('menu-from-pause');
        
        if (resumeGame) {
            resumeGame.addEventListener('click', () => this.resumeGame());
        }
        if (restartFromPause) {
            restartFromPause.addEventListener('click', () => this.restartFromPause());
        }
        if (menuFromPause) {
            menuFromPause.addEventListener('click', () => this.menuFromPause());
        }
        
        // Victory overlay
        const nextLevel = document.getElementById('next-level');
        const restartVictory = document.getElementById('restart-victory');
        const menuFromVictory = document.getElementById('menu-from-victory');
        
        if (nextLevel) {
            nextLevel.addEventListener('click', () => this.nextLevel());
        }
        if (restartVictory) {
            restartVictory.addEventListener('click', () => this.restartVictory());
        }
        if (menuFromVictory) {
            menuFromVictory.addEventListener('click', () => this.menuFromVictory());
        }
        
        // Settings controls
        this.setupSettingsControls();
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    setupSettingsControls() {
        // Volume slider
        const volumeSlider = document.getElementById('audio-volume');
        const volumeDisplay = document.getElementById('volume-display');
        
        if (volumeSlider && volumeDisplay) {
            volumeSlider.addEventListener('input', (e) => {
                const volume = e.target.value;
                volumeDisplay.textContent = `${volume}%`;
                if (window.audioManager) {
                    window.audioManager.setVolume(volume / 100);
                }
            });
        }
        
        // Speed slider
        const speedSlider = document.getElementById('audio-speed');
        const speedDisplay = document.getElementById('speed-display');
        
        if (speedSlider && speedDisplay) {
            speedSlider.addEventListener('input', (e) => {
                const speed = parseFloat(e.target.value);
                speedDisplay.textContent = `${speed.toFixed(1)}x`;
                if (window.audioManager) {
                    window.audioManager.setSpeed(speed);
                }
            });
        }
        
        // Difficulty selector
        const difficultySelect = document.getElementById('difficulty');
        
        if (difficultySelect) {
            difficultySelect.addEventListener('change', (e) => {
                this.settings.difficulty = e.target.value;
            });
        }
        
        // Haptic feedback checkbox
        const hapticCheckbox = document.getElementById('haptic-feedback');
        
        if (hapticCheckbox) {
            hapticCheckbox.addEventListener('change', (e) => {
                this.settings.hapticFeedback = e.target.checked;
                if (window.audioManager) {
                    window.audioManager.toggleHapticFeedback();
                }
            });
        }
        
        // Screen reader mode checkbox
        const screenReaderCheckbox = document.getElementById('screen-reader-mode');
        
        if (screenReaderCheckbox) {
            screenReaderCheckbox.addEventListener('change', (e) => {
                this.settings.screenReaderMode = e.target.checked;
                if (window.audioManager) {
                    window.audioManager.toggleScreenReaderMode();
                }
            });
        }
    }

    handleKeyPress(event) {
        // Handle Escape key for closing screens
        if (event.key === 'Escape') {
            if (this.currentScreen === 'instructions-screen' || 
                this.currentScreen === 'settings-screen' || 
                this.currentScreen === 'about-screen') {
                this.showMainMenu();
                event.preventDefault();
            }
        }
        
        // Handle Enter key for menu navigation
        if (event.key === 'Enter') {
            const focusedElement = document.activeElement;
            if (focusedElement && focusedElement.classList.contains('menu-button')) {
                focusedElement.click();
                event.preventDefault();
            }
        }
    }

    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            if (screen) {
                screen.classList.remove('active');
                screen.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Show target screen
        const targetScreen = this.screens[screenName];
        if (targetScreen) {
            targetScreen.classList.add('active');
            targetScreen.setAttribute('aria-hidden', 'false');
            this.currentScreen = screenName;
            
            // Focus first focusable element
            const firstFocusable = targetScreen.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }
    }

    showMainMenu() {
        this.showScreen('main-menu');
        this.announceToScreenReader('Main menu. Use Tab to navigate and Enter to select options.');
    }

    showGameScreen() {
        this.showScreen('game-screen');
        this.announceToScreenReader('Game screen loaded. Use arrow keys to move.');
    }

    showInstructions() {
        this.showScreen('instructions-screen');
        this.announceToScreenReader('Instructions screen. Read the game controls and tips.');
    }

    showSettings() {
        this.showScreen('settings-screen');
        this.loadSettingsToUI();
        this.announceToScreenReader('Settings screen. Adjust audio and game preferences.');
    }

    showAbout() {
        this.showScreen('about-screen');
        this.announceToScreenReader('About SoundMaze. Learn about accessibility features.');
    }

    showLoadingScreen() {
        this.showScreen('loading-screen');
    }

    startGame() {
        this.showGameScreen();
        
        // Initialize audio context if needed
        if (window.audioManager && window.audioManager.audioContext && 
            window.audioManager.audioContext.state === 'suspended') {
            window.audioManager.audioContext.resume();
        }
        
        // Start the game
        if (window.gameManager) {
            window.gameManager.startGame();
        }
        
        // Play menu sound
        if (window.audioManager) {
            window.audioManager.playMenuSound();
        }
    }

    resumeGame() {
        if (window.gameManager) {
            window.gameManager.pauseGame();
        }
    }

    restartFromPause() {
        if (window.gameManager) {
            window.gameManager.restartLevel();
            this.hidePauseOverlay();
            console.log('Restarted from pause overlay');
        }
    }

    menuFromPause() {
        if (window.gameManager) {
            window.gameManager.backToMenu();
        }
    }

    nextLevel() {
        if (window.gameManager) {
            window.gameManager.nextLevel();
        }
    }

    restartVictory() {
        if (window.gameManager) {
            window.gameManager.restartLevel();
            this.hideVictoryOverlay();
            console.log('Restarted from victory overlay');
        }
    }

    menuFromVictory() {
        if (window.gameManager) {
            window.gameManager.backToMenu();
        }
    }

    hidePauseOverlay() {
        const overlay = document.getElementById('pause-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            overlay.setAttribute('aria-hidden', 'true');
        }
    }

    hideVictoryOverlay() {
        const overlay = document.getElementById('victory-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            overlay.setAttribute('aria-hidden', 'true');
        }
    }

    loadSettingsToUI() {
        // Load volume setting
        const volumeSlider = document.getElementById('audio-volume');
        const volumeDisplay = document.getElementById('volume-display');
        
        if (volumeSlider && volumeDisplay) {
            const volume = this.settings.volume || 80;
            volumeSlider.value = volume;
            volumeDisplay.textContent = `${volume}%`;
        }
        
        // Load speed setting
        const speedSlider = document.getElementById('audio-speed');
        const speedDisplay = document.getElementById('speed-display');
        
        if (speedSlider && speedDisplay) {
            const speed = this.settings.speed || 1.0;
            speedSlider.value = speed;
            speedDisplay.textContent = `${speed.toFixed(1)}x`;
        }
        
        // Load difficulty setting
        const difficultySelect = document.getElementById('difficulty');
        
        if (difficultySelect) {
            difficultySelect.value = this.settings.difficulty || 'medium';
        }
        
        // Load haptic feedback setting
        const hapticCheckbox = document.getElementById('haptic-feedback');
        
        if (hapticCheckbox) {
            hapticCheckbox.checked = this.settings.hapticFeedback || false;
        }
        
        // Load screen reader mode setting
        const screenReaderCheckbox = document.getElementById('screen-reader-mode');
        
        if (screenReaderCheckbox) {
            screenReaderCheckbox.checked = this.settings.screenReaderMode || false;
        }
    }

    saveSettings() {
        // Get current UI values
        const volumeSlider = document.getElementById('audio-volume');
        const speedSlider = document.getElementById('audio-speed');
        const difficultySelect = document.getElementById('difficulty');
        const hapticCheckbox = document.getElementById('haptic-feedback');
        const screenReaderCheckbox = document.getElementById('screen-reader-mode');
        
        this.settings = {
            volume: volumeSlider ? parseInt(volumeSlider.value) : 80,
            speed: speedSlider ? parseFloat(speedSlider.value) : 1.0,
            difficulty: difficultySelect ? difficultySelect.value : 'medium',
            hapticFeedback: hapticCheckbox ? hapticCheckbox.checked : false,
            screenReaderMode: screenReaderCheckbox ? screenReaderCheckbox.checked : false
        };
        
        // Save to localStorage
        this.saveSettingsToStorage();
        
        // Update game manager settings
        if (window.gameManager) {
            window.gameManager.settings = { ...window.gameManager.settings, ...this.settings };
            window.gameManager.saveSettings();
        }
        
        // Update audio manager settings
        if (window.audioManager) {
            window.audioManager.settings = { ...window.audioManager.settings, ...this.settings };
            window.audioManager.saveSettings();
        }
        
        this.announceToScreenReader('Settings saved successfully.');
        
        // Show confirmation
        setTimeout(() => {
            this.showMainMenu();
        }, 1000);
    }

    resetSettings() {
        // Reset to default values
        this.settings = {
            volume: 80,
            speed: 1.0,
            difficulty: 'medium',
            hapticFeedback: false,
            screenReaderMode: false
        };
        
        // Update UI
        this.loadSettingsToUI();
        
        // Reset audio manager
        if (window.audioManager) {
            window.audioManager.resetSettings();
        }
        
        // Reset game manager
        if (window.gameManager) {
            window.gameManager.settings = { ...window.gameManager.settings, ...this.settings };
            window.gameManager.saveSettings();
        }
        
        this.announceToScreenReader('Settings reset to default values.');
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('soundmaze_ui_settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Error loading UI settings:', error);
        }
    }

    saveSettingsToStorage() {
        try {
            localStorage.setItem('soundmaze_ui_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving UI settings:', error);
        }
    }

    announceToScreenReader(message) {
        const announcement = document.getElementById('menu-announcement');
        if (announcement) {
            announcement.textContent = message;
            // Clear after a short delay
            setTimeout(() => {
                announcement.textContent = '';
            }, 1000);
        }
    }

    // Get current settings
    getSettings() {
        return { ...this.settings };
    }

    // Update settings from external source
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettingsToStorage();
    }
}

// Create global UI manager instance
window.uiManager = new UIManager(); 