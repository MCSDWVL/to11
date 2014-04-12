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
	this.randomGenerationVersionKey = "preSolvedRandomVersion";

	var supported = this.localStorageSupported();
	this.storage = supported ? window.localStorage : window.fakeStorage;

	// version clearing
	var currentversion = "1.0";
	var version = this.storage.getItem("Version") || 0;
	if (version != currentversion)
		this.storage.clear();
	this.storage.setItem("Version", currentversion);

	// random generation version clearing
	this.randomGenerationVersion = "2";
	this.defaultCachedPuzzleSolutionString = "0,0X704X050470X7X6,.1,006X06X5X70765X0,ULDLURURD.2,XX006056770065X0,.3,00X5X68X5X560005,DRULDLLD.4,0X6080XX560460X4,.5,X660X0X570X067X5,ULDRDUL.6,75X0X0060X067605,.7,6X0606X060606X7X,.8,0455068XX4X0506X,LDRULDLDL.9,00X7060650547540,.10,634X0855X050360X,.11,0X460564074047X5,LDRULULRD.12,0005350744063746,LDLURURDLURULDRDUL.13,674456000555X605,LDLURDLULD.14,3504460663754600,.15,4657453004503057,.16,3743005355407536,.17,4654734705333450,ULDRDLURDLDL.18,5008324555444254,RDDLDRDDLL.19,5225354225303386,.20,770560X005XX0X66,.21,X06XX06055X07067,.22,5550X700050X770X,ULDLUL.23,550XX07X0X850440,.24,55X5500077X0X0X7,RULLUL.25,7575XX7XX00005X5,.26,6506705X0060X7X0,.27,680550500X60XXX5,.28,6X50056XX505XX08,LULULDD.29,60665X04004XX800,.30,7X5X0X0X60570606,.31,X6X70050X6050X67,.32,506X006XX0075607,.33,066XX076X5600X56,LDRDDRURD.34,6556005066X5X070,.35,666506X00605606X,.36,40086651013X0602,ULDRDLDRDLDLDLL.37,0X07035500238253,DLDLDRDLLRD.38,034X804735034403,.39,7450005553605366,.40,3304467357350600,DLDLULDLRULD.41,0334440307354766,.42,2442022037127617,.43,6540556443665603,.44,4753532073442546,LDRULDLDDLDUL.45,X605X55X50806X0X,RDULULLD.46,64000540806XXX60,RDRDRURURDRDD.47,XX0076055766X00X,DDRULDRDL.48,X0675X6X7X06500X,LDRULURUL.49,070X06X60X666600,DRURD.50,06X047X507X0X407,.51,000XX50X70X66765,.52,40X0X547707060X0,.53,5605X060776X00XX,.54,XX40X78055405X00,ULDRDLULLD.55,X07485X4X55XX000,RDULL.56,0700X7045XX70406,.57,X0X400464X47X008,DLDLDLLL.58,605X00X77X565005,.59,30X000485475043X,.60,7055X30703450007,RURDRDL.61,400X420027638033,DLULURDRDLDLULL.62,4065447004700056,.63,5406644645706000,ULUDRULLD.64,0304666704504365,.65,0660555605505556,.66,0062320248526543,.67,4435544760543066,RDRDLDLULDLD.68,5547506034553654,ULLDRDRURDL.69,1726445665450513,.70,5667070X0X0065XX,.71,705X6X5X00606X07,.72,0X5660X00X057076,.73,0XX6303X07X48500,.74,X4600X74408004XX,.75,XX5600X77X704X04,.76,7X075700X050505X,.77,05670XX0X006675X,.78,X860XX4XX0704044,ULDRULUL.79,55007050X0X0X757,LURDRDLDLURDRD.80,0566X0X06X0X7750,.81,6X66X60060700XX6,.82,6600X40X8040X605,.83,60X055X50585X005,ULURDL.84,600065X80405X405,LLURDRDLD.85,760X505XX0505666,LRDRDLDLURURD.86,60054570040566X6,.87,6X50X35076040357,.88,7606070434530054,RULDRDLDRDRDRDL.89,5555460500076455,.90,5055750545406560,.91,4606556545005565,DULDRURUL.92,0442247242444077,DLURDLDDLLDL.93,5625024363427702,.94,5547505354655345,RDLLULURDLDLD.95,7533505644555455,LLURDRULDL.96,05770X00060X65X6,DRURDURD.97,5X6050X800X55X60,LDRDLDRURURD.98,056XX860XXX55050,LDLULDLDD.99,XX67505X70006006,";

	var randoVersion = this.storage.getItem(this.randomGenerationVersionKey) || 0;
	this.storage.setItem(this.randomGenerationVersionKey, this.randomGenerationVersion);
	if (randoVersion != this.randomGenerationVersion)
	{
		console.log("Random version changed!");
		this.setHighestRandomCompleted(0);
		this.setPresolvedRandomsLongString(this.defaultCachedPuzzleSolutionString);
	}
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
	return this.storage.getItem(this.presolvedRandomsLongStringKey) || this.defaultCachedPuzzleSolutionString;
};

LocalStorageManager.prototype.setPresolvedRandomsLongString = function (longString)
{
	this.storage.setItem(this.presolvedRandomsLongStringKey, longString);
};
