import {Settings} from "./settings.js";

/**
 * This function is called when an action is selected to define which elements should show up
 * as each action uses different elements, which are items, skills, spells or debug actions.
 * Not all actions (reg attack, dodge) have elements. When an element is selected, this
 * function generates the targets list for that element, ex. healing potion can only
 * be used on a living participant of the same type. The filter param specifies which
 * list will be affected, actionElements for actionElementsList, targets for targetsList,
 * reset hides both lists and resets the current action.
 *
 * @function adjustOptions
 * @param {string} filter - one of the three: actionElements,targets or reset
 * @return void
 */
function adjustOptions(filter) {
    //Hook for each section
    let actionList = document.getElementById("actionList");
    let action = actionList.value;
    let actionElementsSection = document.getElementById("actionElementsSection");
    let actionElementsList = document.getElementById("actionElementsList");
    let targetSection = document.getElementById("sectionTarget");
    let inputSection = document.getElementById("sectionInput");

    //Filter specifies which section needs to update once an action was picked
    if(filter === "actionElements") {
        switch(action) {
            case "regAttack":
            {
                hideSection(actionElementsSection);
                hideSection(inputSection);
                prepareTargetSection(getAttackableTargets());
                showSection(targetSection);
                break;
            }
            case "escape":
            case "dodge":
            {
                hideSection(actionElementsSection);
                hideSection(targetSection);
                hideSection(inputSection);
                break;
            }
            case "item":
            {
                hideSection(targetSection);
                hideSection(inputSection);
                createActionElementsList("itemsList");
                showSection(actionElementsSection);
                break;
            }
            case "skill":
            {
                hideSection(targetSection);
                hideSection(inputSection);
                createActionElementsList("skillsList");
                showSection(actionElementsSection);
                break;
            }
            case "spell":
            {
                hideSection(targetSection);
                hideSection(inputSection);
                createActionElementsList("spellsList");
                showSection(actionElementsSection);
                break;
            }
            case "debug":
            {
                hideSection(targetSection);
                hideSection(inputSection);
                createActionElementsList("debugList");
                showSection(actionElementsSection);
                break;
            }
            default:
            {
                //Only print errors to the console when debugging is enabled
                if(Settings.getDebuggingEnabled)
                    console.log("An error has occured, the following value was passed as action: ", action);
            }
        }
    }
    else if (filter === "targets") {
        //To update the targets list, fetch the selected element and obtain its type
        let actionElementType = actionElementsList.value.split("-")[0];
        actionElementType = (action === "debug") ? "debug" : actionElementType;
        switch(actionElementType)
        {
            case "item":
            {
                prepareTargetSection(createItemTargetList());
                showSection(targetSection);
                break;
            }
            case "skill":
            {
                initiateSkillTargetListCreation();
                showSection(targetSection);
                break;
            }
            case "spell":
            {
                initiateSpellTargetListCreation();
                showSection(targetSection);
                break;
            }
            case "debug":
            {
                hideSection(inputSection);
                createDebugTargetList();
                break;
            }
            default:
            {
                //Only print errors to the console when debugging is enabled
                if(Settings.getDebuggingEnabled)
                    console.log("An error has occured, the following value was passed as actionElementType: ", actionElementType);
            }
        }
    }
    else if(filter === "reset") {
        //Reset hides all sections and resets the action choice
        hideSection(actionElementsSection);
        hideSection(targetSection);
        hideSection(inputSection);
        actionList.value = "";
    }
}

/**
 * This function returns a list that shows targets that the currently acting person
 * can attack, aka. the opposite faction members who are still alive
 *
 * @function getAttackableTargets
 * @returns {array} the list of attackable targets
 */
function getAttackableTargets()
{
    let filteredList = [];
    if(Settings.participants[Settings.localTurn].type === "player")
        filteredList = Settings.participants.filter(p => p.type === "enemy").filter(p => p.health > 0);
    else
        filteredList = Settings.participants.filter(p => p.type === "player").filter(p => p.health > 0);

    return filteredList;
}

/**
 * This function makes a list of participants that can be targets of the item selected by the user
 * Some items can only be used on dead targets etc. and only on members of your own faction etc.
 *
 * @function createItemTargetList
 * @returns {array} A list of valid targets to use the item on
 */
