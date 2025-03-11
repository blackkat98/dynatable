<template>
    <div>
        {{ columns }}
    </div>
</template>

<script>
import _ from 'lodash'

export default {
    name: 'Dynatable',
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
        }
    },
    mounted() {
        this.preprocessSettings()

        console.log(this.columnSettings)
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
    },
}
</script>

<style>

</style>
