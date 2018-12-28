import Vue from 'vue'
import { camelCase, upperFirst } from 'lodash'

// 全局导入组件
const requireComponent = require.context(
    // 其组件目录的相对路径
    './component/common',
    // 是否查询其子目录
    true,
    // 匹配基础组件文件名的正则表达式, 这里可以匹配的文件名为BaseXxxx.vue格式
    /[A-Z]\w+\.(vue|js)$/
)

requireComponent.keys().forEach(fileName => {

    const componentConfig = requireComponent(fileName) // 获取组件配置

    // 获取组件的 PascalCase 命名
    const componentName = upperFirst(
        camelCase(
            fileName.replace(/^\.\/(.*)\.\w+$/, '$1').split('/').pop()
        )
    )
    Vue.component(componentName, componentConfig.default || componentConfig)
})
