// Global variables
let currentScore = 0;
let currentLevel = 1;
let numberMax = 10;
let correctAnswer = 0;
let questionCounter = 0; 

// --- VOICE NARRATION FUNCTIONS ---

// Helper function to handle speech synthesis
function speak(text) {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    // Use a friendly voice/speed
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
}

// Function to read the question and the full explanation
function readQuestionAndHint() {
    const num1 = parseInt(document.getElementById('num1').innerText);
    const num2 = parseInt(document.getElementById('num2').innerText);
    const max = Math.max(num1, num2);

    let speechText = `The current challenge is to find the Least Common Multiple of ${num1} and ${num2}. `;

    // Full explanation only for the first two questions
    if (questionCounter <= 2) {
        speechText += `Remember, the LCM is the smallest number that both ${num1} and ${num2} can divide. A hint: it must be ${max} or larger. Try multiplying ${max} by 1, then 2, then 3, and so on, until the number is also divisible by the other number. Good luck!`;
    } else {
        speechText += `You can ask for a hint if you need help!`;
    }
    
    speak(speechText);
}

// --- SCREEN TRANSITION FUNCTIONS ---

function showIntro() {
    document.getElementById('greetingScreen').style.display = 'none';
    document.getElementById('introScreen').style.display = 'flex'; 
}

function startGame() {
    document.getElementById('introScreen').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    nextQuestion(); 
}

// --- GAME LOGIC FUNCTIONS ---

// Calculates the LCM (Helper function)
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
    scoreElement.innerText = Math.floor(currentScore); // Display whole numbers
    
    scoreElement.style.transform = 'scale(1.3)';
    setTimeout(() => { scoreElement.style.transform = 'scale(1.0)'; }, 200);

    // Level up logic
    if (currentScore >= currentLevel * 5) {
        currentLevel++;
        document.getElementById('level').innerText = currentLevel;
        numberMax += 5;
        alert(`Level Up! 🎉 You're now on Level ${currentLevel}! The numbers are getting bigger!`);
    }
}


function nextQuestion() {
    questionCounter++; 

    const num1Element = document.getElementById('num1');
    const num2Element = document.getElementById('num2');
    const answerInput = document.getElementById('answerInput');
    const resultElement = document.getElementById('lcmResult');

    // Generate random numbers
    let a = Math.floor(Math.random() * numberMax) + 2; 
    let b = Math.floor(Math.random() * numberMax) + 2;
    while (a === b) { b = Math.floor(Math.random() * numberMax) + 2; }

    correctAnswer = calculateLCM(a, b);

    // Update the display
    num1Element.innerText = a;
    num2Element.innerText = b;
    answerInput.value = ''; 
    answerInput.disabled = false;
    
    resultElement.classList.remove('result-success', 'result-error');
    resultElement.innerText = `What is the LCM of ${a} and ${b}? Solve it for a star!`;

    // Update buttons
    document.getElementById('checkBtn').style.display = 'inline-block';
    document.getElementById('hintBtn').style.display = 'inline-block'; 
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('hintBtn').disabled = false;
    document.getElementById('hintBtn').innerText = "Ask for a Hint";

    // Trigger voice explanation for first two questions
    if (questionCounter <= 2) {
        readQuestionAndHint(); 
    }
}


function askHint() {
    const num1 = parseInt(document.getElementById('num1').innerText);
    const num2 = parseInt(document.getElementById('num2').innerText);
    const resultElement = document.getElementById('lcmResult');
    const max = Math.max(num1, num2);

    resultElement.classList.remove('result-success', 'result-error');
    
    // Deduct a small penalty for the hint
    if (currentScore > 0) {
        updateScore(-0.5); 
    }

    const hintMessage = `💡 HINT: The LCM must be ${max} or larger. Start checking multiples from ${max} and skip-count by ${max}!`;
    resultElement.innerText = hintMessage;
    
    speak(`The hint is: ${hintMessage}`); 
    
    document.getElementById('hintBtn').disabled = true;
    document.getElementById('hintBtn').innerText = "Hint Used!";
}


function checkAnswer() {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    
    const userAnswer = parseInt(document.getElementById('answerInput').value);
    const resultElement = document.getElementById('lcmResult');
    const num1 = parseInt(document.getElementById('num1').innerText);
    const num2 = parseInt(document.getElementById('num2').innerText);
    
    resultElement.classList.remove('result-success', 'result-error');

    if (isNaN(userAnswer) || userAnswer <= 0) {
        resultElement.classList.add('result-error');
        resultElement.innerText = "Please enter a valid positive number for your answer!";
        speak("Please enter a valid positive number for your answer!");
        return;
    }

    if (userAnswer === correctAnswer) {
        const compliments = ["Awesome! 🎉", "Perfect! 🌟", "Good Job! 👍", "You Got It! 🥳"];
        const compliment = compliments[Math.floor(Math.random() * compliments.length)];
        
        updateScore(1);
        resultElement.classList.add('result-success');
        resultElement.innerText = `${compliment} The LCM of ${num1} and ${num2} is ${correctAnswer}!`;
        speak(`${compliment} The LCM of ${num1} and ${num2} is ${correctAnswer}!`);

    } else {
        resultElement.classList.add('result-error');
        resultElement.innerText = `Oops! Not quite. The correct LCM of ${num1} and ${num2} is ${correctAnswer}. Try the next one!`;
        speak(`Oops! Not quite. The correct LCM of ${num1} and ${num2} is ${correctAnswer}.`);
    }

    // Post-check actions
    document.getElementById('checkBtn').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'inline-block';
    document.getElementById('hintBtn').style.display = 'none'; 
    document.getElementById('answerInput').disabled = true;
}