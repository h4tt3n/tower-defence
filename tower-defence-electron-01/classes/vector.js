// 2D vector class
export default class Vector {
    
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    //
    add(v){ 
        if (v instanceof Vector){

            return new Vector(this.x += v.x, this.y += v.y); 
        }
        else {

            return new Vector(this.x += v, this.y += v); 
        }
    }
    sub(v){ 
        if (v instanceof Vector){
            this.x - v.x; this.y -= v.y;
        }
        else {
            this.x -= v; this.y -= v;
        }

        return this;
    }
    mul(s){ 
        if (s instanceof Vector){
            return new Vector(this.x * s.x, this.y * s.y);
        }
        else {
            return new Vector(this.x * s, this.y * s);
        }
    }
    div(s){ 
        this.x /= s; this.y /= s; 

        return this;
    }

    //
    abs() { 
        return new Vector( Math.abs(this.x), Math.abs(this.y) ); 
    }
    angleFromUnitVector(n) { 
        return Math.atan2(n.y, n.x); 
    }
    component(v) { 
        return new Vector(this.x, this.y).mul(this.dot(v) / v.dot(v)); 
    }
    dot(v){ 
        if (v instanceof Vector){
            return this.x * v.x + this.y * v.y; 
        }
        else { 
            return new Vector(this.x * v, this.y * v); 
        }
    }
    length() { 
        return Math.sqrt(this.lengthSquared); 
    }
    lengthSquared() { 
        return this.dot(this);
    }
    normalised() { 
        return new Vector( this / this.Length() );
    }
    perp() { 
        return new Vector(-this.y, this.x); 
    }
    perpDot(v) { 
        if (v instanceof Vector){
            return this.x * v.y - this.y * v.x; 
        }
        else { 
            return new Vector(this.perp().x * v, this.perp().y * v); 
        }
    }
    project(v) { 
        return new Vector(this.x, this.y).mul(v.dot(this) / this.dot(this)); 
    }
    randomizeCircle(b) {	
        let a = Math.random() * 8.0 * Math.atan( 1.0 ); 
        let r = Math.sqrt( Math.random() * b * b ); 
        return new Vector( Math.cos( a ) * r, Math.sin( a ) * r ); 
    }
    randomizeSquare(b) { 
        return new Vector( ( Math.random() - Math.random() ) * b, ( Math.random() - Math.random() ) * b ); 
    }
    rotate(v) { 
        return new Vector(v.dot(this), v.perpDot(this));
    }
    unitVectorFromAngle(a) { 
        return new Vector(Math.cos(a), Math.sin(a)); 
    }
}