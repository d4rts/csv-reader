import type { CsvData, CsvPreviewOptions } from './types';

export class CsvPreview {
    private overlay?: HTMLDivElement;
    private tableContainer?: HTMLDivElement;
    private titleElement?: HTMLDivElement;

    constructor(private readonly onClose?: () => void) {}

    open(data: CsvData, options: CsvPreviewOptions = {}): void {
        if (this.overlay) {
            this.render(data, options);
            return;
        }

        this.overlay = document.createElement('div');
        this.overlay.className = 'csv-reader-overlay';

        const header = document.createElement('div');
        header.className = 'csv-reader-header';

        this.titleElement = document.createElement('div');
        this.titleElement.className = 'csv-reader-title';
        this.titleElement.textContent = options.title ?? 'Prévisualisation CSV';

        const closeButton = document.createElement('button');
        closeButton.className = 'csv-reader-close';
        closeButton.type = 'button';
        closeButton.setAttribute('aria-label', 'Fermer');
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => this.close());

        header.append(this.titleElement, closeButton);

        this.tableContainer = document.createElement('div');
        this.tableContainer.className = 'csv-reader-table-container';

        this.overlay.append(header, this.tableContainer);
        document.body.appendChild(this.overlay);
        document.body.classList.add('csv-reader-open');

        document.addEventListener('keydown', this.onKeyDown);
        this.render(data, options);
    }

    render(data: CsvData, options: CsvPreviewOptions = {}): void {
        if (!this.tableContainer) {
            return;
        }

        if (this.titleElement && options.title) {
            this.titleElement.textContent = options.title;
        }

        const previousScrollTop = this.tableContainer.scrollTop;
        const previousScrollLeft = this.tableContainer.scrollLeft;

        const bottomTolerance = 10;

        const wasAtBottom =
            this.tableContainer.scrollHeight -
            this.tableContainer.scrollTop -
            this.tableContainer.clientHeight <= bottomTolerance;

        const info = document.createElement('div');
        info.className = 'csv-reader-info';

        const limit = options.maxRows ?? data.rows.length;
        const visibleRows = data.rows.slice(0, limit);

        info.textContent =
            options.maxRows && data.totalRows > options.maxRows
                ? `${options.maxRows} lignes affichées sur ${data.totalRows}`
                : `${data.totalRows} lignes`;

        const table = document.createElement('table');
        table.className = 'csv-reader-table';

        if (options.stickyHeader === false) {
            table.classList.add('csv-reader-table-no-sticky');
        }

        if (options.multiLineHeaders) {
            table.classList.add("csv-reader-table-multiline");
        }

        /*
         * HEADER
         */
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        if (options.showLineNumbers) {
            const th = document.createElement('th');

            th.textContent = '#';
            th.className = 'csv-reader-line-number';

            headerRow.appendChild(th);
        }

        for (let columnIndex = 0;
             columnIndex < data.headers.length;
             columnIndex++) {

            const header = data.headers[columnIndex];

            const th = document.createElement('th');

            th.textContent =
                options.headerFormatter
                    ? options.headerFormatter(
                        header,
                        columnIndex
                    )
                    : header;

            headerRow.appendChild(th);
        }

        thead.appendChild(headerRow);
        table.appendChild(thead);

        /*
         * BODY
         */
        const tbody = document.createElement('tbody');

        for (let rowIndex = 0; rowIndex < visibleRows.length; rowIndex++) {
            const row = visibleRows[rowIndex];

            const tr = document.createElement('tr');

            /*
             * Numéro de ligne.
             */
            if (options.showLineNumbers) {
                const td = document.createElement('td');

                td.textContent = String(rowIndex + 1);
                td.className = 'csv-reader-line-number';

                tr.appendChild(td);
            }

            const columnCount = Math.max(
                data.headers.length,
                row.length
            );

            for (let i = 0; i < columnCount; i++) {
                const td = document.createElement('td');

                td.textContent = row[i] ?? '';

                tr.appendChild(td);
            }

            tbody.appendChild(tr);
        }

        table.appendChild(tbody);

        this.tableContainer.replaceChildren(info, table);

        this.tableContainer.scrollLeft = previousScrollLeft;

        /*
         * Suivi automatique.
         */
        if (options.followNewLines && wasAtBottom) {
            this.tableContainer.scrollTop =
                this.tableContainer.scrollHeight;
        } else {
            this.tableContainer.scrollTop = previousScrollTop;
        }
    }

    close(): void {
        document.removeEventListener('keydown', this.onKeyDown);
        this.overlay?.remove();
        document.body.classList.remove('csv-reader-open');

        this.overlay = undefined;
        this.tableContainer = undefined;
        this.titleElement = undefined;

        this.onClose?.();
    }

    private readonly onKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') this.close();
    };
}