function createItemTargetList()
{
    //Get the items list
    let itemsList = document.getElementById("actionElementsList");
    //Check if the selection was removed, if so, return an empty array
    if (itemsList.value === '') return [];
    //Get the item id from the list
    let itemId = parseInt(itemsList.value.split("-")[1]);
    //Find the item in the items array to get its properties
    let item = Settings.items.find(i => i.uiid === itemId);
    //Declare a list to store available targets
    let filteredList = [];
    //Based on the subtype of the item, find available targets
    let subtype = item.subtype;
    switch(subtype)
    {
        //To restore hp the target must be alive - hp > 0
        case "restore":
        {
            if(Settings.participants[Settings.localTurn].type === "player")
            {
                filteredList = Settings.participants.filter(p => p.type === "player").filter(p => p.health > 0);
            }
            else {
                filteredList = Settings.participants.filter(p => p.type === "enemy").filter(p => p.health > 0);
            }
            break;
        }
        case "revive":
        {
            //To revive, the target must be dead - hp = 0
            if(Settings.participants[Settings.localTurn].type === "player")
            {
                filteredList = Settings.participants.filter(p => p.type === "player").filter(p => p.health === 0);
            }
            else {
                filteredList = Settings.participants.filter(p => p.type === "enemy").filter(p => p.health === 0);
            }
            break;
        }
        case "sameType":
        {
            //Item can only be used on the participants of the same type as the acting participant
            let selfType = Settings.participants[Settings.localTurn].type;
            filteredList = Settings.participants.filter(p => p.type === selfType).filter(p => p.health > 0);
            break;
        }
        case "reverse":
        {
            let reverseType = Settings.participants[Settings.localTurn].type === "player" ? "enemy" : "player";
            filteredList = Settings.participants.filter(p => p.type === reverseType).filter(p => p.health > 0);
            break;
        }
    }
    return filteredList;
}

/**
 * This function initiates the process of creating a skill target list
 *
 * @function initiateSkillTargetListCreation
 * @returns {void} The function calls the createSkillSpellTargetList function immediately
 */
function initiateSkillTargetListCreation()
{
    //Get the skills list
    let skillsList = document.getElementById("actionElementsList");
    //Check if a skill was selected, otherwise exit
    if (skillsList.value === '') return;
    //Get the skill id
    let skillId = parseInt(skillsList.value.split("-")[1]);
    //Find the skill in the skill list to get its properties
    let skill = Settings.skills.find(s => s.usid === skillId);
    createSkillSpellTargetList(skill);
}

/**
 * This function initiates the process of creating a spell target list
 *
 * @function initiateSpellTargetListCreation
 * @returns {void} The function calls the createSkillSpellTargetList function immediately
 */
function initiateSpellTargetListCreation()
{
    //Get the spells list
    let spellsList = document.getElementById("actionElementsList");
    //Check if a spell was selected, otherwise exit
    if (spellsList.value === '') return;
    //Get the spell id
    let spellId = parseInt(spellsList.value.split("-")[1]);
    //Find the spell in the spells list to get its properties
    let spell = Settings.spells.find(s => s.uspid === spellId);
    createSkillSpellTargetList(spell);
}

/**
 * This function makes a list of targets that can be targets of the skill or spell selected by the participant
 * And calls the adequate function to implement that list
 *
 * @function createSkillTargetList
 * @param {object} SkillSpell the selected skill or spell
 * @returns {void} The function calls the prepareTargetSection function immediately
 */
function createSkillSpellTargetList(SkillSpell)
{
    //Based on the properties of the skill, find available targets
    let subtype = SkillSpell.subtype;
    let range = SkillSpell.range;
    let targetGroup = SkillSpell.targetGroup;
    //Check if the spell targets literally everyone - if so, job done
    if(range === "everyone") {
        prepareTargetSection([], "everyone");
        return;
    }
    //First filtering to determine which side to target (player, enemy, reversed)
    if(targetGroup === "reversed")
    {
        if(Settings.participants[Settings.localTurn].type === "player")
            targetGroup = "enemy";
        else targetGroup = "player";
    }
    if(range === "all"){
        //If we target everyone from that group - job done
        prepareTargetSection([], targetGroup);
        return;
    }
    //Individual filtering includes dead or alive participants based on the subtype of the skill/spell
    let filteredList = Settings.participants.filter(p => p.type === targetGroup);
    filteredList = filterBySubtype(filteredList, subtype);

    prepareTargetSection(filteredList);
}

