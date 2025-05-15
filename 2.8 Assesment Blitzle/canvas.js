const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 600,
    backgroundColor: '#f5c3a2',
    parent: "test",
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    // Load the pieces from the chess pieces directory

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
                this.add.rectangle( col * squareSize + squareSize / 2, row * squareSize + squareSize / 2, squareSize, squareSize, 0x6b4a34);
            }
        }
    }


    
    
    

    //valid Move indeseis for each piece type



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

    const allPiecesHexs = [
        whiteKing, whiteQueen, whiteRooks, whiteKnights, whiteBishops, whitePawns, 
        blackKing, blackQueen, blackRooks, blackKnights, blackBishops, blackPawns, 
    ]

    const blackPiecesHexs = [
        blackKing, blackQueen, blackRooks, blackKnights, blackBishops, blackPawns,
    ]

    const whitePiecesHexs = [
        whiteKing, whiteQueen, whiteRooks, whiteKnights, whiteBishops, whitePawns,
    ]

    let allPiecesImages = [
        'whiteKing', 'whiteQueen', 'whiteRook', 'whiteKnight', 'whiteBishop', 'whitePawn', 
        'blackKing', 'blackQueen', 'blackRook', 'blackKnight', 'blackBishop', 'blackPawn', 
    ]

    const knightMovements = [15, 17, 6, 10, -10, -6, -17, -15] 
    const kingMovements = [8, -8, -1, 1, 7, 9, -9, -7]
    const queenMovements = [8, -8, -1, 1, 7, 9, -9, -7]
    const rookMovements = [8, -8, 1, -1]
    const bishopMovements = [9, -9, 7, -7]
    const pawnMovementsWhite = [8, 16, 9, 7]
    const pawnMovementsBlack = [-8, -16, -9, -7]



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
    const scene = this;
    
    function validMoves(pieceLocation, moveList) {
    let validSudoMoves = []
    for(let i = 0; i< moveList.length; i++) {
        validSudoMoves.push(pieceLocation + moveList[i])
    }
    return(validSudoMoves)
    
}
    function bitboardToDisplay(bitboard, image, name){
        // takes a bitboard and a image as a input and ouputs the squares that the bitboard corosponds to on the chess board

        // Get piece positions
        const pieceIndices = hexToSquares(bitboard);
        const pieces = numberToRowAndCol(pieceIndices);

        //places pieces on board
        pieces.forEach(([row, col]) => {
        name = scene.add.sprite(col * squareSize + squareSize / 2, (7 - row) * squareSize + squareSize / 2, image).setDisplaySize(70, 70);
        name.setInteractive({ draggable: true, cursor: "pointer" });

    });

    }

    // Adds all the pieces to the board
    for(let i = 0; i< 12; i++) {
        bitboardToDisplay(allPiecesHexs[i], allPiecesImages[i], i)
    }

     //the user clicks 
    let moveIndicators = []
    this.input.on('pointerdown', function (pointer){
        let pieceType = null
        let avalablemoves = null
        let pointerSquare = (Math.floor(pointer.x / 75))*8 + (7-Math.floor(pointer.y / 75))
        // cheaks what list it is in if any 
        
        for(let i = 0; i < allPiecesHexs.length; i ++){
            if (( allPiecesHexs[i] >> BigInt(pointerSquare)) & 1n) {
                pieceType  = allPiecesImages[i];
                break;
            }
            }
            if (pieceType){
            if(pieceType.includes("King")){
                avalablemoves = validMoves(pointerSquare, kingMovements)
            } else if(pieceType.includes("Queen")){
                avalablemoves = validMoves(pointerSquare, kingMovements)
            } else if(pieceType.includes("Rook")){
                avalablemoves = validMoves(pointerSquare, kingMovements)
            } else if(pieceType.includes("Bishop")){
                avalablemoves = validMoves(pointerSquare, kingMovements)
            } else if(pieceType.includes("Knight")){
                avalablemoves = validMoves(pointerSquare, kingMovements)
            } else if(pieceType.includes("Pawn")){
                avalablemoves = validMoves(pointerSquare, kingMovements)
            }
            let squareIndex = 0
            // creates dropzones
            
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const x = col * squareSize + squareSize / 2;
                    const y = row * squareSize + squareSize / 2;

                    const dropzone = scene.add.zone(x,y, squareSize, squareSize)
                    if(avalablemoves.includes(squareIndex)) {
                    dropzone.setRectangleDropZone(squareSize, squareSize)
                    dropzone.setInteractive({dropZone: true});
                    let indicator = scene.add.circle(x, y , 10 ,0x000000, 0.8)
                    moveIndicators.push(indicator)
            }
        squareIndex ++
        }
        }
        }});


    

    this.input.on("drag", (pointer, gameobject, dragX, dragY) => {
    gameobject.setPosition(dragX, dragY);
    }   );

    //sets the pieces position to the center of the dropzone
    this.input.on('drop', (pointer, gameobject, dropzone) => {
        gameobject.setPosition(dropzone.x, dropzone.y)
    })

    this.input.on('pointerup', function (pointer){
        moveIndicators.forEach(circle => circle.destroy());
        moveIndicators = [];
    })
   
}   

function update() {
    // Game update logic (if any)

    

}
