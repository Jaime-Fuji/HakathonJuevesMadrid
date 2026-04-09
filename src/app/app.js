/**
 * StartScreen - Pantalla inicial del juego
 */
class StartScreen {
    constructor() {
        this.startScreen = document.getElementById('startScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.leaderboardScreen = document.getElementById('leaderboardScreen');
        this.startForm = document.getElementById('startForm');
        this.playerNameInput = document.getElementById('playerName');
        this.gameModeSelect = document.getElementById('gameModeSelect');
        this.startDifficulty = document.getElementById('startDifficulty');
        this.openLeaderboardButton = document.getElementById('openLeaderboard');
        this.closeLeaderboardButton = document.getElementById('closeLeaderboard');
        this.leaderboardList = document.getElementById('leaderboardList');
        this.appInstance = null;

        this.initialize();
    }

    initialize() {
        this.startForm.addEventListener('submit', (event) => this.handleSubmit(event));
        this.gameModeSelect.addEventListener('change', () => this.updateDifficultyState());
        this.openLeaderboardButton.addEventListener('click', () => this.openLeaderboard());
        this.closeLeaderboardButton.addEventListener('click', () => this.closeLeaderboard());
        this.updateDifficultyState();
        this.playerNameInput.focus();
    }

    updateDifficultyState() {
        const isAiMode = this.gameModeSelect.value === 'ai';
        this.startDifficulty.disabled = !isAiMode;
    }

    handleSubmit(event) {
        event.preventDefault();

        const playerName = this.playerNameInput.value.trim() || 'Jugador';
        const gameMode = this.gameModeSelect.value;
        const difficulty = this.startDifficulty.value;

        this.startScreen.style.display = 'none';
        this.gameScreen.style.display = 'flex';

        if (!this.appInstance) {
            this.appInstance = new TicTacToeApp({
                playerName,
                gameMode,
                difficulty,
                onReturnToMenu: () => this.showStartScreen()
            });
        } else {
            this.appInstance.startNewSession({ playerName, gameMode, difficulty });
        }
    }

    showStartScreen() {
        this.gameScreen.style.display = 'none';
        this.startScreen.style.display = 'flex';
        this.playerNameInput.focus();
    }

    openLeaderboard() {
        this.startScreen.style.display = 'none';
        this.leaderboardScreen.style.display = 'flex';
        this.renderLeaderboard();
    }

    closeLeaderboard() {
        this.leaderboardScreen.style.display = 'none';
        this.startScreen.style.display = 'flex';
        this.playerNameInput.focus();
    }

    renderLeaderboard() {
        const entries = TicTacToeApp.getLeaderboardEntries();
        if (!entries.length) {
            this.leaderboardList.innerHTML = '<p class="empty-message">Aun no hay puntuaciones</p>';
            return;
        }

        const rows = entries.map((entry, index) => {
            return `
                <div class="leaderboard-row">
                    <div class="leaderboard-rank">#${index + 1}</div>
                    <div class="leaderboard-name">${entry.name}</div>
                    <div class="leaderboard-meta">Pts: ${entry.points}</div>
                    <div class="leaderboard-meta">W:${entry.wins} D:${entry.draws} L:${entry.losses}</div>
                </div>
            `;
        }).join('');

        this.leaderboardList.innerHTML = rows;
    }
}

/**
 * App - Controlador principal de la aplicación
 */
class TicTacToeApp {
    constructor({ playerName = 'Jugador', gameMode = 'ai', difficulty = 'medium', onReturnToMenu } = {}) {
        this.playerName = playerName;
        this.gameMode = gameMode;
        this.gameLogic = new GameLogic();
        this.aiPlayer = new AIPlayer(difficulty);
        this.onReturnToMenu = onReturnToMenu;
        this.statsKey = this.getStatsKey();
        
        // Stats
        this.playerScore = 0;
        this.machineScore = 0;
        this.drawScore = 0;
        this.playerPoints = 0;
        this.machinePoints = 0;

        // DOM Elements
        this.boardElement = document.getElementById('gameBoard');
        this.cellElements = document.querySelectorAll('.cell');
        this.statusElement = document.getElementById('status');
        this.resetButton = document.getElementById('resetBtn');
        this.resetStatsButton = document.getElementById('resetStatsBtn');
        this.difficultySelect = document.getElementById('difficultySelect');
        this.themeToggleButton = document.getElementById('themeToggle');
        this.boardStyleSelect = document.getElementById('boardStyleSelect');
        this.boardBgColorInput = document.getElementById('boardBgColor');
        this.cellBgColorInput = document.getElementById('cellBgColor');
        this.boardStyleResetButton = document.getElementById('boardStyleResetBtn');
        this.playerScoreElement = document.getElementById('playerScore');
        this.machineScoreElement = document.getElementById('machineScore');
        this.drawScoreElement = document.getElementById('drawScore');
        this.playerLabelElement = document.getElementById('playerLabel');
        this.machineLabelElement = document.getElementById('machineLabel');
        this.playerPointsElement = document.getElementById('playerPoints');
        this.machinePointsElement = document.getElementById('machinePoints');
        this.winMessageElement = document.getElementById('winMessage');
        this.closeWinMessageButton = document.getElementById('closeWinMessage');
        this.backToMenuButton = document.getElementById('backToMenuBtn');

        this.aiThinking = false;

        this.initialize();
    }

