/**
 * Handle the context section of the AMP phase.
 */
import showContext from './ContextModal.js';

/**
 * Create the scene for the asteroid search mini game.
 */
import launchScene from './SceneManager.js';

window.onload = async () => {
    try {
        // Wait for the user to click on the telescope background in the context modal.
        await showContext();
        // After the modal is dismissed, start the fade in (and subsequent animations).
        launchScene();
    } catch (error) {
        console.error("Error during intro sequence:", error);
    }
};
    // Wait for the user to click on the telescope background in the context modal.
    await showContext();

    // After the modal is dismissed, start the fade in (and subsequent animations).
    launchScene();
};
