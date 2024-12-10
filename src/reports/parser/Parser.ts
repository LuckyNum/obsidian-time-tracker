import {Query, Token} from "@/types.ts";
import {Notice} from "obsidian";

export abstract class Parser {
    public abstract parse(tokens: Token[], query: Query): Token[];

    public test(tokens: Token[], throws = false): boolean {
        const success = this._acceptedTokens.includes(tokens[0]);
        if (!success && throws) {
            new Notice('语法错误');
        }
        return success;
    }

    abstract get _acceptedTokens(): Token[];
}