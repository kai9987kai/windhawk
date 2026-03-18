/**
 * This configuration is intended to be applied to ALL .ts and .tsx files
 * within an Nx workspace.
 *
 * It should therefore NOT contain any rules or plugins which are specific
 * to one ecosystem, such as React, Angular, Node etc.
 */
declare const _default: import("@typescript-eslint/utils/ts-eslint").FlatConfig.ConfigArray;
export default _default;
