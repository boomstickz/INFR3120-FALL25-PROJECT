let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');

// import character model (mongodb collection)
let Character = require('../models/character');

//  auth middleware
const { ensureLoggedIn } = require('../middleware/auth');

// Collects character fields from the request body so add and edit routes stay in sync
const buildCharacterPayload = (req) => ({
  characterName: req.body.characterName,
  classLevel: req.body.classLevel,
  background: req.body.background,
  race: req.body.race,
  alignment: req.body.alignment,

  inspiration: !!req.body.inspiration,
  proficiencyBonus: req.body.proficiencyBonus,

  strengthScore: req.body.strengthScore,
  strengthMod: req.body.strengthMod,
  dexterityScore: req.body.dexterityScore,
  dexterityMod: req.body.dexterityMod,
  constitutionScore: req.body.constitutionScore,
  constitutionMod: req.body.constitutionMod,
  intelligenceScore: req.body.intelligenceScore,
  intelligenceMod: req.body.intelligenceMod,
  wisdomScore: req.body.wisdomScore,
  wisdomMod: req.body.wisdomMod,
  charismaScore: req.body.charismaScore,
  charismaMod: req.body.charismaMod,

  saveStrength: req.body.saveStrength,
  saveDexterity: req.body.saveDexterity,
  saveConstitution: req.body.saveConstitution,
  saveIntelligence: req.body.saveIntelligence,
  saveWisdom: req.body.saveWisdom,
  saveCharisma: req.body.saveCharisma,

  skillAcrobatics: req.body.skillAcrobatics,
  skillAnimalHandling: req.body.skillAnimalHandling,
  skillArcana: req.body.skillArcana,
  skillAthletics: req.body.skillAthletics,
  skillDeception: req.body.skillDeception,
  skillHistory: req.body.skillHistory,
  skillInsight: req.body.skillInsight,
  skillIntimidation: req.body.skillIntimidation,
  skillInvestigation: req.body.skillInvestigation,
  skillMedicine: req.body.skillMedicine,
  skillNature: req.body.skillNature,
  skillPerception: req.body.skillPerception,
  skillPerformance: req.body.skillPerformance,
  skillPersuasion: req.body.skillPersuasion,
  skillReligion: req.body.skillReligion,
  skillSleightOfHand: req.body.skillSleightOfHand,
  skillStealth: req.body.skillStealth,
  skillSurvival: req.body.skillSurvival,

  passivePerception: req.body.passivePerception,
  passiveInvestigation: req.body.passiveInvestigation,
  passiveInsight: req.body.passiveInsight,

  armor: req.body.armor,
  weapons: req.body.weapons,
  languages: req.body.languages,

  armorClass: req.body.armorClass,
  initiative: req.body.initiative,

  maxHP: req.body.maxHP,
  currentHP: req.body.currentHP,
  tempHP: req.body.tempHP,
});

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
    let newCharacter = Character(buildCharacterPayload(req));
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
    let updateCharacter = {
      _id: id,
      ...buildCharacterPayload(req)
    };
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
