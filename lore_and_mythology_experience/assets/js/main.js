/**
 * Handle the context section of the AMP phase.
 */
import showContext from './ContextModal.js';

/**
 * Create the scene for the asteroid search mini game.
 */
import launchScene from './SceneManager.js';

/**
 * Increment a progress bar UI element as steps in the scene are loaded.
 */
import incrementProgressBar from './progressBar.js';

incrementProgressBar(1);

window.onload = async () => {
    // Wait for the user to click on the telescope background in the context modal.
    await showContext();
    
    // After the modal is dismissed, start the fade in (and subsequent animations).
    launchScene();
};
