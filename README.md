# TCOAAL Easy Dialog Creator

A powerful, feature-rich dialog system for creating dialogs in the style of [_The Coffin of Andy and Leyley_](https://store.steampowered.com/app/2378900/The_Coffin_of_Andy_and_Leyley/) (by *Nemlei*) with advanced visual effects, character management, and smooth transitions. Written in pure JS, requires only a browser to use.

## Features

### Character System
- Define characters with custom colors
- Automatic CSS generation for character styling
- Speaker name display with optional glitch censoring
- Quoted dialog for character speech

### Image Management
- Background image transitions with customizable fade times
- Crossfade effects for smooth image transitions
- Instant image switching support
- Automatic image cleanup and memory management

### Transitions
- Configurable fade-in/fade-out times for both dialog and images
- Independent delay controls for precise timing
- Crossfade support using negative fade times
- Instant transitions (0ms fade times)

### Audio
- Sound effects with volume control
- Delayed sound playback
- HTML5 Audio with local file support
- Automatic audio loading and caching

### Visual Effects
- Glitch text effects for speakers and dialog
- Configurable glitch parameters (speed, colors, characters)
- Smooth typing animation with adjustable speed
- Text wrapping and multi-line support

### Controls
- Keyboard controls (Spacebar for next/skip)
- Mouse click support
- Skip typing animation
- Scene navigation and jumping
- Reset functionality

### Developer Tools
- Debug information display
- Scene counter
- Control panel (can be hidden)

## Quick Start

To create custom dialogs, you just need to edit [`js/sequence.js`](./js/sequence.js). It contains an example.

### 1. Basic Setup

```javascript
function setupScene() {
    // Configure the framework
    dialogFramework.setConfig({
        showControls: false,  // Hide control buttons
        showDebug: false  // Hide debug info
    });

    // Start the sequence automatically (otherwise you need to click/press space)
    dialogFramework.start();
}
```

### 2. Character Configuration

```javascript
dialogFramework.setCharacters({
    'Alice': {
        color: '#ff6b6b'  // Red text for Alice
    },
    'Bob': {
        color: '#4ecdc4'  // Teal text for Bob
    }
});
```

### 3. Glitch Effect Configuration

```javascript
dialogFramework.setGlitchConfig({
    scrambledColor: '#000000',  // Color for scrambled characters
    realColor: '#ffffff',  // Color for real characters
    changeSpeed: 50,  // How fast characters change (ms)
    realProbability: 5,  // % chance to show real character
    autoStart: true,  // Start glitch automatically
    charsAllowed: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'
});
```

## Scene Creation

### Basic Scene

```javascript
dialogFramework.addScene({
    image: 'background1.png',  // Background image (in img/ folder)
    speaker: 'Alice',  // Character name
    text: 'Hello! How are you today?'
});
```

### Advanced Scene with Timing

```javascript
dialogFramework.addScene({
    image: 'forest.png',  // Background image, can be animated
    speaker: 'Bob',
    text: 'The forest looks mysterious tonight...',
    
    // Busts
    bustLeft: 'andrew_happy.png',  // Image displayed as left speaker bust
    bustRight: 'ashley_laugh.png',  // Image displayed as right speaker bust
    bustFade: 0,  // Fade in and fade out time used for busts

    // Dialog timing
    dialogFadeInTime: 500,  // Fade in dialog over 500ms
    dialogFadeOutTime: 300,  // Fade out dialog over 300ms
    dialogDelayIn: 1000,  // Wait 1s before showing dialog
    dialogDelayOut: 0,  // No delay before fadeOut dialog

    // Image timing
    imageFadeInTime: 800,  // Fade in image over 800ms
    imageFadeOutTime: 400,  // Fade out image over 400ms
    imageDelayIn: 0,  // Show image immediately
    imageDelayOut: 200,  // Wait 200ms before fadeOut image

    // Audio
    sound: 'forest_ambience.mp3',  // Sound file (in sounds/ folder)
    soundVolume: 0.7,  // 70% volume
    soundDelay: 500,  // Wait 500ms before playing

    // Speaker effects
    censorSpeaker: true,  // Apply glitch effect to speaker name
    
    // Shake effect
    shake: false,  // Apply shake or not at beginning of scene
    shakeDelay: 0,  // Delay after beginning of scene to shake
    shakeIntensity: 1,  // Intensity of the shake, 1 is default, 0.5 is half as strong...
    shakeDuration: 500  // Duration of the shake
});
```

### Crossfade Effects

Use negative fade times to create smooth crossfades between images. Here, the fade out of the image of scene 1 will overlap with the fade in of the image of scene 2, creating a smooth transition over 1 second.

```javascript
// Scene 1
dialogFramework.addScene({
    image: 'day.png',
    speaker: 'Alice',
    text: 'As the day begins...',
    imageFadeOutTime: -1000  // Negative = prepare for crossfade
});

// Scene 2
dialogFramework.addScene({
    image: 'night.png',
    speaker: 'Alice', 
    text: 'Night falls quickly.',
    imageFadeInTime: -1000  // Negative = crossfade from previous
});
```

### Scene Without Image

```javascript
dialogFramework.addScene({
    image: null,  // No background image
    speaker: '',  // No speaker (narrator text)
    text: 'The screen fades to black...'
});
```

## Chaining Scenes

Scenes can be chained together for fluent syntax:

```javascript
dialogFramework
    .addScene({
        image: 'intro.png',
        speaker: 'Alice',
        text: 'Welcome to our story!'
    })
    .addScene({
        image: 'chapter1.png', 
        speaker: 'Bob',
        text: 'Let me show you around.'
    })
    .addScene({
        speaker: 'Alice',
        text: 'This is going to be exciting!'
    });
```

## Control Methods

### Playback Control

```javascript
dialogFramework.start();  // Start from beginning
dialogFramework.next();  // Advance to next scene
dialogFramework.reset();  // Reset to beginning
dialogFramework.skipText();  // Skip current typing animation
```

### Scene Navigation

```javascript
dialogFramework.jumpToScene(5);  // Jump to scene 5
let current = dialogFramework.getCurrentScene();  // Get current scene index
```

### Configuration

```javascript
dialogFramework.setTypeSpeed(30);  // Set typing speed (ms per character)
```

## File Structure

```
project/
├── tcoaal.html  # Main HTML file
├── style.css  # Styling
├── js/
│   ├── dialog.js  # Core framework
│   └── sequence.js  # Your scene definitions
├── img/  # Background images
│   ├── background1.png
│   └── forest.png
├── sounds/  # Audio files
│   ├── forest_ambience.mp3
│   └── button_click.wav
└── fonts/
    └── Faustina-Regular.ttf  # Custom font
```

## Keyboard Controls

- **Spacebar**: Advance to next scene or skip typing
- **Click**: Same as spacebar (click outside controls)

## Scene Timing Examples

### Instant Transitions
```javascript
.addScene({
    image: 'fast.png',
    text: 'This appears instantly!',
    dialogFadeInTime: 0,
    imageFadeInTime: 0
})
```

### Slow, Dramatic Entrance
```javascript
.addScene({
    image: 'dramatic.png',
    speaker: 'Villain',
    text: 'At last... we meet again.',
    dialogFadeInTime: 2000,  // 2 second fade
    imageFadeInTime: 3000,  // 3 second fade
    dialogDelayIn: 1000,  // Wait 1 second
    censorSpeaker: true  // Glitchy speaker name
})
```

### Complex Sequence with Audio
```javascript
.addScene({
    image: 'explosion.png',
    speaker: '',
    text: 'BOOM!',
    sound: 'explosion.mp3',
    soundVolume: 1.0,
    soundDelay: 0,
    imageFadeInTime: 100,  // Quick flash
    dialogFadeInTime: 50,
    dialogFadeOutTime: 200,
    imageFadeOutTime: 500
})
```

## Browser Compatibility

- Modern browsers support
- HTML5 Audio support for sound effects
- CSS3 transitions for animations
- Local file access for development

## Getting Started

1. Copy all files to your project directory
2. Edit `js/sequence.js` to create your scenes (already contains an example)
3. Add your images to the `img/` folder
4. Add your sounds to the `sounds/` folder
5. Open `tcoaal.html` in your browser

## Tips

- Use negative fade times for smooth crossfades
- Set `censorSpeaker: false` for clear speaker names
- Combine delays and fade times for complex timing
- Use empty speaker `''` for narrator text
- Set `image: null` for dialog-only scenes
- Chain multiple `addScene()` calls for cleaner code
