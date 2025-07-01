import { FileText, Code, Settings } from "lucide-react";
import React from "react";
const getFileIcon = (filename, type) => {
  if (type === "component") return Code;
  if (type === "config") return Settings;
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js': case 'jsx': case 'ts': case 'tsx': return Code;
    case 'json': return Settings;
    default: return FileText;
  }
};

export default function FileExplorer({ files, selectedFile, onFileSelect }) {
  return (
    <div className="border-b border-gray-200 bg-gray-50 p-4">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Project Files</h4>
      <div className="space-y-1">
        {files.map((file, index) => {
          const Icon = getFileIcon(file.path, file.type);
          const isSelected = selectedFile?.path === file.path;
          return (
            <button
              key={index}
              onClick={() => onFileSelect(file)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                isSelected 
                  ? "bg-blue-100 text-blue-700 border border-blue-200" 
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.path}</p>
                <p className="text-xs opacity-75 capitalize">{file.type}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
