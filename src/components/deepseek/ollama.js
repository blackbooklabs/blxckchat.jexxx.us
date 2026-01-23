// Theme toggling
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Chat history management
const chatHistoryElement = document.getElementById('chat-history');
const newChatButton = document.getElementById('new-chat');

function addChatToHistory(question) {
    const chatItem = document.createElement('div');
    chatItem.classList.add('chat-history-item');
    chatItem.textContent = question.substring(0, 30) + '...';
    chatHistoryElement.prepend(chatItem);
}

// Configure Showdown and Prism
const converter = new showdown.Converter({
    tables: true,
    tasklists: true,
    strikethrough: true,
    ghCodeBlocks: true,
    highlight: true
});

// Chat history persistence using localStorage
let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
const MAX_HISTORY = 50;

function saveChatToHistory(question, answer) {
    const chat = {
        id: Date.now(),
        question,
        answer,
        timestamp: new Date().toISOString()
    };
    
    chatHistory.unshift(chat);
    if (chatHistory.length > MAX_HISTORY) {
        chatHistory.pop();
    }
    
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    updateChatHistoryUI();
}

function updateChatHistoryUI() {
    const historyContainer = document.getElementById('chat-history');
    historyContainer.innerHTML = '';
    
    chatHistory.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.classList.add('chat-history-item');
        chatItem.innerHTML = `
            <div class="chat-preview">${chat.question.substring(0, 30)}...</div>
            <div class="chat-timestamp">${new Date(chat.timestamp).toLocaleTimeString()}</div>
        `;
        chatItem.addEventListener('click', () => loadChat(chat));
        historyContainer.appendChild(chatItem);
    });
}

function loadChat(chat) {
    document.querySelector("#question").value = chat.question;
    document.querySelector("#answer").innerHTML = chat.answer;
}

// Mobile navigation
const mobileMenuButton = document.createElement('button');
mobileMenuButton.classList.add('mobile-menu');
mobileMenuButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
`;
document.querySelector('.main-content').prepend(mobileMenuButton);

mobileMenuButton.addEventListener('click', () => {
    document.querySelector('.chat-sidebar').classList.toggle('active');
});

// Enhanced run function with markdown and code highlighting
async function run() {
    let prompt = document.querySelector("#question").value;
    document.querySelector("#think").innerHTML = "Thinking...";
    
    const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "deepseek-r1:7b",
            prompt: prompt,
            stream: true
        })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let entireResponse = "";
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        
        let chunkJson = JSON.parse(chunk);
        entireResponse += chunkJson.response;
        
        // Process markdown and code blocks
        let processedResponse = entireResponse
            .replace("<think>", `<div id="think">`)
            .replace("</think>", `</div>`);
            
        let htmlResponse = converter.makeHtml(processedResponse);
        
        // Update the DOM
        document.querySelector("#answer").innerHTML = htmlResponse;
        
        // Apply syntax highlighting to code blocks
        document.querySelectorAll('pre code').forEach((block) => {
            Prism.highlightElement(block);
        });
    }

    // Save to history after completion
    saveChatToHistory(prompt, document.querySelector("#answer").innerHTML);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateChatHistoryUI();
    document.querySelector("#ask-button").addEventListener('click', run);
});