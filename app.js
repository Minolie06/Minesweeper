const $board = $('#board');
const ROWS = 10;
const COLS = 10;

function createBoard(rows, cols) {
    $board.empty();
    for (let i = 0; i < rows; i++) {
        const $row = $('<div>')
        .addClass('row')
        for (let j = 0; j < cols; j++) {
            const $col = $('<div>')
            .addClass('col hidden')
            .attr('data-col', j)
            .attr('data-row', i);
            if (Math.random() < 0.1) {
                $col.addClass('mine');
            }
            $row.append($col);
        }
        $board.append($row);
    }
}

function restart() {
    createBoard(ROWS, COLS);
}

function gameOver(isWin) {
    let message = isWin ? 'YOU WON!' : 'YOU LOST!';
    let icon = isWin ? 'fa fa-flag' : 'fa fa-bomb';
    $('.col.mine').append(
        $('<i>').addClass(icon)
    );
    $('.col').not('mine').removeClass('hidden');
    setTimeout(function() {
        alert(message);
        restart();
    }, 500);
}

function reveal(originalI, originalJ) {
    const seen = {};

    function helper(i, j) {
        if (i >= ROWS || j>= COLS || i < 0 || j < 0) return;

        const key = `${i} ${j}`;
        if (seen[key]) return;

        const $cell = $(`.col.hidden[data-row=${i}][data-col=${j}]`);
        const mineCount = getMineCount(i,j); //todo: implement

        if (!$cell.hasClass('hidden') || $cell.hasClass('mine')) return;

        $cell.removeClass('hidden');

        //todo : set the mine count when creating the board?
        if (mineCount) {
            $cell.text(mineCount);
            return;
        }

        //call helper on adjacent cells
        for (let directionI = -1; directionI <= 1; directionI++) {
            for (let directionJ = -1; directionJ <= 1; directionJ++) {
                helper(i+directionI,j+directionJ);
            }
        }
    }
    helper(originalI, originalJ);
}

function getMineCount(i, j) {
    let count = 0;
    for (let directionI = -1; directionI <= 1; directionI++) {
        for (let directionJ = -1; directionJ <= 1; directionJ++) {
            const newI = i + directionI;
            const newJ = j + directionJ;
            if (newI > ROWS || newJ> COLS || newI < 0 || newJ < 0) continue;
            const $cell = $(`.col.hidden[data-row=${newI}][data-col=${newJ}]`);
            if ($cell.hasClass('mine')) count++;
        }
    }
    console.log(count);
    return count;

}


// EVENT LISTENERS
$board.on('click', '.col.hidden', function() {
    const $cell = $(this);
    const row = $cell.data('row');
    const col = $cell.data('col');
    if ($cell.hasClass('mine')) {
        gameOver(false);
    } else {
        reveal(row, col);
        const isGameOver = $('.col.hidden').length === $('.col.mine').length;
        if (isGameOver) gameOver(true);
    }
})

restart();