// Global variables
let currentScore = 0;
let currentLevel = 1;
let numberMax = 10;
let correctAnswer = 0;
let questionCounter = 0; 
let currentNum1 = 0;
let currentNum2 = 0;

// --- VOICE NARRATION FUNCTIONS ---

function speak(text) {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
}

function readQuestionAndHint() {
    // This function will now call the detailed hint function
    askHint(true); 
}

// --- SCREEN TRANSITION FUNCTIONS (No Change) ---

function showIntro() {
    document.getElementById('greetingScreen').style.display = 'none';
    document.getElementById('introScreen').style.display = 'flex'; 
}

function startGame() {
    document.getElementById('introScreen').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    nextQuestion(); 
}

// --- HELPER FUNCTIONS ---

function calculateLCM(a, b) {
    let max = Math.max(a, b);
    let lcm = max;
    while (true) {
        if (lcm % a === 0 && lcm % b === 0) {
            return lcm;
        }
        lcm += max;
    }
}

function updateScore(points) {
    currentScore += points;
    const scoreElement = document.getElementById('score');
    scoreElement.innerText = Math.floor(currentScore); 
    
    scoreElement.style.transform = 'scale(1.3)';
    setTimeout(() => { scoreElement.style.transform = 'scale(1.0)'; }, 200);

    if (currentScore >= currentLevel * 5) {
        currentLevel++;
        document.getElementById('level').innerText = currentLevel;
        numberMax += 5;
        alert(`Level Up! 🎉 You're now on Level ${currentLevel}! The numbers are getting bigger!`);
    }
}

// --- NEW FUNCTION: Generates Multiples for Teaching ---
function generateMultiplesHint(a, b, lcm) {
    const multiplesA = [];
    const multiplesB = [];
    
    // Find multiples up to the LCM or 5 steps past the LCM for clarity
    const limit = lcm + 2 * Math.max(a, b); 
    
    for (let i = 1; i * a <= limit; i++) {
        multiplesA.push(i * a);
    }
    for (let i = 1; i * b <= limit; i++) {
        multiplesB.push(i * b);
    }

    // Truncate the lists to the LCM
    const aList = multiplesA.filter(n => n <= lcm).join(', ');
    const bList = multiplesB.filter(n => n <= lcm).join(', ');
    
    return { aList, bList };
}

// --- NEW FUNCTION: Generates Plausible Incorrect Answers (No Change) ---
function generateIncorrectOptions(lcm, a, b) {
    const options = new Set();
    
    options.add(a * b);
    options.add(Math.max(a, b));
    options.add(lcm + Math.min(a, b));
    
    let randomNum;
    do {
        randomNum = Math.floor(Math.random() * (Math.min(lcm * 2, 100))) + 1;
    } while (options.has(randomNum) || randomNum === lcm || randomNum === 0);
    options.add(randomNum);

    options.delete(lcm);
    
    return Array.from(options).filter(num => num > 0).slice(0, 3);
}

// --- NEW FUNCTION: Renders the Buttons (No Change) ---
function renderOptions(lcm, a, b) {
    const container = document.getElementById('optionsContainer');
    container.innerHTML = '';
    
    let incorrectOptions = generateIncorrectOptions(lcm, a, b);
    let allOptions = [...incorrectOptions, lcm];

    for (let i = allOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }

    allOptions.forEach(option => {
        const button = document.createElement('button');
        button.innerText = option;
        button.classList.add('option-btn');
        button.onclick = (event) => checkAnswer(option, event.target); 
        container.appendChild(button);
    });
}


// --- GAME LOGIC FUNCTIONS (MODIFIED) ---

