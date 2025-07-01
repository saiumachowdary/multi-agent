import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import AgentCard from '../components/AgentCard';
import AgentWorkflow from '../components/AgentWorkflow';
import { agents, getAgentById } from '../data/agents';
import { toast } from '../hooks/use-toast';
import axios from 'axios';
// import CodeDisplay from '../components/CodeDisplay';
// import CodeProjectViewer from '../components/CodeProjectViewer';
import FileExplorer from "../components/FileExplorer";
import CodePreview from "../components/CodePreview";
import ProjectActions from "../components/ProjectActions";
import { parseCodeOutput } from "../lib/parseCodeOutput";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  agentName?: string;
  agentAvatar?: string;
  agentColor?: string;
  timestamp: Date;
  type?: 'message' | 'code' | 'review' | 'test' | 'deployment';
}

interface WorkflowStep {
  id: string;
  agentName: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  description: string;
  estimatedTime: string;
  testResults?: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '👋 Welcome! I\'m your Prompt Engineer. Tell me what you want to build, and I\'ll help refine the requirements before passing them to our development team.',
      sender: 'agent',
      agentName: 'Prompt Engineer',
      agentAvatar: '🎯',
      agentColor: 'bg-purple-500',
      timestamp: new Date(),
      type: 'message'
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowStep[]>([]);
  const [workflowProgress, setWorkflowProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState('chat');
  const [userFeedback, setUserFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const stepOrder = ['prompt', 'coder', 'qa', 'deployment'];

  const handleAgentResponse = async (step: string, input: string, feedback?: string) => {
    try {
      const token = localStorage.getItem("access_token");
      let input_data;
      if (step === "prompt" || step === "coder") {
        input_data = { prompt: input };
      } else {
        input_data = { code: input };
      }

      const response = await axios.post(
        '/api/run-step',
        {
          step,
          input_data,
          user_feedback: feedback
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const result = response.data.result;

      // If result is an object, extract the main text
      let displayContent = result;

      // If result has a tasks_output array with a 'raw' field, use that
      if (result && typeof result === "object") {
        if (Array.isArray(result.tasks_output) && result.tasks_output[0]?.raw) {
          displayContent = result.tasks_output[0].raw;
        } else if (result.raw) {
          displayContent = result.raw;
        } else {
          // fallback: show the whole object as JSON
          displayContent = JSON.stringify(result, null, 2);
        }
      }

      // Determine agent details based on step
      const agentDetails = {
        prompt: {
          name: 'Prompt Engineer',
          avatar: '🎯',
          color: 'bg-purple-500',
          type: 'message' as const
        },
        coder: {
          name: 'Code Generator',
          avatar: '💻',
          color: 'bg-green-500',
          type: 'code' as const
        },
        reviewer: {
          name: 'Code Reviewer',
          avatar: '👀',
          color: 'bg-blue-500',
          type: 'review' as const
        },
        qa: {
          name: 'QA Engineer',
          avatar: '🔍',
          color: 'bg-yellow-500',
          type: 'test' as const
        },
        deployment: {
          name: 'Deployment Manager',
          avatar: '🚀',
          color: 'bg-red-500',
          type: 'deployment' as const
        }
      };

      const agent = agentDetails[step as keyof typeof agentDetails];

      const newMessage: Message = {
        id: Date.now().toString(),
        content: displayContent,
        sender: 'agent',
        agentName: agent.name,
        agentAvatar: agent.avatar,
        agentColor: agent.color,
        timestamp: new Date(),
        type: agent.type
      };

      setMessages(prev => [...prev, newMessage]);
      setShowFeedback(true);

      // Update workflow status
      const stepIndex = stepOrder.indexOf(step);
      if (stepIndex !== -1) {
        setCurrentStep(stepIndex);
        setWorkflowProgress((stepIndex + 1) * 25);
        
        const updatedWorkflow = [...currentWorkflow];
        if (updatedWorkflow[stepIndex]) {
          updatedWorkflow[stepIndex].status = 'completed';
          if (updatedWorkflow[stepIndex + 1]) {
            updatedWorkflow[stepIndex + 1].status = 'in-progress';
          }
          setCurrentWorkflow(updatedWorkflow);
        }
      }

      if (step === "qa") {
        // Update workflow to show test results
        const updatedWorkflow = [...currentWorkflow];
        const qaStep = updatedWorkflow.find(s => s.agentName === "QA Engineer");
        if (qaStep) {
          qaStep.testResults = displayContent;
        }
        setCurrentWorkflow(updatedWorkflow);
      }

      return result;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get agent response. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleApprove = async () => {
    setShowFeedback(false);
    setUserFeedback('');
    if (stepOrder[currentStep] === "prompt") {
      // After prompt approval, always trigger coder step
      setIsLoading(true);
      let input = messages[messages.length - 1].content;
      await handleAgentResponse("coder", input);
      setCurrentStep(stepOrder.indexOf("coder"));
      setIsLoading(false);
    } else {
      // Normal flow for other steps
      const nextStep = stepOrder[currentStep + 1];
      if (nextStep) {
        setIsLoading(true);
        let input = messages[messages.length - 1].content;
        await handleAgentResponse(nextStep, input);
        setCurrentStep(currentStep + 1);
        setIsLoading(false);
      }
    }
  };

  const handleRefine = async () => {
    if (!userFeedback) return;
    
    setIsLoading(true);
    const currentStepName = stepOrder[currentStep];
    await handleAgentResponse(
      currentStepName,
      messages[messages.length - 2].content, // Original input
      userFeedback
    );
    setIsLoading(false);
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Initialize workflow steps
    const workflowSteps: WorkflowStep[] = [
      {
        id: '1',
        agentName: 'Prompt Engineer',
        title: 'Requirements Analysis',
        status: 'in-progress',
        description: 'Analyzing and refining requirements',
        estimatedTime: '2 min'
      },
      {
        id: '2',
        agentName: 'Code Generator',
        title: 'Code Generation',
        status: 'pending',
        description: 'Writing clean, scalable code',
        estimatedTime: '5 min'
      },
      {
        id: '3',
        agentName: 'QA Engineer',
        title: 'Quality Assurance',
        status: 'pending',
        description: 'Running tests and quality checks',
        estimatedTime: '4 min',
        testResults: ""
      },
      {
        id: '4',
        agentName: 'Deployment Manager',
        title: 'Deployment',
        status: 'pending',
        description: 'Deploying to production',
        estimatedTime: '2 min'
      }
    ];

    setCurrentWorkflow(workflowSteps);
    setCurrentStep(0);
    setWorkflowProgress(0);
    // setActiveTab('workflow');

    // Get first agent (Prompt Engineer) response
    setIsLoading(true);
    await handleAgentResponse('prompt', content);
    setIsLoading(false);
  };

  function normalizeCodeOutput(raw: string): string {
    // Remove all "TEXT" markers and excessive whitespace
    let cleaned = raw.replace(/TEXT\s*\n*/g, "").replace(/\r/g, "");

    // Remove any tree structure blocks (tree\n... or ```tree ... ```)
    cleaned = cleaned.replace(/tree\n[\s\S]*?(?=\n(js|ts|py|html|css|json|sh|md)\n|$)/g, "");
    cleaned = cleaned.replace(/```tree[\s\S]*?```/g, "");

    // Split by filename comments (e.g., // path/to/file.js or # path/to/file.py)
    const fileRegex = /(?:^|\n)(\/\/|#)\s*([^\n]+)\n([\s\S]*?)(?=(?:\n\/\/|\n#|$))/g;
    let match;
    let markdownBlocks: string[] = [];
    while ((match = fileRegex.exec(cleaned)) !== null) {
      const filename = match[2].trim();
      let code = match[3].trim();

      // Guess language from file extension
      let lang = "text";
      if (filename.endsWith(".js")) lang = "js";
      else if (filename.endsWith(".ts")) lang = "ts";
      else if (filename.endsWith(".py")) lang = "py";
      else if (filename.endsWith(".html")) lang = "html";
      else if (filename.endsWith(".css")) lang = "css";
      else if (filename.endsWith(".json")) lang = "json";
      else if (filename.endsWith(".sh")) lang = "sh";
      else if (filename.endsWith(".md")) lang = "md";

      markdownBlocks.push(
        `**\`${filename}\`**\n\n\`\`\`${lang}\n${code}\n\`\`\``
      );
    }

    // If no files found, fallback: treat the whole thing as a single code block
    if (markdownBlocks.length === 0) {
      return `\`\`\`text\n${cleaned.trim()}\n\`\`\``;
    }

    return markdownBlocks.join("\n\n");
  }

  const [selectedFile, setSelectedFile] = useState(messages.map(m => ({ path: m.id, content: m.content })).find(f => f.content.startsWith('```')) || null);
  const [copiedFile, setCopiedFile] = useState(null);

  const handleCopy = (file) => {
    navigator.clipboard.writeText(file.content);
    setCopiedFile(file.path);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  // Example deploy handlers (replace with your backend logic)
  const handleDeployGithub = async () => {
    // Call your backend to deploy to GitHub, then update githubRepo
    alert("Deploy to GitHub (implement backend call)");
  };
  const handleDeployNetlify = async () => {
    // Call your backend to deploy to Netlify, then update netlifyUrl
    alert("Deploy to Netlify (implement backend call)");
  };

  // Find the latest code message
  const latestCodeMessage = [...messages].reverse().find(m => m.type === "code");
  const files = latestCodeMessage ? parseCodeOutput(latestCodeMessage.content) : [];

  const filesWithContent = files.map(f => ({ ...f, content: f.code }));
  const project = {
    name: "My Project",
    description: "Generated by AI",
    files: filesWithContent
  };

  useEffect(() => {
    if (filesWithContent.length > 0 && !selectedFile) {
      setSelectedFile(filesWithContent[0]);
    }
  }, [filesWithContent]);

  const activeAgents = currentWorkflow.filter(s => s.status === 'in-progress').length;
  const completedTasks = currentWorkflow.filter(s => s.status === 'completed').length;
  const totalAgents = currentWorkflow.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤖 Multi-Agent Development Platform
          </h1>
          <p className="text-gray-600">
            AI agents working together to build your software from idea to deployment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chat">💬 Chat</TabsTrigger>
                <TabsTrigger value="workflow">⚡ Workflow</TabsTrigger>
                <TabsTrigger value="agents">👥 Team</TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-4">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader>
                    <CardTitle>Development Chat</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div 
                      ref={chatContainerRef}
                      className="flex-1 overflow-y-auto pr-4 mb-4"
                      style={{ maxHeight: '450px' }}
                    >
                      {messages
                        .filter(m => m.type !== "code")
                        .map((message) => (
                          <ChatMessage key={message.id} message={message} />
                        ))}
                      {showFeedback && !isLoading && stepOrder[currentStep] === "prompt" && (
                        <Card className="mt-4 p-4">
                          <h4 className="font-bold mb-2">Is this output satisfactory?</h4>
                          <Textarea
                            value={userFeedback}
                            onChange={(e) => setUserFeedback(e.target.value)}
                            placeholder="If you want changes, describe what needs to be modified..."
                            className="mb-4"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={handleRefine}
                              disabled={!userFeedback}
                              variant="outline"
                            >
                              Request Changes
                            </Button>
                            <Button onClick={handleApprove}>
                              Approve & Continue
                            </Button>
                          </div>
                        </Card>
                      )}
                      {showFeedback && !isLoading && stepOrder[currentStep] !== "prompt" && stepOrder[currentStep] !== "deployment" && (
                        <div className="flex justify-end mt-4">
                          <Button onClick={handleApprove}>
                            Approve & Continue
                          </Button>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    <ChatInput 
                      onSendMessage={handleSendMessage}
                      isLoading={isLoading}
                      placeholder="Describe what you want to build..."
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="workflow" className="mt-4">
                <div className="space-y-4">
                  {currentWorkflow.length > 0 && (
                    <AgentWorkflow 
                      steps={currentWorkflow}
                      currentStep={currentStep}
                      progress={workflowProgress}
                    />
                  )}
                  <Card className="p-6">
                    <div className="text-center text-gray-500">
                      {currentWorkflow.length === 0 ? (
                        <>
                          <h3 className="text-lg font-semibold mb-2">No Active Workflow</h3>
                          <p>Start a conversation in the chat to see the development workflow in action!</p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-semibold mb-2">Development In Progress</h3>
                          <p>Our AI agents are working hard to build your project!</p>
                        </>
                      )}
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="agents" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Agent Status */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🚀 Quick Start</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Try these examples:</h4>
                  <div className="space-y-2">
                    {[
                      "Build a todo app with authentication",
                      "Create a dashboard with charts",
                      "Make a blog with comments system",
                      "Build an e-commerce product page"
                    ].map((example, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start h-auto p-2 text-xs"
                        onClick={() => handleSendMessage(example)}
                        disabled={isLoading}
                      >
                        {example}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-sm mb-2">🎯 Current Status</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Active Agents:</span>
                      <span className="font-mono">
                        {activeAgents}/{totalAgents}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed Tasks:</span>
                      <span className="font-mono">
                        {completedTasks}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* New Project View */}
        <div className="mt-8">
          <Card className="shadow-lg border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Project View</h2>
              <ProjectActions project={project} />
            </div>
            <div className="flex h-[480px] bg-gray-50 rounded-b-xl">
              {/* Sidebar */}
              <div className="w-80 border-r border-gray-200 bg-white/80 rounded-bl-xl h-full overflow-y-auto">
                <FileExplorer
                  files={filesWithContent}
                  selectedFile={selectedFile}
                  onFileSelect={setSelectedFile}
                />
              </div>
              {/* Code Preview */}
              <div className="flex-1 flex flex-col h-full overflow-y-auto">
                <div className="flex-1 h-full overflow-y-auto">
                  <CodePreview
                    file={selectedFile}
                    onCopy={() => handleCopy(selectedFile)}
                    copied={copiedFile === selectedFile?.path}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
