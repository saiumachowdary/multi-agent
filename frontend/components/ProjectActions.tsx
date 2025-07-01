// import { Button } from "../components/ui/button";
// import { Download } from "lucide-react";
// import { downloadProjectZip } from "../lib/downloadZip";
// import React from "react";
// export default function ProjectActions({ files }) {
//   return (
//     <div className="flex gap-2">
//       <Button
//         variant="outline"
//         size="sm"
//         onClick={() => downloadProjectZip(files)}
//         className="gap-2"
//       >
//         <Download className="w-4 h-4" />
//         Download Project
//       </Button>
//     </div>
//   );
// }

import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { Download, Github, Globe, Settings, ExternalLink, Copy, Check, FileArchive } from "lucide-react";
import JSZip from "jszip";

const CodeBlock = ({ content }) => {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-gray-900 text-white rounded-lg p-4 font-mono text-sm">
      <pre><code>{content}</code></pre>
      <button onClick={copyToClipboard} className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-700 hover:bg-gray-600">
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default function ProjectActions({ project }) {
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [deployType, setDeployType] = useState<"github" | "netlify" | null>(null);
  const [githubUsername, setGithubUsername] = useState(localStorage.getItem("github_username") || "");
  const [showCredsDialog, setShowCredsDialog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDeployClick = (type) => {
    setDeployType(type);
    setShowDeployDialog(true);
  };

  const saveCredentials = () => {
    localStorage.setItem("github_username", githubUsername);
    setShowCredsDialog(false);
  };

  const downloadProjectAsZip = async () => {
    if (!project?.files || project.files.length === 0) {
      alert("No files to download");
      return;
    }
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      project.files.forEach(file => {
        zip.file(file.path, file.content);
      });
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("ZIP creation failed");
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadProjectAsText = () => {
    let content = `# ${project.name}\n\n${project.description}\n\n`;
    project.files.forEach(file => {
      content += `// ${file.path}\n${file.content}\n\n${"=".repeat(50)}\n\n`;
    });
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const githubCommands = `# Clone or create your repository
git init
git add .
git commit -m "Initial commit from ReactCraft AI"
git branch -M main
git remote add origin https://github.com/${githubUsername || '[your-username]'}/${project?.name.toLowerCase().replace(/\s+/g, '-')}.git
git push -u origin main

# Install dependencies and start development
npm install
npm start`;

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <Button 
          onClick={downloadProjectAsZip} 
          variant="outline" 
          size="sm" 
          className="gap-2"
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-400 border-t-blue-600 rounded-full animate-spin" />
              Creating ZIP...
            </>
          ) : (
            <>
              <FileArchive className="w-4 h-4" /> 
              Download ZIP
            </>
          )}
        </Button>
        <Button onClick={() => handleDeployClick('github')} variant="outline" size="sm" className="gap-2">
          <Github className="w-4 h-4" /> Deploy to GitHub
        </Button>
        <Button onClick={() => handleDeployClick('netlify')} className="gap-2 bg-teal-600 hover:bg-teal-700 text-white" size="sm">
          <Globe className="w-4 h-4" /> Deploy to Netlify
        </Button>
        <Button onClick={() => setShowCredsDialog(true)} variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <Dialog open={showCredsDialog} onOpenChange={setShowCredsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Set your GitHub username to pre-fill deployment commands.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="github_username">GitHub Username</Label>
            <Input
              id="github_username"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="e.g., octocat"
            />
          </div>
          <DialogFooter>
            <Button onClick={saveCredentials}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {deployType === 'github' && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Github /> Deploy to GitHub</DialogTitle>
                <DialogDescription>Follow these steps to push your project to a new GitHub repository.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2 text-base">Step 1: Download and Extract ZIP</h4>
                  <p className="text-sm text-gray-600">Download the ZIP file using the button above, then extract it to create your React project folder.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-base">Step 2: Create a New GitHub Repository</h4>
                  <p className="text-sm text-gray-600 mb-2">Create a new, empty repository on GitHub. Do not initialize it with a README or .gitignore.</p>
                  <Button asChild variant="outline">
                    <a href="https://github.com/new" target="_blank" rel="noopener noreferrer">
                      Create Repository <ExternalLink className="w-4 h-4 ml-2"/>
                    </a>
                  </Button>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-base">Step 3: Initialize and Push</h4>
                  <p className="text-sm text-gray-600 mb-2">Navigate to your extracted project folder in terminal and run:</p>
                  <div className="relative bg-gray-900 text-white rounded-lg p-4 font-mono text-sm max-h-48 overflow-y-auto">
                    <pre className="whitespace-pre-wrap"><code>{githubCommands}</code></pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(githubCommands);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-700 hover:bg-gray-600"
                      title="Copy"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Make sure you have Git installed and are logged into GitHub CLI or have set up SSH keys.
                  </p>
                </div>
              </div>
            </>
          )}
          {deployType === 'netlify' && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Globe /> Deploy to Netlify</DialogTitle>
                <DialogDescription>Deploy your React project to Netlify for free hosting.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Step 1: Push to GitHub First</h4>
                  <p className="text-sm text-gray-600">Complete the GitHub deployment steps above to get your code in a repository.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Step 2: Connect to Netlify</h4>
                  <p className="text-sm text-gray-600 mb-2">Import your GitHub repository to Netlify:</p>
                  <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white">
                    <a href="https://app.netlify.com/start" target="_blank" rel="noopener noreferrer">Import to Netlify <ExternalLink className="w-4 h-4 ml-2"/></a>
                  </Button>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Step 3: Configure Build Settings</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Build Command:</p>
                    <code className="text-sm bg-white px-2 py-1 rounded">npm run build</code>
                    <p className="text-sm font-medium mb-1 mt-2">Publish Directory:</p>
                    <code className="text-sm bg-white px-2 py-1 rounded">build</code>
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>✨ That's it!</strong> Netlify will automatically build and deploy your React app. You'll get a live URL within minutes.
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}