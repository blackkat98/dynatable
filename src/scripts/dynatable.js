import $ from 'jquery'
import { uid } from 'uid'

export class DynaTable
{
    constructor(options) {
        this.tableId = `dyna-table-${uid(10)}`
        this.headerDepth = 1
        this.headerArray = []

        // this.options = options
        this.containerId = options.containerId
        this.columns = options.columns
    }

    draw() {
        const container = $(this.containerId.startsWith('#') ? this.containerId : `#${this.containerId}`)
        container.html(`
            <table id="${this.tableId}" style="width: 100%;">
                <thead></thead>
                <tbody></tbody>
                <tfoot></tfoot>
            </table>
        `)
        const table = $(`#${this.tableId}`)
        this.expandColumnHeaderSettings(this.columns)
        console.log(this.columns)
        console.log(this.headerDepth)
    }

    drawHeader() {
        this.expandColumnHeaderSettings(this.columns)

    }

    expandColumnHeaderSettings(columns) {
        for (let i = 0; i < columns.length; i++) {
            columns[i].colSpan = 1
            columns[i].depth = columns[i].depth || 1

            if (columns[i].depth > this.headerDepth) this.headerDepth = columns[i].depth

            if (columns[i].children && columns[i].children.length) {
                for (let j = 0; j < columns[i].children.length; j++) {
                    columns[i].children[j].depth = columns[i].depth + 1

                    if (columns[i].children[j].depth > this.headerDepth) this.headerDepth = columns[i].children[j].depth

                    if (typeof columns[i].children[j].label === 'function' && Array.isArray(columns[i].children[j].labelDatasource)) {
                        const newChildren = columns[i].children[j].label(columns[i].children[j].labelDatasource).map(el => ({
                            ...columns[i].children[j],
                            label: el,
                        }))
                        columns[i].children.splice(j, 1, newChildren)
                        columns[i].colSpan += newChildren.length - 1
                    }
                }

                this.expandColumnHeaderSettings(columns[i].children)
            }
        }
    }
}
