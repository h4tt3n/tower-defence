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

    start menu
    game state
    enemy wave spawn function
    object pool for all game entities
    explosion class
    player controls object
    economy
    game sound & music
    colored energy bar over turrets
    better turret target AI - "leading the target"
    gameEntity inverse mass
    gameEntity collision restitution and friction
    projectile trails 
    place turrets with mouse
    use hi-res textures
    screen HUD showing: num ducks left, time to next wave, caps left
    enemy ballistic targeting
    different types of enemies w. different abilities
    physical object base class, for GameEntity, Camera, Explosion, Projectile ets.

*/


/* 
************************************************************************************
    IMPORTS
************************************************************************************
*/

// Classes
import Vector from './classes/vector.js'
import PhysicalObject from './classes/physicalObject.js'
import GameEntity from './classes/gameEntity.js'
import Camera from './classes/camera.js'
import Tower from './classes/turret.js'
import Enemy from './classes/enemy.js'
import Projectile from './classes/projectile.js'
import Explosion from './classes/explosion.js'

// Functions
import { rnd, getRandomInt } from './functions/math.js'
import { collisionDetectionBetween, collisionDetectionAmong} from './functions/collision.js'


/* 
***********************************************************************************
    GLOBAL CONSTANTS
************************************************************************************
*/

// Global Constants
const DT = 1.0 / 60;      // Timestep, delta-time
const FPS = DT * 1000;    // Framerate
const CAMERA_SPEED = 10.0;
const NUM_ENEMIES = 1000;
const NUM_TOWERS = 100;
const NUM_PROJECTILES = 2000;
const BUILD_TIME = 30 * 1000; // Base buildup time

const gameState = {
    isRunning: true,
    playerLost: false,
    playerWon: false,
    playerCaps: 1000,
}

Object.freeze(gameState);

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

const wallTextureList = [
    './assets/gfx/wall/slice03_03.png'
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
const doodads = [];
const walls = [];
const explosions = [];

// Graphics
const doodadTextures = [];
const groundTextures = [];
const towerTextures = [];
const enemyTextures = [];
const wallTextures = [];

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
    Digit6 : false,
    selectionKeyPressed: false
};

// Global vars
let canvas = null;      // Canvas
let ctx = null;         // Context
let camera = null;      // Camera


/* 
************************************************************************************
    RUN GAME
************************************************************************************
*/

initGame();

/* 
************************************************************************************
    GAME MANAGEMENT FUNCTIONS
************************************************************************************
*/

function initGame(){
    
    // Canvas
    canvas = document.querySelector("#gameCanvas");
    canvas.setAttribute('width', window.innerWidth);
    canvas.setAttribute('height', window.innerHeight);

    // Context
    ctx = canvas.getContext("2d");
    
    // Camera
    camera = new Camera(0.0, 0.0, 0.0);

    // Load graphics assets
    loadTextureListIntoArray(towerTextureList, towerTextures);
    loadTextureListIntoArray(enemyTextureList, enemyTextures);
    loadTextureListIntoArray(groundTextureList, groundTextures);
    loadTextureListIntoArray(doodadTextureList, doodadTextures);
    loadTextureListIntoArray(wallTextureList, wallTextures);

    // Load sound assets
    loadSoundListIntoArray(sfxList, sfx);
    loadSoundListIntoArray(musicList, music);

    // Events
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    createLandscape();
    createDoodads(worldBlocks);
    createProjectiles(projectiles, NUM_PROJECTILES);
    createTowers(towers, NUM_TOWERS);
    createEnemies(enemies, NUM_ENEMIES);
    createWalls(walls, 100);
    createExplosions(explosions, 100);

    spawnExplosion(-200, 0, 0, 0, 2000, 1000);

    setInterval(spawnWaveofEnemies, 30000);

    setInterval(gameLoop, FPS);

    let v = new Vector();
    let p = new PhysicalObject(1, 2, 3, 4, 5, 6, 7, 8, 9);
    let g = new GameEntity(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11)
    let e = new Enemy(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14)

    console.log(p);
    console.log(g);
    console.log(e);
    console.log(v instanceof Vector);

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
    if(gameKeyState.Digit6 === true && gameKeyState.selectionKeyPressed === false ){ spawnTower(6, camera.position) };

    updateState();
    
    requestAnimationFrame(renderScene);
};

