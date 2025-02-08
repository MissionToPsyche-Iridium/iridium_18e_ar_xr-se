export function openPopup() {
    const popup = document.getElementById("papyrus-scroll-popup");
    if (popup) {
        popup.style.visibility = "visible";
        popup.style.opacity = "1";
        setTimeout(closePopup, 1500); // Close after 1.5 second
    }
}

export function closePopup() {
    const popup = document.getElementById("papyrus-scroll-popup");
    if (popup) {
        popup.style.visibility = "hidden";
        popup.style.opacity = "0";
    }

    const mainTitle = document.querySelector(".main-title");
    if (mainTitle) {
        mainTitle.style.visibility = "visible";
        mainTitle.style.opacity = "1";
    }
}