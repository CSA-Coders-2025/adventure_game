import Background from "./Background.js"
import Player from "./Player.js"
import Meteor from "./Meteor.js"
import Character from "./Character.js"
import Quiz from "./Quiz.js"
import { checkGameImages } from "./debug-helper.js"

class GameLevelRaceCar {
  constructor(gameEnv) {
    this.gameEnv = gameEnv
    let width = gameEnv.innerWidth
    let height = gameEnv.innerHeight
    let path = gameEnv.path


    const image_src_track = path + "/images/gamify/cartrack.png"  // be sure to include the path
    const image_data_track = {
      id: "Car-Track",
      src: image_src_track,
      pixels: { height: 857, width: 1200 },
    }

    const sprite_src_ufo = path + "/images/gamify/ufo.png"  // be sure to include the path
    const UFO_SCALE_FACTOR = 5
    this.playerData = {
      id: "Ufo",
      src: sprite_src_ufo,
      SCALE_FACTOR: UFO_SCALE_FACTOR,
      STEP_FACTOR: 100,
      ANIMATION_RATE: 50,
      INIT_POSITION: { x: 17 * width / 24, y: 3*height/4 },
      pixels: { height: 422, width: 460 },
      orientation: { rows: 1, columns: 1 },
      down: { row: 0, start: 0, columns: 1 },
      left: { row: 0, start: 0, columns: 1 },
      right: { row: 0, start: 0, columns: 1 },
      up: { row: 0, start: 0, columns: 1 },
      keypress: {
        up: 87,
        left: 65,
        down: 83,
        right: 68,
      },
      hitbox: { widthPercentage: 0.45, heightPercentage: 0.2 },
    }

    const sprite_src_chillguy = path + "/images/gamify/chillguy.png"; // be sure to include the path
    const CHILLGUY_SCALE_FACTOR = 5;
    const chillguyData = {
        id: 'Chill Guy',
        greeting: "Hi I am Chill Guy, the desert wanderer. I am looking for wisdom and adventure!",
        src: sprite_src_chillguy,
        SCALE_FACTOR: CHILLGUY_SCALE_FACTOR,
        STEP_FACTOR: 100,
        ANIMATION_RATE: 50,
        INIT_POSITION: { x: width/3, y: 3*height/4 }, 
        pixels: {height: 384, width: 512},
        orientation: {rows: 3, columns: 4 },
        down: {row: 0, start: 0, columns: 3 },
        left: {row: 2, start: 0, columns: 3 },
        right: {row: 1, start: 0, columns: 3 },
        up: {row: 3, start: 0, columns: 3 },
        hitbox: { widthPercentage: 0.45, heightPercentage: 0.2 },
        keypress: { up: 38, left: 37, down: 40, right: 39 } // arrow keys
    }

    this.classes = [
      { class: Background, data: image_data_track },
      { class: Player, data: this.playerData },
      { class: Player, data: chillguyData},
    ]
    this.ufoPlayer = null;
    this.classes.forEach(playerObject => {
    if (playerObject.class === Player && playerObject.data.id === "Ufo") {
        this.ufoPlayer = playerObject.instance; // Store the UFO player instance
    }

    this.playerTimers = {
      Ufo: { startTime: null, endTime: null, interval: null },
      ChillGuy: { startTime: null, endTime: null, interval: null }
    };
  });
}

    startPlayerTimer(playerId) {
      if (this.playerTimers[playerId].startTime !== null) return; // Prevent restarting

      this.playerTimers[playerId].startTime = performance.now();
      this.playerTimers[playerId].interval = setInterval(() => {
          let currentTime = ((performance.now() - this.playerTimers[playerId].startTime) / 1000).toFixed(2);
          document.getElementById(`timerDisplay-${playerId}`).innerText = `${playerId} Time: ${currentTime}s`;
      }, 100);
  }
      
    declareWinner(playerId) {
      this.playerTimers[playerId].endTime = ((performance.now() - this.playerTimers[playerId].startTime) / 1000).toFixed(2);
      clearInterval(this.playerTimers[playerId].interval); // Stop only the winner's timer

      const winMessage = document.createElement("div");
      winMessage.innerText = `${playerId} WINS! Time: ${this.playerTimers[playerId].endTime}s`;
      winMessage.style.position = "absolute";
      winMessage.style.top = "50%";
      winMessage.style.left = "50%";
      winMessage.style.transform = "translate(-50%, -50%)";
      winMessage.style.fontSize = "40px";
      winMessage.style.color = "white";
      winMessage.style.background = "black";
      winMessage.style.padding = "20px";
      document.body.appendChild(winMessage);
  }

  checkWin() {
    if (3*width/4 <= this.ufoPlayer.position.x <= width/5 && this.ufoPlayer.position.y == height/2) { // Adjust for track size
        console.log(`${this.id} wins!`);
        this.velocity.x = 0;
        this.velocity.y = 0;
    }
  }
  // <div id="timerDisplay-Ufo" style="position:absolute; top:10px; left:10px; font-size:24px; color:white;"></div>
  // <div id="timerDisplay-ChillGuy" style="position:absolute; top:40px; left:10px; font-size:24px; color:white;"></div>

}
export default GameLevelRaceCar;