function nextQuestion() {
    questionCounter++; 

    const num1Element = document.getElementById('num1');
    const num2Element = document.getElementById('num2');
    const resultElement = document.getElementById('lcmResult');

    // Generate random numbers
    currentNum1 = Math.floor(Math.random() * numberMax) + 2; 
    currentNum2 = Math.floor(Math.random() * numberMax) + 2;
    while (currentNum1 === currentNum2) { currentNum2 = Math.floor(Math.random() * numberMax) + 2; }

    correctAnswer = calculateLCM(currentNum1, currentNum2);

    // Update the display
    num1Element.innerText = currentNum1;
    num2Element.innerText = currentNum2;
    
    resultElement.classList.remove('result-success', 'result-error');
    resultElement.innerText = `What is the LCM of ${currentNum1} and ${currentNum2}? Solve it for a star!`;
    
    renderOptions(correctAnswer, currentNum1, currentNum2);

    // Update buttons
    document.getElementById('hintBtn').style.display = 'inline-block'; 
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('hintBtn').disabled = false;
    document.getElementById('hintBtn').innerText = "Ask for a Hint";

    // Trigger voice explanation for first question only
    if (questionCounter === 1) {
        speak("Welcome to the quiz! Solve this first question."); 
    }
}


function askHint(isVoice = false) {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    const resultElement = document.getElementById('lcmResult');
    
    const { aList, bList } = generateMultiplesHint(currentNum1, currentNum2, correctAnswer);

    // The core teaching message (your friend's suggestion)
    let hintMessage = `💡 **LCM Step-by-Step:** To find the LCM of ${currentNum1} and ${currentNum2}, let's list the multiples:`;
    hintMessage += `<br>Multiples of ${currentNum1}: ${aList}, ...`;
    hintMessage += `<br>Multiples of ${currentNum2}: ${bList}, ...`;
    hintMessage += `<br>The **Lowest Common Multiple** is the first number that appears in both lists.`;

    // Apply the hint penalty only if the user clicked the Hint button (not the audio icon)
    if (!isVoice) {
        if (currentScore > 0) {
            currentScore = Math.floor(currentScore) - 1; 
            updateScore(0); 
            hintMessage += `<br><span style="color:red; font-size: 0.9em;">(1 star deducted for using a hint.)</span>`;
        }
        document.getElementById('hintBtn').disabled = true;
        document.getElementById('hintBtn').innerText = "Hint Used!";
    }

    resultElement.classList.remove('result-success', 'result-error');
    resultElement.innerHTML = hintMessage;
    
    // Voice read-out is simplified
    const speechText = `The hint is: List the multiples of ${currentNum1} and ${currentNum2}. The first common number is your answer.`;
    speak(speechText);
}


function checkAnswer(userAnswer, buttonClicked) {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    
    const resultElement = document.getElementById('lcmResult');
    
    const allButtons = document.querySelectorAll('.option-btn');
    allButtons.forEach(btn => btn.disabled = true);

    if (userAnswer === correctAnswer) {
        const compliments = ["Awesome! 🎉", "Perfect! 🌟", "Good Job! 👍", "You Got It! 🥳"];
        const compliment = compliments[Math.floor(Math.random() * compliments.length)];
        
        updateScore(1);
        resultElement.classList.add('result-success');
        resultElement.innerHTML = `${compliment} The LCM of ${currentNum1} and ${currentNum2} is **${correctAnswer}**!`;
        speak(`${compliment} The LCM of ${currentNum1} and ${currentNum2} is ${correctAnswer}!`);
        
        buttonClicked.classList.add('option-correct');

    } else {
        resultElement.classList.add('result-error');
        resultElement.innerHTML = `Oops! Not quite. The correct LCM of ${currentNum1} and ${currentNum2} is **${correctAnswer}**. Try the next one!`;
        speak(`Oops! Not quite. The correct LCM of ${currentNum1} and ${currentNum2} is ${correctAnswer}.`);
        
        buttonClicked.classList.add('option-incorrect');
        
        allButtons.forEach(btn => {
            if (parseInt(btn.innerText) === correctAnswer) {
                btn.classList.add('option-correct');
            }
        });
    }

    document.getElementById('nextBtn').style.display = 'inline-block';
    document.getElementById('hintBtn').style.display = 'none'; 
}
