class TypeRush {
    constructor() {
        this.textSamples = {
            easy: [
                "The cat sat on the mat.",
                "Java is a popular language.",
                "Simple things often matter most.",
                "Speed is not always the goal.",
                "Type fast to win the game."
            ],
            medium: [
                "Technology has revolutionized the way we communicate, work, and live.",
                "Music has the unique ability to evoke emotions and bring people together.",
                "Learning new skills requires patience, practice, and persistence.",
                "Success is not final, failure is not fatal: it is the courage to continue that counts."
            ],
            hard: [
                "The juxtaposition of complex algorithms and user experience design creates seamless interaction.",
                "Inconspicuous anomalies often lead to paradigm shifts in scientific understanding.",
                "Orchestrating a symphony requires meticulous precision and profound emotional depth.",
                "The rapid proliferation of artificial intelligence necessitates rigorous ethical frameworks."
            ]
        };

        this.currentText = "";
        this.startTime = null;
        this.timeLeft = 60;
        this.timerLimit = 60;
        this.isTestActive = false;
        this.timerInterval = null;
        this.correctChars = 0;
        this.totalChars = 0;
        this.difficulty = 'medium';

        // DOM Elements
        this.textDisplay = document.getElementById('textDisplay');
        this.userInput = document.getElementById('userInput');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.timerEl = document.getElementById('timer');
        this.wpmEl = document.getElementById('wpm');
        this.accuracyEl = document.getElementById('accuracy');
        this.cpmEl = document.getElementById('cpm');
        this.overlay = document.getElementById('overlay');
        this.finalWpmEl = document.getElementById('finalWpm');
        this.finalAccuracyEl = document.getElementById('finalAccuracy');
        this.themeToggle = document.getElementById('themeToggle');
        this.difficultySelect = document.getElementById('difficultySelect');
        this.timeSelect = document.getElementById('timeSelect');

        this.init();
    }

    init() {
        this.startBtn.addEventListener('click', () => this.startTest());
        this.resetBtn.addEventListener('click', () => this.resetTest());
        this.userInput.addEventListener('input', () => this.handleInput());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            if (!this.isTestActive) this.prepareNewText();
        });
        this.timeSelect.addEventListener('change', (e) => {
            this.timerLimit = parseInt(e.target.value);
            this.timeLeft = this.timerLimit;
            this.updateTimerUI();
        });

        // Close overlay clicking outside
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.closeOverlay();
        });

        this.prepareNewText();
        this.loadTheme();
    }

    prepareNewText() {
        const samples = this.textSamples[this.difficulty];
        this.currentText = samples[Math.floor(Math.random() * samples.length)];
        this.renderText();
        this.userInput.value = "";
    }

    renderText() {
        this.textDisplay.innerHTML = this.currentText.split('').map((char, i) => {
            return `<span class="char" id="char-${i}">${char}</span>`;
        }).join('');
    }

    startTest() {
        if (this.isTestActive) return;

        this.isTestActive = true;
        this.startTime = Date.now();
        this.timeLeft = this.timerLimit;
        this.correctChars = 0;
        this.totalChars = 0;
        
        this.userInput.disabled = false;
        this.userInput.focus();
        this.startBtn.disabled = true;
        this.textDisplay.classList.add('active');

        this.updateTimerUI();
        this.timerInterval = setInterval(() => this.tick(), 1000);
    }

    tick() {
        this.timeLeft--;
        this.updateTimerUI();
        if (this.timeLeft <= 0) this.endTest();
    }

    updateTimerUI() {
        this.timerEl.textContent = `${this.timeLeft}s`;
    }

    handleInput() {
        if (!this.isTestActive) return;

        const typedText = this.userInput.value;
        this.totalChars = typedText.length;
        this.correctChars = 0;

        const charElements = this.textDisplay.querySelectorAll('.char');
        
        charElements.forEach((el, i) => {
            el.classList.remove('current', 'correct', 'incorrect');
            
            if (i < typedText.length) {
                if (typedText[i] === this.currentText[i]) {
                    el.classList.add('correct');
                    this.correctChars++;
                } else {
                    el.classList.add('incorrect');
                }
            } else if (i === typedText.length) {
                el.classList.add('current');
            }
        });

        this.updateStats();

        if (typedText.length >= this.currentText.length) {
            this.prepareNewText();
        }
    }

    updateStats() {
        const timeElapsed = (Date.now() - this.startTime) / 60000; // in minutes
        const wpm = Math.round((this.correctChars / 5) / (timeElapsed || 0.01));
        const cpm = Math.round(this.correctChars / (timeElapsed || 0.01));
        const accuracy = this.totalChars > 0 ? Math.round((this.correctChars / this.totalChars) * 100) : 100;

        this.wpmEl.textContent = wpm;
        this.cpmEl.textContent = cpm;
        this.accuracyEl.textContent = `${accuracy}%`;
    }

    endTest() {
        this.isTestActive = false;
        clearInterval(this.timerInterval);
        this.userInput.disabled = true;
        this.startBtn.disabled = false;
        this.textDisplay.classList.remove('active');

        // Show final results
        this.finalWpmEl.textContent = this.wpmEl.textContent;
        this.finalAccuracyEl.textContent = this.accuracyEl.textContent;
        this.overlay.classList.add('active');
    }

    resetTest() {
        this.isTestActive = false;
        clearInterval(this.timerInterval);
        this.timeLeft = this.timerLimit;
        this.correctChars = 0;
        this.totalChars = 0;
        
        this.userInput.value = "";
        this.userInput.disabled = true;
        this.startBtn.disabled = false;
        this.textDisplay.classList.remove('active');
        
        this.wpmEl.textContent = "0";
        this.cpmEl.textContent = "0";
        this.accuracyEl.textContent = "100%";
        this.updateTimerUI();
        this.prepareNewText();
        this.closeOverlay();
    }

    closeOverlay() {
        this.overlay.classList.remove('active');
    }

    toggleTheme() {
        const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    loadTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        this.themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TypeRush();
});
