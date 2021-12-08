/*
    
    TOWER DEFENCE
    DUCK-RACE HOLIDAY SPECIAL

    A 2D side-scrolling tower defence game
    By Michael Schmidt Nissen, december 2021

    Created with Visual Studio Code
    Written in JavaScript and HTML5 Canvas

    Controls:
    WASD / arrow keys to move camera aound
    Q-E to zoom
    TAB to see next tower

    Game mechanics:
    Duck horde goes left to right
    If duck horde reaches right border, game is lost
    If duck horde is destroyed, game is won
    Turrets shoot ducks with projectiles
    Ducks explode on impact with turrets, damaging them
    Warning! Exploding ducks will throw neighbouring ducks in all directions!


    TODOS:

    game state
    enemy waves
    object pool for all game entities (now only for bullets)
    enemy explosion damage
    explosion class
    physical entity base class
    player controls function
    economy
    game sound & music

*/



/* 
************************************************************************************
    GLOBAL CONSTANTS
************************************************************************************
*/

// Global Constants
const DT = 1.0 / 60;      // Timestep, delta-time
const FPS = DT * 1000;    // Framerate
const GRAVITY = 2;
const CAMERA_SPEED = 10.0;
const NUM_ENEMIES = 500;
const NUM_PROJECTILES = 2000;
const BUILD_TIME = 10 * 0; // Base buildup time
const NUM_CAPS = 1000;
const NUM_DOODADS = 400;

const gameState = {
    isRunning: true,
    playerWon: false
}

const doodadTextureList = [
    './assets/gfx/doodads/tree02.png',
    './assets/gfx/doodads/tree03.png',
    './assets/gfx/doodads/tree04.png',
    './assets/gfx/doodads/tree10.png',
    './assets/gfx/doodads/tree11.png',
    './assets/gfx/doodads/tree12.png',
    './assets/gfx/doodads/tree15.png',
    './assets/gfx/doodads/tree20.png',
    './assets/gfx/doodads/tree21.png',
    './assets/gfx/doodads/tree22.png'
];

const groundTextureList = [
    './assets/gfx/ground/grassMid.png'
];

const towerTextureList = [
    './assets/gfx/tower/tanks_tankNavy1.png',
    './assets/gfx/tower/tanks_tankNavy2.png',
    './assets/gfx/tower/tanks_tankNavy3.png',
    './assets/gfx/tower/tanks_tankNavy4.png',
    './assets/gfx/tower/tanks_tankNavy5.png'
];

const enemyTextureList = [
    './assets/gfx/enemy/duck_yellow.png',
    './assets/gfx/enemy/duck_brown.png',
    './assets/gfx/enemy/duck_white.png'
];

const sfxList = [
];

const musicList = [
];

// Containers

// Game entities
const worldBlocks = [];
const enemies = [];
const towers = [];
const projectiles = [];
const dooDads = [];

// Graphics
const doodadTextures = [];
const groundTextures = [];
const towerTextures = [];
const enemyTextures = [];

// Sound
const sfx = [];
const music = [];

// Keyboard input
const gameKeyState = {
    ArrowUp : false,
    ArrowDown : false,
    ArrowLeft : false,
    ArrowRight : false,
    KeyQ : false,
    KeyW : false,
    KeyE : false,
    KeyA : false,
    KeyS : false,
    KeyD : false,
    KeyZ : false,
    KeyX : false,
    KeyC : false,
    Space : false,
    KeyH : false,
    Digit1 : false,
    Digit2 : false,
    Digit3 : false,
    Digit4 : false,
    Digit5 : false,
    selectionKeyPressed: false
};

// Global vars
let canvas = null;      // Canvas
let ctx = null;         // Context
let camera = null;      // Camera


/* 
************************************************************************************
    CLASSES
************************************************************************************
*/

class Vector {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
};

