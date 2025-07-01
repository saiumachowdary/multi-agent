import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function downloadProjectZip(
  files: { path: string; code: string }[],
  zipName = "project.zip"
) {
  const zip = new JSZip();
  files.forEach(file => {
    zip.file(file.path, file.code);
  });
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, zipName);
}
