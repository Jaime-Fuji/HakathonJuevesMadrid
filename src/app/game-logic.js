/**
 * GameLogic - Lógica principal del juego Tres en Raya
 */
class GameLogic {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X'; // X = Jugador, O = Máquina
        this.gameActive = true;
        this.gameOver = false;
        this.maxPiecesPerPlayer = 3;
        
        // Historial de fichas por jugador (orden de colocación)
        this.playerPieces = []; // Índices de fichas de X
        this.machinePieces = []; // Índices de fichas de O
        
        // Combinaciones ganadoras
        this.winningCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
    }

    /**
     * Reproduce un movimiento en el tablero
     * @param {number} index - Índice de la celda (0-8)
     * @returns {boolean} - True si el movimiento es válido
     */
    makeMove(index) {
        if (!this.isValidMove(index) || !this.gameActive) {
            return false;
        }

        const pieces = this.currentPlayer === 'X' ? this.playerPieces : this.machinePieces;

        // Si ya hay 3 fichas, mover la más antigua
        if (pieces.length >= this.maxPiecesPerPlayer) {
            const oldestPieceIndex = pieces.shift(); // Remover la más antigua
            this.board[oldestPieceIndex] = null; // Limpiar la celda antigua
        }

        // Colocar la nueva ficha
        this.board[index] = this.currentPlayer;
        pieces.push(index); // Agregar al historial

        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        
        const gameState = this.checkGameState();
        if (gameState) {
            this.gameActive = false;
            this.gameOver = true;
        }

        return true;
    }

    /**
     * Verifica si un movimiento es válido
     * @param {number} index - Índice de la celda
     * @returns {boolean}
     */
    isValidMove(index) {
        return index >= 0 && index < 9 && this.board[index] === null;
    }

    /**
     * Obtiene todas las celdas vacías disponibles
     * @returns {number[]}
     */
    getAvailableMoves() {
        return this.board
            .map((cell, index) => cell === null ? index : null)
            .filter(val => val !== null);
    }

    /**
     * Verifica el estado actual del juego
     * @returns {string|null} - 'X', 'O', 'draw' o null
     */
    checkGameState() {
        // Verificar ganador
        for (let combination of this.winningCombinations) {
            const [a, b, c] = combination;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winningCombination = combination;
                return this.board[a]; // Retorna 'X' u 'O'
            }
        }

        // Verificar empate
        if (this.board.every(cell => cell !== null)) {
            return 'draw';
        }

        return null;
    }

    /**
     * Obtiene el estado actual del tablero
     * @returns {number[]}
     */
    getBoard() {
        return [...this.board];
    }

    /**
     * Obtiene el jugador actual
     * @returns {string} - 'X' u 'O'
     */
    getCurrentPlayer() {
        return this.currentPlayer;
    }

    /**
     * Verifica si el juego está activo
     * @returns {boolean}
     */
    isGameActive() {
        return this.gameActive;
    }

    /**
     * Verifica si el juego ha terminado
     * @returns {boolean}
     */
    isGameOver() {
        return this.gameOver;
    }

    /**
     * Reinicia el juego
     */
    resetGame() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameOver = false;
        this.winningCombination = null;
        this.playerPieces = [];
        this.machinePieces = [];
    }

    /**
     * Obtiene la combinación ganadora
     * @returns {number[]|null}
     */
    getWinningCombination() {
        return this.winningCombination || null;
    }

    /**
     * Evalúa el tablero para la IA
     * @param {number} depth - Profundidad de búsqueda para minimax
     * @param {boolean} isMaximizing - Si es turno de maximización
     * @returns {number} - Puntuación
     */
    minimax(depth = 0, isMaximizing = true) {
        const gameState = this.checkGameState();

        // Terminal states
        if (gameState === 'O') return 10 - depth; // IA gana
        if (gameState === 'X') return depth - 10; // Jugador gana
        if (gameState === 'draw') return 0; // Empate

        if (isMaximizing) {
            // IA trata de maximizar puntuación
            let maxScore = -Infinity;
            const availableMoves = this.getAvailableMoves();

            for (let move of availableMoves) {
                // Simular movimiento de IA (O)
                const pieces = this.machinePieces;
                let removedPiece = null;
                
                if (pieces.length >= this.maxPiecesPerPlayer) {
                    removedPiece = pieces.shift();
                    this.board[removedPiece] = null;
                }
                
                this.board[move] = 'O';
                pieces.push(move);
                this.currentPlayer = 'X';
                
                const score = this.minimax(depth + 1, false);
                
                // Deshacer movimiento
                this.board[move] = null;
                pieces.pop();
                this.currentPlayer = 'O';
                if (removedPiece !== null) {
                    pieces.unshift(removedPiece);
                    this.board[removedPiece] = 'O';
                }
                
                maxScore = Math.max(score, maxScore);
            }
            return maxScore;
        } else {
            // Jugador trata de minimizar puntuación de IA
            let minScore = Infinity;
            const availableMoves = this.getAvailableMoves();

            for (let move of availableMoves) {
                // Simular movimiento de jugador (X)
                const pieces = this.playerPieces;
                let removedPiece = null;
                
                if (pieces.length >= this.maxPiecesPerPlayer) {
                    removedPiece = pieces.shift();
                    this.board[removedPiece] = null;
                }
                
                this.board[move] = 'X';
                pieces.push(move);
                this.currentPlayer = 'O';
                
                const score = this.minimax(depth + 1, true);
                
                // Deshacer movimiento
                this.board[move] = null;
                pieces.pop();
                this.currentPlayer = 'X';
                if (removedPiece !== null) {
                    pieces.unshift(removedPiece);
                    this.board[removedPiece] = 'X';
                }
                
                minScore = Math.min(score, minScore);
            }
            return minScore;
        }
    }
}
