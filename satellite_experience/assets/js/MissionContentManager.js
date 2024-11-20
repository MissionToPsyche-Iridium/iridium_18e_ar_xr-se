/*
 * Mission Content Manager class
 */

export default class MissionContentManager {
    // Constructor
    constructor(spaceScene, mainContainer) {
        this._spaceScene = spaceScene;
        this._mainContainer = mainContainer;

        this._initialize();
    }

    // Update content based on phase id
    updateMissionContent(phaseId) {
        // Content maps
        const phaseTitleMap = {
            'launch': 'Launch',
            'assist': 'Gravity Assist',
            'a': 'Orbit A',
            'b1': 'Orbit B1',
            'd': 'Orbit D',
            'c': 'Orbit C',
            'b2': 'Orbit B2',
            'end': 'End of Mission'
        };

        const phaseDescriptionMap = {
            'launch': 'Psyche launched from a SpaceX Falcon Heavy rocket at NASA\'s Kennedy Space Center in Florida. After launch, Psyche is expected to \'cruise\' using its solar electric propulsion system until encountering the gravitational field of Mars in 2026.',
            'assist': 'In spring of 2026, Psyche will power down its thrusters as it approaches Mars and use the planet\'s gravity to slingshot itself, setting its trajectory toward the asteroid. Psyche will then resume thruster usage and cruise until its approach in 2029.',
            'a': 'After traveling roughly 2.4 billion kilometers (~1.5 billion miles), Psyche will spend 56 days performing magnetic field characterization and preliminary mapping during its outermost 41 orbits. The asteroid\'s spin axis and rotation will also be studied.',
            'b1': 'Orbit \'B\' is the next closest orbit and is split into two parts due to gradual diminishing of sunlight upon the asteroid\'s surface when this orbit begins. Psyche will spend 92 days (190 orbits) performing topography mapping and more magnetic field characterization.',
            'd': 'Orbit D is the 3rd orbit phase and the closest Psyche will get to the asteroid during the mission. Psyche will spend 100 days (666 orbits) performing elemental mapping to determine the asteroid\'s chemical composition.',
            'c': 'Orbit C is the 4th orbit and is located between orbits B and D. During this orbital phase Psyche will spend another 100 days (333 orbits) performing gravity investigations and continued magnetic field characterization.',
            'b2': 'For the final orbital phase of the mission, Psyche will return to orbit B to continue and conclude its topography mapping and magnetic field characterization. Psyche will spend 100 days (206 orbits) in this phase.',
            'end': 'The Psyche mission is expected to end in November 2031 where it will be left to orbit the asteroid. During this phase the mission team will provide all remaining deliverables and safely decommission the space flight systems.'
        }

        const phaseImageMap = {
            'launch': '../assets/images/psyche_launch.jpg',
        };

        const phaseVideoMap = {
            'launch': 'https://www.youtube.com/embed/AwCiHscmEQE?si=tpt9JAahRNdKdGyZ',
        }

        const phaseTitle = phaseTitleMap[phaseId] || 'No Title';
        const phaseDescription = phaseDescriptionMap[phaseId] || 'No description.';
        const phaseImage = phaseImageMap[phaseId] || '';
        const phaseVideo = phaseVideoMap[phaseId] || '';

        // Content
        const phaseTitleContent = document.getElementById('phase-title');
        const phaseDescriptionContent = document.getElementById('phase-description');
        const phaseImageContent = document.getElementById('phase-image');
        const phaseVideoContent = document.getElementById('phase-video');

        // Update content
        if (phaseTitleContent && phaseDescriptionContent && phaseVideoContent  && phaseImageContent) {
            phaseTitleContent.textContent = phaseTitle;
            phaseDescriptionContent.textContent = phaseDescription;

            if (phaseImage) {
                phaseImageContent.src = phaseImage;
                phaseImageContent.alt = phaseTitle;
                phaseImageContent.style.display = 'block';
            } else {
                phaseImageContent.src = '';
                phaseImageContent.alt = '';
                phaseImageContent.style.display = 'none';
            }

            if (phaseVideo && phaseTitle === "Launch") {
                phaseVideoContent.src = phaseVideo;
                if (phaseImage) {
                    phaseImageContent.style.display = 'none';
                }
                phaseVideoContent.width='320';
                phaseVideoContent.height='240';
            } else {
                phaseVideoContent.src = '';
                phaseVideoContent.style.display = 'none';
                phaseVideoContent.width='';
                phaseVideoContent.height='';
            }

            this._mainContainer.style.display = 'block';
        } else {
            console.error('Phase content elements not found.');
        }
    }

    // Initialize mission content
    _initialize() {
        // Previous Phase button
        document.addEventListener('click', (event) => {
            if (event.target.id === 'left-phase-transition-button') {
                parent.playSound2();
                this._spaceScene.prevPhase();
                this.updateMissionContent(this._spaceScene.getCurrentPhase());
            }
        });

        // Next Phase button
        document.addEventListener('click', (event) => {
            if (event.target.id === 'right-phase-transition-button') {
                parent.playSound2();
                this._spaceScene.nextPhase();
                this.updateMissionContent(this._spaceScene.getCurrentPhase());
            }
        });
    }
}
