const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const app = express();
app.use(cors());
app.use(bodyParser.json());

//database connection
const uri = process.env.DB_PATH;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


//root API
app.get('/', (req, res) => {
    const APIs = `
        Products    :   http://localhost:4500/products
    `
    res.send(APIs);
})

//load products from database
app.get('/products', (req, res) => {
    client.connect(err => {
        const collection = client.db("redOnion").collection("products");
        collection.find().toArray((error, documents) => {
            if (error) {
                res.status(500).send({ message: error });
            }
            else {
                res.send(documents);
            }
        })
    })
})

// load single product using a unique key
app.get('/products/:key', (req, res) => {
    const key = req.params.key;
    client.connect(err => {
        const collection = client.db("redOnion").collection("products");
        collection.find({ key: key }).toArray((err, documents) => {
            if (err) {
                res.status(500).send({ message: err });
            }
            else {
                res.send(documents[0]);
            }
        })
    })
})

//getting selected products using key
app.post('/products/getProductsByKey', (req, res) => {
    const key = req.body;
    client.connect(err => {
        const collection = client.db("redOnion").collection("products");
        collection.find({ key: { $in: key } }).toArray((error, documents) => {
            if (error) {
                res.status(500).send({ message: error });
            }
            else {
                res.send(documents);
            }
        })
    })
})


// posting user email and cart (placeOrder)
app.post('/placeOrder', (req, res) => {
    const orderDetails = req.body;
    orderDetails.orderTime = new Date();
    console.log(orderDetails)
    client.connect(err => {
        const collection = client.db("redOnion").collection("orders");
        collection.insertOne(orderDetails, (error, result) => {
            if (error) {
                res.send({ message: error });
            } else {
                res.send(result.ops[0]);
            }
        })
    })
})

//post products  to database
app.post('/addProducts', (req, res) => {
    const products = req.body;
    client.connect(err => {
        const collection = client.db("redOnion").collection("products");
        collection.insertMany(products, (error, result) => {
            if (error) {
                // console.log(error);
                res.status(500).send({ message: error })
            }
            else {
                res.send(result.ops[0]);
            }
        })
        // client.close();
    });
})









const port = process.env.PORT || 4500;
app.listen(port, () => console.log('listening to port 4500'));