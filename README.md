# virtual-scroll-vue

The goal of this project is to create an **efficient and easy-to-use** virtual list component **based on Vue3**.

## Installation 📚

```bash
npm install @e.yen/virtual-scroll-vue
```

Import it explicitly in `main.js` or on-demand in components:

```js
// main.ts
import VirtualScroll from '@e.yen/virtual-scroll-vue'
app.use(VirtualScroll)

// Or
// AnyComponent.vue
import { VirtualScroll } from '@e.yen/virtual-scroll-vue'
```

Import stylesheet:

```js
// main.ts
import '@e.yen/virtual-scroll-vue/dist/style.css'
```

## Advantages 🧐

### Truly Dynamic

Naturally supports items with dynamic heights.

### Intuitive

Passes the data to be rendered through scoped slots:

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

### No Blanks

By setting the minimum height of items, the list can determine the maximum rendering index range, ensuring there are always enough elements to fill the rendering area, solving the issue of blank areas appearing when users scroll too fast in traditional virtual lists.

### Adaptive

Works by providing a mock input for the minimum height of items, avoiding different effects across devices:

```html
<VirtualScroll :items="data" :placeholder="defaultItem">
  <template #default="{ item }">
    <!-- Item structure -->
  </template>
</VirtualScroll>
```

### Super "Lazy"

- Changes to items outside the rendering area (visible area + preloading area) do not trigger re-rendering.
- Elements that exceed the pre-rendering range due to minimum height calculations are not immediately destroyed but are delayed until the list moves in reverse.
- Ideally, only one element's `transform` property changes when the user scrolls.

## Usage 🤔

### Props Parameters

| Parameter     | Type                  | Default Value | Required | Description                      |
| :------------ | :-------------------- | :------------ | :------: | :------------------------------- |
| items         | `VirtualScrollItem[]` | -             |    ✔️    | List data                        |
| placeholder   | `VirtualScrollItem`   | -             |    ❌    | Mock data for the smallest item  |
| startPosition | `[number, number]`    | `[0, 0]`      |    ❌    | Initial position of the list     |
| preserved     | `number`              | -             |    ❌    | Minimum height of items          |
| padding       | `number`              | `100`         |    ❌    | Height of the pre-rendering area |

```ts
type VirtualScrollItem = {
  key?: any
  height?: number // Can specify element height, has the highest priority
  [k: string | symbol]: any
}
```

**Note**: The priority of `preserved` is higher than `placeholder`.

### Exposed Methods

| Method      | Parameters                           | Return Type        | Description                          |
| :---------- | :----------------------------------- | :----------------- | :----------------------------------- |
| scroll      | `delta: number`                      | -                  | Scroll a specific length             |
| transport   | `newStartPosition: [number, number]` | -                  | Transport to a specified position    |
| getPosition | -                                    | `[number, number]` | Get the current position of the list |

**Note**: When the exact height of each element is not specified via `items.height`, the result of `scroll` may differ from expected behavior.

## Precautions ⚠️

### Ensure Items Have Unique Keys

Since the list renders items using `v-for`, giving items unique keys can significantly improve performance:

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

### Never Set the Minimum Height to 0

Because the height of elements cannot be determined before they are rendered, the list relies on the minimum height of items to determine the rendering index range. Although you can set the minimum height to 0 using `placeholder`, this will cause the list to render all subsequent items:

```html
<!-- `preserved` defaults to a minimum value of 5px; setting it to 0 has no effect -->
<VirtualScroll :items="data" :preserved="0">
  <template #default="{ item }">
    <!-- Item structure -->
  </template>
</VirtualScroll>

<!-- Setting the minimum height to 0 via `placeholder`
    will cause the list to render all elements at once -->
<VirtualScroll :items="data" :placeholder="{}">
  <template #default="{ item }">
    <!-- Item with height 0 -->
    <div></div>
  </template>
</VirtualScroll>
```

### Do Not Add New Data Before the Starting Element

Since the rendering index range is determined by the starting element index, starting element offset, and minimum item height, adding new elements before the starting element can lead to unexpected results:

```js
// Assuming `startIndex` is 1
// Adding new data to the head of `items` will make the starting element of the list
// the item with index 0 in the old array
items.unshift({
  key: 'CDE',
})
```

### Do Not Modify the Height of Elements in the Pre-rendering Area

Specifically, do not modify the height of elements near the start direction of the list (e.g., if the list is arranged from top to bottom, do not modify the height of elements in the upper pre-rendering area)

> This is **not** a strict requirement; the list still works, but for height changes with transition effects, the lag of `resizeObserver` can cause minor jitters, degrading user experience.

### Use Only on Touchscreen Devices

While the list supports wheel scrolling, it **does not support** scrollbars. On PCs and other non-touchscreen devices, consider using pagination to achieve similar effects.
