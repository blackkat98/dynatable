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

        this.options = options
    }

    async draw() {
        const tableClassAttr = this.buildTableClassAttr()
        const tableStyleAttr = this.buildTableStyleAttr()
        this.preprocessSettings()
        const htmlHeader = this.buildHtmlHeader()
        const htmlBody = await this.buildHtmlBody()

        const html = `
            <table id="table-${this.tableId}" class="${tableClassAttr}" style="${tableStyleAttr}">
                <thead id="thead-${this.tableId}">${htmlHeader}</thead>
                <tbody id="tbody-${this.tableId}">${htmlBody}</tbody>
                <tfoot id="tfoot-${this.tableId}"></tfoot>
            </table>
        `
        const container = $(this.options.containerId.startsWith('#') ? this.options.containerId : `#${this.options.containerId}`)
        container.html(html)
    }

    buildTableClassAttr() {
        if (!this.options.tableClass || !Object.keys(this.options.tableClass).length) return 'table table-bordered'

        if (typeof this.options.tableClass === 'string') return this.options.tableClass
        else return Object.values(this.options.tableClass).join(' ')
    }

    buildTableStyleAttr() {
        let styleArr = []

        if (this.options.tableStyle && Object.keys(this.options.tableStyle).length) {
            if (typeof this.options.tableStyle === 'string') {
                styleArr = styleArr.concat(
                    this.options.tableStyle.split(';')
                        .map(el => el.trim())
                        .filter(el => el)
                        .map(el => {
                            const parts = el.split(':').map(el => el.trim())

                            return parts.length === 2 && parts[0] && parts[1] ? `${parts[0]}: ${parts[1]}` : ''
                        })
                        .filter(el => el)
                )
            } else {
                styleArr = styleArr.concat(Object.keys(this.options.tableStyle).map(propName => `${propName}: ${this.options.tableStyle[propName]}`).join('; '))
            }
        }

        if (!styleArr.some(el => el.startsWith('width:'))) styleArr.push('width: 100%')

        styleArr.push('')

        return styleArr.join('; ')
    }

    preprocessSettings() {
        this.expandColumnHeaderSettings(this.options.columns)
        this.headerArray = Array.from(Array(this.headerDepth)).map(el => [])
        this.buildColumnHeaderArray(this.options.columns)
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
                this.propList.push(columns[i])
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
                
                let styleArr = []

                if (cell.headerAlign && [ 'left', 'center', 'right' ].includes(cell.headerAlign)) styleArr.push(`text-align: ${cell.headerAlign}`)

                styleArr.push('')

                if (styleArr.length > 1) openingTag += ` style="${styleArr.join('; ')}"`

                openingTag += '>'

                return openingTag + (cell.label || '') + closingTag
            }).join('')

            return `<tr>${htmlCells}</tr>`
        })
        const htmlHeader = htmlRows.join('')

        return htmlHeader
    }

    async fetchData() {
        if (!this.options.datasource) return this.data = []
        if (!this.options.datasource.remote) return this.data = this.options.datasource.source || []

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

                let styleArr = []

                if (cell.contentAlign && [ 'left', 'center', 'right' ].includes(cell.contentAlign)) styleArr.push(`text-align: ${cell.contentAlign}`)

                styleArr.push('')

                if (styleArr.length > 1) openingTag += ` style="${styleArr.join('; ')}"`

                openingTag += '>'

                return openingTag + (cell.value || '') + closingTag
            }).join('')

            return `<tr>${htmlCells}</tr>`
        })
        const htmlBody = htmlRows.join('')

        return htmlBody
    }
}
