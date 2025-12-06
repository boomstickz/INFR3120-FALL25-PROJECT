// MongoBD collection for dnd character templates
// some numbers set to string to acount for showing modifiers as positive/negative

let mongoose = require('mongoose');

// create schema for character documents
let characterModel = new mongoose.Schema(
  {
    // Basic character info
    characterName: String,
    classLevel: String,     
    background: String,
    race: String,
    alignment: String,
    

    // Inspirationg and proficiency bonus
    inspiration: Boolean,
    proficiencyBonus: Number,

    // Ability scores and modifiers(set as string because it needs to show positive and negative)
    strengthScore: Number,
    strengthMod: String,
    dexterityScore: Number,
    dexterityMod: String,
    constitutionScore: Number,
    constitutionMod: String,
    intelligenceScore: Number,
    intelligenceMod: String,
    wisdomScore: Number,
    wisdomMod: String,
    charismaScore: Number,
    charismaMod: String,

    // Saving Throws
    saveStrength: String,
    saveDexterity: String,
    saveConstitution: String,
    saveIntelligence: String,
    saveWisdom: String,
    saveCharisma: String,

    // Skills
    skillAcrobatics: String,        // Dex
    skillAnimalHandling: String,    // Wis
    skillArcana: String,            // Int
    skillAthletics: String,         // Str
    skillDeception: String,         // Cha
    skillHistory: String,           // Int
    skillInsight: String,           // Wis
    skillIntimidation: String,      // Cha
    skillInvestigation: String,     // Int
    skillMedicine: String,          // Wis
    skillNature: String,            // Int
    skillPerception: String,        // Wis
    skillPerformance: String,       // Cha
    skillPersuasion: String,        // Cha
    skillReligion: String,          // Int
    skillSleightOfHand: String,     // Dex
    skillStealth: String,           // Dex
    skillSurvival: String,          // Wis

    passivePerception: Number,
    passiveInvestigation: Number,
    passiveInsight: Number,

    armor: String,
    weapons: String,
    languages: String,

    // Image gallery
    portraits: [String],

    // ===== COMBAT STATS =====
    armorClass: Number,
    initiative: String,
  
    maxHP: Number,
    currentHP: Number,
    tempHP: Number,
  },
  {
    collection: "characters"
  }
);

// creates character model using schema
const Character = mongoose.model('Character', characterModel);

// exports model to be used in routes and controllers
module.exports = Character;
