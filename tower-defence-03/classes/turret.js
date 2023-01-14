import constants from './consts.js'
import Vector from './vector.js'
import GameEntity from './gameEntity.js'

export default class Tower extends GameEntity {
    constructor(hitPoints, minRange, maxRange, coolDownTime, numProjectiles, projectileDamage, projectileVelocity, texture, posX, posY, sizeX, sizeY){
        super(hitPoints, texture, posX, posY, sizeX, sizeY);
        this.target = null;
        this.coolDownTime = coolDownTime;
        this.canFire = true;
        this.numProjectiles = numProjectiles;
        this.projectileDamage = projectileDamage;
        this.projectileVelocity = projectileVelocity;
        this.minRangeSquared = minRange**2;
        this.maxRangeSquared = maxRange**2;
    }
    updateState(enemies, projectiles){

        if( !this.isAlive()) { return };

        this.selectTarget(enemies);
        this.fireProjectile(projectiles);
    }
    selectTarget(enemies){

        this.target = null;

        let invDistSquaredEnemy = 0.0;

        for(var i = 0; i < enemies.length; i++){
            
            if( !enemies[i].isAlive()) { continue };

            let dVec = new Vector(
                this.position.x - enemies[i].position.x,
                this.position.y - enemies[i].position.y);
            
            let distSquaredTemp = dVec.x * dVec.x + dVec.y * dVec.y;

            if( distSquaredTemp < this.minRangeSquared || distSquaredTemp > this.maxRangeSquared) { continue };

            let invDistSquaredTemp = 1.0 / distSquaredTemp;
            
            if( invDistSquaredEnemy < invDistSquaredTemp ){

                invDistSquaredEnemy = invDistSquaredTemp;
                this.target = enemies[i];
            }
        }
    }
    fireProjectile(projectiles){

        if( !this.canFire || this.target == null ) { return }

        for(let i = 0; i < this.numProjectiles; i++)
        {
            let projectile = projectiles.find(value => !value.isAlive());

            if(projectile === undefined){ break };
            
            let dstVec = new Vector(
                this.target.position.x - this.position.x,
                this.target.position.y - this.position.y);

            let dstSqd = dstVec.x * dstVec.x + dstVec.y * dstVec.y;
            
            let dst = Math.sqrt(dstSqd);
    
            let nVec = new Vector( dstVec.x / dst, dstVec.y / dst );
    
            projectile.lifeTime = 5000;
            projectile.damage = this.projectileDamage;
            projectile.position.x = this.position.x;
            projectile.position.y = this.position.y;
    
            //let velocity = 2000; //getRandomInt(1900, 2100);

            let rnd1 = (Math.random() - Math.random()) * 0.08;
            let rnd2 = (Math.random() - Math.random()) * 0.08;

            projectile.velocity.x = this.projectileVelocity * (nVec.x + rnd1);
            projectile.velocity.y = this.projectileVelocity * (nVec.y + rnd2);
        }

        this.canFire = false;
        setTimeout(() => this.canFire = true, this.coolDownTime);
    }
};