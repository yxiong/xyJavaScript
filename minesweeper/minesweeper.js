/**
 * Author: Ying Xiong.
 * Created: Dec 26, 2014.
 */
var model = {
    CellStateEnum: {
        INTACT:    0,
        EXPOSED:   1,
        MARKED:    2,
        QUESTION:  3,
        EXPLODED:  4,
        WRONG:     5,
        isExposable: function(state) {
            return (state === this.INTACT) || (state === this.QUESTION);
        }
    },
    /* The following fields will be created in 'init' function.
    numRows: 8,
    numCols: 8,
    numCells: numRows * numCols,
    numMines: 10,
    numExposed: 0,
    numMarked: 0,
    // The 'isMine' field will be randomly generated.
    isMine: [[false, false],
             [ true, false],
             [false,  true]],
    // The 'cellStates' field will be initialized with all
    // 'model.CellStateEnum.INTACT'.
    cellStates: [[model.CellStateEnum.INTACT, model.CellStateEnum.INTACT]
                 [model.CellStateEnum.INTACT, model.CellStateEnum.INTACT]
                 [model.CellStateEnum.INTACT, model.CellStateEnum.INTACT]],
    // The 'neighborCounts' field will be initialized according to 'isMine', and
    // the mine itself will be set to 9.
    neighborCounts: [[1, 1],
                     [9, 2],
                     [2, 9]],
    */
    init: function(numRows, numCols, numMines) {
        this.numRows = numRows;
        this.numCols = numCols;
        this.numMines = numMines;
        this.numCells = this.numRows * this.numCols;
        this.numExposed = 0;
        this.numMarked = 0;
        this.generateRandomIsMine();
        this.setNeighborCounts();
    },
    generateRandomIsMine: function() {
        var mineIndices = randomIntegers(0, this.numCells, this.numMines);
        this.isMine = new Array(this.numRows);
        this.cellStates = new Array(this.numRows);
        for (var i = 0; i < this.numRows; i++) {
            this.isMine[i] = new Array(this.numCols);
            this.cellStates[i] = new Array(this.numCols);
            for (var j = 0; j < this.numCols; j++) {
                idx = i * this.numCols + j;
                this.isMine[i][j] = (mineIndices.indexOf(idx) >= 0);
                this.cellStates[i][j] = this.CellStateEnum.INTACT;
            }
        }
    },
    setNeighborCounts: function() {
        this.neighborCounts = new Array(this.numRows);
        for (var i = 0; i < this.numRows; i++) {
            this.neighborCounts[i] = new Array(this.numCols);
            for (var j = 0; j < this.numCols; j++) {
                this.neighborCounts[i][j] = this.countNeighbor(i, j);
            }
        }
    },
    countNeighbor: function(row, col) {
        if (this.isMine[row][col]) {
            return 9;
        }
        var count = 0;
        for (var i = row-1; i <= row+1; i++) {
            for (var j = col-1; j <= col+1; j++) {
                if (this.isValidRowCol(i,j) && this.isMine[i][j]) {
                    count += 1;
                }
            }
        }
        return count;
    },
    isValidRowCol: function(row, col) {
        return (row >= 0) && (row < this.numRows) &&
            (col >= 0) && (col < this.numCols);
    },
    isCellExposable: function(row, col) {
        return this.CellStateEnum.isExposable(this.cellStates[row][col]);
    },
    expose: function(row, col) {
        assert(controller.gameState === controller.GameStateEnum.PLAYING);
        assert(this.isCellExposable(row, col));
        if (this.isMine[row][col]) {
            this.explode(row, col);
        } else {
            // Run breadth-first search.
            var preVisited = new Set(["r"+row+"c"+col]);
            var exposeQueue = [[row,col]];
            while (exposeQueue.length > 0) {
                var rc = exposeQueue.shift();
                this.cellStates[rc[0]][rc[1]] = this.CellStateEnum.EXPOSED;
                this.numExposed++;
                view.updateCell(rc[0], rc[1]);
                if (this.neighborCounts[rc[0]][rc[1]] === 0) {
                    for (var i = rc[0]-1; i <= rc[0]+1; i++) {
                        for (var j = rc[1]-1; j <= rc[1]+1; j++) {
                            if (!this.isValidRowCol(i,j)) {
                                continue;
                            }
                            if (this.isValidRowCol(i,j) &&
                                !preVisited.has("r"+i+"c"+j) &&
                                this.isCellExposable(i,j)) {
                                preVisited.add("r"+i+"c"+j);
                                exposeQueue.push([i,j]);
                            }
                        }
                    }
                }
            }
            if (this.numExposed+this.numMines === this.numCells) {
                controller.win();
            }
        }
    },
    exposeNeighborsIfReady: function(row, col) {
        assert(controller.gameState === controller.GameStateEnum.PLAYING);
        var markCount = 0;
        var i,j;
        for (i = row-1; i <= row+1; i++) {
            for (j = col-1; j <= col+1; j++) {
                if (this.isValidRowCol(i,j) &&
                    this.cellStates[i][j] === this.CellStateEnum.MARKED) {
                    markCount++;
                }
            }
        }
        if (markCount === this.neighborCounts[row][col]) {
            for (i = row-1; i <= row+1; i++) {
                for (j = col-1; j <= col+1; j++) {
                    if (i < 0 || i >= this.numRows ||
                        j < 0 || j >= this.numCols ||
                        (i === row && j === col)) {
                        continue;
                    }
                    if (this.isCellExposable(i,j)) {
                        this.expose(i, j);
                    }
                }
            }
        }
    },
    explode: function(row, col) {
        this.cellStates[row][col] = this.CellStateEnum.EXPLODED;
        for (var i = 0; i < this.numRows; i++) {
            for (var j = 0; j < this.numCols; j++) {
                switch (this.cellStates[i][j]) {
                case this.CellStateEnum.INTACT:
                case this.CellStateEnum.QUESTION:
                    this.cellStates[i][j] = this.CellStateEnum.EXPOSED;
                    break;
                case this.CellStateEnum.EXPOSED:
                case this.CellStateEnum.EXPLODED:
                    // Do nothing.
                    break;
                case this.CellStateEnum.MARKED:
                    // Check whether the mark is wrong.
                    if (!this.isMine[i][j]) {
                        this.cellStates[i][j] = this.CellStateEnum.WRONG;
                    }
                    break;
                default:
                    throw new Error("Internal error: unknown state " +
                                    this.cellStates[i][j]);
                }
                view.updateCell(i, j);
            }
        }
        controller.lose();
    }
};

