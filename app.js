const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://RajatChauhan:Rajat%40123@cluster0.73vix.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = new mongoose.Schema({
    item: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    item: "Welcome to your ToDo List"
});

const item2 = new Item({
    item: "Hit the + button to Add a new Item"
});

const item3 = new Item({
    item: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

    Item.find(function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully saved");
                }
            });
            res.redirect("/");
        }
        else {
            res.render("list", {
                listTitle: "Today",
                newListItems: foundItems
            });
        }


    });
});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const lastItem = new Item({
        item: itemName
    });

    if (listName === "Today") {
        lastItem.save();

        res.redirect("/");
    }
    else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(lastItem);
            foundList.save();
            res.redirect("/" + listName);
        });
    }


});

app.post("/delete", function (req, res) {
    const delItem = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(delItem, function (err) {
            if (!err) {
                console.log("Succesfully Deleted checked Item.");
                res.redirect("/");
            }
        });  
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{ items:{ _id:delItem}}},function(err,foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }
});

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, function (err, result) {
        if (!err) {
            if (!result) {
                //Create a new List
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                list.save();
                res.redirect("/" + customListName);
            }
            else {
                //Show an Existing List
                res.render("list", {
                    listTitle: result.name,
                    newListItems: result.items
                });
            }
        }
    });






});

app.post("/:customListName", function (req, res) {
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/:customListName");
});

app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(process.env.PORT, function () {
    console.log("Server started on 3000");
});

// Url for the heroku app
// https://warm-fortress-91020.herokuapp.com/