class Camera {
    constructor(posX, posY, zoom){
        this.position = new Vector(posX, posY);
        this.restPosition = new Vector(posX, posY);
        this.zoom = zoom;
        this.maxZoom = 0.8;
        this.minZoom = 0.2;
        this.deltaPan = 0.1;
        this.deltaZoom = 0.1;
        this.zoomSpeed = 0.01;
        this.restZoom = 0.5;
    }
    updateState(){

        this.position.x += ( this.restPosition.x - this.position.x ) * this.deltaPan;
        this.position.y += ( this.restPosition.y - this.position.y ) * this.deltaPan;
        
        if(this.restZoom > this.maxZoom) {this.restZoom = this.maxZoom};
        if(this.restZoom < this.minZoom) {this.restZoom = this.minZoom};

        this.zoom += ( this.restZoom - this.zoom ) * this.deltaZoom;
    }
};

class GameEntity {
    constructor(hitPoints, posX, posY, sizeX, sizeY){
        this.maxHitPoints = hitPoints;
        this.hitPoints = hitPoints;
        this.position = new Vector(posX, posY);
        this.velocity = new Vector(0.0, 0.0);
        this.size = new Vector(sizeX, sizeY);
        this.image = null;
        this.sound = null;
    }
    isAlive(){
        return this.hitPoints > 0;
    }
};

class DooDad {
    constructor(posX, posY, sizeX, sizeY, texture){
        this.position = new Vector(posX, posY);
        this.size = new Vector(sizeX, sizeY);
        this.texture = texture;
    }
};

class WorldBlock extends GameEntity {
    constructor(hitPoints, posX, posY, sizeX, sizeY){
        super(hitPoints, posX, posY, sizeX, sizeY);
    }
};

class Tower extends GameEntity {
    constructor(hitPoints, minRange, maxRange, coolDownTime, numProjectiles, damage, vel, texture, posX, posY, sizeX, sizeY){
        super(hitPoints, posX, posY, sizeX, sizeY);
        this.target = null;
        this.coolDownTime = coolDownTime;
        this.canFire = true;
        this.numProjectiles = numProjectiles;
        this.projectileDamage = damage;
        this.projectileVelocity = vel;
        this.minRangeSquared = minRange**2;
        this.maxRangeSquared = maxRange**2;
        this.image = texture;
    }
    updateState(){

        if( !this.isAlive()) { return };

        this.velocity.y += GRAVITY;

        this.position.x += this.velocity.x * DT;
        this.position.y += this.velocity.y * DT;

        this.selectTarget();
        this.fireProjectile(this.target);
    }
    selectTarget(){

        this.target = null;

        let invDistSquaredEnemy = 0.0;

        for(var i = 0; i < enemies.length; i++){
            
            if( !enemies[i].isAlive()) { continue };

            let dVec = new Vector(
                this.position.x - enemies[i].position.x,
                this.position.y - enemies[i].position.y);
            
            let distSquaredTemp = (dVec.x * dVec.x + dVec.y * dVec.y );

            if( distSquaredTemp < this.minRangeSquared || distSquaredTemp > this.maxRangeSquared) { continue }

            let invDistSquaredTemp = 1.0 / (dVec.x * dVec.x + dVec.y * dVec.y );
            
            if( invDistSquaredEnemy < invDistSquaredTemp ){
                invDistSquaredEnemy = invDistSquaredTemp;
                this.target = enemies[i];
            }
        }
    }
    fireProjectile(target){

        if( !this.canFire || this.target == null ) { return }

        for(let i = 0; i < this.numProjectiles; i++)
        {
            let dstVec = new Vector(
                target.position.x - this.position.x,
                target.position.y - this.position.y);
            
            let dstSqd = (dstVec.x * dstVec.x + dstVec.y * dstVec.y );
            
            let dst = Math.sqrt(dstSqd);
    
            let nVec = new Vector( dstVec.x / dst, dstVec.y / dst );
    
            let projectile = projectiles.find(firstAvaliable);
                
            function firstAvaliable(value) {
                return value.isAlive() === false;
            }
    
            projectile.lifeTime = 5000;
            projectile.damage = this.projectileDamage;
            projectile.position.x = this.position.x;
            projectile.position.y = this.position.y;
    
            //let velocity = 2000; //getRandomInt(1900, 2100);

            let rnd1 = (Math.random() - Math.random()) * 0.08;
            let rnd2 = (Math.random() - Math.random()) * 0.08;

            projectile.velocity.x = this.projectileVelocity * (nVec.x + rnd1);
            projectile.velocity.y = this.projectileVelocity * (nVec.y + rnd2);
        }

        this.canFire = false;
        setTimeout(() => this.canFire = true, this.coolDownTime);
    }
};

