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
        
        // Add item drop functionality
        this.dropItems = data?.dropItems || []; // Array of possible items that can be dropped
        this.hasDroppedItem = false; // Track if this NPC has already dropped an item
        this.dropChance = data?.dropChance || 1.0; // Chance to drop an item (0.0 to 1.0)
        
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
                
                // Try to drop an item after interaction
                this.tryDropItem();
                
            } catch (error) {
                console.error(`Error in NPC interaction for ${this.npcId}:`, error);
            }
        }
    }
    
    /**
     * Tries to drop an item based on drop chance
     * @returns {boolean} Whether an item was dropped
     */
    tryDropItem() {
        // If NPC has already dropped an item or has no items to drop, return
        if (this.hasDroppedItem || !this.dropItems || this.dropItems.length === 0) {
            return false;
        }
        
        // Check drop chance
        if (Math.random() <= this.dropChance) {
            // Choose a random item from the drop items array
            const randomIndex = Math.floor(Math.random() * this.dropItems.length);
            const droppedItem = this.dropItems[randomIndex];
            
            // Add the item to the player's inventory if it exists
            try {
                // Find the inventory module
                import('./Inventory.js').then(module => {
                    const Inventory = module.default;
                    const inventory = Inventory.getInstance();
                    
                    if (inventory && inventory.addItem) {
                        inventory.addItem(droppedItem);
                        console.log(`Added item to inventory: ${droppedItem.name}`);
                        
                        // Create a visual indicator for the dropped item
                        this.createDroppedItemIndicator(droppedItem);
                        
                        // Mark as having dropped an item
                        this.hasDroppedItem = true;
                    } else {
                        console.error("Inventory not available or missing addItem method");
                    }
                }).catch(err => {
                    console.error("Could not import Inventory:", err);
                });
            } catch (error) {
                console.error("Error adding item to inventory:", error);
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Creates a visual indicator when an item is dropped
     * @param {Object} item - The item that was dropped
     */
    createDroppedItemIndicator(item) {
        // Create a floating element to show the dropped item
        const indicator = document.createElement('div');
        indicator.className = 'dropped-item-indicator';
        indicator.style.cssText = `
            position: absolute;
            top: ${this.element.offsetTop - 60}px;
            left: ${this.element.offsetLeft + 20}px;
            background-color: rgba(0, 0, 0, 0.7);
            color: gold;
            padding: 10px 15px;
            border-radius: 20px;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 14px;
            pointer-events: none;
            z-index: 1000;
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
            border: 1px solid gold;
            transform-origin: center bottom;
            animation: itemFloat 2s forwards;
        `;
        
        // Add the item emoji/icon and name
        indicator.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 24px;">${item.emoji || '📦'}</span>
                <div>
                    <div style="font-weight: bold; color: #FFD700;">${item.name}</div>
                    <div style="font-size: 12px; color: #ADD8E6;">Added to inventory!</div>
                </div>
            </div>
        `;
        
        // Add a CSS animation for the floating effect
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            @keyframes itemFloat {
                0% {
                    opacity: 0;
                    transform: translateY(0) scale(0.8);
                }
                15% {
                    opacity: 1;
                    transform: translateY(-10px) scale(1);
                }
                80% {
                    opacity: 1;
                }
                100% {
                    opacity: 0;
                    transform: translateY(-80px) scale(0.8);
                }
            }
        `;
        document.head.appendChild(styleSheet);
        
        // Add to the DOM
        document.body.appendChild(indicator);
        
        // Remove after animation completes
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 2000);
        
        // Play a sound if available
        try {
            const sound = new Audio('assets/sound/item_pickup.mp3');
            sound.volume = 0.3;
            sound.play().catch(e => console.log('Error playing sound:', e));
        } catch (e) {
            console.log('Could not play item pickup sound:', e);
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
