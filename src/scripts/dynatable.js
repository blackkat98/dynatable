import $ from 'jquery'
import { uid } from 'uid'
import _ from 'lodash'
import dottie  from 'dottie'

export class DynaTable
{
    constructor(options) {
        this.tableId = uid(10)
        this.headerDepth = 1
        this.headerArray = []
        this.propList = []
        this.data = []

        // this.options = options
        this.containerId = options.containerId
        this.columns = options.columns
        this.datasource = options.datasource
    }

    async draw() {
        this.preprocessSettings()

        const htmlHeader = this.buildHtmlHeader()
        const htmlBody = await this.buildHtmlBody()
        const html = `
            <table id="table-${this.tableId}" style="width: 100%; border: 1;">
                <thead id="thead-${this.tableId}">${htmlHeader}</thead>
                <tbody id="tbody-${this.tableId}">${htmlBody}</tbody>
                <tfoot id="tfoot-${this.tableId}"></tfoot>
            </table>
        `
        const container = $(this.containerId.startsWith('#') ? this.containerId : `#${this.containerId}`)
        container.html(html)
    }

    preprocessSettings() {
        this.expandColumnHeaderSettings(this.columns)
        this.headerArray = Array.from(Array(this.headerDepth)).map(el => [])
        this.buildColumnHeaderArray(this.columns)
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

                    if (Array.isArray(columns[i].children[j].iterateFrom) && columns[i].children[j].iterateFrom.length) {
                        let labels = [], props = []

                        if (typeof columns[i].children[j].label === 'function') {
                            labels = columns[i].children[j].label(columns[i].children[j].iterateFrom)
                        } else {
                            labels = columns[i].children[j].iterateFrom.map(el => '')
                        }

                        if (typeof columns[i].children[j].prop === 'function') {
                            props = columns[i].children[j].prop(columns[i].children[j].iterateFrom)
                        } else {
                            props = columns[i].children[j].iterateFrom.map(el => '')
                        }

                        const newChildren = labels.map((label, indice) => ({
                            ...columns[i].children[j],
                            iterateFrom: undefined,
                            label,
                            prop: props[indice],
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
            const rowIndex = columns[i].depth - 1
            const rowSpan = columns[i].children && columns[i].children.length ? 1 : (this.headerDepth - columns[i].depth + 1)
            this.headerArray[rowIndex].push(_.cloneDeep({ ...columns[i], rowSpan: rowSpan, children: [] }))

            if (columns[i].children && columns[i].children.length) {
                this.buildColumnHeaderArray(columns[i].children)
            } else {
                this.propList.push({
                    type: columns[i].type || '',
                    prop: columns[i].prop || '',
                    formatter: columns[i].formatter || '',
                })
            }
        }
    }

    buildHtmlHeader() {
        const htmlRows = this.headerArray.map(row => {
            const htmlCells = row.map(cell => {
                const closingTag = '</th>'
                let openingTag = '<th'

                if (cell.colSpan > 1) openingTag += ` colspan="${cell.colSpan}"`
                if (cell.rowSpan > 1) openingTag += ` rowspan="${cell.rowSpan}"`

                openingTag += '>'

                return openingTag + (cell.label || '') + closingTag
            }).join('')

            return `<tr>${htmlCells}</tr>`
        })
        const htmlHeader = htmlRows.join('')

        return htmlHeader
    }

    async fetchData() {
        if (!this.datasource) return this.data = []
        if (!this.datasource.remote) return this.data = this.datasource.source || []

        this.data = []
    }

    async buildHtmlBody() {
        await this.fetchData()

        const dataToShow = this.data.map((item, index) => {
            const rowToShow = []

            for (let i = 0; i < this.propList.length; i++) {
                const propCnf = this.propList[i]
                const propVal = _.cloneDeep(propCnf)
                propVal.columnIndex = i

                if (propCnf.type) {
                    switch (propCnf.type) {
                        case 'index':
                            propVal.value = index + 1
                            break

                        default:
                            propVal.value = ''
                    }
                } else if (propCnf.prop) {
                    const value = dottie.get(item, propCnf.prop)

                    if (typeof propCnf.formatter === 'function') propVal.value = propCnf.formatter(value)
                    else propVal.value = value
                } else {
                    propVal.value = ''
                }

                rowToShow.push(propVal)
            }

            return rowToShow
        })
        const htmlRows = dataToShow.map(row => {
            const htmlCells = row.map(cell => {
                const closingTag = '</td>'
                let openingTag = '<td'

                if (cell.columnIndex) openingTag += ` data-column-index="${cell.columnIndex}"`
                if (cell.type) openingTag += ` data-type="${cell.type}"`
                if (cell.prop) openingTag += ` data-prop="${cell.prop}"`

                openingTag += '>'

                return openingTag + (cell.value || '') + closingTag
            }).join('')

            return `<tr>${htmlCells}</tr>`
        })
        const htmlBody = htmlRows.join('')

        return htmlBody
    }
}
