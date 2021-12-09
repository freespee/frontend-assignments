// The state of a single box in a specific game.
class Box {
    isOpen : boolean;

    constructor(readonly index: number, readonly hasReward : boolean)
    {
        this.isOpen = false; // All boxes start closed
    }
}

// A single game that a Player can play. Once the game has been played by
// a Player, some boxes will be opened and the game should not be played again.
class Game {
    private readonly boxes : Box[];
    pickedIndex : number; // The index of the chosen box, or -1 if none has been picked.

    constructor(public boxCount: number, private readonly hostRevealCount = 1) {
        // Choose a "random" box index where the reward will be put.
        let prizeIndex = Math.floor(Math.random() * boxCount);

        // Create the boxes for this game. Put a reward in one of them.
        this.boxes = Array(boxCount);
        for (let i = 0; i < boxCount; i++)
            this.boxes[i] = new Box(i, i == prizeIndex);

        this.pickedIndex = -1;
    }

    // Pick the index of the box the player wants to open. Can be called more than
    // once to change the chosen box.
    public pickBox(id: number) : void
    {
        if (id < 0 || id >= this.boxes.length)
            throw new Error("Player tried to pick a box with an invalid index.");

        this.pickedIndex = id;
    }

    // Let the host reveal some empty boxes. The amount of boxes revealed is
    // defined by the game setting hostRevealCount.
    public hostBoxReveal() : void {
        for (let i = 0; i < this.hostRevealCount; i++)
            this.hostRevealOneBox();
    }

    // Reveal a single empty box. Can be called multiple times if there are
    // enough boxes in this game.
    private hostRevealOneBox() : number {
        // Figure out which boxes the host could possibly reveal.
        let mayReveal: Box[] = [];
        for (let i = 0; i < this.boxes.length; i++)
        {
            let box : Box = this.boxes[i];

            // A box can be revealed as long as it fulfills all of the following:
            // 1. Is not the box chosen by the player.
            // 2. The box has not already been opened.
            // 3. The box is empty.
            if (i != this.pickedIndex && !box.isOpen && !box.hasReward)
                mayReveal.push(box);
        }

        if (mayReveal.length == 0)
            throw new Error("There are no more boxes that the host can reveal.");

        // Pick a "random" box from among the valid ones. Mark this box as being open.
        let revealIndex : number = Math.floor(Math.random() * mayReveal.length);
        let box = mayReveal[revealIndex];
        box.isOpen = true;

        return box.index;
    }

    // Get an array of which boxes are opened and which are closed.
    // The box array itself is private to not reveal which box has a reward in it.
    public getBoxOpenStates() : boolean[] {
        return this.boxes.map(v => v.isOpen);
    }

    // Get an array of the indices of the boxes that are currently closed.
    public getClosedBoxIndicies() : number[] {
        return this.boxes.filter(v => !v.isOpen).map(v => v.index);
    }

    // Check if the player has won, using the currently picked box.
    public hasPlayerWon() : boolean {
        if (this.pickedIndex < 0 || this.pickedIndex >= this.boxCount)
            throw new Error("The player has not picked a box yet.");

        return this.boxes[this.pickedIndex].hasReward;
    }
}

// A player can play multiple games and record its success.
abstract class Player {
    private currentGame : Game;
    playedGames : number;
    rewardsWon : number; // The number of games that resulted in a win.

    constructor() {
        this.playedGames = 0;
        this.rewardsWon = 0;
    }

    public playGame(game: Game) {
        this.currentGame = game;

        this.pickBox();
        game.hostBoxReveal();
        this.repickBox(); // This will only repick a box if such a strategy is used

        // Record the sult
        if (game.hasPlayerWon())
            this.rewardsWon++;
        this.playedGames++;
    }

    private pickBox() : void {
        this.pickRandomAvailableBox();
    }

    private repickBox() : void {
        if (this.shouldRepickBox()) // Make sure the player should actually repick.
            this.pickRandomAvailableBox(this.currentGame.pickedIndex);
    }

    // If the player should repick another box, return true.
    protected abstract shouldRepickBox() : boolean;

    private pickRandomAvailableBox(excludeId : number = -1) {
        let boxes : number[] = this.currentGame.getClosedBoxIndicies();
        // If there's a box that shouldn't be picked, remove it from the list.
        if (excludeId != -1)
            boxes = boxes.filter(v => v != excludeId);

        if (boxes.length == 0)
            throw new Error("The player tried to pick a box, but there are no boxes left to pick from.");

        // Choose a "random" box and selected it as the picked one.
        let pickId = Math.floor(Math.random() * boxes.length);
        let pick = boxes[pickId];
        this.currentGame.pickBox(pick);
        return pick;
    }
}

// A Player than always chooses to repick, or never chooses to repick, depending on the constructor parameter.
class PlayerConsistent extends Player {
    constructor(private readonly shouldRepick : boolean) {
        super();
    }

    protected shouldRepickBox() : boolean
    {
        return this.shouldRepick;
    }
}

function playGames() {
    let player: Player = new PlayerConsistent(true);
    let player2: Player = new PlayerConsistent(false);

    for (let i = 0; i < 100000; i++)
    {
        player.playGame(new Game(3));
        player2.playGame(new Game(3));
    }

    let e : HTMLElement = document.getElementById("output");

    e.innerHTML += "Player that opts to pick again: " + player.rewardsWon + " / " + player.playedGames + " games won.<br />";
    e.innerHTML += "Player that sticks to its initial choice: " + player2.rewardsWon + " / " + player2.playedGames + " games won.<br />";
}
