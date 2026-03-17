import { execFileSync } from 'child_process';
import * as os from 'os';
import * as path from 'path';
import * as ini from '../ini';
import { StoragePaths } from '../storagePaths';
import { AppRuntimeDiagnostics } from '../webviewIPCMessages';

type StorageSection = Partial<{
	Portable: string;
	AppDataPath: string;
	RegistryKey: string;
}>;

type ExpectedEngineStorage = {
	storageIniValue: ini.iniValue;
	expectedEngineAppDataPath: string;
	expectedEngineRegistryKey: string | null;
};

type WindowsEnvironmentSnapshot = Pick<
	AppRuntimeDiagnostics,
	| 'windowsProductName'
	| 'windowsDisplayVersion'
	| 'windowsBuild'
	| 'windowsInstallationType'
	| 'hostName'
	| 'userName'
	| 'isElevated'
	| 'windowsDirectory'
	| 'tempDirectory'
>;

function expandEnvironmentVariables(input: string) {
	return input.replace(/%([^%]+)%/g, (original, matched) => {
		return process.env[matched] ?? original;
	});
}

function readStorageSection(filePath: string): StorageSection | null {
	try {
		return ini.fromFile(filePath).Storage || null;
	} catch (e: any) {
		if (e.code === 'ENOENT') {
			return null;
		}

		throw e;
	}
}

function normalizePathForCompare(value: string | null | undefined) {
	if (!value) {
		return null;
	}

	const normalized = path.normalize(value).replace(/[\\\/]+$/, '');
	return normalized.toLowerCase();
}

function normalizeRegistryKeyForCompare(value: string | null | undefined) {
	if (!value) {
		return null;
	}

	return value.replace(/[\\\/]+$/, '').toLowerCase();
}

function samePath(left: string | null | undefined, right: string | null | undefined) {
	return normalizePathForCompare(left) === normalizePathForCompare(right);
}

function sameRegistryKey(left: string | null | undefined, right: string | null | undefined) {
	return normalizeRegistryKeyForCompare(left) === normalizeRegistryKeyForCompare(right);
}

function appendWindowsChild(base: string, child: string) {
	return base.replace(/[\\\/]+$/, '') + '\\' + child;
}

function readWindowsEnvironmentSnapshot(): WindowsEnvironmentSnapshot {
	const fallbackUserName = (() => {
		try {
			return os.userInfo().username;
		} catch (e) {
			console.error('Failed to read Windows user info:', e);
			return process.env.USERNAME || null;
		}
	})();

	const fallback: WindowsEnvironmentSnapshot = {
		windowsProductName: 'Windows',
		windowsDisplayVersion: null,
		windowsBuild: os.release(),
		windowsInstallationType: null,
		hostName: os.hostname(),
		userName: fallbackUserName,
		isElevated: null,
		windowsDirectory: process.env.WINDIR || null,
		tempDirectory: os.tmpdir(),
	};

	if (process.platform !== 'win32') {
		return fallback;
	}

	try {
		const command = [
			"[Console]::OutputEncoding = [System.Text.Encoding]::UTF8",
			"$currentVersion = Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion'",
			"$isElevated = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)",
			"[pscustomobject]@{",
			"  ProductName = $currentVersion.ProductName",
			"  DisplayVersion = $currentVersion.DisplayVersion",
			"  ReleaseId = $currentVersion.ReleaseId",
			"  CurrentBuild = $currentVersion.CurrentBuild",
			"  UBR = $currentVersion.UBR",
			"  InstallationType = $currentVersion.InstallationType",
			"  IsElevated = $isElevated",
			"} | ConvertTo-Json -Compress",
		].join('; ');

		const output = execFileSync(
			'powershell.exe',
			[
				'-NoProfile',
				'-NonInteractive',
				'-ExecutionPolicy',
				'Bypass',
				'-Command',
				command,
			],
			{
				encoding: 'utf8',
				timeout: 4000,
				windowsHide: true,
			}
		).trim();

		if (!output) {
			return fallback;
		}

		const parsed = JSON.parse(output) as Partial<{
			ProductName: string;
			DisplayVersion: string;
			ReleaseId: string;
			CurrentBuild: string;
			UBR: number | string;
			InstallationType: string;
			IsElevated: boolean;
		}>;

		const baseBuild = parsed.CurrentBuild || fallback.windowsBuild;
		const ubr =
			parsed.UBR !== undefined && parsed.UBR !== null && parsed.UBR !== ''
				? `.${parsed.UBR}`
				: '';

		return {
			...fallback,
			windowsProductName: parsed.ProductName || fallback.windowsProductName,
			windowsDisplayVersion:
				parsed.DisplayVersion || parsed.ReleaseId || fallback.windowsDisplayVersion,
			windowsBuild: `${baseBuild}${ubr}`,
			windowsInstallationType:
				parsed.InstallationType || fallback.windowsInstallationType,
			isElevated:
				typeof parsed.IsElevated === 'boolean'
					? parsed.IsElevated
					: fallback.isElevated,
		};
	} catch (e) {
		console.error('Failed to read Windows environment snapshot:', e);
		return fallback;
	}
}