    /**
     * Inicializa la aplicación
     */
    initialize() {
        this.loadTheme();
        this.loadBoardStyle();
        this.addEventListeners();
        this.updateUI();
        this.loadStats();
        this.applyGameMode();
        this.updateThemeButton();
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
        this.themeToggleButton.addEventListener('click', () => this.toggleTheme());
        this.closeWinMessageButton.addEventListener('click', () => this.hideWinMessage());
        this.backToMenuButton.addEventListener('click', () => this.returnToMenu());
        this.boardStyleSelect.addEventListener('change', (e) => {
            this.applyBoardStyle(e.target.value);
        });
        this.boardBgColorInput.addEventListener('input', () => this.handleCustomBoardColors());
        this.cellBgColorInput.addEventListener('input', () => this.handleCustomBoardColors());
        this.boardStyleResetButton.addEventListener('click', () => this.resetBoardStyle());
        this.difficultySelect.addEventListener('change', (e) => {
            this.aiPlayer.setDifficulty(e.target.value);
        });
    }

    /**
     * Aplica modo de juego y actualiza etiquetas
     */
    applyGameMode() {
        const isAiMode = this.gameMode === 'ai';
        if (this.playerLabelElement) {
            this.playerLabelElement.textContent = `${this.playerName} (X)`;
        }
        if (this.machineLabelElement) {
            this.machineLabelElement.textContent = isAiMode ? 'Máquina (O)' : 'Jugador 2 (O)';
        }
        if (this.difficultySelect) {
            this.difficultySelect.disabled = !isAiMode;
        }
    }

    startNewSession({ playerName, gameMode, difficulty }) {
        this.playerName = playerName;
        this.gameMode = gameMode;
        this.aiPlayer.setDifficulty(difficulty);
        this.statsKey = this.getStatsKey();
        this.resetSessionStats();
        this.applyGameMode();
        this.resetGame();
        this.loadStats();
    }

    returnToMenu() {
        this.resetGame();
        if (typeof this.onReturnToMenu === 'function') {
            this.onReturnToMenu();
        }
    }

    /**
     * Aplica un estilo de tablero y lo guarda
     * @param {'glass'|'classic'|'neon'|'wood'|'custom'} style
     */
    applyBoardStyle(style) {
        const styleClasses = ['board-style-metal', 'board-style-classic', 'board-style-neon', 'board-style-wood', 'board-style-custom'];
        const validStyles = ['glass', 'metal', 'classic', 'neon', 'wood', 'custom'];
        const nextStyle = validStyles.includes(style) ? style : 'glass';

        this.boardElement.classList.remove(...styleClasses);

        if (nextStyle !== 'glass') {
            this.boardElement.classList.add(`board-style-${nextStyle}`);
        }

        this.boardStyleSelect.value = nextStyle;
        this.toggleCustomColorInputs(nextStyle === 'custom');
        localStorage.setItem('tictactoe_board_style', nextStyle);
    }

