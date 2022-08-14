function startBattle()
{
    let players = [
        {
           playerName: 'Miles',
           health: 100,
           speed: 81,
           atk: 20
        },
        {
           playerName: 'Churchie',
           health: 90,
           speed: 82,
           atk: 15
        },
        {
           playerName: 'Crownsnek',
           health: 80,
           speed: 17,
           atk: 10
       }];

    players.sort((a, b) => b.speed - a.speed);
    console.log(players);

    //Update the battle state description
    document.getElementById("battleStatus").innerText = "W trakcie!";

    //Hide the start battle button and show the next turn button
    document.getElementById("startBattleButton").style.display = "none";
    document.getElementById("nextTurnButton").style.display = "block";

}

function act()
{
    let action = document.getElementById("action").value;
    let target = document.getElementById("target").value;
    switch(action)
    {
        case "attack":
        {
            let currentHealth = document.getElementById(target).children[2].value;
            let playerAttack = document.getElementById("player-1").children[4].value;
            document.getElementById(target).children[2].innerText = currentHealth - playerAttack;
            break;
        }
        default:
        {
            break;
        }
    }
}
