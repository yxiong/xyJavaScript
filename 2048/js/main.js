/**
  * Author: Ying Xiong.
  * Created: Feb 08, 2015.
  */

$(document).ready(function() {
  var model = new Model();
  var view = new View();
  var controller = new Controller(model);

  model.registerUpdateListener(view.update.bind(view));
  view.registerEventHandlers({
    "move": controller.move.bind(controller)
  });

  controller.startGame();
});
