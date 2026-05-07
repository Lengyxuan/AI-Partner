import { OpenAI } from 'openai';
import { LlamaModel, LlamaContext, LlamaChatSession } from 'node-llama-cpp';
import { join } from 'path';

export type LLMType = 'cloud' | 'local';

interface LLMConfig {
  type: LLMType;
  modelName?: string;
  apiKey?: string;
}

export class LLMClient {
  private config: LLMConfig;
  private openai: OpenAI | null = null;
  private llamaModel: LlamaModel | null = null;
  private llamaContext: LlamaContext | null = null;

  constructor(type?: LLMType, modelName?: string) {
    this.config = {
      type: type || 'cloud',
      modelName: modelName || process.env.DEFAULT_LOCAL_MODEL,
    };

    if (this.config.type === 'cloud') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async chatStream(message: string, systemPrompt: string): Promise<ReadableStream> {
    if (this.config.type === 'cloud') {
      return this.cloudChatStream(message, systemPrompt);
    } else {
      return this.localChatStream(message, systemPrompt);
    }
  }

  private async cloudChatStream(message: string, systemPrompt: string): Promise<ReadableStream> {
    if (!this.openai) {
      throw new Error('OpenAI 客户端未初始化');
    }

    const stream = await this.openai.chat.completions.create({
      model: this.config.modelName || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      stream: true,
    });

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const data = JSON.stringify(chunk);
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
          }
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  }

  private async localChatStream(message: string, systemPrompt: string): Promise<ReadableStream> {
    if (!this.llamaModel) {
      const modelPath = join(
        process.cwd(),
        process.env.LOCAL_MODEL_PATH || './models',
        this.config.modelName || 'llama-2-7b-chat.gguf'
      );

      this.llamaModel = new LlamaModel({
        modelPath,
      });
      this.llamaContext = new LlamaContext({ model: this.llamaModel });
    }

    const session = new LlamaChatSession({
      context: this.llamaContext!,
      systemPrompt,
    });

    return new ReadableStream({
      async start(controller) {
        try {
          const response = await session.prompt(message, {
            onToken: (token) => {
              const chunk = {
                choices: [{
                  delta: { content: token },
                }],
              };
              const data = JSON.stringify(chunk);
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
            },
          });

          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  }

  async chat(message: string, systemPrompt: string): Promise<string> {
    if (this.config.type === 'cloud') {
      return this.cloudChat(message, systemPrompt);
    } else {
      return this.localChat(message, systemPrompt);
    }
  }

  private async cloudChat(message: string, systemPrompt: string): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI 客户端未初始化');
    }

    const response = await this.openai.chat.completions.create({
      model: this.config.modelName || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    });

    return response.choices[0]?.message?.content || '';
  }

  private async localChat(message: string, systemPrompt: string): Promise<string> {
    if (!this.llamaModel) {
      const modelPath = join(
        process.cwd(),
        process.env.LOCAL_MODEL_PATH || './models',
        this.config.modelName || 'llama-2-7b-chat.gguf'
      );

      this.llamaModel = new LlamaModel({
        modelPath,
      });
      this.llamaContext = new LlamaContext({ model: this.llamaModel });
    }

    const session = new LlamaChatSession({
      context: this.llamaContext!,
      systemPrompt,
    });

    return await session.prompt(message);
  }
}
