const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const handleImageUpload = async \(file: File\) => \{[\s\S]*?\}\s*\}\s*};\n/m;
code = code.replace(regex, '');

fs.writeFileSync('src/App.tsx', code);
