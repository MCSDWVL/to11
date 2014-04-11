function Grid(size, previousState) 
{
  this.size = size;
  this.cells = previousState ? this.fromState(previousState) : this.empty();
}

// Build a grid of the specified size
Grid.prototype.empty = function () {
  var cells = [];

  for (var x = 0; x < this.size; x++) {
    var row = cells[x] = [];

    for (var y = 0; y < this.size; y++) {
      row.push(null);
    }
  }

  return cells;
 };

 Grid.prototype.createClone = function ()
 {
 	var newGrid = new Grid(this.size);
 	var cells = [];

 	for (var x = 0; x < this.size; x++)
 	{
 		var row = cells[x] = [];

 		for (var y = 0; y < this.size; y++)
 		{
 			var tile = this.cells[x][y];
 			row.push(tile ? new Tile({ x: tile.x, y: tile.y }, tile.value) : null);
 		}
 	}

 	newGrid.cells = cells;
 	return newGrid;
 }

Grid.prototype.fromState = function (state) {
  var cells = [];

  for (var x = 0; x < this.size; x++) {
    var row = cells[x] = [];

    for (var y = 0; y < this.size; y++) {
      var tile = state[x][y];
      row.push(tile ? new Tile(tile.position, tile.value) : null);
    }
  }

  return cells;
};

// Find the first available random position
Grid.prototype.randomAvailableCell = function (rand01) {
  var cells = this.availableCells();

  if (cells.length) {
  	return cells[Math.floor(rand01 * cells.length)];
  }
};

Grid.prototype.availableCells = function () {
  var cells = [];

  this.eachCell(function (x, y, tile) {
    if (!tile) {
      cells.push({ x: x, y: y });
    }
  });

  return cells;
};

// Call callback for every cell
Grid.prototype.eachCell = function (callback) {
  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      callback(x, y, this.cells[x][y]);
    }
  }
};

// Check if there are any cells available
Grid.prototype.cellsAvailable = function () {
  return !!this.availableCells().length;
 };

 Grid.prototype.cellsOccupied = function ()
 {
 	return this.size*this.size - this.cellsAvailable();
 };

// Check if the specified cell is taken
Grid.prototype.cellAvailable = function (cell) {
  return !this.cellOccupied(cell);
};

Grid.prototype.cellOccupied = function (cell) {
  return !!this.cellContent(cell);
};

Grid.prototype.cellContent = function (cell) {
  if (this.withinBounds(cell)) {
    return this.cells[cell.x][cell.y];
  } else {
    return null;
  }
};

// Inserts a tile at its position
Grid.prototype.insertTile = function (tile) {
  this.cells[tile.x][tile.y] = tile;
};

Grid.prototype.removeTile = function (tile) {
  this.cells[tile.x][tile.y] = null;
};

Grid.prototype.withinBounds = function (position) {
  return position.x >= 0 && position.x < this.size &&
         position.y >= 0 && position.y < this.size;
};

Grid.prototype.serialize = function () {
  var cellState = [];

  for (var x = 0; x < this.size; x++) {
    var row = cellState[x] = [];

    for (var y = 0; y < this.size; y++) {
      row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
    }
  }

  return {
    size: this.size,
    cells: cellState
  };
 };

Grid.prototype.asSimpleString = function ()
{
	var plainoutput = "";
	for (var x = 0; x < this.size; x++)
		for (var y = 0; y < this.size; y++)
			plainoutput += this.cells[x][y] ? (this.cells[x][y].value == 0 ? 0 : Math.log(this.cells[x][y].value) / Math.LN2) : "X";
	return plainoutput;
};
