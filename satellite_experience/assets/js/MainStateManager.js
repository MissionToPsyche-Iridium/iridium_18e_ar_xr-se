/*
 * Main State Manager class
 */

export default class MainStateManager {
    /*
     * Public methods
     */

    // Constructor
    constructor(spaceScene, mainContent, upperButton, lowerButton) {
        this._spaceScene = spaceScene;
        this._mainContent = mainContent;
        this._upperButton = upperButton;
        this._lowerButton = lowerButton;

        this.mainState = 'main';

        this._initialize();
    }

    // Update main state
    updateMainState(newState) {
        this.mainState = newState;

        // If the main state is the instrument state, start off by hiding content
        if (this.mainState === 'instrument') {
            this._mainContent.style.display = 'none';
        } else {
            this._mainContent.style.display = 'block';
        }

        // Update content based on main state
        switch (this.mainState) {
            case 'main':
                this._loadMainContent('main_content.html');
                this._upperButton.textContent = 'Explore Mission';
                this._lowerButton.textContent = 'Explore Instruments';
                break;
            case 'mission':
                this._loadMainContent('mission_content.html');
                this._upperButton.textContent = 'Back to Main';
                this._lowerButton.textContent = 'Explore Instruments';
                break;
            case 'instrument':
                this._loadMainContent('instrument_content.html');
                this._upperButton.textContent = 'Back to Main';
                this._lowerButton.textContent = 'Explore Mission';
                break;
        }

        // Update bubbles in space scene
        if (this._spaceScene) {
            this._spaceScene.updateBubbles(this.mainState);
            if (this.mainState !== 'instrument') {
                this._spaceScene.deselectBubbles();
            }
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
            if (this.mainState === 'main') {
                this.updateMainState('mission');
            } else {
                this.updateMainState('main');
            }
        });

        // Lower button
        this._lowerButton.addEventListener('click', () => {
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
        const xhr = new XMLHttpRequest();
        xhr.open('GET', page, true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                this._mainContent.innerHTML = xhr.responseText;
            }
        };
        xhr.send();
    }
}
