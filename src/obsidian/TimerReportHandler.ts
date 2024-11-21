import {MarkdownPostProcessorContext} from "obsidian";
import {createApp} from "vue";
import TimerReportView from "@/views/TimerReportView.vue";

export default function reportBlockHandler(
    source: string,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext,
) {
    if (!source) {
        return;
    }
    console.log(ctx)
    el.toggleClass('custom-next', true);
    const vueApp = createApp(TimerReportView, {source: source, ctx: ctx});
    vueApp.mount(el);
}