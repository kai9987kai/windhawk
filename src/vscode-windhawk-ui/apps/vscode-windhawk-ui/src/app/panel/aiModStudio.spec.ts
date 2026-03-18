import {
  aiPromptPacks,
  buildStarterLaunchContext,
  buildVisualPresetLaunchContext,
  buildWorkflowLaunchContext,
  buildStudioWorkflowPacket,
  cliPlaybooks,
  getModSourceExtensionForAuthoringLanguage,
  getModStudioStartersForAuthoringLanguage,
  getStudioWorkflowRecipes,
  getVisualStudioPresetsForAuthoringLanguage,
  modStudioStarters,
  studioWorkflowRecipes,
  visualStudioPresets,
} from './aiModStudio';

describe('aiModStudio', () => {
  it('includes focused starters for AI, shell, windows, and settings-first work', () => {
    expect(modStudioStarters.map((starter) => starter.key)).toEqual(
      expect.arrayContaining([
        'structured-core',
        'ai-ready',
        'explorer-shell',
        'chromium-browser',
        'window-behavior',
        'settings-lab',
      ])
    );
  });

  it('only exposes the Python-backed starter in Python authoring mode', () => {
    expect(
      getModStudioStartersForAuthoringLanguage('python').map(
        (starter) => starter.key
      )
    ).toEqual(['python-automation']);

    expect(
      getModStudioStartersForAuthoringLanguage('cpp').map((starter) => starter.key)
    ).toEqual(
      expect.arrayContaining([
        'structured-core',
        'default',
        'ai-ready',
        'explorer-shell',
        'chromium-browser',
        'window-behavior',
        'settings-lab',
      ])
    );
  });

  it('ships prompt packs for ideation, browser scaffolding, review, and docs', () => {
    expect(aiPromptPacks.map((promptPack) => promptPack.key)).toEqual(
      expect.arrayContaining([
        'ideate',
        'structure-plan',
        'scaffold',
        'browser-ui',
        'review',
        'docs',
      ])
    );
  });

  it('filters visual presets to the active authoring language', () => {
    expect(
      getVisualStudioPresetsForAuthoringLanguage('python').map(
        (preset) => preset.key
      )
    ).toEqual(['visual-automation']);

    expect(
      getVisualStudioPresetsForAuthoringLanguage('cpp').map(
        (preset) => preset.key
      )
    ).toEqual(
      expect.arrayContaining([
        'visual-shell',
        'visual-windows',
        'visual-settings',
      ])
    );
  });

  it('maps authoring language to the expected source extension', () => {
    expect(getModSourceExtensionForAuthoringLanguage('cpp')).toBe('.wh.cpp');
    expect(getModSourceExtensionForAuthoringLanguage('python')).toBe('.wh.py');
  });

  it('includes visual presets and CLI playbooks for studio tooling', () => {
    expect(visualStudioPresets.map((preset) => preset.key)).toEqual(
      expect.arrayContaining([
        'visual-automation',
        'visual-shell',
        'visual-windows',
        'visual-settings',
      ])
    );

    expect(cliPlaybooks.map((playbook) => playbook.key)).toEqual(
      expect.arrayContaining([
        'detect-runtime',
        'status',
        'launch-tray',
        'init-mod',
        'compile-restart',
        'tail-logs',
      ])
    );
  });

  it('filters workflow bundles by authoring language and studio mode', () => {
    expect(
      getStudioWorkflowRecipes('python', 'visual').map((recipe) => recipe.key)
    ).toEqual(['automation-prototype']);

    expect(
      getStudioWorkflowRecipes('cpp', 'code').map((recipe) => recipe.key)
    ).toEqual(
      expect.arrayContaining([
        'shell-investigation',
        'browser-ui-lab',
        'window-behavior-audit',
        'settings-rollout',
      ])
    );
  });

  it('builds copy-ready workflow packets that summarize the starter, checklist, and tools', () => {
    const recipe = studioWorkflowRecipes.find(
      (candidate) => candidate.key === 'shell-investigation'
    );

    expect(recipe).toBeDefined();
    if (!recipe) {
      throw new Error('Expected shell-investigation workflow recipe to exist');
    }

    const packet = buildStudioWorkflowPacket(recipe);

    expect(packet).toContain('Launch: Shell investigation sprint');
    expect(packet).toContain('Starter: Explorer shell starter');
    expect(packet).toContain('CLI playbooks:');
    expect(packet).toContain('Prompt packs:');
  });

  it('builds launch context packets for starters, presets, and workflows', () => {
    const starter = modStudioStarters.find(
      (candidate) => candidate.key === 'structured-core'
    );
    const preset = visualStudioPresets.find(
      (candidate) => candidate.key === 'visual-shell'
    );
    const workflow = studioWorkflowRecipes.find(
      (candidate) => candidate.key === 'shell-investigation'
    );

    expect(starter).toBeDefined();
    expect(preset).toBeDefined();
    expect(workflow).toBeDefined();

    if (!starter || !preset || !workflow) {
      throw new Error('Expected starter, preset, and workflow fixtures');
    }

    const starterContext = buildStarterLaunchContext(starter, 'cpp', 'code');
    const presetContext = buildVisualPresetLaunchContext(preset, 'cpp');
    const workflowContext = buildWorkflowLaunchContext(
      workflow,
      'cpp',
      'visual'
    );

    expect(starterContext.kind).toBe('starter');
    expect(starterContext.packet).toContain('Launch: Structured core starter');
    expect(starterContext.tools?.some((tool) => tool.key === 'compile-restart')).toBe(
      true
    );

    expect(presetContext.kind).toBe('visual-preset');
    expect(presetContext.studioMode).toBe('visual');
    expect(presetContext.packet).toContain('Launch: Shell surfaces');

    expect(workflowContext.kind).toBe('workflow');
    expect(workflowContext.packet).toContain('Launch: Shell investigation sprint');
    expect(workflowContext.tools?.some((tool) => tool.key === 'tail-logs')).toBe(
      true
    );
  });
});
