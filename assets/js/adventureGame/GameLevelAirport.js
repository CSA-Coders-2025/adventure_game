// To build GameLevels, each contains GameObjects from below imports
import GamEnvBackground from './GameEnvBackground.js';
import Player from './Player.js';
import Npc from './Npc.js';
import Quiz from './Quiz.js';
import GameControl from './GameControl.js';
import GameLevelSiliconValley from './GameLevelSiliconValley.js';
import FloorItemManager from './FloorItemManager.js';

class GameLevelAirport {
  constructor(gameEnv) {
    // Values dependent on this.gameEnv.create()
    let width = gameEnv.innerWidth;
    let height = gameEnv.innerHeight;
    let path = gameEnv.path;

    // Background data
    const image_src_desert = path + "/images/gamify/airport.jpg";
    const image_data_desert = {
        id: 'Airport-Background',
        src: image_src_desert,
        pixels: {height: 580, width: 386}
    };
    // Player data for Chillguy
    const sprite_src_chillguy = path + "/images/gamify/chillguy.png";
    const CHILLGUY_SCALE_FACTOR = 5;
    const sprite_data_chillguy = {
        id: 'Chill Guy',
        greeting: "Hi I am Chill Guy, the desert wanderer. I am looking for wisdom and adventure!",
        src: sprite_src_chillguy,
        SCALE_FACTOR: CHILLGUY_SCALE_FACTOR,
        STEP_FACTOR: 1000,
        ANIMATION_RATE: 50,
        INIT_POSITION: { x: 0, y: height - (height/CHILLGUY_SCALE_FACTOR) }, 
        pixels: {height: 384, width: 512},
        orientation: {rows: 3, columns: 4 },
        down: {row: 0, start: 0, columns: 3 },
        downRight: {row: 1, start: 0, columns: 3, rotate: Math.PI/16 },
        downLeft: {row: 2, start: 0, columns: 3, rotate: -Math.PI/16 },
        left: {row: 2, start: 0, columns: 3 },
        right: {row: 1, start: 0, columns: 3 },
        up: {row: 3, start: 0, columns: 3 },
        upLeft: {row: 2, start: 0, columns: 3, rotate: Math.PI/16 },
        upRight: {row: 1, start: 0, columns: 3, rotate: -Math.PI/16 },
        hitbox: { widthPercentage: 0.45, heightPercentage: 0.2 },
        keypress: { up: 87, left: 65, down: 83, right: 68 }
    };
    // NPC data for Pilot
    const sprite_src_pilot = path + "/images/gamify/pilot.png";
    const sprite_greet_pilot = "Greetings passenger! Ready to travel to Silicon Valley?";
    const sprite_data_pilot = {
        id: 'Pilot',
        greeting: sprite_greet_pilot,
        src: sprite_src_pilot,
        SCALE_FACTOR: 5,
        ANIMATION_RATE: 50,
        pixels: {height: 460, width: 422},
        INIT_POSITION: { x: (width / 10), y: (height * 0.2)},
        orientation: {rows: 1, columns: 1 },
        down: {row: 0, start: 0, columns: 1 },
        hitbox: { widthPercentage: 0.1, heightPercentage: 0.1 },
        reaction: function() {
          alert(sprite_greet_pilot);
        },
        interact: function() {
          console.log("Starting transition to Silicon Valley...");
          
          // Get the game control instance
          const primaryGame = gameEnv.gameControl;
          
          // Create the new level array with Silicon Valley
          const levelArray = [GameLevelSiliconValley];
          
          // Create a new game control with the Silicon Valley level
          const gameInGame = new GameControl(gameEnv.game, levelArray);
          
          // Pause the current game
          primaryGame.pause();
          
          // Start the new level
          gameInGame.start();
          
          // Set up the game over callback to resume the primary game
          gameInGame.gameOver = function() {
            console.log("Returning from Silicon Valley to Airport...");
            primaryGame.resume();
          };
        }
    };
    // NPC data for Worker
    const sprite_src_worker = path + "/images/gamify/worker.png"; // Ensure this file exists
    const sprite_greet_worker = "Hey! You look like your a chill guy! The plane on the runway leaves to Silicon Valley soon, better catch it! Press 'e' when you talk to the pilot and other people you meet! Safe travels! ";
    const sprite_data_worker = {
        id: 'Worker',
        greeting: sprite_greet_worker,
        src: sprite_src_worker,
        SCALE_FACTOR: 3.5,
        ANIMATION_RATE: 50,
        pixels: {height: 400, width: 400},
        INIT_POSITION: { x: width * 0.6, y: height * 0.7 },
        orientation: {rows: 1, columns: 1 },
        down: {row: 0, start: 0, columns: 1 },
        hitbox: { widthPercentage: 0.1, heightPercentage: 0.1 },
        // Item dropping functionality
        dropItems: [
            {
                id: 'airport_keycard',
                name: 'Airport Access Keycard',
                description: 'A special keycard that grants access to restricted airport areas.',
                emoji: '🔑',
                stackable: false,
                value: 500,
                quantity: 1
            },
            {
                id: 'trading_chip',
                name: 'Trading Chip',
                description: 'A valuable chip used for trading with NPCs in Silicon Valley.',
                emoji: '💰',
                stackable: true,
                value: 100,
                quantity: 5
            },
            {
                id: 'tech_manual',
                name: 'Tech Manual',
                description: 'Contains valuable information about Silicon Valley technologies.',
                emoji: '📘',
                stackable: false,
                value: 250,
                quantity: 1
            }
        ],
        dropChance: 1.0, // 100% chance to drop an item
        reaction: function () {
            alert(sprite_greet_worker);
        },
        interact: function () {
            // Create the instructions popup
            const instructionsDiv = document.createElement('div');
            instructionsDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, rgba(0, 32, 64, 0.98) 0%, rgba(0, 16, 32, 0.98) 100%);
                color: white;
                border-radius: 15px;
                width: 75%;
                max-width: 1000px;
                max-height: 85%;
                overflow-y: auto;
                z-index: 1000;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 255, 128, 0.2);
                border: 1px solid rgba(0, 255, 128, 0.3);
                padding: 0;
                font-family: 'Segoe UI', Arial, sans-serif;
                opacity: 0;
                animation: fadeIn 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards;
            `;

            // Create the content
            instructionsDiv.innerHTML = `
                <style>
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translate(-50%, -45%); }
                        to { opacity: 1; transform: translate(-50%, -50%); }
                    }
                    
                    @keyframes slideIn {
                        from { transform: translateX(-20px); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }

                    @keyframes tickerScroll {
                        0% { transform: translateX(100%); }
                        100% { transform: translateX(-100%); }
                    }
                    
                    .panel-header {
                        position: sticky;
                        top: 0;
                        background: linear-gradient(135deg, rgba(0, 32, 64, 0.98) 0%, rgba(0, 16, 32, 0.98) 100%);
                        padding: 20px 25px 5px;
                        border-bottom: 1px solid rgba(0, 255, 128, 0.2);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        z-index: 1;
                    }
                    
                    .panel-content {
                        padding: 5px 25px 30px;
                    }
                    
                    .panel-section {
                        background: rgba(0, 255, 128, 0.03);
                        border-radius: 10px;
                        padding: 20px;
                        margin-bottom: 20px;
                        border-left: 3px solid #00ff80;
                        position: relative;
                        overflow: hidden;
                        animation: slideIn 0.5s ease forwards;
                        opacity: 0;
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                    }

                    .panel-section:hover {
                        transform: translateX(5px);
                        box-shadow: 0 5px 15px rgba(0, 255, 128, 0.1);
                    }
                    
                    .panel-section:nth-child(1) { animation-delay: 0.2s; }
                    .panel-section:nth-child(2) { animation-delay: 0.3s; }
                    .panel-section:nth-child(3) { animation-delay: 0.4s; }
                    
                    .start-button {
                        background: linear-gradient(45deg, #00ff80, #00cc66);
                        color: #003300;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 18px;
                        font-weight: 600;
                        transition: all 0.3s ease;
                        display: block;
                        margin: 20px auto;
                        text-align: center;
                        box-shadow: 0 4px 15px rgba(0, 255, 128, 0.3);
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .start-button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px rgba(0, 255, 128, 0.4);
                    }
                    
                    .start-button:active {
                        transform: translateY(0);
                    }

                    .start-button::after {
                        content: '';
                        position: absolute;
                        top: -50%;
                        left: -50%;
                        width: 200%;
                        height: 200%;
                        background: linear-gradient(
                            45deg,
                            transparent,
                            rgba(255, 255, 255, 0.1),
                            transparent
                        );
                        transform: rotate(45deg);
                        animation: buttonShine 3s infinite;
                    }

                    @keyframes buttonShine {
                        0% { transform: translateX(-100%) rotate(45deg); }
                        100% { transform: translateX(100%) rotate(45deg); }
                    }

                    .stock-ticker {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        background: rgba(0, 255, 128, 0.1);
                        padding: 8px 0;
                        font-family: 'Courier New', monospace;
                        font-size: 14px;
                        color: #00ff80;
                        overflow: hidden;
                        white-space: nowrap;
                        border-bottom: 1px solid rgba(0, 255, 128, 0.2);
                    }

                    .ticker-content {
                        display: inline-block;
                        animation: tickerScroll 20s linear infinite;
                    }

                    .positive-change {
                        color: #00ff80;
                        font-weight: bold;
                    }

                    .negative-change {
                        color: #ff4444;
                        font-weight: bold;
                    }

                    .market-status {
                        position: absolute;
                        top: 8px;
                        right: 15px;
                        font-size: 12px;
                        color: #00ff80;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    }

                    .market-status::before {
                        content: '';
                        display: inline-block;
                        width: 8px;
                        height: 8px;
                        background: #00ff80;
                        border-radius: 50%;
                        animation: pulse 2s infinite;
                    }

                    @keyframes pulse {
                        0% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.2); opacity: 0.7; }
                        100% { transform: scale(1); opacity: 1; }
                    }

                    .partner-card {
                        background: rgba(0, 255, 128, 0.05);
                        border-radius: 8px;
                        padding: 10px;
                        margin: 5px 0;
                        transition: all 0.3s ease;
                    }

                    .partner-card:hover {
                        background: rgba(0, 255, 128, 0.1);
                        transform: translateX(5px);
                    }

                    .partner-icon {
                        display: inline-block;
                        margin-right: 10px;
                        font-size: 16px;
                    }

                    .partner-name {
                        color: #00ff80;
                        font-weight: 600;
                    }

                    .partner-role {
                        color: rgba(255, 255, 255, 0.7);
                        font-size: 13px;
                    }
                </style>
                
                <div class="stock-ticker">
                    <div class="ticker-content">
                        <span class="positive-change">📈 AAPL +2.5%</span> | 
                        <span class="positive-change">GOOGL +1.8%</span> | 
                        <span class="positive-change">MSFT +3.2%</span> | 
                        <span class="positive-change">AMZN +1.9%</span> | 
                        <span class="negative-change">TSLA -4.1%</span> |
                        <span class="positive-change">NVDA +5.2%</span> |
                        <span class="positive-change">META +2.8%</span> |
                        <span class="negative-change">NFLX -1.5%</span> 📉
                    </div>
                    <div class="market-status">Market Open</div>
                </div>
                
                <div class="panel-header">
                    <h2 style="
                        margin: 0;
                        font-size: 24px;
                        font-weight: 600;
                        color: white;
                        display: flex;
                        align-items: center;
                    ">
                        <span style="
                            background: linear-gradient(45deg, #00ff80, #00cc66);
                            border-radius: 50%;
                            width: 40px;
                            height: 40px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-right: 15px;
                            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
                            font-size: 20px;
                        ">💼</span>
                        Financial Adventure
                    </h2>
                </div>
                
                <div class="panel-content">
                    <div class="panel-section">
                        <h3 style="
                            margin: 0 0 15px 0;
                            color: #00ff80;
                            font-size: 20px;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                        ">
                            <span style="
                                background: linear-gradient(45deg, #00ff80, #00cc66);
                                border-radius: 50%;
                                width: 32px;
                                height: 32px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                margin-right: 12px;
                                font-size: 16px;
                                color: #003300;
                            ">⌨️</span>
                            Trading Controls
                        </h3>
                        <p style="margin: 0; line-height: 1.8; color: rgba(255, 255, 255, 0.9); font-size: 15px;">
                            • WASD - Navigate the trading floor<br>
                            • E/U - Interact with financial advisors<br>
                            • ESC - Exit trading sessions
                        </p>
                    </div>
                    
                    <div class="panel-section">
                        <h3 style="
                            margin: 0 0 15px 0;
                            color: #00ff80;
                            font-size: 20px;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                        ">
                            <span style="
                                background: linear-gradient(45deg, #00ff80, #00cc66);
                                border-radius: 50%;
                                width: 32px;
                                height: 32px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                margin-right: 12px;
                                font-size: 16px;
                                color: #003300;
                            ">📊</span>
                            Trading Partners
                        </h3>
                        <div class="partner-card">
                            <span class="partner-icon">📈</span>
                            <span class="partner-name">Market Analyst</span>
                            <span class="partner-role">Stock Trading Game</span>
                        </div>
                        <div class="partner-card">
                            <span class="partner-icon">💼</span>
                            <span class="partner-name">Investment Banker</span>
                            <span class="partner-role">Portfolio Management</span>
                        </div>
                        <div class="partner-card">
                            <span class="partner-icon">📚</span>
                            <span class="partner-name">Financial Advisor</span>
                            <span class="partner-role">Investment Quizzes</span>
                        </div>
                        <div class="partner-card">
                            <span class="partner-icon">₿</span>
                            <span class="partner-name">Crypto Expert</span>
                            <span class="partner-role">Cryptocurrency Trading</span>
                        </div>
                        <div class="partner-card">
                            <span class="partner-icon">⚠️</span>
                            <span class="partner-name">Risk Manager</span>
                            <span class="partner-role">Risk Assessment Games</span>
                        </div>
                    </div>
                    
                    <button id="startGameBtn" class="start-button">Continue</button>
                    
                    <div style="
                        text-align: center;
                        margin-top: 20px;
                        font-size: 12px;
                        color: rgba(255, 255, 255, 0.5);
                    ">
                        Press ESC key or click outside to close
                    </div>
                </div>
            `;

            // Add the popup to the document
            document.body.appendChild(instructionsDiv);

            // Add click handler for the start button
            document.getElementById('startGameBtn').addEventListener('click', () => {
                instructionsDiv.style.animation = 'fadeOut 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards';
                setTimeout(() => {
                    instructionsDiv.remove();
                }, 400);
            });

            // Add ESC key handler
            const escKeyHandler = (e) => {
                if (e.key === 'Escape') {
                    instructionsDiv.style.animation = 'fadeOut 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards';
                    setTimeout(() => {
                        instructionsDiv.remove();
                    }, 400);
                    document.removeEventListener('keydown', escKeyHandler);
                }
            };
            document.addEventListener('keydown', escKeyHandler);
        }
    };
    // List of objects defnitions for this level
    this.classes = [
      { class: GamEnvBackground, data: image_data_desert },
      { class: Player, data: sprite_data_chillguy },
      { class: Npc, data: sprite_data_pilot },
      { class: Npc, data: sprite_data_worker }
    ];

    // Initialize the floor item manager
    this.initialize = function() {
      console.log('Initializing GameLevelAirport...');
      const floorItemManager = FloorItemManager.getInstance();
      console.log('FloorItemManager instance:', floorItemManager);
    };
  }
}

export default GameLevelAirport;