var view = {
    firstTimeInit: true,
    mouseLeftButtonDown: false,
    init: function() {
        // Render 'board' html.
        var img = $("<img/>", {
            width: "16",
            height: "16",
            src: "imgs/cell/intact.png"
        })[0].outerHTML;
        var tableRows = [];
        for (var i = 0; i < model.numRows; i++) {
            var cells = [];
            for (var j = 0; j < model.numCols; j++) {
                var id = "r" + i + "c" + j;
                cells.push("<td id=\"" + id + "\">" + img + "</td>");
            }
            tableRows.push("<tr>" + cells.join("") + "</tr>");
        }
        $("#board").html("<table>" + tableRows.join("") + "</table>");
        // Element locations, counter, timer, face and control pannel.
        var boardWidth = 16*model.numCols;
        $("#board").css("width", boardWidth + "px");
        $("#upper").css("width", boardWidth + "px");
        $("#control-panel").css("left", (boardWidth + 30) + "px");
        this.updateDigits("counter", model.numMines);
        this.updateDigits("timer", 0);
        this.updateFace("smile");
        $("#custom-size input[name='num-rows']").val(model.numRows);
        $("#custom-size input[name='num-cols']").val(model.numCols);
        $("#custom-size input[name='num-mines']").val(model.numMines);
        // Set event handlers.
        if (this.firstTimeInit) {
            $(document).mousedown(function(event) {
                if (event.which === 1) {
                    view.mouseLeftButtonDown = true;
                }
            });
            $(document).mouseup(function(event) {
                if (event.which === 1) {
                    view.mouseLeftButtonDown = false;
                }
            });
            this.setBoardMouseEventHandlers();
            this.setFaceMouseEventHandlers();
            this.setControlPanelEventHandlers();
            this.firstTimeInit = false;
        }
    },
    setBoardMouseEventHandlers: function() {
        $("#board").on("mousedown", "td", function(event) {
            if (event.which === 1) {
                view.setCellImagePressed(this.id, true);
            }
        });
        $("#board").on("mouseenter", "td", function(event) {
            if (view.mouseLeftButtonDown) {
                view.setCellImagePressed(this.id, true);
            }
        });
        $("#board").on("mouseleave", "td", function(event) {
            if (view.mouseLeftButtonDown) {
                view.setCellImagePressed(this.id, false);
            }
        });
        $("#board").on("mouseup", "td", function(event) {
            var rowCol = view.rowColFromStr(this.id);
            switch (event.which) {
            case 1:
                view.setCellImagePressed(this.id, false);
                controller.hit(rowCol[0], rowCol[1]);
                break;
            case 3:
                controller.mark(rowCol[0], rowCol[1]);
                break;
            default:
                // Do nothing.
            }
        });
    },
    setFaceMouseEventHandlers: function() {
        $("#face").mousedown(function(event) {
            view.updateFace("pressed");
        });
        $("#face").mouseenter(function(event) {
            if (view.mouseLeftButtonDown) {
                view.updateFace("pressed");
            }
        });
        $("#face").mouseleave(function(event) {
            switch (controller.gameState) {
            case controller.GameStateEnum.INIT:
            case controller.GameStateEnum.PLAYING:
                view.updateFace("smile");
                break;
            case controller.GameStateEnum.WIN:
                view.updateFace("win");
                break;
            case controller.GameStateEnum.LOSE:
                view.updateFace("dead");
                break;
            default:
                throw new Error("Internal error: unknown state" +
                                controller.gameState);
            }
        });
        $("#face").mouseup(function(event) {
            view.updateFace("smile");
            controller.startGame();
        });
    },
    setControlPanelEventHandlers: function() {
        // Set event handler for control panel.
        $("#control-panel input[name='level']:radio").change(function(event) {
            controller.startGame();
        });
        $("#custom-size :text").focus(function(event) {
            $("#control-panel input[value='custom']:radio").prop(
                "checked", true);
        });
        $("#custom-size input[name='num-rows']:text").change(function(event) {
            var numRows = parseInt(event.target.value);
            if (isNaN(numRows) || numRows < 8 || numRows > 24) {
                alert("Number of rows has to be an integer between 8 and 24.");
                $("#custom-size input[name='num-rows']:text").val(model.numRows);
            } else {
                controller.startGame();
            }
        });
        $("#custom-size input[name='num-cols']:text").change(function(event) {
            var numCols = parseInt(event.target.value);
            if (isNaN(numCols) || numCols < 8 || numCols > 30) {
                alert("Number of columns has to be an integer between 8 and 30.");
                $("#custom-size input[name='num-cols']:text").val(model.numCols);
            } else {
                controller.startGame();
            }
        });
        $("#custom-size input[name='num-mines']:text").change(function(event) {
            var numMines = parseInt(event.target.value);
            if (isNaN(numMines) || numMines < 10 || numMines > 668 ||
                numMines >= model.numCells) {
                alert("Number of mines has to be an integer between 10 and 668, and smaller than number of cells.");
                $("#custom-size input[name='num-mines']:text").val(
                    model.numMines);
            } else {
                controller.startGame();
            }
        });
    },
    setCellImagePressed: function(cellStr, down) {
        if (controller.gameState === controller.GameStateEnum.WIN ||
            controller.gameState === controller.GameStateEnum.LOSE) {
            return;
        }
        if (down) {
            this.updateFace("oh");
        } else {
            this.updateFace("smile");
        }
        var cellImg = $("#" + cellStr + ">img");
        var rowCol = view.rowColFromStr(cellStr);
        var row = rowCol[0];
        var col = rowCol[1];
        switch (model.cellStates[row][col]) {
        case model.CellStateEnum.INTACT:
            if (down) {
                cellImg.attr("src", "imgs/cell/pressed.png");
            } else {
                cellImg.attr("src", "imgs/cell/intact.png");
            }
            break;
        case model.CellStateEnum.QUESTION:
            if (down) {
                cellImg.attr("src", "imgs/cell/pressedQuestion.png");
            } else {
                cellImg.attr("src", "imgs/cell/question.png");
            }
            break;
        case model.CellStateEnum.EXPOSED:
            for (var i = row-1; i <= row+1; i++) {
                for (var j = col-1; j <= col+1; j++) {
                    if (i < 0 || i >= model.numRows ||
                        j < 0 || j >= model.numCols ||
                        (i === row && j === col) ||
                        model.cellStates[i][j] === model.CellStateEnum.EXPOSED) {
                        continue;
                    }
                    this.setCellImagePressed("r"+i+"c"+j, down);
                }
            }
            break;
        }
    },
    updateCell: function(row, col) {
        var cellImg = $("#r"+row+"c"+col + ">img");
        var state = model.cellStates[row][col];
        if (state === model.CellStateEnum.INTACT) {
            cellImg.attr("src", "imgs/cell/intact.png");
        } else if (state === model.CellStateEnum.EXPOSED) {
            if (model.isMine[row][col]) {
                cellImg.attr("src", "imgs/cell/mine.png");
            } else {
                var n = model.neighborCounts[row][col];
                cellImg.attr("src", "imgs/cell/" + n + ".png");
            }
        } else if (state === model.CellStateEnum.MARKED) {
            cellImg.attr("src", "imgs/cell/marked.png");
        } else if (state === model.CellStateEnum.QUESTION) {
            cellImg.attr("src", "imgs/cell/question.png");
        } else if (state === model.CellStateEnum.EXPLODED) {
            cellImg.attr("src", "imgs/cell/exploded.png");
        } else if (state === model.CellStateEnum.WRONG) {
            cellImg.attr("src", "imgs/cell/wrong.png");
        } else {
            throw new Error("Internal error: unknown state " + state);
        }
    },
    rowColFromStr: function(str) {
        var cIndex = str.indexOf("c");
        var row = parseInt(str.substring(1, cIndex));
        var col = parseInt(str.substring(cIndex+1));
        return [row, col];
    },
    updateFace: function(str) {
        $("#face > img").attr("src", "imgs/face/"+str+".png");
    },
    updateDigits: function(id, num) {
        assert(id === "counter" || id === "timer");
        if (num > 999) {
            num = 999;
        }
        if (num < -99) {
            num = -99;
        }
        if (num >= 0) {
            $("#"+id+" > .digit1").attr("src", "imgs/counter/" +
                                        Math.floor(num / 100) + ".png");
            num = num % 100;
        } else {
            $("#"+id+" > .digit1").attr("src", "imgs/counter/minus.png");
            num = -num;
        }
        $("#"+id+" > .digit2").attr("src", "imgs/counter/" +
                                    Math.floor(num / 10) + ".png");
        num = num % 10;
        $("#"+id+" > .digit3").attr("src", "imgs/counter/" + num + ".png");
    }
};

