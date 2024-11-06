# virtual-scroll-vue

此项目的目标是**基于Vue3**实现**高效易用**的虚拟列表组件

## 安装📚

```bash
npm install @e.yen/virtual-scroll-vue
```

在main.js中显式导入或者在组件中按需导入

```js
// main.ts
import VirtualScroll from '@e.yen/virtual-scroll-vue'
app.use(VirtualScroll)

// 或者
// AnyComponent.vue
import { VirtualScroll } from '@e.yen/virtual-scroll-vue'
```

导入样式

```js
// main.ts
import '@e.yen/virtual-scroll-vue/dist/style.css'
```

## 优势🧐

### 真动态

天然支持具有动态高度的子项

### 符合直觉

通过作用域插槽的形式将需要渲染的数据传递出来：

```html
<VirtualScroll :items="data" :preserved="50">
  <template #default="{ item }">
    <div class="dynamic_item">
      <a :href="item.avatar_link">
        <i>
          <img
            class="dynamic_item_avatar"
            :srcset="item.avatar_sources"
            :sizes="item.avatar_sizes"
            :alt="item.avatar_alt"
          />
        </i>
      </a>
    </div>
  </template>
</VirtualScroll>
```

### 无空白

通过确定子项的最小高度，列表能够确定最大渲染索引范围，确保始终有足够的元素填充渲染区域，解决传统虚拟列表中用户滚动过快会出现空白区域的问题

### 自适应

通过向列表提供一个最小高度子项的模拟输入就能工作，避免在不同设备下产生不同的效果：

```html
<VirtualScroll :items="data" :placeholder="defaultItem">
  <template #default="{ item }">
    <!-- 子项目结构 -->
  </template>
</VirtualScroll>
```

### 超级“懒”

- 渲染区域（可视区域 + 预加载区域）之外的任何子项目数据变化不会触发重新渲染
- 基于最小高度计算导致部分元素超出了预渲染范围不会立即销毁，而是在列表反向移动时才延迟销毁
- 理想情况下，用户滚动时只有一个元素的 `transform` 属性发生改变

## 用法🤔

### props参数

|     参数      |         类型          |  默认值  | 是否必须 |        描述        |
| :-----------: | :-------------------: | :------: | :------: | :----------------: |
|     items     | `VirtualScrollItem[]` |    -     |    ✔️    |      列表数据      |
|  placeholder  |  `VirtualScrollItem`  |    -     |    ❌    | 最小子项的模拟数据 |
| startPosition |  `[number, number]`   | `[0, 0]` |    ❌    |    列表初始位置    |
|   preserved   |       `number`        |    -     |    ❌    |   子项的最小高度   |
|    padding    |       `number`        |  `100`   |    ❌    |   预渲染区域高度   |

```ts
type VirtualScrollItem = {
  key?: any
  height?: number // 可以指定元素高度，具有最高优先级
  [k: string | symbol]: any
}
```

**注意**：`preserved` 的优先级高于 `placeholder`

### expose方法

|    方法     |                 参数                 |     返回值类型     |       描述       |
| :---------: | :----------------------------------: | :----------------: | :--------------: |
|   scroll    |           `delta: number`            |         -          |   滚动指定长度   |
|  transport  | `newStartPosition: [number, number]` |         -          |  传送到指定位置  |
| getPosition |                  -                   | `[number, number]` | 获取列表当前位置 |

**注意**：在没有通过 `items.height` 指定每个元素的精确高度时，`scroll` 的滚动结果可能与预期的行为不太相同

## 注意事项⚠️

### 让子项拥有唯一的key

由于列表基于v-for渲染子项，因此为子项拥有唯一的key能够大幅度提升性能表现：

```js
const items = [
  {
    key: 'ABC',
  },
  {
    key: 'BCD',
  },
]
```

### 任何时候都不要使最小高度为0

由于元素在被渲染之前无法确认其高度，因此列表依赖于子项目的最小高度确定渲染索引范围。虽然能够通过 `placeholder` 将最小高度设为0，但这会导致列表渲染后续所有子项：

```html
<!-- preserved默认具有最小值5px，设为0不会有任何效果 -->
<VirtualScroll :items="data" :preserved="0">
  <template #default="{ item }">
    <!-- 子项目结构 -->
  </template>
</VirtualScroll>

<!-- 通过placeholder将最小高度设为0，会导致列表一次性渲染所有元素 -->
<VirtualScroll :items="data" :placeholder="{}">
  <template #default="{ item }">
    <!-- 高度为0的子项目 -->
    <div></div>
  </template>
</VirtualScroll>
```

### 不要向起始元素之前添加新数据

由于列表的渲染索引范围由起始元素索引、起始元素偏移量和最小项目高度共同决定，因此向起始元素之前的位置添加新元素会导致意料之外的结果：

```js
// 假设 startIndex 为 1
// 向items头部添加新数据，会导致列表渲染的起始元素变为旧数组中索引为 0 的项
items.unshift({
  key: 'CDE',
})
```

### 不要修改预渲染区内的元素高度

具体来说是不要修改靠近列表排列起始方向一侧的元素高度（例如列表从上往下排列，则不要修改上方预渲染区域内的元素高度）

> 这**不是**强制要求的，相反，列表仍能正常工作，但是对于具有过渡效果的高度变化，受制于resizeObserver的滞后性，列表可能出现微小的抖动导致用户体验变差

### 仅在触屏设备上使用

虽然列表支持滚轮滚动，但是**暂不支持**滚动条，在PC等非触屏设备上应考虑使用分页实现类似效果
