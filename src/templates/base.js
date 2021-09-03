import _ from "lodash";

export const joinToString = (list) =>
  _.reduce(list, (all, i) => `${all + i}\n`, "");

export const packageJson = {
  version: "1.0.0",
  description: "",
  main: "index.js",
  keywords: [],
  author: "",
  license: "ISC",
  scripts: {
    dev: "webpack serve",
    build: "webpack --mode=production --node-env=production",
    "build:dev": "webpack --mode=development",
    "build:prod": "webpack --mode=production --node-env=production",
    watch: "webpack --watch",
  },
};

export const readmeFile = (name) => {
  return `# ${name}

Empty project.

## Building and running on localhost

First install dependencies:

\`\`\`sh
npm install
\`\`\`

\`\`\`sh
npm run dev
\`\`\`

To create a production build:

\`\`\`sh
npm run build:prod
\`\`\`

To create a development build:

\`\`\`sh
npm run build:dev
\`\`\`
`;
};

export const gitignore = () => `
.cache/
coverage/
dist/*
!dist/index.html
node_modules/
*.log

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`;
