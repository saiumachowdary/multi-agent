export interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
  code?: string;
}

// Parse the ```tree ...``` block
export function parseTreeBlock(raw: string): string[] {
  const treeBlockMatch = raw.match(/```tree\s*([\s\S]*?)```/);
  if (!treeBlockMatch) return [];
  // Remove any \r and split by \n, trim each line
  return treeBlockMatch[1].replace(/\r/g, '').split('\n').map(line => line.trim()).filter(Boolean);
}

// Parse code blocks with filename comments
export function parseFiles(raw: string): { [path: string]: string } {
  const fileRegex = /(?:^|\n)(\/\/|#)\s*([^\n]+)\n([\s\S]*?)(?=(?:\n\/\/|\n#|$))/g;
  let match;
  let files: { [path: string]: string } = {};
  while ((match = fileRegex.exec(raw)) !== null) {
    const path = match[2].trim().replace(/\\/g, '/'); // normalize slashes
    const code = match[3].trim();
    files[path] = code;
  }
  return files;
}

// Build a nested tree from the flat file list
export function buildFileTree(treeLines: string[], files: { [path: string]: string }): FileNode[] {
  const root: FileNode[] = [];
  const stack: { node: FileNode; indent: number }[] = [];

  treeLines.forEach(line => {
    // Count indent (number of leading spaces or tree chars)
    const indent = line.search(/\S/);
    const name = line.replace(/^[\s├─└│]+/, '').replace(/\\n/g, '').trim();
    if (!name) return;
    // Build path from stack
    const parentPath = stack.length ? stack[stack.length - 1].node.path : '';
    const path = parentPath ? `${parentPath}/${name}` : name;
    // Is this a file? (match any file in files dict that ends with this name)
    const filePath = Object.keys(files).find(f => f.endsWith(name));
    const isFile = !!filePath;
    const node: FileNode = {
      name,
      path: isFile ? filePath! : path,
      type: isFile ? "file" : "folder",
      code: isFile ? files[filePath!] : undefined,
      children: [],
    };

    while (stack.length && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    if (stack.length === 0) {
      root.push(node);
    } else {
      stack[stack.length - 1].node.children!.push(node);
    }
    stack.push({ node, indent });
  });

  return root;
}

export function extractTreePaths(raw: string): string[] {
  const match = raw.match(/```tree\s*([\s\S]*?)```/);
  if (!match) return [];
  // Remove any \r, split by \n, trim, and filter out empty lines and folders
  return match[1]
    .replace(/\r/g, '')
    .split('\n')
    .map(line => line.replace(/^[\s├─└│]+/, '').replace(/\\n/g, '').trim())
    .filter(line => !!line && !line.endsWith('/'));
}

export function extractFiles(raw: string): { [path: string]: string } {
  const fileRegex = /(?:^|\n)(\/\/|#)\s*([^\n]+)\n([\s\S]*?)(?=(?:\n\/\/|\n#|$))/g;
  let match;
  let files: { [path: string]: string } = {};
  while ((match = fileRegex.exec(raw)) !== null) {
    const path = match[2].trim().replace(/\\/g, '/');
    const code = match[3].trim();
    files[path] = code;
  }
  return files;
}
