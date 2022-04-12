function rnd(min,max) {
    return Math.random() * (max ? (max-min) : min) + (max ? min : 0) 
};

function getRandomInt(min, max) {
     //max and min inclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
};

export { rnd, getRandomInt };