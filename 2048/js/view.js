/**
  * Author: Ying Xiong.
  * Created: Feb 08, 2015.
  */

function View() {
  $(document).keydown(this.keydownListener.bind(this));
  // Add mobile touch event listeners.
  var self = this;
  $("#game").on("swipeleft",  function() { self.moveHandler("left");  });
  $("#game").on("swiperight", function() { self.moveHandler("right"); });
  $("#game").on("swipeup",    function() { self.moveHandler("up");    });
  $("#game").on("swipedown",  function() { self.moveHandler("down");  });
  // Register button click listeners.
  $("#restart-button").click(function() {
    self.restartHandler();
  });
  $("#retry-button").click(function() {
    $("#game-message").removeClass();
    self.restartHandler();
  });
  $("#keep-playing-button").click(function() {
    $("#game-message").removeClass();
    self.keepPlayingHandler();
  });
}

View.prototype.registerEventHandlers = function(handlers) {
  this.moveHandler = handlers.move;
  this.restartHandler = handlers.restart;
  this.keepPlayingHandler = handlers.keepPlaying;
};

// Listen to key down events and forward them to corresponding handlers.
View.prototype.keydownListener = function(event) {
  var keyDirectionMap = {
    37: "left",
    38: "up",
    39: "right",
    40: "down"
  };
  var direction = keyDirectionMap[event.which];
  if (direction) {
    event.preventDefault();
    this.moveHandler(direction);
  }
};

// Update the model in html view.
View.prototype.update = function(model) {
  var self = this;
  var grid = model.grid;
  var tiles = grid.tiles;
  window.requestAnimationFrame(function() {
    $("#tile-container").empty();
    for (var i = 0; i < grid.size; i++) {
      for (var j = 0; j < grid.size; j++) {
        if (tiles[i][j].value === 0) {
          continue;
        }
        var value = tiles[i][j].value;
        var previousPositions = tiles[i][j].previousPositions;
        if (previousPositions.length === 0) {
          self.addTile(i, j, value, "new");
        } else if (previousPositions.length === 1) {
          self.addTile(i, j, value, "move", previousPositions[0]);
        } else {
          assert(previousPositions.length === 2);
          self.addTile(i, j, value/2, "move", previousPositions[0]);
          self.addTile(i, j, value/2, "move", previousPositions[1]);
          self.addTile(i, j, value, "merged");
        }
      }
    }
  });
};

// Add a tile to "#tile-container" for display.
View.prototype.addTile = function(row, col, value, property, previousPosition) {
  var inner = $("<div>", {
    "class": "tile-inner",
    text: value
  });
  var wrapper = $("<div>");
  var classes = ["tile", "value-"+value, "position-"+row+"-"+col];
  if (property === "new") {
    classes.push("tile-new");
  } else if (property === "move") {
    classes[2] = "position-" + previousPosition.i + "-" + previousPosition.j;
    window.requestAnimationFrame(function() {
      classes[2] = "position-" + row + "-" + col;
      wrapper.attr("class", classes.join(" "));
    });
  } else {
    assert(property === "merged");
    classes.push("tile-merged");
  }
  wrapper.attr("class", classes.join(" "));
  inner.appendTo(wrapper.appendTo("#tile-container"));

};

// Display game-won messages.
View.prototype.gameWon = function() {
  $("#game-message").addClass("game-won");
  $("#game-message p").text("You win!");
};

// Display game-over messages.
View.prototype.gameOver = function() {
  $("#game-message").addClass("game-over");
  $("#game-message p").text("Game over!");
};