var controller = {
    GameStateEnum: {
        INIT:        0,
        PLAYING:     1,
        WIN:         2,
        LOSE:        3
    },
    firstTimeInit: true,
    timerValue: 0,
    /* The following field will be created in `init()` function.
    gameState: controller.GameStateEnum.INIT,
    */
    init: function() {
        this.gameState = this.GameStateEnum.INIT;
        this.timerValue = 0;
        if (this.firstTimeInit) {
            window.setInterval(function (){
                if (controller.gameState === controller.GameStateEnum.PLAYING) {
                    controller.timerValue++;
                    view.updateDigits("timer", controller.timerValue);
                }
            }, 1000);
            this.firstTimeInit = false;
        }
    },
    startGame: function() {
        var level = $("#control-panel input[name='level']:checked").val();
        var numRows, numCols, numMines;
        switch (level) {
        case "beginner":
            numRows = 8;
            numCols = 8;
            numMines = 10;
            break;
        case "intermediate":
            numRows = 16;
            numCols = 16;
            numMines = 40;
            break;
        case "expert":
            numRows = 16;
            numCols = 30;
            numMines = 99;
            break;
        case "custom":
            numRows = parseInt($("#custom-size input[name='num-rows']").val());
            numCols = parseInt($("#custom-size input[name='num-cols']").val());
            numMines = parseInt($("#custom-size input[name='num-mines']").val());
            break;
        default:
            throw new Error("Unknown level '" + level + "'.");
        }
        model.init(numRows, numCols, numMines);
        view.init();
        controller.init();
    },
    hit: function(row, col) {
        if (this.gameState === this.GameStateEnum.INIT) {
            this.gameState = this.GameStateEnum.PLAYING;
        }
        if (this.gameState !== this.GameStateEnum.PLAYING) {
            return;
        }
        switch (model.cellStates[row][col]) {
        case model.CellStateEnum.INTACT:
        case model.CellStateEnum.QUESTION:
            model.expose(row, col);
            break;
        case model.CellStateEnum.EXPOSED:
            model.exposeNeighborsIfReady(row, col);
            break;
        case model.CellStateEnum.MARKED:
            // DO nothing.
            break;
        default:
            throw new Error("Internal error: should not get here.");
        }
    },
    mark: function(row, col) {
        if (this.gameState === this.GameStateEnum.INIT) {
            this.gameState = this.GameStateEnum.PLAYING;
        }
        if (this.gameState !== this.GameStateEnum.PLAYING) {
            return;
        }
        switch (model.cellStates[row][col]) {
        case model.CellStateEnum.INTACT:
            model.cellStates[row][col] = model.CellStateEnum.MARKED;
            model.numMarked++;
            break;
        case model.CellStateEnum.MARKED:
            model.cellStates[row][col] = model.CellStateEnum.QUESTION;
            model.numMarked--;
            break;
        case model.CellStateEnum.QUESTION:
            model.cellStates[row][col] = model.CellStateEnum.INTACT;
            break;
        case model.CellStateEnum.EXPOSED:
            // DO nothing.
            break;
        default:
            throw new Error("Internal error: should not get here.");
        }
        view.updateCell(row, col);
        view.updateDigits("counter", model.numMines - model.numMarked);
    },
    win: function() {
        this.gameState = this.GameStateEnum.WIN;
        view.updateFace("win");
    },
    lose: function() {
        this.gameState = this.GameStateEnum.LOSE;
        view.updateFace("dead");
    }
};

$(document).ready(function() {
    document.oncontextmenu = function() { return false; };
    document.ondragstart = function() { return false; };
    controller.startGame();
});

// Local Variables:
// js-indent-level: 4
// indent-tabs-mode: nil
// End:
