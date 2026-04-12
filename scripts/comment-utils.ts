import { CommentDisplayPart, Comment } from "typedoc";
export const DOC_TAG = "@backolon";
export const FILE_DEFAULTS_TAG = "@file";

export function contentToText(content: CommentDisplayPart[]) {
    return content.map(v => v.text).join("");
}
class Tag {
    type: string | undefined;
    constructor(
        public id: string,
        public name: string | undefined,
        type: string | undefined,
        public content: CommentDisplayPart[]) {
        this.type = type ? type.slice(1, -1) : undefined; // Remove {...}
    }
    get value() {
        return contentToText(this.content);
    }
}
export class Tags {
    constructor(public tags: Tag[]) { }
    static fromComment(comment: Comment) {
        return new Tags([
            ...(comment.blockTags ?? []).map(({ tag, name, typeAnnotation, content }) => new Tag(tag, name, typeAnnotation, content)),
            ...([...(comment.modifierTags ?? [])]).map(name => new Tag(name, "", "", [])),
        ]);
    }
    getAll(id: string) {
        return this.tags.filter(t => t.id === id);
    }
    get(id: string) {
        return (this.getAll(id) ?? [])[0];
    }
    has(id: string) {
        return this.getAll(id).length > 0;
    }
}
