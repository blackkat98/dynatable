<template>
    <div>
        <div v-if="property.type">
            <span v-if="property.type === 'index'">
                {{ pageSize * (pageNumber - 1) + rowIndex + 1 }}
            </span>
            <span v-if="property.type === 'select'">
                <b-form-checkbox>
                    
                </b-form-checkbox>
            </span>
        </div>
        <div v-if="property.prop">
            {{ dottie.get(rowData, property.prop) }}
        </div>
    </div>
</template>

<script>
import dottie from 'dottie'

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
            dottie,
        }
    },
    methods: {
        
    },
}
</script>

<style>

</style>
