import { joinToString } from "../base";

export const vueIndexTs = (extraImports = []) => `import Vue from 'vue';
import App from './App';
${joinToString(extraImports)}
new Vue({
  el: '#root',
  render: h => h(App),
});`;

export const vueIndexAppVue = (styling, answers) => {
  const isTailwindcss = answers.styling.includes("tailwind css");
  return `
<template>
  <div>
    <h1${isTailwindcss ? ' class="text-4xl text-white bg-black"' : ""}>
      {{name}}
    </h1>
  </div>
</template>

<script lang="ts">
  import Vue from "vue";

  export default Vue.extend({
    data: function() {
      return {
        name: 'Hello World!',
      }
    },
  });
</script>

${styling}
`;
};

export const vueShimType = `
declare module "*.vue" {
  import Vue from 'vue'
  export default Vue
}
`;
