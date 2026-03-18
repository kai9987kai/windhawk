import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import config from '../config';
import { ModSourceExtension } from '../webviewIPCMessages';

type DraftSourceInfo = {
	source: string;
	extension: ModSourceExtension;
};

export default class EditorWorkspaceUtils {
	private workspacePath: string;
	private extensionPath: string;

	public constructor(extensionPath: string) {
		const firstWorkspaceFolder = vscode.workspace.workspaceFolders?.[0];
		if (!firstWorkspaceFolder) {
			vscode.commands.executeCommand('workbench.action.files.openFolder');
			throw new Error('No workspace folder');
		}

		this.workspacePath = firstWorkspaceFolder.uri.fsPath;
		this.extensionPath = extensionPath;
	}

	public getFilePath(fileName: string) {
		return path.join(this.workspacePath, fileName);
	}

	public getWorkspaceFolder() {
		return this.workspacePath;
	}

	public getModSourcePath(extension?: ModSourceExtension) {
		const effectiveExtension = extension || this.getEditedModSourceExtension();
		return this.getFilePath(`mod${effectiveExtension}`);
	}

	public getDraftsPath() {
		return path.join(this.workspacePath, 'Drafts');
	}

	public getEditedModSourceExtension() {
		const vscodeConfig = vscode.workspace.getConfiguration();
		const sourceExtension = vscodeConfig.get('windhawk.editedModSourceExtension');
		return sourceExtension === '.wh.py' ? '.wh.py' : '.wh.cpp';
	}

	private initializeEditorSettings(extension: ModSourceExtension) {
		// Flags for clangd.
		const compileFlags = [
			'-x',
			'c++',
			'-std=c++23',
			'-target',
			'x86_64-w64-mingw32',
			'-DUNICODE',
			'-D_UNICODE',
			'-DWINVER=0x0A00',
			'-D_WIN32_WINNT=0x0A00',
			'-D_WIN32_IE=0x0A00',
			'-DNTDDI_VERSION=0x0A000008',
			'-D__USE_MINGW_ANSI_STDIO=0',
			'-DWH_MOD',
			'-DWH_EDITING',
			'-include',
			'windhawk_api.h',
			'-Wall',
			'-Wextra',
			'-Wno-unused-parameter',
			'-Wno-missing-field-initializers',
			'-Wno-cast-function-type-mismatch',
		];

		fs.writeFileSync(this.getFilePath('compile_flags.txt'), compileFlags.join('\n') + '\n');

		const clangFormatConfig = [
			'# To override, create a .clang-format.windhawk file with the desired settings.',
			'BasedOnStyle: Chromium',
			'IndentWidth: 4',
			'CommentPragmas: ^[ \\t]+@[a-zA-Z]+',
		];

		if (fs.existsSync(this.getFilePath('.clang-format.windhawk'))) {
			fs.copyFileSync(this.getFilePath('.clang-format.windhawk'), this.getFilePath('.clang-format'));
		} else {
			fs.writeFileSync(this.getFilePath('.clang-format'), clangFormatConfig.join('\n') + '\n');
		}

		if (!fs.existsSync(this.getFilePath('.git'))) {
			child_process.spawnSync('git', ['init'], { cwd: this.workspacePath, stdio: 'ignore' });
		}

		if (fs.existsSync(this.getFilePath('.git'))) {
			child_process.spawnSync('git', ['add', path.basename(this.getModSourcePath(extension))], {
				cwd: this.workspacePath,
				stdio: 'ignore',
			});
		}
	}

	private ensurePythonAuthoringRuntime() {
		const sourcePath = path.join(this.extensionPath, 'files', 'python', 'windhawk_py');
		const targetPath = this.getFilePath('windhawk_py');
		copyDirectoryRecursive(sourcePath, targetPath);
	}

	private clearPythonAuthoringRuntime() {
		try {
			fs.rmSync(this.getFilePath('windhawk_py'), { recursive: true, force: true });
		} catch (e) {
			if (e.code !== 'ENOENT') {
				throw e;
			}
		}
	}

	private clearInactiveWorkspaceSource(activeExtension: ModSourceExtension) {
		const inactiveExtension = activeExtension === '.wh.py' ? '.wh.cpp' : '.wh.py';
		const inactivePath = this.getModSourcePath(inactiveExtension);
		try {
			fs.unlinkSync(inactivePath);
		} catch (e) {
			if (e.code !== 'ENOENT') {
				throw e;
			}
		}
	}

	public initializeFromModSource(
		modSource: string,
		sourceExtension: ModSourceExtension,
		modSourceFromDrafts?: DraftSourceInfo | null
	) {
		const effectiveExtension = modSourceFromDrafts?.extension || sourceExtension;
		const effectiveSource = modSourceFromDrafts?.source || modSource;

		fs.writeFileSync(this.getModSourcePath(effectiveExtension), effectiveSource);
		this.clearInactiveWorkspaceSource(effectiveExtension);

		// Remove windhawk_api.h from older versions, it now resides in the
		// compiler include folder.
		try {
			fs.unlinkSync(this.getFilePath('windhawk_api.h'));
		} catch (e) {
			if (e.code !== 'ENOENT') {
				throw e;
			}
		}

		if (effectiveExtension === '.wh.py') {
			this.ensurePythonAuthoringRuntime();
		} else {
			this.clearPythonAuthoringRuntime();
		}

		this.initializeEditorSettings(effectiveExtension);
	}

	public saveModToDrafts(modId: string, sourceExtension?: ModSourceExtension) {
		const extension = sourceExtension || this.getEditedModSourceExtension();
		const draftsDir = this.getDraftsPath();
		fs.mkdirSync(draftsDir, { recursive: true });
		fs.copyFileSync(this.getModSourcePath(extension), path.join(draftsDir, modId + extension));
	}

