/**
 * SoundMaze Main Application
 * Initializes all components and handles application startup
 */

class SoundMazeApp {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Show loading screen
            this.showLoadingScreen();
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Initialize components
            await this.initializeComponents();
            
            // Set up global event listeners
            this.setupGlobalEventListeners();
            
            // Show main menu
            this.showMainMenu();
            
            this.isInitialized = true;
            console.log('SoundMaze application initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize SoundMaze application:', error);
            this.showErrorScreen(error);
        }
    }

    async initializeComponents() {
        console.log('Initializing components...');
        
        // Wait a bit for all scripts to load
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Initialize audio manager first
        if (!window.audioManager) {
            console.warn('Audio manager not found, creating fallback');
            window.audioManager = this.createFallbackAudioManager();
        } else {
            console.log('Audio manager found and initialized');
        }
        
        // Initialize maze generator
        if (!window.mazeGenerator) {
            console.warn('Maze generator not found, creating fallback');
            window.mazeGenerator = this.createFallbackMazeGenerator();
        } else {
            console.log('Maze generator found and initialized');
        }
        
        // Initialize game manager
        if (!window.gameManager) {
            console.warn('Game manager not found, creating fallback');
            window.gameManager = this.createFallbackGameManager();
        } else {
            console.log('Game manager found and initialized');
        }
        
        // Initialize UI manager
        if (!window.uiManager) {
            console.warn('UI manager not found, creating fallback');
            window.uiManager = this.createFallbackUIManager();
        } else {
            console.log('UI manager found and initialized');
        }
        
        // Wait for audio context to be ready
        if (window.audioManager && window.audioManager.audioContext) {
            if (window.audioManager.audioContext.state === 'suspended') {
                console.log('Audio context is suspended, waiting for user interaction...');
                // Don't try to resume here - let user interaction handle it
            } else {
                console.log('Audio context is ready');
            }
        }
        
        console.log('All components initialized');
    }

    createFallbackAudioManager() {
        return {
            playSound: () => {},
            playWallSound: () => {},
            playExitBeacon: () => {},
            playMovementSound: () => {},
            playSuccessSound: () => {},
            playErrorSound: () => {},
            playMenuSound: () => {},
            setVolume: () => {},
            setSpeed: () => {},
            toggleAudio: () => true,
            toggleHapticFeedback: () => {},
            toggleScreenReaderMode: () => {},
            loadSettings: () => {},
            saveSettings: () => {},
            getSettings: () => ({}),
            resetSettings: () => {},
            volume: 0.8,
            audioEnabled: true,
            spatialAudio: true,
            hapticEnabled: false
        };
    }

    createFallbackMazeGenerator() {
        return {
            generateMaze: () => [],
            movePlayer: () => false,
            hasReachedExit: () => false,
            resetMaze: () => {},
            getAvailableMoves: () => [],
            getWallDirections: () => [],
            getDistanceToExit: () => 0,
            getDirectionToExit: () => 'north',
            getExitInfo: () => ({ distance: 0, direction: 'north', angle: 0, isNearby: false, isVisible: false }),
            getPositionDescription: () => 'Position description not available.',
            getMazeStats: () => ({}),
            exportMaze: () => ({}),
            importMaze: () => {},
            width: 20,
            height: 15,
            cellSize: 30,
            CELL_TYPES: { WALL: 1, PATH: 0, PLAYER: 2, EXIT: 3, VISITED: 4 }
        };
    }

    createFallbackGameManager() {
        return {
            startGame: () => {},
            pauseGame: () => {},
            restartLevel: () => {},
            backToMenu: () => {},
            stopGame: () => {},
            handleKeyPress: () => {},
            movePlayer: () => false,
            renderMaze: () => {},
            updateUI: () => {},
            startTimer: () => {},
            stopTimer: () => {},
            formatTime: () => '00:00',
            toggleAudio: () => {},
            adjustVolume: () => {},
            showPauseOverlay: () => {},
            hidePauseOverlay: () => {},
            showVictoryOverlay: () => {},
            hideVictoryOverlay: () => {},
            announceToScreenReader: () => {},
            loadSettings: () => {},
            saveSettings: () => {},
            getGameStats: () => ({}),
            isRunning: false,
            isPaused: false,
            currentLevel: 1,
            moves: 0,
            startTime: 0,
            currentTime: 0,
            timer: null,
            maze: null,
            canvas: null,
            ctx: null,
            settings: {
                difficulty: 'medium',
                audioEnabled: true,
                spatialAudio: true,
                hapticFeedback: false,
                screenReaderMode: false
            }
        };
    }

    createFallbackUIManager() {
        return {
            showScreen: () => {},
            showMainMenu: () => {},
            showGameScreen: () => {},
            showInstructions: () => {},
            showSettings: () => {},
            showAbout: () => {},
            showLoadingScreen: () => {},
            startGame: () => {},
            resumeGame: () => {},
            restartFromPause: () => {},
            menuFromPause: () => {},
            nextLevel: () => {},
            restartVictory: () => {},
            menuFromVictory: () => {},
            hidePauseOverlay: () => {},
            hideVictoryOverlay: () => {},
            loadSettingsToUI: () => {},
            saveSettings: () => {},
            resetSettings: () => {},
            loadSettings: () => {},
            saveSettingsToStorage: () => {},
            announceToScreenReader: () => {},
            getSettings: () => ({}),
            updateSettings: () => {},
            currentScreen: 'main-menu',
            screens: {},
            settings: {}
        };
    }

    setupGlobalEventListeners() {
        // Handle window focus/blur for audio context
        window.addEventListener('focus', () => {
            if (window.audioManager && window.audioManager.audioContext) {
                if (window.audioManager.audioContext.state === 'suspended') {
                    window.audioManager.audioContext.resume();
                }
            }
        });
        
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause game when tab is not visible
                if (window.gameManager && window.gameManager.isRunning && !window.gameManager.isPaused) {
                    window.gameManager.pauseGame();
                }
            }
        });
        
        // Handle beforeunload
        window.addEventListener('beforeunload', () => {
            // Save any unsaved data
            if (window.gameManager) {
                window.gameManager.saveSettings();
            }
            if (window.uiManager) {
                window.uiManager.saveSettingsToStorage();
            }
            if (window.audioManager) {
                window.audioManager.saveSettings();
            }
        });
        
        // Handle online/offline status
        window.addEventListener('online', () => {
            this.announceToScreenReader('Internet connection restored.');
        });
        
        window.addEventListener('offline', () => {
            this.announceToScreenReader('Internet connection lost. Game will continue offline.');
        });
        
        // Handle resize
        window.addEventListener('resize', () => {
            // Re-render maze if game is running
            if (window.gameManager && window.gameManager.isRunning) {
                window.gameManager.renderMaze();
            }
        });
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('active');
            loadingScreen.setAttribute('aria-hidden', 'false');
        }
    }

    showMainMenu() {
        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('active');
            loadingScreen.setAttribute('aria-hidden', 'true');
        }
        
        // Show main menu
        if (window.uiManager) {
            window.uiManager.showMainMenu();
        } else {
            // Fallback
            const mainMenu = document.getElementById('main-menu');
            if (mainMenu) {
                mainMenu.classList.add('active');
                mainMenu.setAttribute('aria-hidden', 'false');
            }
        }
        
        // Announce app ready
        this.announceToScreenReader('SoundMaze loaded successfully. Welcome to the audio-guided maze game!');
    }

    showErrorScreen(error) {
        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('active');
            loadingScreen.setAttribute('aria-hidden', 'true');
        }
        
        // Show error message
        const errorMessage = `
            <div style="text-align: center; padding: 2rem;">
                <h2>Error Loading SoundMaze</h2>
                <p>Sorry, there was an error loading the game. Please try refreshing the page.</p>
                <p>Error details: ${error.message}</p>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem;">
                    Refresh Page
                </button>
            </div>
        `;
        
        document.body.innerHTML = errorMessage;
    }

    announceToScreenReader(message) {
        // Try to use UI manager's announcement system
        if (window.uiManager && window.uiManager.announceToScreenReader) {
            window.uiManager.announceToScreenReader(message);
        } else {
            // Fallback: create a temporary announcement element
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = message;
            
            document.body.appendChild(announcement);
            
            // Remove after announcement
            setTimeout(() => {
                if (announcement.parentNode) {
                    announcement.parentNode.removeChild(announcement);
                }
            }, 1000);
        }
    }

    // Public API methods
    getVersion() {
        return '1.0.0';
    }

    getStatus() {
        return {
            initialized: this.isInitialized,
            audioManager: !!window.audioManager,
            mazeGenerator: !!window.mazeGenerator,
            gameManager: !!window.gameManager,
            uiManager: !!window.uiManager,
            online: navigator.onLine,
            userAgent: navigator.userAgent
        };
    }

    // Debug methods
    debug() {
        console.log('SoundMaze Debug Information:');
        console.log('Version:', this.getVersion());
        console.log('Status:', this.getStatus());
        
        if (window.audioManager) {
            console.log('Audio Manager Settings:', window.audioManager.getSettings());
        }
        
        if (window.gameManager) {
            console.log('Game Manager Stats:', window.gameManager.getGameStats());
        }
        
        if (window.uiManager) {
            console.log('UI Manager Settings:', window.uiManager.getSettings());
        }
        
        if (window.mazeGenerator) {
            console.log('Maze Generator Stats:', window.mazeGenerator.getMazeStats());
        }
    }
}

