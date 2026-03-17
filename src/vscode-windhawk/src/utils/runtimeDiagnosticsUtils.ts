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

	constructor(paths: StoragePaths) {
		this.paths = paths;
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
