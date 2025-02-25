class AI {
    constructor(game) {
        this.game = game;
        this.difficulty = 'easy';  // 默认简单难度
        this.maxDepth = 1;  // 初始搜索深度
        this.evaluationFactor = 1; // 评分系数
    }

    setDifficulty(level) {
        this.difficulty = level;
        switch (level) {
            case 'easy':
                this.maxDepth = 1;
                this.evaluationFactor = 1;
                break;
            case 'medium':
                this.maxDepth = 2;
                this.evaluationFactor = 1.5;
                break;
            case 'hard':
                this.maxDepth = 3;
                this.evaluationFactor = 2;
                break;
        }
    }

    // 评估当前局面分数
    evaluateBoard() {
        const board = this.game.board.pieces;
        let score = 0;
        
        // 评估所有可能的五元组
        for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 15; x++) {
                score += this.evaluatePosition(x, y);
            }
        }
        
        return score;
    }

    // 评估某个位置的分数
    evaluatePosition(x, y) {
        const directions = [
            [{x: 1, y: 0}, {x: -1, y: 0}],   // 横向
            [{x: 0, y: 1}, {x: 0, y: -1}],   // 纵向
            [{x: 1, y: 1}, {x: -1, y: -1}],  // 右斜
            [{x: 1, y: -1}, {x: -1, y: 1}]   // 左斜
        ];
        
        let score = 0;
        
        directions.forEach(dir => {
            score += this.evaluateDirection(x, y, dir);
        });
        
        return score;
    }

    // 评估某个方向的分数
    evaluateDirection(x, y, direction) {
        const board = this.game.board.pieces;
        const piece = board[y][x];
        if (!piece) return 0;
        
        let count = 1;
        let block = 0;
        
        direction.forEach(dir => {
            let i = 1;
            while (true) {
                const newX = x + dir.x * i;
                const newY = y + dir.y * i;
                
                if (newX < 0 || newX >= 15 || newY < 0 || newY >= 15) {
                    block++;
                    break;
                }
                
                if (board[newY][newX] !== piece) {
                    if (board[newY][newX] !== null) block++;
                    break;
                }
                
                count++;
                i++;
            }
        });
        
        // 根据连子数和阻挡数评分
        return this.getScore(count, block, piece === 'white');
    }

    // 根据连子数和阻挡数计算分数
    getScore(count, block, isAI) {
        const baseScore = isAI ? 1 : -1;
        
        // 如果两端都被阻挡，则该方向无法形成五子，分值降低
        if (block === 2 && count < 5) return 0;
        
        let score;
        switch (count) {
            case 5: score = 100000; break;
            case 4: score = block === 0 ? 10000 : 1000; break;
            case 3: score = block === 0 ? 1000 : 100; break;
            case 2: score = block === 0 ? 100 : 10; break;
            case 1: score = block === 0 ? 10 : 1; break;
            default: score = 0;
        }
        
        // 根据难度调整分数
        return baseScore * score * this.evaluationFactor;
    }

    // 获取所有可能的落子位置
    getPossibleMoves() {
        const moves = [];
        const board = this.game.board.pieces;

        // 如果是空棋盘，随机选择靠近天元的位置
        if (this.game.moves.length === 0) {
            const centerPositions = [
                {x: 7, y: 7},  // 天元
                {x: 6, y: 6}, {x: 6, y: 7}, {x: 6, y: 8},
                {x: 7, y: 6}, {x: 7, y: 8},
                {x: 8, y: 6}, {x: 8, y: 7}, {x: 8, y: 8}
            ];
            return centerPositions;
        }
        
        // 已有棋子的情况下，考虑周围的空位
        for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 15; x++) {
                if (!board[y][x] && this.hasNeighbor(x, y)) {
                    moves.push({x, y});
                }
            }
        }

        // 随机打乱moves数组的顺序，增加下棋的随机性
        for (let i = moves.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [moves[i], moves[j]] = [moves[j], moves[i]];
        }
        
        return moves;
    }

    // 检查某个位置周围是否有棋子
    hasNeighbor(x, y) {
        const range = 2;  // 考虑2格范围内的邻居
        const board = this.game.board.pieces;
        
        for (let i = -range; i <= range; i++) {
            for (let j = -range; j <= range; j++) {
                const newX = x + i;
                const newY = y + j;
                
                if (newX >= 0 && newX < 15 && newY >= 0 && newY < 15) {
                    if (board[newY][newX]) return true;
                }
            }
        }
        
        return false;
    }

    // 选择最佳落子位置
    findBestMove() {
        const moves = this.getPossibleMoves();
        if (moves.length === 0) {
            // 如果没有合适的位置，则下在天元
            return {x: 7, y: 7};
        }
        
        let bestScore = -Infinity;
        let bestMove = moves[0];
        
        moves.forEach(move => {
            // 模拟落子
            this.game.board.pieces[move.y][move.x] = 'white';
            const score = this.evaluateBoard();
            // 撤销落子
            this.game.board.pieces[move.y][move.x] = null;
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        });
        
        return bestMove;
    }

    // AI下棋
    makeMove() {
        const move = this.findBestMove();
        this.game.makeMove(move.x, move.y);
    }
}