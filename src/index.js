const http = require('http');
const { URL } = require('url');

const routes = require('./routes');
const bodyParser = require('./helpers/bodyParser');

const server = http.createServer((request, response) => {
  const parsedUrl = new URL(`http://localhost:3000${request.url}`);

  console.log(`Request method ${request.method} | EndPoint ${parsedUrl.pathname}`);

  let { pathname } = parsedUrl;
  let id = null;
  const splitEndpoint = pathname.split('/').filter(Boolean);

  if (splitEndpoint.length > 1) {
    pathname = `/${splitEndpoint[0]}/:id`;
    id = splitEndpoint[1];
  }

  const route = routes.find(({ endpoint, method }) => {
    console.log(endpoint);
    return endpoint === pathname && method === request.method;
  });

  if (!route) {
    response.writeHead(404, {
      'Content-Type': 'text/html',
    });

    return response.end(`Cannot ${request.method} ${pathname}`);
  }

  request.params = {
    id,
  };
  request.query = Object.fromEntries(parsedUrl.searchParams);

  response.send = (statusCode, body) => {
    response.writeHead(statusCode, {
      'Content-Type': 'application/json',
    });

    response.end(JSON.stringify(body));
  }

  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    return bodyParser(request, () => route.handler(request, response));
  }

  route.handler(request, response);
});

server.listen(3000, () => console.log('🔥 Node rodando http://localhost:3000'));