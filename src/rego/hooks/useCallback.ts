import {DepsArray} from "./types";

export function useCallback<T>(callback: T, deps: DepsArray): T {
    return callback
}