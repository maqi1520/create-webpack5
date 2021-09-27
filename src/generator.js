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
import { getStyleTags } from "./templates/styling";
const spawn = require("cross-spawn");

const createHtml = (answers) => {
  if (answers.technology == "no") {
    return "";
  }
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
  let devDependencies = ["webpack", "webpack-cli"];
  let dependencies = [];

  const { technology, langType, plugins, styling, cssPreprocessor, linting } =
    answers;

  switch (technology) {
    case "react":
      dependencies.push("react", "react-dom");
      devDependencies.push(
        "html-webpack-plugin",
        "copy-webpack-plugin",
        "webpack-dev-server"
      );
      break;
    case "vue":
      dependencies.push("vue");
      devDependencies.push("vue-loader", "vue-template-compiler");
      devDependencies.push(
        "html-webpack-plugin",
        "copy-webpack-plugin",
        "webpack-dev-server"
      );
      break;
    case "svelte":
      devDependencies.push("svelte", "svelte-loader", "svelte-preprocess");
      devDependencies.push(
        "html-webpack-plugin",
        "copy-webpack-plugin",
        "webpack-dev-server"
      );
      break;
    default:
      packageJson.scripts.dev = undefined;
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
  if (plugins.includes("webpackBundleAnalyzer")) {
    devDependencies.push("webpack-bundle-analyzer");
  }

  if (plugins.includes("workboxWebpackPlugin")) {
    devDependencies.push("workbox-webpack-plugin");
  }

  if (styling.length > 0) {
    devDependencies.push("mini-css-extract-plugin");
  }

  if (styling.includes("tailwind css")) {
    dependencies.push("tailwindcss");
  }

  if (cssPreprocessor == "sass") {
    devDependencies.push("sass-loader", "sass");
  }

  if (cssPreprocessor == "less") {
    devDependencies.push("less-loader", "less");
  }

  if (cssPreprocessor == "stylus") {
    devDependencies.push("stylus-loader", "stylus");
  }

  if (styling.includes("css")) {
    devDependencies.push(
      "style-loader",
      "css-loader",
      "postcss-loader",
      "postcss",
      "autoprefixer",
      "mini-css-extract-plugin"
    );
  }
  if (linting.includes("prettier")) {
    devDependencies.push("prettier");
  }

  if (linting.includes("eslint")) {
    switch (technology) {
      case "react":
        devDependencies.push(
          "eslint",
          "eslint-plugin-react",
          "eslint-plugin-react-hooks"
        );
        break;
      case "vue":
        devDependencies.push("eslint");
        break;

      case "svelte":
        devDependencies.push("eslint");
        break;

      default:
        break;
    }
  }

  if (linting.includes("prettier") && linting.includes("eslint")) {
    devDependencies.push("eslint-config-prettier", "eslint-plugin-prettier");
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

  const { langType, styling, cssPreprocessor, plugins, technology } = answers;
  let extension = "js";
  if (langType === "Typescript") {
    extension = "ts";
  }

  const ret = ejs.render(str, {
    entry: `./src/index.${extension}`,
    isCSS: styling.includes("css"),
    isCSSModules: styling.includes("css modules"),
    technology,
    devServer: technology !== "no",
    htmlWebpackPlugin: technology !== "no",
    extractPlugin: technology !== "no" ? "Only for Production" : "No",
    workboxWebpackPlugin: plugins.includes("workboxWebpackPlugin"),
    webpackBundleAnalyzer: plugins.includes("webpackBundleAnalyzer"),
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
      if (styling.length > 0) {
        if (styling.includes("tailwind css")) {
          return tailwindcss();
        } else {
          return css;
        }
      }
      return "";
  }
};
const createIndex = (answers, stylingExtension) => {
  const { technology } = answers;

  const extraImports = stylingExtension
    ? [`import "./index.${stylingExtension}"`]
    : [];

  switch (technology) {
    case "react":
      return reactIndexJs(extraImports);
    case "vue":
      return vueIndexTs();
    case "svelte":
      return svelteIndexJs(extraImports);
    default:
      return emptyIndexJs(extraImports);
  }
};

const createApp = (answers) => {
  const { technology } = answers;
  switch (technology) {
    case "react":
      return ["src/app.js", reactAppJs()];
    case "vue":
      return [
        "src/app.vue",
        vueIndexAppVue(getStyleTags(answers).join(""), answers),
      ];
    case "svelte":
      return [
        "src/app.svelte",
        svelteAppSvelte(getStyleTags(answers).join(""), answers),
      ];
    default:
      break;
  }
  return null;
};

const createTailwindConfigFile = (answers) => {
  if (answers.styling.includes("tailwind css")) {
    const str = fs.readFileSync(
      path.resolve(__dirname, "../tpl/tailwind.confg.js.tpl"),
      "utf8"
    );

    let extension = "js";

    switch (answers.technology) {
      case "react":
        extension = "js,jsx,tsx";
        break;
      case "vue":
        extension = "js,vue";
        break;
      case "svelte":
        extension = "js,svelte";
        break;
      default:
        extension = "js";
    }
    const ret = ejs.render(str, {
      extension,
    });
    return ret;
  }
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

const createPrettierrcFile = (answers) => {
  if (answers.linting.includes("prettier")) {
    return `{"tabWidth": 2, "useTabs": false}`;
  }
};

const createEslintrcFile = (answers) => {
  const isPrettier = answers.linting.includes("prettier");
  const str = fs.readFileSync(
    path.resolve(__dirname, "../tpl/eslintrc.json.tpl"),
    "utf8"
  );
  const ret = ejs.render(str, {
    isPrettier,
    technology: answers.technology,
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
    case "none":
      stylingExtension = "css";
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
  const tailwindConfigFile = createTailwindConfigFile(answers);
  const newPostcssConfig = createPostcssConfig(answers);
  const newStyling = createStyling(answers);
  const newIndex = createIndex(answers, stylingExtension);
  const [newAppFileName, newApp] = createApp(answers);
  const prettierrcFile = createPrettierrcFile(answers);
  const eslintrcFile = createEslintrcFile(answers);

  const fileMap = {
    "public/index.html": indexHtml,
    "webpack.config.js": newWebpackConfig,
    "README.md": readmeFile(answers.name),
    ".gitignore": gitignore(),
    "package.json": newPackageJson,
    "src/index.js": newIndex,
    [newAppFileName]: newApp,
    [styleFile]: newStyling,
    "postcss.config.js": newPostcssConfig,
    "babel.config.js": newBabelConfig,
    ".prettierrc": prettierrcFile,
    ".eslintrc.json": eslintrcFile,
    "tailwind.config.js": tailwindConfigFile,
  };

  const root = path.resolve(answers.name);

  Object.keys(fileMap).forEach((file) => {
    if (fileMap[file]) {
      fs.outputFileSync(path.resolve(root + "/" + file), fileMap[file]);
    }
  });

  const devChild = spawn(
    "yarn",
    ["add", "-D", ...devDependencies, "--cwd", root],
    {
      stdio: "inherit",
    }
  );
  devChild.on("close", (code) => {
    if (code !== 0) {
      console.log(
        chalk.yellow(`${dependencies.join(" ")}`) + " install cancel."
      );
      return;
    }

    console.log(
      chalk.cyan(`${devDependencies.join(" ")}`) + " install success."
    );
    console.log();
    if (dependencies.length > 0) {
      const child = spawn("yarn", ["add", ...dependencies, "--cwd", root], {
        stdio: "inherit",
      });
      child.on("close", (code) => {
        if (code !== 0) {
          console.log(
            chalk.yellow(`${dependencies.join(" ")}`) + " install cancel."
          );
          return;
        }
        console.log(
          chalk.cyan(`${dependencies.join(" ")}`) + " install success."
        );
        console.log();

        console.log(chalk.green(`cd ${answers.name}`));
        console.log(chalk.green(`yarn dev`));
        console.log();
      });
    }
  });
};
