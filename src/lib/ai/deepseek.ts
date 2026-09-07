import OpenAI from "openai";

let client: OpenAI | null = null;

function getDeepSeekClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.error("DEEPSEEK_API_KEY missing in getDeepSeekClient", {
        hasKey: false,
        keyLength: 0,
        vercelEnv: process.env.VERCEL_ENV,
      });
      throw new Error("Falta DEEPSEEK_API_KEY en las variables de entorno.");
    }
    client = new OpenAI({
      apiKey,
      baseURL: "https://api.deepseek.com",
    });
  }
  return client;
}

// DeepSeek es compatible con la API de OpenAI.
// Modelos válidos: deepseek-v4-pro, deepseek-v4-flash, deepseek-v4-flash-vision-exp
// Usamos deepseek-v4-flash (rápido y económico) por defecto.
export const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL?.trim() || "deepseek-v4-flash";

/**
 * Llama a DeepSeek forzando que responda invocando una única tool
 * (function calling), y devuelve los argumentos ya parseados como
 * objeto JS.
 *
 * Se usa tool-use en vez de pedir "responde en JSON" en texto libre
 * porque es mucho más confiable: el modelo no puede devolver texto
 * explicativo antes/después ni un JSON mal formado.
 */
export async function callDeepSeekTool<T = unknown>(params: {
  system: string;
  prompt: string;
  toolName: string;
  toolDescription: string;
  inputSchema: Record<string, unknown>;
  maxTokens?: number;
}): Promise<T> {
  const deepseek = getDeepSeekClient();

  const response = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODEL,
    max_tokens: params.maxTokens ?? 4096,
    messages: [
      { role: "system", content: params.system },
      { role: "user", content: params.prompt },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: params.toolName,
          description: params.toolDescription,
          parameters: params.inputSchema,
        },
      },
    ],
    tool_choice: {
      type: "function",
      function: { name: params.toolName },
    },
    // DeepSeek v4 models enable thinking mode by default, which rejects tool_choice.
    // Disable thinking to allow forced tool calling.
    thinking: { type: "disabled" },
  } as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming);

  const toolCall = response.choices[0]?.message?.tool_calls?.[0];

  if (!toolCall || toolCall.type !== "function") {
    throw new Error(
      `DeepSeek no devolvió una invocación de la tool "${params.toolName}".`
    );
  }

  try {
    return JSON.parse(toolCall.function.arguments) as T;
  } catch {
    throw new Error(
      `DeepSeek devolvió argumentos que no son JSON válido para "${params.toolName}".`
    );
  }
}
