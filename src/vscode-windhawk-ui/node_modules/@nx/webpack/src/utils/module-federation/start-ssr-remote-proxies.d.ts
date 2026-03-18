import type { StaticRemotesConfig } from './parse-static-remotes-config';
export declare function startSsrRemoteProxies(staticRemotesConfig: StaticRemotesConfig, mappedLocationsOfRemotes: Record<string, string>, sslOptions?: {
    pathToCert: string;
    pathToKey: string;
}): void;
