class Game {
    constructor() {
        this.board = new Board(document.getElementById('board'));
        this.currentPlayer = 'black';
        this.gameStatus = 'playing';
        this.moves = [];
        this.lastMove = null;
        this.gameMode = 'pvp'; // 'pvp' 或 'pve'
        this.ai = new AI(this);
        this.aiPlaysBlack = false; // AI是否执黑
        
        this.setupEventListeners();
    }

    switchAiColor() {
        this.aiPlaysBlack = !this.aiPlaysBlack;
    }

    setGameMode(mode) {
        this.gameMode = mode;
        if (mode === 'pve' && this.aiPlaysBlack) {
            // 如果是人机模式且AI执黑，则AI先手
            this.restart();
            setTimeout(() => {
                this.ai.makeMove();
            }, 500);
        } else {
            this.restart();
        }
    }

    setupEventListeners() {
        this.board.canvas.addEventListener('click', (e) => {
            if (this.gameStatus !== 'playing') return;
            
            const pos = this.board.getGridPosition(e);
            if (pos) {
                this.makeMove(pos.x, pos.y);
            }
        });
    }

    makeMove(x, y) {
        // 检查是否可以在该位置落子
        if (!this.isValidMove(x, y)) return false;
        
        // 检查是否为第一步且不在天元
        if (this.moves.length === 0 && (x !== 7 || y !== 7)) {
            alert('第一步必须落在天元位置！');
            return false;
        }
        
        // 如果是黑棋，检查禁手
        if (this.currentPlayer === 'black' && this.isProhibitedMove(x, y)) {
            alert('禁手！');
            return false;
        }
        
        // 落子
        this.board.placePiece(x, y, this.currentPlayer);
        this.lastMove = {x, y, player: this.currentPlayer};
        this.moves.push(this.lastMove);
        
        // 检查是否获胜
        if (this.checkWin(x, y)) {
            this.gameStatus = 'won';
            this.onGameEnd();
            return true;
        }
        
        this.switchPlayer();
        this.updateUI();

        // 如果是人机模式且轮到AI下棋
        if (this.gameMode === 'pve' && 
            ((this.aiPlaysBlack && this.currentPlayer === 'black') || 
             (!this.aiPlaysBlack && this.currentPlayer === 'white'))) {
            setTimeout(() => {
                this.ai.makeMove();
            }, 500); // 延迟500ms，使AI走棋更自然
        }
        return true;
    }

    isValidMove(x, y) {
        return this.board.pieces[y][x] === null;
    }

    isProhibitedMove(x, y) {
        // 临时落子以检查禁手
        this.board.pieces[y][x] = 'black';
        
        let isProhibited = false;
        let connections = this.countConnections(x, y);
        
        // 长连禁手
        if (connections.some(count => count > 5)) {
            isProhibited = true;
        }
        
        // 双三禁手
        let threeCount = 0;
        for (let direction = 0; direction < 4; direction++) {
            if (this.isOpenThree(x, y, direction)) {
                threeCount++;
            }
            if (threeCount > 1) {
                isProhibited = true;
                break;
            }
        }
        
        // 撤销临时落子
        this.board.pieces[y][x] = null;
        return isProhibited;
    }

    countConnections(x, y) {
        const directions = [
            [{x: 1, y: 0}, {x: -1, y: 0}],  // 横向
            [{x: 0, y: 1}, {x: 0, y: -1}],  // 纵向
            [{x: 1, y: 1}, {x: -1, y: -1}], // 右斜
            [{x: 1, y: -1}, {x: -1, y: 1}]  // 左斜
        ];
        
        return directions.map(dir => {
            let count = 1;
            dir.forEach(d => {
                let i = 1;
                while (true) {
                    let nextX = x + d.x * i;
                    let nextY = y + d.y * i;
                    
                    if (nextX < 0 || nextX >= 15 || nextY < 0 || nextY >= 15) break;
                    if (this.board.pieces[nextY][nextX] !== this.currentPlayer) break;
                    
                    count++;
                    i++;
                }
            });
            return count;
        });
    }

    checkWin(x, y) {
        return this.countConnections(x, y).some(count => count === 5);
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
    }

    updateUI() {
        const ui = window.gameUI;
        if (ui) {
            ui.updateDisplay();
        }
    }

    onGameEnd() {
        alert(`游戏结束！${this.currentPlayer === 'black' ? '黑' : '白'}方获胜！`);
        this.updateUI();
        
        // 如果是人机模式，在游戏结束后切换AI颜色
        if (this.gameMode === 'pve') {
            this.switchAiColor();
        }
    }

    restart() {
        this.board.clear();
        this.currentPlayer = 'black';
        this.gameStatus = 'playing';
        this.moves = [];
        this.lastMove = null;
        this.updateUI();
    }

    undoMove() {
        if (this.moves.length === 0) return;
        
        const lastMove = this.moves.pop();
        this.board.pieces[lastMove.y][lastMove.x] = null;
        this.gameStatus = 'playing';
        this.currentPlayer = lastMove.player;
        this.lastMove = this.moves[this.moves.length - 1] || null;
        
        this.board.drawBoard();
        this.board.drawPieces();
        this.updateUI();
    }
}