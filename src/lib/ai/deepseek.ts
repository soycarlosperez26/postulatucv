import OpenAI from "openai";

let client: OpenAI | null = null;

function getDeepSeekClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("Falta DEEPSEEK_API_KEY en las variables de entorno.");
    }
    client = new OpenAI({
      apiKey,
      baseURL: "https://api.deepseek.com",
    });
  }
  return client;
}

// DeepSeek es compatible con la API de OpenAI. "deepseek-chat" (DeepSeek-V3)
// es el modelo con soporte de function calling; configurable por env var.
export const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

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
  });

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
