# Swift JS (backend Node.js framework)

## Examples

### Install
```
npm i node-swiftjs
```

### Create an app
```
const swiftJs = require('node-swiftjs');
var app = swiftJs();
```

### Use routes
```
app.get('/', (req, res) => {
  console.log("query params", req.query);
  res.send('<h1>Hello World!</h1>');
});

app.get("/products", (req, res) => {
  res.json({
    count: 1,
    items: [{
      title: 'Test Product',
      price: 10
    }]
  });
});

app.get("/products/:id", (req, res) => {
  res.json({
    id: req.params.id,
    title: 'Test Product',
    price: 10
  });
});

/**
 * Available methods
 */
app.get('<path>', (req, res) => {})
app.post('<path>', (req, res) => {})
app.put('<path>', (req, res) => {})
app.delete('<path>', (req, res) => {})
```

### Use middleware
```
app.get('/orders', (req, res, next) => {
  if (req.headers['authorization'] === 'JWT token') {
    console.log('next', next)
    next()
  } else {
    res.statusCode = 401;
    res.send('Not allowed')
  }
}, (req, res) => {
  res.json({
    count: 1,
    items: [{
      id: 1,
      title: 'Test order',
      price: 10
    }]
  });
});
```
