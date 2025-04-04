/**
 * GameEnv manages the game environment.
 * 
 * The focus of the file is the canvas management and the calculation of the game area dimensions. 
 * All calculations are based on the window size, header, and footer.
 * 
 * This code uses an instance-based class pattern, which allows each GameLevel to have its own GameEnv.
 * 
 * The instance-based class pattern ensures that there can be multiple instances of the game environment,
 * providing a separate point of reference for each game level. This approach helps maintain
 * consistency and simplifies the management of shared resources like the canvas and its dimensions.
 * 
 * @class GameEnv
 * @property {Object} container - The DOM element that contains the game.
 * @property {Object} canvas - The canvas element.
 * @property {Object} ctx - The 2D rendering context of the canvas.
 * @property {number} innerWidth - The inner width of the game area.
 * @property {number} innerHeight - The inner height of the game area.
 * @property {number} top - The top offset of the game area.
 * @property {number} bottom - The bottom offset of the game area.
 */
class GameEnv {
    constructor() {
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        this.innerWidth = 0;
        this.innerHeight = 0;
        this.top = 0;
        this.bottom = 0;
        /* Below properties are not part of is-A or has-A relationships,
        *  they are references for easy accessibility in game objects */
        this.game = null; // Reference to the Game static environment variables
        this.path = ''; // Reference to the resource path
        this.gameControl = null; // Reference to the GameControl instance
        this.gameObjects = []; // Reference list of game objects instancces    
    }

    /**
     * Create the game environment by setting up the canvas and calculating dimensions.
     * 
     * This method sets the canvas element, calculates the top and bottom offsets,
     * and determines the inner width and height of the game area. It then sizes the canvas
     * to fit within the calculated dimensions.
     */
    create() {
        this.setCanvas();
        this.innerWidth = window.innerWidth;
        this.innerHeight = window.innerHeight;
        this.size();
    }

    /**
     * Sets the canvas element and its 2D rendering context.
     */
    setCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    }

    /**
     * Sets the top offset based on the height of the header element.
     */
    setTop() {
        const header = document.querySelector('header');
        this.top = header ? header.offsetHeight : 0;
    }

    /**
     * Sets the bottom offset based on the height of the footer element.
     */
    setBottom() {
        const footer = document.querySelector('footer');
        this.bottom = footer ? footer.offsetHeight : 0;
    }

    /**
     * Sizes the canvas to fit within the calculated dimensions.
     */
    size() {
        this.canvas.width = this.innerWidth;
        this.canvas.height = this.innerHeight;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = '0';
        this.canvas.style.top = '0';
    }

    /**
     * Resizes the game environment by re-creating it.
     */
    resize() {
        this.create();
    }

    /**
     * Clears the canvas.
     * 
     * This method clears the entire canvas, making it ready for the next frame.
     */
    clear() {
        this.ctx.clearRect(0, 0, this.innerWidth, this.innerHeight);
    }

    /**
     * Refreshes game objects after level transitions.
     * 
     * This method ensures all game objects (including NPCs) are properly
     * initialized and visible after transitioning between levels.
     */
    refreshGameObjects() {
        console.log("Refreshing game objects - found:", this.gameObjects.length);
        
        if (this.gameObjects.length === 0) {
            console.warn("No game objects found to refresh");
            return;
        }
        
        // Force each game object to refresh its state
        for (const gameObject of this.gameObjects) {
            try {
                // Reset object visibility
                if (gameObject.element) {
                    gameObject.element.style.display = 'block';
                    gameObject.element.style.visibility = 'visible';
                    gameObject.element.style.opacity = '1';
                }
                
                // If the object has a sprite, ensure it's visible
                if (gameObject.sprite) {
                    gameObject.sprite.style.display = 'block';
                    gameObject.sprite.style.visibility = 'visible';
                    gameObject.sprite.style.opacity = '1';
                }
                
                // If the object has a refreshState method, call it
                if (typeof gameObject.refreshState === 'function') {
                    gameObject.refreshState();
                }
                
                // If the object has a redraw method, call it
                if (typeof gameObject.redraw === 'function') {
                    gameObject.redraw();
                }
                
                // Force a position update if the object has x and y coordinates
                if (typeof gameObject.x !== 'undefined' && typeof gameObject.y !== 'undefined') {
                    if (gameObject.element) {
                        gameObject.element.style.left = `${gameObject.x}px`;
                        gameObject.element.style.top = `${gameObject.y}px`;
                    }
                }
            } catch (error) {
                console.error("Error refreshing game object:", error);
            }
        }
        
        // Redraw the canvas to ensure all elements are visible
        this.clear();
        for (const gameObject of this.gameObjects) {
            if (typeof gameObject.draw === 'function') {
                gameObject.draw();
            }
        }
        
        console.log("Game objects refresh complete");
    }
}

export default GameEnv;