class FlyGame {
    constructor() {
        this.gridSize = 5;
        this.flyPosition = { x: 2, y: 2 };
        this.moves = [];
        this.currentMoveIndex = 0;
        this.speed = 1000;
        this.totalMoves = 10;
        this.gameActive = false;
        this.countdownTimeout = null;
        this.moveTimeout = null;

        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.speedSlider = document.getElementById('speed');
        this.speedValue = document.getElementById('speed-value');
        this.gridSizeSelect = document.getElementById('grid-size');
        this.movesCountInput = document.getElementById('moves-count');
        this.startButton = document.getElementById('start-game');
        this.grid = document.getElementById('grid');
        this.progressDiv = document.getElementById('progress');
        this.resultModal = document.getElementById('result-modal');
        this.resultTitle = document.getElementById('result-title');
        this.resultMessage = document.getElementById('result-message');
        this.playAgainButton = document.getElementById('play-again');
        this.toggleInstructionBtn = document.getElementById('toggle-instruction');
        this.instructionDiv = document.getElementById('instruction');
        this.countdownOverlay = document.getElementById('countdown-overlay');
        this.moveDisplayDiv = document.getElementById('move-display');
    }

    bindEvents() {
        this.speedSlider.addEventListener('input', (e) => {
            this.speed = parseFloat(e.target.value) * 1000;
            this.speedValue.textContent = e.target.value;
        });

        this.gridSizeSelect.addEventListener('change', (e) => {
            this.gridSize = parseInt(e.target.value);
            this.createGrid();
        });

        this.startButton.addEventListener('click', () => this.startGame());
        this.playAgainButton.addEventListener('click', () => this.resetGame());

        this.toggleInstructionBtn.addEventListener('click', () => {
            if (this.instructionDiv.classList.contains('hidden')) {
                this.instructionDiv.classList.remove('hidden');
                this.toggleInstructionBtn.textContent = "Скрыть инструкцию";
            } else {
                this.instructionDiv.classList.add('hidden');
                this.toggleInstructionBtn.textContent = "Показать инструкцию";
            }
        });

        this.createGrid();
    }

