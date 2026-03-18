"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
const devkit_internals_1 = require("nx/src/devkit-internals");
const tsquery_1 = require("@phenomnomnominal/tsquery");
const add_e2e_ci_target_defaults_1 = require("./add-e2e-ci-target-defaults");
async function default_1(tree) {
    const pluginName = '@nx/cypress/plugin';
    const graph = await (0, devkit_1.createProjectGraphAsync)();
    const nxJson = (0, devkit_1.readNxJson)(tree);
    const matchingPluginRegistrations = nxJson.plugins?.filter((p) => typeof p === 'string' ? p === pluginName : p.plugin === pluginName);
    if (!matchingPluginRegistrations?.length) {
        return;
    }
    const { createNodesV2, } = await Promise.resolve(`${pluginName}`).then(s => require(s));
    for (const plugin of matchingPluginRegistrations) {
        let projectConfigs;
        try {
            const loadedPlugin = new devkit_internals_1.LoadedNxPlugin({ createNodesV2, name: pluginName }, plugin);
            projectConfigs = await (0, devkit_internals_1.retrieveProjectConfigurations)([loadedPlugin], tree.root, nxJson);
        }
        catch (e) {
            if (e instanceof devkit_internals_1.ProjectConfigurationsError) {
                projectConfigs = e.partialProjectConfigurationsResult;
            }
            else {
                throw e;
            }
        }
        for (const configFile of projectConfigs.matchingProjectFiles) {
            const configFileContents = tree.read(configFile, 'utf-8');
            if (!configFileContents.includes('ciWebServerCommand')) {
                continue;
            }
            const ast = tsquery_1.tsquery.ast(configFileContents);
            const CI_WEBSERVER_COMMAND_SELECTOR = 'ObjectLiteralExpression PropertyAssignment:has(Identifier[name=ciWebServerCommand]) > StringLiteral';
            const nodes = (0, tsquery_1.tsquery)(ast, CI_WEBSERVER_COMMAND_SELECTOR, {
                visitAllChildren: true,
            });
            if (!nodes.length) {
                continue;
            }
            const ciWebServerCommand = nodes[0].getText();
            let project;
            let portFlagValue;
            if (ciWebServerCommand.includes('nx run')) {
                const NX_TARGET_REGEX = /(?<=nx run )([^' ]+)(?: [^']*--port[= ](\d+))?/;
                const matches = ciWebServerCommand.match(NX_TARGET_REGEX);
                if (!matches) {
                    continue;
                }
                const targetString = matches[1];
                project = (0, devkit_1.parseTargetString)(targetString, graph).project;
                portFlagValue = matches[2];
            }
            else {
                const NX_PROJECT_REGEX = /(?<=nx [^ ]+ )([^' ]+)(?: [^']*--port[= ](\d+))?/;
                const matches = ciWebServerCommand.match(NX_PROJECT_REGEX);
                if (!matches) {
                    continue;
                }
                project = matches[1];
                portFlagValue = matches[2];
            }
            if (!project || !graph.nodes[project]) {
                continue;
            }
            const pathToViteConfig = [
                (0, devkit_1.joinPathFragments)(graph.nodes[project].data.root, 'vite.config.ts'),
                (0, devkit_1.joinPathFragments)(graph.nodes[project].data.root, 'vite.config.js'),
            ].find((p) => tree.exists(p));
            const pathToWebpackConfig = [
                (0, devkit_1.joinPathFragments)(graph.nodes[project].data.root, 'webpack.config.ts'),
                (0, devkit_1.joinPathFragments)(graph.nodes[project].data.root, 'webpack.config.js'),
            ].find((p) => tree.exists(p));
            if (!pathToViteConfig && !pathToWebpackConfig) {
                continue;
            }
            if (pathToWebpackConfig) {
                const matchingWebpackPlugin = await findPluginForConfigFile(tree, '@nx/webpack/plugin', pathToWebpackConfig);
                const serveStaticTargetName = matchingWebpackPlugin
                    ? typeof matchingWebpackPlugin === 'string'
                        ? 'serve-static'
                        : matchingWebpackPlugin.options?.serveStaticTargetName ??
                            'serve-static'
                    : getServeStaticLikeTarget(tree, graph, project, '@nx/web:file-server') ?? undefined;
                if (!serveStaticTargetName) {
                    continue;
                }
                const newCommand = ciWebServerCommand.replace(/nx.*[^"']/, `nx run ${project}:${serveStaticTargetName}${portFlagValue ? ` --port=${portFlagValue}` : ''}`);
                tree.write(configFile, `${configFileContents.slice(0, nodes[0].getStart())}${newCommand}${configFileContents.slice(nodes[0].getEnd())}`);
            }
            else if (pathToViteConfig) {
                const viteConfigContents = tree.read(pathToViteConfig, 'utf-8');
                if (!viteConfigContents.includes('preview:')) {
                    continue;
                }
                const matchingVitePlugin = await findPluginForConfigFile(tree, '@nx/vite/plugin', pathToViteConfig);
                const previewTargetName = matchingVitePlugin
                    ? typeof matchingVitePlugin === 'string'
                        ? 'preview'
                        : matchingVitePlugin.options?.previewTargetName ??
                            'preview'
                    : getServeStaticLikeTarget(tree, graph, project, '@nx/vite:preview-server') ?? undefined;
                if (!previewTargetName) {
                    continue;
                }
                const newCommand = ciWebServerCommand.replace(/nx.*[^"']/, `nx run ${project}:${previewTargetName}${portFlagValue ? ` --port=${portFlagValue}` : ''}`);
                tree.write(configFile, `${configFileContents.slice(0, nodes[0].getStart())}${newCommand},
      ciBaseUrl: "http://localhost:${portFlagValue ?? '4300'}"${configFileContents.slice(nodes[0].getEnd())}`);
            }
        }
    }
    await (0, add_e2e_ci_target_defaults_1.default)(tree);
    await (0, devkit_1.formatFiles)(tree);
}
async function findPluginForConfigFile(tree, pluginName, pathToConfigFile) {
    const nxJson = (0, devkit_1.readNxJson)(tree);
    if (!nxJson.plugins) {
        return;
    }
    const pluginRegistrations = nxJson.plugins.filter((p) => (typeof p === 'string' ? p === pluginName : p.plugin === pluginName));
    for (const plugin of pluginRegistrations) {
        if (typeof plugin === 'string') {
            return plugin;
        }
        if (!plugin.include && !plugin.exclude) {
            return plugin;
        }
        if (plugin.include || plugin.exclude) {
            const resolvedPlugin = await Promise.resolve(`${pluginName}`).then(s => require(s));
            const pluginGlob = resolvedPlugin.createNodesV2?.[0] ?? resolvedPlugin.createNodes?.[0];
            const matchingConfigFile = (0, devkit_internals_1.findMatchingConfigFiles)([pathToConfigFile], pluginGlob, plugin.include, plugin.exclude);
            if (matchingConfigFile.length) {
                return plugin;
            }
        }
    }
}
function getServeStaticLikeTarget(tree, graph, projectName, executorName) {
    if (!graph.nodes[projectName]?.data?.targets) {
        return;
    }
    for (const [targetName, targetOptions] of Object.entries(graph.nodes[projectName].data.targets)) {
        if (targetOptions.executor && targetOptions.executor === executorName) {
            return targetName;
        }
    }
}
