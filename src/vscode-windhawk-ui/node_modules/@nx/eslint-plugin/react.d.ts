declare const plugin: {
    configs: {
        react: import("@typescript-eslint/utils/ts-eslint").FlatConfig.ConfigArray;
        'react-base': import("@typescript-eslint/utils/ts-eslint").FlatConfig.ConfigArray;
        'react-typescript': import("@typescript-eslint/utils/ts-eslint").FlatConfig.ConfigArray;
        'react-jsx': import("@typescript-eslint/utils/ts-eslint").FlatConfig.ConfigArray;
    };
    rules: {};
};
export default plugin;
