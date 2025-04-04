/**
 * MinecraftInventory.js
 * Handles the Minecraft-style inventory bar functionality
 */
import Inventory from './Inventory.js';

class MinecraftInventory {
    static instance = null;
    
    constructor() {
        if (MinecraftInventory.instance) {
            return MinecraftInventory.instance;
        }
        
        this.slots = 10;
        this.selectedSlot = 0;
        this.hotbarItems = Array(this.slots).fill(null);
        this.inventory = Inventory.getInstance();
        this.keysEnabled = false;
        
        MinecraftInventory.instance = this;
        
        // Make instance globally accessible for level transitions
        window.MinecraftInventory = MinecraftInventory;
        
        // Wait a moment before initializing to ensure DOM is ready
        setTimeout(() => this.initialize(), 200);
    }
    
    static getInstance() {
        if (!MinecraftInventory.instance) {
            MinecraftInventory.instance = new MinecraftInventory();
        }
        return MinecraftInventory.instance;
    }
    
    initialize() {
        console.log('MinecraftInventory initializing...');
        
        // Get inventory bar element
        this.inventoryBar = document.getElementById('inventory-bar');
        if (!this.inventoryBar) {
            console.error('Inventory bar element not found, retrying in 500ms...');
            setTimeout(() => this.initialize(), 500);
            return;
        }
        
        console.log('Inventory bar found!');
        
        // Clean up any previous event listeners to avoid duplicates
        this.cleanup();
        
        // Add event listeners for slot selection
        this.inventoryBar.querySelectorAll('.inventory-slot').forEach((slot, index) => {
            slot.addEventListener('click', (e) => {
                // Check if the Shift key is pressed while clicking to open full inventory
                if (e.shiftKey) {
                    this.openFullInventory();
                } else {
                    this.selectSlot(index);
                }
            });
        });
        
        // Enable keyboard controls after a brief delay to avoid interference with other systems
        setTimeout(() => {
            this.enableKeyboardControls();
        }, 500);
        
        // Subscribe to inventory updates
        document.addEventListener('inventoryUpdated', this.handleInventoryUpdate.bind(this));
        
        // Subscribe to level transition events
        document.addEventListener('levelTransition', this.handleLevelTransition.bind(this));
        
        // Manually force a direct population from inventory right now
        this.forcePopulateFromInventory();
        
        // Make sure help guide is in the first slot for easy access
        setTimeout(() => {
            this.ensureHelpGuideInSlot();
        }, 1000);
        
        console.log('MinecraftInventory initialization complete');
    }
    
    // Ensure help guide is always available in first slot
    ensureHelpGuideInSlot() {
        const inventory = Inventory.getInstance();
        const helpGuideItem = inventory.items.find(item => item.id === 'help_guide');
        
        // If help guide exists in inventory, place it in first slot
        if (helpGuideItem) {
            console.log('Found help guide in inventory, placing in first slot');
            this.setItemInSlot(0, helpGuideItem);
            this.updateSlotDisplay(0);
        } else {
            // If help guide doesn't exist, add it to inventory and slot
            console.log('Help guide not found in inventory, adding it');
            const newHelpGuide = {
                id: 'help_guide',
                name: 'Help Guide',
                description: 'A comprehensive guide on how to play the game. Press \\ key to open.',
                emoji: '❓',
                stackable: false,
                value: 0,
                quantity: 1
            };
            
            inventory.addItem(newHelpGuide);
            this.setItemInSlot(0, newHelpGuide);
            this.updateSlotDisplay(0);
        }
        
        // Select the first slot to make help guide active
        this.selectSlot(0);
    }
    
    // NEW: Handle level transitions
    handleLevelTransition(event) {
        console.log('Level transition detected, re-initializing inventory...');
        
        // Clean up
        this.cleanup();
        
        // Re-initialize after a brief delay to ensure DOM is updated
        setTimeout(() => {
            this.initialize();
        }, 500);
    }
    
    // NEW: Cleanup method to remove event listeners and reset state
    cleanup() {
        console.log('Cleaning up MinecraftInventory...');
        
        // Remove event listeners from slots
        if (this.inventoryBar) {
            this.inventoryBar.querySelectorAll('.inventory-slot').forEach(slot => {
                // Clone and replace to remove all event listeners
                const newSlot = slot.cloneNode(true);
                slot.parentNode.replaceChild(newSlot, slot);
            });
        }
        
        // Remove key handler
        if (this._handleKeyDownBound) {
            document.removeEventListener('keydown', this._handleKeyDownBound);
            window.removeEventListener('keydown', this._handleKeyDownBound);
            this._handleKeyDownBound = null;
        }
        
        // Close any open windows
        this.closeAllWindows();
    }
    
    // NEW: Method to close all open windows
    closeAllWindows() {
        // Close calculator if open
        const calculatorContainer = document.getElementById('calculator-container');
        if (calculatorContainer && calculatorContainer.parentNode) {
            calculatorContainer.parentNode.removeChild(calculatorContainer);
        }
        
        // Close ROI calculator if open
        const roiCalculatorContainer = document.getElementById('roi-calculator-container');
        if (roiCalculatorContainer && roiCalculatorContainer.parentNode) {
            roiCalculatorContainer.parentNode.removeChild(roiCalculatorContainer);
        }
        
        // Close trading journal if open
        const tradingJournalContainer = document.getElementById('trading-journal-container');
        if (tradingJournalContainer && tradingJournalContainer.parentNode) {
            tradingJournalContainer.parentNode.removeChild(tradingJournalContainer);
        }
        
        // Close trading manual if open
        const tradingManualContainer = document.getElementById('trading-manual-container');
        if (tradingManualContainer && tradingManualContainer.parentNode) {
            tradingManualContainer.parentNode.removeChild(tradingManualContainer);
        }
        
        // Close help guide if open
        const helpGuideContainer = document.getElementById('help-guide-container');
        if (helpGuideContainer && helpGuideContainer.parentNode) {
            helpGuideContainer.parentNode.removeChild(helpGuideContainer);
        }
    }
    
    enableKeyboardControls() {
        console.log('Enabling keyboard controls for inventory...');
        this.keysEnabled = true;
        
        // Remove any existing listeners
        document.removeEventListener('keydown', this._handleKeyDownBound);
        window.removeEventListener('keydown', this._handleKeyDownBound);
        
        // Create bound function and store reference for potential removal
        this._handleKeyDownBound = this.handleKeyDown.bind(this);
        
        // Add to document only, not both document and window
        document.addEventListener('keydown', this._handleKeyDownBound);
        
        // Ensure the first slot is selected
        this.selectSlot(0);
        
        console.log('Keyboard controls enabled for inventory');
    }
    
    handleKeyDown(e) {
        if (!this.keysEnabled) return;
        
        // Don't interfere with input elements
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        const key = e.key;
        const code = e.code;
        
        console.log('Key pressed for inventory:', key, 'Code:', code);
        
        // Special case for help guide - ? or H key opens it directly
        if (key === '?' || key === 'h' || key === 'H') {
            console.log('Opening help guide directly with ? or H key');
            this.openHelpGuideDirectly();
            return;
        }
        
        // Open full inventory with . key
        if (key === '.') {
            console.log('Opening full inventory with . key');
            this.openFullInventory();
            return;
        }
        
        // Use selected item with \ key
        if (key === '\\' || code === 'Backslash') {
            console.log('Using selected item with \\ key');
            const selectedItem = this.getSelectedItem();
            console.log('Selected item:', selectedItem);
            this.useSelectedItemAction();
            return;
        }
        
        // Top row number keys (1-9)
        if (/^[1-9]$/.test(key)) {
            const slotIndex = parseInt(key) - 1;
            console.log(`Selecting slot ${slotIndex} with number key ${key}`);
            this.selectSlot(slotIndex);
            return;
        }
    }
    
