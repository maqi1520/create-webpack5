{
  "rules": {},
  "env": {
    "es6": true,
    "browser": true,
    "node": true
  },
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module",<% if (technology === "react") { %>
    "ecmaFeatures": {
      "jsx": true
    }<% } %>
  },
  "extends": [
    "eslint:recommended",<% if (technology === "vue") { %>
    "plugin:vue/essential",
    <% } %><% if (isPrettier) { %>
    "plugin:prettier/recommended"<% } %>
  ],
  "plugins": [<% if (technology === "react") { %>
    "react"<% } %><% if (technology === "vue") { %>
    "vue"<% } %>
  ]
}