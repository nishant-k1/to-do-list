const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const workItems = [];
const _ = require('lodash');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

mongoose.connect('mongodb+srv://new-user_nkb290195:dn7p6dI22UMEIomN@cluster0-3rdf9.mongodb.net/toDoListDB', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

// mongoose.connect('mongodb://localhost:27017/toDoListDB', {useNewUrlParser: true, useUnifiedTopology: true});


const itemsSchema = {
    name: String,
};


const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
    name: "Cook"
});
const item2 = new Item({
    name: "Eat"
});
const item3 = new Item({
    name: "Sleep"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema],
};
const List = mongoose.model('List', listSchema);

app.get('/', function(req, res) {

    Item.find({ name: { $not: { $eq: null } } }, function(err, docs) {
        if (err)
            console.log(err);

        else if (docs.length == 0) {
            Item.insertMany(defaultItems, function(err) {
                if (err) {
                    console.log(err);
                } else
                    console.log("Data has been inserted successfully");
            });
            res.redirect('/');
        } else {
            console.log('Check here' + docs);
            res.render('list', {
                ejsListTitle: "Today",
                ejsNewListItems: docs,
            });
        }
    });

});


app.post('/', function(req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName,
    });

    if (listName === 'Today') {
        item.save();
        res.redirect('/');
    } else {
        List.findOne({ name: listName }, function(err, docs) {
            if (!err)
                if (listName === docs.name)
                    console.log('found this' + docs);
            docs.items.push(item);
            docs.save();
            res.redirect('/' + _.lowerCase(listName));
        });
    }

});

app.post('/delete', function(req, res) {
    console.log(req.body.checkbox);
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName == 'Today') {
        Item.deleteMany({ _id: checkedItemId }, function(err) {
            if (err)
                console.log(err);
            else
                console.log("Item deleted");
            res.redirect('/');
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function(err, docs) {
            if (!err)
                res.redirect('/' + _.lowerCase(listName));
            console.log('code executed');
        });
    }



});

app.get('/:customListName', function(req, res) {
    const customListName = _.capitalize(req.params.customListName);
    console.log(customListName);

    const list = new List({
        name: customListName,
        items: defaultItems,
    });

    List.findOne({ name: customListName }, function(err, listDocs) {
        if (err)
            console.log(err);
        else if (listDocs == null || listDocs.length == 0) {
            console.log("saving");
            list.save();
            console.log("saved");
            res.redirect('/' + _.lowerCase(customListName));
        } else {

            console.log(listDocs);
            res.render('list', { ejsListTitle: customListName, ejsNewListItems: listDocs.items });
        }

    });


});


// const port = process.env.port;

// if(port==null || port=='')

//     port=3000;
// else
app.listen(3000, function() {
    console.log('Good to go!');

});