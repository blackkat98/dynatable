import $ from 'jquery'
import { uid } from 'uid'
import _ from 'lodash'
import dottie  from 'dottie'

export class DynaTable
{
    constructor(options) {
        this.tableId = uid(10)
        // this.headerDepth = 1
        // this.headerArray = []
        // this.propList = []
        // this.data = []
        this.options = options
        this.inInitialState = true
        this.resetProps()
        this.bindEvents()
    }

    resetProps() {
        this.headerDepth = 1
        this.headerArray = []
        this.propList = []
        this.data = []
        this.loading = false
    }

    bindEvents() {
        const pageButtonClass = `.page-btn-group a.page-btn.table-${this.tableId}-page-btn`

        if (this.options.datasource.pagination && this.options.datasource.pagination.show) {
            $(() => {
                $('body').on('click', pageButtonClass, (event) => {
                    const selectedPage = $(event.target).data('page')
                    const currentPage = this.options.datasource.pagination.page || 1
                    this.options.datasource.pagination.page = selectedPage
                    this.draw()
                    $(pageButtonClass).each(index => {
                        $($(pageButtonClass)[index]).parent().removeClass('active')
                    })
                    $($(pageButtonClass)[selectedPage - 1]).parent().addClass('active')
                })
            })
        }
    }

    async draw() {
        this.resetProps()
        const tableClassAttr = this.buildTableClassAttr()
        const tableStyleAttr = this.buildTableStyleAttr()
        this.preprocessSettings()

        if (this.inInitialState) {
            const htmlHeader = this.buildHtmlHeader()
            const emptyHtmlBody = this.buildNoDataHtmlBody()
            const tableHtml = `
                <table id="table-${this.tableId}" class="table ${tableClassAttr}" style="${tableStyleAttr}">
                    <thead id="thead-${this.tableId}">${htmlHeader}</thead>
                    <tbody id="tbody-${this.tableId}" style="position: relative;">${emptyHtmlBody}</tbody>
                    <tfoot id="tfoot-${this.tableId}"></tfoot>
                </table>
                <div id="pagination-${this.tableId}" style="width: 100%;"><div>
            `
            const containerId = this.options.containerId.startsWith('#') ? this.options.containerId : `#${this.options.containerId}`
            $(containerId).html(tableHtml)
            this.inInitialState = false
        }

        const htmlBody = await this.buildHtmlBody()
        const htmlPagination = this.buildHtmlPagination()
        $(`#tbody-${this.tableId}`).html(htmlBody) // this line makes some borders disappear
        $(`#pagination-${this.tableId}`).html(htmlPagination)
    }

    buildTableClassAttr() {
        const fixedClass = 'table-bordered'

        if (!this.options.tableClass || !Object.keys(this.options.tableClass).length) return fixedClass

        let classes = []

        if (typeof this.options.tableClass === 'string') classes = this.options.tableClass.split(' ')
        else classes = Object.values(this.options.tableClass)

        return classes.join(' ')
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
        this.updateColumnHeaderArray(this.options.columns)
    }

