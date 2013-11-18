(function() {

    var columns = ['a','b','c','d','e','f','g','h'];
    var rows = [1,2,3,4,5,6,7,8];

    function setupChessNobles(board, color, row) {
        placePiece(board, color, 'rook', 'A' + row);
        placePiece(board, color, 'knight', 'B' + row);
        placePiece(board, color, 'bishop', 'C' + row);
        placePiece(board, color, 'king', 'D' + row);
        placePiece(board, color, 'queen', 'E' + row);
        placePiece(board, color, 'bishop', 'F' + row);
        placePiece(board, color, 'knight', 'G' + row);
        placePiece(board, color, 'rook', 'H' + row);
    }

    function fillRow(board, color, piece, row) {
        var rowCounter;
        for (rowCounter = 0; rowCounter < 8; rowCounter++) {
            placePiece(board, color, piece, columns[rowCounter].toLowerCase() + row)
        }
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

    function highlightCells(board, cells) {
        var cellIds = cells.map(function(cellId) {
                return '#' + cellId.toLowerCase();
            }).join(', ');
        board.find(cellIds).addClass('highlight');
    }

    function unHighlightAll(board) {
        board.find('td').removeClass('highlight');
    }

    function piecePathToDescription(path) {
        return path.split('/').pop().split('\.').shift().split('_');
    }

    function highlightMoves(event, board) {
        event.preventDefault();
        event.stopPropagation();
        var cell = $(event.target);
        var cellId = cell.attr('id');
        var pieceImage = cell.find('img');
        var pieceDescription, color, piece, cellsToHighlight;
        if (cell.prop('tagName') == 'IMG') {
            pieceImage = cell;
            cellId = cell.parent().attr('id');
        }
        if (pieceImage.length) {
            pieceDescription = piecePathToDescription(pieceImage.attr('src'));
            color = pieceDescription[0];
            piece = pieceDescription[1];
            cellsToHighlight = moves[piece](cellId, color);
            highlightCells(board, cellsToHighlight);
        } else {
            unHighlightAll(board);
        }
    }

    function enableDragDrop(board) {
        var chessImages = board.find('td img'),
            cells = board.find('td');
        chessImages.draggable();
        cells.droppable({
            activate: function(evt, ui) {
                // chessImages.droppable('disable');
            },
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
                // chessImages.droppable('enable');
            }
        });
    }

    function buildChessboard(id) {
        var boardContainer = $('#' + id);
        var board = $('<table>');
        var rows = 8;
        var cols = 8;

        for (var rowCounter = 0; rowCounter < rows; rowCounter++) {
            var row = $('<tr>');
            for (var colCounter = 0; colCounter < cols; colCounter++) {
                var className = 'even';
                var rowId = rowCounter + (8 - 2 * rowCounter);
                var colId = columns[colCounter].toLowerCase();
                var cellId = colId + rowId;
                if ((rowCounter + colCounter) % 2 == 1) {
                    className = 'odd';
                }
                var cell = $('<td id="' + cellId + '" class="' + className + '">');
                if (colCounter == 0) {
                    cell.prepend('<div class="row-label">' + rowId + '</div>');
                }
                if (rowCounter == 7) {
                    cell.append('<div class="col-label">' + colId + '</div>');
                }
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
        boardContainer.append(board);
        return board;
    }

    function placePiece(board, color, piece, position) {
        var targetCell = board.find('#' + position.toLowerCase());
        var imagePath = 'images/pieces/' + color + '_' + piece + '.png';
        targetCell.append('<img src="' + imagePath + '">');
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

    function calculatePawnMoves(cell, color) {
        var col = cell.substr(0,1).toLowerCase(),
            row = cell.substr(1,1),
            operation,
            output = [];
        operation = function(a, b) { return a + b; };
        if (color == 'black') {
            operation = function(a, b) { return a - b; };
        }
        output.push(col + (operation(parseInt(row), 1)));
        if ((color == 'white' && row == '2') || (color == 'black' && row == '7')) {
            output.push(col + (operation(parseInt(row), 2)));
        }
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

