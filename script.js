// Wait for the DOM to be fully loaded before executing code
document.addEventListener('DOMContentLoaded', () => {
    let board = null; // Initialize the chessboard
    const game = new Chess(); // Create new Chess.js game instance
    const moveHistory = document.getElementById('move-history'); // Get move history container
    let moveCount = 1; // Initialize the move count
    let userColor = 'w'; // Initialize the user's color as white
    let isPlayerTurn = true; // Track if it's the player's turn

    // Function to make a random move for the computer
    const makeRandomMove = () => {
        if (game.game_over()) {
            alert("Game over!");
            return;
        }

        const possibleMoves = game.moves();
        if (possibleMoves.length === 0) return;

        const randomIdx = Math.floor(Math.random() * possibleMoves.length);
        const move = possibleMoves[randomIdx];
        game.move(move);
        board.position(game.fen());
        recordMove(move, moveCount);
        moveCount++;
        isPlayerTurn = true; // Give turn back to the player
    };

    // Function to record and display a move in the move history
    const recordMove = (move, count) => {
        const formattedMove = count % 2 === 1 ? `${Math.ceil(count / 2)}. ${move}` : `${move} -`;
        moveHistory.textContent += formattedMove + ' ';
        moveHistory.scrollTop = moveHistory.scrollHeight;
    };

    // Function to handle the start of a drag position
    const onDragStart = (source, piece) => {
        if (game.game_over() || !isPlayerTurn) return false;
        return (userColor === 'w' && piece.startsWith('w')) || (userColor === 'b' && piece.startsWith('b'));
    };

    // Function to handle pawn promotion
    const getPromotionPiece = () => {
        const choices = ['q', 'r', 'b', 'n']; // Queen, Rook, Bishop, Knight
        let choice = prompt("Promote pawn to (q: Queen, r: Rook, b: Bishop, n: Knight):", "q");
        return choices.includes(choice) ? choice : 'q'; // Default to Queen if invalid choice
    };

    // Function to handle a piece drop on the board
    const onDrop = (source, target) => {
        if (!isPlayerTurn) return 'snapback';

        let moveParams = { from: source, to: target };

        // Check if the move is a pawn promotion
        const piece = game.get(source);
        if (piece && piece.type === 'p' && (target[1] === '8' || target[1] === '1')) {
            moveParams.promotion = getPromotionPiece(); // Ask user for promotion piece
        }

        const move = game.move(moveParams);
        if (move === null) return 'snapback';

        recordMove(move.san, moveCount);
        moveCount++;
        isPlayerTurn = false;

        setTimeout(makeRandomMove, 250);
    };

    // Function to handle the end of a piece snap animation
    const onSnapEnd = () => {
        board.position(game.fen());
    };

    // Configuration options for the chessboard
    const boardConfig = {
        showNotation: true,
        draggable: true,
        position: 'start',
        onDragStart,
        onDrop,
        onSnapEnd,
        moveSpeed: 'fast',
        snapBackSpeed: 500,
        snapSpeed: 100,
    };

    // Initialize the chessboard
    board = Chessboard('board', boardConfig);

    // Function to reset the game
    const resetGame = () => {
        game.reset();
        board.start();
        moveHistory.textContent = '';
        moveCount = 1;
        isPlayerTurn = true;
        userColor = 'w';
    };

    // Event listener for the "Play Again" button
    document.querySelector('.play-again').addEventListener('click', resetGame);

    // Event listener for the "Set Position" button
    document.querySelector('.set-pos').addEventListener('click', () => {
        const fen = prompt("Enter the FEN notation for the desired position!");
        if (fen !== null) {
            if (game.load(fen)) {
                board.position(fen);
                moveHistory.textContent = '';
                moveCount = 1;
                userColor = 'w';
                isPlayerTurn = true;
            } else {
                alert("Invalid FEN notation. Please try again.");
            }
        }
    });

    // Event listener for the "Flip Board" button
    document.querySelector('.flip-board').addEventListener('click', () => {
        if (moveCount === 1) { // Only allow flipping if no moves have been made
            board.flip();
            userColor = userColor === 'w' ? 'b' : 'w';
            isPlayerTurn = (userColor === 'w');

            if (userColor === 'b') {
                setTimeout(makeRandomMove, 250);
            }
        } else {
            alert("You can only flip the board before making any moves.");
        }
    });
});
