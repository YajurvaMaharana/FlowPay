const fs = require('fs');
let code = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

// 1. Update onSendMessage signature
code = code.replace(
  "  onSendMessage: (text: string) => void;",
  "  onSendMessage: (text: string, imageBase64?: string) => void;"
);

// Remove onImageUpload
code = code.replace(
  "  onImageUpload?: (file: File) => void;\n",
  ""
);

code = code.replace(
  "  onImageUpload,\n",
  ""
);

// 2. Add selectedImage state
const selectedImageState = `
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
`;
code = code.replace(
  "  const [inputText, setInputText] = useState('');",
  `${selectedImageState}\n  const [inputText, setInputText] = useState('');`
);

// 3. Update handleFileChange to set selectedImage
const newHandleFileChange = `
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
    }
  };
`;
code = code.replace(
  /const handleFileChange = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?\};\n/,
  newHandleFileChange
);

// 4. Update handleSubmit
const newHandleSubmit = `
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || isLoading) return;
    
    onSendMessage(inputText, selectedImage || undefined);
    setInputText('');
    setSelectedImage(null);
  };
`;
code = code.replace(
  /const handleSubmit = \(e: React\.FormEvent\) => \{[\s\S]*?\};\n/,
  newHandleSubmit
);

// 5. Update input area to show preview
const previewCode = `
        {/* Input Form */}
        {!isA2AMode && (
        <div className="flex flex-col gap-2">
          {selectedImage && (
            <div className="relative inline-block w-20 h-20 mb-2">
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover rounded-lg border border-neutral-700" />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-neutral-800 rounded-full p-1 border border-neutral-700 hover:bg-neutral-700 text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2 items-center relative">
`;

code = code.replace(
  `        {/* Input Form */}
        {!isA2AMode && (
        <form onSubmit={handleSubmit} className="flex gap-2 items-center relative">`,
  previewCode
);

// 6. Update disable logic for submit button
code = code.replace(
  "disabled={!inputText.trim() || isLoading || isA2AMode}",
  "disabled={(!inputText.trim() && !selectedImage) || isLoading || isA2AMode}"
);

// Close the div we opened for previewCode
code = code.replace(
  `          </form>
        )}`,
  `          </form>
        </div>
        )}`
);

fs.writeFileSync('src/components/ChatInterface.tsx', code);
