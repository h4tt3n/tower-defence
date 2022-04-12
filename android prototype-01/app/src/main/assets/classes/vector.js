// 2D vector class
export default class Vector {
    
    constructor(x = 0.0, y = 0.0) {
        this.x = x;
        this.y = y;
    }

    //
    add(v) { this.x += v.x; this.y += v.y; }
    sub(v) { this.x -= v.x; this.y -= v.y; }
    mul(s) { this.x *= s; this.y *= s; }
    div(s) { this.x /= s; this.y /= s; }

    //
    abs() { 
        return new Vector2( Math.abs(this.x), Math.abs(this.y) ); 
    }
    angleFromUnitVector(n) { 
        return Math.atan2(n.y, n.x); 
    }
    component(v) { 
        return new Vector2(this.x, this.y).mul(this.dotVector(v) / v.dotVector(v)); 
    }
    dotVector(v) { 
        return this.x * v.x + this.y * v.y; 
    }
    dotScalar(s) { 
        return new Vector2(this.x * s, this.y * s); 
    }
    length() { 
        return Math.sqrt(this.lengthSquared); 
    }
    lengthSquared() { 
        return this.dotVector(this);
    }
    normalised() { 
        return new Vector2( this / this.Length() );
    }
    perp() { 
        return new Vector2(-this.y, this.x); 
    }
    perpDotVector(v) { 
        return this.x * v.y - this.y * v.x; 
    }
    perpDotScalar(s) { 
        return new Vector2(this.perp().x * s, this.perp().y * s); 
    }
    project(v) { 
        return new Vector2(this.x, this.y).mul(v.dotVector(this) / this.dotVector(this)); 
    }
    randomizeCircle(b) {	
        let a = Math.random() * 8.0 * Math.atan( 1.0 ); 
        let r = Math.sqrt( Math.random() * b * b ); 
        return new Vector2( Math.cos( a ) * r, Math.sin( a ) * r ); 
    }
    randomizeSquare(b) { 
        return new Vector2( ( Math.random() - Math.random() ) * b, ( Math.random() - Math.random() ) * b ); 
    }
    rotate(v) { 
        return new Vector2(v.dotVector(this), v.perpDotVector(this));
    }
    unitVectorFromAngle(a) { 
        return new Vector2(Math.cos(a), Math.sin(a)); 
    }
}