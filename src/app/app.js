/**
 * StartScreen - Pantalla inicial del juego
 */
class StartScreen {
    constructor() {
        this.startForm = document.getElementById('startForm');
        this.startScreen = document.getElementById('startScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.playerNameInput = document.getElementById('playerName');

        this.initialize();
    }

    initialize() {
        this.startForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.playerNameInput.focus();
    }

    handleSubmit(e) {
        e.preventDefault();

        const playerName = this.playerNameInput.value.trim() || 'Jugador';
        const difficulty = document.querySelector('input[name="difficulty"]:checked').value;

        // Ocultar pantalla de inicio y mostrar juego
        this.startScreen.style.display = 'none';
        this.gameScreen.style.display = 'flex';

        // Iniciar juego con los parámetros
        new TicTacToeApp(playerName, difficulty);
    }
}

/**
 * App - Controlador principal de la aplicación
 */
class TicTacToeApp {
    constructor(playerName = 'Jugador', difficulty = 'medium') {
        this.playerName = playerName;
        this.gameLogic = new GameLogic();
        this.aiPlayer = new AIPlayer(difficulty);
        
        // Stats
        this.playerScore = 0;
        this.machineScore = 0;
        this.drawScore = 0;

        // DOM Elements
        this.appContainer = document.getElementById('app');
        this.boardElement = document.getElementById('gameBoard');
        this.cellElements = document.querySelectorAll('.cell');
        this.statusElement = document.getElementById('status');
        this.resetButton = document.getElementById('resetBtn');
        this.resetStatsButton = document.getElementById('resetStatsBtn');
        this.difficultySelect = document.getElementById('difficultySelect');
        this.playerScoreElement = document.getElementById('playerScore');
        this.machineScoreElement = document.getElementById('machineScore');
        this.drawScoreElement = document.getElementById('drawScore');

        this.aiThinking = false;

        // Actualizar interfaz con el nombre y dificultad del jugador
        this.updatePlayerInfo();
        this.initialize();
    }

    /**
     * Actualiza la información del jugador en la interfaz
     */
    updatePlayerInfo() {
        // Buscar el headerTitle y actualizarlo
        const subtitle = document.querySelector('.subtitle');
        if (subtitle) {
            const difficulty = this.aiPlayer.difficulty;
            const difficultyText = {
                'easy': 'Fácil',
                'medium': 'Medio',
                'hard': 'Difícil'
            };
            subtitle.textContent = `${this.playerName} vs IA [${difficultyText[difficulty]}]`;
        }
    }

    /**
     * Inicializa la aplicación
     */
    initialize() {
        this.addEventListeners();
        this.updateUI();
        this.loadStats();
    }

    /**
     * Agrega event listeners
     */
    addEventListeners() {
        this.cellElements.forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
        });

