
import Vector from './vector.js'

//
export default class Camera {
    constructor(posX, posY, zoom){
        this.position = new Vector(posX, posY);
        this.restPosition = new Vector(posX, posY);
        this.zoom = zoom;
        this.maxZoom = 1.0;
        this.minZoom = 0.1;
        this.deltaPan = 0.1;
        this.deltaZoom = 0.1;
        this.zoomSpeed = 0.01;
        this.restZoom = 0.5;
    }
    updateState(){

        this.position.x += ( this.restPosition.x - this.position.x ) * this.deltaPan;
        this.position.y += ( this.restPosition.y - this.position.y ) * this.deltaPan;

        // if(this.position.x < 0) {this.position.x = 0};
        // if(this.position.y < 0) {this.position.y = 0};
        // if(this.position.x > 1000) {this.position.x = 1000};
        // if(this.position.y > 1000) {this.position.y = 1000};
        
        if(this.restZoom > this.maxZoom) {this.restZoom = this.maxZoom};
        if(this.restZoom < this.minZoom) {this.restZoom = this.minZoom};

        this.zoom += ( this.restZoom - this.zoom ) * this.deltaZoom;

        // if(this.zoom > this.maxZoom) {this.zoom = this.maxZoom};
        // if(this.zoom < this.minZoom) {this.zoom = this.minZoom};
    }
};