/**
 * This function makes a list of targets that can be targets of the special action
 * And calls the adequate function to implement that list
 *
 * @function createDebugTargetList
 * @returns {void} The function calls the prepareTargetSection function immediately
 */
function createDebugTargetList()
{
    //Get the debug actions list and targets section
    let debugList = document.getElementById("actionElementsList");
    let targetSection = document.getElementById("sectionTarget");
    //Check if an action was selected, otherwise exit
    if (debugList.value === '') return;
    //Get the debug action
    let actionName = debugList.value;
    //Check if the action targets literally everyone - if so, job done
    if(["winBattle", "loseBattle"].includes(actionName)) {
        prepareTargetSection([], "everyone");
        showSection(targetSection);
    }
    else if(actionName === "setNextRoll") {
        //We'll not be setting targets here, instead we'll call an input section handler
        setupInputSection();
        hideSection(targetSection);
    }
    else {
        //For now the only other testing action is to defeat any participant
        //So proceed with the list of all participants
        prepareTargetSection(Settings.participants);
        showSection(targetSection);
    }
}

/**
 * This function takes a given section and shows it on the screen by deleting the hidden class
 *
 * @function showSection
 * @param {Element} s The section to be made visible
 * @return void
 */
function showSection(s)
{
    s.classList.remove("hidden");
}

/**
 * This function takes a given section and hides it by introducing the hidden class
 *
 * @function hideSection
 * @param {Element} s The section to hide
 * @return void
 */
function hideSection(s)
{
    s.classList.add("hidden");
}

/**
 * This function takes a list of participants and generates the targetsList section from that list
 *
 * @function prepareTargetSection
 * @param {array} targetList a list of participants
 * @param {string} specialCase a group of participants that are the target
 * @return void
 */
function prepareTargetSection(targetList, specialCase = '')
{
    //Get the targets list
    let targetListSection = document.getElementById("targetsList");
    //Reset the list
    targetListSection.innerHTML = '';
    //Insert the first entry that prompts to select a target
    let opt = document.createElement('option');
    opt.value = "";
    opt.innerText = "Wybierz";
    targetListSection.appendChild(opt);
    //Generate the list
    if(specialCase !== '') {
        //Construct the special option and insert it into the list
        let text = specialCase === "everyone" ? "Wszyscy Uczestnicy" : (specialCase === "player" ? "Wszyscy Gracze" : "Wszyscy Przeciwnicy");
        let opt = document.createElement('option');
        opt.value = specialCase;
        opt.innerText = text;
        targetListSection.appendChild(opt);
    }
    else {
        for(let i = 0; i < Settings.participants.length; ++i) {
            for(let j = 0; j < targetList.length; ++j) {
                if(Settings.participants[i] === targetList[j]) {
                    //Construct the option and insert it into the list
                    let opt = document.createElement('option');
                    opt.value = i;
                    opt.innerText = targetList[j].name;
                    targetListSection.appendChild(opt);
                }
            }
        }
    }
}

/**
 * This function updates a given list to show elements (items, skills or debug options)
 * owned by the participant
 *
 * @function createActionElementsList
 * @param {string} listName the id of the list to be updated
 * @return {void}
 */
