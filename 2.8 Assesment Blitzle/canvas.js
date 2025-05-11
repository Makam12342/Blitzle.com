const config = { //  Configures the canvas 

    type: Phaser.AUTO,
    width: 600,
    height: 600,
    backgroundColor: '#4488aa',
    parent: "chessCanvas",
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

const game = new Phaser.Game(config);

function preload() {

}

function create() {

    const rows = 8;
    const cols = 8;
    for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        if((row+col) % 2 === 0 ){
            const rect = this.add.rectangle(col * 75 + 37.5, row * 75 + 37.5, 75, 75, 0x0000ff);
        }        
    }
}
        




    

}

function update() {

}