    // Directly open help guide without requiring item selection
    openHelpGuideDirectly() {
        const inventory = Inventory.getInstance();
        const helpGuideItem = inventory.items.find(item => item.id === 'help_guide');
        
        if (helpGuideItem) {
            // Close any open windows first
            this.closeAllWindows();
            
            // Open the help guide
            this.openHelpGuide(helpGuideItem);
        } else {
            console.error('Help guide item not found in inventory');
            // Create a temporary item to open the help guide
            const tempHelpGuide = {
                id: 'help_guide',
                name: 'Help Guide',
                description: 'A comprehensive guide on how to play the game.',
                emoji: '❓'
            };
            this.openHelpGuide(tempHelpGuide);
        }
    }
    
    handleInventoryUpdate(event) {
        console.log('Inventory update event received:', event.detail);
        this.forcePopulateFromInventory();
    }
    
    selectSlot(index) {
        console.log(`Attempting to select slot ${index}`);
        if (index < 0 || index >= this.slots) {
            console.warn(`Invalid slot index: ${index}`);
            return;
        }
        
        // Remove selected class from current slot
        const currentSlot = this.inventoryBar.querySelector(`.inventory-slot[data-slot="${this.selectedSlot}"]`);
        if (currentSlot) {
            currentSlot.classList.remove('selected');
        }
        
        // Add selected class to new slot
        this.selectedSlot = index;
        const newSlot = this.inventoryBar.querySelector(`.inventory-slot[data-slot="${this.selectedSlot}"]`);
        if (newSlot) {
            newSlot.classList.add('selected');
            console.log(`Selected slot ${index}`);
        } else {
            console.error(`Could not find slot element for index ${index}`);
        }
    }
    
    getSelectedItem() {
        console.log('Getting selected item from slot:', this.selectedSlot);
        console.log('Hotbar items:', this.hotbarItems);
        console.log('Full inventory items:', this.inventory.items);
        
        const selectedItem = this.hotbarItems[this.selectedSlot];
        console.log('Selected item:', selectedItem);
        
        return selectedItem;
    }
    
    setItemInSlot(slot, item) {
        if (slot < 0 || slot >= this.slots) return;
        
        this.hotbarItems[slot] = item ? JSON.parse(JSON.stringify(item)) : null;
        this.updateSlotDisplay(slot);
    }
    
    forcePopulateFromInventory() {
        console.log('Force populating hotbar from inventory');
        const inventoryItems = this.inventory.items || [];
        
        console.log('Current inventory items:', inventoryItems);
        
        // Reset hotbar
        this.hotbarItems = Array(this.slots).fill(null);
        
        // Fill hotbar with up to 10 items from main inventory
        if (inventoryItems.length > 0) {
            // First ensure we find and add all special items that should be present
            const specialItems = [
                'roi_calculator', 
                'trading_journal', 
                'trading_manual', 
                'calculator'
            ];
            
            // Track which slots we've filled
            const filledSlots = new Set();
            
            // First pass: add special items to ensure they're always available
            for (let i = 0; i < specialItems.length; i++) {
                const itemId = specialItems[i];
                const item = inventoryItems.find(item => item.id === itemId);
                
                if (item) {
                    this.hotbarItems[i] = JSON.parse(JSON.stringify(item));
                    filledSlots.add(i);
                    console.log(`Added special item ${item.id} to slot ${i}`);
                }
            }
            
            // Second pass: fill remaining slots with other items
            let nextSlot = 0;
            for (let j = 0; j < inventoryItems.length; j++) {
                // Skip if this item is already one of our special items
                if (specialItems.includes(inventoryItems[j].id)) {
                    continue;
                }
                
                // Find next available slot
                while (filledSlots.has(nextSlot) && nextSlot < this.slots) {
                    nextSlot++;
                }
                
                // If we still have slots available
                if (nextSlot < this.slots) {
                    this.hotbarItems[nextSlot] = JSON.parse(JSON.stringify(inventoryItems[j]));
                    filledSlots.add(nextSlot);
                    console.log(`Added item ${inventoryItems[j].id} to slot ${nextSlot}`);
                    nextSlot++;
                } else {
                    break; // No more slots available
                }
            }
            
            console.log('Final hotbar items after population:', this.hotbarItems);
            this.updateAllSlots();
        } else {
            console.warn('No items found in inventory');
        }
    }
    
    updateSlotDisplay(slot) {
        const slotElement = this.inventoryBar.querySelector(`.inventory-slot[data-slot="${slot}"]`);
        if (!slotElement) {
            console.error(`Slot element not found for slot ${slot}`);
            return;
        }
        
        // Clear the slot
        slotElement.innerHTML = '';
        
        // If there's an item in this slot, display it
        const item = this.hotbarItems[slot];
        if (item) {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            
            // Use emoji if available, otherwise use item name
            if (item.emoji) {
                itemElement.textContent = item.emoji;
            } else {
                itemElement.textContent = item.name.charAt(0);
            }
            
            // Add item count if quantity > 1
            if (item.quantity > 1) {
                const countElement = document.createElement('div');
                countElement.className = 'item-count';
                countElement.textContent = item.quantity;
                itemElement.appendChild(countElement);
            }
            
            // Add tooltip with item name
            itemElement.title = item.name;
            
            slotElement.appendChild(itemElement);
            console.log(`Updated display for slot ${slot} with item:`, item);
        }
    }
    
    updateAllSlots() {
        console.log('Updating all inventory slots');
        for (let i = 0; i < this.slots; i++) {
            this.updateSlotDisplay(i);
        }
    }
    
    useSelectedItem() {
        const selectedItem = this.getSelectedItem();
        if (!selectedItem) return null;
        
        // Reduce quantity by 1
        selectedItem.quantity--;
        
        // If quantity is 0, remove item from slot
        if (selectedItem.quantity <= 0) {
            this.hotbarItems[this.selectedSlot] = null;
        }
        
        // Update display
        this.updateSlotDisplay(this.selectedSlot);
        
        return selectedItem;
    }
    
    openFullInventory() {
        this.inventory.open();
    }
    
    useSelectedItemAction() {
        const selectedItem = this.getSelectedItem();
        if (!selectedItem) {
            console.log('No item selected');
            return;
        }
        
        console.log('Using item:', selectedItem.name);
        
        // Close any open windows first to prevent conflicts
        this.closeAllWindows();
        
        // Handle different item actions based on the item ID
        switch (selectedItem.id) {
            case 'calculator':
                this.openCalculator(selectedItem);
                break;
            case 'roi_calculator':
                this.openROICalculator(selectedItem);
                break;
            case 'trading_journal':
                this.openTradingJournal(selectedItem);
                break;
            case 'trading_manual':
                this.openTradingManual(selectedItem);
                break;
            case 'help_guide':
                this.openHelpGuide(selectedItem);
                break;
            // Add more items and their actions here
            default:
                console.log('No specific action for this item');
                break;
        }
    }
    
