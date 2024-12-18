import {TFile, Component, Notice} from 'obsidian';
import {EntryChangeCallback, FileMetadata, TimeEntry} from "@/types.ts";
import {useTimerStore} from "@/store/TimerStore.ts";
import {COLORS} from "@/lib/constants.ts";
import ObsidianTimeTrackerPlugin from "@/index.ts";

export class TimerIndexer extends Component {
    constructor(
        private plugin: ObsidianTimeTrackerPlugin,
        private callback: EntryChangeCallback
    ) {
        super();
    }

    /**
     * 初始化索引系统
     */
    public async initialize(): Promise<void> {
        try {
            if (!useTimerStore().initialized) {
                const statusBarItem = this.plugin.addStatusBarItem();
                statusBarItem.setText(`[TimeTracker] index: ${useTimerStore().dailyNotesSettings?.folder}`);

                const markdownFiles = this.plugin.app.vault.getMarkdownFiles();
                const skipped = await this.indexInitialFiles(markdownFiles);

                useTimerStore().initialized = true;
                useTimerStore().refresh();

                statusBarItem.setText(`[TimeTracker] total ${markdownFiles.length}，skipped ${skipped}`);
                // 设置2秒后自动消失
                setTimeout(() => {
                    statusBarItem.hide();
                }, 3000);
                // 初始化事件监听器
                this.registerEventHandlers(this.callback);
            }
        } catch (error) {
            new Notice(`初始化失败: ${error}`, 2000)
        }
    }

    /**
     * 注册事件处理器
     */
    private registerEventHandlers(callback: EntryChangeCallback): void {
        // 监听文件修改
        this.registerEvent(
            this.plugin.app.vault.on('modify', async (file) => {
                if (file instanceof TFile) {
                    const shouldIndexFile = await this.shouldIndexFile(file);
                    if (shouldIndexFile) {
                        await this.indexFile(file);

                        callback('modify', file)
                    }
                }
            })
        );

        // 监听文件删除
        this.registerEvent(
            this.plugin.app.vault.on('delete', (file) => {
                if (file instanceof TFile) {
                    useTimerStore().removeEntriesDB(file.path);

                    callback('delete', file)
                }
            })
        );

        // 监听文件重命名
        this.registerEvent(
            this.plugin.app.vault.on('rename', async (file, oldPath) => {
                if (file instanceof TFile) {
                    const oldEntry = await useTimerStore().getEntriesDB(oldPath);
                    if (oldEntry) {
                        await useTimerStore().removeEntriesDB(file.path);
                        if (oldEntry) {
                            oldEntry.path = file.path;
                            await useTimerStore().setEntriesDB(file.path, oldEntry);
                        }
                    }

                    callback('rename', file)
                }
            })
        );

        // 监听元数据变更
        this.registerEvent(
            this.plugin.app.metadataCache.on('changed', async (file) => {
                const shouldIndex = await this.shouldIndexFile(file);
                if (shouldIndex) {
                    await this.indexFile(file);

                    callback('changed', file)
                }
            })
        );
    }

    /**
     * 初始化所有文件的索引
     */
    private async indexInitialFiles(files: TFile[]): Promise<number> {
        let skipped = 0;
        files.filter(async file => {
            const shouldIndexFile = await this.shouldIndexFile(file);
            if (!shouldIndexFile) {
                skipped++;
            }
            return shouldIndexFile
        });

        for (const file of files) {
            await this.indexFile(file);
        }

        return skipped;
    }

    /**
     * 索引单个文件
     */
    private async indexFile(file: TFile): Promise<void> {
        try {
            const content = await this.plugin.app.vault.read(file);
            const fileMetadata: FileMetadata = {
                path: file.path,
                mtime: file.stat.mtime,
                timeEntry: this.extractTimeEntry(content)
            };
            await useTimerStore().setEntriesDB(file.path, fileMetadata);
        } catch (error) {
            console.error(`索引文件失败 ${file.path}:`, error);
            throw error;
        }
    }

    /**
     * 提取时间戳
     */
    private extractTimeEntry(content: string): TimeEntry[] {
        const entries: TimeEntry[] = [];
        let isInTimeEntrySection = false;
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.trim() === useTimerStore().settings.timeEntryHeading) {
                isInTimeEntrySection = true;
                continue;
            }
            if (isInTimeEntrySection) {
                const match = line?.trimEnd().match(/(\d{2}:\d{2}) - (\d{2}:\d{2}) (.*?)( #(\S+))?$/);
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

    /**
     * 判断文件是否应该被索引
     */
    private async shouldIndexFile(file: TFile): Promise<boolean> {
        // 检查路径是否在根目录下
        if (!file.path.startsWith(useTimerStore().dailyNotesSettings?.folder || 'Obsidian Time Tracker Daily Note')) return false;
        // 检查文件是否已存在且未修改
        const existingFile = await useTimerStore().getEntriesDB(file.path);
        return !(existingFile && existingFile.mtime === file.stat.mtime);
    }
}