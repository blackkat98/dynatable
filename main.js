import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import DynaTable from './components/DynaTable.vue'

Vue.use(BootstrapVue)

export function dynatable(options) {
    const {
        containerId,
        columns,
        dataSource,
    } = options

    console.log({
        containerId,
        columns,
        dataSource,
    })
    
    function mountComponent() {
        const container = document.getElementById(containerId)

        if (!container) return console.error(`Undefined element with ID ${containerId}`)

        return new Vue({
            render: h => h(DynaTable, { props: { columns, dataSource } })
        }).$mount(`#${containerId}`)
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountComponent)
    else mountComponent()
}

if (typeof window !== 'undefined') window.dynatable = dynatable
