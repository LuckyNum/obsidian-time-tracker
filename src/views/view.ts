import {createApp, App} from 'vue'
import MainApp from '../ui/MainApp.vue'
import {IconName, ItemView} from 'obsidian'

export const VIEW_TYPE = 'shadcn-vue-template-view';

export class CustomShadcnView extends ItemView {
    private root: App | null = null;
    getViewType(): string {
        return VIEW_TYPE;
    }

    getDisplayText(): string {
        return "Shadcn Vue Template";
    }

    getIcon(): IconName {
        return 'calendar';
    }

    async onOpen(): Promise<void> {
        this.contentEl.toggleClass('custom-next', true);
        this.root = createApp(MainApp);
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