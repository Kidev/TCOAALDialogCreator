const dialogFramework = new DialogFramework();

function openEditor() {
    document.getElementById('editorOverlay').classList.add('active');

    const blocker = document.getElementById('interactionBlocker');
    if (blocker) {
        blocker.classList.add('active');
    }

    if (typeof dialogFramework !== 'undefined' && dialogFramework.scenes.length > 0) {
        const extractedData = {
            config: {
                showControls: dialogFramework.config ? dialogFramework.config.showControls : false,
                showDebug: dialogFramework.config ? dialogFramework.config.showDebug : false
            },
            characters: dialogFramework.characters || {},
            glitchConfig: dialogFramework.glitchConfig || {
                scrambledColor: '#000000',
                realColor: '#ffffff',
                changeSpeed: 50,
                realProbability: 5,
                autoStart: true,
                charsAllowed: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            },
            scenes: dialogFramework.scenes || []
        };

        loadProjectData(extractedData);
        window.lastProjectData = extractedData;
    } else if (window.lastProjectData) {
        loadProjectData(window.lastProjectData);
    }
}

function closeEditor() {
    document.getElementById('editorOverlay').classList.remove('active');

    const blocker = document.getElementById('interactionBlocker');
    if (blocker) {
        blocker.classList.remove('active');
    }
}

async function runSequence() {
    window.lastProjectData = JSON.parse(JSON.stringify(projectData));

    dialogFramework.reset();
    dialogFramework.scenes = [];

    dialogFramework.setConfig(projectData.config);
    dialogFramework.setCharacters(projectData.characters);
    dialogFramework.setGlitchConfig(projectData.glitchConfig);

    projectData.scenes.forEach(scene => {
        dialogFramework.addScene(scene);
    });

    showLoadingIndicator('Preloading assets...');
    console.log('Preloading assets for smooth playback...');
    await dialogFramework.preloadAssets();
    hideLoadingIndicator();

    closeEditor();
    dialogFramework.start();
}

function downloadSequence() {
    generateCode();
    const code = document.getElementById('outputCode').value;

    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'sequence.js';
    a.click();

    URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', async function() {
    createLoadingIndicator();

    if (typeof setupScene === 'function') {
        setupScene();

        showLoadingIndicator('Initializing assets...');
        console.log('Initializing and preloading assets...');
        await dialogFramework.preloadAssets();
        hideLoadingIndicator();
        console.log('Ready to play!');

        dialogFramework.updateDebugInfo();
    } else if (typeof setupScenes === 'function') {
        setupScenes();

        showLoadingIndicator('Initializing assets...');
        console.log('Initializing and preloading assets...');
        await dialogFramework.preloadAssets();
        hideLoadingIndicator();
        console.log('Ready to play!');

        dialogFramework.updateDebugInfo();
    } else {
        console.warn('No setup function found in sequence.js. Please define setupScene()');

        dialogFramework.updateDebugInfo();
    }
});

function createLoadingIndicator() {
    if (!document.getElementById('loadingIndicator')) {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loadingIndicator';
        loadingDiv.className = 'loading-indicator';
        loadingDiv.innerHTML = `
        <div class="loading-spinner"></div>
        <span id="loadingText">Loading...</span>
        `;
        document.body.appendChild(loadingDiv);
    }
}

function showLoadingIndicator(text = 'Loading...') {
    const indicator = document.getElementById('loadingIndicator');
    const textElement = document.getElementById('loadingText');
    if (indicator && textElement) {
        textElement.textContent = text;
        indicator.classList.add('active');
    }
}

function hideLoadingIndicator() {
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) {
        indicator.classList.remove('active');
    }
}
