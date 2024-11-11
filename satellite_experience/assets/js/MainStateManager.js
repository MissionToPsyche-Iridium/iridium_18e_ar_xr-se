/*
 * Main State Manager class
 */

async function findDistanceByDateFromFile(targetDate) {
    try {
        const response = await fetch("../assets/xml/distance.xml");
        const xmlText = await response.text();

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");

        const xpathExpression = `/PsycheDistanceDatabase/entry[date='${targetDate}']`;

        const xpathResult = xmlDoc.evaluate(xpathExpression, xmlDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        const entryNode = xpathResult.singleNodeValue;

        if (entryNode) {
            const distanceNode = entryNode.querySelector("distance");
            return distanceNode ? distanceNode.textContent : null;
        }

        return null;
    } catch (error) {
        console.error("Error reading XML file:", error);
        return null;
    }

}
function getCurrentDateFormatted() {
    const date = new Date();

    const year = date.getFullYear();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

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

    _loadMainContent(page) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', page, true);
        xhr.onreadystatechange = async () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                this._mainContent.innerHTML = xhr.responseText;
                const distanceTag = this._mainContent.querySelector("#distanceTag");
                if (distanceTag) {
                    let text = "Distance Traveled ";
                    let distance1 = findDistanceByDateFromFile(getCurrentDateFormatted());
                    let outOf = "/";
                    let distance2 = findDistanceByDateFromFile("2029-Jun-16");
                    let units = " Million Kilometers";
                    text = text.concat(await distance1, outOf, await distance2, units)
                    distanceTag.textContent = text;
                }
            }
        };
        xhr.send();
    }
}
