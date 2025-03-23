<template>
    <div>
        <div v-if="property.type">
            <span v-if="property.type === 'index'">
                {{ pageSize * (pageNumber - 1) + rowIndex + 1 }}
            </span>
        </div>
        <div v-if="property.prop">
            <span v-if="property.prop === '__SELECTED__'">
                <b-form-checkbox 
                    v-model="rowData.__SELECTED__" 
                    @change="onValueChange" 
                />
            </span>
            <span v-else>
                {{ lodash.get(rowData, property.prop) }}
            </span>
        </div>
    </div>
</template>

<script>
import _ from 'lodash'

export default {
    name: 'DynaBodyCell',
    props: {
        property: {
            type: Object,
            default: () => ({}),
        },
        rowIndex: {
            type: Number,
            default: undefined,
        },
        colIndex: {
            type: Number,
            default: undefined,
        },
        pageNumber: {
            type: Number,
            default: undefined,
        },
        pageSize: {
            type: Number,
            default: undefined,
        },
        rowData: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            lodash: _,
        }
    },
    methods: {
        onValueChange(value) {
            const change = {
                value,
                property: {
                    type: this.property.type,
                    prop: this.property.prop,
                }, 
                rowIndex: this.rowIndex,
                colIndex: this.colIndex,
                pageNumber: this.pageNumber,
                rowData: this.rowData,
            }
            this.$emit('row-data-change', change)
        },
    },
}
</script>

<style>

</style>
