import { CsvParser } from './CsvParser';
import { CsvPreview } from './CsvPreview';
import type {
    CsvData,
    CsvErrorCallback,
    CsvPreviewOptions,
    CsvReaderOptions,
    CsvRefreshCallback
} from './types';

const DEFAULT_OPTIONS = {
    delimiter: ',',
    autoDetectDelimiter: true,
    autoRefresh: false,
    refreshInterval: 1000,
    hasHeader: true
};

export class CsvReader {
    private readonly options: CsvReaderOptions & typeof DEFAULT_OPTIONS;
    private preview?: CsvPreview;
    private timer?: number;
    private lastContent?: string;
    private refreshCallbacks: CsvRefreshCallback[] = [];
    private errorCallbacks: CsvErrorCallback[] = [];
    private previewOptions: CsvPreviewOptions = {};

    constructor(
        private readonly filePath: string,
        options: CsvReaderOptions = {}
    ) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
    }

    async read(): Promise<CsvData> {
        const content = await this.loadFile();
        return this.parseContent(content);
    }

    async previewRows(limit = 10): Promise<CsvData> {
        const data = await this.read();

        return {
            headers: data.headers,
            rows: data.rows.slice(0, limit),
            totalRows: data.totalRows
        };
    }

    async openPreview(options: CsvPreviewOptions = {}): Promise<void> {
        this.previewOptions = options;

        const data = await this.read();

        this.preview = new CsvPreview(() => {
            this.stop();
            this.preview = undefined;

            this.options.onClose?.();
        });

        this.preview.open(data, options);

        if (this.options.autoRefresh) {
            await this.start();
        }
    }

    closePreview(): void {
        this.preview?.close();
    }

    onRefresh(callback: CsvRefreshCallback): this {
        this.refreshCallbacks.push(callback);
        return this;
    }

    onError(callback: CsvErrorCallback): this {
        this.errorCallbacks.push(callback);
        return this;
    }

    async start(): Promise<void> {
        if (this.timer !== undefined) return;

        try {
            this.lastContent = await this.loadFile();
        } catch (error) {
            this.emitError(error);
        }

        this.timer = window.setInterval(() => {
            void this.checkForChanges();
        }, this.options.refreshInterval);
    }

    stop(): void {
        if (this.timer !== undefined) {
            window.clearInterval(this.timer);
            this.timer = undefined;
        }
    }

    private async checkForChanges(): Promise<void> {
        try {
            const content = await this.loadFile();

            if (content === this.lastContent) return;

            this.lastContent = content;
            const data = this.parseContent(content);

            this.preview?.render(data, this.previewOptions);

            for (const callback of this.refreshCallbacks) {
                callback(data);
            }
        } catch (error) {
            this.emitError(error);
        }
    }

    private parseContent(content: string): CsvData {
        const delimiter = this.options.autoDetectDelimiter
            ? CsvParser.detectDelimiter(content)
            : this.options.delimiter;

        return CsvParser.parse(content, delimiter, this.options.hasHeader);
    }

    private async loadFile(): Promise<string> {
        const response = await fetch(this.withCacheBuster(this.filePath), {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(
                `Impossible de charger le CSV (${response.status} ${response.statusText})`
            );
        }

        return await response.text();
    }

    private withCacheBuster(url: string): string {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}_csv_reader_ts=${Date.now()}`;
    }

    private emitError(error: unknown): void {
        if (this.errorCallbacks.length === 0) {
            console.error('[CsvReader]', error);
            return;
        }

        for (const callback of this.errorCallbacks) {
            callback(error);
        }
    }
}
