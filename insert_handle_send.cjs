const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const newHandleSendMessage = `
  // Handle User Message Submission
  const handleSendMessage = async (text: string, imageBase64?: string, isFromBot = false) => {
    setIsAgentSidebarOpen(true); setAgentSidebarTab('chat');

    // Check PII in user text
    const piiCheck = sanitizePii(text);
    const userMsgId = \`msg_user_\${Date.now()}_\${Math.random().toString(36).substring(2, 9)}\`;
    
    if (isFromBot) {
      const userMsg: Message = {
        id: userMsgId,
        sender: 'user',
        content: '',
        timestamp: new Date().toISOString(),
        isPiiMasked: piiCheck.hasPii,
        attachment: imageBase64 ? { type: 'image', url: imageBase64 } : undefined
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
        isPiiMasked: piiCheck.hasPii,
        attachment: imageBase64 ? { type: 'image', url: imageBase64 } : undefined
      };
      setMessages((prev) => [...prev, userMsg]);
    }
    
    setIsLoading(true);

    try {
      if (imageBase64) {
        // --- VISION WORKFLOW ---
        const response = await fetch('/api/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64, textPrompt: text })
        });
        
        if (!response.ok) throw new Error('Vision API failed');
        const visionResult = await response.json();
        
        const recommendedProducts = PRODUCTS.filter(p => visionResult.productIds.includes(p.id));
        
        const agentMsgId = \`msg_agent_\${Date.now()}_\${Math.random().toString(36).substring(2, 9)}\`;
        const agentMsg: Message = {
          id: agentMsgId,
          sender: 'agent',
          content: \`Based on your workspace image, I noticed an issue: **\${visionResult.detectedIssue}**. I have proactively built a custom workspace bundle to solve this ergonomic gap.\`,
          timestamp: new Date().toISOString(),
          visionAnalysis: {
            detectedIssue: visionResult.detectedIssue,
            products: recommendedProducts
          }
        };
        
        setMessages((prev) => [...prev, agentMsg]);
      } else {
        // --- STANDARD CONVERSATIONAL WORKFLOW ---
        const response = await processUserMessage(text, {
          cart,
          userEmail: user.email,
          currency: 'INR',
          appliedDiscount,
          couponCode,
          lastGeneratedOrder: activePaymentOrder || undefined,
          messagesHistory: messages
        });

        // Update state based on agent response
        if (response.updatedCart) setCart(response.updatedCart);
        if (response.appliedDiscount !== undefined) setAppliedDiscount(response.appliedDiscount);
        if (response.couponCode !== undefined) setCouponCode(response.couponCode);
        if (response.updatedOrder) {
          setActivePaymentOrder(response.updatedOrder);
          setUser((prev) => {
            const existingIdx = prev.orders.findIndex((o) => o.orderId === response.updatedOrder!.orderId);
            if (existingIdx >= 0) {
              const copy = [...prev.orders];
              copy[existingIdx] = response.updatedOrder!;
              return { ...prev, orders: copy };
            }
            return { ...prev, orders: [response.updatedOrder!, ...prev.orders] };
          });
        }

        // Telemetry updates
        if (response.newSecurityAlerts && response.newSecurityAlerts.length > 0) {
          setSecurityAlerts((prev) => [...prev, ...response.newSecurityAlerts!]);
          
          let attacks = 0;
          let piiCount = 0;
          let discCaps = 0;
          let gated = 0;

          for (const alert of response.newSecurityAlerts) {
            if (alert.type === 'PROMPT_INJECTION_ATTEMPT') attacks++;
            if (alert.type === 'PII_DETECTED_AND_MASKED') piiCount++;
            if (alert.type === 'DISCOUNT_LIMIT_ENFORCED') discCaps++;
            if (alert.type === 'UNAUTHORIZED_PAYMENT_GATE_BLOCKED') gated++;
          }

          setSecurityMetrics((prev) => ({
            ...prev,
            totalInteractions: prev.totalInteractions + 1,
            attacksBlocked: prev.attacksBlocked + attacks,
            piiMaskedCount: prev.piiMaskedCount + piiCount,
            discountLimitsEnforced: prev.discountLimitsEnforced + discCaps,
            gatedConfirmationsEnforced: prev.gatedConfirmationsEnforced + gated,
            yieldRetained: response.appliedDiscount !== undefined ? 100 - response.appliedDiscount : prev.yieldRetained,
            zeroTrustStatus: (attacks > 0 || piiCount > 0) ? 'ACTIVE_DEFENSE' : 'OPTIMAL'
          }));
        } else {
          setSecurityMetrics((prev) => ({
            ...prev,
            totalInteractions: prev.totalInteractions + 1,
            yieldRetained: response.appliedDiscount !== undefined ? 100 - response.appliedDiscount : prev.yieldRetained,
          }));
        }

        if (response.message.toolCalls) {
          setToolCallsHistory((prev) => [...prev, ...response.message.toolCalls!]);
        }

        // Stream text response smoothly
        const finalMsg = response.message;
        const fullContent = finalMsg.content;
        const initialPartialMsg: Message = {
          ...finalMsg,
          content: ''
        };

        setMessages((prev) => [...prev, initialPartialMsg]);

        const words = fullContent.split(' ');
        let currentWordIndex = 0;
        const streamChunkSize = Math.max(1, Math.floor(words.length / 18));

        await new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            currentWordIndex += streamChunkSize;
            if (currentWordIndex >= words.length) {
              clearInterval(interval);
              setMessages((prev) =>
                prev.map((m) => (m.id === finalMsg.id ? finalMsg : m))
              );
              resolve();
            } else {
              const partialText = words.slice(0, currentWordIndex).join(' ');
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === finalMsg.id ? { ...m, content: partialText } : m
                )
              );
            }
          }, 22);
        });
      }
    } catch (err) {
      console.error('Agent processing error:', err);
    } finally {
      setIsLoading(false);
    }
  };
`;

code = code.replace(
  "  // Check if there is an unresolved gated confirmation in the conversation",
  `${newHandleSendMessage}\n\n  // Check if there is an unresolved gated confirmation in the conversation`
);

fs.writeFileSync('src/App.tsx', code);
