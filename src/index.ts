import {App, Plugin, PluginManifest, WorkspaceLeaf} from 'obsidian';
import './global.css';
import {TimerView, VIEW_TYPE_TIMER} from "@/views/TimerView.ts";
import {TimerSettingTab} from "@/obsidian/TimerSetting.ts";

export default class ObsidianTimeTrackerPlugin extends Plugin {
    constructor(app: App, manifest: PluginManifest) {
        super(app, manifest);
    }

    async onload(): Promise<void> {
        this.addSettingTab(new TimerSettingTab(this));
        this.registerTimerView();
        document.body.toggleClass('@container', true);
    }

    private registerTimerView() {
        this.registerView(VIEW_TYPE_TIMER, (leaf: WorkspaceLeaf) => new TimerView(leaf, this));
        this.addRibbonIcon('clock', 'Open Clock View', async () => {
            this.app.workspace.detachLeavesOfType(VIEW_TYPE_TIMER);
            await this.app.workspace.getRightLeaf(false)?.setViewState({
                type: VIEW_TYPE_TIMER,
                active: true,
            });
        });
    }

    onunload() {
        super.onunload();
        document.body.toggleClass('@container', false);
    }
}
