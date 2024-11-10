import SpaceScene from './SpaceScene.js';
import MainStateManager from './MainStateManager.js';
import HelpModal from './HelpModal.js';
import SettingsModal from './SettingsModal.js';
import InstrumentContentManager from './InstrumentContentManager.js';
import MissionContentManager from './MissionContentManager.js';

window.addEventListener("DOMContentLoaded", () => {
    // Main elements
    const mainContainer = document.getElementById('main-container');
    const upperButton = document.getElementById('upper-button');
    const lowerButton = document.getElementById('lower-button');

    // Initialize SpaceScene
    let spaceScene = new SpaceScene({
        updateInstrumentContent: (id) => instrumentContentManager.updateInstrumentContent(id),
    });

    // Initialize UI
    const instrumentContentManager = new InstrumentContentManager(spaceScene, mainContainer);
    const missionContentManager = new MissionContentManager(spaceScene, mainContainer);
    const helpModal = new HelpModal();
    const settingsModal = new SettingsModal();
    const mainStateManager = new MainStateManager(spaceScene, mainContainer, upperButton, lowerButton, missionContentManager);

    // Connect settings modal to help modal inactivity timer
    settingsModal.resetInactivityTimer = () => helpModal._setupInactivityTimer();
});
