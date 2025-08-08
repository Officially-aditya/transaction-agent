import * as vscode from 'vscode';
import { fetchAndExplainTx } from './handlers/fetchAndExplainTx';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('tx-detective.explain', async () => {
    const txId = await vscode.window.showInputBox({
      prompt: 'Enter Hedera Transaction ID (e.g. 0.0.1234@1690000000.000000000)',
    });

    if (txId) {
      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Decoding transaction: ${txId}`,
        cancellable: false
      }, async () => {
        try {
          const result = await fetchAndExplainTx(txId);
          vscode.window.showInformationMessage(result.summary || 'Check output log for details');
          const output = vscode.window.createOutputChannel('Hedera Tx Debugger');
          output.appendLine(result.fullText);
          output.show();
        } catch (err) {
          vscode.window.showErrorMessage(`Error decoding transaction: ${err}`);
        }
      });
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}