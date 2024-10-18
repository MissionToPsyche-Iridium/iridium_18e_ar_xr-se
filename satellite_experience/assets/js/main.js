// Ensure DOM content has loaded
document.addEventListener("DOMContentLoaded", function() {
    // Get the modal and close button
    var helpModal = document.getElementById("help-modal");
    var modalCloseButton = document.querySelector(".modal-popup .modal-close");
    var helpModalContent = document.getElementById("help-modal-content");

    // Button to open help modal
    document.getElementById("open-help-modal-button").addEventListener("click", function() {
        openHelpModal();
    });

    // Inject the help page modal content
    function openHelpModal() {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "help_page.html", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                console.log(xhr.responseText);
                helpModalContent.innerHTML = xhr.responseText;
                helpModal.style.display = "flex"; // Show modal when content is loaded
            }
        };
        xhr.send();
    }

    // Close the help page modal
    modalCloseButton.onclick = function() {
        helpModal.style.display = "none";
    };

    // Close the help page modal if clicking out
    window.onclick = function(event) {
        if (event.target == helpModal) {
            helpModal.style.display = "none";
        }
    };

    // Track user activity
    var inactivityTime = 15000; // 15 second timer
    var inactivityTimer;

    // Open help modal if timer reaches inactivity time
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(function() {
            openHelpModal();
        }, inactivityTime)
    }

    // Events to reset the inactivity time i.e. user interaction
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    window.addEventListener('click', resetInactivityTimer);
    window.addEventListener('touchstart', resetInactivityTimer);
    window.addEventListener('scroll', resetInactivityTimer);

    // Initialize inactivity timer
    resetInactivityTimer();
});
