let projectData = {
    config: {
        showControls: false,
        showDebug: false
    },
    characters: {},
    glitchConfig: {
        scrambledColor: '#000000',
        realColor: '#ffffff',
        changeSpeed: 50,
        realProbability: 5,
        autoStart: true,
        charsAllowed: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    },
    scenes: []
};

let imageMap = new Map();
let soundMap = new Map();
let expandedScenes = new Set();
let currentlyPlayingAudio = null;

function toggleSection(button) {
    button.classList.toggle('active');
    const content = button.nextElementSibling;
    if (content.style.display === 'block') {
        content.style.display = 'none';
    } else {
        content.style.display = 'block';
    }
}

function addCharacter() {
    const name = document.getElementById('newCharacterName').value.trim();
    const color = document.getElementById('newCharacterColor').value;

    if (!name) {
        alert('Please enter a character name');
        return;
    }

    if (projectData.characters[name]) {
        alert('Character already exists');
        return;
    }

    projectData.characters[name] = { color };
    document.getElementById('newCharacterName').value = '';
    updateCharactersList();
}

function updateCharactersList() {
    const container = document.getElementById('charactersList');
    container.innerHTML = '';

    Object.entries(projectData.characters).forEach(([name, data]) => {
        const item = document.createElement('div');
        item.className = 'character-item';
        item.innerHTML = `
            <div class="character-header">
                <span>${name}</span>
                <div>
                    <input type="color" value="${data.color}" onchange="updateCharacterColor('${name}', this.value)">
                    <button class="danger" onclick="deleteCharacter('${name}')">Delete</button>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

function updateCharacterColor(name, color) {
    projectData.characters[name].color = color;
}

function deleteCharacter(name) {
    if (confirm(`Delete character "${name}"?`)) {
        delete projectData.characters[name];
        updateCharactersList();
    }
}

function addScene() {
    const scene = {
        image: '',
        speaker: '',
        text: '',
        dialogFadeInTime: 200,
        dialogFadeOutTime: 200,
        imageFadeInTime: 200,
        imageFadeOutTime: 200,
        dialogDelayIn: 500,
        dialogDelayOut: 0,
        imageDelayIn: 0,
        imageDelayOut: 0,
        sound: null,
        soundVolume: 1.0,
        soundDelay: 0,
        censorSpeaker: true,
        bustLeft: null,
        bustRight: null,
        bustFade: 0,
        shake: false,
        shakeDelay: 0,
        shakeIntensity: 1,
        shakeDuration: 500
    };

    projectData.scenes.push(scene);
    const newIndex = projectData.scenes.length - 1;
    expandedScenes.add(newIndex);
    updateScenesList();
}

function updateScenesList() {
    const container = document.getElementById('scenesList');
    container.innerHTML = '';

    projectData.scenes.forEach((scene, index) => {
        const item = document.createElement('div');
        item.className = 'scene-item';

        const speakerOptions = ['', ...Object.keys(projectData.characters)].map(
            char => `<option value="${char}" ${scene.speaker === char ? 'selected' : ''}>${char || '(None)'}</option>`
        ).join('');

        const preview = scene.text ? scene.text.substring(0, 50) + (scene.text.length > 50 ? '...' : '') : '(No text)';
        const isExpanded = expandedScenes.has(index);

        item.innerHTML = `
            <div class="scene-item-header">
                <button class="collapsible ${isExpanded ? 'active' : ''}" onclick="toggleScene(${index})">
                    Scene ${index + 1} - ${scene.speaker || '(No speaker)'}
                    <span class="preview-text">"${preview}"</span>
                </button>
                <div class="scene-action-buttons">
                    <button onclick="moveScene(${index}, -1)">↑</button>
                    <button onclick="moveScene(${index}, 1)">↓</button>
                    <button onclick="duplicateScene(${index})">Duplicate</button>
                    <button class="danger" onclick="deleteScene(${index})">Delete</button>
                </div>
            </div>
            <div class="collapsible-content" style="display: ${isExpanded ? 'block' : 'none'};">
                <div class="scene-content">
                    <!-- Basic Settings -->
                    <div class="scene-group">
                        <h4>Basic Settings</h4>
                        <div class="form-group">
                            <label>Speaker:</label>
                            <select onchange="updateSceneValue(${index}, 'speaker', this.value)">${speakerOptions}</select>
                        </div>
                        <div class="form-group">
                            <label>Censor Speaker:</label>
                            <input type="checkbox" ${scene.censorSpeaker ? 'checked' : ''}
                                onchange="updateSceneValue(${index}, 'censorSpeaker', this.checked)">
                        </div>
                        <div class="form-group">
                            <label>Text:</label>
                            <textarea rows="3" onchange="updateSceneValue(${index}, 'text', this.value)">${scene.text || ''}</textarea>
                        </div>
                    </div>

                    <!-- Visual Assets -->
                    <div class="scene-group">
                        <h4>Visual Assets</h4>
                        <div class="form-group">
                            <input type="checkbox" class="null-checkbox"
                                ${scene.image !== null ? 'checked' : ''}
                                onchange="toggleNull(${index}, 'image', !this.checked)"
                                title="Uncheck to disable this parameter">
                            <label>Background Image:</label>
                            <div class="file-input-wrapper">
                                <input type="file" accept="image/*"
                                    onchange="handleImageUpload(${index}, 'image', this)"
                                    ${scene.image === null ? 'disabled' : ''}>
                                <span class="file-name">${scene.image || ''}</span>
                            </div>
                        </div>
                        ${scene.image && scene.image !== null ? `
                            <div class="preview-container">
                                <img src="${getImageSrc(index, 'image')}" class="image-preview">
                            </div>
                        ` : ''}

                        <div class="form-group">
                            <input type="checkbox" class="null-checkbox"
                                ${scene.bustLeft !== null ? 'checked' : ''}
                                onchange="toggleNull(${index}, 'bustLeft', !this.checked)"
                                title="Uncheck to disable this parameter">
                            <label>Bust Left:</label>
                            <div class="file-input-wrapper">
                                <input type="file" accept="image/*"
                                    onchange="handleImageUpload(${index}, 'bustLeft', this)"
                                    ${scene.bustLeft === null ? 'disabled' : ''}>
                                <span class="file-name">${scene.bustLeft || ''}</span>
                            </div>
                        </div>
                        ${scene.bustLeft && scene.bustLeft !== null ? `
                            <div class="preview-container">
                                <img src="${getImageSrc(index, 'bustLeft')}" class="image-preview">
                            </div>
                        ` : ''}

                        <div class="form-group">
                            <input type="checkbox" class="null-checkbox"
                                ${scene.bustRight !== null ? 'checked' : ''}
                                onchange="toggleNull(${index}, 'bustRight', !this.checked)"
                                title="Uncheck to disable this parameter">
                            <label>Bust Right:</label>
                            <div class="file-input-wrapper">
                                <input type="file" accept="image/*"
                                    onchange="handleImageUpload(${index}, 'bustRight', this)"
                                    ${scene.bustRight === null ? 'disabled' : ''}>
                                <span class="file-name">${scene.bustRight || ''}</span>
                            </div>
                        </div>
                        ${scene.bustRight && scene.bustRight !== null ? `
                            <div class="preview-container">
                                <img src="${getImageSrc(index, 'bustRight')}" class="image-preview">
                            </div>
                        ` : ''}

                        <div class="form-group">
                            <label>Bust Fade Time:</label>
                            <input type="number" value="${scene.bustFade}" min="0" max="5000"
                                onchange="updateSceneValue(${index}, 'bustFade', parseInt(this.value))">
                        </div>
                    </div>

                    <!-- Audio -->
                    <div class="scene-group">
                        <h4>Audio</h4>
                        <div class="form-group">
                            <input type="checkbox" class="null-checkbox"
                                ${scene.sound !== null ? 'checked' : ''}
                                onchange="toggleNull(${index}, 'sound', !this.checked)"
                                title="Uncheck to disable this parameter">
                            <label>Sound:</label>
                            <div class="file-input-wrapper">
                                <input type="file" accept="audio/*"
                                    onchange="handleSoundUpload(${index}, this)"
                                    ${scene.sound === null ? 'disabled' : ''}>
                                <span class="file-name">${scene.sound || ''}</span>
                            </div>
                        </div>
                        ${scene.sound && scene.sound !== null ? `
                            <div class="preview-container">
                                <div class="sound-preview">
                                    <button class="play-button" id="sound-button-${index}" onclick="toggleSound(${index})">▶ Play</button>
                                    <span>${scene.sound}</span>
                                </div>
                            </div>
                        ` : ''}
                        <div class="form-group">
                            <label>Sound Volume:</label>
                            <input type="number" value="${scene.soundVolume}" min="0" max="1" step="0.1"
                                onchange="updateSceneValue(${index}, 'soundVolume', parseFloat(this.value))">
                        </div>
                        <div class="form-group">
                            <label>Sound Delay:</label>
                            <input type="number" value="${scene.soundDelay}" min="0" max="10000"
                                onchange="updateSceneValue(${index}, 'soundDelay', parseInt(this.value))">
                        </div>
                    </div>

                    <!-- Timing -->
                    <div class="scene-group">
                        <h4>Timing</h4>
                        <div class="two-column">
                            <div class="form-group">
                                <label>Dialog Fade In:</label>
                                <input type="number" value="${scene.dialogFadeInTime}" min="-5000" max="5000"
                                    onchange="updateSceneValue(${index}, 'dialogFadeInTime', parseInt(this.value))">
                            </div>
                            <div class="form-group">
                                <label>Dialog Fade Out:</label>
                                <input type="number" value="${scene.dialogFadeOutTime}" min="-5000" max="5000"
                                    onchange="updateSceneValue(${index}, 'dialogFadeOutTime', parseInt(this.value))">
                            </div>
                            <div class="form-group">
                                <label>Dialog Delay In:</label>
                                <input type="number" value="${scene.dialogDelayIn}" min="0" max="10000"
                                    onchange="updateSceneValue(${index}, 'dialogDelayIn', parseInt(this.value))">
                            </div>
                            <div class="form-group">
                                <label>Dialog Delay Out:</label>
                                <input type="number" value="${scene.dialogDelayOut}" min="0" max="10000"
                                    onchange="updateSceneValue(${index}, 'dialogDelayOut', parseInt(this.value))">
                            </div>
                            <div class="form-group">
                                <label>Image Fade In:</label>
                                <input type="number" value="${scene.imageFadeInTime}" min="-5000" max="5000"
                                    onchange="updateSceneValue(${index}, 'imageFadeInTime', parseInt(this.value))">
                            </div>
                            <div class="form-group">
                                <label>Image Fade Out:</label>
                                <input type="number" value="${scene.imageFadeOutTime}" min="-5000" max="5000"
                                    onchange="updateSceneValue(${index}, 'imageFadeOutTime', parseInt(this.value))">
                            </div>
                            <div class="form-group">
                                <label>Image Delay In:</label>
                                <input type="number" value="${scene.imageDelayIn}" min="0" max="10000"
                                    onchange="updateSceneValue(${index}, 'imageDelayIn', parseInt(this.value))">
                            </div>
                            <div class="form-group">
                                <label>Image Delay Out:</label>
                                <input type="number" value="${scene.imageDelayOut}" min="0" max="10000"
                                    onchange="updateSceneValue(${index}, 'imageDelayOut', parseInt(this.value))">
                            </div>
                        </div>
                    </div>

                    <!-- Effects -->
                    <div class="scene-group">
                        <h4>Effects</h4>
                        <div class="form-group">
                            <label>Shake Effect:</label>
                            <input type="checkbox" ${scene.shake ? 'checked' : ''}
                                onchange="updateSceneValue(${index}, 'shake', this.checked)">
                        </div>
                        <div class="form-group">
                            <label>Shake Delay:</label>
                            <input type="number" value="${scene.shakeDelay}" min="0" max="10000"
                                onchange="updateSceneValue(${index}, 'shakeDelay', parseInt(this.value))">
                        </div>
                        <div class="form-group">
                            <label>Shake Intensity:</label>
                            <input type="number" value="${scene.shakeIntensity}" min="0" max="10" step="0.1"
                                onchange="updateSceneValue(${index}, 'shakeIntensity', parseFloat(this.value))">
                        </div>
                        <div class="form-group">
                            <label>Shake Duration:</label>
                            <input type="number" value="${scene.shakeDuration}" min="0" max="5000"
                                onchange="updateSceneValue(${index}, 'shakeDuration', parseInt(this.value))">
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

function toggleScene(index) {
    if (expandedScenes.has(index)) {
        expandedScenes.delete(index);
    } else {
        expandedScenes.add(index);
    }
    updateScenesList();
}

function updateSceneValue(index, field, value) {
    projectData.scenes[index][field] = value;
    generateCode();
}

function getImageSrc(sceneIndex, field) {
    const key = `${sceneIndex}-${field}`;
    const file = imageMap.get(key);
    if (file) {
        return URL.createObjectURL(file);
    }
    return 'img/' + projectData.scenes[sceneIndex][field];
}

function handleImageUpload(sceneIndex, field, input) {
    const file = input.files[0];
    if (file) {
        projectData.scenes[sceneIndex][field] = file.name;
        imageMap.set(`${sceneIndex}-${field}`, file);
        updateScenesList();
        generateCode();
    }
}

function handleSoundUpload(sceneIndex, input) {
    const file = input.files[0];
    if (file) {
        projectData.scenes[sceneIndex].sound = file.name;
        soundMap.set(sceneIndex, file);
        updateScenesList();
        generateCode();
    }
}

function toggleSound(sceneIndex) {
    const button = document.getElementById(`sound-button-${sceneIndex}`);

    // If audio is currently playing
    if (currentlyPlayingAudio && !currentlyPlayingAudio.paused) {
        currentlyPlayingAudio.pause();
        currentlyPlayingAudio = null;

        // Reset all buttons to play state
        document.querySelectorAll('.play-button').forEach(btn => {
            btn.textContent = '▶ Play';
            btn.classList.remove('stop-button');
        });
        return;
    }

    // Play new audio
    const file = soundMap.get(sceneIndex);
    if (file) {
        const url = URL.createObjectURL(file);
        currentlyPlayingAudio = new Audio(url);
        currentlyPlayingAudio.volume = projectData.scenes[sceneIndex].soundVolume;

        // Update button to stop state
        button.textContent = '⬛ Stop';
        button.classList.add('stop-button');

        // Play audio
        currentlyPlayingAudio.play();

        // Reset button when audio ends
        currentlyPlayingAudio.addEventListener('ended', () => {
            button.textContent = '▶ Play';
            button.classList.remove('stop-button');
            currentlyPlayingAudio = null;
        });
    }
}

function toggleNull(sceneIndex, field, isNull) {
    projectData.scenes[sceneIndex][field] = isNull ? null : '';

    // Stop any playing audio when disabling sound
    if (field === 'sound' && isNull && currentlyPlayingAudio) {
        currentlyPlayingAudio.pause();
        currentlyPlayingAudio = null;
    }

    updateScenesList();
    generateCode();
}

function moveScene(index, direction) {
    // Stop any playing audio
    if (currentlyPlayingAudio) {
        currentlyPlayingAudio.pause();
        currentlyPlayingAudio = null;
    }

    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < projectData.scenes.length) {
        const temp = projectData.scenes[index];
        projectData.scenes[index] = projectData.scenes[newIndex];
        projectData.scenes[newIndex] = temp;

        // Move associated files in maps
        const imageKeys = ['image', 'bustLeft', 'bustRight'];
        imageKeys.forEach(key => {
            const oldKey = `${index}-${key}`;
            const newKey = `${newIndex}-${key}`;
            const tempImage = imageMap.get(oldKey);
            imageMap.set(oldKey, imageMap.get(newKey));
            imageMap.set(newKey, tempImage);
        });

        const tempSound = soundMap.get(index);
        soundMap.set(index, soundMap.get(newIndex));
        soundMap.set(newIndex, tempSound);

        // Update expanded state
        const wasExpanded = expandedScenes.has(index);
        const wasNewExpanded = expandedScenes.has(newIndex);
        expandedScenes.delete(index);
        expandedScenes.delete(newIndex);
        if (wasExpanded) expandedScenes.add(newIndex);
        if (wasNewExpanded) expandedScenes.add(index);

        updateScenesList();
        generateCode();
    }
}

function duplicateScene(index) {
    const sceneCopy = JSON.parse(JSON.stringify(projectData.scenes[index]));
    projectData.scenes.splice(index + 1, 0, sceneCopy);

    // Update expanded indices for scenes after the insertion
    const newExpanded = new Set();
    expandedScenes.forEach(i => {
        if (i > index) newExpanded.add(i + 1);
        else newExpanded.add(i);
    });
    expandedScenes = newExpanded;
    expandedScenes.add(index + 1);

    // Update file maps for scenes after the insertion point
    for (let i = projectData.scenes.length - 1; i > index + 1; i--) {
        ['image', 'bustLeft', 'bustRight'].forEach(key => {
            const oldKey = `${i - 1}-${key}`;
            const newKey = `${i}-${key}`;
            if (imageMap.has(oldKey)) {
                imageMap.set(newKey, imageMap.get(oldKey));
            }
        });

        if (soundMap.has(i - 1)) {
            soundMap.set(i, soundMap.get(i - 1));
        }
    }

    // Copy files for the duplicated scene
    ['image', 'bustLeft', 'bustRight'].forEach(key => {
        const sourceKey = `${index}-${key}`;
        const destKey = `${index + 1}-${key}`;
        if (imageMap.has(sourceKey)) {
            imageMap.set(destKey, imageMap.get(sourceKey));
        }
    });

    if (soundMap.has(index)) {
        soundMap.set(index + 1, soundMap.get(index));
    }

    updateScenesList();
    generateCode();
}

function deleteScene(index) {
    if (confirm(`Delete scene ${index + 1}?`)) {
        // Stop any playing audio
        if (currentlyPlayingAudio) {
            currentlyPlayingAudio.pause();
            currentlyPlayingAudio = null;
        }

        projectData.scenes.splice(index, 1);

        // Remove associated files from maps
        imageMap.delete(`${index}-image`);
        imageMap.delete(`${index}-bustLeft`);
        imageMap.delete(`${index}-bustRight`);
        soundMap.delete(index);

        // Update maps for scenes after the deleted one
        for (let i = index; i < projectData.scenes.length; i++) {
            ['image', 'bustLeft', 'bustRight'].forEach(key => {
                const oldKey = `${i + 1}-${key}`;
                const newKey = `${i}-${key}`;
                if (imageMap.has(oldKey)) {
                    imageMap.set(newKey, imageMap.get(oldKey));
                    imageMap.delete(oldKey);
                }
            });

            if (soundMap.has(i + 1)) {
                soundMap.set(i, soundMap.get(i + 1));
                soundMap.delete(i + 1);
            }
        }

        expandedScenes.delete(index);
        // Update expanded indices
        const newExpanded = new Set();
        expandedScenes.forEach(i => {
            if (i > index) newExpanded.add(i - 1);
            else if (i < index) newExpanded.add(i);
        });
        expandedScenes = newExpanded;
        updateScenesList();
        generateCode();
    }
}

function updateConfig() {
    projectData.config.showControls = document.getElementById('configShowControls').checked;
    projectData.config.showDebug = document.getElementById('configShowDebug').checked;
}

function updateGlitchConfig() {
    projectData.glitchConfig = {
        scrambledColor: document.getElementById('glitchScrambledColor').value,
        realColor: document.getElementById('glitchRealColor').value,
        changeSpeed: parseInt(document.getElementById('glitchChangeSpeed').value),
        realProbability: parseInt(document.getElementById('glitchRealProbability').value),
        autoStart: document.getElementById('glitchAutoStart').checked,
        charsAllowed: document.getElementById('glitchCharsAllowed').value
    };
}

function generateCode() {
    updateConfig();
    updateGlitchConfig();

    let code = `// sequence.js
// The setup function will be called automatically when the page loads
function setupScene() {

    dialogFramework
        .setConfig({
            showControls: ${projectData.config.showControls},
            showDebug: ${projectData.config.showDebug}
        });

    dialogFramework
        .setCharacters({
`;

    Object.entries(projectData.characters).forEach(([name, data], index, array) => {
        code += `            '${name}': {
                color: '${data.color}'
            }${index < array.length - 1 ? ',' : ''}\n`;
    });

    code += `        });

    dialogFramework
        .setGlitchConfig({
            scrambledColor: '${projectData.glitchConfig.scrambledColor}',
            realColor: '${projectData.glitchConfig.realColor}',
            changeSpeed: ${projectData.glitchConfig.changeSpeed},
            realProbability: ${projectData.glitchConfig.realProbability},
            autoStart: ${projectData.glitchConfig.autoStart},
            charsAllowed: '${projectData.glitchConfig.charsAllowed}'
        });

    dialogFramework`;

    projectData.scenes.forEach((scene, index) => {
        code += `
        .addScene({
            image: ${scene.image === null ? 'null' : `'${scene.image}'`},
            speaker: '${scene.speaker}',
            text: ${scene.text === null ? 'null' : `"${scene.text.replace(/"/g, '\\"')}"`},
            censorSpeaker: ${scene.censorSpeaker},
            dialogFadeInTime: ${scene.dialogFadeInTime},
            dialogFadeOutTime: ${scene.dialogFadeOutTime},
            imageFadeInTime: ${scene.imageFadeInTime},
            imageFadeOutTime: ${scene.imageFadeOutTime},
            dialogDelayIn: ${scene.dialogDelayIn},
            dialogDelayOut: ${scene.dialogDelayOut},
            imageDelayIn: ${scene.imageDelayIn},
            imageDelayOut: ${scene.imageDelayOut}`;

        if (scene.sound !== null) {
            code += `,
            sound: '${scene.sound}',
            soundVolume: ${scene.soundVolume},
            soundDelay: ${scene.soundDelay}`;
        }

        if (scene.bustLeft !== null) {
            code += `,
            bustLeft: '${scene.bustLeft}'`;
        }

        if (scene.bustRight !== null) {
            code += `,
            bustRight: '${scene.bustRight}'`;
        }

        if (scene.bustLeft !== null || scene.bustRight !== null) {
            code += `,
            bustFade: ${scene.bustFade}`;
        }

        if (scene.shake) {
            code += `,
            shake: true,
            shakeDelay: ${scene.shakeDelay},
            shakeIntensity: ${scene.shakeIntensity},
            shakeDuration: ${scene.shakeDuration}`;
        }

        code += `
        })`;
    });

    code += `;
}`;

    document.getElementById('outputCode').value = code;
}

function runInNewTab() {
    generateCode();
    const code = document.getElementById('outputCode').value;

    // Create a temporary HTML with the generated sequence
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Cross-Origin-Opener-Policy" content="same-origin">
    <meta http-equiv="Cross-Origin-Embedder-Policy" content="require-corp">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TCOAAL Dialog Preview</title>
    <link href="fonts/Faustina-Regular.ttf" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="game-container">
        <div class="dialog-container" id="dialogContainer">
            <div class="dialog-content">
                <div class="dialog-line speaker-line" id="speakerLine"></div>
                <div class="dialog-line text-line" id="textLine1"></div>
                <div class="dialog-line text-line" id="textLine2"></div>
            </div>
        </div>
        <div class="controls" id='controlsContainer'>
            <button onclick="dialogFramework.start()">Start</button>
            <button onclick="dialogFramework.next()">Next</button>
            <button onclick="dialogFramework.reset()">Reset</button>
            <button onclick="dialogFramework.skipText()">Skip Text</button>
        </div>
        <div class="debug-info" id="debugInfo">Scene: 0 / 0</div>
    </div>
    <script src="js/dialog.js"><\/script>
    <script>${code}<\/script>
    <script>
        const dialogFramework = new DialogFramework();
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof setupScene === 'function') {
                setupScene();
            }
        });
    <\/script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}

function saveToFile() {
    generateCode();

    const dataStr = JSON.stringify(projectData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'dialog-project.json';
    a.click();

    URL.revokeObjectURL(url);
}

function loadFromFile() {
    document.getElementById('fileInput').click();
}

document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                projectData = JSON.parse(e.target.result);

                // Update UI
                document.getElementById('configShowControls').checked = projectData.config.showControls;
                document.getElementById('configShowDebug').checked = projectData.config.showDebug;

                document.getElementById('glitchScrambledColor').value = projectData.glitchConfig.scrambledColor;
                document.getElementById('glitchRealColor').value = projectData.glitchConfig.realColor;
                document.getElementById('glitchChangeSpeed').value = projectData.glitchConfig.changeSpeed;
                document.getElementById('glitchRealProbability').value = projectData.glitchConfig.realProbability;
                document.getElementById('glitchAutoStart').checked = projectData.glitchConfig.autoStart;
                document.getElementById('glitchCharsAllowed').value = projectData.glitchConfig.charsAllowed;

                updateCharactersList();
                updateScenesList();
                generateCode();

                alert('Project loaded successfully!');
            } catch (err) {
                alert('Error loading file: ' + err.message);
            }
        };
        reader.readAsText(file);
    }
});

// Event listeners for config changes
document.getElementById('configShowControls').addEventListener('change', generateCode);
document.getElementById('configShowDebug').addEventListener('change', generateCode);
document.getElementById('glitchScrambledColor').addEventListener('change', generateCode);
document.getElementById('glitchRealColor').addEventListener('change', generateCode);
document.getElementById('glitchChangeSpeed').addEventListener('change', generateCode);
document.getElementById('glitchRealProbability').addEventListener('change', generateCode);
document.getElementById('glitchAutoStart').addEventListener('change', generateCode);
document.getElementById('glitchCharsAllowed').addEventListener('change', generateCode);

// Initialize
updateCharactersList();
updateScenesList();
generateCode();
