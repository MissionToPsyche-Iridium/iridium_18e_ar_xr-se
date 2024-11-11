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
                parent.playSound3();
                this.close();
            }
        });

        // Inactivity timer
        this._setupInactivityTimer();
    }

    // Load help modal content
    _loadHelpModalContent() {
        parent.playSound1();
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'help_modal.html', true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                this._helpModalContent.innerHTML = xhr.responseText;
                this._helpModal.style.display = 'flex';
                this._selectIcons();
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

    _selectIcons() {
        const zoomOutIcon = ["../assets/images/zoom_out_icon.png", "../assets/images/zoom_out_icon_v2.png"];
        const zoomInIcon = ["../assets/images/zoom_in_icon.png", "../assets/images/zoom_in_icon_v2.png"];
        const swipeIcon = ["../assets/images/swipe_icon.png", "../assets/images/swipe_icon_v2.png"];
        const tapIcon = ["../assets/images/tap_explore_icon.png", "../assets/images/tap_explore_icon_v2.png"];

        const savedSelection = localStorage.getItem('theme');
        if (savedSelection) {
            let index = 1;
            if (savedSelection == "default-mode" || savedSelection == "high-contrast-mode") {
                index = 0;
            }
            document.getElementById("zoom-out-icon").src = zoomOutIcon[index];
            document.getElementById("zoom-in-icon").src = zoomInIcon[index];
            document.getElementById("swipe-icon").src = swipeIcon[index];
            document.getElementById("tap-icon").src = tapIcon[index];
        }
    }
}
