"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToInferred = convertToInferred;
const devkit_1 = require("@nx/devkit");
const executor_to_plugin_migrator_1 = require("@nx/devkit/src/generators/plugin-migrations/executor-to-plugin-migrator");
const plugin_migration_utils_1 = require("@nx/devkit/src/generators/plugin-migrations/plugin-migration-utils");
const plugin_1 = require("../../plugins/plugin");
const add_dev_server_target_to_config_1 = require("./lib/add-dev-server-target-to-config");
const add_exclude_spec_pattern_1 = require("./lib/add-exclude-spec-pattern");
const target_options_map_1 = require("./lib/target-options-map");
const upsert_baseUrl_1 = require("./lib/upsert-baseUrl");
async function convertToInferred(tree, options) {
    const projectGraph = await (0, devkit_1.createProjectGraphAsync)();
    const migratedProjects = await (0, executor_to_plugin_migrator_1.migrateProjectExecutorsToPlugin)(tree, projectGraph, '@nx/cypress/plugin', plugin_1.createNodesV2, {
        targetName: 'cypress',
        ciTargetName: 'e2e-ci',
        componentTestingTargetName: 'component-test',
        openTargetName: 'open-cypress',
    }, [
        {
            executors: ['@nx/cypress:cypress', '@nrwl/cypress:cypress'],
            postTargetTransformer,
            targetPluginOptionMapper: (targetName) => ({ targetName }),
        },
    ], options.project);
    if (migratedProjects.size === 0) {
        throw new executor_to_plugin_migrator_1.NoTargetsToMigrateError();
    }
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
}
function postTargetTransformer(target, tree, projectDetails, inferredTargetConfiguration) {
    if (target.options) {
        handlePropertiesInOptions(tree, target.options, projectDetails.root, target);
        if (Object.keys(target.options).length === 0) {
            delete target.options;
        }
    }
    if (target.configurations) {
        for (const configurationName in target.configurations) {
            const configuration = target.configurations[configurationName];
            handlePropertiesInOptions(tree, configuration, projectDetails.root, target);
        }
        if (Object.keys(target.configurations).length !== 0) {
            for (const configuration in target.configurations) {
                if (Object.keys(target.configurations[configuration]).length === 0) {
                    delete target.configurations[configuration];
                }
            }
            if (Object.keys(target.configurations).length === 0) {
                delete target.configurations;
            }
        }
    }
    if (target.outputs) {
        (0, plugin_migration_utils_1.processTargetOutputs)(target, [], inferredTargetConfiguration, {
            projectName: projectDetails.projectName,
            projectRoot: projectDetails.root,
        });
    }
    return target;
}
function handlePropertiesInOptions(tree, options, projectRoot, target) {
    let configFilePath;
    if ('cypressConfig' in options) {
        configFilePath = options.cypressConfig;
        options['config-file'] = (0, plugin_migration_utils_1.toProjectRelativePath)(configFilePath, projectRoot);
        delete options.cypressConfig;
    }
    if ('copyFiles' in options) {
        delete options.copyFiles;
    }
    if ('skipServe' in options) {
        delete options.skipServe;
    }
    for (const key in target_options_map_1.targetOptionsToCliMap) {
        if (options[key]) {
            const prevValue = options[key];
            delete options[key];
            options[target_options_map_1.targetOptionsToCliMap[key]] = prevValue;
        }
    }
    if ('exit' in options && !options.exit) {
        delete options.exit;
        options['no-exit'] = true;
    }
    if ('testingType' in options) {
        delete options.testingType;
    }
    if ('watch' in options) {
        options.headed = true;
        options['no-exit'] = true;
        delete options.watch;
    }
    if (options.baseUrl && configFilePath) {
        (0, upsert_baseUrl_1.upsertBaseUrl)(tree, configFilePath, options.baseUrl);
        delete options.baseUrl;
    }
    if (options.devServerTarget && configFilePath) {
        const webServerCommands = {
            default: `npx nx run ${options.devServerTarget}`,
        };
        delete options.devServerTarget;
        if (target.configurations && configFilePath) {
            for (const configuration in target.configurations) {
                if (target.configurations[configuration]?.devServerTarget) {
                    webServerCommands[configuration] = `npx nx run ${target.configurations[configuration].devServerTarget}`;
                    delete target.configurations[configuration].devServerTarget;
                }
            }
        }
        (0, add_dev_server_target_to_config_1.addDevServerTargetToConfig)(tree, configFilePath, webServerCommands, webServerCommands?.['ci']);
    }
    if ('ignoreTestFiles' in options) {
        (0, add_exclude_spec_pattern_1.addExcludeSpecPattern)(tree, configFilePath, options.ignoreTestFiles);
        delete options.ignoreTestFiles;
    }
}
exports.default = convertToInferred;
