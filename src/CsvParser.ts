import type { CsvData } from './types';

export class CsvParser {
    static detectDelimiter(content: string): string {
        const firstLine = content.split(/\r?\n/, 1)[0] ?? '';
        const candidates = [',', ';', '\t', '|'];

        let selected = ',';
        let maxCount = -1;

        for (const delimiter of candidates) {
            const count = this.countDelimiterOutsideQuotes(firstLine, delimiter);

            if (count > maxCount) {
                maxCount = count;
                selected = delimiter;
            }
        }

        return selected;
    }

    static parse(content: string, delimiter: string, hasHeader = true): CsvData {
        const rows = this.parseRows(content, delimiter)
            .filter(row => row.some(cell => cell.trim() !== ''));

        if (rows.length === 0) {
            return { headers: [], rows: [], totalRows: 0 };
        }

        if (!hasHeader) {
            const maxColumns = Math.max(...rows.map(row => row.length));

            return {
                headers: Array.from({ length: maxColumns }, (_, i) => `Column ${i + 1}`),
                rows,
                totalRows: rows.length
            };
        }

        const [headers, ...dataRows] = rows;

        return {
            headers,
            rows: dataRows,
            totalRows: dataRows.length
        };
    }

    private static parseRows(content: string, delimiter: string): string[][] {
        const rows: string[][] = [];
        let row: string[] = [];
        let field = '';
        let inQuotes = false;

        for (let i = 0; i < content.length; i++) {
            const char = content[i];
            const next = content[i + 1];

            if (char === '"') {
                if (inQuotes && next === '"') {
                    field += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
                continue;
            }

            if (char === delimiter && !inQuotes) {
                row.push(field);
                field = '';
                continue;
            }

            if ((char === '\n' || char === '\r') && !inQuotes) {
                if (char === '\r' && next === '\n') i++;

                row.push(field);
                rows.push(row);
                row = [];
                field = '';
                continue;
            }

            field += char;
        }

        if (field.length > 0 || row.length > 0) {
            row.push(field);
            rows.push(row);
        }

        return rows;
    }

    private static countDelimiterOutsideQuotes(line: string, delimiter: string): number {
        let count = 0;
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            if (line[i] === '"') {
                inQuotes = !inQuotes;
            } else if (line[i] === delimiter && !inQuotes) {
                count++;
            }
        }

        return count;
    }
}
