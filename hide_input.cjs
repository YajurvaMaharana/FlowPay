const fs = require('fs');
let code = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

code = code.replace(
  `        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">`,
  `        {/* Input Form */}
        {!isA2AMode && (
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">`
);

code = code.replace(
  `        {/* Security & Protocol Footer Note */}`,
  `        )}
        
        {/* Security & Protocol Footer Note */}`
);

fs.writeFileSync('src/components/ChatInterface.tsx', code);
