(function() {
    'use strict';

    const API_URL = 'https://api.fulllogin.com/api/v1/public/chat';
    let sessionId = null;
    let isOpen = false;
    let isTyping = false;

    // Create styles
    const style = document.createElement('style');
    style.textContent = `
        #fl-chat-bubble {
            position: fixed;
            bottom: 28px;
            right: 28px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #5abf8a 0%, #3DB883 100%);
            box-shadow: 0 4px 20px rgba(90, 191, 138, 0.4);
            cursor: pointer;
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s, box-shadow 0.3s;
            border: none;
            outline: none;
        }
        #fl-chat-bubble:hover {
            transform: scale(1.08);
            box-shadow: 0 6px 28px rgba(90, 191, 138, 0.5);
        }
        #fl-chat-bubble svg {
            width: 28px;
            height: 28px;
            fill: white;
            transition: transform 0.3s;
        }
        #fl-chat-bubble.open svg {
            transform: rotate(90deg);
        }

        #fl-chat-window {
            position: fixed;
            bottom: 100px;
            right: 28px;
            width: 380px;
            height: 520px;
            background: #0d1117;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(90,191,138,0.15);
            z-index: 99998;
            display: none;
            flex-direction: column;
            overflow: hidden;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            animation: fl-slide-up 0.3s ease;
        }
        #fl-chat-window.visible {
            display: flex;
        }
        @keyframes fl-slide-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        #fl-chat-header {
            background: linear-gradient(135deg, rgba(90,191,138,0.12) 0%, rgba(13,17,23,1) 100%);
            padding: 18px 20px;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            display: flex;
            align-items: center;
            gap: 12px;
        }
        #fl-chat-header-avatar {
            width: 38px;
            height: 38px;
            border-radius: 10px;
            background: linear-gradient(135deg, #5abf8a, #3DB883);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        #fl-chat-header-avatar svg {
            width: 20px;
            height: 20px;
            fill: white;
        }
        #fl-chat-header-info h3 {
            color: #e6edf3;
            font-size: 14px;
            font-weight: 700;
            margin: 0;
            letter-spacing: 0.3px;
        }
        #fl-chat-header-info p {
            color: #5abf8a;
            font-size: 11px;
            font-weight: 500;
            margin: 2px 0 0;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        #fl-chat-header-info p::before {
            content: '';
            width: 6px;
            height: 6px;
            background: #5abf8a;
            border-radius: 50%;
            display: inline-block;
            animation: fl-pulse 2s infinite;
        }
        @keyframes fl-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
        }

        #fl-chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            scrollbar-width: thin;
            scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        #fl-chat-messages::-webkit-scrollbar {
            width: 4px;
        }
        #fl-chat-messages::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.1);
            border-radius: 4px;
        }

        .fl-msg {
            max-width: 82%;
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 13.5px;
            line-height: 1.5;
            word-wrap: break-word;
            animation: fl-msg-in 0.25s ease;
        }
        @keyframes fl-msg-in {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .fl-msg-bot {
            background: rgba(255,255,255,0.06);
            color: #c9d1d9;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
        }
        .fl-msg-user {
            background: linear-gradient(135deg, #5abf8a, #3DB883);
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
        }
        .fl-msg-typing {
            background: rgba(255,255,255,0.06);
            color: #8b949e;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
            display: flex;
            gap: 4px;
            padding: 14px 18px;
        }
        .fl-msg-typing span {
            width: 6px;
            height: 6px;
            background: #5abf8a;
            border-radius: 50%;
            animation: fl-typing 1.4s infinite;
        }
        .fl-msg-typing span:nth-child(2) { animation-delay: 0.2s; }
        .fl-msg-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes fl-typing {
            0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
            30% { opacity: 1; transform: scale(1); }
        }

        #fl-chat-input-area {
            padding: 12px 16px;
            border-top: 1px solid rgba(255,255,255,0.06);
            display: flex;
            gap: 8px;
            background: rgba(255,255,255,0.02);
        }
        #fl-chat-input {
            flex: 1;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 10px;
            padding: 10px 14px;
            color: #e6edf3;
            font-size: 13.5px;
            font-family: inherit;
            outline: none;
            transition: border-color 0.2s;
            resize: none;
            max-height: 80px;
            line-height: 1.4;
        }
        #fl-chat-input::placeholder {
            color: #484f58;
        }
        #fl-chat-input:focus {
            border-color: rgba(90,191,138,0.4);
        }
        #fl-chat-send {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: linear-gradient(135deg, #5abf8a, #3DB883);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s, opacity 0.2s;
            flex-shrink: 0;
            align-self: flex-end;
        }
        #fl-chat-send:hover { transform: scale(1.05); }
        #fl-chat-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        #fl-chat-send svg {
            width: 18px;
            height: 18px;
            fill: white;
        }

        #fl-chat-footer {
            padding: 6px 16px 10px;
            text-align: center;
        }
        #fl-chat-footer a {
            color: #484f58;
            font-size: 10px;
            text-decoration: none;
            font-weight: 500;
            letter-spacing: 0.5px;
        }
        #fl-chat-footer a:hover {
            color: #5abf8a;
        }

        @media (max-width: 480px) {
            #fl-chat-window {
                width: calc(100vw - 20px);
                height: calc(100vh - 140px);
                right: 10px;
                bottom: 90px;
                border-radius: 12px;
            }
        }
    `;
    document.head.appendChild(style);

    // Create bubble
    const bubble = document.createElement('button');
    bubble.id = 'fl-chat-bubble';
    bubble.setAttribute('aria-label', 'Abrir chat');
    bubble.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/><path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/></svg>`;
    document.body.appendChild(bubble);

    // Create window
    const win = document.createElement('div');
    win.id = 'fl-chat-window';
    win.innerHTML = `
        <div id="fl-chat-header">
            <div id="fl-chat-header-avatar">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            </div>
            <div id="fl-chat-header-info">
                <h3>Full Login IA</h3>
                <p>Online — respuesta inmediata</p>
            </div>
        </div>
        <div id="fl-chat-messages"></div>
        <div id="fl-chat-input-area">
            <textarea id="fl-chat-input" placeholder="Escribe tu mensaje..." rows="1"></textarea>
            <button id="fl-chat-send" aria-label="Enviar">
                <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
        </div>
        <div id="fl-chat-footer">
            <a href="https://app.fulllogin.com/register" target="_blank">Powered by Full Login</a>
        </div>
    `;
    document.body.appendChild(win);

    const messagesEl = document.getElementById('fl-chat-messages');
    const inputEl = document.getElementById('fl-chat-input');
    const sendBtn = document.getElementById('fl-chat-send');

    function addMessage(text, type) {
        const div = document.createElement('div');
        div.className = 'fl-msg fl-msg-' + type;
        div.textContent = text;
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function showTyping() {
        const div = document.createElement('div');
        div.className = 'fl-msg fl-msg-typing';
        div.id = 'fl-typing';
        div.innerHTML = '<span></span><span></span><span></span>';
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function hideTyping() {
        const el = document.getElementById('fl-typing');
        if (el) el.remove();
    }

    async function sendMessage() {
        const text = inputEl.value.trim();
        if (!text || isTyping) return;

        addMessage(text, 'user');
        inputEl.value = '';
        inputEl.style.height = 'auto';
        sendBtn.disabled = true;
        isTyping = true;
        showTyping();

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, sessionId: sessionId }),
            });
            const data = await res.json();
            hideTyping();
            addMessage(data.reply, 'bot');
            if (data.sessionId) sessionId = data.sessionId;
        } catch (e) {
            hideTyping();
            addMessage('Lo siento, hubo un error. Intenta de nuevo.', 'bot');
        }

        isTyping = false;
        sendBtn.disabled = false;
        inputEl.focus();
    }

    // Events
    bubble.addEventListener('click', function() {
        isOpen = !isOpen;
        win.classList.toggle('visible', isOpen);
        bubble.classList.toggle('open', isOpen);
        if (isOpen && messagesEl.children.length === 0) {
            setTimeout(function() {
                addMessage('Hola 👋 Soy el asistente de Full Login. ¿En qué puedo ayudarte?', 'bot');
            }, 500);
        }
        if (isOpen) inputEl.focus();
    });

    sendBtn.addEventListener('click', sendMessage);

    inputEl.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Auto-resize textarea
    inputEl.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 80) + 'px';
    });
})();
