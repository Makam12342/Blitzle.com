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
    
    for(let row; row < rows; row ++){
        for(let rows; rows < 8; rows ++){
            
    }
    }
        




    const rect = this.add.rectangle(400, 300, 200, 100, 0x0000ff);

}

function update() {

}


