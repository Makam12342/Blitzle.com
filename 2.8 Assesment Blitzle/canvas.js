// bitboard b is the capturing pieces and bitboard b is a bitboard 
// like bishops or rooks of the oposing color that way if they are on the same square the bitboard will get updated to remove the captured piece therefore removing it 
function capturingPieces() {
for(let i = 0; i< 6; i++){
    if(turn = "white"){
        bitboardA = pieceBitboard.blackpieces[i]
    }else{
        bitboardA = pieceBitboard.whitepieces[i]
    }
    bitboardA = bitboardA &~ bitboardB
}
}
//inline this function


// this part of the code makes a bitboard combining each diferent piece type this will be utalised in the update function for captures and in the valid moves function to block pieces
allWhitePiecesBitboard = 0x0000000000000000
for(let i = 0; i < 6; i ++){
allwhitepiecesBitboard = whitepiecesBitboard | pieceBitboard.whitepieces[i]
}
//this section of code removes captured pieces 
if(turn = "white"){
        pieceBitboard.blackpieces[i] = pieceBitboard.blackpieces[i] %~ allwhitepiecesBitboard
    }else{
        pieceBitboard.whitepieces[i] = pieceBitboard.blackpieces[i] %~ allwhitepiecesBitboard
    }