function createActionElementsList(listName)
{
    //Remove all children
    let list = document.getElementById("actionElementsList");
    list.innerHTML = '';
    //Insert the first entry that prompts to select an option
    let opt = document.createElement('option');
    opt.value = "";
    opt.innerText = "Wybierz";
    list.appendChild(opt);
    //Based on the selected list, adjust parameters and fill it
    switch(listName)
    {
        case "itemsList":
        {
            document.getElementById("actionElementsLabel").innerText = "Wybierz przedmiot:";
            //Check that this participant has access to items
            if(!Object.hasOwn(Settings.participants[Settings.localTurn], "inventory")) return;
            if(Object.keys(Settings.participants[Settings.localTurn].inventory).length < 1) return;
            //Then insert all list items
            for (let itanz of Object.entries(Settings.participants[Settings.localTurn].inventory))
            {
                let itemId = parseInt(itanz[0]);
                let itemCount = itanz[1];
                //Find the item in the item list to get its name
                let item = Settings.items.find(i => i.uiid === itemId);
                if(item !== undefined && itemCount > 0) {
                    let opt = document.createElement('option');
                    opt.value = "item-" + item.uiid; //unique item id
                    opt.innerText = item.displayName + ": " + itemCount;
                    list.appendChild(opt);
                }
            }
            break;
        }
        case "skillsList":
        {
            document.getElementById("actionElementsLabel").innerText = "Wybierz umiejętność:";
            //Check that this participant has access to skills
            if(!Object.hasOwn(Settings.participants[Settings.localTurn], "skillsOwned")) return;
            if(Object.keys(Settings.participants[Settings.localTurn].skillsOwned).length < 1) return;
            //Insert all skills
            for (let skillz of Object.entries(Settings.participants[Settings.localTurn].skillsOwned))
            {
                let skillId = parseInt(skillz[0]);
                let skillCooldown = skillz[1];
                //Find the skill in the skill list to get its priority
                let skill = Settings.skills.find(s => s.usid === skillId);
                //Create the list object
                let opt = document.createElement('option');
                opt.value = "skill-" + skillId;
                opt.innerText = skill.name + " (" + skill.priority + ") [" + skillCooldown + "]";
                list.appendChild(opt);
            }
            break;
        }
        case "spellsList":
        {
            document.getElementById("actionElementsLabel").innerText = "Wybierz zaklęcie:";
            //Check that this participant has access to spells
            if(!Object.hasOwn(Settings.participants[Settings.localTurn], "spellsOwned")) return;
            if(Object.keys(Settings.participants[Settings.localTurn].spellsOwned).length < 1) return;
            //Insert all spells
            for (let spellz of Object.entries(Settings.participants[Settings.localTurn].spellsOwned))
            {
                let spellId = parseInt(spellz[0]);
                let spellCooldown = spellz[1];
                //Find the spell in the spell list to get its priority
                let spell = Settings.spells.find(s => s.uspid === spellId);
                //Create the list object
                let opt = document.createElement('option');
                opt.value = "spell-" + spellId;
                opt.innerText = spell.name + " (" + spell.priority + ") [" + spellCooldown + "]";
                list.appendChild(opt);
            }
            break;
        }
        case "debugList":
        {
            document.getElementById("actionElementsLabel").innerText = "Wybierz zasadę:";
            //Apply each debug action independent
            let debugOption1 = document.createElement('option');
            debugOption1.value = "defeatParticipant";
            debugOption1.innerText = "[D] Zabij uczestnika";
            let debugOption2 = document.createElement('option');
            debugOption2.value = "winBattle";
            debugOption2.innerText = "[D] Wygraj walkę";
            let debugOption3 = document.createElement('option');
            debugOption3.value = "loseBattle";
            debugOption3.innerText = "[D] Przegraj walkę";
            let debugOption4 = document.createElement('option');
            debugOption4.value = "setNextRoll";
            debugOption4.innerText = "[D] Ustaw Następny Rzut";
            list.appendChild(debugOption1);
            list.appendChild(debugOption2);
            list.appendChild(debugOption3);
            list.appendChild(debugOption4);
            break;
        }
    }

}

/**
 * This function resets and shows the input section that allows the user
 * to manually input a number in range 1-100. Used in debugging only.
 *
 * @function setupInputSection
 * @returns void
 */
function setupInputSection()
{
    let manualInputText = document.getElementById("manualInput");
    //first reset the input field
    manualInputText.innerText = "";
    //now show the input field
    let inputSection = document.getElementById("sectionInput");
    showSection(inputSection);
}

/**
 * This function filters a given array of participants to dead or alive participants,
 * based on the subtype passed
 *
 * @function filterBySubtype
 * @param {array} arrayToFilter the participant array to filter
 * @param {string} subtype the subtype of skill to filter by
 * @returns {array} the filtered array
 */
function filterBySubtype(arrayToFilter, subtype)
{
    if (["restore", "damage"].includes(subtype)) {
        arrayToFilter = arrayToFilter.filter(p => p.health > 0);
    }
    else if (subtype === "revive") {
        arrayToFilter = arrayToFilter.filter(p => p.health === 0);
    }

    return arrayToFilter;
}

export {adjustOptions, filterBySubtype};