const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add isA2ATyping state
code = code.replace(
  "const [isA2AMode, setIsA2AMode] = useState(false);",
  "const [isA2AMode, setIsA2AMode] = useState(false);\n  const [isA2ATyping, setIsA2ATyping] = useState(false);"
);

// Update handleSendMessage to accept isFromBot
code = code.replace(
  "const handleSendMessage = async (text: string) => {",
  "const handleSendMessage = async (text: string, isFromBot = false) => {"
);

// Update appending userMsg
code = code.replace(
  `    const piiCheck = sanitizePii(text);
    
    // Append user message immediately
    const userMsg: Message = {
      id: \`msg_user_\${Date.now()}_\${Math.random().toString(36).substring(2, 9)}\`,
      sender: 'user',
      content: piiCheck.sanitizedText,
      timestamp: new Date().toISOString(),
      isPiiMasked: piiCheck.hasPii
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);`,
  `    const piiCheck = sanitizePii(text);
    const userMsgId = \`msg_user_\${Date.now()}_\${Math.random().toString(36).substring(2, 9)}\`;
    
    if (isFromBot) {
      const userMsg: Message = {
        id: userMsgId,
        sender: 'user',
        content: '',
        timestamp: new Date().toISOString(),
        isPiiMasked: piiCheck.hasPii
      };
      setMessages((prev) => [...prev, userMsg]);
      
      const words = piiCheck.sanitizedText.split(' ');
      let currentWordIndex = 0;
      const streamChunkSize = Math.max(1, Math.floor(words.length / 10));

      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          currentWordIndex += streamChunkSize;
          if (currentWordIndex >= words.length) {
            clearInterval(interval);
            setMessages((prev) =>
              prev.map((m) => (m.id === userMsgId ? { ...m, content: piiCheck.sanitizedText } : m))
            );
            resolve();
          } else {
            const partialText = words.slice(0, currentWordIndex).join(' ');
            setMessages((prev) =>
              prev.map((m) =>
                m.id === userMsgId ? { ...m, content: partialText } : m
              )
            );
          }
        }, 30);
      });
    } else {
      const userMsg: Message = {
        id: userMsgId,
        sender: 'user',
        content: piiCheck.sanitizedText,
        timestamp: new Date().toISOString(),
        isPiiMasked: piiCheck.hasPii
      };
      setMessages((prev) => [...prev, userMsg]);
    }
    
    setIsLoading(true);`
);

// Update A2A Autonomous Loop
code = code.replace(
  `  // A2A Autonomous Loop
  useEffect(() => {
    if (!isA2AMode || isLoading) return;
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage && lastMessage.sender === 'agent') {
      if (lastMessage.toolCalls?.some(tc => tc.name === 'generate_payment')) return;

      const botResponse = simulateBuyerBot(messages, cartCalculation);
      
      if (botResponse) {
        const timer = setTimeout(() => {
          handleSendMessage(botResponse);
        }, 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [isA2AMode, messages, isLoading, cartCalculation]);`,
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
  }, [isA2AMode, messages, isLoading, cartCalculation, isA2ATyping]);`
);

// Fix handleToggleA2A's handleSendMessage to use bot streaming
code = code.replace(
  `        setTimeout(() => {
          handleSendMessage("Hello, I am an automated procurement agent looking to purchase the AeroType Carbon keyboard for my client. What is your best price?");
        }, 500);`,
  `        setTimeout(() => {
          handleSendMessage("Hello, I am an automated procurement agent looking to purchase the AeroType Carbon keyboard for my client. What is your best price?", true);
        }, 500);`
);

// Pass isA2ATyping to AlphaCartSidebar
code = code.replace(
  `        isA2AMode={isA2AMode}`,
  `        isA2AMode={isA2AMode}\n        isA2ATyping={isA2ATyping}`
);

fs.writeFileSync('src/App.tsx', code);
