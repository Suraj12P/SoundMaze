/**
 * SoundMaze Maze Generation and Logic
 * Handles maze creation, pathfinding, and accessibility features
 */

class MazeGenerator {
    constructor() {
        this.width = 20;
        this.height = 15;
        this.cellSize = 30;
        this.maze = [];
        this.player = { x: 1, y: 1 };
        this.exit = { x: 0, y: 0 };
        this.visited = [];
        this.difficulty = 'medium';
        
        // Maze cell types
        this.CELL_TYPES = {
            WALL: 1,
            PATH: 0,
            PLAYER: 2,
            EXIT: 3,
            VISITED: 4
        };
    }

    // Generate a new maze based on difficulty
    generateMaze(difficulty = 'medium') {
        this.difficulty = difficulty;
        
        // Set maze dimensions based on difficulty
        switch (difficulty) {
            case 'easy':
                this.width = 15;
                this.height = 10;
                break;
            case 'medium':
                this.width = 20;
                this.height = 15;
                break;
            case 'hard':
                this.width = 25;
                this.height = 20;
                break;
            default:
                this.width = 20;
                this.height = 15;
        }

        // Initialize maze with walls
        this.maze = [];
        for (let y = 0; y < this.height; y++) {
            this.maze[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.maze[y][x] = this.CELL_TYPES.WALL;
            }
        }

        // Generate maze using recursive backtracking
        this.generatePath(1, 1);
        
        // Set player starting position
        this.player = { x: 1, y: 1 };
        this.maze[this.player.y][this.player.x] = this.CELL_TYPES.PLAYER;
        
        // Set exit position (opposite corner)
        this.exit = { x: this.width - 2, y: this.height - 2 };
        this.maze[this.exit.y][this.exit.x] = this.CELL_TYPES.EXIT;
        
        // Initialize visited array
        this.visited = [];
        for (let y = 0; y < this.height; y++) {
            this.visited[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.visited[y][x] = false;
            }
        }
        
        return this.maze;
    }

    // Recursive backtracking algorithm for maze generation
    generatePath(x, y) {
        this.maze[y][x] = this.CELL_TYPES.PATH;
        
        // Define directions: north, south, east, west
        const directions = [
            { dx: 0, dy: -2, name: 'north' },
            { dx: 0, dy: 2, name: 'south' },
            { dx: 2, dy: 0, name: 'east' },
            { dx: -2, dy: 0, name: 'west' }
        ];
        
        // Shuffle directions for randomness
        this.shuffleArray(directions);
        
        for (const dir of directions) {
            const newX = x + dir.dx;
            const newY = y + dir.dy;
            
            // Check if the new position is within bounds and is a wall
            if (this.isValidPosition(newX, newY) && this.maze[newY][newX] === this.CELL_TYPES.WALL) {
                // Carve path between current and new position
                this.maze[y + dir.dy / 2][x + dir.dx / 2] = this.CELL_TYPES.PATH;
                this.generatePath(newX, newY);
            }
        }
    }

    // Shuffle array using Fisher-Yates algorithm
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Check if position is within maze bounds
    isValidPosition(x, y) {
        return x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1;
    }

    // Get maze cell at position
    getCell(x, y) {
        if (!this.isValidPosition(x, y)) {
            return this.CELL_TYPES.WALL;
        }
        return this.maze[y][x];
    }

    // Check if position is a wall
    isWall(x, y) {
        return this.getCell(x, y) === this.CELL_TYPES.WALL;
    }

    // Check if position is the exit
    isExit(x, y) {
        return x === this.exit.x && y === this.exit.y;
    }

    // Check if player has reached the exit
    hasReachedExit() {
        return this.player.x === this.exit.x && this.player.y === this.exit.y;
    }

    // Move player in specified direction
    movePlayer(direction) {
        const directions = {
            'north': { dx: 0, dy: -1 },
            'south': { dx: 0, dy: 1 },
            'east': { dx: 1, dy: 0 },
            'west': { dx: -1, dy: 0 }
        };

        const dir = directions[direction];
        if (!dir) return false;

        const newX = this.player.x + dir.dx;
        const newY = this.player.y + dir.dy;

        // Check if move is valid
        if (this.isValidMove(newX, newY)) {
            // Mark current position as visited
            this.visited[this.player.y][this.player.x] = true;
            
            // Update maze to show visited path
            if (!this.isExit(this.player.x, this.player.y)) {
                this.maze[this.player.y][this.player.x] = this.CELL_TYPES.VISITED;
            }
            
            // Move player
            this.player.x = newX;
            this.player.y = newY;
            
            // Update maze to show player
            if (!this.isExit(newX, newY)) {
                this.maze[newY][newX] = this.CELL_TYPES.PLAYER;
            }
            
            return true;
        }
        
        return false;
    }

    // Check if move is valid
    isValidMove(x, y) {
        return this.isValidPosition(x, y) && !this.isWall(x, y);
    }

    // Get available moves from current position
    getAvailableMoves() {
        const moves = [];
        const directions = ['north', 'south', 'east', 'west'];
        
        for (const direction of directions) {
            const dir = {
                'north': { dx: 0, dy: -1 },
                'south': { dx: 0, dy: 1 },
                'east': { dx: 1, dy: 0 },
                'west': { dx: -1, dy: 0 }
            }[direction];
            
            const newX = this.player.x + dir.dx;
            const newY = this.player.y + dir.dy;
            
            if (this.isValidMove(newX, newY)) {
                moves.push(direction);
            }
        }
        
        return moves;
    }

