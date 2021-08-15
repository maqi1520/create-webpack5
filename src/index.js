#!/usr/bin/env node
import inquirer from "inquirer";
import { generator } from "./generator";

const notice = "PostCSS, Autoprefixer and CSS Modules are supported by default"(
  async () => {
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
        type: "checkbox",
        message: "Pick the styling you're using:",
        name: "styling",
        choices: [
          { name: "css", checked: true },
          { name: "css modules", checked: true },
          { name: "postcss", checked: true },
          { name: "sass" },
          { name: "less" },
          { name: "stylus" },
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
          { name: "html webpack plugin", checked: true },
          { name: "copy webpack plugin", checked: true },
          { name: "clean webpack plugin", checked: true },
          { name: "webpack bundle analyzer" },
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
  }
)();
