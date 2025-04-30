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
                    window.sfxManager.playSound("close");
                    this.close();
                }
            }
        });
    }

    // Load settings modal content
    _loadSettingsModalContent() {
        window.sfxManager.playSound("open");
        triggered("settings");
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
                window.sfxManager.playSound("select");
                if (document.getElementById('default-mode').checked) {
                    this.cssFile.href = '../assets/css/styles.css';
                    localStorage.setItem('theme', "default-mode");
                    triggered("default-mode");
                } else if (document.getElementById('high-contrast-mode').checked) {
                    this.cssFile.href = '../assets/css/high_contrast_mode.css';
                    localStorage.setItem('theme', "high-contrast-mode");
                    triggered("high-contrast-mode");
                } else if (document.getElementById('light-mode').checked) {
                    this.cssFile.href = '../assets/css/light_mode.css';
                    localStorage.setItem('theme', "high-mode");
                    triggered("high-mode");
                } else if (document.getElementById('color-blind-mode').checked) {
                    this.cssFile.href = '../assets/css/color_blind_mode.css';
                    localStorage.setItem('theme', "color-blind-mode");
                    triggered("color-blind-mode");
                }
                document.head.appendChild(this.cssFile);
            });
        });

        // Volume Settings
        const volumeSlider = document.getElementById("volume-slider");
        // set initial volume from local storage
        const savedVolume = localStorage.getItem("volumeSetting");
        if (savedVolume !== null) {
            volumeSlider.value = savedVolume;
            window.sfxManager.setVolume(savedVolume / 100);
        } else {
            window.sfxManager.setVolume(volumeSlider.value / 100);
        }
        // event listener for changes in volume slider
        volumeSlider.addEventListener("input", function() {
            const volumeValue = volumeSlider.value;
            window.sfxManager.setVolume(volumeValue / 100);
            localStorage.setItem("volumeSetting", volumeValue);
            triggered("volume");
        });

        button0.addEventListener('click', () => document.getElementById('default-mode').click());
        button1.addEventListener('click', () => document.getElementById('high-contrast-mode').click());
        button2.addEventListener('click', () => document.getElementById('light-mode').click());
        button3.addEventListener('click', () => document.getElementById('color-blind-mode').click());
    }
}
