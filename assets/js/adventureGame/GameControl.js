// GameControl.js
import GameLevel from "./GameLevel.js";
import Inventory from "./Inventory.js";

class GameControl {
    /**
     * GameControl class to manage the game levels and transitions
     * @param {*} path - The path to the game assets
     * @param {*} levelClasses - The classes of for each game level
     */
    constructor(game, levelClasses) {
        // GameControl properties
        this.game = game; // Reference required for game-in-game logic
        this.path = game.path;
        this.gameContainer = game.gameContainer; // Document element that contains the game
        this.gameCanvas = game.gameCanvas; // Document element that contains the game canvas
        this.levelClasses = levelClasses;
        this.currentLevel = null;
        this.currentLevelIndex = 0;
        this.gameLoopCounter = 0;
        this.isPaused = false;
        this.exitKeyListener = this.handleExitKey.bind(this);
        this.gameOver = null; // Callback for when the game is over 
        this.savedCanvasState = []; // Save the current levels game elements 
        this.canvasContexts = new Map(); // Store canvas contexts
        
        // Store this instance in the game container for access by other components
        if (this.gameContainer) {
            this.gameContainer.gameControl = this;
        }
        
        // Initialize inventory
        console.log("Initializing inventory in GameControl...");
        this.inventory = Inventory.getInstance();
    }

    // Initialize all canvas contexts
    initializeCanvasContexts() {
        const gameContainer = document.getElementById('gameContainer');
        const canvasElements = gameContainer.querySelectorAll('canvas');
        canvasElements.forEach(canvas => {
            if (!this.canvasContexts.has(canvas)) {
                this.canvasContexts.set(canvas, canvas.getContext('2d', { willReadFrequently: true }));
            }
        });
    }

    /**
     * Starts the game by 
     * 1. Adding an exit key listener
     * 2. Initializing canvas contexts
     * 3. Transitioning to the first level
     */
    start() {
        this.addExitKeyListener();
        this.initializeCanvasContexts();
        this.transitionToLevel();
    }

    /**
     * Transitions to the next level in the level by
     * 1. Creating a new GameLevel instance
     * 2. Creating the level using the GameLevelClass
     * 3. Starting the game loop
     */ 
    transitionToLevel() {
        console.log(`Transitioning to level ${this.currentLevelIndex}...`);
        
        // Get a reference to the game container
        const gameContainer = document.getElementById('gameContainer');
        
        // First, clean up any existing game objects and their DOM elements
        this.cleanupPreviousLevel();
        
        // Reset canvas contexts for the new level
        this.canvasContexts = new Map();
        
        // Create the new game level
        const GameLevelClass = this.levelClasses[this.currentLevelIndex];
        console.log(`Creating new level with class: ${GameLevelClass.name}`);
        
        this.currentLevel = new GameLevel(this);
        
        try {
            // Create the level - this will initialize game objects
            this.currentLevel.create(GameLevelClass);
            console.log(`Level created with ${this.currentLevel.gameEnv.gameObjects.length} game objects`);
            
            // Initialize contexts for any new canvases
            this.initializeCanvasContexts();
            
            // Check if this is the RetroLevel and apply special handling
            const isRetroLevel = GameLevelClass.name.includes('Retro');
            if (isRetroLevel) {
                console.log("Special handling for Retro level");
                // Set a flag on the gameContainer to identify this as the retro level
                if (gameContainer) {
                    gameContainer.setAttribute('data-is-retro', 'true');
                }
                
                // Apply multiple force refreshes for the retro level
                this.setupForceRefreshes();
            }
            
            // Start the game loop
            this.gameLoop();
        } catch (error) {
            console.error("Error creating level:", error);
        }
    }

