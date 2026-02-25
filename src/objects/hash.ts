import { imul } from "lib0/math";
export function javaHash(s: string) {
    var hash = 0;
    for (var i = 0; i < s.length; i++) hash = (imul(hash, 31) + s.charCodeAt(i)) | 0;
    return hash;
}
