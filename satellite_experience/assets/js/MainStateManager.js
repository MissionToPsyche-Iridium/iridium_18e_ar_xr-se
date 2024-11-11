/*
 * Main State Manager class
 */

export default class MainStateManager {
    /*
     * Public methods
     */

    // Constructor
    constructor(spaceScene, mainContainer, upperButton, lowerButton, missionContentManager) {
        this._spaceScene = spaceScene;
        this._mainContainer = mainContainer;
        this._upperButton = upperButton;
        this._lowerButton = lowerButton;
        this._missionContentManager = missionContentManager;

        this.mainState = 'main';

        this._initialize();
    }

    // Update main state
    async updateMainState(newState) {
        try {
            this.mainState = newState;

            // Hide main content until its loaded
            this._mainContainer.style.display = 'none';

            // Update content based on main state
            switch (this.mainState) {
                case 'main':
                    await this._loadMainContent('main_content.html');
                    this._upperButton.textContent = 'Explore Mission';
                    this._lowerButton.textContent = 'Explore Instruments';
                    break;
                case 'mission':
                    await this._loadMainContent('mission_content.html');
                    this._upperButton.textContent = 'Back to Main';
                    this._lowerButton.textContent = 'Explore Instruments';
                    break;
                case 'instrument':
                    await this._loadMainContent('instrument_content.html');
                    this._upperButton.textContent = 'Back to Main';
                    this._lowerButton.textContent = 'Explore Mission';
                    break;
            }

            // Load content for current phase when mission state starts
            if (this.mainState === 'mission') {
                this._missionContentManager.updateMissionContent(this._spaceScene.getCurrentPhase());
            }

            // If the main state is the instrument state, start off with hidden content
            if (this.mainState !== 'instrument') {
                this._mainContainer.style.display = 'block';
            }

            // Update bubbles in space scene
            if (this._spaceScene) {
                this._spaceScene.updateState(this.mainState);
            }

        } catch (error) {
            console.error('Error loading main content:', error);
        }
    }

    /*
     * Private methods
     */

    // Initialize main state
    _initialize() {
        this._setupEventListeners();
        this.updateMainState(this.mainState);
    }

    // Setup events for state buttons
    _setupEventListeners() {
        // Upper button
        this._upperButton.addEventListener('click', () => {
            parent.playSound2();
            if (this.mainState === 'main') {
                this.updateMainState('mission');
            } else {
                this.updateMainState('main');
            }
        });

        // Lower button
        this._lowerButton.addEventListener('click', () => {
            parent.playSound2();
            if (this.mainState === 'main') {
                this.updateMainState('instrument');
            } else if (this.mainState === 'mission') {
                this.updateMainState('instrument');
            } else {
                this.updateMainState('mission');
            }
        });
    }

    // Load main content
    _loadMainContent(page) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', page, true);
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        this._mainContainer.innerHTML = xhr.responseText;
                        resolve(); // Resolve the promise when content is loaded
                    } else {
                        reject(`Failed to load content from ${page}`);
                    }
                }
            };
            xhr.send();
        });
    }
}
