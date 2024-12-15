import {Parser} from "@/reports/parser/Parser.ts";
import {Keyword, Query, SortOrder, Token} from "@/types.ts";

export class SortParser extends Parser {
    public parse(tokens: Token[], query: Query): Token[] {
        this.test(tokens, true);
        if (query.sort) {
            console.log(query.sort);
        }
        const _tokens = [...tokens];

        switch (_tokens[1]) {
            case Keyword.ASC:
                query.sort = SortOrder.ASC;
                break;
            case Keyword.DESC:
                query.sort = SortOrder.DESC;
                break;
            default:
                console.log(_tokens[1], [Keyword.ASC, Keyword.DESC]);
        }

        return _tokens.slice(2);
    }

    get _acceptedTokens(): Token[] {
        return [Keyword.SORT];
    }
}