    /**
     * Clean up previous level game objects and DOM elements
     */
    cleanupPreviousLevel() {
        console.log("Cleaning up previous level elements");
        
        // Remove ALL character canvases except the main game canvas
        const allCanvases = document.querySelectorAll('canvas');
        allCanvases.forEach(canvas => {
            if (canvas.id !== 'gameCanvas') {
                console.log(`Removing canvas: ${canvas.id}`);
                canvas.remove();
            }
        });
        
        // Remove ALL game-related DOM elements with a broader selector
        const gameElements = document.querySelectorAll('[class*="game"], [class*="npc"], [class*="character"], [id*="npc"], [id*="character"]');
        gameElements.forEach(element => {
            console.log(`Removing game element: ${element.id || element.className}`);
            element.remove();
        });
        
        // Clear any data attributes on the game container
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            // Store the current level name
            const currentLevel = this.levelClasses[this.currentLevelIndex].name;
            console.log(`Setting game container to level: ${currentLevel}`);
            
            // Reset all data attributes and set the current level
            for (let i = 0; i < gameContainer.attributes.length; i++) {
                const attr = gameContainer.attributes[i];
                if (attr.name.startsWith('data-')) {
                    gameContainer.removeAttribute(attr.name);
                }
            }
            gameContainer.setAttribute('data-current-level', currentLevel);
        }
        
        // Force browser to garbage collect by nullifying references
        if (this.currentLevel && this.currentLevel.gameEnv) {
            // Clear game objects array
            this.currentLevel.gameEnv.gameObjects.forEach(obj => {
                if (obj && typeof obj.destroy === 'function') {
                    obj.destroy();
                }
            });
            this.currentLevel.gameEnv.gameObjects = [];
        }
        
