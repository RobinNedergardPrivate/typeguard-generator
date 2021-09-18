import * as vscode from "vscode"

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand("extension.generateTypeguard", function () {
		// Get the active text editor
		const editor = vscode.window.activeTextEditor
		//const interfaces:
		// if (editor) {
		const document = editor.document
		// const selection = editor.selection
		for (let row = 0; row < document.lineCount; row++) {
			const line = document.lineAt(row) // document.getText()
			const lineText = line.text
			console.log(`Row ${row}: `, lineText)
			const matches = lineText.match(/abc/g) ///a(?R)?z/g)
			if (matches) {
				for (const match of matches) {
					editor.edit(editBuilder => {
						//	editBuilder.replace(line.range, "cba")
						editBuilder.replace(
							new vscode.Range(
								new vscode.Position(row, lineText.indexOf(match)),
								new vscode.Position(row, lineText.indexOf(match) + match.length)
							),
							"cba"
						)
						//editBuilder.insert(new vscode.Position(0, 0), "hi")
					})
				}
			}
		}
		// Get the word within the selection
		//	const word = document.getText(selection);
		//const reversed = word.split('').reverse().join('');
		//editor.edit(editBuilder => {
		//editBuilder.replace(selection, reversed);
		//});
	})

	context.subscriptions.push(disposable)
}
