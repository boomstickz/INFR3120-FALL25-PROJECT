let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');

// import character model (mongodb collection)
let Character = require('../models/character');

//  auth middleware
const { ensureLoggedIn } = require('../middleware/auth');

// get route for the read character list - read operation
router.get('/', async (req, res, next) => {
  try {
    // retrieves all characters from database
    const CharacterList = await Character.find();

    // renders character list into ejs page
    res.render('Characters/list', {
      title: 'Characters',
      CharacterList: CharacterList
    });

  } catch (err) {
    console.error(err);

    //renders error on same list page
    res.render('Characters/list', {
      error: 'Error on server'
    });
  }
});

// get route for displaying add page - create operation
router.get('/add', ensureLoggedIn, async (req, res, next) => {
  try {
    res.render('Characters/add', {
      title: 'Add Character'
    });
  }
  catch (err) {
    console.error(err);
    res.render('Characters/list', {
      error: 'Error on server'
    });
  }
});

// post route for processing add page - create operation
router.post('/add', ensureLoggedIn, async (req, res, next) => {
  try {
    let newCharacter = Character({
      "characterName": req.body.characterName,
      "classLevel": req.body.classLevel,
      "background": req.body.background,
      "race": req.body.race,
      "alignment": req.body.alignment,
    });
    Character.create(newCharacter).then(() => {
      res.redirect('/characters');
    });

  }
  catch (err) {
    console.error(err);
    res.render('Characters/list', {
      error: 'Error on server'
    });
  }
});

// get route for displaying edit page - update operation
router.get('/edit/:id', ensureLoggedIn, async (req, res, next) => {
  try {
    const id = req.params.id;
    const characterToEdit = await Character.findById(id);
    res.render("Characters/edit",
      {
        title: 'Edit Character',
        Character: characterToEdit
      }
    );
  }
  catch (err) {
    console.log(err);
    next(err);
  }
});

// post route for processing edit page - update operation
router.post('/edit/:id', ensureLoggedIn, async (req, res, next) => {
  try {
    let id = req.params.id;
    let updateCharacter = Character({
      "_id": id,
      "characterName": req.body.characterName,
      "classLevel": req.body.classLevel,
      "background": req.body.background,
      "race": req.body.race,
      "alignment": req.body.alignment,
    });
    Character.findByIdAndUpdate(id, updateCharacter).then(() => {
      res.redirect("/characters");
    });
  }
  catch (err) {
    console.log(err);
    next(err);
  }
});

// get route for performing delete operation - delete operation
router.get('/delete/:id', ensureLoggedIn, async (req, res, next) => {
  try {
    let id = req.params.id;
    Character.deleteOne({ _id: id }).then(() => {
      res.redirect("/characters");
    });
  }
  catch (err) {
    console.log(err);
    next(err);
  }

});

// exports router for server.js
module.exports = router;
