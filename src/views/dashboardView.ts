import {createApp, App} from 'vue'
import Card from '../ui/Dashboard.vue'
import {IconName, ItemView} from 'obsidian'

export const CARD_VIEW_TYPE = 'ob-shadcn-card-view';

export class CardView extends ItemView {
    private root: App | null = null;

    getViewType(): string {
        return CARD_VIEW_TYPE;
    }

    getDisplayText(): string {
        return "Card View";
    }

    getIcon(): IconName {
        return 'wallet-cards';
    }

    async onOpen(): Promise<void> {
        this.contentEl.toggleClass('custom-next', true);
        this.root = createApp(Card);
        this.root.mount(this.contentEl);
    }

    async onunload() {
        super.onunload();
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
    }
}