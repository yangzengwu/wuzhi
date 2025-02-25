// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    try {
        // 创建游戏实例
        window.game = new Game();
        
        // 创建UI实例
        window.gameUI = new UI(window.game);
        
        // 初始化UI显示
        window.gameUI.updateDisplay();
        
    } catch (error) {
        console.error('游戏初始化失败:', error);
        alert('游戏初始化失败，请刷新页面重试');
    }
    
    // 监听窗口大小变化，调整棋盘大小
    window.addEventListener('resize', () => {
        const board = document.getElementById('board');
        if (window.innerWidth <= 650) {
            const size = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9);
            board.width = size;
            board.height = size;
        } else {
            board.width = 600;
            board.height = 600;
        }
        
        // 重新创建游戏实例以更新棋盘大小
        window.game = new Game();
        window.gameUI = new UI(window.game);
        window.gameUI.updateDisplay();
    });
});