/*
 * Instrument Content Manager class
 */

export default class InstrumentContentManager {
    // Constructor
    constructor(spaceScene, mainContainer) {
        this._spaceScene = spaceScene;
        this._mainContainer = mainContainer;
        this._currentBubble = 0;
        this._instrumentIds = ['spectrometer', 'antenna', 'imager', 'communication', 'detection'];

        this._initialize();
    }

    // Close instrument content
    close() {
        this._mainContainer.style.display = 'none';
        this._spaceScene.deselectBubbles();
    }

    // Update content based on bubble id
    updateInstrumentContent(bubbleId) {
        // Maps for instruments
        const instrumentTitleMap = {};
        const instrumentDescriptionMap = {};
        const instrumentImageMap = {};

        console.log("here");
        console.log(bubbleId);

        this._currentBubble = this._instrumentIds.indexOf(bubbleId);

        fetch('../assets/data/instruments.json')
            .then(response => response.json())
            .then(data => {
                // load instruments info
                for (const key of data) {
                    instrumentTitleMap[String(key.name)] = key.title;
                    instrumentDescriptionMap[String(key.name)] = key.description;
                    instrumentImageMap[String(key.name)] = key.img;
                }

                const instrumentTitle = instrumentTitleMap[bubbleId] || 'No Title';
                const instrumentDescription = instrumentDescriptionMap[bubbleId] || 'No description.';
                const instrumentImage = instrumentImageMap[bubbleId] || '';

                // Content
                const instrumentTitleContent = document.getElementById('instrument-title');
                const instrumentDescriptionContent = document.getElementById('instrument-description');
                const instrumentImageContent = document.getElementById('instrument-image');

                // Update content
                if (instrumentTitleContent && instrumentDescriptionContent && instrumentImageContent) {
                    instrumentTitleContent.textContent = instrumentTitle;
                    instrumentDescriptionContent.textContent = instrumentDescription;

                    if (instrumentImage) {
                        instrumentImageContent.src = instrumentImage;
                        instrumentImageContent.alt = instrumentTitle;
                        instrumentImageContent.style.display = 'block';
                    } else {
                        instrumentImageContent.src = '';
                        instrumentImageContent.alt = '';
                        instrumentImageContent.style.display = 'none';
                    }

                    this._mainContainer.style.display = 'block';
                } else {
                    console.error('Instrument content elements not found.');
                }
            })
            .catch(error => console.error('Error Could not parse instruments.json:', error));
    }

    // Initialize instrument content
    _initialize() {
        // Close button
        document.addEventListener('click', (event) => {
            const instrumentImageContent = document.getElementById('instrument-image');
            if (instrumentImageContent !== null
                && instrumentImageContent.style.display === 'block'
                && (!event.target.id
                    || event.target.id === 'instrument-modal-close')) {
                parent.playSound3();
                this.close();
            }
        });

        document.addEventListener('click', (event) => {
            if (event.target.id === 'left-instrument-transition-button') {
                parent.playSound2();
                this._currentBubble -= 1;
                if (this._currentBubble > 5) {
                    this._currentBubble = 0;
                } else if (this._currentBubble < 0) {
                    this._currentBubble = 4;
                }
                this.updateInstrumentContent(this._instrumentIds[this._currentBubble]);
            }
        });

        document.addEventListener('click', (event) => {
            if (event.target.id === 'right-instrument-transition-button') {
                parent.playSound2();
                this._currentBubble += 1;
                if (this._currentBubble > 4) {
                    this._currentBubble = 0;
                } else if (this._currentBubble < 0) {
                    this._currentBubble = 4;
                }
                this.updateInstrumentContent(this._instrumentIds[this._currentBubble]);
            }
        });
    }
}