function getExpectedEngineStorage(paths: StoragePaths): ExpectedEngineStorage {
	const {
		appRootPath,
		appDataPath,
		enginePath,
	} = paths.fsPaths;

	const expectedEngineAppDataPath = path.join(appDataPath, 'Engine');

	if (paths.portable) {
		const relativeEngineAppDataPath =
			path.relative(enginePath, expectedEngineAppDataPath) || '.';

		return {
			storageIniValue: {
				Storage: {
					Portable: '1',
					AppDataPath: relativeEngineAppDataPath,
				},
			},
			expectedEngineAppDataPath,
			expectedEngineRegistryKey: null,
		};
	}

	const windhawkIniPath = path.join(appRootPath, 'windhawk.ini');
	const appStorage = readStorageSection(windhawkIniPath);
	const rawAppDataPath = appStorage?.AppDataPath || expectedEngineAppDataPath;
	const rawRegistryKey = appStorage?.RegistryKey || '';
	const expectedEngineRegistryKey = rawRegistryKey
		? appendWindowsChild(rawRegistryKey, 'Engine')
		: null;

	return {
		storageIniValue: {
			Storage: {
				Portable: '0',
				AppDataPath: appendWindowsChild(rawAppDataPath, 'Engine'),
				...(expectedEngineRegistryKey
					? { RegistryKey: expectedEngineRegistryKey }
					: {}),
			},
		},
		expectedEngineAppDataPath,
		expectedEngineRegistryKey,
	};
}

export default class RuntimeDiagnosticsUtils {
	private readonly paths: StoragePaths;
	private readonly windowsEnvironmentSnapshot: WindowsEnvironmentSnapshot;

	constructor(paths: StoragePaths) {
		this.paths = paths;
		this.windowsEnvironmentSnapshot = readWindowsEnvironmentSnapshot();
	}

	public getDiagnostics(): AppRuntimeDiagnostics {
		const { appRootPath, appDataPath, enginePath, compilerPath, uiPath } =
			this.paths.fsPaths;
		const engineIniPath = path.join(enginePath, 'engine.ini');
		const engineStorage = readStorageSection(engineIniPath);
		const {
			storageIniValue,
			expectedEngineAppDataPath,
			expectedEngineRegistryKey,
		} = getExpectedEngineStorage(this.paths);

		const engineConfigExists = !!engineStorage;
		const enginePortable =
			engineStorage && engineStorage.Portable !== undefined
				? !!parseInt(engineStorage.Portable, 10)
				: null;
		const engineAppDataPath =
			engineStorage?.AppDataPath
				? path.resolve(
					enginePath,
					expandEnvironmentVariables(engineStorage.AppDataPath)
				)
				: null;
		const engineRegistryKey = engineStorage?.RegistryKey || null;

		const engineConfigMatchesAppConfig =
			engineConfigExists &&
			enginePortable === this.paths.portable &&
			samePath(engineAppDataPath, expectedEngineAppDataPath) &&
			(this.paths.portable
				? true
				: sameRegistryKey(engineRegistryKey, expectedEngineRegistryKey));

		let issueCode: AppRuntimeDiagnostics['issueCode'] = 'none';
		if (!engineConfigExists) {
			issueCode = 'engine-config-missing';
		} else if (!engineConfigMatchesAppConfig) {
			issueCode = 'engine-storage-mismatch';
		}

		return {
			platformArch: process.arch,
			arm64Enabled: process.env.WINDHAWK_ARM64_ENABLED === '1',
			portable: this.paths.portable,
			...this.windowsEnvironmentSnapshot,
			engineConfigExists,
			enginePortable,
			engineConfigMatchesAppConfig,
			issueCode,
			appRootPath,
			appDataPath,
			enginePath,
			compilerPath,
			uiPath,
			expectedEngineAppDataPath,
			engineAppDataPath,
			expectedEngineRegistryKey,
			engineRegistryKey,
			repairAvailable: issueCode !== 'none',
		};
	}

	public repairRuntimeConfig(): AppRuntimeDiagnostics {
		const { enginePath } = this.paths.fsPaths;
		const engineIniPath = path.join(enginePath, 'engine.ini');
		const { storageIniValue } = getExpectedEngineStorage(this.paths);

		ini.toFile(engineIniPath, storageIniValue);

		return this.getDiagnostics();
	}
}
