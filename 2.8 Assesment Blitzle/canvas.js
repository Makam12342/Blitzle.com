const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 600,
    backgroundColor: '#f5c3a2',
    parent: "chessCanvas",
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    // Load the black king image from the assets directory
    this.load.image('blackKing', 'assets/Chess_kdt45.svg');
}

function create() {
    const rows = 8;
    const cols = 8;
    const squareSize = 75;

    // Render the chessboard
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const isDarkSquare = (row + col) % 2 === 1;
            if (isDarkSquare) {
                this.add.rectangle(
                    col * squareSize + squareSize / 2,
                    row * squareSize + squareSize / 2,
                    squareSize,
                    squareSize,
                    0x6b4a34
                );
            }
        }
    }

    // Define the bitboard position for each piece type

    let whitePawns = 0x000000000000FF00n;
    let whiteKnights = 0x0000000000000042n;
    let whiteBishops = 0x0000000000000024n;
    let whiteRooks   = 0x0000000000000081n;
    let whiteQueen = 0x0000000000000008n;
    let whiteKing = 0x0000000000000010n;


    let blackPawns = 0x00FF000000000000n;
    let blackKnights = 0x4200000000000000n;
    let blackBishops = 0x2400000000000000n;
    let blackQueen = 0x0800000000000000n;
    let blackRooks = 0x8100000000000000n;
    let blackKing = 0x1000000000000000n;

    // Convert bitboard to array of occupied squares
    function hexToSquares(bitboard) {
        const pieceIndexes = [];
        for (let i = 0n; i < 64n; i++) {
            if ((bitboard >> i) & 1n) {
                pieceIndexes.push(Number(i));
            }
        }
        return pieceIndexes;
    }

    // Convert linear indices to row and column
    function numberToRowAndCol(indices) {
        return indices.map(index => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            return [row, col];
        });
    }

    // Get piece positions
    const pieceIndices = hexToSquares(whiteKing);
    const pieces = numberToRowAndCol(pieceIndices);

    // Place pieces on the board
    pieces.forEach(([row, col]) => {
        this.add.sprite(col * squareSize + squareSize / 2, (7 - row) * squareSize + squareSize / 2,'blackKing');
    });
}

function update() {
    // Game update logic (if any)
}