function updateState(){

    camera.updateState();

    worldBlocks.forEach(t => t.updatePhysics());
    towers.forEach(t => t.updatePhysics());
    enemies.forEach(t => t.updatePhysics());
    walls.forEach(t => t.updatePhysics());

    towers.forEach(t => t.updateState(enemies, projectiles));
    enemies.forEach(e => e.updateState(towers, enemies, walls));
    projectiles.forEach(p => p.updateState());
    explosions.forEach(e => e.updateState());

    enemyProjectileCollisionDetection();

    collisionDetectionBetween(towers, worldBlocks);
    collisionDetectionBetween(enemies, worldBlocks);
    collisionDetectionBetween(walls, worldBlocks);
    collisionDetectionBetween(walls, enemies);
    collisionDetectionBetween(walls, towers);

    collisionDetectionAmong(walls);
    collisionDetectionAmong(towers);
};

/* 
************************************************************************************
    ENTITY CREATION
************************************************************************************
*/


function createLandscape(){

    let block = null;

    block = new GameEntity(     0,  1000, 0, 0, 20000, 3000, -1, 0, 0, 1, null ); worldBlocks.push(block);
    block = new GameEntity( 14000,  1500, 0, 0,  8000, 2000, -1, 0, 0, 1, null ); worldBlocks.push(block);
    block = new GameEntity( 22000,  2000, 0, 0,  8000, 1000, -1, 0, 0, 1, null ); worldBlocks.push(block);

    block = new GameEntity( 12000,  -700, 0, 0,  2000,  500, -1, 0, 0, 1, null ); worldBlocks.push(block);
    block = new GameEntity( 20000,  -200, 0, 0,  2000,  500, -1, 0, 0, 1, null ); worldBlocks.push(block);
}

function createProjectiles(projectileArray, numProjectiles){

    for(let i = 0; i < numProjectiles; i++){

        let projectile = new Projectile(0, 0, 0, 0);
        projectileArray.push(projectile);
    }
};

function createTowers(towerArray, numTowers){

    for(let i = 0; i < numTowers; i++){

        let tower = new Tower( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null, 0, 0, 0, 0, 0, 0 );
        towerArray.push(tower);
    }
};

function createEnemies(enemyArray, numEnemies){

    for(let i = 0; i < numEnemies; i++){
        
        let enemy = new Enemy( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null, 0, 0, 0);

        enemyArray.push(enemy);
    }
};

function createWalls(wallArray, numWalls){

    for(let i = 0; i < numWalls; i++){
        
        let wall = new GameEntity( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null );

        wallArray.push(wall);
    }
};

function createExplosions(explosionArray, numExplosions){

    for(let i = 0; i < numExplosions; i++){

        let explosion = new Explosion(0, 0, 0, 0, 0, 0);
        explosionArray.push(explosion);
    }
};

function createDoodads(worldBlocks){

    
    for(let i = 0; i < worldBlocks.length; i++ ){

        let numDoodads = worldBlocks[i].size.x * 0.004;

        for(let j = 0; j < numDoodads; j++ )
        {
            let sizeX = getRandomInt(80, 240);
            let sizeY = getRandomInt(sizeX * 1.5, sizeX * 3.5);
            let posX = getRandomInt(
                worldBlocks[i].position.x - worldBlocks[i].size.x, 
                worldBlocks[i].position.x + worldBlocks[i].size.x);
            let posY = (worldBlocks[i].position.y - worldBlocks[i].size.y) - sizeY * 0.5;
    
            let texture = getRandomInt(0, doodadTextures.length-1);
            
            let doodad = new GameEntity(posX, posY, 0, 0, sizeX, sizeY, -1, 0, 0, 1, texture );
            doodads.push(doodad);
        }

    };
};

