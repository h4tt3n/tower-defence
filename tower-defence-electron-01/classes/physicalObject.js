import constants from './consts.js'
import Vector from './vector.js'

export default class PhysicalObject {
    constructor(posX, posY, velX, velY, sizeX, sizeY, mass, friction, restitution){
        this.position = new Vector(posX, posY);
        this.velocity = new Vector(velX, velY);
        this.size = new Vector(sizeX * 0.5, sizeY * 0.5);
        this.friction = friction;
        this.restitution = restitution;
        this.inverseMass = this.computeInverseMass(mass);
    }
    computeInverseMass(mass) {
        
        if( mass > 0.0 ){

            return 1.0 / mass;
        }
        else if( mass <= 0.0 ){
            return 0.0;
        }
        else {

            let area = this.size.x * 2.0 * this.size.y * 2.0;
            return area > 0.0 ? 1.0 / area : 0.0;
        }
    }
    updatePhysics(){
        
        if( !this.inverseMass == 0.0 ){ 
            
            this.velocity.y += constants.GRAVITY

            this.position.x += this.velocity.x * constants.DT;
            this.position.y += this.velocity.y * constants.DT;
        };
    }
};