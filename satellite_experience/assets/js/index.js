

function onClick() {
    //window.location.href = "main_page.html";
    sound.src = "../audio/launch.mp3";

    var iframe = document.createElement('iframe');
    iframe.style = "position: fixed; top: 0px; bottom: 0px; right: 0px; width: 100%; border: none; margin: 0; padding: 0; overflow: hidden; z-index: 999999; height: 100%;";
	iframe.src = "../pages/main_page.html";
	document.body.appendChild(iframe);

    var duration;
    function loop() {
        sound.currentTime = 10;
        duration = setTimeout(loop, 62000);
    }
    setTimeout(function() {
        loop();
    }, 72000);
}

const fadeInSections = document.querySelectorAll('.fade-in-section');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.4 }); 


fadeInSections.forEach(section => {
    observer.observe(section);
});
