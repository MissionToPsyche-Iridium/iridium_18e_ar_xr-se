// html elements
const asteroid = document.getElementById("asteroid");
const chrysalis = document.getElementById("chrysalis");
const chrysalis2 = document.getElementById("chrysalis2");
const butterfly = document.getElementById("butterfly");
const butterfly2 = document.getElementById("butterfly2");
const scrollContainer = document.querySelector(".scroll-container");
const scrollText = document.querySelector(".scroll-text");

// second scroll text
const text2 = "In Greek mythology, the breath of life leaves as someone dies and is represented as a butterfly leaving its chrysalis.This breath of life is called Psyche."

// hide images
butterfly.style.display = "none";
butterfly2.style.display = "none";
chrysalis2.style.display = "none";

// Transisition Times
let transistionTime1 = 3000;
let transistionTime2 = 6000;
let transistionTime3 = 9000;

// First transisition after 30 seconds
setTimeout(() => {
    butterfly.style.display = "block";
    scrollText.textContent = text2;
}, transistionTime1);

// Second transisition after 60 seconds
setTimeout(() => {
    asteroid.style.display = "none";
    scrollContainer.style.display = "none";
}, transistionTime2);

// Third transistion after 90 seconds
setTimeout(() => {
    butterfly.style.display = "none";
    chrysalis.style.display = "none";
    butterfly2.style.display = "block";
    chrysalis2.style.display = "block";
}, transistionTime3); 
