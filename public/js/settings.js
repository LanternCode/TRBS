/**
 * A special class that stores some parameters of the system
 */
class Settings {
    constructor() {
    }
    /**
     * Whether debugging is enabled or not
     * @type {boolean}
     */
    static debugging = true;
    /**
     * Pre-defined priority 2 flag
     * @type {boolean}
     */
    static priorityTwo = true;
    /**
     * Pre-defined priority 3 flag
     * @type {boolean}
     */
    static priorityThree = true;
    /**
     * Pre-defined global turn counter
     * @type {number}
     */
    static globalTurn = 1;
    /**
     * Pre-defined local turn counter
     * @type {number}
     */
    static localTurn = 0;
    /**
     * Pre-defined player counter
     * @type {number}
     */
    static playerCount = 0;
    /**
     * Pre-defined enemy counter
     * @type {number}
     */
    static enemyCount = 0;
    /**
     * Second counter that only tracks added enemies for number assignment
     * @type {number}
     */
    static addedEnemiesCount = 0;
    static debuggingEnabled() {
        return this.debugging;
    }
    static createAnonymous() {
        console.log("Hello");
        //let name = gender == "male" ? "John Doe" : "Jane Doe";
        //return new Person(name);
    }
}

export {Settings};
