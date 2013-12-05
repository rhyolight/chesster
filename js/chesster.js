(function() {

    var columns = ['a','b','c','d','e','f','g','h'];
    var rows = [1,2,3,4,5,6,7,8];

    /*** MOVES ***/

    function calculateRookMoves(cell) {
        var col = cell.substr(0,1).toLowerCase(),
            row = cell.substr(1,1),
            output = [];
        columns.forEach(function(colId) {
            rows.forEach(function(rowId) {
                if (colId == col || rowId == row) {
                    output.push(colId + rowId);
                }
            });
        });
        if (output.indexOf(col + row)) {
            output.splice(output.indexOf(col + row), 1);
        }
        return output;
    }

    function calculateKnightMoves(cell) {
        var output = [];
        output.push(getRelativeCell(cell, 2,  1))
        output.push(getRelativeCell(cell, 2,  -1))
        output.push(getRelativeCell(cell, 1,  2))
        output.push(getRelativeCell(cell, -1, 2))
        output.push(getRelativeCell(cell, -2, 1))
        output.push(getRelativeCell(cell, -2, -1))
        output.push(getRelativeCell(cell, 1,  -2))
        output.push(getRelativeCell(cell, -1, -2))
        output = output.filter(function(item) {
            return item != undefined;
        });
        return output;
    }

    function calculateKingMoves(cell) {
        var col = cell.substr(0,1).toLowerCase(),
            row = cell.substr(1,1),
            output = [];
        var x, y;
        for (x = -1; x <= 1; x++) {
            for (y = -1; y <= 1; y++) {
                output.push(getRelativeCell(cell, x, y));
            }
        }
        
        // TODO: calculate castling

        output = output.filter(function(item) {
            return item != undefined;
        });
        if (output.indexOf(col + row)) {
            output.splice(output.indexOf(col + row), 1);
        }
        return output;
    }

    function calculateBishopMoves(cell) {
        var originCol = cell.substr(0,1).toLowerCase(),
            originRow = cell.substr(1,1),
            output = [];
        rows.forEach(function(row) {
            columns.forEach(function(col) {
                if (Math.abs(columns.indexOf(col) - columns.indexOf(originCol)) == Math.abs(row - originRow)) {
                    output.push(col + row);
                }
            });
        });
        return output;
    }

    function calculatePawnMoves(cell, color, board) {
        var col = cell.substr(0,1).toLowerCase(),
            row = cell.substr(1,1),
            operation, targetCell,
            output = [];
        operation = function(a, b) { return a + b; };
        if (color == 'black') {
            operation = function(a, b) { return a - b; };
        }
        // Head on moves first
        targetCell = col + (operation(parseInt(row), 1));
        if (! cellIsOccupied(targetCell, board)) {
            output.push(targetCell);
            if ((color == 'white' && row == '2') || (color == 'black' && row == '7')) {
                targetCell = col + (operation(parseInt(row), 2));
                if (! cellIsOccupied(targetCell, board)) {
                    output.push(targetCell);
                }
            }
        }
        // Diagonal attacks
        [-1, 1].forEach(function(modifier) {
            targetCell = columns[columns.indexOf(col) + modifier] + (operation(parseInt(row), 1));
            if (cellIsOccupiedBy(oppositeColor(color), targetCell, board)) {
                output.push(targetCell);
            }
        });
        return output;
    }

    function calculateQueenMoves(cell) {
        return calculateRookMoves(cell).concat(calculateBishopMoves(cell));
    }

    var moves = {
        'rook': calculateRookMoves,
        'knight': calculateKnightMoves,
        'bishop': calculateBishopMoves,
        'king': calculateKingMoves,
        'pawn': calculatePawnMoves,
        'queen': calculateQueenMoves
    };

    /*** SETUP ***/

    function placePiece(board, color, piece, position) {
        var targetCell = board.find('#' + position.toLowerCase());
        var imagePath = 'images/pieces/' + color + '_' + piece + '.png';
        targetCell.append('<img src="' + imagePath + '">');
    }

    function fillRow(board, color, piece, row) {
        var rowCounter;
        for (rowCounter = 0; rowCounter < 8; rowCounter++) {
            placePiece(board, color, piece, columns[rowCounter].toLowerCase() + row)
        }
    }

    function setupChessNobles(board, color, row) {
        placePiece(board, color, 'rook', 'A' + row);
        placePiece(board, color, 'knight', 'B' + row);
        placePiece(board, color, 'bishop', 'C' + row);
        placePiece(board, color, 'queen', 'D' + row);
        placePiece(board, color, 'king', 'E' + row);
        placePiece(board, color, 'bishop', 'F' + row);
        placePiece(board, color, 'knight', 'G' + row);
        placePiece(board, color, 'rook', 'H' + row);
    }

    function setupStandardBoard(board) {
        setupChessNobles(board, 'black', 8);
        fillRow(board, 'black', 'pawn', 7);
        setupChessNobles(board, 'white', 1);
        fillRow(board, 'white', 'pawn', 2)
    }

    function customSetup(board, setup) {
        setup.forEach(function(placement) {
            var color = placement[0],
                piece = placement[1],
                positions = placement[2];
            positions.forEach(function(cell) {
                placePiece(board, color, piece, cell);
            });
        });
    }

    function addClassToCells(className, board, cellIds) {
        var cellIds = cellIds.map(function(cellId) {
                return '#' + cellId.toLowerCase();
            }).join(', ');
        board.find(cellIds).addClass(className);
    }

    function highlightCells(board, cells) {
        addClassToCells('highlight', board, cells);
    }

    function highlightOrigin(board, cell) {
        addClassToCells('origin', board, [cell]);
    }

    function attackCells(board, cells) {
        addClassToCells('attacked', board, cells);
    }

    function unHighlightAll(board) {
        board.find('td.cell').removeClass('highlight attacked origin');
    }

    function piecePathToDescription(path) {
        return path.split('/').pop().split('\.').shift().split('_');
    }

    function oppositeColor(color) {
        if (color == 'white') return 'black';
        return 'white';
    }

    function cellIsOccupied(cellId, board) {
        var cell = board.find('#' + cellId);
        return cell.find('img').length > 0;
    }

    function cellIsOccupiedBy(color, cellId, board) {
        var cell = board.find('#' + cellId);
        return (cell.find('img').length 
            && cell.find('img').attr('src').indexOf(color) > 0);
    }

    function getOccupiedCells(board, cells) {
        var output = [];
        cells.forEach(function(cellId) {
            var cell = board.find('#' + cellId);
            if (cell.find('img').length) {
                output.push(cellId);
            }
        });
        return output;
    }

    function getCellsOccupiedBy(color, board, cells) {
        var occupied = getOccupiedCells(board, cells);
        return occupied.filter(function(cellId) {
            return cellIsOccupiedBy(color, cellId, board);
        });
    }

    function getClosesCellByVector(originCell, cells) {
        var origin = cellToCoords(originCell),
            cellCoords = cells.map(function(c) {
                var coord = cellToCoords(c);
                coord.cellId = c;
                return coord;
            }),
            output = {};
        cellCoords.forEach(function(targetCoord) {
            var vector = getVector(origin, targetCoord),
                distance = distanceBetween(origin, targetCoord),
                slopePayload = {
                    cellId: targetCoord.cellId,
                    distance: distance
                };
            if (! output[vector]) {
                output[vector] = slopePayload;
            } else {
                if (distance < output[vector].distance) {
                    output[vector] = slopePayload;
                }
            }
        });
        return output;
    }

    function stripObscuredCells(board, moves, cellId) {
        var freeCells = moves.slice(0),
            origin = cellToCoords(cellId),
            occupied = getOccupiedCells(board, moves),
            closestByVector = getClosesCellByVector(cellId, occupied);
        // Remove all cells that are farther away than the closest occupied cell
        // along the same vector
        moves.forEach(function(targetCell) {
            var occupiedCoords = cellToCoords(targetCell),
                vector = getVector(origin, occupiedCoords);
            if (closestByVector[vector] == undefined) return;
            if (distanceBetween(origin, occupiedCoords) > closestByVector[vector].distance) {
                freeCells.splice(freeCells.indexOf(targetCell), 1);
            }
        });
        return freeCells;
    }

    function cellToCoords(cell) {
        var x = columns.indexOf(cell.substr(0,1).toLowerCase()) + 1,
            y = parseInt(cell.substr(1,1));
        return {x: x, y: y};
    }

    function distanceBetween(a, b) {
        return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    }

    function getVector(a, b) {
        return Math.atan2((b.y - a.y), (b.x - a.x)) * 180 / Math.PI;
    }

    function highlightMoves(event, board) {
        event.preventDefault();
        event.stopPropagation();
        var cell = $(event.target);
        var cellId = cell.attr('id');
        var pieceImage = cell.find('img');
        var pieceDescription, color, piece, 
            possibleCellMovements, cellsToHighlight, attackedCells;
        if (cell.prop('tagName') == 'IMG') {
            pieceImage = cell;
            cellId = cell.parent().attr('id');
        }
        if (pieceImage.length) {
            pieceDescription = piecePathToDescription(pieceImage.attr('src'));
            color = pieceDescription[0];
            piece = pieceDescription[1];
            possibleCellMovements = moves[piece](cellId, color, board);
            // Remove origin cell
            if (possibleCellMovements.indexOf(cellId) > 0) {
                possibleCellMovements.splice(possibleCellMovements.indexOf(cellId), 1);
            }
            cellsToHighlight = stripObscuredCells(board, possibleCellMovements, cellId);
            getCellsOccupiedBy(color, board, cellsToHighlight).forEach(function(toStrip) {
                cellsToHighlight.splice(cellsToHighlight.indexOf(toStrip), 1);
            });
            highlightCells(board, cellsToHighlight);
            highlightOrigin(board, cellId);
            attackedCells = getCellsOccupiedBy(oppositeColor(color), board, cellsToHighlight);
            attackCells(board, attackedCells);
        } else {
            unHighlightAll(board);
        }
    }

    function enableDragDrop(board) {
        var chessImages = board.find('td.cell img'),
            cells = board.find('td.cell');
        chessImages.draggable();
        cells.droppable({
            drop: function(evt, ui) {
                pieceImage = $(ui.draggable);
                cell = $(this);
                previousCell = pieceImage.parent();
                if (cell.attr('id') != previousCell.attr('id')) {
                    unHighlightAll(board);
                    previousCell.empty();
                    cell.empty();
                    cell.append(pieceImage);
                    pieceImage.attr('style', 'position: relative')
                          .addClass('ui-draggable')
                          .mouseover(this.chessImageOver)
                          .mouseout(this.dehighlightAll)
                          .draggable();
                }
            }
        });
    }

    function buildChessboard(id) {
        var boardContainer = $('#' + id);
        var board = $('<table class="chesster">');
        var rows = 8;
        var cols = 8;

        for (var rowCounter = 0; rowCounter < rows; rowCounter++) {
            var rowId = rowCounter + (8 - 2 * rowCounter);
            var row = $('<tr>');
            var colCounter, className, colId, cellId;
            // first cell for rank markers
            row.append('<td class="marker">' + rowId + '</td>');
            for (colCounter = 0; colCounter < cols; colCounter++) {
                className = 'even';
                colId = columns[colCounter].toLowerCase();
                cellId = colId + rowId;
                if ((rowCounter + colCounter) % 2 == 1) {
                    className = 'odd';
                }
                var cell = $('<td id="' + cellId + '" class="cell ' + className + '">');
                // if (rowCounter == 7) {
                //     cell.append('<div class="col-label">' + colId + '</div>');
                // }
                cell.on('mouseover', function(event) {
                    highlightMoves(event, board);
                });
                cell.on('mouseout', function(event) {
                    unHighlightAll(board);
                });
                row.append(cell);
            }
            board.append(row);
        }
        // append one last row with file markers
        row = $('<tr>');
        // initial square is empty for left bottom corner
        row.append('<td>');
        for (colCounter = 0; colCounter < cols; colCounter++) {
            colId = columns[colCounter].toLowerCase();
            row.append('<td class="marker">' + colId + '</td>');
        }
        board.append(row);

        boardContainer.append(board);
        return board;
    }

    function getRelativeCell(cellId, plusCol, plusRow) {
        var col = cellId.substr(0,1).toLowerCase(),
            row = cellId.substr(1,1),
            targetCol, targetRow;
        targetCol = columns.indexOf(col) + plusCol;
        targetRow = (parseInt(row) + plusRow).toString();
        if (targetCol > 7 || targetCol < 0 
            || targetRow > 8 || targetRow < 1) {
            return undefined;
        }
        return columns[targetCol] + targetRow;
    }

    function Chesster(id, options) {
        var opts = $.extend({}, {
            }, options);
        var board = buildChessboard("chessboard");
        if (opts.setup) {
            customSetup(board, opts.setup);
        } else {
            setupStandardBoard(board);
        }
        enableDragDrop(board);
        this.board = board;
    }

    window.Chesster = Chesster;

}());

