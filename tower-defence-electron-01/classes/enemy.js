
import constants from './consts.js'
import Vector from './vector.js'
import GameEntity from './gameEntity.js'
import Explosion from './explosion.js';

export default class Enemy extends GameEntity {
    constructor(posX, posY, velX, velY, sizeX, sizeY, mass, friction, restitution, hitPoints, texture, 
                restVelocity, explosionRange, explosionDamage){
        super(posX, posY, velX, velY, sizeX, sizeY, mass, friction, restitution, hitPoints, texture);
        this.restVelocity = restVelocity; // TODO: Make random
        this.explosionRangeSquared = explosionRange**2; // TODO: Make random
        this.explosionDamage = explosionDamage; // TODO: Make random
    }
    updateState(towers, enemies, walls){
        
        if( !this.isAlive()) { return };
        
        this.velocity.x += ( this.restVelocity - this.velocity.x) * 0.01;

        this.selectTarget(towers, enemies, walls);
    }
    selectTarget(towers, enemies, walls){

        if( !this.isAlive()) { return };

        let distSquaredTower = 200**2;

        for(var i = 0; i < towers.length; i++){

            if( !towers[i].isAlive()) { continue };
            
            let dVec = new Vector(
                this.position.x - towers[i].position.x,
                this.position.y - towers[i].position.y);
            
            let distSquaredTemp = dVec.x * dVec.x + dVec.y * dVec.y;
            
            if( distSquaredTower > distSquaredTemp ){
                
                this.explode(towers, enemies, walls);
                //spawnExplosion(this.position.x, this.position.y)
            }
        }

        let distSquaredWall = 200**2;

        for(var i = 0; i < walls.length; i++){

            if( !walls[i].isAlive()) { continue };
            
            let dVec = new Vector(
                this.position.x - walls[i].position.x,
                this.position.y - walls[i].position.y);
            
            let distSquaredTemp = dVec.x * dVec.x + dVec.y * dVec.y;
            
            if( distSquaredWall > distSquaredTemp ){
                
                this.explode(towers, enemies, walls);
                //spawnExplosion(this.position.x, this.position.y)
            }
        }
    }
    explode(towers, enemies, walls){

        for(var i = 0; i < towers.length; i++){

            if( !towers[i].isAlive()) { continue };

            let dVec = new Vector(
                this.position.x - towers[i].position.x,
                this.position.y - towers[i].position.y);
            
            let distSquared = (dVec.x * dVec.x + dVec.y * dVec.y );

            if( this.explosionRangeSquared < distSquared ){ continue }

            let damage = this.explosionDamage * ( distSquared / this.explosionRangeSquared );
            
            console.log('tower explosion! Damage: ', damage);

            towers[i].hitPoints -= damage;

            towers[i].velocity.x -= (dVec.x / distSquared) * towers[i].inverseMass * 100000000;
            towers[i].velocity.y -= (dVec.y / distSquared) * towers[i].inverseMass * 100000000;

            console.log();

        }

        for(var i = 0; i < walls.length; i++){

            if( !walls[i].isAlive()) { continue };

            let dVec = new Vector(
                this.position.x - walls[i].position.x,
                this.position.y - walls[i].position.y);
            
            let distSquared = (dVec.x * dVec.x + dVec.y * dVec.y );

            if( this.explosionRangeSquared < distSquared ){ continue }

            let damage = this.explosionDamage * ( distSquared / this.explosionRangeSquared );
            
            console.log('wall explosion! Damage: ', damage);

            walls[i].hitPoints -= damage;

            walls[i].velocity.x -= (dVec.x / distSquared) * walls[i].inverseMass * 100000000;
            walls[i].velocity.y -= (dVec.y / distSquared) * walls[i].inverseMass * 100000000;

        }

        this.hitPoints = 0;

        for(var i = 0; i < enemies.length; i++){

            if( !enemies[i].isAlive()) { continue };

            let dVec = new Vector(
                this.position.x - enemies[i].position.x,
                this.position.y - enemies[i].position.y);
            
            let distSquared = (dVec.x * dVec.x + dVec.y * dVec.y );

            if( this.explosionRangeSquared < distSquared ){ continue }

            //let damage = this.explosionDamage * ( distSquared / this.explosionRangeSquared );

            enemies[i].velocity.x -= (dVec.x / distSquared) * enemies[i].inverseMass * 100000000;
            enemies[i].velocity.y -= (dVec.y / distSquared) * enemies[i].inverseMass * 100000000;
                
        }
    }
};