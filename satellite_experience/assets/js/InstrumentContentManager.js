/*
 * Instrument Content Manager class
 */

export default class InstrumentContentManager {
    // Constructor
    constructor(spaceScene, mainContainer) {
        this._spaceScene = spaceScene;
        this._mainContainer = mainContainer;

        this._initialize();
    }

    // Close instrument content
    close() {
        this._mainContainer.style.display = 'none';
        this._spaceScene.deselectBubbles();
    }

    // Update content based on bubble id
    updateInstrumentContent(bubbleId) {
        // Content maps
        const instrumentTitleMap = {
            'spectrometer': 'Gamma Ray and Neutron Spectrometer',
            'antenna': 'X-Band High Gain Antenna',
            'imager': 'Multispectral Imager',
            'communication': 'Deep Space Optical Communication',
            'detection': 'Magnetometer',
        };

        const instrumentDescriptionMap = {
            'spectrometer': 'Detects gamma rays and neutrons that are emitted when cosmic rays interact with atoms. Measuring these emissions will identify the composition of the asteroid without direct sampling.',
            'antenna': 'Enables high-speed communication with Earth. The dish shaped antenna is aimed precisely at earth and transmits images and telemetry using X-Band frequency across the vastness of space.',
            'imager': 'Provides high-resolution images using filters to discriminate between Psyche’s metallic and silicate constituents. The instrument consists of a pair of identical cameras designed to acquire geologic, compositional, and topographic data.',
            'communication': 'A sophisticated new laser communication technology that encodes data in photons (rather than radio waves) to communicate between a probe in deep space and Earth. Using light instead of radio allows the spacecraft to communicate more data in a given amount of time.',
            'detection': 'Designed to detect and measure the remanent magnetic field of the asteroid. It is composed of two identical high-sensitivity magnetic field sensors located at the middle and outer end of a 6-foot (2-meter) boom.',
        }

        const instrumentImageMap = {
            'spectrometer': '../assets/images/spectrometers.png',
            'antenna': '../assets/images/antenna.png',
            'imager': '../assets/images/instruments/multispectral-imager.jpg',
            'communication': '../assets/images/instruments/psyche-dsoc.jpg',
            'detection': '../assets/images/instruments/psyche-magnetometer.jpg',
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

            this._mainContainer.style.display = 'block';
        } else {
            console.error('Instrument content elements not found.');
        }
    }

    // Initialize instrument content
    _initialize() {
        // Close button
        document.addEventListener('click', (event) => {
            if (event.target.id === 'instrument-modal-close') {
                parent.playSound3();
                this.close();
            }
        });
    }
}
