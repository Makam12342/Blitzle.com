// All of the game data
const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 600,
    backgroundColor: '#f5c3a2',
    parent: 'canvas',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Creates the game
const game = new Phaser.Game(config);


// Responsable for loading in any data for my code
function preload() {
    
    // Loads all of the pieces icons

    // White pieces
    this.load.image('whiteKing', 'chessPieces/Chess_klt45.svg');
    this.load.image('whiteQueen', 'chessPieces/Chess_qlt45.svg');
    this.load.image('whiteRook', 'chessPieces/Chess_rlt45.svg');
    this.load.image('whiteKnight', 'chessPieces/Chess_nlt45.svg');
    this.load.image('whiteBishop', 'chessPieces/Chess_blt45.svg');
    this.load.image('whitePawn', 'chessPieces/Chess_plt45.svg');

    // Black pieces
    this.load.image('blackKing', 'chessPieces/Chess_kdt45 (1).svg');
    this.load.image('blackQueen', 'chessPieces/Chess_qdt45.svg');
    this.load.image('blackRook', 'chessPieces/Chess_rdt45.svg');
    this.load.image('blackKnight', 'chessPieces/Chess_ndt45.svg');
    this.load.image('blackBishop', 'chessPieces/Chess_bdt45.svg');
    this.load.image('blackPawn', 'chessPieces/Chess_pdt45.svg');


};

function create() {

    //Constants

    const rows = 8;
    const cols = 8;
    const squareSize = 75;
    const scene = this;







    //Holds all of the diferent pieces with there corosponding bitboard
    const piecesPosition = {
        // All of the white pieces
        whitePieces: {
        whiteKing: 0x0000000000000010n,
        whiteQueen: 0x0000000000000008n,
        whiteRook: 0x0000000000000081n,
        whiteBishop: 0x0000000000000024n,
        whiteKnight: 0x0000000000000042n,
        whitePawn: 0x000000000000FF00n
        },
        // All of the black pieces
        blackPieces: {
        blackKing: 0x1000000000000000n,
        blackQueen: 0x0800000000000000n,
        blackRook: 0x8100000000000000n,
        blackBishop: 0x2400000000000000n,
        blackKnight: 0x4200000000000000n,
        blackPawn: 0x00FF000000000000n
        }

    }
    // A list of all the key names
    const whitePieceskeys = Object.keys(piecesPosition.whitePieces);
    const blackPieceskeys = Object.keys(piecesPosition.blackPieces);

    //Holds all of the names for each piece for image data
    const allPiecesNames = [
        'whiteKing', 'whiteQueen', 'whiteRook', 'whiteKnight', 'whiteBishop', 'whitePawn', 
        'blackKing', 'blackQueen', 'blackRook', 'blackKnight', 'blackBishop', 'blackPawn', 
    ]

    //Holds the data for the direction or position each piece would go to if it where to move
    const movedirections = {

        //All the pieces that dont slide
        stepPieces: {
        knightMovements: [15, 17, 6, 10, -10, -6, -17, -15],
        kingMovements: [8, -8, -1, 1, 7, 9, -9, -7],
        pawnMovementsWhite: [8, 16, 9, 7],
        pawnMovementsBlack: [-8, -16, -9, -7]
        },
        //All the pieces that have sliding movment
        sliderPieces: {
        queenMovements: [8, -8, -1, 1, 7, 9, -9, -7],
        rookMovements: [8, -8, 1, -1],
        bishopMovements: [9, -9, 7, -7],
        }
    }



    //Renders the chessboard
    for (let row = 0; row < rows; row++) { // loops through each piece
        for (let col = 0; col < cols; col++) {
            const isDarkSquare = (row + col) % 2 === 1; // checks weather or not its a dark square
            if (isDarkSquare) {
                this.add.rectangle( col * squareSize + squareSize / 2, row * squareSize + squareSize / 2, squareSize, squareSize, 0x6b4a34); // Change colour at the end
            }
        }
    }





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

    function bitboardToDisplay(bitboard, image){
        // takes a bitboard and a image as a input and ouputs the squares that the bitboard corosponds to on the chess board

        // Get piece positions
        const pieceIndices = hexToSquares(bitboard);
        const pieces = numberToRowAndCol(pieceIndices);

        //places pieces on board
        pieces.forEach(([row, col]) => {
            scene.add.sprite(col * squareSize + squareSize / 2, (7 - row) * squareSize + squareSize / 2, image).setDisplaySize(70, 70);
    });

    }
    
    
    // Adds all the pieces to the board
    
    for(let i = 0; i < 6 ; i++){
        let blackValue = piecesPosition.blackPieces[blackPieceskeys[i]]; //Takes the list of keys ["whitePawn"] and outputs the corosponding bitboard
        let whiteValue = piecesPosition.whitePieces[whitePieceskeys[i]];
        bitboardToDisplay(whiteValue, allPiecesNames[i])
        bitboardToDisplay(blackValue, allPiecesNames[i+6]) //Plus 6 is ofsets so it selects white pieces(whiteValue, allPiecesNames[i])

        
    }
}
function update() {
}
