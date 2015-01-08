/**
 * Author: Ying Xiong.
 * Created: Dec 22, 2014.
 */
var model = {
    boardSize: 7,
    rows: ["A", "B", "C", "D", "E", "F", "G"],
    cols: ["0", "1", "2", "3", "4", "5", "6"],

    shipLength: 3,
    numShips: 3,
    numSunk: 0,
    /* The 'ships' field will be randomly generated, of the following format.
    ships: [
        { locations: ["A6", "B6", "C6"], hits: [false, false, false] },
        { locations: ["C4", "D4", "E4"], hits: [false, false, false] },
        { locations: ["B0", "B1", "B2"], hits: [false, false, false] }
    ],
    */

    init: function() {
        this.generateShips();
    },

    fire: function(guess) {
        for (var i = 0; i < this.numShips; i++) {
            var ship = this.ships[i];
            var index = ship.locations.indexOf(guess);
            if (index == -1) {
                continue;
            }
            if (ship.hits[index]) {
                return "previously-hit";
            } else {
                ship.hits[index] = true;
                if (this.isSunk(ship)) {
                    this.numSunk++;
                    return "sunk";
                } else {
                    return "hit";
                }
            }
        }
        return "miss";
    },

    isSunk: function(ship) {
        for (var i = 0; i < this.shipLength; i++) {
            if (!ship.hits[i]) {
                return false;
            }
        }
        return true;
    },

    generateShips: function() {
        this.ships = [];
        while (this.ships.length < this.numShips) {
            var ship = this.generateShip();
            var collision = false;
            for (var j = 0; j < this.ships.length; j++) {
                if (this.shipCollision(ship, this.ships[j])) {
                    collision = true;
                }
            }
            if (!collision) {
                this.ships.push(ship);
            }
        }
    },

    generateShip: function() {
        var direction = Math.floor(Math.random() * 2);
        var locations = [];
        if (direction === 0) {   // Horizontal.
            var r = Math.floor(Math.random() * this.boardSize);
            var c = Math.floor(Math.random() *
                               (this.boardSize - this.shipLength + 1));
            for (var i = 0; i < this.shipLength; i++) {
                locations.push(this.rows[r] + this.cols[c+i]);
            }
        } else {   // Vertical.
            var r = Math.floor(Math.random() *
                               (this.boardSize - this.shipLength + 1));
            var c = Math.floor(Math.random() * this.boardSize);
            for (var i = 0; i < this.shipLength; i++) {
                locations.push(this.rows[r+i] + this.cols[c]);
            }
        }
        var hits = [];
        for (var i = 0; i < this.shipLength; i++) {
            hits.push(false);
        }
        return { locations: locations, hits: hits };
    },

    shipCollision: function(ship1, ship2) {
        for (var i = 0; i < ship1.locations.length; i++) {
            for (var j = 0; j < ship2.locations.length; j++) {
                if (ship1.locations[i] === ship2.locations[j]) {
                    return true;
                }
            }
        }
        return false;
    }
};

var view = {
    init: function() {
        view.initBoardTable();
        view.setOnclickHandlers();
        $("#restartButton").click(function() {
            model.init();
            view.init();
            controller.init();
        });
    },
    initBoardTable: function() {
        tableHtml = "";
        for (var i = 0; i < model.rows.length; i++) {
            tableHtml += "<tr>";
            for (var j = 0; j < model.cols.length; j++) {
                tableHtml += "<td id=\"" + model.rows[i] + model.cols[j] +
                    "\"></td>"
            }
            tableHtml += "</tr>";
        }
        $("#boardTable").html(tableHtml);
    },
    displayMessage: function(message) {
        $("#messageArea").html(message);
    },
    displayHit: function(location) {
        $("#"+location).attr("class", "hit");
    },
    displayMiss: function(location) {
        $("#"+location).attr("class", "miss");
    },
    setOnclickHandlers: function() {
        for (var i = 0; i < model.rows.length; i++) {
            for (var j = 0; j < model.cols.length; j++) {
                var r = model.rows[i];
                var c = model.cols[j];
                $("#"+r+c).click(function() {
                    controller.processGuess(this.id);
                });
            }
        }
    }
};

var controller = {
    GameStateEnum: {
        PLAYING:   0,
        WIN:       1
    },
    /* The following field will be created in `init()` function.
    gameState: controller.GameStateEnum.PLAYING,
    */
    init: function() {
        this.gameState = this.GameStateEnum.PLAYING;
    },
    processGuess: function(guess) {
        if (this.gameState === this.GameStateEnum.WIN) {
            return;
        }
        var result = model.fire(guess);
        if (result === "sunk") {
            view.displayHit(guess);
            if (model.numSunk === model.numShips) {
                view.displayMessage("You sank all my battleships!");
                this.gameState = this.GameStateEnum.WIN;
            } else {
                view.displayMessage("You sank my battleship!");
            }
        } else if (result === "hit") {
            view.displayHit(guess);
            view.displayMessage("You hit my battleship.");
        } else if (result === "miss") {
            view.displayMiss(guess);
            view.displayMessage("You missed.");
        } else if (result === "previously-hit") {
            view.displayMessage("Oops, you already hit that location!");
        } else {
            throw new Error("Unexpected result '" + result + "'.");
        }
    }
};

$(document).ready(function() {
    model.init();
    view.init();
    controller.init();
});
