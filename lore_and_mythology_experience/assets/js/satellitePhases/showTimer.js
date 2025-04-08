/**
 * showTimer.js
 * @author Nicole Garcia, Ryan Mcmanamy, Emily Dinaro, Collin Miller
 */

import incrementProgressBar from '../progressBar.js';
import showPhase from './satellitePhases.js';

/**
 * showTimer
 * Display Psyche satellite mission timer
 * Takes in a callback function so that phases display only when the prior one is completed
 * @param timerBool boolean used to determine if this phase should run
 * @param audioManager handles audio
 * @param phaseValues Object of phase data
 * @param phaseIndex current index of phases
 * @param callback used to determine when phase is complete
 */
export default function showTimer(timerBool, audioManager, phaseValues, phaseIndex, callback) {
    console.log('Transitioning to satellite timer');
    audioManager.play("smp");
    audioManager.setVolume(.5);

    /**
     * The satellite is expected to be captured by Psyche's gravity in late July (2029).
     * 
     * The satellite is then expected to orbit indefinitely thereafter, yet the
     * mission is said to conclude roughly 2 years after arrival (November of 2031).
     * 
     * Sources: 
     *  - https://www.jpl.nasa.gov/press-kits/psyche/quick-facts/
     *  - https://psyche.asu.edu/mission/faq/
     *  - https://www.jpl.nasa.gov/images/pia24930-psyches-mission-plan/
     */
    // Launched: October 13th, 2023 @2:19PM (GMT)
    var launchTime = 1697206740000;

    // August 1st, 2029 (GMT)
    var arrivalTime = 1880236800000;

    // November 1st, 2031 (GMT)
    var missionCompletionTime = 1951257600000;

    // Demarcation of second leap day since launch (March 1st, 2028 GMT)
    var leapDay = 1835481600000;

    // TEST CASE 1: launch < current < arrival < completion
    // var launchTime = 1697206740000;
    // var arrivalTime = 1951257500000;
    // var missionCompletionTime = 1951257600000;

    // TEST CASE 2: launch < arrival < current < completion
    // var launchTime = 1697206740000;
    // var arrivalTime = 1697206750000;
    // var missionCompletionTime = 1951257600000;

    // TEST CASE 3: launch < arrival < completion < current
    // var launchTime = 1697206740000;
    // var arrivalTime = 1697206750000;
    // var missionCompletionTime = 1697206760000;

    // Time constants
    var millisecondsInASecond = 1000;
    var millisecondsInAMinute = millisecondsInASecond * 60;
    var millisecondsInAnHour = millisecondsInAMinute * 60;
    var millisecondsInADay = millisecondsInAnHour * 24;
    var millisecondsInAYear = millisecondsInADay * 365;

    var currentTime = Date.now();

    // Possible mission statuses include: "En Route", "Orbiting", and "Complete".
    let message1 = "Mission Status: ";
    let message2 = "";

    // Possible countup and countdown combinations:
    // The launch has already passed.
    // Either the launch is the only event that has passed, in which case the arrival 
    // and mission completion timers wil decrement how much time until each event occurs, 
    // Or, launch and arrival have both passed, yet the mission is not complete, in which 
    // case the mission completion timer will decrement how much time until the event occurs, 
    // OR, all 3 temporal points of interest have passed, in which case the respective timers 
    // will increment how much time has passed since each event.
    let colHeadings = [["|", "Since Launch  |", "Since Arrival  |", "Since Completion "],
        ["|", "Since Launch  |", "Since Arrival  |", "Until Completion "],
        ["|", "Since Launch  |", "Until Arrival  |", "Until Completion "]
    ];
    //let rowHeadings = ["|", "years  |", "days  |", "hours  |", minutes  |", "seconds  |"];

    // The variables for the time since launch
    let launchCountup = { "years": 0, "days": 0, "hours": 0, "minutes": 0, "seconds": 0 };
    let timeSinceLaunch = currentTime - launchTime;

    // Account for the leap day: 2/29/2028
    if (currentTime >= leapDay) {
        launchCountup["years"] = Math.floor((timeSinceLaunch - (2 * millisecondsInADay)) / millisecondsInAYear);
    }
    else {
        launchCountup["years"] = Math.floor((timeSinceLaunch - (1 * millisecondsInADay)) / millisecondsInAYear);
    }
    timeSinceLaunch = timeSinceLaunch - (launchCountup["years"] * millisecondsInAYear);
    launchCountup["days"] = Math.floor(timeSinceLaunch / millisecondsInADay);
    timeSinceLaunch = timeSinceLaunch - (launchCountup["days"] * millisecondsInADay);
    launchCountup["hours"] = Math.floor(timeSinceLaunch / millisecondsInAnHour);
    timeSinceLaunch = timeSinceLaunch - (launchCountup["hours"] * millisecondsInAnHour);
    launchCountup["minutes"] = Math.floor(timeSinceLaunch / millisecondsInAMinute);
    timeSinceLaunch = timeSinceLaunch - (launchCountup["minutes"] * millisecondsInAMinute);
    launchCountup["seconds"] = Math.floor(timeSinceLaunch / millisecondsInASecond);

    // The variables for the time until arrival
    let arrivalCountdown = { "years": 0, "days": 0, "hours": 0, "minutes": 0, "seconds": 0 };

    // The variables for the time until mission completion
    let completionCountdown = { "years": 0, "days": 0, "hours": 0, "minutes": 0, "seconds": 0 };

    let timeUntilArrival = arrivalTime - currentTime;
    let timeSinceArrival = 0;
    let timeUntilCompletion = missionCompletionTime - currentTime;
    let timeSinceCompletion = 0;

    // The variables for incrementing or decrementing by seconds.
    // The time since launch always increases.
    // A positive increment denotes a count up since the event occurred, whereas 
    // a negative increment denotes a count down until the event occurs.
    let launchIncrement = 1;
    let arrivalIncrement = 0;
    let completionIncrement = 0;

    // If the current time is after the mission completion time, 
    // then all 3 timers must count up from their temporal demarcation points.
    if (currentTime >= missionCompletionTime) {
        message1 += "Complete";
        arrivalIncrement = 1;
        completionIncrement = 1;

        timeSinceArrival = currentTime - arrivalTime;

        arrivalCountdown["years"] = Math.floor(timeSinceArrival / (millisecondsInAYear + (millisecondsInADay / 4)));
        timeSinceArrival = timeSinceArrival - (arrivalCountdown["years"] * (millisecondsInAYear + (millisecondsInADay / 4)));
        arrivalCountdown["days"] = Math.floor(timeSinceArrival / millisecondsInADay);
        timeSinceArrival = timeSinceArrival - (arrivalCountdown["days"] * millisecondsInADay);
        arrivalCountdown["hours"] = Math.floor(timeSinceArrival / millisecondsInAnHour);
        timeSinceArrival = timeSinceArrival - (arrivalCountdown["hours"] * millisecondsInAnHour);
        arrivalCountdown["minutes"] = Math.floor(timeSinceArrival / millisecondsInAMinute);
        timeSinceArrival = timeSinceArrival - (arrivalCountdown["minutes"] * millisecondsInAMinute);
        arrivalCountdown["seconds"] = Math.floor(timeSinceArrival / millisecondsInASecond);

        timeSinceCompletion = currentTime - missionCompletionTime;

        completionCountdown["years"] = Math.floor(timeSinceCompletion / (millisecondsInAYear + (millisecondsInADay / 4)));
        timeSinceCompletion = timeSinceCompletion - (completionCountdown["years"] * (millisecondsInAYear + (millisecondsInADay / 4)));
        completionCountdown["days"] = Math.floor(timeSinceCompletion / millisecondsInADay);
        timeSinceCompletion = timeSinceCompletion - (completionCountdown["days"] * millisecondsInADay);
        completionCountdown["hours"] = Math.floor(timeSinceCompletion / millisecondsInAnHour);
        timeSinceCompletion = timeSinceCompletion - (completionCountdown["hours"] * millisecondsInAnHour);
        completionCountdown["minutes"] = Math.floor(timeSinceCompletion / millisecondsInAMinute);
        timeSinceCompletion = timeSinceCompletion - (completionCountdown["minutes"] * millisecondsInAMinute);
        completionCountdown["seconds"] = Math.floor(timeSinceCompletion / millisecondsInASecond);

        message2 = colHeadings[0];
    }
    // If the current time is not after the mission completion time, 
    // yet the current time is after the arrival time, 
    // then only the mission completion timer must count down, 
    // whereas the other two must count up from their temporal demarcation points.
    else if (currentTime >= arrivalTime) {
        message1 += "Orbiting";
        arrivalIncrement = 1;
        completionIncrement = -1;

        timeSinceArrival = currentTime - arrivalTime;

        arrivalCountdown["years"] = Math.floor(timeSinceArrival / (millisecondsInAYear + (millisecondsInADay / 4)));
        timeSinceArrival = timeSinceArrival - (arrivalCountdown["years"] * (millisecondsInAYear + (millisecondsInADay / 4)));
        arrivalCountdown["days"] = Math.floor(timeSinceArrival / millisecondsInADay);
        timeSinceArrival = timeSinceArrival - (arrivalCountdown["days"] * millisecondsInADay);
        arrivalCountdown["hours"] = Math.floor(timeSinceArrival / millisecondsInAnHour);
        timeSinceArrival = timeSinceArrival - (arrivalCountdown["hours"] * millisecondsInAnHour);
        arrivalCountdown["minutes"] = Math.floor(timeSinceArrival / millisecondsInAMinute);
        timeSinceArrival = timeSinceArrival - (arrivalCountdown["minutes"] * millisecondsInAMinute);
        arrivalCountdown["seconds"] = Math.floor(timeSinceArrival / millisecondsInASecond);

        completionCountdown["years"] = Math.floor(timeUntilCompletion / (millisecondsInAYear + (millisecondsInADay / 4)));
        timeUntilCompletion = timeUntilCompletion - (completionCountdown["years"] * (millisecondsInAYear + (millisecondsInADay / 4)));
        completionCountdown["days"] = Math.floor(timeUntilCompletion / millisecondsInADay);
        timeUntilCompletion = timeUntilCompletion - (completionCountdown["days"] * millisecondsInADay);
        completionCountdown["hours"] = Math.floor(timeUntilCompletion / millisecondsInAnHour);
        timeUntilCompletion = timeUntilCompletion - (completionCountdown["hours"] * millisecondsInAnHour);
        completionCountdown["minutes"] = Math.floor(timeUntilCompletion / millisecondsInAMinute);
        timeUntilCompletion = timeUntilCompletion - (completionCountdown["minutes"] * millisecondsInAMinute);
        completionCountdown["seconds"] = Math.floor(timeUntilCompletion / millisecondsInASecond);

        message2 = colHeadings[1];
    }
    // If the current time is not after the mission completion time, 
    // and the current time is also not after the arrival time, 
    // then only the time since launch must count up, 
    // whereas the other two must count down from their temporal demarcation points.
    else {
        message1 += "En Route";
        arrivalIncrement = -1;
        completionIncrement = -1;

        arrivalCountdown["years"] = Math.floor(timeUntilArrival / (millisecondsInAYear + (millisecondsInADay / 4)));
        timeUntilArrival = timeUntilArrival - (arrivalCountdown["years"] * (millisecondsInAYear + (millisecondsInADay / 4)));
        arrivalCountdown["days"] = Math.floor(timeUntilArrival / millisecondsInADay);
        timeUntilArrival = timeUntilArrival - (arrivalCountdown["days"] * millisecondsInADay);
        arrivalCountdown["hours"] = Math.floor(timeUntilArrival / millisecondsInAnHour);
        timeUntilArrival = timeUntilArrival - (arrivalCountdown["hours"] * millisecondsInAnHour);
        arrivalCountdown["minutes"] = Math.floor(timeUntilArrival / millisecondsInAMinute);
        timeUntilArrival = timeUntilArrival - (arrivalCountdown["minutes"] * millisecondsInAMinute);
        arrivalCountdown["seconds"] = Math.floor(timeUntilArrival / millisecondsInASecond);

        completionCountdown["years"] = Math.floor(timeUntilCompletion / (millisecondsInAYear + (millisecondsInADay / 4)));
        timeUntilCompletion = timeUntilCompletion - (completionCountdown["years"] * (millisecondsInAYear + (millisecondsInADay / 4)));
        completionCountdown["days"] = Math.floor(timeUntilCompletion / millisecondsInADay);
        timeUntilCompletion = timeUntilCompletion - (completionCountdown["days"] * millisecondsInADay);
        completionCountdown["hours"] = Math.floor(timeUntilCompletion / millisecondsInAnHour);
        timeUntilCompletion = timeUntilCompletion - (completionCountdown["hours"] * millisecondsInAnHour);
        completionCountdown["minutes"] = Math.floor(timeUntilCompletion / millisecondsInAMinute);
        timeUntilCompletion = timeUntilCompletion - (completionCountdown["minutes"] * millisecondsInAMinute);
        completionCountdown["seconds"] = Math.floor(timeUntilCompletion / millisecondsInASecond);

        message2 = colHeadings[2];
    }

    // Every second, update the display with the new timer values
    let counter = 0;
    let intervalID = setInterval(function() {
        // Always increment the time since launch
        launchCountup["seconds"] += launchIncrement;

        launchCountup["minutes"] += Math.floor(launchCountup["seconds"] / 60);
        launchCountup["hours"] += Math.floor(launchCountup["minutes"] / 60);
        launchCountup["days"] += Math.floor(launchCountup["hours"] / 24);
        launchCountup["years"] += Math.floor(launchCountup["days"] / 365);

        launchCountup["seconds"] = launchCountup["seconds"] % 60;
        launchCountup["minutes"] = launchCountup["minutes"] % 60;
        launchCountup["hours"] = launchCountup["hours"] % 24;
        launchCountup["days"] = launchCountup["days"] % 365;

        // If the arrival increment is positive, 
        // we are incrementing the time since arrival.
        if (arrivalIncrement > 0) {
            arrivalCountdown["seconds"] = (arrivalCountdown["seconds"] + arrivalIncrement) % 60;

            if (arrivalCountdown["seconds"] == 0) {
                arrivalCountdown["minutes"] = (arrivalCountdown["minutes"] + arrivalIncrement) % 60;
                if (arrivalCountdown["minutes"] == 0) {
                    arrivalCountdown["hours"] = (arrivalCountdown["hours"] + arrivalIncrement) % 24;
                    if (arrivalCountdown["hours"] == 0) {
                        arrivalCountdown["days"] = (arrivalCountdown["days"] + arrivalIncrement) % 365;
                        if (arrivalCountdown["days"] == 0) {
                            arrivalCountdown["years"] += arrivalIncrement;
                        }
                    }
                }
            }
        }
        // If the arrival increment is negative, 
        // we are counting down until the event occurs.
        else {
            arrivalCountdown["seconds"] = (arrivalCountdown["seconds"] + 60 + arrivalIncrement) % 60;

            if (arrivalCountdown["seconds"] == 59) {
                arrivalCountdown["minutes"] = (arrivalCountdown["minutes"] + 60 + arrivalIncrement) % 60;
                if (arrivalCountdown["minutes"] == 59) {
                    arrivalCountdown["hours"] = (arrivalCountdown["hours"] + 24 + arrivalIncrement) % 24;
                    if (arrivalCountdown["hours"] == 59) {
                        arrivalCountdown["days"] = (arrivalCountdown["days"] + 365 + arrivalIncrement) % 365;
                        if (arrivalCountdown["days"] == 59) {
                            arrivalCountdown["years"] += arrivalIncrement;
                        }
                    }
                }
            }
        }

        // If the mission completion increment is positive, 
        // we are incrementing the time since mission completion.
        if (completionIncrement > 0) {
            completionCountdown["seconds"] = (completionCountdown["seconds"] + completionIncrement) % 60;

            if (completionCountdown["seconds"] == 0) {
                completionCountdown["minutes"] = (completionCountdown["minutes"] + completionIncrement) % 60;
                if (completionCountdown["minutes"] == 0) {
                    completionCountdown["hours"] = (completionCountdown["hours"] + completionIncrement) % 24;
                    if (completionCountdown["hours"] == 0) {
                        completionCountdown["days"] = (completionCountdown["days"] + completionIncrement) % 365;
                        if (completionCountdown["days"] == 0) {
                            completionCountdown["years"] += completionIncrement;
                        }
                    }
                }
            }
        }
        // If the mission completion increment is negative, 
        // we are counting down until the event occurs.
        else {
            completionCountdown["seconds"] = (completionCountdown["seconds"] + 60 + completionIncrement) % 60;

            if (completionCountdown["seconds"] == 59) {
                completionCountdown["minutes"] = (completionCountdown["minutes"] + 60 + completionIncrement) % 60;
                if (completionCountdown["minutes"] == 59) {
                    completionCountdown["hours"] = (completionCountdown["hours"] + 24 + completionIncrement) % 24;
                    if (completionCountdown["hours"] == 59) {
                        completionCountdown["days"] = (completionCountdown["days"] + 365 + completionIncrement) % 365;
                        if (completionCountdown["days"] == 59) {
                            completionCountdown["years"] += completionIncrement;
                        }
                    }
                }
            }
        }

        // Following the format of the other phases for consistency
        let countdown = {
            placeholder: {
                image: "",
                alt: "",
                //duration: 20000,
                duration: 1000,
                banner: "../assets/images/smp/smp-banner.png",
                text: [
                    ("" + message1),
                    "---------------------------------------------",
                    ("" + "<table><tr><th class='rowHeader'>" + message2[0] + "</th><th class='colHeader'>" + message2[1] + "</th><th class='colHeader'>" + message2[2] + "</th><th class='colHeader'>" + message2[3] + "</th></tr><tr><tr><td class='rowHeader'>Years  |</td><td class='dataCells'>" + launchCountup["years"] + "</td><td class='dataCells'>" + arrivalCountdown["years"] + "</td><td class='dataCells'>" + completionCountdown["years"] + "</td></tr><td class='rowHeader'>Days  |</td><td class='dataCells'>" + launchCountup["days"] + "</td><td class='dataCells'>" + arrivalCountdown["days"] + "</td><td class='dataCells'>" + completionCountdown["days"] + "</td></tr><tr><td class='rowHeader'>Hours  |</td><td class='dataCells'>" + launchCountup["hours"] + "</td><td class='dataCells'>" + arrivalCountdown["hours"] + "</td><td class='dataCells'>" + completionCountdown["hours"] + "</td></tr><tr><td class='rowHeader'>Minutes  |</td><td class='dataCells'>" + launchCountup["minutes"] + "</td><td class='dataCells'>" + arrivalCountdown["minutes"] + "</td><td class='dataCells'>" + completionCountdown["minutes"] + "</td></tr><tr><td class='rowHeader'>Seconds  |</td><td class='dataCells'>" + launchCountup["seconds"] + "</td><td class='dataCells'>" + arrivalCountdown["seconds"] + "</td><td class='dataCells'>" + completionCountdown["seconds"] + "</td></tr></table>")
                ]
            }
        }
        let timerValues = Object.values(countdown);
        let timerPhase = timerValues[0];

        // setTimeout(function() { showCountdown(timerPhase, i) }, 1000 * i);

        // Only create the timer div upon the first iteration.
        if (counter == 0) {
            // set up html and css
            const phase_div = document.createElement("div");
            phase_div.setAttribute("id", "phase_modal");
            phase_div.setAttribute("style", "display: block; position: fixed;" +
                " z-index: 20; left: 0; top: 0; width: 100%; height: 100%; " +
                "background-color: rgba(0, 0, 0, 0.2); overflow: hidden; transition: 1.5s; font-size: 16px");

            let phase_innerHTML = "";

            phase_innerHTML += `<img src="${timerPhase.banner}" id="banner"/>`;

            if (timerPhase.text.some(line => line !== "")) {
                phase_innerHTML += `<div id="banner_text_box">`;
                timerPhase.text.forEach((line) => {
                    phase_innerHTML += `<span class="info">${line}</span>`;
                });
                phase_innerHTML += `</div>`;
            }

            phase_innerHTML += ``;
            phase_div.innerHTML = phase_innerHTML;

            // Add next button
            const nextButton = document.createElement("button");
            nextButton.setAttribute("id", "next-btn");
            nextButton.setAttribute("style", `
                position: absolute;
                bottom: 15px;
                left: 50%;
                transform: translateX(-50%);
                width: 200px;
                height: 100px;
                border: none;
                background: url('../assets/images/continue_button.png') no-repeat center center;
                background-size: contain;
                cursor: pointer;
                z-index: 101;
                display: block;
            `);
            nextButton.addEventListener("click", function() {incrementProgressBar(16); clearInterval(intervalID); document.getElementById("phase_modal").remove(); showPhase(phaseValues[phaseIndex]);});
            phase_div.appendChild(nextButton);

            document.body.appendChild(phase_div);
        }
        // Otherwise, simply update the div.
        else {
            let phase_innerHTML = "";

            phase_innerHTML += `<img src="${timerPhase.banner}" id="banner"/>`;

            if (timerPhase.text.some(line => line !== "")) {
                phase_innerHTML += `<div id="banner_text_box">`;
                timerPhase.text.forEach((line) => {
                    phase_innerHTML += `<span class="info">${line}</span>`;
                });
                phase_innerHTML += `</div>`;
            }

            phase_innerHTML += ``;

            document.getElementById("phase_modal").innerHTML = phase_innerHTML;

            // Add next button
            const nextButton = document.createElement("button");
            nextButton.setAttribute("id", "next-btn");
            nextButton.setAttribute("style", `
                position: absolute;
                bottom: 15px;
                left: 50%;
                transform: translateX(-50%);
                width: 200px;
                height: 100px;
                border: none;
                background: url('../assets/images/continue_button.png') no-repeat center center;
                background-size: contain;
                cursor: pointer;
                z-index: 101;
                display: block;
            `);
            nextButton.addEventListener("click", function() {incrementProgressBar(16); clearInterval(intervalID); document.getElementById("phase_modal").remove(); showPhase(phaseValues[phaseIndex]);});
            document.getElementById("phase_modal").appendChild(nextButton);
        }

        document.getElementById("banner").setAttribute("style",
            "background-color: transparent; width: calc(30vw + 15vh); height: auto; border-radius: 12px;" +
            " position: absolute; top: 70%; left: 50%;" +
            " z-index: 5; transition: 1.5s ease-in-out; transform: translate(-50%, -50%);");

        if (timerPhase.text.some(line => line !== "")) {
            const text = document.getElementById("banner_text_box");
            text.setAttribute("style", " display: flex; flex-direction: column; position: absolute;" +
                " top: 80%; left: 43%; transform: translate(-50%, -50%);" +
                " color: #C9FFFC; font-size: 2rem; font-family: 'Comfortaa', Arial, sans-serif; text-align: center;" +
                " z-index: 10; padding: 10px 20px; border-radius: 8px; transform: translate(-50%, -50%);");
        }

        var infos = document.getElementsByClassName("info");
        for (var i = 0; i < infos.length; i++) {
            infos[i].setAttribute("style", "text-align: center; font-size: calc(0.045 * 40vh);" +
                " z-index: 21; transition: 1.5s east-in;");
        }

        var colHeaders = document.getElementsByClassName("colHeader");
        for (var j = 0; j < colHeaders.length; j++) {
            colHeaders[j].setAttribute("style", "text-align: center; font-size: calc(0.025 * 40vh);" +
                " z-index: 21; transition: 1.5s east-in; white-space: pre;");
        }

        var rowHeaders = document.getElementsByClassName("rowHeader");
        for (var k = 0; k < rowHeaders.length; k++) {
            rowHeaders[k].setAttribute("style", "text-align: right; font-size: calc(0.025 * 40vh);" +
                " z-index: 21; transition: 1.5s east-in; white-space: pre;");
        }

        var dataCells = document.getElementsByClassName("dataCells");
        for (var l = 0; l < dataCells.length; l++) {
            dataCells[l].setAttribute("style", "text-align: center; font-size: calc(0.025 * 40vh);" +
                " z-index: 21; transition: 1.5s east-in;");
        }
        counter++;
        console.log(counter);
    }, 1000);
}
