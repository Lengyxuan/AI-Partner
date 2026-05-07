import { readFile } from 'fs/promises';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export interface Document {
  content: string;
  metadata: {
    source: string;
    type: string;
    [key: string]: any;
  };
}

export class DocumentLoader {
  async load(filePath: string, fileType: string): Promise<Document[]> {
    switch (fileType) {
      case 'text/plain':
      case 'text/markdown':
        return this.loadText(filePath);
      case 'application/pdf':
        return this.loadPDF(filePath);
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return this.loadDocx(filePath);
      case 'text/csv':
        return this.loadCSV(filePath);
      case 'application/json':
        return this.loadJSON(filePath);
      default:
        // 尝试作为文本加载
        return this.loadText(filePath);
    }
  }

  private async loadText(filePath: string): Promise<Document[]> {
    const content = await readFile(filePath, 'utf-8');
    return [
      {
        content,
        metadata: {
          source: filePath,
          type: 'text',
        },
      },
    ];
  }

  private async loadPDF(filePath: string): Promise<Document[]> {
    const buffer = await readFile(filePath);
    const data = await pdfParse(buffer);
    return [
      {
        content: data.text,
        metadata: {
          source: filePath,
          type: 'pdf',
          pages: data.numpages,
          info: data.info,
        },
      },
    ];
  }

  private async loadDocx(filePath: string): Promise<Document[]> {
    const buffer = await readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return [
      {
        content: result.value,
        metadata: {
          source: filePath,
          type: 'docx',
        },
      },
    ];
  }

  private async loadCSV(filePath: string): Promise<Document[]> {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const headers = lines[0].split(',').map((h) => h.trim());

    const documents: Document[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',').map((v) => v.trim());
      const rowData: Record<string, string> = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index] || '';
      });

      documents.push({
        content: Object.entries(rowData)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n'),
        metadata: {
          source: filePath,
          type: 'csv',
          row: i,
        },
      });
    }

    return documents;
  }

  private async loadJSON(filePath: string): Promise<Document[]> {
    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    if (Array.isArray(data)) {
      return data.map((item, index) => ({
        content: typeof item === 'string' ? item : JSON.stringify(item, null, 2),
        metadata: {
          source: filePath,
          type: 'json',
          index,
        },
      }));
    }

    return [
      {
        content: JSON.stringify(data, null, 2),
        metadata: {
          source: filePath,
          type: 'json',
        },
      },
    ];
  }
}
