import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TxInfo {
  txId: string;
  input: string;
  errorMessage: string;
  status: string;
  gasUsed: number;
  contractId: string;
}

export async function promptAIExplanation(info: TxInfo) {
  const prompt = `Explain what happened in this Hedera smart contract transaction in simple terms:\n\n`
    + `Transaction ID: ${info.txId}\n`
    + `Contract: ${info.contractId}\n`
    + `Status: ${info.status}\n`
    + `Gas Used: ${info.gasUsed}\n`
    + `Function Input: ${info.input}\n`
    + `Error (if any): ${info.errorMessage}\n`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a Hedera smart contract transaction debugger.' },
      { role: 'user', content: prompt }
    ]
  });

  const summary = response.choices[0].message?.content || 'No response from AI';

  return {
    summary: summary.split('\n')[0],
    fullText: summary,
  };
  
}