#!/usr/bin/env node
import inquirer from "inquirer";
import { generator } from "./generator";

const notice = "PostCSS, Autoprefixer and CSS Modules are supported by default";
(async () => {
  const answers = await inquirer.prompt([
    {
      type: "input",
      message: "Please enter your project name:",
      name: "name",
    },
    {
      type: "list",
      message: "Pick the technology you're using:",
      name: "technology",
      choices: ["no", "react", "vue", "svelte"],
    },
    {
      name: "langType",
      type: "list",
      message: `Pick a langType:`,
      description: `${notice}.`,
      choices: [
        {
          name: "ES6",
          value: "ES6",
        },
        {
          name: "Typescript",
          value: "Typescript",
        },
      ],
    },
    {
      type: "checkbox",
      message: "Pick the styling you're using:",
      name: "styling",
      choices: [
        { name: "css", checked: true },
        { name: "css modules", checked: true },
        { name: "tailwind css", checked: false },
      ],
    },
    {
      name: "cssPreprocessor",
      type: "list",
      message: `Pick a CSS pre-processor (${notice})}:`,
      description: `${notice}.`,
      choices: [
        {
          name: "Sass/SCSS (with dart-sass)",
          value: "dart-sass",
        },
        {
          name: "Less",
          value: "less",
        },
        {
          name: "Stylus",
          value: "stylus",
        },
      ],
    },
    {
      type: "checkbox",
      message: "Pick the UI libary you're using:",
      name: "UI",
      choices: ["bootstrap", "ant design"],
    },
    {
      type: "checkbox",
      message: "Pick the optimization you're using:",
      name: "optimization",
      choices: ["code split vendors", "code split commons"],
    },
    {
      type: "checkbox",
      message: "Pick the webpack plugins you're using:",
      name: "plugins",
      choices: [
        { name: "workbox-webpack-plugin", value: "workboxWebpackPlugin" },
        { name: "webpack-bundle-analyzer", value: "webpack-bundle-analyzer" },
      ],
    },
    {
      type: "checkbox",
      message: "Pick the linting you're using:",
      name: "linting",
      choices: ["eslint", "prettier"],
    },
  ]);

  generator(answers);

  console.log("webpack.config.js successfully created");
})();
