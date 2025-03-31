import incrementProgressBar from './progressBar.js';

incrementProgressBar(0);

const telescopeBackground = document.getElementById("telescopeBg");
import {AudioManager} from "./AudioManager.js";

function telescopeClickedHandler() {
    incrementProgressBar(1);
    window.location.href = '../pages/main_page.html'
}

telescopeBackground.addEventListener('click', telescopeClickedHandler)

var opacity = 0;
var intervalID = 0;
var scroll = document.getElementById("scroll");
var clickDialog = document.getElementById("scrollClick");
var blinkIn = 0;
window.onload = fadeIn;

function fadeIn() {
    audioLoad();
    clearInterval(intervalID);
    intervalID = setInterval(showScroll, 10);
}

function audioLoad() {
        const audioManager = new AudioManager("context");
        audioManager.play();
        audioManager.setVolume(0.5);
}

function fadeOut() {
    clearInterval(intervalID);
    intervalID = setInterval(hideScroll, 10);
}

function blink() {
    clearInterval(intervalID);
    intervalID = setInterval(blinkTelescope, 10);
}

function showScroll() {
    opacity = Number(window.getComputedStyle(scroll)
        .getPropertyValue("opacity"));
    if (opacity < 1) {
        opacity += 0.005;
        scroll.style.opacity = opacity;
    } else {
        clearInterval(intervalID);
        setTimeout(fadeOut, 3000);
    }
}

function hideScroll() {
    opacity = Number(window.getComputedStyle(scroll)
        .getPropertyValue("opacity"));
    if (opacity > 0) {
        opacity -= 0.005;
        scroll.style.opacity = opacity;
    } else {
        clearInterval(intervalID);
        intervalID = setInterval(blinkTelescope, 75);
        clickDialog.style.opacity = 1;
    }
}

function blinkTelescope() {
    const currentColor = window.getComputedStyle(telescopeBackground).getPropertyValue("background-color");
    const rgba = currentColor.match(/rgba?\((\d+), (\d+), (\d+), ([\d.]+)\)/);
    let opacity;

    if (rgba) {
        opacity = parseFloat(rgba[4]);
    } else {
        opacity = .99;
        blinkIn = 1;
    }

    if (opacity < 1 && blinkIn === 0) {
        opacity += 0.05;
        if (opacity >= 1) {
            blinkIn = 1;
            opacity = 1;
        }
        telescopeBackground.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
    } else {
        opacity -= 0.05;
        if (opacity <= 0) {
            blinkIn = 0;
            opacity = 0;
        }
        telescopeBackground.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
    }
}
