/***********************
 * QUESTION DATABASE
 ***********************/
const questionsDB = [
    // General Knowledge
    { category: "General Knowledge", difficulty: "easy", question: "What is the capital of France?", options: ["London", "Berlin", "Madrid", "Paris"], answer: 3 },
    { category: "General Knowledge", difficulty: "easy", question: "Which planet is known as the Red Planet?", options: ["Mars", "Venus", "Jupiter", "Saturn"], answer: 0 },
    { category: "General Knowledge", difficulty: "easy", question: "How many continents are there?", options: ["5", "6", "7", "8"], answer: 2 },
    { category: "General Knowledge", difficulty: "medium", question: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"], answer: 2 },
    { category: "General Knowledge", difficulty: "medium", question: "Land of Rising Sun?", options: ["China", "Japan", "Thailand", "Korea"], answer: 1 },
    { category: "General Knowledge", difficulty: "hard", question: "Smallest country in world?", options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"], answer: 1 },

    // Science
    { category: "Science", difficulty: "easy", question: "Symbol of Oxygen?", options: ["O", "Ox", "Og", "Om"], answer: 0 },
    { category: "Science", difficulty: "easy", question: "Plants absorb?", options: ["Oxygen", "Nitrogen", "CO2", "Hydrogen"], answer: 2 },
    { category: "Science", difficulty: "medium", question: "Powerhouse of cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi"], answer: 2 },
    { category: "Science", difficulty: "medium", question: "Symbol of Gold?", options: ["Ag", "Au", "Fe", "Cu"], answer: 1 },
    { category: "Science", difficulty: "hard", question: "Speed of light?", options: ["299792 km/s", "150000", "1000", "3000"], answer: 0 },

    // Technology
    { category: "Technology", difficulty: "easy", question: "CPU full form?", options: ["Central Processing Unit", "Central Program Unit", "Core Unit", "Control Unit"], answer: 0 },
    { category: "Technology", difficulty: "easy", question: "Who made iPhone?", options: ["Samsung", "Google", "Apple", "Microsoft"], answer: 2 },
    { category: "Technology", difficulty: "medium", question: "HTML stands for?", options: ["Hyper Text Markup Language", "High Tech ML", "Home Tool ML", "Hyper Transfer ML"], answer: 0 },
    { category: "Technology", difficulty: "medium", question: "Language of Web?", options: ["Java", "Python", "JavaScript", "C++"], answer: 2 },
    { category: "Technology", difficulty: "hard", question: "First computer virus year?", options: ["1983", "1971", "1990", "1986"], answer: 1 },

    // History
    { category: "History", difficulty: "easy", question: "First US President?", options: ["Lincoln", "Washington", "Jefferson", "Adams"], answer: 1 },
    { category: "History", difficulty: "medium", question: "WW2 ended in?", options: ["1940", "1942", "1945", "1950"], answer: 2 },
    { category: "History", difficulty: "hard", question: "Battle of Hastings year?", options: ["1066", "1215", "1492", "1776"], answer: 0 }
];

/***********************
 * APP STATE
 ***********************/
let currentQuestions = [];
let currentIndex = 0;
let userAnswers = [];
let timer;
let timeLeft;
let startTime;

const QUESTION_TIME = 15;
const TOTAL_QUESTIONS = 10;

/***********************
 * DOM ELEMENTS
 ***********************/
const screens = {
    home: document.getElementById("home-screen"),
    quiz: document.getElementById("quiz-screen"),
    result: document.getElementById("results-screen")
};

const ui = {
    category: document.getElementById("category-select"),
    difficulty: document.getElementById("difficulty-select"),
    startBtn: document.getElementById("start-btn"),
    question: document.getElementById("question-text"),
    options: document.getElementById("options-container"),
    nextBtn: document.getElementById("next-btn"),
    timer: document.getElementById("timer"),
    progress: document.getElementById("progress-bar"),
    count: document.getElementById("question-count"),
    score: document.getElementById("final-score"),
    correct: document.getElementById("count-correct"),
    wrong: document.getElementById("count-wrong"),
    avgTime: document.getElementById("avg-time"),
    restart: document.getElementById("restart-btn")
};

/***********************
 * INIT
 ***********************/
init();
function init() {
    loadCategories();
    ui.startBtn.onclick = startQuiz;
    ui.nextBtn.onclick = nextQuestion;
    ui.restart.onclick = () => switchScreen("home");
}

/***********************
 * UTILITIES
 ***********************/
function switchScreen(screen) {
    Object.values(screens).forEach(s => s.classList.remove("active"));
    screens[screen].classList.add("active");
}

function loadCategories() {
    const cats = ["All", ...new Set(questionsDB.map(q => q.category))];
    ui.category.innerHTML = cats.map(c => `<option>${c}</option>`).join("");
}

/***********************
 * QUIZ LOGIC
 ***********************/
function startQuiz() {
    const cat = ui.category.value;
    const diff = ui.difficulty.value;

    let filtered = questionsDB.filter(q =>
        (cat === "All" || q.category === cat) &&
        (diff === "mixed" || q.difficulty === diff)
    );

    // Ensure 10 questions
    if (filtered.length < TOTAL_QUESTIONS) {
        const remaining = questionsDB.filter(q => !filtered.includes(q));
        filtered = filtered.concat(remaining);
    }

    filtered.sort(() => Math.random() - 0.5);
    currentQuestions = filtered.slice(0, TOTAL_QUESTIONS);

    currentIndex = 0;
    userAnswers = [];
    switchScreen("quiz");
    loadQuestion();
}

function loadQuestion() {
    const q = currentQuestions[currentIndex];
    ui.question.textContent = q.question;
    ui.count.textContent = `Question ${currentIndex + 1}/${TOTAL_QUESTIONS}`;
    ui.progress.style.width = `${(currentIndex / TOTAL_QUESTIONS) * 100}%`;

    ui.options.innerHTML = "";
    ui.options.dataset.selected = "";

    q.options.forEach((opt, i) => {
        const div = document.createElement("div");
        div.className = "option-card";
        div.textContent = opt;
        div.onclick = () => selectOption(i, div);
        ui.options.appendChild(div);
    });

    ui.nextBtn.disabled = true;
    ui.nextBtn.textContent = currentIndex === TOTAL_QUESTIONS - 1 ? "Submit Quiz" : "Next";
    startTimer();
}

function startTimer() {
    clearInterval(timer);
    timeLeft = QUESTION_TIME;
    startTime = Date.now();
    ui.timer.textContent = `${timeLeft}s`;

    timer = setInterval(() => {
        timeLeft--;
        ui.timer.textContent = `${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            saveAnswer(-1);
            moveNext();
        }
    }, 1000);
}

function selectOption(index, el) {
    document.querySelectorAll(".option-card").forEach(o => o.classList.remove("selected"));
    el.classList.add("selected");
    ui.options.dataset.selected = index;
    ui.nextBtn.disabled = false;
}

function nextQuestion() {
    clearInterval(timer);
    const selected = parseInt(ui.options.dataset.selected);
    saveAnswer(isNaN(selected) ? -1 : selected);
    moveNext();
}

function saveAnswer(selected) {
    const q = currentQuestions[currentIndex];
    const timeTaken = Math.min((Date.now() - startTime) / 1000, QUESTION_TIME);
    userAnswers.push({
        selected,
        correct: q.answer,
        isCorrect: selected === q.answer,
        timeTaken
    });
}

function moveNext() {
    currentIndex++;
    if (currentIndex < TOTAL_QUESTIONS) loadQuestion();
    else showResults();
}

/***********************
 * RESULTS
 ***********************/
function showResults() {
    switchScreen("result");

    const correct = userAnswers.filter(a => a.isCorrect).length;
    const wrong = TOTAL_QUESTIONS - correct;
    const avg = (userAnswers.reduce((s, a) => s + a.timeTaken, 0) / TOTAL_QUESTIONS).toFixed(1);

    ui.score.textContent = Math.round((correct / TOTAL_QUESTIONS) * 100);
    ui.correct.textContent = correct;
    ui.wrong.textContent = wrong;
    ui.avgTime.textContent = `${avg}s`;

    renderCharts();
}

function renderCharts() {
    new Chart(document.getElementById("timeChart"), {
        type: "bar",
        data: {
            labels: userAnswers.map((_, i) => `Q${i + 1}`),
            datasets: [{ data: userAnswers.map(a => a.timeTaken) }]
        }
    });

    new Chart(document.getElementById("scoreChart"), {
        type: "doughnut",
        data: {
            labels: ["Correct", "Wrong"],
            datasets: [{ data: [ui.correct.textContent, ui.wrong.textContent] }]
        }
    });
}
