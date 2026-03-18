import vsCodeApi from '../vsCodeApi';
import { EditorLaunchContext } from '../webviewIPCMessages';

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
      launchContext: {
        kind: 'workflow',
        title: 'Shell investigation sprint',
        summary:
          'Carry the starter, checklist, and CLI context into the editor instead of dropping into a blank draft.',
        templateKey: 'explorer-shell',
        studioMode: 'code',
        authoringLanguage: 'cpp',
        checklist: [
          'Confirm the target shell surface before the first compile.',
          'Start with logging enabled if the scope is not yet proven.',
        ],
        tools: [
          {
            key: 'status',
            title: 'Inspect status',
            command: 'python scripts\\windhawk_tool.py --json status',
          },
        ],
        prompts: [
          {
            key: 'review',
            title: 'Review prompt',
          },
        ],
        packet: 'Launch: Shell investigation sprint',
      } as EditorLaunchContext,
      disabled: false,
      loggingEnabled: false,
      debugLoggingEnabled: false,
    };
