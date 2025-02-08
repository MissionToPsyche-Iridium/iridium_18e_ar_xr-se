let annibool = false;

export function showAnnibale() {
    if (!annibool) {
        const annibale_div = document.createElement("div");
        annibale_div.setAttribute("id", "annibale_modal");
        annibale_div.setAttribute("style", "display: block; position: fixed; z-index: 20; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 1);");

        let annibale_innerHTML = `
            <img src="../assets/images/annibale.jpg" id="annibale"/>
            <img src="../assets/images/papyrus_scroll_double_sided.png" id="papyrus_double_sided"/>
            <div id="scroll_text_box">
                <span class="info">On March 17, 1852, the Italian astronomer</span>
                <span class="info">Annibale de Gasparis discovered the 16th</span>
                <span class="info">asteroid in the main asteroid belt</span>
                <span class="info">between Mars and Jupiter.</span>
                <span class="info">De Gasparis named this asteroid Psyche.</span>
            </div>`;

        annibale_div.innerHTML = annibale_innerHTML;
        document.body.appendChild(annibale_div);

        document.getElementById("annibale").setAttribute("style", "background-color: transparent; width: calc(0.8 * 40vh); height: 40vh; border-radius: 12px; padding: 5vh; position: absolute; top: calc(0.25 * 40vh); left: calc(50vw - ((0.8 * 40vh + 10vh) / 2));");
        document.getElementById("papyrus_double_sided").setAttribute("style", "background-color: transparent; width: 40vh; height: 40vh; border-radius: 12px; position: absolute; top: 50vh; left: calc(50vw - (40vh / 2));");
        document.getElementById("scroll_text_box").setAttribute("style", "display: flex; flex-direction: column; position: absolute; width: 40vh; height: calc(40vh / 2); top: calc(50vh + ((40vh / 1.69) / 1.69)); left: calc(50vw - (40vh / 2));");

        var infos = document.getElementsByClassName("info");
        for (var i = 0; i < infos.length; i++) {
            infos[i].setAttribute("style", "text-align: center; font-size: calc(0.045 * 40vh); z-index: 21;");
        }

        annibool = true;
    } else {
        document.getElementById("annibale_modal").setAttribute("style", "display: 'block'; position: fixed; z-index: 20; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 1);");
        document.getElementById("annibale").setAttribute("style", "background-color: transparent; width: calc(0.8 * 40vh); height: 40vh; border-radius: 12px; padding: 5vh; position: absolute; top: calc(0.25 * 40vh); left: calc(50vw - ((0.8 * 40vh + 10vh) / 2));");
        document.getElementById("papyrus_double_sided").setAttribute("style", "background-color: transparent; width: 40vh; height: 40vh; border-radius: 12px; position: absolute; top: 50vh; left: calc(50vw - (40vh / 2));");
        document.getElementById("scroll_text_box").setAttribute("style", "display: flex; flex-direction: column; position: absolute; width: 40vh; height: calc(40vh / 2); top: calc(50vh + ((40vh / 1.69) / 1.69)); left: calc(50vw - (40vh / 2));");
    }
}