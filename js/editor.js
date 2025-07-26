let projectData = {
    config: {
        showControls: true,
        showDebug: true
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

if (!document.getElementById('outputCode')) {
    const hiddenTextarea = document.createElement('textarea');
    hiddenTextarea.id = 'outputCode';
    hiddenTextarea.style.display = 'none';
    document.body.appendChild(hiddenTextarea);
}

function loadProjectData(data) {
    projectData = JSON.parse(JSON.stringify(data));

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
}

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
        censorSpeaker: false,
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
            char => `<option value="${char}" ${scene.speaker === char ? 'selected' : ''}>${char || 'Narrator'}</option>`
        ).join('');

        const preview = scene.text ? scene.text.substring(0, 50) + (scene.text.length > 50 ? '...' : '') : '(No text)';
        const isExpanded = expandedScenes.has(index);

        const getImageValue = (sceneIndex, field) => {
            const key = `${sceneIndex}-${field}`;
            const file = imageMap.get(key);
            if (file) return file.name;
            return projectData.scenes[sceneIndex][field] || '';
        };

        const getSoundValue = (sceneIndex) => {
            const file = soundMap.get(sceneIndex);
            if (file) return file.name;
            return projectData.scenes[sceneIndex].sound || '';
        };

        item.innerHTML = `
        <div class="scene-item-header">
        <button class="collapsible ${isExpanded ? 'active' : ''}" onclick="toggleScene(${index})">
        Scene ${index + 1} - ${scene.speaker || 'Narrator'}
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
        <div class="url-input-wrapper">
        <input type="file" accept="image/*"
        onchange="handleImageUpload(${index}, 'image', this)"
        ${scene.image === null ? 'disabled' : ''}>
        <input type="text" class="url-input" placeholder="or enter URL"
        value="${!imageMap.has(`${index}-image`) && scene.image && (scene.image.startsWith('http://') || scene.image.startsWith('https://')) ? scene.image : ''}"
        onchange="handleImageUrl(${index}, 'image', this.value)"
        ${scene.image === null ? 'disabled' : ''}>
        </div>
        <span class="file-name">${getImageValue(index, 'image')}</span>
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
            <div class="url-input-wrapper">
            <input type="file" accept="image/*"
            onchange="handleImageUpload(${index}, 'bustLeft', this)"
            ${scene.bustLeft === null ? 'disabled' : ''}>
            <input type="text" class="url-input" placeholder="or enter URL"
            value="${!imageMap.has(`${index}-bustLeft`) && scene.bustLeft && (scene.bustLeft.startsWith('http://') || scene.bustLeft.startsWith('https://')) ? scene.bustLeft : ''}"
            onchange="handleImageUrl(${index}, 'bustLeft', this.value)"
            ${scene.bustLeft === null ? 'disabled' : ''}>
            </div>
            <span class="file-name">${getImageValue(index, 'bustLeft')}</span>
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
                <div class="url-input-wrapper">
                <input type="file" accept="image/*"
                onchange="handleImageUpload(${index}, 'bustRight', this)"
                ${scene.bustRight === null ? 'disabled' : ''}>
                <input type="text" class="url-input" placeholder="or enter URL"
                value="${!imageMap.has(`${index}-bustRight`) && scene.bustRight && (scene.bustRight.startsWith('http://') || scene.bustRight.startsWith('https://')) ? scene.bustRight : ''}"
                onchange="handleImageUrl(${index}, 'bustRight', this.value)"
                ${scene.bustRight === null ? 'disabled' : ''}>
                </div>
                <span class="file-name">${getImageValue(index, 'bustRight')}</span>
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
                    <div class="url-input-wrapper">
                    <input type="file" accept="audio/*"
                    onchange="handleSoundUpload(${index}, this)"
                    ${scene.sound === null ? 'disabled' : ''}>
                    <input type="text" class="url-input" placeholder="or enter URL"
                    value="${!soundMap.has(index) && scene.sound && (scene.sound.startsWith('http://') || scene.sound.startsWith('https://')) ? scene.sound : ''}"
                    onchange="handleSoundUrl(${index}, this.value)"
                    ${scene.sound === null ? 'disabled' : ''}>
                    </div>
                    <span class="file-name">${getSoundValue(index)}</span>
                    </div>
                    ${scene.sound && scene.sound !== null ? `
                        <div class="preview-container">
                        <div class="sound-preview">
                        <button class="play-button" id="sound-button-${index}" onclick="toggleSound(${index})">▶ Play</button>
                        <span>${getSoundValue(index)}</span>
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
}

