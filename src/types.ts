export interface CsvData {
    headers: string[];
    rows: string[][];
    totalRows: number;
}

export interface CsvReaderOptions {
    delimiter?: string;
    autoDetectDelimiter?: boolean;
    autoRefresh?: boolean;
    refreshInterval?: number;
    hasHeader?: boolean;
    onClose?: () => void;
}

export interface CsvPreviewOptions {
    title?: string;
    maxRows?: number;
    stickyHeader?: boolean;
    showLineNumbers?: boolean;
    followNewLines?: boolean;
}

export type CsvRefreshCallback = (data: CsvData) => void;
export type CsvErrorCallback = (error: unknown) => void;
