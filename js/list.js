function adjustOptions() {
    let option = this.value;
    switch(option)
    {
        case "attack":
        {
            //hide the item list
            //hide the skills list
            //enable the targets list
            break;
        }
        case "dodge":
        {
            //hide all lists
            break;
        }
        case "item":
        {
            //show the item list
            //hide the skills list
            //hide the targets list (enable on item choice)
            break;
        }
        case "skill":
        {
            //show the skill list
            //hide the item list
            //hide the targets list (enables on skill choice)
            break;
        }
        default:
        {
            break;
        }
    }
}

export {adjustOptions};