class Enemy extends GameEntity {
    constructor(hitPoints, restVelocity, posX, posY, sizeX, sizeY){
        super(hitPoints, posX, posY, sizeX, sizeY);
        this.restVelocity = restVelocity; // TODO: Make random
        this.explosionRangeSquared = 500**2; // TODO: Make random
        this.explosionDamage = 100.0; // TODO: Make random
        this.image = getRandomInt(0, enemyTextureList.length-1);
    }
    updateState(){
        
        if( !this.isAlive()) { return };
        
        this.velocity.x += ( this.restVelocity - this.velocity.x) * 0.01;
        this.velocity.y += GRAVITY;

        this.position.x += this.velocity.x * DT;
        this.position.y += this.velocity.y * DT;

        this.selectTarget();
    }
    selectTarget(){

        if( !this.isAlive()) { return };

        let invDistSquaredTower = 1.0 / (200**2);

        for(var i = 0; i < towers.length; i++){

            if( !towers[i].isAlive()) { continue };
            
            let dVec = new Vector(
                this.position.x - towers[i].position.x,
                this.position.y - towers[i].position.y);
            
            let invDistSquaredTemp = 1.0 / (dVec.x * dVec.x + dVec.y * dVec.y );
            
            if( invDistSquaredTower < invDistSquaredTemp ){
                
                this.explode();
            }
        }
    }
    explode(){

        for(var i = 0; i < towers.length; i++){

            if( !towers[i].isAlive()) { continue };

            let dVec = new Vector(
                this.position.x - towers[i].position.x,
                this.position.y - towers[i].position.y);
            
            let distSquared = (dVec.x * dVec.x + dVec.y * dVec.y );

            if( this.explosionRangeSquared > distSquared ){

                let damage = this.explosionDamage * ( distSquared / this.explosionRangeSquared );
                
                towers[i].hitPoints -= damage;

                //console.log('tower', i, 'takes', damage, 'damage!');
            }
        }

        this.hitPoints = 0;

        for(var i = 0; i < enemies.length; i++){

            if( !enemies[i].isAlive()) { continue };

            let dVec = new Vector(
                this.position.x - enemies[i].position.x,
                this.position.y - enemies[i].position.y);
            
            let distSquared = (dVec.x * dVec.x + dVec.y * dVec.y );

            if( this.explosionRangeSquared > distSquared ){

                //let damage = this.explosionDamage * ( distSquared / this.explosionRangeSquared );

                enemies[i].velocity.x -= (dVec.x / distSquared) * 100000;
                enemies[i].velocity.y -= (dVec.y / distSquared) * 100000;
                
            }
        }

        
    }
};

class Projectile {
    constructor(posX, posY, lifeTime, damage ){
        this.position = new Vector(posX, posY);
        this.velocity = new Vector(0.0, 0.0);
        this.lifeTime = lifeTime;
        this.damage = damage;
    }
    updateState(){

        if( !this.isAlive()) { return };

        this.velocity.y += GRAVITY;

        this.position.x += this.velocity.x * DT
        this.position.y += this.velocity.y * DT;
        
        if( this.isAlive() ) { this.lifeTime -= DT * 1000 };
    }
    isAlive(){
        return this.lifeTime > 0;
    }
};