    /**
     * Habilita o deshabilita inputs de color personalizado
     * @param {boolean} enabled
     */
    toggleCustomColorInputs(enabled) {
        this.boardBgColorInput.disabled = !enabled;
        this.cellBgColorInput.disabled = !enabled;
    }

    /**
     * Actualiza colores personalizados del tablero
     */
    handleCustomBoardColors() {
        const boardColor = this.boardBgColorInput.value;
        const cellColor = this.cellBgColorInput.value;

        this.boardElement.style.setProperty('--board-custom-bg', boardColor);
        this.boardElement.style.setProperty('--cell-custom-bg', cellColor);

        localStorage.setItem('tictactoe_board_custom_colors', JSON.stringify({
            boardColor,
            cellColor
        }));

        if (this.boardStyleSelect.value !== 'custom') {
            this.applyBoardStyle('custom');
        }
    }

    /**
     * Reinicia el estilo del tablero a valores por defecto
     */
    resetBoardStyle() {
        this.boardBgColorInput.value = '#e2eeff';
        this.cellBgColorInput.value = '#ffffff';
        this.boardElement.style.setProperty('--board-custom-bg', '#e2eeff');
        this.boardElement.style.setProperty('--cell-custom-bg', '#ffffff');
        localStorage.removeItem('tictactoe_board_custom_colors');
        this.applyBoardStyle('glass');
    }

    /**
     * Carga el estilo del tablero guardado
     */
    loadBoardStyle() {
        const savedStyle = localStorage.getItem('tictactoe_board_style') || 'glass';
        const savedColors = localStorage.getItem('tictactoe_board_custom_colors');

        if (savedColors) {
            try {
                const { boardColor, cellColor } = JSON.parse(savedColors);
                if (boardColor) {
                    this.boardBgColorInput.value = boardColor;
                    this.boardElement.style.setProperty('--board-custom-bg', boardColor);
                }
                if (cellColor) {
                    this.cellBgColorInput.value = cellColor;
                    this.boardElement.style.setProperty('--cell-custom-bg', cellColor);
                }
            } catch (error) {
                localStorage.removeItem('tictactoe_board_custom_colors');
            }
        }

        this.applyBoardStyle(savedStyle);
    }

    /**
     * Aplica un tema visual y lo persiste
     * @param {'light'|'dark'} theme
     */
    setTheme(theme) {
        document.body.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('tictactoe_theme', theme);
        this.updateThemeButton();
    }

    /**
     * Alterna entre modo claro y oscuro
     */
    toggleTheme() {
        const isDark = document.body.classList.contains('dark');
        this.setTheme(isDark ? 'light' : 'dark');
    }

