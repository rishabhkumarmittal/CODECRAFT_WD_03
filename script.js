const setupScreen = document.getElementById('setupScreen');
const gameScreen = document.getElementById('gameScreen');
const vsHumanBtn = document.getElementById('vsHumanBtn');
const vsBotBtn = document.getElementById('vsBotBtn');
const player1NameInput = document.getElementById('player1Name');
const player2NameInput = document.getElementById('player2Name');
const player2NameContainer = document.getElementById('player2NameContainer');
const statusDisplay = document.getElementById('status');
const restartButton = document.getElementById('restartButton');
const newGameButton = document.getElementById('newGameButton');
const cells = document.querySelectorAll('[data-cell-index]');

let gameActive = true;
let currentPlayer = "X";
let gameState = Array(9).fill("");
let gameMode = 'human';
let playerNames = { X: "Player 1", O: "Player 2" };

const winningConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function switchScreen(from, to) {
  from.classList.add('hidden');
  to.classList.remove('hidden');
}

function startGame() {
  playerNames.X = player1NameInput.value || "Player 1";
  playerNames.O = gameMode === 'human' ? (player2NameInput.value || "Player 2") : "Bot";
  switchScreen(setupScreen, gameScreen);
  handleRestartGame();
}

function handleRestartGame() {
  gameActive = true;
  currentPlayer = "X";
  gameState.fill("");
  statusDisplay.textContent = `${playerNames[currentPlayer]}'s turn`;
  cells.forEach(cell => {
    cell.innerHTML = "";
    cell.classList.remove('x', 'o', 'winning-cell');
  });
  document.getElementById('gameBoard').style.pointerEvents = 'auto';
}

function handleCellClick(e) {
  const cell = e.target;
  const index = parseInt(cell.getAttribute('data-cell-index'));
  if (gameState[index] || !gameActive) return;

  handleCellPlayed(cell, index);
  handleResultValidation();
}

function handleCellPlayed(cell, index) {
  gameState[index] = currentPlayer;
  cell.innerHTML = `<span class="symbol">${currentPlayer}</span>`;
  cell.classList.add(currentPlayer.toLowerCase());
}

function handleResultValidation() {
  let winner = null;
  for (const combo of winningConditions) {
    const [a, b, c] = combo;
    if (gameState[a] && gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
      winner = currentPlayer;
      combo.forEach(i => cells[i].classList.add('winning-cell'));
      break;
    }
  }

  if (winner) {
    statusDisplay.textContent = `${playerNames[winner]} has won!`;
    gameActive = false;
  } else if (!gameState.includes("")) {
    statusDisplay.textContent = "Game ended in a draw!";
    gameActive = false;
  } else {
    handlePlayerChange();
  }
}

function handlePlayerChange() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusDisplay.textContent = `${playerNames[currentPlayer]}'s turn`;

  if (gameMode === 'bot' && currentPlayer === 'O' && gameActive) {
    document.getElementById('gameBoard').style.pointerEvents = 'none';
    setTimeout(botMove, 700);
  }
}

function botMove() {
  const bestMove = findBestMove(gameState);
  const cell = document.querySelector(`[data-cell-index='${bestMove}']`);
  if (cell) {
    handleCellPlayed(cell, bestMove);
    handleResultValidation();
  }
  document.getElementById('gameBoard').style.pointerEvents = 'auto';
}

function evaluate(board) {
  for (const [a, b, c] of winningConditions) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a] === 'O' ? 10 : -10;
    }
  }
  return 0;
}

function minimax(board, depth, isMax) {
  const score = evaluate(board);
  if (score !== 0) return score - depth * (score > 0 ? 1 : -1);
  if (!board.includes("")) return 0;

  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = 'O';
        best = Math.max(best, minimax(board, depth + 1, false));
        board[i] = "";
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = 'X';
        best = Math.min(best, minimax(board, depth + 1, true));
        board[i] = "";
      }
    }
    return best;
  }
}

function findBestMove(board) {
  let bestVal = -Infinity;
  let bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = 'O';
      const moveVal = minimax(board, 0, false);
      board[i] = "";
      if (moveVal > bestVal) {
        bestVal = moveVal;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

vsHumanBtn.addEventListener('click', () => {
  gameMode = 'human';
  player2NameContainer.style.display = 'block';
  startGame();
});

vsBotBtn.addEventListener('click', () => {
  gameMode = 'bot';
  player2NameContainer.style.display = 'none';
  startGame();
});

newGameButton.addEventListener('click', () => {
  switchScreen(gameScreen, setupScreen);
});

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartButton.addEventListener('click', handleRestartGame);