function getImageSrc(sceneIndex, field) {
    const key = `${sceneIndex}-${field}`;
    const file = imageMap.get(key);
    if (file) {
        return URL.createObjectURL(file);
    }

    const imagePath = projectData.scenes[sceneIndex][field];
    if (!imagePath) return '';

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    return 'img/' + imagePath;
}

function handleImageUpload(sceneIndex, field, input) {
    const file = input.files[0];
    if (file) {
        projectData.scenes[sceneIndex][field] = file.name;
        imageMap.set(`${sceneIndex}-${field}`, file);
        updateScenesList();
        return;
    }

    const url = prompt('Enter image URL (or cancel to choose file):');
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        projectData.scenes[sceneIndex][field] = url;
        imageMap.delete(`${sceneIndex}-${field}`);
        updateScenesList();
    }
}

function handleSoundUpload(sceneIndex, input) {
    const file = input.files[0];
    if (file) {
        projectData.scenes[sceneIndex].sound = file.name;
        soundMap.set(sceneIndex, file);
        updateScenesList();
        return;
    }

    const url = prompt('Enter sound URL (or cancel to choose file):');
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        projectData.scenes[sceneIndex].sound = url;
        soundMap.delete(sceneIndex);
        updateScenesList();
    }
}

function toggleSound(sceneIndex) {
    const button = document.getElementById(`sound-button-${sceneIndex}`);

    if (currentlyPlayingAudio && !currentlyPlayingAudio.paused) {
        currentlyPlayingAudio.pause();
        currentlyPlayingAudio = null;

        document.querySelectorAll('.play-button').forEach(btn => {
            btn.textContent = '▶ Play';
            btn.classList.remove('stop-button');
        });
        return;
    }

    const file = soundMap.get(sceneIndex);
    const soundPath = projectData.scenes[sceneIndex].sound;

    if (file) {
        const url = URL.createObjectURL(file);
        currentlyPlayingAudio = new Audio(url);
    } else if (soundPath && (soundPath.startsWith('http://') || soundPath.startsWith('https://'))) {
        currentlyPlayingAudio = new Audio(soundPath);
    } else if (soundPath) {
        currentlyPlayingAudio = new Audio('sounds/' + soundPath);
    } else {
        return;
    }

    currentlyPlayingAudio.volume = projectData.scenes[sceneIndex].soundVolume;

    button.textContent = '⬛ Stop';
    button.classList.add('stop-button');

    currentlyPlayingAudio.play();

    currentlyPlayingAudio.addEventListener('ended', () => {
        button.textContent = '▶ Play';
        button.classList.remove('stop-button');
        currentlyPlayingAudio = null;
    });
}

function toggleNull(sceneIndex, field, isNull) {
    projectData.scenes[sceneIndex][field] = isNull ? null : '';

    if (field === 'sound' && isNull && currentlyPlayingAudio) {
        currentlyPlayingAudio.pause();
        currentlyPlayingAudio = null;
    }

    updateScenesList();
}

function moveScene(index, direction) {
    if (currentlyPlayingAudio) {
        currentlyPlayingAudio.pause();
        currentlyPlayingAudio = null;
    }

    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < projectData.scenes.length) {
        const temp = projectData.scenes[index];
        projectData.scenes[index] = projectData.scenes[newIndex];
        projectData.scenes[newIndex] = temp;

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

        const wasExpanded = expandedScenes.has(index);
        const wasNewExpanded = expandedScenes.has(newIndex);
        expandedScenes.delete(index);
        expandedScenes.delete(newIndex);
        if (wasExpanded) expandedScenes.add(newIndex);
        if (wasNewExpanded) expandedScenes.add(index);

        updateScenesList();
    }
}

