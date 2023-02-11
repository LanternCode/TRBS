import {Settings} from "./settings.js";

/**
 * This function is called when an action is selected to define which elements should show up
 * as each action uses different elements, which are items, skills or debug actions.
 * Not all actions (reg attack, dodge) have elements. When an element is selected, this
 * function handles the target generation for that element, ex. healing potion can only
 * be used on a living participant of the same type. The filter param specifies which
 * list will be affected, actionElements for actionElementsList, targets for targetsList,
 * reset hides both lists and resets the current action.
 *
 * @function adjustOptions
 * @param {string} filter - one of the three: actionElements,targets or reset
 * @return void
 */
function adjustOptions(filter) {
    //hook for each section
    let actionList = document.getElementById("actionList");
    let action = actionList.value;
    let actionElementsSection = document.getElementById("actionElementsSection");
    let actionElementsList = document.getElementById("actionElementsList");
    let targetSection = document.getElementById("sectionTarget");

    //filter specifies which section needs to update once an action was picked
    if(filter === "actionElements") {
        switch(action)
        {
            case "regAttack":
            {
                hideSection(actionElementsSection);
                prepareTargetSection(getAttackableTargets());
                showSection(targetSection);
                break;
            }
            case "dodge":
            {
                hideSection(actionElementsSection);
                hideSection(targetSection);
                break;
            }
            case "item":
            {
                hideSection(targetSection);
                createActionElementsList("itemsList");
                showSection(actionElementsSection);
                break;
            }
            case "skill":
            {
                hideSection(targetSection);
                createActionElementsList("skillsList");
                showSection(actionElementsSection);
                break;
            }
            case "debug":
            {
                hideSection(targetSection);
                createActionElementsList("debugList");
                showSection(actionElementsSection);
                break;
            }
            default:
            {
                //only print errors to the console when debugging is enabled
                if(Settings.debuggingEnabled())
                    console.log("An error has occured, the following value was passed as action: ", action);
            }
        }
    }
    else if (filter === "targets") {
        //to update the targets list, fetch the selected element and obtain its type
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
                createSkillTargetList();
                showSection(targetSection);
                break;
            }
            case "debug":
            {
                createDebugTargetList();
                showSection(targetSection);
                break;
            }
            default:
            {
                //only print errors to the console when debugging is enabled
                if(Settings.debuggingEnabled())
                    console.log("An error has occured, the following value was passed as actionElementType: ", actionElementType);
            }
        }
    }
    else if(filter === "reset") {
        //reset simply hides all sections and resets the action choice
        hideSection(actionElementsSection);
        hideSection(targetSection);
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
    //declare a list to store available targets
    let filteredList;
    //Apply filtering
    if(participants[Settings.localTurn].type === "player")
    {
        filteredList = participants.filter(p => p.type === "enemy").filter(p => p.health > 0);
    }
    else {
        filteredList = participants.filter(p => p.type === "player").filter(p => p.health > 0);
    }
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
    //get the items list
    let itemsList = document.getElementById("actionElementsList");
    //check if the selection was removed, if so, return an empty array
    if (itemsList.value === '') return [];
    //Get the item id from the list
    let itemId = parseInt(itemsList.value.split("-")[1]);
    //find the item in the items array to get its properties
    let item = items.find(i => i.uiid === itemId);
    //declare a list to store available targets
    let filteredList = [];
    //based on the subtype of the item, find available targets
    let subtype = item.subtype;
    switch(subtype)
    {
        //to restore hp the target must be alive - hp > 0
        case "restore":
        {
            if(participants[Settings.localTurn].type === "player")
            {
                filteredList = participants.filter(p => p.type === "player").filter(p => p.health > 0);
            }
            else {
                filteredList = participants.filter(p => p.type === "enemy").filter(p => p.health > 0);
            }
            break;
        }
        case "revive":
        {
            //to revive, the target must be dead - hp = 0
            if(participants[Settings.localTurn].type === "player")
            {
                filteredList = participants.filter(p => p.type === "player").filter(p => p.health === 0);
            }
            else {
                filteredList = participants.filter(p => p.type === "enemy").filter(p => p.health === 0);
            }
            break;
        }
    }
    return filteredList;
}

