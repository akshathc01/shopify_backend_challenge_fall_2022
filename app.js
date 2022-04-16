//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/inventoryDB", {useNewUrlParser: true});

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

const product1 = new Product({
  name: "Laptop",
  stock: 20, 
  deletion: {
    deleted: false,
    comment: ""
  },
  aisle: "15B",
  location: "California"
});

const product2 = new Product({
  name: "Shoes",
  stock: 50, 
  deletion: {
    deleted: false,
    comment: ""
  },
  aisle: "10",
  location: "Toronto"
});

const defaultProducts = [product1, product2];

const inventorySchema = {
  name: String,
  products: [productsSchema]
};
 
const Inventory = mongoose.model("Inventory", inventorySchema);

app.get("/", function(req, res) {

  Product.find({}, function(err, foundProducts){

    if (foundProducts.length === 0) {
      Product.insertMany(defaultProducts, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully savevd default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("home", {listTitle: "Inventory", productList: foundProducts});
    }
  });

});

// app.get("/:customListName", function(req, res){
//   const customListName = _.capitalize(req.params.customListName);

//   List.findOne({name: customListName}, function(err, foundList){
//     if (!err){
//       if (!foundList){
//         //Create a new list
//         const list = new List({
//           name: customListName,
//           items: defaultProducts
//         });
//         list.save();
//         res.redirect("/" + customListName);
//       } else {
//         //Show an existing list

//         res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
//       }
//     }
//   });
// });

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

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }


});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
