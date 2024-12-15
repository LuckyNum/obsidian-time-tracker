import {Parser} from "@/reports/parser/Parser.ts";
import {GroupBy, Keyword, Query, QueryType, Token} from "@/types.ts";

export class GroupByParser extends Parser {
    private static readonly _acceptedGroupings = [
        Keyword.DATE,
        Keyword.TAG,
    ];

    public parse(tokens: Token[], query: Query): Token[] {
        this.test(tokens, true);
        if (tokens[1] !== Keyword.BY) {
            console.log(tokens[1], [Keyword.BY])
        }

        if (query.groupBy) {
            console.log(query.groupBy);
        }

        if (query.type !== QueryType.LIST) {
            console.log(
                '"GROUP BY" can only be used on "LIST" queries.',
            );
        }

        const _tokens = [...tokens];

        switch (_tokens[2]) {
            case Keyword.DATE:
                query.groupBy = GroupBy.DATE;
                break;
            case Keyword.TAG:
                query.groupBy = GroupBy.TAG;
                break;
            default:
                console.log(
                    _tokens[2],
                    GroupByParser._acceptedGroupings,
                );
        }

        return _tokens.slice(3);
    }

    get _acceptedTokens(): Token[] {
        return [Keyword.GROUP];
    }
}
