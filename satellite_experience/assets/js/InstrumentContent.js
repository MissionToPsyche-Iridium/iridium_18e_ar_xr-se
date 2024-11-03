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
        // Content maps
        const instrumentTitleMap = {
            'spectrometer': 'Gamma Ray and Neutron Spectrometer',
            'antenna': 'X-Band High Gain Antenna',
            'test': 'Test',
        };

        const instrumentDescriptionMap = {
            'spectrometer': 'Detects gamma rays and neutrons...',
            'antenna': 'Enables high-speed communication...',
            'test': 'Description here.',
        };

        const instrumentImageMap = {
            'spectrometer': '../assets/images/spectrometers.png',
            'antenna': '../assets/images/antenna.png',
            'test': '',
        };

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
