import {App, Plugin, PluginManifest} from 'obsidian';
import './global.css';
import {TimerService} from "@/obsidian/TimerService.ts";
import {createPinia} from "pinia";
import {DEFAULT_SETTINGS, TimerPluginSettings} from "@/types.ts";
import {TimerView, VIEW_TYPE_TIMER} from "@/views/TimerView.ts";
import {useTimerStore} from "@/store/timerStore.ts";

export default class ObsidianTimeTrackerPlugin extends Plugin {
    timerService: TimerService;
    private pinia = createPinia();
    settings: TimerPluginSettings;

    constructor(app: App, manifest: PluginManifest) {
        super(app, manifest);
        this.timerService = new TimerService(this);
        this.settings = DEFAULT_SETTINGS;
    }

    async onload(): Promise<void> {
        await this.loadSettings();
        const timerStore = useTimerStore(this.pinia);
        await timerStore.init(this.timerService);

        this.registerView(
            VIEW_TYPE_TIMER,
            (leaf) => new TimerView(leaf, this)
        );

        this.addRibbonIcon('clock', 'Timer', () => {
            this.activateView();
        });

        this.addCommand({
            id: 'show-timer',
            name: 'Show Timer',
            callback: () => {
                this.activateView();
            },
        });
        document.body.toggleClass('@container', true);
    }

    onunload() {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_TIMER);
        super.onunload();
        document.body.toggleClass('@container', false);
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        await this.timerService.loadSettings();
    }

    async activateView() {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_TIMER);
        await this.app.workspace.getRightLeaf(false)?.setViewState({
            type: VIEW_TYPE_TIMER,
            active: true,
        });
    }
}
