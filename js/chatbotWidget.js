// GlobalShares AI Chatbot Widget
class GlobalSharesChatbot {
    constructor(options = {}) {
        this.options = {
            position: options.position || 'bottom-right',
            apiKey: options.apiKey || localStorage.getItem('groqAPIKey') || '',
            theme: options.theme || 'dark',
            ...options
        };
        
        this.isOpen = false;
        this.useAI = this.options.apiKey.length > 0;
        this.messageHistory = [];
        
        this.knowledgeBase = {
            "add shares": {
                response: "To add shares to your cap table in GlobalShares:",
                steps: [
                    "Navigate to the 'Cap Table' section in your dashboard",
                    "Click on 'Securities' → 'Add Securities'",
                    "Select the share class (Common, Preferred, Series A/B/C)",
                    "Enter the number of shares and price per share",
                    "Add shareholder information (name, email, address)",
                    "Set the issue date and any vesting schedules",
                    "Review and confirm the transaction",
                    "The cap table will automatically update"
                ],
                tips: "💡 Pro tip: You can bulk import shares using our Excel template. Download it from the 'Import/Export' section.",
                related: ["share classes", "equity dilution", "shareholder management", "vesting schedules"]
            },
            "exercise options": {
                response: "To exercise vested options through GlobalShares:",
                steps: [
                    "Log into your participant portal",
                    "Navigate to 'Equity Grants' tab",
                    "Find the grant with vested options",
                    "Click the three dots (...) → 'Exercise'",
                    "Enter number of options to exercise",
                    "Review exercise cost (shares × strike price)",
                    "Choose exercise method (cash, cashless, net exercise)",
                    "Submit exercise request",
                    "Admin will receive notification for approval",
                    "Once approved, shares appear in your portfolio"
                ],
                tips: "💡 An alert appears on your dashboard when options are available to exercise.",
                related: ["vesting schedules", "strike price", "cashless exercise", "tax implications"]
            },
            "equity plans": {
                response: "Creating equity plans in GlobalShares:",
                steps: [
                    "Go to 'Equity Plans' in the main navigation",
                    "Click 'Create New Plan'",
                    "Choose plan type (ISO, NSO, RSU, ESPP)",
                    "Set plan name and effective date",
                    "Define pool size (number of shares reserved)",
                    "Configure vesting schedule (e.g., 4-year with 1-year cliff)",
                    "Set eligibility criteria and exercise windows",
                    "Add plan documents (if applicable)",
                    "Submit for board approval"
                ],
                tips: "💡 GlobalShares supports multiple plan types including Stock Options, RSUs, and country-specific tax-advantaged plans."
            },
            "round modeling": {
                response: "Round modeling helps you simulate future funding scenarios:",
                steps: [
                    "Access 'Modeling' from the main menu",
                    "Click 'New Round Scenario'",
                    "Set pre-money valuation",
                    "Add investment amount and investor details",
                    "Configure terms (liquidation preference, participation rights)",
                    "Include ESOP pool expansion if needed",
                    "Add any convertible notes or SAFEs",
                    "Run the simulation",
                    "Review dilution impact and pro-forma cap table",
                    "Save or compare multiple scenarios"
                ],
                tips: "💡 You can model multiple scenarios simultaneously and compare them side-by-side."
            }
        };

        this.quickActions = [
            { icon: "💎", text: "Add Shares", query: "How do I add shares to my cap table?" },
            { icon: "📋", text: "Create Plans", query: "How to create equity plans?" },
            { icon: "🚀", text: "Round Modeling", query: "Explain round modeling" },
            { icon: "🎯", text: "Exercise Options", query: "How to exercise options?" },
            { icon: "⏱️", text: "Vesting", query: "What is vesting?" },
            { icon: "📊", text: "Export Data", query: "Export cap table to Excel" }
        ];

        this.init();
    }

    init() {
        this.createWidget();
        this.attachEventListeners();
    }

    createWidget() {
        const widget = document.createElement('div');
        widget.className = 'gs-chatbot-widget';
        widget.innerHTML = this.getWidgetHTML();
        document.body.appendChild(widget);
        this.addStyles();
    }

