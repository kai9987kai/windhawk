"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([[792],{

/***/ 93548
(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {


// EXTERNAL MODULE: ../../node_modules/react/index.js
var react = __webpack_require__(7552);
// EXTERNAL MODULE: ../../node_modules/react-dom/client.js
var client = __webpack_require__(81886);
// EXTERNAL MODULE: ../../node_modules/antd/es/config-provider/index.js + 6 modules
var config_provider = __webpack_require__(82369);
// EXTERNAL MODULE: ../../node_modules/react-diff-view/style/index.css
var style = __webpack_require__(4129);
// EXTERNAL MODULE: ../../node_modules/react-i18next/dist/es/index.js + 22 modules
var es = __webpack_require__(71763);
;// ./src/app/appUISettings.ts

const defaultLocalUISettings = {
  interfaceDensity: 'comfortable',
  reduceMotion: false,
  useWideLayout: false,
  performanceProfile: 'balanced',
  aiAccelerationPreference: 'auto'
};
const localUISettingsStorageKey = 'windhawk.local-ui-settings.v1';
function getStorage(storage) {
  if (storage !== undefined) {
    return storage != null ? storage : null;
  }
  return typeof window !== 'undefined' ? window.localStorage : null;
}
function isInterfaceDensity(value) {
  return value === 'comfortable' || value === 'compact';
}
function isPerformanceProfile(value) {
  return value === 'balanced' || value === 'responsive' || value === 'efficient';
}
function isAIAccelerationPreference(value) {
  return value === 'auto' || value === 'prefer-npu' || value === 'off';
}
function normalizeLocalUISettings(value) {
  if (!value || typeof value !== 'object') {
    return defaultLocalUISettings;
  }
  const candidate = value;
  return {
    interfaceDensity: isInterfaceDensity(candidate.interfaceDensity) ? candidate.interfaceDensity : defaultLocalUISettings.interfaceDensity,
    reduceMotion: typeof candidate.reduceMotion === 'boolean' ? candidate.reduceMotion : defaultLocalUISettings.reduceMotion,
    useWideLayout: typeof candidate.useWideLayout === 'boolean' ? candidate.useWideLayout : defaultLocalUISettings.useWideLayout,
    performanceProfile: isPerformanceProfile(candidate.performanceProfile) ? candidate.performanceProfile : defaultLocalUISettings.performanceProfile,
    aiAccelerationPreference: isAIAccelerationPreference(candidate.aiAccelerationPreference) ? candidate.aiAccelerationPreference : defaultLocalUISettings.aiAccelerationPreference
  };
}
function getRecommendedLocalUISettings(runtimeDiagnostics) {
  var _runtimeDiagnostics$t;
  const recommendation = Object.assign({}, defaultLocalUISettings);
  if (!runtimeDiagnostics) {
    return recommendation;
  }
  const totalMemoryGb = (_runtimeDiagnostics$t = runtimeDiagnostics.totalMemoryGb) != null ? _runtimeDiagnostics$t : 0;
  if (runtimeDiagnostics.issueCode !== undefined && runtimeDiagnostics.issueCode !== 'none') {
    return Object.assign({}, recommendation, {
      reduceMotion: true,
      performanceProfile: 'efficient',
      aiAccelerationPreference: runtimeDiagnostics.npuDetected ? 'prefer-npu' : 'auto'
    });
  }
  if (runtimeDiagnostics.npuDetected) {
    return Object.assign({}, recommendation, {
      useWideLayout: true,
      performanceProfile: 'responsive',
      aiAccelerationPreference: 'prefer-npu'
    });
  }
  if (totalMemoryGb > 0 && totalMemoryGb <= 8) {
    return Object.assign({}, recommendation, {
      reduceMotion: true,
      performanceProfile: 'efficient',
      aiAccelerationPreference: 'off'
    });
  }
  if (totalMemoryGb >= 16) {
    return Object.assign({}, recommendation, {
      useWideLayout: true,
      performanceProfile: 'responsive',
      aiAccelerationPreference: 'auto'
    });
  }
  return recommendation;
}
function mergeLocalUISettings(current, updates) {
  return normalizeLocalUISettings(Object.assign({}, current, updates));
}
function readLocalUISettings(storage) {
  const targetStorage = getStorage(storage);
  if (!targetStorage) {
    return defaultLocalUISettings;
  }
  try {
    var _targetStorage$getIte;
    return normalizeLocalUISettings(JSON.parse((_targetStorage$getIte = targetStorage.getItem(localUISettingsStorageKey)) != null ? _targetStorage$getIte : 'null'));
  } catch (_unused) {
    return defaultLocalUISettings;
  }
}
function writeLocalUISettings(settings, storage) {
  const targetStorage = getStorage(storage);
  if (!targetStorage) {
    return;
  }
  try {
    targetStorage.setItem(localUISettingsStorageKey, JSON.stringify(settings));
  } catch (_unused2) {
    // Ignore storage write errors so the UI remains usable in restricted hosts.
  }
}
const AppUISettingsContext = /*#__PURE__*/react.createContext({
  localUISettings: defaultLocalUISettings,
  setLocalUISettings: () => undefined,
  resetLocalUISettings: () => undefined
});
// EXTERNAL MODULE: ../../node_modules/i18next/dist/esm/i18next.js
var i18next = __webpack_require__(63362);
// EXTERNAL MODULE: ../../node_modules/i18next-http-backend/esm/index.js + 2 modules
var esm = __webpack_require__(63303);
;// ./src/app/i18n.ts



let initialized = false;
const defaultLanguage = 'en';
function i18nInitialize(language) {
  i18next/* default.use */.Ay.use(esm/* default */.A)
  // pass the i18n instance to react-i18next.
  .use(es/* initReactI18next */.r9)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    lng: language,
    fallbackLng: defaultLanguage,
    //debug: true,

    returnNull: false,
    returnEmptyString: false,
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    },
    react: {
      useSuspense: false
    },
    backend: {
      // Use a relative load path.
      loadPath: './locales/{{lng}}/{{ns}}.json'
    }
  });
}
function setLanguage(language) {
  if (initialized) {
    i18next/* default.changeLanguage */.Ay.changeLanguage(language || defaultLanguage);
    return;
  }
  i18nInitialize(language || defaultLanguage);
  initialized = true;
}
;// ./src/app/vsCodeApi.ts
// https://github.com/microsoft/vscode/issues/96221#issuecomment-735408921

const vsCodeApi = typeof acquireVsCodeApi !== 'undefined' ? acquireVsCodeApi() : null;
/* harmony default export */ const app_vsCodeApi = (vsCodeApi);
;// ./src/app/panel/mockData.ts

const useMockData = !app_vsCodeApi;
const mockAppUISettings = !useMockData ? null : {
  language: 'en',
  devModeOptOut: false,
  devModeUsedAtLeastOnce: false,
  loggingEnabled: false,
  updateIsAvailable: false,
  safeMode: false
};
const mockSettings = !useMockData ? null : {
  language: 'en',
  disableUpdateCheck: false,
  disableRunUIScheduledTask: false,
  devModeOptOut: false,
  devModeUsedAtLeastOnce: false,
  hideTrayIcon: false,
  alwaysCompileModsLocally: false,
  dontAutoShowToolkit: false,
  modTasksDialogDelay: 2000,
  safeMode: false,
  loggingVerbosity: 0,
  engine: {
    loggingVerbosity: 0,
    include: ['a.exe', 'b.exe'],
    exclude: ['c.exe', 'd.exe'],
    injectIntoCriticalProcesses: false,
    injectIntoIncompatiblePrograms: false,
    injectIntoGames: false
  }
};
const mockRuntimeDiagnostics = !useMockData ? null : {
  platformArch: 'arm64',
  arm64Enabled: true,
  portable: true,
  totalMemoryGb: 32,
  npuDetected: true,
  npuName: 'Qualcomm Hexagon NPU',
  windowsProductName: 'Windows 11 Pro',
  windowsDisplayVersion: '24H2',
  windowsBuild: '26100.2605',
  windowsInstallationType: 'Client',
  hostName: 'WORKSTATION-KAI',
  userName: 'kai99',
  isElevated: true,
  windowsDirectory: 'C:\\Windows',
  tempDirectory: 'C:\\Users\\kai99\\AppData\\Local\\Temp',
  engineConfigExists: true,
  enginePortable: false,
  engineConfigMatchesAppConfig: false,
  issueCode: 'engine-storage-mismatch',
  appRootPath: 'C:\\Users\\kai99\\AppData\\Local\\Programs\\Windhawk-Custom-Portable',
  appDataPath: 'C:\\Users\\kai99\\AppData\\Local\\Programs\\Windhawk-Custom-Portable\\Data',
  enginePath: 'C:\\Users\\kai99\\AppData\\Local\\Programs\\Windhawk-Custom-Portable\\Engine\\1.7.3',
  compilerPath: 'C:\\Users\\kai99\\AppData\\Local\\Programs\\Windhawk-Custom-Portable\\Compiler',
  uiPath: 'C:\\Users\\kai99\\AppData\\Local\\Programs\\Windhawk-Custom-Portable\\UI',
  expectedEngineAppDataPath: 'C:\\Users\\kai99\\AppData\\Local\\Programs\\Windhawk-Custom-Portable\\Data\\Engine',
  engineAppDataPath: 'C:\\ProgramData\\Windhawk\\Engine',
  expectedEngineRegistryKey: null,
  engineRegistryKey: 'HKLM\\SOFTWARE\\Windhawk\\Engine',
  repairAvailable: true
};
const mockModMetadata = {
  id: 'custom-message-box',
  name: 'Custom Message Box',
  description: 'Customizes the message box',
  version: '0.1',
  author: 'Michael Jackson',
  github: 'https://github.com/jackson',
  twitter: 'https://twitter.com/jackson',
  homepage: 'http://custom-message-box.com/',
  include: ['*'],
  exclude: ['explorer.exe'],
  license: 'MIT',
  donateUrl: 'https://example.com/donate'
};
const mockModMetadataOnline = Object.assign({}, mockModMetadata, {
  id: undefined,
  version: '0.2'
});
const mockModConfig = {
  libraryFileName: 'custom-message-box-123456.dll',
  disabled: false,
  loggingEnabled: false,
  debugLoggingEnabled: false,
  include: ['*'],
  exclude: ['explorer.exe'],
  includeCustom: [],
  excludeCustom: [],
  includeExcludeCustomOnly: false,
  patternsMatchCriticalSystemProcesses: true,
  architecture: ['x86-64'],
  version: '1.0'
};
const mockModDetails = {
  metadata: {},
  config: mockModConfig,
  updateAvailable: false,
  userRating: 0
};
const mockModsBrowserLocalInitialMods = !useMockData ? null : {
  'custom-message-box': {
    metadata: mockModMetadata,
    config: mockModConfig,
    updateAvailable: true,
    userRating: 4
  },
  'local@asdf2': mockModDetails,
  asdf3: mockModDetails,
  asdf4: mockModDetails,
  asdf5: mockModDetails,
  asdf6: mockModDetails,
  asdf7: mockModDetails
};
const mockModsBrowserLocalFeaturedMods = !useMockData ? null : {
  online1: {
    metadata: mockModMetadataOnline,
    details: {
      users: 111222333,
      rating: 5,
      ratingBreakdown: [1, 2, 16, 3, 5],
      defaultSorting: 2,
      published: 1618321977408,
      updated: 1718321977408
    }
  }
};
const mockModsBrowserOnlineRepositoryMods = !useMockData ? null : Object.assign({
  online1: {
    repository: {
      metadata: mockModMetadataOnline,
      details: {
        users: 111222333,
        rating: 5,
        ratingBreakdown: [1, 2, 16, 3, 5],
        defaultSorting: 2,
        published: 1618321977408,
        updated: 1718321977408
      }
    },
    installed: {
      metadata: mockModMetadata,
      config: mockModConfig
    }
  }
}, Object.fromEntries(Array(100).fill(undefined).map((e, i) => [`online${(i + 1).toString().padStart(3, '0')}`, {
  repository: {
    metadata: {
      name: `My Mod ${(i + 1).toString().padStart(3, '0')}`,
      description: 'A good mod',
      version: '1.2',
      author: 'John Smith',
      github: 'https://github.com/john',
      twitter: 'https://twitter.com/john',
      homepage: 'https://example.com/'
    },
    details: {
      users: 20,
      rating: 7,
      ratingBreakdown: [1, 2, 4, 8, 16],
      defaultSorting: 1,
      published: 1618321977408,
      updated: 1718321977408
    }
  }
}])));
const mockInstalledModSourceData = !useMockData ? null : {
  source: '// Mock local source...\n',
  metadata: mockModMetadata,
  readme: `# Mock readme...

| Month    | Savings |
| -------- | ------- |
| January  | $250    |
| February | $80     |
| March    | $420    |

More text...`,
  initialSettings: [{
    key: 'mock-setting',
    value: 'mock-setting-value',
    name: 'Mock Setting Name',
    description: 'Mock setting description'
  }, {
    key: 'mock-setting-dropdown',
    value: 'a',
    name: 'Mock Setting Dropdown Name',
    description: 'Mock setting dropdown description',
    options: [{
      a: 'a option'
    }, {
      b: 'b option'
    }, {
      c: 'c option'
    }, {
      d: 'd option'
    }, {
      e: 'e option'
    }, {
      f: 'f option'
    }, {
      g: 'g option'
    }, {
      h: 'h option'
    }, {
      i: 'i option'
    }]
  }, {
    key: 'mock-setting-array',
    value: ['a', 'b', 'c'],
    name: 'Mock Setting Array Name',
    description: 'Mock setting array description'
  }, {
    key: 'mock-setting-nested-array',
    value: [[{
      key: 'mock-setting-nested',
      value: ['a', 'b', 'c'],
      name: 'Mock Setting Nested Name',
      description: 'Mock setting nested description'
    }]],
    name: 'Mock Setting Nested Array Name',
    description: 'Mock setting nested array description'
  }]
};
const mockModSettings = !useMockData ? null : {
  'mock-setting': 'mock-setting-value',
  'mock-setting-dropdown': 'mock-setting-value',
  'mock-setting-array[0]': 'a',
  'mock-setting-array[1]': 'b',
  'mock-setting-array[2]': 'c'
};
const mockModVersions = !useMockData ? null : [{
  version: '0.3-alpha',
  timestamp: 1758321977,
  // Sep 20, 2025
  isPreRelease: true
}, {
  version: '0.2',
  timestamp: 1718321977,
  // Jun 14, 2024
  isPreRelease: false
}, {
  version: '0.1',
  timestamp: 1690444800,
  // Jul 27, 2023
  isPreRelease: false
}, {
  version: '0.1-beta',
  timestamp: 1684454400,
  // May 19, 2023
  isPreRelease: true
}];
const mockModVersionSource = !useMockData ? null : version => ({
  source: `// Mock source for version ${version}...\n`,
  metadata: Object.assign({}, mockModMetadata, {
    version
  }),
  readme: `# Mock readme for version ${version}...\n`,
  initialSettings: []
});
// EXTERNAL MODULE: ../../node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js
var objectWithoutPropertiesLoose = __webpack_require__(90024);
// EXTERNAL MODULE: ../../node_modules/react-router/dist/development/chunk-LFPYN7LY.mjs
var chunk_LFPYN7LY = __webpack_require__(94637);
// EXTERNAL MODULE: ../../node_modules/react-router/dist/development/dom-export.mjs
var dom_export = __webpack_require__(11641);
// EXTERNAL MODULE: ../../node_modules/styled-components/dist/styled-components.browser.esm.js + 9 modules
var styled_components_browser_esm = __webpack_require__(48369);
// EXTERNAL MODULE: ../../node_modules/antd/es/alert/index.js + 1 modules
var es_alert = __webpack_require__(14537);
// EXTERNAL MODULE: ../../node_modules/antd/es/card/index.js + 39 modules
var card = __webpack_require__(20655);
// EXTERNAL MODULE: ../../node_modules/antd/es/message/index.js + 1 modules
var message = __webpack_require__(41566);
// EXTERNAL MODULE: ../../node_modules/antd/es/button/index.js
var es_button = __webpack_require__(90500);
// EXTERNAL MODULE: ../../node_modules/usehooks-ts/dist/index.js
var dist = __webpack_require__(20003);
;// ./src/app/webviewIPC.ts




// Message types:
// * 'message' is a message from the webview to the extension.
// * 'messageWithReply' is a message from the webview to the extension that expects a reply.
// * 'reply' is a reply to a 'messageWithReply' message.
// * 'event' is a message from the extension to the webview.

////////////////////////////////////////////////////////////
// Messages.

function createNewMod(data = {}) {
  const msg = {
    type: 'message',
    command: 'createNewMod',
    data
  };
  app_vsCodeApi == null || app_vsCodeApi.postMessage(msg);
}
function editMod(data) {
  const msg = {
    type: 'message',
    command: 'editMod',
    data
  };
  app_vsCodeApi == null || app_vsCodeApi.postMessage(msg);
}
function forkMod(data) {
  const msg = {
    type: 'message',
    command: 'forkMod',
    data
  };
  app_vsCodeApi == null || app_vsCodeApi.postMessage(msg);
}
function showAdvancedDebugLogOutput() {
  const msg = {
    type: 'message',
    command: 'showAdvancedDebugLogOutput',
    data: {}
  };
  app_vsCodeApi == null || app_vsCodeApi.postMessage(msg);
}
function showLogOutput() {
  const msg = {
    type: 'message',
    command: 'showLogOutput',
    data: {}
  };
  app_vsCodeApi == null || app_vsCodeApi.postMessage(msg);
}
function getInitialSidebarParams() {
  const msg = {
    type: 'message',
    command: 'getInitialSidebarParams',
    data: {}
  };
  app_vsCodeApi == null || app_vsCodeApi.postMessage(msg);
}
function stopCompileEditedMod() {
  const msg = {
    type: 'message',
    command: 'stopCompileEditedMod',
    data: {}
  };
  app_vsCodeApi == null || app_vsCodeApi.postMessage(msg);
}
function previewEditedMod() {
  const msg = {
    type: 'message',
    command: 'previewEditedMod',
    data: {}
  };
  app_vsCodeApi == null || app_vsCodeApi.postMessage(msg);
}
function useOpenExternal(handler) {
  const result = usePostMessageWithReplyWithHandler('openExternal', handler);
  return {
    openExternal: result.postMessage,
    openExternalPending: result.pending,
    openExternalContext: result.context
  };
}
function useOpenPath(handler) {
  const result = usePostMessageWithReplyWithHandler('openPath', handler);
  return {
    openPath: result.postMessage,
    openPathPending: result.pending,
    openPathContext: result.context
  };
}

////////////////////////////////////////////////////////////
// Messages with replies.

let messageId = 0;
function usePostMessageWithReplyWithHandler(eventName, handler) {
  const [pendingMessageId, setPendingMessageId] = (0,react.useState)();
  const [context, setContext] = (0,react.useState)();
  const postMessage = (0,react.useCallback)((data, context) => {
    messageId++;
    if (messageId > 0x7fffffff) {
      messageId = 1;
    }
    const message = {
      type: 'messageWithReply',
      command: eventName,
      data,
      messageId
    };
    app_vsCodeApi == null || app_vsCodeApi.postMessage(message);
    setPendingMessageId(messageId);
    setContext(context);
  }, [eventName]);
  (0,dist/* useEventListener */.ML)('message', (0,react.useCallback)(message => {
    const data = message.data;
    if (pendingMessageId === undefined) {
      return;
    }
    if (data.type === 'reply' && data.command === eventName && data.messageId === pendingMessageId) {
      handler(data.data, context);
      setPendingMessageId(undefined);
      setContext(undefined);
    }
  }, [context, eventName, handler, pendingMessageId]));
  return {
    postMessage,
    pending: pendingMessageId !== undefined,
    context
  };
}
function useGetInitialAppSettings(handler) {
  const result = usePostMessageWithReplyWithHandler('getInitialAppSettings', handler);
  return {
    getInitialAppSettings: result.postMessage,
    getInitialAppSettingsPending: result.pending,
    getInitialAppSettingsContext: result.context
  };
}
function useInstallMod(handler) {
  const result = usePostMessageWithReplyWithHandler('installMod', handler);
  return {
    installMod: result.postMessage,
    installModPending: result.pending,
    installModContext: result.context
  };
}
function useCompileMod(handler) {
  const result = usePostMessageWithReplyWithHandler('compileMod', handler);
  return {
    compileMod: result.postMessage,
    compileModPending: result.pending,
    compileModContext: result.context
  };
}
function useEnableMod(handler) {
  const result = usePostMessageWithReplyWithHandler('enableMod', handler);
  return {
    enableMod: result.postMessage,
    enableModPending: result.pending,
    enableModContext: result.context
  };
}
function useDeleteMod(handler) {
  const result = usePostMessageWithReplyWithHandler('deleteMod', handler);
  return {
    deleteMod: result.postMessage,
    deleteModPending: result.pending,
    deleteModContext: result.context
  };
}
function useUpdateModRating(handler) {
  const result = usePostMessageWithReplyWithHandler('updateModRating', handler);
  return {
    updateModRating: result.postMessage,
    updateModRatingPending: result.pending,
    updateModRatingContext: result.context
  };
}
function useGetInstalledMods(handler) {
  const result = usePostMessageWithReplyWithHandler('getInstalledMods', handler);
  return {
    getInstalledMods: result.postMessage,
    getInstalledModsPending: result.pending,
    getInstalledModsContext: result.context
  };
}
function useGetFeaturedMods(handler) {
  const result = usePostMessageWithReplyWithHandler('getFeaturedMods', handler);
  return {
    getFeaturedMods: result.postMessage,
    getFeaturedModsPending: result.pending,
    getFeaturedModsContext: result.context
  };
}
function useGetModSourceData(handler) {
  const result = usePostMessageWithReplyWithHandler('getModSourceData', handler);
  return {
    getModSourceData: result.postMessage,
    getModSourceDataPending: result.pending,
    getModSourceDataContext: result.context
  };
}
function useGetRepositoryModSourceData(handler) {
  const result = usePostMessageWithReplyWithHandler('getRepositoryModSourceData', handler);
  return {
    getRepositoryModSourceData: result.postMessage,
    getRepositoryModSourceDataPending: result.pending,
    getRepositoryModSourceDataContext: result.context
  };
}
function useGetModVersions(handler) {
  const result = usePostMessageWithReplyWithHandler('getModVersions', handler);
  return {
    getModVersions: result.postMessage,
    getModVersionsPending: result.pending,
    getModVersionsContext: result.context
  };
}
function useGetAppSettings(handler) {
  const result = usePostMessageWithReplyWithHandler('getAppSettings', handler);
  return {
    getAppSettings: result.postMessage,
    getAppSettingsPending: result.pending,
    getAppSettingsContext: result.context
  };
}
function useUpdateAppSettings(handler) {
  const result = usePostMessageWithReplyWithHandler('updateAppSettings', handler);
  return {
    updateAppSettings: result.postMessage,
    updateAppSettingsPending: result.pending,
    updateAppSettingsContext: result.context
  };
}
function useRepairRuntimeConfig(handler) {
  const result = usePostMessageWithReplyWithHandler('repairRuntimeConfig', handler);
  return {
    repairRuntimeConfig: result.postMessage,
    repairRuntimeConfigPending: result.pending,
    repairRuntimeConfigContext: result.context
  };
}
function useGetModSettings(handler) {
  const result = usePostMessageWithReplyWithHandler('getModSettings', handler);
  return {
    getModSettings: result.postMessage,
    getModSettingsPending: result.pending,
    getModSettingsContext: result.context
  };
}
function useSetModSettings(handler) {
  const result = usePostMessageWithReplyWithHandler('setModSettings', handler);
  return {
    setModSettings: result.postMessage,
    setModSettingsPending: result.pending,
    setModSettingsContext: result.context
  };
}
function useGetModConfig(handler) {
  const result = usePostMessageWithReplyWithHandler('getModConfig', handler);
  return {
    getModConfig: result.postMessage,
    getModConfigPending: result.pending,
    getModConfigContext: result.context
  };
}
function useUpdateModConfig(handler) {
  const result = usePostMessageWithReplyWithHandler('updateModConfig', handler);
  return {
    updateModConfig: result.postMessage,
    updateModConfigPending: result.pending,
    updateModConfigContext: result.context
  };
}
function useGetRepositoryMods(handler) {
  const result = usePostMessageWithReplyWithHandler('getRepositoryMods', handler);
  return {
    getRepositoryMods: result.postMessage,
    getRepositoryModsPending: result.pending,
    getRepositoryModsContext: result.context
  };
}
function useStartUpdate(handler) {
  const result = usePostMessageWithReplyWithHandler('startUpdate', handler);
  return {
    startUpdate: result.postMessage,
    startUpdatePending: result.pending,
    startUpdateContext: result.context
  };
}
function useCancelUpdate(handler) {
  const result = usePostMessageWithReplyWithHandler('cancelUpdate', handler);
  return {
    cancelUpdate: result.postMessage,
    cancelUpdatePending: result.pending,
    cancelUpdateContext: result.context
  };
}
function useEnableEditedMod(handler) {
  const result = usePostMessageWithReplyWithHandler('enableEditedMod', handler);
  return {
    enableEditedMod: result.postMessage,
    enableEditedModPending: result.pending,
    enableEditedModContext: result.context
  };
}
function useEnableEditedModLogging(handler) {
  const result = usePostMessageWithReplyWithHandler('enableEditedModLogging', handler);
  return {
    enableEditedModLogging: result.postMessage,
    enableEditedModLoggingPending: result.pending,
    enableEditedModLoggingContext: result.context
  };
}
function useCompileEditedMod(handler) {
  const result = usePostMessageWithReplyWithHandler('compileEditedMod', handler);
  return {
    compileEditedMod: result.postMessage,
    compileEditedModPending: result.pending,
    compileEditedModContext: result.context
  };
}
function useExitEditorMode(handler) {
  const result = usePostMessageWithReplyWithHandler('exitEditorMode', handler);
  return {
    exitEditorMode: result.postMessage,
    exitEditorModePending: result.pending,
    exitEditorModeContext: result.context
  };
}

////////////////////////////////////////////////////////////
// Events.

function useEventMessageWithHandler(eventName, handler) {
  (0,dist/* useEventListener */.ML)('message', (0,react.useCallback)(message => {
    const data = message.data;
    if (data.type === 'event' && data.command === eventName) {
      handler(data.data);
    }
  }, [eventName, handler]));
}
function useSetNewAppSettings(handler) {
  useEventMessageWithHandler('setNewAppSettings', handler);
}
function useUpdateDownloadProgress(handler) {
  useEventMessageWithHandler('updateDownloadProgress', handler);
}
function useUpdateInstalling(handler) {
  useEventMessageWithHandler('updateInstalling', handler);
}
function useUpdateInstalledModsDetails(handler) {
  useEventMessageWithHandler('updateInstalledModsDetails', handler);
}
function useSetNewModConfig(handler) {
  useEventMessageWithHandler('setNewModConfig', handler);
}
function useSetEditedModId(handler) {
  useEventMessageWithHandler('setEditedModId', handler);
}
function useCompileEditedModStart(handler) {
  useEventMessageWithHandler('compileEditedModStart', handler);
}
function useEditedModWasModified(handler) {
  useEventMessageWithHandler('editedModWasModified', handler);
}
function useSetEditedModDetails(handler) {
  useEventMessageWithHandler('setEditedModDetails', handler);
}
// EXTERNAL MODULE: ../../node_modules/antd/es/modal/index.js + 23 modules
var modal = __webpack_require__(88609);
// EXTERNAL MODULE: ../../node_modules/antd/es/spin/index.js
var spin = __webpack_require__(85808);
// EXTERNAL MODULE: ../../node_modules/antd/es/result/index.js + 5 modules
var result = __webpack_require__(60595);
;// ./src/app/swrHelpers.ts
const fetchText = (input, init) => fetch(input, init).then(res => res.text());
// EXTERNAL MODULE: ../../node_modules/antd/es/typography/index.js + 18 modules
var typography = __webpack_require__(99983);
// EXTERNAL MODULE: ../../node_modules/antd/es/select/index.js + 30 modules
var es_select = __webpack_require__(94137);
// EXTERNAL MODULE: ../../node_modules/antd/es/switch/index.js + 1 modules
var es_switch = __webpack_require__(41435);
// EXTERNAL MODULE: ../../node_modules/antd/es/empty/index.js + 2 modules
var empty = __webpack_require__(61715);
// EXTERNAL MODULE: ../../node_modules/antd/es/dropdown/index.js + 2 modules
var dropdown = __webpack_require__(35752);
// EXTERNAL MODULE: ../../node_modules/antd/es/input/index.js + 7 modules
var input = __webpack_require__(1976);
// EXTERNAL MODULE: ../../node_modules/antd/es/input-number/index.js + 10 modules
var input_number = __webpack_require__(21496);
// EXTERNAL MODULE: ../../node_modules/antd/es/popconfirm/index.js + 3 modules
var popconfirm = __webpack_require__(80593);
// EXTERNAL MODULE: ../../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(69500);
;// ./src/app/components/InputWithContextMenu.tsx

const _excluded = ["children"],
  _excluded2 = ["children"],
  _excluded3 = ["children"],
  _excluded4 = ["children"],
  _excluded5 = ["children"],
  _excluded6 = ["children"];




function useItems() {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const items = (0,react.useMemo)(() => [{
    label: t('general.cut'),
    key: 'cut'
  }, {
    label: t('general.copy'),
    key: 'copy'
  }, {
    label: t('general.paste'),
    key: 'paste'
  }, {
    type: 'divider'
  }, {
    label: t('general.selectAll'),
    key: 'selectAll'
  }], [t]);
  return items;
}
function onClick(textArea, key) {
  if (textArea) {
    textArea.focus();
    document.execCommand(key);
  }
  document.body.classList.remove('windhawk-no-pointer-events');
}
function onOpenChange(open) {
  if (open) {
    document.body.classList.add('windhawk-no-pointer-events');
  } else {
    document.body.classList.remove('windhawk-no-pointer-events');
  }
}
const InputWithContextMenu = /*#__PURE__*/(0,react.forwardRef)((_ref, ref) => {
  let {
      children
    } = _ref,
    rest = (0,objectWithoutPropertiesLoose/* default */.A)(_ref, _excluded);
  const items = useItems();
  const internalRef = (0,react.useRef)(null);
  (0,react.useImperativeHandle)(ref, () => internalRef.current || {});
  const handleMenuClick = (0,react.useCallback)(info => {
    var _internalRef$current;
    return onClick(((_internalRef$current = internalRef.current) == null ? void 0 : _internalRef$current.input) || null, info.key);
  }, []);
  (0,react.useEffect)(() => {
    return () => {
      document.body.classList.remove('windhawk-no-pointer-events');
    };
  }, []);
  return /*#__PURE__*/(0,jsx_runtime.jsx)(dropdown/* default */.A, {
    menu: {
      items,
      onClick: handleMenuClick
    },
    onOpenChange: onOpenChange,
    trigger: ['contextMenu'],
    overlayClassName: "windhawk-popup-content-no-select",
    children: /*#__PURE__*/(0,jsx_runtime.jsx)(input/* default */.A, Object.assign({
      ref: internalRef
    }, rest, {
      children: children
    }))
  });
});
InputWithContextMenu.displayName = 'InputWithContextMenu';
const InputNumberWithContextMenu = /*#__PURE__*/(0,react.forwardRef)((_ref2, ref) => {
  let {
      children
    } = _ref2,
    rest = (0,objectWithoutPropertiesLoose/* default */.A)(_ref2, _excluded2);
  const items = useItems();
  const internalRef = (0,react.useRef)(null);
  (0,react.useImperativeHandle)(ref, () => internalRef.current || {});
  const handleMenuClick = (0,react.useCallback)(info => onClick(internalRef.current || null, info.key), []);
  (0,react.useEffect)(() => {
    return () => {
      document.body.classList.remove('windhawk-no-pointer-events');
    };
  }, []);
  return /*#__PURE__*/(0,jsx_runtime.jsx)(dropdown/* default */.A, {
    menu: {
      items,
      onClick: handleMenuClick
    },
    onOpenChange: onOpenChange,
    trigger: ['contextMenu'],
    overlayClassName: "windhawk-popup-content-no-select",
    children: /*#__PURE__*/(0,jsx_runtime.jsx)(input_number/* default */.A, Object.assign({
      ref: internalRef
    }, rest, {
      children: children
    }))
  });
});
InputNumberWithContextMenu.displayName = 'InputNumberWithContextMenu';
const TextAreaWithContextMenu = /*#__PURE__*/(0,react.forwardRef)((_ref3, ref) => {
  let {
      children
    } = _ref3,
    rest = (0,objectWithoutPropertiesLoose/* default */.A)(_ref3, _excluded3);
  const items = useItems();
  const internalRef = (0,react.useRef)(null);
  (0,react.useImperativeHandle)(ref, () => internalRef.current || {});
  const handleMenuClick = (0,react.useCallback)(info => {
    var _internalRef$current2;
    return onClick(((_internalRef$current2 = internalRef.current) == null || (_internalRef$current2 = _internalRef$current2.resizableTextArea) == null ? void 0 : _internalRef$current2.textArea) || null, info.key);
  }, []);
  (0,react.useEffect)(() => {
    return () => {
      document.body.classList.remove('windhawk-no-pointer-events');
    };
  }, []);
  return /*#__PURE__*/(0,jsx_runtime.jsx)(dropdown/* default */.A, {
    menu: {
      items,
      onClick: handleMenuClick
    },
    onOpenChange: onOpenChange,
    trigger: ['contextMenu'],
    overlayClassName: "windhawk-popup-content-no-select",
    children: /*#__PURE__*/(0,jsx_runtime.jsx)(input/* default */.A.TextArea, Object.assign({
      ref: internalRef
    }, rest, {
      children: children
    }))
  });
});
TextAreaWithContextMenu.displayName = 'TextAreaWithContextMenu';
function SelectModal(_ref4) {
  let {
      children
    } = _ref4,
    rest = (0,objectWithoutPropertiesLoose/* default */.A)(_ref4, _excluded4);
  const handleDropdownVisibleChange = (0,react.useCallback)(open => {
    onOpenChange(open);
    rest.onDropdownVisibleChange == null || rest.onDropdownVisibleChange(open);
  }, [rest]);
  return /*#__PURE__*/(0,jsx_runtime.jsx)(es_select/* default */.A, Object.assign({
    popupClassName: "windhawk-popup-content"
  }, rest, {
    onDropdownVisibleChange: handleDropdownVisibleChange,
    children: children
  }));
}
function PopconfirmModal(_ref5) {
  let {
      children
    } = _ref5,
    rest = (0,objectWithoutPropertiesLoose/* default */.A)(_ref5, _excluded5);
  const handleOpenChange = (0,react.useCallback)(open => {
    onOpenChange(open);
    rest.onOpenChange == null || rest.onOpenChange(open);
  }, [rest]);
  return /*#__PURE__*/(0,jsx_runtime.jsx)(popconfirm/* default */.A, Object.assign({
    overlayClassName: "windhawk-popup-content"
  }, rest, {
    onOpenChange: handleOpenChange,
    children: children
  }));
}
function DropdownModal(_ref6) {
  let {
      children
    } = _ref6,
    rest = (0,objectWithoutPropertiesLoose/* default */.A)(_ref6, _excluded6);
  const handleOpenChange = (0,react.useCallback)(open => {
    onOpenChange(open);
    rest.onOpenChange == null || rest.onOpenChange(open);
  }, [rest]);
  return /*#__PURE__*/(0,jsx_runtime.jsx)(dropdown/* default */.A, Object.assign({}, rest, {
    onOpenChange: handleOpenChange,
    overlayClassName: "windhawk-popup-content-no-select",
    children: children
  }));
}
function dropdownModalDismissed() {
  document.body.classList.remove('windhawk-no-pointer-events');
}

;// ./src/app/utils.ts
/**
 * Sanitizes a URL to only allow http:// or https:// protocols.
 * Returns undefined if the URL is invalid or uses a disallowed protocol.
 *
 * @param url - The URL to sanitize
 * @returns The sanitized URL or undefined if invalid
 */
function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') {
    return undefined;
  }
  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return undefined;
  }
  try {
    const parsed = new URL(trimmedUrl);

    // Only allow http and https protocols
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmedUrl;
    }
    return undefined;
  } catch (e) {
    console.warn(`Invalid URL format (${url}):`, e);
    return undefined;
  }
}
async function copyTextToClipboard(text) {
  var _navigator$clipboard;
  if ((_navigator$clipboard = navigator.clipboard) != null && _navigator$clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (e) {
      console.warn('Clipboard API write failed, using fallback copy', e);
    }
  }
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.opacity = '0';
  textArea.setAttribute('readonly', '');
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    const copySucceeded = document.execCommand('copy');
    if (!copySucceeded) {
      throw new Error('Fallback copy command failed');
    }
  } finally {
    document.body.removeChild(textArea);
  }
}
// EXTERNAL MODULE: ../../node_modules/react-markdown/lib/index.js + 90 modules
var lib = __webpack_require__(14602);
// EXTERNAL MODULE: ../../node_modules/rehype-raw/lib/index.js + 30 modules
var rehype_raw_lib = __webpack_require__(83326);
// EXTERNAL MODULE: ../../node_modules/rehype-sanitize/lib/index.js + 2 modules
var rehype_sanitize_lib = __webpack_require__(45756);
// EXTERNAL MODULE: ../../node_modules/rehype-slug/lib/index.js + 4 modules
var rehype_slug_lib = __webpack_require__(62487);
// EXTERNAL MODULE: ../../node_modules/remark-gfm/lib/index.js + 56 modules
var remark_gfm_lib = __webpack_require__(37545);
;// ./src/app/components/ReactMarkdownCustom.tsx

const ReactMarkdownCustom_excluded = ["node", "href", "children"];








const ReactMarkdownStyleWrapper = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ReactMarkdownCustom__ReactMarkdownStyleWrapper",
  componentId: "sc-4zddle-0"
})(["overflow-wrap:break-word;", " table{border-spacing:0;border-collapse:collapse;display:block;margin-top:0;margin-bottom:16px;width:max-content;max-width:100%;overflow:auto;}td,th{padding:6px 13px;border:1px solid #434343;}"], props => props.$direction && `
    direction: ${props.$direction};
    text-align: ${props.$direction === 'rtl' ? 'right' : 'left'};
  `);
function ReactMarkdownCustom({
  markdown,
  components,
  allowHtml = false,
  direction
}) {
  // Custom link component that sanitizes URLs
  const defaultComponents = {
    a: _ref => {
      let {
          href,
          children
        } = _ref,
        props = (0,objectWithoutPropertiesLoose/* default */.A)(_ref, ReactMarkdownCustom_excluded);
      const sanitizedHref = sanitizeUrl(href);
      return /*#__PURE__*/(0,jsx_runtime.jsx)("a", Object.assign({
        href: sanitizedHref
      }, props, {
        children: children
      }));
    }
  };

  // Merge provided components with default components
  const mergedComponents = Object.assign({}, defaultComponents, components);

  // Minimal schema: only allow basic formatting tags
  const sanitizeSchema = {
    tagNames: [
    // Headings
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Text formatting
    'p', 'br', 'strong', 'b', 'em', 'i',
    // Lists
    'ul', 'ol', 'li',
    // Blockquotes
    'blockquote',
    // Code
    'code', 'pre',
    // Links
    'a'],
    attributes: {
      a: ['href'] // Only href for links, no other attributes
    },
    protocols: {
      href: ['http', 'https', 'mailto'] // Safe protocols only
    },
    // Explicitly strip dangerous elements
    strip: ['script', 'style', 'iframe', 'object', 'embed', 'img', 'video', 'audio']
  };

  // CRITICAL: rehype-raw MUST come before rehype-sanitize
  const rehypePlugins = allowHtml ? [rehype_slug_lib/* default */.A, rehype_raw_lib/* default */.A, [rehype_sanitize_lib/* default */.A, sanitizeSchema]] : [rehype_slug_lib/* default */.A];
  const remarkPlugins = [remark_gfm_lib/* default */.A];
  return /*#__PURE__*/(0,jsx_runtime.jsx)(ReactMarkdownStyleWrapper, {
    $direction: direction,
    children: /*#__PURE__*/(0,jsx_runtime.jsx)(lib/* Markdown */.oz, {
      children: markdown,
      components: mergedComponents,
      rehypePlugins: rehypePlugins,
      remarkPlugins: remarkPlugins
    })
  });
}
/* harmony default export */ const components_ReactMarkdownCustom = (ReactMarkdownCustom);
;// ./src/app/panel/changelogUtils.ts
function countBulletLines(markdown) {
  return markdown.split(/\r?\n/).filter(line => /^\s*[-*+]\s+/.test(line)).length;
}
function finalizeSection(lines) {
  var _headingMatch$;
  const markdown = lines.join('\n').trim();
  if (!markdown) {
    return null;
  }
  const [firstLine, ...restLines] = markdown.split(/\r?\n/);
  const headingMatch = firstLine.match(/^(#{1,6})\s+(.*)$/);
  const heading = (headingMatch == null || (_headingMatch$ = headingMatch[2]) == null ? void 0 : _headingMatch$.trim()) || '';
  const body = headingMatch ? restLines.join('\n').trim() : markdown;
  return {
    heading,
    markdown,
    body,
    bulletCount: countBulletLines(markdown)
  };
}
function parseChangelogSections(markdown) {
  const normalizedMarkdown = markdown.replace(/\r\n/g, '\n').trim();
  if (!normalizedMarkdown) {
    return [];
  }
  const lines = normalizedMarkdown.split('\n');
  const sections = [];
  let currentLines = [];
  for (const line of lines) {
    if (/^#{1,6}\s+/.test(line) && currentLines.length > 0) {
      const section = finalizeSection(currentLines);
      if (section) {
        sections.push(section);
      }
      currentLines = [line];
      continue;
    }
    currentLines.push(line);
  }
  const lastSection = finalizeSection(currentLines);
  if (lastSection) {
    sections.push(lastSection);
  }
  return sections;
}
function filterChangelogSections(sections, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return sections;
  }
  return sections.filter(section => `${section.heading}\n${section.body}`.toLowerCase().includes(normalizedQuery));
}
function selectChangelogSections(sections, options) {
  const {
    latestOnly = false,
    sectionIndex = null
  } = options;
  if (latestOnly) {
    return sections.length > 0 ? [sections[0]] : [];
  }
  if (sectionIndex !== null && Number.isInteger(sectionIndex) && sectionIndex >= 0 && sectionIndex < sections.length) {
    return [sections[sectionIndex]];
  }
  return sections;
}
;// ./src/app/panel/ChangelogViewer.tsx









const ViewerContainer = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ChangelogViewer__ViewerContainer",
  componentId: "sc-1bzqu5p-0"
})(["display:flex;flex-direction:column;gap:16px;"]);
const SummaryGrid = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ChangelogViewer__SummaryGrid",
  componentId: "sc-1bzqu5p-1"
})(["display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;"]);
const SummaryCard = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ChangelogViewer__SummaryCard",
  componentId: "sc-1bzqu5p-2"
})(["border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px 14px;background:rgba(255,255,255,0.02);"]);
const SummaryLabel = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(typography/* default */.A.Text).withConfig({
  displayName: "ChangelogViewer__SummaryLabel",
  componentId: "sc-1bzqu5p-3"
})(["display:block;color:rgba(255,255,255,0.6);font-size:12px;text-transform:uppercase;letter-spacing:0.04em;"]);
const SummaryValue = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ChangelogViewer__SummaryValue",
  componentId: "sc-1bzqu5p-4"
})(["margin-top:6px;color:rgba(255,255,255,0.92);font-size:18px;font-weight:600;"]);
const SearchInput = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(InputWithContextMenu).withConfig({
  displayName: "ChangelogViewer__SearchInput",
  componentId: "sc-1bzqu5p-5"
})(["max-width:360px;"]);
const ControlsRow = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ChangelogViewer__ControlsRow",
  componentId: "sc-1bzqu5p-6"
})(["display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center;"]);
const ControlsCluster = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ChangelogViewer__ControlsCluster",
  componentId: "sc-1bzqu5p-7"
})(["display:flex;gap:12px;flex-wrap:wrap;align-items:center;"]);
const SectionSelect = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(es_select/* default */.A).withConfig({
  displayName: "ChangelogViewer__SectionSelect",
  componentId: "sc-1bzqu5p-8"
})(["min-width:220px;"]);
const ControlLabel = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(typography/* default */.A.Text).withConfig({
  displayName: "ChangelogViewer__ControlLabel",
  componentId: "sc-1bzqu5p-9"
})(["color:rgba(255,255,255,0.65);"]);
function ChangelogViewer({
  markdown,
  allowHtml = false
}) {
  var _sections$;
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const [filterText, setFilterText] = (0,react.useState)('');
  const [latestOnly, setLatestOnly] = (0,react.useState)(false);
  const [selectedSectionIndex, setSelectedSectionIndex] = (0,react.useState)(null);
  const [copyState, setCopyState] = (0,react.useState)('idle');
  const sections = (0,react.useMemo)(() => parseChangelogSections(markdown), [markdown]);
  const scopedSections = (0,react.useMemo)(() => selectChangelogSections(sections, {
    latestOnly,
    sectionIndex: latestOnly ? null : selectedSectionIndex
  }), [latestOnly, sections, selectedSectionIndex]);
  const visibleSections = (0,react.useMemo)(() => filterChangelogSections(scopedSections, filterText), [scopedSections, filterText]);
  const sectionOptions = (0,react.useMemo)(() => sections.map((section, index) => ({
    value: index,
    label: section.heading || t('changelogViewer.controls.sectionFallback', {
      index: index + 1
    })
  })), [sections, t]);
  const latestHeading = ((_sections$ = sections[0]) == null ? void 0 : _sections$.heading) || t('changelogViewer.latestFallback');
  const totalHighlights = sections.reduce((sum, section) => sum + section.bulletCount, 0);
  const hasScopedSelection = latestOnly || selectedSectionIndex !== null;
  const visibleMarkdown = filterText.trim() || hasScopedSelection ? visibleSections.map(section => section.markdown).join('\n\n') : markdown;
  (0,react.useEffect)(() => {
    if (selectedSectionIndex !== null && (selectedSectionIndex < 0 || selectedSectionIndex >= sections.length)) {
      setSelectedSectionIndex(null);
    }
  }, [sections.length, selectedSectionIndex]);
  (0,react.useEffect)(() => {
    if (copyState === 'idle') {
      return undefined;
    }
    const timeout = window.setTimeout(() => setCopyState('idle'), 1600);
    return () => window.clearTimeout(timeout);
  }, [copyState]);
  const handleCopyVisibleMarkdown = async () => {
    try {
      await copyTextToClipboard(visibleMarkdown);
      setCopyState('copied');
    } catch (error) {
      console.error('Failed to copy changelog:', error);
      setCopyState('failed');
    }
  };
  return /*#__PURE__*/(0,jsx_runtime.jsxs)(ViewerContainer, {
    children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(SummaryGrid, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(SummaryCard, {
        children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SummaryLabel, {
          children: t('changelogViewer.summary.latest')
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(SummaryValue, {
          children: latestHeading
        })]
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(SummaryCard, {
        children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SummaryLabel, {
          children: t('changelogViewer.summary.sections')
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(SummaryValue, {
          children: sections.length
        })]
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(SummaryCard, {
        children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SummaryLabel, {
          children: t('changelogViewer.summary.highlights')
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(SummaryValue, {
          children: totalHighlights
        })]
      })]
    }), /*#__PURE__*/(0,jsx_runtime.jsxs)(ControlsRow, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SearchInput, {
        allowClear: true,
        value: filterText,
        placeholder: t('changelogViewer.searchPlaceholder'),
        onChange: e => setFilterText(e.target.value)
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(ControlsCluster, {
        children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SectionSelect, {
          value: selectedSectionIndex != null ? selectedSectionIndex : undefined,
          allowClear: true,
          placeholder: t('changelogViewer.controls.jumpToRelease'),
          options: sectionOptions,
          disabled: latestOnly || sectionOptions.length === 0,
          onChange: value => setSelectedSectionIndex(typeof value === 'number' ? value : null)
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(ControlLabel, {
          children: t('changelogViewer.controls.latestOnly')
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_switch/* default */.A, {
          checked: latestOnly,
          onChange: setLatestOnly
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
          disabled: !visibleMarkdown.trim(),
          onClick: handleCopyVisibleMarkdown,
          children: copyState === 'copied' ? t('changelogViewer.controls.copied') : copyState === 'failed' ? t('changelogViewer.controls.copyFailed') : t('general.copy')
        })]
      })]
    }), filterText.trim() && !visibleSections.length ? /*#__PURE__*/(0,jsx_runtime.jsx)(empty/* default */.A, {
      image: empty/* default */.A.PRESENTED_IMAGE_SIMPLE,
      description: t('changelogViewer.noMatches')
    }) : /*#__PURE__*/(0,jsx_runtime.jsx)(config_provider/* default */.Ay, {
      direction: "ltr",
      children: /*#__PURE__*/(0,jsx_runtime.jsx)(components_ReactMarkdownCustom, {
        markdown: visibleMarkdown,
        allowHtml: allowHtml,
        direction: "ltr"
      })
    })]
  });
}
/* harmony default export */ const panel_ChangelogViewer = (ChangelogViewer);
;// ./src/app/panel/ChangelogModal.tsx







const CHANGELOG_URL = 'https://ramensoftware.com/downloads/windhawk_setup.exe?version&changelog';
const ModalContent = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ChangelogModal__ModalContent",
  componentId: "sc-1t52kco-0"
})(["max-height:60vh;overflow-y:auto;padding:16px 0;"]);
const LoadingContainer = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ChangelogModal__LoadingContainer",
  componentId: "sc-1t52kco-1"
})(["display:flex;justify-content:center;align-items:center;padding:40px;"]);
function ChangelogModal(props) {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const [changelog, setChangelog] = (0,react.useState)('');
  const [loading, setLoading] = (0,react.useState)(false);
  const [hasError, setHasError] = (0,react.useState)(false);
  const fetchStatusRef = (0,react.useRef)('idle');
  (0,react.useEffect)(() => {
    // Fetch when modal opens if we haven't successfully fetched yet
    // On error, allow retry when modal is reopened (not immediate retry)
    if (props.open && fetchStatusRef.current !== 'success' && fetchStatusRef.current !== 'loading') {
      fetchStatusRef.current = 'loading';
      setLoading(true);
      setHasError(false);
      fetchText(CHANGELOG_URL).then(textWithNull => {
        const text = textWithNull.split('\0', 2)[1] || '';
        setChangelog(text);
        fetchStatusRef.current = 'success';
        setLoading(false);
      }).catch(err => {
        console.error('Failed to fetch changelog:', err);
        setHasError(true);
        fetchStatusRef.current = 'error';
        setLoading(false);
      });
    }
  }, [props.open]);
  return /*#__PURE__*/(0,jsx_runtime.jsx)(modal/* default */.A, {
    open: props.open,
    onCancel: props.onClose,
    onOk: props.onClose,
    cancelButtonProps: {
      style: {
        display: 'none'
      }
    },
    okText: t('about.changelog.close'),
    title: t('about.changelog.title'),
    width: 700,
    centered: true,
    children: /*#__PURE__*/(0,jsx_runtime.jsxs)(ModalContent, {
      children: [loading && /*#__PURE__*/(0,jsx_runtime.jsx)(LoadingContainer, {
        children: /*#__PURE__*/(0,jsx_runtime.jsx)(spin/* default */.A, {})
      }), hasError && /*#__PURE__*/(0,jsx_runtime.jsx)(result/* default */.Ay, {
        status: "error",
        title: t('general.loadingFailedTitle'),
        subTitle: t('general.loadingFailedSubtitle')
      }), changelog && !loading && !hasError && /*#__PURE__*/(0,jsx_runtime.jsx)(panel_ChangelogViewer, {
        markdown: changelog,
        allowHtml: true
      })]
    })
  });
}
// EXTERNAL MODULE: ../../node_modules/antd/es/progress/index.js + 10 modules
var progress = __webpack_require__(54027);
;// ./src/app/panel/UpdateModal.tsx






const UpdateModal_ModalContent = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "UpdateModal__ModalContent",
  componentId: "sc-1ywz8ff-0"
})(["display:flex;flex-direction:column;gap:16px;padding:16px 0;"]);
const StatusMessage = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "UpdateModal__StatusMessage",
  componentId: "sc-1ywz8ff-1"
})(["text-align:center;font-size:16px;"]);
const Note = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "UpdateModal__Note",
  componentId: "sc-1ywz8ff-2"
})(["text-align:center;color:var(--vscode-descriptionForeground,#9d9d9d);font-size:14px;"]);
function UpdateModal(props) {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const [status, setStatus] = (0,react.useState)('idle');
  const [downloadProgress, setDownloadProgress] = (0,react.useState)(0);
  const [errorMessage, setErrorMessage] = (0,react.useState)('');
  const resetState = (0,react.useCallback)(() => {
    setStatus('idle');
    setDownloadProgress(0);
    setErrorMessage('');
  }, []);
  const resetAndClose = (0,react.useCallback)(() => {
    resetState();
    props.onClose();
  }, [props, resetState]);
  const {
    startUpdate
  } = useStartUpdate((0,react.useCallback)(data => {
    if (!data.succeeded) {
      setStatus('failed');
      setErrorMessage(data.error || 'Unknown error');
    }

    // At this point, the installer was started successfully.
  }, []));

  // Listen for update progress events
  useUpdateDownloadProgress((0,react.useCallback)(data => {
    setStatus('downloading');
    setDownloadProgress(data.progress);
  }, []));
  useUpdateInstalling((0,react.useCallback)(() => {
    setStatus('installing');
  }, []));

  // Start update when modal opens
  (0,react.useEffect)(() => {
    if (props.open) {
      resetState();
      startUpdate({});
    }
  }, [props.open, resetState, startUpdate]);
  const {
    cancelUpdate
  } = useCancelUpdate((0,react.useCallback)(data => {
    if (data.succeeded) {
      resetAndClose();
    }
    // If cancellation failed, stay in current state and let user try again
  }, [resetAndClose]));
  const canCancel = status === 'downloading';
  const canClose = status === 'installing' || status === 'failed';
  const showProgress = status === 'downloading' || status === 'idle';
  const handleCancel = () => {
    if (canCancel) {
      cancelUpdate({});
    } else if (canClose) {
      resetAndClose();
    }
  };
  return /*#__PURE__*/(0,jsx_runtime.jsx)(modal/* default */.A, {
    open: props.open,
    onCancel: canClose ? handleCancel : undefined,
    closable: canClose,
    maskClosable: false,
    footer: canCancel ? [/*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
      type: "primary",
      danger: true,
      onClick: handleCancel,
      children: t('about.update.modal.cancel')
    })] : null,
    title: t('about.update.modal.title'),
    width: 500,
    centered: true,
    children: /*#__PURE__*/(0,jsx_runtime.jsx)(UpdateModal_ModalContent, {
      children: status === 'failed' ? /*#__PURE__*/(0,jsx_runtime.jsx)(result/* default */.Ay, {
        status: "error",
        title: t('about.update.modal.failed'),
        subTitle: errorMessage
      }) : /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
        children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(StatusMessage, {
          children: [status === 'downloading' && t('about.update.modal.downloading'), status === 'installing' && t('about.update.modal.installing')]
        }), showProgress && /*#__PURE__*/(0,jsx_runtime.jsx)(progress/* default */.A, {
          percent: downloadProgress,
          status: "active"
        }), status === 'installing' && /*#__PURE__*/(0,jsx_runtime.jsx)(Note, {
          children: t('about.update.modal.installingNote')
        })]
      })
    })
  });
}
;// ./src/app/panel/About.tsx










const AboutContainer = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "About__AboutContainer",
  componentId: "sc-iz6ptl-0"
})(["padding:8px 0 32px;"]);
const HeroCard = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.section.withConfig({
  displayName: "About__HeroCard",
  componentId: "sc-iz6ptl-1"
})(["margin-bottom:var(--app-section-gap);padding:calc(var(--app-card-padding) + 4px);border:1px solid var(--app-surface-border);border-radius:var(--app-surface-radius);background:radial-gradient(circle at top right,rgba(23,125,220,0.18),transparent 36%),radial-gradient(circle at bottom left,rgba(255,255,255,0.08),transparent 30%),var(--app-surface-background);box-shadow:var(--app-surface-shadow);"]);
const HeroEyebrow = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "About__HeroEyebrow",
  componentId: "sc-iz6ptl-2"
})(["color:rgba(255,255,255,0.58);font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;"]);
const HeroTitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.h1.withConfig({
  displayName: "About__HeroTitle",
  componentId: "sc-iz6ptl-3"
})(["margin:10px 0 8px;font-size:34px;line-height:1.05;"]);
const HeroSubtitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.p.withConfig({
  displayName: "About__HeroSubtitle",
  componentId: "sc-iz6ptl-4"
})(["margin-bottom:8px;color:rgba(255,255,255,0.78);font-size:18px;"]);
const HeroDescription = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.p.withConfig({
  displayName: "About__HeroDescription",
  componentId: "sc-iz6ptl-5"
})(["max-width:760px;margin-bottom:18px;color:rgba(255,255,255,0.64);"]);
const HeroActionRow = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "About__HeroActionRow",
  componentId: "sc-iz6ptl-6"
})(["display:flex;flex-wrap:wrap;gap:12px;margin-top:18px;"]);
const HeroAlert = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(es_alert/* default */.A).withConfig({
  displayName: "About__HeroAlert",
  componentId: "sc-iz6ptl-7"
})(["margin-top:18px;"]);
const AboutGrid = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "About__AboutGrid",
  componentId: "sc-iz6ptl-8"
})(["display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:var(--app-section-gap);"]);
const SectionCard = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(card/* default */.A).withConfig({
  displayName: "About__SectionCard",
  componentId: "sc-iz6ptl-9"
})(["border:1px solid var(--app-surface-border);border-radius:var(--app-surface-radius);background:var(--app-surface-background);box-shadow:var(--app-surface-shadow);.ant-card-body{padding:var(--app-card-padding);}"]);
const SectionHeading = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "About__SectionHeading",
  componentId: "sc-iz6ptl-10"
})(["margin-bottom:16px;"]);
const SectionTitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.h2.withConfig({
  displayName: "About__SectionTitle",
  componentId: "sc-iz6ptl-11"
})(["margin:0 0 6px;font-size:18px;"]);
const SectionDescription = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.p.withConfig({
  displayName: "About__SectionDescription",
  componentId: "sc-iz6ptl-12"
})(["margin:0;color:rgba(255,255,255,0.62);"]);
const StatusRow = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "About__StatusRow",
  componentId: "sc-iz6ptl-13"
})(["display:flex;flex-wrap:wrap;gap:10px;"]);
const StatusPill = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.span.withConfig({
  displayName: "About__StatusPill",
  componentId: "sc-iz6ptl-14"
})(["position:relative;display:inline-flex;align-items:center;min-height:var(--app-status-pill-height);padding:0 14px 0 30px;border:1px solid rgba(255,255,255,0.08);border-radius:999px;background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.88);font-size:12px;font-weight:600;&::before{content:'';position:absolute;left:12px;width:8px;height:8px;border-radius:999px;background:", ";}"], ({
  $tone
}) => {
  switch ($tone) {
    case 'success':
      return '#73d13d';
    case 'error':
      return '#ff7875';
    case 'warning':
      return '#ffc53d';
    default:
      return '#69c0ff';
  }
});
const SummaryList = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "About__SummaryList",
  componentId: "sc-iz6ptl-15"
})(["display:flex;flex-direction:column;"]);
const SummaryRow = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "About__SummaryRow",
  componentId: "sc-iz6ptl-16"
})(["display:flex;justify-content:space-between;gap:16px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);&:last-child{padding-bottom:0;border-bottom:0;}"]);
const About_SummaryLabel = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "About__SummaryLabel",
  componentId: "sc-iz6ptl-17"
})(["color:rgba(255,255,255,0.62);"]);
const About_SummaryValue = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "About__SummaryValue",
  componentId: "sc-iz6ptl-18"
})(["color:rgba(255,255,255,0.92);font-weight:600;text-align:right;"]);
const ResourceList = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "About__ResourceList",
  componentId: "sc-iz6ptl-19"
})(["display:flex;flex-direction:column;gap:12px;"]);
const ResourceItem = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.a.withConfig({
  displayName: "About__ResourceItem",
  componentId: "sc-iz6ptl-20"
})(["display:flex;justify-content:space-between;gap:16px;padding:14px 16px;color:inherit;border:1px solid rgba(255,255,255,0.08);border-radius:14px;background:rgba(255,255,255,0.04);transition:border-color 0.2s ease,background-color 0.2s ease;&:hover{color:inherit;border-color:rgba(23,125,220,0.35);background:rgba(23,125,220,0.08);}"]);
const ResourceLabel = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.span.withConfig({
  displayName: "About__ResourceLabel",
  componentId: "sc-iz6ptl-21"
})(["font-weight:600;"]);
const ResourceUrl = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.span.withConfig({
  displayName: "About__ResourceUrl",
  componentId: "sc-iz6ptl-22"
})(["color:rgba(255,255,255,0.5);font-size:12px;"]);
const BuiltWithList = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "About__BuiltWithList",
  componentId: "sc-iz6ptl-23"
})(["display:flex;flex-direction:column;gap:12px;"]);
const BuiltWithItemRow = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "About__BuiltWithItemRow",
  componentId: "sc-iz6ptl-24"
})(["padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.06);&:last-child{padding-bottom:0;border-bottom:0;}"]);
const BuiltWithLabel = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "About__BuiltWithLabel",
  componentId: "sc-iz6ptl-25"
})(["margin-bottom:4px;font-weight:600;"]);
const DiagnosticsNotice = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(es_alert/* default */.A).withConfig({
  displayName: "About__DiagnosticsNotice",
  componentId: "sc-iz6ptl-26"
})(["margin-bottom:16px;"]);
const DiagnosticsPathList = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "About__DiagnosticsPathList",
  componentId: "sc-iz6ptl-27"
})(["display:flex;flex-direction:column;gap:10px;margin-top:18px;"]);
const DiagnosticsPathItem = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "About__DiagnosticsPathItem",
  componentId: "sc-iz6ptl-28"
})(["padding:12px 14px;border:1px solid rgba(255,255,255,0.08);border-radius:14px;background:rgba(255,255,255,0.04);"]);
const DiagnosticsPathLabel = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "About__DiagnosticsPathLabel",
  componentId: "sc-iz6ptl-29"
})(["margin-bottom:4px;color:rgba(255,255,255,0.6);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;"]);
const DiagnosticsPathValue = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "About__DiagnosticsPathValue",
  componentId: "sc-iz6ptl-30"
})(["color:rgba(255,255,255,0.9);font-family:'Cascadia Mono',Consolas,monospace;font-size:12px;line-height:1.5;word-break:break-all;"]);
const DiagnosticsPathActions = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "About__DiagnosticsPathActions",
  componentId: "sc-iz6ptl-31"
})(["display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;"]);
const QuickActionsGrid = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "About__QuickActionsGrid",
  componentId: "sc-iz6ptl-32"
})(["display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;"]);
const QuickActionCard = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.button.withConfig({
  displayName: "About__QuickActionCard",
  componentId: "sc-iz6ptl-33"
})(["padding:14px 16px;text-align:left;color:inherit;border:1px solid rgba(255,255,255,0.08);border-radius:14px;background:rgba(255,255,255,0.04);cursor:pointer;transition:border-color 0.2s ease,background-color 0.2s ease,transform 0.2s ease;&:hover{border-color:rgba(23,125,220,0.35);background:rgba(23,125,220,0.08);transform:translateY(-1px);}&:disabled{cursor:wait;opacity:0.7;transform:none;}"]);
const QuickActionTitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "About__QuickActionTitle",
  componentId: "sc-iz6ptl-34"
})(["margin-bottom:6px;font-weight:600;"]);
const QuickActionDescription = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "About__QuickActionDescription",
  componentId: "sc-iz6ptl-35"
})(["color:rgba(255,255,255,0.66);line-height:1.45;"]);
function copyText(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  let successful = false;
  try {
    successful = document.execCommand('copy');
  } finally {
    document.body.removeChild(textArea);
  }
  return successful;
}
function About() {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const [changelogModalOpen, setChangelogModalOpen] = (0,react.useState)(false);
  const [updateModalOpen, setUpdateModalOpen] = (0,react.useState)(false);
  const [appSettings, setAppSettings] = (0,react.useState)(mockSettings);
  const [runtimeDiagnostics, setRuntimeDiagnostics] = (0,react.useState)(mockRuntimeDiagnostics);
  const {
    language,
    devModeOptOut,
    loggingEnabled,
    localUISettings,
    safeMode,
    updateIsAvailable
  } = (0,react.useContext)(AppUISettingsContext);
  const {
    getAppSettings
  } = useGetAppSettings((0,react.useCallback)(data => {
    setAppSettings(data.appSettings);
    setRuntimeDiagnostics(data.runtimeDiagnostics || null);
  }, []));
  const {
    repairRuntimeConfig,
    repairRuntimeConfigPending
  } = useRepairRuntimeConfig((0,react.useCallback)(data => {
    if (data.succeeded) {
      setRuntimeDiagnostics(data.runtimeDiagnostics || null);
      message/* default */.Ay.success(t('about.runtime.actions.repairSuccess'));
      return;
    }
    message/* default */.Ay.error(data.error || t('about.runtime.actions.repairFailed'));
  }, [t]));
  const {
    openExternal,
    openExternalPending
  } = useOpenExternal((0,react.useCallback)(data => {
    if (!data.succeeded) {
      message/* default */.Ay.error(data.error || t('about.actions.openError'));
    }
  }, [t]));
  const {
    openPath,
    openPathPending
  } = useOpenPath((0,react.useCallback)(data => {
    if (!data.succeeded) {
      message/* default */.Ay.error(data.error || t('about.actions.openError'));
    }
  }, [t]));
  (0,react.useEffect)(() => {
    getAppSettings({});
  }, [getAppSettings]);
  const currentVersion = ("1.7.3" || 0).replace(/^(\d+(?:\.\d+)+?)(\.0+)+$/, '$1');
  const performanceProfileLabel = (0,react.useCallback)(profile => {
    switch (profile) {
      case 'responsive':
        return t('settings.performance.profile.options.responsive');
      case 'efficient':
        return t('settings.performance.profile.options.efficient');
      case 'balanced':
      default:
        return t('settings.performance.profile.options.balanced');
    }
  }, [t]);
  const aiAccelerationLabel = (0,react.useCallback)(preference => {
    switch (preference) {
      case 'prefer-npu':
        return t('settings.performance.aiAcceleration.options.preferNpu');
      case 'off':
        return t('settings.performance.aiAcceleration.options.off');
      case 'auto':
      default:
        return t('settings.performance.aiAcceleration.options.auto');
    }
  }, [t]);
  const workspaceItems = (0,react.useMemo)(() => [{
    label: t('about.workspace.language'),
    value: language || (appSettings == null ? void 0 : appSettings.language) || 'en'
  }, {
    label: t('about.workspace.updateChecks'),
    value: appSettings != null && appSettings.disableUpdateCheck ? t('about.values.disabled') : t('about.values.enabled')
  }, {
    label: t('about.workspace.developerMode'),
    value: devModeOptOut ? t('about.values.hidden') : t('about.values.visible')
  }, {
    label: t('about.workspace.compileLocally'),
    value: appSettings != null && appSettings.alwaysCompileModsLocally ? t('about.values.enabled') : t('about.values.disabled')
  }, {
    label: t('about.workspace.trayIcon'),
    value: appSettings != null && appSettings.hideTrayIcon ? t('about.values.hidden') : t('about.values.visible')
  }, {
    label: t('about.workspace.toolkitDialog'),
    value: appSettings != null && appSettings.dontAutoShowToolkit ? t('about.values.manual') : t('about.values.automatic')
  }, {
    label: t('about.workspace.interfaceDensity'),
    value: localUISettings.interfaceDensity === 'compact' ? t('settings.interface.layoutDensity.compact') : t('settings.interface.layoutDensity.comfortable')
  }, {
    label: t('about.workspace.layoutWidth'),
    value: localUISettings.useWideLayout ? t('about.values.wide') : t('about.values.standard')
  }, {
    label: t('about.workspace.motion'),
    value: localUISettings.reduceMotion ? t('about.values.reduced') : t('about.values.standard')
  }, {
    label: t('about.workspace.performanceProfile'),
    value: performanceProfileLabel(localUISettings.performanceProfile)
  }, {
    label: t('about.workspace.aiAcceleration'),
    value: aiAccelerationLabel(localUISettings.aiAccelerationPreference)
  }], [aiAccelerationLabel, appSettings, devModeOptOut, language, localUISettings, performanceProfileLabel, t]);
  const runtimeModeLabel = (0,react.useCallback)(portable => {
    if (portable === null || portable === undefined) {
      return t('about.runtime.values.missing');
    }
    return portable ? t('about.runtime.values.portable') : t('about.runtime.values.installed');
  }, [t]);
  const runtimeIssueText = (0,react.useMemo)(() => {
    if (!runtimeDiagnostics) {
      return null;
    }
    switch (runtimeDiagnostics.issueCode) {
      case 'engine-config-missing':
        return t('about.runtime.issue.engineConfigMissing');
      case 'engine-storage-mismatch':
        return t('about.runtime.issue.engineStorageMismatch');
      default:
        return t('about.runtime.issue.none');
    }
  }, [runtimeDiagnostics, t]);
  const statusItems = (0,react.useMemo)(() => {
    const items = [{
      key: 'update',
      text: updateIsAvailable ? t('about.status.updateAvailable') : t('about.status.upToDate'),
      tone: updateIsAvailable ? 'error' : 'success'
    }, {
      key: 'safe-mode',
      text: safeMode ? t('about.status.safeModeOn') : t('about.status.safeModeOff'),
      tone: safeMode ? 'warning' : 'success'
    }, {
      key: 'logging',
      text: loggingEnabled ? t('about.status.loggingOn') : t('about.status.loggingOff'),
      tone: loggingEnabled ? 'warning' : 'default'
    }, {
      key: 'dev-mode',
      text: devModeOptOut ? t('about.status.devModeOff') : t('about.status.devModeOn'),
      tone: devModeOptOut ? 'default' : 'success'
    }];
    if (runtimeDiagnostics) {
      items.push({
        key: 'runtime-storage',
        text: runtimeDiagnostics.engineConfigMatchesAppConfig ? t('about.status.storageAligned') : t('about.status.storageMismatch'),
        tone: runtimeDiagnostics.engineConfigMatchesAppConfig ? 'success' : 'error'
      });
    }
    return items;
  }, [devModeOptOut, loggingEnabled, runtimeDiagnostics, safeMode, t, updateIsAvailable]);
  const runtimeSummaryItems = (0,react.useMemo)(() => runtimeDiagnostics ? [{
    label: t('about.runtime.modes.platform'),
    value: runtimeDiagnostics.platformArch
  }, {
    label: t('about.runtime.modes.appMode'),
    value: runtimeModeLabel(runtimeDiagnostics.portable)
  }, {
    label: t('about.runtime.modes.engineMode'),
    value: runtimeModeLabel(runtimeDiagnostics.enginePortable)
  }, {
    label: t('about.runtime.modes.arm64'),
    value: runtimeDiagnostics.arm64Enabled ? t('about.values.enabled') : t('about.values.disabled')
  }] : [], [runtimeDiagnostics, runtimeModeLabel, t]);
  const windowsSummaryItems = (0,react.useMemo)(() => runtimeDiagnostics ? [{
    label: t('about.windows.summary.version'),
    value: runtimeDiagnostics.windowsProductName || t('about.runtime.values.missing')
  }, {
    label: t('about.windows.summary.release'),
    value: runtimeDiagnostics.windowsDisplayVersion || t('about.runtime.values.missing')
  }, {
    label: t('about.windows.summary.build'),
    value: runtimeDiagnostics.windowsBuild
  }, {
    label: t('about.windows.summary.memory'),
    value: `${runtimeDiagnostics.totalMemoryGb} GB`
  }, {
    label: t('about.windows.summary.npu'),
    value: runtimeDiagnostics.npuName || (runtimeDiagnostics.npuDetected ? t('about.windows.values.detected') : t('about.windows.values.none'))
  }, {
    label: t('about.windows.summary.installationType'),
    value: runtimeDiagnostics.windowsInstallationType || t('about.runtime.values.missing')
  }, {
    label: t('about.windows.summary.session'),
    value: runtimeDiagnostics.isElevated === null ? t('about.runtime.values.missing') : runtimeDiagnostics.isElevated ? t('about.windows.values.elevated') : t('about.windows.values.standard')
  }, {
    label: t('about.windows.summary.host'),
    value: runtimeDiagnostics.hostName
  }, {
    label: t('about.windows.summary.user'),
    value: runtimeDiagnostics.userName || t('about.runtime.values.missing')
  }] : [], [runtimeDiagnostics, t]);
  const runtimePathItems = (0,react.useMemo)(() => runtimeDiagnostics ? [{
    key: 'app-root',
    label: t('about.runtime.paths.appRoot'),
    value: runtimeDiagnostics.appRootPath,
    openPath: runtimeDiagnostics.appRootPath
  }, {
    key: 'app-data',
    label: t('about.runtime.paths.appData'),
    value: runtimeDiagnostics.appDataPath,
    openPath: runtimeDiagnostics.appDataPath
  }, {
    key: 'expected-engine-data',
    label: t('about.runtime.paths.expectedEngineData'),
    value: runtimeDiagnostics.expectedEngineAppDataPath,
    openPath: runtimeDiagnostics.expectedEngineAppDataPath
  }, {
    key: 'actual-engine-data',
    label: t('about.runtime.paths.actualEngineData'),
    value: runtimeDiagnostics.engineAppDataPath || t('about.runtime.values.missing'),
    openPath: runtimeDiagnostics.engineAppDataPath
  }, {
    key: 'engine',
    label: t('about.runtime.paths.engine'),
    value: runtimeDiagnostics.enginePath,
    openPath: runtimeDiagnostics.enginePath
  }, {
    key: 'expected-engine-registry',
    label: t('about.runtime.paths.expectedEngineRegistry'),
    value: runtimeDiagnostics.expectedEngineRegistryKey || t('about.runtime.values.missing')
  }, {
    key: 'actual-engine-registry',
    label: t('about.runtime.paths.actualEngineRegistry'),
    value: runtimeDiagnostics.engineRegistryKey || t('about.runtime.values.missing')
  }, {
    key: 'compiler',
    label: t('about.runtime.paths.compiler'),
    value: runtimeDiagnostics.compilerPath,
    openPath: runtimeDiagnostics.compilerPath
  }, {
    key: 'ui',
    label: t('about.runtime.paths.ui'),
    value: runtimeDiagnostics.uiPath,
    openPath: runtimeDiagnostics.uiPath
  }] : [], [runtimeDiagnostics, t]);
  const windowsPathItems = (0,react.useMemo)(() => runtimeDiagnostics ? [{
    key: 'windows-directory',
    label: t('about.windows.paths.windowsDirectory'),
    value: runtimeDiagnostics.windowsDirectory || t('about.runtime.values.missing'),
    openPath: runtimeDiagnostics.windowsDirectory
  }, {
    key: 'temp-directory',
    label: t('about.windows.paths.tempDirectory'),
    value: runtimeDiagnostics.tempDirectory,
    openPath: runtimeDiagnostics.tempDirectory
  }] : [], [runtimeDiagnostics, t]);
  const supportSnapshot = (0,react.useMemo)(() => [`Windhawk ${currentVersion}`, runtimeDiagnostics != null && runtimeDiagnostics.windowsProductName ? `Windows: ${runtimeDiagnostics.windowsProductName}` : null, runtimeDiagnostics != null && runtimeDiagnostics.windowsDisplayVersion ? `Windows release: ${runtimeDiagnostics.windowsDisplayVersion}` : null, runtimeDiagnostics ? `Windows build: ${runtimeDiagnostics.windowsBuild}` : null, runtimeDiagnostics ? `Session elevation: ${runtimeDiagnostics.isElevated === null ? t('about.runtime.values.missing') : runtimeDiagnostics.isElevated ? t('about.windows.values.elevated') : t('about.windows.values.standard')}` : null, runtimeDiagnostics ? `Host: ${runtimeDiagnostics.hostName}` : null, `Language: ${language || (appSettings == null ? void 0 : appSettings.language) || 'en'}`, `Update available: ${updateIsAvailable ? t('about.values.enabled') : t('about.values.disabled')}`, `Update checks: ${appSettings != null && appSettings.disableUpdateCheck ? t('about.values.disabled') : t('about.values.enabled')}`, `Developer mode: ${devModeOptOut ? t('about.values.hidden') : t('about.values.visible')}`, `Safe mode: ${safeMode ? t('about.values.enabled') : t('about.values.disabled')}`, `Debug logging: ${loggingEnabled ? t('about.values.enabled') : t('about.values.disabled')}`, `Interface density: ${localUISettings.interfaceDensity === 'compact' ? t('settings.interface.layoutDensity.compact') : t('settings.interface.layoutDensity.comfortable')}`, `Layout width: ${localUISettings.useWideLayout ? t('about.values.wide') : t('about.values.standard')}`, `Motion: ${localUISettings.reduceMotion ? t('about.values.reduced') : t('about.values.standard')}`, runtimeDiagnostics ? `Runtime storage: ${runtimeDiagnostics.engineConfigMatchesAppConfig ? t('about.runtime.values.aligned') : t('about.runtime.values.mismatched')}` : null, runtimeDiagnostics ? `Runtime platform: ${runtimeDiagnostics.platformArch}` : null, runtimeDiagnostics ? `Runtime mode: ${runtimeModeLabel(runtimeDiagnostics.portable)}` : null].filter(Boolean).join('\n'), [appSettings == null ? void 0 : appSettings.disableUpdateCheck, appSettings == null ? void 0 : appSettings.language, currentVersion, devModeOptOut, language, localUISettings.interfaceDensity, localUISettings.reduceMotion, localUISettings.useWideLayout, loggingEnabled, runtimeDiagnostics, runtimeModeLabel, safeMode, t, updateIsAvailable]);
  const copySupportSnapshot = (0,react.useCallback)(() => {
    if (copyText(supportSnapshot)) {
      message/* default */.Ay.success(t('about.actions.copySuccess'));
    } else {
      message/* default */.Ay.error(t('about.actions.copyError'));
    }
  }, [supportSnapshot, t]);
  const copyTextWithFeedback = (0,react.useCallback)(text => {
    if (copyText(text)) {
      message/* default */.Ay.success(t('about.actions.copyPathSuccess'));
    } else {
      message/* default */.Ay.error(t('about.actions.copyPathError'));
    }
  }, [t]);
  const openPathInShell = (0,react.useCallback)(targetPath => {
    openPath({
      path: targetPath
    });
  }, [openPath]);
  const openUri = (0,react.useCallback)(uri => {
    openExternal({
      uri
    });
  }, [openExternal]);
  const windowsQuickActions = (0,react.useMemo)(() => runtimeDiagnostics ? [{
    key: 'windows-update',
    title: t('about.windows.actions.windowsUpdate.title'),
    description: t('about.windows.actions.windowsUpdate.description'),
    kind: 'uri',
    target: 'ms-settings:windowsupdate'
  }, {
    key: 'taskbar-settings',
    title: t('about.windows.actions.taskbar.title'),
    description: t('about.windows.actions.taskbar.description'),
    kind: 'uri',
    target: 'ms-settings:personalization-taskbar'
  }, {
    key: 'start-settings',
    title: t('about.windows.actions.start.title'),
    description: t('about.windows.actions.start.description'),
    kind: 'uri',
    target: 'ms-settings:personalization-start'
  }, {
    key: 'notification-settings',
    title: t('about.windows.actions.notifications.title'),
    description: t('about.windows.actions.notifications.description'),
    kind: 'uri',
    target: 'ms-settings:notifications'
  }, {
    key: 'multitasking-settings',
    title: t('about.windows.actions.multitasking.title'),
    description: t('about.windows.actions.multitasking.description'),
    kind: 'uri',
    target: 'ms-settings:multitasking'
  }, {
    key: 'colors-settings',
    title: t('about.windows.actions.colors.title'),
    description: t('about.windows.actions.colors.description'),
    kind: 'uri',
    target: 'ms-settings:colors'
  }, {
    key: 'background-settings',
    title: t('about.windows.actions.background.title'),
    description: t('about.windows.actions.background.description'),
    kind: 'uri',
    target: 'ms-settings:personalization-background'
  }, {
    key: 'themes-settings',
    title: t('about.windows.actions.themes.title'),
    description: t('about.windows.actions.themes.description'),
    kind: 'uri',
    target: 'ms-settings:themes'
  }, {
    key: 'lockscreen-settings',
    title: t('about.windows.actions.lockScreen.title'),
    description: t('about.windows.actions.lockScreen.description'),
    kind: 'uri',
    target: 'ms-settings:lockscreen'
  }, {
    key: 'clipboard-settings',
    title: t('about.windows.actions.clipboard.title'),
    description: t('about.windows.actions.clipboard.description'),
    kind: 'uri',
    target: 'ms-settings:clipboard'
  }, {
    key: 'startup-apps',
    title: t('about.windows.actions.startupApps.title'),
    description: t('about.windows.actions.startupApps.description'),
    kind: 'uri',
    target: 'ms-settings:startupapps'
  }, {
    key: 'sound-settings',
    title: t('about.windows.actions.sound.title'),
    description: t('about.windows.actions.sound.description'),
    kind: 'uri',
    target: 'ms-settings:sound'
  }, {
    key: 'app-data-folder',
    title: t('about.windows.actions.appData.title'),
    description: t('about.windows.actions.appData.description'),
    kind: 'path',
    target: runtimeDiagnostics.appDataPath
  }, {
    key: 'engine-folder',
    title: t('about.windows.actions.engine.title'),
    description: t('about.windows.actions.engine.description'),
    kind: 'path',
    target: runtimeDiagnostics.enginePath
  }] : [], [runtimeDiagnostics, t]);
  const links = (0,react.useMemo)(() => [{
    key: 'homepage',
    label: t('about.links.homepage'),
    href: 'https://windhawk.net/'
  }, {
    key: 'documentation',
    label: t('about.links.documentation'),
    href: 'https://github.com/ramensoftware/windhawk/wiki'
  }, {
    key: 'github',
    label: t('about.links.github'),
    href: 'https://github.com/ramensoftware/windhawk'
  }, {
    key: 'translations',
    label: t('about.links.translations'),
    href: 'https://github.com/ramensoftware/windhawk/wiki/translations'
  }], [t]);
  const builtWithItems = (0,react.useMemo)(() => [{
    key: 'vscodium',
    label: 'VSCodium',
    href: 'https://github.com/VSCodium/vscodium',
    description: t('about.builtWith.vscodium')
  }, {
    key: 'llvm-mingw',
    label: 'LLVM MinGW',
    href: 'https://github.com/mstorsjo/llvm-mingw',
    description: t('about.builtWith.llvmMingw')
  }, {
    key: 'minhook',
    label: 'MinHook-Detours',
    href: 'https://github.com/m417z/minhook-detours',
    description: t('about.builtWith.minHook')
  }, {
    key: 'others',
    description: t('about.builtWith.others')
  }], [t]);
  return /*#__PURE__*/(0,jsx_runtime.jsxs)(AboutContainer, {
    children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(HeroCard, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(HeroEyebrow, {
        children: t('about.eyebrow')
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(HeroTitle, {
        children: t('about.title', {
          version: currentVersion
        })
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(HeroSubtitle, {
        children: t('about.subtitle')
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(HeroDescription, {
        children: t('about.pageDescription')
      }), /*#__PURE__*/(0,jsx_runtime.jsx)("div", {
        children: /*#__PURE__*/(0,jsx_runtime.jsx)(es/* Trans */.x6, {
          t: t,
          i18nKey: "about.credit",
          values: {
            author: 'Ramen Software'
          },
          components: [/*#__PURE__*/(0,jsx_runtime.jsx)("a", {
            href: "https://ramensoftware.com/",
            children: "website"
          })]
        })
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(HeroActionRow, {
        children: [/*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
          onClick: () => setChangelogModalOpen(true),
          children: t('about.actions.changelog')
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
          onClick: () => copySupportSnapshot(),
          children: t('about.actions.copySupport')
        }), updateIsAvailable && /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
          type: "primary",
          onClick: () => setUpdateModalOpen(true),
          children: t('about.update.updateButton')
        })]
      }), updateIsAvailable && /*#__PURE__*/(0,jsx_runtime.jsx)(HeroAlert, {
        message: /*#__PURE__*/(0,jsx_runtime.jsx)("strong", {
          children: t('about.update.title')
        }),
        description: t('about.update.subtitle'),
        type: "info",
        showIcon: true
      })]
    }), /*#__PURE__*/(0,jsx_runtime.jsxs)(AboutGrid, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(SectionCard, {
        bordered: false,
        children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(SectionHeading, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SectionTitle, {
            children: t('about.status.title')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(SectionDescription, {
            children: t('about.status.description')
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(StatusRow, {
          children: statusItems.map(({
            key,
            text,
            tone
          }) => /*#__PURE__*/(0,jsx_runtime.jsx)(StatusPill, {
            $tone: tone,
            children: text
          }, key))
        })]
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(SectionCard, {
        bordered: false,
        children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(SectionHeading, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SectionTitle, {
            children: t('about.workspace.title')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(SectionDescription, {
            children: t('about.workspace.description')
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(SummaryList, {
          children: workspaceItems.map(({
            label,
            value
          }) => /*#__PURE__*/(0,jsx_runtime.jsxs)(SummaryRow, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(About_SummaryLabel, {
              children: label
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(About_SummaryValue, {
              children: value
            })]
          }, label))
        })]
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(SectionCard, {
        bordered: false,
        children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(SectionHeading, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SectionTitle, {
            children: t('about.runtime.title')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(SectionDescription, {
            children: t('about.runtime.description')
          })]
        }), runtimeDiagnostics && runtimeIssueText && /*#__PURE__*/(0,jsx_runtime.jsx)(DiagnosticsNotice, {
          message: /*#__PURE__*/(0,jsx_runtime.jsx)("strong", {
            children: runtimeIssueText
          }),
          description: runtimeDiagnostics.engineConfigMatchesAppConfig ? undefined : t('about.runtime.issue.fixHint'),
          type: runtimeDiagnostics.engineConfigMatchesAppConfig ? 'success' : 'warning',
          showIcon: true
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(SummaryList, {
          children: runtimeSummaryItems.map(({
            label,
            value
          }) => /*#__PURE__*/(0,jsx_runtime.jsxs)(SummaryRow, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(About_SummaryLabel, {
              children: label
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(About_SummaryValue, {
              children: value
            })]
          }, label))
        }), (runtimeDiagnostics == null ? void 0 : runtimeDiagnostics.repairAvailable) && !runtimeDiagnostics.engineConfigMatchesAppConfig && /*#__PURE__*/(0,jsx_runtime.jsx)(HeroActionRow, {
          children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
            type: "primary",
            loading: repairRuntimeConfigPending,
            onClick: () => repairRuntimeConfig({}),
            children: t('about.runtime.actions.repair')
          })
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(DiagnosticsPathList, {
          children: runtimePathItems.map(({
            key,
            label,
            value,
            openPath: targetPath
          }) => /*#__PURE__*/(0,jsx_runtime.jsxs)(DiagnosticsPathItem, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(DiagnosticsPathLabel, {
              children: label
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(DiagnosticsPathValue, {
              children: value
            }), /*#__PURE__*/(0,jsx_runtime.jsxs)(DiagnosticsPathActions, {
              children: [targetPath && /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
                size: "small",
                loading: openPathPending,
                onClick: () => openPathInShell(targetPath),
                children: t('about.actions.openPath')
              }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
                size: "small",
                onClick: () => copyTextWithFeedback(value),
                children: t('about.actions.copyPath')
              })]
            })]
          }, key))
        })]
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(SectionCard, {
        bordered: false,
        children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(SectionHeading, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SectionTitle, {
            children: t('about.windows.title')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(SectionDescription, {
            children: t('about.windows.description')
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(SummaryList, {
          children: windowsSummaryItems.map(({
            label,
            value
          }) => /*#__PURE__*/(0,jsx_runtime.jsxs)(SummaryRow, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(About_SummaryLabel, {
              children: label
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(About_SummaryValue, {
              children: value
            })]
          }, label))
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(DiagnosticsPathList, {
          children: windowsPathItems.map(({
            key,
            label,
            value,
            openPath: targetPath
          }) => /*#__PURE__*/(0,jsx_runtime.jsxs)(DiagnosticsPathItem, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(DiagnosticsPathLabel, {
              children: label
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(DiagnosticsPathValue, {
              children: value
            }), /*#__PURE__*/(0,jsx_runtime.jsxs)(DiagnosticsPathActions, {
              children: [targetPath && /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
                size: "small",
                loading: openPathPending,
                onClick: () => openPathInShell(targetPath),
                children: t('about.actions.openPath')
              }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
                size: "small",
                onClick: () => copyTextWithFeedback(value),
                children: t('about.actions.copyPath')
              })]
            })]
          }, key))
        })]
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(SectionCard, {
        bordered: false,
        children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(SectionHeading, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SectionTitle, {
            children: t('about.windows.quickActionsTitle')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(SectionDescription, {
            children: t('about.windows.quickActionsDescription')
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(QuickActionsGrid, {
          children: windowsQuickActions.map(({
            key,
            title,
            description,
            kind,
            target
          }) => /*#__PURE__*/(0,jsx_runtime.jsxs)(QuickActionCard, {
            disabled: openExternalPending || openPathPending,
            onClick: () => kind === 'path' ? openPathInShell(target) : openUri(target),
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(QuickActionTitle, {
              children: title
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(QuickActionDescription, {
              children: description
            })]
          }, key))
        })]
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(SectionCard, {
        bordered: false,
        children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(SectionHeading, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SectionTitle, {
            children: t('about.links.title')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(SectionDescription, {
            children: t('about.links.description')
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(ResourceList, {
          children: links.map(({
            key,
            label,
            href
          }) => /*#__PURE__*/(0,jsx_runtime.jsxs)(ResourceItem, {
            href: href,
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(ResourceLabel, {
              children: label
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(ResourceUrl, {
              children: href.replace(/^https?:\/\//, '')
            })]
          }, key))
        })]
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(SectionCard, {
        bordered: false,
        children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(SectionHeading, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SectionTitle, {
            children: t('about.builtWith.title')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(SectionDescription, {
            children: t('about.builtWith.description')
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(BuiltWithList, {
          children: builtWithItems.map(({
            key,
            label,
            href,
            description
          }) => /*#__PURE__*/(0,jsx_runtime.jsxs)(BuiltWithItemRow, {
            children: [label && /*#__PURE__*/(0,jsx_runtime.jsx)(BuiltWithLabel, {
              children: href ? /*#__PURE__*/(0,jsx_runtime.jsx)("a", {
                href: href,
                children: label
              }) : label
            }), /*#__PURE__*/(0,jsx_runtime.jsx)("div", {
              children: description
            })]
          }, key))
        })]
      })]
    }), /*#__PURE__*/(0,jsx_runtime.jsx)(ChangelogModal, {
      open: changelogModalOpen,
      onClose: () => setChangelogModalOpen(false)
    }), /*#__PURE__*/(0,jsx_runtime.jsx)(UpdateModal, {
      open: updateModalOpen,
      onClose: () => setUpdateModalOpen(false)
    })]
  });
}
/* harmony default export */ const panel_About = (About);
// EXTERNAL MODULE: ../../node_modules/@fortawesome/free-solid-svg-icons/index.mjs
var free_solid_svg_icons = __webpack_require__(49475);
// EXTERNAL MODULE: ../../node_modules/@fortawesome/react-fontawesome/dist/index.js + 1 modules
var react_fontawesome_dist = __webpack_require__(56388);
// EXTERNAL MODULE: ../../node_modules/antd/es/badge/index.js + 4 modules
var es_badge = __webpack_require__(69105);
;// ./src/app/panel/assets/logo-white.svg
/* unused harmony import specifier */ var React;
/* unused harmony import specifier */ var forwardRef;
var _g, _g2;
var logo_white_excluded = (/* unused pure expression or super */ null && (["title", "titleId"]));
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }


var SvgLogoWhite = function SvgLogoWhite(_ref, ref) {
  var title = _ref.title,
    titleId = _ref.titleId,
    props = _objectWithoutProperties(_ref, logo_white_excluded);
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: 750,
    height: 750,
    xmlns: "http://www.w3.org/2000/svg",
    ref: ref,
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, _g || (_g = /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("title", null, "background"), /*#__PURE__*/React.createElement("rect", {
    x: -1,
    y: -1,
    width: 752,
    height: 752,
    id: "canvas_background",
    fill: "none"
  }))), _g2 || (_g2 = /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("title", null, "Layer 1"), /*#__PURE__*/React.createElement("path", {
    fill: "#ffffff",
    strokeWidth: 0,
    d: "m208.00003,254.6l3.6,-0.6c-20.9,9.9 -49,30.4 -67.8,44.9c-30.4,23.3 -54.1,57.9 -74,92.9c84.1,-45.7 161.8,-52.4 178.5,-48.2c0.2,0.1 -7.7,45.5 -36.7,83.6c-30.5,39.9 -82.2,72.4 -82.2,72.4c18.9,2.2 37.9,2.6 56.7,0.8c32.2,-3 65.3,-12.4 91.5,-34.7c11.6,-9.9 32.8,-39 30.5,-34.8c-12.5,31.2 -14.3,66.7 -12.3,100.6c1.1,19.9 3.2,39.6 9.1,58.4c5,16.1 12.3,31.2 20.6,45.3l8.2,6.5c0.1,-0.7 -7.9,-111.8 48.5,-166.7c102.6,-99.8 216,-4.9 216,-4.9s-4.5,-75.2 -89.6,-111.7c203.8,-18.8 159.7,102 159.7,102s69.8,-29.8 59.1,-114.9c-9.7,-77 -85,-95.3 -100.7,-98.3c-13.2,-21.7 -113.2,-186.8 -279.8,-121.9c-180.6,70.3 -326.9,53.6 -326.9,53.6c21.5,24.7 46.7,44.6 74.1,58.7c35.6,18.4 75.3,23.8 113.9,17zm314,-15.9c6.3,2.1 12.7,4.2 19.1,6.2c-0.5,6.1 -4.8,10.9 -10,10.9c-5.5,0 -10.1,-5.4 -10.1,-12.1c0.1,-1.8 0.4,-3.5 1,-5zm-40.1,2.4c0,-5.1 0.9,-9.9 2.6,-14.4c3.8,0.9 7.6,1.8 11.2,3c3.8,1.2 7.5,2.5 11.3,3.8c-1.1,3.1 -1.8,6.5 -1.8,10.1c0,15.4 11.6,27.9 25.9,27.9c12.6,0 23,-9.7 25.4,-22.5c2.7,0.6 5.3,1.3 8,1.8c-4.4,18.5 -20.9,32.3 -40.7,32.3c-23.2,0 -41.9,-18.8 -41.9,-42z",
    id: "svg_1"
  }))));
};
var ForwardRef = /*#__PURE__*/(/* unused pure expression or super */ null && (forwardRef(SvgLogoWhite)));

/* harmony default export */ const logo_white = (__webpack_require__.p + "logo-white.07a58d8408c12a46b52785c91e5f2e9e.svg");
;// ./src/app/panel/AppHeader.tsx










const HeaderShell = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "AppHeader__HeaderShell",
  componentId: "sc-brhn5g-0"
})(["padding:18px var(--app-horizontal-padding) 0;"]);
const Header = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.header.withConfig({
  displayName: "AppHeader__Header",
  componentId: "sc-brhn5g-1"
})(["display:flex;flex-direction:column;gap:14px;padding:var(--app-card-padding);margin:0 auto;width:100%;max-width:calc(var(--app-max-width) + (var(--app-horizontal-padding) * 2));border:1px solid var(--app-surface-border);border-radius:var(--app-surface-radius);background:linear-gradient(140deg,rgba(23,125,220,0.16),transparent 38%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03));box-shadow:var(--app-surface-shadow);"]);
const HeaderTop = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "AppHeader__HeaderTop",
  componentId: "sc-brhn5g-2"
})(["display:flex;align-items:center;flex-wrap:wrap;gap:16px;"]);
const HeaderLogo = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.button.withConfig({
  displayName: "AppHeader__HeaderLogo",
  componentId: "sc-brhn5g-3"
})(["display:flex;align-items:center;gap:12px;cursor:pointer;margin:0 auto 0 0;padding:0;color:inherit;background:transparent;border:0;white-space:nowrap;user-select:none;"]);
const LogoImage = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.img.withConfig({
  displayName: "AppHeader__LogoImage",
  componentId: "sc-brhn5g-4"
})(["height:64px;"]);
const LogoWordmark = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "AppHeader__LogoWordmark",
  componentId: "sc-brhn5g-5"
})(["display:flex;flex-direction:column;align-items:flex-start;gap:4px;"]);
const LogoTitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "AppHeader__LogoTitle",
  componentId: "sc-brhn5g-6"
})(["font-size:38px;line-height:0.95;font-family:Oxanium;"]);
const LogoSubtitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "AppHeader__LogoSubtitle",
  componentId: "sc-brhn5g-7"
})(["color:rgba(255,255,255,0.58);font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;"]);
const HeaderButtonsWrapper = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "AppHeader__HeaderButtonsWrapper",
  componentId: "sc-brhn5g-8"
})(["display:flex;flex-wrap:wrap;gap:10px;"]);
const HeaderIcon = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(react_fontawesome_dist/* FontAwesomeIcon */.gc).withConfig({
  displayName: "AppHeader__HeaderIcon",
  componentId: "sc-brhn5g-9"
})(["margin-inline-end:8px;"]);
const NavButton = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(es_button/* default */.A).withConfig({
  displayName: "AppHeader__NavButton",
  componentId: "sc-brhn5g-10"
})(["height:var(--app-nav-button-height);padding-inline:16px;border-color:rgba(255,255,255,0.12);border-radius:999px;background:rgba(255,255,255,0.04);box-shadow:none;&.ant-btn:hover,&.ant-btn:focus{border-color:rgba(255,255,255,0.22);background:rgba(255,255,255,0.08);color:#fff;}&.ant-btn-primary,&.ant-btn-primary:hover,&.ant-btn-primary:focus{border-color:rgba(23,125,220,0.45);background:rgba(23,125,220,0.18);color:#fff;}"]);
const AppHeader_StatusRow = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "AppHeader__StatusRow",
  componentId: "sc-brhn5g-11"
})(["display:flex;flex-wrap:wrap;gap:8px;"]);
const AppHeader_StatusPill = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.span.withConfig({
  displayName: "AppHeader__StatusPill",
  componentId: "sc-brhn5g-12"
})(["position:relative;display:inline-flex;align-items:center;min-height:var(--app-status-pill-height);padding:0 12px 0 28px;color:rgba(255,255,255,0.88);font-size:12px;font-weight:600;border:1px solid rgba(255,255,255,0.08);border-radius:999px;background:rgba(255,255,255,0.04);&::before{content:'';position:absolute;left:12px;width:8px;height:8px;border-radius:999px;background:", ";box-shadow:0 0 0 4px rgba(255,255,255,0.04);}"], ({
  $tone
}) => {
  switch ($tone) {
    case 'error':
      return '#ff7875';
    case 'warning':
      return '#ffc53d';
    default:
      return '#69c0ff';
  }
});
function AppHeader() {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const navigate = (0,chunk_LFPYN7LY/* useNavigate */.Zp)();
  const location = (0,chunk_LFPYN7LY/* useLocation */.zy)();
  const {
    loggingEnabled,
    updateIsAvailable,
    safeMode,
    localUISettings
  } = (0,react.useContext)(AppUISettingsContext);
  const buttons = [{
    text: t('appHeader.home'),
    route: '/',
    icon: free_solid_svg_icons/* faHome */.v02
  }, {
    text: t('appHeader.explore'),
    route: '/mods-browser',
    icon: free_solid_svg_icons/* faList */.ITF
  }, {
    text: t('appHeader.settings'),
    route: '/settings',
    icon: free_solid_svg_icons/* faCog */.dB,
    badge: loggingEnabled ? {
      status: 'warning',
      title: t('general.loggingEnabled')
    } : undefined
  }, {
    text: t('appHeader.about'),
    route: '/about',
    icon: free_solid_svg_icons/* faInfo */.ktq,
    badge: updateIsAvailable ? {
      status: 'error',
      title: t('about.update.title')
    } : undefined
  }];
  const statusItems = [updateIsAvailable ? {
    key: 'update',
    text: t('appHeader.status.updateAvailable'),
    tone: 'error'
  } : null, safeMode ? {
    key: 'safeMode',
    text: t('appHeader.status.safeMode'),
    tone: 'warning'
  } : null, loggingEnabled ? {
    key: 'logging',
    text: t('appHeader.status.debugLogging'),
    tone: 'warning'
  } : null, localUISettings.interfaceDensity === 'compact' ? {
    key: 'compact',
    text: t('appHeader.status.compactDensity'),
    tone: 'default'
  } : null, localUISettings.useWideLayout ? {
    key: 'wide',
    text: t('appHeader.status.wideLayout'),
    tone: 'default'
  } : null, localUISettings.performanceProfile === 'responsive' ? {
    key: 'responsive-profile',
    text: t('appHeader.status.responsiveProfile'),
    tone: 'default'
  } : localUISettings.performanceProfile === 'efficient' ? {
    key: 'efficient-profile',
    text: t('appHeader.status.efficientProfile'),
    tone: 'default'
  } : null, localUISettings.aiAccelerationPreference === 'prefer-npu' ? {
    key: 'npu-preferred',
    text: t('appHeader.status.npuPreferred'),
    tone: 'default'
  } : null].filter(item => item !== null);
  return /*#__PURE__*/(0,jsx_runtime.jsx)(HeaderShell, {
    children: /*#__PURE__*/(0,jsx_runtime.jsxs)(Header, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(HeaderTop, {
        children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(HeaderLogo, {
          onClick: () => navigate('/'),
          type: "button",
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(LogoImage, {
            src: logo_white,
            alt: "logo"
          }), /*#__PURE__*/(0,jsx_runtime.jsxs)(LogoWordmark, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(LogoTitle, {
              children: "Windhawk"
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(LogoSubtitle, {
              children: t('appHeader.tagline')
            })]
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(HeaderButtonsWrapper, {
          children: buttons.map(({
            text,
            route,
            icon,
            badge
          }) => /*#__PURE__*/(0,jsx_runtime.jsx)(es_badge/* default */.A, {
            dot: !!badge,
            status: badge == null ? void 0 : badge.status,
            title: badge == null ? void 0 : badge.title,
            children: /*#__PURE__*/(0,jsx_runtime.jsxs)(NavButton, {
              type: location.pathname === route ? 'primary' : 'default',
              onClick: () => navigate(route),
              children: [/*#__PURE__*/(0,jsx_runtime.jsx)(HeaderIcon, {
                icon: icon
              }), text]
            })
          }, route))
        })]
      }), statusItems.length > 0 && /*#__PURE__*/(0,jsx_runtime.jsx)(AppHeader_StatusRow, {
        children: statusItems.map(({
          key,
          text,
          tone
        }) => /*#__PURE__*/(0,jsx_runtime.jsx)(AppHeader_StatusPill, {
          $tone: tone,
          children: text
        }, key))
      })]
    })
  });
}
/* harmony default export */ const panel_AppHeader = (AppHeader);
// EXTERNAL MODULE: ../../node_modules/antd/es/checkbox/index.js + 2 modules
var es_checkbox = __webpack_require__(32423);
;// ./src/app/panel/DevModeAction.tsx








const PopconfirmTitleContent = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "DevModeAction__PopconfirmTitleContent",
  componentId: "sc-fj05qo-0"
})(["display:flex;flex-direction:column;row-gap:8px;max-width:300px;"]);
function DevModeAction(props) {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const {
    devModeOptOut,
    devModeUsedAtLeastOnce
  } = (0,react.useContext)(AppUISettingsContext);
  const [optOutChecked, setOptOutChecked] = (0,react.useState)(false);
  const {
    updateAppSettings
  } = useUpdateAppSettings(() => undefined);
  if (devModeOptOut) {
    return null;
  }
  return /*#__PURE__*/(0,jsx_runtime.jsx)(PopconfirmModal, {
    placement: props.popconfirmPlacement,
    disabled: devModeUsedAtLeastOnce || props.disabled,
    title: /*#__PURE__*/(0,jsx_runtime.jsxs)(PopconfirmTitleContent, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)("div", {
        children: t('devModeAction.message')
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_checkbox/* default */.A, {
        checked: optOutChecked,
        onChange: e => setOptOutChecked(e.target.checked),
        children: t('devModeAction.hideOptionsCheckbox')
      })]
    }),
    okText: optOutChecked ? t('devModeAction.hideOptionsButton') : t('devModeAction.beginCodingButton'),
    cancelText: t('devModeAction.cancelButton'),
    onConfirm: () => {
      if (optOutChecked) {
        updateAppSettings({
          appSettings: {
            devModeOptOut: true
          }
        });
      } else {
        updateAppSettings({
          appSettings: {
            devModeUsedAtLeastOnce: true
          }
        });
        props.onClick();
      }
    },
    onOpenChange: open => open && setOptOutChecked(false),
    children: props.renderButton(!devModeUsedAtLeastOnce ? undefined : () => props.onClick())
  });
}
/* harmony default export */ const panel_DevModeAction = (DevModeAction);
// EXTERNAL MODULE: ../../node_modules/antd/es/tag/index.js + 1 modules
var tag = __webpack_require__(61150);
;// ./src/app/panel/aiModStudio.ts
const modStudioStarters = [{
  key: 'default',
  title: 'Standard starter',
  description: 'The existing Windhawk template for authors who already know the shape they want.',
  highlights: ['Classic metadata, readme, and settings blocks', 'Good when you already know the hook strategy', 'Fastest path to a minimal local mod'],
  actionLabel: 'Use standard starter'
}, {
  key: 'ai-ready',
  title: 'AI-ready starter',
  description: 'A template that adds prompt scaffolding, review notes, and a verification checklist for AI-assisted work.',
  highlights: ['Includes an AI collaboration brief in the readme', 'Adds a human verification checklist before shipping', 'Keeps the code sample compatible with the standard build flow'],
  actionLabel: 'Use AI-ready starter'
}, {
  key: 'explorer-shell',
  title: 'Explorer shell starter',
  description: 'A Windows shell-focused scaffold for taskbar, tray, Start menu, or notification surface experiments.',
  highlights: ['Targets explorer.exe and common shell hosts', 'Adds scope notes for taskbar, Start, and tray work', 'Keeps the code minimal so you can choose the actual hook path'],
  actionLabel: 'Use Explorer shell starter'
}, {
  key: 'window-behavior',
  title: 'Window behavior starter',
  description: 'A focused app-window scaffold for mods that change captions, sizing, visibility, styles, or placement.',
  highlights: ['Starts with a single-app target for safer iteration', 'Includes helpers for deciding which windows to affect', 'Good for ShowWindow, SetWindowPos, and style-related experiments'],
  actionLabel: 'Use window behavior starter'
}, {
  key: 'settings-lab',
  title: 'Settings lab starter',
  description: 'A configuration-first scaffold for mods where settings design, defaults, and rollout safety come before hooks.',
  highlights: ['Shows nested settings and live reload structure', 'Useful when you want to prototype config shape before hook work', 'Good for feature flags, intensity values, and staged rollouts'],
  actionLabel: 'Use settings lab starter'
}];
const aiPromptPacks = [{
  key: 'ideate',
  title: 'Ideation prompt',
  description: 'Turn a rough idea into a scoped Windhawk mod concept.',
  prompt: `Help me design a Windhawk mod.
Target process:
User problem to solve:
Windows UI or API area involved:
Constraints:
- Prefer the smallest reliable hook surface.
- Avoid changing behavior outside the target scenario.
- Suggest optional settings only when they clearly help users.
Output:
1. Mod concept summary
2. Candidate hook points or APIs to inspect
3. Risks and failure modes
4. A minimal test plan`
}, {
  key: 'scaffold',
  title: 'Scaffold prompt',
  description: 'Ask AI to write or revise a Windhawk mod while preserving the expected metadata blocks.',
  prompt: `Help me write a Windhawk mod in C++.
Goal:
Target process:
Known APIs or functions:
Requirements:
- Keep the Windhawk metadata, readme, and settings blocks valid.
- Explain why each hook target is appropriate.
- Keep logging in place for the first iteration.
- Avoid adding speculative code that cannot be justified from the goal.
Output:
1. Updated source code
2. Explanation of each hook
3. Manual verification steps`
}, {
  key: 'review',
  title: 'Review prompt',
  description: 'Use AI as a reviewer for safety, regressions, and missing tests.',
  prompt: `Review this Windhawk mod like a cautious senior engineer.
Focus on:
- Crash risks
- Incorrect hook targets
- Missing error handling
- Unsafe assumptions about process lifetime or thread context
- User-facing regressions
- Missing manual tests
Output:
1. Findings ordered by severity
2. The most important tests to run before enabling the mod by default
3. Any metadata or readme changes that would reduce user confusion`
}, {
  key: 'docs',
  title: 'Docs and changelog prompt',
  description: 'Generate a readme or release note update that stays grounded in actual behavior.',
  prompt: `Draft documentation for this Windhawk mod update.
Include:
- What changed
- Which processes are affected
- New settings or behavior changes
- Upgrade risks or compatibility notes
Avoid:
- Marketing language
- Claims that are not verified
- Hiding limitations or known edge cases
Output:
1. Readme update
2. Short changelog entry
3. Manual test notes for contributors`
}];
;// ./src/app/panel/NewModStudioModal.tsx







const ModalBody = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "NewModStudioModal__ModalBody",
  componentId: "sc-h5tzdh-0"
})(["display:flex;flex-direction:column;gap:24px;max-height:70vh;overflow-y:auto;padding-right:4px;"]);
const Section = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.section.withConfig({
  displayName: "NewModStudioModal__Section",
  componentId: "sc-h5tzdh-1"
})(["display:flex;flex-direction:column;gap:12px;"]);
const NewModStudioModal_SectionTitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "NewModStudioModal__SectionTitle",
  componentId: "sc-h5tzdh-2"
})(["font-size:16px;font-weight:600;"]);
const NewModStudioModal_SectionDescription = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(typography/* default */.A.Text).withConfig({
  displayName: "NewModStudioModal__SectionDescription",
  componentId: "sc-h5tzdh-3"
})(["color:rgba(255,255,255,0.68);"]);
const StarterGrid = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "NewModStudioModal__StarterGrid",
  componentId: "sc-h5tzdh-4"
})(["display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;"]);
const StarterCard = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "NewModStudioModal__StarterCard",
  componentId: "sc-h5tzdh-5"
})(["display:flex;flex-direction:column;gap:10px;padding:16px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);"]);
const StarterHeader = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "NewModStudioModal__StarterHeader",
  componentId: "sc-h5tzdh-6"
})(["display:flex;justify-content:space-between;gap:8px;align-items:flex-start;"]);
const StarterTitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "NewModStudioModal__StarterTitle",
  componentId: "sc-h5tzdh-7"
})(["font-size:15px;font-weight:600;"]);
const StarterHighlights = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.ul.withConfig({
  displayName: "NewModStudioModal__StarterHighlights",
  componentId: "sc-h5tzdh-8"
})(["margin:0;padding-inline-start:18px;color:rgba(255,255,255,0.76);> li + li{margin-top:6px;}"]);
const PromptGrid = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "NewModStudioModal__PromptGrid",
  componentId: "sc-h5tzdh-9"
})(["display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;"]);
const PromptCard = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "NewModStudioModal__PromptCard",
  componentId: "sc-h5tzdh-10"
})(["display:flex;flex-direction:column;gap:10px;padding:16px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);"]);
const PromptTitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "NewModStudioModal__PromptTitle",
  componentId: "sc-h5tzdh-11"
})(["font-size:15px;font-weight:600;"]);
const PromptPreview = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.pre.withConfig({
  displayName: "NewModStudioModal__PromptPreview",
  componentId: "sc-h5tzdh-12"
})(["margin:0;padding:12px;border-radius:10px;background:rgba(0,0,0,0.22);color:rgba(255,255,255,0.84);white-space:pre-wrap;word-break:break-word;font-family:Consolas,Monaco,'Courier New',monospace;font-size:12px;line-height:1.45;"]);
const FooterNote = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "NewModStudioModal__FooterNote",
  componentId: "sc-h5tzdh-13"
})(["border-radius:12px;padding:14px 16px;border:1px solid rgba(250,173,20,0.28);background:rgba(250,173,20,0.08);color:rgba(255,255,255,0.86);line-height:1.5;"]);
function NewModStudioModal({
  open,
  onClose
}) {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const handleCreateStarter = templateKey => {
    createNewMod({
      templateKey
    });
    onClose();
  };
  const handleCopyPrompt = async (title, prompt) => {
    try {
      await copyTextToClipboard(prompt);
      message/* default */.Ay.success(t('newModStudio.copySuccess', {
        title
      }));
    } catch (error) {
      console.error('Failed to copy AI prompt:', error);
      message/* default */.Ay.error(t('newModStudio.copyError'));
    }
  };
  return /*#__PURE__*/(0,jsx_runtime.jsx)(modal/* default */.A, {
    open: open,
    onCancel: onClose,
    footer: null,
    width: 920,
    title: t('newModStudio.title'),
    centered: true,
    children: /*#__PURE__*/(0,jsx_runtime.jsxs)(ModalBody, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(Section, {
        children: [/*#__PURE__*/(0,jsx_runtime.jsx)(NewModStudioModal_SectionTitle, {
          children: t('newModStudio.starters.title')
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(NewModStudioModal_SectionDescription, {
          children: t('newModStudio.starters.description')
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(StarterGrid, {
          children: modStudioStarters.map(starter => /*#__PURE__*/(0,jsx_runtime.jsxs)(StarterCard, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(StarterHeader, {
              children: [/*#__PURE__*/(0,jsx_runtime.jsx)(StarterTitle, {
                children: starter.title
              }), starter.key === 'ai-ready' && /*#__PURE__*/(0,jsx_runtime.jsx)(tag/* default */.A, {
                color: "blue",
                children: t('newModStudio.recommended')
              })]
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(NewModStudioModal_SectionDescription, {
              children: starter.description
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(StarterHighlights, {
              children: starter.highlights.map(highlight => /*#__PURE__*/(0,jsx_runtime.jsx)("li", {
                children: highlight
              }, highlight))
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
              type: starter.key === 'ai-ready' ? 'primary' : 'default',
              onClick: () => handleCreateStarter(starter.key),
              children: starter.actionLabel
            })]
          }, starter.key))
        })]
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(Section, {
        children: [/*#__PURE__*/(0,jsx_runtime.jsx)(NewModStudioModal_SectionTitle, {
          children: t('newModStudio.prompts.title')
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(NewModStudioModal_SectionDescription, {
          children: t('newModStudio.prompts.description')
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(PromptGrid, {
          children: aiPromptPacks.map(promptPack => /*#__PURE__*/(0,jsx_runtime.jsxs)(PromptCard, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(PromptTitle, {
              children: promptPack.title
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(NewModStudioModal_SectionDescription, {
              children: promptPack.description
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(PromptPreview, {
              children: promptPack.prompt
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
              onClick: () => handleCopyPrompt(promptPack.title, promptPack.prompt),
              children: t('newModStudio.prompts.copyButton')
            })]
          }, promptPack.key))
        })]
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(FooterNote, {
        children: t('newModStudio.footerNote')
      })]
    })
  });
}
/* harmony default export */ const panel_NewModStudioModal = (NewModStudioModal);
;// ./src/app/panel/CreateNewModButton.tsx









const ButtonContainer = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "CreateNewModButton__ButtonContainer",
  componentId: "sc-itjwwp-0"
})(["position:fixed;bottom:0;inset-inline-start:0;inset-inline-end:0;margin:0 auto;width:100%;max-width:var(--app-max-width);z-index:100;"]);
const CreateButton = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(es_button/* default */.A).withConfig({
  displayName: "CreateNewModButton__CreateButton",
  componentId: "sc-itjwwp-1"
})(["position:absolute;inset-inline-end:32px;bottom:20px;background-color:var(--app-background-color) !important;box-shadow:0 3px 6px rgb(100 100 100 / 16%),0 1px 2px rgb(100 100 100 / 23%);"]);
const CreateButtonIcon = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(react_fontawesome_dist/* FontAwesomeIcon */.gc).withConfig({
  displayName: "CreateNewModButton__CreateButtonIcon",
  componentId: "sc-itjwwp-2"
})(["margin-inline-end:8px;"]);
function CreateNewModButton() {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const [studioOpen, setStudioOpen] = (0,react.useState)(false);
  return /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [/*#__PURE__*/(0,jsx_runtime.jsx)(ButtonContainer, {
      children: /*#__PURE__*/(0,jsx_runtime.jsx)(panel_DevModeAction, {
        popconfirmPlacement: "top",
        onClick: () => setStudioOpen(true),
        renderButton: onClick => /*#__PURE__*/(0,jsx_runtime.jsxs)(CreateButton, {
          shape: "round",
          onClick: onClick,
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(CreateButtonIcon, {
            icon: free_solid_svg_icons/* faPen */.hpd
          }), " ", t('createNewModButton.title')]
        })
      })
    }), /*#__PURE__*/(0,jsx_runtime.jsx)(panel_NewModStudioModal, {
      open: studioOpen,
      onClose: () => setStudioOpen(false)
    })]
  });
}
/* harmony default export */ const panel_CreateNewModButton = (CreateNewModButton);
// EXTERNAL MODULE: ../../node_modules/immer/dist/immer.mjs
var immer = __webpack_require__(83813);
// EXTERNAL MODULE: ../../node_modules/antd/es/radio/index.js + 4 modules
var es_radio = __webpack_require__(11107);
// EXTERNAL MODULE: ../../node_modules/antd/es/tooltip/index.js + 3 modules
var tooltip = __webpack_require__(33782);
// EXTERNAL MODULE: ../../node_modules/antd/es/list/index.js + 4 modules
var list = __webpack_require__(78971);
// EXTERNAL MODULE: ../../node_modules/antd/es/space/index.js + 1 modules
var space = __webpack_require__(80420);
;// ./src/app/panel/ModDetailsAdvanced.tsx







const SettingsListItemMeta = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(list/* default */.Ay.Item.Meta).withConfig({
  displayName: "ModDetailsAdvanced__SettingsListItemMeta",
  componentId: "sc-1x5hh2z-0"
})([".ant-list-item-meta{margin-bottom:8px;}.ant-list-item-meta-title{margin-bottom:0;}"]);
const SettingsSelect = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(SelectModal).withConfig({
  displayName: "ModDetailsAdvanced__SettingsSelect",
  componentId: "sc-1x5hh2z-1"
})(["width:200px;"]);
const SpaceWithWidth = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(space/* default */.A).withConfig({
  displayName: "ModDetailsAdvanced__SpaceWithWidth",
  componentId: "sc-1x5hh2z-2"
})(["width:100%;max-width:600px;"]);
function engineArrayToProcessList(processArray) {
  return processArray.join('\n');
}
function engineProcessListToArray(processList) {
  return processList.split('\n').map(x => x.replace(/["/<>|]/g, '').trim()).filter(x => x);
}
function ModDetailsAdvanced({
  modId
}) {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const [debugLogging, setDebugLogging] = (0,react.useState)();
  const [modSettingsUI, setModSettingsUI] = (0,react.useState)();
  const [modSettingsUIModified, setModSettingsUIModified] = (0,react.useState)(false);
  const [customInclude, setCustomInclude] = (0,react.useState)();
  const [customIncludeModified, setCustomIncludeModified] = (0,react.useState)(false);
  const [customExclude, setCustomExclude] = (0,react.useState)();
  const [customExcludeModified, setCustomExcludeModified] = (0,react.useState)(false);
  const [includeExcludeCustomOnly, setIncludeExcludeCustomOnly] = (0,react.useState)();
  const [patternsMatchCriticalSystemProcesses, setPatternsMatchCriticalSystemProcesses] = (0,react.useState)();
  const {
    getModConfig
  } = useGetModConfig((0,react.useCallback)(data => {
    var _data$config, _data$config2, _data$config$includeC, _data$config3, _data$config$excludeC, _data$config4, _data$config$includeE, _data$config5, _data$config$patterns, _data$config6;
    if ((_data$config = data.config) != null && _data$config.debugLoggingEnabled) {
      setDebugLogging(2);
    } else if ((_data$config2 = data.config) != null && _data$config2.loggingEnabled) {
      setDebugLogging(1);
    } else {
      setDebugLogging(0);
    }
    setCustomInclude(engineArrayToProcessList((_data$config$includeC = (_data$config3 = data.config) == null ? void 0 : _data$config3.includeCustom) != null ? _data$config$includeC : []));
    setCustomExclude(engineArrayToProcessList((_data$config$excludeC = (_data$config4 = data.config) == null ? void 0 : _data$config4.excludeCustom) != null ? _data$config$excludeC : []));
    setIncludeExcludeCustomOnly((_data$config$includeE = (_data$config5 = data.config) == null ? void 0 : _data$config5.includeExcludeCustomOnly) != null ? _data$config$includeE : false);
    setPatternsMatchCriticalSystemProcesses((_data$config$patterns = (_data$config6 = data.config) == null ? void 0 : _data$config6.patternsMatchCriticalSystemProcesses) != null ? _data$config$patterns : false);
  }, []));
  const {
    getModSettings
  } = useGetModSettings((0,react.useCallback)((data, context) => {
    setModSettingsUI(JSON.stringify(data.settings, null, context != null && context.formatted ? 2 : undefined));
  }, []));
  const {
    setModSettings
  } = useSetModSettings((0,react.useCallback)(data => {
    if (data.succeeded) {
      setModSettingsUIModified(false);
    }
  }, []));
  const {
    updateModConfig
  } = useUpdateModConfig((0,react.useCallback)((data, context) => {
    if (data.succeeded) {
      context == null || context.callback == null || context.callback();
    }
  }, []));
  (0,react.useEffect)(() => {
    getModConfig({
      modId
    });
    getModSettings({
      modId
    });
  }, [getModConfig, getModSettings, modId]);
  if (modSettingsUI === undefined || debugLogging === undefined || customInclude === undefined || customExclude === undefined || includeExcludeCustomOnly === undefined || patternsMatchCriticalSystemProcesses === undefined) {
    return null;
  }
  return /*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay, {
    itemLayout: "vertical",
    split: false,
    children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SettingsListItemMeta, {
        title: t('modDetails.advanced.debugLogging.title'),
        description: t('modDetails.advanced.debugLogging.description')
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(space/* default */.A, {
        direction: "vertical",
        size: "middle",
        children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(SettingsSelect, {
          value: debugLogging,
          onChange: value => {
            const numValue = typeof value === 'number' ? value : 0;
            setDebugLogging(numValue);
            updateModConfig({
              modId,
              config: {
                loggingEnabled: numValue === 1,
                debugLoggingEnabled: numValue === 2
              }
            });
          },
          dropdownMatchSelectWidth: false,
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(es_select/* default */.A.Option, {
            value: 0,
            children: t('modDetails.advanced.debugLogging.none')
          }, "none"), /*#__PURE__*/(0,jsx_runtime.jsx)(es_select/* default */.A.Option, {
            value: 1,
            children: t('modDetails.advanced.debugLogging.modLogs')
          }, "error"), /*#__PURE__*/(0,jsx_runtime.jsx)(es_select/* default */.A.Option, {
            value: 2,
            children: t('modDetails.advanced.debugLogging.detailedLogs')
          }, "verbose")]
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
          type: "primary",
          onClick: () => {
            showAdvancedDebugLogOutput();
          },
          children: t('modDetails.advanced.debugLogging.showLogButton')
        })]
      })]
    }), /*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SettingsListItemMeta, {
        title: t('modDetails.advanced.modSettings.title'),
        description: t('modDetails.advanced.modSettings.description')
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(SpaceWithWidth, {
        direction: "vertical",
        size: "middle",
        children: [/*#__PURE__*/(0,jsx_runtime.jsx)(TextAreaWithContextMenu, {
          rows: 4,
          value: modSettingsUI,
          onChange: e => {
            setModSettingsUI(e.target.value);
            setModSettingsUIModified(true);
          }
        }), /*#__PURE__*/(0,jsx_runtime.jsxs)(space/* default */.A, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(dropdown/* default */.A.Button, {
            type: "primary",
            menu: {
              items: [{
                key: 'formatted',
                label: t('modDetails.advanced.modSettings.loadFormattedButton')
              }],
              onClick: e => {
                getModSettings({
                  modId
                }, {
                  formatted: e.key === 'formatted'
                });
              }
            },
            onClick: () => {
              getModSettings({
                modId
              });
            },
            children: t('modDetails.advanced.modSettings.loadButton')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
            type: "primary",
            disabled: !modSettingsUIModified,
            onClick: () => {
              let settings = null;
              try {
                settings = JSON.parse(modSettingsUI);
              } catch (_unused) {
                message/* default */.Ay.error(t('modDetails.advanced.modSettings.invalidData'));
                return;
              }
              setModSettings({
                modId,
                settings
              });
            },
            children: t('modDetails.advanced.modSettings.saveButton')
          })]
        })]
      })]
    }), /*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SettingsListItemMeta, {
        title: t('modDetails.advanced.customList.titleInclusion'),
        description: t('modDetails.advanced.customList.descriptionInclusion')
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(SpaceWithWidth, {
        direction: "vertical",
        size: "middle",
        children: [/*#__PURE__*/(0,jsx_runtime.jsxs)("div", {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(TextAreaWithContextMenu, {
            rows: 4,
            value: customInclude,
            placeholder: t('modDetails.advanced.customList.processListPlaceholder') + '\n' + 'notepad.exe\n' + '%ProgramFiles%\\Notepad++\\notepad++.exe\n' + 'C:\\Windows\\system32\\*',
            onChange: e => {
              setCustomInclude(e.target.value);
              setCustomIncludeModified(true);
            }
          }), customInclude.match(/["/<>|]/) && /*#__PURE__*/(0,jsx_runtime.jsx)(es_alert/* default */.A, {
            description: t('modDetails.advanced.customList.invalidCharactersWarning', {
              invalidCharacters: '" / < > |'
            }),
            type: "warning",
            showIcon: true
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
          type: "primary",
          disabled: !customIncludeModified,
          onClick: () => {
            updateModConfig({
              modId,
              config: {
                includeCustom: engineProcessListToArray(customInclude)
              }
            }, {
              callback: () => setCustomIncludeModified(false)
            });
          },
          children: t('modDetails.advanced.customList.saveButton')
        })]
      })]
    }), /*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SettingsListItemMeta, {
        title: t('modDetails.advanced.customList.titleExclusion'),
        description: t('modDetails.advanced.customList.descriptionExclusion')
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(SpaceWithWidth, {
        direction: "vertical",
        size: "middle",
        children: [/*#__PURE__*/(0,jsx_runtime.jsxs)("div", {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(TextAreaWithContextMenu, {
            rows: 4,
            value: customExclude,
            placeholder: t('modDetails.advanced.customList.processListPlaceholder') + '\n' + 'notepad.exe\n' + '%ProgramFiles%\\Notepad++\\notepad++.exe\n' + 'C:\\Windows\\system32\\*',
            onChange: e => {
              setCustomExclude(e.target.value);
              setCustomExcludeModified(true);
            }
          }), customExclude.match(/["/<>|]/) && /*#__PURE__*/(0,jsx_runtime.jsx)(es_alert/* default */.A, {
            description: t('modDetails.advanced.customList.invalidCharactersWarning', {
              invalidCharacters: '" / < > |'
            }),
            type: "warning",
            showIcon: true
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
          type: "primary",
          disabled: !customExcludeModified,
          onClick: () => {
            updateModConfig({
              modId,
              config: {
                excludeCustom: engineProcessListToArray(customExclude)
              }
            }, {
              callback: () => setCustomExcludeModified(false)
            });
          },
          children: t('modDetails.advanced.customList.saveButton')
        })]
      })]
    }), /*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SettingsListItemMeta, {
        title: t('modDetails.advanced.includeExcludeCustomOnly.title'),
        description: t('modDetails.advanced.includeExcludeCustomOnly.description')
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_switch/* default */.A, {
        checked: includeExcludeCustomOnly,
        onChange: checked => {
          setIncludeExcludeCustomOnly(checked);
          updateModConfig({
            modId,
            config: {
              includeExcludeCustomOnly: checked
            }
          });
        }
      })]
    }), /*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SettingsListItemMeta, {
        title: t('modDetails.advanced.patternsMatchCriticalSystemProcesses.title'),
        description: /*#__PURE__*/(0,jsx_runtime.jsx)(es/* Trans */.x6, {
          t: t,
          i18nKey: "modDetails.advanced.patternsMatchCriticalSystemProcesses.description",
          components: [/*#__PURE__*/(0,jsx_runtime.jsx)("code", {}), /*#__PURE__*/(0,jsx_runtime.jsx)("a", {
            href: "https://github.com/ramensoftware/windhawk/wiki/Injection-targets-and-critical-system-processes",
            children: "wiki"
          })]
        })
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_switch/* default */.A, {
        checked: patternsMatchCriticalSystemProcesses,
        onChange: checked => {
          setPatternsMatchCriticalSystemProcesses(checked);
          updateModConfig({
            modId,
            config: {
              patternsMatchCriticalSystemProcesses: checked
            }
          });
        }
      })]
    })]
  });
}
/* harmony default export */ const panel_ModDetailsAdvanced = (ModDetailsAdvanced);
// EXTERNAL MODULE: ../../node_modules/swr/dist/index/index.mjs + 5 modules
var index = __webpack_require__(6392);
;// ./src/app/panel/ModDetailsChangelog.tsx






const ErrorMessage = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsChangelog__ErrorMessage",
  componentId: "sc-1myukyp-0"
})(["color:rgba(255,255,255,0.45);font-style:italic;"]);
function ModDetailsChangelog({
  modId,
  loadingNode
}) {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const url = `https://mods.windhawk.net/changelogs/${modId}.md`;
  const {
    data,
    error,
    isLoading
  } = (0,index/* default */.Ay)(url, fetchText);
  if (error) {
    const githubUrl = `https://github.com/ramensoftware/windhawk-mods/blob/pages/changelogs/${modId}.md`;
    return /*#__PURE__*/(0,jsx_runtime.jsx)(ErrorMessage, {
      children: /*#__PURE__*/(0,jsx_runtime.jsx)(es/* Trans */.x6, {
        t: t,
        i18nKey: "modDetails.changelog.loadingFailed",
        components: [/*#__PURE__*/(0,jsx_runtime.jsx)("a", {
          href: githubUrl,
          children: "GitHub"
        })]
      })
    });
  }
  if (isLoading) {
    return loadingNode;
  }
  return /*#__PURE__*/(0,jsx_runtime.jsx)(panel_ChangelogViewer, {
    markdown: data || ''
  });
}
/* harmony default export */ const panel_ModDetailsChangelog = (ModDetailsChangelog);
// EXTERNAL MODULE: ../../node_modules/@fortawesome/free-brands-svg-icons/index.mjs
var free_brands_svg_icons = __webpack_require__(95370);
// EXTERNAL MODULE: ../../node_modules/antd/es/rate/index.js + 6 modules
var rate = __webpack_require__(60646);
;// ./src/app/components/EllipsisText.tsx



/**
 * A text component that automatically shows a tooltip when truncated.
 * Uses ResizeObserver to recalculate ellipsis on width changes.
 * Automatically hides tooltip when resizing to prevent stale tooltip display.
 */
function EllipsisText(props) {
  const containerRef = (0,react.useRef)(null);
  const [tooltipHide, setTooltipHide] = (0,react.useState)(false);
  const [ellipsisKey, setEllipsisKey] = (0,react.useState)(0);
  (0,react.useEffect)(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }
    const resizeObserver = new ResizeObserver(() => {
      // Prevent tooltip from being shown when ellipsis appears
      setTooltipHide(true);
      // Trigger ellipsis recalculation by changing the key
      setEllipsisKey(prev => prev + 1);
    });
    resizeObserver.observe(element);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  return /*#__PURE__*/(0,jsx_runtime.jsxs)(typography/* default */.A.Text, {
    ref: containerRef,
    className: props.className,
    style: props.style,
    ellipsis: {
      tooltip: Object.assign({
        placement: props.tooltipPlacement,
        onOpenChange: visible => {
          if (visible) {
            setTooltipHide(false);
          }
        }
      }, tooltipHide ? {
        open: false
      } : {})
    },
    children: [props.children, /*#__PURE__*/(0,jsx_runtime.jsx)("span", {}, ellipsisKey)]
  });
}
/* harmony default export */ const components_EllipsisText = (EllipsisText);
;// ./src/app/panel/installDecisionUtils.ts
function normalizeProcessName(process) {
  return process.includes('\\') ? process.substring(process.lastIndexOf('\\') + 1) : process;
}
function getTargetSummary(modMetadata) {
  const include = (modMetadata.include || []).filter(Boolean);
  const wildcardTargets = include.some(entry => entry.includes('*') || entry.includes('?'));
  const normalizedTargets = Array.from(new Set(include.map(entry => normalizeProcessName(entry))));
  return {
    wildcardTargets,
    targetCount: wildcardTargets ? 999 : normalizedTargets.length
  };
}
function getInstallDecisionRecommendations(modMetadata, repositoryDetails, installSourceData) {
  var _installSourceData$in;
  const {
    wildcardTargets,
    targetCount
  } = getTargetSummary(modMetadata);
  const hasSource = !!(installSourceData != null && installSourceData.source);
  const hasReadme = !!(installSourceData != null && installSourceData.readme);
  const hasSettings = !!(installSourceData != null && (_installSourceData$in = installSourceData.initialSettings) != null && _installSourceData$in.length);
  const strongCommunity = !!(repositoryDetails && repositoryDetails.users >= 2000 && repositoryDetails.rating >= 8.5);
  const recentlyUpdated = !!(repositoryDetails && (Date.now() - repositoryDetails.updated) / (24 * 60 * 60 * 1000) <= 120);
  const staleUpdate = !!(repositoryDetails && (Date.now() - repositoryDetails.updated) / (24 * 60 * 60 * 1000) > 180);
  let recommendedAction = 'review-source';
  if (wildcardTargets || targetCount >= 4 || !hasSource) {
    recommendedAction = 'install-disabled';
  } else if (targetCount === 0) {
    recommendedAction = 'review-details';
  } else if (staleUpdate) {
    recommendedAction = 'review-changelog';
  } else if (strongCommunity && recentlyUpdated && hasSource) {
    recommendedAction = 'install-now';
  }
  return [{
    key: 'install-now',
    title: 'Install now',
    description: strongCommunity && recentlyUpdated ? 'Signals are strong enough for a direct install if you already trust the mod author.' : 'Use when the scope is focused and you already reviewed enough evidence.',
    recommended: recommendedAction === 'install-now'
  }, {
    key: 'install-disabled',
    title: 'Install disabled first',
    description: wildcardTargets || targetCount >= 4 || !hasSource ? 'Safer for broad scope, limited reviewability, or uncertain first runs.' : 'Good for risky shell tweaks when you want the files installed before enabling.',
    recommended: recommendedAction === 'install-disabled'
  }, {
    key: 'review-source',
    title: 'Review source first',
    description: hasSource ? 'Inspect hook targets and process scope before the first live run.' : 'Source is not available in this view, so rely on details and changelog instead.',
    recommended: recommendedAction === 'review-source'
  }, {
    key: 'review-details',
    title: 'Review details',
    description: hasReadme || hasSettings ? 'Use the readme and settings to confirm what the mod actually changes.' : 'Metadata is limited, so confirm author, targeting, and purpose before installing.',
    recommended: recommendedAction === 'review-details'
  }, {
    key: 'review-changelog',
    title: 'Review changelog',
    description: 'Check recent compatibility notes and regressions before committing to the install.',
    recommended: recommendedAction === 'review-changelog'
  }];
}
function buildInstallDecisionChecklist(modMetadata, repositoryDetails, installSourceData) {
  const {
    wildcardTargets,
    targetCount
  } = getTargetSummary(modMetadata);
  const checks = ['Confirm which Windows surface you expect this mod to change before enabling it.', 'Review at least one evidence source such as source, details, settings, or changelog.'];
  if (wildcardTargets || targetCount >= 4) {
    checks.push('Prefer a disabled-first install for broad process scope.');
  } else if (targetCount > 0) {
    checks.push('Exercise the targeted process manually after install and before long-term use.');
  }
  if (!(installSourceData != null && installSourceData.source)) {
    checks.push('Treat limited reviewability as higher risk and verify behavior manually.');
  }
  if (repositoryDetails && (Date.now() - repositoryDetails.updated) / (24 * 60 * 60 * 1000) > 180) {
    checks.push('Check changelog and Windows version compatibility because the mod has not been updated recently.');
  }
  return checks;
}
// EXTERNAL MODULE: ../../node_modules/antd/es/divider/index.js
var divider = __webpack_require__(76809);
;// ./src/app/panel/ModMetadataLine.tsx









const MetadataLineWrapper = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModMetadataLine__MetadataLineWrapper",
  componentId: "sc-1f7muzn-0"
})(["display:flex;flex-wrap:", ";margin-top:4px;margin-bottom:2px;"], ({
  $singleLine
}) => $singleLine ? 'nowrap' : 'wrap');
const MetadataItemWrapper = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModMetadataLine__MetadataItemWrapper",
  componentId: "sc-1f7muzn-1"
})(["font-size:14px;font-weight:normal;overflow:hidden;", " ", ""], ({
  $singleLine
}) => $singleLine && `
    // Don't shrink automatically; widths are managed manually.
    flex-shrink: 0;
  `, ({
  $width
}) => $width !== undefined && `
    width: ${$width}px;
  `);
const MetadataLineIcon = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(react_fontawesome_dist/* FontAwesomeIcon */.gc).withConfig({
  displayName: "ModMetadataLine__MetadataLineIcon",
  componentId: "sc-1f7muzn-2"
})(["margin-inline-end:3px;"]);
const TextAsIconWrapper = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.span.withConfig({
  displayName: "ModMetadataLine__TextAsIconWrapper",
  componentId: "sc-1f7muzn-3"
})(["font-size:18px;line-height:18px;user-select:none;"]);
const VersionTooltipHeader = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModMetadataLine__VersionTooltipHeader",
  componentId: "sc-1f7muzn-4"
})(["text-align:center;"]);
const VersionTooltipGrid = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModMetadataLine__VersionTooltipGrid",
  componentId: "sc-1f7muzn-5"
})(["display:grid;grid-template-columns:auto auto;gap:4px 8px;margin-top:8px;"]);
const VersionTooltipLabel = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModMetadataLine__VersionTooltipLabel",
  componentId: "sc-1f7muzn-6"
})(["text-align:end;"]);
const TooltipProcessList = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.ul.withConfig({
  displayName: "ModMetadataLine__TooltipProcessList",
  componentId: "sc-1f7muzn-7"
})(["margin:4px 0;padding-inline-start:20px;"]);
const TooltipSection = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModMetadataLine__TooltipSection",
  componentId: "sc-1f7muzn-8"
})(["", ""], ({
  $hasMarginTop
}) => $hasMarginTop && 'margin-top: 8px;');
const DisabledProcessItem = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.span.withConfig({
  displayName: "ModMetadataLine__DisabledProcessItem",
  componentId: "sc-1f7muzn-9"
})(["text-decoration:line-through;opacity:0.5;"]);
const CustomProcessItem = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.span.withConfig({
  displayName: "ModMetadataLine__CustomProcessItem",
  componentId: "sc-1f7muzn-10"
})(["color:#388ed3;"]);
const TooltipNote = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModMetadataLine__TooltipNote",
  componentId: "sc-1f7muzn-11"
})(["margin-top:12px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.2);"]);
const TooltipNoteList = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.ul.withConfig({
  displayName: "ModMetadataLine__TooltipNoteList",
  componentId: "sc-1f7muzn-12"
})(["margin:0;padding-inline-start:20px;color:#388ed3;"]);
const TooltipNoteText = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModMetadataLine__TooltipNoteText",
  componentId: "sc-1f7muzn-13"
})(["color:rgba(255,255,255,0.65);font-size:12px;"]);
;
function createVersionItem(version, t, repositoryDetails) {
  let tooltip = t('modDetails.header.modVersion');
  if (repositoryDetails) {
    const updatedDate = new Date(repositoryDetails.updated);
    const formatDate = date => {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };
    tooltip = /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(VersionTooltipHeader, {
        children: t('modDetails.header.modVersion')
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(VersionTooltipGrid, {
        children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(VersionTooltipLabel, {
          children: [t('modDetails.header.lastUpdated'), ":"]
        }), /*#__PURE__*/(0,jsx_runtime.jsx)("div", {
          children: formatDate(updatedDate)
        })]
      })]
    });
  }
  return {
    key: 'version',
    icon: free_solid_svg_icons/* faBullhorn */.e4L,
    text: version,
    tooltip
  };
}
function createAuthorTooltip(modMetadata, t) {
  return /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [/*#__PURE__*/(0,jsx_runtime.jsx)("div", {
      children: t('modDetails.header.modAuthor.title')
    }), (modMetadata.homepage || modMetadata.github || modMetadata.twitter) && /*#__PURE__*/(0,jsx_runtime.jsxs)("div", {
      children: [modMetadata.homepage && /*#__PURE__*/(0,jsx_runtime.jsx)(tooltip/* default */.A, {
        title: t('modDetails.header.modAuthor.homepage'),
        placement: "bottom",
        children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
          type: "text",
          icon: /*#__PURE__*/(0,jsx_runtime.jsx)(react_fontawesome_dist/* FontAwesomeIcon */.gc, {
            icon: free_solid_svg_icons/* faHome */.v02
          }),
          href: sanitizeUrl(modMetadata.homepage)
        })
      }), modMetadata.github && /*#__PURE__*/(0,jsx_runtime.jsx)(tooltip/* default */.A, {
        title: t('modDetails.header.modAuthor.github'),
        placement: "bottom",
        children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
          type: "text",
          icon: /*#__PURE__*/(0,jsx_runtime.jsx)(react_fontawesome_dist/* FontAwesomeIcon */.gc, {
            icon: free_brands_svg_icons/* faGithubAlt */.ccf
          }),
          href: sanitizeUrl(modMetadata.github)
        })
      }), modMetadata.twitter && /*#__PURE__*/(0,jsx_runtime.jsx)(tooltip/* default */.A, {
        title: t('modDetails.header.modAuthor.twitter'),
        placement: "bottom",
        children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
          type: "text",
          icon: /*#__PURE__*/(0,jsx_runtime.jsx)(TextAsIconWrapper, {
            children: "\uD835\uDD4F"
          }),
          href: sanitizeUrl(modMetadata.twitter)
        })
      })]
    })]
  });
}
function createAuthorItem(author, modMetadata, t) {
  return {
    key: 'author',
    icon: free_solid_svg_icons/* faUser */.X46,
    text: author,
    tooltip: createAuthorTooltip(modMetadata, t)
  };
}
function createProcessesItem(modMetadata, t, customProcesses) {
  var _customProcesses$incl, _customProcesses$patt;
  const include = modMetadata.include || [];
  const exclude = modMetadata.exclude || [];
  let text;
  if (include.length === 0) {
    text = '';
  } else if (include.length === 1 && exclude.length === 0) {
    if (include[0] === '*') {
      text = t('modDetails.header.processes.all');
    } else {
      text = include[0];
    }
  } else {
    if (include.length === 1 && include[0] === '*') {
      text = t('modDetails.header.processes.allBut', {
        list: exclude.join(', ')
      });
    } else if (exclude.length > 0) {
      text = t('modDetails.header.processes.except', {
        included: include.join(', '),
        excluded: exclude.join(', ')
      });
    } else {
      text = include.join(', ');
    }
  }
  const includeCustom = (customProcesses == null ? void 0 : customProcesses.include) || [];
  const excludeCustom = (customProcesses == null ? void 0 : customProcesses.exclude) || [];
  const isCustomOnly = (_customProcesses$incl = customProcesses == null ? void 0 : customProcesses.includeExcludeCustomOnly) != null ? _customProcesses$incl : false;
  const patternsMatchCriticalSystemProcesses = (_customProcesses$patt = customProcesses == null ? void 0 : customProcesses.patternsMatchCriticalSystemProcesses) != null ? _customProcesses$patt : false;
  const hasCustomLists = includeCustom.length > 0 || excludeCustom.length > 0 || isCustomOnly;
  const tooltip = /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [/*#__PURE__*/(0,jsx_runtime.jsx)(TooltipSection, {
      children: /*#__PURE__*/(0,jsx_runtime.jsx)("strong", {
        children: t('modDetails.header.processes.tooltip.targets')
      })
    }), /*#__PURE__*/(0,jsx_runtime.jsxs)(TooltipProcessList, {
      children: [include.map((process, i) => {
        return /*#__PURE__*/(0,jsx_runtime.jsx)("li", {
          children: isCustomOnly ? /*#__PURE__*/(0,jsx_runtime.jsx)(DisabledProcessItem, {
            children: process
          }) : process
        }, i);
      }), includeCustom.map((process, i) => {
        return /*#__PURE__*/(0,jsx_runtime.jsx)("li", {
          children: /*#__PURE__*/(0,jsx_runtime.jsx)(CustomProcessItem, {
            children: process
          })
        }, i);
      })]
    }), (exclude.length > 0 || excludeCustom.length > 0) && /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(TooltipSection, {
        $hasMarginTop: true,
        children: /*#__PURE__*/(0,jsx_runtime.jsx)("strong", {
          children: t('modDetails.header.processes.tooltip.excluded')
        })
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(TooltipProcessList, {
        children: exclude.map((process, i) => {
          return /*#__PURE__*/(0,jsx_runtime.jsx)("li", {
            children: isCustomOnly ? /*#__PURE__*/(0,jsx_runtime.jsx)(DisabledProcessItem, {
              children: process
            }) : process
          }, i);
        })
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(TooltipProcessList, {
        children: excludeCustom.map((process, i) => {
          return /*#__PURE__*/(0,jsx_runtime.jsx)("li", {
            children: /*#__PURE__*/(0,jsx_runtime.jsx)(CustomProcessItem, {
              children: process
            })
          }, i);
        })
      })]
    }), (hasCustomLists || patternsMatchCriticalSystemProcesses) && /*#__PURE__*/(0,jsx_runtime.jsx)(TooltipNote, {
      children: /*#__PURE__*/(0,jsx_runtime.jsxs)(TooltipNoteList, {
        children: [hasCustomLists && /*#__PURE__*/(0,jsx_runtime.jsx)("li", {
          children: /*#__PURE__*/(0,jsx_runtime.jsx)(TooltipNoteText, {
            children: t('modDetails.header.processes.tooltip.customListsNote')
          })
        }), patternsMatchCriticalSystemProcesses && /*#__PURE__*/(0,jsx_runtime.jsx)("li", {
          children: /*#__PURE__*/(0,jsx_runtime.jsx)(TooltipNoteText, {
            children: t('modDetails.header.processes.tooltip.patternsMatchCriticalSystemProcessesNote')
          })
        })]
      })
    })]
  });
  return {
    key: 'processes',
    icon: free_solid_svg_icons/* faCrosshairs */.zTK,
    text,
    tooltip,
    showBadge: hasCustomLists || patternsMatchCriticalSystemProcesses
  };
}
function buildMetadataItems(modMetadata, t, customProcesses, repositoryDetails) {
  const items = [];
  if (modMetadata.version) {
    items.push(createVersionItem(modMetadata.version, t, repositoryDetails));
  }
  if (modMetadata.author) {
    items.push(createAuthorItem(modMetadata.author, modMetadata, t));
  }
  if (((modMetadata == null ? void 0 : modMetadata.include) || []).length > 0 || ((customProcesses == null ? void 0 : customProcesses.include) || []).length > 0) {
    items.push(createProcessesItem(modMetadata, t, customProcesses));
  }
  return items;
}

// Width constraints for single-line mode
const PROCESSES_MIN_WIDTH = 50;
/**
 * Calculates constrained widths for metadata items based on priority:
 * 1. Version: capped at half of container width, never shrinks
 * 2. Processes: shrinks first, down to PROCESSES_MIN_WIDTH
 * 3. Author: shrinks last, gets remaining space
 */
function calculateItemWidths(containerWidth, naturalWidths) {
  const totalNaturalWidth = Object.values(naturalWidths).reduce((sum, width) => sum + width, 0);

  // If everything fits naturally, no constraints needed
  if (totalNaturalWidth <= containerWidth) {
    return {};
  }
  const versionNatural = naturalWidths['version'] || 0;
  const authorNatural = naturalWidths['author'] || 0;
  const processesNatural = naturalWidths['processes'] || 0;

  // Version: capped at max, never shrinks below natural (up to cap)
  const versionWidth = Math.min(versionNatural, containerWidth / 2);
  let remainingWidth = containerWidth - versionWidth;

  // Processes: shrinks first, down to minimum
  const processesWidth = Math.max(PROCESSES_MIN_WIDTH, Math.min(processesNatural, remainingWidth - authorNatural));
  remainingWidth -= processesWidth;

  // Author: gets remaining space (may shrink significantly)
  const authorWidth = Math.max(0, remainingWidth);
  return {
    'version': versionWidth,
    'author': authorWidth,
    'processes': processesWidth
  };
}
function ModMetadataLine(props) {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const {
    modMetadata,
    singleLine,
    customProcesses,
    repositoryDetails
  } = props;
  const {
    direction
  } = (0,react.useContext)(config_provider/* default.ConfigContext */.Ay.ConfigContext);
  const metadataItems = (0,react.useMemo)(() => buildMetadataItems(modMetadata, t, customProcesses, repositoryDetails), [modMetadata, t, customProcesses, repositoryDetails]);
  const containerRef = (0,react.useRef)(null);
  const itemRefs = (0,react.useRef)({});
  const textRefs = (0,react.useRef)({});
  const [itemWidths, setItemWidths] = (0,react.useState)({});
  const [textWidths, setTextWidths] = (0,react.useState)({});
  const measureAndCalculate = (0,react.useCallback)(() => {
    if (!singleLine || !containerRef.current) {
      setItemWidths({});
      setTextWidths({});
      return;
    }

    // Skip if element is not visible
    const containerRect = containerRef.current.getBoundingClientRect();
    if (containerRect.width === 0 || containerRect.height === 0) {
      return;
    }
    const containerWidth = containerRect.width;
    const naturalWidths = {};
    const naturalTextWidths = {};
    for (const item of metadataItems) {
      const el = itemRefs.current[item.key];
      const textEl = textRefs.current[item.key];
      if (el && textEl) {
        // Temporarily set width to 'auto' to measure natural width, including
        // the hidden overflow text, then restore. Similar to el.scrollWidth, but
        // fractional, which is important for accurate total width and for
        // avoiding ellipsis.
        const prevElWidth = el.style.width;
        const prevTextElWidth = textEl.style.width;
        el.style.width = 'auto';
        textEl.style.width = 'auto';
        naturalWidths[item.key] = el.getBoundingClientRect().width;
        naturalTextWidths[item.key] = textEl.getBoundingClientRect().width;
        el.style.width = prevElWidth;
        textEl.style.width = prevTextElWidth;
      } else {
        naturalWidths[item.key] = 0;
        naturalTextWidths[item.key] = 0;
      }
    }
    const calculatedWidths = calculateItemWidths(containerWidth, naturalWidths);

    // Calculate text widths based on the difference between item and text
    // natural widths
    const calculatedTextWidths = {};
    for (const item of metadataItems) {
      const itemWidth = calculatedWidths[item.key];
      if (itemWidth !== undefined) {
        const widthDifference = naturalWidths[item.key] - naturalTextWidths[item.key];
        calculatedTextWidths[item.key] = itemWidth - widthDifference;
      }
    }
    setItemWidths(calculatedWidths);
    setTextWidths(calculatedTextWidths);
  }, [singleLine, metadataItems]);

  // Use useLayoutEffect for synchronous measurement before paint
  (0,react.useLayoutEffect)(() => {
    if (!singleLine) {
      return;
    }

    // Initial measurement
    measureAndCalculate();
  }, [singleLine, measureAndCalculate]);
  (0,react.useEffect)(() => {
    if (!singleLine) {
      return;
    }

    // Set up ResizeObserver for container size changes
    const resizeObserver = new ResizeObserver(() => {
      measureAndCalculate();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, [singleLine, measureAndCalculate]);
  if (metadataItems.length === 0) {
    return null;
  }
  return /*#__PURE__*/(0,jsx_runtime.jsx)(MetadataLineWrapper, {
    ref: containerRef,
    $singleLine: singleLine,
    children: metadataItems.map((item, i) => /*#__PURE__*/(0,jsx_runtime.jsxs)(MetadataItemWrapper, {
      ref: el => {
        itemRefs.current[item.key] = el;
      },
      $width: itemWidths[item.key],
      $singleLine: singleLine,
      children: [singleLine && i !== 0 && /*#__PURE__*/(0,jsx_runtime.jsx)(divider/* default */.A, {
        type: "vertical"
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(tooltip/* default */.A, {
        title: item.tooltip,
        placement: "bottom",
        children: /*#__PURE__*/(0,jsx_runtime.jsxs)(typography/* default */.A.Text, {
          ref: el => {
            textRefs.current[item.key] = el;
          },
          style: {
            width: textWidths[item.key]
          },
          ellipsis: true,
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(es_badge/* default */.A, {
            dot: item.showBadge,
            offset: [direction === 'rtl' ? 4 : -4, 4],
            color: "#177ddc",
            children: /*#__PURE__*/(0,jsx_runtime.jsx)(MetadataLineIcon, {
              icon: item.icon
            })
          }), item.text]
        })
      }), !singleLine && i < metadataItems.length - 1 && /*#__PURE__*/(0,jsx_runtime.jsx)(divider/* default */.A, {
        type: "vertical"
      })]
    }, item.key))
  });
}
/* harmony default export */ const panel_ModMetadataLine = (ModMetadataLine);
;// ./src/app/panel/ModDetailsHeader.tsx














const ModDetailsHeader_TextAsIconWrapper = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.span.withConfig({
  displayName: "ModDetailsHeader__TextAsIconWrapper",
  componentId: "sc-ow99in-0"
})(["position:relative;display:inline-block;width:1ch;font-size:18px;line-height:18px;color:transparent;user-select:none;&::before{content:'X';position:absolute;inset:0;color:rgba(255,255,255,0.88);}"]);
const ModDetailsHeaderWrapper = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsHeader__ModDetailsHeaderWrapper",
  componentId: "sc-ow99in-1"
})(["display:flex;margin-bottom:4px;> :first-child{flex-shrink:0;margin-inline-end:12px;margin-top:-8px;}.ant-card-meta{min-width:0;}"]);
const CardTitleWrapper = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsHeader__CardTitleWrapper",
  componentId: "sc-ow99in-2"
})(["padding-bottom:4px;"]);
const CardTitleFirstLine = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsHeader__CardTitleFirstLine",
  componentId: "sc-ow99in-3"
})(["display:flex;flex-wrap:wrap;align-items:center;column-gap:8px;> *{text-overflow:ellipsis;overflow:hidden;}> :not(:first-child){font-size:14px;font-weight:normal;}"]);
const CardTitleModId = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsHeader__CardTitleModId",
  componentId: "sc-ow99in-4"
})(["border-radius:2px;background:#444;padding:0 4px;"]);
const CardTitleDescription = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(components_EllipsisText).withConfig({
  displayName: "ModDetailsHeader__CardTitleDescription",
  componentId: "sc-ow99in-5"
})(["display:block !important;color:rgba(255,255,255,0.45);font-size:14px;font-weight:normal;"]);
const ModRate = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(rate/* default */.A).withConfig({
  displayName: "ModDetailsHeader__ModRate",
  componentId: "sc-ow99in-6"
})(["line-height:0.7;"]);
const HeartIcon = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(react_fontawesome_dist/* FontAwesomeIcon */.gc).withConfig({
  displayName: "ModDetailsHeader__HeartIcon",
  componentId: "sc-ow99in-7"
})(["color:#ff4d4f;margin-inline-end:4px;"]);
const CardTitleButtons = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsHeader__CardTitleButtons",
  componentId: "sc-ow99in-8"
})(["display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;> .ant-tooltip-disabled-compatible-wrapper,> .ant-popover-disabled-compatible-wrapper{font-size:0;}"]);
const ModInstallationAlert = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(es_alert/* default */.A).withConfig({
  displayName: "ModDetailsHeader__ModInstallationAlert",
  componentId: "sc-ow99in-9"
})(["line-height:1.2;"]);
const ModInstallationModalContent = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsHeader__ModInstallationModalContent",
  componentId: "sc-ow99in-10"
})(["display:flex;flex-direction:column;row-gap:24px;"]);
const ModInstallationDetails = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsHeader__ModInstallationDetails",
  componentId: "sc-ow99in-11"
})(["display:grid;grid-template-columns:20px auto;align-items:center;row-gap:4px;"]);
const ModInstallationDetailsVerified = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.span.withConfig({
  displayName: "ModDetailsHeader__ModInstallationDetailsVerified",
  componentId: "sc-ow99in-12"
})(["text-decoration:underline dotted;cursor:help;"]);
const ModInstallationSection = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsHeader__ModInstallationSection",
  componentId: "sc-ow99in-13"
})(["display:flex;flex-direction:column;gap:10px;"]);
const ModInstallationSectionTitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsHeader__ModInstallationSectionTitle",
  componentId: "sc-ow99in-14"
})(["font-size:15px;font-weight:600;"]);
const ModInstallationSectionDescription = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(typography/* default */.A.Text).withConfig({
  displayName: "ModDetailsHeader__ModInstallationSectionDescription",
  componentId: "sc-ow99in-15"
})(["color:rgba(255,255,255,0.65);"]);
const ModInstallationSignalsGrid = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsHeader__ModInstallationSignalsGrid",
  componentId: "sc-ow99in-16"
})(["display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;"]);
const ModInstallationSignalCard = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsHeader__ModInstallationSignalCard",
  componentId: "sc-ow99in-17"
})(["border-radius:10px;padding:12px 14px;border:1px solid rgba(255,255,255,0.08);background:", ";"], ({
  $tone
}) => $tone === 'positive' ? 'rgba(82, 196, 26, 0.08)' : $tone === 'caution' ? 'rgba(250, 173, 20, 0.08)' : 'rgba(255, 255, 255, 0.02)');
const ModInstallationSignalLabel = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(typography/* default */.A.Text).withConfig({
  displayName: "ModDetailsHeader__ModInstallationSignalLabel",
  componentId: "sc-ow99in-18"
})(["display:block;color:rgba(255,255,255,0.58);font-size:12px;text-transform:uppercase;letter-spacing:0.04em;"]);
const ModInstallationSignalValue = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsHeader__ModInstallationSignalValue",
  componentId: "sc-ow99in-19"
})(["margin-top:6px;color:rgba(255,255,255,0.92);font-size:16px;font-weight:600;line-height:1.35;"]);
const ModInstallationReviewActions = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsHeader__ModInstallationReviewActions",
  componentId: "sc-ow99in-20"
})(["display:flex;flex-wrap:wrap;gap:8px;"]);
const ModInstallationStrategyGrid = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsHeader__ModInstallationStrategyGrid",
  componentId: "sc-ow99in-21"
})(["display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;"]);
const ModInstallationStrategyCard = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsHeader__ModInstallationStrategyCard",
  componentId: "sc-ow99in-22"
})(["border-radius:10px;padding:12px 14px;border:1px solid ", ";background:", ";"], ({
  $recommended
}) => $recommended ? 'rgba(24, 144, 255, 0.55)' : 'rgba(255, 255, 255, 0.08)', ({
  $recommended
}) => $recommended ? 'rgba(24, 144, 255, 0.12)' : 'rgba(255, 255, 255, 0.02)');
const ModInstallationStrategyTitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsHeader__ModInstallationStrategyTitle",
  componentId: "sc-ow99in-23"
})(["font-size:14px;font-weight:700;"]);
const ModInstallationStrategyDescription = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsHeader__ModInstallationStrategyDescription",
  componentId: "sc-ow99in-24"
})(["margin-top:6px;color:rgba(255,255,255,0.68);line-height:1.45;"]);
const ModInstallationChecklist = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsHeader__ModInstallationChecklist",
  componentId: "sc-ow99in-25"
})(["display:flex;flex-direction:column;gap:6px;"]);
const ModInstallationChecklistItem = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsHeader__ModInstallationChecklistItem",
  componentId: "sc-ow99in-26"
})(["display:flex;gap:8px;color:rgba(255,255,255,0.72);line-height:1.45;&::before{content:'\u2022';color:rgba(255,255,255,0.48);}"]);
function VerifiedLabel() {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  return /*#__PURE__*/(0,jsx_runtime.jsx)(tooltip/* default */.A, {
    title: /*#__PURE__*/(0,jsx_runtime.jsx)(es/* Trans */.x6, {
      t: t,
      i18nKey: "installModal.verifiedTooltip",
      components: [/*#__PURE__*/(0,jsx_runtime.jsx)("strong", {})]
    }),
    placement: "bottom",
    children: /*#__PURE__*/(0,jsx_runtime.jsx)(ModInstallationDetailsVerified, {
      children: t('installModal.verified')
    })
  });
}
function ModInstallationDetailsGrid(props) {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const {
    modMetadata
  } = props;
  return /*#__PURE__*/(0,jsx_runtime.jsxs)(ModInstallationDetails, {
    children: [modMetadata.author && /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(react_fontawesome_dist/* FontAwesomeIcon */.gc, {
        icon: free_solid_svg_icons/* faUser */.X46
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)("div", {
        children: [/*#__PURE__*/(0,jsx_runtime.jsxs)("strong", {
          children: [t('installModal.modAuthor'), ":"]
        }), " ", modMetadata.author]
      })]
    }), modMetadata.homepage && /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(react_fontawesome_dist/* FontAwesomeIcon */.gc, {
        icon: free_solid_svg_icons/* faHome */.v02
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)("div", {
        children: [/*#__PURE__*/(0,jsx_runtime.jsxs)("strong", {
          children: [t('installModal.homepage'), ":"]
        }), ' ', /*#__PURE__*/(0,jsx_runtime.jsx)("a", {
          href: sanitizeUrl(modMetadata.homepage),
          children: modMetadata.homepage
        })]
      })]
    }), modMetadata.github && /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(react_fontawesome_dist/* FontAwesomeIcon */.gc, {
        icon: free_brands_svg_icons/* faGithubAlt */.ccf
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)("div", {
        children: [/*#__PURE__*/(0,jsx_runtime.jsxs)("strong", {
          children: [t('installModal.github'), " (", /*#__PURE__*/(0,jsx_runtime.jsx)(VerifiedLabel, {}), "):"]
        }), ' ', /*#__PURE__*/(0,jsx_runtime.jsx)("a", {
          href: sanitizeUrl(modMetadata.github),
          children: modMetadata.github.replace(/^https:\/\/github\.com\/([a-z0-9-]+)$/i, '$1')
        })]
      })]
    }), modMetadata.twitter && /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(ModDetailsHeader_TextAsIconWrapper, {
        children: "\uD835\uDD4F"
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)("div", {
        children: [/*#__PURE__*/(0,jsx_runtime.jsxs)("strong", {
          children: [t('installModal.twitter'), " (", /*#__PURE__*/(0,jsx_runtime.jsx)(VerifiedLabel, {}), "):"]
        }), ' ', /*#__PURE__*/(0,jsx_runtime.jsx)("a", {
          href: sanitizeUrl(modMetadata.twitter),
          children: modMetadata.twitter.replace(/^https:\/\/(?:twitter|x)\.com\/([a-z0-9_]+)$/i, '@$1')
        })]
      })]
    })]
  });
}
function formatRelativeUpdate(timestamp, locale) {
  const dayInMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((timestamp - Date.now()) / dayInMs);
  const absDays = Math.abs(diffDays);
  const formatter = new Intl.RelativeTimeFormat(locale, {
    numeric: 'auto'
  });
  if (absDays < 45) {
    return formatter.format(diffDays, 'day');
  }
  if (absDays < 540) {
    return formatter.format(Math.round(diffDays / 30), 'month');
  }
  return formatter.format(Math.round(diffDays / 365), 'year');
}
function ModDetailsHeader_normalizeProcessName(process) {
  return process.includes('\\') ? process.substring(process.lastIndexOf('\\') + 1) : process;
}
function getTargetingSummary(t, modMetadata) {
  const include = (modMetadata.include || []).filter(Boolean);
  if (!include.length) {
    return {
      value: t('installModal.values.metadataLimited'),
      tone: 'neutral'
    };
  }
  if (include.some(entry => entry.includes('*') || entry.includes('?'))) {
    return {
      value: t('installModal.values.allProcesses'),
      tone: 'caution'
    };
  }
  const processes = Array.from(new Set(include.map(entry => ModDetailsHeader_normalizeProcessName(entry))));
  if (processes.length === 1) {
    return {
      value: processes[0],
      tone: 'positive'
    };
  }
  if (processes.length <= 3) {
    return {
      value: processes.join(', '),
      tone: 'neutral'
    };
  }
  return {
    value: t('installModal.values.processPlusMore', {
      first: processes[0],
      count: processes.length - 1
    }),
    tone: processes.length >= 6 ? 'caution' : 'neutral'
  };
}
function buildReviewabilitySummary(t, installSourceData) {
  var _installSourceData$in;
  const items = [];
  if (installSourceData != null && installSourceData.source) {
    items.push(t('installModal.values.sourceCode'));
  }
  items.push(t('installModal.values.changelog'));
  if (installSourceData != null && (_installSourceData$in = installSourceData.initialSettings) != null && _installSourceData$in.length) {
    items.push(t('installModal.values.settings'));
  }
  if (installSourceData != null && installSourceData.readme) {
    items.push(t('installModal.values.readme'));
  }
  return items.join(' | ');
  // removed by dead control flow

}
function buildInstallSignals(t, locale, modMetadata, repositoryDetails, installSourceData) {
  const targeting = getTargetingSummary(t, modMetadata);
  const reviewability = buildReviewabilitySummary(t, installSourceData);
  return [{
    key: 'community',
    label: t('installModal.signals.community'),
    value: repositoryDetails ? t('installModal.values.communitySummary', {
      users: repositoryDetails.users.toLocaleString(),
      rating: (repositoryDetails.rating / 2).toFixed(1)
    }) : t('installModal.values.noCommunityData'),
    tone: repositoryDetails && repositoryDetails.users >= 1000 ? 'positive' : 'neutral'
  }, {
    key: 'targeting',
    label: t('installModal.signals.targeting'),
    value: targeting.value,
    tone: targeting.tone
  }, {
    key: 'freshness',
    label: t('installModal.signals.freshness'),
    value: repositoryDetails ? t('installModal.values.updatedRelative', {
      when: formatRelativeUpdate(repositoryDetails.updated, locale)
    }) : t('installModal.values.metadataLimited'),
    tone: repositoryDetails && (Date.now() - repositoryDetails.updated) / (24 * 60 * 60 * 1000) <= 90 ? 'positive' : 'neutral'
  }, {
    key: 'reviewability',
    label: t('installModal.signals.reviewability'),
    value: reviewability,
    tone: installSourceData != null && installSourceData.source ? 'positive' : 'neutral'
  }];
}
function ModDetailsHeader(props) {
  const {
    t,
    i18n
  } = (0,es/* useTranslation */.Bd)();
  const {
    modId,
    modMetadata,
    modConfig,
    modStatus,
    callbacks
  } = props;
  const {
    direction
  } = (0,react.useContext)(config_provider/* default.ConfigContext */.Ay.ConfigContext);
  let displayModId = props.modId;
  let isLocalMod = false;
  if (modId.startsWith('local@')) {
    displayModId = modId.slice('local@'.length);
    isLocalMod = true;
  }
  const displayModName = modMetadata.name || displayModId;
  const [isInstallModalOpen, setIsInstallModalOpen] = (0,react.useState)(false);
  const installSignals = (0,react.useMemo)(() => buildInstallSignals(t, i18n.language, modMetadata, props.repositoryDetails, props.installSourceData), [i18n.language, modMetadata, props.installSourceData, props.repositoryDetails, t]);
  const installRecommendations = (0,react.useMemo)(() => getInstallDecisionRecommendations(modMetadata, props.repositoryDetails, props.installSourceData), [modMetadata, props.installSourceData, props.repositoryDetails]);
  const installChecklist = (0,react.useMemo)(() => buildInstallDecisionChecklist(modMetadata, props.repositoryDetails, props.installSourceData), [modMetadata, props.installSourceData, props.repositoryDetails]);
  const handleReviewTab = tab => {
    callbacks.openTab == null || callbacks.openTab(tab);
    setIsInstallModalOpen(false);
  };
  const handleInstallDecision = action => {
    if (action === 'install-disabled') {
      callbacks.installMod == null || callbacks.installMod({
        disabled: true
      });
      setIsInstallModalOpen(false);
      return;
    }
    if (action === 'install-now') {
      callbacks.installMod == null || callbacks.installMod();
      setIsInstallModalOpen(false);
      return;
    }
    if (action === 'review-source') {
      handleReviewTab('code');
      return;
    }
    if (action === 'review-changelog') {
      handleReviewTab('changelog');
      return;
    }
    handleReviewTab('details');
  };
  return /*#__PURE__*/(0,jsx_runtime.jsxs)(ModDetailsHeaderWrapper, {
    children: [/*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
      type: "text",
      icon: /*#__PURE__*/(0,jsx_runtime.jsx)(react_fontawesome_dist/* FontAwesomeIcon */.gc, {
        icon: direction === 'rtl' ? free_solid_svg_icons/* faArrowRight */.dmS : free_solid_svg_icons/* faArrowLeft */.CeG
      }),
      onClick: () => callbacks.goBack()
    }), /*#__PURE__*/(0,jsx_runtime.jsx)(card/* default */.A.Meta, {
      title: /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
        children: [props.topNode, /*#__PURE__*/(0,jsx_runtime.jsxs)(CardTitleWrapper, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(CardTitleFirstLine, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)("div", {
              children: displayModName
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(tooltip/* default */.A, {
              title: t('modDetails.header.modId'),
              placement: "bottom",
              children: /*#__PURE__*/(0,jsx_runtime.jsx)(CardTitleModId, {
                children: displayModId
              })
            })]
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(panel_ModMetadataLine, {
            modMetadata: modMetadata,
            customProcesses: modConfig && {
              include: modConfig.includeCustom,
              exclude: modConfig.excludeCustom,
              includeExcludeCustomOnly: modConfig.includeExcludeCustomOnly,
              patternsMatchCriticalSystemProcesses: modConfig.patternsMatchCriticalSystemProcesses
            },
            repositoryDetails: props.repositoryDetails
          }), modMetadata.description && /*#__PURE__*/(0,jsx_runtime.jsx)(CardTitleDescription, {
            tooltipPlacement: "bottom",
            children: modMetadata.description
          }), modStatus !== 'not-installed' && modStatus !== 'installed-not-compiled' && !isLocalMod && /*#__PURE__*/(0,jsx_runtime.jsx)(ModRate, {
            value: props.userRating,
            onChange: newRating => callbacks.updateModRating(newRating)
          }), /*#__PURE__*/(0,jsx_runtime.jsxs)(CardTitleButtons, {
            children: [props.updateAvailable && /*#__PURE__*/(0,jsx_runtime.jsx)(tooltip/* default */.A, {
              title: props.installedVersionIsLatest && t('modDetails.header.updateNotNeeded'),
              placement: "bottom",
              children: /*#__PURE__*/(0,jsx_runtime.jsx)("div", {
                children: /*#__PURE__*/(0,jsx_runtime.jsx)(dropdown/* default */.A.Button, {
                  type: "primary",
                  size: "small",
                  disabled: !callbacks.updateMod || props.installedVersionIsLatest,
                  onClick: () => callbacks.updateMod == null ? void 0 : callbacks.updateMod(),
                  menu: {
                    items: [{
                      key: 'choose',
                      label: t('modDetails.version.chooseVersion'),
                      onClick: callbacks.onOpenVersionModal
                    }]
                  },
                  children: props.isDowngrade ? t('mod.downgrade') : t('mod.update')
                })
              })
            }), modStatus === 'not-installed' ? !props.updateAvailable &&
            /*#__PURE__*/
            // Wrap in div to prevent taking 100% width
            (0,jsx_runtime.jsx)("div", {
              children: /*#__PURE__*/(0,jsx_runtime.jsx)(dropdown/* default */.A.Button, {
                type: "primary",
                size: "small",
                disabled: !callbacks.installMod,
                onClick: () => setIsInstallModalOpen(true),
                menu: {
                  items: [{
                    key: 'choose',
                    label: t('modDetails.version.chooseVersion'),
                    onClick: callbacks.onOpenVersionModal
                  }]
                },
                children: t('mod.install')
              })
            }) : modStatus === 'installed-not-compiled' ? /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
              type: "primary",
              size: "small",
              onClick: () => callbacks.compileMod(),
              children: t('mod.compile')
            }) : modStatus === 'enabled' ? /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
              type: "primary",
              size: "small",
              onClick: () => callbacks.enableMod(false),
              children: t('mod.disable')
            }) : modStatus === 'disabled' ? /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
              type: "primary",
              size: "small",
              onClick: () => callbacks.enableMod(true),
              children: t('mod.enable')
            }) : '', modStatus !== 'not-installed' && isLocalMod && /*#__PURE__*/(0,jsx_runtime.jsx)(panel_DevModeAction, {
              popconfirmPlacement: "bottom",
              onClick: () => callbacks.editMod(),
              renderButton: onClick => /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
                type: "primary",
                size: "small",
                onClick: onClick,
                children: t('mod.edit')
              })
            }), modStatus !== 'not-installed' ? /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
              children: [/*#__PURE__*/(0,jsx_runtime.jsx)(panel_DevModeAction, {
                popconfirmPlacement: "bottom",
                onClick: () => callbacks.forkMod(),
                renderButton: onClick => /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
                  type: "primary",
                  size: "small",
                  onClick: onClick,
                  children: t('mod.fork')
                })
              }), /*#__PURE__*/(0,jsx_runtime.jsx)(PopconfirmModal, {
                placement: "bottom",
                title: t('mod.removeConfirm'),
                okText: t('mod.removeConfirmOk'),
                cancelText: t('mod.removeConfirmCancel'),
                okButtonProps: {
                  danger: true
                },
                onConfirm: () => callbacks.deleteMod(),
                children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
                  type: "primary",
                  size: "small",
                  children: t('mod.remove')
                })
              })]
            }) : /*#__PURE__*/(0,jsx_runtime.jsx)(panel_DevModeAction, {
              disabled: !callbacks.forkModFromSource,
              popconfirmPlacement: "bottom",
              onClick: () => callbacks.forkModFromSource == null ? void 0 : callbacks.forkModFromSource(),
              renderButton: onClick => /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
                type: "primary",
                size: "small",
                disabled: !callbacks.forkModFromSource,
                onClick: onClick,
                children: t('mod.fork')
              })
            }), modMetadata.donateUrl && /*#__PURE__*/(0,jsx_runtime.jsxs)(es_button/* default */.A, {
              type: "primary",
              size: "small",
              href: sanitizeUrl(modMetadata.donateUrl),
              target: "_blank",
              children: [/*#__PURE__*/(0,jsx_runtime.jsx)(HeartIcon, {
                icon: free_solid_svg_icons/* faHeart */.qcK
              }), t('mod.donate')]
            })]
          })]
        })]
      })
    }), /*#__PURE__*/(0,jsx_runtime.jsx)(modal/* default */.A, {
      title: t('installModal.title', {
        mod: displayModName
      }),
      open: isInstallModalOpen,
      width: 760,
      centered: true,
      onCancel: () => {
        setIsInstallModalOpen(false);
      },
      footer: [/*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
        onClick: () => setIsInstallModalOpen(false),
        children: t('installModal.cancelButton')
      }, "cancel"), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
        onClick: () => handleInstallDecision('install-disabled'),
        disabled: !callbacks.installMod,
        children: t('installModal.installDisabledButton')
      }, "disabled"), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
        type: "primary",
        onClick: () => handleInstallDecision('install-now'),
        disabled: !callbacks.installMod,
        children: t('installModal.acceptButton')
      }, "accept")],
      children: /*#__PURE__*/(0,jsx_runtime.jsxs)(ModInstallationModalContent, {
        children: [/*#__PURE__*/(0,jsx_runtime.jsx)(ModInstallationAlert, {
          message: /*#__PURE__*/(0,jsx_runtime.jsx)("h3", {
            children: t('installModal.warningTitle')
          }),
          description: t('installModal.warningDescription'),
          type: "warning",
          showIcon: true
        }), /*#__PURE__*/(0,jsx_runtime.jsxs)(ModInstallationSection, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(ModInstallationSectionTitle, {
            children: t('installModal.snapshotTitle')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(ModInstallationSectionDescription, {
            children: t('installModal.snapshotDescription')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(ModInstallationSignalsGrid, {
            children: installSignals.map(signal => /*#__PURE__*/(0,jsx_runtime.jsxs)(ModInstallationSignalCard, {
              $tone: signal.tone,
              children: [/*#__PURE__*/(0,jsx_runtime.jsx)(ModInstallationSignalLabel, {
                children: signal.label
              }), /*#__PURE__*/(0,jsx_runtime.jsx)(ModInstallationSignalValue, {
                children: signal.value
              })]
            }, signal.key))
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsxs)(ModInstallationSection, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(ModInstallationSectionTitle, {
            children: t('installModal.strategyTitle')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(ModInstallationSectionDescription, {
            children: t('installModal.strategyDescription')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(ModInstallationStrategyGrid, {
            children: installRecommendations.map(recommendation => /*#__PURE__*/(0,jsx_runtime.jsxs)(ModInstallationStrategyCard, {
              $recommended: recommendation.recommended,
              children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(ModInstallationStrategyTitle, {
                children: [recommendation.title, recommendation.recommended ? ` · ${t('installModal.recommended')}` : '']
              }), /*#__PURE__*/(0,jsx_runtime.jsx)(ModInstallationStrategyDescription, {
                children: recommendation.description
              }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
                size: "small",
                style: {
                  marginTop: 10
                },
                onClick: () => handleInstallDecision(recommendation.key),
                children: t('installModal.useStrategyButton')
              })]
            }, recommendation.key))
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(ModInstallationDetailsGrid, {
          modMetadata: modMetadata
        }), /*#__PURE__*/(0,jsx_runtime.jsxs)(ModInstallationSection, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(ModInstallationSectionTitle, {
            children: t('installModal.reviewTitle')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(ModInstallationSectionDescription, {
            children: t('installModal.reviewDescription')
          }), /*#__PURE__*/(0,jsx_runtime.jsxs)(ModInstallationReviewActions, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
              onClick: () => handleReviewTab('details'),
              children: t('installModal.viewDetailsButton')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
              onClick: () => handleReviewTab('code'),
              children: t('installModal.viewSourceButton')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
              onClick: () => handleReviewTab('changelog'),
              children: t('installModal.viewChangelogButton')
            })]
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsxs)(ModInstallationSection, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(ModInstallationSectionTitle, {
            children: t('installModal.checklistTitle')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(ModInstallationSectionDescription, {
            children: t('installModal.checklistDescription')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(ModInstallationChecklist, {
            children: installChecklist.map(item => /*#__PURE__*/(0,jsx_runtime.jsx)(ModInstallationChecklistItem, {
              children: /*#__PURE__*/(0,jsx_runtime.jsx)("span", {
                children: item
              })
            }, item))
          })]
        })]
      })
    })]
  });
}
/* harmony default export */ const panel_ModDetailsHeader = (ModDetailsHeader);
;// ./src/app/panel/ModDetailsReadme.tsx

const ModDetailsReadme_excluded = ["node", "src", "alt"];



function ModDetailsReadme({
  markdown,
  isLocalMod
}) {
  // Only use custom components for non-local mods to transform image URLs.
  const customComponents = isLocalMod ? undefined : {
    img: _ref => {
      let {
          src,
          alt
        } = _ref,
        props = (0,objectWithoutPropertiesLoose/* default */.A)(_ref, ModDetailsReadme_excluded);
      let transformedSrc = src;

      // Transform certain image URLs to go through our image proxy. This
      // ensures that the original images are available even if they're removed
      // from the original hosting site. Also, Imgur is blocked in the UK, so
      // this makes Imgur images accessible there.
      if (src) {
        const shouldTransform = src.startsWith('https://i.imgur.com/') || src.startsWith('https://raw.githubusercontent.com/') && !src.startsWith('https://raw.githubusercontent.com/ramensoftware/');
        if (shouldTransform) {
          const path = src.slice('https://'.length);
          transformedSrc = `https://mods.windhawk.net/images/${path}`;
        }
      }
      return /*#__PURE__*/(0,jsx_runtime.jsx)("img", Object.assign({
        src: transformedSrc,
        alt: alt
      }, props));
    }
  };
  return /*#__PURE__*/(0,jsx_runtime.jsx)(config_provider/* default */.Ay, {
    direction: "ltr",
    children: /*#__PURE__*/(0,jsx_runtime.jsx)(components_ReactMarkdownCustom, {
      markdown: markdown,
      components: customComponents,
      direction: "ltr"
    })
  });
}
/* harmony default export */ const panel_ModDetailsReadme = (ModDetailsReadme);
// EXTERNAL MODULE: ../../node_modules/@monaco-editor/react/dist/index.mjs + 11 modules
var react_dist = __webpack_require__(32175);
// EXTERNAL MODULE: ../../node_modules/js-yaml/dist/js-yaml.mjs
var js_yaml = __webpack_require__(9911);
// EXTERNAL MODULE: include-loader!../../node_modules/monaco-editor/esm/vs/editor/editor.api.js + 4 modules
var editor_api = __webpack_require__(18270);
;// ./src/app/panel/ModDetailsSettings.tsx















// Configure Monaco Editor to use local npm package instead of CDN.

react_dist/* loader */.wG.config({
  monaco: editor_api
});
const SettingsWrapper = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsSettings__SettingsWrapper",
  componentId: "sc-fgih6i-0"
})([".ant-list:not(.ant-list-split) > div > div > ul > li.ant-list-item{border-bottom:none;}padding-top:12px;padding-bottom:12px;"]);
const SettingInputNumber = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(InputNumberWithContextMenu).withConfig({
  displayName: "ModDetailsSettings__SettingInputNumber",
  componentId: "sc-fgih6i-1"
})(["width:100%;max-width:130px;input:focus{outline:none !important;}"]);
const SettingSelect = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(SelectModal).withConfig({
  displayName: "ModDetailsSettings__SettingSelect",
  componentId: "sc-fgih6i-2"
})(["width:100%;"]);
const SettingsCard = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(card/* default */.A).withConfig({
  displayName: "ModDetailsSettings__SettingsCard",
  componentId: "sc-fgih6i-3"
})(["width:100%;"]);
const ArraySettingsItemWrapper = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsSettings__ArraySettingsItemWrapper",
  componentId: "sc-fgih6i-4"
})(["display:flex;gap:12px;"]);
const ArraySettingsDropdownOptionsButton = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(es_button/* default */.A).withConfig({
  displayName: "ModDetailsSettings__ArraySettingsDropdownOptionsButton",
  componentId: "sc-fgih6i-5"
})(["padding-inline-start:10px;padding-inline-end:10px;"]);
const SettingsListItem = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(list/* default */.Ay.Item).withConfig({
  displayName: "ModDetailsSettings__SettingsListItem",
  componentId: "sc-fgih6i-6"
})(["&:first-child{padding-top:0;}&:last-child{padding-bottom:0;}"]);
const ModDetailsSettings_SettingsListItemMeta = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(list/* default */.Ay.Item.Meta).withConfig({
  displayName: "ModDetailsSettings__SettingsListItemMeta",
  componentId: "sc-fgih6i-7"
})([".ant-list-item-meta{margin-bottom:8px;}.ant-list-item-meta-title{margin-bottom:0;}.ant-list-item-meta-description{white-space:pre-line;}"]);
const SaveSettingsCard = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(card/* default */.A).withConfig({
  displayName: "ModDetailsSettings__SaveSettingsCard",
  componentId: "sc-fgih6i-8"
})(["position:sticky;top:0;z-index:1;margin-inline-start:-12px;margin-inline-end:-12px;margin-top:-12px;"]);
const ActionButtonsWrapper = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsSettings__ActionButtonsWrapper",
  componentId: "sc-fgih6i-9"
})(["display:flex;gap:12px;"]);
const YamlEditorWrapper = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsSettings__YamlEditorWrapper",
  componentId: "sc-fgih6i-10"
})(["direction:ltr;margin-top:12px;"]);
const YamlErrorContent = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsSettings__YamlErrorContent",
  componentId: "sc-fgih6i-11"
})(["display:inline-block;text-align:start;font-family:'Consolas','Monaco','Courier New',monospace;white-space:pre-wrap;"]);
var SettingType = /*#__PURE__*/function (SettingType) {
  SettingType["Boolean"] = "boolean";
  SettingType["Number"] = "number";
  SettingType["String"] = "string";
  SettingType["NestedObject"] = "nested-object";
  SettingType["NumberArray"] = "number-array";
  SettingType["StringArray"] = "string-array";
  SettingType["ObjectArray"] = "object-array";
  return SettingType;
}(SettingType || {});
function isInitialSettingItem(value) {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value;
  return typeof record['key'] === 'string' && 'value' in record;
}
function isInitialSettingsArray(value) {
  return Array.isArray(value) && value.every(isInitialSettingItem);
}
function isInitialSettingsCollection(value) {
  return value.every(isInitialSettingsArray);
}
function isNumberArrayValue(value) {
  return value.every(item => typeof item === 'number');
}
function isStringArrayValue(value) {
  return value.every(item => typeof item === 'string');
}
function describeSetting(value) {
  if (typeof value === 'boolean') {
    return {
      kind: SettingType.Boolean,
      value,
      defaultValue: 0
    };
  }
  if (typeof value === 'number') {
    return {
      kind: SettingType.Number,
      value,
      defaultValue: 0
    };
  }
  if (typeof value === 'string') {
    return {
      kind: SettingType.String,
      value,
      defaultValue: ''
    };
  }
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('Initial settings arrays must contain at least one template entry.');
  }
  const arrayValue = value;
  if (isInitialSettingsCollection(arrayValue)) {
    const [first] = arrayValue;
    if (first.length === 0) {
      throw new Error('Invalid object array schema definition.');
    }
    return {
      kind: SettingType.ObjectArray,
      value: arrayValue,
      children: first
    };
  }
  if (isInitialSettingsArray(arrayValue)) {
    return {
      kind: SettingType.NestedObject,
      value: arrayValue,
      children: arrayValue
    };
  }
  if (isNumberArrayValue(arrayValue)) {
    return {
      kind: SettingType.NumberArray,
      value: arrayValue,
      defaultValue: 0
    };
  }
  if (isStringArrayValue(arrayValue)) {
    return {
      kind: SettingType.StringArray,
      value: arrayValue,
      defaultValue: ''
    };
  }
  throw new Error(`Unknown setting type for value: ${JSON.stringify(value)}`);
}

// ============================================================================
// Utility Functions
// ============================================================================

function parseIntLax(value) {
  const result = parseInt((value != null ? value : 0).toString(), 10);
  return Number.isNaN(result) ? 0 : result;
}

/**
 * Formats a YAML error message for display in Ant Design message component.
 * Handles multiline error messages by rendering each line separately.
 */
function formatYamlError(error) {
  const lines = error.split('\n');
  return /*#__PURE__*/(0,jsx_runtime.jsx)(YamlErrorContent, {
    children: lines.map((line, index) => /*#__PURE__*/(0,jsx_runtime.jsxs)("span", {
      children: [line, index < lines.length - 1 && /*#__PURE__*/(0,jsx_runtime.jsx)("br", {})]
    }, index))
  });
}

// ============================================================================
// YAML Schema Validation
// ============================================================================

/**
 * Helper to check if a value is a plain object (not array, not null)
 */
function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function toNestedSettings(value) {
  return isPlainObject(value) ? value : {};
}

/**
 * Natural sort comparator for strings with numbers.
 * Compares strings such that "item2" comes before "item10".
 */
function naturalSort(a, b) {
  return a.localeCompare(b, undefined, {
    numeric: true,
    sensitivity: 'base'
  });
}
class YamlSchemaValidator {
  constructor(initialSettings) {
    this.validKeys = void 0;
    this.typeSchema = void 0;
    this.validKeys = this.buildValidKeys(initialSettings);
    this.typeSchema = this.buildTypeSchema(initialSettings);
  }
  buildValidKeys(settings, prefix = '') {
    const keys = new Set();
    for (const item of settings) {
      const key = prefix ? `${prefix}.${item.key}` : item.key;
      keys.add(key);
      const descriptor = describeSetting(item.value);
      if (descriptor.kind === SettingType.NestedObject || descriptor.kind === SettingType.ObjectArray) {
        const nestedKeys = this.buildValidKeys(descriptor.children, key);
        nestedKeys.forEach(nestedKey => keys.add(nestedKey));
      }
    }
    return keys;
  }
  buildTypeSchema(settings, prefix = '') {
    const schema = new Map();
    for (const item of settings) {
      const key = prefix ? `${prefix}.${item.key}` : item.key;
      const descriptor = describeSetting(item.value);
      switch (descriptor.kind) {
        case SettingType.Boolean:
        case SettingType.Number:
          schema.set(key, 'number');
          break;
        case SettingType.String:
          schema.set(key, 'string');
          break;
        case SettingType.NestedObject:
        case SettingType.ObjectArray:
          {
            const nestedSchema = this.buildTypeSchema(descriptor.children, key);
            nestedSchema.forEach((type, nestedKey) => schema.set(nestedKey, type));
            break;
          }
        case SettingType.NumberArray:
          schema.set(key, 'number[]');
          break;
        case SettingType.StringArray:
          schema.set(key, 'string[]');
          break;
      }
    }
    return schema;
  }
  validateKeys(nested, prefix = '') {
    for (const [key, value] of Object.entries(nested)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      // Check validity for this key first
      if (!this.validKeys.has(fullKey)) {
        return fullKey;
      }

      // Then recurse into nested structures
      if (Array.isArray(value)) {
        for (const item of value) {
          if (isPlainObject(item)) {
            const invalidKey = this.validateKeys(item, fullKey);
            if (invalidKey) {
              return invalidKey;
            }
          }
        }
      } else if (isPlainObject(value)) {
        const invalidKey = this.validateKeys(value, fullKey);
        if (invalidKey) {
          return invalidKey;
        }
      }
    }
    return null;
  }
  validateTypes(nested, prefix = '') {
    for (const [key, value] of Object.entries(nested)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const expectedType = this.typeSchema.get(fullKey);
      if (expectedType) {
        const error = this.validateValue(fullKey, value, expectedType);
        if (error) return error;
      } else {
        // Even if key is not in schema, recurse into nested structures
        if (Array.isArray(value)) {
          for (const item of value) {
            if (isPlainObject(item)) {
              const error = this.validateTypes(item, fullKey);
              if (error) return error;
            }
          }
        } else if (isPlainObject(value)) {
          const error = this.validateTypes(value, fullKey);
          if (error) return error;
        }
      }
    }
    return null;
  }
  validateValue(fullKey, value, expectedType) {
    const actualType = this.getActualType(value);

    // Handle array types
    if (expectedType.endsWith('[]')) {
      if (!Array.isArray(value)) {
        return {
          key: fullKey,
          expected: 'array',
          actual: actualType
        };
      }
      return this.validateArrayElements(fullKey, value, expectedType);
    }

    // Handle primitive types
    if (expectedType !== actualType) {
      return {
        key: fullKey,
        expected: expectedType,
        actual: actualType
      };
    }

    // Handle nested objects
    if (isPlainObject(value)) {
      return this.validateTypes(value, fullKey);
    }
    return null;
  }
  getActualType(value) {
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }
  validateArrayElements(fullKey, array, expectedType) {
    const elementType = expectedType.replace('[]', '');
    for (let i = 0; i < array.length; i++) {
      const item = array[i];
      const itemKey = `${fullKey}[${i}]`;
      const actualType = this.getActualType(item);
      if (elementType === 'object') {
        if (!isPlainObject(item)) {
          return {
            key: itemKey,
            expected: 'object',
            actual: actualType
          };
        }
        const typeError = this.validateTypes(item, fullKey);
        if (typeError) return typeError;
      } else if (elementType !== actualType) {
        return {
          key: itemKey,
          expected: elementType,
          actual: actualType
        };
      }
    }
    return null;
  }
}

// ============================================================================
// YAML Conversion Utilities
// ============================================================================

class YamlConverter {
  static flatToNested(flatSettings, initialSettings) {
    const nested = {};
    const keysToProcess = Object.keys(flatSettings);

    // Filter keys to only include those that match the schema structure
    const validKeys = keysToProcess.filter(key => this.keyMatchesSchemaStructure(key, initialSettings));
    for (const key of validKeys) {
      this.setNestedValue(nested, key, flatSettings[key]);
    }
    return this.normalizeWithSchema(nested, initialSettings);
  }

  /**
   * Check if a key path matches the schema structure.
   * Returns false if:
   * - Key uses array notation [index] where schema defines an object
   * - Key uses object notation .property where schema defines an array
   */
  static keyMatchesSchemaStructure(key, initialSettings) {
    const parts = this.parseKeyPath(key);
    let currentSettings = initialSettings;
    for (let i = 0; i < parts.length; i++) {
      const {
        part,
        index
      } = parts[i];

      // Find the setting that matches this part
      const setting = currentSettings.find(s => s.key === part);
      if (!setting) {
        // Key not in schema - let validation handle it
        return true;
      }
      const descriptor = describeSetting(setting.value);
      const isArrayPart = index !== undefined;
      const expectsArray = descriptor.kind === SettingType.NumberArray || descriptor.kind === SettingType.StringArray || descriptor.kind === SettingType.ObjectArray;
      if (expectsArray !== isArrayPart) {
        return false;
      }
      switch (descriptor.kind) {
        case SettingType.ObjectArray:
        case SettingType.NestedObject:
          currentSettings = descriptor.children;
          break;
        default:
          return true;
      }
    }
    return true;
  }
  static setNestedValue(nested, key, value) {
    const parts = this.parseKeyPath(key);
    let current = nested;

    // Navigate through all parts, creating structure as needed
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLastPart = i === parts.length - 1;
      if (part.index !== undefined) {
        var _current, _part$part, _current$_part$part;
        // Navigate to array by property name
        (_current$_part$part = (_current = current)[_part$part = part.part]) != null ? _current$_part$part : _current[_part$part] = [];
        const currentArray = current[part.part];

        // Set value or navigate to array element
        if (isLastPart) {
          currentArray[part.index] = value;
        } else {
          var _part$index, _currentArray$_part$i;
          (_currentArray$_part$i = currentArray[_part$index = part.index]) != null ? _currentArray$_part$i : currentArray[_part$index] = {};
          current = currentArray[part.index];
        }
      } else {
        // Set value or navigate to property
        if (isLastPart) {
          current[part.part] = value;
        } else {
          var _current2, _part$part2, _current2$_part$part;
          (_current2$_part$part = (_current2 = current)[_part$part2 = part.part]) != null ? _current2$_part$part : _current2[_part$part2] = {};
          current = current[part.part];
        }
      }
    }
  }

  /**
   * Parse a key path and track whether each part is from bracket notation.
   * Returns array of {part, index} objects. index is optional.
   * Example: "config.x" -> [{part: 'config'}, {part: 'x'}]
   * Example: "config.42" -> [{part: 'config'}, {part: '42'}]
   * Example: "config[42]" -> [{part: 'config', index: 42}]
   */
  static parseKeyPath(key) {
    const parts = [];
    let remaining = key;
    while (remaining) {
      // Match property name with optional array index: word or word[123]
      const match = remaining.match(/^([^.[]+)(?:\[(\d+)\])?\.?(.*)/);
      if (!match) {
        break;
      }
      const part = {
        part: match[1]
      };
      if (match[2] !== undefined) {
        part.index = parseInt(match[2], 10);
      }
      parts.push(part);
      remaining = match[3];
    }
    return parts;
  }

  /**
   * Combines provided values with schema metadata: orders keys, applies
   * defaults, and coerces to schema types.
   */
  static normalizeWithSchema(target, schema) {
    const ordered = {};
    const remainingKeys = new Set(Object.keys(target));
    for (const item of schema) {
      const {
        key
      } = item;
      const descriptor = describeSetting(item.value);
      const existingValue = target[key];
      switch (descriptor.kind) {
        case SettingType.Boolean:
        case SettingType.Number:
        case SettingType.String:
          ordered[key] = this.normalizePrimitiveValue(existingValue, descriptor);
          break;
        case SettingType.NestedObject:
          ordered[key] = this.normalizeNestedObject(existingValue, descriptor.children);
          break;
        case SettingType.ObjectArray:
          ordered[key] = this.normalizeObjectArray(existingValue, descriptor.children);
          break;
        case SettingType.NumberArray:
          ordered[key] = this.normalizePrimitiveArray(existingValue, descriptor.defaultValue, this.isNumberValue);
          break;
        case SettingType.StringArray:
          ordered[key] = this.normalizePrimitiveArray(existingValue, descriptor.defaultValue, this.isStringValue);
          break;
      }
      remainingKeys.delete(key);
    }
    if (remainingKeys.size > 0) {
      const extras = Array.from(remainingKeys).sort(naturalSort);
      for (const key of extras) {
        ordered[key] = target[key];
      }
    }
    return ordered;
  }
  static highestDefinedIndex(array) {
    for (let i = array.length - 1; i >= 0; i--) {
      if (array[i] !== undefined) {
        return i;
      }
    }
    return -1;
  }
  static normalizeNestedObject(value, schema) {
    return this.normalizeWithSchema(toNestedSettings(value), schema);
  }
  static normalizeObjectArray(value, schema) {
    const existingArray = Array.isArray(value) ? value : [];
    const highestIndex = Math.max(this.highestDefinedIndex(existingArray), 0);
    const result = [];
    for (let index = 0; index <= highestIndex; index += 1) {
      result[index] = this.normalizeWithSchema(toNestedSettings(existingArray[index]), schema);
    }
    return result;
  }
  static normalizePrimitiveArray(value, defaultValue, guard) {
    const existingArray = Array.isArray(value) ? value : [];
    const highestIndex = Math.max(this.highestDefinedIndex(existingArray), 0);
    const result = [];
    for (let index = 0; index <= highestIndex; index += 1) {
      const candidate = existingArray[index];
      result[index] = guard(candidate) ? candidate : defaultValue;
    }
    return result;
  }
  static isNumberValue(value) {
    return typeof value === 'number';
  }
  static isStringValue(value) {
    return typeof value === 'string';
  }
  static normalizePrimitiveValue(value, descriptor) {
    if (descriptor.kind === SettingType.Boolean) {
      return this.normalizeBooleanValue(value, descriptor.defaultValue);
    }
    if (descriptor.kind === SettingType.Number) {
      return this.normalizeNumberValue(value, descriptor.defaultValue);
    }
    return this.normalizeStringValue(value, descriptor.defaultValue);
  }
  static normalizeBooleanValue(value, defaultValue) {
    if (value === undefined) {
      return defaultValue;
    }
    if (typeof value === 'number') {
      return value ? 1 : 0;
    }
    if (typeof value === 'string') {
      return parseIntLax(value) ? 1 : 0;
    }
    return defaultValue;
  }
  static normalizeNumberValue(value, defaultValue) {
    if (value === undefined) {
      return defaultValue;
    }
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      return parseIntLax(value);
    }
    return defaultValue;
  }
  static normalizeStringValue(value, defaultValue) {
    if (value === undefined) {
      return defaultValue;
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    return defaultValue;
  }
  static nestedToFlat(nested, prefix = '') {
    const flat = {};
    if (Array.isArray(nested)) {
      nested.forEach((item, index) => {
        const key = `${prefix}[${index}]`;
        Object.assign(flat, isPlainObject(item) ? this.nestedToFlat(item, key) : {
          [key]: item
        });
      });
    } else {
      for (const [key, value] of Object.entries(nested)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            const arrayKey = `${fullKey}[${index}]`;
            Object.assign(flat, isPlainObject(item) ? this.nestedToFlat(item, arrayKey) : {
              [arrayKey]: item
            });
          });
        } else if (isPlainObject(value)) {
          Object.assign(flat, this.nestedToFlat(value, fullKey));
        } else {
          flat[fullKey] = value;
        }
      }
    }
    return flat;
  }
  static removeEmptyValues(value) {
    if (Array.isArray(value)) {
      return this.cleanArray(value);
    }
    if (isPlainObject(value)) {
      return this.cleanObject(value);
    }
    return value;
  }
  static cleanArray(array) {
    // Compact a possibly sparse array
    const compacted = Object.values(array);

    // Find the last non-empty index, but skip the first element
    let lastNonEmpty = 0;
    for (let i = compacted.length - 1; i >= 1; i--) {
      const value = compacted[i];
      if (!this.isEmptyValue(value)) {
        lastNonEmpty = i;
        break;
      }
    }

    // Trim to last non-empty element, but never remove all elements
    const trimmed = compacted.slice(0, lastNonEmpty + 1);

    // Clean nested objects
    const cleaned = trimmed.map(value => {
      if (isPlainObject(value)) {
        return this.cleanObject(value);
      }
      return value;
    });
    return cleaned;
  }
  static cleanObject(obj) {
    return Object.fromEntries(Object.entries(obj).map(([key, val]) => [key, this.removeEmptyValues(val)]));
  }
  static isEmptyValue(value) {
    if (Array.isArray(value)) {
      return value.every(v => this.isEmptyValue(v));
    }
    if (isPlainObject(value)) {
      return Object.values(value).every(v => this.isEmptyValue(v));
    }
    return value === '' || value === 0;
  }
  static toYaml(settings, initialSettings) {
    try {
      const nested = this.flatToNested(settings, initialSettings);
      const cleaned = this.removeEmptyValues(nested);
      const yamlText = js_yaml/* dump */.Bh(cleaned, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false
      });
      return yamlText.trim() === '{}' ? '' : yamlText;
    } catch (error) {
      console.error('Error converting settings to YAML:', error);
      return '';
    }
  }
  static fromYaml(yamlString, validator, t) {
    if (!yamlString.trim()) {
      return {
        settings: {},
        error: null
      };
    }
    try {
      const parsed = js_yaml/* load */.Hh(yamlString);

      // Validate structure
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return {
          settings: null,
          error: t('modDetails.settings.yamlInvalid')
        };
      }

      // Validate keys
      const invalidKey = validator.validateKeys(parsed);
      if (invalidKey) {
        return {
          settings: null,
          error: t('modDetails.settings.yamlInvalidKey', {
            key: invalidKey
          })
        };
      }

      // Validate types
      const typeError = validator.validateTypes(parsed);
      if (typeError) {
        return {
          settings: null,
          error: t('modDetails.settings.yamlTypeMismatch', {
            key: typeError.key,
            expected: typeError.expected,
            actual: typeError.actual
          })
        };
      }
      return {
        settings: this.nestedToFlat(parsed),
        error: null
      };
    } catch (error) {
      return {
        settings: null,
        error: t('modDetails.settings.yamlParseError', {
          error: error instanceof Error ? error.message : String(error)
        })
      };
    }
  }
}

// ============================================================================
// Component Definitions
// ============================================================================

function BooleanSetting({
  checked,
  onChange
}) {
  return /*#__PURE__*/(0,jsx_runtime.jsx)(es_switch/* default */.A, {
    checked: checked,
    onChange: onChange
  });
}
function StringSetting({
  value,
  sampleValue,
  onChange
}) {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  return /*#__PURE__*/(0,jsx_runtime.jsx)(InputWithContextMenu, {
    placeholder: sampleValue ? t('modDetails.settings.sampleValue') + `: ${sampleValue}` : undefined,
    value: value,
    onChange: e => onChange(e.target.value)
  });
}
function SelectSetting({
  value,
  selectItems,
  onChange
}) {
  let maxWidth = undefined;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.font = '14px "Segoe UI"';
    if (selectItems.every(item => ctx.measureText(item.label).width <= 350)) {
      maxWidth = '400px';
    }
  }
  return /*#__PURE__*/(0,jsx_runtime.jsx)("div", {
    style: {
      maxWidth
    },
    children: /*#__PURE__*/(0,jsx_runtime.jsx)(SettingSelect, {
      showSearch: true,
      optionFilterProp: "children",
      listHeight: 240,
      value: value,
      onChange: newValue => onChange(newValue),
      children: selectItems.map(item => /*#__PURE__*/(0,jsx_runtime.jsx)(es_select/* default */.A.Option, {
        value: item.value,
        children: item.label
      }, item.value))
    })
  });
}
function NumberSetting({
  value,
  onChange
}) {
  return /*#__PURE__*/(0,jsx_runtime.jsx)(SettingInputNumber, {
    value: value,
    min: -2147483648,
    max: 2147483647,
    onChange: newValue => onChange(parseIntLax(newValue))
  });
}
function SingleSetting({
  settingsTreeProps,
  initialSettingsValue,
  initialSettingItemExtra,
  settingKey
}) {
  var _modSettings$settingK2;
  const {
    modSettings,
    onSettingChanged
  } = settingsTreeProps;
  const descriptor = describeSetting(initialSettingsValue);
  switch (descriptor.kind) {
    case SettingType.Boolean:
      return /*#__PURE__*/(0,jsx_runtime.jsx)(BooleanSetting, {
        checked: !!parseIntLax(modSettings[settingKey]),
        onChange: checked => onSettingChanged(settingKey, checked ? 1 : 0)
      });
    case SettingType.Number:
      return /*#__PURE__*/(0,jsx_runtime.jsx)(NumberSetting, {
        value: modSettings[settingKey] === undefined ? undefined : parseIntLax(modSettings[settingKey]),
        onChange: newValue => onSettingChanged(settingKey, newValue)
      });
    case SettingType.String:
      if (initialSettingItemExtra != null && initialSettingItemExtra.options) {
        var _modSettings$settingK;
        return /*#__PURE__*/(0,jsx_runtime.jsx)(SelectSetting, {
          value: ((_modSettings$settingK = modSettings[settingKey]) != null ? _modSettings$settingK : '').toString(),
          selectItems: initialSettingItemExtra.options.map(option => {
            const [value, label] = Object.entries(option)[0];
            return {
              value,
              label
            };
          }),
          onChange: newValue => onSettingChanged(settingKey, newValue)
        });
      }
      return /*#__PURE__*/(0,jsx_runtime.jsx)(StringSetting, {
        value: ((_modSettings$settingK2 = modSettings[settingKey]) != null ? _modSettings$settingK2 : '').toString(),
        sampleValue: descriptor.value,
        onChange: newValue => onSettingChanged(settingKey, newValue)
      });
    case SettingType.NumberArray:
    case SettingType.StringArray:
    case SettingType.ObjectArray:
      return /*#__PURE__*/(0,jsx_runtime.jsx)(ArraySettings, {
        settingsTreeProps: settingsTreeProps,
        initialSettingsItems: descriptor.value,
        initialSettingItemExtra: initialSettingItemExtra,
        keyPrefix: settingKey
      });
    case SettingType.NestedObject:
      return /*#__PURE__*/(0,jsx_runtime.jsx)(SettingsCard, {
        children: /*#__PURE__*/(0,jsx_runtime.jsx)(ObjectSettings, {
          settingsTreeProps: settingsTreeProps,
          initialSettings: descriptor.value,
          keyPrefix: settingKey + '.'
        })
      });
  }
}
function ArraySettings({
  settingsTreeProps,
  initialSettingsItems,
  initialSettingItemExtra,
  keyPrefix
}) {
  var _arrayItemMaxIndex$ke;
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const {
    modSettings,
    arrayItemMaxIndex,
    onRemoveArrayItem,
    onNewArrayItem
  } = settingsTreeProps;
  const maxSettingsArrayIndex = Object.keys(modSettings).reduce((maxIndex, key) => {
    if (key.startsWith(keyPrefix + '[')) {
      const match = key.slice((keyPrefix + '[').length).match(/^(\d+)\]/);
      if (match) {
        return Math.max(maxIndex, parseIntLax(match[1]));
      }
    }
    return maxIndex;
  }, -1);
  const maxArrayIndex = Math.max(maxSettingsArrayIndex, (_arrayItemMaxIndex$ke = arrayItemMaxIndex[keyPrefix]) != null ? _arrayItemMaxIndex$ke : 0);
  const indexValues = [...Array(maxArrayIndex + 1).keys(), -1];
  const defaultValue = initialSettingsItems[0];
  return /*#__PURE__*/(0,jsx_runtime.jsx)(list/* default */.Ay, {
    itemLayout: "vertical",
    dataSource: indexValues,
    renderItem: index => /*#__PURE__*/(0,jsx_runtime.jsx)(SettingsListItem, {
      children: /*#__PURE__*/(0,jsx_runtime.jsx)("div", {
        children: index === -1 ? /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
          disabled: maxArrayIndex !== maxSettingsArrayIndex,
          onClick: () => onNewArrayItem(keyPrefix, maxArrayIndex + 1),
          children: t('modDetails.settings.arrayItemAdd')
        }) : /*#__PURE__*/(0,jsx_runtime.jsxs)(ArraySettingsItemWrapper, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(DropdownModal, {
            menu: {
              items: [{
                label: t('modDetails.settings.arrayItemRemove'),
                key: 'remove',
                onClick: () => {
                  dropdownModalDismissed();
                  onRemoveArrayItem(keyPrefix, index);
                }
              }]
            },
            trigger: ['click'],
            children: /*#__PURE__*/(0,jsx_runtime.jsx)(ArraySettingsDropdownOptionsButton, {
              children: /*#__PURE__*/(0,jsx_runtime.jsx)(react_fontawesome_dist/* FontAwesomeIcon */.gc, {
                icon: free_solid_svg_icons/* faCaretDown */.xBV
              })
            })
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(SingleSetting, {
            settingsTreeProps: settingsTreeProps,
            initialSettingsValue: defaultValue,
            initialSettingItemExtra: initialSettingItemExtra,
            settingKey: `${keyPrefix}[${index}]`
          })]
        })
      })
    }, index)
  });
}
function ObjectSettings({
  settingsTreeProps,
  initialSettings,
  keyPrefix = ''
}) {
  return /*#__PURE__*/(0,jsx_runtime.jsx)(list/* default */.Ay, {
    itemLayout: "vertical",
    split: false,
    dataSource: initialSettings,
    renderItem: item => /*#__PURE__*/(0,jsx_runtime.jsxs)(SettingsListItem, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(ModDetailsSettings_SettingsListItemMeta, {
        title: item.name || item.key,
        description: item.description
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(SingleSetting, {
        settingsTreeProps: settingsTreeProps,
        initialSettingsValue: item.value,
        initialSettingItemExtra: item,
        settingKey: keyPrefix + item.key
      })]
    }, item.key)
  });
}
function YamlEditor({
  yamlText,
  onYamlTextChange
}) {
  const [editorCalcHeight, setEditorCalcHeight] = (0,react.useState)('0');
  return /*#__PURE__*/(0,jsx_runtime.jsx)(config_provider/* default */.Ay, {
    direction: "ltr",
    children: /*#__PURE__*/(0,jsx_runtime.jsx)(YamlEditorWrapper, {
      children: /*#__PURE__*/(0,jsx_runtime.jsx)(react_dist/* default */.Ay, {
        height: editorCalcHeight,
        defaultLanguage: "yaml",
        value: yamlText,
        onChange: value => {
          onYamlTextChange(value || '');
        },
        onMount: (editor, monacoInstance) => {
          var _editor$getDomNode;
          // Calculate height based on position
          const rect = (_editor$getDomNode = editor.getDomNode()) == null ? void 0 : _editor$getDomNode.getBoundingClientRect();
          if (!rect) {
            return;
          }
          const topOffset = rect.top;
          const bottomOffset = 24; // Bottom padding
          const totalOffset = topOffset + bottomOffset;
          setEditorCalcHeight(`calc(100vh - ${totalOffset}px)`);

          // Fix clipboard operations in Electron/webview context Add copy
          // action (Ctrl+C)
          editor.addAction({
            id: 'editor.action.clipboardCopyActionWithExecCommand',
            label: 'Copy',
            keybindings: [monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyC],
            contextMenuGroupId: '9_cutcopypaste',
            contextMenuOrder: 1,
            run: ed => {
              const selection = ed.getSelection();
              const model = ed.getModel();
              if (!selection || !model) return;
              if (selection.isEmpty()) {
                // No selection - copy the entire current line including newline
                const lineNumber = selection.startLineNumber;

                // Select the line including the newline character
                const lineRange = new monacoInstance.Range(lineNumber, 1, lineNumber + 1, 1);
                ed.setSelection(lineRange);
                document.execCommand('copy');
                // Restore cursor position
                ed.setSelection(selection);
              } else {
                // Has selection - copy selected text
                document.execCommand('copy');
              }
            }
          });

          // Add cut action (Ctrl+X)
          editor.addAction({
            id: 'editor.action.clipboardCutActionWithExecCommand',
            label: 'Cut',
            keybindings: [monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyX],
            contextMenuGroupId: '9_cutcopypaste',
            contextMenuOrder: 0,
            run: ed => {
              const selection = ed.getSelection();
              const model = ed.getModel();
              if (!selection || !model) return;
              if (selection.isEmpty()) {
                // No selection - cut the entire current line including newline
                const lineNumber = selection.startLineNumber;

                // Select the entire line including newline
                const lineRange = new monacoInstance.Range(lineNumber, 1, lineNumber + 1, 1);
                ed.setSelection(lineRange);
                document.execCommand('copy');

                // Delete the entire line including newline
                ed.executeEdits('cut', [{
                  range: lineRange,
                  text: '',
                  forceMoveMarkers: true
                }]);
              } else {
                // Has selection - cut selected text
                document.execCommand('copy');
                ed.executeEdits('cut', [{
                  range: selection,
                  text: '',
                  forceMoveMarkers: true
                }]);
              }
            }
          });

          // Add paste action (Ctrl+V)
          editor.addAction({
            id: 'editor.action.clipboardPasteActionWithExecCommand',
            label: 'Paste',
            keybindings: [monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyV],
            contextMenuGroupId: '9_cutcopypaste',
            contextMenuOrder: 2,
            run: async ed => {
              try {
                // Try modern clipboard API first
                if (navigator.clipboard && navigator.clipboard.readText) {
                  const text = await navigator.clipboard.readText();
                  if (text) {
                    const selection = ed.getSelection();
                    if (selection) {
                      ed.executeEdits('paste', [{
                        range: selection,
                        text: text,
                        forceMoveMarkers: true
                      }]);
                    }
                  }
                } else {
                  // Fallback to execCommand
                  document.execCommand('paste');
                }
              } catch (err) {
                console.error('Paste failed:', err);
              }
            }
          });

          // Add paste action for Shift+Insert
          editor.addAction({
            id: 'editor.action.clipboardPasteActionWithShiftInsert',
            label: 'Paste',
            keybindings: [monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.Insert],
            run: async ed => {
              try {
                if (navigator.clipboard && navigator.clipboard.readText) {
                  const text = await navigator.clipboard.readText();
                  if (text) {
                    const selection = ed.getSelection();
                    if (selection) {
                      ed.executeEdits('paste', [{
                        range: selection,
                        text: text,
                        forceMoveMarkers: true
                      }]);
                    }
                  }
                } else {
                  document.execCommand('paste');
                }
              } catch (err) {
                console.error('Paste failed:', err);
              }
            }
          });

          // Hide the default clipboard actions that don't work in Electron.
          // We need to remove them from the context menu.
          // https://github.com/microsoft/monaco-editor/issues/1280#issuecomment-2099873176
          const removableIds = ['editor.action.clipboardCopyAction', 'editor.action.clipboardCutAction', 'editor.action.clipboardPasteAction'];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const contextmenu = editor.getContribution('editor.contrib.contextmenu');
          if (contextmenu && contextmenu._getMenuActions) {
            const realMethod = contextmenu._getMenuActions;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            contextmenu._getMenuActions = function () {
              // eslint-disable-next-line prefer-rest-params
              const items = realMethod.apply(contextmenu, arguments);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              return items.filter(function (item) {
                return !removableIds.includes(item.id);
              });
            };
          }
        },
        options: {
          detectIndentation: false,
          tabSize: 2,
          insertSpaces: true,
          minimap: {
            enabled: false
          }
        },
        theme: "vs-dark"
      })
    })
  });
}
function ModDetailsSettings({
  modId,
  initialSettings,
  onCanNavigateAwayChange
}) {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const [modSettingsUI, setModSettingsUI] = (0,react.useState)(mockModSettings);
  const [settingsChanged, setSettingsChanged] = (0,react.useState)(false);
  const [isYamlMode, setIsYamlMode] = (0,react.useState)(() => {
    const stored = localStorage.getItem('settingsYamlMode');
    return stored === 'true';
  });
  const [yamlText, setYamlText] = (0,react.useState)('');
  const [yamlWasEdited, setYamlWasEdited] = (0,react.useState)(false);

  // Track if a confirmation modal is already open
  const isModalOpenRef = (0,react.useRef)(false);

  // Helper function to show confirmation modal for unsaved changes
  const showUnsavedChangesConfirmation = (0,react.useCallback)(() => {
    // Prevent multiple modals from opening
    if (isModalOpenRef.current) {
      return Promise.resolve(false);
    }
    isModalOpenRef.current = true;
    return new Promise(resolve => {
      modal/* default */.A.confirm({
        title: t('modDetails.settings.unsavedChangesTitle'),
        content: t('modDetails.settings.unsavedChangesMessage'),
        okText: t('modDetails.settings.unsavedChangesLeave'),
        cancelText: t('modDetails.settings.unsavedChangesStay'),
        onOk: () => {
          isModalOpenRef.current = false;
          resolve(true);
        },
        onCancel: () => {
          isModalOpenRef.current = false;
          resolve(false);
        },
        closable: true,
        maskClosable: true
      });
    });
  }, [t]);

  // Block navigation when there are unsaved changes
  const blocker = (0,chunk_LFPYN7LY/* useBlocker */.KP)(({
    currentLocation,
    nextLocation
  }) => {
    return settingsChanged && currentLocation.pathname !== nextLocation.pathname;
  });

  // Show confirmation modal when navigation is blocked
  (0,react.useEffect)(() => {
    if (blocker.state === 'blocked') {
      showUnsavedChangesConfirmation().then(canLeave => {
        if (canLeave) {
          blocker.proceed();
        } else {
          blocker.reset();
        }
      });
    }
  }, [blocker, showUnsavedChangesConfirmation]);

  // Provide a callback for parent component to check if navigation is allowed
  (0,react.useEffect)(() => {
    const canNavigateAway = () => {
      if (!settingsChanged) {
        return Promise.resolve(true);
      }
      return showUnsavedChangesConfirmation();
    };
    onCanNavigateAwayChange == null || onCanNavigateAwayChange(canNavigateAway);
  }, [settingsChanged, showUnsavedChangesConfirmation, onCanNavigateAwayChange]);
  const {
    getModSettings
  } = useGetModSettings((0,react.useCallback)(data => {
    if (data.modId === modId) {
      setModSettingsUI(data.settings);
    }
  }, [modId]));
  const {
    setModSettings
  } = useSetModSettings((0,react.useCallback)(data => {
    if (data.modId === modId && data.succeeded) {
      setSettingsChanged(false);
    }
  }, [modId]));

  // Initialize YAML validator with schema
  const yamlValidator = (0,react.useMemo)(() => new YamlSchemaValidator(initialSettings), [initialSettings]);

  // YAML conversion handlers
  const settingsToYaml = (0,react.useCallback)(settings => YamlConverter.toYaml(settings, initialSettings), [initialSettings]);
  const yamlToSettings = (0,react.useCallback)(yamlString => YamlConverter.fromYaml(yamlString, yamlValidator, t), [yamlValidator, t]);

  // Sync YAML text only when switching to YAML mode or on initial load if
  // already in YAML mode. Don't sync when settings change to preserve user's
  // YAML formatting.
  const prevIsYamlMode = (0,react.useRef)(null);
  (0,react.useEffect)(() => {
    if (!modSettingsUI) {
      return;
    }
    if (isYamlMode && !prevIsYamlMode.current && modSettingsUI) {
      setYamlText(settingsToYaml(modSettingsUI));
    }
    prevIsYamlMode.current = isYamlMode;
  }, [isYamlMode, modSettingsUI, settingsToYaml]);

  // Handle mode toggle
  const handleModeToggle = (0,react.useCallback)(() => {
    if (isYamlMode) {
      // Switching from YAML to UI mode
      if (yamlWasEdited) {
        // YAML was edited - validate and parse it
        const {
          settings,
          error
        } = yamlToSettings(yamlText);
        if (error || !settings) {
          message/* default */.Ay.error(formatYamlError(error || 'Unknown error'));
          return;
        }
        setModSettingsUI(settings);
      }
      // If YAML was never edited, keep existing modSettingsUI
      setArrayItemMaxIndex({});
      setIsYamlMode(false);
      setYamlText('');
      setYamlWasEdited(false);
      localStorage.setItem('settingsYamlMode', 'false');
    } else {
      // Switching from UI to YAML mode
      setIsYamlMode(true);
      setYamlWasEdited(false);
      localStorage.setItem('settingsYamlMode', 'true');
    }
  }, [isYamlMode, yamlWasEdited, yamlToSettings, yamlText]);
  const handleSave = (0,react.useCallback)(() => {
    if (!settingsChanged) {
      return;
    }
    let settingsToSave = modSettingsUI;

    // If in YAML mode, validate and parse before saving
    if (isYamlMode) {
      const {
        settings,
        error
      } = yamlToSettings(yamlText);
      if (error || !settings) {
        message/* default */.Ay.error(formatYamlError(error || 'Unknown error'));
        return;
      }
      settingsToSave = settings;
    }
    if (settingsToSave) {
      setModSettings({
        modId,
        settings: settingsToSave
      });
    }
  }, [settingsChanged, modSettingsUI, isYamlMode, yamlText, yamlToSettings, modId, setModSettings]);
  (0,react.useEffect)(() => {
    getModSettings({
      modId
    });
  }, [getModSettings, modId]);
  (0,dist/* useEventListener */.ML)('keydown', (0,react.useCallback)(e => {
    if (e.key === 's' && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    }
  }, [handleSave]));
  const [arrayItemMaxIndex, setArrayItemMaxIndex] = (0,react.useState)({});
  const onRemoveArrayItem = (0,react.useCallback)((key, index) => {
    const indexFromKey = targetKey => {
      if (targetKey.startsWith(key + '[')) {
        const match = targetKey.slice((key + '[').length).match(/^(\d+)\]/);
        if (match) {
          return parseIntLax(match[1]);
        }
      }
      return null;
    };
    const decreaseKeyIndex = targetKey => {
      if (targetKey.startsWith(key + '[')) {
        const match = targetKey.slice((key + '[').length).match(/^(\d+)(\].*$)/);
        if (match) {
          const targetKeyIndex = parseIntLax(match[1]);
          if (targetKeyIndex > index) {
            return key + '[' + (targetKeyIndex - 1).toString() + match[2];
          }
        }
      }
      return targetKey;
    };
    setModSettingsUI(Object.fromEntries(Object.entries(modSettingsUI != null ? modSettingsUI : {}).filter(([iterKey, iterValue]) => {
      return indexFromKey(iterKey) !== index;
    }).map(([iterKey, iterValue]) => {
      return [decreaseKeyIndex(iterKey), iterValue];
    })));
    setArrayItemMaxIndex(Object.fromEntries(Object.entries(arrayItemMaxIndex).filter(([iterKey, iterValue]) => {
      return indexFromKey(iterKey) !== index;
    }).map(([iterKey, iterValue]) => {
      return iterKey === key ? [iterKey, Math.max(iterValue - 1, 0)] : [decreaseKeyIndex(iterKey), iterValue];
    })));
    setSettingsChanged(true);
  }, [modSettingsUI, arrayItemMaxIndex]);
  if (modSettingsUI === null) {
    return null;
  }
  return /*#__PURE__*/(0,jsx_runtime.jsxs)("form", {
    onSubmit: e => {
      e.preventDefault();
      handleSave();
    },
    children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SaveSettingsCard, {
      bordered: false,
      size: "small",
      children: /*#__PURE__*/(0,jsx_runtime.jsxs)(ActionButtonsWrapper, {
        children: [/*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
          type: "primary",
          htmlType: "submit",
          title: "Ctrl+S",
          disabled: !settingsChanged,
          children: t('modDetails.settings.saveButton')
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
          onClick: handleModeToggle,
          children: isYamlMode ? t('modDetails.settings.uiMode') : t('modDetails.settings.yamlMode')
        })]
      })
    }), isYamlMode ? /*#__PURE__*/(0,jsx_runtime.jsx)(YamlEditor, {
      yamlText: yamlText,
      onYamlTextChange: value => {
        setYamlText(value);
        setSettingsChanged(true);
        setYamlWasEdited(true);
      }
    }) : /*#__PURE__*/(0,jsx_runtime.jsx)(SettingsWrapper, {
      children: /*#__PURE__*/(0,jsx_runtime.jsx)(ObjectSettings, {
        settingsTreeProps: {
          modSettings: modSettingsUI,
          onSettingChanged: (key, newValue) => {
            setModSettingsUI(Object.assign({}, modSettingsUI, {
              [key]: newValue
            }));
            setSettingsChanged(true);
          },
          arrayItemMaxIndex: arrayItemMaxIndex,
          onRemoveArrayItem,
          onNewArrayItem: (key, index) => {
            setArrayItemMaxIndex(Object.assign({}, arrayItemMaxIndex, {
              [key]: index
            }));
            setSettingsChanged(true);
          }
        },
        initialSettings: initialSettings
      })
    })]
  });
}
/* harmony default export */ const panel_ModDetailsSettings = (ModDetailsSettings);

// Types exported for testing only

// Exported for testing only
const exportedForTesting = {
  // Types
  SettingType,
  // Helper functions
  isPlainObject,
  naturalSort,
  // Classes
  YamlSchemaValidator,
  YamlConverter
};
// EXTERNAL MODULE: ../../node_modules/prismjs/prism.js
var prism = __webpack_require__(69100);
var prism_default = /*#__PURE__*/__webpack_require__.n(prism);
// EXTERNAL MODULE: ../../node_modules/prismjs/components/prism-c.js
var prism_c = __webpack_require__(859);
// EXTERNAL MODULE: ../../node_modules/prismjs/components/prism-cpp.js
var prism_cpp = __webpack_require__(54811);
;// ./src/app/panel/ModDetailsSource.tsx










const SyntaxHighlighterWrapper = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsSource__SyntaxHighlighterWrapper",
  componentId: "sc-1o83es7-0"
})(["direction:ltr;pre{font-size:13px;line-height:1.5;background-color:#1e1e1e;padding:12px;border-radius:2px;overflow:auto;}code{color:#d4d4d4;background-color:transparent;tab-size:4;}"]);
const ConfigurationWrapper = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsSource__ConfigurationWrapper",
  componentId: "sc-1o83es7-1"
})(["margin-bottom:20px;> span{vertical-align:middle;}> button{margin-inline-start:10px;}"]);
function collapseSource(source) {
  return source.replace(/^(\/\/[ \t]+==WindhawkModReadme==[ \t]*$\s*\/\*)(\s*[\s\S]+?\s*)(\*\/\s*^\/\/[ \t]+==\/WindhawkModReadme==[ \t]*)$/m, (match, p1, p2, p3) => {
    if (p2.includes('*/')) {
      return p1 + p2 + p3;
    }
    return p1 + '...' + p3;
  }).replace(/^(\/\/[ \t]+==WindhawkModSettings==[ \t]*$\s*\/\*)(\s*[\s\S]+?\s*)(\*\/\s*^\/\/[ \t]+==\/WindhawkModSettings==[ \t]*)$/m, (match, p1, p2, p3) => {
    if (p2.includes('*/')) {
      return p1 + p2 + p3;
    }
    return p1 + '...' + p3;
  });
}

// https://stackoverflow.com/a/30810322
function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;

  // Avoid scrolling to bottom.
  textArea.style.top = '0';
  textArea.style.insetInlineStart = '0';
  textArea.style.position = 'fixed';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    const successful = document.execCommand('copy');
    const msg = successful ? 'successful' : 'unsuccessful';
    console.log('Copying text command was ' + msg);
  } catch (err) {
    console.error('Oops, unable to copy', err);
  }
  document.body.removeChild(textArea);
}
function ModDetailsSource({
  source
}) {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const [isCollapsed, setIsCollapsed] = (0,react.useState)(true);
  const collapsedSource = (0,react.useMemo)(() => collapseSource(source), [source]);
  const currentSource = isCollapsed ? collapsedSource : source;
  const highlightedHtml = (0,react.useMemo)(() => {
    return prism_default().highlight(currentSource, (prism_default()).languages['cpp'], 'cpp');
  }, [currentSource]);
  return /*#__PURE__*/(0,jsx_runtime.jsxs)(config_provider/* default */.Ay, {
    direction: "ltr",
    children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(ConfigurationWrapper, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)("span", {
        children: t('modDetails.code.collapseExtra')
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_switch/* default */.A, {
        checked: isCollapsed,
        onChange: checked => setIsCollapsed(checked)
      })]
    }), /*#__PURE__*/(0,jsx_runtime.jsx)(DropdownModal, {
      menu: {
        items: [{
          label: t('general.copy'),
          key: 'copy',
          onClick: () => {
            dropdownModalDismissed();
            // navigator.clipboard.writeText is forbidden in VSCode webviews.
            const selection = window.getSelection();
            if (selection && selection.type === 'Range') {
              document.execCommand('copy');
            } else {
              fallbackCopyTextToClipboard(source);
            }
          }
        }]
      },
      trigger: ['contextMenu'],
      children: /*#__PURE__*/(0,jsx_runtime.jsx)(SyntaxHighlighterWrapper, {
        children: /*#__PURE__*/(0,jsx_runtime.jsx)("pre", {
          children: /*#__PURE__*/(0,jsx_runtime.jsx)("code", {
            dangerouslySetInnerHTML: {
              __html: highlightedHtml
            }
          })
        })
      })
    })]
  });
}
/* harmony default export */ const panel_ModDetailsSource = (ModDetailsSource);
// EXTERNAL MODULE: ../../node_modules/react-diff-view/es/index.js
var react_diff_view_es = __webpack_require__(45063);
// EXTERNAL MODULE: ../../node_modules/unidiff/index.js
var unidiff = __webpack_require__(42718);
;// ./src/app/panel/ModDetailsSourceDiff.tsx

const ModDetailsSourceDiff_excluded = ["start", "end", "direction", "onExpand"];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck: ignore TS errors due to lack of types for react-diff-view and refractor













const ModDetailsSourceDiff_ConfigurationWrapper = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsSourceDiff__ConfigurationWrapper",
  componentId: "sc-mcl7q4-0"
})(["margin-bottom:20px;> span{vertical-align:middle;}> button{margin-inline-start:10px;}"]);
const DiffWrapper = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetailsSourceDiff__DiffWrapper",
  componentId: "sc-mcl7q4-1"
})(["direction:ltr;"]);
const UnfoldButton = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(es_button/* default */.A).withConfig({
  displayName: "ModDetailsSourceDiff__UnfoldButton",
  componentId: "sc-mcl7q4-2"
})(["width:100%;border-radius:0;"]);

// https://github.com/otakustay/react-diff-view/blob/f9e5f9f248f331598e5c9e7839fccb211efe43c2/site/components/DiffView/Unfold.js

const ICON_TYPE_MAPPING = {
  up: free_solid_svg_icons/* faLongArrowAltUp */.Dg7,
  down: free_solid_svg_icons/* faLongArrowAltDown */.ejj,
  none: free_solid_svg_icons/* faArrowsAltV */.zhB
};
const Unfold = _ref => {
  let {
      start,
      end,
      direction,
      onExpand
    } = _ref,
    props = (0,objectWithoutPropertiesLoose/* default */.A)(_ref, ModDetailsSourceDiff_excluded);
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const expand = (0,react.useCallback)(() => onExpand(start, end), [onExpand, start, end]);
  const iconType = ICON_TYPE_MAPPING[direction];
  const lines = end - start;
  return /*#__PURE__*/(0,jsx_runtime.jsx)(react_diff_view_es/* Decoration */.NZ, Object.assign({}, props, {
    children: /*#__PURE__*/(0,jsx_runtime.jsxs)(UnfoldButton, {
      onClick: expand,
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(react_fontawesome_dist/* FontAwesomeIcon */.gc, {
        icon: iconType
      }), "\xA0", t('modDetails.changes.expandLines', {
        count: lines
      })]
    })
  }));
};

// https://github.com/otakustay/react-diff-view/blob/f9e5f9f248f331598e5c9e7839fccb211efe43c2/site/components/DiffView/UnfoldCollapsed.js

const UnfoldCollapsed = ({
  previousHunk,
  currentHunk,
  linesCount,
  onExpand
}) => {
  if (!currentHunk) {
    const nextStart = previousHunk.oldStart + previousHunk.oldLines;
    const _collapsedLines = linesCount - nextStart + 1;
    if (_collapsedLines <= 0) {
      return null;
    }
    return /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
      children: [_collapsedLines > 10 && /*#__PURE__*/(0,jsx_runtime.jsx)(Unfold, {
        direction: "down",
        start: nextStart,
        end: nextStart + 10,
        onExpand: onExpand
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(Unfold, {
        direction: "none",
        start: nextStart,
        end: linesCount + 1,
        onExpand: onExpand
      })]
    });
  }
  const collapsedLines = (0,react_diff_view_es/* getCollapsedLinesCountBetween */.af)(previousHunk, currentHunk);
  if (!previousHunk) {
    if (!collapsedLines) {
      return null;
    }
    const start = Math.max(currentHunk.oldStart - 10, 1);
    return /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Unfold, {
        direction: "none",
        start: 1,
        end: currentHunk.oldStart,
        onExpand: onExpand
      }), collapsedLines > 10 && /*#__PURE__*/(0,jsx_runtime.jsx)(Unfold, {
        direction: "up",
        start: start,
        end: currentHunk.oldStart,
        onExpand: onExpand
      })]
    });
  }
  const collapsedStart = previousHunk.oldStart + previousHunk.oldLines;
  const collapsedEnd = currentHunk.oldStart;
  if (collapsedLines < 10) {
    return /*#__PURE__*/(0,jsx_runtime.jsx)(Unfold, {
      direction: "none",
      start: collapsedStart,
      end: collapsedEnd,
      onExpand: onExpand
    });
  }
  return /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Unfold, {
      direction: "down",
      start: collapsedStart,
      end: collapsedStart + 10,
      onExpand: onExpand
    }), /*#__PURE__*/(0,jsx_runtime.jsx)(Unfold, {
      direction: "none",
      start: collapsedStart,
      end: collapsedEnd,
      onExpand: onExpand
    }), /*#__PURE__*/(0,jsx_runtime.jsx)(Unfold, {
      direction: "up",
      start: collapsedEnd - 10,
      end: collapsedEnd,
      onExpand: onExpand
    })]
  });
};

// HAST (Hypertext Abstract Syntax Tree) node types
// HAST format: https://github.com/syntax-tree/hast

// Convert Prism tokens to HAST (Hypertext Abstract Syntax Tree) format
const prismTokensToHast = tokens => {
  const result = [];
  for (const token of tokens) {
    if (typeof token === 'string') {
      result.push({
        type: 'text',
        value: token
      });
    } else if (token instanceof (prism_default()).Token) {
      const className = Array.isArray(token.type) ? token.type.map(t => `token ${t}`) : [`token`, token.type].filter(Boolean);

      // Handle nested tokens (token.content can be string or Token array)
      let children;
      if (typeof token.content === 'string') {
        children = [{
          type: 'text',
          value: token.content
        }];
      } else if (Array.isArray(token.content)) {
        children = prismTokensToHast(token.content);
      } else {
        children = [{
          type: 'text',
          value: String(token.content)
        }];
      }
      result.push({
        type: 'element',
        tagName: 'span',
        properties: {
          className
        },
        children
      });
    }
  }
  return result;
};

// https://codesandbox.io/s/react-diff-view-mark-edits-demo-8ndcl

const diffTokenize = (hunks, oldSource) => {
  if (!hunks) {
    return undefined;
  }

  // Create a refractor-compatible adapter for Prism
  const prismAdapter = {
    highlight: (code, language) => {
      const grammar = (prism_default()).languages[language];
      if (!grammar) {
        return [{
          type: 'text',
          value: code
        }];
      }
      const tokens = prism_default().tokenize(code, grammar);
      return prismTokensToHast(tokens);
    }
  };
  const options = {
    highlight: true,
    language: 'cpp',
    refractor: prismAdapter,
    oldSource,
    enhancers: [(0,react_diff_view_es/* markEdits */.Zc)(hunks, {
      type: 'block'
    })]
  };
  try {
    return (0,react_diff_view_es/* tokenize */.qw)(hunks, options);
  } catch (_unused) {
    return undefined;
  }
};
function ModDetailsSourceDiff_ModDetailsSource(props) {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const {
    oldSource,
    newSource
  } = props;
  const [splitView, setSplitView] = (0,react.useState)(true);
  const {
    type,
    hunks
  } = (0,react.useMemo)(() => {
    const diffText = (0,unidiff.formatLines)((0,unidiff.diffLines)(oldSource, newSource), {
      context: 3
    });
    const [{
      type,
      hunks
    }] = (0,react_diff_view_es/* parseDiff */.FR)(diffText, {
      nearbySequences: 'zip'
    });
    return {
      type,
      hunks
    };
  }, [newSource, oldSource]);

  // https://github.com/otakustay/react-diff-view/blob/b9213164497211ef45393e5a57ed5866a5f27b2e/site/components/DiffView/index.js

  const [hunksWithSourceExpanded, expandRange] = (0,react_diff_view_es/* useSourceExpansion */.iN)(hunks, oldSource);
  const hunksWithMinLinesCollapsed = (0,react_diff_view_es/* useMinCollapsedLines */.KE)(0, hunksWithSourceExpanded, oldSource);
  const linesCount = oldSource ? oldSource.split('\n').length : 0;
  const tokens = diffTokenize(hunksWithMinLinesCollapsed, oldSource);
  const renderHunk = (children, hunk, i, hunks) => {
    const previousElement = children[children.length - 1];
    const decorationElement = oldSource ? /*#__PURE__*/(0,jsx_runtime.jsx)(UnfoldCollapsed, {
      previousHunk: previousElement && previousElement.props.hunk,
      currentHunk: hunk,
      linesCount: linesCount,
      onExpand: expandRange
    }, 'decoration-' + hunk.content) : /*#__PURE__*/(0,jsx_runtime.jsxs)(react_diff_view_es/* Decoration */.NZ, {
      hunk: hunk,
      children: [null, hunk.content]
    }, 'decoration-' + hunk.content);
    children.push(decorationElement);
    const hunkElement = /*#__PURE__*/(0,jsx_runtime.jsx)(react_diff_view_es/* Hunk */.D9, {
      hunk: hunk
    }, 'hunk-' + hunk.content);
    children.push(hunkElement);
    if (i === hunks.length - 1 && oldSource) {
      const unfoldTailElement = /*#__PURE__*/(0,jsx_runtime.jsx)(UnfoldCollapsed, {
        previousHunk: hunk,
        linesCount: linesCount,
        onExpand: expandRange
      }, "decoration-tail");
      children.push(unfoldTailElement);
    }
    return children;
  };
  return /*#__PURE__*/(0,jsx_runtime.jsxs)(config_provider/* default */.Ay, {
    direction: "ltr",
    children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(ModDetailsSourceDiff_ConfigurationWrapper, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)("span", {
        children: t('modDetails.changes.splitView')
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_switch/* default */.A, {
        checked: splitView,
        onChange: checked => setSplitView(checked)
      })]
    }), /*#__PURE__*/(0,jsx_runtime.jsx)(DiffWrapper, {
      children: /*#__PURE__*/(0,jsx_runtime.jsx)(react_diff_view_es/* Diff */.oO, {
        optimizeSelection: true,
        viewType: splitView ? 'split' : 'unified',
        diffType: type,
        hunks: hunksWithMinLinesCollapsed,
        oldSource: oldSource,
        tokens: tokens,
        children: hunks => hunks.reduce(renderHunk, [])
      })
    })]
  });
}
/* harmony default export */ const ModDetailsSourceDiff = (ModDetailsSourceDiff_ModDetailsSource);
// EXTERNAL MODULE: ../../node_modules/antd/es/menu/index.js + 6 modules
var menu = __webpack_require__(5012);
;// ./src/app/panel/VersionSelectorModal.tsx







const VersionSelectorModal_ModalContent = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "VersionSelectorModal__ModalContent",
  componentId: "sc-1g1dgmu-0"
})(["display:flex;flex-direction:column;gap:16px;"]);
const MenuWrapper = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "VersionSelectorModal__MenuWrapper",
  componentId: "sc-1g1dgmu-1"
})(["max-height:400px;overflow-y:auto;border:1px solid #303030;.ant-menu{border:none;border-radius:2px;.ant-menu-item{margin:0;}}"]);
const VersionItemContainer = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "VersionSelectorModal__VersionItemContainer",
  componentId: "sc-1g1dgmu-2"
})(["display:flex;justify-content:space-between;align-items:center;width:100%;"]);
const VersionText = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.span.withConfig({
  displayName: "VersionSelectorModal__VersionText",
  componentId: "sc-1g1dgmu-3"
})(["flex:1;"]);
const VersionDate = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.span.withConfig({
  displayName: "VersionSelectorModal__VersionDate",
  componentId: "sc-1g1dgmu-4"
})(["color:var(--vscode-descriptionForeground,#9d9d9d);font-size:12px;margin-inline-start:8px;"]);
const PreReleaseBadge = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(es_badge/* default */.A).withConfig({
  displayName: "VersionSelectorModal__PreReleaseBadge",
  componentId: "sc-1g1dgmu-5"
})([".ant-badge-count{background-color:#faad14;color:#000;font-size:11px;}"]);
function VersionSelectorModal(props) {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const [selectedVersion, setSelectedVersion] = (0,react.useState)();
  const [versions, setVersions] = (0,react.useState)(null);
  const [loadedModId, setLoadedModId] = (0,react.useState)(null);

  // IPC hook for fetching versions
  const {
    getModVersions,
    getModVersionsPending
  } = useGetModVersions((0,react.useCallback)(data => {
    if (data.modId === props.modId) {
      setVersions(data.versions);
      setLoadedModId(data.modId);
    }
  }, [props.modId]));

  // Fetch versions when modal opens (only if not already loaded for this modId)
  (0,react.useEffect)(() => {
    if (props.open && loadedModId !== props.modId) {
      if (mockModVersions) {
        setVersions(mockModVersions);
        setLoadedModId(props.modId);
      } else {
        getModVersions({
          modId: props.modId
        });
      }
    }
  }, [props.open, props.modId, loadedModId, getModVersions]);

  // Pre-select the version when modal opens
  (0,react.useEffect)(() => {
    if (props.open && props.selectedVersion) {
      setSelectedVersion(props.selectedVersion);
    }
  }, [props.open, props.selectedVersion]);
  const sortedVersions = (0,react.useMemo)(() => {
    if (!versions) {
      return [];
    }
    // Sort by timestamp, newest first
    return [...versions].sort((a, b) => b.timestamp - a.timestamp);
  }, [versions]);
  const formatDate = timestamp => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const handleMenuClick = version => {
    setSelectedVersion(version);
  };
  const handleSelect = () => {
    if (selectedVersion) {
      var _versions$reduce;
      const versionTimestamps = (_versions$reduce = versions == null ? void 0 : versions.reduce((acc, v) => {
        acc[v.version] = v.timestamp;
        return acc;
      }, {})) != null ? _versions$reduce : {};
      props.onSelect(selectedVersion, versionTimestamps);
      setSelectedVersion(undefined);
    }
  };
  const handleCancel = () => {
    setSelectedVersion(undefined);
    props.onCancel();
  };
  const menuItems = (0,react.useMemo)(() => {
    return sortedVersions.map(version => ({
      key: version.version,
      label: /*#__PURE__*/(0,jsx_runtime.jsxs)(VersionItemContainer, {
        children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(VersionText, {
          children: [version.version, version.isPreRelease && /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
            children: [' ', /*#__PURE__*/(0,jsx_runtime.jsx)(PreReleaseBadge, {
              count: t('modDetails.version.preRelease')
            })]
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(VersionDate, {
          children: formatDate(version.timestamp)
        })]
      })
    }));
  }, [sortedVersions, t]);
  return /*#__PURE__*/(0,jsx_runtime.jsx)(modal/* default */.A, {
    open: props.open,
    onOk: handleSelect,
    onCancel: handleCancel,
    okText: t('modDetails.version.select'),
    cancelText: t('modDetails.version.cancel'),
    okButtonProps: {
      disabled: !selectedVersion
    },
    centered: true,
    width: 360,
    closable: false,
    children: /*#__PURE__*/(0,jsx_runtime.jsx)(VersionSelectorModal_ModalContent, {
      children: getModVersionsPending ? /*#__PURE__*/(0,jsx_runtime.jsx)(spin/* default */.A, {}) : /*#__PURE__*/(0,jsx_runtime.jsx)(MenuWrapper, {
        children: /*#__PURE__*/(0,jsx_runtime.jsx)(menu/* default */.A, {
          items: menuItems,
          selectedKeys: selectedVersion ? [selectedVersion] : [],
          onClick: ({
            key
          }) => handleMenuClick(key)
        })
      })
    })
  });
}
;// ./src/app/panel/ModDetails.tsx















const ModDetailsContainer = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetails__ModDetailsContainer",
  componentId: "sc-6bmi86-0"
})(["flex:1;padding-top:20px;"]);
const ModDetailsCard = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(card/* default */.A).withConfig({
  displayName: "ModDetails__ModDetailsCard",
  componentId: "sc-6bmi86-1"
})(["min-height:100%;border-bottom:none;border-bottom-left-radius:0;border-bottom-right-radius:0;"]);
const ModVersionRadioGroup = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(es_radio/* default.Group */.Ay.Group).withConfig({
  displayName: "ModDetails__ModVersionRadioGroup",
  componentId: "sc-6bmi86-2"
})(["font-weight:normal;margin-bottom:8px;"]);
const ProgressSpin = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(spin/* default */.A).withConfig({
  displayName: "ModDetails__ProgressSpin",
  componentId: "sc-6bmi86-3"
})(["display:block;margin-inline-start:auto;margin-inline-end:auto;font-size:32px;"]);
const NoDataMessage = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModDetails__NoDataMessage",
  componentId: "sc-6bmi86-4"
})(["color:rgba(255,255,255,0.45);font-style:italic;"]);
function ModVersionSelector(props) {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const {
    currentView,
    selectedCustomVersion,
    installed,
    repository,
    onViewChange,
    onOpenVersionModal
  } = props;
  if (!installed && !selectedCustomVersion) {
    return null;
  }
  if (!repository) {
    return null;
  }
  return /*#__PURE__*/(0,jsx_runtime.jsxs)(ModVersionRadioGroup, {
    size: "small",
    value: currentView,
    onChange: e => {
      // Don't allow switching to 'custom' value, it will be set after
      // selecting a version in the modal.
      if (e.target.value !== 'custom') {
        onViewChange(e.target.value);
      }
    },
    children: [installed && /*#__PURE__*/(0,jsx_runtime.jsxs)(es_radio/* default.Button */.Ay.Button, {
      value: "installed",
      children: [t('modDetails.header.installedVersion'), installed.version && `: ${installed.version}`]
    }), /*#__PURE__*/(0,jsx_runtime.jsxs)(es_radio/* default.Button */.Ay.Button, {
      value: "repository",
      disabled: repository.status === 'failed',
      children: [t('modDetails.header.latestVersion'), repository.status === 'loading' ? ': ' + t('modDetails.header.loading') : repository.status === 'failed' ? ': ' + t('modDetails.header.loadingFailed') : repository.status === 'loaded' && repository.version ? `: ${repository.version}` : '']
    }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_radio/* default.Button */.Ay.Button, {
      value: "custom",
      onClick: onOpenVersionModal,
      children: selectedCustomVersion ? t('modDetails.header.selectedVersion', {
        version: selectedCustomVersion
      }) : t('modDetails.header.otherVersions')
    })]
  });
}
function ModDetailsTabContent(props) {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const {
    modId,
    isLocalMod,
    currentView,
    activeTab,
    modSourceData,
    installedModSourceData,
    selectedModSourceData,
    installedVersionIsLatest,
    canNavigateAwayRef,
    onRetryLoad
  } = props;
  const isLoading = !modSourceData || activeTab === 'changes' && (!installedModSourceData || !selectedModSourceData);
  if (isLoading) {
    const shouldShowLoading = currentView === 'repository' || currentView === 'custom' || activeTab === 'changes';
    if (shouldShowLoading) {
      return /*#__PURE__*/(0,jsx_runtime.jsx)(ProgressSpin, {
        size: "large",
        tip: t('general.loading')
      });
    }
    return null;
  }
  const isLoadingFailed = (currentView === 'repository' || currentView === 'custom' || activeTab === 'changes') && !(selectedModSourceData != null && selectedModSourceData.source);
  if (isLoadingFailed) {
    return /*#__PURE__*/(0,jsx_runtime.jsx)(result/* default */.Ay, {
      status: "error",
      title: t('general.loadingFailedTitle'),
      subTitle: t('general.loadingFailedSubtitle'),
      extra: [/*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
        type: "primary",
        onClick: onRetryLoad,
        children: t('general.tryAgain')
      }, "try-again")]
    });
  }
  if (activeTab === 'details') {
    return modSourceData.readme ? /*#__PURE__*/(0,jsx_runtime.jsx)(panel_ModDetailsReadme, {
      markdown: modSourceData.readme,
      isLocalMod: isLocalMod
    }) : /*#__PURE__*/(0,jsx_runtime.jsx)(NoDataMessage, {
      children: t('modDetails.details.noData')
    });
  }
  if (activeTab === 'settings') {
    return modSourceData.initialSettings ? /*#__PURE__*/(0,jsx_runtime.jsx)(panel_ModDetailsSettings, {
      modId: modId,
      initialSettings: modSourceData.initialSettings,
      onCanNavigateAwayChange: callback => {
        canNavigateAwayRef.current = callback;
      }
    }) : /*#__PURE__*/(0,jsx_runtime.jsx)(NoDataMessage, {
      children: t('modDetails.settings.noData')
    });
  }
  if (activeTab === 'code') {
    return modSourceData.source ? /*#__PURE__*/(0,jsx_runtime.jsx)(panel_ModDetailsSource, {
      source: modSourceData.source
    }) : /*#__PURE__*/(0,jsx_runtime.jsx)(NoDataMessage, {
      children: t('modDetails.code.noData')
    });
  }
  if (activeTab === 'changelog') {
    return /*#__PURE__*/(0,jsx_runtime.jsx)(panel_ModDetailsChangelog, {
      loadingNode: /*#__PURE__*/(0,jsx_runtime.jsx)(ProgressSpin, {
        size: "large",
        tip: t('general.loading')
      }),
      modId: modId
    });
  }
  if (activeTab === 'advanced') {
    return /*#__PURE__*/(0,jsx_runtime.jsx)(panel_ModDetailsAdvanced, {
      modId: modId
    });
  }
  if (activeTab === 'changes') {
    var _installedModSourceDa, _selectedModSourceDat;
    const installedModSource = (_installedModSourceDa = installedModSourceData == null ? void 0 : installedModSourceData.source) != null ? _installedModSourceDa : null;
    const selectedModSource = (_selectedModSourceDat = selectedModSourceData == null ? void 0 : selectedModSourceData.source) != null ? _selectedModSourceDat : null;
    if (installedModSource && selectedModSource) {
      return installedVersionIsLatest ? /*#__PURE__*/(0,jsx_runtime.jsx)(NoDataMessage, {
        children: t('modDetails.changes.noData')
      }) : /*#__PURE__*/(0,jsx_runtime.jsx)(ModDetailsSourceDiff, {
        oldSource: installedModSource,
        newSource: selectedModSource
      });
    }
    return /*#__PURE__*/(0,jsx_runtime.jsx)(NoDataMessage, {
      children: t('modDetails.code.noData')
    });
  }
  return null;
}
function ModDetails(props) {
  var _installedModSourceDa2, _repositoryModSourceD, _selectedModSourceDat2;
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const {
    modId,
    installedModDetails,
    repositoryModDetails,
    loadRepositoryData
  } = props;
  const isLocalMod = modId.startsWith('local@');
  const [installedModSourceData, setInstalledModSourceData] = (0,react.useState)(null);
  const [repositoryModSourceData, setRepositoryModSourceData] = (0,react.useState)(null);
  const [selectedCustomVersion, setSelectedCustomVersion] = (0,react.useState)(null);
  const [versionTimestamps, setVersionTimestamps] = (0,react.useState)({});
  const [customVersionSourceData, setCustomVersionSourceData] = (0,react.useState)(null);
  const [isVersionModalOpen, setIsVersionModalOpen] = (0,react.useState)(false);
  const {
    getModSourceData
  } = useGetModSourceData((0,react.useCallback)(data => {
    if (data.modId === modId) {
      setInstalledModSourceData(data.data);
    }
  }, [modId]));
  (0,react.useEffect)(() => {
    setInstalledModSourceData(mockInstalledModSourceData);
    if (installedModDetails != null && installedModDetails.metadata) {
      getModSourceData({
        modId
      });
    }
  }, [modId, installedModDetails == null ? void 0 : installedModDetails.metadata, getModSourceData]);
  const {
    getRepositoryModSourceData
  } = useGetRepositoryModSourceData((0,react.useCallback)(data => {
    var _data$version;
    if (data.modId === modId && ((_data$version = data.version) != null ? _data$version : null) === selectedCustomVersion) {
      if (data.version) {
        setCustomVersionSourceData(data.data);
      } else {
        setRepositoryModSourceData(data.data);
      }
    }
  }, [modId, selectedCustomVersion]));
  (0,react.useEffect)(() => {
    setRepositoryModSourceData(null);
    if (repositoryModDetails || loadRepositoryData) {
      getRepositoryModSourceData({
        modId
      });
    }
  }, [getRepositoryModSourceData, loadRepositoryData, modId, repositoryModDetails]);
  const [selectedModDetails, setSelectedModDetails] = (0,react.useState)(null);
  (0,react.useEffect)(() => {
    if (!(installedModDetails && (repositoryModDetails || loadRepositoryData))) {
      // Only one type can be selected, reset selection.
      setSelectedModDetails(null);
    }
  }, [installedModDetails, repositoryModDetails, loadRepositoryData]);
  const modDetailsToShow = selectedCustomVersion ? 'custom' : selectedModDetails || (installedModDetails ? 'installed' : 'repository');
  const [activeTab, setActiveTab] = (0,react.useState)('details');

  // Track if settings can navigate away
  const canNavigateAwayRef = (0,react.useRef)(null);
  const handleTabChange = (0,react.useCallback)(async key => {
    // Check if we can navigate away from settings
    if (canNavigateAwayRef.current) {
      const canNavigate = await canNavigateAwayRef.current();
      if (!canNavigate) {
        return;
      }
    }
    setActiveTab(key);
  }, []);
  const handleOpenVersionModal = (0,react.useCallback)(() => {
    setIsVersionModalOpen(true);
  }, []);
  const handleVersionSelect = (0,react.useCallback)((version, timestamps) => {
    setSelectedCustomVersion(version);
    setVersionTimestamps(timestamps);
    setIsVersionModalOpen(false);
    // Fetch the source for the selected version.
    if (mockModVersionSource) {
      setCustomVersionSourceData(mockModVersionSource(version));
    } else {
      setCustomVersionSourceData(null);
      getRepositoryModSourceData({
        modId,
        version
      });
    }
  }, [getRepositoryModSourceData, modId]);
  const handleClearCustomVersion = (0,react.useCallback)(() => {
    setSelectedCustomVersion(null);
    setVersionTimestamps({});
    setCustomVersionSourceData(null);
  }, []);
  const tabList = [{
    key: 'details',
    tab: t('modDetails.details.title')
  }];
  if (modDetailsToShow === 'installed' && installedModDetails != null && installedModDetails.config) {
    tabList.push({
      key: 'settings',
      tab: t('modDetails.settings.title')
    });
  }
  tabList.push({
    key: 'code',
    tab: t('modDetails.code.title')
  });
  if (!isLocalMod) {
    tabList.push({
      key: 'changelog',
      tab: t('modDetails.changelog.title')
    });
  }
  if (modDetailsToShow === 'installed') {
    var _installedModDetails$, _installedModDetails$2;
    const hasLogging = (installedModDetails == null || (_installedModDetails$ = installedModDetails.config) == null ? void 0 : _installedModDetails$.loggingEnabled) || (installedModDetails == null || (_installedModDetails$2 = installedModDetails.config) == null ? void 0 : _installedModDetails$2.debugLoggingEnabled);
    tabList.push({
      key: 'advanced',
      tab: hasLogging ? /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
        children: [t('modDetails.advanced.title'), ' ', /*#__PURE__*/(0,jsx_runtime.jsx)(tooltip/* default */.A, {
          title: t('general.loggingEnabled'),
          placement: "bottom",
          children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_badge/* default */.A, {
            dot: true,
            status: "warning"
          })
        })]
      }) : t('modDetails.advanced.title')
    });
  }
  if (installedModDetails && (repositoryModDetails || loadRepositoryData)) {
    tabList.push({
      key: 'changes',
      tab: t('modDetails.changes.title')
    });
  }
  const availableActiveTab = tabList.find(x => x.key === activeTab) ? activeTab : 'details';

  // Clear the navigation callback when not on settings tab
  (0,react.useEffect)(() => {
    if (availableActiveTab !== 'settings') {
      canNavigateAwayRef.current = null;
    }
  }, [availableActiveTab]);
  let installedModMetadata = {};
  if (installedModSourceData != null && installedModSourceData.metadata) {
    installedModMetadata = installedModSourceData.metadata;
  } else if (installedModDetails) {
    installedModMetadata = installedModDetails.metadata || {};
  }
  let repositoryModMetadata = {};
  if (repositoryModSourceData != null && repositoryModSourceData.metadata) {
    repositoryModMetadata = repositoryModSourceData.metadata;
  } else if (repositoryModDetails != null && repositoryModDetails.metadata) {
    repositoryModMetadata = repositoryModDetails.metadata;
  }
  let modMetadata = {};
  let modSourceData = null;
  if (modDetailsToShow === 'custom') {
    modMetadata = (customVersionSourceData == null ? void 0 : customVersionSourceData.metadata) || {};
    modSourceData = customVersionSourceData;
  } else if (modDetailsToShow === 'installed') {
    modMetadata = installedModMetadata;
    modSourceData = installedModSourceData;
  } else if (modDetailsToShow === 'repository') {
    modMetadata = repositoryModMetadata;
    modSourceData = repositoryModSourceData;
  }
  const installedModSource = (_installedModSourceDa2 = installedModSourceData == null ? void 0 : installedModSourceData.source) != null ? _installedModSourceDa2 : null;
  const repositoryModSource = (_repositoryModSourceD = repositoryModSourceData == null ? void 0 : repositoryModSourceData.source) != null ? _repositoryModSourceD : null;
  const selectedModSourceData = modDetailsToShow === 'custom' ? customVersionSourceData : repositoryModSourceData;
  const selectedModSource = (_selectedModSourceDat2 = selectedModSourceData == null ? void 0 : selectedModSourceData.source) != null ? _selectedModSourceDat2 : null;
  const installedVersionIsLatest = (0,react.useMemo)(() => {
    return !!(selectedModSource && installedModSource && selectedModSource === installedModSource);
  }, [selectedModSource, installedModSource]);

  // Determine if the selected custom version is a downgrade
  const isDowngrade = (0,react.useMemo)(() => {
    if (!selectedCustomVersion || !installedModMetadata.version) {
      return false;
    }
    const selectedTimestamp = versionTimestamps[selectedCustomVersion];
    const currentTimestamp = versionTimestamps[installedModMetadata.version];
    return selectedTimestamp !== undefined && currentTimestamp !== undefined && selectedTimestamp < currentTimestamp;
  }, [selectedCustomVersion, installedModMetadata.version, versionTimestamps]);
  let modStatus = 'not-installed';
  if (modDetailsToShow === 'installed' && installedModDetails) {
    if (!installedModDetails.config) {
      modStatus = 'installed-not-compiled';
    } else if (!installedModDetails.config.disabled) {
      modStatus = 'enabled';
    } else {
      modStatus = 'disabled';
    }
  }
  return /*#__PURE__*/(0,jsx_runtime.jsxs)(ModDetailsContainer, {
    children: [/*#__PURE__*/(0,jsx_runtime.jsx)(ModDetailsCard, {
      title: /*#__PURE__*/(0,jsx_runtime.jsx)(panel_ModDetailsHeader, {
        topNode: /*#__PURE__*/(0,jsx_runtime.jsx)(ModVersionSelector, {
          currentView: modDetailsToShow,
          selectedCustomVersion: selectedCustomVersion,
          installed: installedModDetails ? {
            version: installedModMetadata.version
          } : null,
          repository: !(repositoryModDetails || loadRepositoryData) ? null : !repositoryModDetails && !repositoryModSourceData ? {
            status: 'loading'
          } : !repositoryModDetails && !repositoryModSource ? {
            status: 'failed'
          } : {
            status: 'loaded',
            version: repositoryModMetadata.version
          },
          onViewChange: value => {
            setSelectedModDetails(value);
            // Clear custom version when switching back to
            // installed/latest.
            handleClearCustomVersion();
          },
          onOpenVersionModal: handleOpenVersionModal
        }),
        modId: modId,
        modMetadata: modMetadata,
        modConfig: modDetailsToShow === 'installed' && (installedModDetails == null ? void 0 : installedModDetails.config) || undefined,
        installSourceData: selectedModSourceData || undefined,
        modStatus: modStatus,
        updateAvailable: !!(installedModDetails && (repositoryModDetails || loadRepositoryData)),
        installedVersionIsLatest: installedVersionIsLatest,
        isDowngrade: isDowngrade,
        userRating: installedModDetails == null ? void 0 : installedModDetails.userRating,
        repositoryDetails: (repositoryModDetails == null ? void 0 : repositoryModDetails.details) || undefined,
        callbacks: {
          goBack: props.goBack,
          installMod: props.installMod && selectedModSource ? options => props.installMod == null ? void 0 : props.installMod(selectedModSource, options) : undefined,
          openTab: tab => setActiveTab(tab),
          updateMod: props.updateMod && selectedModSource ? () => props.updateMod == null ? void 0 : props.updateMod(selectedModSource, modStatus === 'disabled') : undefined,
          forkModFromSource: props.forkModFromSource && selectedModSource ? () => props.forkModFromSource == null ? void 0 : props.forkModFromSource(selectedModSource) : undefined,
          compileMod: props.compileMod,
          enableMod: props.enableMod,
          editMod: props.editMod,
          forkMod: props.forkMod,
          deleteMod: props.deleteMod,
          updateModRating: props.updateModRating,
          onOpenVersionModal: handleOpenVersionModal
        }
      }),
      tabList: tabList,
      activeTabKey: availableActiveTab,
      onTabChange: handleTabChange,
      children: /*#__PURE__*/(0,jsx_runtime.jsx)(ModDetailsTabContent, {
        modId: modId,
        isLocalMod: isLocalMod,
        currentView: modDetailsToShow,
        activeTab: availableActiveTab,
        modSourceData: modSourceData,
        installedModSourceData: installedModSourceData,
        selectedModSourceData: selectedModSourceData,
        installedVersionIsLatest: installedVersionIsLatest,
        canNavigateAwayRef: canNavigateAwayRef,
        onRetryLoad: () => {
          if (selectedCustomVersion) {
            getRepositoryModSourceData({
              modId,
              version: selectedCustomVersion
            });
          } else if (repositoryModDetails || loadRepositoryData) {
            getRepositoryModSourceData({
              modId
            });
          }
        }
      })
    }), /*#__PURE__*/(0,jsx_runtime.jsx)(VersionSelectorModal, {
      modId: modId,
      open: isVersionModalOpen,
      selectedVersion: selectedCustomVersion,
      onSelect: handleVersionSelect,
      onCancel: () => setIsVersionModalOpen(false)
    })]
  });
}
/* harmony default export */ const panel_ModDetails = (ModDetails);
;// ./src/app/panel/ModPreview.tsx










const CenteredContainer = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModPreview__CenteredContainer",
  componentId: "sc-b1mksy-0"
})(["display:flex;flex-direction:column;height:100%;"]);
const CenteredContent = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModPreview__CenteredContent",
  componentId: "sc-b1mksy-1"
})(["margin:auto;padding-bottom:10vh;"]);
function ModPreview({
  ContentWrapper
}) {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  (0,react.useLayoutEffect)(() => {
    const header = document.querySelector('header');
    if (header) {
      header.style.display = 'none';
    }
  }, []);
  const {
    modId: displayedModId
  } = (0,chunk_LFPYN7LY/* useParams */.g)();
  const [installedMods, setInstalledMods] = (0,react.useState)(mockModsBrowserLocalInitialMods);
  const {
    getInstalledMods
  } = useGetInstalledMods((0,react.useCallback)(data => {
    setInstalledMods(data.installedMods);
  }, []));
  (0,react.useEffect)(() => {
    getInstalledMods({});
  }, [getInstalledMods]);
  useSetNewModConfig((0,react.useCallback)(data => {
    const {
      modId,
      config: newConfig
    } = data;
    if (installedMods) {
      setInstalledMods((0,immer/* produce */.jM)(installedMods, draft => {
        var _draft$modId;
        if ((_draft$modId = draft[modId]) != null && _draft$modId.config) {
          draft[modId].config = Object.assign({}, draft[modId].config, newConfig);
        }
      }));
    }
  }, [installedMods]));
  const disabledAction = (0,react.useCallback)(() => {
    message/* default */.Ay.info(t('modPreview.actionUnavailable'), 1);
  }, [t]);
  if (!installedMods || !displayedModId) {
    return null;
  }
  if (!installedMods[displayedModId]) {
    return /*#__PURE__*/(0,jsx_runtime.jsx)(CenteredContainer, {
      children: /*#__PURE__*/(0,jsx_runtime.jsx)(CenteredContent, {
        children: /*#__PURE__*/(0,jsx_runtime.jsx)(empty/* default */.A, {
          image: empty/* default */.A.PRESENTED_IMAGE_SIMPLE,
          description: t('modPreview.notCompiled')
        })
      })
    });
  }
  return /*#__PURE__*/(0,jsx_runtime.jsx)(ContentWrapper, {
    children: /*#__PURE__*/(0,jsx_runtime.jsx)(panel_ModDetails, {
      modId: displayedModId,
      installedModDetails: installedMods[displayedModId],
      goBack: disabledAction,
      updateMod: disabledAction,
      forkModFromSource: disabledAction,
      compileMod: disabledAction,
      enableMod: disabledAction,
      editMod: disabledAction,
      forkMod: disabledAction,
      deleteMod: disabledAction,
      updateModRating: disabledAction
    })
  });
}
/* harmony default export */ const panel_ModPreview = (ModPreview);
// EXTERNAL MODULE: ../../node_modules/antd/es/table/index.js + 100 modules
var table = __webpack_require__(85572);
;// ./src/app/panel/assets/local-mod-icon.svg
/* unused harmony import specifier */ var local_mod_icon_React;
/* unused harmony import specifier */ var local_mod_icon_forwardRef;
var local_mod_icon_g;
var local_mod_icon_excluded = (/* unused pure expression or super */ null && (["title", "titleId"]));
function local_mod_icon_extends() { return local_mod_icon_extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, local_mod_icon_extends.apply(null, arguments); }
function local_mod_icon_objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = local_mod_icon_objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function local_mod_icon_objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }


var SvgLocalModIcon = function SvgLocalModIcon(_ref, ref) {
  var title = _ref.title,
    titleId = _ref.titleId,
    props = local_mod_icon_objectWithoutProperties(_ref, local_mod_icon_excluded);
  return /*#__PURE__*/local_mod_icon_React.createElement("svg", local_mod_icon_extends({
    width: 1024,
    height: 1024,
    xmlns: "http://www.w3.org/2000/svg",
    ref: ref,
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/local_mod_icon_React.createElement("title", {
    id: titleId
  }, title) : null, local_mod_icon_g || (local_mod_icon_g = /*#__PURE__*/local_mod_icon_React.createElement("g", null, /*#__PURE__*/local_mod_icon_React.createElement("title", null, "Layer 1"), /*#__PURE__*/local_mod_icon_React.createElement("g", {
    id: "svg_1"
  }, /*#__PURE__*/local_mod_icon_React.createElement("path", {
    fill: "#ffffff",
    id: "svg_4",
    d: "M 308.2 282.6 C 307.9 282.3 302.1 272.4 293.2 281.8 C 268.2 308.1 237.1 368.6 239.1 367.1 C 183.9 375 132.3 404.2 97.2 447.6 C 61 492.4 42.6 549.8 47.2 607.3 C 52 666.9 80.5 723.5 126.5 762 C 167.8 796.6 219.7 815.2 273.5 815.2 C 289.5 815.2 770.3 815.2 784 815.2 C 795.1 815.2 826.2 800.6 821.3 795.7 C 816.7 791.1 315 289.1 308.2 282.6 Z"
  })), /*#__PURE__*/local_mod_icon_React.createElement("g", {
    id: "svg_5"
  }, /*#__PURE__*/local_mod_icon_React.createElement("path", {
    fill: "#ffffff",
    id: "svg_8",
    d: "M 978.5 621.7 C 978.6 608.9 978.7 634.7 978.6 621.8 C 978.3 550 937.1 482.4 873 449.7 C 855.1 440.6 820.6 435.7 822.9 438 C 809.5 367.3 770.7 302 714.9 256.5 C 657.1 209.3 583.7 184 509.1 186.2 C 457.6 187.7 407 202.2 362.4 227.9 C 356.8 231.1 355.8 239.1 360.4 243.6 C 365.1 248.3 882.4 765.9 889.4 772.6 C 889.7 772.9 900.2 776.8 904.4 773.5 C 950.8 737.1 978.2 680.6 978.5 621.7 Z"
  })), /*#__PURE__*/local_mod_icon_React.createElement("g", {
    id: "svg_9"
  }, /*#__PURE__*/local_mod_icon_React.createElement("g", {
    id: "svg_10"
  }, /*#__PURE__*/local_mod_icon_React.createElement("path", {
    fill: "#ffffff",
    id: "svg_11",
    d: "M 98.4 149.3 C 105.4 156.3 874.6 925.6 884.9 935.8 C 885.3 936.2 885.8 936.7 886.2 937.1 C 897.3 948.2 917.7 949 928.6 937.1 C 939.6 925.1 940.5 906.5 928.6 894.7 C 921.6 887.7 152.4 118.4 142.1 108.2 C 141.7 107.8 141.2 107.3 140.8 106.9 C 129.7 95.8 109.3 95 98.4 106.9 C 87.4 118.9 86.5 137.5 98.4 149.3 Z"
  }))))));
};
var local_mod_icon_ForwardRef = /*#__PURE__*/(/* unused pure expression or super */ null && (local_mod_icon_forwardRef(SvgLocalModIcon)));

/* harmony default export */ const local_mod_icon = (__webpack_require__.p + "local-mod-icon.8cfe58d444d5543c1ad27b53a80cfeab.svg");
;// ./src/app/panel/localModsInsights.ts
function hasLoggingEnabled(config) {
  return !!(config != null && config.loggingEnabled || config != null && config.debugLoggingEnabled);
}
function getLocalModsOverview(installedMods) {
  const values = Object.entries(installedMods);
  const updates = values.filter(([, mod]) => mod.updateAvailable).length;
  const needsCompile = values.filter(([, mod]) => !mod.config).length;
  const loggingEnabled = values.filter(([, mod]) => hasLoggingEnabled(mod.config)).length;
  return {
    totalInstalled: values.length,
    enabled: values.filter(([, mod]) => mod.config && !mod.config.disabled).length,
    updates,
    needsAttention: values.filter(([, mod]) => mod.updateAvailable || !mod.config || hasLoggingEnabled(mod.config)).length,
    localDrafts: values.filter(([modId]) => modId.startsWith('local@')).length,
    needsCompile,
    loggingEnabled
  };
}
function matchesLocalModFilters(modId, mod, filterOptions) {
  if (filterOptions.has('enabled') && (!mod.config || mod.config.disabled)) {
    return false;
  }
  if (filterOptions.has('disabled') && mod.config && !mod.config.disabled) {
    return false;
  }
  if (filterOptions.has('update-available') && !mod.updateAvailable) {
    return false;
  }
  if (filterOptions.has('local-drafts') && !modId.startsWith('local@')) {
    return false;
  }
  if (filterOptions.has('needs-compile') && !!mod.config) {
    return false;
  }
  if (filterOptions.has('logging-enabled') && !hasLoggingEnabled(mod.config)) {
    return false;
  }
  return true;
}
;// ./src/app/panel/ModCard.tsx










const ModCardWrapper = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModCard__ModCardWrapper",
  componentId: "sc-1kcr6qy-0"
})(["> .ant-ribbon-wrapper{height:100%;}"]);
const ModCardRibbon = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(es_badge/* default */.A.Ribbon).withConfig({
  displayName: "ModCard__ModCardRibbon",
  componentId: "sc-1kcr6qy-1"
})(["", ""], ({
  $hidden
}) => $hidden && (0,styled_components_browser_esm/* css */.AH)(["display:none;"]));
const ModCardWrapperInner = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(card/* default */.A).withConfig({
  displayName: "ModCard__ModCardWrapperInner",
  componentId: "sc-1kcr6qy-2"
})(["height:100%;> .ant-card-body{height:100%;display:flex;flex-direction:column;> .ant-card-meta{flex:1;}}"]);
const ModCardTitleContainer = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModCard__ModCardTitleContainer",
  componentId: "sc-1kcr6qy-3"
})(["display:flex;"]);
const ModCardTitle = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(components_EllipsisText).withConfig({
  displayName: "ModCard__ModCardTitle",
  componentId: "sc-1kcr6qy-4"
})(["flex:1;"]);

// Used to prevent from the title to overlap with the ribbon.
const ModCardTitleRibbonContent = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.span.withConfig({
  displayName: "ModCard__ModCardTitleRibbonContent",
  componentId: "sc-1kcr6qy-5"
})(["position:static;margin-inline-end:-16px;font-weight:normal;visibility:hidden;"]);
const ModLocalIcon = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.img.withConfig({
  displayName: "ModCard__ModLocalIcon",
  componentId: "sc-1kcr6qy-6"
})(["height:24px;margin-inline-start:4px;cursor:help;"]);
const ModCardActionsContainer = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModCard__ModCardActionsContainer",
  componentId: "sc-1kcr6qy-7"
})(["display:flex;align-items:center;margin-top:20px;text-align:end;> :not(:last-child){margin-inline-end:10px;}> :last-child{margin-inline-start:auto;}"]);
const ModCard_ModRate = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(rate/* default */.A).withConfig({
  displayName: "ModCard__ModRate",
  componentId: "sc-1kcr6qy-8"
})(["font-size:14px;pointer-events:none;> .ant-rate-star{margin-inline-end:2px;}"]);
const RatingBreakdownTooltip = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModCard__RatingBreakdownTooltip",
  componentId: "sc-1kcr6qy-9"
})(["display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;min-width:234px;"]);
const BreakdownLine = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModCard__BreakdownLine",
  componentId: "sc-1kcr6qy-10"
})(["display:contents;"]);
const BreakdownStars = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.span.withConfig({
  displayName: "ModCard__BreakdownStars",
  componentId: "sc-1kcr6qy-11"
})(["display:flex;"]);
const BreakdownRate = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(rate/* default */.A).withConfig({
  displayName: "ModCard__BreakdownRate",
  componentId: "sc-1kcr6qy-12"
})(["font-size:12px;pointer-events:none;> .ant-rate-star{margin-inline-end:2px;}"]);
const BreakdownProgressContainer = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModCard__BreakdownProgressContainer",
  componentId: "sc-1kcr6qy-13"
})(["height:8px;background-color:rgba(23,18,18,0.1);border-radius:4px;"]);
const BreakdownProgressBar = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModCard__BreakdownProgressBar",
  componentId: "sc-1kcr6qy-14"
})(["height:100%;width:", "%;background-color:#fadb14;border-radius:4px;animation:progressBarFill 0.3s ease;@keyframes progressBarFill{from{width:0%;}}"], props => props.$percentage);
const BreakdownCount = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.span.withConfig({
  displayName: "ModCard__BreakdownCount",
  componentId: "sc-1kcr6qy-15"
})(["color:rgba(255,255,255,0.85);text-align:end;font-size:12px;white-space:nowrap;"]);
const InsightsRow = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModCard__InsightsRow",
  componentId: "sc-1kcr6qy-16"
})(["display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;"]);
const InsightTag = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(tag/* default */.A).withConfig({
  displayName: "ModCard__InsightTag",
  componentId: "sc-1kcr6qy-17"
})(["margin-inline-end:0;border-radius:999px;background:rgba(56,142,211,0.1);border-color:rgba(56,142,211,0.35);color:rgba(255,255,255,0.88);"]);
function ModCard(props) {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();

  // Derive stats from repositoryDetails if available
  const stats = props.repositoryDetails ? {
    users: props.repositoryDetails.users,
    rating: props.repositoryDetails.rating,
    ratingBreakdown: props.repositoryDetails.ratingBreakdown
  } : null;
  const renderRatingTooltip = () => {
    if (!stats) {
      return t('mod.notRated');
    }

    // Calculate total users for percentage
    const totalUsers = stats.ratingBreakdown.reduce((sum, count) => sum + count, 0);
    if (totalUsers === 0) {
      return t('mod.notRated');
    }
    return /*#__PURE__*/(0,jsx_runtime.jsx)(RatingBreakdownTooltip, {
      children: [5, 4, 3, 2, 1].map(stars => {
        var _stats$ratingBreakdow;
        const count = (_stats$ratingBreakdow = stats.ratingBreakdown[stars - 1]) != null ? _stats$ratingBreakdow : 0;
        const percentage = count / totalUsers * 100;
        return /*#__PURE__*/(0,jsx_runtime.jsxs)(BreakdownLine, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(BreakdownStars, {
            children: /*#__PURE__*/(0,jsx_runtime.jsx)(BreakdownRate, {
              disabled: true,
              value: stars
            })
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(BreakdownProgressContainer, {
            children: /*#__PURE__*/(0,jsx_runtime.jsx)(BreakdownProgressBar, {
              $percentage: percentage
            })
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(BreakdownCount, {
            children: t('mod.users', {
              count,
              formattedCount: count.toLocaleString()
            })
          })]
        }, stars);
      })
    });
  };
  return /*#__PURE__*/(0,jsx_runtime.jsx)(ModCardWrapper, {
    children: /*#__PURE__*/(0,jsx_runtime.jsx)(ModCardRibbon, {
      text: props.ribbonText,
      $hidden: !props.ribbonText,
      children: /*#__PURE__*/(0,jsx_runtime.jsxs)(ModCardWrapperInner, {
        size: "small",
        children: [/*#__PURE__*/(0,jsx_runtime.jsx)(card/* default */.A.Meta, {
          title: /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(ModCardTitleContainer, {
              children: [/*#__PURE__*/(0,jsx_runtime.jsx)(ModCardTitle, {
                tooltipPlacement: "bottom",
                children: props.title
              }), props.isLocal && /*#__PURE__*/(0,jsx_runtime.jsx)(tooltip/* default */.A, {
                title: t('mod.editedLocally'),
                placement: "bottom",
                children: /*#__PURE__*/(0,jsx_runtime.jsx)(ModLocalIcon, {
                  src: local_mod_icon
                })
              }), props.ribbonText &&
              /*#__PURE__*/
              // Used to prevent from the title to overlap with the ribbon.
              (0,jsx_runtime.jsx)(ModCardTitleRibbonContent, {
                className: "ant-ribbon",
                children: props.ribbonText
              })]
            }), props.modMetadata && /*#__PURE__*/(0,jsx_runtime.jsx)(panel_ModMetadataLine, {
              modMetadata: props.modMetadata,
              singleLine: true,
              repositoryDetails: props.repositoryDetails
            })]
          }),
          description: props.description || /*#__PURE__*/(0,jsx_runtime.jsx)("i", {
            children: t('mod.noDescription')
          })
        }), props.insights && props.insights.length > 0 && /*#__PURE__*/(0,jsx_runtime.jsx)(InsightsRow, {
          children: props.insights.map(insight => /*#__PURE__*/(0,jsx_runtime.jsx)(InsightTag, {
            children: insight
          }, insight))
        }), /*#__PURE__*/(0,jsx_runtime.jsxs)(ModCardActionsContainer, {
          children: [props.buttons.map((button, i) => {
            const buttonElement = button.confirmText ? /*#__PURE__*/(0,jsx_runtime.jsx)(PopconfirmModal, {
              placement: "bottom",
              title: button.confirmText,
              okText: button.confirmOkText,
              cancelText: button.confirmCancelText,
              okButtonProps: {
                danger: button.confirmIsDanger
              },
              onConfirm: () => button.onClick(),
              children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
                type: "default",
                ghost: true,
                children: button.text
              })
            }, i) : /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
              type: "default",
              ghost: true,
              onClick: button.onClick,
              children: button.text
            }, i);
            if (button.badge) {
              return /*#__PURE__*/(0,jsx_runtime.jsx)(es_badge/* default */.A, {
                dot: true,
                title: button.badge.tooltip,
                status: "warning",
                children: buttonElement
              }, i);
            }
            return buttonElement;
          }), props.switch && /*#__PURE__*/(0,jsx_runtime.jsx)(tooltip/* default */.A, {
            title: props.switch.title,
            placement: "bottom",
            children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_switch/* default */.A, {
              checked: props.switch.checked,
              disabled: props.switch.disabled,
              onChange: checked => {
                var _props$switch;
                return (_props$switch = props.switch) == null ? void 0 : _props$switch.onChange(checked);
              }
            })
          }), stats && /*#__PURE__*/(0,jsx_runtime.jsxs)("div", {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(react_fontawesome_dist/* FontAwesomeIcon */.gc, {
              icon: free_solid_svg_icons/* faUser */.X46
            }), ' ', t('mod.users', {
              count: stats.users,
              formattedCount: stats.users.toLocaleString()
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(divider/* default */.A, {
              type: "vertical"
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(tooltip/* default */.A, {
              title: renderRatingTooltip(),
              placement: "bottom",
              children: /*#__PURE__*/(0,jsx_runtime.jsx)("span", {
                children: /*#__PURE__*/(0,jsx_runtime.jsx)(ModCard_ModRate, {
                  disabled: true,
                  allowHalf: true,
                  defaultValue: stats.rating / 2
                })
              })
            })]
          })]
        })]
      })
    })
  });
}
/* harmony default export */ const panel_ModCard = (ModCard);
;// ./src/app/panel/ModsBrowserLocal.tsx


















const SectionHeader = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserLocal__SectionHeader",
  componentId: "sc-1kgxt36-0"
})(["display:flex;justify-content:space-between;align-items:start;margin-top:20px;"]);
const SectionIcon = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(react_fontawesome_dist/* FontAwesomeIcon */.gc).withConfig({
  displayName: "ModsBrowserLocal__SectionIcon",
  componentId: "sc-1kgxt36-1"
})(["margin-inline-end:3px;"]);
const SearchFilterContainer = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserLocal__SearchFilterContainer",
  componentId: "sc-1kgxt36-2"
})(["display:flex;gap:10px;margin-top:12px;margin-bottom:20px;"]);
const SearchFilterInput = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(InputWithContextMenu).withConfig({
  displayName: "ModsBrowserLocal__SearchFilterInput",
  componentId: "sc-1kgxt36-3"
})(["> .ant-input-prefix{margin-inline-end:8px;}"]);
const IconButton = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(es_button/* default */.A).withConfig({
  displayName: "ModsBrowserLocal__IconButton",
  componentId: "sc-1kgxt36-4"
})(["padding-inline-start:0;padding-inline-end:0;min-width:40px;"]);
const ModsContainer = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserLocal__ModsContainer",
  componentId: "sc-1kgxt36-5"
})(["", ""], ({
  $extraBottomPadding
}) => (0,styled_components_browser_esm/* css */.AH)(["padding-bottom:", "px;"], $extraBottomPadding ? 70 : 20));
const ModsGrid = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserLocal__ModsGrid",
  componentId: "sc-1kgxt36-6"
})(["display:grid;grid-template-columns:repeat( auto-fill,calc(min(400px - 20px * 4 / 3,100%)) );gap:20px;justify-content:center;"]);
const ModNameLink = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.a.withConfig({
  displayName: "ModsBrowserLocal__ModNameLink",
  componentId: "sc-1kgxt36-7"
})(["color:var(--vscode-textLink-foreground,#3794ff);&:hover{color:var(--vscode-textLink-activeForeground,#4daafc);}"]);
const TableActionsButton = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(es_button/* default */.A).withConfig({
  displayName: "ModsBrowserLocal__TableActionsButton",
  componentId: "sc-1kgxt36-8"
})(["padding:0 6px;height:22px;"]);
const ModsBrowserLocal_ModLocalIcon = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.img.withConfig({
  displayName: "ModsBrowserLocal__ModLocalIcon",
  componentId: "sc-1kgxt36-9"
})(["height:20px;margin-inline-start:8px;cursor:help;"]);
const ExploreModsButton = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(es_button/* default */.A).withConfig({
  displayName: "ModsBrowserLocal__ExploreModsButton",
  componentId: "sc-1kgxt36-10"
})(["height:100%;font-size:22px;"]);
const ModsBrowserLocal_ProgressSpin = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(spin/* default */.A).withConfig({
  displayName: "ModsBrowserLocal__ProgressSpin",
  componentId: "sc-1kgxt36-11"
})(["display:block;margin-inline-start:auto;margin-inline-end:auto;font-size:32px;"]);
const OverviewGrid = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserLocal__OverviewGrid",
  componentId: "sc-1kgxt36-12"
})(["display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:20px;"]);
const OverviewCard = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserLocal__OverviewCard",
  componentId: "sc-1kgxt36-13"
})(["padding:16px 18px;border:1px solid var(--app-surface-border);border-radius:var(--app-surface-radius);background:rgba(255,255,255,0.04);box-shadow:var(--app-surface-shadow);"]);
const OverviewValue = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserLocal__OverviewValue",
  componentId: "sc-1kgxt36-14"
})(["margin-bottom:4px;color:rgba(255,255,255,0.94);font-size:28px;font-weight:700;line-height:1;"]);
const OverviewLabel = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserLocal__OverviewLabel",
  componentId: "sc-1kgxt36-15"
})(["color:rgba(255,255,255,0.62);font-size:12px;text-transform:uppercase;letter-spacing:0.08em;"]);
const RuntimeAlert = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(es_alert/* default */.A).withConfig({
  displayName: "ModsBrowserLocal__RuntimeAlert",
  componentId: "sc-1kgxt36-16"
})(["margin-bottom:18px;"]);
const QuickFocusRow = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserLocal__QuickFocusRow",
  componentId: "sc-1kgxt36-17"
})(["display:flex;flex-wrap:wrap;gap:10px;margin-bottom:20px;"]);
const QuickFocusButton = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(es_button/* default */.A).withConfig({
  displayName: "ModsBrowserLocal__QuickFocusButton",
  componentId: "sc-1kgxt36-18"
})(["", ""], ({
  $active
}) => (0,styled_components_browser_esm/* css */.AH)(["border-color:", ";background:", ";"], $active ? 'rgba(24, 144, 255, 0.45)' : 'rgba(255, 255, 255, 0.12)', $active ? 'rgba(24, 144, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)'));
function ModsBrowserLocal({
  ContentWrapper
}) {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const navigate = (0,chunk_LFPYN7LY/* useNavigate */.Zp)();
  const {
    modType: displayedModType,
    modId: displayedModId
  } = (0,chunk_LFPYN7LY/* useParams */.g)();
  const [installedMods, setInstalledMods] = (0,react.useState)(mockModsBrowserLocalInitialMods);
  const [featuredMods, setFeaturedMods] = (0,react.useState)(mockModsBrowserLocalFeaturedMods || undefined);
  const [runtimeDiagnostics, setRuntimeDiagnostics] = (0,react.useState)(mockRuntimeDiagnostics);
  const [filterText, setFilterText] = (0,react.useState)('');
  const [filterOptions, setFilterOptions] = (0,react.useState)(new Set());
  const [filterDropdownOpen, setFilterDropdownOpen] = (0,react.useState)(false);
  const [confirmModalOpen, setConfirmModalOpen] = (0,react.useState)(false);
  const [viewMode, setViewMode] = (0,react.useState)(() => {
    try {
      const saved = localStorage.getItem('modsBrowserViewMode');
      return saved === 'list' ? 'list' : 'grid';
    } catch (_unused) {
      return 'grid';
    }
  });
  const handleViewModeChange = (0,react.useCallback)(mode => {
    setViewMode(mode);
    try {
      localStorage.setItem('modsBrowserViewMode', mode);
    } catch (_unused2) {
      // Ignore localStorage errors
    }
  }, []);
  const installedModsFilteredAndSorted = (0,react.useMemo)(() => {
    if (!installedMods) {
      return installedMods;
    }
    const filterWords = filterText.toLowerCase().split(/\s+/).map(word => word.trim()).filter(word => word.length > 0);
    return Object.entries(installedMods).filter(([modId, mod]) => {
      // Apply text filter
      if (filterWords.length > 0) {
        const textMatch = filterWords.every(filterWord => {
          var _mod$metadata, _mod$metadata2;
          return modId.toLowerCase().includes(filterWord) || ((_mod$metadata = mod.metadata) == null || (_mod$metadata = _mod$metadata.name) == null ? void 0 : _mod$metadata.toLowerCase().includes(filterWord)) || ((_mod$metadata2 = mod.metadata) == null || (_mod$metadata2 = _mod$metadata2.description) == null ? void 0 : _mod$metadata2.toLowerCase().includes(filterWord));
        });
        if (!textMatch) {
          return false;
        }
      }

      // Apply category filters - if none selected, show all
      if (filterOptions.size === 0) {
        return true;
      }

      // Use AND logic - mod must match ALL selected filters
      return matchesLocalModFilters(modId, mod, filterOptions);
    }).sort((a, b) => {
      var _modA$metadata, _modB$metadata;
      const [modIdA, modA] = a;
      const [modIdB, modB] = b;
      const modAIsLocal = modIdA.startsWith('local@');
      const modBIsLocal = modIdB.startsWith('local@');
      if (modAIsLocal !== modBIsLocal) {
        return modAIsLocal ? -1 : 1;
      }
      const modATitle = (((_modA$metadata = modA.metadata) == null ? void 0 : _modA$metadata.name) || modIdA).toLowerCase();
      const modBTitle = (((_modB$metadata = modB.metadata) == null ? void 0 : _modB$metadata.name) || modIdB).toLowerCase();
      if (modATitle < modBTitle) {
        return -1;
      } else if (modATitle > modBTitle) {
        return 1;
      }
      if (modIdA < modIdB) {
        return -1;
      } else if (modIdA > modIdB) {
        return 1;
      }
      return 0;
    });
  }, [installedMods, filterText, filterOptions]);
  const featuredModsShuffled = (0,react.useMemo)(() => {
    if (!featuredMods) {
      return featuredMods;
    }

    // https://stackoverflow.com/a/6274381
    /**
     * Shuffles array in place. ES6 version
     * @param {Array} a items An array containing the items.
     */
    const shuffleArray = a => {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };
    return shuffleArray(Object.entries(featuredMods));
  }, [featuredMods]);
  const featuredModsFilteredAndSorted = (0,react.useMemo)(() => {
    if (!featuredModsShuffled) {
      return featuredModsShuffled;
    }
    const maxFeaturedModsToShow = 5;

    // Return a random sample of non-installed mods.
    const notInstalled = featuredModsShuffled.filter(([modId, mod]) => !(installedMods != null && installedMods[modId]));
    return notInstalled.slice(0, maxFeaturedModsToShow);
  }, [featuredModsShuffled, installedMods]);
  const {
    devModeOptOut
  } = (0,react.useContext)(AppUISettingsContext);
  const {
    getInstalledMods
  } = useGetInstalledMods((0,react.useCallback)(data => {
    setInstalledMods(data.installedMods);
  }, []));
  const {
    getFeaturedMods
  } = useGetFeaturedMods((0,react.useCallback)(data => {
    setFeaturedMods(data.featuredMods);
  }, []));
  const {
    getAppSettings
  } = useGetAppSettings((0,react.useCallback)(data => {
    setRuntimeDiagnostics(data.runtimeDiagnostics || null);
  }, []));
  (0,react.useEffect)(() => {
    getInstalledMods({});
    getFeaturedMods({});
    getAppSettings({});
  }, [getAppSettings, getFeaturedMods, getInstalledMods]);
  useUpdateInstalledModsDetails((0,react.useCallback)(data => {
    if (installedMods) {
      const installedModsDetails = data.details;
      setInstalledMods((0,immer/* produce */.jM)(installedMods, draft => {
        for (const [modId, updatedDetails] of Object.entries(installedModsDetails)) {
          const details = draft[modId];
          if (details) {
            const {
              updateAvailable,
              userRating
            } = updatedDetails;
            details.updateAvailable = updateAvailable;
            details.userRating = userRating;
          }
        }
      }));
    }
  }, [installedMods]));
  useSetNewModConfig((0,react.useCallback)(data => {
    const {
      modId,
      config: newConfig
    } = data;
    if (installedMods) {
      setInstalledMods((0,immer/* produce */.jM)(installedMods, draft => {
        var _draft$modId;
        if ((_draft$modId = draft[modId]) != null && _draft$modId.config) {
          draft[modId].config = Object.assign({}, draft[modId].config, newConfig);
        }
      }));
    }
  }, [installedMods]));
  const {
    installMod,
    installModPending,
    installModContext
  } = useInstallMod((0,react.useCallback)(data => {
    const {
      modId,
      installedModDetails
    } = data;
    if (installedModDetails && installedMods) {
      setInstalledMods((0,immer/* produce */.jM)(installedMods, draft => {
        const {
          metadata,
          config
        } = installedModDetails;
        draft[modId] = draft[modId] || {};
        draft[modId].metadata = metadata;
        draft[modId].config = config;
        draft[modId].updateAvailable = false;
      }));
    }
  }, [installedMods]));
  const {
    compileMod,
    compileModPending
  } = useCompileMod((0,react.useCallback)(data => {
    const {
      modId,
      compiledModDetails
    } = data;
    if (compiledModDetails && installedMods) {
      setInstalledMods((0,immer/* produce */.jM)(installedMods, draft => {
        const {
          metadata,
          config
        } = compiledModDetails;
        draft[modId] = draft[modId] || {};
        draft[modId].metadata = metadata;
        draft[modId].config = config;
        draft[modId].updateAvailable = false;
      }));
    }
  }, [installedMods]));
  const {
    enableMod
  } = useEnableMod((0,react.useCallback)(data => {
    if (data.succeeded && installedMods) {
      const modId = data.modId;
      setInstalledMods((0,immer/* produce */.jM)(installedMods, draft => {
        const config = draft[modId].config;
        if (config) {
          config.disabled = !data.enabled;
        }
      }));
    }
  }, [installedMods]));
  const {
    deleteMod
  } = useDeleteMod((0,react.useCallback)(data => {
    if (data.succeeded && installedMods) {
      const modId = data.modId;
      if (displayedModType === 'local' && displayedModId === modId) {
        navigate('/', {
          replace: true
        });
      }
      setInstalledMods((0,immer/* produce */.jM)(installedMods, draft => {
        delete draft[modId];
      }));
    }
  }, [displayedModId, displayedModType, installedMods, navigate]));
  const {
    updateModRating
  } = useUpdateModRating((0,react.useCallback)(data => {
    if (data.succeeded && installedMods) {
      const modId = data.modId;
      setInstalledMods((0,immer/* produce */.jM)(installedMods, draft => {
        draft[modId].userRating = data.rating;
      }));
    }
  }, [installedMods]));
  const [detailsButtonClicked, setDetailsButtonClicked] = (0,react.useState)(false);
  const handleFilterChange = key => {
    setFilterOptions(prevOptions => {
      const newOptions = new Set(prevOptions);

      // Handle mutually exclusive filters
      if (key === 'enabled' && newOptions.has('disabled')) {
        newOptions.delete('disabled');
      } else if (key === 'disabled' && newOptions.has('enabled')) {
        newOptions.delete('enabled');
      }

      // Toggle the clicked option
      if (newOptions.has(key)) {
        newOptions.delete(key);
      } else {
        newOptions.add(key);
      }
      return newOptions;
    });
  };
  const handleClearFilters = () => {
    setFilterOptions(new Set());
  };

  // Block all navigation when modal is open
  const modalIsOpen = installModPending || compileModPending || confirmModalOpen;
  (0,chunk_LFPYN7LY/* useBlocker */.KP)(({
    currentLocation,
    nextLocation
  }) => {
    return modalIsOpen && currentLocation.pathname !== nextLocation.pathname;
  });
  if (!installedMods || !installedModsFilteredAndSorted) {
    return null;
  }
  const runtimeIssueText = runtimeDiagnostics ? runtimeDiagnostics.issueCode === 'engine-config-missing' ? t('about.runtime.issue.engineConfigMissing') : runtimeDiagnostics.issueCode === 'engine-storage-mismatch' ? t('about.runtime.issue.engineStorageMismatch') : null : null;
  const localModsOverview = getLocalModsOverview(installedMods);
  const quickFocusItems = [{
    key: 'local-drafts',
    label: t('home.filter.localDrafts'),
    count: localModsOverview.localDrafts
  }, {
    key: 'needs-compile',
    label: t('home.filter.needsCompile'),
    count: localModsOverview.needsCompile
  }, {
    key: 'logging-enabled',
    label: t('home.filter.loggingEnabled'),
    count: localModsOverview.loggingEnabled
  }, {
    key: 'update-available',
    label: t('home.filter.updateAvailable'),
    count: localModsOverview.updates
  }];
  const overviewItems = [{
    key: 'total',
    label: t('home.overview.totalInstalled'),
    value: localModsOverview.totalInstalled
  }, {
    key: 'enabled',
    label: t('home.overview.enabled'),
    value: localModsOverview.enabled
  }, {
    key: 'updates',
    label: t('home.overview.updates'),
    value: localModsOverview.updates
  }, {
    key: 'attention',
    label: t('home.overview.needsAttention'),
    value: localModsOverview.needsAttention
  }];
  const noInstalledMods = Object.keys(installedMods).length === 0;
  const noFilteredResults = installedModsFilteredAndSorted.length === 0 && !noInstalledMods;
  return /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [/*#__PURE__*/(0,jsx_runtime.jsx)(ContentWrapper, {
      $hidden: !!displayedModId,
      children: /*#__PURE__*/(0,jsx_runtime.jsxs)(ModsContainer, {
        $extraBottomPadding: !devModeOptOut,
        children: [runtimeDiagnostics && !runtimeDiagnostics.engineConfigMatchesAppConfig && runtimeIssueText && /*#__PURE__*/(0,jsx_runtime.jsx)(RuntimeAlert, {
          message: /*#__PURE__*/(0,jsx_runtime.jsx)("strong", {
            children: t('home.runtimeIssue.title')
          }),
          description: runtimeIssueText,
          type: "warning",
          showIcon: true,
          action: /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
            size: "small",
            onClick: () => navigate('/about'),
            children: t('home.runtimeIssue.viewDiagnostics')
          })
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(OverviewGrid, {
          children: overviewItems.map(({
            key,
            label,
            value
          }) => /*#__PURE__*/(0,jsx_runtime.jsxs)(OverviewCard, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(OverviewValue, {
              children: value
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(OverviewLabel, {
              children: label
            })]
          }, key))
        }), !noInstalledMods && /*#__PURE__*/(0,jsx_runtime.jsx)(QuickFocusRow, {
          children: quickFocusItems.map(item => /*#__PURE__*/(0,jsx_runtime.jsxs)(QuickFocusButton, {
            $active: filterOptions.has(item.key),
            onClick: () => handleFilterChange(item.key),
            children: [item.label, " (", item.count, ")"]
          }, item.key))
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(SectionHeader, {
          children: /*#__PURE__*/(0,jsx_runtime.jsxs)("h2", {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SectionIcon, {
              icon: free_solid_svg_icons/* faHdd */.MBK
            }), " ", t('home.installedMods.title')]
          })
        }), !noInstalledMods && /*#__PURE__*/(0,jsx_runtime.jsxs)(SearchFilterContainer, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SearchFilterInput, {
            prefix: /*#__PURE__*/(0,jsx_runtime.jsx)(react_fontawesome_dist/* FontAwesomeIcon */.gc, {
              icon: free_solid_svg_icons/* faSearch */.MjD
            }),
            placeholder: t('modSearch.placeholder'),
            allowClear: true,
            value: filterText,
            onChange: e => setFilterText(e.target.value)
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(DropdownModal, {
            placement: "bottomRight",
            trigger: ['click'],
            arrow: true,
            open: filterDropdownOpen,
            onOpenChange: setFilterDropdownOpen,
            menu: {
              items: [{
                label: t('home.filter.enabled'),
                key: 'enabled'
              }, {
                label: t('home.filter.disabled'),
                key: 'disabled'
              }, {
                label: t('home.filter.updateAvailable'),
                key: 'update-available'
              }, {
                label: t('home.filter.localDrafts'),
                key: 'local-drafts'
              }, {
                label: t('home.filter.needsCompile'),
                key: 'needs-compile'
              }, {
                label: t('home.filter.loggingEnabled'),
                key: 'logging-enabled'
              }, {
                type: 'divider'
              }, {
                label: t('home.filter.clearFilters'),
                key: 'clear-filters'
              }],
              selectedKeys: Array.from(filterOptions),
              onClick: e => {
                if (e.key === 'clear-filters') {
                  dropdownModalDismissed();
                  handleClearFilters();
                  setFilterDropdownOpen(false);
                } else {
                  handleFilterChange(e.key);
                  // Keep dropdown open for filter changes
                }
              }
            },
            children: /*#__PURE__*/(0,jsx_runtime.jsx)(IconButton, {
              type: filterOptions.size > 0 ? 'primary' : undefined,
              children: /*#__PURE__*/(0,jsx_runtime.jsx)(react_fontawesome_dist/* FontAwesomeIcon */.gc, {
                icon: free_solid_svg_icons/* faFilter */.mRM
              })
            })
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(IconButton, {
            onClick: () => handleViewModeChange(viewMode === 'grid' ? 'list' : 'grid'),
            children: /*#__PURE__*/(0,jsx_runtime.jsx)(react_fontawesome_dist/* FontAwesomeIcon */.gc, {
              icon: viewMode === 'grid' ? free_solid_svg_icons/* faList */.ITF : free_solid_svg_icons/* faGripVertical */.S9g
            })
          })]
        }), noInstalledMods ? /*#__PURE__*/(0,jsx_runtime.jsx)(empty/* default */.A, {
          image: empty/* default */.A.PRESENTED_IMAGE_SIMPLE,
          description: t('home.installedMods.noMods'),
          children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
            type: "primary",
            onClick: () => navigate('/mods-browser'),
            children: t('home.browse')
          })
        }) : noFilteredResults ? /*#__PURE__*/(0,jsx_runtime.jsx)(empty/* default */.A, {
          image: empty/* default */.A.PRESENTED_IMAGE_SIMPLE,
          description: t('modSearch.noResults')
        }) : viewMode === 'grid' ? /*#__PURE__*/(0,jsx_runtime.jsx)(ModsGrid, {
          children: installedModsFilteredAndSorted.map(([modId, mod]) => {
            var _mod$metadata3, _mod$metadata4, _mod$config, _mod$config2;
            return /*#__PURE__*/(0,jsx_runtime.jsx)(panel_ModCard, {
              ribbonText: mod.updateAvailable ? t('mod.updateAvailable') : undefined,
              title: ((_mod$metadata3 = mod.metadata) == null ? void 0 : _mod$metadata3.name) || modId.replace(/^local@/, ''),
              isLocal: modId.startsWith('local@'),
              description: (_mod$metadata4 = mod.metadata) == null ? void 0 : _mod$metadata4.description,
              buttons: [{
                text: t('mod.details'),
                onClick: () => {
                  setDetailsButtonClicked(true);
                  navigate('/mods/local/' + modId);
                },
                badge: (_mod$config = mod.config) != null && _mod$config.loggingEnabled || (_mod$config2 = mod.config) != null && _mod$config2.debugLoggingEnabled ? {
                  tooltip: t('mod.loggingEnabledInAdvancedTab')
                } : undefined
              }, {
                text: t('mod.remove'),
                confirmText: t('mod.removeConfirm'),
                confirmOkText: t('mod.removeConfirmOk'),
                confirmCancelText: t('mod.removeConfirmCancel'),
                confirmIsDanger: true,
                onClick: () => deleteMod({
                  modId
                })
              }],
              switch: {
                title: mod.config ? undefined : t('mod.notCompiled'),
                checked: mod.config ? !mod.config.disabled : false,
                disabled: !mod.config,
                onChange: checked => enableMod({
                  modId,
                  enable: checked
                })
              }
            }, modId);
          })
        }) : /*#__PURE__*/(0,jsx_runtime.jsx)(table/* default */.A, {
          bordered: true,
          dataSource: installedModsFilteredAndSorted.map(([modId, mod]) => {
            var _mod$metadata5, _mod$metadata6, _mod$metadata7, _mod$metadata8;
            return {
              key: modId,
              modId,
              name: ((_mod$metadata5 = mod.metadata) == null ? void 0 : _mod$metadata5.name) || modId.replace(/^local@/, ''),
              description: (_mod$metadata6 = mod.metadata) == null ? void 0 : _mod$metadata6.description,
              author: (_mod$metadata7 = mod.metadata) == null ? void 0 : _mod$metadata7.author,
              version: (_mod$metadata8 = mod.metadata) == null ? void 0 : _mod$metadata8.version,
              isLocal: modId.startsWith('local@'),
              updateAvailable: mod.updateAvailable,
              disabled: mod.config ? mod.config.disabled : true,
              notCompiled: !mod.config,
              mod
            };
          }),
          columns: [{
            title: '',
            key: 'actions',
            width: 50,
            align: 'center',
            render: (_, record) => {
              var _record$mod$config, _record$mod$config2;
              const isLocal = record.isLocal;
              const menuItems = [];

              // Compile action (if not compiled)
              if (record.notCompiled) {
                menuItems.push({
                  label: t('mod.compile'),
                  key: 'compile',
                  onClick: () => {
                    dropdownModalDismissed();
                    compileMod({
                      modId: record.modId
                    });
                  }
                });
              }

              // Enable/Disable action (if compiled)
              if (!record.notCompiled) {
                menuItems.push({
                  label: record.disabled ? t('mod.enable') : t('mod.disable'),
                  key: 'toggle-enable',
                  onClick: () => {
                    dropdownModalDismissed();
                    enableMod({
                      modId: record.modId,
                      enable: record.disabled
                    });
                  }
                });
              }

              // Divider before dev actions
              if (menuItems.length > 0) {
                menuItems.push({
                  type: 'divider'
                });
              }

              // Edit action (local mods only)
              if (isLocal) {
                menuItems.push({
                  label: t('mod.edit'),
                  key: 'edit',
                  onClick: () => {
                    dropdownModalDismissed();
                    editMod({
                      modId: record.modId
                    });
                  }
                });
              }

              // Fork action
              menuItems.push({
                label: t('mod.fork'),
                key: 'fork',
                onClick: () => {
                  dropdownModalDismissed();
                  forkMod({
                    modId: record.modId
                  });
                }
              });

              // Divider before remove
              menuItems.push({
                type: 'divider'
              });

              // Remove action
              menuItems.push({
                label: t('mod.remove'),
                key: 'remove',
                danger: true,
                onClick: () => {
                  dropdownModalDismissed();
                  setConfirmModalOpen(true);
                  modal/* default */.A.confirm({
                    title: t('mod.removeConfirm'),
                    okText: t('mod.removeConfirmOk'),
                    cancelText: t('mod.removeConfirmCancel'),
                    okButtonProps: {
                      danger: true
                    },
                    onOk: () => {
                      setConfirmModalOpen(false);
                      deleteMod({
                        modId: record.modId
                      });
                    },
                    onCancel: () => {
                      setConfirmModalOpen(false);
                    },
                    closable: true,
                    maskClosable: true
                  });
                }
              });
              const hasLogging = ((_record$mod$config = record.mod.config) == null ? void 0 : _record$mod$config.loggingEnabled) || ((_record$mod$config2 = record.mod.config) == null ? void 0 : _record$mod$config2.debugLoggingEnabled);
              const actionsButton = /*#__PURE__*/(0,jsx_runtime.jsx)(DropdownModal, {
                menu: {
                  items: menuItems
                },
                trigger: ['click'],
                children: /*#__PURE__*/(0,jsx_runtime.jsx)(TableActionsButton, {
                  children: /*#__PURE__*/(0,jsx_runtime.jsx)(react_fontawesome_dist/* FontAwesomeIcon */.gc, {
                    icon: free_solid_svg_icons/* faCaretDown */.xBV
                  })
                })
              });
              if (hasLogging) {
                return /*#__PURE__*/(0,jsx_runtime.jsx)(es_badge/* default */.A, {
                  dot: true,
                  title: t('mod.loggingEnabledInAdvancedTab'),
                  status: "warning",
                  children: actionsButton
                });
              }
              return actionsButton;
            }
          }, {
            title: t('home.installedMods.grid.name'),
            dataIndex: 'name',
            key: 'name',
            width: '30%',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (name, record) => /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
              children: [/*#__PURE__*/(0,jsx_runtime.jsx)(ModNameLink, {
                onClick: () => {
                  setDetailsButtonClicked(true);
                  navigate('/mods/local/' + record.modId);
                },
                children: name
              }), record.updateAvailable && /*#__PURE__*/(0,jsx_runtime.jsx)(tag/* default */.A, {
                color: "warning",
                style: {
                  marginInlineStart: 8,
                  userSelect: 'none'
                },
                children: t('mod.updateAvailable')
              }), record.isLocal && /*#__PURE__*/(0,jsx_runtime.jsx)(tooltip/* default */.A, {
                title: t('mod.editedLocally'),
                placement: "bottom",
                children: /*#__PURE__*/(0,jsx_runtime.jsx)(ModsBrowserLocal_ModLocalIcon, {
                  src: local_mod_icon
                })
              })]
            })
          }, {
            title: t('home.installedMods.grid.description'),
            dataIndex: 'description',
            key: 'description',
            render: description => /*#__PURE__*/(0,jsx_runtime.jsx)(components_EllipsisText, {
              tooltipPlacement: "bottom",
              children: description || '-'
            }),
            ellipsis: {
              showTitle: false
            }
          }, {
            title: t('home.installedMods.grid.author'),
            dataIndex: 'author',
            key: 'author',
            width: '12%',
            sorter: (a, b) => (a.author || '').localeCompare(b.author || ''),
            render: author => author || '-'
          }, {
            title: t('home.installedMods.grid.version'),
            dataIndex: 'version',
            key: 'version',
            width: '8%',
            sorter: (a, b) => {
              const versionA = a.version || '';
              const versionB = b.version || '';
              return versionA.localeCompare(versionB, undefined, {
                numeric: true,
                sensitivity: 'base'
              });
            },
            render: version => version || '-'
          }, {
            title: t('home.installedMods.grid.status'),
            key: 'status',
            width: 80,
            align: 'center',
            sorter: (a, b) => Number(a.disabled) - Number(b.disabled),
            render: (_, record) => /*#__PURE__*/(0,jsx_runtime.jsx)(es_switch/* default */.A, {
              checked: !record.disabled,
              disabled: record.notCompiled,
              onChange: checked => enableMod({
                modId: record.modId,
                enable: checked
              }),
              title: record.notCompiled ? t('mod.notCompiled') : undefined
            })
          }],
          pagination: false,
          size: "middle",
          showSorterTooltip: false,
          style: {
            wordBreak: 'break-word'
          }
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(SectionHeader, {
          children: /*#__PURE__*/(0,jsx_runtime.jsxs)("h2", {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SectionIcon, {
              icon: free_solid_svg_icons/* faStar */.yy
            }), " ", t('home.featuredMods.title')]
          })
        }), featuredModsFilteredAndSorted === undefined ? /*#__PURE__*/(0,jsx_runtime.jsx)(ModsBrowserLocal_ProgressSpin, {
          size: "large",
          tip: t('general.loading')
        }) : featuredModsFilteredAndSorted === null ? /*#__PURE__*/(0,jsx_runtime.jsx)(empty/* default */.A, {
          image: empty/* default */.A.PRESENTED_IMAGE_SIMPLE,
          description: t('general.loadingFailed'),
          children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
            type: "primary",
            onClick: () => navigate('/mods-browser'),
            children: t('home.browse')
          })
        }) : featuredModsFilteredAndSorted.length === 0 ? /*#__PURE__*/(0,jsx_runtime.jsx)(empty/* default */.A, {
          image: empty/* default */.A.PRESENTED_IMAGE_SIMPLE,
          description: t('home.featuredMods.noMods'),
          children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
            type: "primary",
            onClick: () => navigate('/mods-browser'),
            children: t('home.browse')
          })
        }) : /*#__PURE__*/(0,jsx_runtime.jsxs)(ModsGrid, {
          children: [featuredModsFilteredAndSorted.map(([modId, mod]) => {
            var _installedMods$modId$;
            return /*#__PURE__*/(0,jsx_runtime.jsx)(panel_ModCard, {
              ribbonText: installedMods[modId] ? ((_installedMods$modId$ = installedMods[modId].metadata) == null ? void 0 : _installedMods$modId$.version) !== mod.metadata.version ? t('mod.updateAvailable') : t('mod.installed') : undefined,
              title: mod.metadata.name || modId,
              description: mod.metadata.description,
              modMetadata: mod.metadata,
              repositoryDetails: mod.details,
              buttons: [{
                text: t('mod.details'),
                onClick: () => {
                  setDetailsButtonClicked(true);
                  navigate('/mods/featured/' + modId);
                }
              }]
            }, modId);
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(ExploreModsButton, {
            size: "large",
            onClick: () => navigate('/mods-browser'),
            children: t('home.featuredMods.explore')
          })]
        })]
      })
    }), displayedModId && /*#__PURE__*/(0,jsx_runtime.jsx)(ContentWrapper, {
      children: displayedModType === 'local' && installedMods[displayedModId] ? /*#__PURE__*/(0,jsx_runtime.jsx)(panel_ModDetails, {
        modId: displayedModId,
        installedModDetails: installedMods[displayedModId],
        loadRepositoryData: installedMods[displayedModId].updateAvailable,
        goBack: () => {
          // If we ever clicked on Details, go back.
          // Otherwise, we probably arrived from a different location,
          // go straight to the mods page.
          if (detailsButtonClicked) {
            navigate(-1);
          } else {
            navigate('/');
          }
        },
        updateMod: (modSource, disabled) => installMod({
          modId: displayedModId,
          modSource,
          disabled
        }, {
          updating: true
        }),
        forkModFromSource: modSource => forkMod({
          modId: displayedModId,
          modSource
        }),
        compileMod: () => compileMod({
          modId: displayedModId
        }),
        enableMod: enable => enableMod({
          modId: displayedModId,
          enable
        }),
        editMod: () => editMod({
          modId: displayedModId
        }),
        forkMod: () => forkMod({
          modId: displayedModId
        }),
        deleteMod: () => deleteMod({
          modId: displayedModId
        }),
        updateModRating: newRating => updateModRating({
          modId: displayedModId,
          rating: newRating
        })
      }) : /*#__PURE__*/(0,jsx_runtime.jsx)(panel_ModDetails, {
        modId: displayedModId,
        installedModDetails: installedMods[displayedModId],
        repositoryModDetails: featuredMods == null ? void 0 : featuredMods[displayedModId],
        loadRepositoryData: !displayedModId.startsWith('local@'),
        goBack: () => {
          // If we ever clicked on Details, go back.
          // Otherwise, we probably arrived from a different location,
          // go straight to the mods page.
          if (detailsButtonClicked) {
            navigate(-1);
          } else {
            navigate('/');
          }
        },
        installMod: (modSource, options) => installMod({
          modId: displayedModId,
          modSource,
          disabled: options == null ? void 0 : options.disabled
        }),
        updateMod: (modSource, disabled) => installMod({
          modId: displayedModId,
          modSource,
          disabled
        }, {
          updating: true
        }),
        forkModFromSource: modSource => forkMod({
          modId: displayedModId,
          modSource
        }),
        compileMod: () => compileMod({
          modId: displayedModId
        }),
        enableMod: enable => enableMod({
          modId: displayedModId,
          enable
        }),
        editMod: () => editMod({
          modId: displayedModId
        }),
        forkMod: () => forkMod({
          modId: displayedModId
        }),
        deleteMod: () => deleteMod({
          modId: displayedModId
        }),
        updateModRating: newRating => updateModRating({
          modId: displayedModId,
          rating: newRating
        })
      })
    }), (installModPending || compileModPending) && /*#__PURE__*/(0,jsx_runtime.jsx)(modal/* default */.A, {
      open: true,
      closable: false,
      footer: null,
      children: /*#__PURE__*/(0,jsx_runtime.jsx)(ModsBrowserLocal_ProgressSpin, {
        size: "large",
        tip: installModPending ? installModContext != null && installModContext.updating ? t('general.updating') : t('general.installing') : compileModPending ? t('general.compiling') : ''
      })
    })]
  });
}
/* harmony default export */ const panel_ModsBrowserLocal = (ModsBrowserLocal);
// EXTERNAL MODULE: ../../node_modules/react-infinite-scroll-component/dist/index.es.js
var index_es = __webpack_require__(13946);
;// ./src/app/panel/modDiscovery.ts
const STOP_WORDS = new Set(['a', 'an', 'and', 'as', 'at', 'be', 'by', 'for', 'from', 'in', 'into', 'is', 'it', 'its', 'mod', 'mods', 'of', 'on', 'or', 'that', 'the', 'their', 'this', 'to', 'with', 'windows']);
const SEARCH_CONCEPTS = [{
  key: 'taskbar',
  label: 'Taskbar',
  queryText: 'taskbar',
  terms: ['taskbar', 'tray', 'system tray', 'notification area', 'clock', 'quick settings'],
  processes: ['explorer.exe']
}, {
  key: 'explorer',
  label: 'Explorer',
  queryText: 'explorer',
  terms: ['explorer', 'file explorer', 'folder', 'folders', 'files', 'shell'],
  processes: ['explorer.exe']
}, {
  key: 'context-menu',
  label: 'Context menu',
  queryText: 'context menu',
  terms: ['context menu', 'context menus', 'right click', 'right-click', 'shell menu'],
  processes: ['explorer.exe']
}, {
  key: 'start-menu',
  label: 'Start menu',
  queryText: 'start menu',
  terms: ['start menu', 'launcher', 'windows search', 'start button', 'search panel'],
  processes: ['explorer.exe', 'startmenuexperiencehost.exe', 'searchhost.exe']
}, {
  key: 'notifications',
  label: 'Notifications',
  queryText: 'notifications',
  terms: ['notifications', 'notification center', 'action center', 'toast', 'toasts', 'quick settings', 'focus assist'],
  processes: ['explorer.exe', 'shellexperiencehost.exe']
}, {
  key: 'virtual-desktops',
  label: 'Virtual desktops',
  queryText: 'virtual desktops',
  terms: ['virtual desktop', 'virtual desktops', 'task view', 'desktop switcher', 'workspace', 'workspaces'],
  processes: ['dwm.exe', 'explorer.exe']
}, {
  key: 'desktop',
  label: 'Desktop',
  queryText: 'desktop',
  terms: ['desktop', 'icons', 'wallpaper', 'background'],
  processes: ['explorer.exe']
}, {
  key: 'window-management',
  label: 'Window management',
  queryText: 'window management',
  terms: ['window', 'windows', 'title bar', 'titlebar', 'caption', 'resize', 'snap', 'maximize', 'minimize'],
  processes: ['dwm.exe', 'explorer.exe']
}, {
  key: 'alt-tab',
  label: 'Alt+Tab',
  queryText: 'alt tab',
  terms: ['alt tab', 'task switcher', 'window switcher', 'switcher', 'switch between windows'],
  processes: ['dwm.exe', 'explorer.exe']
}, {
  key: 'widgets',
  label: 'Widgets',
  queryText: 'widgets',
  terms: ['widgets', 'widget', 'feed', 'news feed', 'dashboard', 'board'],
  processes: ['widgets.exe', 'explorer.exe']
}, {
  key: 'appearance',
  label: 'Appearance',
  queryText: 'appearance',
  terms: ['theme', 'style', 'visual', 'appearance', 'dark mode', 'light mode', 'accent', 'transparent', 'transparency'],
  processes: []
}, {
  key: 'input',
  label: 'Input',
  queryText: 'input',
  terms: ['keyboard', 'mouse', 'hotkey', 'shortcut', 'scroll', 'touchpad'],
  processes: []
}, {
  key: 'audio',
  label: 'Audio',
  queryText: 'audio',
  terms: ['audio', 'sound', 'volume', 'speaker', 'microphone'],
  processes: ['sndvol.exe']
}, {
  key: 'performance',
  label: 'Performance',
  queryText: 'performance',
  terms: ['performance', 'latency', 'fast', 'faster', 'memory', 'cpu'],
  processes: []
}];
const DISCOVERY_MISSIONS = [{
  key: 'taskbar-flow',
  title: 'Sharpen taskbar flow',
  description: 'Start from taskbar-focused mods, then branch into tray and clock refinements.',
  researchCue: 'Compare a small set first, then refine instead of stacking unrelated tweaks.',
  query: 'taskbar',
  sortingOrder: 'smart-relevance',
  followUpQueries: ['tray', 'clock', 'start menu'],
  verificationChecks: ['Check primary and secondary monitor behavior before keeping the change.', 'Verify pinned apps, overflow area, and taskbar labels after Explorer reloads.', 'Keep one rollback path in case explorer.exe behavior changes in your build.']
}, {
  key: 'notification-calm',
  title: 'Calm notifications',
  description: 'Use notification-centered mods to reduce interruption cost and noisy shell surfaces.',
  researchCue: 'Prefer focused interventions with explicit review steps over one broad shell change.',
  query: 'notifications',
  sortingOrder: 'smart-relevance',
  followUpQueries: ['quick settings', 'toast', 'focus assist'],
  verificationChecks: ['Trigger a real toast and confirm the experience is quieter without losing critical alerts.', 'Check quick settings and shell surfaces that share notification infrastructure.', 'Review changelog notes for Windows build-specific shell regressions before enabling long term.']
}, {
  key: 'explorer-focus',
  title: 'Tighten Explorer workflow',
  description: 'Begin with Explorer mods, then narrow toward context menu, desktop, or file-flow changes.',
  researchCue: 'Keep the search wide enough to discover options, but validate one workflow at a time.',
  query: 'explorer',
  sortingOrder: 'smart-relevance',
  followUpQueries: ['context menu', 'desktop', 'folders'],
  verificationChecks: ['Test the exact file and folder flow you want to improve, not just a screenshot path.', 'Verify right-click menus and drag-drop behavior after any shell tweak.', 'Check whether the mod targets only explorer.exe or reaches other shell processes too.']
}, {
  key: 'window-flow',
  title: 'Refine window movement',
  description: 'Compare window-management mods, then drill into Alt+Tab, snapping, or title-bar behavior.',
  researchCue: 'Use the first pass to shortlist candidates, then validate the risky interactions manually.',
  query: 'window management',
  sortingOrder: 'smart-relevance',
  followUpQueries: ['alt tab', 'snap', 'title bar'],
  verificationChecks: ['Exercise snap, maximize, minimize, and virtual desktop flows before keeping the mod.', 'Check for DWM or shell process scope when window chrome behavior changes.', 'Keep logging available for the first live run if the mod adjusts window lifecycle events.']
}, {
  key: 'context-menu-cleanup',
  title: 'Clean up context menus',
  description: 'Start with right-click and shell menu mods, then narrow toward desktop or file-flow cleanup.',
  researchCue: 'Reduce menu noise in one workflow first instead of rewriting every shell interaction at once.',
  query: 'context menu',
  sortingOrder: 'smart-relevance',
  followUpQueries: ['desktop', 'explorer', 'right click'],
  verificationChecks: ['Test file, folder, and desktop right-click flows separately before keeping the mod.', 'Verify drag-drop and Open with behavior after any shell menu customization.', 'Keep one unmodified path available in case the menu change hides a needed command.']
}, {
  key: 'desktop-calm',
  title: 'Polish the desktop surface',
  description: 'Compare desktop-focused mods, then branch into icons, wallpapers, and right-click behavior.',
  researchCue: 'Use one visible desktop workflow as the benchmark before stacking broader shell tweaks.',
  query: 'desktop',
  sortingOrder: 'smart-relevance',
  followUpQueries: ['icons', 'wallpaper', 'context menu'],
  verificationChecks: ['Check empty-desktop, icon, and wallpaper behavior separately because they often use different hooks.', 'Reload Explorer once before treating the visual result as stable.', 'Confirm multi-monitor desktops still behave as expected after the change.']
}, {
  key: 'app-switching',
  title: 'Streamline app switching',
  description: 'Start with Alt+Tab and task switching mods, then validate virtual desktops and snap flow together.',
  researchCue: 'Treat switching, snapping, and desktop changes as one movement loop, but verify each step separately.',
  query: 'alt tab',
  sortingOrder: 'smart-relevance',
  followUpQueries: ['virtual desktops', 'window management', 'snap'],
  verificationChecks: ['Exercise Alt+Tab, Win+Tab, and virtual desktop shortcuts before keeping the mod.', 'Check whether DWM involvement makes the behavior build-sensitive on your Windows version.', 'Verify app switching while full-screen and multi-monitor windows are open.']
}];
function modDiscovery_normalizeProcessName(process) {
  return process.includes('\\') ? process.substring(process.lastIndexOf('\\') + 1) : process;
}
function normalizeText(value) {
  return value.toLowerCase().replace(/[^a-z0-9.]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function normalizeToken(token) {
  if (token.endsWith('.exe')) {
    return token;
  }
  if (token.length > 4) {
    if (token.endsWith('ies')) {
      return token.slice(0, -3) + 'y';
    }
    if (token.endsWith('s') && !token.endsWith('ss')) {
      return token.slice(0, -1);
    }
  }
  return token;
}
function tokenize(value) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return [];
  }
  return normalized.split(' ').map(token => normalizeToken(token)).filter(token => token.length > 1 && !STOP_WORDS.has(token));
}
function unique(values) {
  return Array.from(new Set(values));
}
function levenshteinDistance(a, b) {
  if (a === b) {
    return 0;
  }
  if (a.length === 0) {
    return b.length;
  }
  if (b.length === 0) {
    return a.length;
  }
  const previous = new Array(b.length + 1).fill(0);
  const current = new Array(b.length + 1).fill(0);
  for (let j = 0; j <= b.length; j++) {
    previous[j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    current[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + substitutionCost);
    }
    for (let j = 0; j <= b.length; j++) {
      previous[j] = current[j];
    }
  }
  return previous[b.length];
}
function fuzzySimilarity(queryToken, candidateToken) {
  if (queryToken.length < 4 || candidateToken.length < 4 || Math.abs(queryToken.length - candidateToken.length) > 2) {
    return 0;
  }
  const distance = levenshteinDistance(queryToken, candidateToken);
  const maxLength = Math.max(queryToken.length, candidateToken.length);
  return 1 - distance / maxLength;
}
function bestTokenMatchScore(queryToken, tokens, value) {
  if (tokens.length === 0 && !value) {
    return 0;
  }
  if (tokens.includes(queryToken)) {
    return 1;
  }
  for (const token of tokens) {
    if (token.startsWith(queryToken) || queryToken.startsWith(token) && token.length >= 4) {
      return 0.82;
    }
  }
  if (value.includes(queryToken) && queryToken.length >= 3) {
    return 0.68;
  }
  let bestFuzzyScore = 0;
  for (const token of tokens) {
    const similarity = fuzzySimilarity(queryToken, token);
    if (similarity >= 0.85) {
      bestFuzzyScore = Math.max(bestFuzzyScore, 0.62);
    } else if (similarity >= 0.75) {
      bestFuzzyScore = Math.max(bestFuzzyScore, 0.48);
    }
  }
  return bestFuzzyScore;
}
function matchesConcept(queryValue, concept) {
  if (!queryValue) {
    return false;
  }
  if (queryValue === concept.key || queryValue === normalizeText(concept.label)) {
    return true;
  }
  return concept.terms.some(term => {
    const normalizedTerm = normalizeText(term);
    return queryValue.includes(normalizedTerm) || normalizedTerm.includes(queryValue);
  });
}
function inferConcepts(metadata, modId) {
  const title = metadata.name || '';
  const description = metadata.description || '';
  const author = metadata.author || '';
  const processes = unique((metadata.include || []).filter(process => process && !process.includes('*') && !process.includes('?')).map(process => modDiscovery_normalizeProcessName(process).toLowerCase()));
  const searchableText = normalizeText([title, description, author, modId, ...processes].join(' '));
  return SEARCH_CONCEPTS.filter(concept => {
    const termMatch = concept.terms.some(term => searchableText.includes(normalizeText(term)));
    const processMatch = concept.processes.some(process => {
      if (!processes.includes(process)) {
        return false;
      }

      // explorer.exe is too broad to imply every shell sub-domain on its own.
      if (process === 'explorer.exe' && ['taskbar', 'context-menu', 'start-menu', 'notifications', 'desktop', 'window-management'].includes(concept.key)) {
        return termMatch;
      }
      if (process === 'dwm.exe' && ['window-management', 'alt-tab'].includes(concept.key)) {
        return termMatch;
      }
      return true;
    });
    return processMatch || termMatch;
  });
}
function buildQueryProfile(query) {
  const normalized = normalizeText(query);
  const tokens = unique(tokenize(query));
  const concepts = SEARCH_CONCEPTS.filter(concept => matchesConcept(normalized, concept) || tokens.some(token => matchesConcept(token, concept)));
  const expandedTokens = unique(concepts.flatMap(concept => [...concept.terms.flatMap(term => tokenize(term)), ...concept.processes.flatMap(process => tokenize(process))])).filter(token => !tokens.includes(token));
  return {
    raw: query.trim(),
    normalized,
    tokens,
    concepts,
    expandedTokens
  };
}
function buildModProfile(modId, mod) {
  const metadata = mod.repository.metadata;
  const title = normalizeText(metadata.name || modId);
  const description = normalizeText(metadata.description || '');
  const author = normalizeText(metadata.author || '');
  const processes = unique((metadata.include || []).filter(process => process && !process.includes('*') && !process.includes('?')).map(process => modDiscovery_normalizeProcessName(process).toLowerCase()));
  const concepts = inferConcepts(metadata, modId);
  return {
    title,
    titleTokens: unique(tokenize(title)),
    id: normalizeText(modId),
    idTokens: unique(tokenize(modId)),
    description,
    descriptionTokens: unique(tokenize(description)),
    author,
    authorTokens: unique(tokenize(author)),
    processes,
    processTokens: unique(processes.flatMap(process => tokenize(process))),
    concepts,
    searchableText: normalizeText([metadata.name || modId, metadata.description || '', metadata.author || '', modId, ...processes, ...concepts.map(concept => concept.label), ...concepts.flatMap(concept => concept.terms)].join(' ')),
    fields: [{
      key: 'title',
      weight: 7,
      value: title,
      tokens: unique(tokenize(title))
    }, {
      key: 'id',
      weight: 6,
      value: normalizeText(modId),
      tokens: unique(tokenize(modId))
    }, {
      key: 'description',
      weight: 4,
      value: description,
      tokens: unique(tokenize(description))
    }, {
      key: 'author',
      weight: 2,
      value: author,
      tokens: unique(tokenize(author))
    }, {
      key: 'process',
      weight: 4,
      value: normalizeText(processes.join(' ')),
      tokens: unique(processes.flatMap(process => tokenize(process)))
    }]
  };
}
function buildSearchVocabulary(mods) {
  const vocabulary = new Map();
  const addTokens = (tokens, weight) => {
    for (const token of tokens) {
      vocabulary.set(token, (vocabulary.get(token) || 0) + weight);
    }
  };
  addTokens(SEARCH_CONCEPTS.flatMap(concept => tokenize(concept.label)), 2.2);
  addTokens(SEARCH_CONCEPTS.flatMap(concept => concept.terms.flatMap(term => tokenize(term))), 1.8);
  addTokens(SEARCH_CONCEPTS.flatMap(concept => concept.processes.flatMap(process => tokenize(process))), 2);
  for (const [modId, mod] of mods) {
    const profile = buildModProfile(modId, mod);
    addTokens(profile.titleTokens, 3.2);
    addTokens(profile.idTokens, 2.9);
    addTokens(profile.descriptionTokens, 1.2);
    addTokens(profile.authorTokens, 0.8);
    addTokens(profile.processTokens, 2.4);
    addTokens(profile.concepts.flatMap(concept => tokenize(concept.label)), 1.7);
  }
  return Array.from(vocabulary.entries()).map(([token, weight]) => ({
    token,
    weight
  })).sort((a, b) => b.weight - a.weight || a.token.localeCompare(b.token));
}
function getTokenCorrection(token, vocabulary) {
  if (token.length < 4) {
    return null;
  }
  const exactMatch = vocabulary.find(candidate => candidate.token === token);
  if (exactMatch) {
    return null;
  }
  let bestCandidate = null;
  for (const candidate of vocabulary) {
    if (Math.abs(candidate.token.length - token.length) > 2) {
      continue;
    }
    const similarity = fuzzySimilarity(token, candidate.token);
    if (similarity < 0.75) {
      continue;
    }
    let score = similarity + Math.min(candidate.weight / 20, 0.18);
    if (candidate.token.startsWith(token.slice(0, Math.min(3, token.length))) || token.startsWith(candidate.token.slice(0, Math.min(3, candidate.token.length)))) {
      score += 0.04;
    }
    if (!bestCandidate || score > bestCandidate.score) {
      bestCandidate = {
        token: candidate.token,
        score
      };
    }
  }
  if (!bestCandidate || bestCandidate.score < 0.84) {
    return null;
  }
  return bestCandidate;
}
function buildRelaxedQueries(query) {
  const tokens = tokenize(query);
  if (tokens.length <= 1) {
    return [];
  }
  return tokens.map((_, index) => tokens.filter((__, tokenIndex) => tokenIndex !== index).join(' ')).filter(candidate => candidate.length > 0);
}
function compareAlphabetical([modIdA, modA], [modIdB, modB]) {
  const modATitle = (modA.repository.metadata.name || modIdA).toLowerCase();
  const modBTitle = (modB.repository.metadata.name || modIdB).toLowerCase();
  if (modATitle < modBTitle) {
    return -1;
  }
  if (modATitle > modBTitle) {
    return 1;
  }
  if (modIdA < modIdB) {
    return -1;
  }
  if (modIdA > modIdB) {
    return 1;
  }
  return 0;
}
function compareBySortOrder(a, b, sortingOrder) {
  const [, modA] = a;
  const [, modB] = b;
  switch (sortingOrder) {
    case 'popular-top-rated':
      if (modB.repository.details.defaultSorting !== modA.repository.details.defaultSorting) {
        return modB.repository.details.defaultSorting - modA.repository.details.defaultSorting;
      }
      break;
    case 'popular':
      if (modB.repository.details.users !== modA.repository.details.users) {
        return modB.repository.details.users - modA.repository.details.users;
      }
      break;
    case 'top-rated':
      if (modB.repository.details.rating !== modA.repository.details.rating) {
        return modB.repository.details.rating - modA.repository.details.rating;
      }
      break;
    case 'newest':
      if (modB.repository.details.published !== modA.repository.details.published) {
        return modB.repository.details.published - modA.repository.details.published;
      }
      break;
    case 'last-updated':
      if (modB.repository.details.updated !== modA.repository.details.updated) {
        return modB.repository.details.updated - modA.repository.details.updated;
      }
      break;
    case 'alphabetical':
      break;
  }
  return compareAlphabetical(a, b);
}
function qualityScore(details) {
  const popularity = Math.min(1, Math.log10(details.users + 10) / 5);
  const rating = Math.min(1, details.rating / 10);
  const recencyDays = Math.max(0, (Date.now() - details.updated) / (1000 * 60 * 60 * 24));
  const recency = 1 / (1 + recencyDays / 180);
  const defaultRanking = Math.min(1, details.defaultSorting / 100);
  return popularity * 0.35 + rating * 0.3 + recency * 0.2 + defaultRanking * 0.15;
}
function buildInsightLabel(fieldKey, mod) {
  switch (fieldKey) {
    case 'title':
      return 'Name match';
    case 'id':
      return 'ID match';
    case 'description':
      return 'Description match';
    case 'author':
      return mod.author ? `Author: ${mod.author}` : 'Author match';
    case 'process':
      return mod.processes[0] ? `Process: ${mod.processes[0]}` : 'Process match';
  }
}
function buildBrowseInsights(mod, modProfile) {
  const insightScores = new Map();
  const quality = qualityScore(mod.repository.details);
  const updatedDays = (Date.now() - mod.repository.details.updated) / (1000 * 60 * 60 * 24);
  const includesWildcards = (mod.repository.metadata.include || []).some(entry => entry.includes('*') || entry.includes('?'));
  if (quality >= 0.82) {
    insightScores.set('Community favorite', 0.69);
  } else if (quality >= 0.68) {
    insightScores.set('Popular', 0.63);
  }
  if (mod.repository.details.rating >= 8.5) {
    insightScores.set('Highly rated', 1.1);
  }
  if (updatedDays <= 45) {
    insightScores.set('Fresh update', 1.05);
  } else if (updatedDays <= 120) {
    insightScores.set('Recently updated', 0.8);
  }
  if (modProfile.concepts.length > 0) {
    insightScores.set(modProfile.concepts[0].label, 0.76);
  }
  if (includesWildcards) {
    insightScores.set('Broad reach', 0.62);
  } else if (modProfile.processes.length === 1) {
    insightScores.set(`Targets ${modProfile.processes[0]}`, 0.58);
  }
  if (mod.installed) {
    insightScores.set('Installed already', 0.54);
  }
  return Array.from(insightScores.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 3).map(([label]) => label);
}
function scoreModAgainstQuery(modId, mod, query) {
  const modProfile = buildModProfile(modId, mod);
  if (!query.tokens.length && !query.normalized) {
    return {
      modId,
      mod,
      discoveryScore: qualityScore(mod.repository.details),
      insights: buildBrowseInsights(mod, modProfile),
      inferredConcepts: modProfile.concepts.map(concept => concept.label)
    };
  }
  let rawTokenScore = 0;
  let matchedTokenWeight = 0;
  const insightScores = new Map();
  let typoMatched = false;
  for (const token of query.tokens) {
    let bestScore = 0;
    let bestField = null;
    for (const field of modProfile.fields) {
      const matchScore = bestTokenMatchScore(token, field.tokens, field.value);
      const weightedScore = matchScore * field.weight;
      if (weightedScore > bestScore) {
        bestScore = weightedScore;
        bestField = field;
      }
      if (matchScore >= 0.48 && matchScore < 0.68) {
        typoMatched = true;
      }
    }
    if (bestScore > 0) {
      rawTokenScore += bestScore;
      matchedTokenWeight += Math.min(1, bestScore / 5);
      if (bestField) {
        const label = buildInsightLabel(bestField.key, modProfile);
        insightScores.set(label, (insightScores.get(label) || 0) + bestScore);
      }
    }
  }
  let expansionScore = 0;
  for (const token of query.expandedTokens) {
    let bestExpandedScore = 0;
    for (const field of modProfile.fields) {
      bestExpandedScore = Math.max(bestExpandedScore, bestTokenMatchScore(token, field.tokens, field.value) * field.weight * 0.3);
    }
    expansionScore += bestExpandedScore;
  }
  const phraseMatch = query.normalized.length >= 3 && modProfile.searchableText.includes(query.normalized);
  if (phraseMatch) {
    rawTokenScore += 3.2;
    matchedTokenWeight += 1;
    insightScores.set('Phrase match', (insightScores.get('Phrase match') || 0) + 3.2);
  }
  const sharedConcepts = modProfile.concepts.filter(concept => query.concepts.some(queryConcept => queryConcept.key === concept.key));
  let conceptScore = 0;
  for (const concept of sharedConcepts) {
    conceptScore += 2.2;
    insightScores.set(concept.label, (insightScores.get(concept.label) || 0) + 2.2);
  }
  const coverageTarget = Math.max(1, query.tokens.length);
  const coverage = matchedTokenWeight / coverageTarget;
  const hasMeaningfulMatch = phraseMatch || coverage >= (query.tokens.length <= 1 ? 0.3 : 0.55) || sharedConcepts.length > 0 && coverage >= 0.25;
  if (!hasMeaningfulMatch) {
    return null;
  }
  const quality = qualityScore(mod.repository.details);
  const finalScore = rawTokenScore * 0.72 + expansionScore * 0.1 + conceptScore * 0.1 + quality * 1.4 + (mod.installed ? 0.2 : 0);
  if (quality > 0.72) {
    insightScores.set('Popular', (insightScores.get('Popular') || 0) + quality * 0.8);
  }
  if (mod.repository.details.rating >= 8) {
    insightScores.set('Highly rated', (insightScores.get('Highly rated') || 0) + mod.repository.details.rating / 10);
  }
  const recentlyUpdatedDays = (Date.now() - mod.repository.details.updated) / (1000 * 60 * 60 * 24);
  if (recentlyUpdatedDays <= 120) {
    insightScores.set('Recently updated', (insightScores.get('Recently updated') || 0) + 0.8);
  }
  if (typoMatched) {
    insightScores.set('Fuzzy match', (insightScores.get('Fuzzy match') || 0) + 0.4);
  }
  const insights = Array.from(insightScores.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 3).map(([label]) => label);
  if (typoMatched && !insights.includes('Fuzzy match')) {
    if (insights.length < 3) {
      insights.push('Fuzzy match');
    } else {
      insights[insights.length - 1] = 'Fuzzy match';
    }
  }
  return {
    modId,
    mod,
    discoveryScore: finalScore,
    insights,
    inferredConcepts: modProfile.concepts.map(concept => concept.label)
  };
}
function diversifyTopResults(results) {
  if (results.length <= 2) {
    return results;
  }
  const reranked = [];
  const remaining = [...results];
  const seenAuthors = new Map();
  const seenProcesses = new Map();
  const seenConcepts = new Map();

  // Apply a lightweight MMR-style penalty so the first screen is less dominated
  // by one author or one process cluster.
  while (remaining.length > 0 && reranked.length < Math.min(40, results.length)) {
    var _selected$mod$reposit;
    let bestIndex = 0;
    let bestScore = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < remaining.length; i++) {
      var _candidate$mod$reposi;
      const candidate = remaining[i];
      const _author = ((_candidate$mod$reposi = candidate.mod.repository.metadata.author) == null ? void 0 : _candidate$mod$reposi.toLowerCase()) || '';
      const processes = (candidate.mod.repository.metadata.include || []).filter(process => process && !process.includes('*') && !process.includes('?')).map(process => modDiscovery_normalizeProcessName(process).toLowerCase());
      let penalty = 0;
      if (_author) {
        penalty += (seenAuthors.get(_author) || 0) * 0.55;
      }
      for (const process of processes) {
        penalty += (seenProcesses.get(process) || 0) * 0.22;
      }
      for (const concept of candidate.inferredConcepts) {
        penalty += (seenConcepts.get(concept) || 0) * 0.12;
      }
      const adjustedScore = candidate.discoveryScore - penalty;
      if (adjustedScore > bestScore) {
        bestScore = adjustedScore;
        bestIndex = i;
      }
    }
    const [selected] = remaining.splice(bestIndex, 1);
    reranked.push(selected);
    const author = ((_selected$mod$reposit = selected.mod.repository.metadata.author) == null ? void 0 : _selected$mod$reposit.toLowerCase()) || '';
    if (author) {
      seenAuthors.set(author, (seenAuthors.get(author) || 0) + 1);
    }
    for (const process of selected.mod.repository.metadata.include || []) {
      if (!process || process.includes('*') || process.includes('?')) {
        continue;
      }
      const normalizedProcess = modDiscovery_normalizeProcessName(process).toLowerCase();
      seenProcesses.set(normalizedProcess, (seenProcesses.get(normalizedProcess) || 0) + 1);
    }
    for (const concept of selected.inferredConcepts) {
      seenConcepts.set(concept, (seenConcepts.get(concept) || 0) + 1);
    }
  }
  if (remaining.length === 0) {
    return reranked;
  }
  return [...reranked, ...remaining.sort((a, b) => {
    if (b.discoveryScore !== a.discoveryScore) {
      return b.discoveryScore - a.discoveryScore;
    }
    return compareAlphabetical([a.modId, a.mod], [b.modId, b.mod]);
  })];
}
function getDiscoveryMissions() {
  return DISCOVERY_MISSIONS;
}
function getDiscoveryMissionByQuery(query, sortingOrder) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return null;
  }
  return DISCOVERY_MISSIONS.find(mission => normalizeText(mission.query) === normalizedQuery && mission.sortingOrder === sortingOrder) || null;
}
function buildDiscoveryMissionCandidates(rankedMods) {
  return rankedMods.slice(0, 3).map(candidate => {
    const metadata = candidate.mod.repository.metadata;
    const details = candidate.mod.repository.details;
    return {
      modId: candidate.modId,
      displayName: metadata.name || candidate.modId,
      author: metadata.author || 'Unknown author',
      insightSummary: candidate.insights.length > 0 ? candidate.insights.join(' | ') : 'No extra signals yet',
      communitySummary: `${details.users.toLocaleString()} users | ${(details.rating / 2).toFixed(1)}/5`
    };
  });
}
function buildDiscoveryMissionBrief(mission, rankedMods) {
  const topCandidates = rankedMods.slice(0, 4);
  const topCandidateLines = topCandidates.length > 0 ? topCandidates.map((candidate, index) => {
    const displayName = candidate.mod.repository.metadata.name || candidate.modId;
    const insightSummary = candidate.insights.length > 0 ? candidate.insights.join(', ') : 'No extra signals';
    return `${index + 1}. ${displayName} (${candidate.modId}) - ${insightSummary}`;
  }) : ['1. No ranked mods were available for this mission yet.'];
  return `Help me compare Windhawk mods for a Windows customization mission.
Mission: ${mission.title}
Goal: ${mission.description}
Starting query: ${mission.query}
Suggested follow-up queries: ${mission.followUpQueries.join(', ')}
Manual verification priorities:
- ${mission.verificationChecks.join('\n- ')}
Top candidate mods:
${topCandidateLines.join('\n')}
Output:
1. The best 1-2 mods to try first and why
2. Tradeoffs, process scope, and compatibility risks
3. A short manual validation plan before keeping the change`;
}
function rankMods(mods, query, sortingOrder) {
  if (!query.trim()) {
    const fallbackSortingOrder = sortingOrder === 'smart-relevance' ? 'popular-top-rated' : sortingOrder;
    return [...mods].sort((a, b) => compareBySortOrder(a, b, fallbackSortingOrder)).map(([modId, mod]) => {
      const profile = buildModProfile(modId, mod);
      return {
        modId,
        mod,
        discoveryScore: qualityScore(mod.repository.details),
        insights: buildBrowseInsights(mod, profile),
        inferredConcepts: profile.concepts.map(concept => concept.label)
      };
    });
  }
  const queryProfile = buildQueryProfile(query);
  const matched = mods.map(([modId, mod]) => scoreModAgainstQuery(modId, mod, queryProfile)).filter(item => item !== null);
  if (sortingOrder !== 'smart-relevance') {
    return matched.sort((a, b) => compareBySortOrder([a.modId, a.mod], [b.modId, b.mod], sortingOrder));
  }
  const ranked = matched.sort((a, b) => {
    if (b.discoveryScore !== a.discoveryScore) {
      return b.discoveryScore - a.discoveryScore;
    }
    return compareAlphabetical([a.modId, a.mod], [b.modId, b.mod]);
  });
  return diversifyTopResults(ranked);
}
function getSearchCorrection(mods, query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return null;
  }
  const tokens = tokenize(query);
  if (tokens.length === 0) {
    return null;
  }
  const vocabulary = buildSearchVocabulary(mods);
  let correctedTokens = 0;
  const correctedQuery = tokens.map(token => {
    const correction = getTokenCorrection(token, vocabulary);
    if (!correction) {
      return token;
    }
    correctedTokens++;
    return correction.token;
  }).join(' ');
  if (correctedTokens === 0 || correctedQuery === normalizedQuery) {
    return null;
  }
  return {
    correctedQuery,
    correctedTokens
  };
}
function getSearchRecovery(mods, query) {
  if (!query.trim()) {
    return null;
  }
  const rawResults = rankMods(mods, query, 'smart-relevance');
  if (rawResults.length > 0) {
    return null;
  }
  const correction = getSearchCorrection(mods, query);
  const candidateQueries = [];
  if (correction) {
    candidateQueries.push({
      query: correction.correctedQuery,
      reason: 'correction'
    });
  }
  for (const relaxedQuery of buildRelaxedQueries((correction == null ? void 0 : correction.correctedQuery) || query)) {
    candidateQueries.push({
      query: relaxedQuery,
      reason: 'broadened'
    });
  }
  const dedupedCandidates = candidateQueries.filter((candidate, index, candidates) => normalizeText(candidate.query) !== normalizeText(query) && candidates.findIndex(otherCandidate => normalizeText(otherCandidate.query) === normalizeText(candidate.query)) === index);
  let bestRecovery = null;
  let bestRecoveryScore = Number.NEGATIVE_INFINITY;
  for (const candidate of dedupedCandidates) {
    var _results$;
    const results = rankMods(mods, candidate.query, 'smart-relevance');
    if (results.length === 0) {
      continue;
    }
    const topScore = ((_results$ = results[0]) == null ? void 0 : _results$.discoveryScore) || 0;
    const averageTopScore = results.slice(0, 3).reduce((sum, result) => sum + result.discoveryScore, 0) / Math.min(3, results.length);
    const recoveryScore = topScore * 0.7 + averageTopScore * 0.2 + Math.min(6, results.length) * 0.45 + (candidate.reason === 'correction' ? 0.35 : 0);
    if (recoveryScore > bestRecoveryScore) {
      bestRecoveryScore = recoveryScore;
      bestRecovery = {
        suggestedQuery: candidate.query,
        reason: candidate.reason,
        results: results.slice(0, 6)
      };
    }
  }
  return bestRecovery;
}
function getRefinementSuggestions(rankedMods, query) {
  if (!query.trim() || rankedMods.length === 0) {
    return [];
  }
  const queryProfile = buildQueryProfile(query);
  const queryConcepts = new Set(queryProfile.concepts.map(concept => concept.label));
  const topResults = rankedMods.slice(0, 12);
  const conceptCounts = new Map();
  for (const result of topResults) {
    for (const concept of result.inferredConcepts) {
      if (queryConcepts.has(concept)) {
        continue;
      }
      const matchingConcept = SEARCH_CONCEPTS.find(searchConcept => searchConcept.label === concept);
      const queryTextValue = (matchingConcept == null ? void 0 : matchingConcept.queryText) || concept.toLowerCase();
      const existing = conceptCounts.get(concept);
      conceptCounts.set(concept, {
        count: ((existing == null ? void 0 : existing.count) || 0) + 1,
        queryText: queryTextValue
      });
    }
  }
  const processCounts = new Map();
  for (const result of topResults) {
    for (const process of result.mod.repository.metadata.include || []) {
      if (!process || process.includes('*') || process.includes('?')) {
        continue;
      }
      const normalizedProcess = modDiscovery_normalizeProcessName(process).toLowerCase();
      if (queryProfile.normalized.includes(normalizedProcess)) {
        continue;
      }
      processCounts.set(normalizedProcess, (processCounts.get(normalizedProcess) || 0) + 1);
    }
  }
  const conceptSuggestions = Array.from(conceptCounts.entries()).sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0])).slice(0, 3).map(([label, {
    queryText
  }]) => ({
    key: `concept:${label.toLowerCase()}`,
    label,
    queryText
  }));
  const processSuggestions = Array.from(processCounts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 2).map(([process]) => ({
    key: `process:${process}`,
    label: process,
    queryText: process
  }));
  return [...conceptSuggestions, ...processSuggestions].filter((suggestion, index, suggestions) => suggestions.findIndex(candidate => candidate.key === suggestion.key) === index).slice(0, 4);
}
;// ./src/app/panel/ModsBrowserOnline.tsx


















const ModsBrowserOnline_CenteredContainer = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__CenteredContainer",
  componentId: "sc-bax3vf-0"
})(["display:flex;flex-direction:column;height:100%;"]);
const ModsBrowserOnline_CenteredContent = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__CenteredContent",
  componentId: "sc-bax3vf-1"
})(["margin:auto;padding-bottom:10vh;"]);
const ModsBrowserOnline_SearchFilterContainer = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__SearchFilterContainer",
  componentId: "sc-bax3vf-2"
})(["display:flex;gap:10px;margin:20px 0;"]);
const SearchMetaRow = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__SearchMetaRow",
  componentId: "sc-bax3vf-3"
})(["display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:16px;"]);
const SearchSuggestions = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__SearchSuggestions",
  componentId: "sc-bax3vf-4"
})(["display:flex;align-items:center;gap:8px;flex-wrap:wrap;"]);
const SearchActions = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__SearchActions",
  componentId: "sc-bax3vf-5"
})(["display:flex;align-items:center;gap:12px;flex-wrap:wrap;"]);
const SearchMetaText = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(typography/* default */.A.Text).withConfig({
  displayName: "ModsBrowserOnline__SearchMetaText",
  componentId: "sc-bax3vf-6"
})(["color:rgba(255,255,255,0.65);"]);
const DiscoveryPresetsSection = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__DiscoveryPresetsSection",
  componentId: "sc-bax3vf-7"
})(["display:flex;flex-direction:column;gap:12px;margin-bottom:18px;padding:16px;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:rgba(255,255,255,0.02);"]);
const DiscoveryPresetsTitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__DiscoveryPresetsTitle",
  componentId: "sc-bax3vf-8"
})(["font-size:16px;font-weight:600;"]);
const DiscoveryPresetsDescription = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(typography/* default */.A.Text).withConfig({
  displayName: "ModsBrowserOnline__DiscoveryPresetsDescription",
  componentId: "sc-bax3vf-9"
})(["color:rgba(255,255,255,0.65);"]);
const DiscoveryPresetsGrid = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__DiscoveryPresetsGrid",
  componentId: "sc-bax3vf-10"
})(["display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;"]);
const DiscoveryPresetCard = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.button.withConfig({
  displayName: "ModsBrowserOnline__DiscoveryPresetCard",
  componentId: "sc-bax3vf-11"
})(["border:1px solid ", ";border-radius:10px;padding:14px;text-align:left;color:inherit;background:", ";cursor:pointer;transition:border-color 0.15s ease,background 0.15s ease,transform 0.15s ease;&:hover{border-color:rgba(24,144,255,0.45);background:rgba(24,144,255,0.08);transform:translateY(-1px);}"], ({
  $active
}) => $active ? 'rgba(24, 144, 255, 0.55)' : 'rgba(255, 255, 255, 0.08)', ({
  $active
}) => $active ? 'rgba(24, 144, 255, 0.12)' : 'rgba(255, 255, 255, 0.02)');
const DiscoveryPresetLabel = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__DiscoveryPresetLabel",
  componentId: "sc-bax3vf-12"
})(["font-size:15px;font-weight:600;"]);
const DiscoveryPresetDescription = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__DiscoveryPresetDescription",
  componentId: "sc-bax3vf-13"
})(["margin-top:6px;color:rgba(255,255,255,0.7);line-height:1.45;"]);
const DiscoveryPresetMeta = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__DiscoveryPresetMeta",
  componentId: "sc-bax3vf-14"
})(["margin-top:10px;color:rgba(255,255,255,0.58);font-size:12px;text-transform:uppercase;letter-spacing:0.04em;"]);
const DiscoveryMissionsSection = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(DiscoveryPresetsSection).withConfig({
  displayName: "ModsBrowserOnline__DiscoveryMissionsSection",
  componentId: "sc-bax3vf-15"
})(["margin-top:16px;"]);
const DiscoveryMissionsGrid = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__DiscoveryMissionsGrid",
  componentId: "sc-bax3vf-16"
})(["display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px;"]);
const DiscoveryMissionCard = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__DiscoveryMissionCard",
  componentId: "sc-bax3vf-17"
})(["display:flex;flex-direction:column;gap:12px;border:1px solid ", ";border-radius:12px;padding:16px;background:", ";"], ({
  $active
}) => $active ? 'rgba(24, 144, 255, 0.55)' : 'rgba(255, 255, 255, 0.08)', ({
  $active
}) => $active ? 'rgba(24, 144, 255, 0.12)' : 'rgba(255, 255, 255, 0.02)');
const DiscoveryMissionTitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__DiscoveryMissionTitle",
  componentId: "sc-bax3vf-18"
})(["font-size:16px;font-weight:700;"]);
const DiscoveryMissionDescription = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__DiscoveryMissionDescription",
  componentId: "sc-bax3vf-19"
})(["margin-top:6px;color:rgba(255,255,255,0.74);line-height:1.45;"]);
const DiscoveryMissionCue = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__DiscoveryMissionCue",
  componentId: "sc-bax3vf-20"
})(["color:rgba(255,255,255,0.62);line-height:1.45;"]);
const DiscoveryMissionLabel = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__DiscoveryMissionLabel",
  componentId: "sc-bax3vf-21"
})(["color:rgba(255,255,255,0.6);font-size:11px;text-transform:uppercase;letter-spacing:0.04em;"]);
const DiscoveryMissionTokenRow = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__DiscoveryMissionTokenRow",
  componentId: "sc-bax3vf-22"
})(["display:flex;flex-wrap:wrap;gap:8px;"]);
const DiscoveryMissionToken = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.span.withConfig({
  displayName: "ModsBrowserOnline__DiscoveryMissionToken",
  componentId: "sc-bax3vf-23"
})(["border-radius:999px;padding:4px 10px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.85);font-size:12px;"]);
const DiscoveryMissionChecklist = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__DiscoveryMissionChecklist",
  componentId: "sc-bax3vf-24"
})(["display:flex;flex-direction:column;gap:6px;color:rgba(255,255,255,0.72);line-height:1.45;"]);
const DiscoveryMissionChecklistItem = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__DiscoveryMissionChecklistItem",
  componentId: "sc-bax3vf-25"
})(["display:flex;gap:8px;&::before{content:'\u2022';color:rgba(255,255,255,0.5);}"]);
const DiscoveryMissionActions = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__DiscoveryMissionActions",
  componentId: "sc-bax3vf-26"
})(["display:flex;flex-wrap:wrap;gap:8px;"]);
const MissionWorkbenchSection = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(DiscoveryPresetsSection).withConfig({
  displayName: "ModsBrowserOnline__MissionWorkbenchSection",
  componentId: "sc-bax3vf-27"
})(["margin-bottom:20px;"]);
const MissionWorkbenchGrid = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__MissionWorkbenchGrid",
  componentId: "sc-bax3vf-28"
})(["display:grid;grid-template-columns:minmax(0,1.4fr) minmax(280px,1fr);gap:16px;@media (max-width:900px){grid-template-columns:1fr;}"]);
const MissionWorkbenchColumn = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__MissionWorkbenchColumn",
  componentId: "sc-bax3vf-29"
})(["display:flex;flex-direction:column;gap:12px;min-width:0;"]);
const MissionWorkbenchCard = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__MissionWorkbenchCard",
  componentId: "sc-bax3vf-30"
})(["border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);"]);
const MissionWorkbenchTitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__MissionWorkbenchTitle",
  componentId: "sc-bax3vf-31"
})(["font-size:16px;font-weight:700;"]);
const MissionWorkbenchDescription = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__MissionWorkbenchDescription",
  componentId: "sc-bax3vf-32"
})(["margin-top:6px;color:rgba(255,255,255,0.72);line-height:1.45;"]);
const MissionWorkbenchMeta = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__MissionWorkbenchMeta",
  componentId: "sc-bax3vf-33"
})(["margin-top:10px;color:rgba(255,255,255,0.58);font-size:12px;text-transform:uppercase;letter-spacing:0.04em;"]);
const MissionWorkbenchCandidates = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__MissionWorkbenchCandidates",
  componentId: "sc-bax3vf-34"
})(["display:grid;gap:12px;"]);
const MissionWorkbenchCandidate = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__MissionWorkbenchCandidate",
  componentId: "sc-bax3vf-35"
})(["border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);"]);
const MissionWorkbenchCandidateTitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__MissionWorkbenchCandidateTitle",
  componentId: "sc-bax3vf-36"
})(["font-size:15px;font-weight:700;"]);
const MissionWorkbenchCandidateMeta = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__MissionWorkbenchCandidateMeta",
  componentId: "sc-bax3vf-37"
})(["margin-top:4px;color:rgba(255,255,255,0.6);line-height:1.4;"]);
const MissionWorkbenchCandidateInsights = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__MissionWorkbenchCandidateInsights",
  componentId: "sc-bax3vf-38"
})(["margin-top:8px;color:rgba(255,255,255,0.76);line-height:1.45;"]);
const ModsBrowserOnline_SearchFilterInput = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(InputWithContextMenu).withConfig({
  displayName: "ModsBrowserOnline__SearchFilterInput",
  componentId: "sc-bax3vf-39"
})(["> .ant-input-prefix{margin-inline-end:8px;}"]);
const ModsBrowserOnline_IconButton = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(es_button/* default */.A).withConfig({
  displayName: "ModsBrowserOnline__IconButton",
  componentId: "sc-bax3vf-40"
})(["padding-inline-start:0;padding-inline-end:0;min-width:40px;"]);
const ModsBrowserOnline_ModsContainer = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__ModsContainer",
  componentId: "sc-bax3vf-41"
})(["", ""], ({
  $extraBottomPadding
}) => (0,styled_components_browser_esm/* css */.AH)(["padding-bottom:", "px;"], $extraBottomPadding ? 70 : 20));
const ResultsMessageWrapper = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__ResultsMessageWrapper",
  componentId: "sc-bax3vf-42"
})(["margin-top:85px;"]);
const RecoveryContainer = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__RecoveryContainer",
  componentId: "sc-bax3vf-43"
})(["display:flex;flex-direction:column;gap:20px;"]);
const ModsBrowserOnline_ModsGrid = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "ModsBrowserOnline__ModsGrid",
  componentId: "sc-bax3vf-44"
})(["display:grid;grid-template-columns:repeat( auto-fill,calc(min(400px - 20px * 4 / 3,100%)) );gap:20px;justify-content:center;"]);
const ModsBrowserOnline_ProgressSpin = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(spin/* default */.A).withConfig({
  displayName: "ModsBrowserOnline__ProgressSpin",
  componentId: "sc-bax3vf-45"
})(["display:block;margin-inline-start:auto;margin-inline-end:auto;font-size:32px;"]);
const FilterItemLabelWrapper = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.span.withConfig({
  displayName: "ModsBrowserOnline__FilterItemLabelWrapper",
  componentId: "sc-bax3vf-46"
})(["display:flex;justify-content:space-between;align-items:center;gap:12px;"]);
const FilterItemLabel = ({
  label,
  count
}) => /*#__PURE__*/(0,jsx_runtime.jsxs)(FilterItemLabelWrapper, {
  children: [/*#__PURE__*/(0,jsx_runtime.jsx)("span", {
    children: label
  }), count !== undefined && /*#__PURE__*/(0,jsx_runtime.jsx)(es_badge/* default */.A, {
    count: count,
    color: "rgba(255, 255, 255, 0.08)",
    style: {
      color: 'rgba(255, 255, 255, 0.65)',
      boxShadow: 'none',
      height: '18px',
      lineHeight: '18px',
      minWidth: '18px',
      padding: '0 6px'
    }
  })]
});
const extractItemsWithCounts = (repositoryMods, keyPrefix, extractItems) => {
  if (!repositoryMods) {
    return [];
  }
  const itemCounts = new Map();
  for (const mod of Object.values(repositoryMods)) {
    const items = extractItems(mod);
    for (const item of items) {
      if (!item) {
        continue;
      }
      const lowerItem = item.toLowerCase();
      const existing = itemCounts.get(lowerItem);
      if (existing) {
        existing.count++;
        const casingCount = existing.casings.get(item);
        existing.casings.set(item, (casingCount || 0) + 1);
      } else {
        const casings = new Map();
        casings.set(item, 1);
        itemCounts.set(lowerItem, {
          count: 1,
          casings
        });
      }
    }
  }
  return Array.from(itemCounts.entries()).map(([lowerName, {
    count,
    casings
  }]) => {
    // Find the most common casing, or first lexicographically if tied
    const displayName = Array.from(casings.entries()).reduce((best, [casing, casingCount]) => {
      if (casingCount > best.count || casingCount === best.count && casing < best.casing) {
        return {
          casing,
          count: casingCount
        };
      }
      return best;
    }, {
      casing: '',
      count: 0
    }).casing;
    return {
      name: displayName,
      count,
      key: `${keyPrefix}:${lowerName}`,
      lowerName
    };
  }).sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return a.lowerName.localeCompare(b.lowerName);
  });
};
const extractAuthorsWithCounts = repositoryMods => {
  return extractItemsWithCounts(repositoryMods, 'author', mod => mod.repository.metadata.author ? [mod.repository.metadata.author] : []);
};
const extractProcessesWithCounts = repositoryMods => {
  return extractItemsWithCounts(repositoryMods, 'process', mod => {
    const processes = mod.repository.metadata.include || [];
    const validProcesses = [];
    for (const process of processes) {
      if (!process) {
        continue;
      }

      // Include "*" as-is
      if (process === '*') {
        validProcesses.push('*');
      } else if (process.includes('*') || process.includes('?')) {
        // Skip other wildcard patterns
        continue;
      } else {
        validProcesses.push(modDiscovery_normalizeProcessName(process));
      }
    }
    return validProcesses;
  });
};
const appendSearchRefinement = (currentQuery, refinement) => {
  const trimmedQuery = currentQuery.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();
  const normalizedRefinement = refinement.trim().toLowerCase();
  if (!normalizedRefinement || normalizedQuery.includes(normalizedRefinement)) {
    return trimmedQuery;
  }
  return trimmedQuery ? `${trimmedQuery} ${refinement}` : refinement;
};
const useFilterState = () => {
  const [filterText, setFilterText] = (0,react.useState)('');
  const [filterOptions, setFilterOptions] = (0,react.useState)(new Set());
  const [filterDropdownOpen, setFilterDropdownOpen] = (0,react.useState)(false);
  const [showAllAuthors, setShowAllAuthors] = (0,react.useState)(false);
  const [showAllProcesses, setShowAllProcesses] = (0,react.useState)(false);
  const handleFilterChange = (0,react.useCallback)(key => {
    setFilterOptions(prevOptions => {
      const newOptions = new Set(prevOptions);

      // Handle mutually exclusive filters for installation status
      if (key === 'installed' && newOptions.has('not-installed')) {
        newOptions.delete('not-installed');
      } else if (key === 'not-installed' && newOptions.has('installed')) {
        newOptions.delete('installed');
      }

      // Toggle the clicked option
      if (newOptions.has(key)) {
        newOptions.delete(key);
      } else {
        newOptions.add(key);
      }
      return newOptions;
    });
  }, []);
  const handleClearFilters = (0,react.useCallback)(() => {
    setFilterOptions(new Set());
    setShowAllAuthors(false);
    setShowAllProcesses(false);
  }, []);
  return {
    filterText,
    setFilterText,
    filterOptions,
    filterDropdownOpen,
    setFilterDropdownOpen,
    showAllAuthors,
    setShowAllAuthors,
    showAllProcesses,
    setShowAllProcesses,
    handleFilterChange,
    handleClearFilters
  };
};
function ModsBrowserOnline({
  ContentWrapper
}) {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const navigate = (0,chunk_LFPYN7LY/* useNavigate */.Zp)();
  const {
    modId: displayedModId
  } = (0,chunk_LFPYN7LY/* useParams */.g)();
  const [initialDataPending, setInitialDataPending] = (0,react.useState)(true);
  const [repositoryMods, setRepositoryMods] = (0,react.useState)(mockModsBrowserOnlineRepositoryMods);
  const [sortingOrder, setSortingOrder] = (0,react.useState)('smart-relevance');

  // Filter state
  const {
    filterText,
    setFilterText,
    filterOptions,
    filterDropdownOpen,
    setFilterDropdownOpen,
    showAllAuthors,
    setShowAllAuthors,
    showAllProcesses,
    setShowAllProcesses,
    handleFilterChange,
    handleClearFilters
  } = useFilterState();

  // Extract filter data
  const authorFilters = (0,react.useMemo)(() => extractAuthorsWithCounts(repositoryMods), [repositoryMods]);
  const processFilters = (0,react.useMemo)(() => extractProcessesWithCounts(repositoryMods), [repositoryMods]);
  const filteredMods = (0,react.useMemo)(() => {
    return Object.entries(repositoryMods || {}).filter(([, mod]) => {
      // Apply category filters - if none selected, show all
      if (filterOptions.size === 0) {
        return true;
      }

      // Collect selected authors and processes
      const selectedAuthors = [];
      const selectedProcesses = [];
      let installedFilter = null;
      for (const key of filterOptions) {
        if (key.startsWith('author:')) {
          selectedAuthors.push(key.substring('author:'.length));
        } else if (key.startsWith('process:')) {
          selectedProcesses.push(key.substring('process:'.length));
        } else if (key === 'installed') {
          installedFilter = true;
        } else if (key === 'not-installed') {
          installedFilter = false;
        }
      }

      // Check installation status filter
      if (installedFilter !== null) {
        const isInstalled = mod.installed !== undefined;
        if (isInstalled !== installedFilter) {
          return false;
        }
      }

      // Check author filter (OR logic within authors)
      if (selectedAuthors.length > 0) {
        var _mod$repository$metad;
        const author = (_mod$repository$metad = mod.repository.metadata.author) == null ? void 0 : _mod$repository$metad.toLowerCase();
        if (!author || !selectedAuthors.some(a => a === author)) {
          return false;
        }
      }

      // Check process filter (OR logic within processes)
      if (selectedProcesses.length > 0) {
        const processes = (mod.repository.metadata.include || []).map(p => modDiscovery_normalizeProcessName(p).toLowerCase()).filter(p => p); // Remove empty strings
        if (!selectedProcesses.some(sp => processes.includes(sp))) {
          return false;
        }
      }
      return true;
    });
  }, [repositoryMods, filterOptions]);
  const rankedMods = (0,react.useMemo)(() => rankMods(filteredMods, filterText, sortingOrder), [filteredMods, filterText, sortingOrder]);
  const searchCorrection = (0,react.useMemo)(() => getSearchCorrection(filteredMods, filterText), [filteredMods, filterText]);
  const correctedRankedMods = (0,react.useMemo)(() => searchCorrection ? rankMods(filteredMods, searchCorrection.correctedQuery, 'smart-relevance') : [], [filteredMods, searchCorrection]);
  const searchRecovery = (0,react.useMemo)(() => rankedMods.length === 0 ? getSearchRecovery(filteredMods, filterText) : null, [filteredMods, filterText, rankedMods.length]);
  const refinementSuggestions = (0,react.useMemo)(() => getRefinementSuggestions(rankedMods, filterText), [rankedMods, filterText]);
  const discoveryPresets = (0,react.useMemo)(() => [{
    key: 'fresh',
    label: t('explore.presets.items.fresh.title'),
    description: t('explore.presets.items.fresh.description'),
    query: '',
    sortingOrder: 'last-updated'
  }, {
    key: 'favorites',
    label: t('explore.presets.items.favorites.title'),
    description: t('explore.presets.items.favorites.description'),
    query: '',
    sortingOrder: 'popular-top-rated'
  }, {
    key: 'taskbar',
    label: t('explore.presets.items.taskbar.title'),
    description: t('explore.presets.items.taskbar.description'),
    query: 'taskbar',
    sortingOrder: 'smart-relevance'
  }, {
    key: 'explorer',
    label: t('explore.presets.items.explorer.title'),
    description: t('explore.presets.items.explorer.description'),
    query: 'explorer',
    sortingOrder: 'smart-relevance'
  }, {
    key: 'start-menu',
    label: t('explore.presets.items.startMenu.title'),
    description: t('explore.presets.items.startMenu.description'),
    query: 'start menu',
    sortingOrder: 'smart-relevance'
  }, {
    key: 'audio',
    label: t('explore.presets.items.audio.title'),
    description: t('explore.presets.items.audio.description'),
    query: 'audio',
    sortingOrder: 'smart-relevance'
  }, {
    key: 'context-menu',
    label: t('explore.presets.items.contextMenu.title'),
    description: t('explore.presets.items.contextMenu.description'),
    query: 'context menu',
    sortingOrder: 'smart-relevance'
  }, {
    key: 'desktop',
    label: t('explore.presets.items.desktop.title'),
    description: t('explore.presets.items.desktop.description'),
    query: 'desktop',
    sortingOrder: 'smart-relevance'
  }, {
    key: 'notifications',
    label: t('explore.presets.items.notifications.title'),
    description: t('explore.presets.items.notifications.description'),
    query: 'notifications',
    sortingOrder: 'smart-relevance'
  }, {
    key: 'window-management',
    label: t('explore.presets.items.windowManagement.title'),
    description: t('explore.presets.items.windowManagement.description'),
    query: 'window management',
    sortingOrder: 'smart-relevance'
  }, {
    key: 'alt-tab',
    label: t('explore.presets.items.altTab.title'),
    description: t('explore.presets.items.altTab.description'),
    query: 'alt tab',
    sortingOrder: 'smart-relevance'
  }, {
    key: 'virtual-desktops',
    label: t('explore.presets.items.virtualDesktops.title'),
    description: t('explore.presets.items.virtualDesktops.description'),
    query: 'virtual desktops',
    sortingOrder: 'smart-relevance'
  }, {
    key: 'input',
    label: t('explore.presets.items.input.title'),
    description: t('explore.presets.items.input.description'),
    query: 'input',
    sortingOrder: 'smart-relevance'
  }, {
    key: 'widgets',
    label: t('explore.presets.items.widgets.title'),
    description: t('explore.presets.items.widgets.description'),
    query: 'widgets',
    sortingOrder: 'smart-relevance'
  }, {
    key: 'appearance',
    label: t('explore.presets.items.appearance.title'),
    description: t('explore.presets.items.appearance.description'),
    query: 'appearance',
    sortingOrder: 'smart-relevance'
  }], [t]);
  const discoveryMissions = (0,react.useMemo)(() => getDiscoveryMissions(), []);
  const discoveryPresetCounts = (0,react.useMemo)(() => {
    const mods = Object.entries(repositoryMods || {});
    return Object.fromEntries(discoveryPresets.map(preset => [preset.key, rankMods(mods, preset.query, preset.sortingOrder).length]));
  }, [discoveryPresets, repositoryMods]);
  const discoveryMissionRankings = (0,react.useMemo)(() => {
    const mods = Object.entries(repositoryMods || {});
    return Object.fromEntries(discoveryMissions.map(mission => [mission.key, rankMods(mods, mission.query, mission.sortingOrder)]));
  }, [discoveryMissions, repositoryMods]);
  const activeDiscoveryMission = (0,react.useMemo)(() => getDiscoveryMissionByQuery(filterText, sortingOrder), [filterText, sortingOrder]);
  const activeDiscoveryMissionCandidates = (0,react.useMemo)(() => activeDiscoveryMission && filterOptions.size === 0 ? buildDiscoveryMissionCandidates(rankedMods) : [], [activeDiscoveryMission, filterOptions.size, rankedMods]);
  const {
    devModeOptOut
  } = (0,react.useContext)(AppUISettingsContext);
  const {
    getRepositoryMods
  } = useGetRepositoryMods((0,react.useCallback)(data => {
    setRepositoryMods(data.mods);
    setInitialDataPending(false);
  }, []));
  (0,react.useEffect)(() => {
    let pending = false;
    if (!useMockData) {
      getRepositoryMods({});
      pending = true;
    }
    setInitialDataPending(pending);
  }, [getRepositoryMods]);
  useUpdateInstalledModsDetails((0,react.useCallback)(data => {
    if (repositoryMods) {
      const installedModsDetails = data.details;
      setRepositoryMods((0,immer/* produce */.jM)(repositoryMods, draft => {
        for (const [modId, updatedDetails] of Object.entries(installedModsDetails)) {
          var _draft$modId;
          const details = (_draft$modId = draft[modId]) == null ? void 0 : _draft$modId.installed;
          if (details) {
            const {
              userRating
            } = updatedDetails;
            details.userRating = userRating;
          }
        }
      }));
    }
  }, [repositoryMods]));
  const {
    installMod,
    installModPending,
    installModContext
  } = useInstallMod((0,react.useCallback)(data => {
    const {
      installedModDetails
    } = data;
    if (installedModDetails && repositoryMods) {
      const modId = data.modId;
      setRepositoryMods((0,immer/* produce */.jM)(repositoryMods, draft => {
        draft[modId].installed = installedModDetails;
      }));
    }
  }, [repositoryMods]));
  const {
    compileMod,
    compileModPending
  } = useCompileMod((0,react.useCallback)(data => {
    const {
      compiledModDetails
    } = data;
    if (compiledModDetails && repositoryMods) {
      const modId = data.modId;
      setRepositoryMods((0,immer/* produce */.jM)(repositoryMods, draft => {
        draft[modId].installed = compiledModDetails;
      }));
    }
  }, [repositoryMods]));
  const {
    enableMod
  } = useEnableMod((0,react.useCallback)(data => {
    if (data.succeeded && repositoryMods) {
      const modId = data.modId;
      setRepositoryMods((0,immer/* produce */.jM)(repositoryMods, draft => {
        var _draft$modId$installe;
        const config = (_draft$modId$installe = draft[modId].installed) == null ? void 0 : _draft$modId$installe.config;
        if (config) {
          config.disabled = !data.enabled;
        }
      }));
    }
  }, [repositoryMods]));
  const {
    deleteMod
  } = useDeleteMod((0,react.useCallback)(data => {
    if (data.succeeded && repositoryMods) {
      const modId = data.modId;
      setRepositoryMods((0,immer/* produce */.jM)(repositoryMods, draft => {
        delete draft[modId].installed;
      }));
    }
  }, [repositoryMods]));
  const {
    updateModRating
  } = useUpdateModRating((0,react.useCallback)(data => {
    if (data.succeeded && repositoryMods) {
      const modId = data.modId;
      setRepositoryMods((0,immer/* produce */.jM)(repositoryMods, draft => {
        const installed = draft[modId].installed;
        if (installed) {
          installed.userRating = data.rating;
        }
      }));
    }
  }, [repositoryMods]));
  const [infiniteScrollLoadedItems, setInfiniteScrollLoadedItems] = (0,react.useState)(30);
  const resetInfiniteScrollLoadedItems = () => setInfiniteScrollLoadedItems(30);
  const openModDetails = (0,react.useCallback)(modId => {
    setDetailsButtonClicked(true);
    navigate('/mods-browser/' + modId);
  }, [navigate]);
  const applyDiscoveryPreset = preset => {
    handleClearFilters();
    setFilterDropdownOpen(false);
    resetInfiniteScrollLoadedItems();
    setSortingOrder(preset.sortingOrder);
    setFilterText(preset.query);
  };
  const applyDiscoveryMission = mission => {
    handleClearFilters();
    setFilterDropdownOpen(false);
    resetInfiniteScrollLoadedItems();
    setSortingOrder(mission.sortingOrder);
    setFilterText(mission.query);
  };
  const copyDiscoveryMission = async mission => {
    try {
      await copyTextToClipboard(buildDiscoveryMissionBrief(mission, discoveryMissionRankings[mission.key] || []));
      message/* default */.Ay.success(t('explore.missions.copiedBrief'));
    } catch (error) {
      console.error('Failed to copy discovery mission brief:', error);
      message/* default */.Ay.error(t('explore.missions.copyFailed'));
    }
  };
  const [detailsButtonClicked, setDetailsButtonClicked] = (0,react.useState)(false);

  // Block all navigation when modal is open
  const modalIsOpen = installModPending || compileModPending;
  (0,chunk_LFPYN7LY/* useBlocker */.KP)(({
    currentLocation,
    nextLocation
  }) => {
    return modalIsOpen && currentLocation.pathname !== nextLocation.pathname;
  });
  if (initialDataPending) {
    return /*#__PURE__*/(0,jsx_runtime.jsx)(ModsBrowserOnline_CenteredContainer, {
      children: /*#__PURE__*/(0,jsx_runtime.jsx)(ModsBrowserOnline_CenteredContent, {
        children: /*#__PURE__*/(0,jsx_runtime.jsx)(ModsBrowserOnline_ProgressSpin, {
          size: "large",
          tip: t('general.loading')
        })
      })
    });
  }
  if (!repositoryMods) {
    return /*#__PURE__*/(0,jsx_runtime.jsx)(ModsBrowserOnline_CenteredContainer, {
      children: /*#__PURE__*/(0,jsx_runtime.jsx)(ModsBrowserOnline_CenteredContent, {
        children: /*#__PURE__*/(0,jsx_runtime.jsx)(result/* default */.Ay, {
          status: "error",
          title: t('general.loadingFailedTitle'),
          subTitle: t('general.loadingFailedSubtitle'),
          extra: [/*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
            type: "primary",
            onClick: () => getRepositoryMods({}),
            children: t('general.tryAgain')
          }, "try-again")]
        })
      })
    });
  }
  const renderModCard = ({
    modId,
    mod,
    insights
  }) => {
    var _mod$installed$metada;
    return /*#__PURE__*/(0,jsx_runtime.jsx)(panel_ModCard, {
      ribbonText: mod.installed ? ((_mod$installed$metada = mod.installed.metadata) == null ? void 0 : _mod$installed$metada.version) !== mod.repository.metadata.version ? t('mod.updateAvailable') : t('mod.installed') : undefined,
      title: mod.repository.metadata.name || modId,
      description: mod.repository.metadata.description,
      modMetadata: mod.repository.metadata,
      repositoryDetails: mod.repository.details,
      insights: insights.length > 0 ? insights : undefined,
      buttons: [{
        text: t('mod.details'),
        onClick: () => openModDetails(modId)
      }]
    }, modId);
  };
  return /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [/*#__PURE__*/(0,jsx_runtime.jsx)(ContentWrapper, {
      id: "ModsBrowserOnline-ContentWrapper",
      $hidden: !!displayedModId,
      children: /*#__PURE__*/(0,jsx_runtime.jsxs)(ModsBrowserOnline_ModsContainer, {
        $extraBottomPadding: !devModeOptOut,
        children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(ModsBrowserOnline_SearchFilterContainer, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(ModsBrowserOnline_SearchFilterInput, {
            prefix: /*#__PURE__*/(0,jsx_runtime.jsx)(react_fontawesome_dist/* FontAwesomeIcon */.gc, {
              icon: free_solid_svg_icons/* faSearch */.MjD
            }),
            placeholder: t('modSearch.placeholder'),
            allowClear: true,
            value: filterText,
            onChange: e => {
              resetInfiniteScrollLoadedItems();
              setFilterText(e.target.value);
            }
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(DropdownModal, {
            placement: "bottomRight",
            trigger: ['click'],
            arrow: true,
            open: filterDropdownOpen,
            onOpenChange: setFilterDropdownOpen,
            menu: {
              style: {
                maxHeight: '400px',
                overflowY: 'overlay'
              },
              items: [{
                type: 'group',
                label: t('explore.filter.installationStatus'),
                children: [{
                  label: t('explore.filter.installed'),
                  key: 'installed'
                }, {
                  label: t('explore.filter.notInstalled'),
                  key: 'not-installed'
                }]
              }, {
                type: 'group',
                label: t('explore.filter.author'),
                children: [...(showAllAuthors ? authorFilters : authorFilters.slice(0, 5)).map(author => ({
                  label: /*#__PURE__*/(0,jsx_runtime.jsx)(FilterItemLabel, {
                    label: author.name,
                    count: author.count
                  }),
                  key: author.key
                })), ...(authorFilters.length > 5 && !showAllAuthors ? [{
                  label: t('explore.filter.showMore'),
                  key: 'show-more-authors'
                }] : [])]
              }, {
                type: 'group',
                label: t('explore.filter.process'),
                children: [...(showAllProcesses ? processFilters : processFilters.slice(0, 5)).map(process => ({
                  label: /*#__PURE__*/(0,jsx_runtime.jsx)(FilterItemLabel, {
                    label: process.name,
                    count: process.count
                  }),
                  key: process.key
                })), ...(processFilters.length > 5 && !showAllProcesses ? [{
                  label: t('explore.filter.showMore'),
                  key: 'show-more-processes'
                }] : [])]
              }, {
                type: 'divider'
              }, {
                label: t('explore.filter.clearFilters'),
                key: 'clear-filters'
              }],
              selectedKeys: Array.from(filterOptions),
              onClick: e => {
                if (e.key === 'clear-filters') {
                  dropdownModalDismissed();
                  handleClearFilters();
                  setFilterDropdownOpen(false);
                  resetInfiniteScrollLoadedItems();
                } else if (e.key === 'show-more-authors') {
                  setShowAllAuthors(true);
                } else if (e.key === 'show-more-processes') {
                  setShowAllProcesses(true);
                } else {
                  handleFilterChange(e.key);
                  resetInfiniteScrollLoadedItems();
                  // Keep dropdown open for filter changes
                }
              }
            },
            children: /*#__PURE__*/(0,jsx_runtime.jsx)(ModsBrowserOnline_IconButton, {
              type: filterOptions.size > 0 ? 'primary' : undefined,
              children: /*#__PURE__*/(0,jsx_runtime.jsx)(react_fontawesome_dist/* FontAwesomeIcon */.gc, {
                icon: free_solid_svg_icons/* faFilter */.mRM
              })
            })
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(DropdownModal, {
            placement: "bottomRight",
            trigger: ['click'],
            arrow: true,
            menu: {
              items: [{
                label: t('explore.search.smartRelevance'),
                key: 'smart-relevance'
              }, {
                label: t('explore.search.popularAndTopRated'),
                key: 'popular-top-rated'
              }, {
                label: t('explore.search.popular'),
                key: 'popular'
              }, {
                label: t('explore.search.topRated'),
                key: 'top-rated'
              }, {
                label: t('explore.search.newest'),
                key: 'newest'
              }, {
                label: t('explore.search.lastUpdated'),
                key: 'last-updated'
              }, {
                label: t('explore.search.alphabeticalOrder'),
                key: 'alphabetical'
              }],
              selectedKeys: [sortingOrder],
              onClick: e => {
                dropdownModalDismissed();
                resetInfiniteScrollLoadedItems();
                setSortingOrder(e.key);
              }
            },
            children: /*#__PURE__*/(0,jsx_runtime.jsx)(ModsBrowserOnline_IconButton, {
              children: /*#__PURE__*/(0,jsx_runtime.jsx)(react_fontawesome_dist/* FontAwesomeIcon */.gc, {
                icon: free_solid_svg_icons/* faSort */.OM7
              })
            })
          })]
        }), !filterText.trim() && filterOptions.size === 0 && /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(DiscoveryPresetsSection, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsxs)("div", {
              children: [/*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryPresetsTitle, {
                children: t('explore.presets.title')
              }), /*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryPresetsDescription, {
                children: t('explore.presets.description')
              })]
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryPresetsGrid, {
              children: discoveryPresets.map(preset => {
                var _discoveryPresetCount;
                const isActive = filterText.trim().toLowerCase() === preset.query.toLowerCase() && sortingOrder === preset.sortingOrder && filterOptions.size === 0;
                return /*#__PURE__*/(0,jsx_runtime.jsxs)(DiscoveryPresetCard, {
                  type: "button",
                  $active: isActive,
                  onClick: () => applyDiscoveryPreset(preset),
                  children: [/*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryPresetLabel, {
                    children: preset.label
                  }), /*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryPresetDescription, {
                    children: preset.description
                  }), /*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryPresetMeta, {
                    children: t('explore.presets.modsCount', {
                      count: (_discoveryPresetCount = discoveryPresetCounts[preset.key]) != null ? _discoveryPresetCount : 0
                    })
                  })]
                }, preset.key);
              })
            })]
          }), /*#__PURE__*/(0,jsx_runtime.jsxs)(DiscoveryMissionsSection, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsxs)("div", {
              children: [/*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryPresetsTitle, {
                children: t('explore.missions.title')
              }), /*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryPresetsDescription, {
                children: t('explore.missions.description')
              })]
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryMissionsGrid, {
              children: discoveryMissions.map(mission => {
                const isActive = filterText.trim().toLowerCase() === mission.query.toLowerCase() && sortingOrder === mission.sortingOrder && filterOptions.size === 0;
                const missionResults = discoveryMissionRankings[mission.key] || [];
                return /*#__PURE__*/(0,jsx_runtime.jsxs)(DiscoveryMissionCard, {
                  $active: isActive,
                  children: [/*#__PURE__*/(0,jsx_runtime.jsxs)("div", {
                    children: [/*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryMissionTitle, {
                      children: mission.title
                    }), /*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryMissionDescription, {
                      children: mission.description
                    })]
                  }), /*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryMissionCue, {
                    children: mission.researchCue
                  }), /*#__PURE__*/(0,jsx_runtime.jsxs)("div", {
                    children: [/*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryMissionLabel, {
                      children: t('explore.missions.followUp')
                    }), /*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryMissionTokenRow, {
                      children: mission.followUpQueries.map(query => /*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryMissionToken, {
                        children: query
                      }, query))
                    })]
                  }), /*#__PURE__*/(0,jsx_runtime.jsxs)("div", {
                    children: [/*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryMissionLabel, {
                      children: t('explore.missions.verify')
                    }), /*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryMissionChecklist, {
                      children: mission.verificationChecks.slice(0, 2).map(check => /*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryMissionChecklistItem, {
                        children: /*#__PURE__*/(0,jsx_runtime.jsx)("span", {
                          children: check
                        })
                      }, check))
                    })]
                  }), /*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryPresetMeta, {
                    children: t('explore.missions.modsCount', {
                      count: missionResults.length
                    })
                  }), /*#__PURE__*/(0,jsx_runtime.jsxs)(DiscoveryMissionActions, {
                    children: [/*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
                      size: "small",
                      type: isActive ? 'primary' : 'default',
                      onClick: () => applyDiscoveryMission(mission),
                      children: t('explore.missions.start')
                    }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
                      size: "small",
                      onClick: () => {
                        void copyDiscoveryMission(mission);
                      },
                      children: t('explore.missions.copyBrief')
                    })]
                  })]
                }, mission.key);
              })
            })]
          })]
        }), activeDiscoveryMission && filterOptions.size === 0 && /*#__PURE__*/(0,jsx_runtime.jsxs)(MissionWorkbenchSection, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsxs)("div", {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryPresetsTitle, {
              children: t('explore.missions.workbenchTitle', {
                mission: activeDiscoveryMission.title
              })
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryPresetsDescription, {
              children: t('explore.missions.workbenchDescription')
            })]
          }), /*#__PURE__*/(0,jsx_runtime.jsxs)(MissionWorkbenchGrid, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(MissionWorkbenchColumn, {
              children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(MissionWorkbenchCard, {
                children: [/*#__PURE__*/(0,jsx_runtime.jsx)(MissionWorkbenchTitle, {
                  children: activeDiscoveryMission.title
                }), /*#__PURE__*/(0,jsx_runtime.jsx)(MissionWorkbenchDescription, {
                  children: activeDiscoveryMission.description
                }), /*#__PURE__*/(0,jsx_runtime.jsx)(MissionWorkbenchMeta, {
                  children: activeDiscoveryMission.researchCue
                }), /*#__PURE__*/(0,jsx_runtime.jsxs)(DiscoveryMissionActions, {
                  children: [/*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
                    size: "small",
                    onClick: () => {
                      void copyDiscoveryMission(activeDiscoveryMission);
                    },
                    children: t('explore.missions.copyBrief')
                  }), activeDiscoveryMissionCandidates[0] && /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
                    size: "small",
                    type: "primary",
                    onClick: () => openModDetails(activeDiscoveryMissionCandidates[0].modId),
                    children: t('explore.missions.openTopCandidate')
                  })]
                })]
              }), /*#__PURE__*/(0,jsx_runtime.jsxs)(MissionWorkbenchCard, {
                children: [/*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryMissionLabel, {
                  children: t('explore.missions.followUp')
                }), /*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryMissionTokenRow, {
                  children: activeDiscoveryMission.followUpQueries.map(query => /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
                    size: "small",
                    onClick: () => {
                      resetInfiniteScrollLoadedItems();
                      setFilterText(prevValue => appendSearchRefinement(prevValue, query));
                    },
                    children: query
                  }, query))
                })]
              })]
            }), /*#__PURE__*/(0,jsx_runtime.jsxs)(MissionWorkbenchColumn, {
              children: [/*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryMissionLabel, {
                children: t('explore.missions.compareTopCandidates')
              }), /*#__PURE__*/(0,jsx_runtime.jsx)(MissionWorkbenchCandidates, {
                children: activeDiscoveryMissionCandidates.map(candidate => /*#__PURE__*/(0,jsx_runtime.jsxs)(MissionWorkbenchCandidate, {
                  children: [/*#__PURE__*/(0,jsx_runtime.jsx)(MissionWorkbenchCandidateTitle, {
                    children: candidate.displayName
                  }), /*#__PURE__*/(0,jsx_runtime.jsx)(MissionWorkbenchCandidateMeta, {
                    children: candidate.author
                  }), /*#__PURE__*/(0,jsx_runtime.jsx)(MissionWorkbenchCandidateMeta, {
                    children: candidate.communitySummary
                  }), /*#__PURE__*/(0,jsx_runtime.jsx)(MissionWorkbenchCandidateInsights, {
                    children: candidate.insightSummary
                  }), /*#__PURE__*/(0,jsx_runtime.jsx)(DiscoveryMissionActions, {
                    children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
                      size: "small",
                      onClick: () => openModDetails(candidate.modId),
                      children: t('mod.details')
                    })
                  })]
                }, candidate.modId))
              })]
            })]
          })]
        }), (filterText.trim() || filterOptions.size > 0) && /*#__PURE__*/(0,jsx_runtime.jsxs)(SearchMetaRow, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SearchMetaText, {
            children: filterText.trim() ? sortingOrder === 'smart-relevance' ? t('explore.discovery.smartResults', {
              count: rankedMods.length
            }) : t('explore.discovery.filteredResults', {
              count: rankedMods.length
            }) : t('explore.discovery.filteredOnly', {
              count: rankedMods.length
            })
          }), /*#__PURE__*/(0,jsx_runtime.jsxs)(SearchActions, {
            children: [filterText.trim() && sortingOrder === 'smart-relevance' && searchCorrection && correctedRankedMods.length > rankedMods.length && /*#__PURE__*/(0,jsx_runtime.jsxs)(SearchSuggestions, {
              children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SearchMetaText, {
                children: t('modSearch.didYouMean')
              }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
                size: "small",
                onClick: () => {
                  resetInfiniteScrollLoadedItems();
                  setFilterText(searchCorrection.correctedQuery);
                },
                children: searchCorrection.correctedQuery
              })]
            }), filterText.trim() && sortingOrder === 'smart-relevance' && refinementSuggestions.length > 0 && /*#__PURE__*/(0,jsx_runtime.jsxs)(SearchSuggestions, {
              children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SearchMetaText, {
                children: t('explore.discovery.refineWith')
              }), refinementSuggestions.map(suggestion => /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
                size: "small",
                onClick: () => {
                  resetInfiniteScrollLoadedItems();
                  setFilterText(prevValue => appendSearchRefinement(prevValue, suggestion.queryText));
                },
                children: suggestion.label
              }, suggestion.key))]
            })]
          })]
        }), rankedMods.length === 0 ? /*#__PURE__*/(0,jsx_runtime.jsx)(ResultsMessageWrapper, {
          children: /*#__PURE__*/(0,jsx_runtime.jsxs)(RecoveryContainer, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(empty/* default */.A, {
              image: empty/* default */.A.PRESENTED_IMAGE_SIMPLE,
              description: t('modSearch.noResults')
            }), searchRecovery && /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
              children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(SearchSuggestions, {
                children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SearchMetaText, {
                  children: searchRecovery.reason === 'correction' ? t('modSearch.recoveryByCorrection') : t('modSearch.recoveryByBroadening')
                }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
                  size: "small",
                  type: "primary",
                  onClick: () => {
                    resetInfiniteScrollLoadedItems();
                    setFilterText(searchRecovery.suggestedQuery);
                  },
                  children: t('modSearch.tryRecoveredQuery', {
                    query: searchRecovery.suggestedQuery
                  })
                })]
              }), /*#__PURE__*/(0,jsx_runtime.jsx)(SearchMetaText, {
                children: t('modSearch.closestMatches')
              }), /*#__PURE__*/(0,jsx_runtime.jsx)(ModsBrowserOnline_ModsGrid, {
                children: searchRecovery.results.map(renderModCard)
              })]
            })]
          })
        }) : /*#__PURE__*/(0,jsx_runtime.jsx)(index_es/* default */.A, {
          dataLength: infiniteScrollLoadedItems,
          next: () => setInfiniteScrollLoadedItems(Math.min(infiniteScrollLoadedItems + 30, rankedMods.length)),
          hasMore: infiniteScrollLoadedItems < rankedMods.length,
          loader: null,
          scrollableTarget: "ModsBrowserOnline-ContentWrapper",
          style: {
            overflow: 'visible'
          } // for the ribbon
          ,
          children: /*#__PURE__*/(0,jsx_runtime.jsx)(ModsBrowserOnline_ModsGrid, {
            children: rankedMods.slice(0, infiniteScrollLoadedItems).map(renderModCard)
          })
        })]
      })
    }), displayedModId && /*#__PURE__*/(0,jsx_runtime.jsx)(ContentWrapper, {
      children: /*#__PURE__*/(0,jsx_runtime.jsx)(panel_ModDetails, {
        modId: displayedModId,
        installedModDetails: repositoryMods[displayedModId].installed,
        repositoryModDetails: repositoryMods[displayedModId].repository,
        goBack: () => {
          // If we ever clicked on Details, go back.
          // Otherwise, we probably arrived from a different location,
          // go straight to the mods page.
          if (detailsButtonClicked) {
            navigate(-1);
          } else {
            navigate('/mods-browser');
          }
        },
        installMod: (modSource, options) => installMod({
          modId: displayedModId,
          modSource,
          disabled: options == null ? void 0 : options.disabled
        }),
        updateMod: (modSource, disabled) => installMod({
          modId: displayedModId,
          modSource,
          disabled
        }, {
          updating: true
        }),
        forkModFromSource: modSource => forkMod({
          modId: displayedModId,
          modSource
        }),
        compileMod: () => compileMod({
          modId: displayedModId
        }),
        enableMod: enable => enableMod({
          modId: displayedModId,
          enable
        }),
        editMod: () => editMod({
          modId: displayedModId
        }),
        forkMod: () => forkMod({
          modId: displayedModId
        }),
        deleteMod: () => deleteMod({
          modId: displayedModId
        }),
        updateModRating: newRating => updateModRating({
          modId: displayedModId,
          rating: newRating
        })
      })
    }), (installModPending || compileModPending) && /*#__PURE__*/(0,jsx_runtime.jsx)(modal/* default */.A, {
      open: true,
      closable: false,
      footer: null,
      children: /*#__PURE__*/(0,jsx_runtime.jsx)(ModsBrowserOnline_ProgressSpin, {
        size: "large",
        tip: installModPending ? installModContext != null && installModContext.updating ? t('general.updating') : t('general.installing') : compileModPending ? t('general.compiling') : ''
      })
    })]
  });
}
/* harmony default export */ const panel_ModsBrowserOnline = (ModsBrowserOnline);
;// ./src/app/panel/SafeModeIndicator.tsx








const FullWidthAlert = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(es_alert/* default */.A).withConfig({
  displayName: "SafeModeIndicator__FullWidthAlert",
  componentId: "sc-9sph0c-0"
})(["padding-inline-start:calc(20px + max(50% - var(--app-max-width) / 2,0px));padding-inline-end:calc(20px + max(50% - var(--app-max-width) / 2,0px));"]);
const FullWidthAlertContent = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "SafeModeIndicator__FullWidthAlertContent",
  componentId: "sc-9sph0c-1"
})(["display:flex;align-items:center;gap:8px;"]);
function SafeModeIndicator() {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const {
    updateAppSettings
  } = useUpdateAppSettings((0,react.useCallback)(data => {
    // Do nothing, we should be restarted soon.
  }, []));
  const {
    safeMode
  } = (0,react.useContext)(AppUISettingsContext);
  if (!safeMode) {
    return null;
  }
  return /*#__PURE__*/(0,jsx_runtime.jsx)(FullWidthAlert, {
    message: /*#__PURE__*/(0,jsx_runtime.jsxs)(FullWidthAlertContent, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)("div", {
        children: t('safeMode.alert')
      }), /*#__PURE__*/(0,jsx_runtime.jsx)("div", {
        children: /*#__PURE__*/(0,jsx_runtime.jsx)(PopconfirmModal, {
          title: t('safeMode.offConfirm'),
          okText: t('safeMode.offConfirmOk'),
          cancelText: t('safeMode.offConfirmCancel'),
          onConfirm: () => {
            updateAppSettings({
              appSettings: {
                safeMode: false
              }
            });
          },
          children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
            ghost: true,
            children: t('safeMode.offButton')
          })
        })
      })]
    }),
    banner: true
  });
}
/* harmony default export */ const panel_SafeModeIndicator = (SafeModeIndicator);
// EXTERNAL MODULE: ../../node_modules/antd/es/collapse/index.js + 6 modules
var collapse = __webpack_require__(92795);
;// ./src/app/panel/Settings.tsx










const Settings_SettingsWrapper = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "Settings__SettingsWrapper",
  componentId: "sc-1ypdghv-0"
})(["padding:8px 0 28px;"]);
const SettingsHero = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.section.withConfig({
  displayName: "Settings__SettingsHero",
  componentId: "sc-1ypdghv-1"
})(["margin-bottom:var(--app-section-gap);padding:calc(var(--app-card-padding) + 2px);border:1px solid var(--app-surface-border);border-radius:var(--app-surface-radius);background:radial-gradient(circle at top right,rgba(23,125,220,0.16),transparent 35%),var(--app-surface-background);box-shadow:var(--app-surface-shadow);"]);
const SettingsEyebrow = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "Settings__SettingsEyebrow",
  componentId: "sc-1ypdghv-2"
})(["color:rgba(255,255,255,0.58);font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;"]);
const SettingsPageTitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.h1.withConfig({
  displayName: "Settings__SettingsPageTitle",
  componentId: "sc-1ypdghv-3"
})(["margin:10px 0 8px;font-size:34px;line-height:1.05;"]);
const SettingsPageDescription = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.p.withConfig({
  displayName: "Settings__SettingsPageDescription",
  componentId: "sc-1ypdghv-4"
})(["max-width:720px;margin-bottom:18px;color:rgba(255,255,255,0.7);font-size:15px;"]);
const StatusPillRow = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "Settings__StatusPillRow",
  componentId: "sc-1ypdghv-5"
})(["display:flex;flex-wrap:wrap;gap:10px;"]);
const Settings_StatusPill = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.span.withConfig({
  displayName: "Settings__StatusPill",
  componentId: "sc-1ypdghv-6"
})(["position:relative;display:inline-flex;align-items:center;min-height:var(--app-status-pill-height);padding:0 14px 0 30px;border:1px solid rgba(255,255,255,0.08);border-radius:999px;background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.88);font-size:12px;font-weight:600;&::before{content:'';position:absolute;left:12px;width:8px;height:8px;border-radius:999px;background:", ";}"], ({
  $tone
}) => {
  switch ($tone) {
    case 'error':
      return '#ff7875';
    case 'warning':
      return '#ffc53d';
    default:
      return '#69c0ff';
  }
});
const SettingsGrid = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "Settings__SettingsGrid",
  componentId: "sc-1ypdghv-7"
})(["display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:var(--app-section-gap);align-items:start;"]);
const SettingsSectionCard = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(card/* default */.A).withConfig({
  displayName: "Settings__SettingsSectionCard",
  componentId: "sc-1ypdghv-8"
})(["border:1px solid var(--app-surface-border);border-radius:var(--app-surface-radius);background:var(--app-surface-background);box-shadow:var(--app-surface-shadow);.ant-card-body{padding:var(--app-card-padding) var(--app-card-padding) 14px;}"]);
const AdvancedSettingsCard = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(SettingsSectionCard).withConfig({
  displayName: "Settings__AdvancedSettingsCard",
  componentId: "sc-1ypdghv-9"
})(["grid-column:1 / -1;"]);
const Settings_SectionHeading = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "Settings__SectionHeading",
  componentId: "sc-1ypdghv-10"
})(["margin-bottom:16px;"]);
const Settings_SectionTitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.h2.withConfig({
  displayName: "Settings__SectionTitle",
  componentId: "sc-1ypdghv-11"
})(["margin:0 0 6px;font-size:18px;"]);
const Settings_SectionDescription = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.p.withConfig({
  displayName: "Settings__SectionDescription",
  componentId: "sc-1ypdghv-12"
})(["margin:0;color:rgba(255,255,255,0.62);"]);
const SettingsList = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(list/* default */.Ay).withConfig({
  displayName: "Settings__SettingsList",
  componentId: "sc-1ypdghv-13"
})(["margin-bottom:0;"]);
const Settings_SettingsListItemMeta = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(list/* default */.Ay.Item.Meta).withConfig({
  displayName: "Settings__SettingsListItemMeta",
  componentId: "sc-1ypdghv-14"
})([".ant-list-item-meta{margin-bottom:8px;}.ant-list-item-meta-title{margin-bottom:0;}"]);
const Settings_SettingsSelect = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(SelectModal).withConfig({
  displayName: "Settings__SettingsSelect",
  componentId: "sc-1ypdghv-15"
})(["width:220px;"]);
const SettingsNotice = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "Settings__SettingsNotice",
  componentId: "sc-1ypdghv-16"
})(["margin-top:14px;color:rgba(255,255,255,0.45);"]);
const SettingsActionRow = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "Settings__SettingsActionRow",
  componentId: "sc-1ypdghv-17"
})(["display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:12px;"]);
const Settings_SettingInputNumber = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(InputNumberWithContextMenu).withConfig({
  displayName: "Settings__SettingInputNumber",
  componentId: "sc-1ypdghv-18"
})(["width:100%;max-width:130px;input:focus{outline:none !important;}"]);
const appLanguages = [['en', 'English'], ...Object.entries({
  ar: 'العربية',
  cs: 'Čeština',
  da: 'Dansk',
  de: 'Deutsch',
  el: 'Ελληνικά',
  es: 'Español',
  fr: 'Français',
  hi: 'हिन्दी',
  hr: 'Hrvatski',
  hu: 'Magyar',
  id: 'Bahasa Indonesia',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
  nl: 'Nederlands',
  pl: 'Polski',
  'pt-BR': 'Português',
  ro: 'Română',
  ru: 'Русский',
  sv: 'Svenska',
  ta: 'தமிழ்',
  th: 'ภาษาไทย',
  tr: 'Türkçe',
  uk: 'Українська',
  vi: 'Tiếng Việt',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文'
}).sort((a, b) => a[1].localeCompare(b[1]))];
function Settings_parseIntLax(value) {
  const result = parseInt((value != null ? value : 0).toString(), 10);
  return Number.isNaN(result) ? 0 : result;
}
function Settings_engineArrayToProcessList(processArray) {
  return processArray.join('\n');
}
function Settings_engineProcessListToArray(processList) {
  return processList.split('\n').map(x => x.replace(/["/<>|]/g, '').trim()).filter(x => x);
}
function Settings() {
  var _runtimeDiagnostics$t, _appSettings$modTasks;
  const {
    t,
    i18n
  } = (0,es/* useTranslation */.Bd)();
  const appLanguage = i18n.resolvedLanguage;
  const {
    loggingEnabled,
    safeMode,
    localUISettings,
    resetLocalUISettings,
    setLocalUISettings
  } = (0,react.useContext)(AppUISettingsContext);
  const [appSettings, setAppSettings] = (0,react.useState)(mockSettings);
  const [runtimeDiagnostics, setRuntimeDiagnostics] = (0,react.useState)(mockRuntimeDiagnostics);
  const [appLoggingVerbosity, setAppLoggingVerbosity] = (0,react.useState)(0);
  const [engineLoggingVerbosity, setEngineLoggingVerbosity] = (0,react.useState)(0);
  const [engineInclude, setEngineInclude] = (0,react.useState)('');
  const [engineExclude, setEngineExclude] = (0,react.useState)('');
  const [engineInjectIntoCriticalProcesses, setEngineInjectIntoCriticalProcesses] = (0,react.useState)(false);
  const [engineInjectIntoIncompatiblePrograms, setEngineInjectIntoIncompatiblePrograms] = (0,react.useState)(false);
  const [engineInjectIntoGames, setEngineInjectIntoGames] = (0,react.useState)(false);
  const resetMoreAdvancedSettings = (0,react.useCallback)(() => {
    var _appSettings$loggingV, _appSettings$engine$l, _appSettings$engine, _appSettings$engine$i, _appSettings$engine2, _appSettings$engine$e, _appSettings$engine3, _appSettings$engine$i2, _appSettings$engine4, _appSettings$engine$i3, _appSettings$engine5, _appSettings$engine$i4, _appSettings$engine6;
    setAppLoggingVerbosity((_appSettings$loggingV = appSettings == null ? void 0 : appSettings.loggingVerbosity) != null ? _appSettings$loggingV : 0);
    setEngineLoggingVerbosity((_appSettings$engine$l = appSettings == null || (_appSettings$engine = appSettings.engine) == null ? void 0 : _appSettings$engine.loggingVerbosity) != null ? _appSettings$engine$l : 0);
    setEngineInclude(Settings_engineArrayToProcessList((_appSettings$engine$i = appSettings == null || (_appSettings$engine2 = appSettings.engine) == null ? void 0 : _appSettings$engine2.include) != null ? _appSettings$engine$i : []));
    setEngineExclude(Settings_engineArrayToProcessList((_appSettings$engine$e = appSettings == null || (_appSettings$engine3 = appSettings.engine) == null ? void 0 : _appSettings$engine3.exclude) != null ? _appSettings$engine$e : []));
    setEngineInjectIntoCriticalProcesses((_appSettings$engine$i2 = appSettings == null || (_appSettings$engine4 = appSettings.engine) == null ? void 0 : _appSettings$engine4.injectIntoCriticalProcesses) != null ? _appSettings$engine$i2 : false);
    setEngineInjectIntoIncompatiblePrograms((_appSettings$engine$i3 = appSettings == null || (_appSettings$engine5 = appSettings.engine) == null ? void 0 : _appSettings$engine5.injectIntoIncompatiblePrograms) != null ? _appSettings$engine$i3 : false);
    setEngineInjectIntoGames((_appSettings$engine$i4 = appSettings == null || (_appSettings$engine6 = appSettings.engine) == null ? void 0 : _appSettings$engine6.injectIntoGames) != null ? _appSettings$engine$i4 : false);
  }, [appSettings]);
  const {
    getAppSettings
  } = useGetAppSettings((0,react.useCallback)(data => {
    setAppSettings(data.appSettings);
    setRuntimeDiagnostics(data.runtimeDiagnostics || null);
  }, []));
  (0,react.useEffect)(() => {
    getAppSettings({});
  }, [getAppSettings]);
  const {
    updateAppSettings
  } = useUpdateAppSettings((0,react.useCallback)(data => {
    if (data.succeeded && appSettings) {
      setAppSettings(Object.assign({}, appSettings, data.appSettings));
    }
  }, [appSettings]));
  const [isMoreAdvancedSettingsModalOpen, setIsMoreAdvancedSettingsModalOpen] = (0,react.useState)(false);
  const recommendedLocalUISettings = (0,react.useMemo)(() => getRecommendedLocalUISettings(runtimeDiagnostics), [runtimeDiagnostics]);
  const getPerformanceProfileLabel = (0,react.useCallback)(profile => {
    switch (profile) {
      case 'responsive':
        return t('settings.performance.profile.options.responsive');
      case 'efficient':
        return t('settings.performance.profile.options.efficient');
      case 'balanced':
      default:
        return t('settings.performance.profile.options.balanced');
    }
  }, [t]);
  const getAIAccelerationLabel = (0,react.useCallback)(preference => {
    switch (preference) {
      case 'prefer-npu':
        return t('settings.performance.aiAcceleration.options.preferNpu');
      case 'off':
        return t('settings.performance.aiAcceleration.options.off');
      case 'auto':
      default:
        return t('settings.performance.aiAcceleration.options.auto');
    }
  }, [t]);
  const performanceRecommendationDescription = (0,react.useMemo)(() => {
    if (!runtimeDiagnostics) {
      return t('settings.performance.recommendationFallback');
    }
    if (runtimeDiagnostics.issueCode !== 'none') {
      return t('settings.performance.recommendationIssue', {
        profile: getPerformanceProfileLabel(recommendedLocalUISettings.performanceProfile)
      });
    }
    if (runtimeDiagnostics.npuDetected) {
      return t('settings.performance.recommendationNpu', {
        npu: runtimeDiagnostics.npuName || t('settings.performance.values.detected')
      });
    }
    if (runtimeDiagnostics.totalMemoryGb <= 8) {
      return t('settings.performance.recommendationEfficient', {
        memory: runtimeDiagnostics.totalMemoryGb
      });
    }
    if (runtimeDiagnostics.totalMemoryGb >= 16) {
      return t('settings.performance.recommendationResponsive', {
        memory: runtimeDiagnostics.totalMemoryGb
      });
    }
    return t('settings.performance.recommendationBalanced');
  }, [getPerformanceProfileLabel, recommendedLocalUISettings.performanceProfile, runtimeDiagnostics, t]);
  const recommendedSettingsAlreadyApplied = localUISettings.performanceProfile === recommendedLocalUISettings.performanceProfile && localUISettings.aiAccelerationPreference === recommendedLocalUISettings.aiAccelerationPreference && localUISettings.reduceMotion === recommendedLocalUISettings.reduceMotion && localUISettings.useWideLayout === recommendedLocalUISettings.useWideLayout;
  const statusItems = (0,react.useMemo)(() => {
    const items = [];
    if (!(appSettings != null && appSettings.disableUpdateCheck)) {
      items.push({
        key: 'updates',
        text: t('settings.overview.updatesEnabled'),
        tone: 'default'
      });
    }
    if (loggingEnabled) {
      items.push({
        key: 'logging',
        text: t('settings.overview.debugLogging'),
        tone: 'warning'
      });
    }
    if (safeMode) {
      items.push({
        key: 'safe-mode',
        text: t('settings.overview.safeMode'),
        tone: 'warning'
      });
    }
    if (!(appSettings != null && appSettings.devModeOptOut)) {
      items.push({
        key: 'dev-mode',
        text: t('settings.overview.devMode'),
        tone: 'default'
      });
    }
    if (localUISettings.interfaceDensity === 'compact') {
      items.push({
        key: 'compact-layout',
        text: t('settings.overview.compactLayout'),
        tone: 'default'
      });
    }
    if (localUISettings.useWideLayout) {
      items.push({
        key: 'wide-layout',
        text: t('settings.overview.wideLayout'),
        tone: 'default'
      });
    }
    if (localUISettings.reduceMotion) {
      items.push({
        key: 'reduce-motion',
        text: t('settings.overview.reduceMotion'),
        tone: 'default'
      });
    }
    if (localUISettings.performanceProfile === 'responsive') {
      items.push({
        key: 'responsive-profile',
        text: t('settings.overview.responsiveProfile'),
        tone: 'default'
      });
    } else if (localUISettings.performanceProfile === 'efficient') {
      items.push({
        key: 'efficient-profile',
        text: t('settings.overview.efficientProfile'),
        tone: 'default'
      });
    }
    if (localUISettings.aiAccelerationPreference === 'prefer-npu') {
      items.push({
        key: 'prefer-npu',
        text: t('settings.overview.npuPreferred'),
        tone: 'default'
      });
    }
    return items;
  }, [appSettings == null ? void 0 : appSettings.devModeOptOut, appSettings == null ? void 0 : appSettings.disableUpdateCheck, localUISettings, loggingEnabled, safeMode, t]);
  if (!appSettings) {
    return null;
  }
  const includeListEmpty = engineInclude.trim() === '';
  const excludeListEmpty = engineExclude.trim() === '' && engineInjectIntoCriticalProcesses && engineInjectIntoIncompatiblePrograms && engineInjectIntoGames;
  const excludeListHasWildcard = !!engineExclude.match(/^[ \t]*\*[ \t]*$/m);
  return /*#__PURE__*/(0,jsx_runtime.jsxs)(Settings_SettingsWrapper, {
    children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(SettingsHero, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SettingsEyebrow, {
        children: t('appHeader.settings')
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(SettingsPageTitle, {
        children: t('settings.pageTitle')
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(SettingsPageDescription, {
        children: t('settings.pageDescription')
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(StatusPillRow, {
        children: statusItems.length > 0 ? statusItems.map(({
          key,
          text,
          tone
        }) => /*#__PURE__*/(0,jsx_runtime.jsx)(Settings_StatusPill, {
          $tone: tone,
          children: text
        }, key)) : /*#__PURE__*/(0,jsx_runtime.jsx)(Settings_StatusPill, {
          $tone: "default",
          children: t('settings.overview.allClear')
        })
      })]
    }), /*#__PURE__*/(0,jsx_runtime.jsxs)(SettingsGrid, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(SettingsSectionCard, {
        bordered: false,
        children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(Settings_SectionHeading, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SectionTitle, {
            children: t('settings.core.title')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SectionDescription, {
            children: t('settings.core.description')
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsxs)(SettingsList, {
          itemLayout: "vertical",
          split: false,
          children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SettingsListItemMeta, {
              title: t('settings.language.title'),
              description: /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
                children: [/*#__PURE__*/(0,jsx_runtime.jsx)("div", {
                  children: t('settings.language.description')
                }), /*#__PURE__*/(0,jsx_runtime.jsx)("div", {
                  children: /*#__PURE__*/(0,jsx_runtime.jsx)(es/* Trans */.x6, {
                    t: t,
                    i18nKey: "settings.language.contribute",
                    components: [/*#__PURE__*/(0,jsx_runtime.jsx)("a", {
                      href: "https://github.com/ramensoftware/windhawk/wiki/translations",
                      children: "website"
                    })]
                  })
                })]
              })
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SettingsSelect, {
              showSearch: true,
              optionFilterProp: "children",
              value: appLanguage,
              onChange: value => {
                updateAppSettings({
                  appSettings: {
                    language: typeof value === 'string' ? value : 'en'
                  }
                });
              },
              dropdownMatchSelectWidth: false,
              children: appLanguages.map(([languageId, languageDisplayName]) => /*#__PURE__*/(0,jsx_runtime.jsx)(es_select/* default */.A.Option, {
                value: languageId,
                children: languageDisplayName
              }, languageId))
            }), appLanguage !== 'en' && /*#__PURE__*/(0,jsx_runtime.jsx)(SettingsNotice, {
              children: /*#__PURE__*/(0,jsx_runtime.jsx)(es/* Trans */.x6, {
                t: t,
                i18nKey: "settings.language.credits",
                components: [/*#__PURE__*/(0,jsx_runtime.jsx)("a", {
                  href: sanitizeUrl(t('settings.language.creditsLink')),
                  children: "website"
                })]
              })
            })]
          }), /*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SettingsListItemMeta, {
              title: t('settings.updates.title'),
              description: t('settings.updates.description')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_switch/* default */.A, {
              checked: !appSettings.disableUpdateCheck,
              onChange: checked => {
                updateAppSettings({
                  appSettings: {
                    disableUpdateCheck: !checked
                  }
                });
              }
            })]
          }), /*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SettingsListItemMeta, {
              title: t('settings.devMode.title'),
              description: t('settings.devMode.description')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_switch/* default */.A, {
              checked: !appSettings.devModeOptOut,
              onChange: checked => {
                updateAppSettings({
                  appSettings: {
                    devModeOptOut: !checked
                  }
                });
              }
            })]
          })]
        })]
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(SettingsSectionCard, {
        bordered: false,
        children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(Settings_SectionHeading, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SectionTitle, {
            children: t('settings.interface.title')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SectionDescription, {
            children: t('settings.interface.description')
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsxs)(SettingsList, {
          itemLayout: "vertical",
          split: false,
          children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SettingsListItemMeta, {
              title: t('settings.interface.layoutDensity.title'),
              description: t('settings.interface.layoutDensity.description')
            }), /*#__PURE__*/(0,jsx_runtime.jsxs)(Settings_SettingsSelect, {
              value: localUISettings.interfaceDensity,
              onChange: value => {
                setLocalUISettings({
                  interfaceDensity: value === 'compact' ? 'compact' : 'comfortable'
                });
              },
              dropdownMatchSelectWidth: false,
              children: [/*#__PURE__*/(0,jsx_runtime.jsx)(es_select/* default */.A.Option, {
                value: "comfortable",
                children: t('settings.interface.layoutDensity.comfortable')
              }, "comfortable"), /*#__PURE__*/(0,jsx_runtime.jsx)(es_select/* default */.A.Option, {
                value: "compact",
                children: t('settings.interface.layoutDensity.compact')
              }, "compact")]
            })]
          }), /*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SettingsListItemMeta, {
              title: t('settings.interface.wideLayout.title'),
              description: t('settings.interface.wideLayout.description')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_switch/* default */.A, {
              checked: localUISettings.useWideLayout,
              onChange: checked => {
                setLocalUISettings({
                  useWideLayout: checked
                });
              }
            })]
          }), /*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SettingsListItemMeta, {
              title: t('settings.interface.reduceMotion.title'),
              description: t('settings.interface.reduceMotion.description')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_switch/* default */.A, {
              checked: localUISettings.reduceMotion,
              onChange: checked => {
                setLocalUISettings({
                  reduceMotion: checked
                });
              }
            })]
          }), /*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SettingsListItemMeta, {
              title: t('settings.interface.resetButton'),
              description: t('settings.interface.resetDescription')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(SettingsActionRow, {
              children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
                onClick: () => resetLocalUISettings(),
                children: t('settings.interface.resetButton')
              })
            })]
          })]
        })]
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(SettingsSectionCard, {
        bordered: false,
        children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(Settings_SectionHeading, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SectionTitle, {
            children: t('settings.performance.title')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SectionDescription, {
            children: t('settings.performance.description')
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_alert/* default */.A, {
          showIcon: true,
          type: recommendedSettingsAlreadyApplied ? 'success' : 'info',
          message: t('settings.performance.recommendationTitle', {
            profile: getPerformanceProfileLabel(recommendedLocalUISettings.performanceProfile)
          }),
          description: /*#__PURE__*/(0,jsx_runtime.jsxs)(space/* default */.A, {
            direction: "vertical",
            size: 10,
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)("div", {
              children: performanceRecommendationDescription
            }), /*#__PURE__*/(0,jsx_runtime.jsx)("div", {
              children: t('settings.performance.hardwareSummary', {
                memory: (_runtimeDiagnostics$t = runtimeDiagnostics == null ? void 0 : runtimeDiagnostics.totalMemoryGb) != null ? _runtimeDiagnostics$t : t('settings.performance.values.unknown'),
                npu: (runtimeDiagnostics == null ? void 0 : runtimeDiagnostics.npuName) || (runtimeDiagnostics != null && runtimeDiagnostics.npuDetected ? t('settings.performance.values.detected') : t('settings.performance.values.none'))
              })
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(SettingsActionRow, {
              children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
                type: recommendedSettingsAlreadyApplied ? 'default' : 'primary',
                disabled: recommendedSettingsAlreadyApplied,
                onClick: () => setLocalUISettings({
                  performanceProfile: recommendedLocalUISettings.performanceProfile,
                  aiAccelerationPreference: recommendedLocalUISettings.aiAccelerationPreference,
                  reduceMotion: recommendedLocalUISettings.reduceMotion,
                  useWideLayout: recommendedLocalUISettings.useWideLayout
                }),
                children: t('settings.performance.applyRecommendation')
              })
            })]
          })
        }), /*#__PURE__*/(0,jsx_runtime.jsxs)(SettingsList, {
          itemLayout: "vertical",
          split: false,
          children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SettingsListItemMeta, {
              title: t('settings.performance.profile.title'),
              description: t('settings.performance.profile.description')
            }), /*#__PURE__*/(0,jsx_runtime.jsxs)(Settings_SettingsSelect, {
              value: localUISettings.performanceProfile,
              onChange: value => {
                setLocalUISettings({
                  performanceProfile: value === 'responsive' ? 'responsive' : value === 'efficient' ? 'efficient' : 'balanced'
                });
              },
              dropdownMatchSelectWidth: false,
              children: [/*#__PURE__*/(0,jsx_runtime.jsx)(es_select/* default */.A.Option, {
                value: "balanced",
                children: t('settings.performance.profile.options.balanced')
              }, "balanced"), /*#__PURE__*/(0,jsx_runtime.jsx)(es_select/* default */.A.Option, {
                value: "responsive",
                children: t('settings.performance.profile.options.responsive')
              }, "responsive"), /*#__PURE__*/(0,jsx_runtime.jsx)(es_select/* default */.A.Option, {
                value: "efficient",
                children: t('settings.performance.profile.options.efficient')
              }, "efficient")]
            })]
          }), /*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SettingsListItemMeta, {
              title: t('settings.performance.aiAcceleration.title'),
              description: t('settings.performance.aiAcceleration.description')
            }), /*#__PURE__*/(0,jsx_runtime.jsxs)(Settings_SettingsSelect, {
              value: localUISettings.aiAccelerationPreference,
              onChange: value => {
                setLocalUISettings({
                  aiAccelerationPreference: value === 'prefer-npu' ? 'prefer-npu' : value === 'off' ? 'off' : 'auto'
                });
              },
              dropdownMatchSelectWidth: false,
              children: [/*#__PURE__*/(0,jsx_runtime.jsx)(es_select/* default */.A.Option, {
                value: "auto",
                children: t('settings.performance.aiAcceleration.options.auto')
              }, "auto"), /*#__PURE__*/(0,jsx_runtime.jsx)(es_select/* default */.A.Option, {
                value: "prefer-npu",
                children: t('settings.performance.aiAcceleration.options.preferNpu')
              }, "prefer-npu"), /*#__PURE__*/(0,jsx_runtime.jsx)(es_select/* default */.A.Option, {
                value: "off",
                children: t('settings.performance.aiAcceleration.options.off')
              }, "off")]
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(SettingsNotice, {
              children: t('settings.performance.currentSummary', {
                performance: getPerformanceProfileLabel(localUISettings.performanceProfile),
                acceleration: getAIAccelerationLabel(localUISettings.aiAccelerationPreference)
              })
            })]
          })]
        })]
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(AdvancedSettingsCard, {
        bordered: false,
        children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(Settings_SectionHeading, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SectionTitle, {
            children: t('settings.advancedSettings')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SectionDescription, {
            children: t('settings.advancedDescription')
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(collapse/* default */.A, {
          children: /*#__PURE__*/(0,jsx_runtime.jsx)(collapse/* default */.A.Panel, {
            header: /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
              children: [t('settings.advancedSettings'), ' ', loggingEnabled && /*#__PURE__*/(0,jsx_runtime.jsx)(tooltip/* default */.A, {
                title: t('general.loggingEnabled'),
                placement: "bottom",
                children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_badge/* default */.A, {
                  dot: true,
                  status: "warning"
                })
              })]
            }),
            children: /*#__PURE__*/(0,jsx_runtime.jsxs)(SettingsList, {
              itemLayout: "vertical",
              split: false,
              children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
                children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SettingsListItemMeta, {
                  title: t('settings.hideTrayIcon.title'),
                  description: t('settings.hideTrayIcon.description')
                }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_switch/* default */.A, {
                  checked: appSettings.hideTrayIcon,
                  onChange: checked => {
                    updateAppSettings({
                      appSettings: {
                        hideTrayIcon: checked
                      }
                    });
                  }
                })]
              }), /*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
                children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SettingsListItemMeta, {
                  title: t('settings.alwaysCompileModsLocally.title'),
                  description: t('settings.alwaysCompileModsLocally.description')
                }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_switch/* default */.A, {
                  checked: appSettings.alwaysCompileModsLocally,
                  onChange: checked => {
                    updateAppSettings({
                      appSettings: {
                        alwaysCompileModsLocally: checked
                      }
                    });
                  }
                })]
              }), appSettings.disableRunUIScheduledTask !== null && /*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
                children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SettingsListItemMeta, {
                  title: t('settings.requireElevation.title'),
                  description: t('settings.requireElevation.description')
                }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_switch/* default */.A, {
                  checked: appSettings.disableRunUIScheduledTask,
                  onChange: checked => {
                    updateAppSettings({
                      appSettings: {
                        disableRunUIScheduledTask: checked
                      }
                    });
                  }
                })]
              }), /*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
                children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SettingsListItemMeta, {
                  title: t('settings.dontAutoShowToolkit.title'),
                  description: t('settings.dontAutoShowToolkit.description')
                }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_switch/* default */.A, {
                  checked: appSettings.dontAutoShowToolkit,
                  onChange: checked => {
                    updateAppSettings({
                      appSettings: {
                        dontAutoShowToolkit: checked
                      }
                    });
                  }
                })]
              }), /*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
                children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SettingsListItemMeta, {
                  title: t('settings.modInitDialogDelay.title'),
                  description: t('settings.modInitDialogDelay.description')
                }), /*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SettingInputNumber, {
                  value: 1000 + ((_appSettings$modTasks = appSettings.modTasksDialogDelay) != null ? _appSettings$modTasks : 0),
                  min: 1000 + 400,
                  max: 2147483647,
                  onChange: value => {
                    updateAppSettings({
                      appSettings: {
                        modTasksDialogDelay: Settings_parseIntLax(value) - 1000
                      }
                    });
                  }
                })]
              }), /*#__PURE__*/(0,jsx_runtime.jsx)(list/* default */.Ay.Item, {
                children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_badge/* default */.A, {
                  dot: loggingEnabled,
                  status: "warning",
                  title: loggingEnabled ? t('general.loggingEnabled') : undefined,
                  children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
                    type: "primary",
                    onClick: () => {
                      resetMoreAdvancedSettings();
                      setIsMoreAdvancedSettingsModalOpen(true);
                    },
                    children: t('settings.moreAdvancedSettings.title')
                  })
                })
              })]
            })
          }, "advanced")
        })]
      })]
    }), /*#__PURE__*/(0,jsx_runtime.jsx)(modal/* default */.A, {
      title: t('settings.moreAdvancedSettings.title'),
      open: isMoreAdvancedSettingsModalOpen,
      centered: true,
      bodyStyle: {
        maxHeight: '60vh',
        overflow: 'auto'
      },
      onOk: () => {
        updateAppSettings({
          appSettings: {
            loggingVerbosity: appLoggingVerbosity,
            engine: {
              loggingVerbosity: engineLoggingVerbosity,
              include: Settings_engineProcessListToArray(engineInclude),
              exclude: Settings_engineProcessListToArray(engineExclude),
              injectIntoCriticalProcesses: engineInjectIntoCriticalProcesses,
              injectIntoIncompatiblePrograms: engineInjectIntoIncompatiblePrograms,
              injectIntoGames: engineInjectIntoGames
            }
          }
        });
        setIsMoreAdvancedSettingsModalOpen(false);
      },
      onCancel: () => {
        setIsMoreAdvancedSettingsModalOpen(false);
      },
      okText: t('settings.moreAdvancedSettings.saveButton'),
      cancelText: t('settings.moreAdvancedSettings.cancelButton'),
      children: /*#__PURE__*/(0,jsx_runtime.jsxs)(SettingsList, {
        itemLayout: "vertical",
        split: false,
        children: [/*#__PURE__*/(0,jsx_runtime.jsx)(list/* default */.Ay.Item, {
          children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_alert/* default */.A, {
            description: t('settings.moreAdvancedSettings.restartNotice'),
            type: "info",
            showIcon: true
          })
        }), /*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SettingsListItemMeta, {
            title: t('settings.loggingVerbosity.appLoggingTitle'),
            description: t('settings.loggingVerbosity.description')
          }), /*#__PURE__*/(0,jsx_runtime.jsxs)(Settings_SettingsSelect, {
            value: appLoggingVerbosity,
            onChange: value => {
              setAppLoggingVerbosity(typeof value === 'number' ? value : 0);
            },
            dropdownMatchSelectWidth: false,
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(es_select/* default */.A.Option, {
              value: 0,
              children: t('settings.loggingVerbosity.none')
            }, "none"), /*#__PURE__*/(0,jsx_runtime.jsx)(es_select/* default */.A.Option, {
              value: 1,
              children: t('settings.loggingVerbosity.error')
            }, "error"), /*#__PURE__*/(0,jsx_runtime.jsx)(es_select/* default */.A.Option, {
              value: 2,
              children: t('settings.loggingVerbosity.verbose')
            }, "verbose")]
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SettingsListItemMeta, {
            title: t('settings.loggingVerbosity.engineLoggingTitle'),
            description: t('settings.loggingVerbosity.description')
          }), /*#__PURE__*/(0,jsx_runtime.jsxs)(Settings_SettingsSelect, {
            value: engineLoggingVerbosity,
            onChange: value => {
              setEngineLoggingVerbosity(typeof value === 'number' ? value : 0);
            },
            dropdownMatchSelectWidth: false,
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(es_select/* default */.A.Option, {
              value: 0,
              children: t('settings.loggingVerbosity.none')
            }, "none"), /*#__PURE__*/(0,jsx_runtime.jsx)(es_select/* default */.A.Option, {
              value: 1,
              children: t('settings.loggingVerbosity.error')
            }, "error"), /*#__PURE__*/(0,jsx_runtime.jsx)(es_select/* default */.A.Option, {
              value: 2,
              children: t('settings.loggingVerbosity.verbose')
            }, "verbose")]
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SettingsListItemMeta, {
            title: t('settings.processList.titleExclusion'),
            description: /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
              children: [/*#__PURE__*/(0,jsx_runtime.jsx)("p", {
                children: t('settings.processList.descriptionExclusion')
              }), /*#__PURE__*/(0,jsx_runtime.jsx)("div", {
                children: /*#__PURE__*/(0,jsx_runtime.jsx)(es/* Trans */.x6, {
                  t: t,
                  i18nKey: "settings.processList.descriptionExclusionWiki",
                  components: [/*#__PURE__*/(0,jsx_runtime.jsx)("a", {
                    href: "https://github.com/ramensoftware/windhawk/wiki/Injection-targets-and-critical-system-processes",
                    children: "wiki"
                  })]
                })
              })]
            })
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(TextAreaWithContextMenu, {
            rows: 4,
            value: engineExclude,
            placeholder: t('settings.processList.processListPlaceholder') + '\n' + 'notepad.exe\n' + '%ProgramFiles%\\Notepad++\\notepad++.exe\n' + 'C:\\Windows\\system32\\*',
            onChange: e => {
              setEngineExclude(e.target.value);
            }
          }), engineExclude.match(/["/<>|]/) && /*#__PURE__*/(0,jsx_runtime.jsx)(es_alert/* default */.A, {
            description: t('settings.processList.invalidCharactersWarning', {
              invalidCharacters: '" / < > |'
            }),
            type: "warning",
            showIcon: true
          }), /*#__PURE__*/(0,jsx_runtime.jsxs)(space/* default */.A, {
            direction: "vertical",
            size: "small",
            style: {
              marginTop: '12px'
            },
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(es_checkbox/* default */.A, {
              checked: !engineInjectIntoCriticalProcesses,
              onChange: e => {
                setEngineInjectIntoCriticalProcesses(!e.target.checked);
              },
              children: t('settings.processList.excludeCriticalProcesses')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_checkbox/* default */.A, {
              checked: !engineInjectIntoIncompatiblePrograms,
              onChange: e => {
                setEngineInjectIntoIncompatiblePrograms(!e.target.checked);
              },
              children: t('settings.processList.excludeIncompatiblePrograms')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_checkbox/* default */.A, {
              checked: !engineInjectIntoGames,
              onChange: e => {
                setEngineInjectIntoGames(!e.target.checked);
              },
              children: t('settings.processList.excludeGames')
            })]
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsxs)(list/* default */.Ay.Item, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Settings_SettingsListItemMeta, {
            title: t('settings.processList.titleInclusion'),
            description: t('settings.processList.descriptionInclusion')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(TextAreaWithContextMenu, {
            rows: 4,
            value: engineInclude,
            placeholder: t('settings.processList.processListPlaceholder') + '\n' + 'notepad.exe\n' + '%ProgramFiles%\\Notepad++\\notepad++.exe\n' + 'C:\\Windows\\system32\\*',
            onChange: e => {
              setEngineInclude(e.target.value);
            }
          }), engineInclude.match(/["/<>|]/) && /*#__PURE__*/(0,jsx_runtime.jsx)(es_alert/* default */.A, {
            description: t('settings.processList.invalidCharactersWarning', {
              invalidCharacters: '" / < > |'
            }),
            type: "warning",
            showIcon: true
          }), !includeListEmpty && excludeListEmpty && /*#__PURE__*/(0,jsx_runtime.jsx)(es_alert/* default */.A, {
            description: t('settings.processList.inclusionWithoutExclusionNotice'),
            type: "warning",
            showIcon: true
          }), !includeListEmpty && !excludeListHasWildcard && /*#__PURE__*/(0,jsx_runtime.jsx)(es_alert/* default */.A, {
            description: t('settings.processList.inclusionWithoutTotalExclusionNotice'),
            type: "info",
            showIcon: true
          })]
        })]
      })
    })]
  });
}
/* harmony default export */ const panel_Settings = (Settings);
;// ./src/app/panel/Panel.tsx

var _document$querySelect;
const Panel_excluded = ["ref"];












const PanelContainer = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "Panel__PanelContainer",
  componentId: "sc-80lkzw-0"
})(["display:flex;height:100vh;overflow:hidden;flex-direction:column;background:radial-gradient(circle at top,rgba(23,125,220,0.14),transparent 30%),var(--app-background-color);"]);
const ContentContainerScroll = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "Panel__ContentContainerScroll",
  componentId: "sc-80lkzw-1"
})(["", " position:relative;flex:1;overflow:overlay;"], ({
  $hidden
}) => (0,styled_components_browser_esm/* css */.AH)(["display:", ";"], $hidden ? 'none' : 'flex'));
const ContentContainer = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "Panel__ContentContainer",
  componentId: "sc-80lkzw-2"
})(["width:100%;height:100%;max-width:var(--app-max-width);margin:0 auto;padding:0 var(--app-horizontal-padding) var(--app-section-gap);display:flex;flex-direction:column;"]);
function ContentWrapper(_ref) {
  let {
      ref
    } = _ref,
    props = (0,objectWithoutPropertiesLoose/* default */.A)(_ref, Panel_excluded);
  return /*#__PURE__*/(0,jsx_runtime.jsx)(ContentContainerScroll, Object.assign({
    ref: ref
  }, props, {
    children: /*#__PURE__*/(0,jsx_runtime.jsx)(ContentContainer, {
      children: props.children
    })
  }));
}
function ContentWrapperWithOutlet() {
  return /*#__PURE__*/(0,jsx_runtime.jsx)(ContentWrapper, {
    children: /*#__PURE__*/(0,jsx_runtime.jsx)(chunk_LFPYN7LY/* Outlet */.sv, {})
  });
}
function KeyboardNavigationHandler() {
  const navigate = (0,chunk_LFPYN7LY/* useNavigate */.Zp)();
  (0,react.useEffect)(() => {
    const handleKeyDown = event => {
      // Alt+Left for back navigation
      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        navigate(-1);
      }
      // Alt+Right for forward navigation
      else if (event.altKey && event.key === 'ArrowRight') {
        event.preventDefault();
        navigate(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
  return null;
}
function Layout() {
  return /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [/*#__PURE__*/(0,jsx_runtime.jsx)(KeyboardNavigationHandler, {}), /*#__PURE__*/(0,jsx_runtime.jsx)(panel_SafeModeIndicator, {}), /*#__PURE__*/(0,jsx_runtime.jsx)(panel_AppHeader, {}), /*#__PURE__*/(0,jsx_runtime.jsx)(chunk_LFPYN7LY/* Outlet */.sv, {})]
  });
}

// Must be done before creating the router to ensure the initial route is
// correct.
const bodyParams = (_document$querySelect = document.querySelector('body')) == null ? void 0 : _document$querySelect.getAttribute('data-params');
const previewModId = bodyParams && JSON.parse(bodyParams).previewModId;
if (previewModId) {
  const url = new URL(window.location.href);
  url.hash = '#/mod-preview/' + previewModId;
  window.history.replaceState(null, '', url);
}
const router = (0,chunk_LFPYN7LY/* createHashRouter */.Ge)([{
  element: /*#__PURE__*/(0,jsx_runtime.jsx)(Layout, {}),
  children: [{
    path: '/',
    element: /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(panel_ModsBrowserLocal, {
        ContentWrapper: ContentWrapper
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(panel_CreateNewModButton, {})]
    }),
    children: [{
      path: 'mods/:modType/:modId',
      element: null
    }]
  }, {
    path: '/mod-preview/:modId',
    element: /*#__PURE__*/(0,jsx_runtime.jsx)(panel_ModPreview, {
      ContentWrapper: ContentWrapper
    })
  }, {
    path: '/mods-browser',
    element: /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(panel_ModsBrowserOnline, {
        ContentWrapper: ContentWrapper
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(panel_CreateNewModButton, {})]
    }),
    children: [{
      path: ':modId',
      element: null
    }]
  }, {
    path: '/settings',
    element: /*#__PURE__*/(0,jsx_runtime.jsx)(ContentWrapperWithOutlet, {}, "settings"),
    children: [{
      index: true,
      element: /*#__PURE__*/(0,jsx_runtime.jsx)(panel_Settings, {})
    }]
  }, {
    path: '/about',
    element: /*#__PURE__*/(0,jsx_runtime.jsx)(ContentWrapperWithOutlet, {}, "about"),
    children: [{
      index: true,
      element: /*#__PURE__*/(0,jsx_runtime.jsx)(panel_About, {})
    }]
  }]
}]);
function Panel() {
  return /*#__PURE__*/(0,jsx_runtime.jsx)(PanelContainer, {
    children: /*#__PURE__*/(0,jsx_runtime.jsx)(dom_export/* RouterProvider */.pg, {
      router: router
    })
  });
}
/* harmony default export */ const panel_Panel = (Panel);
;// ./src/app/sidebar/editorModeUtils.ts
function editorModeUtils_normalizeProcessName(process) {
  return process.includes('\\') ? process.substring(process.lastIndexOf('\\') + 1) : process;
}
function summarizeTargetProcesses(include) {
  const targets = (include || []).filter(Boolean);
  if (!targets.length) {
    return 'Not declared yet';
  }
  if (targets.some(target => target === '*' || target.includes('?') || target.includes('*'))) {
    return 'All processes';
  }
  const normalizedTargets = Array.from(new Set(targets.map(target => editorModeUtils_normalizeProcessName(target))));
  if (normalizedTargets.length <= 3) {
    return normalizedTargets.join(', ');
  }
  return `${normalizedTargets[0]} + ${normalizedTargets.length - 1} more`;
}
const DEFAULT_EDITOR_SESSION_STATE = {
  modWasModified: false,
  isModCompiled: false,
  isModDisabled: false,
  isLoggingEnabled: false,
  compilationFailed: false
};
const WINDOWS_ACTIONS = {
  'windows-update': {
    key: 'windows-update',
    title: 'Windows Update',
    description: 'Check the active system build before blaming a draft for shell regressions.',
    uri: 'ms-settings:windowsupdate'
  },
  taskbar: {
    key: 'taskbar',
    title: 'Taskbar settings',
    description: 'Compare native taskbar behavior with the modded shell surface.',
    uri: 'ms-settings:personalization-taskbar'
  },
  start: {
    key: 'start',
    title: 'Start settings',
    description: 'Inspect Start menu layout and defaults before changing shell expectations.',
    uri: 'ms-settings:personalization-start'
  },
  notifications: {
    key: 'notifications',
    title: 'Notifications',
    description: 'Check banners, badges, and notification center behavior against the edited flow.',
    uri: 'ms-settings:notifications'
  },
  sound: {
    key: 'sound',
    title: 'Sound settings',
    description: 'Open baseline audio controls for mods that affect devices, volume, or media surfaces.',
    uri: 'ms-settings:sound'
  },
  'apps-volume': {
    key: 'apps-volume',
    title: 'App volume mixer',
    description: 'Validate per-app routing and volume levels when the mod touches media behavior.',
    uri: 'ms-settings:apps-volume'
  },
  multitasking: {
    key: 'multitasking',
    title: 'Multitasking',
    description: 'Review snap and Alt+Tab defaults before iterating on window-management hooks.',
    uri: 'ms-settings:multitasking'
  },
  colors: {
    key: 'colors',
    title: 'Colors',
    description: 'Check transparency, accent, and theme state against visual shell changes.',
    uri: 'ms-settings:colors'
  },
  typing: {
    key: 'typing',
    title: 'Typing',
    description: 'Inspect native typing and text-input behavior for input or touch-keyboard mods.',
    uri: 'ms-settings:typing'
  }
};
const WINDOWS_SURFACE_RULES = [{
  key: 'explorer-shell',
  label: 'Explorer shell',
  matches: ['explorer.exe'],
  actions: ['taskbar', 'colors', 'notifications']
}, {
  key: 'start-search',
  label: 'Start and search',
  matches: ['startmenuexperiencehost.exe', 'searchhost.exe'],
  actions: ['start', 'taskbar', 'notifications']
}, {
  key: 'notification-host',
  label: 'Notifications and tray',
  matches: ['shellexperiencehost.exe'],
  actions: ['notifications', 'taskbar', 'colors']
}, {
  key: 'window-management',
  label: 'Window management',
  matches: ['dwm.exe', 'applicationframehost.exe'],
  actions: ['multitasking', 'colors', 'taskbar']
}, {
  key: 'audio-media',
  label: 'Audio and media',
  matches: ['sndvol.exe', 'audiodg.exe'],
  actions: ['sound', 'apps-volume', 'notifications']
}, {
  key: 'input',
  label: 'Input and typing',
  matches: ['textinputhost.exe', 'ctfmon.exe', 'tabtip.exe'],
  actions: ['typing', 'colors', 'notifications']
}];
function getNormalizedTargets(include) {
  return Array.from(new Set((include || []).filter(Boolean).map(target => editorModeUtils_normalizeProcessName(target))));
}
function hasWildcardTargets(include) {
  return (include || []).some(target => target === '*' || target.includes('?') || target.includes('*'));
}
function getMatchedWindowsSurfaceRules(include) {
  const targets = getNormalizedTargets(include).map(target => target.toLowerCase());
  return WINDOWS_SURFACE_RULES.filter(rule => rule.matches.some(processName => targets.includes(processName)));
}
function getCurrentCompileProfileKey(state) {
  const sessionState = Object.assign({}, DEFAULT_EDITOR_SESSION_STATE, state);
  if (sessionState.isModDisabled) {
    return sessionState.isLoggingEnabled ? 'disabled-logging' : 'disabled';
  }
  return sessionState.isLoggingEnabled ? 'logging' : 'current';
}
function getEditorWindowsSurfaceLabels(metadata) {
  const matchedRules = getMatchedWindowsSurfaceRules(metadata == null ? void 0 : metadata.include);
  if (matchedRules.length > 0) {
    return matchedRules.map(rule => rule.label);
  }
  if (hasWildcardTargets(metadata == null ? void 0 : metadata.include)) {
    return ['System-wide behavior'];
  }
  if (getNormalizedTargets(metadata == null ? void 0 : metadata.include).length === 0) {
    return ['Windows surfaces'];
  }
  return ['Focused process behavior'];
}
function getEditorWindowsActions(metadata) {
  const matchedRules = getMatchedWindowsSurfaceRules(metadata == null ? void 0 : metadata.include);
  const actionKeys = Array.from(new Set([...(hasWildcardTargets(metadata == null ? void 0 : metadata.include) ? ['windows-update'] : []), ...(matchedRules.length > 0 ? matchedRules.flatMap(rule => rule.actions) : ['windows-update', 'taskbar', 'notifications'])])).slice(0, 4);
  return actionKeys.map(key => WINDOWS_ACTIONS[key]);
}
function getScopeAssessment(include) {
  const targets = getNormalizedTargets(include);
  const wildcardTargets = hasWildcardTargets(include);
  if (!targets.length) {
    return {
      value: 'Targeting not declared',
      detail: 'Keep the first iteration disabled until the intended process scope is explicit.',
      tone: 'caution'
    };
  }
  if (wildcardTargets) {
    return {
      value: 'Broad process reach',
      detail: 'Prefer disabled + logging runs until you prove the mod behaves safely.',
      tone: 'caution'
    };
  }
  if (targets.length === 1) {
    return {
      value: `Focused on ${targets[0]}`,
      detail: 'Start manual checks in the one process the mod is clearly targeting.',
      tone: 'positive'
    };
  }
  if (targets.length <= 3) {
    return {
      value: 'Multi-process scope',
      detail: `Verify each targeted surface separately: ${targets.join(', ')}.`,
      tone: 'neutral'
    };
  }
  return {
    value: 'Wide multi-process scope',
    detail: 'Test each affected process before treating the draft as stable.',
    tone: 'caution'
  };
}
function getRecommendedCompileProfile(metadata, state) {
  const sessionState = Object.assign({}, DEFAULT_EDITOR_SESSION_STATE, state);
  const wildcardTargets = hasWildcardTargets(metadata == null ? void 0 : metadata.include);
  const targetCount = getNormalizedTargets(metadata == null ? void 0 : metadata.include).length;
  if (sessionState.compilationFailed) {
    return {
      key: 'disabled-logging',
      label: 'Compile disabled + logging',
      rationale: 'Recover from build failures with the safest, most observable first run.'
    };
  }
  if (!sessionState.isModCompiled || wildcardTargets || targetCount >= 4) {
    return {
      key: 'disabled-logging',
      label: 'Compile disabled + logging',
      rationale: 'Broad or unverified scope needs a low-risk first run and immediate evidence.'
    };
  }
  if (sessionState.modWasModified && !sessionState.isLoggingEnabled) {
    return {
      key: 'logging',
      label: 'Compile with logging',
      rationale: 'Fresh edits are easier to localize when the first run produces evidence.'
    };
  }
  if (sessionState.isModDisabled) {
    return {
      key: 'disabled',
      label: 'Compile disabled',
      rationale: 'Keep the mod unloaded while you inspect the new binary and metadata.'
    };
  }
  return {
    key: 'current',
    label: 'Compile with current switches',
    rationale: 'The current session already has a stable enough profile to iterate directly.'
  };
}
function buildEditorContextPacket(modId, metadata, state) {
  const sessionState = Object.assign({}, DEFAULT_EDITOR_SESSION_STATE, state);
  const modName = (metadata == null ? void 0 : metadata.name) || modId;
  const version = (metadata == null ? void 0 : metadata.version) || '0.1';
  const scopeSummary = summarizeTargetProcesses(metadata == null ? void 0 : metadata.include);
  const recommendedProfile = getRecommendedCompileProfile(metadata, sessionState);
  return [`Mod name: ${modName}`, `Mod id: ${modId}`, `Target processes: ${scopeSummary}`, `Current version: ${version}`, `Draft changes: ${sessionState.modWasModified ? 'yes' : 'no'}`, `Compiled: ${sessionState.isModCompiled ? 'yes' : 'no'}`, `Disabled after compile: ${sessionState.isModDisabled ? 'yes' : 'no'}`, `Logging enabled: ${sessionState.isLoggingEnabled ? 'yes' : 'no'}`, `Compilation failed recently: ${sessionState.compilationFailed ? 'yes' : 'no'}`, `Recommended next compile profile: ${recommendedProfile.label}`, `Reason: ${recommendedProfile.rationale}`].join('\n');
}
function getEditorEvidenceCards(metadata, state) {
  const sessionState = Object.assign({}, DEFAULT_EDITOR_SESSION_STATE, state);
  const scopeAssessment = getScopeAssessment(metadata == null ? void 0 : metadata.include);
  const recommendedProfile = getRecommendedCompileProfile(metadata, sessionState);
  const nextRunCard = sessionState.compilationFailed ? {
    key: 'next-run',
    label: 'Next run',
    value: 'Stabilize the build first',
    detail: 'Fix the compile failure before trusting any AI-generated change or runtime behavior.',
    tone: 'caution'
  } : !sessionState.isModCompiled ? {
    key: 'next-run',
    label: 'Next run',
    value: recommendedProfile.label,
    detail: recommendedProfile.rationale,
    tone: recommendedProfile.key === 'disabled-logging' ? 'caution' : 'neutral'
  } : sessionState.modWasModified && !sessionState.isLoggingEnabled ? {
    key: 'next-run',
    label: 'Next run',
    value: 'Turn logging on',
    detail: 'Fresh edits need a higher-evidence first run so regressions are easier to localize.',
    tone: 'neutral'
  } : sessionState.isModDisabled ? {
    key: 'next-run',
    label: 'Next run',
    value: 'Preview before enabling',
    detail: 'Keep the mod unloaded while you inspect the effect and log output.',
    tone: 'neutral'
  } : {
    key: 'next-run',
    label: 'Next run',
    value: 'Live verification ready',
    detail: 'Exercise the exact Windows flow you changed and keep notes on regressions.',
    tone: 'positive'
  };
  const releaseCard = sessionState.modWasModified ? {
    key: 'release',
    label: 'Release note',
    value: 'Still needs a summary',
    detail: 'Capture user-visible changes and the checks you ran before treating the draft as done.',
    tone: 'neutral'
  } : !(metadata != null && metadata.version) ? {
    key: 'release',
    label: 'Release note',
    value: 'Version metadata missing',
    detail: 'Set a version before treating the current build as a real release candidate.',
    tone: 'caution'
  } : {
    key: 'release',
    label: 'Release note',
    value: 'Evidence packet ready',
    detail: 'You can now ask AI for docs, release notes, or a final review from stable context.',
    tone: 'positive'
  };
  return [{
    key: 'scope',
    label: 'Scope',
    value: scopeAssessment.value,
    detail: scopeAssessment.detail,
    tone: scopeAssessment.tone
  }, nextRunCard, releaseCard];
}
function getEditorIterationPlan(metadata, state) {
  const sessionState = Object.assign({}, DEFAULT_EDITOR_SESSION_STATE, state);
  const scopeSummary = summarizeTargetProcesses(metadata == null ? void 0 : metadata.include);
  const surfaceSummary = getEditorWindowsSurfaceLabels(metadata).join(', ');
  const recommendedProfile = getRecommendedCompileProfile(metadata, sessionState);
  return [{
    key: 'scope',
    title: 'Frame the change',
    body: `Keep the first validation anchored to ${scopeSummary} and the ${surfaceSummary} surface so one workflow proves or disproves the idea quickly.`
  }, {
    key: 'compile',
    title: recommendedProfile.label,
    body: recommendedProfile.rationale
  }, {
    key: 'verify',
    title: sessionState.modWasModified ? 'Capture evidence before shipping' : 'Keep the verification loop warm',
    body: sessionState.modWasModified ? 'Preview the affected Windows surface, inspect logs, and write down the user-visible effect before the next AI-assisted revision.' : 'Reuse the context pack or test plan when the next change request lands so the reasoning stays grounded in this mod.'
  }];
}
function getEditorVerificationPack(metadata, state) {
  const sessionState = Object.assign({}, DEFAULT_EDITOR_SESSION_STATE, state);
  const targets = getNormalizedTargets(metadata == null ? void 0 : metadata.include);
  const wildcardTargets = hasWildcardTargets(metadata == null ? void 0 : metadata.include);
  const scopeLabel = summarizeTargetProcesses(metadata == null ? void 0 : metadata.include);
  const surfaceSummary = getEditorWindowsSurfaceLabels(metadata).join(', ');
  const firstStep = sessionState.compilationFailed ? {
    key: 'build-health',
    title: 'Fix build health',
    detail: 'Resolve the compile failure before treating any runtime observation as trustworthy.'
  } : {
    key: 'primary-flow',
    title: 'Exercise the primary flow',
    detail: `Run the exact Windows flow affected by ${scopeLabel} across ${surfaceSummary} and note what changed for the user.`
  };
  const scopeStep = wildcardTargets ? {
    key: 'scope',
    title: 'Contain wide scope',
    detail: 'Wildcard targeting means the first live run should stay disabled or heavily logged until you prove safety.'
  } : targets.length > 1 ? {
    key: 'scope',
    title: 'Check each target separately',
    detail: `Do not treat "${scopeLabel}" as one environment. Verify each targeted process on its own.`
  } : {
    key: 'scope',
    title: 'Confirm the intended process',
    detail: `Use ${scopeLabel} as the baseline and confirm the hook does not drift into adjacent shell behavior.`
  };
  const evidenceStep = sessionState.isLoggingEnabled ? {
    key: 'evidence',
    title: 'Capture evidence',
    detail: 'Keep the first logs, screenshots, or user-visible notes so later AI prompts stay grounded in real behavior.'
  } : {
    key: 'evidence',
    title: 'Increase observability',
    detail: 'Turn logging on before the next risky run so regressions are easier to localize.'
  };
  const releaseStep = sessionState.modWasModified ? {
    key: 'release',
    title: 'Write the release delta',
    detail: 'Summarize what changed, what users should verify, and any Windows-build caveats before shipping.'
  } : {
    key: 'release',
    title: 'Keep the release packet warm',
    detail: 'Reuse the checklist and release packet for the next iteration so reviews stay concrete.'
  };
  return [firstStep, scopeStep, evidenceStep, releaseStep];
}
function buildEditorVerificationChecklist(modId, metadata, state) {
  const checklist = getEditorVerificationPack(metadata, state);
  return [`Verification checklist for ${(metadata == null ? void 0 : metadata.name) || modId} (${modId})`, ...checklist.map(item => `- ${item.title}: ${item.detail}`)].join('\n');
}
function buildEditorReleasePacket(modId, metadata, state) {
  return [buildEditorContextPacket(modId, metadata, state), '', buildEditorVerificationChecklist(modId, metadata, state)].join('\n');
}
function buildEditorAiPrompt(kind, modId, metadata, state) {
  const modName = (metadata == null ? void 0 : metadata.name) || modId;
  const targetProcesses = summarizeTargetProcesses(metadata == null ? void 0 : metadata.include);
  const version = (metadata == null ? void 0 : metadata.version) || '0.1';
  const contextPacket = buildEditorContextPacket(modId, metadata, state);
  switch (kind) {
    case 'scaffold':
      return `Help me improve a Windhawk mod in C++.
${contextPacket}
Requirements:
- Keep the Windhawk metadata, readme, and settings blocks valid.
- Explain why each hook target is correct for these processes.
- Preserve safe logging for the first iteration.
- Avoid speculative APIs or hooks that are not justified.
Output:
1. Updated source code
2. Hook-by-hook explanation
3. Manual verification steps`;
    case 'review':
      return `Review this Windhawk mod like a cautious senior engineer.
${contextPacket}
Focus on:
- Crash risks
- Incorrect hook targets
- Missing error handling
- Performance regressions
- Missing manual tests
Output:
1. Findings ordered by severity
2. The most important tests to run next
3. Any metadata or documentation gaps`;
    case 'docs':
      return `Draft documentation for this Windhawk mod update.
${contextPacket}
Include:
- What changed
- What users should verify after installing
- Any compatibility risks or limitations
Output:
1. Readme update
2. Short changelog entry
3. Contributor test checklist`;
    case 'explain-scope':
      return `Explain the scope and likely hook surface of this Windhawk mod.
${contextPacket}
Answer:
1. Which Windows processes and UX surfaces this mod most likely affects
2. Why those targets make sense for the requested behavior
3. What should be verified manually before expanding the scope`;
    case 'test-plan':
      return `Create a practical manual test plan for this Windhawk mod.
${contextPacket}
Focus on realistic Windows interactions, not synthetic unit tests.
Output:
1. A short smoke test sequence
2. Edge cases and rollback checks
3. What logs or screenshots to capture if behavior regresses`;
    case 'release-notes':
      return `Write release-facing notes for this Windhawk mod update.
Mod name: ${modName}
Mod id: ${modId}
Target processes: ${targetProcesses}
Current version: ${version}
Use this context:
${contextPacket}
Output:
1. A concise changelog entry
2. A short 'what to verify' checklist for users
3. Any compatibility or caution notes`;
  }
}
;// ./src/app/sidebar/EditorModeControls.tsx









const SidebarShell = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__SidebarShell",
  componentId: "sc-16inpre-0"
})(["height:100vh;max-height:100vh;display:flex;flex-direction:column;min-height:0;color:var(--vscode-foreground);background:radial-gradient(circle at top,rgba(0,120,212,0.12),transparent 42%),var(--vscode-sideBar-background,var(--vscode-editor-background));"]);
const SidebarScrollArea = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__SidebarScrollArea",
  componentId: "sc-16inpre-1"
})(["flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-gutter:stable;gap:14px;display:flex;flex-direction:column;padding:12px;&::-webkit-scrollbar{width:10px;}&::-webkit-scrollbar-thumb{border-radius:999px;background:rgba(255,255,255,0.18);}"]);
const PanelCard = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.section.withConfig({
  displayName: "EditorModeControls__PanelCard",
  componentId: "sc-16inpre-2"
})(["display:flex;flex-direction:column;gap:12px;padding:14px;border-radius:12px;border:1px solid var(--vscode-widget-border,rgba(255,255,255,0.08));background:linear-gradient( 140deg,", ",rgba(255,255,255,0.015) 46% ),var(--vscode-editor-background);box-shadow:inset 0 1px 0 rgba(255,255,255,0.04);"], ({
  $accent
}) => $accent || 'rgba(255, 255, 255, 0.05)');
const EditorModeControls_HeroEyebrow = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(typography/* default */.A.Text).withConfig({
  displayName: "EditorModeControls__HeroEyebrow",
  componentId: "sc-16inpre-3"
})(["color:var(--vscode-descriptionForeground,rgba(255,255,255,0.65));text-transform:uppercase;letter-spacing:0.05em;font-size:11px;"]);
const EditorModeControls_HeroTitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__HeroTitle",
  componentId: "sc-16inpre-4"
})(["font-size:18px;font-weight:700;line-height:1.3;overflow-wrap:anywhere;"]);
const EditorModeControls_HeroDescription = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(typography/* default */.A.Text).withConfig({
  displayName: "EditorModeControls__HeroDescription",
  componentId: "sc-16inpre-5"
})(["color:var(--vscode-descriptionForeground,rgba(255,255,255,0.7));line-height:1.45;"]);
const InlineActions = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__InlineActions",
  componentId: "sc-16inpre-6"
})(["display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;"]);
const TagRow = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__TagRow",
  componentId: "sc-16inpre-7"
})(["display:flex;flex-wrap:wrap;gap:8px;"]);
const MetaRow = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__MetaRow",
  componentId: "sc-16inpre-8"
})(["display:flex;align-items:center;justify-content:space-between;gap:10px;"]);
const ModIdBox = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.code.withConfig({
  displayName: "EditorModeControls__ModIdBox",
  componentId: "sc-16inpre-9"
})(["display:inline-block;border-radius:999px;padding:4px 10px;background:rgba(255,255,255,0.08);color:var(--vscode-foreground);overflow-wrap:anywhere;"]);
const EditorModeControls_SectionHeader = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__SectionHeader",
  componentId: "sc-16inpre-10"
})(["display:flex;justify-content:space-between;gap:12px;align-items:flex-start;"]);
const SectionKicker = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(typography/* default */.A.Text).withConfig({
  displayName: "EditorModeControls__SectionKicker",
  componentId: "sc-16inpre-11"
})(["color:var(--vscode-descriptionForeground,rgba(255,255,255,0.58));font-size:11px;text-transform:uppercase;letter-spacing:0.06em;"]);
const EditorModeControls_SectionTitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__SectionTitle",
  componentId: "sc-16inpre-12"
})(["font-size:14px;font-weight:700;"]);
const EditorModeControls_SectionDescription = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(typography/* default */.A.Text).withConfig({
  displayName: "EditorModeControls__SectionDescription",
  componentId: "sc-16inpre-13"
})(["color:var(--vscode-descriptionForeground,rgba(255,255,255,0.7));line-height:1.45;"]);
const StatusGrid = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__StatusGrid",
  componentId: "sc-16inpre-14"
})(["display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;"]);
const StatusCard = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__StatusCard",
  componentId: "sc-16inpre-15"
})(["min-width:0;border-radius:10px;padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);"]);
const StatusLabel = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(typography/* default */.A.Text).withConfig({
  displayName: "EditorModeControls__StatusLabel",
  componentId: "sc-16inpre-16"
})(["display:block;color:var(--vscode-descriptionForeground,rgba(255,255,255,0.62));font-size:11px;text-transform:uppercase;letter-spacing:0.04em;"]);
const StatusValue = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__StatusValue",
  componentId: "sc-16inpre-17"
})(["margin-top:6px;font-size:14px;font-weight:600;line-height:1.35;overflow-wrap:anywhere;"]);
const EvidenceGrid = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__EvidenceGrid",
  componentId: "sc-16inpre-18"
})(["display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;"]);
const EvidenceCard = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__EvidenceCard",
  componentId: "sc-16inpre-19"
})(["min-width:0;border-radius:10px;padding:12px;border:1px solid rgba(255,255,255,0.08);background:", ";"], ({
  $tone
}) => $tone === 'positive' ? 'rgba(82, 196, 26, 0.08)' : $tone === 'caution' ? 'rgba(250, 173, 20, 0.08)' : 'rgba(255, 255, 255, 0.03)');
const EvidenceLabel = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(typography/* default */.A.Text).withConfig({
  displayName: "EditorModeControls__EvidenceLabel",
  componentId: "sc-16inpre-20"
})(["display:block;color:var(--vscode-descriptionForeground,rgba(255,255,255,0.62));font-size:11px;text-transform:uppercase;letter-spacing:0.04em;"]);
const EvidenceValue = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__EvidenceValue",
  componentId: "sc-16inpre-21"
})(["margin-top:6px;font-size:14px;font-weight:600;line-height:1.35;overflow-wrap:anywhere;"]);
const EvidenceDetail = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__EvidenceDetail",
  componentId: "sc-16inpre-22"
})(["margin-top:6px;color:var(--vscode-descriptionForeground,rgba(255,255,255,0.72));line-height:1.45;"]);
const SwitchField = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__SwitchField",
  componentId: "sc-16inpre-23"
})(["display:flex;justify-content:space-between;gap:12px;align-items:flex-start;border-radius:10px;padding:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);"]);
const SwitchFieldText = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__SwitchFieldText",
  componentId: "sc-16inpre-24"
})(["display:flex;flex-direction:column;gap:4px;min-width:0;"]);
const SwitchFieldTitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__SwitchFieldTitle",
  componentId: "sc-16inpre-25"
})(["font-size:13px;font-weight:600;"]);
const ActionColumn = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__ActionColumn",
  componentId: "sc-16inpre-26"
})(["display:flex;flex-direction:column;gap:10px;"]);
const ActionGrid = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__ActionGrid",
  componentId: "sc-16inpre-27"
})(["display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;"]);
const CompileButtonBadge = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(es_badge/* default */.A).withConfig({
  displayName: "EditorModeControls__CompileButtonBadge",
  componentId: "sc-16inpre-28"
})(["display:block;cursor:default;> .ant-scroll-number{z-index:3;}"]);
const RecommendationStrip = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__RecommendationStrip",
  componentId: "sc-16inpre-29"
})(["display:flex;flex-direction:column;gap:6px;border-radius:12px;padding:12px;border:1px solid rgba(0,120,212,0.28);background:rgba(0,120,212,0.12);"]);
const RecommendationLabel = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(typography/* default */.A.Text).withConfig({
  displayName: "EditorModeControls__RecommendationLabel",
  componentId: "sc-16inpre-30"
})(["color:rgba(180,220,255,0.9);font-size:11px;text-transform:uppercase;letter-spacing:0.05em;"]);
const RecommendationTitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__RecommendationTitle",
  componentId: "sc-16inpre-31"
})(["font-size:15px;font-weight:700;"]);
const ModeGrid = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__ModeGrid",
  componentId: "sc-16inpre-32"
})(["display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;"]);
const ModeCard = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__ModeCard",
  componentId: "sc-16inpre-33"
})(["display:flex;flex-direction:column;gap:10px;border-radius:10px;padding:12px;background:", ";border:1px solid ", ";"], ({
  $recommended,
  $current
}) => $recommended ? 'rgba(0, 120, 212, 0.14)' : $current ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.03)', ({
  $recommended,
  $current
}) => $recommended ? 'rgba(0, 120, 212, 0.34)' : $current ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.08)');
const ModeCardTitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__ModeCardTitle",
  componentId: "sc-16inpre-34"
})(["font-size:13px;font-weight:600;"]);
const ModeCardBody = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__ModeCardBody",
  componentId: "sc-16inpre-35"
})(["color:var(--vscode-descriptionForeground,rgba(255,255,255,0.72));line-height:1.45;"]);
const WorkflowList = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__WorkflowList",
  componentId: "sc-16inpre-36"
})(["display:flex;flex-direction:column;gap:10px;"]);
const WorkflowItem = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__WorkflowItem",
  componentId: "sc-16inpre-37"
})(["border-radius:10px;padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);"]);
const WorkflowTitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__WorkflowTitle",
  componentId: "sc-16inpre-38"
})(["font-size:13px;font-weight:600;"]);
const WorkflowBody = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__WorkflowBody",
  componentId: "sc-16inpre-39"
})(["margin-top:4px;color:var(--vscode-descriptionForeground,rgba(255,255,255,0.72));line-height:1.45;"]);
const VerificationList = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__VerificationList",
  componentId: "sc-16inpre-40"
})(["display:flex;flex-direction:column;gap:10px;"]);
const VerificationItem = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__VerificationItem",
  componentId: "sc-16inpre-41"
})(["border-radius:10px;padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);"]);
const VerificationTitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__VerificationTitle",
  componentId: "sc-16inpre-42"
})(["font-size:13px;font-weight:600;"]);
const VerificationBody = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__VerificationBody",
  componentId: "sc-16inpre-43"
})(["margin-top:4px;color:var(--vscode-descriptionForeground,rgba(255,255,255,0.72));line-height:1.45;"]);
const WindowsActionGrid = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__WindowsActionGrid",
  componentId: "sc-16inpre-44"
})(["display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;"]);
const WindowsActionCard = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__WindowsActionCard",
  componentId: "sc-16inpre-45"
})(["display:flex;flex-direction:column;gap:10px;border-radius:10px;padding:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);"]);
const WindowsActionTitle = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__WindowsActionTitle",
  componentId: "sc-16inpre-46"
})(["font-size:13px;font-weight:600;"]);
const WindowsActionBody = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__WindowsActionBody",
  componentId: "sc-16inpre-47"
})(["color:var(--vscode-descriptionForeground,rgba(255,255,255,0.72));line-height:1.45;"]);
const FooterBar = /*#__PURE__*/styled_components_browser_esm/* default */.Ay.div.withConfig({
  displayName: "EditorModeControls__FooterBar",
  componentId: "sc-16inpre-48"
})(["display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;border-top:1px solid var(--vscode-widget-border,rgba(255,255,255,0.08));background:linear-gradient(180deg,rgba(255,255,255,0.03),transparent),var(--vscode-sideBar-background,var(--vscode-editor-background));"]);
const FooterText = /*#__PURE__*/(0,styled_components_browser_esm/* default */.Ay)(typography/* default */.A.Text).withConfig({
  displayName: "EditorModeControls__FooterText",
  componentId: "sc-16inpre-49"
})(["color:var(--vscode-descriptionForeground,rgba(255,255,255,0.72));line-height:1.45;"]);
function EditorModeControls({
  initialModDetails,
  onExitEditorMode
}) {
  const {
    t
  } = (0,es/* useTranslation */.Bd)();
  const [modId, setModId] = (0,react.useState)(initialModDetails.modId);
  const [metadata, setMetadata] = (0,react.useState)(initialModDetails.metadata || null);
  const [modWasModified, setModWasModified] = (0,react.useState)(initialModDetails.modWasModified);
  const [isModCompiled, setIsModCompiled] = (0,react.useState)(initialModDetails.compiled);
  const [isModDisabled, setIsModDisabled] = (0,react.useState)(initialModDetails.compiled && initialModDetails.disabled);
  const [isLoggingEnabled, setIsLoggingEnabled] = (0,react.useState)(initialModDetails.compiled && initialModDetails.loggingEnabled);
  const [compilationFailed, setCompilationFailed] = (0,react.useState)(false);
  (0,react.useEffect)(() => {
    setModId(initialModDetails.modId);
    setMetadata(initialModDetails.metadata || null);
    setModWasModified(initialModDetails.modWasModified);
    setIsModCompiled(initialModDetails.compiled);
    setIsModDisabled(initialModDetails.compiled ? initialModDetails.disabled : false);
    setIsLoggingEnabled(initialModDetails.compiled ? initialModDetails.loggingEnabled : false);
  }, [initialModDetails]);
  useSetEditedModId((0,react.useCallback)(data => {
    setModId(data.modId);
  }, []));
  const {
    enableEditedMod
  } = useEnableEditedMod((0,react.useCallback)(data => {
    if (data.succeeded) {
      setIsModDisabled(!data.enabled);
    }
  }, []));
  const {
    enableEditedModLogging
  } = useEnableEditedModLogging((0,react.useCallback)(data => {
    if (data.succeeded) {
      setIsLoggingEnabled(data.enabled);
    }
  }, []));
  const {
    compileEditedMod,
    compileEditedModPending
  } = useCompileEditedMod((0,react.useCallback)(data => {
    if (data.succeeded) {
      if (data.clearModified) {
        setModWasModified(false);
      }
      setCompilationFailed(false);
      setIsModCompiled(true);
    } else {
      setCompilationFailed(true);
    }
  }, []));
  const {
    exitEditorMode
  } = useExitEditorMode((0,react.useCallback)(data => {
    if (data.succeeded) {
      onExitEditorMode == null || onExitEditorMode();
    }
  }, [onExitEditorMode]));
  const {
    openExternal,
    openExternalPending
  } = useOpenExternal((0,react.useCallback)(data => {
    if (!data.succeeded) {
      message/* default */.Ay.error(data.error || t('sidebar.openError'));
    }
  }, [t]));
  const runCompile = (0,react.useCallback)(options => {
    var _options$disabled, _options$loggingEnabl;
    if (compileEditedModPending) {
      return;
    }
    const disabled = (_options$disabled = options == null ? void 0 : options.disabled) != null ? _options$disabled : isModDisabled;
    const loggingEnabled = (_options$loggingEnabl = options == null ? void 0 : options.loggingEnabled) != null ? _options$loggingEnabl : isLoggingEnabled;
    setIsModDisabled(disabled);
    setIsLoggingEnabled(loggingEnabled);
    setCompilationFailed(false);
    compileEditedMod({
      disabled,
      loggingEnabled
    });
  }, [compileEditedMod, compileEditedModPending, isLoggingEnabled, isModDisabled]);
  useCompileEditedModStart((0,react.useCallback)(() => {
    runCompile();
  }, [runCompile]));
  useEditedModWasModified((0,react.useCallback)(() => {
    setModWasModified(true);
    setCompilationFailed(false);
  }, []));
  const displayName = (metadata == null ? void 0 : metadata.name) || modId;
  const scopeSummary = (0,react.useMemo)(() => summarizeTargetProcesses(metadata == null ? void 0 : metadata.include), [metadata == null ? void 0 : metadata.include]);
  const editorSessionState = (0,react.useMemo)(() => ({
    modWasModified,
    isModCompiled,
    isModDisabled,
    isLoggingEnabled,
    compilationFailed
  }), [compilationFailed, isLoggingEnabled, isModCompiled, isModDisabled, modWasModified]);
  const buildStatus = compileEditedModPending ? t('sidebar.status.compiling') : compilationFailed ? t('sidebar.status.needsAttention') : isModCompiled ? t('sidebar.status.compiled') : t('sidebar.status.notCompiled');
  const stateStatus = modWasModified ? t('sidebar.status.modified') : t('sidebar.status.synced');
  const runtimeStatus = isModDisabled ? t('sidebar.status.disabled') : t('sidebar.status.enabled');
  const evidenceCards = (0,react.useMemo)(() => getEditorEvidenceCards(metadata, editorSessionState), [editorSessionState, metadata]);
  const recommendedCompileProfile = (0,react.useMemo)(() => getRecommendedCompileProfile(metadata, editorSessionState), [editorSessionState, metadata]);
  const workflowItems = (0,react.useMemo)(() => getEditorIterationPlan(metadata, editorSessionState), [editorSessionState, metadata]);
  const verificationItems = (0,react.useMemo)(() => getEditorVerificationPack(metadata, editorSessionState), [editorSessionState, metadata]);
  const contextPacket = (0,react.useMemo)(() => buildEditorContextPacket(modId, metadata, editorSessionState), [editorSessionState, metadata, modId]);
  const currentCompileProfileKey = (0,react.useMemo)(() => getCurrentCompileProfileKey(editorSessionState), [editorSessionState]);
  const windowsSurfaceLabels = (0,react.useMemo)(() => getEditorWindowsSurfaceLabels(metadata), [metadata]);
  const windowsActions = (0,react.useMemo)(() => getEditorWindowsActions(metadata), [metadata]);
  const copyTextWithFeedback = async (text, successMessage) => {
    try {
      await copyTextToClipboard(text);
      message/* default */.Ay.success(successMessage);
    } catch (error) {
      console.error('Failed to copy editor helper text:', error);
      message/* default */.Ay.error(t('sidebar.copyError'));
    }
  };
  const getCompileProfileLabel = (0,react.useCallback)(key => {
    switch (key) {
      case 'disabled':
        return t('sidebar.compileMenu.disabled');
      case 'logging':
        return t('sidebar.compileMenu.logging');
      case 'disabled-logging':
        return t('sidebar.compileMenu.disabledLogging');
      case 'current':
      default:
        return t('sidebar.compileMenu.current');
    }
  }, [t]);
  const compileProfileMode = getCompileProfileLabel(currentCompileProfileKey);
  const windowsSurfaceSummary = windowsSurfaceLabels.join(', ');
  const runCompileProfile = (0,react.useCallback)(profileKey => {
    switch (profileKey) {
      case 'disabled':
        runCompile({
          disabled: true,
          loggingEnabled: false
        });
        break;
      case 'logging':
        runCompile({
          disabled: false,
          loggingEnabled: true
        });
        break;
      case 'disabled-logging':
        runCompile({
          disabled: true,
          loggingEnabled: true
        });
        break;
      case 'current':
      default:
        runCompile();
        break;
    }
  }, [runCompile]);
  const runRecommendedCompile = (0,react.useCallback)(() => {
    switch (recommendedCompileProfile.key) {
      case 'disabled':
      case 'logging':
      case 'disabled-logging':
      case 'current':
      default:
        runCompileProfile(recommendedCompileProfile.key);
        break;
    }
  }, [recommendedCompileProfile.key, runCompileProfile]);
  const openWindowsSurface = (0,react.useCallback)(uri => {
    openExternal({
      uri
    });
  }, [openExternal]);
  const compileModeCards = (0,react.useMemo)(() => [{
    key: 'current',
    label: t('sidebar.compileMenu.current'),
    description: t('sidebar.compileModes.currentDescription', {
      mode: compileProfileMode
    })
  }, {
    key: 'disabled',
    label: t('sidebar.compileMenu.disabled'),
    description: t('sidebar.compileModes.disabledDescription')
  }, {
    key: 'logging',
    label: t('sidebar.compileMenu.logging'),
    description: t('sidebar.compileModes.loggingDescription')
  }, {
    key: 'disabled-logging',
    label: t('sidebar.compileMenu.disabledLogging'),
    description: t('sidebar.compileModes.disabledLoggingDescription')
  }], [compileProfileMode, t]);
  return /*#__PURE__*/(0,jsx_runtime.jsxs)(SidebarShell, {
    children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(SidebarScrollArea, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(PanelCard, {
        $accent: "rgba(0, 120, 212, 0.16)",
        children: [/*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_HeroEyebrow, {
          children: t('sidebar.editorTitle')
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_HeroTitle, {
          children: displayName
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_HeroDescription, {
          children: t('sidebar.editorDescription')
        }), /*#__PURE__*/(0,jsx_runtime.jsxs)(TagRow, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(tag/* default */.A, {
            color: modWasModified ? 'gold' : 'green',
            children: stateStatus
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(tag/* default */.A, {
            color: compilationFailed ? 'red' : isModCompiled ? 'blue' : 'default',
            children: buildStatus
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(tag/* default */.A, {
            color: isModDisabled ? 'default' : 'cyan',
            children: runtimeStatus
          }), isLoggingEnabled && /*#__PURE__*/(0,jsx_runtime.jsx)(tag/* default */.A, {
            color: "purple",
            children: t('sidebar.loggingTag')
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsxs)(MetaRow, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(tooltip/* default */.A, {
            title: t('sidebar.modId'),
            placement: "bottom",
            children: /*#__PURE__*/(0,jsx_runtime.jsx)(ModIdBox, {
              children: modId
            })
          }), /*#__PURE__*/(0,jsx_runtime.jsxs)(InlineActions, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
              size: "small",
              onClick: () => copyTextWithFeedback(modId, t('sidebar.copyModIdSuccess')),
              children: t('sidebar.copyModId')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(PopconfirmModal, {
              placement: "bottom",
              disabled: !(modWasModified && !isModCompiled) || compileEditedModPending,
              title: t('sidebar.exitConfirmation'),
              okText: t('sidebar.exitButtonOk'),
              cancelText: t('sidebar.exitButtonCancel'),
              onConfirm: () => exitEditorMode({
                saveToDrafts: false
              }),
              children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
                size: "small",
                danger: true,
                disabled: compileEditedModPending,
                onClick: modWasModified && !isModCompiled ? undefined : () => exitEditorMode({
                  saveToDrafts: modWasModified
                }),
                children: t('sidebar.exit')
              })
            })]
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(TagRow, {
          children: windowsSurfaceLabels.map(surfaceLabel => /*#__PURE__*/(0,jsx_runtime.jsx)(tag/* default */.A, {
            children: surfaceLabel
          }, surfaceLabel))
        })]
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(PanelCard, {
        $accent: "rgba(0, 188, 140, 0.14)",
        children: [/*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionHeader, {
          children: /*#__PURE__*/(0,jsx_runtime.jsxs)("div", {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SectionKicker, {
              children: t('sidebar.sectionKickers.status')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionTitle, {
              children: t('sidebar.sections.status')
            })]
          })
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionDescription, {
          children: t('sidebar.sections.statusDescription')
        }), /*#__PURE__*/(0,jsx_runtime.jsxs)(StatusGrid, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(StatusCard, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(StatusLabel, {
              children: t('sidebar.cards.state')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(StatusValue, {
              children: stateStatus
            })]
          }), /*#__PURE__*/(0,jsx_runtime.jsxs)(StatusCard, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(StatusLabel, {
              children: t('sidebar.cards.build')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(StatusValue, {
              children: buildStatus
            })]
          }), /*#__PURE__*/(0,jsx_runtime.jsxs)(StatusCard, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(StatusLabel, {
              children: t('sidebar.cards.scope')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(StatusValue, {
              children: scopeSummary
            })]
          }), /*#__PURE__*/(0,jsx_runtime.jsxs)(StatusCard, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(StatusLabel, {
              children: t('sidebar.cards.version')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(StatusValue, {
              children: (metadata == null ? void 0 : metadata.version) || t('sidebar.unknownValue')
            })]
          }), /*#__PURE__*/(0,jsx_runtime.jsxs)(StatusCard, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(StatusLabel, {
              children: t('sidebar.cards.surface')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(StatusValue, {
              children: windowsSurfaceSummary
            })]
          }), /*#__PURE__*/(0,jsx_runtime.jsxs)(StatusCard, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(StatusLabel, {
              children: t('sidebar.cards.nextCompile')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(StatusValue, {
              children: recommendedCompileProfile.label
            })]
          })]
        })]
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(PanelCard, {
        $accent: "rgba(250, 173, 20, 0.14)",
        children: [/*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionHeader, {
          children: /*#__PURE__*/(0,jsx_runtime.jsxs)("div", {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SectionKicker, {
              children: t('sidebar.sectionKickers.evidence')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionTitle, {
              children: t('sidebar.sections.evidence')
            })]
          })
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionDescription, {
          children: t('sidebar.sections.evidenceDescription')
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(EvidenceGrid, {
          children: evidenceCards.map(card => /*#__PURE__*/(0,jsx_runtime.jsxs)(EvidenceCard, {
            $tone: card.tone,
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(EvidenceLabel, {
              children: card.label
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(EvidenceValue, {
              children: card.value
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(EvidenceDetail, {
              children: card.detail
            })]
          }, card.key))
        })]
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(PanelCard, {
        $accent: "rgba(0, 120, 212, 0.16)",
        children: [/*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionHeader, {
          children: /*#__PURE__*/(0,jsx_runtime.jsxs)("div", {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SectionKicker, {
              children: t('sidebar.sectionKickers.controls')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionTitle, {
              children: t('sidebar.sections.controls')
            })]
          })
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionDescription, {
          children: t('sidebar.sections.controlsDescription', {
            mode: compileProfileMode
          })
        }), /*#__PURE__*/(0,jsx_runtime.jsxs)(RecommendationStrip, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(RecommendationLabel, {
            children: t('sidebar.recommendationLabel')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(RecommendationTitle, {
            children: recommendedCompileProfile.label
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionDescription, {
            children: recommendedCompileProfile.rationale
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(CompileButtonBadge, {
          count: compilationFailed ? '!' : undefined,
          size: compilationFailed ? 'small' : undefined,
          title: compilationFailed ? t('sidebar.compilationFailed') : undefined,
          dot: modWasModified && !compilationFailed,
          status: modWasModified && !compilationFailed ? 'warning' : undefined,
          children: compileEditedModPending ? /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
            block: true,
            danger: true,
            onClick: () => stopCompileEditedMod(),
            children: t('sidebar.stopCompilation')
          }) : /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
            block: true,
            type: "primary",
            onClick: () => runRecommendedCompile(),
            children: t('sidebar.runRecommendedCompile')
          })
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(ModeGrid, {
          children: compileModeCards.map(modeCard => /*#__PURE__*/(0,jsx_runtime.jsxs)(ModeCard, {
            $current: currentCompileProfileKey === modeCard.key,
            $recommended: recommendedCompileProfile.key === modeCard.key,
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(ModeCardTitle, {
              children: modeCard.label
            }), /*#__PURE__*/(0,jsx_runtime.jsxs)(TagRow, {
              children: [currentCompileProfileKey === modeCard.key && /*#__PURE__*/(0,jsx_runtime.jsx)(tag/* default */.A, {
                color: "blue",
                children: t('sidebar.compileModes.active')
              }), recommendedCompileProfile.key === modeCard.key && /*#__PURE__*/(0,jsx_runtime.jsx)(tag/* default */.A, {
                color: "green",
                children: t('sidebar.compileModes.recommended')
              })]
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(ModeCardBody, {
              children: modeCard.description
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
              block: true,
              size: "small",
              type: recommendedCompileProfile.key === modeCard.key ? 'primary' : 'default',
              disabled: compileEditedModPending,
              onClick: () => runCompileProfile(modeCard.key),
              children: t('sidebar.compileModes.runMode')
            })]
          }, modeCard.key))
        }), /*#__PURE__*/(0,jsx_runtime.jsxs)(SwitchField, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(SwitchFieldText, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SwitchFieldTitle, {
              children: t('sidebar.enableMod')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionDescription, {
              children: t('sidebar.descriptions.enableMod')
            })]
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(tooltip/* default */.A, {
            title: !isModCompiled && t('sidebar.notCompiled'),
            placement: "bottomRight",
            children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_switch/* default */.A, {
              checked: !isModDisabled,
              disabled: !isModCompiled,
              onChange: checked => enableEditedMod({
                enable: checked
              })
            })
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsxs)(SwitchField, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(SwitchFieldText, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SwitchFieldTitle, {
              children: t('sidebar.enableLogging')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionDescription, {
              children: t('sidebar.descriptions.enableLogging')
            })]
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(tooltip/* default */.A, {
            title: !isModCompiled && t('sidebar.notCompiled'),
            placement: "bottomRight",
            children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_switch/* default */.A, {
              checked: isLoggingEnabled,
              disabled: !isModCompiled,
              onChange: checked => enableEditedModLogging({
                enable: checked
              })
            })
          })]
        }), /*#__PURE__*/(0,jsx_runtime.jsxs)(ActionGrid, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(tooltip/* default */.A, {
            title: !isModCompiled && t('sidebar.notCompiled'),
            children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
              block: true,
              disabled: !isModCompiled,
              onClick: () => previewEditedMod(),
              children: t('sidebar.preview')
            })
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
            block: true,
            onClick: () => showLogOutput(),
            children: t('sidebar.showLogOutput')
          })]
        })]
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(PanelCard, {
        $accent: "rgba(56, 142, 60, 0.14)",
        children: [/*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionHeader, {
          children: /*#__PURE__*/(0,jsx_runtime.jsxs)("div", {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SectionKicker, {
              children: t('sidebar.sectionKickers.windows')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionTitle, {
              children: t('sidebar.sections.windows')
            })]
          })
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionDescription, {
          children: t('sidebar.sections.windowsDescription')
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(WindowsActionGrid, {
          children: windowsActions.map(action => /*#__PURE__*/(0,jsx_runtime.jsxs)(WindowsActionCard, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(WindowsActionTitle, {
              children: action.title
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(WindowsActionBody, {
              children: action.description
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
              block: true,
              size: "small",
              disabled: openExternalPending,
              onClick: () => openWindowsSurface(action.uri),
              children: t('sidebar.windows.open')
            })]
          }, action.key))
        })]
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(PanelCard, {
        $accent: "rgba(82, 196, 26, 0.14)",
        children: [/*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionHeader, {
          children: /*#__PURE__*/(0,jsx_runtime.jsxs)("div", {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SectionKicker, {
              children: t('sidebar.sectionKickers.verification')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionTitle, {
              children: t('sidebar.sections.verification')
            })]
          })
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionDescription, {
          children: t('sidebar.sections.verificationDescription')
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(VerificationList, {
          children: verificationItems.map(item => /*#__PURE__*/(0,jsx_runtime.jsxs)(VerificationItem, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(VerificationTitle, {
              children: item.title
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(VerificationBody, {
              children: item.detail
            })]
          }, item.key))
        }), /*#__PURE__*/(0,jsx_runtime.jsxs)(ActionGrid, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
            block: true,
            onClick: () => copyTextWithFeedback(buildEditorVerificationChecklist(modId, metadata, editorSessionState), t('sidebar.verification.copiedChecklist')),
            children: t('sidebar.verification.copyChecklist')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
            block: true,
            onClick: () => copyTextWithFeedback(buildEditorReleasePacket(modId, metadata, editorSessionState), t('sidebar.verification.copiedReleasePacket')),
            children: t('sidebar.verification.copyReleasePacket')
          })]
        })]
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(PanelCard, {
        $accent: "rgba(255, 140, 0, 0.14)",
        children: [/*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionHeader, {
          children: /*#__PURE__*/(0,jsx_runtime.jsxs)("div", {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SectionKicker, {
              children: t('sidebar.sectionKickers.ai')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionTitle, {
              children: t('sidebar.sections.ai')
            })]
          })
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionDescription, {
          children: t('sidebar.sections.aiDescription')
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(ActionColumn, {
          children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
            block: true,
            type: "primary",
            onClick: () => copyTextWithFeedback(contextPacket, t('sidebar.ai.copiedContextPack')),
            children: t('sidebar.ai.contextPack')
          })
        }), /*#__PURE__*/(0,jsx_runtime.jsxs)(ActionGrid, {
          children: [/*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
            block: true,
            onClick: () => copyTextWithFeedback(buildEditorAiPrompt('scaffold', modId, metadata, editorSessionState), t('sidebar.ai.copiedScaffold')),
            children: t('sidebar.ai.scaffold')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
            block: true,
            onClick: () => copyTextWithFeedback(buildEditorAiPrompt('review', modId, metadata, editorSessionState), t('sidebar.ai.copiedReview')),
            children: t('sidebar.ai.review')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
            block: true,
            onClick: () => copyTextWithFeedback(buildEditorAiPrompt('explain-scope', modId, metadata, editorSessionState), t('sidebar.ai.copiedExplainScope')),
            children: t('sidebar.ai.explainScope')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
            block: true,
            onClick: () => copyTextWithFeedback(buildEditorAiPrompt('test-plan', modId, metadata, editorSessionState), t('sidebar.ai.copiedTestPlan')),
            children: t('sidebar.ai.testPlan')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
            block: true,
            onClick: () => copyTextWithFeedback(buildEditorAiPrompt('docs', modId, metadata, editorSessionState), t('sidebar.ai.copiedDocs')),
            children: t('sidebar.ai.docs')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
            block: true,
            onClick: () => copyTextWithFeedback(buildEditorAiPrompt('release-notes', modId, metadata, editorSessionState), t('sidebar.ai.copiedReleaseNotes')),
            children: t('sidebar.ai.releaseNotes')
          }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
            block: true,
            onClick: () => copyTextWithFeedback(contextPacket, t('sidebar.ai.copiedBrief')),
            children: t('sidebar.ai.brief')
          })]
        })]
      }), /*#__PURE__*/(0,jsx_runtime.jsxs)(PanelCard, {
        $accent: "rgba(255, 99, 71, 0.14)",
        children: [/*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionHeader, {
          children: /*#__PURE__*/(0,jsx_runtime.jsxs)("div", {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SectionKicker, {
              children: t('sidebar.sectionKickers.workflow')
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionTitle, {
              children: t('sidebar.sections.workflow')
            })]
          })
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(EditorModeControls_SectionDescription, {
          children: t('sidebar.sections.workflowDescription')
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(WorkflowList, {
          children: workflowItems.map(item => /*#__PURE__*/(0,jsx_runtime.jsxs)(WorkflowItem, {
            children: [/*#__PURE__*/(0,jsx_runtime.jsx)(WorkflowTitle, {
              children: item.title
            }), /*#__PURE__*/(0,jsx_runtime.jsx)(WorkflowBody, {
              children: item.body
            })]
          }, item.key))
        })]
      })]
    }), /*#__PURE__*/(0,jsx_runtime.jsxs)(FooterBar, {
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(FooterText, {
        children: t('sidebar.footerNote')
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(PopconfirmModal, {
        placement: "top",
        disabled: !(modWasModified && !isModCompiled) || compileEditedModPending,
        title: t('sidebar.exitConfirmation'),
        okText: t('sidebar.exitButtonOk'),
        cancelText: t('sidebar.exitButtonCancel'),
        onConfirm: () => exitEditorMode({
          saveToDrafts: false
        }),
        children: /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.A, {
          type: "primary",
          danger: true,
          disabled: compileEditedModPending,
          onClick: modWasModified && !isModCompiled ? undefined : () => exitEditorMode({
            saveToDrafts: modWasModified
          }),
          children: t('sidebar.exit')
        })
      })]
    })]
  });
}
/* harmony default export */ const sidebar_EditorModeControls = (EditorModeControls);
;// ./src/app/sidebar/mockData.ts

const mockData_useMockData = !app_vsCodeApi;
const mockSidebarModDetails = !mockData_useMockData ? null : {
  modId: 'new-mod-test',
  modWasModified: false,
  compiled: true,
  metadata: {
    name: 'New Mod Test',
    version: '0.1',
    include: ['mspaint.exe']
  },
  disabled: false,
  loggingEnabled: false,
  debugLoggingEnabled: false
};
;// ./src/app/sidebar/Sidebar.tsx





function Sidebar() {
  const [modDetails, setModDetails] = (0,react.useState)(mockSidebarModDetails);
  (0,react.useEffect)(() => {
    getInitialSidebarParams();
  }, []);
  useSetEditedModDetails((0,react.useCallback)(data => {
    if (!data.modDetails) {
      setModDetails({
        modId: data.modId,
        modWasModified: data.modWasModified,
        metadata: data.metadata || undefined,
        compiled: false
      });
    } else {
      setModDetails({
        modId: data.modId,
        modWasModified: data.modWasModified,
        metadata: data.metadata || undefined,
        compiled: true,
        disabled: data.modDetails.disabled,
        loggingEnabled: data.modDetails.loggingEnabled,
        debugLoggingEnabled: data.modDetails.debugLoggingEnabled
      });
    }
  }, []));
  const onExitEditorMode = (0,react.useCallback)(() => {
    setModDetails(null);
  }, []);
  if (!modDetails) {
    return null;
  }
  return /*#__PURE__*/(0,jsx_runtime.jsx)(sidebar_EditorModeControls, {
    initialModDetails: modDetails,
    onExitEditorMode: onExitEditorMode
  }, modDetails.modId);
}
/* harmony default export */ const sidebar_Sidebar = (Sidebar);
;// ./src/app/app.tsx













function WhenTranslationIsReady(props) {
  const {
    ready
  } = (0,es/* useTranslation */.Bd)();
  // https://stackoverflow.com/a/63898849
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return ready ? /*#__PURE__*/(0,jsx_runtime.jsx)(jsx_runtime.Fragment, {
    children: props.children
  }) : null;
}
function App() {
  const content = (0,react.useMemo)(() => {
    var _document$querySelect, _document$querySelect2;
    return (_document$querySelect = (_document$querySelect2 = document.querySelector('body')) == null ? void 0 : _document$querySelect2.getAttribute('data-content')) != null ? _document$querySelect : document.location.hash === '#/debug_sidebar' ? 'sidebar' : 'panel';
  }, []);
  const [extensionAppUISettings, setExtensionAppUISettings] = (0,react.useState)(null);
  const [localUISettings, setLocalUISettingsState] = (0,react.useState)(() => readLocalUISettings());
  const [direction, setDirection] = (0,react.useState)('ltr');
  const applyNewLanguage = (0,react.useCallback)(language => {
    setLanguage(language);
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    if (language && rtlLanguages.includes(language.split('-')[0])) {
      setDirection('rtl');
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      setDirection('ltr');
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, []);
  (0,react.useEffect)(() => {
    applyNewLanguage(extensionAppUISettings == null ? void 0 : extensionAppUISettings.language);
  }, [applyNewLanguage, extensionAppUISettings == null ? void 0 : extensionAppUISettings.language]);
  (0,react.useEffect)(() => {
    const effectiveReduceMotion = localUISettings.reduceMotion || localUISettings.performanceProfile === 'efficient';
    document.documentElement.setAttribute('data-windhawk-density', localUISettings.interfaceDensity);
    document.documentElement.setAttribute('data-windhawk-reduce-motion', String(effectiveReduceMotion));
    document.documentElement.setAttribute('data-windhawk-layout', localUISettings.useWideLayout ? 'wide' : 'default');
    document.documentElement.setAttribute('data-windhawk-performance', localUISettings.performanceProfile);
    document.documentElement.setAttribute('data-windhawk-ai-acceleration', localUISettings.aiAccelerationPreference);
  }, [localUISettings]);
  const setLocalUISettings = (0,react.useCallback)(updates => {
    setLocalUISettingsState(current => {
      const next = mergeLocalUISettings(current, updates);
      writeLocalUISettings(next);
      return next;
    });
  }, []);
  const resetLocalUISettings = (0,react.useCallback)(() => {
    setLocalUISettingsState(defaultLocalUISettings);
    writeLocalUISettings(defaultLocalUISettings);
  }, []);
  const {
    getInitialAppSettings
  } = useGetInitialAppSettings((0,react.useCallback)(data => {
    setExtensionAppUISettings(data.appUISettings || {});
  }, []));
  (0,react.useEffect)(() => {
    if (!useMockData) {
      getInitialAppSettings({});
    } else {
      setExtensionAppUISettings(mockAppUISettings || {});
    }
  }, [getInitialAppSettings]);
  useSetNewAppSettings((0,react.useCallback)(data => {
    setExtensionAppUISettings(current => Object.assign({}, current != null ? current : {}, data.appUISettings || {}));
  }, []));
  const appUISettings = (0,react.useMemo)(() => extensionAppUISettings ? Object.assign({}, extensionAppUISettings, {
    localUISettings,
    setLocalUISettings,
    resetLocalUISettings
  }) : null, [extensionAppUISettings, localUISettings, setLocalUISettings, resetLocalUISettings]);
  if (!content || !appUISettings) {
    return null;
  }
  return /*#__PURE__*/(0,jsx_runtime.jsx)(WhenTranslationIsReady, {
    children: /*#__PURE__*/(0,jsx_runtime.jsx)(AppUISettingsContext.Provider, {
      value: appUISettings,
      children: /*#__PURE__*/(0,jsx_runtime.jsx)(config_provider/* default */.Ay, {
        direction: direction,
        children: content === 'panel' ? /*#__PURE__*/(0,jsx_runtime.jsx)(panel_Panel, {}) : content === 'sidebar' ? /*#__PURE__*/(0,jsx_runtime.jsx)(sidebar_Sidebar, {}) : ''
      })
    })
  });
}
/* harmony default export */ const app = (App);
;// ./src/main.tsx





const root = client/* createRoot */.H(document.getElementById('root'));
root.render(/*#__PURE__*/(0,jsx_runtime.jsx)(react.StrictMode, {
  children: /*#__PURE__*/(0,jsx_runtime.jsx)(app, {})
}));

/***/ }

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ __webpack_require__.O(0, [502], () => (__webpack_exec__(93548)));
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=main.js.map