import Background from './Background.js';
import Player from './Player.js';
import Projectile from './Projectile.js';
import Npc from './Npc.js';

class GameLevelMeteorBlaster {
  constructor(gameEnv) {
    let width = gameEnv.innerWidth;
    let height = gameEnv.innerHeight;
    let path = gameEnv.path;

    // Background (Space Image)
    const image_src_space = path + "/images/gamify/space.png";
    const image_data_space = {
        id: 'Space-Background',
        src: image_src_space,
        pixels: {height: 857, width: 1200}
    };

    // Player (Ufo/Robot)
    const sprite_src_ufo = path + "/images/gamify/ufo.png"; // be sure to include the path
    const UFO_SCALE_FACTOR = 5;
    const sprite_data_ufo = {
        id: 'Ufo',
        greeting: "Hi I am snowspeeder, the desert wanderer. I am trying to take donwn the empire's AT-ATs!",
        src: sprite_src_ufo,
        SCALE_FACTOR: UFO_SCALE_FACTOR,
        STEP_FACTOR: 1000,
        ANIMATION_RATE: 50,
        INIT_POSITION: { x: 0, y: 0 }, 
        pixels: {height: 422, width: 460},
        orientation: {rows: 1, columns: 1 },
        down: {row: 0, start: 0, columns: 1, rotate: -Math.PI/2 },
        left: {row: 0, start: 0, columns: 1 },
        right: {row: 0, start: 0, columns: 1, rotate: Math.PI },
        up: {row: 0, start: 0, columns: 1, rotate: Math.PI/2 },
        hitbox: { widthPercentage: 0.45, heightPercentage: 0.2 },
        keypress: { up: 87, left: 65, down: 83, right: 68 } // W, A, S, D
    };

    // Meteor Data
    const sprite_src_meteor = path + "/images/gamify/meteor.png";
    const sprite_data_meteor = {
        id: 'Meteor',
        src: sprite_src_meteor,
        SCALE_FACTOR: 6,
        pixels: {height: 64, width: 64},
        INIT_POSITION: { x: Math.random() * width, y: -50 },
        hitbox: { widthPercentage: 0.1, heightPercentage: 0.1 },
        movement: { x: 0, y: 5 } // Moves downward
    };

    // Laser Projectile
    const sprite_src_laser = path + "/images/gamify/laser.png";
    const sprite_data_laser = {
        id: 'Laser',
        src: sprite_src_laser,
        SCALE_FACTOR: 3,
        pixels: {height: 16, width: 32},
        INIT_POSITION: { x: 0, y: 0 },
        hitbox: { widthPercentage: 0.1, heightPercentage: 0.1 },
        movement: { x: 0, y: -10 } // Moves upward
    };

    // NPC for Exit (Game Over Condition)
    const exit_sprite = {
        id: 'Exit',
        greeting: "You've won the game!",
        src: path + "/images/gamify/exit.png",
        SCALE_FACTOR: 5,
        INIT_POSITION: { x: width - 100, y: 50 },
        pixels: {height: 64, width: 64},
        hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 },
        interact: function() {
            alert("Congratulations! You've survived the meteor storm!");
            gameEnv.gameControl.gameOver(); // Exit minigame and return to main game
        }
    };

    // List of objects for this level
    this.classes = [
        { class: Background, data: image_data_space },
        { class: Player, data: sprite_data_ufo },
        // { class: Npc, data: exit_sprite },
        // { class: Projectile, data: sprite_data_laser },
        // { class: Npc, data: sprite_data_meteor } // Meteors as NPC objects
    ];
  }
}

export default GameLevelMeteorBlaster;
