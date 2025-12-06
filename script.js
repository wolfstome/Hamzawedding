document.addEventListener('DOMContentLoaded', function() {

    // ======================================================================
    // 1. AUDIO & WELCOME SCREEN (NO CHANGE)
    // ======================================================================
    const welcomeScreen = document.getElementById('welcome-screen');
    const enterBtn = document.getElementById('enter-btn');
    const bgAudio = document.getElementById('bg-audio'); 

    // Lock scroll initially
    document.body.style.overflow = 'hidden';

    if (enterBtn && welcomeScreen && bgAudio) {
        enterBtn.addEventListener('click', () => {
            // Hide Welcome Screen
            welcomeScreen.classList.add('hide-welcome');
            
            // Play Audio
            bgAudio.volume = 0.6; 
            bgAudio.play().catch(error => console.log("Audio playback failed:", error));
            
            // Unlock Scroll
            document.body.style.overflow = 'auto';
        });
    }

    // ======================================================================
    // 2. SCROLL ANIMATIONS (NO CHANGE)
    // ======================================================================
    const observerOptions = { threshold: 0.1 };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.slide-up').forEach(el => observer.observe(el));

    // ======================================================================
    // 3. COUNTDOWN TIMER (NO CHANGE)
    // ======================================================================
    const targetDate = new Date("Dec 20, 2025 12:00:00").getTime();
    const countdownGrid = document.getElementById('countdown');

    const SECOND = 1000;
    const MINUTE = SECOND * 60;
    const HOUR = MINUTE * 60;
    const DAY = HOUR * 24;
    let timerInterval;

    function updateTimer() {
        const now = new Date().getTime();
        const diff = targetDate - now;

        if (diff < 0) {
            if (countdownGrid) {
                countdownGrid.innerHTML = '<div class="cd-box" style="width:100%; border-color:white;"><span class="cd-num">Mubarak!</span><span class="cd-label">Celebration Started</span></div>';
            }
            clearInterval(timerInterval); 
            return;
        }

        const days = Math.floor(diff / DAY);
        const hours = Math.floor((diff % DAY) / HOUR);
        const mins = Math.floor((diff % HOUR) / MINUTE);
        const secs = Math.floor((diff % MINUTE) / SECOND);

        if (countdownGrid) {
            countdownGrid.innerHTML = `
                <div class="cd-box"><span class="cd-num">${days}</span><span class="cd-label">Days</span></div>
                <div class="cd-box"><span class="cd-num">${hours}</span><span class="cd-label">Hrs</span></div>
                <div class="cd-box"><span class="cd-num">${mins}</span><span class="cd-label">Min</span></div>
                <div class="cd-box"><span class="cd-num">${secs}</span><span class="cd-label">Sec</span></div>
            `;
        }
    }

    if (countdownGrid) {
        timerInterval = setInterval(updateTimer, SECOND); 
        updateTimer();
    }
    
    // ======================================================================
    // 4. WISHES SYSTEM (FINAL VERSION)
    // ======================================================================
    
    const wishForm = document.getElementById('wish-form');
    const wishesFeed = document.getElementById('wishes-feed');

    // Local Storage Functions
    let savedWishes = JSON.parse(localStorage.getItem('sathiWishes')) || [];
    
    savedWishes = savedWishes.map(wish => ({
        ...wish,
        replies: wish.replies || [] 
    }));

    function saveWishes() {
        localStorage.setItem('sathiWishes', JSON.stringify(savedWishes));
    }

    // Function to render all wishes and replies to the HTML
    function renderWishes() {
        if (!wishesFeed) return;
        wishesFeed.innerHTML = ''; // Clear current view

        if (savedWishes.length === 0) {
            wishesFeed.innerHTML = '<p class="no-wishes" style="text-align:center; color:#777; padding-top: 10px;">Be the first to send a wish!</p>';
        }

        savedWishes.forEach((wish, index) => {
            const hasReplies = wish.replies && wish.replies.length > 0;
            const wishCard = document.createElement('div');
            wishCard.className = 'wish-card slide-up visible'; 
            wishCard.setAttribute('data-index', index);

            // 1. Main Wish Content and Actions (ONLY Delete/Reply)
            let htmlContent = `
                <div class="wish-main">
                    <p class="wish-text">"${wish.msg}"</p>
                    <p class="wish-author">- ${wish.name}</p>
                    <div class="wish-actions">
                        <button class="delete-btn" data-index="${index}">🗑️ Delete</button>
                        <button class="reply-btn" data-index="${index}">💬 Reply</button>
                    </div>
                </div>
            `;
            
            // 2. Replies Section Container
            htmlContent += `
                <div class="replies-section" id="replies-${index}">
            `;
            
            // Render Replies Heading and Items (only if replies exist)
            if (hasReplies) {
                htmlContent += `<h4>Replies:</h4>`;
                
                // Render Replies
                wish.replies.forEach(reply => {
                    const safeName = reply.name.replace(/</g, "<").replace(/>/g, ">");
                    const safeMsg = reply.message.replace(/</g, "<").replace(/>/g, ">");
                    htmlContent += `<p class="reply-item"><strong>${safeName}:</strong> ${safeMsg}</p>`;
                });
            }
            
            // Append the Reply Form structure (which is hidden by default via CSS)
            htmlContent += `
                    <form class="reply-form" data-index="${index}">
                        <input type="text" placeholder="Your Name" required>
                        <input type="text" placeholder="Your Reply" required>
                        <button type="submit">Post Reply</button>
                    </form>
                </div>
            `;
            
            wishCard.innerHTML = htmlContent;
            wishesFeed.prepend(wishCard);
            
            // Hide the entire replies section if there are no replies.
            const repliesSection = wishCard.querySelector(`#replies-${index}`);
            if (!hasReplies) {
                repliesSection.style.display = 'none'; 
            }
        });

        // Re-attach all necessary event listeners after rendering
        addWishesEventListeners();
    }

    function addWishesEventListeners() {
        // Delete Listener
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.onclick = (e) => deleteWish(parseInt(e.target.dataset.index));
        });

        // REPLY TOGGLE Listener
        document.querySelectorAll('.reply-btn').forEach(button => {
            button.onclick = (e) => {
                const index = parseInt(e.target.dataset.index);
                const repliesSection = document.getElementById(`replies-${index}`);
                
                const form = repliesSection ? repliesSection.querySelector('.reply-form') : null;
                
                if (form && repliesSection) {
                    const formIsVisible = form.style.display === 'flex';

                    if (formIsVisible) {
                        // Action: CLOSE THE REPLY FORM
                        form.style.display = 'none';
                        button.textContent = '💬 Reply'; 
                        
                        const hasReplies = savedWishes[index].replies && savedWishes[index].replies.length > 0;
                        if (!hasReplies) {
                            repliesSection.style.display = 'none'; // Hide the container if no replies exist
                        }
                    } else {
                        // Action: OPEN THE REPLY FORM
                        repliesSection.style.display = 'block'; // Show the container
                        form.style.display = 'flex';           // Show the form fields
                        button.textContent = '❌ Cancel Reply';
                    }
                }
            };
        });

        // Reply Form Submission Listeners 
        document.querySelectorAll('.reply-form').forEach(form => {
            form.onsubmit = function(e) {
                e.preventDefault();
                const index = parseInt(e.target.dataset.index);
                const replyName = e.target.querySelector('input:nth-child(1)').value.trim();
                const replyMsg = e.target.querySelector('input:nth-child(2)').value.trim();
                
                if (replyName && replyMsg) {
                    addReply(index, replyName, replyMsg);
                    e.target.reset();
                }
            };
        });
    }

    // Function to delete a wish
    function deleteWish(index) {
        if (confirm("Are you sure you want to delete your wish? This is irreversible.")) {
            savedWishes.splice(index, 1);
            saveWishes();
            renderWishes(); 
        }
    }

    // Function to add a reply to a wish
    function addReply(index, name, message) {
        if (!savedWishes[index].replies) {
            savedWishes[index].replies = [];
        }
        savedWishes[index].replies.push({ name, message, timestamp: new Date().toISOString() });
        
        saveWishes();
        renderWishes(); 
    }

    // --- MAIN WISH SUBMISSION LISTENER ---

    if (!wishForm) {
        console.error("Form element with ID 'wish-form' not found.");
        return;
    }

    wishForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const nameInput = document.getElementById('user-name');
        const messageInput = document.getElementById('user-msg');
        
        if (!nameInput || !messageInput) return;

        const name = nameInput.value.trim();
        const message = messageInput.value.trim();

        if (!name || !message) return;

        // 1. SAVE THE NEW WISH (Local Storage)
        
        const newWish = { name, msg: message, replies: [] };
        savedWishes.unshift(newWish);
        saveWishes(); 
        
        // 2. Clear form and refresh display
        wishForm.reset();
        renderWishes(); 
    });

    // Initial Render
    renderWishes();
});
