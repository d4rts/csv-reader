const STYLE_ID = 'csv-reader-style';

export function injectCsvReaderStyle(): void {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        body.csv-reader-open { overflow: hidden !important; }

        .csv-reader-overlay {
            position: fixed;
            inset: 0;
            z-index: 2147483647;
            display: flex;
            flex-direction: column;
            width: 100vw;
            height: 100vh;
            background: #fff;
            color: #111827;
            font-family: Arial, Helvetica, sans-serif;
        }

        .csv-reader-header {
            flex: 0 0 56px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 18px 0 20px;
            border-bottom: 1px solid #d1d5db;
            box-sizing: border-box;
        }

        .csv-reader-title {
            font-size: 17px;
            font-weight: 600;
        }

        .csv-reader-close {
            border: 0;
            background: transparent;
            cursor: pointer;
            font-size: 36px;
            line-height: 1;
            padding: 2px 8px;
        }

        .csv-reader-table-container {
            flex: 1 1 auto;
            min-width: 0;
            min-height: 0;
            overflow: auto;
            padding: 12px;
            box-sizing: border-box;
        }

        .csv-reader-info {
            position: sticky;
            left: 0;
            width: max-content;
            margin-bottom: 8px;
            font-size: 13px;
            color: #6b7280;
        }

        .csv-reader-table {
            border-collapse: collapse;
            width: max-content;
            min-width: 100%;
            white-space: nowrap;
            font-size: 14px;
        }

        .csv-reader-table th,
        .csv-reader-table td {
            border: 1px solid #d1d5db;
            padding: 7px 10px;
            text-align: left;
            vertical-align: top;
        }

        .csv-reader-table th {
            position: sticky;
            top: 0;
            z-index: 2;
            background: #f3f4f6;
        }

        .csv-reader-table.csv-reader-table-no-sticky th {
            position: static;
        }

        .csv-reader-table tbody tr:nth-child(even) td {
            background: #fafafa;
        }
    `;

    document.head.appendChild(style);
}
