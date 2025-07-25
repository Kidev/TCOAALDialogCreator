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

function runSequence() {
    window.lastProjectData = JSON.parse(JSON.stringify(projectData));

    dialogFramework.reset();
    dialogFramework.scenes = [];

    dialogFramework.setConfig(projectData.config);
    dialogFramework.setCharacters(projectData.characters);
    dialogFramework.setGlitchConfig(projectData.glitchConfig);

    projectData.scenes.forEach(scene => {
        dialogFramework.addScene(scene);
    });

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

document.addEventListener('DOMContentLoaded', function() {
    if (typeof setupScene === 'function') {
        setupScene();
    } else if (typeof setupScenes === 'function') {
        setupScenes();
    } else {
        console.warn('No setup function found in sequence.js. Please define setupScene()');
    }
});
