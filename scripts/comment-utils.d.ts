import { CommentDisplayPart, Comment } from "typedoc";

export declare const DOC_TAG: string;
export declare const FILE_DEFAULTS_TAG: string;
export declare function contentToText(content: CommentDisplayPart[]): string;
declare class Tag {
    id: string;
    name: string | undefined;
    type: string | undefined;
    content: CommentDisplayPart[];
    readonly value: string;
}
export declare class Tags {
    private constructor();
    static fromComment(comment: Comment): Tags;
    getAll(id: string): Tag[];
    get(id: string): Tag;
    has(id: string): boolean;
}
