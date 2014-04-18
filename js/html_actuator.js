function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer = document.querySelector(".score-container");
  this.bestContainer = document.querySelector(".best-container");
  this.highestContainer = document.querySelector(".highest-container");
  this.highestAtMoveContainer = document.querySelector(".highestatmove-container");
  this.movesContainer = document.querySelector(".moves-container");
  this.messageContainer = document.querySelector(".game-message");
  this.titleContainer = document.querySelector(".title");
  this.boardStringContainer = document.querySelector(".board-array");
  this.medalContainer = document.querySelector(".medal-numbers");
  this.contextString = document.querySelector(".context-string");
  this.nextButton = document.querySelector(".next-button");

  this.medalLevel = 0;
  this.score = 0;
  this.highest = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata)
{
	var self = this;

	window.requestAnimationFrame(function ()
	{
		self.clearContainer(self.tileContainer);

		grid.cells.forEach(function (column)
		{
			column.forEach(function (cell)
			{
				if (cell)
				{
					self.addTile(cell);
				}
			});
		});
		self.medalLevel = metadata.medalLevel;

		//self.updateScore(metadata.score);
		//self.updateBestScore(metadata.bestScore);
		self.updateBestScore(metadata.bestMoves, metadata.perfect);
		self.updateHighest(metadata.highest, metadata.moves);
		self.updateSeed(metadata.seed);
		self.updateNextButton();

		if (metadata.terminated)
		{
			if (metadata.over)
			{
				self.message(false); // You lose
			} else if (metadata.won)
			{
				self.message(true); // You win!
			}
		}
	});
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile)
{
	var self = this;

	var wrapper = document.createElement("div");
	var inner = document.createElement("div");
	var position = tile.previousPosition || { x: tile.x, y: tile.y };
	var positionClass = this.positionClass(position);

	// We can't use classlist because it somehow glitches when replacing classes
	var classes = ["tile", "tile-" + tile.value, positionClass];

	if (tile.value > 2048) classes.push("tile-super");
	if (tile.value <= 0) classes.push("tile-wall");

	this.applyClasses(wrapper, classes);

	inner.classList.add("tile-inner");
	inner.textContent = tile.value;

	if (tile.previousPosition)
	{
		// Make sure that the tile gets rendered in the previous position first
		window.requestAnimationFrame(function ()
		{
			classes[2] = self.positionClass({ x: tile.x, y: tile.y });
			self.applyClasses(wrapper, classes); // Update the position
		});
	} else if (tile.mergedFrom)
	{
		classes.push("tile-merged");
		this.applyClasses(wrapper, classes);

		// Render the tiles that merged
		tile.mergedFrom.forEach(function (merged)
		{
			self.addTile(merged);
		});
	} else
	{
		classes.push("tile-new");
		this.applyClasses(wrapper, classes);
	}

	// Add the inner part of the tile to the wrapper
	wrapper.appendChild(inner);

	// Put the tile on the board
	this.tileContainer.appendChild(wrapper);

	// MCSDWVL - feel ugly putting this here... todo
	if (window.gm.isEditor)
	{
		wrapper.addEventListener("mousedown", function (event)
		{
			window.gm.editorClick({ pos: { x: tile.x, y: tile.y }, isRightClick: event.which == 3 });
		});
		wrapper.addEventListener("contextmenu", function (event)
		{
			event.preventDefault();
		});
	}
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateHighest = function (highest, moves)
{
	var difference = highest - this.highest;
	this.highest = highest;

	if (this.highestContainer)
	{
		this.clearContainer(this.highestContainer);
		this.highestContainer.textContent = this.highest;
		if (difference > 0)
		{
			var addition = document.createElement("div");
			addition.classList.add("highest-addition");
			addition.textContent = "+" + difference;

			this.highestContainer.appendChild(addition);
			this.highestAtMoveContainer.textContent = moves;
		}
	}
	this.movesContainer.textContent = moves;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore, perfect)
{
	this.bestContainer.classList.remove("perfect");
	this.bestContainer.textContent = bestScore > 0 ? bestScore : "--";
	if (bestScore == perfect)
		this.bestContainer.classList.add("perfect");
};

HTMLActuator.prototype.updateSeed = function (seed)
{
	this.titleContainer.textContent = "to11";
};

HTMLActuator.prototype.updateNextButton = function ()
{
	if (window.gm && window.gm.currentLevelHasBeenBeaten())
	{
		this.nextButton.setAttribute("class", "next-button");
	}
	else
	{
		this.nextButton.setAttribute("class", "next-button locked");
	}
};

HTMLActuator.prototype.showLoadingMessage = function (show)
{
	this.messageContainer.classList.add("game-loading");
	this.messageContainer.getElementsByTagName("p")[0].textContent = "Loading...";
	this.messageContainer.getElementsByClassName("won-medal")[0].classList.add("large-medal");
	this.messageContainer.getElementsByClassName("won-medal")[0].classList.add("supermedal");
};

HTMLActuator.prototype.message = function (won)
{
	var type = won ? "game-won" : "game-over";
	var message = won ? "You win!" : "Too Many Moves!";

	this.messageContainer.classList.add(type);
	this.messageContainer.getElementsByTagName("p")[0].innerHTML = message;
	var shareElements = this.messageContainer.getElementsByClassName("share")[0].style.display = won ? "block" : "none";

	var medalClass = won ? ["none", "bronze", "silver", "gold", "supermedal"][this.medalLevel] : "none";
	this.messageContainer.getElementsByClassName("won-medal")[0].classList.add("large-medal");
	this.messageContainer.getElementsByClassName("won-medal")[0].classList.add(medalClass);
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
  this.messageContainer.classList.remove("game-loading");

  this.messageContainer.getElementsByClassName("won-medal")[0].classList.remove("large-medal");
  this.messageContainer.getElementsByClassName("won-medal")[0].classList.remove("gold");
  this.messageContainer.getElementsByClassName("won-medal")[0].classList.remove("silver");
  this.messageContainer.getElementsByClassName("won-medal")[0].classList.remove("bronze");
  this.messageContainer.getElementsByClassName("won-medal")[0].classList.remove("supermedal");
};

HTMLActuator.prototype.setBoardString = function (gridString)
{
	this.boardStringContainer.innerHTML = "<a href=\"?custom=" + gridString + "\">Link to This Level</a> - ";
	this.boardStringContainer.innerHTML += "<a href=\"?seed=" + Math.floor(10000 * Math.random()) + "\">Play Random!</a> - ";
	this.boardStringContainer.innerHTML += "<a href=\"?editor=1&custom=XXXXXXXXXXXXXXXX\">Level Editor</a>";
};

HTMLActuator.prototype.setMedalNumbers = function (gold, silver, bronze, final)
{
	this.medalContainer.innerHTML = "";
	if(gold > 0)
		this.medalContainer.innerHTML += "<div class='small-medal gold " + (!final ? "counting" : "") + "'>" + gold + "</div>";
	if(silver > 0 && silver != gold)
		this.medalContainer.innerHTML += "<div class='small-medal silver " + (!final ? "counting" : "") + "'>" + silver + "</div>"; 
	if(bronze > 0 && bronze != gold)
		this.medalContainer.innerHTML += "<div class='small-medal bronze " + (!final ? "counting" : "") + "'>" + bronze + "</div>";
};

HTMLActuator.prototype.setContextString = function (contextstring)
{
	this.contextString.innerHTML = contextstring;
};
