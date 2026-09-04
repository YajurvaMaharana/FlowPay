const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const handleImageUploadCode = `
  const handleImageUpload = async (file: File) => {
    setIsAgentSidebarOpen(true);
    setAgentSidebarTab('chat');
    
    // 1. Read file as base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result as string;
      
      const userMsgId = \`msg_user_\${Date.now()}_\${Math.random().toString(36).substring(2, 9)}\`;
      const userMsg: Message = {
        id: userMsgId,
        sender: 'user',
        content: 'I uploaded a photo of my workspace. Can you recommend some ergonomic improvements?',
        timestamp: new Date().toISOString(),
        attachment: {
          type: 'image',
          url: base64Image
        }
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        // 2. Call the new /api/vision endpoint
        const response = await fetch('/api/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64Image })
        });
        
        if (!response.ok) throw new Error('Vision API failed');
        const visionResult = await response.json();
        
        // 3. Find recommended products from PRODUCTS list
        const recommendedProducts = PRODUCTS.filter(p => visionResult.productIds.includes(p.id));
        
        // 4. Construct Agent Response
        const agentMsgId = \`msg_agent_\${Date.now()}_\${Math.random().toString(36).substring(2, 9)}\`;
        const agentMsg: Message = {
          id: agentMsgId,
          sender: 'agent',
          content: \`Based on your workspace image, I noticed an issue: **\${visionResult.detectedIssue}**. 

I have proactively built a custom workspace bundle to solve this ergonomic gap.\`,
          timestamp: new Date().toISOString(),
          visionAnalysis: {
            detectedIssue: visionResult.detectedIssue,
            products: recommendedProducts
          }
        };
        
        setMessages((prev) => [...prev, agentMsg]);
      } catch (err) {
        console.error('Vision processing error:', err);
        const errorMsg: Message = {
          id: \`msg_err_\${Date.now()}\`,
          sender: 'agent',
          content: 'Sorry, I encountered an error while analyzing your workspace image.',
          timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    };
  };
`;

code = code.replace(
  "  // Handle User Message Submission\n  const handleSendMessage",
  `${handleImageUploadCode}\n  // Handle User Message Submission\n  const handleSendMessage`
);

code = code.replace(
  "        onNextA2ATurn={handleNextA2ATurn}",
  "        onNextA2ATurn={handleNextA2ATurn}\n        onImageUpload={handleImageUpload}"
);

fs.writeFileSync('src/App.tsx', code);