    // Get wall directions around player
    getWallDirections() {
        const walls = [];
        const directions = ['north', 'south', 'east', 'west'];
        
        for (const direction of directions) {
            const dir = {
                'north': { dx: 0, dy: -1 },
                'south': { dx: 0, dy: 1 },
                'east': { dx: 1, dy: 0 },
                'west': { dx: -1, dy: 0 }
            }[direction];
            
            const newX = this.player.x + dir.dx;
            const newY = this.player.y + dir.dy;
            
            if (this.isWall(newX, newY)) {
                walls.push(direction);
            }
        }
        
        return walls;
    }

    // Calculate distance to exit
    getDistanceToExit() {
        const dx = this.exit.x - this.player.x;
        const dy = this.exit.y - this.player.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Get direction to exit
    getDirectionToExit() {
        const dx = this.exit.x - this.player.x;
        const dy = this.exit.y - this.player.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 'east' : 'west';
        } else {
            return dy > 0 ? 'south' : 'north';
        }
    }

    // Get detailed exit information for audio cues
    getExitInfo() {
        const distance = this.getDistanceToExit();
        const direction = this.getDirectionToExit();
        
        // Calculate angle to exit
        const dx = this.exit.x - this.player.x;
        const dy = this.exit.y - this.player.y;
        const angle = Math.atan2(dy, dx);
        
        return {
            distance: distance,
            direction: direction,
            angle: angle,
            isNearby: distance < 3,
            isVisible: this.hasLineOfSightToExit()
        };
    }

    // Check if player has line of sight to exit
    hasLineOfSightToExit() {
        const dx = this.exit.x - this.player.x;
        const dy = this.exit.y - this.player.y;
        
        // Check horizontal line of sight
        if (dy === 0) {
            const step = dx > 0 ? 1 : -1;
            for (let x = this.player.x + step; x !== this.exit.x; x += step) {
                if (this.isWall(x, this.player.y)) return false;
            }
            return true;
        }
        
        // Check vertical line of sight
        if (dx === 0) {
            const step = dy > 0 ? 1 : -1;
            for (let y = this.player.y + step; y !== this.exit.y; y += step) {
                if (this.isWall(this.player.x, y)) return false;
            }
            return true;
        }
        
        return false;
    }

    // Get accessibility description of current position
    getPositionDescription() {
        const availableMoves = this.getAvailableMoves();
        const wallDirections = this.getWallDirections();
        const exitInfo = this.getExitInfo();
        
        let description = `You are at position ${this.player.x}, ${this.player.y}. `;
        
        // Describe available moves
        if (availableMoves.length === 0) {
            description += "You are trapped with no available moves. ";
        } else if (availableMoves.length === 1) {
            description += `You can move ${availableMoves[0]}. `;
        } else {
            description += `You can move ${availableMoves.slice(0, -1).join(', ')} and ${availableMoves[availableMoves.length - 1]}. `;
        }
        
        // Describe walls
        if (wallDirections.length > 0) {
            description += `There are walls to the ${wallDirections.join(', ')}. `;
        }
        
        // Describe exit proximity
        if (exitInfo.isNearby) {
            description += "The exit is nearby. ";
        } else {
            description += `The exit is ${Math.round(exitInfo.distance)} steps away. `;
        }
        
        // Describe exit direction
        if (exitInfo.isVisible) {
            description += `You can see the exit to the ${exitInfo.direction}. `;
        } else {
            description += `The exit is generally to the ${exitInfo.direction}. `;
        }
        
        return description;
    }

    // Reset maze to initial state
    resetMaze() {
        // Reset player position - handle case where player might be on exit
        if (this.isExit(this.player.x, this.player.y)) {
            this.maze[this.player.y][this.player.x] = this.CELL_TYPES.EXIT;
        } else {
            this.maze[this.player.y][this.player.x] = this.CELL_TYPES.PATH;
        }
        
        // Reset player to starting position
        this.player = { x: 1, y: 1 };
        this.maze[this.player.y][this.player.x] = this.CELL_TYPES.PLAYER;
        
        // Reset visited array
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.visited[y][x] = false;
            }
        }
        
        // Ensure exit is still marked
        this.maze[this.exit.y][this.exit.x] = this.CELL_TYPES.EXIT;
    }

    // Get maze statistics
    getMazeStats() {
        let pathCells = 0;
        let wallCells = 0;
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.maze[y][x] === this.CELL_TYPES.WALL) {
                    wallCells++;
                } else {
                    pathCells++;
                }
            }
        }
        
        return {
            width: this.width,
            height: this.height,
            totalCells: this.width * this.height,
            pathCells: pathCells,
            wallCells: wallCells,
            difficulty: this.difficulty,
            playerPosition: { ...this.player },
            exitPosition: { ...this.exit }
        };
    }

    // Export maze data for saving/loading
    exportMaze() {
        return {
            maze: this.maze,
            player: this.player,
            exit: this.exit,
            visited: this.visited,
            width: this.width,
            height: this.height,
            difficulty: this.difficulty
        };
    }

    // Import maze data
    importMaze(data) {
        this.maze = data.maze;
        this.player = data.player;
        this.exit = data.exit;
        this.visited = data.visited;
        this.width = data.width;
        this.height = data.height;
        this.difficulty = data.difficulty;
    }
}

// Create global maze generator instance
window.mazeGenerator = new MazeGenerator(); 