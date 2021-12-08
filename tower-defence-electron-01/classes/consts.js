
const constants = {
    DT              : 1.0 / 60,
    INV_DT          : 1.0 / (1.0 / 60),
    FPS             : (1.0 / 60) * 1000,
    GRAVITY         : 4,
    NUM_ENEMIES     : 500,
    NUM_PROJECTILES : 2000,
    BUILD_TIME      : 10 * 0,
    NUM_DOODADS     : 400
};

Object.freeze(constants);

export default constants;