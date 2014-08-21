function KeyboardInputManager() {
  this.events = {};

  if (window.navigator.msPointerEnabled) {
    //Internet Explorer 10 style
    this.eventTouchstart    = "MSPointerDown";
    this.eventTouchmove     = "MSPointerMove";
    this.eventTouchend      = "MSPointerUp";
  } else {
    this.eventTouchstart    = "touchstart";
    this.eventTouchmove     = "touchmove";
    this.eventTouchend      = "touchend";
  }

  this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

KeyboardInputManager.prototype.listen = function ()
{
	var self = this;

	var map = {
		38: 0, // Up
		39: 1, // Right
		40: 2, // Down
		37: 3, // Left
		75: 0, // Vim up
		76: 1, // Vim right
		74: 2, // Vim down
		72: 3, // Vim left
		87: 0, // W
		68: 1, // D
		83: 2, // S
		65: 3  // A
	};

	// Respond to direction keys
	document.addEventListener("keydown", function (event)
	{
		var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                    event.shiftKey;
		var mapped = map[event.which];

		if (!modifiers)
		{
			if (mapped !== undefined)
			{
				event.preventDefault();
				self.emit("move", mapped);
			}
		}

		// "R" key does robot shit
		if (!modifiers && event.which === 82)
			var solver = new Solver(window.gm.grid, 50, function (solver) { console.log(solver.movesTakenToHumanReadableString(solver.bestSolution.movesTaken, 4)); }, null, null, null, 50000);

		// "U" unlocks all levels
		if (!modifiers && event.which == 85)
		{
			window.gm.unlockAll();
		}

		// "DEL" clears local storage
		if (!modifiers && event.which == 46)
		{
			var confirmed = window.confirm("Clear local storage?");
			if (confirmed)
				window.gm.storageManager.storage.clear();
		}

		// "P" generates first X presolved numbers
		if (!modifiers && event.which == 80)
		{
			console.log("starting pre-solve");
			var bakedString = "";
			var startSeed = 0;
			var maxPreSolve = 100;
			var solveNext = function (solver)
			{
				var nextSeed = startSeed;
                var isChainSeed = false;

				if (solver)
				{
                    var lastSeedFailed = solver.bestSolution.movesTaken.length == 0;
                    if(lastSeedFailed)
                    {
                        isChainSeed = true;
                        nextSeed = solver.seedGeneratedWith;
                    }
                    nextSeed = parseInt(solver.seedGeneratedWith) + 1;
					bakedString += (solver.bestSolution ? solver.bestSolution.movesTaken.length : 0) + ",";
					//if (solver.bestSolution)
					//	console.log(solver.movesTakenToHumanReadableString(solver.bestSolution.movesTaken, 4));
					console.log("So far " + bakedString);
				}

				if (nextSeed < startSeed + maxPreSolve || isChainSeed)
				{
					// new grid to solve
					var grid = new Grid(window.gm.size);
                    window.gm.randomlyFillGrid(grid, nextSeed, isChainSeed ? 1 : 0);
					var solver = new Solver(grid, 25, solveNext, null, null, nextSeed);
				}
				else
					console.log("done");
			};

			solveNext();
		}
	});

	// Respond to button presses
	this.bindButtonPress(".retry-button", this.restart);
	this.bindButtonPress(".restart-button", this.restart);
	this.bindButtonPress(".next-button", this.keepPlaying);
	this.bindButtonPress(".menu-button", this.goToMenu);
	this.bindButtonPress(".keep-playing-button", this.keepPlaying);

	// Respond to swipe events
	var touchStartClientX, touchStartClientY;
	var gameContainer = document.getElementsByClassName("game-container")[0];

	gameContainer.addEventListener(this.eventTouchstart, function (event)
	{
		if ((!window.navigator.msPointerEnabled && event.touches.length > 1) ||
        event.targetTouches > 1)
		{
			return; // Ignore if touching with more than 1 finger
		}

		if (window.navigator.msPointerEnabled)
		{
			touchStartClientX = event.pageX;
			touchStartClientY = event.pageY;
		} else
		{
			touchStartClientX = event.touches[0].clientX;
			touchStartClientY = event.touches[0].clientY;
		}

		event.preventDefault();
	});

	gameContainer.addEventListener(this.eventTouchmove, function (event)
	{
		event.preventDefault();
	});

	gameContainer.addEventListener(this.eventTouchend, function (event)
	{
		if ((!window.navigator.msPointerEnabled && event.touches.length > 0) ||
        event.targetTouches > 0)
		{
			return; // Ignore if still touching with one or more fingers
		}

		var touchEndClientX, touchEndClientY;

		if (window.navigator.msPointerEnabled)
		{
			touchEndClientX = event.pageX;
			touchEndClientY = event.pageY;
		} else
		{
			touchEndClientX = event.changedTouches[0].clientX;
			touchEndClientY = event.changedTouches[0].clientY;
		}

		var dx = touchEndClientX - touchStartClientX;
		var absDx = Math.abs(dx);

		var dy = touchEndClientY - touchStartClientY;
		var absDy = Math.abs(dy);

		if (Math.max(absDx, absDy) > 10)
		{
			// (right : left) : (down : up)
			self.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
		}
	});
};

KeyboardInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};

KeyboardInputManager.prototype.keepPlaying = function (event) {
  event.preventDefault();
  this.emit("keepPlaying");
};

KeyboardInputManager.prototype.bindButtonPress = function (selector, fn) {
  var button = document.querySelector(selector);
  button.addEventListener("click", fn.bind(this));
  button.addEventListener(this.eventTouchend, fn.bind(this));
 };

 KeyboardInputManager.prototype.goToMenu = function (event)
 {
 	event.preventDefault();
 	this.emit("goToMenu");
 }
 
