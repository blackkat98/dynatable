<template>
    <div>
        <div v-if="config.type === 'select'">
            <b-form-checkbox 
                v-model="checkbox.checked" 
                :intermediate="checkbox.isIndeterminate" 
            />
        </div>
        <div v-else>
            {{ config.label }}
        </div>
    </div>
</template>

<script>
export default {
    name: 'DynaBodyCell',
    props: {
        config: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            checkbox: {
                checked: false,
                isIndeterminate: false,
            },
        }
    },
    methods: {
        
    },
}
</script>

<style>

</style>
