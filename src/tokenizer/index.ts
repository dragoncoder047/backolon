import { last } from "lib0/array";
import { stringify } from "lib0/json";

export type TokenType = `${string}:${string}`;

export interface Token {
    readonly type: TokenType;
    readonly text: string;
    readonly src: Readonly<URL>,
    readonly line: number;
    readonly col: number,
}

interface Rule {
    /**
     * The regex MUST have the sticky (y) flag.
     */
    regex: RegExp;
    type: TokenType;
}

export interface Tokenizer {
    readonly rules: readonly Rule[];
    readonly index: number;
    readonly text: string;
    readonly src: URL,
    readonly line: number;
    readonly col: number,
}

export const createTokenizer = (text: string, src: URL): Tokenizer => {
    return {
        rules: [
            { regex: /0x[a-f0-9]+|-?0b[01]+|(\.\d+|\d+\.?\d*)(e[+-]?\d+)?/yi, type: "backolon:number" },
            { regex: /[\p{L}_][\p{L}\p{N}_]*/yu, type: "backolon:identifier" },
            { regex: /[(){}[\]"']/y, type: "backolon:paren" },
            { regex: /((?!\n)\s)+/y, type: "backolon:whitespace" },
            { regex: /\n(\s+\n)?/y, type: "backolon:newline" },
            { regex: /[\p{P}\p{C}\p{S}]/yu, type: "backolon:operator" },
        ],
        index: 0,
        text,
        src,
        line: 0,
        col: 0,
    };
}

/**
 * 
 * @param regex Regex to match token, if it doesn't have the sticky (y) flag, it will be added
 * @param ruleType 
 * @param before 
 * @returns 
 */
export const insertRule = (tokenizer: Tokenizer, regex: RegExp, ruleType: TokenType, before?: TokenType): Tokenizer => {
    const fixedRegex = /y/.test(regex.flags) ? regex : new RegExp(regex, regex.flags + "y");
    const rules = tokenizer.rules;
    const existingIndex = rules.findIndex(({ type }) => type === ruleType);
    const beforeIndex = rules.findIndex(({ type }) => type === before);
    if (existingIndex >= 0) {
        throw new Error(`Rule for token type ${stringify(ruleType)} already exists`);
    }
    const newRule: Rule = { regex: fixedRegex, type: ruleType };
    const newRules = beforeIndex >= 0 ? rules.toSpliced(beforeIndex, 0, newRule) : rules.concat([newRule]);
    return {
        ...tokenizer,
        rules: newRules
    };
}

export const nextToken = (tokenizer: Tokenizer): readonly [Token, Tokenizer] => {
    const { index, rules, text, line, col, src } = tokenizer;
    const advanceTokenizerUsing = (chunk: string, type: TokenType, index: number) => {
        const token: Token = {
            type,
            text: chunk,
            line, col, src
        };
        const interlines = chunk.split("\n");
        var newCol = col;
        var newLine = line;
        if (interlines.length > 1) {
            newCol = last(interlines)!.length;
            newLine += interlines.length - 1;
        } else {
            newCol += chunk.length;
        }
        const newTokenizer: Tokenizer = {
            rules,
            index,
            text,
            src,
            line: newLine,
            col: newCol
        };
        return [token, newTokenizer] as const;
    }
    for (var i = 0; i < rules.length; i++) {
        const { regex, type } = rules[i]!;
        regex.lastIndex = index;
        const match = regex.exec(text);
        if (match) {
            return advanceTokenizerUsing(match[0], type, regex.lastIndex);
        }
    }
    return advanceTokenizerUsing(text[index]!, "undefined:undefined", index + 1);
}
