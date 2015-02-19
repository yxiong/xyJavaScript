/**
  * Author: Ying Xiong.
  * Created: Feb 13, 2015.
  */

function isSamePosition(pos1, pos2) {
  return (pos1.i == pos2.i) && (pos1.j == pos2.j);
}

function Tile(value, previousPositions) {
  this.value = value;
  // Note that a tile can have 0 (if the tile is new), 1 (if the tile is moved
  // from elsewhere) or 2 (if the tile is merged by other tiles) previous
  // positions.
  this.previousPositions = previousPositions;
}

Tile.prototype.empty = function() {
  return this.value === 0;
};

function Grid(size) {
  this.size = size;
  this.tiles = new Array(this.size);
  for (var i = 0; i < this.size; i++) {
    this.tiles[i] = new Array(this.size);
    for (var j = 0; j < this.size; j++) {
      this.tiles[i][j] = new Tile(0, []);
    }
  }
}

// Clear all tiles to be empty.
Grid.prototype.clearTiles = function() {
  for (var i = 0; i < this.size; i++) {
    for (var j = 0; j < this.size; j++) {
      this.tiles[i][j] = new Tile(0, []);
    }
  }
};

// Get tile value by position.
Grid.prototype.tileValue = function(position) {
  return this.tiles[position.i][position.j].value;
};

// Count number of empty tiles in the grid.
Grid.prototype.numEmptyTiles = function() {
  var num = 0;
  for (var i = 0; i < this.size; i++) {
    for (var j = 0; j < this.size; j++) {
      if (this.tiles[i][j].empty()) {
        num++;
      }
    }
  }
  return num;
};

// Clear previous positions for all tiles.
Grid.prototype.clearPreviousPositions = function() {
  for (var i = 0; i < this.size; i++) {
    for (var j = 0; j < this.size; j++) {
      this.tiles[i][j].previousPositions = [];
    }
  }
};

// Add a random tile to grid, of value 2 (90% of time) or 4 (10% of time).
Grid.prototype.addRandomTile = function() {
  var numEmpty = this.numEmptyTiles();
  assert(numEmpty > 0);
  var idx = randomInteger(0, numEmpty);
  for (var i = 0; i < this.size; i++) {
    for (var j = 0; j < this.size; j++) {
      if (this.tiles[i][j].empty() && (idx-- === 0)) {
        var value = Math.random() < 0.9 ? 2 : 4;
        this.tiles[i][j] = new Tile(value, []);
        return;
      }
    }
  }
};

// Find the first non-empty position in range [`begin`, `end`). Return `end` if
// no such position exists.
Grid.prototype.firstNonEmptyPosition = function(begin, end, advance) {
  var pos = begin;
  while (!isSamePosition(pos, end) && this.tiles[pos.i][pos.j].empty()) {
    pos = advance(pos);
  }
  return pos;
};

// Move the tile from `src` to `dst`, and set `src` to empty if it is not the
// same as `dst`.
Grid.prototype.moveTile = function(src, dst) {
  this.tiles[dst.i][dst.j] = this.tiles[src.i][src.j];
  this.tiles[dst.i][dst.j].previousPositions = [src];
  if (!isSamePosition(src,dst)) {
    this.tiles[src.i][src.j] = new Tile(0, []);
  }
};

// Merge the tiles `src` into `dst`. When this happens, `src` and `dst` must be
// different positions and have the same value, and `dst` must already have a
// `previousPosition` (which can be itself). The `src` will be set to empty
// after this call.
Grid.prototype.mergeTiles = function(src, dst) {
  assert(!isSamePosition(src, dst));
  assert(this.tileValue[src] === this.tileValue[dst]);
  assert(this.tiles[dst.i][dst.j].previousPositions.length === 1);
  this.tiles[dst.i][dst.j].value *= 2;
  this.tiles[dst.i][dst.j].previousPositions.push(src);
  this.tiles[src.i][src.j] = new Tile(0, []);
};

// Return the maximum tile values in the grid.
Grid.prototype.maxTileValue = function() {
  var value = 0;
  for (var i = 0; i < this.size; i++) {
    for (var j = 0; j < this.size; j++) {
      value = Math.max(this.tiles[i][j].value);
    }
  }
  return value;
};

// Check whether one can still move the grid.
Grid.prototype.canMove = function() {
  if (this.numEmptyTiles() > 0) {
    return true;
  }
  // If the grid is full, check whether there are adjacent cells that can be
  // mreged.
  var i,j;
  for (i = 0; i < this.size; i++) {
    for (j = 0; j < this.size-1; j++) {
      if (this.tiles[i][j].value === this.tiles[i][j+1].value) {
        return true;
      }
    }
  }
  for (j = 0; j < this.size; j++) {
    for (i = 0; i < this.size-1; i++) {
      if (this.tiles[i][j].value === this.tiles[i+1][j].value) {
        return true;
      }
    }
  }
  // Now we know we cannot move anymore.
  return false;
};
