//jshint esversion:6

//modules
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

//coonection

mongoose.connect("mongodb://localhost:27017/todoListDB",{useNewUrlParser:true,useUnifiedTopology:true})

//intialization

const app = express();
const day = date.getDate();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Schema

const itemSchema = new mongoose.Schema({
  Work:{
    type:String,
    required:[true,"where is item"]
  }
});

const generalSchema = new mongoose.Schema({
  name:String,
  workList: [itemSchema]
});

//  models

const Item = mongoose.model("Item",itemSchema);

const List = mongoose.model("List",generalSchema);

//objects

const Welcome = new Item({
  Work: "Welcome to todoList!!!"
});

const Add = new Item({
  Work: "To Add - fill your work and hit + button  👇"
});

const Delete = new Item({
  Work: "👈  To Remove - hit checkButton"
});

const itemWork = [Welcome,Delete,Add];

//   get method

//(/) route
app.get("/", function(req, res) {

  Item.find(function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(itemWork,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Succesfully saved data");
        }
      })
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: day, newListItems: foundItems});
    }
  })
});

// general route
app.get("/:generalListName", function(req,res){
  const generalListName = _.capitalize(req.params.generalListName);
  List.findOne({name: generalListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const item = new List({
          name: generalListName,
          workList: itemWork
        })
        item.save();
        res.redirect("/" + generalListName)
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.workList});
      }
    }
  });
});

//about route
app.get("/about", function(req, res){
  res.render("about");
});

//   post  method

//   adding post
app.post("/", function(req, res){

  const item = req.body.newItem;
  const route = req.body.list;
  const newItem = new Item({
    Work: item
  });
 
  if(route === day){
    newItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: route},function(err,found){
      if(err){
        console.log(err);
      }
      else{
        console.log("in");
        found.workList.push(newItem);
        found.save();
        res.redirect("/"+ route);
      }
    })
  }
});

//work deleltion - checkbox
app.post("/delete",function(req,res){
  const id = req.body.checkBox;
  const listName = req.body.listName;

  if(listName===day){
    Item.findByIdAndRemove({_id:id},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("succesfully removed");
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName},{$pull: {workList: {_id:id}}},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Succesfully deleted from custom List");
        res.redirect("/"+ listName);
      }
    })
  }
})

//   listener

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
