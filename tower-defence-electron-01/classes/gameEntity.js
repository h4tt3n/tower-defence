import PhysicalObject from './physicalObject.js';

export default class GameEntity extends PhysicalObject{
    constructor(posX, posY, velX, velY, sizeX, sizeY, mass, friction, restitution, 
                hitPoints, texture){
        super(posX, posY, velX, velY, sizeX, sizeY, mass, friction, restitution);
        this.maxHitPoints = hitPoints;
        this.hitPoints = hitPoints;
        this.texture = texture;
    }
    isAlive(){
        return this.hitPoints > 0;
    }
    updatePhysics(){

        if( !this.isAlive()) { return };

        super.updatePhysics();
    }
};