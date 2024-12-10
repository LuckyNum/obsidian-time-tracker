import {tokenize} from "@/reports/parser/Tokenize.ts";
import {QueryTypeParser} from "@/reports/parser/parseQueryType.ts";
import {Query} from "@/types.ts";
import {DEFAULT_QUERY} from "@/lib/constants.ts";
import {QueryIntervalParser} from "@/reports/parser/parseQueryInterval.ts";
import {QueryTitleParser} from "@/reports/parser/parseQueryTitle.ts";

export function parse(queryString: string) {
    let tokens = tokenize(queryString);
    const query: Query = DEFAULT_QUERY;
    // 0、默认标题
    tokens = new QueryTitleParser().parse(tokens, query);
    // 1、类型
    tokens = new QueryTypeParser().parse(tokens, query);
    // 2、时间范围
    tokens = new QueryIntervalParser().parse(tokens, query);
    // 3、过滤

    // 4、排序分组

    // 5、视图配置
    console.log(tokens)
    console.log(query)

    return query;
}