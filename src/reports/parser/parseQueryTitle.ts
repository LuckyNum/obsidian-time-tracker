import {Parser} from "@/reports/parser/Parser.ts";
import {Keyword, Query, Token} from "@/types.ts";
import {moment} from "obsidian";
import {ISODateFormat} from "@/lib/constants.ts";

export class QueryTitleParser extends Parser {
    parse(tokens: Token[], query: Query): Token[] {
        switch (tokens[1]) {
            case Keyword.TODAY:
                query.customTitle = "今日";
                break;
            case Keyword.WEEK:
                query.customTitle = "本周";
                break;
            case Keyword.MONTH:
                query.customTitle = "本月";
                break;
            case Keyword.FROM:
                query.customTitle = `从 ${tokens[2]} 到 ${(tokens[4] as string).toLowerCase()}`;
                break;
            case Keyword.PAST:
                query.customTitle = `过去 ${tokens[2]} ${(<string>tokens[3]).toLowerCase()}`;
                break;
            default:
                const defaultDate = moment(tokens[1], ISODateFormat, true);
                if (defaultDate.isValid()) {
                    query.customTitle = defaultDate.format("LL");
                }
                query.customTitle = "未命名";
        }

        return tokens;
    }

    get _acceptedTokens() {
        return [];
    }
}