class Explosion {

}



/* 
************************************************************************************
    RUN GAME
************************************************************************************
*/


initGame();
setInterval(gameLoop, FPS); // TODO: fix framerate


/* 
************************************************************************************
    GAME MANAGEMENT FUNCTIONS
************************************************************************************
*/

function initGame(){
    
    // Canvas
    canvas = document.querySelector("#gameCanvas");
    canvas.setAttribute('width', window.innerWidth * 0.95);
    canvas.setAttribute('height', window.innerHeight * 0.9);

    // Context
    ctx = canvas.getContext("2d");
    
    // Camera
    camera = new Camera(0.0, 0.0, 1.0);

    // Load graphics assets
    loadTextureListIntoArray(towerTextureList, towerTextures);
    loadTextureListIntoArray(enemyTextureList, enemyTextures);
    loadTextureListIntoArray(groundTextureList, groundTextures);
    loadTextureListIntoArray(doodadTextureList, doodadTextures);

    // Load sound assets
    loadSoundListIntoArray(sfxList, sfx);
    loadSoundListIntoArray(musicList, music);

    // Events
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    createLandscape();
    createDoodads();
    createProjectiles();
    setTimeout(createEnemies, BUILD_TIME);

};

function gameLoop(){

    if(gameKeyState.KeyA === true || gameKeyState.ArrowLeft === true){ camera.restPosition.x -= CAMERA_SPEED * 1.0 / camera.zoom };
    if(gameKeyState.KeyD === true || gameKeyState.ArrowRight === true){ camera.restPosition.x += CAMERA_SPEED * 1.0 / camera.zoom };
    if(gameKeyState.KeyW === true || gameKeyState.ArrowUp === true){ camera.restPosition.y -= CAMERA_SPEED * 1.0 / camera.zoom };
    if(gameKeyState.KeyS === true || gameKeyState.ArrowDown === true){ camera.restPosition.y += CAMERA_SPEED * 1.0 / camera.zoom };
    if(gameKeyState.KeyQ === true){ camera.restZoom -= camera.zoomSpeed * camera.zoom };
    if(gameKeyState.KeyE === true){ camera.restZoom += camera.zoomSpeed * camera.zoom };

    if(gameKeyState.Digit1 === true && gameKeyState.selectionKeyPressed === false ){ spawnTower(1, camera.position) };
    if(gameKeyState.Digit2 === true && gameKeyState.selectionKeyPressed === false ){ spawnTower(2, camera.position) };
    if(gameKeyState.Digit3 === true && gameKeyState.selectionKeyPressed === false ){ spawnTower(3, camera.position) };
    if(gameKeyState.Digit4 === true && gameKeyState.selectionKeyPressed === false ){ spawnTower(4, camera.position) };
    if(gameKeyState.Digit5 === true && gameKeyState.selectionKeyPressed === false ){ spawnTower(5, camera.position) };



    updateState();
    
    requestAnimationFrame(renderScene);

};

function updateState(){

    camera.updateState();

    towers.forEach(t => t.updateState());
    enemies.forEach(e => e.updateState());
    projectiles.forEach(p => p.updateState());

    enemyProjectileCollisionDetection();

    collisionDetection(towers, worldBlocks);
    collisionDetection(enemies, worldBlocks);
};


/* 
************************************************************************************
    ENTITY CREATION
************************************************************************************
*/


function createLandscape(){

    let block = null;
    
    // // Ground level
    // block = new WorldBlock(0, 0, 5000, 100000, 10000); worldBlocks.push(block);

    // // Cliff roofs
    // block = new WorldBlock(0, 0, -400.0, 1000, 200); worldBlocks.push(block);
    // block = new WorldBlock(0, 0, -800.0, 300, 600); worldBlocks.push(block);

    //     // Cliff roofs
    // block = new WorldBlock(0, 1500, -500.0, 1000, 200); worldBlocks.push(block);
    // block = new WorldBlock(0, 1500, -1000.0, 300, 800); worldBlocks.push(block);

    block = new WorldBlock(0, 0, 100, 20000, 200); worldBlocks.push(block);
    block = new WorldBlock(0, -10000, -2000, 20000, 100); worldBlocks.push(block);
    block = new WorldBlock(0,      0,     0, 20000, 100); worldBlocks.push(block);
}

