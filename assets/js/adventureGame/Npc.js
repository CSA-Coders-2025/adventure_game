import Character from "./Character.js";

class Npc extends Character {
    constructor(data = null, gameEnv = null) {
        super(data, gameEnv);
        this.interact = data?.interact; // Interact function
        this.currentQuestionIndex = 0;
        this.alertTimeout = null;
        
        // Store a reference to this NPC in a global registry to help with level transitions
        if (!window.npcRegistry) {
            window.npcRegistry = new Map();
        }
        
        // Use NPC ID as key if available, otherwise generate one
        this.npcId = data?.id || `npc_${Math.random().toString(36).substr(2, 9)}`;
        window.npcRegistry.set(this.npcId, this);
        
        this.bindInteractKeyListeners();
    }

    update() {
        this.draw();
        
        // Ensure NPC is visible during each update
        if (this.element && !this.element.isConnected) {
            console.log(`NPC ${this.npcId} is detached from DOM, re-attaching...`);
            this.reattachToDOM();
        }
    }
    
    // New method to reattach NPC to the DOM if it gets detached
    reattachToDOM() {
        if (!this.element) return;
        
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer && !document.body.contains(this.element)) {
            gameContainer.appendChild(this.element);
            
            // Reset visibility properties
            this.element.style.display = 'block';
            this.element.style.visibility = 'visible';
            this.element.style.opacity = '1';
            this.element.style.position = 'absolute';
            
            // Restore position
            if (typeof this.x !== 'undefined' && typeof this.y !== 'undefined') {
                this.element.style.left = `${this.x}px`;
                this.element.style.top = `${this.y}px`;
            }
            
            console.log(`Reattached NPC ${this.npcId} to DOM`);
        }
    }

    bindInteractKeyListeners() {
        // Use safer approach to binding event listeners
        this._handleKeyDownBound = this.handleKeyDown.bind(this);
        this._handleKeyUpBound = this.handleKeyUp.bind(this);
        
        addEventListener('keydown', this._handleKeyDownBound);
        addEventListener('keyup', this._handleKeyUpBound);
        
        // Listen for level transitions
        document.addEventListener('levelTransition', this.handleLevelTransition.bind(this));
    }
    
    // New method to handle level transitions
    handleLevelTransition(event) {
        console.log(`NPC ${this.npcId} handling level transition`);
        // Ensure we're still in the registry
        window.npcRegistry.set(this.npcId, this);
        
        // Queue a reattach to ensure visibility after transition
        setTimeout(() => {
            this.reattachToDOM();
        }, 500);
    }

    handleKeyDown({ key }) {
        if (key === 'e' || key === 'u') {
            this.handleKeyInteract();
        }
    }

    handleKeyUp({ key }) {
        if (key === 'e' || key === 'u') {
            if (this.alertTimeout) {
                clearTimeout(this.alertTimeout);
                this.alertTimeout = null;
            }
        }
    }

    handleKeyInteract() {
        const players = this.gameEnv.gameObjects.filter(
            obj => obj.state?.collisionEvents?.includes(this.spriteData?.id)
        );
        const hasInteract = this.interact !== undefined;

        if (players.length > 0 && hasInteract) {
            // Safety check before attempting interaction
            try {
                // Check if we're doing a level transition
                const isLevelTransition = this.interact.toString().includes('GameControl');
                
                if (isLevelTransition) {
                    console.log(`NPC ${this.npcId} initiating level transition...`);
                    
                    // Ensure NPCs are preserved during the transition
                    if (window.npcRegistry) {
                        // Store NPC registry size before transition
                        console.log(`NPC registry size before transition: ${window.npcRegistry.size}`);
                    }
                }
                
                // Call the interaction handler
                this.interact();
                
            } catch (error) {
                console.error(`Error in NPC interaction for ${this.npcId}:`, error);
            }
        }
    }
    
    // Override destroy to properly clean up
    destroy() {
        // Remove event listeners
        removeEventListener('keydown', this._handleKeyDownBound);
        removeEventListener('keyup', this._handleKeyUpBound);
        document.removeEventListener('levelTransition', this.handleLevelTransition);
        
        // Remove from registry
        if (window.npcRegistry) {
            window.npcRegistry.delete(this.npcId);
        }
        
        // Call parent destroy
        super.destroy();
    }
}

export default Npc;
