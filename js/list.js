/**
 * This function is called when an action is selected to define which sections should show up
 * as each action uses a different section, or a mix of them
 *
 * @function adjustOptions
 * @param {boolean} [reset] - whether to simply hide all section or not
 * @param {boolean} [itempicked] - whether a specific item was picked from the list
 * @param {boolean} [skillpicked] - whether a specific skill was picked from the list
 * @return void
 */
function adjustOptions(reset = false, itempicked = false, skillpicked = false) {
    let option = (reset === true) ? "dodge" : (itempicked === true ? "itempicked" : this.value);
    let itemSection = document.getElementById("sectionItem");
    let skillSection = document.getElementById("sectionSkill");
    let targetSection = document.getElementById("sectionTarget");
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
            hideSection(itemSection);
            hideSection(skillSection);
            hideSection(targetSection);
            break;
        }
        case "item":
        {
            showSection(itemSection);
            hideSection(skillSection);
            hideSection(targetSection);
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
            hideSection(itemSection);
            showSection(skillSection);
            hideSection(targetSection);
            break;
        }
        case "skillpicked":
        {
            //to be implemented together with use ability/spell
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
 * To be implemented when the use skill/spell action is added
 */
function adjustSkills()
{
    console.log(this.value);
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
 * This function takes a list of participants and generates the pick target section from the list
 *
 * @function prepareTargetSection
 * @param {array} targetList a list of participants
 * @return void
 */
function prepareTargetSection(targetList)
{
    //Get the targets list
    let targetListSection = document.getElementById("targetsList");
    //Reset the list
    targetListSection.innerHTML = '';
    //Generate the list
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

export {adjustOptions, adjustItems, adjustSkills};