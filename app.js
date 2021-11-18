const $board = $('#board');
const COLORS = ['rgba(0,0,0,0)', 'blue', 'green', 'red', 'darkblue', 'brown', 'darkcyan', 'black', 'gray']
const SETTINGS = {
    'READY': false,
    'ROWS': 0,
    'COLS': 0,
    'MINES': 0,
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
    SETTINGS.MINES = mines;
}

function initGame() {
    SETTINGS.READY = false;
    $('#results').text('');
    $board.empty();

    createBoard(SETTINGS.ROWS, SETTINGS.COLS);
    displayMineCount();

    $board.removeClass('locked');
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

function startGame($firstCell) {
    addMinesToBoard(SETTINGS.MINES, $firstCell);
    countAdjacentMines();
    SETTINGS.READY = true;
    $firstCell.click();
}

function addMinesToBoard(minesNumber, $firstCell = null) {
    for (let i = 0; i < minesNumber; i++) {
        let $emptyCells = $('.hidden').not('.mine').not($firstCell);
        let $cell = $($emptyCells[Math.round(Math.random()*$emptyCells.length)]);
        $cell.addClass('mine');
    }    
}

function countAdjacentMines() {
    const $emptyCells = $('.hidden').not('.mine');
    $emptyCells.each(function() {
        const $cell = $(this);
        const mineCount = getAdjacentCells($cell).reduce(function(partialCount, adjacentCell) {
            return partialCount + ((adjacentCell.hasClass('mine')) ? 1 : 0)
        }, 0)
        if (mineCount) $cell.text(mineCount).css('color', `var(--color${mineCount})`);
    });
}

function getAdjacentCells($cell) {
    const originalI = $cell.data('row');
    const originalJ = $cell.data('col'); 
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
    const mineCount = parseInt($cell.text());
    if (!mineCount) return;

    const adjacentCells = getAdjacentCells($cell);
    const cellsToClick = adjacentCells.filter((adjacentCell) => {
        return !(adjacentCell.hasClass('flag'));
    });
    const flagCount = adjacentCells.length - cellsToClick.length;

    if (flagCount != mineCount) return;

    cellsToClick.forEach(cellToClick => {
        cellToClick.click();
    })
}

function gameOver(isWin) {
    $board.addClass('locked');
    let message = isWin ? 'YOU WON! :)' : 'BOOM! YOU LOST...';
    let icon = isWin ? 'fas fa-flag' : 'fas fa-bomb';
    $('.col.mine').empty().append(
        $('<i>').addClass(icon)
    );
    $('.col.mine').removeClass('hidden');
    $('#results').text(message);
}

function displayMineCount() {
    $('#displayMineCount').text(
        SETTINGS.MINES - $('.col.hidden.flag').length
    );
}

function checkCell($cell) {
    if (!SETTINGS.READY) return;
    if ($cell.hasClass('flag')) return;
    if ($cell.hasClass('mine')) {
        $cell.addClass('active');
        gameOver(false);
    } else {
        revealCell($cell);
        const isGameOver = $('.col.hidden').length === $('.col.mine').length;
        if (isGameOver) gameOver(true);
    }
}

function setFlag($cell) {
    $cell.toggleClass('flag');
    $cell.filter('.flag').append(
        $('<i>').addClass('fas fa-flag')
        .css('color', 'var(--bg-color')
        .css('font-size', '20px')
        .css('line-height', '30px')
    );
    $cell.not('.flag').children().remove();
    displayMineCount();
}

// EVENT LISTENERS: GAME
$board.on('click', '.col.hidden', function() {
    if (SETTINGS.READY) {
        checkCell($(this));
    } else {
        startGame($(this));
    }
})

$board.on('contextmenu', function() {
    return false;
})

$board.on('contextmenu', '.col.hidden', function() {
    setFlag($(this));
})

$board.on('dblclick', '.col', function() {
    revealAdjacentCells($(this));
})


//EVENT LISTENERS: CONTROL BUTTONS
$(".difficulty button").on('click', function() {
    let difficulty = $(this).text().toUpperCase();
    chooseDifficulty(eval(difficulty));
    initGame();
    display("game");
})

$("#restart").on('click', function() {
    initGame();
    display("game");
});

$("#choose-difficulty").on('click', function() {
    display("difficulty");
});

$('#theme').on('change', function() {
	$('body').toggleClass('dark');
	localStorage.setItem('darkModeStatus', $('#theme').prop('checked'));
});

$(document).ready(function(){
	if(localStorage.getItem('darkModeStatus') == "true") {
		$('body').addClass('dark');
		$('#theme').prop('checked', 'checked');
	}
    display("difficulty");
});

