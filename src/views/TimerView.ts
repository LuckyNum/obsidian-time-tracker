import {IconName, ItemView, WorkspaceLeaf, Plugin} from 'obsidian';
import {createApp, App as VueApp} from 'vue';
import TimerComponent from '@/views/TimerView.vue';
import {createPinia} from "pinia";

export const VIEW_TYPE_TIMER = 'timer-view';

export class TimerView extends ItemView {
    private vueApp: VueApp | null = null;
    private readonly plugin: Plugin;

    constructor(leaf: WorkspaceLeaf, plugin: Plugin) {
        super(leaf);
        this.plugin = plugin;
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

        this.vueApp = createApp(TimerComponent, {
            obsidianService: this.plugin.,
        });

        const pinia = createPinia();
        this.vueApp.use(pinia);
        this.vueApp.mount(this.contentEl);
    }

    async onClose(): Promise<void> {
        if (this.vueApp) {
            this.vueApp.unmount();
            this.vueApp = null;
        }
    }
}