    /**
     * Carga el tema desde localStorage
     */
    loadTheme() {
        const savedTheme = localStorage.getItem('tictactoe_theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        this.setTheme(theme);
    }

    /**
     * Actualiza el texto del botón de tema
     */
    updateThemeButton() {
        const isDark = document.body.classList.contains('dark');
        this.themeToggleButton.textContent = isDark ? '☀️ Modo claro' : '🌙 Modo oscuro';
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

        // Turno de la IA si aplica
        if (this.gameMode === 'ai' && this.gameLogic.isGameActive()) {
            this.aiThinking = true;
            setTimeout(() => this.makeAIMove(), this.aiPlayer.getMoveDelay());
        }
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
        let pointsEarned = 0;

        if (state === 'X') {
            this.statusElement.textContent = '🎉 ¡Ganaste!';
            this.playerScore++;
            pointsEarned = 3;
            this.playerPoints += pointsEarned;
            this.updateScoreDisplay();
            this.showWinMessage();
        } else if (state === 'O') {
            this.statusElement.textContent = this.gameMode === 'ai' ? '🤖 La máquina ganó' : '🎯 Jugador 2 ganó';
            this.machineScore++;
            this.machinePoints += 3;
            this.updateScoreDisplay();
        } else if (state === 'draw') {
            this.statusElement.textContent = '🤝 Empate';
            this.drawScore++;
            pointsEarned = 1;
            this.playerPoints += pointsEarned;
            this.machinePoints += 1;
            this.updateScoreDisplay();
        }

        this.updateLeaderboard(state, pointsEarned);

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
        if (this.playerPointsElement) {
            this.playerPointsElement.textContent = this.playerPoints;
        }
        if (this.machinePointsElement) {
            this.machinePointsElement.textContent = this.machinePoints;
        }
    }

    /**
     * Reinicia el juego
     */
    resetGame() {
        this.gameLogic.resetGame();
        this.updateUI();
        this.statusElement.textContent = 'Tu turno';
        this.hideWinMessage();
    }

    /**
     * Muestra el mensaje de victoria del jugador
     */
    showWinMessage() {
        if (!this.winMessageElement) {
            return;
        }

        this.winMessageElement.classList.add('visible');
    }

    /**
     * Oculta el mensaje de victoria
     */
    hideWinMessage() {
        if (!this.winMessageElement) {
            return;
        }

        this.winMessageElement.classList.remove('visible');
    }

    /**
     * Reinicia las estadísticas
     */
    resetStats() {
        if (confirm('¿Estás seguro de que quieres reiniciar las puntuaciones?')) {
            this.playerScore = 0;
            this.machineScore = 0;
            this.drawScore = 0;
            this.playerPoints = 0;
            this.machinePoints = 0;
            this.updateScoreDisplay();
            this.saveStats();
        }
    }

    resetSessionStats() {
        this.playerScore = 0;
        this.machineScore = 0;
        this.drawScore = 0;
        this.playerPoints = 0;
        this.machinePoints = 0;
        this.updateScoreDisplay();
    }

    getStatsKey() {
        return `tictactoe_stats_${this.playerName.toLowerCase()}`;
    }

    /**
     * Guarda las estadísticas en localStorage
     */
    saveStats() {
        localStorage.setItem(this.statsKey, JSON.stringify({
            playerScore: this.playerScore,
            machineScore: this.machineScore,
            drawScore: this.drawScore,
            playerPoints: this.playerPoints,
            machinePoints: this.machinePoints
        }));
    }

    /**
     * Carga las estadísticas de localStorage
     */
    loadStats() {
        const saved = localStorage.getItem(this.statsKey);
        if (saved) {
            const stats = JSON.parse(saved);
            this.playerScore = stats.playerScore || 0;
            this.machineScore = stats.machineScore || 0;
            this.drawScore = stats.drawScore || 0;
            this.playerPoints = stats.playerPoints || 0;
            this.machinePoints = stats.machinePoints || 0;
            this.updateScoreDisplay();
        }
    }

    updateLeaderboard(state, pointsEarned) {
        if (this.gameMode !== 'ai') {
            return;
        }

        const key = 'tictactoe_leaderboard';
        const saved = localStorage.getItem(key);
        const entries = saved ? JSON.parse(saved) : [];
        const normalizedName = this.playerName.trim() || 'Jugador';
        const existing = entries.find(entry => entry.name.toLowerCase() === normalizedName.toLowerCase());

        if (existing) {
            existing.points += pointsEarned;
            existing.wins += state === 'X' ? 1 : 0;
            existing.draws += state === 'draw' ? 1 : 0;
            existing.losses += state === 'O' ? 1 : 0;
        } else {
            entries.push({
                name: normalizedName,
                points: pointsEarned,
                wins: state === 'X' ? 1 : 0,
                draws: state === 'draw' ? 1 : 0,
                losses: state === 'O' ? 1 : 0
            });
        }

        entries.sort((a, b) => b.points - a.points);
        localStorage.setItem(key, JSON.stringify(entries));
    }

    static getLeaderboardEntries() {
        const saved = localStorage.getItem('tictactoe_leaderboard');
        return saved ? JSON.parse(saved) : [];
    }
}

// Inicializa la pantalla de inicio cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new StartScreen();
});
