export function openPopup() {
    const popup = document.getElementById("papyrus-scroll-popup");
    if (popup) {
        popup.style.visibility = "visible";
        popup.style.opacity = "1";
        setTimeout(closePopup, 5000); // Close after 5 seconds
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