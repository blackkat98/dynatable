import $ from 'jquery'
import { uid } from 'uid'
import _ from 'lodash'

export class DynaTable
{
    constructor(options) {
        this.tableId = uid(10)
        this.headerDepth = 1
        this.headerArray = []

        // this.options = options
        this.containerId = options.containerId
        this.columns = options.columns
    }

    draw() {
        const htmlHeader = this.buildHtmlHeader()
        const html = `
            <table id="table-${this.tableId}" style="width: 100%;">
                <thead id="thead-${this.tableId}">${htmlHeader}</thead>
                <tbody id="tbody-${this.tableId}"></tbody>
                <tfoot id="tfoot-${this.tableId}"></tfoot>
            </table>
        `
        const container = $(this.containerId.startsWith('#') ? this.containerId : `#${this.containerId}`)
        container.html(html)
        const table = $(`#${this.tableId}`)
    }

    buildHtmlHeader() {
        this.expandColumnHeaderSettings(this.columns)
        this.headerArray = Array.from(Array(this.headerDepth)).map(el => [])
        this.buildColumnHeaderArray(this.columns)
        const htmlRows = this.headerArray.map(row => {
            const htmlCells = row.map(cell => {
                const closingTag = '</th>'
                let openingTag = '<th'

                if (cell.colSpan > 1) openingTag += ` colspan="${cell.colSpan}"`
                if (cell.rowSpan > 1) openingTag += ` rowspan="${cell.rowSpan}"`

                openingTag += '>'

                return cell.label ? openingTag + cell.label + closingTag : openingTag + closingTag
            }).join('')

            return `<tr>${htmlCells}</tr>`
        })
        const htmlHeader = htmlRows.join('')

        return htmlHeader
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
                        columns[i].children.splice(j, 1, ...newChildren)
                        columns[i].colSpan += newChildren.length - 1
                    }
                }

                this.expandColumnHeaderSettings(columns[i].children)
            }
        }
    }

    buildColumnHeaderArray(columns) {
        for (let i = 0; i < columns.length; i++) {
            const colSpan = columns[i].colSpan
            const rowIndex = columns[i].depth - 1
            const rowSpan = columns[i].children && columns[i].children.length ? 1 : (this.headerDepth - columns[i].depth + 1)

            for (let j = rowIndex; j < rowIndex + rowSpan; j++) {
                this.headerArray[j].push(j === rowIndex ? _.cloneDeep({ ...columns[i], rowSpan: rowSpan, children: [] }) : { colSpan: 1, rowSpan: 1 })
            }

            if (colSpan > 1) this.headerArray[rowIndex] = this.headerArray[rowIndex].concat(Array.from(Array(colSpan - 1)).map(el => ({ colSpan: 1, rowSpan: 1 })))

            if (columns[i].children && columns[i].children.length) this.buildColumnHeaderArray(columns[i].children)
        }
    }
}
