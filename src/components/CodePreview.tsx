import { useState } from 'react';
import Editor from "@monaco-editor/react";

type CodePreviewProps = {
  code: string;
};

const CodePreview = ({ code }: CodePreviewProps) => {
  const [editorCode, setEditorCode] = useState(code);

  return (
    <div className="rounded-lg border border-gray-700 bg-chatgpt-secondary mt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Editor Section */}
        <div className="h-[300px] rounded-lg overflow-hidden border border-gray-600">
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
            }}
          />
        </div>

        {/* Preview Section */}
        <div className="h-[300px] rounded-lg border border-gray-600 bg-white overflow-auto">
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