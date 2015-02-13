/**
  * Author: Ying Xiong.
  * Created: Feb 08, 2015.
  */

function View() {
  this.tileContainer = document.querySelector("#tile-container");
  $(document).keydown(this.keydownListener.bind(this));
}

View.prototype.update = function(model) {
  var self = this;
  var grid = model.grid;
  var tiles = grid.tiles;
  window.requestAnimationFrame(function() {
    // TODO: use jquery.
    while (self.tileContainer.firstChild) {
      self.tileContainer.removeChild(self.tileContainer.firstChild);
    }
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

View.prototype.addTile = function(row, col, value, property, previousPosition) {
  // TODO: use jquery.
  var inner = document.createElement("div");
  inner.classList.add("tile-inner");
  inner.textContent = value;
  var wrapper = document.createElement("div");
  var classes = ["tile", "value-"+value, "position-"+row+"-"+col];
  if (property === "new") {
    classes.push("tile-new");
  } else if (property === "move") {
    classes[2] = "position-" + previousPosition.i + "-" + previousPosition.j;
    window.requestAnimationFrame(function() {
      classes[2] = "position-" + row + "-" + col;
      wrapper.setAttribute("class", classes.join(" "));
    });
  } else {
    assert(property === "merged");
    classes.push("tile-merged");
  }
  wrapper.setAttribute("class", classes.join(" "));
  wrapper.appendChild(inner);
  this.tileContainer.appendChild(wrapper);
};

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

View.prototype.registerEventHandlers = function(handlers) {
  this.moveHandler = handlers.move;
};
