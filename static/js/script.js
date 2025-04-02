// Initialize voice recognition when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Voice recognition elements
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceStatus = document.getElementById('voiceStatus');
    const lastPeriodInput = document.getElementById('lastPeriod');
    
    // Only setup if elements exist
    if (voiceBtn && lastPeriodInput) {
        setupVoiceRecognition();
    }
    
    // Add event listener to calculate button
    const calculateBtn = document.getElementById('calculateBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateNextPeriod);
    }
});

function calculateNextPeriod() {
    let lastPeriodDate = document.getElementById("lastPeriod").value;
    
    if (!lastPeriodDate) {
        showAlert("Please enter your last period date.", "error");
        return;
    }

    try {
        let lastPeriod = new Date(lastPeriodDate);
        let nextPeriod = new Date(lastPeriod);
        nextPeriod.setDate(lastPeriod.getDate() + 28); // 28-day cycle
        
        // Calculate ovulation date (approx 14 days before next period)
        let ovulationDate = new Date(nextPeriod);
        ovulationDate.setDate(ovulationDate.getDate() - 14);
        
        let options = { year: "numeric", month: "long", day: "numeric" };
        let resultText = `
            <strong>Next Period:</strong> ${nextPeriod.toLocaleDateString("en-US", options)}<br>
            <strong>Fertile Window:</strong> ${calculateFertileWindow(nextPeriod)}<br>
            <strong>Ovulation Date:</strong> ${ovulationDate.toLocaleDateString("en-US", options)}
        `;
        
        document.getElementById("result").innerHTML = resultText;
        speakResult(`Your next period is expected around ${nextPeriod.toLocaleDateString("en-US", options)}`);
        
    } catch (error) {
        showAlert("Invalid date format. Please try again.", "error");
        console.error("Date calculation error:", error);
    }
}

// Voice Recognition Setup
function setupVoiceRecognition() {
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceStatus = document.getElementById('voiceStatus');
    const lastPeriodInput = document.getElementById('lastPeriod');
    
    // Check browser support
    if (!('webkitSpeechRecognition' in window)) {
        voiceBtn.style.display = 'none';
        voiceStatus.innerHTML = '<div class="alert alert-warning">Voice input not supported in your browser</div>';
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    voiceBtn.addEventListener('click', function() {
        if (voiceBtn.classList.contains('recording')) {
            recognition.stop();
            return;
        }

        recognition.start();
        voiceBtn.classList.add('recording');
        voiceStatus.innerHTML = '<div class="alert alert-info">Listening... Speak now</div>';
        lastPeriodInput.placeholder = "Listening...";
    });

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        const processedDate = processVoiceDate(transcript);
        
        if (processedDate) {
            lastPeriodInput.value = processedDate;
            voiceStatus.innerHTML = '<div class="alert alert-success">Date recognized</div>';
            
            // Auto-calculate if date is valid
            setTimeout(calculateNextPeriod, 500);
        } else {
            voiceStatus.innerHTML = '<div class="alert alert-danger">Could not recognize date. Please try again.</div>';
        }
    };

    recognition.onerror = function(event) {
        voiceBtn.classList.remove('recording');
        voiceStatus.innerHTML = `<div class="alert alert-danger">Error: ${event.error}</div>`;
        lastPeriodInput.placeholder = "Enter last period date";
    };

    recognition.onend = function() {
        voiceBtn.classList.remove('recording');
        lastPeriodInput.placeholder = "Enter last period date";
    };
}

// Helper Functions
function processVoiceDate(voiceText) {
    const today = new Date();
    voiceText = voiceText.toLowerCase();
    
    // Handle common date phrases
    if (voiceText.includes('today')) {
        return formatDate(today);
    } else if (voiceText.includes('yesterday')) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return formatDate(yesterday);
    } else if (voiceText.includes('week ago') || voiceText.includes('last week')) {
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        return formatDate(lastWeek);
    } else if (voiceText.match(/\d+\s?days? ago/)) {
        const days = parseInt(voiceText.match(/\d+/)[0]);
        const pastDate = new Date(today);
        pastDate.setDate(pastDate.getDate() - days);
        return formatDate(pastDate);
    } else if (voiceText.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?/i)) {
        // Handle month name dates
        return parseNaturalLanguageDate(voiceText);
    }
    
    return null;
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function calculateFertileWindow(nextPeriodDate) {
    const start = new Date(nextPeriodDate);
    start.setDate(start.getDate() - 19); // 5 days before ovulation
    
    const end = new Date(nextPeriodDate);
    end.setDate(end.getDate() - 15); // 1 day after ovulation
    
    const options = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} to ${end.toLocaleDateString('en-US', options)}`;
}

function speakResult(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance();
        utterance.text = text.replace(/<[^>]*>/g, ''); // Remove HTML tags
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
    }
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}
