var AM = new AssetManager();

function Animation(spriteSheet, srcX, srcY, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale, corrections) {
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
    this.corrections = corrections;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = this.elapsedTime - this.totalTime;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);
    var curcorrection = 0;
    if (this.corrections[xindex]) {
        // console.log('hurrrrr');
        curcorrection = this.corrections[xindex];
    }
    console.log('frame: ', frame);
    ctx.drawImage(this.spriteSheet,
                 this.srcX + curcorrection + xindex * this.frameWidth, this.srcY + yindex * this.frameHeight,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 x + curcorrection, y,
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
                   this.x, this.y);
};

Background.prototype.update = function () {
};


// inheritance 
function Ness(game, spritesheet) {
    this.animation = new Animation(spritesheet, 159, 50, 49, 75, 8, .1, 8, true, 1.5, {1:2, 2:2, 3:-10, 4:2, 5:5, 6:5});
    this.animationYo = new Animation
    this.speed = 150;
    this.ctx = game.ctx;
    Entity.call(this, game, 0, 195);
}

Ness.prototype = new Entity();
Ness.prototype.constructor = Ness;

Ness.prototype.update = function () {
    this.x += this.game.clockTick * this.speed;
    if (this.x > 800) this.x = -230;
    Entity.prototype.update.call(this);
}

Ness.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}



AM.queueDownload("./img/scaledwalk.png");
AM.queueDownload("./img/background.jpg");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/background.jpg")));
    gameEngine.addEntity(new Ness(gameEngine, AM.getAsset("./img/scaledwalk.png")));

    console.log("All Done!");
});