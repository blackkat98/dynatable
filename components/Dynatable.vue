<template>
    <div class="dynatable-container">
        <div 
            v-if="loading" 
            ref="lcover" 
            class="dynatable-loading" 
        >
            <b-spinner></b-spinner>
        </div>
        
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
                        :class="getHeaderCellClass(headerCell)" 
                    >
                        <dyna-head-cell :config="headerCell" />
                    </b-th>
                </b-tr>
            </b-thead>
            <b-tbody ref="tbody">
                <b-tr 
                    v-if="data.length" 
                    v-for="(dataLine, dataLineIndex) in data" 
                >
                    <b-td 
                        v-for="(prop, propIndex) in propList" 
                        :class="getBodyCellClass(prop)" 
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
                <b-tr v-if="!data.length">
                    <b-td 
                        :colspan="propList.length || 1" 
                        :class="[ 'text-center' ]" 
                        :style="{
                            opacity: 0.3,
                        }" 
                    >
                        {{ dataSource && dataSource.noDataText || 'No data' }}
                    </b-td>
                </b-tr>
            </b-tbody>
            <b-tfoot>

            </b-tfoot>
        </b-table-simple>

        <div 
            v-if="pagination.show" 
            class="d-flex justify-content-end gap-4" 
            :style="{
                height: '40px',
            }" 
        >
            <el-pagination 
                v-model:current-page="pagination.page" 
                :total="pagination.total" 
                :page-size="pagination.perPage" 
                :page-sizes="pagination.perPageOptions" 
                layout="total, sizes, slot, prev, pager, next, jumper, ->" 
                :background="true" 
                :hide-on-single-page="false" 
                :disabled="false" 
                @size-change="onPerPageChange" 
                @current-change="onPageChange" 
            />
        </div>
    </div>
</template>

<script>
import _ from 'lodash'

import DynaHeadCell from './DynaHeadCell.vue'
import DynaBodyCell from './DynaBodyCell.vue'
import dottie from 'dottie'

export default {
    name: 'DynaTable',
    components: {
        DynaHeadCell,
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
        const columns = _.cloneDeepWith(this.columns, v => v)
        const dataSource = _.cloneDeepWith(this.dataSource, v => v)

        if (dataSource.select) {
            columns.unshift({
                prop: '__SELECTED__',
            })
        }

        return {
            data: [],
            loading: false,
            columnSettings: columns,
            dataSourceSettings: dataSource,
            headerDepth: 1,
            headerArray: [],
            propList: [],
            pagination: {
                show: dataSource.pagination && dataSource.pagination.show || false,
                page: dataSource.pagination && dataSource.pagination.page || 1,
                perPage: dataSource && dataSource.perPage || 10,
                perPageOptions: (dataSource.pagination && dataSource.pagination.perPageOptions && dataSource.pagination.perPageOptions.length) ? 
                    dataSource.pagination.perPageOptions : [ 10, 20, 30, 50, 100, 200, 300, 500, 1000 ],
                total: 0,
                totalPages: 0,
            },
            useSelect: !!dataSource.select,
            selectKeys: dataSource.select || [],
        }
    },
    async mounted() {
        this.preprocessSettings()
        await this.fetchData()
    },
    methods: {
        // Build and operate a table
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
                if (typeof this.dataSource.source !== 'function') return

                const requestMap = (this.dataSource && this.dataSource.sourceMap && this.dataSource.sourceMap.request) || {}
                let request = {}

                for (const key of Object.keys(requestMap)) {
                    if (requestMap[key] === 'page') {
                        dottie.set(request, key, this.pagination.page)
                    } else if ([ 'perPage', 'perpage', 'per_page' ].includes(requestMap[key])) {
                        dottie.set(request, key, this.pagination.perPage)
                    }

                    // to do: more custom params
                }

                this.loading = true

                try {
                    const response = await this.dataSource.source(request)
                    const responseMap = (this.dataSource && this.dataSource.sourceMap && this.dataSource.sourceMap.response) || {}

                    for (const key of Object.keys(responseMap)) {
                        if (responseMap[key] === 'data') {
                            this.data = dottie.get(response, key)
                        } else if (responseMap[key] === 'total') {
                            this.pagination.total = dottie.get(response, key)
                        } else if ([ 'totalPages', 'totalpages', 'total_pages' ].includes(responseMap[key])) {
                            this.pagination.totalPages = dottie.get(response, key)
                        }
                    }

                    this.loading = false
                } catch (err) {
                    console.error(err)
                    this.loading = false
                }
            } else {
                const dataSet = typeof this.dataSource.source === 'function' ? 
                    this.dataSource.source() : [ ...(Array.isArray(this.dataSource.source) ? this.dataSource.source : []) ]

                if (this.pagination && this.pagination.show) {
                    this.pagination.total = dataSet.length
                    this.pagination.totalPages = Math.ceil(dataSet.length / this.pagination.perPage)
                    this.data = dataSet.slice(this.pagination.perPage * (this.pagination.page - 1), this.pagination.perPage * this.pagination.page)
                } else {
                    this.data = dataSet
                }
            }

            if (this.useSelect) this.data = this.data.map(el => ({ ...el, __SELECTED__: false }))
        },
        getHeaderCellClass(propSettings) {
            const result = []

            switch (propSettings.headerAlign) {
                case 'center':
                    result.push('text-center')
                    break

                case 'right':
                    result.push('text-end')
                    break

                case 'left':
                    result.push('text-start')
                    break
            }

            return result
        },
        getBodyCellClass(propSettings) {
            const result = []

            switch (propSettings.contentAlign) {
                case 'center':
                    result.push('text-center')
                    break

                case 'right':
                    result.push('text-end')
                    break

                case 'left':
                    result.push('text-start')
                    break
            }

            return result
        },
        async onPageChange(page) {
            this.pagination.page = page
            await this.fetchData()
        },
        async onPerPageChange(perPage) {
            this.pagination.perPage = perPage
            await this.fetchData()
        },

        // Expose table data
        getData() {
            return this.data
        },
    },
}
</script>

<style lang="scss">
.header-line {
    border-top: 1px solid #dee2e6 !important;
}
.dynatable-container {
    position: relative;
    display: inline-block;
    width: 100%;

    .dynatable-loading {
        position: absolute;
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10;
        background: rgba(255, 255, 255, 0.8);
    }
}
</style>
