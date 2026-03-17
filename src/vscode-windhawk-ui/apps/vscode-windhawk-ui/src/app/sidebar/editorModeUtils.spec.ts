import {
  buildEditorAiPrompt,
  buildEditorContextPacket,
  buildEditorReleasePacket,
  buildEditorVerificationChecklist,
  getEditorEvidenceCards,
  getEditorIterationPlan,
  getEditorVerificationPack,
  getRecommendedCompileProfile,
  summarizeTargetProcesses,
} from './editorModeUtils';

describe('editorModeUtils', () => {
  it('summarizes process targets for a focused mod', () => {
    expect(summarizeTargetProcesses(['explorer.exe'])).toBe('explorer.exe');
    expect(
      summarizeTargetProcesses(['C:\\Windows\\explorer.exe', 'notepad.exe'])
    ).toBe('explorer.exe, notepad.exe');
  });

  it('treats wildcard targets as all processes', () => {
    expect(summarizeTargetProcesses(['*'])).toBe('All processes');
    expect(summarizeTargetProcesses(['*.exe'])).toBe('All processes');
  });

  it('builds contextual AI prompts with mod details', () => {
    const prompt = buildEditorAiPrompt('scaffold', 'taskbar-pro', {
      name: 'Taskbar Pro',
      include: ['explorer.exe'],
      version: '1.2.0',
    });

    expect(prompt).toContain('Taskbar Pro');
    expect(prompt).toContain('taskbar-pro');
    expect(prompt).toContain('explorer.exe');
    expect(prompt).toContain('1.2.0');
  });

  it('recommends safer compile profiles for broad or failed drafts', () => {
    expect(
      getRecommendedCompileProfile(
        {
          include: ['*'],
        },
        {
          isModCompiled: false,
        }
      )
    ).toMatchObject({
      key: 'disabled-logging',
    });

    expect(
      getRecommendedCompileProfile(
        {
          include: ['explorer.exe'],
        },
        {
          compilationFailed: true,
        }
      )
    ).toMatchObject({
      key: 'disabled-logging',
    });
  });

  it('builds evidence cards and a context packet from session state', () => {
    const evidenceCards = getEditorEvidenceCards(
      {
        name: 'Explorer Focus',
        include: ['explorer.exe'],
        version: '2.0.0',
      },
      {
        modWasModified: true,
        isModCompiled: true,
        isLoggingEnabled: false,
      }
    );
    const contextPacket = buildEditorContextPacket(
      'explorer-focus',
      {
        name: 'Explorer Focus',
        include: ['explorer.exe'],
        version: '2.0.0',
      },
      {
        modWasModified: true,
        isModCompiled: true,
        isLoggingEnabled: false,
      }
    );

    expect(evidenceCards[0]).toMatchObject({
      label: 'Scope',
      tone: 'positive',
    });
    expect(evidenceCards[1].value).toBe('Turn logging on');
    expect(contextPacket).toContain('Recommended next compile profile');
    expect(contextPacket).toContain('explorer-focus');
  });

  it('creates targeted scope and test-plan prompts for AI collaboration', () => {
    const testPlanPrompt = buildEditorAiPrompt(
      'test-plan',
      'notification-calm',
      {
        name: 'Notification Calm',
        include: ['ShellExperienceHost.exe'],
      },
      {
        modWasModified: true,
        isModCompiled: false,
      }
    );
    const iterationPlan = getEditorIterationPlan(
      {
        include: ['ShellExperienceHost.exe'],
      },
      {
        modWasModified: true,
        isModCompiled: false,
      }
    );

    expect(testPlanPrompt).toContain('practical manual test plan');
    expect(testPlanPrompt).toContain('notification-calm');
    expect(iterationPlan[1].title).toContain('Compile');
    expect(iterationPlan[2].body).toContain('Preview');
  });

  it('builds a verification pack and release packet from the current draft', () => {
    const verificationPack = getEditorVerificationPack(
      {
        name: 'Taskbar Calm',
        include: ['explorer.exe', 'StartMenuExperienceHost.exe'],
        version: '3.1.0',
      },
      {
        modWasModified: true,
        isModCompiled: true,
        isLoggingEnabled: false,
      }
    );
    const checklist = buildEditorVerificationChecklist(
      'taskbar-calm',
      {
        name: 'Taskbar Calm',
        include: ['explorer.exe', 'StartMenuExperienceHost.exe'],
        version: '3.1.0',
      },
      {
        modWasModified: true,
        isModCompiled: true,
        isLoggingEnabled: false,
      }
    );
    const releasePacket = buildEditorReleasePacket(
      'taskbar-calm',
      {
        name: 'Taskbar Calm',
        include: ['explorer.exe', 'StartMenuExperienceHost.exe'],
        version: '3.1.0',
      },
      {
        modWasModified: true,
        isModCompiled: true,
        isLoggingEnabled: false,
      }
    );

    expect(verificationPack).toHaveLength(4);
    expect(verificationPack[1].title).toContain('Check each target separately');
    expect(checklist).toContain('Verification checklist for Taskbar Calm');
    expect(releasePacket).toContain('Recommended next compile profile');
    expect(releasePacket).toContain('Write the release delta');
  });
});
