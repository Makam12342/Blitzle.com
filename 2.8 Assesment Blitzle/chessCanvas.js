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


}

function create() {

    //Constants
    
    const rows = 8;
    const cols = 8;
    const squareSize = 75;
    const scene = this;

    let pieceType = null;
    let avalablemoves = null;
    let pointerDown = 'select'
    let moveIndicators = []
    let turn = "white"
    let pieceSquare = null;
    let pieceBitboard = null
    let pieceIcons= [];
    let allWhitePiecesBitboard = 0x0000000000000000
    let allBlackPiecesBitboard = 0x0000000000000000

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
            const object = scene.add.sprite(col * squareSize + squareSize / 2, (7 - row) * squareSize + squareSize / 2, image).setDisplaySize(70, 70);
            object.setInteractive({cursor: "pointer" });
            pieceIcons.push(object)
    });

    }
    
    
    // Adds all the pieces to the board
    function updateboard() {
    pieceIcons.forEach(sprite => sprite.destroy())
   

    allWhitePiecesBitboard = 0x0000000000000000
    allBlackPiecesBitboard = 0x0000000000000000
    for(let i = 0; i < 6; i ++){
    // creates a bitboard for the white and black pieces
    allWhitePiecesBitboard  = BigInt(allWhitePiecesBitboard)  | BigInt(piecesPosition.whitePieces[whitePieceskeys[i]])
    allBlackPiecesBitboard  = BigInt(allBlackPiecesBitboard)  | BigInt(piecesPosition.blackPieces[blackPieceskeys[i]])
    }
    // removes any captured pieces
    for(let i = 0; i < 6; i ++){
        if(turn === "black"){
        piecesPosition.blackPieces[blackPieceskeys[i]] = BigInt(piecesPosition.blackPieces[blackPieceskeys[i]]) & ~ BigInt(allWhitePiecesBitboard)
        }else{
        piecesPosition.whitePieces[whitePieceskeys[i]] = BigInt(piecesPosition.whitePieces[whitePieceskeys[i]]) & ~ BigInt(allBlackPiecesBitboard)
        }
    }
     for(let i = 0; i < 6 ; i++){
        let blackValue = piecesPosition.blackPieces[blackPieceskeys[i]]; //Takes the list of keys ["whitePawn"] and outputs the corosponding bitboard
        let whiteValue = piecesPosition.whitePieces[whitePieceskeys[i]];
        bitboardToDisplay(whiteValue, allPiecesNames[i])
        bitboardToDisplay(blackValue, allPiecesNames[i+6]) //Plus 6 is ofsets so it selects white pieces(whiteValue, allPiecesNames[i])
    }
    }
    updateboard()
    function validMoves(pieceLocation, moveList) {
        return moveList
            .map(offset => pieceLocation + offset)
            .filter(target => target >= 0 && target < 64);
            //.filter(target => target )
    }

    this.input.on('pointerdown', function (pointer){
        
            // Takes the square and figures out what piece is on the square
            const col = Math.floor(pointer.x / squareSize);
            const row = Math.floor(pointer.y / squareSize);
            const pointerSquare = (7 - row) * 8 + col;
            
            if(pointerDown === 'select'){
                pieceType = null;
                pieceSquare = pointerSquare
            // cheaks what square it is on eg 54, 32, or 12
            for(let i = 0; i < 6; i ++){
                    if(turn === "black"){
                    let blackValue = piecesPosition.blackPieces[blackPieceskeys[i]];
                    if(( blackValue >> BigInt(pointerSquare))& 1n) {
                        pieceType = allPiecesNames[i+6];
                        break
                    }}else if(turn === "white"){
                         //Takes the list of keys ["whitePawn"] and outputs the corosponding bitboard
                    let whiteValue = piecesPosition.whitePieces[whitePieceskeys[i]];
                    if(( whiteValue >> BigInt(pointerSquare))& 1n) {
                        pieceType = allPiecesNames[i]
                        break
                    }};
                    
                    }
                
            if (!pieceType) return;
                
            


        // returns the sudo valid moves a piece could have 
            if (pieceType){
                    if(pieceType.includes("King")){
                        avalablemoves = validMoves(pointerSquare, movedirections.stepPieces.kingMovements)
                    } else if(pieceType.includes("Queen")){
                        avalablemoves = validMoves(pointerSquare, movedirections.sliderPieces.queenMovements)
                    } else if(pieceType.includes("Rook")){
                        avalablemoves = validMoves(pointerSquare, movedirections.sliderPieces.rookMovements)
                    } else if(pieceType.includes("Bishop")){
                        avalablemoves = validMoves(pointerSquare, movedirections.sliderPieces.bishopMovements)
                    } else if(pieceType.includes("Knight")){
                        avalablemoves = validMoves(pointerSquare, movedirections.stepPieces.knightMovements)
                    } else if(pieceType.includes("whitePawn")){
                        avalablemoves = validMoves(pointerSquare, movedirections.stepPieces.pawnMovementsWhite)
                    } else if(pieceType.includes("blackPawn")){
                        avalablemoves = validMoves(pointerSquare, movedirections.stepPieces.pawnMovementsBlack)
                    }

            }
            let squareIndex = 0
            for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        const x = col * squareSize + squareSize / 2;
                        const y = (7-row) * squareSize + squareSize / 2;   
                        if(avalablemoves.includes(squareIndex)) {
                            if(turn === "white"){

                            if (((allWhitePiecesBitboard >> BigInt(squareIndex)) & 1n) === 0n){
                                let object = scene.add.circle(x, y , 10 ,0x000000, 0.8)
                                moveIndicators.push(object)
                            }

                            }else{
                                if (((allBlackPiecesBitboard >> BigInt(squareIndex)) & 1n) === 0n){
                                    let object = scene.add.circle(x, y , 10 ,0x000000, 0.8)
                                    moveIndicators.push(object)
                                }
                            }
                            
                        }
                        squareIndex++
                    }
                }
                pointerDown = 'place'    
        } else if(pointerDown === 'place'){
            
           

            // removes the circles
            moveIndicators.forEach(circle => circle.destroy());
            moveIndicators = [];
           //updates bitboard depending on move
            if(turn === "white"){
                pieceBitboard = piecesPosition.whitePieces[pieceType]; //Takes the list of keys ["whitePawn"] and outputs the corosponding bitboard
                pieceBitboard = (pieceBitboard & ~(1n << BigInt(pieceSquare))) | (1n << BigInt(pointerSquare));
                piecesPosition.whitePieces[pieceType] = pieceBitboard;
                turn = "black"
            }else if(turn === "black"){
                pieceBitboard = piecesPosition.blackPieces[pieceType];
                pieceBitboard = (pieceBitboard & ~(1n << BigInt(pieceSquare))) | (1n << BigInt(pointerSquare));
                piecesPosition.blackPieces[pieceType] = pieceBitboard;
                turn = "white"
            }
            // removes old piece and places new piece on selected square when board updates
        
            updateboard();
            pointerDown = 'select';
            
        };
    
    
    
    
    
    
    
    });



}
function update() {
}
