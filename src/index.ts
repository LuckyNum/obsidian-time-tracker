import {Plugin, WorkspaceLeaf} from 'obsidian';
import './global.css';
import {CustomShadcnView, VIEW_TYPE} from './views/view.ts';
import {CardView, CARD_VIEW_TYPE} from './views/dashboardView.ts';

export default class ShadcnStarter extends Plugin {
    async onload(): Promise<void> {
        this.registerView(VIEW_TYPE, (leaf: WorkspaceLeaf) => new CustomShadcnView(leaf));
        this.registerView(CARD_VIEW_TYPE, (leaf: WorkspaceLeaf) => new CardView(leaf));
        this.addRibbonIcon('calendar', VIEW_TYPE, () => {
            this.app.workspace.getLeaf(true).setViewState({
                type: VIEW_TYPE,
            });
        });

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
