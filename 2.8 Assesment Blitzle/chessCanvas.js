// All of the game data
const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 600,
    backgroundColor: '#d6d2cd',
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
    let validLocations = []
    let movmentType = null
    let moves = null
    

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
        'whiteKing', 'whiteQueen', 'whiteRook', 'whiteBishop', 'whiteKnight', 'whitePawn', 
        'blackKing', 'blackQueen', 'blackRook', 'blackBishop', 'blackKnight', 'blackPawn', 
    ]

    //Holds the data for the direction or position each piece would go to if it where to move
    const movedirections = {

        //All the pieces that dont slide
        stepPieces: {
        knightMovements: [],
        kingMovements: [8, -8, -1, 1, 7, 9, -9, -7],
        pawnMovementsWhite: [],
        pawnMovementsBlack: []
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
                this.add.rectangle( col * squareSize + squareSize / 2, row * squareSize + squareSize / 2, squareSize, squareSize, 0x6f6f6d); // Change colour at the end
                
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
    // intentifies the squares the a piece could move to from a give square

    function validMovesStepper(pieceLocation, moveList, isWhite) {
        const validMoves = [];

        const friendlyPieces = isWhite ? allWhitePiecesBitboard : allBlackPiecesBitboard;
        const enemyPieces = isWhite ? allBlackPiecesBitboard : allWhitePiecesBitboard;

        const fromCol = pieceLocation % 8;

        for (const dir of moveList) {
            const target = pieceLocation + dir;

            // Stay within board bounds
            if (target < 0 || target >= 64) continue;

            const toCol = target % 8;

            // Prevent horizontal wraparound (e.g., h-file to a-file)
            if (Math.abs(toCol - fromCol) > 2) continue;

            const targetBit = 1n << BigInt(target);
            const isFriendly = (friendlyPieces & targetBit) !== 0n;
            const isEnemy = (enemyPieces & targetBit) !== 0n;

            if (isFriendly) continue; // can't move onto own piece

            // Allow move to empty or enemy-occupied square (i.e., capture)
            validMoves.push(target);
        }

        return validMoves;
    }
    // this function identifys where and how sliding pieces can move
    function validMovesSlider(pieceLocation, directions, isWhite) {
    const validMoves = [];

    // Determine friendly and enemy pieces based on current turn
    const friendlyPieces = isWhite  ? allWhitePiecesBitboard : allBlackPiecesBitboard;
    const enemyPieces = isWhite  ? allBlackPiecesBitboard : allWhitePiecesBitboard;

    const fromRank = Math.floor(pieceLocation / 8);
    const fromFile = pieceLocation % 8;

    for (const dir of directions) {
        let i = 1;

        while (true) {
            const currentSquare = pieceLocation + dir * i;

            if (currentSquare < 0 || currentSquare >= 64) break;

            const toRank = Math.floor(currentSquare / 8);
            const toFile = currentSquare % 8;

            // Prevent wrap-around between ranks and files
            const deltaRank = Math.abs(toRank - fromRank);
            const deltaFile = Math.abs(toFile - fromFile);

            // Only allow the move if it aligns with the intended direction
            const isHorizontal = dir === 1 || dir === -1;
            const isVertical = dir === 8 || dir === -8;
            const isDiagonal = Math.abs(dir) === 7 || Math.abs(dir) === 9;

            if (
                (isHorizontal && deltaRank !== 0) ||
                (isVertical && deltaFile !== 0) ||
                (isDiagonal && deltaRank !== deltaFile)
            ) {
                break;
            }

            const currentSquareBit = 1n << BigInt(currentSquare);

            if ((friendlyPieces & currentSquareBit) !== 0n) break;

            validMoves.push(currentSquare);

            if ((enemyPieces & currentSquareBit) !== 0n) break;

            i++;
        }
    }

    return validMoves;
    }

    function isInCheck(color) {
        
        const enemyPieces = color === 'white' ? piecesPosition.blackPieces : piecesPosition.whitePieces;
        const kingIndex = (color === 'white'
            ? hexToSquares(piecesPosition.whitePieces.whiteKing)
            : hexToSquares(piecesPosition.blackPieces.blackKing)
        )[0];

        // Check if we have valid data
        if (!enemyPieces || Object.keys(enemyPieces).length === 0) {  
            return false;
        }
        if (kingIndex === undefined || kingIndex === null) {   
            return false;
        }
        let foundCheck = false;

        for (let i = 0; i < Object.keys(enemyPieces).length; i++) {
            const pieceType = Object.keys(enemyPieces)[i];
            const bitboard = enemyPieces[pieceType];
            

            const pieceIndices = hexToSquares(bitboard);
            for (const index of pieceIndices) {
                let moves = [];
                const col = index % 8;

                // Determine if the piece is white or black
                const isWhite = pieceType.toLowerCase().includes("white");

                if (pieceType.includes("Queen")) {
                    
                    moves = validMovesSlider(index, movedirections.sliderPieces.queenMovements, isWhite);
                } else if (pieceType.includes("Rook")) {
                    moves = validMovesSlider(index, movedirections.sliderPieces.rookMovements, isWhite);
                } else if (pieceType.includes("Bishop")) {
                    moves = validMovesSlider(index, movedirections.sliderPieces.bishopMovements, isWhite);
                } else if (pieceType.includes("Knight")) {
                    const knightMoves = [];
                    if (col + 1 < 8) knightMoves.push(index + 17, index - 15);
                    if (col - 1 >= 0) knightMoves.push(index + 15, index - 17);
                    if (col + 2 < 8) knightMoves.push(index + 10, index - 6);
                    if (col - 2 >= 0) knightMoves.push(index + 6, index - 10);
                    moves = validMovesStepper(index, knightMoves, isWhite);
                } else if (pieceType.includes("Pawn")) {
                    if (pieceType.includes("white")) {
                        moves = [...movedirections.stepPieces.pawnMovementsWhite];
                        if (((allBlackPiecesBitboard >> BigInt(index + 9)) & 1n) !== 0n && col + 1 < 8) {
                            moves.push(9);
                        }
                        if (((allBlackPiecesBitboard >> BigInt(index + 7)) & 1n) !== 0n && col - 1 >= 0) {
                            moves.push(7);
                        }
                    } else if (pieceType.includes("black")) {
                        moves = [...movedirections.stepPieces.pawnMovementsBlack];
                        if (((allWhitePiecesBitboard >> BigInt(index - 9)) & 1n) !== 0n && col - 1 >= 0) {
                            moves.push(-9);
                        }
                        if (((allWhitePiecesBitboard >> BigInt(index - 7)) & 1n) !== 0n && col + 1 < 8) {
                            moves.push(-7);
                        }
                    }
                    moves = validMovesStepper(index, moves , isWhite);
                } else if (pieceType.includes("King")) {
                    moves = validMovesStepper(index, movedirections.stepPieces.kingMovements , isWhite);
                }
                
                // Show where this piece can move
                if (moves && moves.length > 0) {
                    // Check if any move attacks the king
                    if (moves.includes(kingIndex)) {
                        foundCheck = true;
                    }
                }
            }
        }
        console.log("White King Bitboard:", piecesPosition.whitePieces.whiteKing.toString(16));
        console.log("Black King Bitboard:", piecesPosition.blackPieces.blackKing.toString(16));
        if (foundCheck) {
            console.log("king IS IN CHECK!");
            console.log(`${kingIndex}`)
            return true;
        } else {
            console.log("king is safe (not in check)");
            console.log(`${kingIndex}`)
            return false;
        }
    }


    function isCheckmate(color) {
        if (!isInCheck(color)) {
            // Could be stalemate if no legal moves but not in check — handle separately
            return false;
        }
        let isWhite =  color === "white" ? true : false
        const pieceSet = color === "white" ? piecesPosition.whitePieces : piecesPosition.blackPieces;
        const keys = Object.keys(pieceSet);

        for (const pieceKey of keys) {
            const bitboard = pieceSet[pieceKey];
            const pieceIndices = hexToSquares(bitboard);

            for (const fromSquare of pieceIndices) {
                let possibleMoves = [];

                if (pieceKey.includes("Queen")) {
                    possibleMoves = validMovesSlider(fromSquare, movedirections.sliderPieces.queenMovements, color === "white");

                } else if (pieceKey.includes("Rook")) {
                    possibleMoves = validMovesSlider(fromSquare, movedirections.sliderPieces.rookMovements, color === "white");

                } else if (pieceKey.includes("Bishop")) {
                    possibleMoves = validMovesSlider(fromSquare, movedirections.sliderPieces.bishopMovements, color === "white");

                } else if (pieceKey.includes("Knight")) {
                    const col = fromSquare % 8;
                    const knightMoves = [];
                    if (col + 1 < 8) knightMoves.push(fromSquare + 17, fromSquare - 15);
                    if (col - 1 >= 0) knightMoves.push(fromSquare + 15, fromSquare - 17);
                    if (col + 2 < 8) knightMoves.push(fromSquare + 10, fromSquare - 6);
                    if (col - 2 >= 0) knightMoves.push(fromSquare + 6, fromSquare - 10);
                    possibleMoves = validMovesStepper(fromSquare, knightMoves , isWhite);

                } else if (pieceKey.includes("Pawn")) {
                    const isWhite = pieceKey.includes("white");
                    const row = Math.floor(fromSquare / 8);
                    const col = fromSquare % 8;
                    const pointerSquare = fromSquare;
                    const moves = isWhite ? [...movedirections.stepPieces.pawnMovementsWhite] : [...movedirections.stepPieces.pawnMovementsBlack];
                    const enemyBitboard = isWhite ? allBlackPiecesBitboard : allWhitePiecesBitboard;

                    if (isWhite) {
                        if (row === 6 && ((enemyBitboard >> BigInt(pointerSquare + 16)) & 1n) === 0n && ((enemyBitboard >> BigInt(pointerSquare + 8)) & 1n) === 0n) {
                            moves.push(16);
                        }
                        if (((enemyBitboard >> BigInt(pointerSquare + 8)) & 1n) === 0n) {
                            moves.push(8);
                        }
                        if (((enemyBitboard >> BigInt(pointerSquare + 9)) & 1n) !== 0n && col + 1 < 8) {
                            moves.push(9);
                        }
                        if (((enemyBitboard >> BigInt(pointerSquare + 7)) & 1n) !== 0n && col - 1 > 0) {
                            moves.push(7);
                        }
                    } else {
                        if (row === 1 && ((enemyBitboard >> BigInt(pointerSquare - 16)) & 1n) === 0n && ((enemyBitboard >> BigInt(pointerSquare - 8)) & 1n) === 0n) {
                            moves.push(-16);
                        }
                        if (((enemyBitboard >> BigInt(pointerSquare - 8)) & 1n) === 0n) {
                            moves.push(-8);
                        }
                        if (((enemyBitboard >> BigInt(pointerSquare - 9)) & 1n) !== 0n && col - 1 > 0) {
                            moves.push(-9);
                        }
                        if (((enemyBitboard >> BigInt(pointerSquare - 7)) & 1n) !== 0n && col + 1 < 8) {
                            moves.push(-7);
                        }
                    }

                    possibleMoves = validMovesStepper(pointerSquare, moves, isWhite);

                } else if (pieceKey.includes("King")) {
                    possibleMoves = validMovesStepper(fromSquare, movedirections.stepPieces.kingMovements, isWhite);
                }

                // Simulate each move
                for (const toSquare of possibleMoves) {
                    if (isLegalMove(fromSquare, toSquare, color, pieceKey)) {
                        return false; // Found at least one legal move — not checkmate
                    }
                }
            }
        }

        return true; // No legal moves left while in check → checkmate
    }



function isLegalMove(fromSquare, toSquare, color, pieceKey) {
    // Deep clone using BigInt-safe method
    const cloneBitboards = (bitboards) => {
        const clone = {};
        for (const key in bitboards) {
            clone[key] = {};
            for (const piece in bitboards[key]) {
                clone[key][piece] = bitboards[key][piece];
            }
        }
        return clone;
    };

    const originalPiecesPosition = cloneBitboards(piecesPosition);
    const originalAllWhite = allWhitePiecesBitboard;
    const originalAllBlack = allBlackPiecesBitboard;

    const colorPieces = color + "Pieces";
    const enemyColor = color === "white" ? "black" : "white";
    const enemyColorPieces = enemyColor + "Pieces";

    // Temporarily make the move
    piecesPosition[colorPieces][pieceKey] &= ~(1n << BigInt(fromSquare));

    // Handle captures
    for (const enemyPieceKey in piecesPosition[enemyColorPieces]) {
        if (((piecesPosition[enemyColorPieces][enemyPieceKey] >> BigInt(toSquare)) & 1n) === 1n) {
            piecesPosition[enemyColorPieces][enemyPieceKey] &= ~(1n << BigInt(toSquare));
            break;
        }
    }

    // Move the piece
    piecesPosition[colorPieces][pieceKey] |= (1n << BigInt(toSquare));

    updateGlobalBitboards();

    const stillInCheck = isInCheck(color);

    // Restore the original bitboards by copying fields back (not reassigning)
    for (const side in originalPiecesPosition) {
        for (const piece in originalPiecesPosition[side]) {
            piecesPosition[side][piece] = originalPiecesPosition[side][piece];
        }
    }

    allWhitePiecesBitboard = originalAllWhite;
    allBlackPiecesBitboard = originalAllBlack;
    updateGlobalBitboards();
    console.log()
    return !stillInCheck;
}



function updateGlobalBitboards() {
    allWhitePiecesBitboard = 0n;
    allBlackPiecesBitboard = 0n;
    
    for (const piece of Object.values(piecesPosition.whitePieces)) {
        allWhitePiecesBitboard |= piece;
    }
    
    for (const piece of Object.values(piecesPosition.blackPieces)) {
        allBlackPiecesBitboard |= piece;
    }
}
    
 
    this.input.on('pointerdown', function (pointer){
            updateboard()
            // Takes the square and figures out what piece is on the square
            let col = Math.floor(pointer.x / squareSize);
            let row = Math.floor(pointer.y / squareSize);
            let pointerSquare = (7 - row) * 8 + col;
            
            if(pointerDown === 'select'){
                pieceType = null;
                pieceSquare = pointerSquare
            // cheaks what square it is on eg 54, 32, or 12

            //asighns the clicked square to a piece type
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
                        moves = movedirections.stepPieces.kingMovements
                        avalablemoves = validMovesStepper(pointerSquare, moves, turn === 'white')
                        movmentType = "stepper"

                    } else if(pieceType.includes("Queen")){
                        moves =  movedirections.sliderPieces.queenMovements
                        avalablemoves = validMovesSlider(pointerSquare, moves, turn === 'white')
                        movmentType = "slider"

                    } else if(pieceType.includes("Rook")){
                        moves =  movedirections.sliderPieces.rookMovements
                        avalablemoves = validMovesSlider(pointerSquare, moves, turn === 'white')
                        movmentType = "slider"

                    } else if(pieceType.includes("Bishop")){
                        moves = movedirections.sliderPieces.bishopMovements
                        avalablemoves = validMovesSlider(pointerSquare, moves, turn === 'white')
                        movmentType = "slider"

                    } else if(pieceType.includes("Knight")){
                        moves = [...movedirections.stepPieces.knightMovements]

                        if(col+ 1 < 8){
                            moves.push(+17, -15)
                        }
                        if(col - 1 > 0){
                            moves.push(+6, - 10)
                        }
                        if(col + 2 < 8){
                            moves.push(-6, +10)
                        }
                        if(col  >= 0){
                            moves.push(+15, -17)
                        }

                        avalablemoves = validMovesStepper(pointerSquare, moves, turn === 'white')
                        movmentType = "stepper"


                    } else if(pieceType.includes("whitePawn")){
                        moves = [...movedirections.stepPieces.pawnMovementsWhite];
                        

                        // foroward moves
                        if(row === 6 & ((allBlackPiecesBitboard >> BigInt(pointerSquare + 16)) & 1n) === 0n && ((allBlackPiecesBitboard >> BigInt(pointerSquare + 8)) & 1n) === 0n){
                        moves.push(+16)
                        }
                        if(((allBlackPiecesBitboard >> BigInt(pointerSquare + 8)) & 1n) === 0n){
                        moves.push(+8)
                        }

                        // makes sure the piece that the pawn is not edge hopping
                        if(((allBlackPiecesBitboard >> BigInt(pointerSquare + 9)) & 1n) !== 0n & col + 1 < 8){
                        moves.push(+9)
                        }
                        if(((allBlackPiecesBitboard >> BigInt(pointerSquare + 7)) & 1n) !== 0n & col - 1 > 0 ){
                        moves.push(+7)
                        }
                        avalablemoves = validMovesStepper(pointerSquare, moves, turn === 'white')
                        movmentType = "stepper"


                        
                    } else if(pieceType.includes("blackPawn")){
                        moves = [...movedirections.stepPieces.pawnMovementsBlack];

                        // foroward moves
                        if(row === 1 & ((allWhitePiecesBitboard >> BigInt(pointerSquare - 16)) & 1n) === 0n && ((allWhitePiecesBitboard >> BigInt(pointerSquare -8)) & 1n) === 0n){
                        moves.push(-16)
                        }
                        if(((allWhitePiecesBitboard >> BigInt(pointerSquare -8)) & 1n) === 0n){
                        moves.push(-8)
                        }
                        // makes sure the piece is not edge hopping 
                        if(((allWhitePiecesBitboard >> BigInt(pointerSquare - 9)) & 1n) !== 0n && col - 1 > 0 ){
                        moves.push(-9)
                        }
                        if(((allWhitePiecesBitboard >> BigInt(pointerSquare - 7)) & 1n) !== 0n && col + 1 < 8){
                        moves.push(-7)
                        }
                        avalablemoves = validMovesStepper(pointerSquare, moves, turn === 'white' )
                        movmentType = "stepper"
                    }

            }
            // adds the circles to the board
            function addCircles(squareIndex, validLocations, x, y){
            if(avalablemoves.includes(squareIndex)) {
                if(turn === "white"){  
                if (((allWhitePiecesBitboard >> BigInt(squareIndex)) & 1n) === 0n){
                    let object = scene.add.circle(x, y , 10 ,0xd12f04 , 0.8)
                    moveIndicators.push(object)
                    validLocations.push(squareIndex)

                }

                }else{
                    if (((allBlackPiecesBitboard >> BigInt(squareIndex)) & 1n) === 0n){
                        let object = scene.add.circle(x, y , 10 ,0xd12f04 , 0.8)
                        moveIndicators.push(object)
                        validLocations.push(squareIndex)
                    }
                }
            }
            }
            


            let squareIndex = 0
            validLocations = []
            for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        const x = col * squareSize + squareSize / 2;
                        const y = (7-row) * squareSize + squareSize / 2; 
                        
                        //calculates if there is a piece of the same color           
                        for (let i = 0; i < avalablemoves.length; i++) {
                            const squareIndex = avalablemoves[i];
                            const row = 7 - Math.floor(squareIndex / 8);
                            const col = squareIndex % 8;
                            const x = col * squareSize + squareSize / 2;
                            const y = row * squareSize + squareSize / 2;
                            addCircles(squareIndex, validLocations, x, y);
                            
                }}}

        
                
                pointerDown = 'place'    
        } else if(pointerDown === 'place'){
            if (!validLocations.includes(pointerSquare)) {
            return; // Ignore invalid square clicks
            }

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
                pieceBitboard = (pieceBitboard & ~(1n << BigInt(pieceSquare))) | (1n << BigInt(pointerSquare)); // removes the old piece and shifts it to a new square
                piecesPosition.blackPieces[pieceType] = pieceBitboard;
                turn = "white"
            }
            // removes old piece and places new piece on selected square when board updates
            

            // Promotions
            if (pieceType.includes("whitePawn")) {
                if (row === 0) {
                    pieceBitboard &= ~(1n << BigInt(pointerSquare));  // Remove pawn
                    piecesPosition.whitePieces[pieceType] = pieceBitboard;
                    piecesPosition.whitePieces["whiteQueen"] |= (1n << BigInt(pointerSquare)); // Add queen
                }
            } else if (pieceType.includes("blackPawn")) {
                if (row === 7) {
                    pieceBitboard &= ~(1n << BigInt(pointerSquare));  // Remove pawn
                    piecesPosition.blackPieces[pieceType] = pieceBitboard;
                    piecesPosition.blackPieces["blackQueen"] |= (1n << BigInt(pointerSquare)); // Add queen
                }
            }



            updateboard();
            pointerDown = 'select';
            // Check for check or checkmate after the move
            if (isInCheck(turn)) {
                if (isCheckmate(turn)) {
                    console.log("CHECKMATE")
                } else {
                    console.log("CHECK")
                }
            }
            
        };    
        
    

    });
}
function update() {
}
