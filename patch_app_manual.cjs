const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `  // A2A Autonomous Loop
  useEffect(() => {
    if (!isA2AMode || isLoading) return;
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage && lastMessage.sender === 'agent') {
      if (lastMessage.toolCalls?.some(tc => tc.name === 'generate_payment')) return;

      const botResponse = simulateBuyerBot(messages, cartCalculation);
      
      if (botResponse) {
        setIsA2ATyping(true);
        const timer = setTimeout(() => {
          setIsA2ATyping(false);
          // Only send if we are still in A2A mode
          setIsA2AMode(prev => {
            if (prev) {
              handleSendMessage(botResponse, true);
            }
            return prev;
          });
        }, 3000); // Well-paced 3-second interval
        
        return () => {
          clearTimeout(timer);
          setIsA2ATyping(false);
        };
      }
    }
  }, [isA2AMode, messages, isLoading, cartCalculation]);`,
  `  // Manual A2A Turn Trigger
  const handleNextA2ATurn = () => {
    if (!isA2AMode || isLoading || isA2ATyping) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === 'agent') {
      if (lastMessage.toolCalls?.some(tc => tc.name === 'generate_payment')) return;
      const botResponse = simulateBuyerBot(messages, cartCalculation);
      if (botResponse) {
        setIsA2ATyping(true);
        setTimeout(() => {
          setIsA2ATyping(false);
          handleSendMessage(botResponse, true);
        }, 500);
      }
    }
  };`
);

// Add onNextA2ATurn={handleNextA2ATurn} to AlphaCartSidebar
code = code.replace(
  "        onToggleA2A={handleToggleA2A}",
  "        onToggleA2A={handleToggleA2A}\n        onNextA2ATurn={handleNextA2ATurn}"
);

fs.writeFileSync('src/App.tsx', code);
