import { Button } from "../components/ui/button";
import { Copy, Check } from "lucide-react";
// import { useState } from "react";
import React from "react";
export default function CodePreview({ file, onCopy, copied }) {
  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>Select a file to preview</p>
      </div>
    );
  }

  const getLanguage = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': case 'jsx': return 'javascript';
      case 'ts': case 'tsx': return 'typescript';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'html': return 'html';
      default: return 'text';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div>
          <h4 className="font-medium text-gray-900">{file.path}</h4>
          <p className="text-xs text-gray-500 capitalize">{file.type}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onCopy}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        <pre className="p-4 text-sm font-mono leading-relaxed text-gray-800 bg-gray-50 h-full">
          <code className={`language-${getLanguage(file.path)}`}>
            {file.content}
          </code>
        </pre>
      </div>
    </div>
  );
}
