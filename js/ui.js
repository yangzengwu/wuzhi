class UI {
    constructor(game) {
        this.game = game;
        this.statusDisplay = document.getElementById('status');
        this.timer = document.getElementById('timer');
        this.startTime = new Date();
        this.timerInterval = null;
        this.aiSettings = document.getElementById('ai-settings');
        
        this.setupEventListeners();
        this.startTimer();
        this.updateModeButtons();
    }

    setupEventListeners() {
        // 游戏模式切换
        document.getElementById('pvp').addEventListener('click', () => {
            this.setGameMode('pvp');
        });

        document.getElementById('pve').addEventListener('click', () => {
            this.setGameMode('pve');
        });

        // AI难度切换
        document.getElementById('easy').addEventListener('click', () => {
            this.setAIDifficulty('easy');
        });

        document.getElementById('medium').addEventListener('click', () => {
            this.setAIDifficulty('medium');
        });

        document.getElementById('hard').addEventListener('click', () => {
            this.setAIDifficulty('hard');
        });

        // 游戏控制按钮
        document.getElementById('undo').addEventListener('click', () => {
            if (this.game.gameMode === 'pve' && this.game.currentPlayer === 'white') {
                return; // 在AI思考时禁用悔棋
            }
            this.game.undoMove();
            if (this.game.gameMode === 'pve') {
                // 在人机模式下，连续悔棋两步，保证轮到玩家
                this.game.undoMove();
            }
        });

        document.getElementById('restart').addEventListener('click', () => {
            if (confirm('确定要重新开始游戏吗？')) {
                this.game.restart();
                this.resetTimer();
            }
        });
    }

    setGameMode(mode) {
        // 更新按钮样式
        document.getElementById('pvp').classList.toggle('active', mode === 'pvp');
        document.getElementById('pve').classList.toggle('active', mode === 'pve');
        
        // 显示/隐藏AI难度设置
        this.aiSettings.style.display = mode === 'pve' ? 'block' : 'none';
        
        // 设置游戏模式
        this.game.setGameMode(mode);
    }

    setAIDifficulty(level) {
        // 更新难度按钮样式
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.classList.toggle('active', btn.id === level);
        });
        
        // 设置AI难度
        this.game.ai.setDifficulty(level);
        
        // 重新开始游戏
        this.game.restart();
    }

    updateModeButtons() {
        document.getElementById('pvp').classList.toggle('active', this.game.gameMode === 'pvp');
        document.getElementById('pve').classList.toggle('active', this.game.gameMode === 'pve');
        
        // 更新AI设置显示状态
        this.aiSettings.style.display = this.game.gameMode === 'pve' ? 'block' : 'none';
    }

    updateDisplay() {
        // 更新当前回合显示
        const playerText = this.game.currentPlayer === 'black' ? '黑子' : '白子';
        let statusText = `当前回合：${playerText}`;
        
        // 如果游戏结束，显示获胜信息
        if (this.game.gameStatus === 'won') {
            statusText = `游戏结束！${playerText}获胜！`;
        }
        
        this.statusDisplay.textContent = statusText;
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            const now = new Date();
            const diff = now - this.startTime;
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            this.timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    resetTimer() {
        this.startTime = new Date();
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        this.timer.textContent = '00:00';
        this.startTimer();
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }
}