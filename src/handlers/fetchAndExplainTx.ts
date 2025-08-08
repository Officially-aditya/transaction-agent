import fetch from 'node-fetch';
import { promptAIExplanation } from './promptAI';

const MIRROR_NODE_URL = "https://testnet.mirrornode.hedera.com/api/v1";

export async function fetchAndExplainTx(txId: string) {
  const txUrl = `${MIRROR_NODE_URL}/transactions/${encodeURIComponent(txId)}`;
  const txRes = await fetch(txUrl);
  const txData = await txRes.json();
  const tx = txData.transactions?.[0];
  if (!tx) {
    throw new Error('Transaction not found');
  }

  const hashBase64 = tx.transaction_hash;
  const hashHex = Buffer.from(hashBase64, 'base64').toString('hex');
  const resultUrl = `${MIRROR_NODE_URL}/contracts/results/${hashHex}`;

  const resultRes = await fetch(resultUrl);
  const result = await resultRes.json();

  const input = result.function_parameters || 'N/A';
  const errorMessage = result.error_message || 'None';
  const status = result.result || tx.result;
  const gasUsed = result.gas_used;
  const contractId = result.contract_id || 'Unknown';

  const explanation = await promptAIExplanation({
    txId,
    input,
    errorMessage,
    status,
    gasUsed,
    contractId,
  });

  return {
    summary: explanation.summary,
    fullText: explanation.fullText,
  };
}