function createProjectiles(){

    for(let i = 0; i < NUM_PROJECTILES; i++){

        let projectile = new Projectile(0, 0, 0, 0);

        projectiles.push(projectile);
    }
};

function createEnemies(){

    for(let i = 0; i < NUM_ENEMIES; i++){
        
        let hitPoints = getRandomInt(50, 300);
        let restVelocity = getRandomInt(100, 500);
        let positionX = getRandomInt(-10000, -20000);
        let positionY = getRandomInt(-50, -2000);
        let size = getRandomInt(50, 100);
        
        let enemy = new Enemy(hitPoints, restVelocity, positionX, positionY, size, size);

        enemies.push(enemy);
    }
};

function createDoodads(){

    for(let i = 0; i < NUM_DOODADS; i++ )
    {
        let sizeX = getRandomInt(80, 160);
        let sizeY = getRandomInt(sizeX * 1.5, sizeX * 3.5);
        let posX = getRandomInt(-50000, 50000);
        let posY = -sizeY * 0.5;

        let texture = getRandomInt(0, doodadTextures.length-1);
        
        
        let doodad = new DooDad(posX, posY, sizeX, sizeY, texture);
        dooDads.push(doodad);
    }

};

function spawnTower(towerEnum, pos){
    
    gameKeyState.selectionKeyPressed = true;

    switch(towerEnum) {
        // Heavy tank, long range, hi armor, hi dmg, slow cooldown
        case 1: {
            let hitPoints = 600;
            let minRange = 1000;
            let maxRange = 8000;
            let coolDownTime = 3000;
            let numProjectiles = 1;
            let damage = 200;
            let vel = 5000;
            let texture = 0;
            let sizeX = 300;
            let sizeY = 200;
            let price = 100;

            let tower = new Tower(hitPoints, minRange, maxRange, coolDownTime, numProjectiles, damage, vel, texture, pos.x, pos.y, sizeX, sizeY)

            towers.push(tower);

            break;
        };
        // Shotgun tank, short range, med armor, hi dmg, slow cooldown
        case 2: {
            let hitPoints = 300;
            let minRange = 100;
            let maxRange = 3000;
            let coolDownTime = 5000;
            let numProjectiles = 10;
            let damage = 20;
            let vel = 1000;
            let texture = 1;
            let sizeX = 200;
            let sizeY = 160;
            let price = 300;

            let tower = new Tower(hitPoints, minRange, maxRange, coolDownTime, numProjectiles, damage, vel, texture, pos.x, pos.y, sizeX, sizeY)

            towers.push(tower);

            break;
        };
        // Medium tank, medium range, med armor, med dmg, med cooldown
        case 3: {
            let hitPoints = 250;
            let minRange = 500;
            let maxRange = 3000;
            let coolDownTime = 2000;
            let numProjectiles = 1;
            let damage = 100;
            let vel = 2000;
            let texture = 2;
            let sizeX = 180;
            let sizeY = 150;
            let price = 300;

            let tower = new Tower(hitPoints, minRange, maxRange, coolDownTime, numProjectiles, damage, vel, texture, pos.x, pos.y, sizeX, sizeY)

            towers.push(tower);

            break;
        };
        // Tiny tank, very short cooldown
        case 4: {
            let hitPoints = 100;
            let minRange = 0;
            let maxRange = 2000;
            let coolDownTime = 100;
            let numProjectiles = 1;
            let damage = 1;
            let vel = 3000;
            let texture = 3;
            let sizeX = 150;
            let sizeY = 120;
            let price = 300;

            let tower = new Tower(hitPoints, minRange, maxRange, coolDownTime, numProjectiles, damage, vel, texture, pos.x, pos.y, sizeX, sizeY)

            towers.push(tower);

            break;
        };
        // small tank
        case 5: {
            let hitPoints = 200;
            let minRange = 100;
            let maxRange = 2000;
            let coolDownTime = 1000;
            let numProjectiles = 1;
            let damage = 50;
            let vel = 2000;
            let texture = 4;
            let sizeX = 150;
            let sizeY = 120;
            let price = 300;

            let tower = new Tower(hitPoints, minRange, maxRange, coolDownTime, numProjectiles, damage, vel, texture, pos.x, pos.y, sizeX, sizeY)

            towers.push(tower);

            break;
        };
    }
    
    //console.log('tower spawned!');
};