// Initialize the application when the script loads
let soundMazeApp;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        soundMazeApp = new SoundMazeApp();
    });
} else {
    soundMazeApp = new SoundMazeApp();
}

// Make app available globally for debugging
window.soundMazeApp = soundMazeApp;

// Add some helpful global functions for debugging
window.debugSoundMaze = () => {
    if (window.soundMazeApp) {
        window.soundMazeApp.debug();
    }
};

window.getSoundMazeStatus = () => {
    if (window.soundMazeApp) {
        return window.soundMazeApp.getStatus();
    }
    return { error: 'App not initialized' };
};

// Debug function to test restart functionality
window.testRestart = () => {
    console.log('=== Testing Restart Functionality ===');
    
    if (window.gameManager) {
        console.log('Game Manager Status:', {
            isRunning: window.gameManager.isRunning,
            isPaused: window.gameManager.isPaused,
            currentLevel: window.gameManager.currentLevel,
            moves: window.gameManager.moves
        });
        
        if (window.gameManager.isRunning) {
            console.log('Attempting to restart...');
            window.gameManager.restartLevel();
        } else {
            console.log('Game is not running. Start a game first.');
        }
    } else {
        console.error('Game manager not found');
    }
    
    if (window.mazeGenerator) {
        console.log('Maze Generator Status:', {
            player: window.mazeGenerator.player,
            exit: window.mazeGenerator.exit,
            hasReachedExit: window.mazeGenerator.hasReachedExit()
        });
    } else {
        console.error('Maze generator not found');
    }
}; 