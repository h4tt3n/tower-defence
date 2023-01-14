
import Vector from './vector.js'
import constants from './consts.js'

export default class Projectile {
    constructor(posX, posY, lifeTime, damage ){
        this.position = new Vector(posX, posY);
        this.velocity = new Vector(0.0, 0.0);
        this.lifeTime = lifeTime;
        this.damage = damage;
    }
    updateState(){

        if( !this.isAlive()) { return };

        this.velocity.y += constants.GRAVITY;

        this.position.x += this.velocity.x * constants.DT
        this.position.y += this.velocity.y * constants.DT;
        
        if( this.isAlive() ) { this.lifeTime -= constants.DT * 1000 };
    }
    isAlive(){
        return this.lifeTime > 0;
    }
};