    // Add makeDraggable method to make windows draggable
    makeDraggable(element) {
        if (!element) return;
        
        const header = element.querySelector('div:first-child');
        if (!header) return;
        
        header.style.cursor = 'move';
        
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        header.onmousedown = dragMouseDown;
        
        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            
            // Don't start drag if we clicked a button
            if (e.target.tagName === 'BUTTON') return;
            
            // Get the mouse cursor position at startup
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }
        
        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            
            // Calculate the new cursor position
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            // Set the element's new position
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
            element.style.transform = 'none'; // Remove the translate transform
        }
        
        function closeDragElement() {
            // Stop moving when mouse button is released
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
    
    openCalculator(item) {
        console.log(`Opening calculator: ${item.name}`);
        
        // Create calculator container
        const calculatorContainer = document.createElement('div');
        calculatorContainer.id = 'calculator-container';
        calculatorContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #4a4a4a;
            width: 250px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            z-index: 1000;
            font-family: Arial, sans-serif;
            color: white;
            overflow: hidden;
        `;
        
        // Create calculator header
        const header = document.createElement('div');
        header.className = 'calculator-header';
        header.style.cssText = `
            background-color: #333;
            padding: 10px;
            text-align: center;
            font-weight: bold;
            border-bottom: 1px solid #555;
            cursor: move;
        `;
        header.textContent = 'Calculator';
        
        // Create close button
        const closeButton = document.createElement('span');
        closeButton.className = 'calculator-close';
        closeButton.style.cssText = `
            position: absolute;
            right: 10px;
            top: 8px;
            cursor: pointer;
            font-size: 18px;
        `;
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => {
            if (calculatorContainer.parentNode) {
                calculatorContainer.parentNode.removeChild(calculatorContainer);
            }
        });
        
        header.appendChild(closeButton);
        calculatorContainer.appendChild(header);
        
        // Create display
        const display = document.createElement('div');
        display.className = 'calculator-display';
        display.style.cssText = `
            background-color: #222;
            padding: 15px;
            text-align: right;
            font-size: 24px;
            height: 30px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        `;
        display.textContent = '0';
        calculatorContainer.appendChild(display);
        
        // Create buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'calculator-buttons';
        buttonsContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1px;
            background-color: #333;
            padding: 10px;
        `;
        
        // Button values
        const buttons = [
            'C', '÷', '×', '⌫',
            '7', '8', '9', '-',
            '4', '5', '6', '+',
            '1', '2', '3', '=',
            '0', '.', '(', ')'
        ];
        
        // Button styles
        const getButtonStyle = (value) => {
            let bgColor;
            if (['C', '⌫'].includes(value)) {
                bgColor = '#e74c3c'; // Red for clear/delete
            } else if (['+', '-', '×', '÷'].includes(value)) {
                bgColor = '#3498db'; // Blue for operators
            } else if (value === '=') {
                bgColor = '#2ecc71'; // Green for equals
            } else if (['(', ')'].includes(value)) {
                bgColor = '#9b59b6'; // Purple for parentheses
            } else {
                bgColor = '#555'; // Grey for numbers and dot
            }
            
            return `
                background-color: ${bgColor};
                color: white;
                border: none;
                padding: 15px;
                font-size: 18px;
                cursor: pointer;
                text-align: center;
                transition: background-color 0.2s;
                user-select: none;
            `;
        };
        
        // Current calculation state
        let currentExpression = '';
        let showingResult = false;
        
        // Update display
        const updateDisplay = (text) => {
            display.textContent = text || '0';
        };
        
        // Add buttons with event listeners
        buttons.forEach(value => {
            const button = document.createElement('div');
            button.className = 'calculator-button';
            button.style.cssText = getButtonStyle(value);
            button.textContent = value;
            
            button.addEventListener('click', () => {
                if (showingResult && !['C', '⌫', '+', '-', '×', '÷'].includes(value)) {
                    currentExpression = '';
                    showingResult = false;
                }
                
                if (value === 'C') {
                    // Clear
                    currentExpression = '';
                    updateDisplay('0');
                } else if (value === '⌫') {
                    // Backspace
                    currentExpression = currentExpression.slice(0, -1);
                    updateDisplay(currentExpression);
                } else if (value === '=') {
                    // Calculate
                    try {
                        // Replace × and ÷ with * and /
                        const evalExpression = currentExpression
                            .replace(/×/g, '*')
                            .replace(/÷/g, '/');
                        
                        const result = eval(evalExpression);
                        updateDisplay(result);
                        currentExpression = result.toString();
                        showingResult = true;
                    } catch (error) {
                        updateDisplay('Error');
                        showingResult = true;
                    }
                } else {
                    // Add to expression
                    currentExpression += value;
                    updateDisplay(currentExpression);
                }
            });
            
            buttonsContainer.appendChild(button);
        });
        
        calculatorContainer.appendChild(buttonsContainer);
        
        // Add to document
        document.body.appendChild(calculatorContainer);
        
        // Make the calculator draggable - ensure we're using the instance method
        if (typeof this.makeDraggable === 'function') {
            try {
                this.makeDraggable(calculatorContainer);
                console.log('Calculator made draggable successfully');
            } catch (error) {
                console.error('Error making calculator draggable:', error);
            }
        } else {
            console.error('makeDraggable method not found on MinecraftInventory instance');
        }
    }
    
    openROICalculator(item) {
        console.log(`Opening ROI calculator: ${item.name}`);
        console.log('ROI calculator item details:', JSON.stringify(item));
        
        try {
            // Create calculator container
            const calcContainer = document.createElement('div');
            calcContainer.id = 'roi-calculator-container';
            calcContainer.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: #1a1a2a;
                border: 3px solid gold;
                border-radius: 10px;
                padding: 20px;
                width: 350px;
                z-index: 2000;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.7);
                color: white;
                font-family: Arial, sans-serif;
            `;
            
            // Create calculator header
            const calcHeader = document.createElement('div');
            calcHeader.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                border-bottom: 1px solid #333;
                padding-bottom: 10px;
            `;
            
            // Calculator title
            const calcTitle = document.createElement('h3');
            calcTitle.textContent = 'ROI Calculator';
            calcTitle.style.cssText = `
                margin: 0;
                color: gold;
                font-size: 18px;
            `;
            
            // Close button
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '×';
            closeBtn.style.cssText = `
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0 5px;
            `;
            closeBtn.onclick = () => {
                document.body.removeChild(calcContainer);
            };
            
            calcHeader.appendChild(calcTitle);
            calcHeader.appendChild(closeBtn);
            
            // Create ROI calculator content
            const calcContent = document.createElement('div');
            
            // Input field style
            const inputStyle = `
                width: 100%;
                background-color: #253025;
                color: #00ff00;
                padding: 8px;
                margin: 5px 0 15px 0;
                border: none;
                border-radius: 5px;
                font-family: monospace;
                font-size: 16px;
            `;
            
            // Label style
            const labelStyle = `
                display: block;
                margin-top: 10px;
                color: #ddd;
                font-size: 14px;
            `;
            
            // Button style
            const buttonStyle = `
                background-color: #357535;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 10px 15px;
                font-size: 16px;
                cursor: pointer;
                margin-top: 15px;
                width: 100%;
            `;
            
            // Create form content
            calcContent.innerHTML = `
                <p style="margin-top: 0; color: #aaa; font-size: 14px;">
                    Calculate your Return on Investment for trades and investments.
                </p>
                
                <label style="${labelStyle}">Initial Investment ($):</label>
                <input type="number" id="initial-investment" style="${inputStyle}" value="1000">
                
                <label style="${labelStyle}">Final Value ($):</label>
                <input type="number" id="final-value" style="${inputStyle}" value="1500">
                
                <label style="${labelStyle}">Time Period (days):</label>
                <input type="number" id="time-period" style="${inputStyle}" value="365">
                
                <button id="calculate-roi" style="${buttonStyle}">Calculate ROI</button>
                
                <div id="roi-results" style="margin-top: 20px; padding: 15px; background-color: #223022; border-radius: 5px; display: none;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>ROI:</span>
                        <span id="roi-percentage" style="font-weight: bold; color: #00ff00;">0%</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Profit/Loss:</span>
                        <span id="profit-loss" style="font-weight: bold;">$0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Annualized ROI:</span>
                        <span id="annualized-roi" style="font-weight: bold; color: #00ff00;">0%</span>
                    </div>
                </div>
            `;
            
            // Add all elements to container
            calcContainer.appendChild(calcHeader);
            calcContainer.appendChild(calcContent);
            
            // Add the calculator to the page
            document.body.appendChild(calcContainer);
            console.log('ROI calculator added to DOM');
            
            // Make the calculator draggable
            this.makeDraggable(calcContainer);
            
            // Add event listener to calculate button
            setTimeout(() => {
                const calculateBtn = document.getElementById('calculate-roi');
                if (calculateBtn) {
                    console.log('Found calculate ROI button, adding event listener');
                    calculateBtn.addEventListener('click', () => {
                        const initialInvestment = parseFloat(document.getElementById('initial-investment').value) || 0;
                        const finalValue = parseFloat(document.getElementById('final-value').value) || 0;
                        const timePeriod = parseFloat(document.getElementById('time-period').value) || 1;
                        
                        console.log('Calculating ROI with values:', {initialInvestment, finalValue, timePeriod});
                        
                        // Calculate ROI
                        const roi = ((finalValue - initialInvestment) / initialInvestment) * 100;
                        const profitLoss = finalValue - initialInvestment;
                        const annualizedRoi = ((Math.pow((finalValue / initialInvestment), (365 / timePeriod))) - 1) * 100;
                        
                        console.log('ROI calculation results:', {roi, profitLoss, annualizedRoi});
                        
                        // Display results
                        document.getElementById('roi-percentage').textContent = roi.toFixed(2) + '%';
                        document.getElementById('profit-loss').textContent = '$' + profitLoss.toFixed(2);
                        document.getElementById('profit-loss').style.color = profitLoss >= 0 ? '#00ff00' : '#ff5555';
                        document.getElementById('annualized-roi').textContent = annualizedRoi.toFixed(2) + '%';
                        document.getElementById('annualized-roi').style.color = annualizedRoi >= 0 ? '#00ff00' : '#ff5555';
                        
                        // Show results
                        document.getElementById('roi-results').style.display = 'block';
                    });
                } else {
                    console.error('Calculate ROI button not found');
                }
            }, 100);
            
            // Allow closing with ESC key
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    document.body.removeChild(calcContainer);
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
            
            console.log('ROI calculator fully initialized');
        } catch (err) {
            console.error('Error creating ROI calculator:', err);
        }
    }
    
    openTradingJournal(item) {
        console.log(`Opening trading journal: ${item.name}`);
        
        // Create journal container
        const journalContainer = document.createElement('div');
        journalContainer.id = 'trading-journal-container';
        journalContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #1a1a2a;
            border: 3px solid #9b59b6;
            border-radius: 10px;
            padding: 20px;
            width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 2000;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.7);
            color: white;
            font-family: Arial, sans-serif;
        `;
        
        // Create journal header
        const journalHeader = document.createElement('div');
        journalHeader.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            border-bottom: 1px solid #333;
            padding-bottom: 10px;
        `;
        
        // Journal title
        const journalTitle = document.createElement('h3');
        journalTitle.textContent = 'Trading Journal';
        journalTitle.style.cssText = `
            margin: 0;
            color: #9b59b6;
            font-size: 20px;
        `;
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0 5px;
        `;
        closeBtn.onclick = () => {
            document.body.removeChild(journalContainer);
        };
        
        journalHeader.appendChild(journalTitle);
        journalHeader.appendChild(closeBtn);
        
        // Create journal content
        const journalContent = document.createElement('div');
        
        // Load existing entries from localStorage
        let journalEntries = [];
        try {
            const savedEntries = localStorage.getItem('tradingJournalEntries');
            if (savedEntries) {
                journalEntries = JSON.parse(savedEntries);
            }
        } catch (e) {
            console.error('Error loading journal entries:', e);
        }
        
        // Style definitions
        const inputStyle = `
            width: 100%;
            background-color: #252535;
            color: white;
            padding: 10px;
            margin: 5px 0 15px 0;
            border: 1px solid #333;
            border-radius: 5px;
            font-family: inherit;
            font-size: 14px;
            box-sizing: border-box;
        `;
        
        const buttonStyle = `
            background-color: #9b59b6;
            color: white;
            border: none;
            border-radius: 5px;
            padding: 10px 15px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 10px;
            margin-right: 10px;
        `;
        
        const entryStyle = `
            background-color: #252535;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 15px;
            border-left: 4px solid #9b59b6;
        `;
        
        // Form to add new entry
        const entryForm = document.createElement('div');
        entryForm.style.cssText = `
            background-color: #202030;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 25px;
        `;
        
        entryForm.innerHTML = `
            <h4 style="margin-top: 0; color: #9b59b6;">Add New Trade Entry</h4>
            
            <div style="display: flex; gap: 10px;">
                <div style="flex: 1;">
                    <label style="display: block; margin-bottom: 5px;">Trade Type</label>
                    <select id="trade-type" style="${inputStyle}">
                        <option value="buy">Buy</option>
                        <option value="sell">Sell</option>
                    </select>
                </div>
                <div style="flex: 1;">
                    <label style="display: block; margin-bottom: 5px;">Asset</label>
                    <input type="text" id="trade-asset" placeholder="e.g. AAPL, BTC, etc." style="${inputStyle}">
                </div>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <div style="flex: 1;">
                    <label style="display: block; margin-bottom: 5px;">Price</label>
                    <input type="number" id="trade-price" placeholder="Price per unit" style="${inputStyle}">
                </div>
                <div style="flex: 1;">
                    <label style="display: block; margin-bottom: 5px;">Quantity</label>
                    <input type="number" id="trade-quantity" placeholder="Number of units" style="${inputStyle}">
                </div>
            </div>
            
            <label style="display: block; margin-bottom: 5px;">Notes</label>
            <textarea id="trade-notes" rows="3" placeholder="Why did you make this trade? What's your strategy?" style="${inputStyle}"></textarea>
            
            <div style="display: flex; justify-content: flex-end;">
                <button id="save-trade" style="${buttonStyle}">Save Trade</button>
            </div>
        `;
        
        // Container for journal entries
        const entriesContainer = document.createElement('div');
        entriesContainer.id = 'journal-entries';
        
        // Function to render entries
        const renderEntries = () => {
            entriesContainer.innerHTML = '';
            
            if (journalEntries.length === 0) {
                entriesContainer.innerHTML = '<p style="color: #888; text-align: center;">No entries yet. Add your first trade!</p>';
                return;
            }
            
            // Sort entries by date, newest first
            journalEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            journalEntries.forEach((entry, index) => {
                const entryElement = document.createElement('div');
                entryElement.style.cssText = entryStyle;
                
                const tradeValue = (entry.price * entry.quantity).toFixed(2);
                const tradeType = entry.type === 'buy' ? 'Bought' : 'Sold';
                const typeColor = entry.type === 'buy' ? '#3498db' : '#e74c3c';
                
                entryElement.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                                <span style="background: ${typeColor}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px; margin-right: 8px;">${entry.type.toUpperCase()}</span>
                                <h4 style="margin: 0; font-size: 16px;">${entry.asset}</h4>
                            </div>
                            <p style="margin: 5px 0; color: #aaa; font-size: 13px;">
                                ${new Date(entry.date).toLocaleString()}
                            </p>
                        </div>
                        <button class="delete-entry" data-index="${index}" style="background: none; border: none; color: #888; cursor: pointer; font-size: 16px;">×</button>
                    </div>
                    <div style="display: flex; margin: 10px 0; font-size: 14px;">
                        <div style="flex: 1;">
                            <div style="color: #888;">Price</div>
                            <div>$${entry.price}</div>
                        </div>
                        <div style="flex: 1;">
                            <div style="color: #888;">Quantity</div>
                            <div>${entry.quantity}</div>
                        </div>
                        <div style="flex: 1;">
                            <div style="color: #888;">Total</div>
                            <div>$${tradeValue}</div>
                        </div>
                    </div>
                    ${entry.notes ? `<div style="margin-top: 10px; font-size: 14px; color: #bbb; border-top: 1px solid #333; padding-top: 10px;">${entry.notes}</div>` : ''}
                `;
                
                entriesContainer.appendChild(entryElement);
            });
            
            // Add event listeners to delete buttons
            entriesContainer.querySelectorAll('.delete-entry').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    journalEntries.splice(index, 1);
                    localStorage.setItem('tradingJournalEntries', JSON.stringify(journalEntries));
                    renderEntries();
                });
            });
        };
        
        // Add elements to the journal
        journalContent.appendChild(entryForm);
        journalContent.appendChild(entriesContainer);
        
        // Add all components to the container
        journalContainer.appendChild(journalHeader);
        journalContainer.appendChild(journalContent);
        
        // Add to document
        document.body.appendChild(journalContainer);
        
        // Make the journal draggable
        this.makeDraggable(journalContainer);
        
        // Initialize the journal
        renderEntries();
        
        // Add event listener to save button
        setTimeout(() => {
            const saveButton = document.getElementById('save-trade');
            if (saveButton) {
                saveButton.addEventListener('click', () => {
                    const typeInput = document.getElementById('trade-type');
                    const assetInput = document.getElementById('trade-asset');
                    const priceInput = document.getElementById('trade-price');
                    const quantityInput = document.getElementById('trade-quantity');
                    const notesInput = document.getElementById('trade-notes');
                    
                    // Validate inputs
                    if (!assetInput.value.trim()) {
                        alert('Please enter an asset name.');
                        return;
                    }
                    
                    if (!priceInput.value || isNaN(priceInput.value) || parseFloat(priceInput.value) <= 0) {
                        alert('Please enter a valid price.');
                        return;
                    }
                    
                    if (!quantityInput.value || isNaN(quantityInput.value) || parseFloat(quantityInput.value) <= 0) {
                        alert('Please enter a valid quantity.');
                        return;
                    }
                    
                    // Create new entry
                    const newEntry = {
                        type: typeInput.value,
                        asset: assetInput.value.trim(),
                        price: parseFloat(priceInput.value),
                        quantity: parseFloat(quantityInput.value),
                        notes: notesInput.value.trim(),
                        date: new Date().toISOString()
                    };
                    
                    // Add to entries and save
                    journalEntries.push(newEntry);
                    localStorage.setItem('tradingJournalEntries', JSON.stringify(journalEntries));
                    
                    // Clear inputs
                    assetInput.value = '';
                    priceInput.value = '';
                    quantityInput.value = '';
                    notesInput.value = '';
                    
                    // Refresh entries display
                    renderEntries();
                });
            }
        }, 100);
        
        // Allow closing with ESC key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(journalContainer);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
    
    openTradingManual(item) {
        console.log(`Opening trading manual: ${item.name}`);
        
        // Create manual container
        const manualContainer = document.createElement('div');
        manualContainer.id = 'trading-manual-container';
        manualContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 800px;
            height: 550px;
            z-index: 2000;
            perspective: 1200px;
        `;
        
        // Create book
        const book = document.createElement('div');
        book.id = 'trading-book';
        book.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            transform-style: preserve-3d;
            transition: transform 0.7s;
        `;
        
        // Create book cover
        const bookCover = document.createElement('div');
        bookCover.id = 'book-cover';
        bookCover.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #722f37 0%, #8b4049 100%);
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20px;
            box-sizing: border-box;
            color: #f1c40f;
            font-family: 'Georgia', serif;
            text-align: center;
            z-index: 100;
            transition: transform 0.7s;
            transform-origin: left center;
        `;
        
        // Add close button to the cover
        const coverCloseBtn = document.createElement('button');
        coverCloseBtn.id = 'cover-close-btn';
        coverCloseBtn.innerHTML = '✕';
        coverCloseBtn.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            background-color: rgba(0, 0, 0, 0.3);
            color: #f1c40f;
            border: 2px solid #f1c40f;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            z-index: 150;
        `;
        coverCloseBtn.addEventListener('mouseover', () => {
            coverCloseBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            coverCloseBtn.style.transform = 'scale(1.1)';
        });
        coverCloseBtn.addEventListener('mouseout', () => {
            coverCloseBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
            coverCloseBtn.style.transform = 'scale(1)';
        });
        
        // Book title and decoration on cover
        bookCover.innerHTML = `
            <div style="margin-bottom: 30px;">
                <div style="font-size: 60px; margin-bottom: 10px;">📚</div>
                <div style="width: 80px; height: 3px; background-color: #f1c40f; margin: 0 auto;"></div>
            </div>
            <h1 style="font-size: 32px; margin: 15px 0;">The Complete<br>Trading Manual</h1>
            <div style="font-size: 20px; font-style: italic; margin: 15px 0;">Master the Markets</div>
            <div style="width: 60px; height: 2px; background-color: #f1c40f; margin: 20px auto;"></div>
            <div style="font-size: 18px;">2024 Edition</div>
            
            <div style="position: absolute; bottom: 40px; width: 100%; text-align: center;">
                <button id="start-reading" style="
                    background-color: #f1c40f;
                    color: #722f37;
                    border: none;
                    padding: 12px 25px;
                    font-size: 18px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-family: 'Georgia', serif;
                    font-weight: bold;
                    transition: all 0.3s;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                ">Open Book</button>
            </div>
        `;
        bookCover.appendChild(coverCloseBtn);
        
        // Create book content area
        const bookContent = document.createElement('div');
        bookContent.id = 'book-content';
        bookContent.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            background-color: #f8f5e9;
            border-radius: 5px 10px 10px 5px;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.4);
            overflow: hidden;
            opacity: 0;
            transition: opacity 0.7s;
        `;
        
        // Add close button to content area
        const contentCloseBtn = document.createElement('button');
        contentCloseBtn.id = 'content-close-btn';
        contentCloseBtn.innerHTML = '✕';
        contentCloseBtn.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            background-color: rgba(114, 47, 55, 0.8);
            color: #f1c40f;
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            z-index: 150;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        contentCloseBtn.addEventListener('mouseover', () => {
            contentCloseBtn.style.backgroundColor = '#8b4049';
            contentCloseBtn.style.transform = 'scale(1.1)';
        });
        contentCloseBtn.addEventListener('mouseout', () => {
            contentCloseBtn.style.backgroundColor = 'rgba(114, 47, 55, 0.8)';
            contentCloseBtn.style.transform = 'scale(1)';
        });
        bookContent.appendChild(contentCloseBtn);
        
        // Create book pages container
        const pagesContainer = document.createElement('div');
        pagesContainer.id = 'pages-container';
        pagesContainer.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.5s;
        `;
        
        // Define chapters
        const chapters = [
            {
                title: "Table of Contents",
                type: "toc"
            },
            {
                title: "Trading Basics",
                content: [
                    "Understanding the fundamentals of trading is essential for success in financial markets.",
                    "Markets are driven by supply and demand. When more participants want to buy than sell, prices rise. When more want to sell than buy, prices fall.",
                    "There are several types of markets you should be familiar with:"
                ],
                list: [
                    "Stock Market: Trading shares of publicly listed companies",
                    "Forex: Trading currency pairs in the foreign exchange market",
                    "Commodities: Trading raw materials like gold, oil, and agricultural products",
                    "Cryptocurrency: Trading digital assets like Bitcoin and Ethereum"
                ]
            },
            {
                title: "Technical Analysis",
                content: [
                    "Technical analysis involves studying price movements and patterns to predict future market behavior.",
                    "It's based on three main principles:",
                    "1. Market action discounts everything - All known information is already reflected in the price.",
                    "2. Prices move in trends - Once established, trends are more likely to continue than reverse.",
                    "3. History tends to repeat itself - Market patterns recur because human psychology remains constant."
                ],
                list: [
                    "Moving Averages - Smooth out price data to identify trends",
                    "Relative Strength Index (RSI) - Measures momentum and overbought/oversold conditions", 
                    "MACD - Shows relationship between two moving averages",
                    "Bollinger Bands - Indicates volatility with dynamic channels"
                ]
            },
            {
                title: "Chart Patterns",
                content: [
                    "Chart patterns form when prices create recognizable formations on a price chart.",
                    "These patterns can signal potential continuation or reversal of the current trend.",
                    "Learning to identify these patterns can give traders an edge in predicting future price movements."
                ],
                list: [
                    "Head and Shoulders - A reversal pattern with three peaks, the middle being the highest",
                    "Double Tops/Bottoms - Reversal patterns where price tests a level twice before reversing",
                    "Triangles - Continuation patterns showing consolidation (ascending, descending, symmetrical)",
                    "Flags and Pennants - Short-term continuation patterns after strong price moves",
                    "Cup and Handle - A bullish continuation pattern resembling a teacup with handle"
                ]
            },
            {
                title: "Risk Management",
                content: [
                    "Risk management is arguably the most important aspect of trading. Even the best strategy will fail without proper risk management.",
                    "The primary goal of risk management is to preserve your trading capital. Remember: You can't trade if you lose all your money.",
                    "The 2% Rule is a fundamental principle: Never risk more than 2% of your trading capital on a single trade. This ensures that a string of losses won't significantly deplete your account."
                ],
                list: [
                    "Position Sizing - Calculate position size based on your risk tolerance",
                    "Stop-Loss Orders - Always use stop-losses to limit potential losses",
                    "Risk/Reward Ratio - Aim for at least a 1:2 risk-to-reward ratio",
                    "Diversification - Spread risk across different markets and assets",
                    "Correlation Awareness - Avoid taking similar positions in highly correlated assets"
                ]
            },
            {
                title: "Trading Psychology",
                content: [
                    "Trading psychology often determines your success more than your strategy. The market will test your psychological fortitude constantly.",
                    "Emotions can sabotage even the best trading plans. Fear and greed are the two most destructive emotions for traders.",
                    "Fear can cause you to miss opportunities or close profitable positions too early. Greed can lead to overtrading, holding losing positions too long, or taking excessive risks.",
                    "Developing emotional discipline takes time and practice. It begins with self-awareness and honest self-assessment."
                ],
                list: [
                    "Fear of Missing Out (FOMO) - Taking impulsive trades from fear of missing opportunities",
                    "Revenge Trading - Trying to quickly recover losses with impulsive trades",
                    "Overconfidence - Taking excessive risks after a winning streak",
                    "Analysis Paralysis - Overthinking decisions to the point of inaction",
                    "Confirmation Bias - Seeking only information that confirms your existing beliefs"
                ]
            },
            {
                title: "Advanced Strategies",
                content: [
                    "Once you've mastered the basics and developed good habits, you can explore more advanced trading strategies.",
                    "Remember that complexity doesn't necessarily mean better results. The most successful trading strategies are often the simplest ones applied with consistency and discipline.",
                    "Focus on mastering one approach before moving to another."
                ],
                list: [
                    "Trend Following - Identifying and trading in the direction of established trends",
                    "Breakout Trading - Entering when price breaks through significant levels with increasing volume",
                    "Mean Reversion - Trading on the assumption that prices will revert to their average",
                    "Swing Trading - Capturing medium-term moves lasting days to weeks",
                    "Scalping - Taking very short-term trades for small profits",
                    "Algorithmic Trading - Using computer algorithms to execute trades based on predefined criteria"
                ]
            },
            {
                title: "Final Thoughts",
                content: [
                    "Trading is a journey, not a destination. Continuous learning and adaptation are essential as markets evolve.",
                    "Success in trading doesn't come overnight. It requires dedication, discipline, and perseverance through inevitable challenges.",
                    "Remember that capital preservation comes first. Protect your trading capital so you can live to trade another day.",
                    "Develop your own trading style that aligns with your personality, risk tolerance, and lifestyle. What works for others may not work for you.",
                    "Above all, maintain a healthy perspective. Trading is just one aspect of life—don't let it consume you or define your self-worth."
                ]
            }
        ];
        
        // Create all pages from chapters
        let pages = [];
        
        // First create the Table of Contents page
        const tocPage = document.createElement('div');
        tocPage.className = 'book-page';
        tocPage.innerHTML = `
            <h2 class="chapter-title">Table of Contents</h2>
            <div class="toc-content">
                ${chapters.slice(1).map((chapter, index) => 
                    `<div class="toc-item" data-page="${index + 1}">
                        <div class="toc-number">${index + 1}</div> 
                        <div class="toc-title">${chapter.title}</div>
                     </div>`
                ).join('')}
            </div>
        `;
        pages.push(tocPage);
        
        // Create the content pages
        chapters.slice(1).forEach((chapter) => {
            const page = document.createElement('div');
            page.className = 'book-page';
            
            let contentHTML = '';
            
            // Add chapter content paragraphs
            if (chapter.content && chapter.content.length) {
                contentHTML += `
                    <div class="chapter-content">
                        ${chapter.content.map(paragraph => `<p>${paragraph}</p>`).join('')}
                    </div>
                `;
            }
            
            // Add list if present
            if (chapter.list && chapter.list.length) {
                contentHTML += `
                    <div class="chapter-list">
                        <ul>
                            ${chapter.list.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
            
            // Combine everything
            page.innerHTML = `
                <h2 class="chapter-title">${chapter.title}</h2>
                ${contentHTML}
            `;
            
            pages.push(page);
        });
        
        // Add all pages to container
        pages.forEach((page, index) => {
            page.dataset.pageNumber = index;
            pagesContainer.appendChild(page);
        });
        
        // Add navigation buttons
        const navigation = document.createElement('div');
        navigation.className = 'book-navigation';
        navigation.style.cssText = `
            position: absolute;
            bottom: 20px;
            width: 100%;
            display: flex;
            justify-content: center;
            gap: 15px;
            z-index: 100;
        `;
        
        navigation.innerHTML = `
            <button id="prev-page" class="page-nav-btn">◄ Previous</button>
            <div id="page-indicator" class="page-indicator">Page 1 of ${pages.length}</div>
            <button id="next-page" class="page-nav-btn">Next ►</button>
            <button id="close-book" class="close-book-btn">Close</button>
        `;
        
        // Add CSS styles
        const styles = document.createElement('style');
        styles.textContent = `
            .book-page {
                padding: 40px;
                display: none;
                height: 100%;
                box-sizing: border-box;
                overflow-y: auto;
                font-family: 'Georgia', serif;
                background-image: 
                    linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px);
                background-size: 20px 20px;
                background-position: 20px 20px;
            }
            
            .book-page.active {
                display: block;
            }
            
            .chapter-title {
                color: #722f37;
                font-size: 28px;
                margin-top: 0;
                margin-bottom: 25px;
                text-align: center;
                border-bottom: 2px solid #ddd;
                padding-bottom: 15px;
            }
            
            .chapter-content p {
                margin-bottom: 15px;
                line-height: 1.6;
                font-size: 16px;
                text-align: justify;
                color: #333;
            }
            
            .chapter-list {
                background-color: rgba(241, 196, 15, 0.1);
                padding: 15px 15px 15px 35px;
                border-radius: 5px;
                margin: 20px 0;
                border-left: 4px solid #f1c40f;
            }
            
            .chapter-list ul {
                margin: 0;
                padding: 0;
            }
            
            .chapter-list li {
                margin-bottom: 10px;
                line-height: 1.5;
                color: #333;
            }
            
            .toc-content {
                margin-top: 30px;
            }
            
            .toc-item {
                display: flex;
                align-items: center;
                margin-bottom: 20px;
                cursor: pointer;
                padding: 10px;
                border-radius: 5px;
                transition: background-color 0.2s;
            }
            
            .toc-item:hover {
                background-color: rgba(241, 196, 15, 0.1);
            }
            
            .toc-number {
                width: 30px;
                height: 30px;
                background-color: #722f37;
                color: #f1c40f;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 15px;
                font-weight: bold;
            }
            
            .toc-title {
                font-size: 18px;
                color: #333;
            }
            
            .page-nav-btn {
                background-color: #722f37;
                color: #f1c40f;
                border: none;
                padding: 8px 15px;
                border-radius: 20px;
                cursor: pointer;
                font-family: 'Georgia', serif;
                font-size: 14px;
                transition: background-color 0.2s;
            }
            
            .page-nav-btn:hover {
                background-color: #8b4049;
            }
            
            .page-nav-btn:disabled {
                background-color: #ccc;
                color: #888;
                cursor: not-allowed;
            }
            
            .page-indicator {
                background-color: #f8f5e9;
                border: 1px solid #ddd;
                padding: 8px 15px;
                border-radius: 20px;
                font-family: 'Georgia', serif;
                font-size: 14px;
                color: #666;
                display: flex;
                align-items: center;
            }
            
            .close-book-btn {
                background-color: #e74c3c;
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 20px;
                cursor: pointer;
                font-family: 'Georgia', serif;
                font-size: 14px;
                transition: background-color 0.2s;
            }
            
            .close-book-btn:hover {
                background-color: #c0392b;
            }
            
            @keyframes pageFlip {
                0% { transform: translateX(0); }
                50% { transform: translateX(-10px); }
                100% { transform: translateX(0); }
            }
        `;
        
        // Add elements to page
        bookContent.appendChild(pagesContainer);
        bookContent.appendChild(navigation);
        book.appendChild(bookCover);
        book.appendChild(bookContent);
        manualContainer.appendChild(styles);
        manualContainer.appendChild(book);
        
        // Add to document
        document.body.appendChild(manualContainer);
        
        // Make the book draggable
        this.makeDraggable(manualContainer);
        
        // Initialize book functionality
        let currentPage = 0;
        let isOpen = false;
        
        // Function to close and remove the manual completely
        const closeAndRemoveManual = () => {
            document.body.removeChild(manualContainer);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keydown', escHandler);
        };
        
        // Function to update page display
        const updatePageDisplay = () => {
            // Hide all pages
            pages.forEach(page => page.classList.remove('active'));
            
            // Show current page
            pages[currentPage].classList.add('active');
            
            // Update page indicator
            document.getElementById('page-indicator').textContent = `Page ${currentPage + 1} of ${pages.length}`;
            
            // Enable/disable navigation buttons
            document.getElementById('prev-page').disabled = currentPage === 0;
            document.getElementById('next-page').disabled = currentPage === pages.length - 1;
            
            // Animate page turning
            pagesContainer.style.animation = 'pageFlip 0.5s ease';
            setTimeout(() => {
                pagesContainer.style.animation = 'none';
            }, 500);
        };
        
        // Function to open the book
        const openBook = () => {
            bookCover.style.transform = 'rotateY(-180deg)';
            bookContent.style.opacity = '1';
            isOpen = true;
            
            // Show first page after book opens
            setTimeout(() => {
                updatePageDisplay();
            }, 700);
        };
        
        // Function to close the book
        const closeBook = () => {
            bookContent.style.opacity = '0';
            
            setTimeout(() => {
                bookCover.style.transform = 'rotateY(0deg)';
                isOpen = false;
            }, 500);
        };
        
        // Add event listeners once DOM is ready
        setTimeout(() => {
            // Open book button
            document.getElementById('start-reading').addEventListener('click', openBook);
            
            // Close buttons
            document.getElementById('cover-close-btn').addEventListener('click', closeAndRemoveManual);
            document.getElementById('content-close-btn').addEventListener('click', () => {
                if (isOpen) {
                    closeBook();
                } else {
                    closeAndRemoveManual();
                }
            });
            
            // Previous page button
            document.getElementById('prev-page').addEventListener('click', () => {
                if (currentPage > 0) {
                    currentPage--;
                    updatePageDisplay();
                }
            });
            
            // Next page button
            document.getElementById('next-page').addEventListener('click', () => {
                if (currentPage < pages.length - 1) {
                    currentPage++;
                    updatePageDisplay();
                }
            });
            
            // Close book button
            document.getElementById('close-book').addEventListener('click', () => {
                closeBook();
            });
            
            // Add click listeners to TOC items
            document.querySelectorAll('.toc-item').forEach(item => {
                item.addEventListener('click', () => {
                    currentPage = parseInt(item.dataset.page);
                    updatePageDisplay();
                });
            });
            
            // Add keyboard navigation
            const handleKeyDown = (e) => {
                if (!isOpen) return;
                
                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    if (currentPage > 0) {
                        currentPage--;
                        updatePageDisplay();
                    }
                } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    if (currentPage < pages.length - 1) {
                        currentPage++;
                        updatePageDisplay();
                    }
                } else if (e.key === 'Home') {
                    currentPage = 0;
                    updatePageDisplay();
                } else if (e.key === 'End') {
                    currentPage = pages.length - 1;
                    updatePageDisplay();
                } else if (e.key === 'Escape') {
                    if (isOpen) {
                        closeBook();
                    } else {
                        closeAndRemoveManual();
                    }
                }
            };
            
            document.addEventListener('keydown', handleKeyDown);
            
            // ESC to close the book completely
            const escHandler = (e) => {
                if (e.key === 'Escape' && !isOpen) {
                    closeAndRemoveManual();
                }
            };
            document.addEventListener('keydown', escHandler);
            
            // Show first page initially
            pages[0].classList.add('active');
            
        }, 100);
    }
    
    openHelpGuide(item) {
        console.log(`Opening help guide: ${item.name}`);
        
        // Add styles to ensure help guide looks good
        const styleId = 'help-guide-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                #help-guide-container {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background-color: #8B4513;
                    width: 700px;
                    max-width: 90vw;
                    height: 500px;
                    max-height: 90vh;
                    border-radius: 10px;
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.7);
                    z-index: 1000;
                    font-family: 'Minecraft', Arial, sans-serif;
                    color: white;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    border: 8px solid #A0522D;
                }
                .help-guide-header {
                    background-color: #5D4037;
                    padding: 10px 20px;
                    text-align: center;
                    font-weight: bold;
                    border-bottom: 4px solid #A0522D;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .help-guide-content {
                    flex: 1;
                    display: flex;
                    background-color: #FFFCF0;
                    border: 4px solid #A0522D;
                    margin: 10px;
                    border-radius: 5px;
                    overflow: hidden;
                    color: #333;
                    position: relative;
                    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
                }
                .help-guide-page {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    position: relative;
                }
                .left-page {
                    border-right: 1px solid #D2B48C;
                }
                .page-number {
                    position: absolute;
                    bottom: 10px;
                    font-size: 12px;
                    color: #777;
                }
                .left-page .page-number {
                    left: 20px;
                }
                .right-page .page-number {
                    right: 20px;
                }
                .help-guide-navigation {
                    display: flex;
                    justify-content: space-between;
                    background-color: #5D4037;
                    padding: 10px 20px;
                    border-top: 4px solid #A0522D;
                }
                .help-guide-navigation button {
                    background-color: #8B4513;
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background-color 0.2s;
                }
                .help-guide-navigation button:hover:not(:disabled) {
                    background-color: #A0522D;
                }
                .help-guide-navigation button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Create help guide container
        const helpGuideContainer = document.createElement('div');
        helpGuideContainer.id = 'help-guide-container';
        
        // Create help guide header
        const header = document.createElement('div');
        header.className = 'help-guide-header';
        header.innerHTML = '<span>Game Help Guide</span>';
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'help-guide-close';
        closeButton.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            font-weight: bold;
        `;
        closeButton.innerHTML = '✖';
        closeButton.addEventListener('click', () => {
            if (helpGuideContainer.parentNode) {
                helpGuideContainer.parentNode.removeChild(helpGuideContainer);
            }
        });
        
        header.appendChild(closeButton);
        helpGuideContainer.appendChild(header);
        
        // Create book content container with book-like appearance
        const contentContainer = document.createElement('div');
        contentContainer.className = 'help-guide-content';
        
        // Create left and right pages
        const leftPage = document.createElement('div');
        leftPage.className = 'help-guide-page left-page';
        
        const rightPage = document.createElement('div');
        rightPage.className = 'help-guide-page right-page';
        
        // Add page numbers
        const leftPageNum = document.createElement('div');
        leftPageNum.className = 'page-number';
        leftPageNum.textContent = '1';
        
        const rightPageNum = document.createElement('div');
        rightPageNum.className = 'page-number';
        rightPageNum.textContent = '2';
        
        leftPage.appendChild(leftPageNum);
        rightPage.appendChild(rightPageNum);
        
        // Add page content - Introduction
        leftPage.innerHTML += `
            <h1 style="color: #8B4513; text-align: center; font-size: 24px; margin-bottom: 20px;">Adventure Game Guide</h1>
            <p style="margin-bottom: 15px;">Welcome to the Adventure Game! This guide will help you understand how to play the game and navigate through the different levels.</p>
            <h2 style="color: #8B4513; font-size: 18px; margin: 15px 0 10px 0;">Basic Controls</h2>
            <ul style="padding-left: 20px; margin-bottom: 15px;">
                <li style="margin-bottom: 8px;"><strong>W, A, S, D</strong> - Move your character</li>
                <li style="margin-bottom: 8px;"><strong>1-9 Keys</strong> - Select inventory slots</li>
                <li style="margin-bottom: 8px;"><strong>Backslash (\\)</strong> - Use selected item</li>
                <li style="margin-bottom: 8px;"><strong>Period (.)</strong> - Open full inventory</li>
                <li style="margin-bottom: 8px;"><strong>Click</strong> - Interact with NPCs</li>
            </ul>
        `;
        
        rightPage.innerHTML += `
            <h2 style="color: #8B4513; font-size: 18px; margin: 15px 0 10px 0;">Game Objectives</h2>
            <p style="margin-bottom: 15px;">Your main objectives in this game are:</p>
            <ol style="padding-left: 20px; margin-bottom: 15px;">
                <li style="margin-bottom: 8px;">Explore different levels</li>
                <li style="margin-bottom: 8px;">Interact with NPCs to learn about trading</li>
                <li style="margin-bottom: 8px;">Collect items and tools for your inventory</li>
                <li style="margin-bottom: 8px;">Use trading tools to make decisions</li>
                <li style="margin-bottom: 8px;">Complete mini-games and challenges</li>
            </ol>
            <h2 style="color: #8B4513; font-size: 18px; margin: 15px 0 10px 0;">Levels</h2>
            <p style="margin-bottom: 15px;">The game has multiple levels including:</p>
            <ul style="padding-left: 20px;">
                <li style="margin-bottom: 8px;"><strong>Airport</strong> - Starting area</li>
                <li style="margin-bottom: 8px;"><strong>Retro City</strong> - Play mini-games</li>
                <li style="margin-bottom: 8px;"><strong>Silicon Valley</strong> - Learn about tech investments</li>
            </ul>
        `;
        
        // Add pages to content container
        contentContainer.appendChild(leftPage);
        contentContainer.appendChild(rightPage);
        
        // Add navigation buttons at bottom
        const navContainer = document.createElement('div');
        navContainer.className = 'help-guide-navigation';
        
        // Previous page button
        const prevButton = document.createElement('button');
        prevButton.textContent = '◀ Previous Page';
        prevButton.style.cssText = `
            background-color: #8B4513;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.2s;
        `;
        prevButton.addEventListener('mouseover', () => {
            prevButton.style.backgroundColor = '#A0522D';
        });
        prevButton.addEventListener('mouseout', () => {
            prevButton.style.backgroundColor = '#8B4513';
        });
        
        // Next page button
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next Page ▶';
        nextButton.style.cssText = `
            background-color: #8B4513;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.2s;
        `;
        nextButton.addEventListener('mouseover', () => {
            nextButton.style.backgroundColor = '#A0522D';
        });
        nextButton.addEventListener('mouseout', () => {
            nextButton.style.backgroundColor = '#8B4513';
        });
        
        navContainer.appendChild(prevButton);
        navContainer.appendChild(nextButton);
        
        // Add content and navigation to container
        helpGuideContainer.appendChild(contentContainer);
        helpGuideContainer.appendChild(navContainer);
        
        // Add to document
        document.body.appendChild(helpGuideContainer);
        
        // Make the help guide draggable
        this.makeDraggable(helpGuideContainer);
    }
    
    consumeItem(item) {
        // Apply the item's effect
        alert(`Using ${item.name}: ${item.description}`);
        
        // Decrease quantity
        this.useSelectedItem();
    }
    
    useItem(item) {
        // Generic use message
        alert(`Using ${item.name}: ${item.description}`);
        
        // For non-consumable items, we don't reduce quantity
        // But you could add effects here
        
        // For demonstration, let's animate the slot
        const slotElement = this.inventoryBar.querySelector(`.inventory-slot[data-slot="${this.selectedSlot}"]`);
        if (slotElement) {
            slotElement.style.animation = 'itemUse 0.5s';
            setTimeout(() => {
                slotElement.style.animation = '';
            }, 500);
        }
    }
}

export default MinecraftInventory; 