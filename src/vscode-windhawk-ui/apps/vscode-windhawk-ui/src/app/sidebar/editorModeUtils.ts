import { ModMetadata } from '../webviewIPCMessages';

function normalizeProcessName(process: string): string {
  return process.includes('\\')
    ? process.substring(process.lastIndexOf('\\') + 1)
    : process;
}

export function summarizeTargetProcesses(include?: string[]): string {
  const targets = (include || []).filter(Boolean);
  if (!targets.length) {
    return 'Not declared yet';
  }

  if (targets.some((target) => target === '*' || target.includes('?') || target.includes('*'))) {
    return 'All processes';
  }

  const normalizedTargets = Array.from(
    new Set(targets.map((target) => normalizeProcessName(target)))
  );

  if (normalizedTargets.length <= 3) {
    return normalizedTargets.join(', ');
  }

  return `${normalizedTargets[0]} + ${normalizedTargets.length - 1} more`;
}

export type EditorPromptKind =
  | 'scaffold'
  | 'review'
  | 'docs'
  | 'explain-scope'
  | 'test-plan'
  | 'release-notes';

export type EditorEvidenceTone = 'positive' | 'neutral' | 'caution';

export type EditorSessionState = {
  modWasModified: boolean;
  isModCompiled: boolean;
  isModDisabled: boolean;
  isLoggingEnabled: boolean;
  compilationFailed: boolean;
};

export type EditorEvidenceCard = {
  key: string;
  label: string;
  value: string;
  detail: string;
  tone: EditorEvidenceTone;
};

export type EditorIterationStep = {
  key: string;
  title: string;
  body: string;
};

export type EditorVerificationItem = {
  key: string;
  title: string;
  detail: string;
};

const DEFAULT_EDITOR_SESSION_STATE: EditorSessionState = {
  modWasModified: false,
  isModCompiled: false,
  isModDisabled: false,
  isLoggingEnabled: false,
  compilationFailed: false,
};

function getNormalizedTargets(include?: string[]): string[] {
  return Array.from(
    new Set((include || []).filter(Boolean).map((target) => normalizeProcessName(target)))
  );
}

function hasWildcardTargets(include?: string[]): boolean {
  return (include || []).some(
    (target) => target === '*' || target.includes('?') || target.includes('*')
  );
}

function getScopeAssessment(include?: string[]): {
  value: string;
  detail: string;
  tone: EditorEvidenceTone;
} {
  const targets = getNormalizedTargets(include);
  const wildcardTargets = hasWildcardTargets(include);

  if (!targets.length) {
    return {
      value: 'Targeting not declared',
      detail: 'Keep the first iteration disabled until the intended process scope is explicit.',
      tone: 'caution',
    };
  }

  if (wildcardTargets) {
    return {
      value: 'Broad process reach',
      detail: 'Prefer disabled + logging runs until you prove the mod behaves safely.',
      tone: 'caution',
    };
  }

  if (targets.length === 1) {
    return {
      value: `Focused on ${targets[0]}`,
      detail: 'Start manual checks in the one process the mod is clearly targeting.',
      tone: 'positive',
    };
  }

  if (targets.length <= 3) {
    return {
      value: 'Multi-process scope',
      detail: `Verify each targeted surface separately: ${targets.join(', ')}.`,
      tone: 'neutral',
    };
  }

  return {
    value: 'Wide multi-process scope',
    detail: 'Test each affected process before treating the draft as stable.',
    tone: 'caution',
  };
}

export function getRecommendedCompileProfile(
  metadata?: ModMetadata | null,
  state?: Partial<EditorSessionState>
): {
  key: 'current' | 'disabled' | 'logging' | 'disabled-logging';
  label: string;
  rationale: string;
} {
  const sessionState = {
    ...DEFAULT_EDITOR_SESSION_STATE,
    ...state,
  };
  const wildcardTargets = hasWildcardTargets(metadata?.include);
  const targetCount = getNormalizedTargets(metadata?.include).length;

  if (sessionState.compilationFailed) {
    return {
      key: 'disabled-logging',
      label: 'Compile disabled + logging',
      rationale: 'Recover from build failures with the safest, most observable first run.',
    };
  }

  if (!sessionState.isModCompiled || wildcardTargets || targetCount >= 4) {
    return {
      key: 'disabled-logging',
      label: 'Compile disabled + logging',
      rationale: 'Broad or unverified scope needs a low-risk first run and immediate evidence.',
    };
  }

  if (sessionState.modWasModified && !sessionState.isLoggingEnabled) {
    return {
      key: 'logging',
      label: 'Compile with logging',
      rationale: 'Fresh edits are easier to localize when the first run produces evidence.',
    };
  }

  if (sessionState.isModDisabled) {
    return {
      key: 'disabled',
      label: 'Compile disabled',
      rationale: 'Keep the mod unloaded while you inspect the new binary and metadata.',
    };
  }

  return {
    key: 'current',
    label: 'Compile with current switches',
    rationale: 'The current session already has a stable enough profile to iterate directly.',
  };
}

