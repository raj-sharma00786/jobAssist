import { join } from "node:path";
import { pathToFileURL } from "node:url";

export async function extractPdfText(fileBuffer: Buffer) {
  try {
    const { PDFParse } = await import("pdf-parse");
    const workerUrl = pathToFileURL(
      join(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.mjs")
    ).href;

    PDFParse.setWorker(workerUrl);

    const parser = new PDFParse({ data: fileBuffer });

    try {
      const result = await parser.getText();
      return normalizeExtractedText(result.text);
    } finally {
      await parser.destroy();
    }
  } catch (error) {
    const fallbackText = extractTextWithoutWorker(fileBuffer);

    if (fallbackText.length >= 80) {
      return fallbackText;
    }

    throw error;
  }
}

function normalizeExtractedText(text: string) {
  return text
    .replace(/\\([()\\])/g, "$1")
    .replace(/\s+\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function decodePdfString(value: string) {
  try {
    return decodeURIComponent(value.replace(/\\([0-7]{3})/g, (_match, octal) => {
      return `%${Number.parseInt(octal, 8).toString(16).padStart(2, "0")}`;
    }));
  } catch {
    return value;
  }
}

function extractTextWithoutWorker(fileBuffer: Buffer) {
  const raw = fileBuffer.toString("latin1");
  const pieces: string[] = [];
  const textObjectPattern = /BT([\s\S]*?)ET/g;
  let textObjectMatch: RegExpExecArray | null;

  while ((textObjectMatch = textObjectPattern.exec(raw))) {
    const textObject = textObjectMatch[1];
    const stringPattern = /\((?:\\.|[^\\)])*\)\s*(?:Tj|'|"|\])/g;
    let stringMatch: RegExpExecArray | null;

    while ((stringMatch = stringPattern.exec(textObject))) {
      const token = stringMatch[0];
      const literalPattern = /\((?:\\.|[^\\)])*\)/g;
      let literalMatch: RegExpExecArray | null;

      while ((literalMatch = literalPattern.exec(token))) {
        pieces.push(decodePdfString(literalMatch[0].slice(1, -1)));
      }
    }
  }

  if (pieces.length === 0) {
    const broadLiteralPattern = /\((?:\\.|[^\\)]){3,}\)/g;
    let broadMatch: RegExpExecArray | null;

    while ((broadMatch = broadLiteralPattern.exec(raw))) {
      pieces.push(decodePdfString(broadMatch[0].slice(1, -1)));
    }
  }

  return normalizeExtractedText(pieces.join(" "));
}
