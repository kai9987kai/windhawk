/* eslint-disable */
export default {
  displayName: 'vscode-windhawk-ui',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nrwl/react/babel'] }],
  },
  moduleNameMapper: {
    '^monaco-editor/esm/vs/editor/editor.api$':
      '<rootDir>/src/test/monacoEditorApiMock.cjs',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/vscode-windhawk-ui',
};
