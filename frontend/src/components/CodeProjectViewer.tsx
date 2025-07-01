// import React, { useState } from "react";
// import { extractTreePaths, extractFiles } from "../lib/parseCodeWithTree";
// import { downloadProjectZip } from "../lib/downloadZip";
// import { Button } from "./ui/button";

// const CodeProjectViewer = ({ rawCode }: { rawCode: string }) => {
//   const filePaths = extractTreePaths(rawCode);
//   const files = extractFiles(rawCode);

//   // Only show files that exist in both the tree and code blocks
//   const validFiles = filePaths.filter(path => files[path]);
//   const [selected, setSelected] = useState(validFiles[0] || "");

//   // Prepare files for download
//   const filesForDownload = validFiles.map(path => ({
//     path,
//     code: files[path]
//   }));

//   return (
//     <div className="flex">
//       {/* File List */}
//       <div className="w-64 border-r pr-2">
//         <ul>
//           {validFiles.map(path => (
//             <li
//               key={path}
//               className={`cursor-pointer p-2 ${selected === path ? "bg-gray-200" : ""}`}
//               onClick={() => setSelected(path)}
//             >
//               {path}
//             </li>
//           ))}
//         </ul>
//         <Button
//           className="mt-4"
//           onClick={() => downloadProjectZip(filesForDownload)}
//         >
//           Download Project
//         </Button>
//       </div>
//       {/* Code Display */}
//       <div className="flex-1 p-4">
//         {selected ? (
//           <pre style={{ whiteSpace: "pre-wrap" }}>{files[selected]}</pre>
//         ) : (
//           <div>Select a file to view its code.</div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CodeProjectViewer;
