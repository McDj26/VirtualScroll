<script setup lang="ts">
import { ref } from 'vue'
import DynamicItem from '@/components/DynamicItem/DynamicItem.vue'
import { VirtualScroll, type VirtualScrollInstance } from '@pkg/index'
import {
  generateRandomFirstWord,
  generateRandomWord,
  lorem,
} from '@/utils/helper'
const defaultItem = { name: 'ab', comment: 'abc', index: -1 }
const items = ref(
  new Array(10000).fill(0).map((_, i) => ({
    key: i.toString(),
    name:
      generateRandomFirstWord() +
      (Math.random() > 0.5
        ? ' ' + generateRandomWord(Math.floor(Math.random() * 8) + 2)
        : ''),
    comment: lorem(Math.floor(Math.random() * 5) + 1),
    index: i,
  })),
)

const vlist = ref<VirtualScrollInstance>()
function lighteningScroll(delta: number) {
  vlist.value!.scroll(delta)
}
</script>

<template>
  <div class="page">
    <div class="scroll_container">
      <VirtualScroll
        ref="vlist"
        :items="items"
        :placeholder="defaultItem"
        :start-position="[1000, 0]"
        :padding="0"
      >
        <template #default="{ item }">
          <DynamicItem
            :index="item.index"
            :name="item.name"
            :comment="item.comment"
          ></DynamicItem>
        </template>
      </VirtualScroll>
    </div>
    <button @click="lighteningScroll(-100000)">向上极速滚动测试</button>
    <button @click="lighteningScroll(100000)">向下极速滚动测试</button>
  </div>
</template>

<style scoped>
.page {
  width: 80vw;
  height: 200vh;
  margin: 0 auto;
  text-align: center;
}
button {
  margin: 10px;
  padding: 10px 20px;
  background-color: rgb(102, 201, 130);
  border: none;
  border-radius: 5px;
  transition: all 0.2s;
}
button:active {
  background-color: rgb(102, 201, 130, 0.7);
}
.scroll_container {
  width: calc(100% - 40px);
  height: 80vh;
  padding: 0 20px;
  margin-bottom: 20px;
  border: 1px solid gray;
  border-radius: 2px;
  box-shadow: 0 0 5px 0;
  text-align: left;
}
</style>
