"use strict";

var gCounter = 0;
function Solver(grid, maxMoves)
{
	if(maxMoves == null || maxMoves == undefined || maxMoves <= 0 || isNaN(maxMoves))
		maxMoves = 100;

	this.grid = grid;
	this.maxMoves = maxMoves;
	this.bestMovesSoFar = maxMoves;
	this.solved = false;
	this.visitedDictionary = {};

	var solution = this.solveRecursive(grid, []);
	console.log("Solved in " + solution.moves.length + ": " + solution.solved);
	var solveString = "";
	for (var i = 0; i < solution.moves.length; ++i)
	{
		if (i != 0 && i % 4 == 0)
			solveString += " ";
		solveString += ["U", "R", "D", "L"][solution.moves[i]];
	}

	this.solved = solution.solved;
	this.solutionMoves = solution.moves;
	console.log(solveString);
};

Solver.prototype.solveRecursive = function (grid, movesTaken)
{
	var bestSolution = { solved: false, moves: [] };

	// over the limit, give up!
	if (movesTaken.length > this.maxMoves || movesTaken.length >= this.bestMovesSoFar)
		return { solved: false, moves: movesTaken.slice(0) };

	// check if this is a solution?
	if (this.singleTileLeft(grid))
		return { solved: true, moves: movesTaken.slice(0) };

	// check if this is game over?
	if (!this.movesAvailable(grid))
		return { solved: false, moves: movesTaken.slice(0) };

	// check if we've visited this board config faster already
	var boardString = this.getGridAsSimpleString(grid);
	if (this.visitedDictionary[boardString] && this.visitedDictionary[boardString] <= movesTaken.length)
	{
		return { solved: false, moves: movesTaken.slice(0) };
	}
	else
		this.visitedDictionary[boardString] = movesTaken.length;

	// try each direction recursively
	// HOW can I bias this towards doing moves that cause merges, to get ANY solution first?
	var allMoves = [];
	for (var dir = 0; dir < 4; ++dir)
	{
		// clone the grid?
		var clonedGrid = grid.createClone();

		// move the grid
		this.prepareTiles(clonedGrid);
		var moveResult = this.move(dir, clonedGrid);
		if (!moveResult.moved)
			continue;

		allMoves.push({ dir: dir, grid: clonedGrid, merged: moveResult.merged });
	}

	// sort all possible moves by how many merges it will cause
	allMoves.sort(function (a, b) { return b.merged - a.merged });

	// recurse on each move now that they're sorted
	for (var mi = 0; mi < allMoves.length; ++mi)
	{
		// add the moveee
		movesTaken.push(allMoves[mi].dir);

		// recurse
		var solution = this.solveRecursive(allMoves[mi].grid, movesTaken);

		// did recursing lead to a solution?
		if (solution.solved)
		{
			// is it a better solution?
			if (!bestSolution.solved || solution.moves.length < bestSolution.moves.length)
			{
				if (this.bestMovesSoFar == this.maxMoves)
					console.log("Got first solution! " + solution.moves.length);
				bestSolution.solved = true;
				bestSolution.moves = solution.moves.slice(0);
				if (bestSolution.moves.length < this.bestMovesSoFar)
					this.bestMovesSoFar = bestSolution.moves.length;
			}
		}

		// forget the moveee
		movesTaken.pop();
	}

	return bestSolution;
};

Solver.prototype.movesAvailable = function (grid)
{
	return grid.cellsAvailable() || this.tileMatchesAvailable(grid);
};

// Check for available matches between tiles (more expensive check)
Solver.prototype.tileMatchesAvailable = function (grid)
{
	var self = this;

	var tile;

	for (var x = 0; x < grid.size; x++)
	{
		for (var y = 0; y < grid.size; y++)
		{
			tile = grid.cellContent({ x: x, y: y });

			if (tile && tile.value >= 2)
			{
				for (var direction = 0; direction < 4; direction++)
				{
					var vector = self.getVector(direction);
					var cell = { x: x + vector.x, y: y + vector.y };

					var other = grid.cellContent(cell);

					if (other && other.value === tile.value)
					{
						return true; // These two tiles can be merged
					}
				}
			}
		}
	}

	return false;
};

