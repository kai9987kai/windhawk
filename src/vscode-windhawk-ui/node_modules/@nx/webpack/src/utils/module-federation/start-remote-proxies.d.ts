import { StaticRemotesConfig } from './parse-static-remotes-config';
export declare function startRemoteProxies(staticRemotesConfig: StaticRemotesConfig, mappedLocationsOfRemotes: Record<string, string>, sslOptions?: {
    pathToCert: string;
    pathToKey: string;
}): void;
