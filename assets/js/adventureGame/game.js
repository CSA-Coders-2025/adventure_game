import GameControl from './GameControl.js';

class Game {
    // initialize user and launch GameControl 
    static main(path, pythonURI, javaURI, fetchOptions) {
        // keep track of user ids
        this.uid;
        this.id;

        // fetching variables 
        this.pythonURI = pythonURI;
        this.javaURI = javaURI;
        this.fetchOptions = fetchOptions;

        // init functions for user and stats
        this.initUser();
        this.initStatsUI();
        
        // start game
        new GameControl(path).start();
    }

    static initUser() {
        const pythonURL = this.pythonURI + '/api/id';
        fetch(pythonURL, this.fetchOptions)
            .then(response => {
                if (response.status !== 200) {
                    console.error("HTTP status code: " + response.status);
                    return null;
                }
                return response.json();
            })
            .then(data => {
                if (!data) return;
                this.uid = data.uid;
                console.log("User ID:", this.uid);  // Ensure this prints correctly
    
                // Now that this.uid is set, fetch from the Java backend
                const javaURL = this.javaURI + '/rpg_answer/person/' + this.uid;
                return fetch(javaURL, this.fetchOptions);
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Spring server response: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (!data) return;
                console.log(data.id);
                this.id = data.id;
                this.fetchStats(data.id);
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }
    
    static fetchStats(personId) {
        const endpoints = {
            balance: this.javaURI + '/rpg_answer/getBalance/' + personId,
            chatScore: this.javaURI + '/rpg_answer/getChatScore/' + personId,
            questionsAnswered: this.javaURI + '/rpg_answer/getQuestionsAnswered/' + personId
        };

        for (let [key, url] of Object.entries(endpoints)) {
            fetch(url, this.fetchOptions)
                .then(response => response.json())
                .then(data => {
                    document.getElementById(key).innerHTML = data ?? 0;
                    localStorage.setItem(key, data ?? 0);
                })
                .catch(err => console.error(`Error fetching ${key}:`, err));
        }
    }
    
    // Now updateStats is an async function that returns the updated score
    static async updateStats(content, questionId, personId) {
        try {
            const response = await fetch(this.javaURI + '/rpg_answer/submitAnswer', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: content,
                    questionId: questionId,
                    personId: personId
                })
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();

            return data.score || "Error scoring answer"; // Return score
        } catch (error) {
            console.error("Error submitting answer:", error);
            return "Error submitting answer";
        }
    }
    
    static initStatsUI() {
        const statsContainer = document.createElement('div');
        statsContainer.id = 'stats-container';
        statsContainer.style.position = 'fixed';
        statsContainer.style.top = '75px'; 
        statsContainer.style.right = '10px';
        statsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        statsContainer.style.color = 'white';
        statsContainer.style.padding = '10px';
        statsContainer.style.borderRadius = '5px';
        statsContainer.innerHTML = `
            <div>Balance: <span id="balance">0</span></div>
            <div>Chat Score: <span id="chatScore">0</span></div>
            <div>Questions Answered: <span id="questionsAnswered">0</span></div>
        `;
        document.body.appendChild(statsContainer);
    }
}

export default Game;
