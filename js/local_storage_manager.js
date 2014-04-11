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
	this.highestRandomKey = "highestRandom";
	this.totalRandomGoldKey = "totalRandomGold";
	this.presolvedRandomsLongStringKey = "preSolvedRandomLongString";

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

LocalStorageManager.prototype.getHighestRandomCompleted = function ()
{
	return this.storage.getItem(this.highestRandomKey) || 0;
};

LocalStorageManager.prototype.setHighestRandomCompleted = function (seed)
{
	var oldHighest = this.getHighestRandomCompleted();
	if(seed > oldHighest)
		this.setTotalRandomGold(parseInt(this.getTotalRandomGold())+1);
	this.storage.setItem(this.highestRandomKey, seed);
};

LocalStorageManager.prototype.getTotalRandomGold = function ()
{
	return this.storage.getItem(this.totalRandomGoldKey) || 0;
};

LocalStorageManager.prototype.setTotalRandomGold = function (num)
{
	this.storage.setItem(this.totalRandomGoldKey, num);
};

LocalStorageManager.prototype.getPresolvedRandomsLongString = function ()
{
	return this.storage.getItem(this.presolvedRandomsLongStringKey) || "0,3X504X036770X007,.1,555X6606705X6000,DLULDRURDLURULLUL.2,000X47057056X645,LDRDLDRURDLDLURDRURDDD.3,4X00500855450056,.4,30044500854X6306,.5,X676063X64035060,.6,0606055040457556,.7,5655505506557000,.8,4466540304038400,.9,5303606400576555,.10,4530046606574360,ULDRDLDLDRURDD.11,4240526760503407,.12,0005363252743647,.13,5534666635560005,LDLDLURULLD.14,3404566556354700,LLURDLDURULLD.15,4755544405573304,DRDLDLLULULDD.16,3430605345567536,RURLDRDLRURD.17,4704733553336453,LLURDLDLDRD.18,5042354458444254,RDLDRULDRULRURD.19,5225354225303386,";
};

LocalStorageManager.prototype.setPresolvedRandomsLongString = function (longString)
{
	this.storage.setItem(this.presolvedRandomsLongStringKey, longString);
};
