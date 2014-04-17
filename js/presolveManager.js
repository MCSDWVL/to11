"use strict";

var gSolutionPartSeparator = ",";
var gSolutionSeparator = ".";

//-----------------------------------------------------------------------------
function PresolveManager(size, StorageManager, GameManager)
{
	this.infinityStorageRange = 100;
	this.storageManager = StorageManager;
	this.gameManager = GameManager;
	this.preSolvedLevelsQueue = [];
	this.size = size;
    this.chainDictionary = {};

	// load the known solutions from storage manager
	// parse the loaded string and add to global known solutions
	var bigString = this.storageManager.getPresolvedRandomsLongString();
	console.log("psm: big string " + bigString);
	this.convertAllPreSolvedStringToSolutionsAndAddToKnownSolutions(bigString);

	if (!this.preSolvedLevelsQueue || this.preSolvedLevelsQueue.length == 0)
		this.preSolve(0);
	else
		this.onUserHighestInfinityChanges();
};

//-----------------------------------------------------------------------------
// convert EVERY solution object we have to one big string
PresolveManager.prototype.convertAllPreSolvedSolutionsToString = function ()
{
	var preSolvedString = "";

	for (var i = 0; i < this.preSolvedLevelsQueue.length; ++i)
	{
		if (i != 0)
			preSolvedString += gSolutionSeparator;

		preSolvedString += this.convertPreSolvedSolutionToString(this.preSolvedLevelsQueue[i]);
	}

	return preSolvedString;
};

//-----------------------------------------------------------------------------
// convert string representing every solution object array (parse result from local store)
PresolveManager.prototype.convertAllPreSolvedStringToSolutionsAndAddToKnownSolutions = function (preSolvedSolutionsString)
{
	var solutionStringPieces = preSolvedSolutionsString.split(gSolutionSeparator);
	if (solutionStringPieces.length > 1)
	{
		for (var i = 0; i < solutionStringPieces.length; ++i)
		{
			var solution = this.convertPreSolvedStringToSolution(solutionStringPieces[i]);
			this.preSolvedLevelsQueue.push(solution);
			//console.log("psm: adding solution to known " + solution.seed + " " + solution.board + " " + solution.movesTaken.length);
			gKnownSolutions[solution.board] = { movesTaken: solution.movesTaken };
		}
	}
};

//-----------------------------------------------------------------------------
// convert single solution object to string
PresolveManager.prototype.convertPreSolvedSolutionToString = function (preSolvedSolution)
{
	var preSolvedString = "";
	preSolvedString += preSolvedSolution.seed;
	preSolvedString += gSolutionPartSeparator;
	preSolvedString += preSolvedSolution.board;
	preSolvedString += gSolutionPartSeparator;
	preSolvedString += this.movesTakenToHumanReadableString(preSolvedSolution.movesTaken, 0);

	return preSolvedString;
};

//-----------------------------------------------------------------------------
// convert single solution string to object
PresolveManager.prototype.convertPreSolvedStringToSolution = function (preSolvedSolutionString)
{
	var preSolvedSolution = {};
	var pieces = preSolvedSolutionString.split(gSolutionPartSeparator);
	preSolvedSolution.seed = parseInt(pieces[0]);
	preSolvedSolution.board = pieces[1];
	preSolvedSolution.movesTaken = this.humanReadableMovesTakenToArray(pieces[2]);
	return preSolvedSolution;
};

//-----------------------------------------------------------------------------
// convert movestaken to string
PresolveManager.prototype.movesTakenToHumanReadableString = function (movesTaken, divideCounter)
{
	if (isNaN(divideCounter))
		divideCounter = 4;
	var solveString = "";
	for (var i = 0; i < movesTaken.length; ++i)
	{
		if (divideCounter > 0 && i != 0 && i % divideCounter == 0)
			solveString += " ";
		solveString += ["U", "R", "D", "L"][movesTaken[i]];
	}
	return solveString;
}

//-----------------------------------------------------------------------------
// convert movestaken string to array of ints
PresolveManager.prototype.humanReadableMovesTakenToArray = function (movesTakenString)
{
	var movesArray = [];
	if (movesTakenString)
	{
		for (var i = 0; i < movesTakenString.length; ++i)
		{
			if (movesTakenString[i] == "U")
				movesArray.push(0);
			if (movesTakenString[i] == "R")
				movesArray.push(1);
			if (movesTakenString[i] == "D")
				movesArray.push(2);
			if (movesTakenString[i] == "L")
				movesArray.push(3);
		}
	}
	return movesArray;
}

