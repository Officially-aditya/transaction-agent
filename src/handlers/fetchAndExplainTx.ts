import fetch from 'node-fetch';
import { promptAIExplanation } from './promptAI';

const MIRROR_NODE_URL = "https://testnet.mirrornode.hedera.com/api/v1";

export async function fetchAndExplainTx(contractId: string) {
  if (!/^\d+\.\d+\.\d+$/.test(contractId)) {
    throw new Error('Invalid contract ID format. Expected something like 0.0.12345');
  }

  console.log(`Fetching latest execution for contractId: ${contractId}`);

  const res = await fetch(
    `${MIRROR_NODE_URL}/contracts/${encodeURIComponent(contractId)}/results?order=desc&limit=1`
  );
  const data = await res.json();

  if (!data.results || data.results.length === 0) {
    throw new Error('No recent contract executions found for this contractId');
  }

  const latest = data.results[0];

  const explanation = await promptAIExplanation({
    txId: latest.transaction_id || 'Unknown',
    input: latest.function_parameters || 'N/A',
    errorMessage: latest.error_message || 'None',
    status: latest.result || 'Unknown',
    gasUsed: latest.gas_used || 0,
    contractId: latest.contract_id || contractId,
  });

  return {
    summary: explanation.summary,
    fullText: explanation.fullText,
  };
}
