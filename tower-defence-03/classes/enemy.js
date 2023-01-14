
import constants from './consts.js'
import Vector from './vector.js'
import GameEntity from './gameEntity.js'

export default class Enemy extends GameEntity {
    constructor(hitPoints, texture, restVelocity, posX, posY, sizeX, sizeY){
        super(hitPoints, texture, posX, posY, sizeX, sizeY);
        this.restVelocity = restVelocity; // TODO: Make random
        this.explosionRangeSquared = 500**2; // TODO: Make random
        this.explosionDamage = 100.0; // TODO: Make random
    }
    updateState(towers, enemies){
        
        if( !this.isAlive()) { return };
        
        this.velocity.x += ( this.restVelocity - this.velocity.x) * 0.01;12354

        this.selectTarget(towers, enemies);
    }
    selectTarget(towers, enemies){

        if( !this.isAlive()) { return };

        let distSquaredTower = 200**2;

        for(var i = 0; i < towers.length; i++){

            if( !towers[i].isAlive()) { continue };
            
            let dVec = new Vector(
                this.position.x - towers[i].position.x,
                this.position.y - towers[i].position.y);
            
            let distSquaredTemp = dVec.x * dVec.x + dVec.y * dVec.y;
            
            if( distSquaredTower > distSquaredTemp ){
                
                this.explode(towers, enemies);
            }
        }
    }
    explode(towers, enemies){

        for(var i = 0; i < towers.length; i++){

            if( !towers[i].isAlive()) { continue };

            let dVec = new Vector(
                this.position.x - towers[i].position.x,
                this.position.y - towers[i].position.y);
            
            let distSquared = (dVec.x * dVec.x + dVec.y * dVec.y );

            if( this.explosionRangeSquared < distSquared ){ continue }

            let damage = this.explosionDamage * ( distSquared / this.explosionRangeSquared );
            
            towers[i].hitPoints -= damage;

            towers[i].velocity.x -= (dVec.x / distSquared) * towers[i].inverseMass * 100000000;
            towers[i].velocity.y -= (dVec.y / distSquared) * towers[i].inverseMass * 100000000;

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