//-----------------------------------------------------------------------------
// what do we do when we find a new solution!?
PresolveManager.prototype.onLevelSolved = function (solver)
{
	// we want a queue of solutions that starts with the users next infinity seed, and goes some range
	// so we have to:
	//		dequeue solutions we don't need anymore
	//		add new solutions that are applicable
	//		save the queue to local storage so we don't have to do this again
	var seed = solver.seedGeneratedWith;
	var userLowestInfinitySeed = parseInt(this.storageManager.getHighestRandomCompleted());
	var anythingChanged = false;
	var shouldSolveAnother = false;
    var shouldChainSolve = false;
    var chainStart = this.chainDictionary[seed];

	// dequeue any solutions that are below the users next infinity seed (don't need to keep them presolved anymore)
	while (this.preSolvedLevelsQueue && this.preSolvedLevelsQueue.length > 0 && this.preSolvedLevelsQueue[0].seed < userLowestInfinitySeed)
	{
		this.preSolvedLevelsQueue.shift();
		anythingChanged = true;
	}

	// enqueue the new solutions
    var shouldSaveNewSolution = true; // why would we ever presolve and not save?
    
    // if we already know the solution for this grid don't bother
	for (var i = 0; i < this.preSolvedLevelsQueue.length; ++i)
	{
		if (this.preSolvedLevelsQueue[i].board == solver.startingBoardString)
        {
            shouldSaveNewSolution = false;
            break;
        }
	}
    
    // save the new solution!
    if(shouldSaveNewSolution)
    {
        var newSolution = {};
        newSolution.seed = !isNaN(chainStart) ? chainStart : seed;
        newSolution.chainSeed = seed;
        newSolution.board = solver.startingBoardString;
        newSolution.movesTaken = solver.bestSolution ? solver.bestSolution.movesTaken : [];
        this.preSolvedLevelsQueue.push(newSolution);
        anythingChanged = true;
    }
    
    // should we solve the next sequential seed?
	if (seed < userLowestInfinitySeed + this.infinityStorageRange)
		shouldSolveAnother = true;
    
    // should we chain solve off this seed?
    if(solver.bestSolution.movesTaken.length == 0)
        shouldChainSolve = true;

	// update local store?
	if (anythingChanged)
	{
		var bigString = this.convertAllPreSolvedSolutionsToString();
		this.storageManager.setPresolvedRandomsLongString(bigString);
	}

    // should we pre-solve the chain?
    if(shouldChainSolve)
        this.preSolve(seed, 1);
        
	// should we pre-solve the next level?
	if (shouldSolveAnother)
		this.preSolve(seed + 1);
};

//-----------------------------------------------------------------------------
// pre solve a given seed by generating board and creating solver
PresolveManager.prototype.preSolve = function (seed, chain)
{
	//
	var userLowestInfinitySeed = parseInt(this.storageManager.getHighestRandomCompleted());
	
	// make the grid that corresponds to this seed
	var grid = new Grid(this.size);
	var chainedSeed = this.gameManager.randomlyFillGrid(grid, seed, chain ? 1 : 0);
    
    // track the chain reason we're solving this seed!
    var chainRoot = this.chainDictionary[seed];
    chainRoot = isNaN(chainRoot) ? seed : chainRoot;
    this.chainDictionary[chainedSeed] = chainRoot;
    
    // logging
    console.log("Presolving " + chainedSeed + "(" + chainRoot + ")" + " (going up to " + (userLowestInfinitySeed + this.infinityStorageRange) + ")...");
    
	// create the solver
	var solver = new Solver(grid, 25, this.onLevelSolved.bind(this), null, null, chainedSeed);
};

//-----------------------------------------------------------------------------
// on user highest solved changes
PresolveManager.prototype.onUserHighestInfinityChanges = function ()
{
	// pre-solve the next level we don't have pre-solved
	var biggestSolution = this.preSolvedLevelsQueue[this.preSolvedLevelsQueue.length - 1];

	var userLowestInfinitySeed = parseInt(this.storageManager.getHighestRandomCompleted());

	if (biggestSolution && biggestSolution.seed + 1 < userLowestInfinitySeed + this.infinityStorageRange)
		this.preSolve(biggestSolution.seed + 1);
};