// --- 1. AUDIO & WELCOME SCREEN ---
const welcomeScreen = document.getElementById('welcome-screen');
const enterBtn = document.getElementById('enter-btn');
const bgAudio = document.getElementById('bg-audio');

// Lock scroll initially to ensure the welcome screen is interactive first
document.body.style.overflow = 'hidden';

enterBtn.addEventListener('click', () => {
    // Hide Welcome Screen
    welcomeScreen.classList.add('hide-welcome');
    
    // Play Audio (User interaction allows this)
    bgAudio.volume = 0.6; 
    bgAudio.play().catch(error => console.log("Audio playback failed:", error));
    
    // Unlock Scroll
    document.body.style.overflow = 'auto';
});

// ----------------------------------------------------------------------

// --- 2. SCROLL ANIMATIONS ---
const observerOptions = { threshold: 0.1 };

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Optional: stop observing once visible to save resources
            // observer.unobserve(entry.target); 
        }
    });
}, observerOptions);

document.querySelectorAll('.slide-up').forEach(el => observer.observe(el));

// ----------------------------------------------------------------------

// --- 3. COUNTDOWN TIMER (Dec 4, 2025 11:00:00) ---
const targetDate = new Date("Dec 20, 2025 12:00:00").getTime();
const countdownGrid = document.getElementById('countdown');

// Define time constants for clarity
const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

function updateTimer() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff < 0) {
        countdownGrid.innerHTML = '<div class="cd-box" style="width:100%; border-color:white;"><span class="cd-num">Mubarak!</span><span class="cd-label">Celebration Started</span></div>';
        // Stop the interval once the event starts
        clearInterval(timerInterval); 
        return;
    }

    const days = Math.floor(diff / DAY);
    const hours = Math.floor((diff % DAY) / HOUR);
    const mins = Math.floor((diff % HOUR) / MINUTE);
    const secs = Math.floor((diff % MINUTE) / SECOND);

    countdownGrid.innerHTML = `
        <div class="cd-box"><span class="cd-num">${days}</span><span class="cd-label">Days</span></div>
        <div class="cd-box"><span class="cd-num">${hours}</span><span class="cd-label">Hrs</span></div>
        <div class="cd-box"><span class="cd-num">${mins}</span><span class="cd-label">Min</span></div>
        <div class="cd-box"><span class="cd-num">${secs}</span><span class="cd-label">Sec</span></div>
    `;
}

// Store interval ID to stop it later
const timerInterval = setInterval(updateTimer, SECOND); 
updateTimer();

// ----------------------------------------------------------------------

// --- 4. WISHES SYSTEM ---
const wishForm = document.getElementById('wish-form');
const wishesFeed = document.getElementById('wishes-feed');

// !!! IMPORTANT STEP TO REMOVE UNWANTED MESSAGES !!!
// 1. Uncomment the line below.
// 2. Save the file and refresh your website ONCE in your browser.
// 3. Delete or comment out the line again. This clears ALL saved wishes.
// localStorage.removeItem('sathiWishes'); 

function addWishToDom(name, msg) {
    const div = document.createElement('div');
    div.className = 'wish-card slide-up visible';
    div.innerHTML = `<p class="wish-text">"${msg}"</p><p class="wish-author">- ${name}</p>`;
    // Add the new wish to the top
    wishesFeed.prepend(div); 
}

// Load saved wishes
let savedWishes = JSON.parse(localStorage.getItem('sathiWishes')) || [];

// Function to render the list
function renderWishes() {
    wishesFeed.innerHTML = ''; // Clear current view
    savedWishes.forEach(wish => addWishToDom(wish.name, wish.msg));
}

// Initial Render
renderWishes();

wishForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('user-name').value.trim();
    const msg = document.getElementById('user-msg').value.trim();

    if(name && msg) {
        // Add new wish to DOM
        addWishToDom(name, msg);
        
        // Add to storage array
        savedWishes.unshift({ name, msg });
        
        // Save to Browser Memory
        localStorage.setItem('sathiWishes', JSON.stringify(savedWishes));
        
        // Clear inputs
        wishForm.reset();
    }
});
// Start music when user taps anywhere
document.addEventListener('click', function startMusic() {
    const audio = document.getElementById("bgAudio");
    audio.play();        // Play audio
    document.removeEventListener('click', startMusic); // Remove listener after first tap
});
// What app number submit 
document.getElementById('wish-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevents the page from refreshing on submit

    // 1. Get the values from the form inputs
    const name = document.getElementById('user-name').value;
    const message = document.getElementById('user-msg').value;

    // 2. Prepare the data to send to your server
    const payload = {
        senderName: name,
        fullMessage: message,
        // FIX: The number MUST be a string (enclosed in quotes)
        targetNumber: "+923022277443" 
    };

    // 3. Send the data to your server-side script
    fetch('/api/send-whatsapp-message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
    .then(response => {
        // Check if the server responded with an error status (4xx or 5xx)
        if (!response.ok) {
            // Throw an error to be caught by the .catch() block
            throw new Error(`Server responded with status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        alert("Message sent successfully!");
        document.getElementById('wish-form').reset(); // Clear the form
    })
    .catch((error) => {
        // This block catches network errors, syntax errors, and server errors (due to the check above)
        console.error('Error sending data:', error);
        alert("Failed to send message. Please check the console for details.");
    });
});