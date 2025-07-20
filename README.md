# SoundMaze 🎵

An audio-guided maze game designed specifically for visually impaired children aged 6-12.

## Game Overview

SoundMaze is a web-based maze navigation game that uses spatial audio cues and keyboard controls to help visually impaired children develop spatial awareness and problem-solving skills. Players navigate through a maze using only sound feedback and keyboard input, making it fully accessible without requiring visual cues.

### Key Features

- **Audio-based guidance**: Directional sound cues indicate walls, exits, and navigation hints
- **Speech synthesis guidance**: Spoken directions and navigation assistance
- **Idle assistance**: Automatic guidance after 5 seconds of inactivity
- **Keyboard-only controls**: Fully accessible navigation using arrow keys and spacebar
- **Spatial audio feedback**: 3D audio positioning for immersive navigation experience
- **Progressive difficulty**: Multiple maze levels with increasing complexity
- **Haptic feedback support**: Vibration feedback for supported devices
- **Screen reader compatible**: Full ARIA support and semantic HTML structure
- **Smart direction suggestions**: AI-powered navigation recommendations
- **Customizable settings**: Adjustable audio, speech, and guidance preferences

## How to Run Locally

### Prerequisites
- Modern web browser with audio support
- No additional software installation required

### Quick Start
1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/soundmaze.git
   cd soundmaze
   ```

2. Open `index.html` in your web browser:
   - Double-click the `index.html` file, or
   - Drag and drop `index.html` into your browser window, or
   - Use a local server for best experience:
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Using Node.js (if you have it installed)
     npx serve .
     ```

3. Navigate to `http://localhost:8000` in your browser

### Controls

- **Arrow Keys** or **WASD**: Move the player character
- **Spacebar**: Confirm actions, restart level
- **Enter**: Start game, select menu options
- **Escape**: Pause game, return to menu
- **R**: Restart current level
- **M**: Toggle audio on/off
- **G**: Request directional guidance (works even when paused)

## How to Deploy

### GitHub Pages (Recommended)
1. Push your code to a GitHub repository
2. Go to repository Settings > Pages
3. Select source branch (usually `main` or `master`)
4. Your game will be available at `https://yourusername.github.io/repository-name`

### Netlify
1. Drag and drop the project folder to [Netlify](https://netlify.com)
2. Your game will be deployed automatically

### Vercel
1. Connect your GitHub repository to [Vercel](https://vercel.com)
2. Deploy with default settings

## Accessibility Highlights

### Audio Accessibility
- **Spatial audio cues**: Directional sounds help players understand their position
- **Speech synthesis guidance**: Spoken directions and navigation assistance
- **Idle assistance**: Automatic guidance after 5 seconds of inactivity
- **Clear audio feedback**: Distinct sounds for walls, exits, and movement
- **Adjustable volume**: Audio controls for different hearing abilities
- **Audio descriptions**: Verbal cues for game state and navigation
- **Smart direction suggestions**: AI-powered recommendations based on exit location

### Keyboard Accessibility
- **Full keyboard navigation**: No mouse required
- **Logical tab order**: Screen readers can navigate all elements
- **Keyboard shortcuts**: Quick access to common actions
- **Escape key support**: Easy way to exit or pause

### Screen Reader Support
- **Semantic HTML**: Proper heading structure and landmarks
- **ARIA labels**: Descriptive labels for all interactive elements
- **Live regions**: Dynamic content updates announced to screen readers
- **Focus management**: Clear focus indicators and logical flow

### Cognitive Accessibility
- **Simple controls**: Easy-to-learn keyboard commands
- **Consistent feedback**: Predictable audio responses
- **Error prevention**: Clear warnings before irreversible actions
- **Progressive disclosure**: Information revealed as needed
- **Idle assistance**: Prevents frustration by providing help when stuck
- **Smart guidance**: Context-aware suggestions reduce cognitive load

## Technical Features

- **Web Audio API**: High-quality spatial audio implementation
- **Speech Synthesis API**: Natural language guidance and feedback
- **Responsive design**: Works on desktop and tablet devices
- **Progressive Web App**: Can be installed on supported devices
- **Offline support**: Game works without internet connection
- **Cross-browser compatibility**: Works on Chrome, Firefox, Safari, Edge
- **Idle detection system**: Smart timing for assistance prompts
- **Maze generation algorithm**: Procedural maze creation with guaranteed solutions

## Contributing

We welcome contributions to make SoundMaze even more accessible! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Game Features in Detail

### 🎯 Directional Assistance
- **Automatic guidance**: After 5 seconds of inactivity, the game provides spoken directions
- **Manual guidance**: Press 'G' anytime to request help
- **Smart suggestions**: AI-powered recommendations based on exit location
- **Wall collision feedback**: Clear audio and speech feedback when hitting walls

### 🎵 Audio Experience
- **Spatial audio**: 3D positioning for immersive navigation
- **Speech synthesis**: Natural language guidance and feedback
- **Customizable settings**: Adjust volume, speed, and guidance preferences
- **Haptic feedback**: Vibration support for mobile devices

### 🎮 Gameplay
- **Progressive difficulty**: Easy, Medium, and Hard levels
- **Multiple controls**: Arrow keys, WASD, or custom key mappings
- **Pause and resume**: Full game state preservation
- **Statistics tracking**: Moves, time, and completion data

## Support

If you encounter any accessibility issues or have suggestions for improvements, please open an issue on GitHub or contact us at [surajpmnr@gmail.com].

## Development

### Debugging Tools
Open the browser console (F12) and use these commands:
- `testRestart()` - Test the restart functionality
- `debugSoundMaze()` - Get detailed debug information
- `getSoundMazeStatus()` - Check application status


## Demo
<a href="https://youtu.be/BK2tvgdei1E" alt="Demo Video"> Youtube Video </a>
---

**Made with ❤️ for visually impaired children everywhere** 
