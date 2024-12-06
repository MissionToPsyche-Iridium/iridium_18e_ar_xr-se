/*
 * Mission Content Manager class
 */

export default class MissionContentManager {
    // Constructor
    constructor(spaceScene, mainContainer) {
        this._spaceScene = spaceScene;
        this._mainContainer = mainContainer;
        this._phaseIds = ['launch', 'assist', 'a', 'b1', 'd', 'c', 'b2', 'end'];

        this._initialize();
    }

    // Update content based on phase id
    updateMissionContent(phaseId) {
        // Maps for phases
        const phaseTitleMap = {};
        const phaseDescriptionMap = {};
        const phaseImageMap = {};
        const phaseVideoMap = {};

        this._currentBubble = this._phaseIds.indexOf(phaseId);
        this._spaceScene.click(phaseId);

        fetch('../assets/data/phases.json')
            .then(response => response.json())
            .then(data => {
                // load phases info
                for (const key of data) {
                    phaseTitleMap[String(key.name)] = key.title;
                    phaseDescriptionMap[String(key.name)] = key.description;
                    phaseImageMap[String(key.name)] = key.img;
                    phaseVideoMap[String(key.name)] = key.video;
                }

                const phaseTitle = phaseTitleMap[phaseId] || 'No Title';
                const phaseDescription = phaseDescriptionMap[phaseId] || 'No description.';
                const phaseImage = phaseImageMap[phaseId] || '';
                const phaseVideo = phaseVideoMap[phaseId] || '';

                // Content
                const phaseTitleContent = document.getElementById('phase-title');
                const phaseDescriptionContent = document.getElementById('phase-description');
                const phaseImageContent = document.getElementById('phase-image');
                const phaseVideoContent = document.getElementById('phase-video');

                // Update content
                if (phaseTitleContent && phaseDescriptionContent && phaseImageContent && phaseVideoContent) {
                    phaseTitleContent.textContent = phaseTitle;
                    phaseDescriptionContent.textContent = phaseDescription;

                    if (phaseImage) {
                        phaseImageContent.src = phaseImage;
                        phaseImageContent.alt = phaseTitle;
                        phaseImageContent.style.display = 'block';
                    } else {
                        phaseImageContent.src = '';
                        phaseImageContent.alt = '';
                        phaseImageContent.style.display = 'none';
                    }

                    if (phaseVideo) {
                        phaseVideoContent.src = phaseVideo;
                        phaseVideoContent.alt = phaseTitle;
                        phaseVideoContent.style.display = 'block';
                        // window.sfxManager.initializeYouTubePlayerIfNeeded('phase-video');
                    } else {
                        phaseVideoContent.src = '';
                        phaseVideoContent.alt = '';
                        phaseVideoContent.style.display = 'none';
                    }

                    this._mainContainer.style.display = 'block';
                } else {
                    console.error('Mission content elements not found.');
                }
            })
            .catch(error => console.error('Error Could not parse phases.json:', error));
    }

    // Initialize mission content
    _initialize() {
        // Previous Phase button
        document.addEventListener('click', (event) => {
            if (event.target.id === 'left-phase-transition-button') {
                window.sfxManager.playSound("select");
                this._spaceScene.prevPhase();
                this.updateMissionContent(this._spaceScene.getCurrentPhase());
            }
        });

        // Next Phase button
        document.addEventListener('click', (event) => {
            if (event.target.id === 'right-phase-transition-button') {
                window.sfxManager.playSound("select");
                this._spaceScene.nextPhase();
                this.updateMissionContent(this._spaceScene.getCurrentPhase());
            }
        });
    }
}
