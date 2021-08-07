#!/usr/bin/env node
const inquirer = require("inquirer");
const path = require('path');
const { writeFile, readdir, readFile } = require("fs").promises;

const configFiles = {};
const configFolderPath = path.resolve(__dirname, 'config');


(async () => {

  const files = await readdir(configFolderPath).catch(console.log);

  for (let i of files) {
    // framework name is situated between 2 dots eg- react between 2 '.'(s)
    const frameworkName = i.split('.')[1];
    configFiles[frameworkName] = path.join(configFolderPath, i);
  }

  const { technology } = await inquirer.prompt([
    {
      type: "list",
      message: "Pick the technology you're using:",
      name: "technology",
      choices: Object.keys(configFiles),
    }
  ]);

  let config = await readFile(configFiles[technology]).catch(console.log);

  const webpackConfig = path.join(process.cwd(), 'webpack.config.js');


  await writeFile(webpackConfig, config.toString()).catch(err=> {
    console.log(err);
    process.exit();
  });

  console.log("webpack.config.js successfully created");
})();