        // Clear any stored canvas contexts
        this.canvasContexts = new Map();
    }

    /**
     * Set up multiple forced refreshes to ensure all NPCs and game objects appear
     * This addresses issues with NPCs not appearing after level transitions
     */
    setupForceRefreshes() {
        // Clear any existing refresh timers
        if (this.refreshTimers) {
            this.refreshTimers.forEach(timer => clearTimeout(timer));
        }
        this.refreshTimers = [];
        
        // Schedule multiple refreshes at different intervals
        // This helps catch race conditions and timing issues
        const refreshTimes = [100, 300, 500, 1000, 2000];
        refreshTimes.forEach(time => {
            const timer = setTimeout(() => {
                if (!this.currentLevel || !this.currentLevel.gameEnv) return;
                
                console.log(`Forced refresh at ${time}ms after level transition`);
                
                // First refresh game objects to ensure they're all initialized
                this.forceElementVisibility();
                
            }, time);
            this.refreshTimers.push(timer);
        });
    }
    
    /**
     * Force key game elements to be visible by directly manipulating the DOM
     * This is a last-resort approach to ensure NPCs appear
     */
    forceElementVisibility() {
        console.log("Running force visibility on all game elements");
        
        // Check if this is the retro level
        const gameContainer = document.getElementById('gameContainer');
        const isRetroLevel = gameContainer?.getAttribute('data-is-retro') === 'true';
        
        if (isRetroLevel) {
            console.log("Applying special retro level visibility fixes");
        }
        
        // Get a comprehensive list of all potential NPC/character elements
        // This covers various naming conventions that might be used
        const selectors = [
            'canvas:not(#gameCanvas)', // All character canvases
            '.character', '.npc', '.game-object', '.person', '.sprite', 
            '.player', '.enemy', '[class*="character"]', '[class*="npc"]',
            '[id*="character"]', '[id*="npc"]', '[id*="person"]',
            // Include common element types that might be used for NPCs
            'img[src*="character"]', 'img[src*="npc"]', 'img[src*="person"]',
            'div[style*="background-image"]', // Background image sprites
            // Specific game selectors
            '.gameCharacter', '.gamePerson', '.gameNPC', '.gameObject',
            // Add any other relevant selectors
            '[data-type="character"]', '[data-type="npc"]', '[data-type="person"]'
        ];
        
        // Find all potential game elements in the DOM using our comprehensive selectors
        const allElements = document.querySelectorAll(selectors.join(','));
        console.log(`Found ${allElements.length} potential game elements to force visible`);
        
        // Log all elements found to help debug
        if (allElements.length === 0) {
            console.warn("No game elements found - checking DOM structure:");
            // Log the entire game container structure to debug
            if (gameContainer) {
                console.log("Game container structure:", gameContainer.innerHTML);
            } else {
                console.error("Game container not found in DOM!");
            }
        }
        
        // Process each element found
        allElements.forEach(element => {
            // Check if the element belongs to the current level
            const elementLevel = element.getAttribute('data-level');
            const currentLevel = gameContainer?.getAttribute('data-current-level');
            
            // For retro level, be more lenient with what we show
            const shouldShow = isRetroLevel || !elementLevel || elementLevel === currentLevel;
            
            if (shouldShow) {
                // Log each element before changes
                console.log(`Making visible: ${element.tagName}#${element.id || 'no-id'}.${element.className || 'no-class'}`);
                
                // Remove any inline styles that might hide the element
                element.style.removeProperty('display');
                element.style.removeProperty('visibility');
                element.style.removeProperty('opacity');
                
                // Force element to be visible with high z-index
                element.style.display = 'block';
                element.style.visibility = 'visible';
                element.style.opacity = '1';
                element.style.zIndex = '1000';
                
                // For canvas elements, try to redraw if possible
                if (element.tagName.toLowerCase() === 'canvas') {
                    // Find the corresponding game object
                    const canvasId = element.id;
                    if (this.currentLevel && this.currentLevel.gameEnv && this.currentLevel.gameEnv.gameObjects) {
                        const gameObject = this.currentLevel.gameEnv.gameObjects.find(obj => 
                            obj.canvas && obj.canvas.id === canvasId
                        );
                        
                        if (gameObject && typeof gameObject.draw === 'function') {
                            try {
                                console.log(`Forcing redraw of character canvas: ${canvasId}`);
                                gameObject.draw();
                            } catch (e) {
                                console.error(`Error drawing canvas ${canvasId}:`, e);
                            }
                        }
                    }
                }
            }
        });
        
        // Special handling for the retro level - try to reattach any detached elements
        if (isRetroLevel && gameContainer && this.currentLevel && this.currentLevel.gameEnv) {
            const gameObjects = this.currentLevel.gameEnv.gameObjects || [];
            console.log(`Checking ${gameObjects.length} retro level game objects`);
            
            gameObjects.forEach(obj => {
                if (!obj) return;
                
                // For each game object, ensure its element is in the DOM
                try {
                    if (obj.canvas && !document.body.contains(obj.canvas)) {
                        console.log(`Reattaching canvas for ${obj.constructor.name}`);
                        gameContainer.appendChild(obj.canvas);
                        
                        obj.canvas.style.display = 'block';
                        obj.canvas.style.visibility = 'visible';
                        obj.canvas.style.opacity = '1';
                        
                        // Force a redraw
                        if (typeof obj.draw === 'function') {
                            obj.draw();
                        }
                    }
                } catch (error) {
                    console.error(`Error reattaching object in retro level:`, error);
                }
            });
        }
    }

    /**
     * Helper method to clean up DOM elements that might interfere with the new level
     */
    cleanupLevelElements() {
        // Remove any lingering NPC dialog boxes, popups, etc.
        const dialogElements = document.querySelectorAll('.dialog-box, .popup, .modal');
        dialogElements.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        
        // Ensure canvas elements are ready for the new level
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            const canvases = gameContainer.querySelectorAll('canvas:not(#gameCanvas)');
            canvases.forEach(canvas => {
                // Clear the canvas instead of removing it
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            });
        }
    }

    /**
     * The main game loop 
     */
    gameLoop() {
        // If the level is not set to continue, handle the level end condition 
        if (!this.currentLevel.continue) {
            this.handleLevelEnd();
            return;
        }
        // If the game level is paused, stop the game loop
        if (this.isPaused) {
            return;
        }
        // Level updates
        this.currentLevel.update();
        this.handleInLevelLogic();
        // Recurse at frame rate speed
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    /**
     * This method is a placeholder for future logic that needs to be executed during the game loop.
     * For example, a starting page or time-based events
     */
    handleInLevelLogic() {
        // This condition is established for future starting page logic
        if (this.currentLevelIndex === 0 && this.gameLoopCounter === 0) {
            console.log("Start Level.");
        }
        // This counter is established for future time-based logic, like frames per second
        this.gameLoopCounter++;
    }

    /**
     * Handles the level end by
     * 1. Destroying the current level
     * 2. Calling the gameOver callback if it exists
     * 3. Transitioning to the next level
     */
    handleLevelEnd() {
        // Alert the user that the level has ended
        if (this.currentLevelIndex < this.levelClasses.length - 1) {
            alert("Level ended.");
        } else {
            alert("All levels completed.");
        }
        this.currentLevel.destroy();
        // Call the gameOver callback if it exists
        if (this.gameOver) {
            this.gameOver();
        } else {
            this.currentLevelIndex++;
            this.transitionToLevel();
        }
    }

    /**
     * Exit key handler to end the current level
     * @param {*} event - The keydown event object
     */
    handleExitKey(event) {
        if (event.key === 'Escape') {
            this.currentLevel.continue = false;
        }
    }

    // Helper method to add exit key listener
    addExitKeyListener() {
        document.addEventListener('keydown', this.exitKeyListener);
    }

    // Helper method to remove exit key listener
    removeExitKeyListener() {
        document.removeEventListener('keydown', this.exitKeyListener);
    }

    // Helper method to get or create canvas context
    getCanvasContext(canvas) {
        if (!this.canvasContexts.has(canvas)) {
            this.canvasContexts.set(canvas, canvas.getContext('2d', { willReadFrequently: true }));
        }
        return this.canvasContexts.get(canvas);
    }

    // Helper method to save the current canvas id and image data in the game container
    saveCanvasState() {
        const gameContainer = document.getElementById('gameContainer');
        const canvasElements = gameContainer.querySelectorAll('canvas');
        // Ensure all canvas contexts are initialized before saving state
        this.initializeCanvasContexts();
        this.savedCanvasState = Array.from(canvasElements).map(canvas => {
            return {
                id: canvas.id,
                imageData: this.getCanvasContext(canvas).getImageData(0, 0, canvas.width, canvas.height)
            };
        });
    }

    // Helper method to hide the current canvas state in the game container
    hideCanvasState() {
        const gameContainer = document.getElementById('gameContainer');
        const canvasElements = gameContainer.querySelectorAll('canvas');
        canvasElements.forEach(canvas => {
            if (canvas.id !== 'gameCanvas') {
                canvas.style.display = 'none';
            }
        });
    }

    // Helper method to restore the hidden canvas item to be visible
    showCanvasState() {
        const gameContainer = document.getElementById('gameContainer');
        this.savedCanvasState.forEach(hidden_canvas => {
            const canvas = document.getElementById(hidden_canvas.id);
            if (canvas) {
                canvas.style.display = 'block';
                this.getCanvasContext(canvas).putImageData(hidden_canvas.imageData, 0, 0);
            }
        });
    }

    /**
     * Game level in Game Level helper method to pause the underlying game level
     * 1. Set the current game level to paused
     * 2. Remove the exit key listener
     * 3. Save the current canvas game containers state
     * 4. Hide the current canvas game containers
     */
    pause() {
        this.isPaused = true;
        this.removeExitKeyListener();
        this.saveCanvasState();
        this.hideCanvasState();
     }

     /**
      * Game level in Game Level helper method to resume the underlying game level
      * 1. Set the current game level to not be paused
      * 2. Add the exit key listener
      * 3. Show the current canvas game containers
      * 4. Start the game loop
      */
    resume() {
        this.isPaused = false;
        this.addExitKeyListener();
        this.showCanvasState();
        this.gameLoop();
    }
}

export default GameControl;