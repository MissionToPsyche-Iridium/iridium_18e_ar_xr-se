/**
 * showLaunch.js
 * @author Nicole Garcia, Emily Dinaro
 */

import incrementProgressBar from '../progressBar.js';

/**
 * showLaunch
 * Display Psyche satellite launch video
 * Takes in a callback function so that phases display only when the prior one is completed
 *
 * To replace the embeded YouTube video with another one, replace the iframe code in showLaunch with the
 * corresponding embeded iframe code for the new YouTube video.
 * @param launchBool boolean used to determine if this phase should run
 * @param audioManager handles audio
 * @param callback used to determine when phase is complete
 */
export default function showLaunch(launchBool, audioManager, callback) {
    audioManager.stopPlaying(); // pause the background audio during the launch video
    console.log('Transitioning to satellite launch');
    if (!launchBool) {
        const launchDiv = document.createElement("div");
        launchDiv.setAttribute("id", "launch-modal");
        launchDiv.setAttribute("style", "display: flex; align-items: center; justify-content: center;" +
            " position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%;" +
            " background-color: rgba(0, 0, 0, 0.8); overflow: hidden; transition: 1.5s; font-family: 'Comfortaa', Arial, sans-serif;");


        const iframe = document.createElement("iframe");
        iframe.setAttribute("width", "800");  // Set a reasonable default size
        iframe.setAttribute("height", "450");
        iframe.setAttribute("src", "https://www.youtube.com/embed/wnAhR6AaUsI?autoplay=1&enablejsapi=1");
        iframe.setAttribute("title", "YouTube video player");
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
        iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("allow", "autoplay");

        launchDiv.appendChild(iframe);
        document.body.appendChild(launchDiv);

        // YouTube Iframe API
        let player;
        window.onYouTubeIframeAPIReady = function() {
            player = new YT.Player(iframe, {
                events: {
                    'onStateChange': onPlayerStateChange
                }
            });
        };

        /**
         * onPlayerStateChange
         * Determines when the video state changes and uses the callback function
         * to transition the applicaiton to the next phase.
         * @param event
         */
        function onPlayerStateChange(event) {
            // video finished
            if (event.data === YT.PlayerState.ENDED) {
                document.getElementById("launch-modal").remove();
                launchBool = false;
                incrementProgressBar(15);
                callback();  // transition to next function when video ends
            }
        }

        // load YouTube Iframe API script to determine when video ends
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(script);

    } else {
        const modal = document.getElementById("launch-modal");
        if (modal) {
            modal.remove();
        }
        launchBool = false;
        incrementProgressBar(15);
        callback();
    }
}
