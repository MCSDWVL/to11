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
		window.gm.setupInitBy = "Frontend";
		window.gm.setup();
	}
};

window.showMainMenu = function ()
{
	// track event back to menu
	window.analytics.returnToMenu();
	
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
	
	// clear medals
	window.gm.actuator.setMedalNumbers(0,0,0,true);

	var gridcells = document.getElementsByClassName("grid-cell");
	for (var i = 0; i < gridcells.length; ++i)
	{
		(function ()
		{
			while (gridcells[i].firstChild)
				gridcells[i].removeChild(gridcells[i].firstChild);
			var wrapper = document.createElement("div");
			wrapper.setAttribute("class", "level-select");

			if (i == 15)
			{
				var totalRandomGold = parseInt(window.gm.storageManager.getTotalRandomGold());
				var cnt = totalRandomGold > 0 ? totalRandomGold : "???";
				wrapper.innerHTML = "LVL &infin;";
				
				var medalWrapper = document.createElement("div");
				medalWrapper.setAttribute("class", "small-medal " + (totalRandomGold>0?"gold":"none"));
				wrapper.appendChild(medalWrapper);
				medalWrapper.innerHTML = cnt;
			}
			else
				wrapper.innerText = "LVL " + (i + 1);

			var medalLevel = window.gm.medalLevel(i);
			if (medalLevel > 0)
			{
				var medalWrapper = document.createElement("div");
				var medalType = ["none", "bronze", "silver", "gold", "gold"][medalLevel];
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

				wrapper.addEventListener((window.navigator.msPointerEnabled ? "MSPointerDown" : "touchstart"), function (event)
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
