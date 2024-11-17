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
            'launch0': 'Launch',
            'launch1': 'Launch',
            'launch2': 'Launch',
            'assist0': 'Gravity Assist',
            'assist1': 'Gravity Assist',
            'assist2': 'Gravity Assist',
            'a0': 'Orbit A',
            'a1': 'Orbit A',
            'a2': 'Orbit A',
            'b10': 'Orbit B1',
            'b11': 'Orbit B1',
            'b12': 'Orbit B1',
            'd0': 'Orbit D',
            'd1': 'Orbit D',
            'd2': 'Orbit D',
            'c0': 'Orbit C',
            'c1': 'Orbit C',
            'c2': 'Orbit C',
            'b20': 'Orbit B2',
            'b21': 'Orbit B2',
            'b22': 'Orbit B2',
            'end0': 'End of Mission',
            'end1': 'End of Mission',
            'end2': 'End of Mission'
        };

        const phaseDescriptionMap = {
            'launch0': '',
            'launch1': 'Psyche launched from a SpaceX Falcon Heavy rocket at NASA\'s Kennedy Space Center in Florida. After launch, Psyche is expected to \'cruise\' using its solar electric propulsion system until encountering the gravitational field of Mars in 2026.',
            'launch2': '',
            'assist0': '',
            'assist1': 'In spring of 2026, Psyche will power down its thrusters as it approaches Mars and use the planet\'s gravity to slingshot itself, setting its trajectory toward the asteroid. Psyche will then resume thruster usage and cruise until its approach in 2029.',
            'assist2': '',
            'a0': '',
            'a1': 'After traveling roughly 2.4 billion kilometers (~1.5 billion miles), Psyche will spend 56 days performing magnetic field characterization and preliminary mapping during its outermost 41 orbits. The asteroid\'s spin axis and rotation will also be studied.',
            'a2': '',
            'b10': '',
            'b11': 'Orbit \'B\' is the next closest orbit and is split into two parts due to gradual diminishing of sunlight upon the asteroid\'s surface when this orbit begins. Psyche will spend 92 days (190 orbits) performing topography mapping and more magnetic field characterization.',
            'b12': '',
            'd0': '',
            'd1': 'Orbit D is the 3rd orbit phase and the closest Psyche will get to the asteroid during the mission. Psyche will spend 100 days (666 orbits) performing elemental mapping to determine the asteroid\'s chemical composition.',
            'd2': '',
            'c0': '',
            'c1': 'Orbit C is the 4th orbit and is located between orbits B and D. During this orbital phase Psyche will spend another 100 days (333 orbits) performing gravity investigations and continued magnetic field characterization.',
            'c2': '',
            'b20': '',
            'b21': 'For the final orbital phase of the mission, Psyche will return to orbit B to continue and conclude its topography mapping and magnetic field characterization. Psyche will spend 100 days (206 orbits) in this phase.',
            'b22': '',
            'end0': '',
            'end1': 'The Psyche mission is expected to end in November 2031 where it will be left to orbit the asteroid. During this phase the mission team will provide all remaining deliverables and safely decommission the space flight systems.',
            'end2': ''
        }

        const phaseImageMap = {
            //'launch': '../assets/images/spectrometers.png',
            'launch0': '../assets/images/0-mission_launch.png',
            'launch1': '',
            'launch2': '',
            'assist0': '../assets/images/1-gravity_assist.PNG',
            'assist1': '',
            'assist2': '',
            'a0': '../assets/images/2-orbit_a.png',
            'a1': '',
            'a2': '',
            'b10': '../assets/images/3-orbit_b1.png',
            'b11': '',
            'b12': '',
            'd0': '../assets/images/4-orbit_d.png',
            'd1': '',
            'd2': '',
            'c0': '../assets/images/5-orbit_c.png',
            'c1': '',
            'c2': '',
            'b20': '../assets/images/6-orbit_b2.png',
            'b21': '',
            'b22': '',
            'end0': '../assets/images/7-mission_end.png',
            'end1': '',
            'end2': ''
        };

        const phaseTitle = phaseTitleMap[phaseId] || 'No Title';
        const phaseDescription = phaseDescriptionMap[phaseId] || 'No description.';
        const phaseImage = phaseImageMap[phaseId] || '';

        // Content
        const phaseTitleContent = document.getElementById('phase-title');
        const phaseDescriptionContent = document.getElementById('phase-description');
        const phaseImageContent = document.getElementById('phase-image');

        // Update content
        if (phaseTitleContent && phaseDescriptionContent && phaseImageContent) {
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
