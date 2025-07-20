const pieceValues = [ 3, 3, 5, 9, 1000000, 1]   
let piecesBit = null
let allMoves = []
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
const allPiecesNames = [
        'whiteKing', 'whiteQueen', 'whiteRook', 'whiteBishop', 'whiteKnight', 'whitePawn', 
        'blackKing', 'blackQueen', 'blackRook', 'blackBishop', 'blackKnight', 'blackPawn', 
    ]

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
        const pieceName = allPiecesNames[i]; // e.g. 'blackKing'
        const pieceBitboard = piecesPosition.blackPieces[pieceName];
        const pieceCount = popcount(pieceBitboard)
        blackEval += pieceCount * pieceValues[i-6]
    }
    let finalEval = whiteEval - blackEval;

    console.log(`Total Black Pieces value: ${blackEval}`)
    console.log(`Total white Pieces value: ${whiteEval}`)
    console.log(`Final Eval: ${finalEval}`)
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


function looping(piecesPosition){
    //curent position
    
    for(let i = 6; i< 12; i++){//loops through all the bitboards only white for now so you must play balck
        const pieceName = allPiecesNames[i]; // e.g. 'blackKing'
        const pieceBitboard = piecesPosition.blackPieces[pieceName];
        const pieceCount = popcount(pieceBitboard) // calculates the amount of pieces
        for(let i = 0; i< pieceCount; i++){ //loops through a given amount deepending on how many pieces there are of that kind
            piecesBit = findNthBitLocation(pieceBitboard, i)
            console.log(`Location ${pieceName} ${piecesBit}`)
            moveLogic()
            allMoves.push(avalablemoves)
            //loop through avalable moves 
            //console avalable moves 
        }
    }
    console.log(avalablemoves)
    
}
looping(piecesPosition)

function moveLogic(){
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
        avalablemoves = validMovesStepper(pointerSquare, moves, turn === 'white' )
        movmentType = "stepper"
    }
}
