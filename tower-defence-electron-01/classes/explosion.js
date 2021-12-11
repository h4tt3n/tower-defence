import constants from './consts.js'
import Vector from './vector.js'

//import { rnd, getRandomInt } from './classes/math.js'

export default class Explosion {
    constructor(posX, posY, velX, velY, lifeTime, strength){
        this.position = new Vector(posX, posY);
        this.velocity = new Vector(velX, velY);
        this.radius = 0.0;
        this.lifeTime = lifeTime;
        this.strength = strength;
    }
    isAlive(){
        return this.lifeTime > 0;
    }
    updateState(){
        
        if( this.isAlive() ) { this.lifeTime -= constants.DT * 1000 };

        this.position.x += this.velocity.x * constants.DT;
        this.position.y += this.velocity.y * constants.DT;

        this.radius += 5;
        
    }
    doDamageWithinRadius(entityArray){
        
        for(var i = 0; i < entityArray.length; i++){

            if( !entityArray[i].isAlive()) { continue };

            let dVec = new Vector(
                this.position.x - entityArray[i].position.x,
                this.position.y - entityArray[i].position.y);
            
            let distSquared = (dVec.x * dVec.x + dVec.y * dVec.y );

            if( this.explosionRangeSquared < distSquared ){ continue }

            let damage = this.explosionDamage * ( distSquared / this.explosionRangeSquared );
            
            entityArray[i].hitPoints -= damage;

            entityArray[i].velocity.x -= (dVec.x / distSquared) * entityArray[i].inverseMass * 100000000;
            entityArray[i].velocity.y -= (dVec.y / distSquared) * entityArray[i].inverseMass * 100000000;

        }
    }
}