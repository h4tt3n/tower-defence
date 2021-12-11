/* 
************************************************************************************
    RENDER FUNCTIONS
************************************************************************************
*/


function renderScene(){

    // Reset
    ctx.resetTransform();

    // Clear screen
    var my_gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    my_gradient.addColorStop(0, "#bbccee");
    my_gradient.addColorStop(1, "#6677aa");
    ctx.fillStyle = my_gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    renderGameEntities(doodads, doodadTextures);
    renderGameEntities(walls, wallTextures);
    renderGameEntities(towers, towerTextures);
    renderGameEntities(enemies, enemyTextures);
    renderGameEntities(worldBlocks, []);

    renderProjectiles();
    renderExplosions();

    ctx.resetTransform();
    let numLiveDucks = enemies.filter(e => e.isAlive()).length;
    ctx.font = '24px serif';
    ctx.fillStyle = "#000000";
    ctx.fillText(`Enemies left: ${numLiveDucks}`, 40, 40);
    ctx.fillText(`Next wave in:`, canvas.width - 600, 40);
    ctx.fillText(`Caps:`, canvas.width - 200, 40);

};

function renderGameEntities(array, textureArray){

    for(let i = 0; i < array.length; i++){
        
        if( !array[i].isAlive()) { continue };

        var img = textureArray[array[i].texture];
        var x = ( array[i].position.x - camera.position.x ) * camera.zoom + canvas.width * 0.5;
        var y = ( array[i].position.y - camera.position.y ) * camera.zoom + canvas.height * 0.5;
        ctx.setTransform(camera.zoom, 0, 0, camera.zoom, x, y);
        
        if( img === null || img === undefined ){

            var my_gradient = ctx.createLinearGradient(0, -array[i].size.y, 0, array[i].size.y);
            my_gradient.addColorStop(0, "#ffffff"); // ccddff
            my_gradient.addColorStop(1 - (array[i].size.y / (array[i].size.y + 20)), "#ffffff");
            my_gradient.addColorStop(1 - (array[i].size.y / (array[i].size.y + 80)), "#886655");
            my_gradient.addColorStop(1, "#886655");
            ctx.fillStyle = my_gradient;

            ctx.fillRect(-array[i].size.x, -array[i].size.y, array[i].size.x * 2, array[i].size.y * 2);
        } 
        else {

            ctx.drawImage(img, -array[i].size.x, -array[i].size.y, array[i].size.x * 2, array[i].size.y * 2);
        }
    }
};

function renderProjectiles(array){
    
    for(let i = 0; i < array.length; i++){

        if( !array[i].isAlive()) { continue };
        
        var x = ( array[i].position.x - camera.position.x ) * camera.zoom + canvas.width * 0.5;
        var y = ( array[i].position.y - camera.position.y ) * camera.zoom + canvas.height * 0.5;
        ctx.setTransform(camera.zoom, 0, 0, camera.zoom, x, y);
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#444444";
        ctx.fill();
        ctx.closePath();
    }
};

function renderExplosions(array){
    
    for(let i = 0; i < array.length; i++){

        if( !array[i].isAlive()) { continue };
        
        var x = ( array[i].position.x - camera.position.x ) * camera.zoom + canvas.width * 0.5;
        var y = ( array[i].position.y - camera.position.y ) * camera.zoom + canvas.height * 0.5;
        ctx.setTransform(camera.zoom, 0, 0, camera.zoom, x, y);

        var rdl = ctx.createRadialGradient(0, 0, 0, 0, 0, array[i].radius);
        rdl.addColorStop(0.0, 'rgba(255, 255, 255, 0)');
        rdl.addColorStop(0.9, 'rgba(255, 255, 255, 0)');
        rdl.addColorStop(1.0, 'rgba(255, 255, 255, 128)');
    
        ctx.beginPath();
        ctx.fillStyle = rdl;
        ctx.arc(0, 0, array[i].radius, 0, Math.PI * 2);
        ctx.fill();
    }
};

export { renderScene, renderGameEntities, renderProjectiles, renderExplosions };