// Ensure DOM content has loaded
document.addEventListener("DOMContentLoaded", function() {
    // Get modal and close button
    var modal = document.getElementById("helpModal");
    var closeButton = document.querySelector(".modal .close");
    var helpContent = document.getElementById("helpContent");

    // Open the help page modal
    document.getElementById("openHelpButton").addEventListener("click", function() {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "help_page.html", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                helpContent.innerHTML = xhr.responseText;
                modal.style.display = "block"; // Show modal when content is loaded
            }
        };
        xhr.send();
    });

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
});
