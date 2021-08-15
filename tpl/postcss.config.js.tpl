module.exports = {
  plugins: [
    <% if (isTailwind) { %>require('tailwindcss'),<% } %>
    require('autoprefixer')
  ]
};