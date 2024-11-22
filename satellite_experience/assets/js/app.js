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



    const helpModal = new HelpModal();
    // Initialize SpaceScene
    let spaceScene = new SpaceScene({
        updateInstrumentContent: (id) => instrumentContentManager.updateInstrumentContent(id),
    }, helpModal);

    // Initialize UI
    const instrumentContentManager = new InstrumentContentManager(spaceScene, mainContainer);
    const missionContentManager = new MissionContentManager(spaceScene, mainContainer);
    const settingsModal = new SettingsModal();
    const mainStateManager = new MainStateManager(spaceScene, mainContainer, upperButton, lowerButton, missionContentManager);

    // Volume
    // set initial volume from local storage
    const savedVolume = localStorage.getItem("volumeSetting");
    if (savedVolume !== null) {
        // volumeSlider.value = savedVolume;
        parent.setVolume(savedVolume / 100);
    } else {
        parent.setVolume(0.5);
    }


    // Connect settings modal to help modal inactivity timer
    settingsModal.resetInactivityTimer = () => helpModal._setupInactivityTimer();
});
