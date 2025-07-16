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
        this.previousMove = null;

        // New settings
        this.audioEnabled = true;
        this.audioSpeed = 1.0;
        this.audioPitch = 1.0;
        this.selectedVoice = null;
        this.hideFieldDuringCommands = false;
        this.enhancedVisualBreaks = true;
        this.pauseDuration = 250;

        this.initializeElements();
        this.bindEvents();
        this.loadVoices();
        this.loadSettings();
        this.createGrid();
    }

    initializeElements() {
        // Original elements
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

        // New elements
        this.toggleSettingsBtn = document.getElementById('toggle-settings');
        this.settingsPanel = document.getElementById('settings-panel');
        this.audioEnabledCheckbox = document.getElementById('audio-enabled');
        this.audioSpeedSlider = document.getElementById('audio-speed');
        this.audioSpeedValue = document.getElementById('audio-speed-value');
        this.audioPitchSlider = document.getElementById('audio-pitch');
        this.audioPitchValue = document.getElementById('audio-pitch-value');
        this.voiceSelect = document.getElementById('voice-select');
        this.hideFieldCheckbox = document.getElementById('hide-field-during-commands');
        this.enhancedBreaksCheckbox = document.getElementById('enhanced-visual-breaks');
        this.pauseDurationSlider = document.getElementById('pause-duration');
        this.pauseDurationValue = document.getElementById('pause-duration-value');
        
        // Синхронизируем дефолтные значения с UI
        this.gridSizeSelect.value = this.gridSize;
    }

    bindEvents() {
        // Original events
        this.speedSlider.addEventListener('input', (e) => {
            this.speed = parseFloat(e.target.value) * 1000;
            this.speedValue.textContent = e.target.value;
            this.saveSettings();
        });

        this.gridSizeSelect.addEventListener('change', (e) => {
            this.gridSize = parseInt(e.target.value);
            this.createGrid();
            this.saveSettings();
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

        // New events
        this.toggleSettingsBtn.addEventListener('click', () => {
            this.settingsPanel.classList.toggle('collapsed');
            const isCollapsed = this.settingsPanel.classList.contains('collapsed');
            this.toggleSettingsBtn.textContent = isCollapsed ? '⚙️ Показать настройки' : '⚙️ Скрыть настройки';
        });

        this.audioEnabledCheckbox.addEventListener('change', (e) => {
            this.audioEnabled = e.target.checked;
            this.saveSettings();
        });

        this.audioSpeedSlider.addEventListener('input', (e) => {
            this.audioSpeed = parseFloat(e.target.value);
            this.audioSpeedValue.textContent = e.target.value;
            this.saveSettings();
        });

        this.audioPitchSlider.addEventListener('input', (e) => {
            this.audioPitch = parseFloat(e.target.value);
            this.audioPitchValue.textContent = e.target.value;
            this.saveSettings();
        });

        this.voiceSelect.addEventListener('change', (e) => {
            this.selectedVoice = e.target.value;
            this.saveSettings();
        });

        this.hideFieldCheckbox.addEventListener('change', (e) => {
            this.hideFieldDuringCommands = e.target.checked;
            this.saveSettings();
        });

        this.enhancedBreaksCheckbox.addEventListener('change', (e) => {
            this.enhancedVisualBreaks = e.target.checked;
            this.saveSettings();
        });

        this.pauseDurationSlider.addEventListener('input', (e) => {
            this.pauseDuration = parseInt(e.target.value);
            this.pauseDurationValue.textContent = e.target.value;
            this.saveSettings();
        });

        this.movesCountInput.addEventListener('change', () => {
            this.saveSettings();
        });

        this.createGrid();
    }

    loadVoices() {
        const updateVoices = () => {
            const voices = speechSynthesis.getVoices();
            const russianVoices = voices.filter(voice => 
                voice.lang.includes('ru') || voice.lang.includes('RU')
            );
            
            this.voiceSelect.innerHTML = '<option value="">Голос по умолчанию</option>';
            
            russianVoices.forEach((voice, index) => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;
                this.voiceSelect.appendChild(option);
            });

            if (russianVoices.length === 0) {
                voices.slice(0, 5).forEach((voice, index) => {
                    const option = document.createElement('option');
                    option.value = voice.name;
                    option.textContent = `${voice.name} (${voice.lang})`;
                    this.voiceSelect.appendChild(option);
                });
            }
        };

        if (speechSynthesis.getVoices().length > 0) {
            updateVoices();
        } else {
            speechSynthesis.addEventListener('voiceschanged', updateVoices);
        }
    }

    saveSettings() {
        const settings = {
            speed: this.speedSlider.value,
            gridSize: this.gridSizeSelect.value,
            movesCount: this.movesCountInput.value,
            audioEnabled: this.audioEnabled,
            audioSpeed: this.audioSpeed,
            audioPitch: this.audioPitch,
            selectedVoice: this.selectedVoice,
            hideFieldDuringCommands: this.hideFieldDuringCommands,
            enhancedVisualBreaks: this.enhancedVisualBreaks,
            pauseDuration: this.pauseDuration
        };
        localStorage.setItem('flyGameSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('flyGameSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                
                if (settings.speed) {
                    this.speedSlider.value = settings.speed;
                    this.speed = parseFloat(settings.speed) * 1000;
                    this.speedValue.textContent = settings.speed;
                }
                
                if (settings.gridSize) {
                    this.gridSizeSelect.value = settings.gridSize;
                    this.gridSize = parseInt(settings.gridSize);
                }
                
                if (settings.movesCount) {
                    this.movesCountInput.value = settings.movesCount;
                }
                
                if (settings.audioEnabled !== undefined) {
                    this.audioEnabled = settings.audioEnabled;
                    this.audioEnabledCheckbox.checked = settings.audioEnabled;
                }
                
                if (settings.audioSpeed) {
                    this.audioSpeed = settings.audioSpeed;
                    this.audioSpeedSlider.value = settings.audioSpeed;
                    this.audioSpeedValue.textContent = settings.audioSpeed;
                }
                
                if (settings.audioPitch) {
                    this.audioPitch = settings.audioPitch;
                    this.audioPitchSlider.value = settings.audioPitch;
                    this.audioPitchValue.textContent = settings.audioPitch;
                }
                
                if (settings.selectedVoice) {
                    this.selectedVoice = settings.selectedVoice;
                    this.voiceSelect.value = settings.selectedVoice;
                }
                
                if (settings.hideFieldDuringCommands !== undefined) {
                    this.hideFieldDuringCommands = settings.hideFieldDuringCommands;
                    this.hideFieldCheckbox.checked = settings.hideFieldDuringCommands;
                }
                
                if (settings.enhancedVisualBreaks !== undefined) {
                    this.enhancedVisualBreaks = settings.enhancedVisualBreaks;
                    this.enhancedBreaksCheckbox.checked = settings.enhancedVisualBreaks;
                }
                
                if (settings.pauseDuration) {
                    this.pauseDuration = settings.pauseDuration;
                    this.pauseDurationSlider.value = settings.pauseDuration;
                    this.pauseDurationValue.textContent = settings.pauseDuration;
                }
            } catch (e) {
                console.error('Error loading settings:', e);
            }
        }
    }

    createGrid() {
        this.grid.innerHTML = '';
        this.grid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        this.grid.setAttribute('data-size', this.gridSize);

        const centerIndex = Math.floor(this.gridSize / 2) * this.gridSize + Math.floor(this.gridSize / 2);

        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            
            // Highlight the starting position (center)
            if (i === centerIndex) {
                cell.classList.add('fly-start');
            }
            
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
        this.previousMove = null;
        this.startButton.disabled = true;
        this.progressDiv.innerHTML = '';
        
        // Hide settings during game
        this.settingsPanel.classList.add('collapsed');
        this.toggleSettingsBtn.textContent = '⚙️ Показать настройки';
        
        this.showCountdown(3, () => {
            // Remove fly start highlighting when game begins
            const flyStartCell = this.grid.querySelector('.fly-start');
            if (flyStartCell) {
                flyStartCell.classList.remove('fly-start');
            }
            
            if (this.hideFieldDuringCommands) {
                this.grid.classList.add('hidden-during-commands');
            }
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
        if (!this.audioEnabled || !('speechSynthesis' in window)) return;

        const utter = new window.SpeechSynthesisUtterance(command);
        utter.lang = 'ru-RU';
        utter.rate = this.audioSpeed;
        utter.pitch = this.audioPitch;
        
        if (this.selectedVoice) {
            const voices = speechSynthesis.getVoices();
            const voice = voices.find(v => v.name === this.selectedVoice);
            if (voice) {
                utter.voice = voice;
            }
        }
        
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
    }

    executeNextMove() {
        if (this.currentMoveIndex >= this.moves.length) {
            this.endMovementPhase();
            return;
        }

        // 1. Pause phase - show rainbow stripe during pause
        this.progressDiv.classList.remove('rainbow-effect');
        this.progressDiv.innerHTML = '<span class="progress-text">...</span>';
        
        // Apply rainbow stripe effect during pause when enhanced visual breaks are enabled
        if (this.enhancedVisualBreaks) {
            // Set animation duration to match pause duration
            this.progressDiv.style.setProperty('--pause-duration', `${this.pauseDuration}ms`);
            this.progressDiv.classList.add('rainbow-effect');
        }

        this.moveTimeout = setTimeout(() => {
            // 2. Show and speak command - remove rainbow effect
            this.progressDiv.classList.remove('rainbow-effect');
            
            const move = this.moves[this.currentMoveIndex];
            this.progressDiv.innerHTML = `<span class="progress-text">${move} (${this.currentMoveIndex + 1} / ${this.totalMoves})</span>`;
            this.speakCommand(move);
            this.applyMove(move);

            this.previousMove = move;
            this.currentMoveIndex++;

            // Schedule next move
            this.moveTimeout = setTimeout(() => {
                this.executeNextMove();
            }, this.speed);
        }, this.pauseDuration);
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
        // Show the grid again
        this.grid.classList.remove('hidden-during-commands');
        
        this.progressDiv.classList.remove('rainbow-effect');
        this.progressDiv.innerHTML = '<span class="progress-text">Где находится муха? Нажмите на клетку!</span>';
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
        Array.from(this.grid.children).forEach((cell, index) => {
            const centerIndex = Math.floor(this.gridSize / 2) * this.gridSize + Math.floor(this.gridSize / 2);
            cell.className = 'grid-cell';
            
            // Restore fly-start highlighting for center cell after game
            if (index === centerIndex && !this.gameActive) {
                cell.classList.add('fly-start');
            }
            
            cell.textContent = '';
        });
    }

    resetGame() {
        this.resultModal.classList.add('hidden');
        this.startButton.disabled = false;
        this.clearGrid();
        this.progressDiv.innerHTML = '';
        this.gameActive = false;
        this.grid.classList.remove('hidden-during-commands');
        
        // Show settings panel again
        this.settingsPanel.classList.remove('collapsed');
        this.toggleSettingsBtn.textContent = '⚙️ Скрыть настройки';
        
        if (this.countdownTimeout) {
            clearTimeout(this.countdownTimeout);
        }
        if (this.moveTimeout) {
            clearTimeout(this.moveTimeout);
        }
        
        this.countdownOverlay.classList.add('hidden');
        this.countdownOverlay.textContent = '';
        this.progressDiv.classList.remove('rainbow-effect');
        this.previousMove = null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FlyGame();
});
