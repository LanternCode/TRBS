import { insertParticipant } from "./db.js";
import { generateNewEnemy, generateNewPlayer } from "./utils.js";
import { Settings } from "./settings.js";
import { addPlayer, addEnemy } from "./table.js";
import {createCardTemplate} from "./card.js";

/**
 * This function checks if new participants can be added into battle and if so,
 * opens the card picker. Called by pressing the plus button on the left.
 *
 * @generator
 * @function addCardInit
 * @param {string} type participant's type
 * @return {void} immediately calls {@link displayCardPicker} on success
 */
async function addCardInit(type)
{
    let success = await initCardPicker(type);
    if(success) displayCardPicker(type);
    // .then((result) => { if (result) displayCardPicker(type) } );
}

/**
 * This function prepares the card picker. Called by pressing the plus button on the left.
 *
 * @generator
 * @function initCardPicker
 * @param {string} type participant's type
 * @return {void}
 */
async function initCardPicker(type)
{
    if(type === "player") {
        await Settings.fetchPlayers();
    }
    else if(type === "enemy") {
        await Settings.fetchEnemies();
    }

    return true;
}

/**
 * This function displays the list with available participant cards
 * for the user to choose from
 *
 * @generator
 * @function displayCardPicker
 * @param {string} type participant type
 * @yields {Element} a Participant card added to the table
 */
async function displayCardPicker(type)
{
    let pickingOverlay = document.getElementById("pickingOverlay");

    //insert participants of the 'type' into the card picker
    let selectSection = await refreshCardList(type, true);

    let cardPickerWrap = document.createElement("div");
    cardPickerWrap.classList.add("cardPickerWrap");

    //attach styles to the select section
    selectSection.classList.add("cardListFrame");
    selectSection.id = "listSection";
    selectSection.addEventListener("click", (event) => {event.stopPropagation();} )

    let closeListButton = document.createElement("button");

    pickingOverlay.addEventListener("click", closePickingOverlay);
    closeListButton.addEventListener("click", (event) => {
        event.stopPropagation();
        pickingOverlay.classList.add("hidden");
        pickingOverlay.removeChild( pickingOverlay.children[0]);
        pickingOverlay.removeEventListener("click", closePickingOverlay);
    }); 

    closeListButton.innerHTML = "&times;";
    closeListButton.classList.add("closeListButton");
    cardPickerWrap.appendChild(closeListButton);

    //reveal the card picker
    cardPickerWrap.appendChild(selectSection);
    pickingOverlay.appendChild(cardPickerWrap);
    pickingOverlay.classList.remove("hidden");
}

/**
 * This function closes the card picker after clicking aside
 *
 * @generator
 * @function closePickingOverlay
 * @param {event} event event listener's event
 */
function closePickingOverlay(event) {
    event.stopPropagation();
    event.currentTarget.classList.add("hidden");
    event.currentTarget.removeChild( event.currentTarget.children[0]);
    event.currentTarget.removeEventListener("click", closePickingOverlay);
}

/**
 * This function completes the construction of a participant card
 * and adds that card to the table or to the list
 *
 * @generator
 * @function insertCard
 * @param {string} type participant's type
 * @param {Participant} newParticipant the participant being added
 * @param {string} location where to add the card (table/list)
 * @yields {Element} a valid participant card <section> element
 */
async function insertCard(type, newParticipant, location = "table")
{
    if(location === "table")
        Settings.participantsDefinition = Settings.participantsDefinition.concat(newParticipant);
    else {
        if(type === "player") Settings.availablePlayers = Settings.availablePlayers.concat(newParticipant);
        else Settings.availableEnemies = Settings.availableEnemies.concat(newParticipant);

        let participantId = await insertParticipant(newParticipant, type);
        newParticipant._id = participantId;
    }

    let card = createCardTemplate(type, newParticipant);
    card.id = "participant-" + (Settings.participantsDefinition.length-1);

    //append the card to the list or the correct side of the board
    if(location === "list") {
        document.getElementById("listSection").appendChild(card);
    }
    else if(type === "player"){
        document.getElementById("playerSlots").appendChild(card);
    }
    else if(type === "enemy"){
        document.getElementById("enemySlots").appendChild(card);
    }
}

/**
 * Takes the card list and refreshes it or generates it for the first time
 *
 * @function refreshCardList
 * @param {string} cardType the type of list (player/enemy list)
 * @param {boolean} firstUse whether to generate the list for the first time
 * @returns {HTMLElement | void} For the first time return a valid section element, void otherwise
 */
async function refreshCardList(cardType, firstUse = true)
{
    //fetch or create the card picker selection list
    let cardList = (cardType === "player" ? Settings.availablePlayers : Settings.availableEnemies);
    let selectSection;
    if(firstUse)
        selectSection = document.createElement('section');
    else {
        selectSection = document.getElementById("listSection");
        selectSection.innerHTML = "";
    }

    //create the settings card and append it at the end
    let settings = await createSettingsCard(cardType);
    selectSection.appendChild(settings);

    //insert each available participant into the list
    for (let i = 0; i < cardList.length; i++) {
        let index = i;
        let option = createCardTemplate(cardType, cardList[i]);
        option.id = "participant-" + i;
        let btnPickCard = document.createElement('button');
        btnPickCard.innerText = "Wybierz!";
        btnPickCard.addEventListener("click", async function() {
            if(cardType === "player") {
                await addPlayer(index);
            }
            else if (cardType === "enemy") {
                await addEnemy(index);
            }
        }, false);
        option.classList.add("clickOnMe");

        option.appendChild(btnPickCard);
        selectSection.appendChild(option);
    }

    if (firstUse)
        return selectSection;
}

/**
 * Creates a special card with only settings to be appended at the end
 * of the participants list
 *
 * @generator
 * @function createSettingsCard
 * @param {string} type card type (to inherit styles)
 * @yields {HTMLElement} valid section element
 */
async function createSettingsCard(type)
{
    let card = document.createElement("section");
    card.className = type === "player" ? "playerSection" : "enemySection";
    let addParticipantH3 = document.createElement("h3");
    addParticipantH3.innerText = "+";

    card.classList.add("clickOnMe");
    card.onclick = async function(){
        let newParticipant;
        if(type === "player") newParticipant = generateNewPlayer();
        else newParticipant = generateNewEnemy();
        await insertCard(type, newParticipant, "list");
        refreshCardList(type);
    };

    card.appendChild(addParticipantH3);
    return card;
}

export { addCardInit, insertCard, refreshCardList, createSettingsCard };