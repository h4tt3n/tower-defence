import constants from './consts.js'
import Vector from './vector.js'

export default class GameEntity {
    constructor(hitPoints, texture, posX, posY, sizeX, sizeY){
        this.maxHitPoints = hitPoints;
        this.hitPoints = hitPoints;
        this.texture = texture;
        this.position = new Vector(posX, posY);
        this.velocity = new Vector(0.0, 0.0);
        this.size = new Vector(sizeX * 0.5, sizeY * 0.5);
        this.inverseMass = 0.0; //1.0 / (this.size.x * this.size.y);
        this.friction = 0.0;
        this.restitution = 0.0;

    }
    isAlive(){
        return this.hitPoints > 0;
    }
    updatePhysics(){

        if( !this.isAlive()) { return };

        if( !this.inverseMass == 0 ){ 
            
            this.velocity.y += constants.GRAVITY

            this.position.x += this.velocity.x * constants.DT;
            this.position.y += this.velocity.y * constants.DT;
        };
    }
};