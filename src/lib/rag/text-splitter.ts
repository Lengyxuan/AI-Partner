import { Document } from './document-loader';

export interface TextSplitterOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  separators?: string[];
}

export interface TextChunk {
  content: string;
  metadata: {
    source: string;
    chunkIndex: number;
    [key: string]: any;
  };
}

export class TextSplitter {
  private chunkSize: number;
  private chunkOverlap: number;
  private separators: string[];

  constructor(options: TextSplitterOptions = {}) {
    this.chunkSize = options.chunkSize || 1000;
    this.chunkOverlap = options.chunkOverlap || 200;
    this.separators = options.separators || ['\n\n', '\n', '。', '！', '？', '.', '!', '?', ' ', ''];
  }

  async split(documents: Document[]): Promise<TextChunk[]> {
    const chunks: TextChunk[] = [];

    for (const doc of documents) {
      const docChunks = this.splitText(doc.content);
      docChunks.forEach((content, index) => {
        chunks.push({
          content,
          metadata: {
            ...doc.metadata,
            chunkIndex: index,
          },
        });
      });
    }

    return chunks;
  }

  private splitText(text: string): string[] {
    const chunks: string[] = [];
    let currentChunk = '';

    // 按段落分割
    const paragraphs = text.split(/\n\n+/);

    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) continue;

      // 如果段落本身超过 chunkSize，需要进一步分割
      if (paragraph.length > this.chunkSize) {
        // 先保存当前 chunk
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
          // 保留重叠部分
          currentChunk = this.getOverlap(currentChunk);
        }

        // 分割长段落
        const sentences = paragraph.split(/([。！？.!?]+)/);
        for (let i = 0; i < sentences.length; i += 2) {
          const sentence = sentences[i] + (sentences[i + 1] || '');

          if ((currentChunk + sentence).length > this.chunkSize) {
            if (currentChunk.trim()) {
              chunks.push(currentChunk.trim());
              currentChunk = this.getOverlap(currentChunk);
            }
          }

          currentChunk += sentence;
        }
      } else {
        // 检查加入当前段落后是否超过 chunkSize
        if ((currentChunk + '\n\n' + paragraph).length > this.chunkSize) {
          if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
            currentChunk = this.getOverlap(currentChunk);
          }
          currentChunk = paragraph;
        } else {
          currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        }
      }
    }

    // 保存最后一个 chunk
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  private getOverlap(text: string): string {
    if (text.length <= this.chunkOverlap) {
      return text;
    }
    return text.slice(-this.chunkOverlap);
  }
}
