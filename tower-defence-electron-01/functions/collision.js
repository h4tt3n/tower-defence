function collisionDetectionBetween(arrayA, arrayB){
    
    for(let a = 0; a < arrayA.length; a++){

        if( !arrayA[a].isAlive() ) { continue }

        for(var b = 0; b < arrayB.length; b++){

            if( !arrayB[b].isAlive() ) { continue }

            if(doesBoxesCollide(arrayA[a], arrayB[b])){

                boxBoxCollisionResolution(arrayA[a], arrayB[b]);
            }
        }
    }
};

function collisionDetectionAmong(array){
    
    for(let a = 0; a < array.length - 1; a++){

        if( !array[a].isAlive() ) { continue }

        for(var b = a + 1; b < array.length; b++){

            if( !array[b].isAlive() ) { continue }

            if(doesBoxesCollide(array[a], array[b])){

                boxBoxCollisionResolution(array[a], array[b]);
            }
        }
    }
};

function doesBoxesCollide(entityA, entityB){
    
    let aLft = entityA.position.x - entityA.size.x;
    let bRgt = entityB.position.x + entityB.size.x;

    if( aLft > bRgt ) { return false }

    let aRgt = entityA.position.x + entityA.size.x;
    let bLft = entityB.position.x - entityB.size.x;

    if( aRgt < bLft ) { return false }

    let aBtm = entityA.position.y + entityA.size.y;
    let bTop = entityB.position.y - entityB.size.y;

    if( aBtm < bTop ) { return false }

    let aTop = entityA.position.y - entityA.size.y;
    let bBtm = entityB.position.y + entityB.size.y;

    if( aTop > bBtm ) { return false }

    return true;
};

function boxBoxCollisionResolution(boxA, boxB) {

    let distX = boxA.position.x - boxB.position.x;
    let distY = boxA.position.y - boxB.position.y;

    let velX = boxA.velocity.x - boxB.velocity.x;
    let velY = boxA.velocity.y - boxB.velocity.y;
    
    let intersectX = Math.abs(distX) - ( boxA.size.x + boxB.size.x );
    let intersectY = Math.abs(distY) - ( boxA.size.y + boxB.size.y );

    let sumInverseMass = boxA.inverseMass + boxB.inverseMass;
    let reducedMass = sumInverseMass != 0.0 ? 1.0 / sumInverseMass : 0.0;

    let massA = boxA.inverseMass * reducedMass;
    let massB = boxB.inverseMass * reducedMass;

    if( intersectX > intersectY ){

        boxA.velocity.y -= boxA.friction * velY * massA;
        boxA.velocity.x -= ( 1.0 + boxA.restitution ) * velX * massA;
        boxA.position.x -= 1.01 * Math.sign(distX) * intersectX * massA;

        boxB.velocity.y += boxB.friction * velY * massB;
        boxB.velocity.x += ( 1.0 + boxB.restitution ) * velX * massB;
        boxB.position.x += 1.01 * Math.sign(distX) * intersectX * massB;
    } 
    else {

        boxA.velocity.x -= boxA.friction * velX * massA;
        boxA.velocity.y -= ( 1.0 + boxA.restitution ) * velY * massA;
        boxA.position.y -= 1.01 * Math.sign(distY) * intersectY * massA;

        boxB.velocity.x += boxB.friction * velX * massB;
        boxB.velocity.y += ( 1.0 + boxB.restitution ) * velY * massB;
        boxB.position.y += 1.01 * Math.sign(distY) * intersectY * massB;
    }
};

export { collisionDetectionBetween, collisionDetectionAmong };