/* 
************************************************************************************
    PHYSICS FUNCTIONS
************************************************************************************
*/

function enemyProjectileCollisionDetection(){

    for(let e = 0; e < enemies.length; e++){

        if( !enemies[e].isAlive() ) { continue }
    
        for(let p = 0; p < projectiles.length; p++){

            if( !projectiles[p].isAlive()) { continue };

            let rx = projectiles[p].position.x - enemies[e].position.x;
            let ry = projectiles[p].position.y - enemies[e].position.y;

            if ((Math.abs(rx) > enemies[e].size.x) || (Math.abs(ry) > enemies[e].size.y) ) { continue; } // Works

            enemies[e].hitPoints -= projectiles[p].damage;

            if( !enemies[e].isAlive ){ enemies[e].explode(); }

            //console.log('hit!');

            projectiles[p].lifeTime = 0;

            continue;
        }
    }
}

function collisionDetection(arrayA, arrayB){
    
    for(let t = 0; t < arrayA.length; t++){

        if( !arrayA[t].isAlive() ) { continue }

        for(var b = 0; b < arrayB.length; b++){

            let tAB = {
                top: arrayA[t].position.y - arrayA[t].size.y * 0.5,
                btm: arrayA[t].position.y + arrayA[t].size.y * 0.5,
                lft: arrayA[t].position.x - arrayA[t].size.x * 0.5,
                rgt: arrayA[t].position.x + arrayA[t].size.x * 0.5
            };

            let bAB = {
                top: arrayB[b].position.y - arrayB[b].size.y * 0.5,
                btm: arrayB[b].position.y + arrayB[b].size.y * 0.5,
                lft: arrayB[b].position.x - arrayB[b].size.x * 0.5,
                rgt: arrayB[b].position.x + arrayB[b].size.x * 0.5
            };

            if( !( tAB.lft > bAB.rgt || tAB.rgt < bAB.lft || tAB.btm < bAB.top || tAB.top > bAB.btm )){

                let distX = arrayA[t].position.x - arrayB[b].position.x;
                let distY = arrayA[t].position.y - arrayB[b].position.y;
                
                let intersectX = Math.abs(distX) - ( arrayA[t].size.x * 0.5 + arrayB[b].size.x * 0.5 );
                let intersectY = Math.abs(distY) - ( arrayA[t].size.y * 0.5 + arrayB[b].size.y * 0.5 );

                if( intersectX >  intersectY ){

                    arrayA[t].position.x -= Math.sign(distX) * intersectX;
                    arrayA[t].velocity.x = -arrayA[t].velocity.x;
                    
                } else {

                    arrayA[t].position.y -= Math.sign(distY) * intersectY;
                    arrayA[t].velocity.y = -arrayA[t].velocity.y;
                }
            };
        }
    }
};


/* 
************************************************************************************
    RENDER FUNCTIONS
************************************************************************************
*/


