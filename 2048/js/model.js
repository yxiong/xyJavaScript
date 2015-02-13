/**
  * Author: Ying Xiong.
  * Created: Feb 08, 2015.
  */

function Model() {
  this.grid = new Grid(4);
  this.updateListeners = [];
}

Model.prototype.init = function() {
  this.grid.clearTiles();
  this.grid.addRandomTile();
  this.grid.addRandomTile();
  this.notifyUpdateListeners();
};

// Move the grid in `direction`.
Model.prototype.move = function(direction) {
  this.grid.clearPreviousPositions();
  var size = this.grid.size;
  var moved = false;
  var row, col, recede;
  switch (direction) {
  case "up":
    recede = function(p) { return {i: p.i+1, j: p.j}; };
    for (col = 0; col < size; ++col) {
      moved |= this.moveRange({i: 0, j: col}, {i: size, j: col}, recede);
    }
    break;
  case "down":
    recede = function(p) { return {i: p.i-1, j: p.j}; };
    for (col = 0; col < size; ++col) {
      moved |= this.moveRange({i: size-1, j:col}, {i: -1, j: col}, recede);
    }
    break;
  case "left":
    recede = function(p) { return {i: p.i, j:p.j+1}; };
    for (row = 0; row < size; ++row) {
      moved |= this.moveRange({i: row, j: 0}, {i: row, j: size}, recede);
    }
    break;
  case "right":
    recede = function(p) { return {i: p.i, j:p.j-1}; };
    for (row = 0; row < size; ++row) {
      moved |= this.moveRange({i: row, j: size-1}, {i: row, j: -1}, recede);
    }
    break;
  default:
    throw new Error("Internal error: unknown direction '" + direction + "'.");
  }
  if (moved) {
    this.grid.addRandomTile();
    this.notifyUpdateListeners();
  }
};

// Move the tiles in range (`src`, `dst`]. The `recede` function will move a
// position one step from `dst` to `src`. Return `true` if any movement takes
// place.
Model.prototype.moveRange = function(dst, src, recede) {
  var moved = false;
  // Move the first non-empty tile in the range, starting from `dst`.
  var pos1 = this.grid.firstNonEmptyPosition(dst, src, recede);
  if (isSamePosition(pos1, src)) {
    return false;
  }
  this.grid.moveTile(pos1, dst);
  moved = !isSamePosition(pos1, dst);
  // Find if the second non-empty tile can be merged with first one.
  var pos2 = this.grid.firstNonEmptyPosition(recede(pos1), src, recede);
  if (!isSamePosition(pos2, src) &&
      this.grid.tileValue(pos2) === this.grid.tileValue(dst)) {
    this.grid.mergeTiles(pos2, dst);
    moved = true;
  }
  // Reduce the range and recursively move the next range.
  moved |= this.moveRange(recede(dst), src, recede);
  return moved;
};

// The registered `callback` will be invoked once the state inside this model
// changes.
Model.prototype.registerUpdateListener = function(callback) {
  this.updateListeners.push(callback);
};

// Notify registered update listeners.
Model.prototype.notifyUpdateListeners = function() {
  self = this;
  this.updateListeners.forEach(function (callback) {
    callback(self);
  });
};
