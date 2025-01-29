export function openPopup() {
    const popup = document.getElementById("papyrus-scroll-popup");
    if (popup) {
        popup.style.display = "block";
        setTimeout(closePopup, 20000); // Close after 20 seconds
    }
}

export function closePopup() {
    const popup = document.getElementById("papyrus-scroll-popup");
    if (popup) {
        popup.style.display = "none";
    }
}