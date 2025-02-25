class Board {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = 15;
        this.cellSize = canvas.width / (this.gridSize + 1);
        this.padding = this.cellSize;
        this.pieces = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));
        
        // 天元和四星位坐标
        this.starPoints = [
            {x: 7, y: 7},  // 天元
            {x: 3, y: 3},  // 左上
            {x: 11, y: 3}, // 右上
            {x: 3, y: 11}, // 左下
            {x: 11, y: 11} // 右下
        ];
        
        this.init();
    }

    init() {
        this.drawBoard();
        this.setupEventListeners();
    }

    drawBoard() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制棋盘背景
        this.ctx.fillStyle = '#DEB887';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格线
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;

        // 绘制横线和竖线
        for (let i = 0; i < this.gridSize; i++) {
            // 横线
            this.ctx.moveTo(this.padding, this.padding + i * this.cellSize);
            this.ctx.lineTo(this.canvas.width - this.padding, this.padding + i * this.cellSize);
            
            // 竖线
            this.ctx.moveTo(this.padding + i * this.cellSize, this.padding);
            this.ctx.lineTo(this.padding + i * this.cellSize, this.canvas.height - this.padding);
        }
        this.ctx.stroke();

        // 绘制天元和星位
        this.starPoints.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(
                this.padding + point.x * this.cellSize,
                this.padding + point.y * this.cellSize,
                4, 0, Math.PI * 2
            );
            this.ctx.fillStyle = '#000';
            this.ctx.fill();
        });

        // 绘制所有已有的棋子
        this.drawPieces();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const pos = this.getGridPosition(e);
            if (pos && this.pieces[pos.y][pos.x] === null) {
                this.redrawWithGhost(pos.x, pos.y);
            }
        });

        // 当鼠标离开棋盘时，重新绘制以清除预览棋子
        this.canvas.addEventListener('mouseleave', () => {
            this.drawBoard();
        });
    }

    redrawWithGhost(x, y) {
        this.drawBoard(); // 这会绘制棋盘和所有已放置的棋子
        this.drawGhostPiece(x, y); // 然后绘制预览棋子
    }

    getGridPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // 计算最近的交叉点
        const gridX = Math.round((x - this.padding) / this.cellSize);
        const gridY = Math.round((y - this.padding) / this.cellSize);
        
        // 检查是否在有效范围内
        if (gridX >= 0 && gridX < this.gridSize && gridY >= 0 && gridY < this.gridSize) {
            return {x: gridX, y: gridY};
        }
        return null;
    }

    drawGhostPiece(x, y) {
        const game = window.game;
        if (!game) return;

        this.ctx.beginPath();
        this.ctx.arc(
            this.padding + x * this.cellSize,
            this.padding + y * this.cellSize,
            this.cellSize * 0.4,
            0, Math.PI * 2
        );
        this.ctx.fillStyle = game.currentPlayer === 'black' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
        this.ctx.fill();
    }

    placePiece(x, y, color) {
        this.pieces[y][x] = color;
        this.drawBoard(); // 这会绘制棋盘和所有棋子
    }

    drawPieces() {
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.pieces[y][x]) {
                    this.drawPiece(x, y, this.pieces[y][x]);
                }
            }
        }
    }

    drawPiece(x, y, color) {
        this.ctx.beginPath();
        this.ctx.arc(
            this.padding + x * this.cellSize,
            this.padding + y * this.cellSize,
            this.cellSize * 0.4,
            0, Math.PI * 2
        );
        
        // 绘制棋子本体
        this.ctx.fillStyle = color === 'black' ? '#000' : '#fff';
        this.ctx.fill();
        
        // 绘制棋子边框
        this.ctx.strokeStyle = color === 'black' ? '#000' : '#ccc';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }

    clear() {
        this.pieces = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));
        this.drawBoard();
    }
}