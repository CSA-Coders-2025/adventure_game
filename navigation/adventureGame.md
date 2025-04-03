---
layout: base
title: Adventure Game
permalink: /gamify/adventureGame
---

<link rel="stylesheet" href="{{site.baseurl}}/assets/css/game.css">

<div id="gameContainer">
    <div id="promptDropDown" class="promptDropDown" style="z-index: 9999"></div>
    <canvas id='gameCanvas'></canvas>
    
    <!-- Minecraft-style inventory bar -->
    <div id="inventory-bar">
        <div class="inventory-slot selected" data-slot="0"></div>
        <div class="inventory-slot" data-slot="1"></div>
        <div class="inventory-slot" data-slot="2"></div>
        <div class="inventory-slot" data-slot="3"></div>
        <div class="inventory-slot" data-slot="4"></div>
        <div class="inventory-slot" data-slot="5"></div>
        <div class="inventory-slot" data-slot="6"></div>
        <div class="inventory-slot" data-slot="7"></div>
        <div class="inventory-slot" data-slot="8"></div>
        <div class="inventory-slot" data-slot="9"></div>
    </div>
</div>

<script type="module">
    import Game from '{{site.baseurl}}/assets/js/adventureGame/Game.js';
    import * as config from '{{site.baseurl}}/assets/js/api/config.js';
    import Inventory from '{{site.baseurl}}/assets/js/adventureGame/Inventory.js';
    import MinecraftInventory from '{{site.baseurl}}/assets/js/adventureGame/MinecraftInventory.js';

    const environment = {
        path: "{{site.baseurl}}",
        pythonURI: config.pythonURI,
        javaURI: config.javaURI,
        fetchOptions: config.fetchOptions,
        gameContainer: document.getElementById("gameContainer"),
        gameCanvas: document.getElementById("gameCanvas")
    };
    console.log(config.javaURI);
    
    // Start the game
    const gameInstance = Game.main(environment);
    
    // Fix z-index for character and NPC elements
    setTimeout(() => {
        const gameContainer = document.getElementById("gameContainer");
        const canvases = gameContainer.querySelectorAll("canvas");
        canvases.forEach(canvas => {
            if (canvas.id !== 'gameCanvas') {
                canvas.style.zIndex = "50";
            }
        });
    }, 1000);
    
    // Additional safety check to ensure inventory loads after delay
    setTimeout(() => {
        console.log("Safety check: Ensuring inventory is loaded with items");
        const inventory = Inventory.getInstance();
        const minecraftInventory = MinecraftInventory.getInstance();
        
        // Try to force a refresh of the minecraft inventory
        document.dispatchEvent(new CustomEvent('inventoryUpdated', {
            detail: { items: inventory.items }
        }));
        
        // Also try to directly update all slots
        if (minecraftInventory && typeof minecraftInventory.forcePopulateFromInventory === 'function') {
            minecraftInventory.forcePopulateFromInventory();
        }
    }, 3000);
</script>
