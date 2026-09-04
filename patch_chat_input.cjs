const fs = require('fs');
let code = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

// 1. Add Image to imports
code = code.replace(
  "Trash2, Plus, Minus, X, Tag",
  "Trash2, Plus, Minus, X, Tag, Image as ImageIcon"
);

// 2. Add onImageUpload to props
code = code.replace(
  "  onNextA2ATurn?: () => void;\n}",
  "  onNextA2ATurn?: () => void;\n  onImageUpload?: (file: File) => void;\n}"
);

code = code.replace(
  "  onNextA2ATurn\n}) => {",
  "  onNextA2ATurn,\n  onImageUpload\n}) => {"
);

// 3. Add file input ref and handler
const inputHandlers = `
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onImageUpload) {
      onImageUpload(e.target.files[0]);
    }
  };
`;

code = code.replace(
  "const [inputText, setInputText] = useState('');",
  `${inputHandlers}\n  const [inputText, setInputText] = useState('');`
);

// 4. Update form layout to include file upload button
const formReplacement = `        <form onSubmit={handleSubmit} className="flex gap-2 items-center relative">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isA2AMode}
            className="p-3 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors"
            title="Upload Workspace Photo"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          
          <div className="relative flex-1">`;

code = code.replace(
  `        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <div className="relative flex-1">`,
  formReplacement
);

fs.writeFileSync('src/components/ChatInterface.tsx', code);
