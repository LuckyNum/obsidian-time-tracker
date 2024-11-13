import {Plugin, WorkspaceLeaf} from 'obsidian';
import './global.css';
import {CardView, CARD_VIEW_TYPE} from './views/dashboardView.ts';

export default class ObsidianTimeTrackerPlugin extends Plugin {
    async onload(): Promise<void> {
        this.registerView(CARD_VIEW_TYPE, (leaf: WorkspaceLeaf) => new CardView(leaf));

        this.addRibbonIcon('wallet-cards', CARD_VIEW_TYPE, () => {
            this.app.workspace.getLeaf(true).setViewState({
                type: CARD_VIEW_TYPE,
            });
        });

        document.body.toggleClass('@container', true);
    }

    onunload() {
        super.onunload();
        document.body.toggleClass('@container', false);
    }
}
