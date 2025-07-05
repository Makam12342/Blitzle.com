const blackCanCastleQueenSide = false
const blackCanCastleKingSide = false
const whiteCanCastleQueenSide = false
const whiteCanCastleKingSide = false

function canCastle(){

    // Black Queenside
    blackCanCastleQueenSide = true
    if ((allWhitePiecesBitboard >> BigInt(1)) & 1n){
        blackCanCastleQueenSide = false
        
    }
    else if ((allWhitePiecesBitboard >> BigInt(2)) & 1n){
        blackCanCastleQueenSide = false
    }
    else if ((allWhitePiecesBitboard >> BigInt(3)) & 1n){
        blackCanCastleQueenSide = false
    }
    else if ((piecesPosition.blackPieces.blackKing >> BigInt(4)) & 0n){
        blackCanCastleQueenSide = false
    }
    else if ((piecesPosition.blackPieces.blackRook >> BigInt(0)) & 0n){
        blackCanCastleQueenSide = false
    } else {
        blackCanCastleQueenSide = true
    }

}