// // import React from "react";
// // import ReactMarkdown from "react-markdown";
// // import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// // import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
// // import { Components } from "react-markdown";

// // interface CodeDisplayProps {
// //   code: string;
// // }

// // const CodeDisplay: React.FC<CodeDisplayProps> = ({ code }) => {
// //   const components: Components = {
// //     code({ node, inline, className, children, ...props }: any) {
// //       const match = /language-(\w+)/.exec(className || "");
// //       return !inline && match ? (
// //         <SyntaxHighlighter
// //           style={vscDarkPlus}
// //           language={match[1]}
// //           PreTag="div"
// //         >
// //           {String(children).replace(/\n$/, "")}
// //         </SyntaxHighlighter>
// //       ) : (
// //         <code className={className} {...props}>
// //           {children}
// //         </code>
// //       );
// //     },
// //   };

// //   return (
// //     <div className="prose max-w-none">
// //       <ReactMarkdown children={code} components={components} />
// //     </div>
// //   );
// // };

// // export default CodeDisplay;



// import React, { useState } from "react";
// import ReactMarkdown from "react-markdown";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
// import { Components } from "react-markdown";
// import { Copy, Check, Code2, Sun, Moon } from "lucide-react";
// import { Button } from "../components/ui/button";
// import { Card, CardContent, CardHeader } from "../components/ui/card";
// import { Badge } from "../components/ui/badge";
// import { cn } from "../lib/utils";

// interface CodeDisplayProps {
//   code: string;
//   title?: string;
//   showLineNumbers?: boolean;
//   className?: string;
// }

// const CodeDisplay: React.FC<CodeDisplayProps> = ({ 
//   code, 
//   title = "Code", 
//   showLineNumbers = true,
//   className 
// }) => {
//   const [copied, setCopied] = useState(false);
//   const [isDarkTheme, setIsDarkTheme] = useState(true);

//   const handleCopy = async (textToCopy: string) => {
//     try {
//       await navigator.clipboard.writeText(textToCopy);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     } catch (err) {
//       console.error('Failed to copy code:', err);
//     }
//   };

//   const toggleTheme = () => {
//     setIsDarkTheme(!isDarkTheme);
//   };

//   const components: Components = {
//     code({ node, inline, className, children, ...props }: any) {
//       const match = /language-(\w+)/.exec(className || "");
//       const language = match?.[1] || "text";
//       const codeText = String(children).replace(/\n$/, "");
      
//       return !inline ? (
//         <div className="relative group my-4">
//           <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-lg border-b border-gray-700">
//             <div className="flex items-center gap-2">
//               <Code2 className="w-4 h-4 text-gray-300" />
//               <Badge variant="secondary" className="text-xs font-mono">
//                 {language.toUpperCase()}
//               </Badge>
//             </div>
//             <div className="flex items-center gap-2">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={toggleTheme}
//                 className="h-8 w-8 p-0 hover:bg-gray-700"
//               >
//                 {isDarkTheme ? (
//                   <Sun className="w-4 h-4 text-gray-300" />
//                 ) : (
//                   <Moon className="w-4 h-4 text-gray-300" />
//                 )}
//               </Button>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => handleCopy(codeText)}
//                 className="h-8 w-8 p-0 hover:bg-gray-700"
//               >
//                 {copied ? (
//                   <Check className="w-4 h-4 text-green-400" />
//                 ) : (
//                   <Copy className="w-4 h-4 text-gray-300" />
//                 )}
//               </Button>
//             </div>
//           </div>
//           <SyntaxHighlighter
//             style={isDarkTheme ? vscDarkPlus : vs}
//             language={language}
//             PreTag="div"
//             showLineNumbers={showLineNumbers}
//             wrapLines={true}
//             customStyle={{
//               margin: 0,
//               padding: "1rem",
//               borderRadius: "0 0 0.5rem 0.5rem",
//               fontSize: "14px",
//               lineHeight: "1.5",
//             }}
//             lineNumberStyle={{
//               minWidth: "3em",
//               paddingRight: "1em",
//               color: isDarkTheme ? "#6b7280" : "#9ca3af",
//               borderRight: `1px solid ${isDarkTheme ? "#374151" : "#e5e7eb"}`,
//             }}
//           >
//             {codeText}
//           </SyntaxHighlighter>
//         </div>
//       ) : (
//         <code 
//           className={cn(
//             "bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono",
//             "border border-gray-200 dark:border-gray-700",
//             className
//           )} 
//           {...props}
//         >
//           {children}
//         </code>
//       );
//     },
//     h1: ({ children }) => (
//       <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
//         {children}
//       </h1>
//     ),
//     h2: ({ children }) => (
//       <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">
//         {children}
//       </h2>
//     ),
//     h3: ({ children }) => (
//       <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">
//         {children}
//       </h3>
//     ),
//     p: ({ children }) => (
//       <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
//         {children}
//       </p>
//     ),
//     ul: ({ children }) => (
//       <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-1">
//         {children}
//       </ul>
//     ),
//     ol: ({ children }) => (
//       <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-1">
//         {children}
//       </ol>
//     ),
//     blockquote: ({ children }) => (
//       <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 mb-4 bg-blue-50 dark:bg-blue-950/20 py-2 rounded-r">
//         {children}
//       </blockquote>
//     ),
//   };

//   return (
//     <Card className={cn("w-full shadow-lg", className)}>
//       <CardHeader className="pb-3">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <Code2 className="w-5 h-5 text-primary" />
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//               {title}
//             </h3>
//           </div>
//           <Badge variant="outline" className="text-xs">
//             Generated Code
//           </Badge>
//         </div>
//       </CardHeader>
//       <CardContent className="p-0">
//         <div className="prose prose-sm max-w-none dark:prose-invert p-6">
//           <ReactMarkdown components={components}>
//             {code}
//           </ReactMarkdown>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default CodeDisplay;