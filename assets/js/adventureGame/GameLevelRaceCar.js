import Background from './Background.js';
import Player from './Player.js';
import Npc from './Npc.js';
import QuestionPopup from './QuestionPopup.js';

class GameLevelRaceCar {
  constructor(gameEnv) {
    // Game environment dimensions
    let width = gameEnv.innerWidth;
    let height = gameEnv.innerHeight;
    let path = gameEnv.path;

    // Background setup (Race track)
    const image_src_track = path + "/images/gamify/racetrack.png";
    const image_data_track = {
        id: 'RaceTrack',
        src: image_src_track,
        pixels: {height: 570, width: 1025}
    };

    // Player (Race Car) setup
    const sprite_src_racecar = path + "/images/gamify/racecar_sprite.png";
    const RACECAR_SCALE_FACTOR = 3;
    const sprite_data_racecar = {
        id: 'RaceCar',
        greeting: "I am the fastest racer on the track!", 
        src: sprite_src_racecar,
        SCALE_FACTOR: RACECAR_SCALE_FACTOR,
        STEP_FACTOR: 500,
        ANIMATION_RATE: 50,
        INIT_POSITION: { x: width * 0.1, y: height * 0.8 }, 
        pixels: {height: 300, width: 150},
        orientation: {rows: 1, columns: 1 },
        up: {row: 0, start: 0, columns: 1 },
        left: {row: 0, start: 0, columns: 1, rotate: -Math.PI/2 },
        right: {row: 0, start: 0, columns: 1, rotate: Math.PI/2 },
        down: {row: 0, start: 0, columns: 1, rotate: Math.PI },
        hitbox: { widthPercentage: 0.5, heightPercentage: 0.6 },
        keypress: { up: 87, left: 65, down: 83, right: 68 } // W, A, S, D
    };

    // Obstacle setup (Objects triggering questions)
    const sprite_src_obstacle = path + "/images/gamify/cone.png";
    const OBSTACLE_SCALE_FACTOR = 2;
    const sprite_data_obstacle = {
      id: 'Obstacle-Cone',
      greeting: "Oops! You hit a cone! Answer a question to continue!",
      src: sprite_src_obstacle,
      SCALE_FACTOR: OBSTACLE_SCALE_FACTOR,
      pixels: {width: 100, height: 100},
      INIT_POSITION: { x: width * 0.5, y: height * 0.6 }, 
      orientation: {rows: 1, columns: 1 },
      hitbox: { widthPercentage: 0.5, heightPercentage: 0.5 },
    };

    // Question Popup when an obstacle is hit
    const question_data = {
        id: 'QuestionPopup',
        text: "What does HTTP stand for?",
        options: ["HyperText Transfer Protocol", "High Tech Transfer Process", "Hyperlink Transfer Port"],
        correct: 0 // Index of the correct answer
    };

    // List of objects in this level
    this.classes = [
      { class: Background, data: image_data_track },
      { class: Player, data: sprite_data_racecar },
      { class: Npc, data: sprite_data_obstacle },
      { class: QuestionPopup, data: question_data },
    ];
  }
}

export default GameLevelRaceCar;
