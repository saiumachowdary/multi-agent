export interface ParsedFile {
  path: string;
  code: string;
  type: string;
}

export function parseCodeOutput(raw: string): ParsedFile[] {
  // Remove tree block if present
  raw = raw.replace(/```tree[\s\S]*?```/g, "");
  // Match code blocks with filename comments
  const fileRegex = /(?:^|\n)(\/\/|#)\s*([^\n]+)\n([\s\S]*?)(?=(?:\n\/\/|\n#|$))/g;
  let match;
  let files: ParsedFile[] = [];
  while ((match = fileRegex.exec(raw)) !== null) {
    const path = match[2].trim();
    const content = match[3].trim();
    // Guess type from path
    let type = "string";
    if (path.includes("component") || path.includes("Component")) type = "component";
    else if (path.endsWith(".json") || path.endsWith(".config")) type = "config";
    else if (path.endsWith(".js") || path.endsWith(".ts") || path.endsWith(".jsx") || path.endsWith(".tsx")) type = "code";
    files.push({ path, code: content, type });
  }
  return files;
}