export function buildEditorContextPacket(
  modId: string,
  metadata?: ModMetadata | null,
  state?: Partial<EditorSessionState>
): string {
  const sessionState = {
    ...DEFAULT_EDITOR_SESSION_STATE,
    ...state,
  };
  const modName = metadata?.name || modId;
  const version = metadata?.version || '0.1';
  const scopeSummary = summarizeTargetProcesses(metadata?.include);
  const recommendedProfile = getRecommendedCompileProfile(metadata, sessionState);

  return [
    `Mod name: ${modName}`,
    `Mod id: ${modId}`,
    `Target processes: ${scopeSummary}`,
    `Current version: ${version}`,
    `Draft changes: ${sessionState.modWasModified ? 'yes' : 'no'}`,
    `Compiled: ${sessionState.isModCompiled ? 'yes' : 'no'}`,
    `Disabled after compile: ${sessionState.isModDisabled ? 'yes' : 'no'}`,
    `Logging enabled: ${sessionState.isLoggingEnabled ? 'yes' : 'no'}`,
    `Compilation failed recently: ${sessionState.compilationFailed ? 'yes' : 'no'}`,
    `Recommended next compile profile: ${recommendedProfile.label}`,
    `Reason: ${recommendedProfile.rationale}`,
  ].join('\n');
}

export function getEditorEvidenceCards(
  metadata?: ModMetadata | null,
  state?: Partial<EditorSessionState>
): EditorEvidenceCard[] {
  const sessionState = {
    ...DEFAULT_EDITOR_SESSION_STATE,
    ...state,
  };
  const scopeAssessment = getScopeAssessment(metadata?.include);
  const recommendedProfile = getRecommendedCompileProfile(metadata, sessionState);

  const nextRunCard: EditorEvidenceCard = sessionState.compilationFailed
    ? {
      key: 'next-run',
      label: 'Next run',
      value: 'Stabilize the build first',
      detail: 'Fix the compile failure before trusting any AI-generated change or runtime behavior.',
      tone: 'caution',
    }
    : !sessionState.isModCompiled
      ? {
        key: 'next-run',
        label: 'Next run',
        value: recommendedProfile.label,
        detail: recommendedProfile.rationale,
        tone: recommendedProfile.key === 'disabled-logging' ? 'caution' : 'neutral',
      }
      : sessionState.modWasModified && !sessionState.isLoggingEnabled
        ? {
          key: 'next-run',
          label: 'Next run',
          value: 'Turn logging on',
          detail: 'Fresh edits need a higher-evidence first run so regressions are easier to localize.',
          tone: 'neutral',
        }
        : sessionState.isModDisabled
          ? {
            key: 'next-run',
            label: 'Next run',
            value: 'Preview before enabling',
            detail: 'Keep the mod unloaded while you inspect the effect and log output.',
            tone: 'neutral',
          }
          : {
            key: 'next-run',
            label: 'Next run',
            value: 'Live verification ready',
            detail: 'Exercise the exact Windows flow you changed and keep notes on regressions.',
            tone: 'positive',
          };

  const releaseCard: EditorEvidenceCard = sessionState.modWasModified
    ? {
      key: 'release',
      label: 'Release note',
      value: 'Still needs a summary',
      detail: 'Capture user-visible changes and the checks you ran before treating the draft as done.',
      tone: 'neutral',
    }
    : !metadata?.version
      ? {
        key: 'release',
        label: 'Release note',
        value: 'Version metadata missing',
        detail: 'Set a version before treating the current build as a real release candidate.',
        tone: 'caution',
      }
      : {
        key: 'release',
        label: 'Release note',
        value: 'Evidence packet ready',
        detail: 'You can now ask AI for docs, release notes, or a final review from stable context.',
        tone: 'positive',
      };

  return [
    {
      key: 'scope',
      label: 'Scope',
      value: scopeAssessment.value,
      detail: scopeAssessment.detail,
      tone: scopeAssessment.tone,
    },
    nextRunCard,
    releaseCard,
  ];
}

