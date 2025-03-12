<template>
    <div>
        <div v-if="property.type">
            {{ pageSize * (pageNumber - 1) + rowIndex + 1 }}
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
        },
        colIndex: {
            type: Number,
        },
        pageNumber: {
            type: Number,
        },
        pageSize: {
            type: Number,
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