function renderScene(){

    // Reset
    ctx.resetTransform();

    // Clear screen
    var my_gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    my_gradient.addColorStop(0, "#99bbff");
    my_gradient.addColorStop(1, "#335599");
    ctx.fillStyle = my_gradient;
    //ctx.fillStyle = "#88aaff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //ctx.fillStyle = "#222222";
    //ctx.fillText("Press 'Z' to see controls", 50, 50);

    //
    renderDoodads();
    renderProjectiles();
    renderEnemies();
    renderTowers();
    renderWorldBlocks();
};

function renderWorldBlocks(){

    for(let i = 0; i < worldBlocks.length; i++){
        ctx.fillStyle = "#886655";
        var x = ( worldBlocks[i].position.x - camera.position.x ) * camera.zoom + canvas.width * 0.5;
        var y = ( worldBlocks[i].position.y - camera.position.y ) * camera.zoom + canvas.height * 0.5;
        ctx.setTransform(camera.zoom, 0, 0, camera.zoom, x, y);
        ctx.fillRect(-worldBlocks[i].size.x * 0.5, -worldBlocks[i].size.y * 0.5, worldBlocks[i].size.x, worldBlocks[i].size.y);
    }
};

function renderTowers(){
    
    for(let i = 0; i < towers.length; i++){

        if( !towers[i].isAlive()) { continue };
        
        var img = towerTextures[towers[i].image];
        var x = ( towers[i].position.x - camera.position.x ) * camera.zoom + canvas.width * 0.5;
        var y = ( towers[i].position.y - camera.position.y ) * camera.zoom + canvas.height * 0.5;
        ctx.setTransform(camera.zoom, 0, 0, camera.zoom, x, y);
        //ctx.fillStyle = "#88dd88";
        //ctx.fillRect(-towers[i].size.x * 0.5, -towers[i].size.y * 0.5, towers[i].size.x, towers[i].size.y);
        ctx.drawImage(img, -towers[i].size.x * 0.5, -towers[i].size.y * 0.5, towers[i].size.x, towers[i].size.y);
    }
};

function renderEnemies(){
    
    for(let i = 0; i < enemies.length; i++){

        if( !enemies[i].isAlive()) { continue };
        
        var img = enemyTextures[enemies[i].image];
        var x = ( enemies[i].position.x - camera.position.x ) * camera.zoom + canvas.width * 0.5;
        var y = ( enemies[i].position.y - camera.position.y ) * camera.zoom + canvas.height * 0.5;
        ctx.setTransform(camera.zoom, 0, 0, camera.zoom, x, y);
        //eectx.fillStyle = "#dd8888";
        //ctx.fillRect(-enemies[i].size.x * 0.5, -enemies[i].size.y * 0.5, enemies[i].size.x, enemies[i].size.y);
        ctx.drawImage(img, -enemies[i].size.x * 0.5, -enemies[i].size.y * 0.5, enemies[i].size.x, enemies[i].size.y);
    }
};

function renderProjectiles(){
    
    for(let i = 0; i < projectiles.length; i++){

        if( !projectiles[i].isAlive()) { continue };
        
        //var img = enemyTextures[enemies[i].image];
        var x = ( projectiles[i].position.x - camera.position.x ) * camera.zoom + canvas.width * 0.5;
        var y = ( projectiles[i].position.y - camera.position.y ) * camera.zoom + canvas.height * 0.5;
        ctx.setTransform(camera.zoom, 0, 0, camera.zoom, x, y);
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.closePath();

        //ctx.drawImage(img, -enemies[i].size.x * 0.5, -enemies[i].size.y * 0.5, enemies[i].size.x, enemies[i].size.y);
    }
};

function renderDoodads(){
    
    for(let i = 0; i < dooDads.length; i++){
        
        var img = doodadTextures[dooDads[i].texture];
        var x = ( dooDads[i].position.x - camera.position.x ) * camera.zoom + canvas.width * 0.5;
        var y = ( dooDads[i].position.y - camera.position.y ) * camera.zoom + canvas.height * 0.5;
        ctx.setTransform(camera.zoom, 0, 0, camera.zoom, x, y);
        //eectx.fillStyle = "#dd8888";
        //ctx.fillRect(-enemies[i].size.x * 0.5, -enemies[i].size.y * 0.5, enemies[i].size.x, enemies[i].size.y);
        ctx.drawImage(img, -dooDads[i].size.x * 0.5, -dooDads[i].size.y * 0.5, dooDads[i].size.x, dooDads[i].size.y);
    }
};

