/**
 * AIPlayer - Inteligencia Artificial para el juego
 */
class AIPlayer {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.moveDelay = 500; // Delay para que no sea instantáneo
        
        // Configuración de dificultades
        this.difficultySettings = {
            'very-easy': { smartRatio: 0.1, moveDelay: 800 },      // 10% inteligente
            'easy': { smartRatio: 0.4, moveDelay: 700 },          // 40% inteligente
            'medium': { smartRatio: 0.7, moveDelay: 500 },        // 70% inteligente
            'hard': { smartRatio: 0.95, moveDelay: 300 },         // 95% inteligente
            'very-hard': { smartRatio: 1.0, moveDelay: 200 }      // 100% óptimo
        };
    }

    /**
     * Calcula el mejor movimiento para la IA
     * @param {GameLogic} gameLogic - Instancia de GameLogic
     * @returns {number} - Índice del mejor movimiento
     */
    getBestMove(gameLogic) {
        switch (this.difficulty) {
            case 'very-easy':
                return this.getVeryEasyMove(gameLogic);
            case 'easy':
                return this.getEasyMove(gameLogic);
            case 'medium':
                return this.getMediumMove(gameLogic);
            case 'hard':
                return this.getHardMove(gameLogic);
            case 'very-hard':
                return this.getVeryHardMove(gameLogic);
            default:
                return this.getMediumMove(gameLogic);
        }
    }

    /**
     * Dificultad Muy Fácil: Principalmente aleatorio (10% inteligente)
     * @param {GameLogic} gameLogic
     * @returns {number}
     */
    getVeryEasyMove(gameLogic) {
        if (Math.random() < 0.1) {
            return this.getSmartMove(gameLogic);
        }
        return this.getRandomMove(gameLogic);
    }

    /**
     * Dificultad Fácil: 40% inteligente, 60% aleatorio
     * @param {GameLogic} gameLogic
     * @returns {number}
     */
    getEasyMove(gameLogic) {
        if (Math.random() < 0.4) {
            return this.getSmartMove(gameLogic);
        }
        return this.getRandomMove(gameLogic);
    }

    /**
     * Dificultad Media: 70% inteligente, 30% aleatorio
     * @param {GameLogic} gameLogic
     * @returns {number}
     */
    getMediumMove(gameLogic) {
        if (Math.random() < 0.7) {
            return this.getSmartMove(gameLogic);
        }
        return this.getRandomMove(gameLogic);
    }

    /**
     * Dificultad Difícil: 95% inteligente, 5% aleatorio (casi siempre óptimo)
     * @param {GameLogic} gameLogic
     * @returns {number}
     */
    getHardMove(gameLogic) {
        if (Math.random() < 0.95) {
            return this.getOptimalMove(gameLogic);
        }
        return this.getSmartMove(gameLogic);
    }

    /**
     * Dificultad Muy Difícil: Siempre movimiento óptimo usando minimax
     * @param {GameLogic} gameLogic
     * @returns {number}
     */
    getVeryHardMove(gameLogic) {
        return this.getOptimalMove(gameLogic);
    }

    /**
     * Dificultad Fácil: Movimientos aleatorios
     * @param {GameLogic} gameLogic
     * @returns {number}
     */
    getRandomMove(gameLogic) {
        const availableMoves = gameLogic.getAvailableMoves();
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    /**
     * Dificultad Difícil: Movimiento óptimo usando minimax
     * @param {GameLogic} gameLogic
     * @returns {number}
     */
    getHardMove(gameLogic) {
        return this.getOptimalMove(gameLogic);
    }

    /**
     * Estrategia inteligente: Priorizar ganar, bloquear, centro, esquinas
     * @param {GameLogic} gameLogic
     * @returns {number}
     */
    getSmartMove(gameLogic) {
        const availableMoves = gameLogic.getAvailableMoves();
        
        // 1. Intenta ganar
        const winMove = this.findWinningMove(gameLogic, 'O');
        if (winMove !== null) return winMove;

        // 2. Bloquea el movimiento ganador del jugador
        const blockMove = this.findWinningMove(gameLogic, 'X');
        if (blockMove !== null) return blockMove;

        // 3. Toma el centro si está disponible
        if (availableMoves.includes(4)) return 4;

        // 4. Toma una esquina
        const corners = [0, 2, 6, 8].filter(i => availableMoves.includes(i));
        if (corners.length > 0) {
            return corners[Math.floor(Math.random() * corners.length)];
        }

        // 5. Toma cualquier posición disponible
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    /**
     * Busca un movimiento ganador o bloqueador
     * @param {GameLogic} gameLogic
     * @param {string} player - 'X' o 'O'
     * @returns {number|null}
     */
    findWinningMove(gameLogic, player) {
        const availableMoves = gameLogic.getAvailableMoves();
        
        for (let move of availableMoves) {
            const testBoard = [...gameLogic.getBoard()];
            testBoard[move] = player;
            
            if (this.checkWin(testBoard, player)) {
                return move;
            }
        }
        
        return null;
    }

    /**
     * Verifica si hay una combinación ganadora en el tablero
     * @param {Array} board
     * @param {string} player
     * @returns {boolean}
     */
    checkWin(board, player) {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (let combination of winningCombinations) {
            const [a, b, c] = combination;
            if (board[a] === player && board[b] === player && board[c] === player) {
                return true;
            }
        }
        return false;
    }

    /**
     * Movimiento óptimo usando algoritmo minimax
     * @param {GameLogic} gameLogic
     * @returns {number}
     */
    getOptimalMove(gameLogic) {
        const availableMoves = gameLogic.getAvailableMoves();
        let bestMove = availableMoves[0];
        let bestScore = -Infinity;

        for (let move of availableMoves) {
            // Guardar estado
            const oldBoard = [...gameLogic.board];
            const oldMachinePieces = [...gameLogic.machinePieces];
            const oldPlayer = gameLogic.currentPlayer;
            
            // Simular movimiento
            gameLogic.board[move] = 'O';
            gameLogic.machinePieces = [...gameLogic.machinePieces, move];
            gameLogic.currentPlayer = 'X';
            
            const score = gameLogic.minimax(0, false);
            
            // Restaurar estado
            gameLogic.board = oldBoard;
            gameLogic.machinePieces = oldMachinePieces;
            gameLogic.currentPlayer = oldPlayer;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    /**
     * Obtiene el delay antes del movimiento de IA
     * @returns {number} - Milisegundos
     */
    getMoveDelay() {
        // Mayor variación en dificultades más bajas para parecer más "natural"
        const baseDelay = this.difficultySettings[this.difficulty]?.moveDelay || this.moveDelay;
        
        switch (this.difficulty) {
            case 'very-easy':
                return baseDelay + Math.random() * 1200;
            case 'easy':
                return baseDelay + Math.random() * 1000;
            case 'medium':
                return baseDelay + Math.random() * 500;
            case 'hard':
                return baseDelay + Math.random() * 300;
            case 'very-hard':
                return baseDelay + Math.random() * 100;
            default:
                return this.moveDelay;
        }
    }

    /**
     * Cambia la dificultad
     * @param {string} difficulty - 'very-easy', 'easy', 'medium', 'hard' o 'very-hard'
     */
    setDifficulty(difficulty) {
        const validDifficulties = ['very-easy', 'easy', 'medium', 'hard', 'very-hard'];
        if (validDifficulties.includes(difficulty)) {
            this.difficulty = difficulty;
        } else {
            console.warn(`Dificultad inválida: ${difficulty}. Usando 'medium' por defecto.`);
            this.difficulty = 'medium';
        }
    }
        }
    }
}
