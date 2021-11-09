const $board = $('#board');
const COLORS = ['rgba(0,0,0,0)', 'blue', 'green', 'red', 'darkblue', 'brown', 'darkcyan', 'black', 'gray']
const SETTINGS = {
    'ROWS': 16,
    'COLS': 16,
    'MINES': 40
}
const EASY = [8, 8, 10];
const MEDIUM = [16, 16, 40];
const HARD = [16, 32, 99];

function display(choice) {
    $(".display").hide();
    $(`.display.${choice}`).show()
}

function chooseDifficulty([rows, cols, mines]) {
    SETTINGS.ROWS = rows;
    SETTINGS.COLS = cols;
    SETTINGS.MINES = mines
}

function startNewGame() {
    $board.empty();
    createBoard(SETTINGS.ROWS, SETTINGS.COLS);
    addMinesToBoard(SETTINGS.MINES);
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
        if (i >= SETTINGS.ROWS || i < 0) continue;

        for (let directionJ = -1; directionJ <= 1; directionJ++) {
            const j = originalJ + directionJ;
            if (j>= SETTINGS.COLS || j < 0) continue;
            if (directionI == 0 && directionJ == 0) continue;

            const $adjacentCell = $(`.col[data-row=${i}][data-col=${j}]`);
            adjacentCells.push($adjacentCell);
        }
    }
    return adjacentCells;
}

function revealCell($originalCell) {

    function helper($cell) {
        if (!$cell.hasClass('hidden') || $cell.hasClass('mine') || $cell.hasClass('flag')) return;
        $cell.removeClass('hidden');
        
        if ($cell.text()) return;  
        
        getAdjacentCells($cell).forEach($adjacentCell => {
            setTimeout(() => {helper($adjacentCell)}, 10);
        });
    }

    helper($originalCell);
}

function revealAdjacentCells($cell) {
    if ($cell.hasClass('hidden')) return;
    let mineCount = parseInt($cell.text());
    if (!mineCount) return;

    let flagCount = 0;
    let adjacentCells = getAdjacentCells($cell);
    let cellsToClick = [];
    adjacentCells.forEach(adjacentCell => {
        if (adjacentCell.hasClass('flag')) {
            flagCount++;
            return
        }
        cellsToClick.push(adjacentCell);
    })
    if (flagCount != mineCount) return;

    cellsToClick.forEach(cellToClick => {
        cellToClick.click();
    })
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
        SETTINGS.MINES - $('.col.hidden.flag').length
    );
}


// EVENT LISTENERS: GAME
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

$board.on('dblclick', '.col', function() {
    revealAdjacentCells($(this));
    return false;
})

//EVENT LISTENERS: CONTROL BUTTONS
$(".difficulty button").on('click', function() {
    let difficulty = $(this).text().toUpperCase();
    chooseDifficulty(eval(difficulty));
    startNewGame();
    display("game");
})

$("#restart").on('click', function() {
    startNewGame();
    display("game");
})

$("#choose-difficulty").on('click', function() {
    display("difficulty");
})

display("difficulty");