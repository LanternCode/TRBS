/**
 * A special class that stores some parameters of the system
 */
class Settings {
    constructor() {
        /**
         * Whether debugging is enabled or not
         * @type {boolean}
         */
        this.debugging = true;
        /**
         * Pre-defined priority 2 flag
         * @type {boolean}
         */
        this.priorityTwo = true;
        /**
         * Pre-defined priority 3 flag
         * @type {boolean}
         */
        this.priorityThree = true;
        /**
         * Pre-defined global turn counter
         * @type {number}
         */
        this.globalTurn = 1;
        /**
         * Pre-defined local turn counter
         * @type {number}
         */
        this.localTurn = 0;
    }
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