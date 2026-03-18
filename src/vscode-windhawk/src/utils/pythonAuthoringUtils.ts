import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { AppSettings } from '../webviewIPCMessages';

export type RenderedPythonMod = {
	source: string;
};

export default class PythonAuthoringUtils {
	private readonly extensionPath: string;

	constructor(extensionPath: string) {
		this.extensionPath = extensionPath;
	}

	public isPythonExtension(extension: '.wh.cpp' | '.wh.py') {
		return extension === '.wh.py';
	}

	public appendToIdAndName(modSource: string, appendToId?: string, appendToName?: string) {
		let updated = modSource;

		if (appendToId) {
			updated = updated.replace(
				/^(\s*id\s*=\s*["'])([^"']+)(["'])/m,
				`$1$2${appendToId.replace(/\$/g, '$$$$')}$3`
			);
		}

		if (appendToName) {
			updated = updated.replace(
				/^(\s*name\s*=\s*["'])([^"']+)(["'])/m,
				`$1$2${appendToName.replace(/\$/g, '$$$$')}$3`
			);
		}

		return updated;
	}

	public renderSource(
		modSource: string,
		virtualSourcePath: string,
		appSettings: Partial<AppSettings>
	): RenderedPythonMod {
		const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'windhawk-py-'));
		const tempSourcePath = path.join(tempDir, path.basename(virtualSourcePath));

		try {
			fs.writeFileSync(tempSourcePath, modSource, 'utf8');
			return this.renderSourceFromFile(tempSourcePath, appSettings);
		} finally {
			try {
				fs.rmSync(tempDir, { recursive: true, force: true });
			} catch (e) {
				console.error('Failed to clean Python mod temp directory:', e);
			}
		}
	}

	public renderSourceFromFile(
		sourcePath: string,
		appSettings: Partial<AppSettings>
	): RenderedPythonMod {
		const pythonModuleRoot = path.join(this.extensionPath, 'files', 'python');
		const renderScriptPath = path.join(pythonModuleRoot, 'render_mod.py');
		const { command, args } = this.resolvePythonCommand(appSettings);
		const stdout = execFileSync(
			command,
			[
				...args,
				renderScriptPath,
				sourcePath,
				'--module-root',
				pythonModuleRoot,
			],
			{
				encoding: 'utf8',
				windowsHide: true,
			}
		);

		return {
			source: stdout.replace(/\r\n|\r|\n/g, '\r\n'),
		};
	}

	public ensureWorkspaceRuntime(workspacePath: string) {
		const packagedRuntimePath = path.join(
			this.extensionPath,
			'files',
			'python',
			'windhawk_py'
		);
		const workspaceRuntimePath = path.join(workspacePath, 'windhawk_py');

		copyDirectoryRecursive(packagedRuntimePath, workspaceRuntimePath);
	}

	private resolvePythonCommand(appSettings: Partial<AppSettings>) {
		const configuredCommand = (appSettings.pythonAuthoringCommand || '').trim();
		const configuredArgs = splitargs(appSettings.pythonAuthoringArgs || '');

		const candidateMap = new Map<string, { command: string; args: string[] }>();
		const pushCandidate = (command: string, args: string[]) => {
			const normalizedCommand = command.trim();
			if (!normalizedCommand) {
				return;
			}

			const key = [normalizedCommand, ...args].join('\0');
			if (!candidateMap.has(key)) {
				candidateMap.set(key, {
					command: normalizedCommand,
					args,
				});
			}
		};

		pushCandidate(configuredCommand, configuredArgs);
		pushCandidate('py', ['-3']);
		pushCandidate('python', []);
		pushCandidate('python3', []);

		const attemptedCommands: string[] = [];
		for (const candidate of candidateMap.values()) {
			attemptedCommands.push(formatCommand(candidate.command, candidate.args));
			try {
				execFileSync(candidate.command, [...candidate.args, '--version'], {
					windowsHide: true,
					stdio: 'ignore',
				});
				return candidate;
			} catch {
				// Try the next candidate.
			}
		}

		const configuredHint = configuredCommand
			? ` The configured command ${formatCommand(configuredCommand, configuredArgs)} could not be used.`
			: '';
		throw new Error(
			`Python authoring requires a working Python runtime.${configuredHint} Tried: ${attemptedCommands.join(
				', '
			)}. Update Settings > Authoring and CLI to point Windhawk at a valid Python command.`
		);
	}
}

function formatCommand(command: string, args: string[]) {
	return [command, ...args].join(' ');
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

function splitargs(input: string, sep?: RegExp, keepQuotes?: boolean) {
	const separator = sep || /\s/g;
	let singleQuoteOpen = false;
	let doubleQuoteOpen = false;
	let tokenBuffer: string[] = [];
	const ret: string[] = [];

	for (const element of input.split('')) {
		const matches = element.match(separator);
		if (element === "'" && !doubleQuoteOpen) {
			if (keepQuotes === true) {
				tokenBuffer.push(element);
			}
			singleQuoteOpen = !singleQuoteOpen;
			continue;
		} else if (element === '"' && !singleQuoteOpen) {
			if (keepQuotes === true) {
				tokenBuffer.push(element);
			}
			doubleQuoteOpen = !doubleQuoteOpen;
			continue;
		}

		if (!singleQuoteOpen && !doubleQuoteOpen && matches) {
			if (tokenBuffer.length > 0) {
				ret.push(tokenBuffer.join(''));
				tokenBuffer = [];
			} else if (sep) {
				ret.push('');
			}
		} else {
			tokenBuffer.push(element);
		}
	}

	if (tokenBuffer.length > 0) {
		ret.push(tokenBuffer.join(''));
	}

	return ret;
}
