interface EncodeOptions {
    section?: string;
    whitespace?: boolean;
}

export type iniObject = { [key: string]: string | iniObject };

export function decode(str: string): iniObject;
export function parse(str: string): iniObject;
export function encode(object: iniObject, options?: EncodeOptions | string): string;
export function stringify(object: iniObject, options?: EncodeOptions | string): string;
export function safe(val: string): string;
export function unsafe(val: string): string;
