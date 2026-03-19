import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as reg from 'native-reg';
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
	| 'totalMemoryGb'
	| 'npuDetected'
	| 'npuName'
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

	const normalized = path.normalize(value).replace(/[\\/]+$/, '');
	return normalized.toLowerCase();
}

function normalizeRegistryKeyForCompare(value: string | null | undefined) {
	if (!value) {
		return null;
	}

	return value.replace(/[\\/]+$/, '').toLowerCase();
}

function samePath(left: string | null | undefined, right: string | null | undefined) {
	return normalizePathForCompare(left) === normalizePathForCompare(right);
}

function sameRegistryKey(left: string | null | undefined, right: string | null | undefined) {
	return normalizeRegistryKeyForCompare(left) === normalizeRegistryKeyForCompare(right);
}

function appendWindowsChild(base: string, child: string) {
	return base.replace(/[\\/]+$/, '') + '\\' + child;
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
		totalMemoryGb: Math.max(1, Math.round(os.totalmem() / 1024 / 1024 / 1024)),
		npuDetected: false,
		npuName: null,
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
		const currentVersionKey = reg.openKey(
			reg.HKLM,
			'SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion',
			reg.Access.QUERY_VALUE | reg.Access.WOW64_64KEY
		);
		if (!currentVersionKey) {
			return fallback;
		}

		let productName: string | null = null;
		let displayVersion: string | null = null;
		let releaseId: string | null = null;
		let currentBuild: string | null = null;
		let ubr: number | null = null;
		let installationType: string | null = null;

		try {
			productName = reg.getValue(
				currentVersionKey,
				null,
				'ProductName',
				reg.GetValueFlags.RT_REG_SZ
			) as string | null;
			displayVersion = reg.getValue(
				currentVersionKey,
				null,
				'DisplayVersion',
				reg.GetValueFlags.RT_REG_SZ
			) as string | null;
			releaseId = reg.getValue(
				currentVersionKey,
				null,
				'ReleaseId',
				reg.GetValueFlags.RT_REG_SZ
			) as string | null;
			currentBuild = reg.getValue(
				currentVersionKey,
				null,
				'CurrentBuild',
				reg.GetValueFlags.RT_REG_SZ
			) as string | null;
			ubr = reg.getValue(
				currentVersionKey,
				null,
				'UBR',
				reg.GetValueFlags.RT_REG_DWORD
			) as number | null;
			installationType = reg.getValue(
				currentVersionKey,
				null,
				'InstallationType',
				reg.GetValueFlags.RT_REG_SZ
			) as string | null;
		} finally {
			reg.closeKey(currentVersionKey);
		}

		const baseBuild = currentBuild || fallback.windowsBuild;
		const buildSuffix = ubr !== null && ubr !== undefined ? `.${ubr}` : '';

		return {
			...fallback,
			windowsProductName: productName || fallback.windowsProductName,
			windowsDisplayVersion:
				displayVersion || releaseId || fallback.windowsDisplayVersion,
			windowsBuild: `${baseBuild}${buildSuffix}`,
			npuDetected: false,
			npuName: fallback.npuName,
			windowsInstallationType:
				installationType || fallback.windowsInstallationType,
			isElevated: fallback.isElevated,
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
		const compilerExecutablePath = path.join(compilerPath, 'bin', 'clang++.exe');
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
		const compilerAvailable = fs.existsSync(compilerExecutablePath);

		let issueCode: AppRuntimeDiagnostics['issueCode'] = 'none';
		if (!engineConfigExists) {
			issueCode = 'engine-config-missing';
		} else if (!engineConfigMatchesAppConfig) {
			issueCode = 'engine-storage-mismatch';
		} else if (!compilerAvailable) {
			issueCode = 'compiler-missing';
		}

		return {
			platformArch: process.arch,
			arm64Enabled: process.env.WINDHAWK_ARM64_ENABLED === '1',
			portable: this.paths.portable,
			...this.windowsEnvironmentSnapshot,
			engineConfigExists,
			enginePortable,
			engineConfigMatchesAppConfig,
			compilerAvailable,
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
			repairAvailable:
				issueCode === 'engine-config-missing' ||
				issueCode === 'engine-storage-mismatch',
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
