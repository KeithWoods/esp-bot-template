let _idIndex = 1;

export namespace ModelIdFactory {
    export const createId = (token: string) => `${token}-#${_idIndex++}`;
}