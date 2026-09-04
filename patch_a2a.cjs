const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "onImageUpload={handleImageUpload}",
  ""
);

code = code.replace(
  `        setIsA2ATyping(false);
        handleSendMessage(botResponse, undefined, true);
      }, 500);`,
  `        setIsA2ATyping(false);
        if (botResponse) {
          handleSendMessage(botResponse, undefined, true);
        }
      }, 500);`
);

fs.writeFileSync('src/App.tsx', code);
