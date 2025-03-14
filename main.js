import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import ElementUI from 'element-ui'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'element-ui/lib/theme-chalk/index.css'

import DynaTable from './components/DynaTable.vue'

export async function dynatable(options) {
    const {
        containerId,
        columns,
        dataSource,
    } = options

    Vue.use(BootstrapVue)
    const locale = navigator.language || navigator.userLanguage
    let localeLib = null

    try {
        localeLib = await import(`element-ui/lib/locale/lang/${locale}`)
    } catch (error) {
        if (locale.includes('-')) {
            try {
                localeLib = await import(`element-ui/lib/locale/lang/${locale.split('-')[0]}`)
            } catch (err) {
                localeLib = await import(`element-ui/lib/locale/lang/en`)
            }
        } else {
            localeLib = await import(`element-ui/lib/locale/lang/en`)
        }
    }
    
    Vue.use(ElementUI, { locale: localeLib.default })
    
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
