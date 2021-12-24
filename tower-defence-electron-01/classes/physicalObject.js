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
        //this.isAlive = isAlive;
    }
    computeInverseMass(mass) {
        
        if( mass > 0.0 ){

            return 1.0 / mass;
        }
        else if( mass < 0.0 ){
            return 0.0;
        }
        else {

            let area = this.size.x * 2.0 * this.size.y * 2.0;
            let density = 0.01;
            let mass = area * density;

            return mass > 0.0 ? 1.0 / mass : 0.0;
        }
    }
    updatePhysics(){
        
        if( !this.inverseMass == 0 ){ 
            
            //this.velocity.y += constants.GRAVITY;

            this.velocity.add(new Vector(0, constants.GRAVITY));

            //this.velocity.add( new Vector(5,0)); // Works

            //this.position.x += this.velocity.x * constants.DT;
            //this.position.y += this.velocity.y * constants.DT;

            //let vel = new Vector(this.velocity.x, this.velocity.y);

            //this.position.add(vel.mul(constants.DT));  // Works
            this.position.add(this.velocity.mul(constants.DT)); // Doesn't work ?!?

        };
    }
};