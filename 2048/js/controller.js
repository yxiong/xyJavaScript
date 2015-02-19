/**
  * Author: Ying Xiong.
  * Created: Feb 08, 2015.
  */

function Controller(model, view) {
  this.model = model;
  this.view = view;
  this.gameWon = false;
}

Controller.prototype.startGame = function() {
  this.model.init();
};

Controller.prototype.move = function(direction) {
  this.model.move(direction);
  if (!this.gameWon && this.model.grid.maxTileValue() === 2048) {
    this.gameWon = true;
    this.view.gameWon();
  } else if (!this.model.grid.canMove()) {
    this.view.gameOver();
  }
};

Controller.prototype.restart = function() {
  this.gameWon = false;
  this.model.init();
};

Controller.prototype.keepPlaying = function() {
  if (!this.model.grid.canMove()) {
    this.view.gameOver();
  }
};