export function getEditorIterationPlan(
  metadata?: ModMetadata | null,
  state?: Partial<EditorSessionState>
): EditorIterationStep[] {
  const sessionState = {
    ...DEFAULT_EDITOR_SESSION_STATE,
    ...state,
  };
  const scopeSummary = summarizeTargetProcesses(metadata?.include);
  const recommendedProfile = getRecommendedCompileProfile(metadata, sessionState);

  return [
    {
      key: 'scope',
      title: 'Frame the change',
      body: `Keep the first validation anchored to ${scopeSummary} so one workflow proves or disproves the idea quickly.`,
    },
    {
      key: 'compile',
      title: recommendedProfile.label,
      body: recommendedProfile.rationale,
    },
    {
      key: 'verify',
      title: sessionState.modWasModified ? 'Capture evidence before shipping' : 'Keep the verification loop warm',
      body: sessionState.modWasModified
        ? 'Preview the affected Windows surface, inspect logs, and write down the user-visible effect before the next AI-assisted revision.'
        : 'Reuse the context pack or test plan when the next change request lands so the reasoning stays grounded in this mod.',
    },
  ];
}

export function getEditorVerificationPack(
  metadata?: ModMetadata | null,
  state?: Partial<EditorSessionState>
): EditorVerificationItem[] {
  const sessionState = {
    ...DEFAULT_EDITOR_SESSION_STATE,
    ...state,
  };
  const targets = getNormalizedTargets(metadata?.include);
  const wildcardTargets = hasWildcardTargets(metadata?.include);
  const scopeLabel = summarizeTargetProcesses(metadata?.include);

  const firstStep = sessionState.compilationFailed
    ? {
      key: 'build-health',
      title: 'Fix build health',
      detail: 'Resolve the compile failure before treating any runtime observation as trustworthy.',
    }
    : {
      key: 'primary-flow',
      title: 'Exercise the primary flow',
      detail: `Run the exact Windows flow affected by ${scopeLabel} and note what changed for the user.`,
    };

  const scopeStep = wildcardTargets
    ? {
      key: 'scope',
      title: 'Contain wide scope',
      detail: 'Wildcard targeting means the first live run should stay disabled or heavily logged until you prove safety.',
    }
    : targets.length > 1
      ? {
        key: 'scope',
        title: 'Check each target separately',
        detail: `Do not treat "${scopeLabel}" as one environment. Verify each targeted process on its own.`,
      }
      : {
        key: 'scope',
        title: 'Confirm the intended process',
        detail: `Use ${scopeLabel} as the baseline and confirm the hook does not drift into adjacent shell behavior.`,
      };

  const evidenceStep = sessionState.isLoggingEnabled
    ? {
      key: 'evidence',
      title: 'Capture evidence',
      detail: 'Keep the first logs, screenshots, or user-visible notes so later AI prompts stay grounded in real behavior.',
    }
    : {
      key: 'evidence',
      title: 'Increase observability',
      detail: 'Turn logging on before the next risky run so regressions are easier to localize.',
    };

  const releaseStep = sessionState.modWasModified
    ? {
      key: 'release',
      title: 'Write the release delta',
      detail: 'Summarize what changed, what users should verify, and any Windows-build caveats before shipping.',
    }
    : {
      key: 'release',
      title: 'Keep the release packet warm',
      detail: 'Reuse the checklist and release packet for the next iteration so reviews stay concrete.',
    };

  return [firstStep, scopeStep, evidenceStep, releaseStep];
}

export function buildEditorVerificationChecklist(
  modId: string,
  metadata?: ModMetadata | null,
  state?: Partial<EditorSessionState>
): string {
  const checklist = getEditorVerificationPack(metadata, state);

  return [
    `Verification checklist for ${metadata?.name || modId} (${modId})`,
    ...checklist.map((item) => `- ${item.title}: ${item.detail}`),
  ].join('\n');
}

export function buildEditorReleasePacket(
  modId: string,
  metadata?: ModMetadata | null,
  state?: Partial<EditorSessionState>
): string {
  return [
    buildEditorContextPacket(modId, metadata, state),
    '',
    buildEditorVerificationChecklist(modId, metadata, state),
  ].join('\n');
}

export function buildEditorAiPrompt(
  kind: EditorPromptKind,
  modId: string,
  metadata?: ModMetadata | null,
  state?: Partial<EditorSessionState>
): string {
  const modName = metadata?.name || modId;
  const targetProcesses = summarizeTargetProcesses(metadata?.include);
  const version = metadata?.version || '0.1';
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
