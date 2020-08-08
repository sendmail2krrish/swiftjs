const swiftJs = require('./');

var app = swiftJs();

app.get('/', (req, res, next) => {
  console.log('query params', req.query)
  res.send('<h1>text</h1>');
})

app.get("/products/:id", (req, res) => {
  console.log('req', req.params.id);
  res.json({
    id: req.params.id,
    title: 'Test Product',
    price: 10
  });
});

app.get("/products", (req, res) => {
  res.json({
    count: 1,
    items: [{
      id: 1,
      title: 'Test Product',
      price: 10
    }]
  });
});

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

app.listen(3000, () => {
  console.log('Server running on 3000');
})