function spawnWaveofEnemies(){

    for(let i = 0; i < 50; i++){
        
        let enemy = enemies.find(value => !value.isAlive());

        if(enemy === undefined){ continue };

        enemy.maxHitPoints = getRandomInt(50, 300);
        enemy.hitPoints = enemy.maxHitPoints;
        enemy.texture = getRandomInt(0, enemyTextureList.length-1);
        enemy.restVelocity = getRandomInt(300, 500);
        enemy.position.x = getRandomInt(-9000, -8000);
        enemy.position.y = getRandomInt(-1500, -2000);
        enemy.velocity.x = 0.0;
        enemy.velocity.y = 0.0;
        
        let size = getRandomInt(50, 100);

        enemy.size.x = size * 0.5;;
        enemy.size.y = size * 0.5;;
        enemy.inverseMass = 1.0 / (enemy.size.x * enemy.size.y);
        enemy.friction = 0.0;
        enemy.restitution = 1.0;
        enemy.explosionRangeSquared = 500**2;
        enemy.explosionDamage = 100;
    }
};

function spawnExplosion(posX, posY, velX, velY, lifeTime, strength){
    
    let explosion = explosions.find(value => !value.isAlive());

    if(explosion === undefined){ return };

    explosion.position.x = posX;
    explosion.position.y = posY;
    explosion.velocity.x = velX;
    explosion.velocity.y = velY;
    explosion.lifeTime = lifeTime;
    explosion.strength = strength;
    explosion.radius = 0.0;
}

