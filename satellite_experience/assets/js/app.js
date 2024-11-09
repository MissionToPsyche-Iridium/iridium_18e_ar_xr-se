import SpaceScene from './SpaceScene.js';
import MainStateManager from './MainStateManager.js';
import HelpModal from './HelpModal.js';
import SettingsModal from './SettingsModal.js';
import InstrumentContent from './InstrumentContent.js';

window.addEventListener("DOMContentLoaded", () => {
    // Main elements
    const mainContent = document.getElementById('main-content');
    const upperButton = document.getElementById('upper-button');
    const lowerButton = document.getElementById('lower-button');

    // Initialize SpaceScene
    let spaceScene = new SpaceScene({
        updateInstrumentContent: (id) => instrumentContent.updateInstrumentContent(id)
    });

    // Initialize UI
    const mainStateManager = new MainStateManager(spaceScene, mainContent, upperButton, lowerButton);
    const instrumentContent = new InstrumentContent(mainContent);
    const helpModal = new HelpModal();
    const settingsModal = new SettingsModal();

    // Connect settings modal to help modal inactivity timer
    settingsModal.resetInactivityTimer = () => helpModal._setupInactivityTimer();
});
