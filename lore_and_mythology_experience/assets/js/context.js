const telescope = document.getElementById("telescope");

function telescopeClickedHandler() {
    window.location.href = '../pages/main_page.html'
}

telescope.addEventListener('click', telescopeClickedHandler)

var opacity = 0;
var intervalID = 0;
var scroll = document.getElementById("scroll");
var clickDialog = document.getElementById("scrollClick");
var telescopeBackground = document.getElementById("telescopeBg");
var blinkIn = 0;
window.onload = fadeIn;

function fadeIn() {
    clearInterval(intervalID);
    intervalID = setInterval(showScroll, 10);
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
    var currentColor = window.getComputedStyle(telescopeBackground).getPropertyValue("background-color");
    var rgba = currentColor.match(/rgba?\((\d+), (\d+), (\d+), ([\d.]+)\)/);
    var opacity;

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
