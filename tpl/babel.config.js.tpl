module.exports={ 
    presets: [ 
        [ '@babel/preset-env', { modules: false } ],<% if (isReact) { %>'@babel/preset-react'<% } %>
    ]
}
