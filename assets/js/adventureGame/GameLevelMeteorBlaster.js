import Background from './Background.js';
import Player from './Player.js';
import Projectile from './Projectile.js';
import Npc from './Npc.js';

class GameLevelMeteorBlaster {
  constructor(gameEnv) {
    this.gameEnv = gameEnv; // Store game environment reference
    let width = gameEnv.innerWidth;
    let height = gameEnv.innerHeight;
    let path = gameEnv.path;

    // Background (Space Image)
    const image_src_space = path + "/images/gamify/space.png";
    const image_data_space = {
      id: 'Space-Background',
      src: image_src_space,
      pixels: { height: 857, width: 1200 }
    };

    // Player (Ufo/Robot)
    const sprite_src_ufo = path + "/images/gamify/ufo.png";
    const UFO_SCALE_FACTOR = 5;
    this.playerData = {
      id: 'Ufo',
      greeting: "UFO",
      src: sprite_src_ufo,
      SCALE_FACTOR: UFO_SCALE_FACTOR,
      STEP_FACTOR: 1000,
      ANIMATION_RATE: 50,
      INIT_POSITION: { x: 100, y: height / 2 },
      pixels: { height: 422, width: 460 },
      orientation: { rows: 1, columns: 1 },
      down: { row: 0, start: 0, columns: 1, rotate: -Math.PI / 2 },
      left: { row: 0, start: 0, columns: 1 },
      right: { row: 0, start: 0, columns: 1, rotate: Math.PI },
      up: { row: 0, start: 0, columns: 1, rotate: Math.PI / 2 },
      hitbox: { widthPercentage: 0.45, heightPercentage: 0.2 },
      keypress: { up: 87, left: 65, down: 83, right: 68 } // W, A, S, D
    };

    // Laser Data
    this.sprite_src_laser = path + "/images/gamify/laser_bolt.png";

    // List to track active projectiles
    this.projectiles = [];

    // Attach key event listener only once
    this.handleKeydown = this.handleKeydown.bind(this);
    document.addEventListener("keydown", this.handleKeydown);

    // List of objects for this level
    this.classes = [
      { class: Background, data: image_data_space },
      { class: Player, data: this.playerData },
    ];

    // Start game loop for projectiles
    this.startGameLoop();
  }

  handleKeydown(event) {
    if (event.code === "Space") { 
      this.shootLaser();
    }
  }

  shootLaser() {
    const laser = new Projectile({
      id: `Laser-${Math.random()}`,
      src: this.sprite_src_laser,
      SCALE_FACTOR: 2,
      pixels: { height: 16, width: 32 },
      INIT_POSITION: {
        x: this.playerData.INIT_POSITION.x + this.playerData.pixels.width / 2,
        y: this.playerData.INIT_POSITION.y + this.playerData.pixels.height / 2
      },
      hitbox: { widthPercentage: 0.1, heightPercentage: 0.1 },
      movement: { x: 15, y: 0 }, // Move right
    }, this.gameEnv);

    this.projectiles.push(laser);
    this.classes.push({ class: Projectile, data: laser });

    // Ensure the game environment registers the new projectile
    if (this.gameEnv.addObject) {
      this.gameEnv.addObject(laser);
    }
  }

  startGameLoop() {
    setInterval(() => {
      this.projectiles.forEach((laser, index) => {
        if (laser.data) {
          laser.data.INIT_POSITION.x += laser.data.movement.x;
        }

        // Remove laser if it moves off-screen
        if (laser.data && laser.data.INIT_POSITION.x > window.innerWidth) {
          this.projectiles.splice(index, 1);
        }
      });
    }, 16);
  }
}

export default GameLevelMeteorBlaster;