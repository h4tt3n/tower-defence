import constants from './consts.js'
import Vector from './vector.js'

import { rnd, getRandomInt } from './classes/math.js'

export default class Explosion {
    constructor(posX, posY, radius, lifeTime, strength){
        this.posX = posX;
        this.posY = posY;
        this.radius = radius;
        this.lifeTime = lifeTime;
        this.strength = strength;
    }
    isAlive(){
        this.lifeTime > 0.0;
    }
    updateState(){
        this.lifeTime -= constants.DT;
    }
    start(){
        
    }

}