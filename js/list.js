import {newSystemCall} from "./action.js";

/**
 * This function is called when an action is selected to define which sections should show up
 * as each action uses a different section, or a mix of them
 *
 * @function adjustOptions
 * @param {boolean} [reset] - whether to simply hide all section or not
 * @param {boolean} [itempicked] - whether a specific item was picked from the list
 * @param {boolean} [skillpicked] - whether a specific skill was picked from the list
 * @param {boolean} [testingpicked] - whether a specific testing action was picked from the list
 * @return void
 */
function adjustOptions(reset = false, itempicked = false, skillpicked = false, testingpicked = false) {
    let option = (reset === true) ? "dodge" : (itempicked === true ? "itempicked" : (skillpicked === true ? "skillpicked" : (testingpicked === true ? "testingpicked" : this.value)));
    let itemSection = document.getElementById("sectionItem");
    let skillSection = document.getElementById("sectionSkill");
    let targetSection = document.getElementById("sectionTarget");
    let testingSection = document.getElementById("sectionTesting");
    switch(option)
    {
        case "attack":
        {
            hideSection(itemSection);
            hideSection(skillSection);
            prepareTargetSection(adjustAttackTargets());
            showSection(targetSection);
            break;
        }
        case "dodge":
        {
            //dodge is also used for "reset" as it literally hides everything
            hideSection(itemSection);
            hideSection(skillSection);
            hideSection(targetSection);
            hideSection(testingSection);
            break;
        }
        case "item":
        {
            if(participants[localTurn].type === "player" || (participants[localTurn].hasOwnProperty('subtype') && participants[localTurn].subtype === "human"))
            {
                updateList("itemsList");
                showSection(itemSection);
                hideSection(skillSection);
                hideSection(targetSection);
            }
            else {
                newSystemCall("Tylko ludzie mogą używać przedmioty!");
            }

            break;
        }
        case "itempicked":
        {
            prepareTargetSection(adjustItems());
            showSection(itemSection);
            hideSection(skillSection);
            showSection(targetSection);
            break;
        }
        case "skill":
        {
            updateList("skillsList");
            hideSection(itemSection);
            showSection(skillSection);
            hideSection(targetSection);
            break;
        }
        case "skillpicked":
        {
            adjustSkills();
            hideSection(itemSection);
            showSection(skillSection);
            showSection(targetSection);
            break;
        }
        case "testing":
        {
            showSection(testingSection);
            hideSection(itemSection);
            hideSection(targetSection);
            hideSection(skillSection);
            break;
        }
        case "testingpicked":
        {
            setTestingActions();
            hideSection(itemSection);
            hideSection(skillSection);
            showSection(targetSection);
            break;
        }
        default:
        {
            break;
        }
    }
}

/**
 * This function filters the targets list to only show targets that the currently acting person
 * can attack, aka. the opposite faction members who are still alive
 *
 * @function adjustAttackTargets
 * @returns {array} the list of attackable targets
 */
function adjustAttackTargets()
{
    //declare a list to store available targets
    let filteredList = [];
    //Apply filtering
    if(participants[localTurn].type === "player")
    {
        filteredList = participants.filter(p => p.type === "enemy").filter(p => p.health > 0);
    }
    else {
        filteredList = participants.filter(p => p.type === "player").filter(p => p.health > 0);
    }
    return filteredList;
}

/**
 * This function makes a list of targets that can be targets of the item selected by the participant
 * Some items can only be used on dead targets etc. and only on members of your own faction etc.
 *
 * @function adjustItems
 * @returns {array} A list of valid targets to use the item on
 */
function adjustItems()
{
    //get the items list
    let itemsList = document.getElementById("itemsList");
    //check if the selection was removed, if so, return an empty array
    if (itemsList.value === '') return [];
    //find the item in the item list to get its name
    let item = items.find(i => i.name === itemsList.value);
    //declare a list to store available targets
    let filteredList = [];
    //based on the subtype of the item, find available targets
    let subtype = item.subtype;
    switch(subtype)
    {
        case "restore":
        {
            if(participants[localTurn].type === "player")
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
            if(participants[localTurn].type === "player")
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
 * @function adjustSkills
 * @returns {void} The function calls the prepareTargetSection function immediately
 */
function adjustSkills()
{
    //get the skills list
    let skillsList = document.getElementById("skillsList");
    //check if a skill was selected, otherwise exit
    if (skillsList.value === '') return;
    //declare a list to store available targets
    let filteredList = [];
    //find the skill in the skill list to get its properties
    let skill = skills.find(s => s.name === skillsList.value);
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
        if(participants[localTurn].type === "player")
            target_group = "enemy";
        else target_group = "player";
    }
    if(range === "all"){
        //if we target everyone from that group - job done
        prepareTargetSection([], target_group);
        return;
    }
    //individual filtering includes dead or alive participants based on the subtype of the skill
    filteredList = filterBySubtype(filteredList, subtype);

    prepareTargetSection(filteredList);
}

/**
 * This function makes a list of targets that can be targets of the special action
 * And calls the adequate function to implement that list
 *
 * @function setTestingActions
 * @returns {void} The function calls the prepareTargetSection function immediately
 */
function setTestingActions()
{
    //get the testing actions list
    let testingList = document.getElementById("testingList");
    //check if an action was selected, otherwise exit
    if (testingList.value === '') return;
    //declare a list to store available targets
    let filteredList = [];
    //check if the action targets literally everyone - if so, job done
    if(["winBattle", "loseBattle"].includes(testingList.value)) {
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
 * This function updates the item or skills list to these owned by a participant
 *
 * @function updateList
 * @param {string} listName the id of the list to be updated
 * @return {void}
 */
function updateList(listName)
{
    //remove all children
    let list = document.getElementById(listName);
    list.innerHTML = '';
    //Insert the first entry that prompts to select an item or skill
    let opt = document.createElement('option');
    opt.value = "";
    opt.innerText = "Wybierz";
    list.appendChild(opt);
    //use the attribute based on the list selected
    let attName = listName === "itemsList" ? "itemsOwned" : "skillsOwned";
    if(participants[localTurn][attName] === null || typeof participants[localTurn][attName] === 'undefined')
    {
        //list objects are unavailable
    }
    else
    {
        if(listName === "itemsList")
        {
            //Then insert all list items
            for (let itanz of Object.entries(participants[localTurn].itemsOwned))
            {
                let item_name = itanz[0];
                let item_count = itanz[1];
                //find the item in the item list to get its name
                let item = items.find(i => i.name === item_name);
                if(item_count > 0) {
                    let opt = document.createElement('option');
                    opt.value = item_name;
                    opt.innerText = item.displayName + ": " + item_count;
                    list.appendChild(opt);
                }
            }
        }
        else {
            //Insert all skills
            for (let skillz of Object.entries(participants[localTurn].skillsOwned))
            {
                let skillName = skillz[0];
                let skillCooldown = skillz[1];
                //find the skill in the skill list to get its priority
                let skill = skills.find(s => s.name === skillName);
                //create the list object
                let opt = document.createElement('option');
                opt.value = skillName;
                opt.innerText = skillName + " (" + skill.priority + ") [" + skillCooldown + "]";
                list.appendChild(opt);
            }
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

export {adjustOptions, adjustItems, updateList, adjustSkills, filterBySubtype};