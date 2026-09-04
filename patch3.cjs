const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `  // A2A Autonomous Loop
  useEffect(() => {
    if (!isA2AMode || isLoading || isA2ATyping) return;
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage && lastMessage.sender === 'agent') {
      if (lastMessage.toolCalls?.some(tc => tc.name === 'generate_payment')) return;

      const botResponse = simulateBuyerBot(messages, cartCalculation);
      
      if (botResponse) {
        setIsA2ATyping(true);
        const timer = setTimeout(() => {
          setIsA2ATyping(false);
          handleSendMessage(botResponse, true);
        }, 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [isA2AMode, messages, isLoading, cartCalculation, isA2ATyping]);`,
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
              // We must use a slight hack or just let handleSendMessage capture state, 
              // but handleSendMessage is safely bound.
              handleSendMessage(botResponse, true);
            }
            return prev;
          });
        }, 2500);
        
        return () => {
          clearTimeout(timer);
          setIsA2ATyping(false);
        };
      }
    }
  }, [isA2AMode, messages, isLoading, cartCalculation]);`
);

fs.writeFileSync('src/App.tsx', code);
