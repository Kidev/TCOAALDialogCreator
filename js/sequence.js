function setupScene() {

    dialogFramework
        .setConfig({
            showControls: true,
            showDebug: true
        });

    dialogFramework
        .setCharacters({
            'Andrew': {
                color: '#a6de7f'
            },
            'Ashley': {
                color: '#e2829a'
            },
            'Cultist': {
                color: '#b3ba78'
            },
            'Cultists': {
                color: '#ffffff'
            },
            '???': {
                color: '#934a4f'
            }
        });

    dialogFramework
        .setGlitchConfig({
            scrambledColor:  '#000000',
            realColor: '#ffffff',
            changeSpeed: 50,
            realProbability: 5,
            autoStart: true,
            charsAllowed : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        });

    dialogFramework
        .addScene({
            image: '',
            speaker: 'Cultist',
            text: "Ok turn on the music!",
            censorSpeaker: false,
            dialogFadeInTime: 500,
            dialogFadeOutTime: 0,
            imageFadeInTime: 0,
            imageFadeOutTime: 0,
            dialogDelayIn: 800,
            dialogDelayOut: 0,
            imageDelayIn: 0,
            imageDelayOut: 0
        })
        .addScene({
            image: '',
            speaker: 'Cultist',
            text: "All together now!",
            censorSpeaker: false,
            dialogFadeInTime: 0,
            dialogFadeOutTime: 0,
            imageFadeInTime: 0,
            imageFadeOutTime: 0,
            dialogDelayIn: 0,
            dialogDelayOut: 0,
            imageDelayIn: 0,
            imageDelayOut: 0
        })
        .addScene({
            image: 'https://raw.githubusercontent.com/Kidev/TCOAALDialogCreator/refs/heads/main/demo/summon.gif',
            speaker: 'Cultists',
            text: "SHOW YOURSELF, DEMON!!",
            censorSpeaker: false,
            dialogFadeInTime: 100,
            dialogFadeOutTime: 0,
            imageFadeInTime: 100,
            imageFadeOutTime: 0,
            dialogDelayIn: 0,
            dialogDelayOut: 0,
            imageDelayIn: 0,
            imageDelayOut: 0,
            shake: true,
            shakeDuration: 250,
            shakeIntensity: 0.5,
            shakeDelay: 100
        })
        .addScene({
            image: 'https://raw.githubusercontent.com/Kidev/TCOAALDialogCreator/refs/heads/main/demo/summon.gif',
            speaker: 'Cultist',
            text: "This is such fun!!",
            censorSpeaker: false,
            dialogFadeInTime: 0,
            dialogFadeOutTime: 0,
            imageFadeInTime: 0,
            imageFadeOutTime: 0,
            dialogDelayIn: 0,
            dialogDelayOut: 0,
            imageDelayIn: 0,
            imageDelayOut: 0
        })
        .addScene({
            image: 'https://raw.githubusercontent.com/Kidev/TCOAALDialogCreator/refs/heads/main/demo/summon.gif',
            speaker: 'Cultists',
            text: "REVEAL YOURSELF TO US, DEMON!!",
            censorSpeaker: false,
            dialogFadeInTime: 0,
            dialogFadeOutTime: 0,
            imageFadeInTime: 0,
            imageFadeOutTime: 0,
            dialogDelayIn: 0,
            dialogDelayOut: 0,
            imageDelayIn: 0,
            imageDelayOut: 0,
            shake: true,
            shakeDuration: 250,
            shakeIntensity: 0.5
        })
        .addScene({
            image: 'https://raw.githubusercontent.com/Kidev/TCOAALDialogCreator/refs/heads/main/demo/ritual.png',
            speaker: 'Ashley',
            text: "Suckers-giving-their-souls-for-free-say-WHAT?!",
            censorSpeaker: false,
            dialogFadeInTime: 500,
            dialogFadeOutTime: 0,
            imageFadeInTime: 500,
            imageFadeOutTime: 0,
            dialogDelayIn: 500,
            dialogDelayOut: 0,
            imageDelayIn: 2000,
            imageDelayOut: 0
        })
        .addScene({
            image: 'https://raw.githubusercontent.com/Kidev/TCOAALDialogCreator/refs/heads/main/demo/what.gif',
            speaker: 'Cultists',
            text: "WHAT???",
            censorSpeaker: false,
            dialogFadeInTime: 0,
            dialogFadeOutTime: 0,
            imageFadeInTime: 0,
            imageFadeOutTime: 0,
            dialogDelayIn: 0,
            dialogDelayOut: 0,
            imageDelayIn: 0,
            imageDelayOut: 0,
            shake: true,
            shakeDuration: 500,
            shakeIntensity: 0.5
        })
        .addScene({
            image: 'https://raw.githubusercontent.com/Kidev/TCOAALDialogCreator/refs/heads/main/demo/summoned.gif',
            speaker: 'Cultists',
            text: "WHO THE HELL ARE YOU??",
            censorSpeaker: false,
            dialogFadeInTime: 0,
            dialogFadeOutTime: 0,
            imageFadeInTime: 0,
            imageFadeOutTime: 0,
            dialogDelayIn: 0,
            dialogDelayOut: 0,
            imageDelayIn: 0,
            imageDelayOut: 0,
            shake: true,
            shakeDuration: 500,
            shakeIntensity: 0.5
        })
        .addScene({
            image: 'https://raw.githubusercontent.com/Kidev/TCOAALDialogCreator/refs/heads/main/demo/summoned.gif',
            speaker: 'Ashley',
            text: "The new hire",
            censorSpeaker: false,
            dialogFadeInTime: 0,
            dialogFadeOutTime: 0,
            imageFadeInTime: 0,
            imageFadeOutTime: 0,
            dialogDelayIn: 0,
            dialogDelayOut: 0,
            imageDelayIn: 0,
            imageDelayOut: 0,
            bustRight: 'https://static.wikia.nocookie.net/coffin-of-andy-and-leyley/images/e/e6/S_chat-BUST-.png'
        })
        .addScene({
            image: 'https://raw.githubusercontent.com/Kidev/TCOAALDialogCreator/refs/heads/main/demo/summoned.gif',
            speaker: 'Cultists',
            text: "GO AWAY VILE USURPER!!",
            censorSpeaker: false,
            dialogFadeInTime: 0,
            dialogFadeOutTime: 0,
            imageFadeInTime: 0,
            imageFadeOutTime: 0,
            dialogDelayIn: 0,
            dialogDelayOut: 0,
            imageDelayIn: 0,
            imageDelayOut: 0,
            shake: true,
            shakeDuration: 500,
            shakeIntensity: 0.5
        })
        .addScene({
            image: 'https://raw.githubusercontent.com/Kidev/TCOAALDialogCreator/refs/heads/main/demo/summoned.gif',
            speaker: 'Ashley',
            text: "After you, gentlemen.",
            censorSpeaker: false,
            dialogFadeInTime: 0,
            dialogFadeOutTime: 0,
            imageFadeInTime: 0,
            imageFadeOutTime: 0,
            dialogDelayIn: 0,
            dialogDelayOut: 0,
            imageDelayIn: 0,
            imageDelayOut: 0,
            bustRight: 'https://static.wikia.nocookie.net/coffin-of-andy-and-leyley/images/8/83/S_mock-BUST-.png',
            bustFade: 0,
        })
        .addScene({
            image: 'https://raw.githubusercontent.com/Kidev/TCOAALDialogCreator/refs/heads/main/demo/summoned.gif',
            speaker: 'Ashley',
            text: "PERISH",
            censorSpeaker: false,
            dialogFadeInTime: 0,
            dialogFadeOutTime: 0,
            imageFadeInTime: 0,
            imageFadeOutTime: 0,
            dialogDelayIn: 0,
            dialogDelayOut: 0,
            imageDelayIn: 0,
            imageDelayOut: 0,
            bustRight: 'https://static.wikia.nocookie.net/coffin-of-andy-and-leyley/images/5/51/S_yell-BUST-.png',
            bustFade: 0,
            shake: true,
            shakeDuration: 250,
            shakeIntensity: 0.5
        })
        .addScene({
            image: 'https://raw.githubusercontent.com/Kidev/TCOAALDialogCreator/refs/heads/main/demo/take_souls.gif',
            speaker: '',
            text: "",
            censorSpeaker: false,
            dialogFadeInTime: 0,
            dialogFadeOutTime: 500,
            imageFadeInTime: 0,
            imageFadeOutTime: 500,
            dialogDelayIn: 0,
            dialogDelayOut: 0,
            imageDelayIn: 0,
            imageDelayOut: 0
        })
        .addScene({
            image: '',
            speaker: '???',
            text: "TaR SouL... YoU tReAd a pAtH i nEveR daRed To cHaRt",
            censorSpeaker: false,
            dialogFadeInTime: 0,
            dialogFadeOutTime: 500,
            imageFadeInTime: 0,
            imageFadeOutTime: 500,
            dialogDelayIn: 0,
            dialogDelayOut: 0,
            imageDelayIn: 0,
            imageDelayOut: 0
        })
}
