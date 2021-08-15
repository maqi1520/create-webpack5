import chalk from "chalk";
import ejs from "ejs";
import fs from "fs";
import path from "path";
import { gitignore, packageJson, readmeFile } from "./templates/base";
import { reactAppJs, reactIndexJs } from "./templates/react";
import { css, less, scss, stylus, tailwindcss } from "./templates/styling";
import { svelteAppSvelte, svelteIndexJs } from "./templates/svelte";
import { vueIndexAppVue, vueIndexTs } from "./templates/vue";
import { install } from "./util";

const createHtml = (answers) => {
  const str = fs.readFileSync("./tpl/index.html.tpl", "utf8");
  const ret = ejs.render(str, {
    workboxWebpackPlugin: answers.plugins.includes("workboxWebpackPlugin"),
  });
  return ret;
};

const createPackageJson = (answers) => {
  let devDependencies = ["webpack", "webpack-cli"];
  let dependencies = [];

  const { technology, langType, devServer, plugins, styling } = answers;

  switch (technology) {
    case "react":
      dependencies.push("react", "react-dom");

      break;

    case "vue":
      dependencies.push("vue");
      devDependencies.push("vue-loader");
      break;
    case "svelte":
      devDependencies.push("svelte", "svelte-loader", "velte-preprocess");
      break;
  }

  switch (langType) {
    case "ES6":
      devDependencies.push("babel-loader", "@babel/core", "@babel/preset-env");
      if (technology === "react") {
        devDependencies.push("@babel/preset-react");
      }
      break;
    case "Typescript":
      devDependencies.push("typescript", "ts-loader");
      if (technology === "react") {
        devDependencies.push("@types/react", "@types/react-dom");
      }
      break;
  }
  if (devServer) {
    devDependencies.push("webpack-dev-server");
  }
  if (plugins.includes("htmlWebpackPlugin")) {
    devDependencies.push("html-webpack-plugin");
  }

  if (plugins.includes("workboxWebpackPlugin")) {
    devDependencies.push("workbox-webpack-plugin");
  }

  if (styling.length > 0 && plugins.includes("workboxWebpackPlugin")) {
    devDependencies.push("mini-css-extract-plugin");
  }

  if (styling.includes("sass")) {
    dependencies.push("sass-loader", "sass");
  }

  if (styling.includes("less")) {
    dependencies.push("less-loader", "less");
  }

  if (styling.includes("stylus")) {
    dependencies.push("stylus-loader", "stylus");
  }

  if (styling.includes("css")) {
    devDependencies.push("style-loader", "css-loader");
  }

  if (styling.includes("postcss")) {
    devDependencies.push("postcss-loader", "postcss", "autoprefixer");
  }

  return {
    file: { name: answers.name, ...packageJson },
    devDependencies,
    dependencies,
  };
};
const createWebpackConfig = (answers) => {
  const str = fs.readFileSync("./tpl/webpack.config.js.tpl", "utf8");

  const { langType, styling, plugins } = answers;
  let extension = "js";
  if (langType === "Typescript") {
    extension = "ts";
  }

  const ret = ejs.render(str, {
    entry: `./src/index.${extension}`,
    isCSS: styling.includes("css"),
    devServer: true,
    htmlWebpackPlugin: plugins.includes("htmlWebpackPlugin"),
    extractPlugin: "Only for Production",
    workboxWebpackPlugin: plugins.includes("workboxWebpackPlugin"),
    langType: "Typescript",
    isPostCSS: styling.includes("postcss"),
    cssType: "LESS",
  });
  return ret;
};
const createStyling = (answers) => {
  const { cssPreprocessor, styling } = answers;

  switch (cssPreprocessor) {
    case "less":
      return less;
    case "sass":
      return scss;

    case "stylus":
      return stylus;
    default:
      if (styling.includes("tailwind css")) {
        return tailwindcss();
      } else {
        return css;
      }
  }
};
const createIndex = (answers) => {
  const { technology } = answers;
  switch (technology) {
    case "react":
      return reactIndexJs();
    case "vue":
      return vueIndexTs();
    case "svelte":
      return svelteIndexJs();
    default:
      break;
  }
  return null;
};

const createApp = (answers) => {
  const { technology } = answers;
  switch (technology) {
    case "react":
      return reactAppJs();
    case "vue":
      return vueIndexAppVue();
    case "svelte":
      return svelteAppSvelte();
    default:
      break;
  }
  return null;
};

const createBabelConfig = (answers) => {
  const str = fs.readFileSync("./tpl/babel.config.js.tpl", "utf8");
  const ret = ejs.render(str, {
    isReact: answers.technology === "react",
  });
  return ret;
};

const createPostcssConfig = (answers) => {
  const str = fs.readFileSync("./tpl/postcss.config.js.tpl", "utf8");
  const ret = ejs.render(str, {
    isTailwind: answers.styling.includes("tailwind css"),
  });
  return ret;
};

export const generator = async (answers) => {
  let stylingExtension = "css";

  const { cssPreprocessor } = answers;

  switch (cssPreprocessor) {
    case "less":
      stylingExtension = "less";
      break;
    case "sass":
      stylingExtension = "scss";
      break;
    case "stylus":
      stylingExtension = "styl";
      break;
    default:
      break;
  }

  const styleFile = `src/index.${stylingExtension}`;

  const indexHtml = createHtml(answers);
  const {
    file: newPackageJson,
    devDependencies,
    dependencies,
  } = createPackageJson(answers);
  const newWebpackConfig = createWebpackConfig(answers);
  const newBabelConfig = createBabelConfig(answers);
  const newPostcssConfig = createPostcssConfig(answers);
  const newStyling = createStyling(answers);
  const newIndex = createIndex(answers, styleFile);
  const newApp = createApp(answers);

  const fileMap = {
    "index.html": indexHtml,
    "webpack.config.js": newWebpackConfig,
    "README.md": readmeFile(answers.name),
    ".gitignore": gitignore(),
    "package.json": newPackageJson,
    "src/index.js": newIndex,
    "src/app.js": newApp,
    [styleFile]: newStyling,
    "postcss.config.js": newPostcssConfig,
    "babel.config.js": newBabelConfig,
  };

  Object.keys(fileMap).forEach((file) => {
    fs.writeFileSync(file, fileMap[file]);
  });

  install(path.resolve("./"), true, false, dependencies).then(() => {
    console.log(chalk.green("dependencies install success."));
    console.log();
    install(path.resolve("./"), true, true, devDependencies).then(() => {
      console.log(chalk.green("devDependencies install success."));
      console.log();
    });
  });

  console.log(fileMap);
};

// const a = {
//   name: "test-webpack",
//   technology: "react",
//   UI: [],
//   styling: ["css", "css modules"],
//   cssPreprocessor: "less",
//   optimization: ["code split vendors", "code split commons"],
//   plugins: [
//     "html webpack plugin",
//     "copy webpack plugin",
//     "clean webpack plugin",
//     "webpack bundle analyzer",
//   ],
//   linting: ["eslint", "prettier"],
// };
