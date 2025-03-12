<template>
    <div>
        <b-table-simple 
            responsive 
            bordered 
            striped 
            :class="[ 'table-bordered' ]" 
        >
            <b-thead>
                <b-tr 
                    v-for="headerLine in headerArray" 
                    :class="[ 'header-line' ]" 
                >
                    <b-th 
                        v-for="headerCell in headerLine" 
                        :colspan="headerCell.colSpan || 1" 
                        :rowspan="headerCell.rowSpan || 1" 
                    >
                        {{ headerCell.label }}
                    </b-th>
                </b-tr>
            </b-thead>
            <b-tbody>
                <b-tr 
                    v-for="(dataLine, dataLineIndex) in data" 
                >
                    <b-td 
                        v-for="(prop, propIndex) in propList" 
                    >
                        <dyna-body-cell 
                            :property="prop" 
                            :rowIndex="dataLineIndex" 
                            :colIndex="propIndex" 
                            :pageNumber="pagination.page || 1" 
                            :pageSize="pagination.perPage || data.length" 
                            :rowData="dataLine" 
                        />
                    </b-td>
                </b-tr>
            </b-tbody>
        </b-table-simple>
    </div>
</template>

<script>
import _ from 'lodash'

import DynaBodyCell from './DynaBodyCell.vue'

export default {
    name: 'DynaTable',
    components: {
        DynaBodyCell,
    },
    props: {
        columns: {
            type: Array,
            default: () => [],
            required: true,
        },
        dataSource: {
            type: Object,
            default: () => ({}),
            required: true,
        },
    },
    data() {
        return {
            data: [],
            loading: false,
            columnSettings: _.cloneDeepWith(this.columns, v => v),
            dataSourceSettings: _.cloneDeepWith(this.dataSource, v => v),
            headerDepth: 1,
            headerArray: [],
            propList: [],
            pagination: {
                show: this.dataSource.pagination && this.dataSource.pagination.show || false,
                page: this.dataSource.pagination && this.dataSource.pagination.page || 1,
                perPage: this.dataSource && this.dataSource.perPage || 10,
                total: 0,
                totalPages: 0,
            },
        }
    },
    async mounted() {
        this.preprocessSettings()
        await this.fetchData()
    },
    methods: {
        preprocessSettings() {
            this.expandColumnHeaderSettings(this.columnSettings)
            this.headerArray = Array.from(Array(this.headerDepth)).map(el => [])
            this.updateColumnHeaderArray(this.columnSettings)
        },
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
        },
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
        },
        async fetchData() {
            if (!this.dataSource) return

            if (this.dataSource.remote) {

            } else {
                const dataSet = typeof this.dataSource.source === 'function' ? 
                    this.dataSource.source() : [ ...(Array.isArray(this.dataSource.source) ? this.dataSource.source : []) ]

                if (this.dataSource.pagination && this.dataSource.pagination.show) {
                    this.dataSource.pagination.page = this.dataSource.pagination.page || 1
                    this.dataSource.pagination.perPage = this.dataSource.pagination.perPage || 10
                    this.dataSource.pagination.total = this.data.length
                    this.dataSource.pagination.totalPages = Math.ceil(this.dataSource.source.length / this.dataSource.pagination.perPage)
                    const { page, perPage, total, totalPages } = this.dataSource.pagination
                    this.data = dataSet.slice(perPage * (page - 1), perPage * page)
                } else {
                    this.data = dataSet
                }
            }
        },
    },
}
</script>

<style>
.header-line {
    border-top: 1px solid #dee2e6 !important;
}
</style>
