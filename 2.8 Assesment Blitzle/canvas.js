function iskingUnderAtack(kingsSquare, oponentsPeices, oponenetsColor) {

    //loops through all of the pieces
    for(let pieceType in oponentsPeices){
        const bitboard = oponentsPeices[pieceType] 
        const pieceIndicies = hexToSquares(bitboard) // converts the bitboard to a list of indasies that that piece holds 
    }

    for(let peice in pieceIndicies){ // loops through each piece 
        let moves = [] // a blank array ready for when it getts filled up with the diferent moves

        // Generate moves based on piece type
            if (pieceType.includes("Pawn")) {
                moves = getPawnAttacks(peice, opponentColor);
            } else if (pieceType.includes("Knight")) {
                moves = validMovesStepper(peice, movedirections.stepPieces.knightMovements);
            } else if (pieceType.includes("Bishop")) {
                moves = validMovesSlider(peice, movedirections.sliderPieces.bishopMovements, opponentColor);
            } else if (pieceType.includes("Rook")) {
                moves = validMovesSlider(peice, movedirections.sliderPieces.rookMovements, opponentColor);
            } else if (pieceType.includes("Queen")) {
                moves = validMovesSlider(peice, movedirections.sliderPieces.queenMovements, opponentColor);
            } else if (pieceType.includes("King")) {
                moves = validMovesStepper(peice, movedirections.stepPieces.kingMovements);
            }

    }

}


function getPawnMoves(moves, row, col, pointerSquare, x) {
    // foroward moves
    // x is 1 or -1 depending on direction positive for black negative for white 
    if(row === 1 & ((bitboard >> BigInt(pointerSquare - 16*x)) & 1n) === 0n & ((allWhitePiecesbitboard >> BigInt(pointerSquare -8)) & 1n) === 0n){
    moves.push(-16*x)
    }
    if(((bitboard >> BigInt(pointerSquare -8*x)) & 1n) === 0n){
    moves.push(-8*x)
    }
    // makes sure the piece is not edge hopping
    if(((bitboard >> BigInt(pointerSquare - 9*x)) & 1n) !== 0n& col - 1 > 0 ){
    moves.push(-9*x)
    }
    if(((bitboard >> BigInt(pointerSquare - 7*x)) & 1n) !== 0n & col + 1 < 8){
    moves.push(-7*x)
    }

    // en pusant
    if(((bitboard >> BigInt(pointerSquare + 1*x)) & 1n) !== 0n & col + 1 < 8){
    moves.push(-7*x)
    }
    if(((bitboard >> BigInt(pointerSquare - 1*x)) & 1n) !== 0n & col - 1 > 0){
    moves.push(-9*x)
    }
    return moves
}

getPawnMoves(moves, row, col, 1)