import { useState } from 'react';
import Editor from "@monaco-editor/react";

type CodePreviewProps = {
  code: string;
};

const CodePreview = ({ code }: CodePreviewProps) => {
  const [editorCode, setEditorCode] = useState(code);

  return (
    <div className="rounded-lg border border-gray-700 bg-[#1e1e1e] mt-2">
      <div className="flex items-center px-4 py-2 border-b border-gray-700">
        <span className="text-gray-400 text-sm">html</span>
        <div className="ml-auto flex gap-2">
          <button className="text-gray-400 hover:text-white text-sm">
            Copiar
          </button>
          <button className="text-gray-400 hover:text-white text-sm">
            Editar
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Editor Section */}
        <div className="h-[400px] rounded-lg overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="html"
            theme="vs-dark"
            value={editorCode}
            onChange={(value) => setEditorCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              readOnly: false,
              wordWrap: 'on',
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              renderLineHighlight: 'none',
              fontFamily: 'monospace',
              theme: {
                colors: {
                  'editor.background': '#1e1e1e',
                }
              }
            }}
          />
        </div>

        {/* Preview Section */}
        <div className="h-[400px] rounded-lg border border-gray-600 bg-white overflow-auto">
          <iframe
            srcDoc={editorCode}
            title="HTML Preview"
            className="w-full h-full"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
};

export default CodePreview;