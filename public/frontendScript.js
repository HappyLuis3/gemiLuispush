const btn = document.getElementById('submit');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');

console.log("frontendScript.js loaded!");

btn.addEventListener('click', async () => {
    const userQuery = userInput.value.trim();

    if (!userQuery) {
        return;
    }

    appendMessage(userQuery, 'user-message');

    userInput.value = '';

    const loadingMessageElement = appendMessage('Gemini is typing...', 'loading-message');

    try {
        const response = await fetch('/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userQuery }),
        });

        loadingMessageElement.remove();

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        let geminiText = "Sorry, I couldn't get a clear response.";
        if (data.candidates && data.candidates.length > 0 &&
            data.candidates[0].content &&
            data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0 &&
            data.candidates[0].content.parts[0].text) {
            geminiText = data.candidates[0].content.parts[0].text;
        }

        const renderedHtml = marked.parse(geminiText);

        appendMessage(renderedHtml, 'gemini-message', true);

        setTimeout(() => {
            document.querySelectorAll('#chatMessages pre code').forEach((block) => {
                const language = block.className.match(/(?:lang-|language-)(\w+)/);
                if (language) {
                    hljs.highlightElement(block);
                } else {
                    hljs.highlightAllUnder(block.parentNode);
                }
            });
        }, 0);

    } catch (error) {
        console.error('Error during API call or processing:', error);
        appendMessage(`Error: ${error.message}`, 'error-message');
    }
});


function appendMessage(text, className, isHtml = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', className);

    if (isHtml) {
        messageElement.innerHTML = text;
    } else {
        messageElement.textContent = text;
    }

    chatMessages.appendChild(messageElement);

    chatMessages.scrollTop = chatMessages.scrollHeight;

    return messageElement;
}