    getWidgetHTML() {
        return `
            <div class="gs-widget-toggle" id="gsChatToggle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <div class="gs-notification-dot" id="gsNotificationDot"></div>
            </div>
            
            <div class="gs-widget-container" id="gsWidgetContainer">
                <div class="gs-widget-header">
                    <div class="gs-header-content">
                        <div class="gs-logo">
                            <div class="gs-logo-icon">📊</div>
                            <div class="gs-logo-text">GlobalShares AI</div>
                        </div>
                        <div class="gs-status">
                            <div class="gs-status-dot"></div>
                            <span>${this.useAI ? 'AI Connected' : 'Knowledge Base'}</span>
                        </div>
                    </div>
                    <button class="gs-close-btn" id="gsCloseBtn">×</button>
                </div>
                
                <div class="gs-quick-actions" id="gsQuickActions">
                    ${this.quickActions.map(action => `
                        <button class="gs-quick-action" data-query="${action.query}">
                            ${action.icon} ${action.text}
                        </button>
                    `).join('')}
                </div>
                
                <div class="gs-chat-messages" id="gsChatMessages">
                    <div class="gs-message gs-bot-message">
                        <div class="gs-message-avatar gs-bot-avatar">🤖</div>
                        <div class="gs-message-content">
                            <div class="gs-message-bubble">
                                👋 Welcome to GlobalShares AI Assistant! I'm here to help you with:
                                <br><br>
                                • <strong>Cap Table Management</strong> - Add shares, manage ownership, track changes
                                <br>• <strong>Equity Plans</strong> - Create and manage employee stock options
                                <br>• <strong>Round Modeling</strong> - Simulate funding scenarios
                                <br>• <strong>Participant Portal</strong> - Access your equity information
                                <br>• <strong>Exercise Options</strong> - Learn how to exercise vested options
                                <br>• <strong>Reports & Exports</strong> - Generate cap table reports
                                <br><br>
                                Just ask me anything or click one of the quick actions above! 🚀
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="gs-input-area">
                    <div class="gs-input-container">
                        <div class="gs-input-wrapper">
                            <textarea 
                                class="gs-chat-input" 
                                id="gsChatInput" 
                                placeholder="Ask me anything about GlobalShares..."
                                rows="1"
                            ></textarea>
                        </div>
                        <button class="gs-send-button" id="gsSendButton">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    addStyles() {
        const styles = `
            .gs-chatbot-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .gs-widget-toggle {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                transition: all 0.3s ease;
                position: relative;
            }

            .gs-widget-toggle:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 25px rgba(0,0,0,0.2);
            }

            .gs-notification-dot {
                position: absolute;
                top: 8px;
                right: 8px;
                width: 12px;
                height: 12px;
                background: #ef4444;
                border-radius: 50%;
                border: 2px solid white;
                display: none;
                animation: pulse 2s infinite;
            }

            .gs-notification-dot.active {
                display: block;
            }