    createGrid() {
        this.grid.innerHTML = '';
        this.grid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;

        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.addEventListener('click', () => this.handleCellClick(i));
            this.grid.appendChild(cell);
        }
    }

    generateMoves() {
        const directions = ['вверх', 'вниз', 'влево', 'вправо'];
        this.moves = [];
        let pos = {
            x: Math.floor(this.gridSize / 2),
            y: Math.floor(this.gridSize / 2)
        };

        for (let i = 0; i < this.totalMoves; i++) {
            let possible = [];
            if (pos.y > 0) possible.push('вверх');
            if (pos.y < this.gridSize - 1) possible.push('вниз');
            if (pos.x > 0) possible.push('влево');
            if (pos.x < this.gridSize - 1) possible.push('вправо');
            const dir = possible[Math.floor(Math.random() * possible.length)];
            this.moves.push(dir);
            switch (dir) {
                case 'вверх': pos.y -= 1; break;
                case 'вниз': pos.y += 1; break;
                case 'влево': pos.x -= 1; break;
                case 'вправо': pos.x += 1; break;
            }
        }
    }

    startGame() {
        this.gridSize = parseInt(this.gridSizeSelect.value);
        this.totalMoves = parseInt(this.movesCountInput.value);
        this.speed = parseFloat(this.speedSlider.value) * 1000;

        this.flyPosition = {
            x: Math.floor(this.gridSize / 2),
            y: Math.floor(this.gridSize / 2)
        };

        this.createGrid();
        this.generateMoves();
        this.currentMoveIndex = 0;
        this.gameActive = true;
        this.startButton.disabled = true;
        this.progressDiv.textContent = '';
        this.moveDisplayDiv.textContent = '';
        this.moveDisplayDiv.classList.add('empty');
        this.showCountdown(3, () => {
            this.executeNextMove();
        });
    }

    showCountdown(seconds, callback) {
        this.countdownOverlay.classList.remove('hidden');
        let remaining = seconds;
        this.countdownOverlay.textContent = remaining;
        const tick = () => {
            remaining -= 1;
            if (remaining > 0) {
                this.countdownOverlay.textContent = remaining;
                this.countdownTimeout = setTimeout(tick, 1000);
            } else {
                this.countdownOverlay.classList.add('hidden');
                this.countdownOverlay.textContent = '';
                if (typeof callback === 'function') callback();
            }
        };
        this.countdownTimeout = setTimeout(tick, 1000);
    }

    speakCommand(command) {
        if ('speechSynthesis' in window) {
            const utter = new window.SpeechSynthesisUtterance(command);
            utter.lang = 'ru-RU';
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utter);
        }
    }

    executeNextMove() {
        if (this.currentMoveIndex >= this.moves.length) {
            this.moveDisplayDiv.textContent = '';
            this.moveDisplayDiv.classList.add('empty');
            this.endMovementPhase();
            return;
        }

        // 1. Пауза 250 мс (пусто)
        this.moveDisplayDiv.textContent = '';
        this.moveDisplayDiv.classList.add('empty');

        this.moveTimeout = setTimeout(() => {
            // 2. Показываем команду и озвучиваем
            const move = this.moves[this.currentMoveIndex];
            this.moveDisplayDiv.textContent = move;
            this.moveDisplayDiv.classList.remove('empty');
            this.progressDiv.textContent = `${this.currentMoveIndex + 1} / ${this.totalMoves}`;
            this.speakCommand(move);
            this.applyMove(move);

            this.currentMoveIndex++;

            // Через this.speed миллисекунд — следующий ход
            this.moveTimeout = setTimeout(() => {
                this.executeNextMove();
            }, this.speed);
        }, 250);
    }

    applyMove(direction) {
        const newPos = { ...this.flyPosition };
        switch (direction) {
            case 'вверх':
                if (newPos.y > 0) newPos.y -= 1;
                break;
            case 'вниз':
                if (newPos.y < this.gridSize - 1) newPos.y += 1;
                break;
            case 'влево':
                if (newPos.x > 0) newPos.x -= 1;
                break;
            case 'вправо':
                if (newPos.x < this.gridSize - 1) newPos.x += 1;
                break;
        }
        this.flyPosition = newPos;
    }

    endMovementPhase() {
        this.moveDisplayDiv.textContent = 'Где находится муха? Нажмите на клетку!';
        this.progressDiv.textContent = 'Выберите позицию мухи';
        this.gameActive = false;
    }

    handleCellClick(cellIndex) {
        if (this.gameActive) return;

        const x = cellIndex % this.gridSize;
        const y = Math.floor(cellIndex / this.gridSize);

        const correct = (x === this.flyPosition.x && y === this.flyPosition.y);

        this.showResult(correct, cellIndex);
    }

    showResult(correct, selectedIndex) {
        const correctIndex = this.flyPosition.y * this.gridSize + this.flyPosition.x;

        this.clearGrid();

        const selectedCell = this.grid.children[selectedIndex];
        selectedCell.classList.add(correct ? 'correct' : 'wrong');
        selectedCell.textContent = '👆';

        if (!correct) {
            const correctCell = this.grid.children[correctIndex];
            correctCell.classList.add('correct');
            correctCell.textContent = '🪰';
        } else {
            selectedCell.textContent = '🪰';
        }

        this.resultTitle.textContent = correct ? 'Верно!' : 'Не верно!';
        this.resultMessage.innerHTML =
            (correct
                ? 'Поздравляем! Вы правильно отследили муху.'
                : `Муха находилась в позиции (${this.flyPosition.x + 1}, ${this.flyPosition.y + 1}).`)
            + '<br><br>Вы можете поблагодарить меня, подписавшись на канал в телеграм: <a href="https://t.me/ResourcesfulLab" target="_blank">Лаборатория Ресурсов</a>';

        this.resultModal.classList.remove('hidden');
    }

    clearGrid() {
        Array.from(this.grid.children).forEach(cell => {
            cell.className = 'grid-cell';
            cell.textContent = '';
        });
    }

    resetGame() {
        this.resultModal.classList.add('hidden');
        this.startButton.disabled = false;
        this.clearGrid();
        this.progressDiv.textContent = '';
        this.gameActive = false;
        if (this.countdownTimeout) {
            clearTimeout(this.countdownTimeout);
        }
        if (this.moveTimeout) {
            clearTimeout(this.moveTimeout);
        }
        this.countdownOverlay.classList.add('hidden');
        this.countdownOverlay.textContent = '';
        this.moveDisplayDiv.textContent = '';
        this.moveDisplayDiv.classList.add('empty');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FlyGame();
});
