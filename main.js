import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import ElementUI from 'element-ui'
import elLocaleEn from 'element-ui/lib/locale/lang/en' // English
import elLocaleVi from 'element-ui/lib/locale/lang/vi' // English
import elLocaleZhCn from 'element-ui/lib/locale/lang/zh-CN' // Simplified Chinese
import elLocaleZhTw from 'element-ui/lib/locale/lang/zh-TW' // Traditional Chinese
import elLocaleJa from 'element-ui/lib/locale/lang/ja' // Japanese
import elLocaleKo from 'element-ui/lib/locale/lang/ko' // Korean
import elLocaleFr from 'element-ui/lib/locale/lang/fr' // French
import elLocaleEs from 'element-ui/lib/locale/lang/es' // Spanish
import elLocaleDe from 'element-ui/lib/locale/lang/de' // German
import elLocaleRu from 'element-ui/lib/locale/lang/ru-RU' // Russian
import elLocalePtBr from 'element-ui/lib/locale/lang/pt-br' // Portuguese (Brazil)
import elLocaleIt from 'element-ui/lib/locale/lang/it' // Italian

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'element-ui/lib/theme-chalk/index.css'

import DynaTable from './components/DynaTable.vue'

const localeMap = {
    'en': elLocaleEn,
    'vi': elLocaleVi,
    'zh-CN': elLocaleZhCn,
    'zh-TW': elLocaleZhTw,
    'ja': elLocaleJa,
    'ko': elLocaleKo,
    'fr': elLocaleFr,
    'es': elLocaleEs,
    'de': elLocaleDe,
    'ru': elLocaleRu,
    'pt-BR': elLocalePtBr,
    'it': elLocaleIt,
}

function getLocaleLib() {
    const locale = navigator.language || navigator.userLanguage
    let lib = null

    if (Object.keys(localeMap).includes(locale)) {
        lib = localeMap[locale]
    } else {
        if (Object.keys(localeMap).includes(locale.split('-')[0])) {
            lib = localeMap[locale.split('-')[0]]
        } else {
            lib = localeMap['en']
        }
    }
    
    return lib
}

export function dynatable(options) {
    const {
        containerId,
        columns,
        dataSource,
    } = options

    Vue.use(BootstrapVue)
    const localeLib = getLocaleLib()
    Vue.use(ElementUI, { locale: localeLib })
    
    const container = document.getElementById(containerId)

    if (!container) return console.error(`Undefined element with ID ${containerId}`)

    const vue = new Vue({
        render: h => h(DynaTable, { props: { columns, dataSource } })
    }).$mount(`#${containerId}`)

    return vue.$children[0]
}

if (typeof window !== 'undefined') window.dynatable = dynatable
