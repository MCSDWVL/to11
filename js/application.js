function getURLParameter(name)
{
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null
};

window.onLevelSelect = function (level)
{
	// clear inner text of level select board
	var gridcells = document.getElementsByClassName("grid-cell");
	for (var i = 0; i < gridcells.length; ++i)
		while (gridcells[i].firstChild)
			gridcells[i].removeChild(gridcells[i].firstChild);

	// star the game!
	var size = 4;
	if (!window.gm)
		window.gm = new GameManager(size, KeyboardInputManager, HTMLActuator, LocalStorageManager, 0, level, null, false);
	else
	{
		window.gm.seed = null;
		window.gm.level = level;
		window.gm.customLevelString = null;
		window.gm.editor = null;
		window.gm.setup();
	}
};

window.showMainMenu = function ()
{
	var size = 4;

	// new empty board clears
	if (!window.gm)
		window.gm = new GameManager(size, KeyboardInputManager, HTMLActuator, LocalStorageManager, 0, null, "XXXXXXXXXXXXXXXX", null);
	else
	{
		window.gm.seed = null;
		window.gm.level = null;
		window.gm.customLevelString = "XXXXXXXXXXXXXXXX";
		window.gm.editor = null;
		window.gm.setup();
	}

	// clear any game won/lost message
	window.gm.actuator.continueGame();

	var gridcells = document.getElementsByClassName("grid-cell");
	for (var i = 0; i < gridcells.length; ++i)
	{
		(function ()
		{
			while (gridcells[i].firstChild)
				gridcells[i].removeChild(gridcells[i].firstChild);
			var wrapper = document.createElement("div");
			wrapper.setAttribute("class", "level-select");
			wrapper.innerText = "LVL " + (i + 1);

			var medalLevel = window.gm.medalLevel(i);
			if (medalLevel > 0)
			{
				var medalWrapper = document.createElement("div");
				var medalType = ["none", "bronze", "silver", "gold"][medalLevel];
				medalWrapper.setAttribute("class", "small-medal " + medalType);
				wrapper.appendChild(medalWrapper);
			}

			gridcells[i].appendChild(wrapper);

			// lock unless user has medaled on previous level?
			var prevMedalLevel = i == 0 ? 3 : window.gm.medalLevel(i - 1);
			if (prevMedalLevel == 0)
			{
				wrapper.setAttribute("class", "locked");
			}
			else
			{
				var z = i;
				wrapper.addEventListener("mousedown", function (event)
				{
					window.onLevelSelect(z);
				});
			}
		} ());
	}
}

// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function ()
{
	var noParams = true;
	var seed = parseInt(getURLParameter("seed"));
	if (isNaN(seed))
		seed = Math.floor(10000 * Math.random());
	else
		noParams = false;
	seed = Math.floor(seed);
	var level = parseInt(getURLParameter("level"));
	var custom = getURLParameter("custom");
	var editor = getURLParameter("editor");

	if (!(isNaN(level) && !custom && !editor))
		noParams = false;

	if (!noParams)
	{
		var size = 4;
		if (!window.gm)
			window.gm = new GameManager(size, KeyboardInputManager, HTMLActuator, LocalStorageManager, seed, level, custom, editor);
		else
		{
			window.gm.seed = seed;
			window.gm.level = level;
			window.gm.customLevelString = custom;
			window.gm.editor = editor;
			window.gm.setup();
		}
		if (editor)
		{
			var gridcells = document.getElementsByClassName("grid-cell");
			for (var i = 0; i < gridcells.length; ++i)
			{
				(function ()
				{
					var z = i;
					// backwards cuz cells go down then right
					var pos = { x: z % size, y: Math.floor(z / size) };
					gridcells[z].addEventListener("mousedown", function (event)
					{
						//KeyboardInputManager.emit("editorClick", { linearPosition: z, isRightClick: false });
						window.gm.editorClick({ pos: pos, isRightClick: event.which == 3 });
					});

					gridcells[z].addEventListener("contextmenu", function (event)
					{
						event.preventDefault();
					});
				} ());
			}
		}
	}
	else
	{
		window.showMainMenu();
	}
});
