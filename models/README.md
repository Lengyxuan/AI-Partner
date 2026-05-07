# 本地模型存放目录

此目录用于存放本地运行的 LLM 模型文件。

## 支持的模型格式

- **GGUF** (推荐) - llama.cpp 格式，后缀为 `.gguf`
- **GGML** - 旧版 llama.cpp 格式，后缀为 `.bin`
- **ONNX** - ONNX Runtime 格式，后缀为 `.onnx`
- **SafeTensors** - HuggingFace 格式，后缀为 `.safetensors`

## 推荐模型

### 中文对话模型

1. **ChatGLM3-6B-GGUF**
   - 下载地址: https://huggingface.co/TheBloke/chatglm3-6b-GGUF
   - 推荐文件: `chatglm3-6b.Q4_K_M.gguf`

2. **Qwen2.5-7B-Instruct-GGUF**
   - 下载地址: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-GGUF
   - 推荐文件: `qwen2.5-7b-instruct-q4_k_m.gguf`

3. **Llama-2-7B-Chat-GGUF**
   - 下载地址: https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF
   - 推荐文件: `llama-2-7b-chat.Q4_K_M.gguf`

### 英文对话模型

1. **Mistral-7B-Instruct-v0.2-GGUF**
   - 下载地址: https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF
   - 推荐文件: `mistral-7b-instruct-v0.2.Q4_K_M.gguf`

## 文件命名规范

请将下载的模型文件重命名为易于识别的名称，例如:

```
models/
├── chatglm3-6b-q4.gguf
├── qwen2.5-7b-q4.gguf
└── llama2-7b-chat-q4.gguf
```

## 配置使用

在 `.env.local` 文件中设置默认模型:

```env
LOCAL_MODEL_PATH="./models"
DEFAULT_LOCAL_MODEL="chatglm3-6b-q4.gguf"
```

## 量化级别说明

GGUF 模型通常有多种量化级别，文件后缀含义如下:

- `Q4_K_M` - 4-bit 量化，推荐平衡点（文件大小和质量的平衡）
- `Q5_K_M` - 5-bit 量化，质量更好但文件更大
- `Q6_K` - 6-bit 量化，接近原始质量
- `Q8_0` - 8-bit 量化，几乎无损但文件很大

**建议**: 对于 7B 参数模型，使用 Q4_K_M 量化，约需 4-5GB 内存。

## 注意事项

1. 模型文件较大（数 GB），请确保有足够的磁盘空间
2. 运行模型需要足够的内存/显存
3. 模型文件不会被提交到 Git（已在 .gitignore 中排除）
4. 请遵守各模型的使用许可协议