/**
 * This function makes a list of targets that can be targets of the skill selected by the participant
 * And calls the adequate function to implement that list
 *
 * @function createSkillTargetList
 * @returns {void} The function calls the prepareTargetSection function immediately
 */
function createSkillTargetList()
{
    //get the skills list
    let skillsList = document.getElementById("actionElementsList");
    //check if a skill was selected, otherwise exit
    if (skillsList.value === '') return;
    //declare a list to store available targets
    let filteredList = [];
    //get the skill id
    let skillId = parseInt(skillsList.value.split("-")[1]);
    //find the skill in the skill list to get its properties
    let skill = skills.find(s => s.usid === skillId);
    //based on the properties of the skill, find available targets
    let subtype = skill.subtype;
    let range = skill.range;
    let target_group = skill.targetGroup;
    //check if the spell targets literally everyone - if so, job done
    if(range === "everyone") {
        prepareTargetSection([], "everyone");
        return;
    }
    //first filtering to determine which side to target (player, enemy, reversed)
    if(target_group === "reversed")
    {
        if(participants[Settings.localTurn].type === "player")
            target_group = "enemy";
        else target_group = "player";
    }
    if(range === "all"){
        //if we target everyone from that group - job done
        prepareTargetSection([], target_group);
        return;
    }
    //individual filtering includes dead or alive participants based on the subtype of the skill
    filteredList = participants.filter(p => p.type === target_group);
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
    //get the debug actions list
    let debugList = document.getElementById("actionElementsList");
    //check if an action was selected, otherwise exit
    if (debugList.value === '') return;
    //get the skill id
    //let actionName = debugList.value.splice("-")[1];
    let actionName = debugList.value;
    //check if the action targets literally everyone - if so, job done
    if(["winBattle", "loseBattle"].includes(actionName)) {
        prepareTargetSection([], "everyone");
    }
    else {
        //for now the only other testing action is to defeat any participant
        //so proceed with the list of all participants
        prepareTargetSection(participants);
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
        //construct the special option and insert it into the list
        let text = specialCase === "everyone" ? "Wszyscy Uczestnicy" : (specialCase === "player" ? "Wszyscy Gracze" : "Wszyscy Przeciwnicy");
        let opt = document.createElement('option');
        opt.value = specialCase;
        opt.innerText = text;
        targetListSection.appendChild(opt);
    }
    else {
        for(let i = 0; i < participants.length; ++i)
        {
            for(let j = 0; j < targetList.length; ++j)
            {
                if(participants[i] === targetList[j])
                {
                    //construct the option and insert it into the list
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
    //remove all children
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
            if(Object.keys(participants[Settings.localTurn].itemsOwned).length < 1) return;
            //Then insert all list items
            for (let itanz of Object.entries(participants[Settings.localTurn].itemsOwned))
            {
                let itemId = parseInt(itanz[0]);
                let itemCount = itanz[1];
                //find the item in the item list to get its name
                let item = window.items.find(i => i.uiid === itemId);
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
            if(!Object.hasOwn(participants[Settings.localTurn], "skillsOwned")) return;
            if(Object.keys(participants[Settings.localTurn].skillsOwned).length < 1) return;
            //Insert all skills
            for (let skillz of Object.entries(participants[Settings.localTurn].skillsOwned))
            {
                let skillId = parseInt(skillz[0]);
                let skillCooldown = skillz[1];
                //find the skill in the skill list to get its priority
                let skill = skills.find(s => s.usid === skillId);
                //create the list object
                let opt = document.createElement('option');
                opt.value = "skill-" + skillId;
                opt.innerText = skill.name + " (" + skill.priority + ") [" + skillCooldown + "]";
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
            list.appendChild(debugOption1);
            list.appendChild(debugOption2);
            list.appendChild(debugOption3);
            break;
        }
    }

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
    if (["restore", "damaging"].includes(subtype)) {
        arrayToFilter = arrayToFilter.filter(p => p.health > 0);
    }
    else if (subtype === "revive") {
        arrayToFilter = arrayToFilter.filter(p => p.health === 0);
    }

    return arrayToFilter;
}

export {adjustOptions, filterBySubtype};