var AM = new AssetManager();

function Animation(spriteSheet, srcX, srcY, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale, correctionsX, correctionsPos) {
    this.spriteSheet = spriteSheet;
    this.srcX = srcX;
    this.srcY = srcY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
    this.correctionsX = correctionsX;
    this.correctionsPos = correctionsPos;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, ent) {
    this.elapsedTime += tick;
    console.log(this);
    if (this.isDone()) {
        if (this.loop) {
            this.elapsedTime = this.elapsedTime - this.totalTime;
        } else if (ent.state < ent.trickArray.length) {
            ent.state++; //this is specific to this animation to iterate the trick list.
            this.elapsedTime = this.elapsedTime - this.totalTime;
            if((ent.state >= 3 && ent.altTrick)) {
                ent.state = 0;
                ent.x += 40;
            } else if (ent.state >= ent.trickArray.length) {
                ent.state = 0;
            }
            return;
        }
    }
    
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);
    var curcorrection = 0;
    if (this.correctionsX && this.correctionsX[xindex]) {
        // console.log('hurrrrr');
        curcorrection = this.correctionsX[xindex];
    }
    var curcorrectionY = 0;
    if (this.correctionsY && this.correctionsY[xindex]) {
        curcorrectionY = this.correctionsY[xindex];
    }
    var curCorrectionPos = curcorrection;
    if (this.correctionsPos && this.correctionsPos[xindex]) {
        curCorrectionPos = this.correctionsPos[xindex];
    }
    var correctedX = curcorrection < 0 ? x:x + Math.floor(curcorrection/2);
    console.log('frame: ', frame);
    ctx.drawImage(this.spriteSheet,
                 this.srcX + curcorrection + xindex * this.frameWidth, this.srcY + yindex * this.frameHeight,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 x + curCorrectionPos, y - curcorrectionY,
                 this.frameWidth * this.scale,
                 this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

// no inheritance
function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet,
                   this.x, this.y, 800, 450);
};

Background.prototype.update = function () {
};


// inheritance 
function Ness(game, spritesheet) {
    var frameRate = .075;
    this.animation = new Animation(spritesheet, 155, 70, 56, 110, 8, frameRate, 8, true, 1.5, {1:2, 2:3, 3:0, 4:6, 5:7, 6:6, 7:8});
    this.animationChargeDown = new Animation(spritesheet, 190, 240, 160, 110, 3, frameRate, 3, false, 1.5);
    this.animationChargeUp = new Animation(spritesheet, 200, 545, 175, 80, 3, frameRate, 3, false, 1.5);
    var yoUpCorrection = {1:-15, 3:-20, 4:-30, 5:-35, 6:-60, 7:-60, 8:-30, 9:-30, 10:10, 11:10};
    var yoUpCorrectionPos = {5:-25, 7:-35, 8:-50, 9:-35, 10: -15};
    this.animationYoUp = new Animation(spritesheet, 35, 683, 150, 125, 12, frameRate, 12, false, 1.5, yoUpCorrection, yoUpCorrectionPos);
    var yoUpCorrectionY = {};
    for (var i = 0; i < this.animationYoUp.frames; i++) {
        yoUpCorrectionY[i] = 62;
    }
    this.animationYoUp.correctionsY = yoUpCorrectionY;
    var yoCorrection = {3:-18, 4:-25, 5:-20, 6:20, 7:20, 8:10};
    var yoCorrectionPos = {0:30, 1:35, 2:40, 3:10, 4:30, 5:40, 6:30, 7:30, 8:20, 9:20};
    this.animationYo = new Animation(spritesheet, 112, 390, 150, 110, 10, frameRate, 10, false, 1.5, yoCorrection, yoCorrectionPos);
    this.speed = 275;
    this.state = 0;
    this.startTricking = false;
    this.altTrick = false;
    this.trickCycle = 0;
    this.trickArray = [this.animation, this.animationChargeDown, this.animationYo, this.animationChargeUp, this.animationYoUp];
    this.ctx = game.ctx;
    Entity.call(this, game, 0, 260);
}

Ness.prototype = new Entity();
Ness.prototype.constructor = Ness;

Ness.prototype.update = function () {
    if (this.state === 0) {
        this.x += this.game.clockTick * this.speed;
    }
    if (this.x > 400 && !this.startTricking) {
        this.startTricking = true;
        if (this.altTrick) {
            this.state = 3;
            this.altTrick = false;
        } else {
            this.state = 1;
            this.altTrick = true;
            this.x -= 125;
        }

    }
    if (this.x > 800) {
        this.x = -230;
        this.startTricking = false;
    }
    Entity.prototype.update.call(this);
}


Ness.prototype.draw = function () {
    console.log(this.trickArray);
    this.trickArray[this.state].drawFrame(this.game.clockTick, this.ctx, this.x, this.y, this);
    Entity.prototype.draw.call(this);
}



AM.queueDownload("./img/scaledmoves.png");
AM.queueDownload("./img/background.jpg");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/background.jpg")));
    gameEngine.addEntity(new Ness(gameEngine, AM.getAsset("./img/scaledmoves.png")));

    console.log("All Done!");
});