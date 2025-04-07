// To build GameLevels, each contains GameObjects from below imports
import GamEnvBackground from './GameEnvBackground.js';
import Player from './Player.js';
import Npc from './Npc.js';
import Quiz from './Quiz.js';
import GameControl from './GameControl.js';
import GameLevelSiliconValley from './GameLevelSiliconValley.js';
import FloorItemManager from './FloorItemManager.js';
import { javaURI } from '../api/config.js';

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
    const sprite_greet_worker = "Hey there! I'm a stock market advisor. The plane to Silicon Valley is about to depart - that's where all the big tech stocks are! Remember to press 'e' to interact with people and check your inventory with 'i'. Good luck with your investments!";
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
                id: 'stock_guide',
                name: 'Stock Market Guide',
                description: 'A comprehensive guide to understanding stock market basics and tech investments.',
                emoji: '📈',
                stackable: false,
                value: 1000,
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
                id: 'market_analysis',
                name: 'Market Analysis Report',
                description: 'Latest analysis of tech stocks and market trends in Silicon Valley.',
                emoji: '📊',
                stackable: false,
                value: 500,
                quantity: 1
            }
        ],
        dropChance: 1.0, // 100% chance to drop an item
        reaction: function () {
            alert(sprite_greet_worker);
        },
        interact: function () {
            // Create the stock market UI popup
            const stockUI = document.createElement('div');
            stockUI.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, rgba(0, 32, 64, 0.98) 0%, rgba(0, 16, 32, 0.98) 100%);
                color: white;
                border-radius: 15px;
                width: 80%;
                max-width: 1200px;
                max-height: 85%;
                overflow-y: auto;
                z-index: 1000;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 255, 128, 0.2);
                border: 1px solid rgba(0, 255, 128, 0.3);
                padding: 20px;
                font-family: 'Segoe UI', Arial, sans-serif;
                opacity: 0;
                animation: fadeIn 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards;
            `;

            // Add stock market UI content
            stockUI.innerHTML = `
                <style>
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translate(-50%, -45%); }
                        to { opacity: 1; transform: translate(-50%, -50%); }
                    }
                    
                    .stock-ticker {
                        background: rgba(0, 255, 128, 0.1);
                        padding: 10px;
                        margin-bottom: 20px;
                        border-radius: 8px;
                        overflow: hidden;
                        white-space: nowrap;
                    }
                    
                    .ticker-content {
                        display: inline-block;
                        animation: tickerScroll 20s linear infinite;
                    }
                    
                    .stock-item {
                        display: inline-block;
                        margin: 0 20px;
                        color: #00ff80;
                    }
                    
                    .positive {
                        color: #00ff80;
                    }
                    
                    .negative {
                        color: #ff4444;
                    }
                    
                    .stock-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 20px;
                        margin-top: 20px;
                    }
                    
                    .stock-card {
                        background: rgba(0, 255, 128, 0.05);
                        padding: 15px;
                        border-radius: 8px;
                        border: 1px solid rgba(0, 255, 128, 0.2);
                        cursor: pointer;
                        transition: transform 0.2s, box-shadow 0.2s;
                    }
                    
                    .stock-card:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 5px 15px rgba(0, 255, 128, 0.2);
                    }
                    
                    .stock-card h3 {
                        margin: 0 0 10px 0;
                        color: #00ff80;
                    }
                    
                    .stock-price {
                        font-size: 24px;
                        font-weight: bold;
                        margin: 10px 0;
                    }
                    
                    .stock-change {
                        font-size: 16px;
                    }
                    
                    .close-button {
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        background: none;
                        border: none;
                        color: white;
                        font-size: 24px;
                        cursor: pointer;
                        padding: 5px;
                    }

                    .trading-controls {
                        margin-top: 20px;
                        padding: 20px;
                        background: rgba(0, 255, 128, 0.05);
                        border-radius: 8px;
                        border: 1px solid rgba(0, 255, 128, 0.2);
                    }

                    .quantity-input {
                        width: 100px;
                        padding: 8px;
                        margin: 10px;
                        background: rgba(0, 255, 128, 0.1);
                        border: 1px solid rgba(0, 255, 128, 0.3);
                        border-radius: 4px;
                        color: white;
                    }

                    .trade-button {
                        padding: 10px 20px;
                        margin: 5px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: bold;
                        transition: background-color 0.3s;
                    }

                    .buy-button {
                        background-color: #00ff80;
                        color: #003300;
                    }

                    .sell-button {
                        background-color: #ff4444;
                        color: white;
                    }

                    .trade-button:hover {
                        opacity: 0.9;
                    }

                    .status-message {
                        margin-top: 10px;
                        padding: 10px;
                        border-radius: 4px;
                        text-align: center;
                    }

                    .success {
                        background-color: rgba(0, 255, 128, 0.2);
                        color: #00ff80;
                    }

                    .error {
                        background-color: rgba(255, 68, 68, 0.2);
                        color: #ff4444;
                    }

                    .search-container {
                        display: flex;
                        gap: 10px;
                        margin-bottom: 20px;
                    }

                    .search-input {
                        flex: 1;
                        padding: 10px;
                        background: rgba(0, 255, 128, 0.1);
                        border: 1px solid rgba(0, 255, 128, 0.3);
                        border-radius: 4px;
                        color: white;
                        font-size: 16px;
                    }

                    .search-button {
                        padding: 10px 20px;
                        background: #00ff80;
                        color: #003300;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: bold;
                        transition: opacity 0.3s;
                    }

                    .search-button:hover {
                        opacity: 0.9;
                    }

                    .portfolio-section {
                        margin-top: 20px;
                        padding: 20px;
                        background: rgba(0, 255, 128, 0.05);
                        border-radius: 8px;
                        border: 1px solid rgba(0, 255, 128, 0.2);
                    }

                    .portfolio-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 15px;
                    }

                    .portfolio-value {
                        font-size: 24px;
                        color: #00ff80;
                        font-weight: bold;
                    }

                    .portfolio-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                    }

                    .portfolio-table th,
                    .portfolio-table td {
                        padding: 10px;
                        text-align: left;
                        border-bottom: 1px solid rgba(0, 255, 128, 0.2);
                    }

                    .portfolio-table th {
                        color: #00ff80;
                    }

                    .refresh-button {
                        padding: 8px 15px;
                        background: #00ff80;
                        color: #003300;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: bold;
                        transition: opacity 0.3s;
                    }

                    .refresh-button:hover {
                        opacity: 0.9;
                    }
                </style>
                
                <button class="close-button" onclick="this.parentElement.remove()">×</button>
                
                <div class="search-container">
                    <input type="text" id="stock-search" class="search-input" placeholder="Enter stock symbol (e.g., AAPL, GOOGL, MSFT)" oninput="this.value = this.value.toUpperCase()">
                    <button class="search-button" onclick="searchStock()">Search</button>
                </div>
                
                <div id="stock-results" class="stock-grid">
                    <!-- Stock cards will be dynamically added here -->
                </div>

                <div class="trading-controls">
                    <h3 style="color: #00ff80; margin-bottom: 15px;">Trading Controls</h3>
                    <input type="number" id="quantity-input" class="quantity-input" placeholder="Quantity" min="1" value="1">
                    <button class="trade-button buy-button" onclick="handleBuyClick()">Buy</button>
                    <button class="trade-button sell-button" onclick="handleSellClick()">Sell</button>
                    <div id="trade-status" class="status-message"></div>
                </div>

                <div class="portfolio-section">
                    <div class="portfolio-header">
                        <h3 style="color: #00ff80; margin: 0;">Your Portfolio</h3>
                        <div>
                            <span class="portfolio-value" id="total-portfolio-value">Loading...</span>
                            <button class="refresh-button" onclick="updatePortfolio()">↻</button>
                        </div>
                    </div>
                    <table class="portfolio-table">
                        <thead>
                            <tr>
                                <th>Symbol</th>
                                <th>Shares</th>
                                <th>Current Price</th>
                                <th>Total Value</th>
                                <th>Change</th>
                            </tr>
                        </thead>
                        <tbody id="portfolio-table-body">
                            <!-- Portfolio items will be dynamically added here -->
                        </tbody>
                    </table>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #00ff80;">
                    <p>Press ESC or click the X to close this window</p>
                </div>
            `;

            // Add the popup to the document
            document.body.appendChild(stockUI);

            // Add ESC key handler
            const escKeyHandler = (e) => {
                if (e.key === 'Escape') {
                    stockUI.remove();
                    document.removeEventListener('keydown', escKeyHandler);
                }
            };
            document.addEventListener('keydown', escKeyHandler);

            // Add trading functionality
            window.searchStock = async function() {
                const symbol = document.getElementById('stock-search').value.trim();
                if (!symbol) {
                    const statusElement = document.getElementById('trade-status');
                    statusElement.textContent = 'Please enter a stock symbol.';
                    statusElement.className = 'status-message error';
                    return;
                }

                try {
                    const response = await fetch(javaURI + `/api/stocks/${symbol}`);
                    const data = await response.json();
                    
                    if (!data?.chart?.result?.[0]) {
                        throw new Error('Stock not found');
                    }

                    const stockName = data.chart.result[0].meta.longName;
                    const stockPrice = data.chart.result[0].meta.regularMarketPrice;
                    const percentChange = await getPercentChange(symbol);

                    // Clear previous results
                    const resultsContainer = document.getElementById('stock-results');
                    resultsContainer.innerHTML = '';

                    // Create new stock card
                    const stockCard = document.createElement('div');
                    stockCard.className = 'stock-card';
                    stockCard.onclick = () => selectStock(symbol);
                    stockCard.innerHTML = `
                        <h3>${stockName} (${symbol})</h3>
                        <div class="stock-price">$${stockPrice.toFixed(2)}</div>
                        <div class="stock-change ${percentChange >= 0 ? 'positive' : 'negative'}">${percentChange}%</div>
                    `;

                    resultsContainer.appendChild(stockCard);
                    
                    // Clear any previous status messages
                    const statusElement = document.getElementById('trade-status');
                    statusElement.textContent = '';
                    statusElement.className = 'status-message';
                } catch (error) {
                    console.error('Error fetching stock data:', error);
                    const statusElement = document.getElementById('trade-status');
                    statusElement.textContent = 'Error: Stock not found or service unavailable.';
                    statusElement.className = 'status-message error';
                }
            };

            window.selectStock = async function(symbol) {
                try {
                    const response = await fetch(javaURI + `/api/stocks/${symbol}`);
                    const data = await response.json();
                    const stockName = data?.chart?.result?.[0]?.meta?.longName;
                    const stockPrice = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
                    const percentChange = await getPercentChange(symbol);

                    // Update the selected stock card
                    const selectedCard = document.querySelector(`.stock-card[onclick="selectStock('${symbol}')"]`);
                    if (selectedCard) {
                        selectedCard.querySelector('.stock-price').textContent = `$${stockPrice.toFixed(2)}`;
                        const changeElement = selectedCard.querySelector('.stock-change');
                        changeElement.textContent = `${percentChange}%`;
                        changeElement.className = `stock-change ${percentChange >= 0 ? 'positive' : 'negative'}`;
                    }
                } catch (error) {
                    console.error('Error fetching stock data:', error);
                    const statusElement = document.getElementById('trade-status');
                    statusElement.textContent = 'Error fetching stock data. Please try again.';
                    statusElement.className = 'status-message error';
                }
            };

            window.handleBuyClick = async function() {
                const quantity = document.getElementById('quantity-input').value;
                const selectedStock = document.querySelector('.stock-card.selected');
                if (!selectedStock) {
                    const statusElement = document.getElementById('trade-status');
                    statusElement.textContent = 'Please select a stock first.';
                    statusElement.className = 'status-message error';
                    return;
                }

                const stockSymbol = selectedStock.querySelector('h3').textContent.match(/\(([^)]+)\)/)[1];
                
                try {
                    const credentials = await getCredentialsJava();
                    const email = credentials?.email;
                    if (!email) {
                        throw new Error('User email not found');
                    }

                    const response = await fetch(javaURI + '/stocks/table/addStock', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username: email,
                            quantity: quantity,
                            stockSymbol: stockSymbol
                        })
                    });

                    const statusElement = document.getElementById('trade-status');
                    if (response.ok) {
                        statusElement.textContent = `Successfully bought ${quantity} shares of ${stockSymbol}`;
                        statusElement.className = 'status-message success';
                    } else {
                        statusElement.textContent = 'Failed to buy stock. Please try again.';
                        statusElement.className = 'status-message error';
                    }
                } catch (error) {
                    console.error('Error buying stock:', error);
                    const statusElement = document.getElementById('trade-status');
                    statusElement.textContent = 'Error buying stock. Please try again.';
                    statusElement.className = 'status-message error';
                }
            };

            window.handleSellClick = async function() {
                const quantity = document.getElementById('quantity-input').value;
                const selectedStock = document.querySelector('.stock-card.selected');
                if (!selectedStock) {
                    const statusElement = document.getElementById('trade-status');
                    statusElement.textContent = 'Please select a stock first.';
                    statusElement.className = 'status-message error';
                    return;
                }

                const stockSymbol = selectedStock.querySelector('h3').textContent.match(/\(([^)]+)\)/)[1];
                
                try {
                    const credentials = await getCredentialsJava();
                    const email = credentials?.email;
                    if (!email) {
                        throw new Error('User email not found');
                    }

                    const response = await fetch(javaURI + '/stocks/table/removeStock', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username: email,
                            quantity: quantity,
                            stockSymbol: stockSymbol
                        })
                    });

                    const statusElement = document.getElementById('trade-status');
                    if (response.ok) {
                        statusElement.textContent = `Successfully sold ${quantity} shares of ${stockSymbol}`;
                        statusElement.className = 'status-message success';
                    } else {
                        statusElement.textContent = 'Failed to sell stock. Please try again.';
                        statusElement.className = 'status-message error';
                    }
                } catch (error) {
                    console.error('Error selling stock:', error);
                    const statusElement = document.getElementById('trade-status');
                    statusElement.textContent = 'Error selling stock. Please try again.';
                    statusElement.className = 'status-message error';
                }
            };

            // Add click handlers for stock cards
            document.querySelectorAll('.stock-card').forEach(card => {
                card.addEventListener('click', function() {
                    document.querySelectorAll('.stock-card').forEach(c => c.classList.remove('selected'));
                    this.classList.add('selected');
                });
            });

            // Add portfolio functionality
            window.updatePortfolio = async function() {
                try {
                    const credentials = await getCredentialsJava();
                    const email = credentials?.email;
                    if (!email) {
                        throw new Error('User email not found');
                    }

                    // Get user's stocks
                    const stocksResponse = await fetch(javaURI + `/stocks/table/getStocks?username=${email}`);
                    const stocks = await stocksResponse.json();

                    // Get portfolio value
                    const valueResponse = await fetch(javaURI + `/stocks/table/portfolioValue?username=${email}`);
                    const portfolioValue = await valueResponse.json();

                    // Update total portfolio value
                    document.getElementById('total-portfolio-value').textContent = `$${portfolioValue.toFixed(2)}`;

                    // Clear and update portfolio table
                    const tableBody = document.getElementById('portfolio-table-body');
                    tableBody.innerHTML = '';

                    // Fetch current prices and update table
                    for (const stock of stocks) {
                        try {
                            const stockResponse = await fetch(javaURI + `/api/stocks/${stock.stockSymbol}`);
                            const stockData = await stockResponse.json();
                            const currentPrice = stockData?.chart?.result?.[0]?.meta?.regularMarketPrice;
                            const percentChange = await getPercentChange(stock.stockSymbol);
                            const totalValue = currentPrice * stock.quantity;

                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${stock.stockSymbol}</td>
                                <td>${stock.quantity}</td>
                                <td>$${currentPrice.toFixed(2)}</td>
                                <td>$${totalValue.toFixed(2)}</td>
                                <td class="${percentChange >= 0 ? 'positive' : 'negative'}">${percentChange}%</td>
                            `;
                            tableBody.appendChild(row);
                        } catch (error) {
                            console.error(`Error fetching data for ${stock.stockSymbol}:`, error);
                        }
                    }

                    // Clear any previous status messages
                    const statusElement = document.getElementById('trade-status');
                    statusElement.textContent = '';
                    statusElement.className = 'status-message';
                } catch (error) {
                    console.error('Error updating portfolio:', error);
                    const statusElement = document.getElementById('trade-status');
                    statusElement.textContent = 'Error loading portfolio. Please try again.';
                    statusElement.className = 'status-message error';
                }
            };

            // Update portfolio when the UI is first loaded
            updatePortfolio();
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