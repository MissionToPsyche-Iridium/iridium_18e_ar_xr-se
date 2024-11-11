/*
 * Instrument Content class
 */

export default class InstrumentContent {
    // Constructor
    constructor(mainContent) {
        this._mainContent = mainContent;

        this._initialize();
    }

    // Close instrument content
    close() {
        this._mainContent.style.display = 'none';
    }

    // Update content based on bubble id
    updateInstrumentContent(bubbleId) {
        // Maps for instruments
        const instrumentTitleMap = {};
        const instrumentDescriptionMap = {};
        const instrumentImageMap = {};

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

                    this._mainContent.style.display = 'block';
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
            if (event.target.id === 'instrument-modal-close') {
                this.close();
            }
        });
    }
}
