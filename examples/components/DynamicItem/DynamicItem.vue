<template>
  <div class="dynamic_item">
    <div class="avatar">
      <span>{{ props.name }}</span>
      <span>#{{ props.index }}</span>
    </div>
    <div class="body">
      <p v-for="(sentence, i) in props.comment.split('\n')" :key="i">
        {{ sentence }}
      </p>
    </div>
    <hr />
    <div class="controls"></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ name: string; comment: string; index: number }>()
</script>

<style lang="scss" scoped>
.dynamic_item {
  width: 100%;
  box-sizing: border-box;
  margin: 10px 0;
  border: 1px solid rgb(102, 201, 130);
  background-color: transparent;
  border-radius: 3px;
  transition: all 0.5s;
  cursor: pointer;
  padding: 10px 20px;
  &:hover {
    background-color: rgb(65, 186, 131);
  }
  .avatar {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    font-weight: bold;
  }
  .body {
    text-indent: 2em;
    margin-top: 10px;
    color: gray;
    p {
      margin: 0;
    }
  }
}
</style>
