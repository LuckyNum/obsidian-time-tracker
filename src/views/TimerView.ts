import {IconName, ItemView, WorkspaceLeaf, Plugin} from 'obsidian';
import {createApp, App} from 'vue';
import TimerComponent from '@/views/TimerRecordView.vue';
import {createPinia} from "pinia";
import {TimerService} from "@/obsidian/TimerService.ts";
import {useTimerStore} from "@/store/TimerStore.ts";

export const VIEW_TYPE_TIMER = 'timer-view';

export class TimerView extends ItemView {
    vueApp: App;
    plugin: Plugin;
    timerService: TimerService;

    constructor(leaf: WorkspaceLeaf, plugin: Plugin) {
        super(leaf);
        this.plugin = plugin;
        this.timerService = new TimerService(plugin);

        this.vueApp = createApp(TimerComponent, {
            timerService: this.timerService
        });

        const pinia = createPinia();
        this.vueApp.use(pinia);
        const timerStore = useTimerStore(pinia);
        timerStore.init(this.timerService, this.plugin);
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
        this.registerTimerEvent();
    }

    async onClose(): Promise<void> {
        if (this.vueApp) {
            this.vueApp.unmount();
        }
    }

    private registerTimerEvent() {
        // 监听文件修改事件
        this.registerEvent(
            this.app.vault.on('modify', async (): Promise<void> => {
                const entries = await this.timerService.getTodayEntries();
                useTimerStore().setEntries(entries);
            })
        );
        // 监听文件删除事件
        this.registerEvent(
            this.app.vault.on('delete', async (): Promise<void> => {
                const entries = await this.timerService.getTodayEntries();
                useTimerStore().setEntries(entries);
            })
        );
    }
}