Solver.prototype.singleTileLeft = function (grid)
{
	var tile;
	var count = 0;

	for (var x = 0; x < grid.size; x++)
	{
		for (var y = 0; y < grid.size; y++)
		{
			tile = grid.cellContent({ x: x, y: y });

			if (tile && tile.value >= 2)
			{
				count++;
				if (count >= 2)
					return false;
			}
		}
	}

	return true;
};

// Move a tile and its representation
Solver.prototype.moveTile = function (tile, cell, grid)
{
	if (tile.value == 0)
		return;
	grid.cells[tile.x][tile.y] = null;
	grid.cells[cell.x][cell.y] = tile;
	tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
Solver.prototype.move = function (direction, grid)
{
	var result = { moved: false, merged: 0 };
	var self = this;
	// if (this.isGameTerminated()) return; // Don't do anything if the game's over

	var cell, tile;

	var vector = this.getVector(direction);
	var traversals = this.buildTraversals(vector, grid);
	var moved = false;

	// Traverse the grid in the right direction and move tiles
	traversals.x.forEach(function (x)
	{
		traversals.y.forEach(function (y)
		{
			cell = { x: x, y: y };
			tile = grid.cellContent(cell);

			if (tile)
			{
				var positions = self.findFarthestPosition(cell, vector, grid);
				var next = grid.cellContent(positions.next);

				// Only one merger per row traversal?
				if (next && next.value === tile.value && tile.value != 0 && !next.mergedFrom)
				{
					var merged = new Tile(positions.next, tile.value * 2);
					merged.mergedFrom = [tile, next];

					grid.insertTile(merged);
					grid.removeTile(tile);

					// Converge the two tiles' positions
					tile.updatePosition(positions.next);

					// caused a merge!
					result.merged++;
				}
				else
				{
					self.moveTile(tile, positions.farthest, grid);
				}

				if (!self.positionsEqual(cell, tile))
				{
					result.moved = true;
				}
			}
		});
	});

	return result;
};

// Get the vector representing the chosen direction
Solver.prototype.getVector = function (direction)
{
	// Vectors representing tile movement
	var map = {
		0: { x: 0, y: -1 }, // Up
		1: { x: 1, y: 0 },  // Right
		2: { x: 0, y: 1 },  // Down
		3: { x: -1, y: 0}   // Left
	};

	return map[direction];
};

// Build a list of positions to traverse in the right order
Solver.prototype.buildTraversals = function (vector, grid)
{
	var traversals = { x: [], y: [] };

	for (var pos = 0; pos < grid.size; pos++)
	{
		traversals.x.push(pos);
		traversals.y.push(pos);
	}

	// Always traverse from the farthest cell in the chosen direction
	if (vector.x === 1) traversals.x = traversals.x.reverse();
	if (vector.y === 1) traversals.y = traversals.y.reverse();

	return traversals;
};

Solver.prototype.findFarthestPosition = function (cell, vector, grid)
{
	var previous;

	// Progress towards the vector direction until an obstacle is found
	do
	{
		previous = cell;
		cell = { x: previous.x + vector.x, y: previous.y + vector.y };
	} while (grid.withinBounds(cell) && grid.cellAvailable(cell));

	return {
		farthest: previous,
		next: cell // Used to check if a merge is required
	};
};

Solver.prototype.positionsEqual = function (first, second)
{
	return first.x === second.x && first.y === second.y;
};

Solver.prototype.prepareTiles = function (grid)
{
	grid.eachCell(function (x, y, tile)
	{
		if (tile)
		{
			tile.mergedFrom = null;
			tile.savePosition();
		}
	});
};

Solver.prototype.getGridAsSimpleString = function (grid)
{
	var plainoutput = "";
	for (var x = 0; x < grid.size; x++)
		for (var y = 0; y < grid.size; y++)
			plainoutput += grid.cells[x][y] ? (grid.cells[x][y].value == 0 ? 0 : Math.log(grid.cells[x][y].value) / Math.LN2) : "X";
	return plainoutput;
};
