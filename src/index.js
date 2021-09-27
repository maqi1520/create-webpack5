#!/usr/bin/env node
import inquirer from "inquirer";
import path from "path";
import { generator } from "./generator";
import fs from "fs-extra";
import chalk from "chalk";

function isSafeToCreateProjectIn(root, name) {
  const validFiles = [
    ".DS_Store",
    ".git",
    ".gitattributes",
    ".gitignore",
    ".gitlab-ci.yml",
    ".hg",
    ".hgcheck",
    ".hgignore",
    ".idea",
    ".npmignore",
    ".travis.yml",
    "docs",
    "LICENSE",
    "README.md",
    "mkdocs.yml",
    "Thumbs.db",
  ];
  // These files should be allowed to remain on a failed install, but then
  // silently removed during the next create.
  const errorLogFilePatterns = [
    "npm-debug.log",
    "yarn-error.log",
    "yarn-debug.log",
  ];
  const isErrorLog = (file) => {
    return errorLogFilePatterns.some((pattern) => file.startsWith(pattern));
  };

  const conflicts = fs
    .readdirSync(root)
    .filter((file) => !validFiles.includes(file))
    // IntelliJ IDEA creates module files before CRA is launched
    .filter((file) => !/\.iml$/.test(file))
    // Don't treat log files from previous installation as conflicts
    .filter((file) => !isErrorLog(file));

  if (conflicts.length > 0) {
    console.log(
      `The directory ${chalk.green(name)} contains files that could conflict:`
    );
    console.log();
    for (const file of conflicts) {
      try {
        const stats = fs.lstatSync(path.join(root, file));
        if (stats.isDirectory()) {
          console.log(`  ${chalk.blue(`${file}/`)}`);
        } else {
          console.log(`  ${file}`);
        }
      } catch (e) {
        console.log(`  ${file}`);
      }
    }
    console.log();
    console.log(
      "Either try using a new directory name, or remove the files listed above."
    );

    return false;
  }

  // Remove any log files from a previous installation.
  fs.readdirSync(root).forEach((file) => {
    if (isErrorLog(file)) {
      fs.removeSync(path.join(root, file));
    }
  });
  return true;
}

const notice = "PostCSS, Autoprefixer and CSS Modules are supported by default";
(async () => {
  const { name } = await inquirer.prompt([
    {
      type: "input",
      message: "Please enter your project name:",
      name: "name",
    },
  ]);
  const root = path.resolve(name);
  fs.ensureDirSync(name);
  if (!isSafeToCreateProjectIn(root, name)) {
    process.exit(1);
  }
  const answers = await inquirer.prompt([
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
          name: "None",
          value: "none",
        },
        {
          name: "Sass/SCSS (with dart-sass)",
          value: "sass",
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
      type: "list",
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
        { name: "webpack-bundle-analyzer", value: "webpackBundleAnalyzer" },
      ],
    },
    {
      type: "checkbox",
      message: "Pick the linting you're using:",
      name: "linting",
      choices: ["eslint", "prettier"],
    },
  ]);

  generator({ ...answers, name });

  console.log(
    `A new ${chalk.green(
      answers.technology
    )} app successfully created at ${root}`
  );
})();
