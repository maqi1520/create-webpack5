const spawn = require("cross-spawn");

export const install = (root, useYarn, dev, dependencies, verbose) => {
  return new Promise((resolve, reject) => {
    let command;
    let args;
    if (useYarn) {
      command = "yarnpkg";
      args = ["add", "--exact"];
      if (dev) {
        args.push("-dev");
      }
      [].push.apply(args, dependencies);

      // Explicitly set cwd() to work around issues like
      // https://github.com/facebook/create-react-app/issues/3326.
      // Unfortunately we can only do this for Yarn because npm support for
      // equivalent --prefix flag doesn't help with this issue.
      // This is why for npm, we run checkThatNpmCanReadCwd() early instead.
      args.push("--cwd");
      args.push(root);
    } else {
      command = "npm";
      args = [
        "install",
        "--no-audit", // https://github.com/facebook/create-react-app/issues/11174

        "--save-exact",
        "--loglevel",
        "error",
      ];
      if (dev) {
        args.push("--save-dev");
      } else {
        args.push("--save");
      }

      [].push.apply(args, dependencies);
    }

    if (verbose) {
      args.push("--verbose");
    }

    const child = spawn(command, args, { stdio: "inherit" });
    child.on("close", (code) => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(" ")}`,
        });
        return;
      }
      resolve();
    });
  });
};
