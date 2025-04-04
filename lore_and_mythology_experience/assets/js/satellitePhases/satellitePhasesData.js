/**
 * satellitePhasesData.js
 * This file handles satellite (SMP) phase data.
 * @author: Nicole Garcia
 */

/**
 * Data for satellite (SMP) phases
 * Represents different phases with images, text, and other properties.
 * Titles, text, and images for satellite phase dialogues can be modified here as needed.
 * TODO: Can move this to a json.
 * @type {Object.<string, Phase>}
 */
const satellitePhases = {
    psycheSatellite1: {
        title: "The Psyche Satellite Resembles a Butterfly",
        image: "../assets/images/smp/psyche-satellite.png",
        alt: "Psyche satellite with wings like a butterfly.",
        duration: 250,
        banner: "",
        text: [
            ""
        ],
        additionalImages: [
            { src: "../assets/images/chrysalis/butterfly.png", id: "butterfly", position: "absolute", top: "0", left: "0" },
        ],
    },
    psycheSatellite2: {
        title: "The Psyche Satellite Resembles a Butterfly",
        image: "../assets/images/smp/psyche-satellite.png",
        alt: "Satellite Psyche with wings like a butterfly",
        duration: 250,
        banner: "../assets/images/smp/smp-banner.png",
        text: [
            "With it’s solar panel wings",
            "outstretched like a butterfly,",
            "the Psyche spacecraft echos",
            "the “Breath of Life” after death."
        ],
        additionalImages: [
            { src: "../assets/images/chrysalis/butterfly.png", id: "butterfly", position: "absolute", top: "0", left: "0" },
        ],
    },
    quote1: {
        title: "Conclusion",
        image: "../assets/images/goddess_psyche/asteroid.png",
        alt: "",
        duration: 250,
        banner: "../assets/images/smp/smp-banner.png",
        text: [
            " “Perhaps after NASA’s Psyche",
            "spacecraft arrives at the",
            "Psyche asteroid... “"
        ]
    },
    quote2: {
        title: "Conclusion",
        image: "../assets/images/goddess_psyche/psyche_drinking_ambrosia.png",
        alt: "",
        duration: 250,
        banner: "../assets/images/smp/smp-banner.png",
        text: [
            " “it will be as though",
            "the Psyche goddess",
            "had drunk the ambrosia",
            "granting her immortality... “"
        ]
    },
    quote3: {
        title: "Conclusion",
        image: "../assets/images/goddess_psyche/asteroid.png",
        alt: "",
        duration: 250,
        banner: "../assets/images/smp/smp-banner.png",
        text: [
            " “only that the achieved",
            "immortality will be through",
            "scientific documentation rather",
            "than mythological powers. “- McManamy"
        ]
    }
};

/**
 * @typedef {Object} Phase
 * @property {string} title - The title of the phase.
 * @property {string} image - Path to the main image for the phase.
 * @property {string} alt - Alternative text for accessibility.
 * @property {number} duration - Duration in milliseconds.
 * @property {string} [banner] - Optional path to a banner image.
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

export default satellitePhases;