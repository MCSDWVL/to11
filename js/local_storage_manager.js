window.fakeStorage = {
  _data: {},

  setItem: function (id, val) {
    return this._data[id] = String(val);
  },

  getItem: function (id) {
    return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
  },

  removeItem: function (id) {
    return delete this._data[id];
  },

  clear: function () {
    return this._data = {};
  }
};

function LocalStorageManager() 
{
	this.bestScoreKey = "bestScore";
	this.bestMovesKey = "bestMoves";
	this.gameStateKey     = "gameState";

	var supported = this.localStorageSupported();
	this.storage = supported ? window.localStorage : window.fakeStorage;

	var currentversion = "1.0";
	var version = this.storage.getItem("Version") || 0;
	if (version != currentversion)
		this.storage.clear();
	this.storage.setItem("Version", currentversion);
}

LocalStorageManager.prototype.localStorageSupported = function () 
{
	var testKey = "test";
	var storage = window.localStorage;
  
	try 
	{
		storage.setItem(testKey, "1");
		storage.removeItem(testKey);
		return true;
	} 
	catch (error) 
	{
		return false;
	}
};

// Best score getters/setters
LocalStorageManager.prototype.getBestScore = function (identifier) 
{
	return this.storage.getItem(this.bestScoreKey + (identifier ? identifier : "X")) || 0;
};

LocalStorageManager.prototype.setBestScore = function (identifier, score)
{
	this.storage.setItem(this.bestScoreKey + (identifier ? identifier : "X"), score);
};

LocalStorageManager.prototype.getBestMovesToComplete = function (identifier)
{
	return this.storage.getItem(this.bestMovesKey + (identifier ? identifier : "X")) || 0;
};

LocalStorageManager.prototype.setBestMovesToComplete = function (identifier, moves)
{
	this.storage.setItem(this.bestMovesKey + (identifier ? identifier : "X"), moves);
};



