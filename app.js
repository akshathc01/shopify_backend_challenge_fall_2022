//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://akshath:akshath@cluster0.3ppdj.mongodb.net/inventoryDB?retryWrites=true/inventoryDB", {useNewUrlParser: true});

const productsSchema = {
  name: String,
  stock: Number,
  deletion: {
    deleted: Boolean,
    comment: String
  },
  aisle: String,
  location: String
};

const Product = mongoose.model("Product", productsSchema);

const inventorySchema = {
  name: String,
  products: [productsSchema]
};
 
const Inventory = mongoose.model("Inventory", inventorySchema);

app.get("/trash", function(req, res) {

  Product.find({'deletion.deleted': true}, function(err, foundProducts){
    if(err) {
      console.log(err);
    } else {
      res.render("trash", {listTitle: "Deleted Inventory", productList: foundProducts});
    }
    
  });

});

app.get("/", function(req, res) {

  Product.find({'deletion.deleted': false}, function(err, foundProducts){
    if(err) {
      console.log(err);
    } else {
      res.render("home", {listTitle: "Inventory", productList: foundProducts});
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/add", function(req, res){
  const product = new Product({
    name: req.body.productName,
    stock: req.body.productStock,
    deletion: {
      deleted: false,
      comment: ""
    },
    aisle: req.body.productAisle,
    location: req.body.productLoc
  });
  Product.create(product, function(err){
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully saved product to DB.");
    }
  });
  res.redirect("/");
});

app.post("/edit", function(req, res){
  Product.findOneAndUpdate({_id: req.body.productId},  {$set: {
    name: req.body.productName,
    stock: req.body.productStock,
    aisle: req.body.productAisle,
    location: req.body.productLoc 
  }}, {useFindAndModify: false},
  function(err, doc) {
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully updated product.");
      res.redirect("/");
    }
  });
});

app.post("/recover", function(req, res){
  Product.findOneAndUpdate({_id: req.body.productId},  {$set: {
    deletion: {
      deleted: false, 
      comment: ""
    } 
  }}, {useFindAndModify: false},
  function(err, doc) {
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully moved product to inventory.");
      res.redirect("/");
    }
  });
});

app.post("/delete", function(req, res){
  Product.findOneAndUpdate({_id: req.body.productId},  {$set: {
    deletion: {
      deleted: true, 
      comment: req.body.comment
    } 
  }}, {useFindAndModify: false},
  function(err, doc) {
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully moved product to trash.");
      res.redirect("/");
    }
  });
});

app.post("/permdelete", function(req, res){
  console.log(req.body);
  Product.deleteOne({_id: req.body.productId}, function(err, doc) {
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully deleted product.");
      res.redirect("/trash");
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
