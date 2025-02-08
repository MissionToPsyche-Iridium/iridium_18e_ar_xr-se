/*
 * Settings Modal class
 */

export default class SettingsModal {
    /*
     * Public methods
     */

    // Constructor
    constructor() {
        this.settingsModal = document.getElementById('settings-modal');
        this.settingsModalContent = document.getElementById('settings-modal-content');
        this.settingsIconButton = document.getElementById('settings-icon-button');
        this.cssFile = document.createElement("link");
        this.cssFile.rel = "stylesheet";

        this._initialize();
    }

    // Close settings modal
    close() {
        this.settingsModal.style.display = 'none';
        window.scopeDisabled = false;
    }

    /*
     * Private methods
     */

    // Initialize settings modal events
    _initialize() {
        // Icon button
        this.settingsIconButton.addEventListener('click', () => this._loadSettingsModalContent());
        localStorage.setItem('theme', "default-mode");

        // Close button
        document.addEventListener('click', (event) => {
            const container = document.getElementById('modal-container-id');
            if (this.settingsModal && this.settingsModal.style.display !== 'none') {
                if (event.target.id === 'settings-modal-close' || 
                    (container && !container.contains(event.target))) {
                    this.close();
                }
            }
        });
    }

    applyAMPIModalStyles() {
        const modalPopup = this.settingsModal.querySelector('.modal-popup');
        if (!modalPopup) return;
        modalPopup.style.backgroundImage = 'none';
        modalPopup.style.backgroundColor = 'rgba(229, 243, 255, 0.9)';
        modalPopup.style.borderRadius = '15px';
        modalPopup.style.fontFamily = 'Arial, Helvetica, sans-serif';

        const modalLogoContainer = this.settingsModal.querySelector('.modal-logo-container');
        if (!modalLogoContainer) return;
        modalLogoContainer.style.top = '10';
        modalLogoContainer.style.left = '10';

        const modalClose = this.settingsModal.querySelector('.modal-close');
        if (!modalClose) return;
        modalClose.style.top = '10';
        modalClose.style.right = '10';

        const modalContent = this.settingsModal.querySelector('.modal-content');
        if (!modalContent) return;
        modalContent.style.maxWidth = '90%';
        modalContent.style.marginLeft = '0';
        modalContent.style.margin = '0 auto';
        modalContent.style.display = 'block'
        modalContent.style.textAlign = 'center';
    
        const textBlocks = modalPopup.querySelectorAll('.modal-text');
        textBlocks.forEach(tb => {
          tb.style.color = '#333';
        });
    }

    // Load settings modal content
    _loadSettingsModalContent() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'settings_modal.html', true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                this.settingsModalContent.innerHTML = xhr.responseText;
                this.settingsModal.style.display = 'flex';
                window.scopeDisabled = true;
                this._setupThemeSettings();
            }
        };
        xhr.send();
    }

    // Setup theme settings
    _setupThemeSettings() {
        const settingThemeLink = document.getElementById('setting-theme');
        const radioSetting = document.querySelectorAll('input[name="setting"]');
        const savedSelection = localStorage.getItem('theme');
        const button0 = document.getElementById("button0");
        const button1 = document.getElementById("button1");
        const button2 = document.getElementById("button2");
        const button3 = document.getElementById("button3");
        if (savedSelection) {
            const radioToSelect = document.querySelector(`input[name="setting"][value="${savedSelection}"]`);
            if (radioToSelect) {
                radioToSelect.checked = true;
            }
        }

        radioSetting.forEach(radio => {
            radio.addEventListener('change', () => {
                if (document.getElementById('default-mode').checked) {
                    this.cssFile.href = '../assets/css/styles.css';
                    localStorage.setItem('theme', "default-mode");
                } else if (document.getElementById('high-contrast-mode').checked) {
                    this.cssFile.href = '../assets/css/high_contrast_mode.css';
                    localStorage.setItem('theme', "high-contrast-mode");
                } else if (document.getElementById('light-mode').checked) {
                    this.cssFile.href = '../assets/css/light_mode.css';
                    localStorage.setItem('theme', "high-mode");
                } else if (document.getElementById('color-blind-mode').checked) {
                    this.cssFile.href = '../assets/css/color_blind_mode.css';
                    localStorage.setItem('theme', "color-blind-mode");
                }
                document.head.appendChild(this.cssFile);
            });
        });

        // Volume Settings
        const volumeSlider = document.getElementById("volume-slider");

        // event listener for changes in volume slider
        volumeSlider.addEventListener("input", function() {
            const volumeValue = volumeSlider.value;

            localStorage.setItem("volumeSetting", volumeValue);
        });

        button0.addEventListener('click', () => document.getElementById('default-mode').click());
        button1.addEventListener('click', () => document.getElementById('high-contrast-mode').click());
        button2.addEventListener('click', () => document.getElementById('light-mode').click());
        button3.addEventListener('click', () => document.getElementById('color-blind-mode').click());
    }
}
