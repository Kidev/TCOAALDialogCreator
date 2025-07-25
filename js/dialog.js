class GlitchTextEffect {
    constructor(element, config = {}) {
        this.element = element;
        this.originalText = '';
        this.characters = [];
        this.interval = null;
        this.isRunning = false;
        this.isRevealed = false;

        this.config = {
            scrambledColor: config.scrambledColor || '#000000',
            realColor: config.realColor || '#ffffff',
            changeSpeed: config.changeSpeed || 200,
            realProbability: config.realProbability || 5,
            autoStart: config.autoStart !== undefined ? config.autoStart : true,
            charsAllowed: config.charsAllowed !== undefined ? config.charsAllowed : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()[]{}|\\:";\'<>?,./`~'
        };

        if (this.element && this.element.textContent) {
            this.setText(this.element.textContent);
            if (this.config.autoStart) {
                this.start();
            }
        }
    }

    setText(text) {
        this.originalText = text;
        this.setupCharacters();
    }

    setupCharacters() {
        if (!this.element) return;

        this.element.innerHTML = '';
        this.characters = [];

        for (let i = 0; i < this.originalText.length; i++) {
            const char = this.originalText[i];
            const span = document.createElement('span');
            span.className = 'glitch-char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.dataset.correct = char;
            span.style.display = 'inline-block';
            span.style.fontFamily = 'monospace';
            span.style.width = '1ch';
            span.style.textAlign = 'center';

            span.style.setProperty('--correct-color', this.config.realColor);
            span.style.setProperty('--incorrect-color', this.config.scrambledColor);
            span.style.setProperty('--text-color', this.config.scrambledColor);

            this.element.appendChild(span);
            this.characters.push({
                element: span,
                originalChar: char,
                lastUpdateTime: 0,
                updateInterval: this.config.changeSpeed + (Math.random() * 100)
            });
        }
    }

    getRandomChar(excludeChar) {
        const availableChars = this.config.charsAllowed.split('').filter(c => c !== excludeChar);
        if (availableChars.length === 0) return excludeChar;
        return availableChars[Math.floor(Math.random() * availableChars.length)];
    }

    shouldShowReal() {
        return Math.random() * 100 < this.config.realProbability;
    }

    updateCharacter(charObj, currentTime) {
        if (charObj.originalChar === ' ') {
            return;
        }

        if (currentTime - charObj.lastUpdateTime < charObj.updateInterval) {
            return;
        }

        charObj.lastUpdateTime = currentTime;

        if (this.isRevealed) {
            charObj.element.textContent = charObj.originalChar;
            charObj.element.style.setProperty('--text-color', this.config.realColor);
        } else {
            let newChar;

            if (this.shouldShowReal()) {
                newChar = charObj.originalChar;
            } else {
                newChar = this.getRandomChar(charObj.originalChar);
            }

            charObj.element.textContent = newChar;

            if (newChar === charObj.originalChar) {
                charObj.element.style.setProperty('--text-color', this.config.realColor);
            } else {
                charObj.element.style.setProperty('--text-color', this.config.scrambledColor);
            }
        }
    }

    start() {
        if (this.isRunning) {
            this.stop();
        }

        this.isRunning = true;
        this.isRevealed = false;

        this.interval = setInterval(() => {
            if (this.isRunning) {
                const currentTime = Date.now();
                this.characters.forEach(charObj => {
                    this.updateCharacter(charObj, currentTime);
                });
            }
        }, 50);
    }

    stop() {
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    reveal() {
        this.isRevealed = true;
        this.characters.forEach(charObj => {
            if (charObj.originalChar !== ' ') {
                charObj.element.textContent = charObj.originalChar;
                charObj.element.style.setProperty('--text-color', this.config.realColor);
            }
        });
    }

    destroy() {
        this.stop();
        this.characters = [];
        if (this.element) {
            this.element.innerHTML = '';
        }
    }
}

class DialogFramework {
    constructor() {
        this.scenes = [];
        this.currentScene = -1;
        this.isTyping = false;
        this.typeSpeed = 20;
        this.currentText = '';
        this.typingTimeout = null;
        this.currentBackgroundImage = null;
        this.currentBustLeft = null;
        this.currentBustRight = null;
        this.loadedSounds = new Map();
        this.glitchEffects = [];
        this.speakerGlitch = null;
        this.characters = {};
        this.glitchConfig = {};
        this.config = {};

        this.initializeEventListeners();
        this.initializeAudio();
        this.updateDebugInfo();
    }

    // Initialize audio system using HTML5 Audio (works with local files)
    async initializeAudio() {
        try {
            const testAudio = new Audio();
        } catch (error) {
            console.warn('Audio not supported:', error);
        }
    }

    // Load and cache audio file using HTML5 Audio
    async loadSound(soundPath) {
        if (this.loadedSounds.has(soundPath)) {
            return this.loadedSounds.get(soundPath);
        }

        try {
            // Check if it's a URL or local file
            const audioSrc = soundPath.startsWith('http://') || soundPath.startsWith('https://')
            ? soundPath
            : 'sounds/' + soundPath;

            const audio = new Audio(audioSrc);

            return new Promise((resolve, reject) => {
                const onCanPlay = () => {
                    audio.removeEventListener('canplaythrough', onCanPlay);
                    audio.removeEventListener('error', onError);
                    this.loadedSounds.set(soundPath, audio);
                    resolve(audio);
                };

                const onError = (error) => {
                    audio.removeEventListener('canplaythrough', onCanPlay);
                    audio.removeEventListener('error', onError);
                    console.warn(`Failed to load sound: ${soundPath}`, error);
                    resolve(null);
                };

                audio.addEventListener('canplaythrough', onCanPlay);
                audio.addEventListener('error', onError);

                setTimeout(() => {
                    if (!this.loadedSounds.has(soundPath)) {
                        audio.removeEventListener('canplaythrough', onCanPlay);
                        audio.removeEventListener('error', onError);
                        console.warn(`Timeout loading sound: ${soundPath}`);
                        resolve(null);
                    }
                }, 5000);
            });
        } catch (error) {
            console.warn(`Failed to create audio for: ${soundPath}`, error);
            return null;
        }
    }

    async playSound(soundPath, volume = 1.0) {
        if (!soundPath) return;

        try {
            let audio = await this.loadSound(soundPath);

            if (!audio) {
                console.warn(`Could not load sound: ${soundPath}`);
                return;
            }

            const audioClone = audio.cloneNode();
            audioClone.volume = Math.max(0, Math.min(1, volume));

            const playPromise = audioClone.play();

            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn(`Failed to play sound: ${soundPath}`, error);
                });
            }
        } catch (error) {
            console.warn(`Error playing sound: ${soundPath}`, error);
        }
    }

    setCharacters(charactersInput) {
        this.characters = charactersInput;

        for (const key in this.characters) {
            this.characters[key].uuid = `character-${crypto.randomUUID()}`
            this.characters[key].characterClassName = `speaker-line-${this.characters[key].uuid}`
        }

        this.generateCharacterCSS();
    }

    generateCharacterCSS() {
        const existingStyle = document.getElementById('dynamic-character-styles');
        if (existingStyle) {
            existingStyle.remove();
        }

        const styleElement = document.createElement('style');
        styleElement.id = 'dynamic-character-styles';
        styleElement.type = 'text/css';

        let cssRules = '';

        Object.keys(this.characters).forEach(characterName => {
            const character = this.characters[characterName];
            if (character.color && character.characterClassName) {
                cssRules += `.${character.characterClassName} {\n    color: ${character.color} !important;\n}\n\n`;
            }
        });

        styleElement.textContent = cssRules;

        document.head.appendChild(styleElement);
    }

    setGlitchConfig(config) {
        this.glitchConfig = config;
    }

    setConfig(config) {
        this.config = config;
        this.updateConfig();
    }

    updateConfig() {
        const controls = document.getElementById('controlsContainer');
        const debug = document.getElementById('debugInfo');

        controls.classList.toggle('hidden', !this.config.showControls);
        debug.style.opacity = this.config.showDebug ? '1' : '0';
    }

    addScene(options) {
        const scene = {
            image: options.image !== undefined ? options.image : null,
            speaker: options.speaker || '',
            text: options.text !== undefined ? options.text : null,

            dialogFadeInTime: options.dialogFadeInTime !== undefined ? options.dialogFadeInTime : 200,
            dialogFadeOutTime: options.dialogFadeOutTime !== undefined ? options.dialogFadeOutTime : 200,
            imageFadeInTime: options.imageFadeInTime !== undefined ? options.imageFadeInTime : 200,
            imageFadeOutTime: options.imageFadeOutTime !== undefined ? options.imageFadeOutTime : 200,

            dialogDelayIn: options.dialogDelayIn !== undefined ? options.dialogDelayIn : 500,
            dialogDelayOut: options.dialogDelayOut !== undefined ? options.dialogDelayOut : 0,
            imageDelayIn: options.imageDelayIn !== undefined ? options.imageDelayIn : 0,
            imageDelayOut: options.imageDelayOut !== undefined ? options.imageDelayOut : 0,

            sound: options.sound || null,
            soundVolume: options.soundVolume || 1.0,
            soundDelay: options.soundDelay || 0,
            censorSpeaker: options.censorSpeaker !== undefined ? options.censorSpeaker : true,

            bustLeft: options.bustLeft !== undefined ? options.bustLeft : null,
            bustRight: options.bustRight !== undefined ? options.bustRight : null,
            bustFade: options.bustFade !== undefined ? options.bustFade : 0,

            shake: options.shake !== undefined ? options.shake : false,
            shakeDelay: options.shakeDelay !== undefined ? options.shakeDelay : 0,
            shakeIntensity: options.shakeIntensity !== undefined ? options.shakeIntensity : 1,
            shakeDuration: options.shakeDuration !== undefined ? options.shakeDuration : 500
        };

        this.scenes.push(scene);
        this.updateDebugInfo();
        return this;
    }


    initializeEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('editorOverlay').classList.contains('active')) {
                return;
            }

            if (e.code === 'Space' || e.code === 'ArrowRight') {
                e.preventDefault();
                if (this.isTyping) {
                    this.skipText();
                } else {
                    this.next();
                }
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                this.previous();
            } else if (e.code === 'Tab') {
                e.preventDefault();
                this.toggleControls();
            }
        });

        document.addEventListener('click', (e) => {
            if (document.getElementById('editorOverlay').classList.contains('active')) {
                return;
            }

            if (!e.target.closest('.controls') && !e.target.closest('.editor-overlay')) {
                if (this.isTyping) {
                    this.skipText();
                } else {
                    this.next();
                }
            }
        });
    }

    toggleControls() {
        const controls = document.getElementById('controlsContainer');
        controls.classList.toggle('hidden');
    }

    start() {
        this.currentScene = 0;
        this.showScene(0);
    }

    async showScene(index, force = false) {
        if (index >= this.scenes.length) {
            this.hideDialog();
            return;
        }

        const scene = this.scenes[index];
        const previousScene = index > 0 ? this.scenes[index - 1] : null;

        if (scene.sound) {
            if (scene.soundDelay > 0) {
                setTimeout(() => {
                    this.playSound(scene.sound, scene.soundVolume);
                }, scene.soundDelay);
            } else {
                this.playSound(scene.sound, scene.soundVolume);
            }
        }

        if (scene.shake) {
            if (scene.shakeDelay > 0) {
                setTimeout(() => {
                    this.triggerShake(scene.shakeIntensity, scene.shakeDuration);
                }, scene.shakeDelay);
            } else {
                this.triggerShake(scene.shakeIntensity, scene.shakeDuration);
            }
        }

        this.handleBustTransitions(scene, previousScene);

        // IMAGE TIMELINE
        if (previousScene) {
            // Check for crossfade condition (both fade times are negative)
            const shouldCrossfade = previousScene.imageFadeOutTime < 0 && scene.imageFadeInTime < 0;

            if (shouldCrossfade && scene.image !== null && previousScene.image !== null) {
                // Calculate when to start crossfade
                let crossfadeDelay = (previousScene.imageDelayOut || 0) + (scene.imageDelayIn || 0);

                // Use absolute values of negative fade times
                const fadeOutDuration = Math.abs(previousScene.imageFadeOutTime);
                const fadeInDuration = Math.abs(scene.imageFadeInTime);

                setTimeout(() => {
                    this.crossfadeImages(previousScene.image, scene.image, fadeOutDuration, fadeInDuration);
                }, crossfadeDelay);
            } else {
                // Normal fade timeline
                let imageOutDelay = previousScene.imageDelayOut || 0;
                let imageFadeOutTime = previousScene.imageFadeOutTime || 0;

                // First, handle the fade out of previous image
                setTimeout(() => {
                    if (previousScene.image !== null && !(imageFadeOutTime === 0 && scene.imageFadeInTime === 0 &&
                        scene.image === previousScene.image)) {
                        this.hideAllImages(imageFadeOutTime);
                        }
                }, imageOutDelay);

                // Then, handle the fade in of new image
                let totalImageDelay = imageOutDelay + imageFadeOutTime + (scene.imageDelayIn || 0);

                setTimeout(() => {
                    if (scene.image !== null) {
                        // Check if instant transition
                        if (imageFadeOutTime === 0 && scene.imageFadeInTime === 0 &&
                            scene.image === previousScene.image) {
                            // Same image with instant transition
                                if (force === true && scene.image !== null && scene.image !== '') {
                                    this.showImageInstant(scene.image);
                                }
                            } else if (imageFadeOutTime === 0 && scene.imageFadeInTime === 0) {
                                this.showImageInstant(scene.image);
                            } else {
                                this.showImage(scene.image, scene.imageFadeInTime, 0); // fadeOutTime handled above
                            }
                    } else {
                        // When scene.image is null, ensure any remaining images are hidden
                        this.currentBackgroundImage = null;
                        // Make sure all images are properly faded out
                        const remainingImages = document.querySelectorAll('.background-image.active');
                        if (remainingImages.length > 0) {
                            // If there are still active images, hide them now (they should already be fading)
                            this.hideAllImages(0);
                        }
                    }
                }, totalImageDelay);
            }
        } else {
            // Scene 0: just use current scene's delays
            setTimeout(() => {
                if (scene.image !== null) {
                    this.showImage(scene.image, scene.imageFadeInTime, 0);
                } else {
                    this.hideAllImages(0);
                    this.currentBackgroundImage = null;
                }
            }, scene.imageDelayIn || 0);
        }

        // DIALOG TIMELINE
        if (previousScene) {
            // Scene > 0: wait for previous scene's out delays/fades first
            let dialogOutDelay = previousScene.dialogDelayOut || 0;
            let dialogFadeOutTime = previousScene.dialogFadeOutTime || 0;

            // First, handle the fade out of previous dialog
            setTimeout(() => {
                if (dialogFadeOutTime > 0) {
                    this.fadeOutDialog(dialogFadeOutTime);
                } else {
                    this.hideDialog();
                }
            }, dialogOutDelay);

            // Then, handle the fade in of new dialog
            let totalDialogDelay = dialogOutDelay + dialogFadeOutTime + (scene.dialogDelayIn || 0);

            setTimeout(() => {
                if (scene.text !== null && scene.text.trim() !== '') {
                    // Check if instant transition
                    if (dialogFadeOutTime === 0 && scene.dialogFadeInTime === 0) {
                        this.showDialogInstant(scene.speaker, scene.text, scene.censorSpeaker);
                    } else {
                        this.showDialog(scene.speaker, scene.text, false, scene.censorSpeaker);
                        if (scene.dialogFadeInTime > 0) {
                            this.fadeInDialog(scene.dialogFadeInTime);
                        } else {
                            const dialogContainer = document.getElementById('dialogContainer');
                            dialogContainer.classList.add('active');
                        }
                    }
                }
            }, totalDialogDelay);

        } else {
            // Scene 0: just use current scene's delays
            setTimeout(() => {
                if (scene.text !== null && scene.text.trim() !== '') {
                    this.showDialog(scene.speaker, scene.text, false, scene.censorSpeaker);
                    if (scene.dialogFadeInTime > 0) {
                        this.fadeInDialog(scene.dialogFadeInTime);
                    } else {
                        const dialogContainer = document.getElementById('dialogContainer');
                        dialogContainer.classList.add('active');
                    }
                } else {
                    this.hideDialog();
                }
            }, scene.dialogDelayIn || 0);
        }

        this.updateDebugInfo();
    }

    triggerShake(intensity = 1, duration = 500) {
        const gameContainer = document.querySelector('.game-container');

        const styleId = 'shake-style-' + Date.now();
        const style = document.createElement('style');
        style.id = styleId;

        const baseShake = 10 * intensity;
        const halfShake = 5 * intensity;
        const smallShake = 2 * intensity;

        style.textContent = `
        @keyframes shake-${styleId} {
            0%, 100% { transform: translate(0, 0); }
            10% { transform: translate(-${baseShake}px, -${halfShake}px); }
            20% { transform: translate(${baseShake}px, -${halfShake}px); }
            30% { transform: translate(-${baseShake}px, ${halfShake}px); }
            40% { transform: translate(${baseShake}px, ${halfShake}px); }
            50% { transform: translate(-${halfShake}px, -${baseShake}px); }
            60% { transform: translate(${halfShake}px, -${baseShake}px); }
            70% { transform: translate(-${halfShake}px, ${baseShake}px); }
            80% { transform: translate(${halfShake}px, ${baseShake}px); }
            90% { transform: translate(-${smallShake}px, -${smallShake}px); }
        }

        .game-container.shake-${styleId} {
            animation: shake-${styleId} ${duration}ms ease-in-out;
        }
        `;

        document.head.appendChild(style);
        gameContainer.classList.add(`shake-${styleId}`);

        setTimeout(() => {
            gameContainer.classList.remove(`shake-${styleId}`);
            style.remove();
        }, duration);
    }

    handleBustTransitions(scene, previousScene) {
        if (previousScene && previousScene.bustLeft !== scene.bustLeft) {
            if (previousScene.bustLeft) {
                this.hideBust('left', previousScene.bustFade || 200);
            }
            if (scene.bustLeft) {
                setTimeout(() => {
                    this.showBust('left', scene.bustLeft, scene.bustFade || 200);
                }, previousScene && previousScene.bustLeft ? (previousScene.bustFade || 200) : 0);
            }
        } else if (!previousScene && scene.bustLeft) {
            this.showBust('left', scene.bustLeft, scene.bustFade || 200);
        }

        if (previousScene && previousScene.bustRight !== scene.bustRight) {
            if (previousScene.bustRight) {
                this.hideBust('right', previousScene.bustFade || 200);
            }
            if (scene.bustRight) {
                setTimeout(() => {
                    this.showBust('right', scene.bustRight, scene.bustFade || 200);
                }, previousScene && previousScene.bustRight ? (previousScene.bustFade || 200) : 0);
            }
        } else if (!previousScene && scene.bustRight) {
            this.showBust('right', scene.bustRight, scene.bustFade || 200);
        }
    }

    showBust(side, imageSrc, fadeTime = 0) {
        if (side === 'left') {
            this.currentBustLeft = imageSrc;
        } else {
            this.currentBustRight = imageSrc;
        }

        const existingBust = document.querySelector(`.bust-image.${side}`);
        if (existingBust) {
            existingBust.remove();
        }

        const img = document.createElement('img');

        if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
            img.src = imageSrc;
        } else {
            img.src = 'img/' + imageSrc;
        }

        img.className = `bust-image ${side}`;

        if (fadeTime > 0) {
            img.style.transition = `opacity ${fadeTime}ms ease-in-out`;
            img.style.opacity = '0';
        } else {
            img.style.transition = 'none';
            img.style.opacity = '1';
        }

        document.querySelector('.game-container').appendChild(img);

        img.onload = () => {
            if (fadeTime > 0) {
                img.offsetHeight;
                requestAnimationFrame(() => {
                    img.style.opacity = '1';
                });
            }
        };

        img.onerror = () => {
            console.warn(`Failed to load bust image: ${imageSrc}`);
        };

        if (img.complete) {
            img.onload();
        }
    }

    hideBust(side, fadeTime = 0) {
        const bust = document.querySelector(`.bust-image.${side}`);
        if (!bust) return;

        if (side === 'left') {
            this.currentBustLeft = null;
        } else {
            this.currentBustRight = null;
        }

        if (fadeTime > 0) {
            bust.style.transition = `opacity ${fadeTime}ms ease-in-out`;
            bust.style.opacity = '0';
            setTimeout(() => {
                bust.remove();
            }, fadeTime);
        } else {
            bust.remove();
        }
    }

    showImage(imageSrc, fadeInTime = 200, fadeOutTime = 200) {
        this.currentBackgroundImage = imageSrc;

        if (fadeOutTime > 0) {
            const existingImages = document.querySelectorAll('.background-image.active');
            existingImages.forEach(img => {
                img.style.transition = `opacity ${fadeOutTime}ms ease-in-out`;
                img.classList.remove('active');
            });
        }

        const img = document.createElement('img');

        if (imageSrc === '') {
            img.src = '';
            return;
        }

        if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
            img.src = imageSrc;
        } else {
            img.src = 'img/' + imageSrc;
        }

        img.className = 'background-image';

        if (fadeInTime > 0) {
            img.style.transition = `opacity ${fadeInTime}ms ease-in-out`;
        } else {
            img.style.transition = 'none';
        }

        document.querySelector('.game-container').appendChild(img);
        img.offsetHeight;

        img.onload = () => {
            requestAnimationFrame(() => {
                img.classList.add('active');
            });
        };

        img.onerror = () => {
            console.warn(`Failed to load image: ${imageSrc}`);
        };

        if (img.complete) {
            img.onload();
        }

        if (fadeOutTime > 0) {
            const cleanupTime = Math.max(fadeInTime, fadeOutTime) + 100;
            setTimeout(() => {
                const existingImages = document.querySelectorAll('.background-image:not(.active)');
                existingImages.forEach(img => img.remove());
            }, cleanupTime);
        }
    }

    crossfadeImages(fromImageSrc, toImageSrc, fadeOutDuration = 1000, fadeInDuration = 1000) {
        this.currentBackgroundImage = toImageSrc;

        const existingImages = document.querySelectorAll('.background-image.active');

        const newImg = document.createElement('img');

        if (toImageSrc.startsWith('http://') || toImageSrc.startsWith('https://')) {
            newImg.src = toImageSrc;
        } else {
            newImg.src = 'img/' + toImageSrc;
        }

        newImg.className = 'background-image';
        newImg.style.transition = `opacity ${fadeInDuration}ms ease-in-out`;
        newImg.style.opacity = '0';

        document.querySelector('.game-container').appendChild(newImg);

        newImg.offsetHeight;

        const startCrossfade = () => {
            requestAnimationFrame(() => {
                existingImages.forEach(img => {
                    img.style.transition = `opacity ${fadeOutDuration}ms ease-in-out`;
                    img.classList.remove('active');
                });

                newImg.classList.add('active');
                newImg.style.opacity = '1';
            });

            const maxDuration = Math.max(fadeOutDuration, fadeInDuration);
            setTimeout(() => {
                existingImages.forEach(img => img.remove());
            }, maxDuration + 100);
        };

        newImg.onload = startCrossfade;

        newImg.onerror = () => {
            console.warn(`Failed to load image: ${toImageSrc}`);
            existingImages.forEach(img => {
                img.style.transition = `opacity ${fadeOutDuration}ms ease-in-out`;
                img.classList.remove('active');
            });
        };

        if (newImg.complete) {
            setTimeout(startCrossfade, 10);
        }
    }


    showImageInstant(imageSrc) {
        this.currentBackgroundImage = imageSrc;

        const existingImages = document.querySelectorAll('.background-image.active');
        existingImages.forEach(img => {
            img.style.transition = 'none';
            img.classList.remove('active');
        });

        const img = document.createElement('img');

        if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
            img.src = imageSrc;
        } else {
            img.src = 'img/' + imageSrc;
        }

        img.className = 'background-image active';
        img.style.transition = 'none';
        img.style.opacity = '1';

        img.onerror = () => {
            console.warn(`Failed to load image: ${imageSrc}`);
        };

        document.querySelector('.game-container').appendChild(img);

        setTimeout(() => {
            existingImages.forEach(img => img.remove());
        }, 10);
    }

    showDialogInstant(speaker, text, censorSpeaker) {
        const dialogContainer = document.getElementById('dialogContainer');

        this.showDialog(speaker, text, false, censorSpeaker);
        dialogContainer.style.transition = 'none';
        dialogContainer.classList.add('active');

        setTimeout(() => {
            dialogContainer.style.transition = '';
        }, 10);
    }

    parseFormattedText(text) {
        const tempDiv = document.createElement('div');

        let formattedText = text
            .replace(/<b>/g, '<strong>')
            .replace(/<\/b>/g, '</strong>')
            .replace(/<i>/g, '<em>')
            .replace(/<\/i>/g, '</em>')
            .replace(/<u>/g, '<span style="text-decoration: underline;">')
            .replace(/<\/u>/g, '</span>');

        const glitchRegex = /<glitch([^>]*)>(.*?)<\/glitch>/g;
        let match;
        let glitchCounter = 0;

        while ((match = glitchRegex.exec(formattedText)) !== null) {
            const attributes = match[1];
            const glitchText = match[2];
            const glitchId = `glitch-${Date.now()}-${glitchCounter++}`;

            let glitchConfig = {};

            if (attributes) {
                const colorMatch = attributes.match(/color="([^"]+)"/);
                if (colorMatch) glitchConfig.realColor = colorMatch[1];

                const scrambledMatch = attributes.match(/scrambled="([^"]+)"/);
                if (scrambledMatch) glitchConfig.scrambledColor = scrambledMatch[1];

                const speedMatch = attributes.match(/speed="([^"]+)"/);
                if (speedMatch) glitchConfig.changeSpeed = parseInt(speedMatch[1]);
            }

            formattedText = formattedText.replace(match[0], `<span class="glitch-container" data-glitch-id="${glitchId}" data-glitch-config='${JSON.stringify(glitchConfig)}'>${glitchText}</span>`);
        }

        tempDiv.innerHTML = formattedText;
        return tempDiv;
    }

    applyGlitchEffects(container) {
        const glitchContainers = container.querySelectorAll('.glitch-container');

        glitchContainers.forEach(glitchContainer => {
            const config = JSON.parse(glitchContainer.dataset.glitchConfig);
            const glitchEffect = new GlitchTextEffect(glitchContainer, this.glitchConfig);
            this.glitchEffects.push(glitchEffect);
        });
    }

    cleanupGlitchEffects() {
        this.glitchEffects.forEach(effect => effect.destroy());
        this.glitchEffects = [];

        if (this.speakerGlitch) {
            this.speakerGlitch.destroy();
            this.speakerGlitch = null;
        }
    }

    showDialog(speaker, text, showContainer = true, censorSpeaker = true) {
        const dialogContainer = document.getElementById('dialogContainer');
        const speakerLine = document.getElementById('speakerLine');
        const textLine1 = document.getElementById('textLine1');
        const textLine2 = document.getElementById('textLine2');

        this.cleanupGlitchEffects();

        speakerLine.className = 'dialog-line speaker-line';
        textLine1.className = 'dialog-line text-line';
        textLine2.className = 'dialog-line text-line';
        speakerLine.innerHTML = '';
        textLine1.innerHTML = '';
        textLine2.innerHTML = '';

        if (speaker && this.characters[speaker]) {
            speakerLine.textContent = speaker;
            textLine1.classList.add(this.characters[speaker].characterClassName);
            textLine2.classList.add(this.characters[speaker].characterClassName);
            if (censorSpeaker) {
                this.speakerGlitch = new GlitchTextEffect(speakerLine, this.glitchConfig);
            }
        }

        let finalText = text;
        if (speaker && this.characters[speaker]) {
            finalText = `"${text}"`;
        }

        const hasFormatting = finalText.includes('<');

        if (hasFormatting) {
            const parsedContainer = this.parseFormattedText(finalText);
            const plainText = parsedContainer.textContent || parsedContainer.innerText;
            const textLines = this.wrapTextToLines(plainText, 2);

            if (showContainer) {
                dialogContainer.classList.add('active');
            }

            this.typeTextWithFormatting([textLine1, textLine2], textLines, parsedContainer);
        } else {
            const textLines = this.wrapTextToLines(finalText, 2);

            if (showContainer) {
                dialogContainer.classList.add('active');
            }

            this.typeTextLines([textLine1, textLine2], textLines);
        }
    }

    hideAllImages(fadeOutTime = 200) {
        const existingImages = document.querySelectorAll('.background-image.active');

        existingImages.forEach(img => {
            if (fadeOutTime > 0) {
                img.style.transition = `opacity ${fadeOutTime}ms ease-in-out`;
                img.offsetHeight;
                img.classList.remove('active');
                img.style.opacity = '0';
            } else {
                img.style.transition = 'none';
                img.style.opacity = '0';
                img.classList.remove('active');
            }
        });

        const cleanupTime = fadeOutTime + 100;
        setTimeout(() => {
            const imagesToRemove = document.querySelectorAll('.background-image:not(.active)');
            imagesToRemove.forEach(img => img.remove());
        }, cleanupTime);
    }

    async fadeOutDialog(fadeOutTime = 200) {
        const dialogContainer = document.getElementById('dialogContainer');
        if (dialogContainer.classList.contains('active')) {
            if (fadeOutTime > 0) {
                dialogContainer.classList.remove('active');
                await this.wait(fadeOutTime);
            } else {
                dialogContainer.style.opacity = '0';
                dialogContainer.classList.remove('active');
                setTimeout(() => {
                    dialogContainer.style.opacity = '';
                }, 10);
            }
        }
    }

    async fadeInDialog(fadeInTime = 200) {
        const dialogContainer = document.getElementById('dialogContainer');
        if (fadeInTime > 0) {
            dialogContainer.classList.add('active');
            await this.wait(fadeInTime);
        } else {
            dialogContainer.style.opacity = '1';
            dialogContainer.classList.add('active');
            setTimeout(() => {
                dialogContainer.style.opacity = '';
            }, 10);
        }
    }

    wrapTextToLines(text, maxLines) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        const maxCharsPerLine = 75;

        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;

            if (testLine.length <= maxCharsPerLine) {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    lines.push(word.substring(0, maxCharsPerLine));
                    currentLine = word.substring(maxCharsPerLine);
                }

                if (lines.length >= maxLines) {
                    break;
                }
            }
        }

        if (currentLine && lines.length < maxLines) {
            lines.push(currentLine);
        }

        while (lines.length < maxLines) {
            lines.push('');
        }

        return lines.slice(0, maxLines);
    }

    async typeTextLines(elements, textLines) {
        this.isTyping = true;
        this.currentText = textLines.join(' ');

        for (let lineIndex = 0; lineIndex < elements.length; lineIndex++) {
            const element = elements[lineIndex];
            const text = textLines[lineIndex] || '';

            if (!text) continue;

            element.textContent = '';

            for (let i = 0; i < text.length; i++) {
                if (!this.isTyping) break;

                element.textContent += text[i];
                await this.wait(this.typeSpeed);
            }

            if (!this.isTyping) break;
        }

        this.isTyping = false;
    }

    async typeTextWithFormatting(elements, textLines, parsedContainer) {
        this.isTyping = true;
        this.currentText = textLines.join(' ');

        for (let lineIndex = 0; lineIndex < elements.length; lineIndex++) {
            const element = elements[lineIndex];
            const text = textLines[lineIndex] || '';

            if (!text) continue;

            element.textContent = '';

            for (let i = 0; i < text.length; i++) {
                if (!this.isTyping) break;

                element.textContent += text[i];
                await this.wait(this.typeSpeed);
            }

            if (!this.isTyping) break;
        }

        if (!this.isTyping) {
            this.applyFormattingToLines(elements, textLines, parsedContainer);
        }

        this.isTyping = false;
    }

    applyFormattingToLines(elements, textLines, parsedContainer) {
        const fullHTML = parsedContainer.innerHTML;
        const plainText = parsedContainer.textContent || parsedContainer.innerText;

        let charOffset = 0;

        for (let lineIndex = 0; lineIndex < elements.length && lineIndex < textLines.length; lineIndex++) {
            const element = elements[lineIndex];
            const lineText = textLines[lineIndex];

            if (!lineText) continue;

            const lineHTML = this.extractFormattedLineHTML(
                fullHTML,
                plainText,
                charOffset,
                charOffset + lineText.length
            );

            if (lineHTML && lineHTML !== lineText) {
                element.innerHTML = lineHTML;

                const glitchContainers = element.querySelectorAll('.glitch-container');
                glitchContainers.forEach(container => {
                    const config = JSON.parse(container.dataset.glitchConfig);
                    const glitchEffect = new GlitchTextEffect(container, this.glitchConfig);
                    this.glitchEffects.push(glitchEffect);
                });
            }

            charOffset += lineText.length;
        }
    }

    extractFormattedLineHTML(fullHTML, fullPlainText, startIndex, endIndex) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = fullHTML;

        const targetText = fullPlainText.substring(startIndex, endIndex);

        if (!fullHTML.includes('<')) {
            return targetText;
        }

        let result = '';
        let currentIndex = 0;
        let inRange = false;

        const walker = document.createTreeWalker(
            tempDiv,
            NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
            null,
            false
        );

        let node;
        let openTags = [];

        while ((node = walker.nextNode())) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.classList && node.classList.contains('glitch-container')) {
                    const glitchText = node.textContent;
                    const glitchStart = currentIndex;
                    const glitchEnd = currentIndex + glitchText.length;

                    if (glitchEnd > startIndex && glitchStart < endIndex) {
                        for (let i = openTags.length - 1; i >= 0; i--) {
                            result += `</${openTags[i]}>`;
                        }

                        result += node.outerHTML;

                        for (const tag of openTags) {
                            if (tag === 'span') {
                                result += `<span style="text-decoration: underline;">`;
                            } else {
                                result += `<${tag}>`;
                            }
                        }
                    }

                    currentIndex += glitchText.length;
                } else {
                    const tagName = node.tagName.toLowerCase();

                    if (currentIndex < endIndex && currentIndex + (node.textContent || '').length > startIndex) {
                        if (tagName === 'span' && node.style.textDecoration === 'underline') {
                            result += '<span style="text-decoration: underline;">';
                        } else {
                            result += `<${tagName}>`;
                        }
                        openTags.push(tagName);
                    }
                }
            } else if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;

                for (let i = 0; i < text.length; i++) {
                    if (currentIndex >= startIndex && currentIndex < endIndex) {
                        result += text[i];
                    }
                    currentIndex++;
                }
            }
        }

        for (let i = openTags.length - 1; i >= 0; i--) {
            result += `</${openTags[i]}>`;
        }

        return result || targetText;
    }

    async typeText(element, text) {
        this.isTyping = true;
        this.currentText = text;
        element.textContent = '';

        for (let i = 0; i < text.length; i++) {
            if (!this.isTyping) break;

            element.textContent += text[i];
            await this.wait(this.typeSpeed);
        }

        this.isTyping = false;
    }

    skipText() {
        if (this.isTyping) {
            this.isTyping = false;

            const textLine1 = document.getElementById('textLine1');
            const textLine2 = document.getElementById('textLine2');

            if (this.currentScene < this.scenes.length) {
                const scene = this.scenes[this.currentScene];

                if (scene.text !== null && scene.text.trim() !== '') {
                    let finalText = scene.text;

                    if (scene.speaker && this.characters[scene.speaker]) {
                        finalText = `"${scene.text}"`;
                    }

                    const hasFormatting = finalText.includes('<');

                    if (hasFormatting) {
                        const parsedContainer = this.parseFormattedText(finalText);
                        const plainText = parsedContainer.textContent || parsedContainer.innerText;
                        const textLines = this.wrapTextToLines(plainText, 2);

                        textLine1.textContent = textLines[0] || '';
                        textLine2.textContent = textLines[1] || '';

                        this.applyFormattingToLines([textLine1, textLine2], textLines, parsedContainer);
                    } else {
                        const textLines = this.wrapTextToLines(finalText, 2);
                        textLine1.textContent = textLines[0] || '';
                        textLine2.textContent = textLines[1] || '';
                    }
                }
            }
        }
    }

    next() {
        if (this.isTyping) {
            this.skipText();
            return;
        }

        this.currentScene++;
        if (this.currentScene < this.scenes.length) {
            this.showScene(this.currentScene);
        } else {
            this.hideDialog();
        }
    }

    previous() {
        if (this.currentScene < 0) {
            return;
        }
        let currentIndex = this.currentScene;
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = 0;
        }
        this.reset();
        this.jumpToScene(currentIndex);
    }

    hideDialog() {
        const dialogContainer = document.getElementById('dialogContainer');
        dialogContainer.classList.remove('active');
    }

    reset() {
        this.currentScene = -1;
        this.isTyping = false;
        this.currentBackgroundImage = null;
        this.currentBustLeft = null;
        this.currentBustRight = null;
        this.cleanupGlitchEffects();
        this.hideDialog();

        const images = document.querySelectorAll('.background-image');
        images.forEach(img => img.remove());

        const busts = document.querySelectorAll('.bust-image');
        busts.forEach(bust => bust.remove());

        this.updateDebugInfo();
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateDebugInfo() {
        const debugInfo = document.getElementById('debugInfo');
        debugInfo.textContent = `Scene: ${this.currentScene + 1} / ${this.scenes.length}`;
    }

    setTypeSpeed(speed) {
        this.typeSpeed = speed;
        return this;
    }

    getCurrentScene() {
        return this.currentScene;
    }

    jumpToScene(index) {
        if (index >= 0 && index < this.scenes.length) {
            this.currentScene = index;
            this.showScene(index, true);
        }
        return this;
    }
}
