const $board = $('#board');
const ROWS = 8;
const COLS = 8;
const MINES = 10;
const COLORS = ['rgba(0,0,0,0)', 'blue', 'green', 'red', 'darkblue', 'brown', 'darkcyan', 'black', 'gray']

function startNewGame() {
    $board.empty();
    createBoard(ROWS, COLS);
    addMinesToBoard(MINES);
    countAdjacentMines();
    displayMineCount();
}

function createBoard(rows, cols) {
    for (let i = 0; i < rows; i++) {
        const $row = $('<div>')
        .addClass('row')
        for (let j = 0; j < cols; j++) {
            const $col = $('<div>')
            .addClass('col hidden')
            .attr('data-col', j)
            .attr('data-row', i);
            $row.append($col);
        }
        $board.append($row);
    }
}

function addMinesToBoard(minesNumber) {
    for (let i = 0; i < minesNumber; i++) {
        let $emptyCells = $('.hidden').not('.mine');
        let $cell = $($emptyCells[Math.round(Math.random()*$emptyCells.length)]);
        $cell.addClass('mine');
    }    
}

function countAdjacentMines() {
    const $emptyCells = $('.hidden').not('.mine');
    $emptyCells.each(function() {
        const $cell = $(this);
        let mineCount = 0;
        getAdjacentCells($cell).forEach($adjacentCell => {
            if ($adjacentCell.hasClass('mine')) {
                mineCount++;
            }
        });
        if (mineCount) $cell.text(mineCount).css('color', COLORS[mineCount]);
    });
}

function getAdjacentCells(cell) {
    const originalI = cell.data('row');
    const originalJ = cell.data('col');
    let adjacentCells = [];

    for (let directionI = -1; directionI <= 1; directionI++) {
        const i = originalI + directionI;
        if (i >= ROWS || i < 0) continue;

        for (let directionJ = -1; directionJ <= 1; directionJ++) {
            const j = originalJ + directionJ;
            if (j>= COLS || j < 0) continue;
            if (directionI == 0 && directionJ == 0) continue;

            const $adjacentCell = $(`.col[data-row=${i}][data-col=${j}]`);
            adjacentCells.push($adjacentCell);
        }
    }
    return adjacentCells;
}

function revealCell($originalCell) {

    function helper($cell) {
        if (!$cell.hasClass('hidden') || $cell.hasClass('mine')) return;
        $cell.removeClass('hidden');
        
        if ($cell.text()) return;  
        
        getAdjacentCells($cell).forEach($adjacentCell => {
            setTimeout(() => {helper($adjacentCell)}, 10);
        });
    }

    helper($originalCell);
}

function gameOver(isWin) {
    let message = isWin ? 'YOU WON!' : 'BOOM!';
    let icon = isWin ? 'fa fa-flag' : 'fa fa-bomb';
    $('.col.mine').empty().append(
        $('<i>').addClass(icon)
    );
    $('.col.mine').removeClass('hidden');
    setTimeout(function() {
        alert(message);
        startNewGame();
    }, 250);
}

function displayMineCount() {
    $('#displayMineCount').text(
        MINES - $('.col.hidden.flag').length
    );
}


// EVENT LISTENERS
$board.on('click', '.col.hidden', function() {
    const $cell = $(this);
    if ($cell.hasClass('flag')) return;
    if ($cell.hasClass('mine')) {
        $cell.addClass('active');
        gameOver(false);
    } else {
        revealCell($cell);
        const isGameOver = $('.col.hidden').length === $('.col.mine').length;
        if (isGameOver) gameOver(true);
    }
})

$board.on('contextmenu', function() {
    return false;
})

$board.on('contextmenu', '.col.hidden', function() {
    const $cell = $(this);
    $cell.toggleClass('flag');
    $cell.filter('.flag').append(
        $('<i>').addClass('fa fa-flag')
        .css('color', 'black')
        .css('font-size', '20px')
        .css('line-height', '30px')
    );
    $cell.not('.flag').children().remove();
    displayMineCount();

    return false;
})

startNewGame();