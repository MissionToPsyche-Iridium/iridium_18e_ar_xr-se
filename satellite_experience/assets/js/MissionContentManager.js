/*
 * Mission Content Manager class
 */

export default class MissionContentManager {
    // Constructor
    constructor(spaceScene, mainContainer) {
        this._spaceScene = spaceScene;
        this._mainContainer = mainContainer;

        this._initialize();
    }

    // Update content based on phase id
    updateMissionContent(phaseId) {
        // Content maps
        const phaseTitleMap = {
            'launch': 'Launch',
            'assist': 'Gravity Assist',
            'a': 'Orbit A',
            'b1': 'Orbit B1',
            'd': 'Orbit D',
            'c': 'Orbit C',
            'b2': 'Orbit B2',
            'end': 'End of Mission'
        };

        const phaseDescriptionMap = {
            'launch': '1',
            'assist': '2',
            'a': '3',
            'b1': '4',
            'd': '5',
            'c': '6',
            'b2': '7',
            'end': '8'
        }

        const phaseImageMap = {
            'launch': '../assets/images/spectrometers.png',
        };

        const phaseTitle = phaseTitleMap[phaseId] || 'No Title';
        const phaseDescription = phaseDescriptionMap[phaseId] || 'No description.';
        const phaseImage = phaseImageMap[phaseId] || '';

        // Content
        const phaseTitleContent = document.getElementById('phase-title');
        const phaseDescriptionContent = document.getElementById('phase-description');
        const phaseImageContent = document.getElementById('phase-image');

        // Update content
        if (phaseTitleContent && phaseDescriptionContent && phaseImageContent) {
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

            this._mainContainer.style.display = 'block';
        } else {
            console.error('Phase content elements not found.');
        }
    }

    // Initialize mission content
    _initialize() {
        // Previous Phase button
        document.addEventListener('click', (event) => {
            if (event.target.id === 'left-phase-transition-button') {
                parent.playSound2();
                this._spaceScene.prevPhase();
                this.updateMissionContent(this._spaceScene.getCurrentPhase());
            }
        });

        // Next Phase button
        document.addEventListener('click', (event) => {
            if (event.target.id === 'right-phase-transition-button') {
                parent.playSound2();
                this._spaceScene.nextPhase();
                this.updateMissionContent(this._spaceScene.getCurrentPhase());
            }
        });
    }
}
