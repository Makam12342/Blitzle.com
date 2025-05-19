function sliderPieces(location, movelist) {
    let validMoves = []
    for(let i = 0; i < movelist.length; i++){ // gose through all of the diferent moves 
        for(let j = 0; j < 7; j++){ //loops through the maxamium distance a [piece can move depending on the square
            if(location + j*movelist[i] < 64){
                validMoves.push(location + j*movelist[i])
            }
        }
    }
}



 function validMoves(pieceLocation, moveList) {
        return moveList
            for(let i = 0; i < 7; i++){
                .map(offset => pieceLocation + offset*i)
                .filter(target => target >= 0 && target < 64);
                //.filter(target => target )
            }
    }


    function validMovesSlider(pieceLoacation, movelist)
{
    
}