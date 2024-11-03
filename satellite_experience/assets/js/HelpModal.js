/*
 * Help Modal class
 */

export default class HelpModal {
    /*
     * Public methods
     */

    // Constructor
    constructor(inactivityTime = 60000) {
        this._helpModal = document.getElementById('help-modal');
        this._helpModalContent = document.getElementById('help-modal-content');
        this._helpIconButton = document.getElementById('help-icon-button');
        this._inactivityTime = inactivityTime;

        this.inactivityTimer = null;

        this._initialize();
    }

    // Close help modal
    close() {
        this._helpModal.style.display = 'none';
    }

    /*
     * Private methods
     */

    // Initialize help modal
    _initialize() {
        // Icon button
        this._helpIconButton.addEventListener('click', () => this._loadHelpModalContent());
        
        // Close button
        document.addEventListener('click', (event) => {
            if (event.target.id === 'help-modal-close') {
                this.close();
            }
        });

        // Inactivity timer
        this._setupInactivityTimer();
    }

    // Load help modal content
    _loadHelpModalContent() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'help_modal.html', true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                this._helpModalContent.innerHTML = xhr.responseText;
                this._helpModal.style.display = 'flex';
            }
        };
        xhr.send();
    }

    // Start inactivity timer
    _setupInactivityTimer() {
        const resetTimer = () => {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = setTimeout(() => {
                if (document.getElementById('settings-modal').style.display !== 'flex') {
                    this._loadHelpModalContent();
                }
            }, this._inactivityTime);
        };

        ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'].forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        resetTimer();
    }
}