        this.resetButton.addEventListener('click', () => this.resetGame());
        this.resetStatsButton.addEventListener('click', () => this.resetStats());
        this.difficultySelect.addEventListener('change', (e) => {
            this.aiPlayer.setDifficulty(e.target.value);
        });
    }

    /**
     * Maneja el click en una celda
     * @param {number} index
     */
    handleCellClick(index) {
        if (this.aiThinking || !this.gameLogic.isGameActive() || !this.gameLogic.isValidMove(index)) {
            return;
        }

        // Movimiento del jugador
        this.gameLogic.makeMove(index);
        this.updateUI();

        // Verificar estado del juego
        const gameState = this.gameLogic.checkGameState();
        if (gameState) {
            this.endGame(gameState);
            return;
        }

        // Turno de la IA
        this.aiThinking = true;
        setTimeout(() => this.makeAIMove(), this.aiPlayer.getMoveDelay());
    }

    /**
     * Realiza el movimiento de la IA
     */
    makeAIMove() {
        if (!this.gameLogic.isGameActive()) {
            this.aiThinking = false;
            return;
        }

        const bestMove = this.aiPlayer.getBestMove(this.gameLogic);
        this.gameLogic.makeMove(bestMove);
        this.updateUI();

        const gameState = this.gameLogic.checkGameState();
        if (gameState) {
            this.endGame(gameState);
        }

        this.aiThinking = false;
    }

    /**
     * Finaliza el juego
     * @param {string} state - 'X', 'O' o 'draw'
     */
    endGame(state) {
        if (state === 'X') {
            this.statusElement.textContent = `🎉 ¡${this.playerName} ganó!`;
            this.playerScore++;
            this.updateScoreDisplay();
        } else if (state === 'O') {
            this.statusElement.textContent = '🤖 La máquina ganó';
            this.machineScore++;
            this.updateScoreDisplay();
        } else if (state === 'draw') {
            this.statusElement.textContent = '🤝 Empate';
            this.drawScore++;
            this.updateScoreDisplay();
        }

        this.saveStats();
    }

    /**
     * Actualiza la interfaz
     */
    updateUI() {
        // Actualizar celdas
        this.cellElements.forEach((cell, index) => {
            const value = this.gameLogic.getBoard()[index];
            cell.textContent = value || '';
            cell.classList.remove('player-x', 'player-o', 'winner', 'filled');
            
            if (value) {
                cell.classList.add('filled');
                cell.classList.add(value === 'X' ? 'player-x' : 'player-o');
            }
        });

        // Resaltar combinación ganadora
        const winningCombination = this.gameLogic.getWinningCombination();
        if (winningCombination) {
            winningCombination.forEach(index => {
                this.cellElements[index].classList.add('winner');
            });
        }

        // Actualizar estado
        if (this.gameLogic.isGameActive() && !this.aiThinking) {
            const playerCount = this.gameLogic.playerPieces.length;
            const machineCount = this.gameLogic.machinePieces.length;
            
            if (this.gameLogic.getCurrentPlayer() === 'X') {
                const indicator = playerCount >= 3 ? '♻️' : '●';
                this.statusElement.textContent = `👤 Tu turno ${indicator} (${playerCount}/3 fichas)`;
            } else {
                const indicator = machineCount >= 3 ? '♻️' : '●';
                this.statusElement.textContent = `🤖 Turno de la máquina... ${indicator} (${machineCount}/3 fichas)`;
            }
        }
    }

    /**
     * Actualiza la pantalla de puntuación
     */
    updateScoreDisplay() {
        this.playerScoreElement.textContent = this.playerScore;
        this.machineScoreElement.textContent = this.machineScore;
        this.drawScoreElement.textContent = this.drawScore;
    }

    /**
     * Reinicia el juego
     */
    resetGame() {
        this.gameLogic.resetGame();
        this.updateUI();
        this.statusElement.textContent = 'Tu turno';
    }

    /**
     * Reinicia las estadísticas
     */
    resetStats() {
        if (confirm('¿Estás seguro de que quieres reiniciar las puntuaciones?')) {
            this.playerScore = 0;
            this.machineScore = 0;
            this.drawScore = 0;
            this.updateScoreDisplay();
            this.saveStats();
        }
    }

    /**
     * Guarda las estadísticas en localStorage
     */
    saveStats() {
        localStorage.setItem('tictactoe_stats', JSON.stringify({
            playerScore: this.playerScore,
            machineScore: this.machineScore,
            drawScore: this.drawScore
        }));
    }

    /**
     * Carga las estadísticas de localStorage
     */
    loadStats() {
        const saved = localStorage.getItem('tictactoe_stats');
        if (saved) {
            const stats = JSON.parse(saved);
            this.playerScore = stats.playerScore || 0;
            this.machineScore = stats.machineScore || 0;
            this.drawScore = stats.drawScore || 0;
            this.updateScoreDisplay();
        }
    }
}

// Inicializa la pantalla de inicio cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new StartScreen();
});
