/**
 * SoundMaze Game Logic
 * Handles game state, player movement, and audio feedback
 */

class GameManager {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentLevel = 1;
        this.moves = 0;
        this.startTime = 0;
        this.currentTime = 0;
        this.timer = null;
        this.maze = null;
        this.canvas = null;
        this.ctx = null;
        
        // Game settings
        this.settings = {
            difficulty: 'medium',
            audioEnabled: true,
            spatialAudio: true,
            hapticFeedback: false,
            screenReaderMode: false
        };
        
        this.init();
    }

    init() {
        this.maze = window.mazeGenerator;
        this.canvas = document.getElementById('maze-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Load settings
        this.loadSettings();
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('Game manager initialized');
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Audio controls
        const toggleAudio = document.getElementById('toggle-audio');
        const volumeUp = document.getElementById('volume-up');
        const volumeDown = document.getElementById('volume-down');
        
        if (toggleAudio) {
            toggleAudio.addEventListener('click', () => this.toggleAudio());
        }
        if (volumeUp) {
            volumeUp.addEventListener('click', () => this.adjustVolume(0.1));
        }
        if (volumeDown) {
            volumeDown.addEventListener('click', () => this.adjustVolume(-0.1));
        }
        
        // Game controls
        const pauseGame = document.getElementById('pause-game');
        const restartLevel = document.getElementById('restart-level');
        const backToMenu = document.getElementById('back-to-menu');
        
        if (pauseGame) {
            pauseGame.addEventListener('click', () => this.pauseGame());
        }
        if (restartLevel) {
            restartLevel.addEventListener('click', () => {
                console.log('Restart button clicked');
                this.restartLevel();
            });
        } else {
            console.error('Restart level button not found');
        }
        if (backToMenu) {
            backToMenu.addEventListener('click', () => this.backToMenu());
        }
    }

    startGame() {
        this.isRunning = true;
        this.isPaused = false;
        this.moves = 0;
        this.startTime = Date.now();
        this.currentTime = 0;
        
        // Generate new maze
        this.maze.generateMaze(this.settings.difficulty);
        
        // Start timer
        this.startTimer();
        
        // Play start sound
        if (window.audioManager) {
            window.audioManager.playMenuSound();
        }
        
        // Update UI
        this.updateUI();
        this.renderMaze();
        
        // Announce game start
        this.announceToScreenReader('Game started. Use arrow keys to navigate the maze.');
        
        console.log('Game started');
    }

    pauseGame() {
        if (!this.isRunning) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.stopTimer();
            this.showPauseOverlay();
            this.announceToScreenReader('Game paused. Press Escape to resume.');
        } else {
            this.startTimer();
            this.hidePauseOverlay();
            this.announceToScreenReader('Game resumed.');
        }
    }

    restartLevel() {
        console.log('Restart level called. Game running:', this.isRunning, 'Game paused:', this.isPaused);
        if (!this.isRunning) {
            console.log('Cannot restart: game is not running');
            return;
        }
        
        // Reset game state
        this.moves = 0;
        this.startTime = Date.now();
        this.currentTime = 0;
        
        // Reset maze
        if (this.maze && typeof this.maze.resetMaze === 'function') {
            this.maze.resetMaze();
            console.log('Maze reset successfully');
        } else {
            console.error('Maze not available or resetMaze method not found');
            return;
        }
        
        // Restart timer
        this.startTimer();
        
        // Update UI
        this.updateUI();
        this.renderMaze();
        
        // Play restart sound
        if (window.audioManager) {
            window.audioManager.playMenuSound();
        }
        
        // Announce restart
        this.announceToScreenReader('Level restarted. You are back at the starting position.');
        
        console.log('Level restarted');
    }

    backToMenu() {
        this.stopGame();
        window.uiManager.showMainMenu();
    }

    stopGame() {
        this.isRunning = false;
        this.isPaused = false;
        this.stopTimer();
        console.log('Game stopped');
    }

    handleKeyPress(event) {
        if (!this.isRunning) return;
        
        // Allow restart even when paused
        if (event.key === 'r' || event.key === 'R') {
            this.restartLevel();
            event.preventDefault();
            return;
        }
        
        // Don't handle other keys when paused
        if (this.isPaused) return;
        
        let handled = false;
        
        switch (event.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                handled = this.movePlayer('north');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                handled = this.movePlayer('south');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                handled = this.movePlayer('west');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                handled = this.movePlayer('east');
                break;
            case 'Escape':
                this.pauseGame();
                handled = true;
                break;
            case 'm':
            case 'M':
                this.toggleAudio();
                handled = true;
                break;
        }
        
        if (handled) {
            event.preventDefault();
        }
    }

    movePlayer(direction) {
        const success = this.maze.movePlayer(direction);
        
        if (success) {
            this.moves++;
            this.updateUI();
            this.renderMaze();
            
            // Play movement sound
            if (window.audioManager) {
                window.audioManager.playMovementSound();
            }
            
            // Check for win condition
            if (this.maze.hasReachedExit()) {
                this.handleLevelComplete();
                return true;
            }
            
            // Provide audio feedback for walls and exit
            this.provideAudioFeedback();
            
            // Announce position to screen reader if enabled
            if (this.settings.screenReaderMode) {
                this.announceToScreenReader(this.maze.getPositionDescription());
            }
            
            return true;
        } else {
            // Play error sound for invalid move
            if (window.audioManager) {
                window.audioManager.playErrorSound();
            }
            
            // Announce wall collision
            this.announceToScreenReader(`Wall to the ${direction}.`);
            
            return false;
        }
    }

    provideAudioFeedback() {
        if (!window.audioManager) return;
        
        // Play wall sounds for surrounding walls
        const wallDirections = this.maze.getWallDirections();
        for (const direction of wallDirections) {
            window.audioManager.playWallSound(direction);
        }
        
        // Play exit beacon sound
        const exitInfo = this.maze.getExitInfo();
        if (exitInfo.distance < 10) {
            window.audioManager.playExitBeacon(exitInfo.distance, exitInfo.angle);
        }
    }

    handleLevelComplete() {
        this.stopGame();
        
        // Play success sound
        if (window.audioManager) {
            window.audioManager.playSuccessSound();
        }
        
        // Calculate final stats
        const finalTime = this.currentTime;
        const finalMoves = this.moves;
        
        // Update victory overlay
        document.getElementById('final-moves').textContent = finalMoves;
        document.getElementById('final-time').textContent = this.formatTime(finalTime);
        
        // Show victory overlay
        this.showVictoryOverlay();
        
        // Announce victory
        this.announceToScreenReader(`Level ${this.currentLevel} complete! You used ${finalMoves} moves in ${this.formatTime(finalTime)}.`);
        
        console.log(`Level ${this.currentLevel} completed in ${finalMoves} moves`);
    }

    nextLevel() {
        this.currentLevel++;
        this.hideVictoryOverlay();
        this.startGame();
    }

    renderMaze() {
        if (!this.ctx || !this.maze) return;
        
        const canvas = this.canvas;
        const ctx = this.ctx;
        const cellSize = this.maze.cellSize;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set canvas size based on maze dimensions
        canvas.width = this.maze.width * cellSize;
        canvas.height = this.maze.height * cellSize;
        
        // Draw maze
        for (let y = 0; y < this.maze.height; y++) {
            for (let x = 0; x < this.maze.width; x++) {
                const cell = this.maze.maze[y][x];
                const cellX = x * cellSize;
                const cellY = y * cellSize;
                
                switch (cell) {
                    case this.maze.CELL_TYPES.WALL:
                        ctx.fillStyle = '#2C3E50';
                        ctx.fillRect(cellX, cellY, cellSize, cellSize);
                        break;
                    case this.maze.CELL_TYPES.PATH:
                        ctx.fillStyle = '#ECF0F1';
                        ctx.fillRect(cellX, cellY, cellSize, cellSize);
                        break;
                    case this.maze.CELL_TYPES.PLAYER:
                        ctx.fillStyle = '#ECF0F1';
                        ctx.fillRect(cellX, cellY, cellSize, cellSize);
                        ctx.fillStyle = '#3498DB';
                        ctx.beginPath();
                        ctx.arc(cellX + cellSize/2, cellY + cellSize/2, cellSize/3, 0, 2 * Math.PI);
                        ctx.fill();
                        break;
                    case this.maze.CELL_TYPES.EXIT:
                        ctx.fillStyle = '#ECF0F1';
                        ctx.fillRect(cellX, cellY, cellSize, cellSize);
                        ctx.fillStyle = '#27AE60';
                        ctx.fillRect(cellX + cellSize/4, cellY + cellSize/4, cellSize/2, cellSize/2);
                        break;
                    case this.maze.CELL_TYPES.VISITED:
                        ctx.fillStyle = '#BDC3C7';
                        ctx.fillRect(cellX, cellY, cellSize, cellSize);
                        break;
                }
                
                // Draw grid lines
                ctx.strokeStyle = '#95A5A6';
                ctx.lineWidth = 1;
                ctx.strokeRect(cellX, cellY, cellSize, cellSize);
            }
        }
    }

    updateUI() {
        // Update moves counter
        const movesCounter = document.getElementById('moves-counter');
        if (movesCounter) {
            movesCounter.textContent = `Moves: ${this.moves}`;
        }
        
        // Update timer
        const timer = document.getElementById('timer');
        if (timer) {
            timer.textContent = `Time: ${this.formatTime(this.currentTime)}`;
        }
        
        // Update level title
        const levelTitle = document.getElementById('level-title');
        if (levelTitle) {
            levelTitle.textContent = `Level ${this.currentLevel}`;
        }
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.currentTime = Date.now() - this.startTime;
            this.updateUI();
        }, 100);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    toggleAudio() {
        if (window.audioManager) {
            const enabled = window.audioManager.toggleAudio();
            const toggleButton = document.getElementById('toggle-audio');
            if (toggleButton) {
                toggleButton.textContent = enabled ? '🔊 Audio On' : '🔇 Audio Off';
            }
        }
    }

    adjustVolume(delta) {
        if (window.audioManager) {
            const newVolume = Math.max(0, Math.min(1, window.audioManager.volume + delta));
            window.audioManager.setVolume(newVolume);
        }
    }

    showPauseOverlay() {
        const overlay = document.getElementById('pause-overlay');
        if (overlay) {
            overlay.classList.add('active');
            overlay.setAttribute('aria-hidden', 'false');
        }
    }

    hidePauseOverlay() {
        const overlay = document.getElementById('pause-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            overlay.setAttribute('aria-hidden', 'true');
        }
    }

    showVictoryOverlay() {
        const overlay = document.getElementById('victory-overlay');
        if (overlay) {
            overlay.classList.add('active');
            overlay.setAttribute('aria-hidden', 'false');
        }
    }

    hideVictoryOverlay() {
        const overlay = document.getElementById('victory-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            overlay.setAttribute('aria-hidden', 'true');
        }
    }

    announceToScreenReader(message) {
        const announcement = document.getElementById('game-announcement');
        if (announcement) {
            announcement.textContent = message;
            // Clear after a short delay
            setTimeout(() => {
                announcement.textContent = '';
            }, 1000);
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('soundmaze_game_settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Error loading game settings:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('soundmaze_game_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving game settings:', error);
        }
    }

    getGameStats() {
        return {
            level: this.currentLevel,
            moves: this.moves,
            time: this.currentTime,
            difficulty: this.settings.difficulty
        };
    }
}

// Create global game manager instance
window.gameManager = new GameManager(); 