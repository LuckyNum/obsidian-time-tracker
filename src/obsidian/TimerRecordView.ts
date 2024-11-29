import {IconName, ItemView, WorkspaceLeaf} from 'obsidian';
import {createApp, App} from 'vue';
import {Pinia} from "pinia";
import TimerComponent from "@/views/TimerRecordView.vue";
import ObsidianTimeTrackerPlugin from "@/index.ts";

export const VIEW_TYPE_TIMER = 'timer-view';

export class TimerRecordView extends ItemView {
    vueApp: App;
    plugin: ObsidianTimeTrackerPlugin;

    constructor(leaf: WorkspaceLeaf, plugin: ObsidianTimeTrackerPlugin, pinia: Pinia) {
        super(leaf);
        this.plugin = plugin;
        this.vueApp = createApp(TimerComponent, {
            timerService: this.plugin.timerService
        });
        this.vueApp.use(pinia);
    }

    getViewType(): string {
        return VIEW_TYPE_TIMER;
    }

    getDisplayText(): string {
        return 'Timer';
    }

    getIcon(): IconName {
        return 'clock';
    }

    async onOpen(): Promise<void> {
        this.contentEl.toggleClass('custom-next', true);
        this.vueApp.mount(this.contentEl);
    }

    async onClose(): Promise<void> {
        if (this.vueApp) {
            this.vueApp.unmount();
        }
    }
}