// Board
let board;
// let boardWidth = 360; //pixels
// let boardHeight = 640;
let boardWidth = 1080; //pixels
let boardHeight = 640;
let context; //used for drawing in the canvas

// Bird / bert
let bertWidth = 55;
let bertHeight = 55;
let bertX = boardWidth / 8;
let bertY = boardHeight / 2;
//let bertImg;
let bertImgs = [];
let bertImgsIndex = 0;

let bert = {
    x : bertX,
    y : bertY,
    width : bertWidth,
    height : bertHeight
}

//pipes  
let pipeArray = [];
let pipeWidth = 64; //pixels - pipe ratio   width/height 384/3072  equivalent to 1/8
let pipeHeight = 512; 
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// coins
let coinWidth = 80;
let coinHeight = 80;
let coinImg;

let coin = {
    x : 10,
    y : 5,
    width : coinWidth,
    height : coinHeight
}

// Game physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0;  //bert jump speed
let gravity = 0.4;  // gravity

// Game Variables
let gameOver = false;
let score = 0;

// Game Sounds
let wingSound = new Audio("./sounds/sfx_wing.wav");
let collisionSound = new Audio("./sounds/sfx_hit.wav");
let backgroundMusic = new Audio("./sounds/bgm_mario.mp3");
backgroundMusic.loop = true; //play music on repeat

window.onload = function() {
    //board = document.getElementById("board");
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    // //draw bert
    // context.fillStyle = "green";
    // context.fillRect(bert.x, bert.y, bert.width, bert.height);

    //load images
    // bertImg = new Image();
    // bertImg.src = "./img/flappybert.png";
    // //birdImg.onload = function() {
    //     context.drawImage(bertImg, bert.x, bert.y, bert.width, bert.height);
    // //}

    //load bert img animation
    for (let i = 0; i < 2; i++) {  //3 is the total number of imgs used in the animation
    //for (let i = 0; i < 4; i++) {  //4 is the total number of imgs used in the animation
        let bertImg = new Image();
        //bertImg.src = `./img/bertAnimation/flappybird${i}.png`;
        bertImg.src = `./img/bertAnimation/flappybert${i}.png`;
        bertImgs.push(bertImg);
    }

    topPipeImg = new Image();
    //topPipeImg.src = "./img/toppipe.png";
    topPipeImg.src = "./img/top-lamp.png";
    bottomPipeImg = new Image();
    //bottomPipeImg.src = "./../bottompipe.png";
    bottomPipeImg.src = "./img/bottom-coffee-mug-tower.png";
    
    coinImg = new Image();
    coinImg.src = "./img/bert_buck.png";
    


    requestAnimationFrame(update);
    // create pipes on board ever 1.5 secs
    setInterval(placePipes, 1500);
    //set bert animation to be 1/10 of a sec
    setInterval(animateBert, 100);
    // event listener for jumping using key
    document.addEventListener("keydown", jumpBert);

}

//update the animation
function update() {
    requestAnimationFrame(update);
    //Stop updating screen if its game over
    if (gameOver) {
        return;
    }

    //clear previous frame
    context.clearRect(0, 0, board.width, board.height);

    //draw bert
    velocityY += gravity; //implement gravity
    // bert.y += velocityY;  no limit for the canvas when jumping
    bert.y = Math.max(bert.y + velocityY, -40); //apply gravity to current bert.y, limit the bert.y top of the canvas
    //context.drawImage(bertImg, bert.x, bert.y, bert.width, bert.height);
    context.drawImage(bertImgs[bertImgsIndex], bert.x, bert.y, bert.width, bert.height);
    // bertImgsIndex++; //increment to next frame
    // bertImgsIndex %= bertImgs.length; // circle back with modulus, max frame is 4
    // // 0 1 2 3 0 1 2 3 0 1 2 3.....

    // if bert goes under or above the canvas's height , its game over
    if (bert.y > boardHeight || bert.y < -30) {
        gameOver = true;
    }

    //draw pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;

        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        //if bert passed the pipe, increase the score
        if (!pipe.passed && bert.x > pipe.x + pipe.width) {
            score += 0.5;  //since it passes 2 pipes at a time it would be 1 point per pass
            pipe.passed = true;
        }

        //detect collision and end game
        if (detectCollision(bert, pipe)) {
            collisionSound.play();
            gameOver = true;
        }
    }

    //clear pipes passed that are off the canvas
    while (pipeArray.length > 0 && pipeArray[0].x < - pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //draw Score
    context.fillStyle = "white";  //font color
    context.font = "55px sans-serif"; //font size and type
    context.fillText(score, 105, 63); //variable with text, position on canvas x, y

    // draw coin
    context.drawImage(coinImg, coin.x, coin.y, coin.width, coin.height);
    
    // game over message
    if (gameOver) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;  //reset music from the start
        context.fillText("GAME OVER", 360, 65); //variable with text, position on canvas x, y
    }
}

function animateBert() {
    bertImgsIndex++; //increment to next frame
    bertImgsIndex %= bertImgs.length; // circle back with modulus, max frame is 4
    // // 0 1 2 3 0 1 2 3 0 1 2 3.....
}


function placePipes() {
    //Stop if its game over
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight/4 - (Math.random() * pipeHeight / 2);
    let openingSpace = board.height/4; //space between top and bottom pipes

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }

    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }

    pipeArray.push(bottomPipe);

}

// param e , is the key press event
function jumpBert(e) {

    //key press is space or arrowUp or "X"
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {

        // Game music
        if (backgroundMusic.paused) {
            backgroundMusic.play();
        }
        
        // play sound
        wingSound.play();

        // jump
        velocityY = -6;

        // reset game
        if (gameOver) {
            bert.y = bertY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }

    
}

//create 2 rectangles comparing the positions and detecting the collision between the bert and the pipe
function detectCollision(bertRect, pipeRect) {
    return bertRect.x < pipeRect.x + pipeRect.width &&
           bertRect.x + bertRect.width > pipeRect.x &&
           bertRect.y < pipeRect.y + pipeRect.height &&
           bertRect.y + bertRect.height > pipeRect.y;
}