"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnscopedLibName = getUnscopedLibName;
exports.getE2eProjectName = getE2eProjectName;
exports.filePathPrefix = filePathPrefix;
const devkit_1 = require("@nx/devkit");
function getUnscopedLibName(libRoot) {
    return libRoot.slice(libRoot.lastIndexOf('/') + 1);
}
function getE2eProjectName(targetProjectName, targetLibRoot, cypressDirectory) {
    if (cypressDirectory) {
        return `${filePathPrefix(cypressDirectory)}-${getUnscopedLibName(targetLibRoot)}-e2e`;
    }
    return `${targetProjectName}-e2e`;
}
function filePathPrefix(directory) {
    return `${(0, devkit_1.names)(directory).fileName}`.replace(new RegExp('/', 'g'), '-');
}
