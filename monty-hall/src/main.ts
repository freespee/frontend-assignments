class Box {
    isOpen : boolean;

    constructor(readonly index: number, readonly hasReward : boolean)
    {
        this.isOpen = false;
    }
}


class Game {
    private readonly boxes : Box[];
    pickedIndex : number;

    constructor(public boxCount: number) {
        let prizeIndex = Math.floor(Math.random() * boxCount);

        this.boxes = Array(boxCount);
        for (let i = 0; i < boxCount; i++)
            this.boxes[i] = new Box(i, i == prizeIndex);

        this.pickedIndex = -1;
    }

    public pickBox(id: number) : void
    {
        if (id < 0 || id >= this.boxes.length)
            throw new Error("Player tried to pick a box with an invalid index.");

        this.pickedIndex = id;
    }

    public hostBoxReveal() : number {
        let mayReveal: Box[] = [];

        for (let i = 0; i < this.boxes.length; i++)
        {
            let box : Box = this.boxes[i];
            if (i != this.pickedIndex && !box.isOpen && !box.hasReward)
                mayReveal.push(box);
        }

        if (mayReveal.length == 0)
            throw new Error("There are no more boxes that the host can reveal.");

        let revealIndex : number = Math.floor(Math.random() * mayReveal.length);
        let box = mayReveal[revealIndex];
        box.isOpen = true;

        return box.index;
    }

    public getBoxOpenStates() : boolean[] {
        return this.boxes.map(v => v.isOpen);
    }

    public getClosedBoxIndicies() : number[] {
        return this.boxes.filter(v => !v.isOpen).map(v => v.index);
    }

    public hasPlayerWon() : boolean {
        if (this.pickedIndex < 0 || this.pickedIndex >= this.boxCount)
            throw new Error("The player has not picked a box yet.");

        return this.boxes[this.pickedIndex].hasReward;
    }
}

abstract class Player {
    private currentGame : Game;

    constructor() {

    }

    public playGame(game: Game) {
        this.currentGame = game;

        this.pickBox();
        game.hostBoxReveal();
        this.repickBox();

        document.writeln(game.hasPlayerWon().toString());
    }

    private pickBox() : void {
        this.pickRandomAvailableBox();
    }

    private repickBox() : void {
        if (this.shouldRepickBox())
            this.pickRandomAvailableBox(this.currentGame.pickedIndex);
    }

    protected abstract shouldRepickBox() : boolean;

    private pickRandomAvailableBox(excludeId : number = -1) {
        let boxes : number[] = this.currentGame.getClosedBoxIndicies();
        if (excludeId != -1)
            boxes = boxes.filter(v => v != excludeId);

        if (boxes.length == 0)
            throw new Error("The player tried to pick a box, but there are no boxes left to pick from.");

        let pick = Math.floor(Math.random() * boxes.length);
        this.currentGame.pickBox(pick);
        return pick;
    }
}

class PlayerConsistent extends Player {
    constructor(private readonly shouldRepick : boolean) {
        super();
    }

    protected shouldRepickBox() : boolean
    {
        return this.shouldRepick;
    }
}

function init() {
    let player: Player = new PlayerConsistent(true);

    player.playGame(new Game(3));
    player.playGame(new Game(3));
    player.playGame(new Game(5));
}
