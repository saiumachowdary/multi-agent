// import React from "react";

// // Utility to extract the code structure tree and all code blocks
// function extractTreeAndCode(raw: string) {
//   // Extract the tree block
//   const treeMatch = raw.match(/```tree\s*([\s\S]*?)```/i);
//   const tree = treeMatch ? treeMatch[1].trim() : "";

//   // Extract all code blocks with filename comments
//   // Matches: ```js\n// path/to/file.js\n<code>\n```
//   const codeBlockRegex = /```[a-zA-Z]*\s*\/\/\s*([^\n]+)\n([\s\S]*?)```/g;
//   let match;
//   let files: { path: string; code: string }[] = [];
//   while ((match = codeBlockRegex.exec(raw)) !== null) {
//     const path = match[1].trim();
//     const code = match[2].trim();
//     files.push({ path, code });
//   }

//   // Fallback: also extract code blocks without filename comments
//   if (files.length === 0) {
//     const fallbackCodeBlockRegex = /```[a-zA-Z]*\s*([\s\S]*?)```/g;
//     while ((match = fallbackCodeBlockRegex.exec(raw)) !== null) {
//       files.push({ path: "Unknown file", code: match[1].trim() });
//     }
//   }

//   return { tree, files };
// }

// const SimpleCodeView = ({ rawCode }: { rawCode: string }) => {
//   const { tree, files } = extractTreeAndCode(rawCode);

//   return (
//     <div>
//       {tree && (
//         <pre style={{ background: "#f5f5f5", padding: "1em", borderRadius: 4 }}>
//           {tree}
//         </pre>
//       )}
//       {files.length === 0 && (
//         <div style={{ color: "red", margin: "1em 0" }}>
//           No code files found. The code may not be in the required format.
//         </div>
//       )}
//       {files.map((file, idx) => (
//         <div key={file.path + idx} style={{ marginBottom: "2em" }}>
//           <div style={{ fontWeight: "bold", marginBottom: 4 }}>{file.path}</div>
//           <pre style={{ background: "#222", color: "#fff", padding: "1em", borderRadius: 4, overflowX: "auto" }}>
//             {file.code}
//           </pre>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default SimpleCodeView;

