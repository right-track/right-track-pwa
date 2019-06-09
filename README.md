Right Track PWA
======

This repository contains the source code for the **Right Track Progressive Web App**, 
a website used to search commuter train schedules and display real-time status and 
track information.

The website uses [Vue.js](https://vuejs.org/) as the javascript framework, 
[Vuetify](https://vuetifyjs.com/en/) as the material design UI framework, 
and [Webpack](https://webpack.js.org/) to bundle the javascript dependencies.
It also leverages [sql.js](https://github.com/kripken/sql.js/) to perform 
SQLite queries directly in the browser, enabling offline train schedule searches.

User management, user favorites, and real-time information are provided via a 
[Right Track API Server](https://github.com/right-track/right-track-server). Access 
to a Right Track API Server with a valid API Key is required for the website 
to properly function.

Installation
-----

1) From within the project directory, install all dependencies:

```
npm install
```

2) Create a local configuration file, `config.local.json`, and provide 
information for the **Right Track API Server**

```json
{
  "api": {
    "host": "https://api.righttrack.io",
    "clientId": "xxx",
    "clientKey": "yyy"
  }
}
```

3) Build the site

```
npm run build
```

4) Serve the `dist` directory
