<template>
    <div>
        <div v-if="config.prop === '__SELECTED__'">
            <b-form-checkbox 
                v-model="checkbox.isChecked" 
                :indeterminate="checkbox.isIndeterminate" 
                @change="onCheckboxChange" 
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
                isChecked: false,
                isIndeterminate: false,
            },
        }
    },
    methods: {
        setCheckbox(total, selected) {
            switch (true) {
                case !selected:
                    this.checkbox.isChecked = false
                    this.checkbox.isIndeterminate = false
                    break

                case selected < total:
                    this.checkbox.isChecked = false
                    this.checkbox.isIndeterminate = true
                    break

                case selected === total:
                    this.checkbox.isChecked = true
                    this.checkbox.isIndeterminate = false
                    break
            }
        },
        onCheckboxChange(value) {
            this.$emit('header-checkbox-change', value)
        },
    },
}
</script>

<style>

</style>
