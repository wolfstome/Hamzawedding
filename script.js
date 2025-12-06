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
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('wish-form');
    
    // Check if the form element exists before adding the listener
    if (!form) {
        console.error("Form element with ID 'wish-form' not found. Please check your HTML.");
        return;
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Stop the form from submitting normally (prevent page refresh)

        // 1. Get the values from the form inputs
        const nameInput = document.getElementById('user-name');
        const messageInput = document.getElementById('user-msg');
        
        // Basic input validation
        if (!nameInput || !messageInput) {
            console.error("Missing input elements (user-name or user-msg).");
            return;
        }

        const name = nameInput.value;
        const message = messageInput.value;

        // 2. WhatsApp configuration
        // IMPORTANT: Use the number *without* the leading '+' or zeros (e.g., 923022277443)
        const targetNumber = '923022277443'; 
        const waBaseURL = 'https://wa.me/';

        // 3. Prepare the full text message
        const fullText = `Name: ${name}\nMessage: ${message}`;

        // 4. Encode the message text for use in a URL
        const encodedMessage = encodeURIComponent(fullText);

        // 5. Construct the full WhatsApp chat link
        const waLink = `${waBaseURL}${targetNumber}?text=${encodedMessage}`;


        // --- Beautiful Modal Logic ---
        
        const modal = document.getElementById('custom-alert-modal');
        const closeBtn = document.querySelector('.close-button'); // Assumes .close-button exists inside the modal
        const confirmBtn = document.getElementById('modal-confirm-button');
        
        // Check if the custom modal elements are present
        if (!modal || !closeBtn || !confirmBtn) {
            console.warn("Custom modal structure not found. Redirecting immediately.");
            window.location.href = waLink;
            document.getElementById('wish-form').reset();
            return;
        }

        // Function to hide the modal and redirect to WhatsApp
        const hideModalAndRedirect = () => {
            modal.style.display = 'none';
            
            // 6. Redirect the user
            window.location.href = waLink;
            
            // Clear the form
            document.getElementById('wish-form').reset();
        };

        // Display the custom modal
        modal.style.display = 'block';

        // Set up event handlers for the custom modal buttons
        confirmBtn.onclick = hideModalAndRedirect;
        closeBtn.onclick = hideModalAndRedirect;

        // Close and redirect if user clicks on the gray background (outside modal content)
        window.onclick = function(event) {
            if (event.target === modal) {
                hideModalAndRedirect();
            }
        }
    });
});
