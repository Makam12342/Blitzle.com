function isInCheck(color) {

    const enemyPieces = color === 'white' ? piecesPosition.blackPieces : piecesPosition.whitePieces;
    const kingIndex = (color === 'white' ? hexToSquares(piecesPosition.whitePieces.whiteKing) : hexToSquares(piecesPosition.blackPieces.blackKing))[0];

    //loops through each atacking peice type
    for (let i = 0; i < 6; i++){
        const pieceType = Object.keys(enemyPieces)[i];
        const bitboard = enemyPieces[pieceType];
        const pieceIndices = hexToSquares(bitboard); // creates a list of all the pieces 

        for (const index of pieceIndices) {
            let moves = [];

            if (pieceType.includes("Queen")) {
                moves = validMovesSlider(index, movedirections.sliderPieces.queenMovements, color !== "white"); // oposing color
            } else if (pieceType.includes("Rook")) {
                moves = validMovesSlider(index, movedirections.sliderPieces.rookMovements, color !== "white");
            } else if (pieceType.includes("Bishop")) {
                moves = validMovesSlider(index, movedirections.sliderPieces.bishopMovements, color !== "white");
            } else if (pieceType.includes("Knight")) {
                const knightMoves = [];
                const col = index % 8;
                if(col + 1 < 8) knightMoves.push(index + 17, index - 15);
                if(col - 1 >= 0) knightMoves.push(index + 15, index - 17);
                if(col + 2 < 8) knightMoves.push(index + 10, index - 6);
                if(col - 2 >= 0) knightMoves.push(index + 6, index - 10);
                moves = validMovesStepper(index, knightMoves);
            } else if (pieceType.includes("Pawn")) {
                const pawnDir = color === "white" ? -1 : 1;
                const row = Math.floor(index / 8);
                const col = index % 8;
                if (col + 1 < 8) moves.push(index + pawnDir * 9);
                if (col - 1 >= 0) moves.push(index + pawnDir * 7);
            } else if (pieceType.includes("King")) {
                moves = validMovesStepper(index, movedirections.stepPieces.kingMovements);
            }
            if (moves.includes(kingIndex)) return true;
        }
    }
    return false;
}


function isCheckmate(color) {
    const pieceSet = color === "white" ? piecesPosition.whitePieces : piecesPosition.blackPieces;
    const keys = Object.keys(pieceSet);

    for (let i = 0; i < keys.length; i++) {
        const pieceKey = keys[i];
        const pieceBoard = pieceSet[pieceKey];
        const pieceIndices = hexToSquares(pieceBoard);

        for (const fromSquare of pieceIndices) {
            let possibleMoves = [];

            if (pieceKey.includes("Queen")) {
                possibleMoves = validMovesSlider(fromSquare, movedirections.sliderPieces.queenMovements, color === "white");
            } else if (pieceKey.includes("Rook")) {
                possibleMoves = validMovesSlider(fromSquare, movedirections.sliderPieces.rookMovements, color === "white");
            } else if (pieceKey.includes("Bishop")) {
                possibleMoves = validMovesSlider(fromSquare, movedirections.sliderPieces.bishopMovements, color === "white");
            } else if (pieceKey.includes("King")) {
                possibleMoves = validMovesStepper(fromSquare, movedirections.stepPieces.kingMovements);
            } else if (pieceKey.includes("Knight")) {
                const knightMoves = [];
                const col = fromSquare % 8;
                if(col + 1 < 8) knightMoves.push(fromSquare + 17, fromSquare - 15);
                if(col - 1 >= 0) knightMoves.push(fromSquare + 15, fromSquare - 17);
                if(col + 2 < 8) knightMoves.push(fromSquare + 10, fromSquare - 6);
                if(col - 2 >= 0) knightMoves.push(fromSquare + 6, fromSquare - 10);
                possibleMoves = validMovesStepper(fromSquare, knightMoves);
            } else if (pieceKey.includes("Pawn")) {
                const direction = color === "white" ? 1 : -1;
                const row = Math.floor(fromSquare / 8);
                const col = fromSquare % 8;
                const forwardOne = fromSquare + direction * 8;
                const forwardTwo = fromSquare + direction * 16;

                // Only allow forward if empty
                const blockers = color === "white" ? allWhitePiecesBitboard | allBlackPiecesBitboard : allWhitePiecesBitboard | allBlackPiecesBitboard;
                if (((blockers >> BigInt(forwardOne)) & 1n) === 0n) possibleMoves.push(forwardOne);
                if ((color === "white" && row === 1 || color === "black" && row === 6) && ((blockers >> BigInt(forwardTwo)) & 1n) === 0n) possibleMoves.push(forwardTwo);

                // Captures
                const captureLeft = fromSquare + direction * 7;
                const captureRight = fromSquare + direction * 9;
                if (col > 0) possibleMoves.push(captureLeft);
                if (col < 7) possibleMoves.push(captureRight);
            }

            // Test each possible move for legality
            for (const toSquare of possibleMoves) {
                // Simulate move
                const tempPieces = JSON.parse(JSON.stringify(piecesPosition));
                tempPieces[color + "Pieces"][pieceKey] &= ~(1n << BigInt(fromSquare));
                tempPieces[color + "Pieces"][pieceKey] |=  (1n << BigInt(toSquare));

                const originalPos = piecesPosition[color + "Pieces"];
                piecesPosition[color + "Pieces"] = tempPieces[color + "Pieces"];

                const stillInCheck = isInCheck(color);

                // Restore position
                piecesPosition[color + "Pieces"] = originalPos;

                if (!stillInCheck) return false; // At least one legal move
            }
        }
    }

    return true;
}