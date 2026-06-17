import { Token } from "../tokenizer";

declare module "*.bk" {
    export const tokens: Token[];
    export const source: string;
    export default tokens;
}
