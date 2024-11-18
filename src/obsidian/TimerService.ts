import {Plugin, TFile, Modal, Setting, Notice} from 'obsidian';
import {COLORS, TimeEntry} from "@/types.ts";
import {useTimerStore} from "@/store/TimerStore.ts";
import {t} from "@/i18n/helpers.ts";

export class TimerService {
    plugin: Plugin;

    constructor(plugin: Plugin) {
        this.plugin = plugin;
    }

    async showNewEntryDialog(): Promise<{ title: string; tag: string } | null> {
        return new Promise((resolve) => {
            const modal = new Modal(this.plugin.app);
            let title = '';
            let tag = '';

            modal.titleEl.setText('新建事项');

            new Setting(modal.contentEl)
                .setName('事项')
                .addText(text => text
                    .setPlaceholder('你在做什么？')
                    .onChange(value => {
                        title = value;
                    }));

            new Setting(modal.contentEl)
                .setName('标签')
                .addDropdown(dropdown => {
                    dropdown.addOption('', '无标签');
                    const tags = this.getTags();
                    tags.forEach(tag => {
                        dropdown.addOption(tag, tag);
                    });
                    dropdown.addOption('create-new', '创建新标签...');
                    dropdown.onChange(value => {
                        if (value === 'create-new') {
                            const createTagModal = new Modal(this.plugin.app);
                            createTagModal.titleEl.setText('创建新标签');
                            new Setting(createTagModal.contentEl)
                                .setName('新标签')
                                .addText(text => text
                                    .setPlaceholder('输入新标签')
                                    .onChange(newTag => {
                                        tag = newTag;
                                    }));
                            new Setting(createTagModal.contentEl)
                                .addButton(btn => btn
                                    .setButtonText('创建')
                                    .onClick(() => {
                                        if (tag) {
                                            dropdown.addOption(tag, tag);
                                            dropdown.setValue(tag);
                                            createTagModal.close();
                                        }
                                    }));
                            createTagModal.open();
                        } else {
                            tag = value;
                        }
                    });
                });

            new Setting(modal.contentEl)
                .addButton(btn => btn
                    .setButtonText('开始计时')
                    .onClick(() => {
                        if (title) {
                            modal.close();
                            resolve({title, tag});
                        }
                    }));

            modal.open();
        });
    }

    async addTimeEntryToDailyNote(entry: TimeEntry): Promise<Boolean> {
        const fileName = window.moment(entry.startTime).format('YYYY-MM-DD');
        const filePath = `${useTimerStore().settings.dailyNotesFolder}/${fileName}.md`;

        let file = this.plugin.app.vault.getAbstractFileByPath(filePath) as TFile;
        if (!file) {
            if (useTimerStore().settings.enableCreateNote) {
                file = await this.plugin.app.vault.create(
                    filePath,
                    `${useTimerStore().settings.timeEntryHeading}\n`
                );
            } else {
                this.notice(t('createNoteFirst'));
                return false;
            }
        }

        const startTimeStr = window.moment(entry.startTime).format('HH:mm');
        const endTimeStr = window.moment(entry.endTime).format('HH:mm');
        const tagStr = entry.tag ? ` #${entry.tag}` : '';
        const newEntryText = `${useTimerStore().settings.timeEntryPrefix} ${startTimeStr} - ${endTimeStr} ${entry.title}${tagStr}`;

        const content = await this.plugin.app.vault.read(file);
        const lines = content.split('\n');

        const headingIndex = lines.findIndex(line => line.trim() === useTimerStore().settings.timeEntryHeading);
        if (headingIndex !== -1) {
            let insertIndex = headingIndex + 1;
            while (insertIndex < lines.length &&
            lines[insertIndex].startsWith(useTimerStore().settings.timeEntryPrefix)) {
                insertIndex++;
            }
            lines.splice(insertIndex, 0, newEntryText);
        } else {
            lines.push('', useTimerStore().settings.timeEntryHeading, newEntryText);
        }

        await this.plugin.app.vault.adapter.write(filePath, lines.join('\n'));
        return true;
    }

    async getTodayEntries(): Promise<TimeEntry[]> {
        const filePath = this.getTodayNote();
        const file = this.plugin.app.vault.getAbstractFileByPath(filePath) as TFile;
        if (!file) {
            return [];
        }

        const content = await this.plugin.app.vault.read(file);
        const lines = content.split('\n');
        const entries: TimeEntry[] = [];
        let isInTimeEntrySection = false;

        for (const line of lines) {
            if (line.trim() === useTimerStore().settings.timeEntryHeading) {
                isInTimeEntrySection = true;
                continue;
            }

            if (isInTimeEntrySection && line.startsWith(useTimerStore().settings.timeEntryPrefix)) {
                const match = line.match(/(\d{2}:\d{2}) - (\d{2}:\d{2}) (.*?)( #(\S+))?$/);
                if (match) {
                    const [, startTime, endTime, title, , tag] = match;
                    const entry: TimeEntry = {
                        id: Date.now() + entries.length,
                        title,
                        tag: tag || '',
                        startTime: window.moment(startTime, 'HH:mm').valueOf(),
                        endTime: window.moment(endTime, 'HH:mm').valueOf(),
                        duration: window.moment(endTime, 'HH:mm').diff(window.moment(startTime, 'HH:mm'), 'seconds'),
                        color: COLORS[entries.length % COLORS.length]
                    };
                    entries.push(entry);
                }
            }
        }
        return entries;
    }

    getTodayNote(): string {
        return `${useTimerStore().settings.dailyNotesFolder}/${window.moment().format('YYYY-MM-DD')}.md`;
    }

    notice(message: string) {
        new Notice(message);
    }

    private getTags(): string[] {
        // @ts-ignore
        const tags = this.plugin.app.metadataCache.getTags();
        return Object.keys(tags).map(tag => tag.slice(1));
    }
}