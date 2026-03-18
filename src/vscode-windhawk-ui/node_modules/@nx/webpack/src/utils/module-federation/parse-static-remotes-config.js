"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStaticRemotesConfig = parseStaticRemotesConfig;
exports.parseStaticSsrRemotesConfig = parseStaticSsrRemotesConfig;
const path_1 = require("path");
function parseStaticRemotesConfig(staticRemotes, context) {
    if (!staticRemotes?.length) {
        return { remotes: [], config: undefined };
    }
    const config = {};
    for (const app of staticRemotes) {
        const outputPath = context.projectGraph.nodes[app].data.targets['build'].options.outputPath;
        const basePath = (0, path_1.dirname)(outputPath);
        const urlSegment = (0, path_1.basename)(outputPath);
        const port = context.projectGraph.nodes[app].data.targets['serve'].options.port;
        config[app] = { basePath, outputPath, urlSegment, port };
    }
    return { remotes: staticRemotes, config };
}
function parseStaticSsrRemotesConfig(staticRemotes, context) {
    if (!staticRemotes?.length) {
        return { remotes: [], config: undefined };
    }
    const config = {};
    for (const app of staticRemotes) {
        const outputPath = (0, path_1.dirname)(context.projectGraph.nodes[app].data.targets['build'].options.outputPath // dist/checkout/browser -> checkout
        );
        const basePath = (0, path_1.dirname)(outputPath); // dist/checkout -> dist
        const urlSegment = (0, path_1.basename)(outputPath); // dist/checkout -> checkout
        const port = context.projectGraph.nodes[app].data.targets['serve'].options.port;
        config[app] = { basePath, outputPath, urlSegment, port };
    }
    return { remotes: staticRemotes, config };
}