	public loadModFromDrafts(modId: string): DraftSourceInfo | null {
		const draftsPath = this.getDraftsPath();

		for (const extension of ['.wh.py', '.wh.cpp'] as const) {
			const modSourcePath = path.join(draftsPath, modId + extension);
			if (fs.existsSync(modSourcePath)) {
				return {
					source: fs.readFileSync(modSourcePath, 'utf8'),
					extension,
				};
			}
		}

		return null;
	}

	public deleteModFromDrafts(modId: string) {
		const draftsPath = this.getDraftsPath();
		for (const extension of ['.wh.py', '.wh.cpp'] as const) {
			const modSourcePath = path.join(draftsPath, modId + extension);
			try {
				fs.unlinkSync(modSourcePath);
			} catch (e) {
				if (e.code !== 'ENOENT') {
					throw e;
				}
			}
		}
	}

	private async toggleMinimalLayout(minimal: boolean) {
		const vscodeConfig = vscode.workspace.getConfiguration();
		const thenableArray: Thenable<void>[] = [];

		if (minimal) {
			thenableArray.push(vscode.commands.executeCommand('workbench.action.closeSidebar'));
			thenableArray.push(vscode.commands.executeCommand('workbench.action.closePanel'));
			thenableArray.push(vscodeConfig.update('workbench.activityBar.visible', false));
		}

		thenableArray.push(vscodeConfig.update('workbench.editor.showTabs', !minimal));
		thenableArray.push(vscodeConfig.update('workbench.statusBar.visible', !minimal));

		return Promise.all(thenableArray);
	}

	public async enterEditorMode(
		modId: string,
		modWasModified = false,
		sourceExtension: ModSourceExtension = '.wh.cpp'
	) {
		const vscodeConfig = vscode.workspace.getConfiguration();
		await Promise.all([
			vscodeConfig.update('windhawk.editedModId', modId),
			vscodeConfig.update('windhawk.editedModWasModified', modWasModified),
			vscodeConfig.update('windhawk.editedModSourceExtension', sourceExtension),
			vscodeConfig.update('git.enabled', true),
		]);

		await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(this.getModSourcePath(sourceExtension)), {
			preview: false,
		});
		await vscode.commands.executeCommand('workbench.action.closeEditorsInOtherGroups');
		await vscode.commands.executeCommand('workbench.action.closeOtherEditors');
		await vscode.commands.executeCommand('windhawk.sidebar.focus', {
			preserveFocus: true,
		});

		if (!config.debug.disableMinimalMode) {
			await this.toggleMinimalLayout(false);
		}
	}

	public async exitEditorMode() {
		const vscodeConfig = vscode.workspace.getConfiguration();
		await Promise.all([
			vscodeConfig.update('windhawk.editedModId', undefined),
			vscodeConfig.update('windhawk.editedModWasModified', undefined),
			vscodeConfig.update('windhawk.editedModSourceExtension', undefined),
			vscodeConfig.update('git.enabled', undefined),
		]);

		await vscode.commands.executeCommand('windhawk.start');
		await vscode.commands.executeCommand('workbench.action.closeEditorsInOtherGroups');
		await vscode.commands.executeCommand('workbench.action.closeOtherEditors');

		if (!config.debug.disableMinimalMode) {
			await this.toggleMinimalLayout(true);
		}
	}

	public async restoreEditorMode() {
		const vscodeConfig = vscode.workspace.getConfiguration();
		const modIdConfig = vscodeConfig.get('windhawk.editedModId');
		const modId = typeof modIdConfig === 'string' ? modIdConfig : null;
		const sourceExtension = this.getEditedModSourceExtension();

		if (modId) {
			const modWasModified = !!vscodeConfig.get('windhawk.editedModWasModified');
			await this.enterEditorMode(modId, modWasModified, sourceExtension);
			return {
				modId,
				modWasModified,
				sourceExtension,
			};
		} else {
			await this.exitEditorMode();
			return {
				modId: null,
				sourceExtension,
			};
		}
	}

	public async setEditorModeModId(modId: string) {
		const vscodeConfig = vscode.workspace.getConfiguration();
		await vscodeConfig.update('windhawk.editedModId', modId);
	}

	public async setEditorModeSourceExtension(sourceExtension: ModSourceExtension) {
		const vscodeConfig = vscode.workspace.getConfiguration();
		await vscodeConfig.update('windhawk.editedModSourceExtension', sourceExtension);
	}

	public async markEditorModeModAsModified(modified: boolean) {
		if (!modified && fs.existsSync(this.getFilePath('.git'))) {
			child_process.spawn('git', ['add', path.basename(this.getModSourcePath())], {
				cwd: this.workspacePath,
				stdio: 'ignore',
			});
		}

		const vscodeConfig = vscode.workspace.getConfiguration();
		await vscodeConfig.update('windhawk.editedModWasModified', modified);
	}
}

function copyDirectoryRecursive(sourcePath: string, targetPath: string) {
	fs.mkdirSync(targetPath, { recursive: true });

	for (const entry of fs.readdirSync(sourcePath, { withFileTypes: true })) {
		const sourceEntryPath = path.join(sourcePath, entry.name);
		const targetEntryPath = path.join(targetPath, entry.name);

		if (entry.isDirectory()) {
			copyDirectoryRecursive(sourceEntryPath, targetEntryPath);
			continue;
		}

		fs.copyFileSync(sourceEntryPath, targetEntryPath);
	}
}
