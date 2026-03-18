/**
 * This configuration is intended to be applied to ONLY files which contain JSX/TSX
 * code.
 *
 * It should therefore NOT contain any rules or plugins which are generic
 * to all file types within variants of React projects.
 *
 * This configuration is intended to be combined with other configs from this
 * package.
 */
declare const _default: import("@typescript-eslint/utils/ts-eslint").FlatConfig.ConfigArray;
export default _default;
