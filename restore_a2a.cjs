const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const restoreCode = `
  const handleToggleA2A = () => {
    setIsA2AMode((prev) => {
      const next = !prev;
      if (next) {
        handleResetSession();
        setTimeout(() => {
          handleSendMessage("Hello, I am an automated procurement agent looking to purchase the AeroType Carbon keyboard for my client. My budget cap is ₹8,500. What is your best price?", undefined, true);
        }, 500);
      }
      return next;
    });
  };

  const handleNextA2ATurn = () => {
    if (!isA2AMode || isLoading || isA2ATyping) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === 'agent') {
      if (lastMessage.toolCalls?.some(tc => tc.name === 'generate_payment')) return;
      const botResponse = simulateBuyerBot(messages, cartCalculation);
      setIsA2ATyping(true);
      setTimeout(() => {
        setIsA2ATyping(false);
        handleSendMessage(botResponse, undefined, true);
      }, 500);
    }
  };
`;

code = code.replace(
  "  // Handle Human-in-the-Loop Gated Action Confirmation",
  `${restoreCode}\n  // Handle Human-in-the-Loop Gated Action Confirmation`
);

fs.writeFileSync('src/App.tsx', code);
