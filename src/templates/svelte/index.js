import { joinToString } from "../base";
export const svelteIndexJs = (extraImports) => `import App from './App.svelte';
${joinToString(extraImports)}

const app = new App({
  target: document.body,
  props: {
    name: 'world'
  }
});

window.app = app;

export default app;`;

export const svelteAppSvelte = (styling, answers) => {
  const isTailwindcss = answers.styling.includes("tailwind css");
  return `<script>
  export let name;
</script>
${styling}
<h1${
    isTailwindcss ? ' class="text-4xl text-white bg-black"' : ""
  }>Hello {name}!</h1>`;
};