function rnd(min,max) {
    return Math.random() * (max ? (max-min) : min) + (max ? min : 0) 
};

function getRandomInt(min, max) {
     //max and min inclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
};

function loadTextureListIntoArray(list, array) {
    list.forEach(entry => {
        var img = new Image();
        img.src = entry;
        array.push(img);
    });
};

function loadSoundListIntoArray(list, array) {
    list.forEach(entry => {
        var sfx = new Audio();
        sfx.src = entry;
        array.push(sfx);
    });
};


/* 
************************************************************************************
    CONTROLS FUNCTIONS
************************************************************************************
*/


function keyDown(e){

    switch(e.code) {
        case 'Digit1': gameKeyState.Digit1 = true; break;
        case 'Digit2': gameKeyState.Digit2 = true; break;
        case 'Digit3': gameKeyState.Digit3 = true; break;
        case 'Digit4': gameKeyState.Digit4 = true; break;
        case 'Digit5': gameKeyState.Digit5 = true; break;
        case 'KeyQ': gameKeyState.KeyQ = true; break;
        case 'KeyW': gameKeyState.KeyW = true; break;
        case 'KeyE': gameKeyState.KeyE = true; break;
        case 'KeyA': gameKeyState.KeyA = true; break;
        case 'KeyS': gameKeyState.KeyS = true; break;
        case 'KeyD': gameKeyState.KeyD = true; break;
        case 'KeyZ': gameKeyState.KeyZ = true; break;
        case 'KeyX': gameKeyState.KeyX = true; break;
        case 'KeyC': gameKeyState.KeyC = true; break;
        case 'KeyH': gameKeyState.KeyH = true; break;
        case 'Space': gameKeyState.Space = true; break;
        case 'ArrowUp': gameKeyState.ArrowUp = true; break;
        case 'ArrowDown': gameKeyState.ArrowDown = true; break;
        case 'ArrowLeft': gameKeyState.ArrowLeft = true; break;
        case 'ArrowRight': gameKeyState.ArrowRight = true; break;
    }
};

function keyUp(e){

    gameKeyState.selectionKeyPressed = false;
    
    switch(e.code) {
        case 'Digit1': gameKeyState.Digit1 = false; break;
        case 'Digit2': gameKeyState.Digit2 = false; break;
        case 'Digit3': gameKeyState.Digit3 = false; break;
        case 'Digit4': gameKeyState.Digit4 = false; break;
        case 'Digit5': gameKeyState.Digit5 = false; break;
        case 'KeyQ': gameKeyState.KeyQ = false; break;
        case 'KeyW': gameKeyState.KeyW = false; break;
        case 'KeyE': gameKeyState.KeyE = false; break;
        case 'KeyA': gameKeyState.KeyA = false; break;
        case 'KeyS': gameKeyState.KeyS = false; break;
        case 'KeyD': gameKeyState.KeyD = false; break;
        case 'KeyZ': gameKeyState.KeyZ = false; break;
        case 'KeyX': gameKeyState.KeyX = false; break;
        case 'KeyC': gameKeyState.KeyC = false; break;
        case 'KeyH': gameKeyState.KeyH = false; break;
        case 'Space': gameKeyState.Space = false; break;
        case 'ArrowUp': gameKeyState.ArrowUp = false; break;
        case 'ArrowDown': gameKeyState.ArrowDown = false; break;
        case 'ArrowLeft': gameKeyState.ArrowLeft = false; break;
        case 'ArrowRight': gameKeyState.ArrowRight = false; break;
    }
};