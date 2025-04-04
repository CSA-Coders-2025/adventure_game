// GameLevel.js
import GameEnv from "./GameEnv.js"

class GameLevel {

  constructor(gameControl) {
    this.gameEnv = new GameEnv()
    this.gameEnv.game = gameControl.game
    this.gameEnv.path = gameControl.path
    this.gameEnv.gameContainer = gameControl.gameContainer
    this.gameEnv.gameCanvas = gameControl.gameCanvas
    this.gameEnv.gameControl = gameControl
  }

  create(GameLevelClass) {
    console.log(`Creating game level: ${GameLevelClass.name}`);
    this.continue = true;
    this.gameEnv.create();
    
    // Get the current level name for tracking
    const levelName = GameLevelClass.name;
    console.log(`Setting up level: ${levelName}`);
    
    // Check for retro level for special handling
    const isRetroLevel = levelName.includes('Retro');
    if (isRetroLevel) {
      console.log("Identified as Retro level - applying special initialization");
    }
    
    // Create the level instance
    this.gameLevel = new GameLevelClass(this.gameEnv);
    this.gameObjectClasses = this.gameLevel.classes;

    console.log(`Game object classes: ${this.gameObjectClasses?.length || 0}`);
    
    // Get the game container for attaching elements
    const gameContainer = document.getElementById('gameContainer');
    
    // Set a custom attribute on all elements we create for this level
    // This will help with cleanup and identification
    const levelAttribute = `level-${levelName}`;
    
    // Make sure gameContainer has the current level marked
    if (gameContainer) {
      gameContainer.setAttribute('data-current-level', levelName);
      if (isRetroLevel) {
        gameContainer.setAttribute('data-is-retro', 'true');
      }
    }
    
    // Create game objects specific to this level
    for (let i = 0; i < this.gameObjectClasses.length; i++) {
      const gameObjectClass = this.gameObjectClasses[i];
      try {
        console.log(`Creating object ${i+1}/${this.gameObjectClasses.length}: ${gameObjectClass.class.name}`);
        
        // Add level data to this object
        if (!gameObjectClass.data) {
          gameObjectClass.data = {};
        }
        
        // Add specific level identification
        gameObjectClass.data.levelName = levelName;
        gameObjectClass.data.levelId = levelAttribute;
        
        // Create the game object
        const gameObject = new gameObjectClass.class(gameObjectClass.data, this.gameEnv);
        
        // Add specific level markers to any DOM elements
        if (gameObject.element) {
          gameObject.element.setAttribute('data-level', levelName);
          gameObject.element.classList.add(levelAttribute);
        }
        
        // If it's a character with a canvas, mark it too
        if (gameObject.canvas) {
          gameObject.canvas.setAttribute('data-level', levelName);
          gameObject.canvas.classList.add(levelAttribute);
        }
        
        // Add to game objects list for this level only
        this.gameEnv.gameObjects.push(gameObject);
        
        console.log(`Successfully created object: ${gameObjectClass.class.name}`);
      } catch (error) {
        console.error(`Error creating object ${gameObjectClass.class.name}:`, error);
      }
    }

    // Initialize the game level
    if (typeof this.gameLevel.initialize === "function") {
      console.log('Initializing game level...');
      try {
        this.gameLevel.initialize();
        console.log('Game level initialization complete');
      } catch (error) {
        console.error('Error during game level initialization:', error);
      }
    }

    // Add resize listener
    window.addEventListener("resize", this.resize.bind(this));
    
    // Force another check for all objects after a delay
    setTimeout(() => {
      if (this.gameEnv.gameObjects && this.gameEnv.gameObjects.length > 0) {
        console.log(`Rechecking visibility of ${this.gameEnv.gameObjects.length} game objects`);
        this.gameEnv.gameObjects.forEach(obj => {
          if (obj && obj.element) {
            // Reattach if needed
            if (!document.body.contains(obj.element) && gameContainer) {
              gameContainer.appendChild(obj.element);
            }
            // Ensure visibility
            obj.element.style.display = 'block';
            obj.element.style.visibility = 'visible';
            obj.element.style.opacity = '1';
          }
        });
      }
    }, 500);
  }

  destroy() {
    console.log("Destroying game level...");
    
    // Trigger inventory cleanup if needed
    try {
      const minecraftInventory = window.MinecraftInventory?.getInstance();
      if (minecraftInventory && typeof minecraftInventory.cleanup === "function") {
        console.log("Cleaning up inventory before level destruction");
        minecraftInventory.cleanup();
      }
    } catch (error) {
      console.error("Error cleaning up inventory:", error);
    }
    
    if (typeof this.gameLevel.destroy === "function") {
      this.gameLevel.destroy()
    }

    for (let index = this.gameEnv.gameObjects.length - 1; index >= 0; index--) {
      this.gameEnv.gameObjects[index].destroy()
    }
    window.removeEventListener("resize", this.resize.bind(this))
  }

  update() {
    this.gameEnv.clear()

    for (let gameObject of this.gameEnv.gameObjects) {
      gameObject.update()
    }

    if (typeof this.gameLevel.update === "function") {
      this.gameLevel.update()
    }
  }

  resize() {
    this.gameEnv.resize()
    for (let gameObject of this.gameEnv.gameObjects) {
      gameObject.resize()
    }
  }
}

export default GameLevel

