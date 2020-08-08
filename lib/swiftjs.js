const http = require("http");
const url = require('url');
const parse = require("./router/regex");
const queryParse = require("./router/query");

let server;

function createResponse(res) {
  res.send = (message) => res.end(message);
  res.json = (data) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  };
  return res;
}

function processMiddleware(middleware, req, res) {
  if (!middleware) {
    // resolve false
    return new Promise((resolve) => resolve(true));
  }

  return new Promise((resolve) => {
    middleware(req, res, function () {
      resolve(true);
    });
  });
}

function swiftJs() {
  let routeTable = {};
  let parseMethod = "json"; // json, plain text

  function readBody(req) {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => {
        body += "" + chunk;
      });
      req.on("end", () => {
        resolve(body);
      });
      req.on("error", (err) => {
        reject(err);
      });
    });
  }

  server = http.createServer(async (req, res) => {
    const routes = Object.keys(routeTable);
    let match = false;
    let route;
    let urlPath = url.parse(req.url).pathname.replace(/^\/+/, '').replace(/\/$/, "").split('/');
    let parsedRoute;

    for (let i = 0; i < routes.length; i++) {
      route = routes[i].replace(/^\/+/, '').replace(/\/$/, "");
      parsedRoute = parse(route);

      if(urlPath.length === parsedRoute.length) {
        for(let j = 0; j < urlPath.length; j++) {
          if(
            new RegExp(parsedRoute[j]).test(urlPath[j]) && 
            (parsedRoute[j] == urlPath[j] || (parsedRoute[j].includes('?<') && parsedRoute[j].includes('>\\w+)'))) && 
            routeTable[routes[i]][req.method.toLowerCase()]
          ) {
            let cb = routeTable[routes[i]][req.method.toLowerCase()];
            let middleware = routeTable[routes[i]][`${req.method.toLowerCase()}-middleware`];
            const m = req.url.match(new RegExp(parsedRoute.join('/')));

            req.params = m.groups;
            req.query = queryParse(req.url);

            let body = await readBody(req);
            
            if (parseMethod === "json") {
              body = body ? JSON.parse(body) : {};
            }
            req.body = body;

            const result = await processMiddleware(middleware, req, createResponse(res));

            if (result) {
              cb(req, res);
            }

            match = true;
            break;
          }
        }
      }
    }
    if (!match) {
      res.statusCode = 404;
      res.end("Not found");
    }
  });

  function registerPath(path, cb, method, middleware) {
    if (!routeTable[path]) {
      routeTable[path] = {};
    }
    routeTable[path] = { ...routeTable[path], [method]: cb, [method + "-middleware"]: middleware };
  }

  return {
    get: (path, ...rest) => {
      if (rest.length === 1) {
        registerPath(path, rest[0], "get");
      } else {
        registerPath(path, rest[1], "get", rest[0]);
      }
    },
    post: (path, ...rest) => {
      if (rest.length === 1) {
        registerPath(path, rest[0], "post");
      } else {
        registerPath(path, rest[1], "post", rest[0]);
      }
    },
    put: (path, ...rest) => {
      if (rest.length === 1) {
        registerPath(path, rest[0], "put");
      } else {
        registerPath(path, rest[1], "put", rest[0]);
      }
    },
    delete: (path, ...rest) => {
      if (rest.length === 1) {
        registerPath(path, rest[0], "delete");
      } else {
        registerPath(path, rest[1], "delete", rest[0]);
      }
    },
    bodyParse: (method) => parseMethod = method,
    listen: (port, cb) => {
      server.listen(port, cb);
    },
    _server: server
  };
}

exports = module.exports = swiftJs;