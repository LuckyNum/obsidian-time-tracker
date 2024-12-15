import {App, MarkdownPostProcessorContext, Plugin, PluginManifest, WorkspaceLeaf} from 'obsidian';
import {TimerRecordView, VIEW_TYPE_TIMER} from "@/obsidian/TimerRecordView.ts";
import {TimerSettingTab} from "@/obsidian/TimerSettingView.ts";
import {CODEBLOCK_LANG} from "@/lib/constants.ts";
import TimerReportView from "@/views/TimerReportView.vue";
import {useTimerStore} from "@/store/TimerStore.ts";
import {TimerService} from "@/obsidian/TimerService.ts";
import {ObsidianDirectoryIndexer} from "@/obsidian/ObsidianDirectoryIndexer.ts";
import {createApp} from "vue";
import {createPinia, Pinia} from "pinia";
import './global.css';

export default class ObsidianTimeTrackerPlugin extends Plugin {
    // @ts-ignore
    public timerService: TimerService;
    // @ts-ignore
    public indexer: ObsidianDirectoryIndexer;

    constructor(app: App, manifest: PluginManifest) {
        super(app, manifest);
    }

    async onload(): Promise<void> {
        // 初始化service
        this.timerService = new TimerService(this);
        // 初始化存储
        const pinia = createPinia();
        const timerStore = useTimerStore(pinia);

        // 初始化设置页
        this.addSettingTab(new TimerSettingTab(this));

        // 初始化计时器
        await this.registerTimerView(pinia);

        // 初始化统计图表
        await this.registerCodeBlockProcessor(pinia);

        // 初始化存储数据
        await timerStore.init(this);

        // 注册命令
        this.registerTimerCommand();

        this.initTimerView();

        document.body.toggleClass('@container', true);

        // 创建索引器实例
        this.indexer = new ObsidianDirectoryIndexer(this, "Daily Notes");

        // 运行索引初始化
        if (!this.app.workspace.layoutReady) {
            this.app.workspace.onLayoutReady(async () => this.indexer.initialize());
        } else {
            await this.indexer.initialize();
        }
    }

    private async registerTimerView(pinia: Pinia) {
        this.registerView(VIEW_TYPE_TIMER, (leaf: WorkspaceLeaf) => new TimerRecordView(leaf, this, pinia));
        this.addRibbonIcon('clock', 'Open Clock View', async () => {
            this.app.workspace.detachLeavesOfType(VIEW_TYPE_TIMER);
            await this.app.workspace.getRightLeaf(false)?.setViewState({
                type: VIEW_TYPE_TIMER,
                active: true,
            });
        });
    }

    private initTimerView() {
        this.app.workspace.onLayoutReady(async () => {
            this.app.workspace.detachLeavesOfType(VIEW_TYPE_TIMER);
            this.app.workspace.getRightLeaf(false)?.setViewState({
                type: VIEW_TYPE_TIMER,
                active: true,
            });
        });
    }

    private async registerCodeBlockProcessor(pinia: Pinia) {
        this.registerMarkdownCodeBlockProcessor(CODEBLOCK_LANG, (
            source: string,
            el: HTMLElement,
            ctx: MarkdownPostProcessorContext
        ) => {
            el.toggleClass('custom-next', true);
            const vueApp = createApp(TimerReportView, {source: source, el: el, ctx: ctx});
            vueApp.use(pinia);
            vueApp.mount(el);
        });
    }

    private registerTimerCommand() {
        // start timer command
        this.addCommand({
            checkCallback: (checking: boolean) => {
                if (!checking) {
                    this.timerService.toggleTimer();
                } else {
                    return useTimerStore().activeEntry == null;
                }
            },
            icon: "clock",
            id: "time-tracker-start-timer",
            name: "开始计时",
        });
        // stop timer command
        this.addCommand({
            checkCallback: (checking: boolean) => {
                if (!checking) {
                    this.timerService.toggleTimer();
                } else {
                    return useTimerStore().activeEntry != null;
                }
            },
            icon: "clock",
            id: "time-tracker-stop-timer",
            name: "停止计时",
        });
        // open timer command
        this.addCommand({
            checkCallback: (checking: boolean) => {
                if (!checking) {
                    this.app.workspace.detachLeavesOfType(VIEW_TYPE_TIMER);
                    const leaf = this.app.workspace.getRightLeaf(false);
                    if (leaf) {
                        leaf.setViewState({
                            type: VIEW_TYPE_TIMER,
                            active: true,
                        }).then(() => {
                            this.app.workspace.revealLeaf(leaf);
                        });
                    }
                } else {
                    return true;
                }
            },
            icon: "clock",
            id: "time-tracker-open-timer",
            name: "打开计时器",
        });
    }

    onunload() {
        super.onunload();
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_TIMER);
        document.body.toggleClass('@container', false);
    }
}
