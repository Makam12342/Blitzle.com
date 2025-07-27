
// Gamemode
const urlParams = new URLSearchParams(window.location.search);
const isOnline = urlParams.has('username') && urlParams.has('room');
let roomId = null;
if (isOnline) {
    roomId = urlParams.get("room");
    socket.emit('joinRoom', roomId); // Tell the server what room we're joining
}



//Game colors: 

const lightSquaresColor = 0xfcf1df
const darkSquaresColor = 0x393E46
const indicatorsColor = 0xd67327



// All of the game data
const config = {
    type: Phaser.AUTO,
    width: 510,
    height: 510,
    backgroundColor: lightSquaresColor,
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
    const squareSize = 63.75;
    const scene = this;

    let pieceType = null;
    let avalablemoves = null;
    let pointerDown = 'select'
    let moveIndicators = []
    let highlights = []
    let highlight = null
    let prevouseMoveIndicators = []
    let turn = "white"
    let playersTurn = null;
    let pieceSquare = null;
    let pieceBitboard = null
    let pieceIcons= [];
    let allWhitePiecesBitboard = 0x0000000000000000
    let allBlackPiecesBitboard = 0x0000000000000000
    let validLocations = []
    let movmentType = null
    let pieceNotation = null
    let moveHistory = []
    const files = ["a", "b", "c", "d", "e", "f", "g", "h" ]
    const checkSound = new Audio('check.mp3');
    const moveSound = new Audio('move.mp3')
    const checkmateSound = new Audio('checkmate.mp3')
    let turnStart = 0
    let whiteTime = 60*3
    let blackTime = 60*3
    let remaining = 60*3
    let blackCanCastleQueenSide = false
    let blackCanCastleKingSide = false
    let whiteCanCastleQueenSide = false
    let whiteCanCastleKingSide = false
    let blackKingsideRookMoved = false
    let blackQueensideRookMoved = false
    let whiteKingsideRookMoved = false
    let whiteQueensideRookMoved = false  
    let whiteKingMoved = false
    let blackKingMoved = false
    let gameStart = false
    const pieceValues = [ 3, 3, 5, 9, 1000000, 1]   
    let piecesBit = null
    let allMoves = []
    let col = null
    let row = null 
    let pointerSquare = null
    let pieceCount =  null
    let newEval = null
    let oldEval = 0
    let clonedPiecesPositon =  null
    let gameEnd = false



    let enPassantWhite = false
    let enPassantRowWhite = null
    let enPassantColWhite = null 
    let enPassantSquareWhite =  null

    let enPassantBlack = false
    let enPassantRowBlack = null
    let enPassantColBlack = null 
    let enPassantSquareBlack =  null

    const fromSquare =  null
    let pieceMovedFrom = null

    const endScreen = document.getElementById('endScreen')
    const gameInfo = document.getElementById("info-container")
    //Holds all of the diferent pieces with there corosponding bitboard
    let piecesPosition = {
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
                this.add.rectangle( col * squareSize + squareSize / 2, row * squareSize + squareSize / 2, squareSize, squareSize, darkSquaresColor); // Change colour at the end
                
            }
        }
    }

    // The win screen for the players

    
    function winScreen(winner, message) {
        gameEnd = true
        scene.input.enabled = false;
        console.log(winner, message)

        const gameOverH1 = document.createElement('h1')
        gameOverH1.innerText = "gameOver"
        endScreen.appendChild(gameOverH1);

        const winnerTitleH2 = document.createElement('h2')
        winnerTitleH2.innerText = (`${winner} wins`)
        endScreen.appendChild(winnerTitleH2);

        const messageP = document.createElement('p')
        messageP.innerText = message
        endScreen.appendChild(messageP);

        const homeLink = document.createElement('a')
        homeLink.innerText = "Home"
        homeLink.href = "index.html"
        endScreen.appendChild(homeLink);

        const gameLink = document.createElement('a')
        gameLink.innerText = "Exit"
        gameLink.href = ("gamePage.html")
        endScreen.appendChild(gameLink);
        endScreen.classList.add('show');


    }
    


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
            const object = scene.add.sprite(col * squareSize + squareSize / 2, (7 - row) * squareSize + squareSize / 2, image).setDisplaySize(60, 60);
            if((isOnline === true & playersColor === "black") || isOnline != true & turn === "black"){
            object.setAngle(180);
            }
            object.setInteractive({cursor: "pointer" });
            object.setDepth(2);
            pieceIcons.push(object);
    });

    }
    
    
    // Adds all the pieces to the board
    function updateboard() {


    if((isOnline === true & playersColor === "black") || isOnline != true & turn === "black"){
        scene.cameras.main.rotation = Phaser.Math.DegToRad(180);
    }else{
        scene.cameras.main.rotation = Phaser.Math.DegToRad(0);
    }

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
    
console.log(enPassantBlack, enPassantWhite);
    // en passun square is the square behind the piece
    // Black is currently moving → check if black's en passant square is being captured
    console.log(pointerSquare, enPassantSquareBlack, enPassantSquareWhite)
    if (turn === "white" && enPassantBlack && pointerSquare === enPassantSquareBlack) {
        console.log("Black performs en passant capture");
        // Black's pawn is 1 rank behind the enPassant square
        piecesPosition.whitePieces.whitePawn &= ~(1n << BigInt(enPassantSquareBlack + 8));
    }

    // White is currently moving → check if white's en passant square is being captured
    else if (turn === "black" && enPassantWhite && pointerSquare === enPassantSquareWhite) {
        console.log("White performs en passant capture");
        // White's pawn is 1 rank ahead of the enPassant square
        piecesPosition.blackPieces.blackPawn &= ~(1n << BigInt(enPassantSquareWhite - 8));
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
                    if (col + 1 < 8) knightMoves.push(+17, -15);
                    if (col - 1 >= 0) knightMoves.push(+15, -17);
                    if (col + 2 < 8) knightMoves.push(+10, -6);
                    if (col - 2 >= 0) knightMoves.push(+6, -10);
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
        if (foundCheck) {
            return true;
        } else { 
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

            for (fromSquare of pieceIndices) {
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
                    if (col + 1 < 8) knightMoves.push(+17, -15);
                    if (col - 1 >= 0) knightMoves.push(+15, -17);
                    if (col + 2 < 8) knightMoves.push(+10, -6);
                    if (col - 2 >= 0) knightMoves.push(+6, -10);
                    possibleMoves = validMovesStepper(fromSquare, knightMoves , isWhite);

                } else if (pieceKey.includes("Pawn")) {
                    const isWhite = pieceKey.includes("white");
                    const row = Math.floor(fromSquare / 8);
                    const col = fromSquare % 8;
                    const pointerSquare = fromSquare;
                    const moves = isWhite ? [...movedirections.stepPieces.pawnMovementsWhite] : [...movedirections.stepPieces.pawnMovementsBlack];
                    const enemyBitboard = isWhite ? allBlackPiecesBitboard : allWhitePiecesBitboard;
                    const friendlyBitboard = !isWhite ? allBlackPiecesBitboard : allWhitePiecesBitboard;

                    if (isWhite) {
                        if (row === 6 && ((enemyBitboard >> BigInt(pointerSquare + 16)) & 1n) === 0n && ((enemyBitboard >> BigInt(pointerSquare + 8)) & 1n) === 0n && ((friendlyBitboard >> BigInt(pointerSquare + 8)) & 1n) === 0n) {
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
                        if (row === 1 && ((enemyBitboard >> BigInt(pointerSquare - 16)) & 1n) === 0n && ((enemyBitboard >> BigInt(pointerSquare - 8)) & 1n) === 0n && ((friendlyBitboard >> BigInt(pointerSquare - 8)) & 1n) === 0n) {
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

function moveLogic(pieceType, pointerSquare, row, col, turn){
    if(pieceType.includes("King")){
        blackCanCastleKingSide, blackCanCastleQueenSide, whiteCanCastleKingSide, whiteCanCastleQueenSide  = canCastle(turn)
        pieceNotation = "K"
        let moves = [...movedirections.stepPieces.kingMovements]
        
        if( turn === "white" & whiteCanCastleKingSide === true ){
            moves.push(2)
            
        }
        if( turn === "white" & whiteCanCastleQueenSide === true ){
            moves.push(-2)
        }
        if( turn === "black" & blackCanCastleKingSide === true ){
            moves.push(2)
        }
        if( turn === "black" & blackCanCastleQueenSide === true ){
            moves.push(-2)
        }
        avalablemoves = validMovesStepper(pointerSquare, moves, turn === 'white')
        movmentType = "stepper"

    } else if(pieceType.includes("Queen")){
        pieceNotation = "Q"
        let moves =  movedirections.sliderPieces.queenMovements
        avalablemoves = validMovesSlider(pointerSquare, moves, turn === 'white')
        movmentType = "slider"

    } else if(pieceType.includes("Rook")){
        pieceNotation = "R"
        let moves =  movedirections.sliderPieces.rookMovements
        avalablemoves = validMovesSlider(pointerSquare, moves, turn === 'white')
        movmentType = "slider"

    } else if(pieceType.includes("Bishop")){
        pieceNotation = "B"
        let moves = movedirections.sliderPieces.bishopMovements
        avalablemoves = validMovesSlider(pointerSquare, moves, turn === 'white')
        movmentType = "slider"

    } else if(pieceType.includes("Knight")){
        pieceNotation = "N"
        let moves = [...movedirections.stepPieces.knightMovements]

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
        pieceNotation = "P"
        let moves = [...movedirections.stepPieces.pawnMovementsWhite];
        

        // foroward moves
        if(row === 6 & ((allBlackPiecesBitboard >> BigInt(pointerSquare + 16)) & 1n) === 0n && ((allBlackPiecesBitboard >> BigInt(pointerSquare + 8)) & 1n) === 0n  && ((allWhitePiecesBitboard >> BigInt(pointerSquare + 8)) & 1n) === 0n ){
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


        if (enPassantWhite) {
            if (row === enPassantRowWhite) {
                // Left capture
                if (col === enPassantColWhite - 1 && col >= 0) {
                    moves.push(+9); // diagonally right (from white's perspective)
                }
                // Right capture
                else if (col === enPassantColWhite + 1 && col <= 7) {
                    moves.push(+7); // diagonally left
                }
            }
        }

        avalablemoves = validMovesStepper(pointerSquare, moves, turn === 'white')
        movmentType = "stepper"
 
    } else if(pieceType.includes("blackPawn")){
        pieceNotation = "P"
        moves = [...movedirections.stepPieces.pawnMovementsBlack];

        // foroward moves
        if(row === 1 & ((allWhitePiecesBitboard >> BigInt(pointerSquare - 16)) & 1n) === 0n && ((allBlackPiecesBitboard >> BigInt(pointerSquare -8)) & 1n) === 0n && ((allWhitePiecesBitboard >> BigInt(pointerSquare -8)) & 1n) === 0n){
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

        if (enPassantBlack) {
            if (row === enPassantRowBlack) {
                if (col === enPassantColBlack - 1 && col >= 0) {
                    moves.push(-7); // forward-left for black
                } else if (col === enPassantColBlack + 1 && col <= 7) {
                    moves.push(-9); // forward-right for black
                }
            }
        }




        avalablemoves = validMovesStepper(pointerSquare, moves, turn === 'white' )
        movmentType = "stepper"
    }
    return avalablemoves;
}
// Deep clone using BigInt-safe method
function cloneBitboards(bitboards) {
    const clone = {};
    for (const key in bitboards) {
        clone[key] = {};
        for (const piece in bitboards[key]) {
            clone[key][piece] = bitboards[key][piece];
        }
    }
    return clone;
};
function isLegalMove(fromSquare, toSquare, color, pieceKey) {
    
    

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

function canCastle(turn){
    /* Some of the bitboards are fliped so if you ar debugging these bitboards are jsut like
    this and dont change but all bitboards start with bottom left conner except kings for some reson */

    blackCanCastleQueenSide = false
    blackCanCastleKingSide = false
    whiteCanCastleQueenSide = false
    whiteCanCastleKingSide = false
    
    if(turn != "white"){
    // Black Queenside
    blackCanCastleQueenSide = true
    if ((allBlackPiecesBitboard >> BigInt(57)) & 1n || (allWhitePiecesBitboard >> BigInt(57)) & 1n){ blackCanCastleQueenSide = false }
    if ((allBlackPiecesBitboard >> BigInt(58)) & 1n || (allWhitePiecesBitboard >> BigInt(58)) & 1n){ blackCanCastleQueenSide = false }
    if ((allBlackPiecesBitboard >> BigInt(59)) & 1n || (allWhitePiecesBitboard >> BigInt(59)) & 1n){ blackCanCastleQueenSide = false }
    if (((piecesPosition.blackPieces.blackKing >> 60n) & 1n) === 0n){ blackCanCastleQueenSide = false, blackKingMoved = true;}
    if (((piecesPosition.blackPieces.blackRook >> 56n) & 1n) === 0n){ blackCanCastleQueenSide = false,blackQueensideRookMoved = true;}
    if(blackQueensideRookMoved === true){blackCanCastleQueenSide = false}
    

    // Black Kingside
    blackCanCastleKingSide = true
    if ((allBlackPiecesBitboard >> BigInt(62)) & 1n || (allWhitePiecesBitboard >> BigInt(57)) & 1n){ blackCanCastleKingSide = false }
    if ((allBlackPiecesBitboard >> BigInt(61)) & 1n || (allWhitePiecesBitboard >> BigInt(58)) & 1n){ blackCanCastleKingSide = false }
    if (((piecesPosition.blackPieces.blackKing >> 60n) & 1n) === 0n){ blackCanCastleKingSide = false, blackKingMoved = true;}
    if (((piecesPosition.blackPieces.blackRook >> 63n) & 1n) === 0n){ blackCanCastleKingSide = false, blackKingsideRookMoved = true;}
    if(blackKingsideRookMoved === true){blackCanCastleKingSide = false}
    
    }
    if(turn === "white"){
    // White Queenside
    whiteCanCastleQueenSide = true
    if ((allBlackPiecesBitboard >> BigInt(1)) & 1n || (allWhitePiecesBitboard >> BigInt(1)) & 1n){ whiteCanCastleQueenSide = false }
    if ((allBlackPiecesBitboard >> BigInt(2)) & 1n || (allWhitePiecesBitboard >> BigInt(2)) & 1n){ whiteCanCastleQueenSide = false }
    if ((allBlackPiecesBitboard >> BigInt(3)) & 1n || (allWhitePiecesBitboard >> BigInt(3)) & 1n){ whiteCanCastleQueenSide = false }
    if (((piecesPosition.whitePieces.whiteKing >> 4n) & 1n) === 0n){ whiteCanCastleQueenSide = false, whiteKingMoved = true;}
    if (((piecesPosition.whitePieces.whiteRook >> 0n) & 1n) === 0n){ whiteCanCastleQueenSide = false, whiteQueensideRookMoved = true;}
    if(whiteQueensideRookMoved === true){ whiteCanCastleQueenSide = false}
    if(blackKingMoved === true){ blackCanCastleKingSide = false, blackCanCastleQueenSide = false}
    

    // White Kingside
    whiteCanCastleKingSide = true
    if ((allBlackPiecesBitboard >> BigInt(6)) & 1n || (allWhitePiecesBitboard >> BigInt(6)) & 1n){ whiteCanCastleKingSide = false }
    if ((allBlackPiecesBitboard >> BigInt(5)) & 1n || (allWhitePiecesBitboard >> BigInt(5)) & 1n){ whiteCanCastleKingSide = false }
    if (((piecesPosition.whitePieces.whiteKing >> 4n) & 1n) === 0n){ whiteCanCastleKingSide = false, whiteKingMoved = true;}
    if (((piecesPosition.whitePieces.whiteRook >> 7n) & 1n) === 0n){ whiteCanCastleKingSide = false, whiteKingsideRookMoved = true;}
    if(whiteKingsideRookMoved === true){whiteCanCastleKingSide = false}
    if(whiteKingMoved === true){whiteCanCastleKingSide = false, whiteCanCastleQueenSide = false}
    }
     
    return blackCanCastleKingSide, blackCanCastleQueenSide, whiteCanCastleKingSide, whiteCanCastleQueenSide 

}
// adds the circles to the board
function addCircles(squareIndex, validLocations, x, y){
if(avalablemoves.includes(squareIndex)) {
    if(turn === "white"){  
    if (((allWhitePiecesBitboard >> BigInt(squareIndex)) & 1n) === 0n){
        let object = scene.add.circle(x, y , 8 ,indicatorsColor , 0.8)
        object.setDepth(5)
        moveIndicators.push(object)
        validLocations.push(squareIndex)

    }

    }else{
        if (((allBlackPiecesBitboard >> BigInt(squareIndex)) & 1n) === 0n){
            let object = scene.add.circle(x, y , 8 ,indicatorsColor , 0.8)
            object.setDepth(5)
            moveIndicators.push(object)
            validLocations.push(squareIndex)
        }
    }
}
}
function gameLogic(pointer){
            
            
            updateboard()
            // Takes the square and figures out what piece is on the square
            if((isOnline === true & playersColor === "black") || isOnline != true & turn === "black"){
                col = Math.floor((510-pointer.x) / squareSize);
                row = Math.floor((510-pointer.y) / squareSize);
            }else{
                col = Math.floor((pointer.x) / squareSize);
                row = Math.floor((pointer.y) / squareSize);
            }
            pointerSquare = (7 - row) * 8 + col;
            
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
                avalablemoves = moveLogic(pieceType, pointerSquare, row, col, turn)
                let highlight = scene.add.rectangle( col * squareSize + squareSize / 2, row * squareSize + squareSize / 2, squareSize, squareSize, indicatorsColor); // Change colour at the end
                highlight.setAlpha(0.5); // 0 = fully transparent, 1 = fully opaque
                highlights.push(highlight)
            }
            let squareIndex = 0
            validLocations = []
            for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        const x = col * squareSize + squareSize / 2;
                        const y = (7-row) * squareSize + squareSize / 2; 
                        
                        // After you get the pseudolegal moves for the selected piece:
                        avalablemoves = avalablemoves.filter(toSquare => 
                            isLegalMove(pieceSquare, toSquare, turn, pieceType)
                        );

                        //calculates if there is a piece of the same color           
                        for (let i = 0; i < avalablemoves.length; i++) {
                            const squareIndex = avalablemoves[i];
                            const row = 7 - Math.floor(squareIndex / 8);
                            const col = squareIndex % 8;
                            const x = col * squareSize + squareSize / 2;
                            const y = row * squareSize + squareSize / 2;
                            addCircles(squareIndex, validLocations, x, y);
                            
        }}}
            pieceMovedFrom = pointerSquare
            fromSquareNotation = `${files[col]}${8-row}`
                
            pointerDown = 'place'
            
            
        // When placing a piece    
        } else if(pointerDown === 'place'){
            
            //invalid squares
            if (!validLocations.includes(pointerSquare)) {
            moveIndicators.forEach(circle => circle.destroy());
            highlights.forEach(rectangle => rectangle.destroy());
            moveIndicators = [];
            pointerDown = 'select'
            return; // Ignore invalid square clicks
            }

            if(pieceNotation === "K" & pointerSquare === 6 & whiteCanCastleKingSide === true){  
                piecesPosition.whitePieces.whiteRook = (piecesPosition.whitePieces.whiteRook & ~(1n << BigInt(7))) | (1n << BigInt(5));
            }
            if(pieceNotation === "K" & pointerSquare === 2 & whiteCanCastleQueenSide === true){
                piecesPosition.whitePieces.whiteRook = (piecesPosition.whitePieces.whiteRook & ~(1n << BigInt(0))) | (1n << BigInt(3));
            }
            if(pieceNotation === "K" & pointerSquare === 62 & blackCanCastleKingSide === true){
                piecesPosition.blackPieces.blackRook = (piecesPosition.blackPieces.blackRook & ~(1n << BigInt(63))) | (1n << BigInt(61));
                
            }
            if(pieceNotation === "K" & pointerSquare === 58 & blackCanCastleQueenSide === true){
                piecesPosition.blackPieces.blackRook = (piecesPosition.blackPieces.blackRook & ~(1n << BigInt(56))) | (1n << BigInt(59));
            }

           

            
            // removes the circles
            highlights.forEach(rectangle => rectangle.destroy());
            moveIndicators.forEach(circle => circle.destroy());
            prevouseMoveIndicators.forEach(rectangle => rectangle.destroy());
            moveIndicators = [];
            if(isOnline === false){
                let highlight = scene.add.rectangle( col * squareSize + squareSize / 2, row * squareSize + squareSize / 2, squareSize, squareSize, indicatorsColor); // Change colour at the end
                prevouseMoveIndicators.push(highlight)
            }else{
                socket.emit("moveHighlights", {room: roomId, row: row, col: col})
            }
            
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
            
            // en pasuant captures


            // to find
            
            if(pieceType.includes("Pawn")){
                if(turn === "white"){
                    enPassantWhite = false
                    if(row === 3 && Math.floor(pieceMovedFrom/ 8) === 6 ){
                        // white logic
                        enPassantWhite = true;
                        enPassantRowWhite = 3;
                        enPassantColWhite = col;
                        enPassantSquareWhite = pointerSquare + 8; // Square passed over
                    }
                } else if(turn === "black"){
                    enPassantBlack = false
                    if(row === 4 && Math.floor(pieceMovedFrom/ 8) === 1){
                        // black logic
                        enPassantBlack = true;
                        enPassantRowBlack = 4;
                        enPassantColBlack = col;
                        enPassantSquareBlack = pointerSquare - 8; // Square passed over
                    }
                }
            }



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

            // Displaying the move history in console 
            toSquareNotation = `${files[col]}${8-row}`
            let algabraicNotation= `${pieceNotation}${fromSquareNotation}-${toSquareNotation}`
            moveHistory.push(algabraicNotation)
            

            // inline DOM update:
            const ul = document.getElementById('moveHistoryList');
            const li = document.createElement('li');

            if(isOnline){
                
                socket.emit("algabraicSend", { room: roomId, algabraicNotation });
                
            }else{
            li.textContent = algabraicNotation;       // set the move text
            ul.appendChild(li);          // add the new move to the list
            // optional scroll:
            li.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
            
            


            updateboard();
            pointerDown = 'select';
            updateboard();
            // Check for check or checkmate after the move
            if (isInCheck(turn)) {
                if (isCheckmate(turn)) {
                    checkmateSound.currentTime = 0; // Rewind to start
                    checkmateSound.play();
                    if(turn === "white"){
                        if(isOnline === true){
                            socket.emit("gameOverSend", { room: roomId, winner:"Black", message:"Black wins by cheakmate, white is a loser"});
                        }else{
                            winScreen("Black", "Black wins by cheakmate, white is a loser")
                        }
                    }else{
                        
                        if(isOnline === true){
                            socket.emit("gameOverSend", { room: roomId, winner:"White", message:"White wins by cheakmate, white is a loser"});
                        }else{
                            winScreen("White", "White wins by cheakmate, white is a loser")
                        }
                    }
                } else {
                    checkSound.currentTime = 0; // Rewind to start
                    checkSound.play();
                }
            } else{
                moveSound.currentTime = 0; // Rewind to start
                moveSound.play();
            }
            
        };    
        
    

}
function serializeBigInts(obj) {
    return JSON.parse(JSON.stringify(obj, (_, val) =>
        typeof val === 'bigint' ? val.toString() : val
    ));
}
function materializeBigInts(obj) {
    for (const group in obj) {
        for (const piece in obj[group]) {
            obj[group][piece] = BigInt(obj[group][piece]);
        }
    }
    return obj;
}
    
function popcount(n) {
  let count = 0;
  while (n) {
    n &= n - 1n;
    count++;
  }
  return count;
}

function positionEvaluation(piecesPosition) {
    let whiteEval = 0;
    let blackEval = 0;

    // White bitboards
    for (let i = 0; i < 6; i++) {
        const pieceName = allPiecesNames[i]; // e.g. 'whiteKing'
        const pieceBitboard = piecesPosition.whitePieces[pieceName];
        const pieceCount = popcount(pieceBitboard)
        whiteEval += pieceCount * pieceValues[i]
    }
    // Black bitboards
    for (let i = 6; i < 12; i++) {
        pieceName = allPiecesNames[i]; // e.g. 'blackKing'
        pieceBitboard = piecesPosition.blackPieces[pieceName];
        pieceCount = popcount(pieceBitboard)
        blackEval += pieceCount * pieceValues[i-6]
    }
    let finalEval = whiteEval - blackEval;
    return finalEval
}

function findNthBitLocation(bitboard, n){ // finds the nth bits location on a bitboard
    let count = 0 
    for(let i = 0; i< 64; i++){
        if ((bitboard & (1n << BigInt(i)  )) !== 0n) { // tells oif the given i value is a one or not
            if(count === n){return (i)}
            count++
        }
    }
    console.log("no number found")
    return -1
}


function looping(){
    //curent position
    turn = "black"
    for(let i = 6; i< 12; i++){//loops through all the bitboards only white for now so you must play balck
        const pieceType = allPiecesNames[i]; // e.g. 'blackKing
        let pieceBitboard = piecesPosition.blackPieces[pieceType];
        const pieceCount = popcount(pieceBitboard) // calculates the amount of pieces
        for(let i = 0; i< pieceCount; i++){ //loops through a given amount deepending on how many pieces there are of that kind
            piecesBit = findNthBitLocation(pieceBitboard, i)
            col = piecesBit % 8;
            row = Math.floor(piecesBit / 8);
            pieceSquare = (row)*8 + col;
            pieceMoves = moveLogic(pieceType, pieceSquare, (7-row), col, turn)
            pieceMoves.forEach(move => {
                clonedPiecesPositon = cloneBitboards(piecesPosition)
                pieceBitboard = clonedPiecesPositon.blackPieces[pieceType]; //Takes the list of keys ["whitePawn"] and outputs the corosponding bitboard
                pieceBitboard = (pieceBitboard & ~(1n << BigInt(pieceSquare))) | (1n << BigInt(move));
                newEval = positionEvaluation(clonedPiecesPositon)
                
                if(newEval > oldEval){
                savedMove = pieceBitboard
                console.log(newEval) // Bigger eval
                console.log(move, piecesBit) // what pieces moved and for where
                oldEval = newEval
                }
            });
            //loop through avalable moves 
            //console avalable moves 
        }
    }
    updateboard()
}

    socket.on('gameOverReceive', (winner, message) =>{
        winScreen(winner, message)
    })
        
   
    socket.on('turnFliperReseve', (playersTurn, gameTimerWhite, gameTimerBlack) => {
            turn = playersTurn

            //game timers
            whiteTime = gameTimerWhite
            blackTime = gameTimerBlack

        })
    socket.on('positionDataReseve', (enemyPiecesPosition) => {
        piecesPosition = materializeBigInts(enemyPiecesPosition)
        updateboard()
        
    })
    socket.on('moveHighlightsReseve', (data) => {
        if(highlight){
                    highlight.destroy();
                };
        highlight = scene.add.rectangle( data.col * squareSize + squareSize / 2, data.row * squareSize + squareSize / 2, squareSize, squareSize, indicatorsColor); // Change colour at the end
    })

    socket.on('algabraicReseve', (notation) => {
            console.log(notation)
            moveHistory.push(notation)
            console.log(moveHistory)

            // inline DOM update:
            const ul = document.getElementById('moveHistoryList');
            const li = document.createElement('li');

            li.textContent = notation;       // set the move text
            ul.appendChild(li);          // add the new move to the list
            // optional scroll:
            li.scrollIntoView({ behavior: 'smooth', block: 'end' });
        })

   
    socket.on('startGame', (time) =>{
        gameStart = true
        blackTime = time
        whiteTime = time
        console.log(`Time reseved ${time}`)
    })

    this.input.on('pointerdown', function (pointer){
        
        
        
        //all of the game logic
        if(isOnline === true ){
                if(gameStart === true || turn === "black"){
                    updateboard()
                    if(playersColor === turn){
                        gameLogic(pointer)
                        playersTurn = turn  
                        socket.emit("turnFliperSend", { room: roomId, playersTurn, whiteTime, blackTime });
                        const piecesPositionSerialized = serializeBigInts(piecesPosition);
                        socket.emit("positionDataSend", { room: roomId, piecesPosition: piecesPositionSerialized });

                    }
                }
        }else {
            gameLogic(pointer)
        }
        });
    let StartTimer = false
    //formats timmer at start
    const whiteTimer = document.getElementById("whiteTimer");
    whiteTimer.innerHTML = ".Ready.";
    const blackTimer = document.getElementById("blackTimer");
    blackTimer.innerHTML = "Waiting";
    

    const clockInterval = setInterval(() => {
        if(turn === "black" & StartTimer === false || gameEnd === true){
        StartTimer = true
        turnStart = Date.now()
        }
        if(StartTimer === true){
            let now = Date.now();
            let elapsed = (now - turnStart) / 1000;  // seconds since turn began

            remaining = (turn === 'white' ? whiteTime : blackTime) - elapsed;
            if (remaining <= 0) {
                
                //End screen for time outs
                if(turn === 'white'){
                    if(isOnline === true){
                        socket.emit("gameOverSend", { room: roomId, winner:"White", message:"Black timed out, your just to slow"});
                    }else{
                        winScreen("White", "Black timed out, your just to slow")
                    }
                } else{
                    if(isOnline === true){
                        socket.emit("gameOverSend", { room: roomId, winner:"Black", message:"White timed out, you need to lock in"});
                    }else{
                        winScreen("Black", "White timed out, you need to lock in")
                    }
                }
                clearInterval(clockInterval);
            }
            // inline DOM update:
                    
                    const displayTimeWhiteMin = Math.floor(whiteTime / 60);
                    const displayTimeWhiteSec = Math.floor((whiteTime % 60) * 10) / 10;

                    const displayTimeBlackMin = Math.floor(blackTime / 60);
                    const displayTimeBlackSec = Math.floor((blackTime % 60) * 10) / 10;

                    
                    const mmWhite = displayTimeWhiteMin.toString().padStart(2, '0');

                    
                    const ssWhite = displayTimeWhiteSec
                    .toFixed(1)        
                    .padStart(4, '0'); 

                    const mmBlack = displayTimeBlackMin.toString().padStart(2, '0');
                    const ssBlack = displayTimeBlackSec
                    .toFixed(1)
                    .padStart(4, '0');

                    const whiteTimeString = `${mmWhite}:${ssWhite}`; 
                    const blackTimeString = `${mmBlack}:${ssBlack}`;

                    const blackTimer = document.getElementById("whiteTimer");
                    blackTimer.innerHTML = blackTimeString;
                    
                    const whiteTimer = document.getElementById("blackTimer");
                    whiteTimer.innerHTML = whiteTimeString;


                


                    if(turn === "white"){
                    whiteTimer.style.color = '#d67327';
                    blackTimer.style.color = 'black';
                    gameInfo.style.backgroundColor = '#fbf5f120'
                    } else{
                    whiteTimer.style.color = 'black';
                    blackTimer.style.color = '#d67327';
                    gameInfo.style.backgroundColor = '#1c1b1a35'
                    }


            // for timers 
            if(turn === "black"){
            turnStart = Date.now()
            blackTime = remaining
            } else{
            turnStart = Date.now()
            whiteTime = remaining
            }
        }
    }, 100);
}
function update() {
}
