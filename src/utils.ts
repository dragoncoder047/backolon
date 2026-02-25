export const rotate32 = (x: number, shr: number) => (x << shr) | (x >> (32 - shr));
