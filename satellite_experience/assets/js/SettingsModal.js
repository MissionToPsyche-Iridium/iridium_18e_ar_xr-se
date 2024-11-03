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
        this.themeLink = '../assets/css/styles.css';

        this._initialize();
    }

    // Close settings modal
    close() {
        this.settingsModal.style.display = 'none';
    }

    /*
     * Private methods
     */

    // Initialize settings modal events
    _initialize() {
        // Icon button
        this.settingsIconButton.addEventListener('click', () => this._loadSettingsModalContent());
        
        // Close button
        document.addEventListener('click', (event) => {
            if (event.target.id === 'settings-modal-close') {
                this.close();
            }
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
                this._setupThemeSettings();
            }
        };
        xhr.send();
    }

    // Setup theme settings
    _setupThemeSettings() {
        const settingThemeLink = document.getElementById('setting-theme');
        const radioSetting = document.querySelectorAll('input[name="setting"]');
        settingThemeLink.href = this.themeLink;

        radioSetting.forEach(radio => {
            radio.addEventListener('change', () => {
                if (document.getElementById('default-mode').checked) {
                    settingThemeLink.href = '../assets/css/styles.css';
                    this.themeLink = '../assets/css/styles.css';
                } else if (document.getElementById('high-contrast-mode').checked) {
                    settingThemeLink.href = '../assets/css/high_contrast_mode.css';
                    this.themeLink = '../assets/css/high_contrast_mode.css';
                } else if (document.getElementById('light-mode').checked) {
                    settingThemeLink.href = '../assets/css/light_mode.css';
                    this.themeLink = '../assets/css/light_mode.css';
                } else if (document.getElementById('color-blind-mode').checked) {
                    // Implement color-blind mode if needed
                }
            });
        });
    }
}
