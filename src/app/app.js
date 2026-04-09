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
        this.gameHistory = [];

        // Game timing and performance
        this.gameStartTime = null;
        this.totalMoves = 0;
        this.timerInterval = null;

        // DOM Elements
        this.appContainer = document.getElementById('app');
        this.boardElement = document.getElementById('gameBoard');
        this.cellElements = []; // Se llenará en addEventListeners()
        this.statusElement = document.getElementById('status');
        this.resetButton = document.getElementById('resetBtn');
        this.resetStatsButton = document.getElementById('resetStatsBtn');
        this.difficultySelect = document.getElementById('difficultySelect');
        this.playerScoreElement = document.getElementById('playerScore');
        this.machineScoreElement = document.getElementById('machineScore');
        this.drawScoreElement = document.getElementById('drawScore');
        this.timerElement = document.getElementById('gameTimer') || null;
        this.movesElement = document.getElementById('moveCount') || null;

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
                'very-easy': 'Muy Fácil',
                'easy': 'Fácil',
                'medium': 'Medio',
                'hard': 'Difícil',
                'very-hard': 'Muy Difícil'
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
        this.updateHistoryDisplay();
    }

    /**
     * Agrega event listeners
     */
    addEventListeners() {
        // Seleccionar celdas dinámicamente dentro del contenedor visible
        this.cellElements = this.appContainer.querySelectorAll('.cell');
        
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
        // Inicia el cronómetro en el primer movimiento
        if (!this.gameStartTime) {
            this.startGameTimer();
        }

        if (this.aiThinking || !this.gameLogic.isGameActive() || !this.gameLogic.isValidMove(index)) {
            return;
        }

        // Movimiento del jugador
        this.gameLogic.makeMove(index);
        this.totalMoves++;
        this.updateMoveDisplay();
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
        this.totalMoves++;
        this.updateMoveDisplay();
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
        this.stopGameTimer();
        
        let result = '';
        let pointsEarned = 0;

        if (state === 'X') {
            this.statusElement.textContent = `🎉 ¡${this.playerName} ganó!`;
            result = 'WIN';
            this.playerScore++;
            pointsEarned = this.calculatePoints(state);
        } else if (state === 'O') {
            this.statusElement.textContent = '🤖 La máquina ganó';
            result = 'LOSS';
            this.machineScore++;
            pointsEarned = 0;
        } else if (state === 'draw') {
            this.statusElement.textContent = '🤝 Empate';
            result = 'DRAW';
            this.drawScore++;
            pointsEarned = this.calculatePoints(state);
        }

        this.updateScoreDisplay();
        this.saveMatchResult(result, pointsEarned);
    }

    /**
     * Calcula los puntos basado en tiempo y cantidad de movimientos
     * @param {string} result - 'X' para victoria, 'draw' para empate
     * @returns {number} - Puntos obtenidos
     */
    calculatePoints(result) {
        const timeInSeconds = Math.floor((Date.now() - this.gameStartTime) / 1000);
        let basePoints = result === 'X' ? 100 : 50; // 100 para ganar, 50 para empate
        
        // Bonus por rapidez (máximo 50 puntos)
        const speedBonus = Math.max(0, 50 - Math.floor(timeInSeconds / 2));
        
        // Bonus por eficiencia (menos movimientos mejor)
        const efficiencyBonus = Math.max(0, 30 - (this.totalMoves * 2));
        
        const totalPoints = basePoints + speedBonus + efficiencyBonus;
        return Math.max(10, totalPoints); // Mínimo 10 puntos
    }

    /**
     * Inicia el cronómetro del juego
     */
    startGameTimer() {
        this.gameStartTime = Date.now();
        if (this.timerElement) {
            this.timerInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                this.timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }, 100);
        }
    }

    /**
     * Detiene el cronómetro
     */
    stopGameTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Actualiza el display de movimientos
     */
    updateMoveDisplay() {
        if (this.movesElement) {
            this.movesElement.textContent = this.totalMoves;
        }
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
        this.stopGameTimer();
        this.gameLogic.resetGame();
        this.gameStartTime = null;
        this.totalMoves = 0;
        this.updateMoveDisplay();
        this.updateUI();
        this.statusElement.textContent = 'Tu turno';
        if (this.timerElement) {
            this.timerElement.textContent = '0:00';
        }
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
