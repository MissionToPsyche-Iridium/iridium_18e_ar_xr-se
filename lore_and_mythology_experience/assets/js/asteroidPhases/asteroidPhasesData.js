/**
 * asteroidPhaseData.js
 * This file handles asteroid phase data
 * @author: Nicole Garcia
 */

/**
 * Data for asteroid (AMP) phases
 * Represents different phases with images, text, and other properties.
 * Titles, text, and images for satellite phase dialogues can be modified here as needed.
 * TODO: Can move this to a json.
 * @type {Object.<string, Phase>}
 */
const asteroidPhases = {
    annibale1: {
        title: "Discovery of Psyche",
        image: "../assets/images/annibale.jpg",
        alt: "image of astronomer Annibale De Gasparis",
        duration: 250,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "On March 17, 1852, the Italian",
            "astronomer Annibale De Gasparis",
            "discovered an asteroid",
            "in the night sky."
        ]
    },
    annibale2: {
        title: "Discovery of Psyche",
        image: "../assets/images/annibale.jpg",
        alt: "image of astronomer Annibale De Gasparis",
        duration: 250,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "It is the 16th asteroid in",
            "the main asteroid belt between",
            "Mars and Jupiter.",
            "De Gasparis named this asteroid Psyche."
        ]
    },
    asteroid1: {
        title: "Chrysalis Resemblance",
        image: "../assets/images/chrysalis/asteroid.png",
        alt: "image of asteroid",
        duration: 250,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "The asteroid Psyche has the",
            "resemblance of a chrysalis.",
            "In Greek, the word for chrysalis is 'cyrsos',",
            "meaning gold, gold-colored, or wealth."
        ],
    },
    chrysalis1: {
        title: "Chrysalis Resemblance",
        image: "../assets/images/chrysalis/asteroid.png",
        alt: "Asteroid Psyche in the Chrysalis phase",
        duration: 250,
        scroll: "",
        text: [
            ""
        ],
        additionalImages: [
            { src: "../assets/images/chrysalis/chrysalis.png", id: "chrysalis", position: "absolute", top: "0", left: "0" },
        ],
    },
    butterfly1: {
        title: "The 'Breath of Life'",
        image: "../assets/images/chrysalis/butterfly.png",
        alt: "Asteroid Psyche butterfly emerges from chrysalis",
        duration: 250,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "In Greek mythology, the breath of life leaves",
            "as someone dies and is represented as",
            "a butterfly leaving its chrysalis.",
            "This breath of life is called Psyche."
        ],
    },
    psychegoddess1: { // psyche goddess part1
        title: "The Goddess Psyche Opening Pandora's Box",
        image: "../assets/images/goddess_psyche/psyche_opening_box.png",
        alt: "image of Psyche goddess opening pandora's box.",
        duration: 250,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "In Greek mythology, Psyche, driven by",
            "curiosity, opens a box given to her",
            "by Persephone, meant to contain a",
            "fragment of the queen's divine beauty",
            "for Aphrodite to use."
        ]
    },
    psychegoddess2: { // psyche goddess part2
        title: "The Goddess Psyche Falling Into a Deep Sleep",
        image: "../assets/images/goddess_psyche/psyche_passing_out.png",
        alt: "image of Psyche goddess in a deep, dark sleep.",
        duration: 250,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "However, instead of beauty,",
            "the box releases a deep sleep",
            "that overwhelms Psyche."
        ]
    },
    psychegoddess3: { // psyche goddess part3
        title: "The Goddess Psyche In A Dark, Dreamless Sleep",
        image: "../assets/images/goddess_psyche/psyche_passing_out_vector.png",
        alt: "outline and stars vector image of Psyche goddess in a deep, dark sleep",
        duration: 250,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "Psyche finds herself in",
            "a dark, dreamless sleep..."
        ]
    },
    psychegoddess4: { // psyche goddess part4
        title: "The Asteroid Psyche",
        image: "../assets/images/goddess_psyche/asteroid.png",
        alt: "psyche asteroid sleeping",
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        duration: 250,
        text: [
            "The asteroid Psyche finds itself in",
            "a similar dark, dreamless sleep..."
        ]
    },
    psychegoddess5: { // psyche goddess part5
        title: "Exploring the Asteroid Psyche",
        image: "../assets/images/goddess_psyche/asteroid.png",
        alt: "psyche asteroid core",
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        duration: 250,
        text: [
            "Like Psyche opening the fateful box,",
            "revealing the unexpected,",
            "humanity explores the Psyche asteroid;",
            "risking the unknown for discovery."
        ]
    }
};

/**
 * @typedef {Object} Phase
 * @property {string} title - The title of the phase.
 * @property {string} image - Path to the main image for the phase.
 * @property {string} alt - Alternative text for accessibility.
 * @property {number} duration - Duration in milliseconds.
 * @property {string} [scroll] - Optional path to a scroll banner image.
 * @property {string[]} text - An optional array of text strings displayed in the phase.
 * @property {AdditionalImage[]} [additionalImages] - Optional array of additional images.
 */

/**
 * @typedef {Object} AdditionalImage
 * @property {string} src - Path to the additional image.
 * @property {string} id - Unique identifier for the image.
 * @property {string} position - CSS position property.
 * @property {string} top - CSS top position.
 * @property {string} left - CSS left position.
 */

export default asteroidPhases;
