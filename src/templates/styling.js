import _ from "lodash";

export const css = `h1 {
  color: white;
  background-color: black;
}`;

export const scss = `$primary-color: white;
$bg: black;
h1 {
  color: $primary-color;
  background-color: $bg;
}`;

export const less = `@primary-color: white;
@bg: black;
h1 {
  color: @primary-color;
  background-color: @bg;
}`;

export const stylus = `primary-color = white
bg = black
h1
  color: primary-color;
  background-color: bg;
`;

export const tailwindcss = (withPostCSS = true) => {
  const importKeyword = withPostCSS ? "@tailwind" : "@import";
  return `${importKeyword} ${
    withPostCSS ? `base` : `'tailwindcss/dist/base.css'`
  };

${importKeyword} ${
    withPostCSS ? `components` : `'tailwindcss/dist/components.css'`
  };

${importKeyword} ${
    withPostCSS ? `utilities` : `'tailwindcss/dist/utilities.css'`
  };`;
};

export function getStyleTags(answers) {
  const isCss = answers.styling.includes("css");
  const isLess = answers.cssPreprocessor == "less";
  const isSass = answers.cssPreprocessor == "sass";
  const isStylus = answers.cssPreprocessor == "stylus";
  const cssStyle = `<style>
${css}
</style>`;
  const lessStyle = `<style lang="less">
${less}
</style>`;
  const sassStyle = `<style lang="scss">
${scss}
</style>`;
  const stylusStyle = `<style lang="styl">
${stylus}
</style>`;

  return _.concat(
    [],
    isCss ? cssStyle : [],
    isSass ? sassStyle : [],
    isLess ? lessStyle : [],
    isStylus ? stylusStyle : []
  );
}
