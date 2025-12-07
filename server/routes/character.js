let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');


// import character model (mongodb collection)
let Character = require('../models/character');

//  auth middleware
const { ensureLoggedIn } = require('../middleware/auth');

const uploadDir = path.resolve(__dirname, '../../public/uploads/characters');

const parsePortraits = (raw) => {
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
};

const saveBase64Portraits = async (rawPortraits = []) => {
  await fs.promises.mkdir(uploadDir, { recursive: true });

  const savedPortraits = [];
  for (const portrait of rawPortraits) {
    if (typeof portrait !== 'string' || !portrait.trim()) continue;

    if (portrait.startsWith('data:image')) {
      const [, data] = portrait.split('base64,');
      if (!data) continue;

      const extensionMatch = portrait.match(/data:image\/(.*?);/);
      const extension = extensionMatch && extensionMatch[1] ? extensionMatch[1] : 'png';
      const filename = `portrait-${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
      const buffer = Buffer.from(data, 'base64');
      const destination = path.join(uploadDir, filename);
      await fs.promises.writeFile(destination, buffer);
      savedPortraits.push(path.posix.join('/uploads/characters', filename));
      continue;
    }
  }

  return savedPortraits;
};

// Collects character fields from the request body so add and edit routes stay in sync
const buildCharacterPayload = async (req, currentPortraits = []) => {
  const body = req.body || {};
  const rawPortraits = typeof body.portraits === 'string' ? body.portraits : undefined;
  const rawProvided = typeof body.portraits !== 'undefined';
  const parsedPortraits = parsePortraits(rawPortraits);
  const existingPortraits = rawProvided
    ? parsedPortraits.filter(
        (portrait) => typeof portrait === 'string' && portrait.startsWith('/uploads/characters/')
      )
    : currentPortraits;

  const base64Portraits = rawProvided
    ? parsedPortraits.filter((portrait) => typeof portrait === 'string' && portrait.startsWith('data:image'))
    : [];
  const savedBase64Portraits = await saveBase64Portraits(base64Portraits);

  const portraits = [...existingPortraits, ...savedBase64Portraits];

  return {
    characterName: body.characterName,
    classLevel: body.classLevel,
    background: body.background,
    race: body.race,
    alignment: body.alignment,

    inspiration: !!body.inspiration,
    proficiencyBonus: body.proficiencyBonus,

    strengthScore: body.strengthScore,
    strengthMod: body.strengthMod,
    dexterityScore: body.dexterityScore,
    dexterityMod: body.dexterityMod,
    constitutionScore: body.constitutionScore,
    constitutionMod: body.constitutionMod,
    intelligenceScore: body.intelligenceScore,
    intelligenceMod: body.intelligenceMod,
    wisdomScore: body.wisdomScore,
    wisdomMod: body.wisdomMod,
    charismaScore: body.charismaScore,
    charismaMod: body.charismaMod,

    saveStrength: body.saveStrength,
    saveDexterity: body.saveDexterity,
    saveConstitution: body.saveConstitution,
    saveIntelligence: body.saveIntelligence,
    saveWisdom: body.saveWisdom,
    saveCharisma: body.saveCharisma,

    skillAcrobatics: body.skillAcrobatics,
    skillAnimalHandling: body.skillAnimalHandling,
    skillArcana: body.skillArcana,
    skillAthletics: body.skillAthletics,
    skillDeception: body.skillDeception,
    skillHistory: body.skillHistory,
    skillInsight: body.skillInsight,
    skillIntimidation: body.skillIntimidation,
    skillInvestigation: body.skillInvestigation,
    skillMedicine: body.skillMedicine,
    skillNature: body.skillNature,
    skillPerception: body.skillPerception,
    skillPerformance: body.skillPerformance,
    skillPersuasion: body.skillPersuasion,
    skillReligion: body.skillReligion,
    skillSleightOfHand: body.skillSleightOfHand,
    skillStealth: body.skillStealth,
    skillSurvival: body.skillSurvival,

    passivePerception: body.passivePerception,
    passiveInvestigation: body.passiveInvestigation,
    passiveInsight: body.passiveInsight,

    armor: body.armor,
    weapons: body.weapons,
    languages: body.languages,

    armorClass: body.armorClass,
    initiative: body.initiative,

    maxHP: body.maxHP,
    currentHP: body.currentHP,
    tempHP: body.tempHP,

    portraits,
  };
};

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
router.post('/add', ensureLoggedIn, upload.none(), async (req, res, next) => {
  try {
    const payload = await buildCharacterPayload(req);
    let newCharacter = Character(payload);
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
router.post('/edit/:id', ensureLoggedIn, upload.any(), async (req, res, next) => {
  try {
    let id = req.params.id;
    const existingCharacter = await Character.findById(id);
    const payload = await buildCharacterPayload(req, existingCharacter?.portraits || []);
    let updateCharacter = {
      _id: id,
      ...payload
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
