/**
  * Author: Ying Xiong.
  * Created: Feb 08, 2015.
  */

function Controller(model) {
  this.model = model;
}

Controller.prototype.startGame = function() {
  this.model.init();
};

Controller.prototype.move = function(direction) {
  this.model.move(direction);
};

Controller.prototype.restart = function() {
  console.log("controller: restart function called.");
};
