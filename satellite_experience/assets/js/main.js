// Ensure DOM content has loaded
document.addEventListener("DOMContentLoaded", function() {
    // Get modal and close button
    var modal = document.getElementById("helpModal");
    var closeButton = document.querySelector(".modal .close");
    var helpContent = document.getElementById("helpContent");

    // Open the help page modal when loaded
    document.getElementById("openHelpButton").addEventListener("click", function() {
        openHelpModal();
    });

    // Open the help page modal
    function openHelpModal() {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "help_page.html", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                helpContent.innerHTML = xhr.responseText;
                modal.style.display = "block"; // Show modal when content is loaded
            }
        };
        xhr.send();
    }

    // Close the help page modal
    closeButton.onclick = function() {
        modal.style.display = "none";
    };

    // Close the help page modal if clicking out
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
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
