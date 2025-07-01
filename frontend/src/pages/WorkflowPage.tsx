import React, { useState } from "react";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";

interface Step {
  key: string;
  label: string;
  inputType: "prompt" | "code";
  description: string;
}

const steps: Step[] = [
  {
    key: "prompt",
    label: "Prompt Engineering",
    inputType: "prompt",
    description: "Creating detailed specifications"
  },
  {
    key: "coder",
    label: "Code Generation",
    inputType: "prompt",
    description: "Generating working code"
  },
  {
    key: "reviewer",
    label: "Code Review",
    inputType: "code",
    description: "Reviewing and improving code"
  },
  {
    key: "qa",
    label: "Quality Assurance",
    inputType: "code",
    description: "Testing and validation"
  },
  {
    key: "deployment",
    label: "Deployment Prep",
    inputType: "code",
    description: "Preparing for deployment"
  }
];

interface HistoryItem {
  step: string;
  input: any;
  output: string;
}

export default function WorkflowPage() {
  const [stepIdx, setStepIdx] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userFeedback, setUserFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "/api/run-step",
        {
          step: "prompt",
          input_data: { prompt: input }
        },
        getAuthHeaders()
      );
      setResult(res.data.result);
      setHistory([{ step: "prompt", input, output: res.data.result }]);
      setShowFeedback(true);
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    setShowFeedback(false);
    setUserFeedback("");
    await handleNext();
  };

  const handleRefine = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "/api/run-step",
        {
          step: "prompt",
          input_data: { prompt: input },
          user_feedback: userFeedback
        },
        getAuthHeaders()
      );
      setResult(res.data.result);
      setHistory([{ step: "prompt", input, output: res.data.result }]);
      setUserFeedback("");
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  const handleNext = async () => {
    setLoading(true);
    const nextStep = steps[stepIdx + 1];
    if (!nextStep) return;

    try {
      const input_data = nextStep.inputType === "prompt" 
        ? { prompt: result }
        : { code: result };

      const res = await axios.post(
        "/api/run-step",
        {
          step: nextStep.key,
          input_data
        },
        getAuthHeaders()
      );
      
      setResult(res.data.result);
      setStepIdx(stepIdx + 1);
      setHistory([...history, { 
        step: nextStep.key, 
        input: input_data, 
        output: res.data.result 
      }]);
      
      if (stepIdx + 1 < steps.length - 1) {
        setShowFeedback(true);
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">AI Development Workflow</h1>
      
      {/* Progress indicator */}
      <div className="mb-8">
        {steps.map((step, idx) => (
          <div
            key={step.key}
            className={`inline-block mr-2 px-3 py-1 rounded ${
              idx === stepIdx
                ? "bg-blue-500 text-white"
                : idx < stepIdx
                ? "bg-green-200"
                : "bg-gray-200"
            }`}
          >
            {step.label}
          </div>
        ))}
      </div>

      {/* Input section */}
      {stepIdx === 0 && (
        <Card className="p-4 mb-6">
          <h2 className="text-xl mb-4">What would you like to build?</h2>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your project in detail..."
            className="mb-4"
            rows={4}
          />
          <Button 
            onClick={handleStart}
            disabled={loading || !input}
          >
            {loading ? "Processing..." : "Start Prompt Engineering"}
          </Button>
        </Card>
      )}

      {/* Result section */}
      {result && (
        <Card className="p-4 mb-6">
          <h3 className="text-xl mb-4">{steps[stepIdx].label} Output:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
            {result}
          </pre>
          
          {/* Feedback section */}
          {showFeedback && stepIdx < steps.length - 1 && (
            <div className="mt-4 p-4 border rounded">
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
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? "Processing..." : "Refine"}
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={loading}
                >
                  Approve & Continue
                </Button>
              </div>
            </div>
          )}
          
          {/* Final step - no feedback needed */}
          {stepIdx === steps.length - 1 && (
            <div className="mt-4">
              <p className="text-green-600 font-bold">✅ Workflow completed!</p>
            </div>
          )}
        </Card>
      )}

      {/* History section */}
      <div className="mt-8">
        <h3 className="text-xl mb-4">Progress History</h3>
        {history.map((h, i) => (
          <Card key={i} className="p-4 mb-4">
            <h4 className="font-bold">
              {steps.find(s => s.key === h.step)?.label}
            </h4>
            <pre className="bg-gray-100 p-2 rounded mt-2 text-sm overflow-auto max-h-32">
              {h.output}
            </pre>
          </Card>
        ))}
      </div>
    </div>
  );
}
