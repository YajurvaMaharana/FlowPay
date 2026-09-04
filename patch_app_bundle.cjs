const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const handleAddBundleCode = `
  const handleAddBundleToCart = (products: Product[]) => {
    setCart((prev) => {
      let newCart = [...prev];
      products.forEach(product => {
        const existing = newCart.find(i => i.product.id === product.id);
        if (existing) {
          newCart = newCart.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
        } else {
          newCart.push({ product, quantity: 1 });
        }
      });
      return newCart;
    });
    
    // Simulate calculate_cart tool trace
    setToolCallsHistory(prev => [
      ...prev,
      {
        id: \`call_\${Date.now()}\`,
        name: 'calculate_cart',
        arguments: { action: 'ADD_BUNDLE', count: products.length },
        status: 'completed',
        timestamp: new Date().toISOString()
      }
    ]);
    
    // Provide system confirmation
    const confirmMsg: Message = {
      id: \`msg_sys_\${Date.now()}\`,
      sender: 'system',
      content: \`Workspace Bundle added to cart successfully (\${products.length} items).\`,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, confirmMsg]);
    
    // Switch to cart tab
    setAgentSidebarTab('cart');
  };
`;

code = code.replace(
  "  const handleAddToCart = (product: Product) => {",
  `${handleAddBundleCode}\n  const handleAddToCart = (product: Product) => {`
);

code = code.replace(
  "        onImageUpload={handleImageUpload}",
  "        onImageUpload={handleImageUpload}\n        onAddBundleToCart={handleAddBundleToCart}"
);

fs.writeFileSync('src/App.tsx', code);