            @keyframes pulse {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.2); }
                100% { opacity: 1; transform: scale(1); }
            }

            .gs-widget-container {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 400px;
                height: 600px;
                background: rgba(15, 23, 42, 0.95);
                border-radius: 16px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.1);
                display: none;
                flex-direction: column;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            }

            .gs-widget-container.open {
                display: flex;
                animation: slideUp 0.3s ease;
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .gs-widget-header {
                padding: 16px 20px;
                background: rgba(30, 41, 59, 0.8);
                border-bottom: 1px solid rgba(255,255,255,0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .gs-header-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex: 1;
                margin-right: 12px;
            }

            .gs-logo {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .gs-logo-icon {
                width: 32px;
                height: 32px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
            }

            .gs-logo-text {
                font-size: 16px;
                font-weight: 600;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .gs-status {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 4px 12px;
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid rgba(16, 185, 129, 0.3);
                border-radius: 12px;
                font-size: 12px;
                color: #10b981;
            }

            .gs-status-dot {
                width: 6px;
                height: 6px;
                background: #10b981;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }

            .gs-close-btn {
                background: none;
                border: none;
                color: #94a3b8;
                cursor: pointer;
                font-size: 20px;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s ease;
            }

            .gs-close-btn:hover {
                background: rgba(255,255,255,0.1);
                color: white;
            }

            .gs-quick-actions {
                padding: 12px;
                display: flex;
                gap: 8px;
                overflow-x: auto;
                scrollbar-width: none;
                -ms-overflow-style: none;
            }

            .gs-quick-actions::-webkit-scrollbar {
                display: none;
            }

            .gs-quick-action {
                flex-shrink: 0;
                padding: 8px 12px;
                background: rgba(99, 102, 241, 0.1);
                border: 1px solid rgba(99, 102, 241, 0.3);
                border-radius: 16px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 12px;
                white-space: nowrap;
            }

            .gs-quick-action:hover {
                background: rgba(99, 102, 241, 0.2);
                transform: translateY(-1px);
            }

            .gs-chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                scroll-behavior: smooth;
            }

            .gs-message {
                display: flex;
                gap: 8px;
                margin-bottom: 16px;
                animation: fadeInUp 0.4s ease;
            }

            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .gs-message-avatar {
                width: 28px;
                height: 28px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                flex-shrink: 0;
            }

            .gs-user-avatar {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            .gs-bot-avatar {
                background: rgba(99, 102, 241, 0.2);
                border: 1px solid rgba(99, 102, 241, 0.3);
            }

            .gs-message-content {
                flex: 1;
            }

            .gs-message-bubble {
                background: rgba(51, 65, 85, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 12px;
                backdrop-filter: blur(10px);
                max-width: 85%;
                display: inline-block;
                word-wrap: break-word;
                font-size: 14px;
                line-height: 1.5;
                color: #f8fafc;
            }

            .gs-user-message .gs-message-bubble {
                background: rgba(99, 102, 241, 0.2);
                border-color: rgba(99, 102, 241, 0.3);
                margin-left: auto;
            }

            .gs-user-message {
                flex-direction: row-reverse;
            }

            .gs-input-area {
                padding: 16px;
                background: rgba(30, 41, 59, 0.8);
                border-top: 1px solid rgba(255,255,255,0.1);
            }

            .gs-input-container {
                display: flex;
                gap: 8px;
                align-items: flex-end;
            }

            .gs-input-wrapper {
                flex: 1;
                position: relative;
            }

            .gs-chat-input {
                width: 100%;
                padding: 12px 16px;
                background: rgba(51, 65, 85, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                color: white;
                font-size: 14px;
                resize: none;
                outline: none;
                transition: all 0.3s ease;
                max-height: 100px;
            }

            .gs-chat-input:focus {
                border-color: rgba(99, 102, 241, 0.5);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }

            .gs-chat-input::placeholder {
                color: #94a3b8;
            }

            .gs-send-button {
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                border-radius: 50%;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                flex-shrink: 0;
            }

            .gs-send-button:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
            }

            .gs-send-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;
            }

            .gs-typing-indicator {
                display: flex;
                gap: 4px;
                padding: 16px 0;
            }

            .gs-typing-dot {
                width: 6px;
                height: 6px;
                background: #94a3b8;
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }

            .gs-typing-dot:nth-child(2) {
                animation-delay: 0.2s;
            }

            .gs-typing-dot:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typing {
                0%, 60%, 100% {
                    transform: translateY(0);
                    opacity: 0.7;
                }
                30% {
                    transform: translateY(-8px);
                    opacity: 1;
                }
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .gs-chatbot-widget {
                    bottom: 16px;
                    right: 16px;
                }

                .gs-widget-toggle {
                    width: 56px;
                    height: 56px;
                }

                .gs-widget-container {
                    width: calc(100vw - 32px);
                    height: calc(100vh - 100px);
                    right: -16px;
                    bottom: 72px;
                }

                .gs-quick-actions {
                    padding: 8px;
                }

                .gs-quick-action {
                    padding: 6px 10px;
                    font-size: 11px;
                }

                .gs-chat-messages {
                    padding: 12px;
                }

                .gs-message-bubble {
                    max-width: 90%;
                    padding: 10px;
                    font-size: 13px;
                }

                .gs-input-area {
                    padding: 12px;
                }

                .gs-chat-input {
                    padding: 10px 14px;
                    font-size: 13px;
                }

                .gs-send-button {
                    width: 32px;
                    height: 32px;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    attachEventListeners() {
        const toggle = document.getElementById('gsChatToggle');
        const closeBtn = document.getElementById('gsCloseBtn');
        const sendBtn = document.getElementById('gsSendButton');
        const input = document.getElementById('gsChatInput');
        const quickActions = document.querySelectorAll('.gs-quick-action');

        toggle.addEventListener('click', () => this.toggleWidget());
        closeBtn.addEventListener('click', () => this.closeWidget());
        sendBtn.addEventListener('click', () => this.sendMessage());

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        input.addEventListener('input', () => this.autoResizeInput());

        quickActions.forEach(action => {
            action.addEventListener('click', () => {
                const query = action.getAttribute('data-query');
                this.sendQuickAction(query);
            });
        });
    }

    toggleWidget() {
        const container = document.getElementById('gsWidgetContainer');
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            container.classList.add('open');
            document.getElementById('gsChatInput').focus();
            this.hideNotification();
        } else {
            container.classList.remove('open');
        }
    }

    closeWidget() {
        const container = document.getElementById('gsWidgetContainer');
        container.classList.remove('open');
        this.isOpen = false;
    }

    showNotification() {
        document.getElementById('gsNotificationDot').classList.add('active');
    }

    hideNotification() {
        document.getElementById('gsNotificationDot').classList.remove('active');
    }

    autoResizeInput() {
        const input = document.getElementById('gsChatInput');
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    }

    sendQuickAction(message) {
        document.getElementById('gsChatInput').value = message;
        this.sendMessage();
    }

    sendMessage() {
        const input = document.getElementById('gsChatInput');
        const message = input.value.trim();
        
        if (!message) return;

        this.addMessage(message, 'user');
        this.messageHistory.push({ role: 'user', content: message });
        
        input.value = '';
        input.style.height = 'auto';
        
        this.showTypingIndicator();
        
        setTimeout(() => {
            this.removeTypingIndicator();
            this.generateResponse(message);
        }, 1000 + Math.random() * 1000);
    }

    generateResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        let response = '';
        
        for (const [key, data] of Object.entries(this.knowledgeBase)) {
            if (lowerMessage.includes(key)) {
                response = data.response;
                
                if (data.steps) {
                    response += '<br><br><strong>Steps:</strong><ol style="margin-left: 20px; margin-top: 8px;">';
                    data.steps.forEach(step => {
                        response += `<li style="margin: 6px 0;">${step}</li>`;
                    });
                    response += '</ol>';
                }
                
                if (data.tips) {
                    response += `<br><br>${data.tips}`;
                }
                
                if (data.related) {
                    response += '<br><br>🔗 <em>Related topics: ' + data.related.join(', ') + '</em>';
                }
                
                break;
            }
        }
        
        if (!response) {
            const defaultResponses = [
                "I can help you with GlobalShares platform features. Try asking about: adding shares, creating equity plans, round modeling, exercising options, or accessing the participant portal.",
                "That's a great question! While I'm continuously learning, I can assist with common GlobalShares operations like cap table management, vesting schedules, and equity administration.",
                "I'd be happy to help! Could you be more specific? For example, are you looking for help with equity grants, participant access, reporting, or platform administration?"
            ];
            response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
        }
        
        this.addMessage(response, 'bot');
        this.messageHistory.push({ role: 'assistant', content: response });
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('gsChatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `gs-message gs-${sender}-message`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = `gs-message-avatar gs-${sender}-avatar`;
        avatarDiv.textContent = sender === 'user' ? 'U' : '🤖';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'gs-message-content';
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'gs-message-bubble';
        bubbleDiv.innerHTML = content;
        
        contentDiv.appendChild(bubbleDiv);
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        if (!this.isOpen && sender === 'bot') {
            this.showNotification();
        }
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('gsChatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'gs-message gs-bot-message';
        typingDiv.id = 'gsTypingIndicator';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'gs-message-avatar gs-bot-avatar';
        avatarDiv.textContent = '🤖';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'gs-message-content';
        
        const typingContent = document.createElement('div');
        typingContent.className = 'gs-typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'gs-typing-dot';
            typingContent.appendChild(dot);
        }
        
        contentDiv.appendChild(typingContent);
        typingDiv.appendChild(avatarDiv);
        typingDiv.appendChild(contentDiv);
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('gsTypingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('.gs-chatbot-widget')) {
        window.globalSharesChatbot = new GlobalSharesChatbot();
    }
});

window.GlobalSharesChatbot = GlobalSharesChatbot;
