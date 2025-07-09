const pieceValues = [ 3, 3, 5, 9, 1000000, 1]   

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
}


positionEvaluation(piecesPosition)