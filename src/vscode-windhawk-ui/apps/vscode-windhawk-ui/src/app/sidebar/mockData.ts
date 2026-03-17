import vsCodeApi from '../vsCodeApi';

export const useMockData = !vsCodeApi;

export const mockSidebarModDetails = !useMockData
  ? null
  : {
      modId: 'new-mod-test',
      modWasModified: false,
      compiled: true,
      metadata: {
        name: 'New Mod Test',
        version: '0.1',
        include: ['mspaint.exe'],
      },
      disabled: false,
      loggingEnabled: false,
      debugLoggingEnabled: false,
    };