    expandColumnHeaderSettings(columns) {
        for (let i = 0; i < columns.length; i++) {
            columns[i].colSpan = columns[i].colSpan || 1
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

    updateColumnHeaderArray(columns) {
        for (let i = 0; i < columns.length; i++) {
            const rowIndex = columns[i].depth - 1
            const rowSpan = columns[i].children && columns[i].children.length ? 1 : (this.headerDepth - columns[i].depth + 1)
            this.headerArray[rowIndex].push(_.cloneDeep({ ...columns[i], rowSpan: rowSpan, children: [] }))

            if (columns[i].children && columns[i].children.length) {
                this.updateColumnHeaderArray(columns[i].children)
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

                styleArr.push('vertical-align: middle')
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

    buildNoDataHtmlBody() {
        return `
            <tr>
                <td colspan="${this.propList.length}" style="vertical-align: middle; text-align: center; opacity: 0.7;">
                    No data
                </td>
            </tr>
        `
    }

    overlayBodyLoading() {
        const tbodyId = `#tbody-${this.tableId}`
        const tbodyWidth = $(tbodyId).outerWidth()
        const tbodyHeight = $(tbodyId).outerHeight()
        const loadingLayoutStyle = `
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            width: ${tbodyWidth}px;
            height: ${tbodyHeight}px;
            vertical-align: middle;
            padding-top: ${tbodyHeight - 35}px;
            background-color: rgba(205, 205, 205, 0.5);
            pointer-events: auto;
        `
        const spinnerBorderStyle = `
            border-width: 4px;
            background-color: rgba(205, 205, 205, 0.5);
            opacity: 0.5;
        `
        $(tbodyId).append(`
            <div id="tbody-loading-${this.tableId}" class="d-flex justify-content-center text-center" style="${loadingLayoutStyle}">
                <div class="spinner-border spinner-border-lg text-secondary" role="status" style="${spinnerBorderStyle}">
                    <span class="visually-hidden"></span>
                </div>
            </div>
        `)
    }

    async fetchData() {
        if (!this.options.datasource) return

        if (this.options.datasource.remote) {
            if (typeof this.options.datasource.source !== 'function') return

            this.overlayBodyLoading()

            await new Promise((res, rej) => {
                setTimeout(() => res(''), 150000)
            })
        } else {
            const dataSet = typeof this.options.datasource.source === 'function' ?
                this.options.datasource.source() : (Array.isArray(this.options.datasource.source) && this.options.datasource.source || [])

            if (this.options.datasource.pagination && this.options.datasource.pagination.show) {
                this.options.datasource.pagination.page = this.options.datasource.pagination.page || 1
                this.options.datasource.pagination.perPage = this.options.datasource.pagination.perPage || 10
                this.options.datasource.pagination.total = this.data.length
                this.options.datasource.pagination.totalPages = Math.ceil(this.options.datasource.source.length / this.options.datasource.pagination.perPage)
                const { page, perPage, total, totalPages } = this.options.datasource.pagination
                this.data = dataSet.slice(perPage * (page - 1), perPage * page)
            } else {
                this.data = dataSet || []
            }
        }
    }

    async buildHtmlBody() {
        await this.fetchData()

        if (!this.data.length) return this.buildNoDataHtmlBody()

        const dataToShow = this.data.map((item, index) => {
            const rowToShow = []

            for (let i = 0; i < this.propList.length; i++) {
                const propCnf = this.propList[i]
                const propVal = _.cloneDeep(propCnf)
                propVal.columnIndex = i

                if (propCnf.type) {
                    switch (propCnf.type) {
                        case 'index':
                            const page = (this.options.datasource && this.options.datasource.pagination && this.options.datasource.pagination.page) || 1

                            if (this.options.datasource.pagination && this.options.datasource.pagination.show) {
                                const { page, perPage, total, totalPages } = this.options.datasource.pagination
                                propVal.value = perPage * (page - 1) + index + 1
                            } else {
                                propVal.value = index + 1
                            }

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

                styleArr.push('vertical-align: middle')
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

    buildHtmlPagination() {
        if (!this.options.datasource.pagination || !this.options.datasource.pagination.show) return ''
        
        const { page, perPage, total, totalPages } = this.options.datasource.pagination
        const pageButtons = Array.from(Array(totalPages)).map((element, index) => {
            return `
                <li class="page-item ${index + 1 === page ? 'active' : ''}">
                    <a 
                        id="table-${this.tableId}-page-btn-${index + 1}" 
                        class="page-link page-btn table-${this.tableId}-page-btn" 
                        href="javascript:void(0)" 
                        data-page="${index + 1}" 
                    >
                        ${index + 1}
                    </a>
                </li>
            `
        })
        const pageButtonGroup = `
            <ul class="pagination">
                ${pageButtons.join('')}
            </ul>
        `

        return `
            <div class="dynatable-pagination" style="display: flex; justify-content: space-between; width: 100%;">
                <div style="width: 150px;">

                </div>
                <div class="page-btn-group" style="width: calc(100% - 160px);">
                    ${pageButtonGroup}
                </div>
            </div>
        `
    }
}