function spawnTower(towerEnum, pos){
    
    gameKeyState.selectionKeyPressed = true;

    switch(towerEnum) {
        
        // Heavy tank, long range, hi armor, hi dmg, slow cooldown
        case 1: {
            
            let tower = towers.find(value => !value.isAlive());

            if(tower === undefined){ break };
            
            tower.maxHitPoints = 600;
            tower.hitPoints = tower.maxHitPoints;
            tower.minRangeSquared = 1000 ** 2;
            tower.maxRangeSquared = 8000 ** 2;
            tower.coolDownTime = 3000;
            tower.numProjectiles = 1;
            tower.projectileDamage = 200;
            tower.projectileVelocity = 5000;
            tower.texture = 0;
            tower.position.x = pos.x;
            tower.position.y = pos.y;
            tower.velocity.x = 0.0;
            tower.velocity.y = 0.0;
            tower.size.x = 300 * 0.5;
            tower.size.y = 200 * 0.5;
            tower.inverseMass = tower.computeInverseMass(0);
            tower.friction = 0.9;
            tower.restitution = 0.1;


            break;
        };
        
        // Shotgun tank, short range, med armor, hi dmg, slow cooldown
        case 2: {

            let tower = towers.find(value => !value.isAlive());

            if(tower === undefined){ break };

            tower.maxHitPoints = 300;
            tower.hitPoints = tower.maxHitPoints;
            tower.minRangeSquared = 100 ** 2;
            tower.maxRangeSquared = 3000 ** 2;
            tower.coolDownTime = 5000;
            tower.numProjectiles = 20;
            tower.projectileDamage = 10;
            tower.projectileVelocity = 1000;
            tower.texture = 1;
            tower.position.x = pos.x;
            tower.position.y = pos.y;
            tower.velocity.x = 0.0;
            tower.velocity.y = 0.0;
            tower.size.x = 200 * 0.5;
            tower.size.y = 160 * 0.5;
            tower.inverseMass = tower.computeInverseMass(0);
            tower.friction = 0.8;
            tower.restitution = 0.2;

            break;
        };

        // Medium tank, medium range, med armor, med dmg, med cooldown
        case 3: {

            let tower = towers.find(value => !value.isAlive());

            if(tower === undefined){ break };

            tower.maxHitPoints = 250;
            tower.hitPoints = tower.maxHitPoints;
            tower.minRangeSquared = 500 ** 2;
            tower.maxRangeSquared = 3000 ** 2;
            tower.coolDownTime = 2000;
            tower.numProjectiles = 1;
            tower.projectileDamage = 100;
            tower.projectileVelocity = 2000;
            tower.texture = 2;
            tower.position.x = pos.x;
            tower.position.y = pos.y;
            tower.velocity.x = 0.0;
            tower.velocity.y = 0.0;
            tower.size.x = 180 * 0.5;
            tower.size.y = 150 * 0.5;
            tower.inverseMass = tower.computeInverseMass(0);
            tower.friction = 0.7;
            tower.restitution = 0.3;

            break;
        };

        // Tiny tank, very short cooldown
        case 4: {

            let tower = towers.find(value => !value.isAlive());

            if(tower === undefined){ break };

            tower.maxHitPoints = 100;
            tower.hitPoints = tower.maxHitPoints;
            tower.minRangeSquared = 0 ** 2;
            tower.maxRangeSquared = 2000 ** 2;
            tower.coolDownTime = 50;
            tower.numProjectiles = 1;
            tower.projectileDamage = 1;
            tower.projectileVelocity = 3000;
            tower.texture = 3;
            tower.position.x = pos.x;
            tower.position.y = pos.y;
            tower.velocity.x = 0.0;
            tower.velocity.y = 0.0;
            tower.size.x = 150 * 0.5;
            tower.size.y = 120 * 0.5;
            tower.inverseMass = tower.computeInverseMass(0);
            tower.friction = 0.6;
            tower.restitution = 0.4;

            break;
        };

        // small tank
        case 5: {

            let tower = towers.find(value => !value.isAlive());

            if(tower === undefined){ break };

            tower.maxHitPoints = 200;
            tower.hitPoints = tower.maxHitPoints;
            tower.minRangeSquared = 100 ** 2;
            tower.maxRangeSquared = 2000 ** 2;
            tower.coolDownTime = 1000;
            tower.numProjectiles = 1;
            tower.projectileDamage = 50;
            tower.projectileVelocity = 2000;
            tower.texture = 4;
            tower.position.x = pos.x;
            tower.position.y = pos.y;
            tower.velocity.x = 0.0;
            tower.velocity.y = 0.0;
            tower.size.x = 150 * 0.5;
            tower.size.y = 120 * 0.5;
            tower.inverseMass = tower.computeInverseMass(0);
            tower.friction = 0.5;
            tower.restitution = 0.5;

            break;
        };

        case 6: {

            let wall = walls.find(value => !value.isAlive());

            if(wall === undefined){ break };

            wall.maxHitPoints = 500;
            wall.hitPoints = wall.maxHitPoints;
            wall.texture = 0;
            wall.position.x = pos.x;
            wall.position.y = pos.y;
            wall.velocity.x = 0.0;
            wall.velocity.y = 0.0;
            wall.size.x = 250 * 0.5;
            wall.size.y = 250 * 0.5;
            wall.inverseMass = wall.computeInverseMass(0);
            wall.friction = 0.8;
            wall.restitution = 0.3;

            break;

        };
    }
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

            if ((Math.abs(rx) > enemies[e].size.x) || (Math.abs(ry) > enemies[e].size.y) ) { continue; }

            enemies[e].hitPoints -= projectiles[p].damage;

            projectiles[p].lifeTime = 0;

            spawnExplosion(projectiles[p].position.x, projectiles[p].position.y, 0, 0, 500, 0);
        }
    }
}


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
    my_gradient.addColorStop(0, "#bbccee");
    my_gradient.addColorStop(1, "#6677aa");
    ctx.fillStyle = my_gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    renderGameEntities(doodads, doodadTextures);
    renderGameEntities(walls, wallTextures);
    renderGameEntities(towers, towerTextures);
    renderGameEntities(enemies, enemyTextures);
    renderGameEntities(worldBlocks, []);

    renderProjectiles();
    renderExplosions();

    ctx.resetTransform();
    let numLiveDucks = enemies.filter(e => e.isAlive()).length;
    ctx.font = '24px serif';
    ctx.fillStyle = "#000000";
    ctx.fillText(`Enemies left: ${numLiveDucks}`, 40, 40);
    ctx.fillText(`Next wave in:`, canvas.width - 600, 40);
    ctx.fillText(`Caps:`, canvas.width - 200, 40);

};

