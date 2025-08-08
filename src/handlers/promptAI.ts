import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface TxInfo {
  txId: string;
  input: string;
  errorMessage: string;
  status: string;
  gasUsed: number;
  contractId: string;
}

export async function promptAIExplanation(info: TxInfo) {
  const prompt =
    `Explain what happened in this Hedera smart contract transaction in simple terms:\n\n` +
    `Transaction ID: ${info.txId}\n` +
    `Contract: ${info.contractId}\n` +
    `Status: ${info.status}\n` +
    `Gas Used: ${info.gasUsed}\n` +
    `Function Input: ${info.input}\n` +
    `Error (if any): ${info.errorMessage}\n`;

  // Choose a Gemini model (gemini-1.5-pro is best for reasoning)
  const model = genAI.getGenerativeModel({ model: 'gemma-3n-e2b-it' });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const summary = result.response.text() || "No response from AI";

  return {
    summary: summary.split("\n")[0], // first line
    fullText: summary,
  };
}