function duplicateScene(index) {
    const sceneCopy = JSON.parse(JSON.stringify(projectData.scenes[index]));
    projectData.scenes.splice(index + 1, 0, sceneCopy);

    const newExpanded = new Set();
    expandedScenes.forEach(i => {
        if (i > index) newExpanded.add(i + 1);
        else newExpanded.add(i);
    });
        expandedScenes = newExpanded;
        expandedScenes.add(index + 1);

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
}

function deleteScene(index) {
    if (confirm(`Delete scene ${index + 1}?`)) {
        if (currentlyPlayingAudio) {
            currentlyPlayingAudio.pause();
            currentlyPlayingAudio = null;
        }

        projectData.scenes.splice(index, 1);

        imageMap.delete(`${index}-image`);
        imageMap.delete(`${index}-bustLeft`);
        imageMap.delete(`${index}-bustRight`);
        soundMap.delete(index);

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
        const newExpanded = new Set();
        expandedScenes.forEach(i => {
            if (i > index) newExpanded.add(i - 1);
            else if (i < index) newExpanded.add(i);
        });
            expandedScenes = newExpanded;
            updateScenesList();
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

function eraseAll() {
    const confirmMessage = "This will delete ALL characters and scenes!\n\nAre you sure you want to continue?";

    if (confirm(confirmMessage)) {
        if (currentlyPlayingAudio) {
            currentlyPlayingAudio.pause();
            currentlyPlayingAudio = null;
        }

        projectData = {
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

        imageMap.clear();
        soundMap.clear();
        expandedScenes.clear();

        document.getElementById('configShowControls').checked = true;
        document.getElementById('configShowDebug').checked = true;

        document.getElementById('glitchScrambledColor').value = '#000000';
        document.getElementById('glitchRealColor').value = '#ffffff';
        document.getElementById('glitchChangeSpeed').value = 50;
        document.getElementById('glitchRealProbability').value = 5;
        document.getElementById('glitchAutoStart').checked = true;
        document.getElementById('glitchCharsAllowed').value = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        document.getElementById('newCharacterName').value = '';
        document.getElementById('newCharacterColor').value = '#ffffff';

        updateCharactersList();
        updateScenesList();

        console.log('All data has been erased and reset to defaults');
    }
}

function generateCode() {
    updateConfig();
    updateGlitchConfig();

    let code = `function setupScene() {
    dialogFramework.setConfig({
        showControls: ${projectData.config.showControls},
        showDebug: ${projectData.config.showDebug}
    });

    dialogFramework.setCharacters({`;

            Object.entries(projectData.characters).forEach(([name, data], index, array) => {
                code += `
            '${name}': {
                color: '${data.color}'
            }${index < array.length - 1 ? ',' : ''}`;
            });

            code += `
    });

    dialogFramework.setGlitchConfig({
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

if (document.getElementById('configShowControls')) {
    document.getElementById('configShowControls').addEventListener('change', updateConfig);
    document.getElementById('configShowDebug').addEventListener('change', updateConfig);
    document.getElementById('glitchScrambledColor').addEventListener('change', updateGlitchConfig);
    document.getElementById('glitchRealColor').addEventListener('change', updateGlitchConfig);
    document.getElementById('glitchChangeSpeed').addEventListener('change', updateGlitchConfig);
    document.getElementById('glitchRealProbability').addEventListener('change', updateGlitchConfig);
    document.getElementById('glitchAutoStart').addEventListener('change', updateGlitchConfig);
    document.getElementById('glitchCharsAllowed').addEventListener('change', updateGlitchConfig);
}

if (document.getElementById('charactersList')) {
    updateCharactersList();
    updateScenesList();
}
