import chalk from "chalk";
import ejs from "ejs";
import fs from "fs-extra";
import path from "path";
import { gitignore, packageJson, readmeFile } from "./templates/base";
import { emptyIndexJs } from "./templates/empty";
import { reactAppJs, reactIndexJs } from "./templates/react";
import { css, less, scss, stylus, tailwindcss } from "./templates/styling";
import { svelteAppSvelte, svelteIndexJs } from "./templates/svelte";
import { vueIndexAppVue, vueIndexTs } from "./templates/vue";
const spawn = require("cross-spawn");

const createHtml = (answers) => {
  const str = fs.readFileSync(
    path.resolve(__dirname, "../tpl/index.html.tpl"),
    "utf8"
  );
  const ret = ejs.render(str, {
    workboxWebpackPlugin: answers.plugins.includes("workboxWebpackPlugin"),
  });
  return ret;
};

const createPackageJson = (answers) => {
  let devDependencies = [
    "webpack",
    "webpack-cli",
    "html-webpack-plugin",
    "webpack-dev-server",
    "mini-css-extract-plugin",
  ];
  let dependencies = [];

  const { technology, langType, plugins, styling, cssPreprocessor } = answers;

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
  if (plugins.includes("htmlWebpackPlugin")) {
    devDependencies.push("html-webpack-plugin");
  }

  if (plugins.includes("workboxWebpackPlugin")) {
    devDependencies.push("workbox-webpack-plugin");
  }

  if (styling.length > 0) {
    devDependencies.push("mini-css-extract-plugin");
  }

  if (cssPreprocessor == "sass") {
    dependencies.push("sass-loader", "sass");
  }

  if (cssPreprocessor == "less") {
    dependencies.push("less-loader", "less");
  }

  if (cssPreprocessor == "stylus") {
    dependencies.push("stylus-loader", "stylus");
  }

  if (styling.includes("css")) {
    devDependencies.push(
      "style-loader",
      "css-loader",
      "postcss-loader",
      "postcss",
      "autoprefixer"
    );
  }

  return {
    file: JSON.stringify({ name: answers.name, ...packageJson }, null, 2),
    devDependencies: devDependencies.sort(),
    dependencies: dependencies.sort(),
  };
};
const createWebpackConfig = (answers) => {
  const str = fs.readFileSync(
    path.resolve(__dirname, "../tpl/webpack.config.js.tpl"),
    "utf8"
  );

  const { langType, styling, cssPreprocessor, plugins } = answers;
  let extension = "js";
  if (langType === "Typescript") {
    extension = "ts";
  }

  const ret = ejs.render(str, {
    entry: `./src/index.${extension}`,
    isCSS: styling.includes("css"),
    devServer: true,
    htmlWebpackPlugin: true,
    extractPlugin: "Only for Production",
    workboxWebpackPlugin: plugins.includes("workboxWebpackPlugin"),
    langType: langType,
    isPostCSS: true,
    cssType: cssPreprocessor,
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
const createIndex = (answers, stylingExtension) => {
  const { technology } = answers;

  switch (technology) {
    case "react":
      return reactIndexJs([`import "./index.${stylingExtension}"`]);
    case "vue":
      return vueIndexTs();
    case "svelte":
      return svelteIndexJs();
    default:
      return emptyIndexJs([`import "./index.${stylingExtension}"`]);
  }
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
  const str = fs.readFileSync(
    path.resolve(__dirname, "../tpl/babel.config.js.tpl"),
    "utf8"
  );
  const ret = ejs.render(str, {
    isReact: answers.technology === "react",
  });
  return ret;
};

const createPostcssConfig = (answers) => {
  const str = fs.readFileSync(
    path.resolve(__dirname, "../tpl/postcss.config.js.tpl"),
    "utf8"
  );
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
  const newIndex = createIndex(answers, stylingExtension);
  const newApp = createApp(answers);

  const fileMap = {
    "public/index.html": indexHtml,
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
    if (fileMap[file]) {
      fs.outputFileSync(
        path.resolve(process.cwd() + "/" + file),
        fileMap[file]
      );
    }
  });

  const devChild = spawn("yarn", ["add", "-D", ...devDependencies], {
    stdio: "inherit",
  });
  devChild.on("close", (code) => {
    if (code !== 0) {
      console.log(chalk.yellow(`${dependencies.join(" ")} install cancel.`));
      return;
    }

    console.log(chalk.green(`${devDependencies.join(" ")} install success.`));
    console.log();
    if (dependencies.length > 0) {
      const child = spawn("yarn", ["add", ...dependencies], {
        stdio: "inherit",
      });
      child.on("close", (code) => {
        if (code !== 0) {
          console.log(
            chalk.yellow(`${dependencies.join(" ")} install cancel.`)
          );
          return;
        }
        console.log(chalk.green(`${dependencies.join(" ")} install success.`));
        console.log();
      });
    }
  });
};