function renderGameEntities(array, textureArray){

    for(let i = 0; i < array.length; i++){
        
        if( !array[i].isAlive()) { continue };

        var img = textureArray[array[i].texture];
        var x = ( array[i].position.x - camera.position.x ) * camera.zoom + canvas.width * 0.5;
        var y = ( array[i].position.y - camera.position.y ) * camera.zoom + canvas.height * 0.5;
        ctx.setTransform(camera.zoom, 0, 0, camera.zoom, x, y);
        
        if( img === null || img === undefined ){

            var my_gradient = ctx.createLinearGradient(0, -array[i].size.y, 0, array[i].size.y);
            my_gradient.addColorStop(0, "#ffffff"); // ccddff
            my_gradient.addColorStop(1 - (array[i].size.y / (array[i].size.y + 20)), "#ffffff");
            my_gradient.addColorStop(1 - (array[i].size.y / (array[i].size.y + 80)), "#886655");
            my_gradient.addColorStop(1, "#886655");
            ctx.fillStyle = my_gradient;

            ctx.fillRect(-array[i].size.x, -array[i].size.y, array[i].size.x * 2, array[i].size.y * 2);
        } 
        else {

            ctx.drawImage(img, -array[i].size.x, -array[i].size.y, array[i].size.x * 2, array[i].size.y * 2);
        }
    }
};

function renderProjectiles(){
    
    for(let i = 0; i < projectiles.length; i++){

        if( !projectiles[i].isAlive()) { continue };
        
        var x = ( projectiles[i].position.x - camera.position.x ) * camera.zoom + canvas.width * 0.5;
        var y = ( projectiles[i].position.y - camera.position.y ) * camera.zoom + canvas.height * 0.5;
        ctx.setTransform(camera.zoom, 0, 0, camera.zoom, x, y);
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#444444";
        ctx.fill();
        ctx.closePath();
    }
};

function renderExplosions(){
    
    for(let i = 0; i < explosions.length; i++){

        if( !explosions[i].isAlive()) { continue };
        
        var x = ( explosions[i].position.x - camera.position.x ) * camera.zoom + canvas.width * 0.5;
        var y = ( explosions[i].position.y - camera.position.y ) * camera.zoom + canvas.height * 0.5;
        ctx.setTransform(camera.zoom, 0, 0, camera.zoom, x, y);

        var alpha = (explosions[i].lifeTime / 2000.0);
        console.log(alpha);

        var rdl = ctx.createRadialGradient(0, 0, 0, 0, 0, explosions[i].radius);
        rdl.addColorStop(0.0, 'rgba(255, 255, 255, 0)');
        rdl.addColorStop(0.9, 'rgba(255, 255, 255, 0)');
        rdl.addColorStop(1.0, `rgba(255, 255, 255, ${alpha})`);
    
        ctx.beginPath();
        ctx.fillStyle = rdl;
        ctx.arc(0, 0, explosions[i].radius, 0, Math.PI * 2);
        ctx.fill();
    }
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
        case 'Digit6': gameKeyState.Digit6 = true; break;
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
        case 'Digit6': gameKeyState.Digit6 = false; break;
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