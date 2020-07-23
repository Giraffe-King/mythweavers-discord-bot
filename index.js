const Discord = require('discord.js');
const client = new Discord.Client();
const axios = require('axios');
const config = require("./config.json");
const { parse, roll, parseAndRoll, Roll } = require('roll-parser');
const Keyv = require('keyv');

const userSheetIds = new Keyv();

var characterSheet = new Object();

const sheetTypes = ['D&D 5e'];
const knownCommands = [
	help = '**help** | returns some basic information',
	info = '**info** | returns some info about the bot',
	setid = '**setid** [sheetid] | *sets which myth-weavers sheet to use*',
	getname = '**getname** | *returns character\'s name*',
	listweapons = '**listweapons** | *lists weapons*',
	listspells = '**listspells** [level?] | *lists spells with optional level filter*',
	attack = '**attack** [weaponslot?] | *makes an attack with the weapon in the chosen slot or first slot*',
	whoami = '**whoami** | *lists basic information about the character*',
	listskills = '**listskills** | *lists all skills and their modifiers*',
	rollskill = '**rollskill** [skill] | *rolls the given skill check*',
	rollsave = '**rollsave** [save] | *rolls the given saving throw*',
	rollinit = '**rollinit** | *rolls initiative*',
	languages = '**languages** | *returns known languages*',
	getstats = '**getstats** | *returns basics stats; attributes, ac, hp, pp*',
	inventory = '**inventory** | returns items under \'Equipment\' and your currency',
	otherprofs = '**otherprofs** | returns other proficiencies',
	spell = '**spell** | fetches SRD spell description from <https://www.dnd5eapi.co/>',
	refresh = '**refresh** | re-fetches data for your sheet to reflect changes made',
	portraint = '**portrait** | displays your portrait',
	rollDice = '**roll** [dice] | rolls the given dice',
]
const skills = {
	strength: ['athletics'],
	dexterity: ['acrobatics', 'sleight_of_hand', 'stealth'],
	constitution: [],
	intelligence: ['arcana', 'history', 'investigation', 'nature', 'religion'],
	wisdom: ['animal_handling', 'insight', 'medicine', 'perception', 'survival'],
	charisma: ['deception', 'intimidation', 'performance', 'persuasion'],
}

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	//!mws setid 1892900
});

client.login(config.token);

client.on('message', async msg => {
	try {
		if (msg.content == config.prefix) {
			msg.reply(`Hello.\nFor information on the bot, please use the command *!mws info*\nFor a list of commands, please use the command *!mws commands*\nFor help, please use the command *!mws help*`);
			return;
		}
		if (!msg.content.startsWith(config.prefix))
			return;

		const args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
		const command = args.shift().toLowerCase();

		// Sheet not needed
		if (command === 'help') {
			msg.reply(`\nTo use this bot, you will have to give it your sheet's ID. This can be found by looking at the URL of your sheet; it will be the numbers at the end.`
				+ `\ni.e. <https://www.myth-weavers.com/sheet.html#id=XXXXXX> would have an ID of XXXXXX.\nCurrently this bot works for the following types of sheets: ${sheetTypes.join(', ')}`);
			return;
		}
		if (command === 'info') {
			msg.reply(`\nThis bot was created to help D&D 5e players to use their Myth-Weavers sheets as inputs for commands to quickly perform different actions without having to reference your sheet.`
				+ `\nBecause this bot cannot log in as you on https://www.myth-weavers.com, it cannot edit your sheets, so any changes you want saved will have to be done manually.`
				+ `\nThis bit's functionality with regards to game mechanics and descriptions is limited to what is available on the SRD so as to not violate OGL`);
			return;
		}
		if (command === 'setid') {
			SetId(parseInt(args[0]), msg);
			return;
		}
		if (command === 'commands') {
			ListCommands(msg);
			return;
		}
		if (command === 'spell') {
			await GetSpellInfo(args, msg);
			return;
		}
		if (command === 'roll') {
			await RollDice(args, msg);
			return;
		}


		// Sheet needed
		characterSheet = await userSheetIds.get(msg.author.id);
		if (characterSheet == undefined) {
			msg.reply('Sheet not set up, please use the setid command to set up your sheet.');
			return;
		}

		if (command === 'getname') {
			GetName(args, msg);
			return;
		}
		if (command === 'listweapons') {
			await ListWeapons(args, msg);
			return;
		}
		if (command === 'attack') {
			await AttackWithWeapon(args, msg);
			return;
		}
		if (command === 'listspells') {
			await ListSpells(args, msg);
			return;
		}
		if (command === 'whoami') {
			await WhoAmI(args, msg);
			return;
		}
		if (command === 'listskills') {
			await ListSkills(args, msg);
			return;
		}
		if (command === 'rollskill') {
			await RollSkill(args, msg);
			return;
		}
		if (command === 'rollsave') {
			await RollSave(args, msg);
			return;
		}
		if (command === 'rollinit') {
			await RollInit(args, msg);
			return;
		}
		if (command === 'languages') {
			await GetLanguages(args, msg);
			return;
		}
		if (command === 'getstats') {
			await GetStats(args, msg);
			return;
		}
		if (command === 'inventory') {
			await GetInventory(args, msg);
			return;
		}
		if (command === 'otherprofs') {
			await GetOtherProficiencies(args, msg);
			return;
		}
		if (command === 'refresh') {
			await RefreshSheet(args, msg);
			return;
		}
		if (command === 'portrait') {
			await DisplayPortrait(args, msg);
			return;
		}

		msg.reply(`Command not recognized.`);
	} catch (e) {
		console.log(`${msg.author.username}#${msg.author.discriminator} said: ${msg.content} which resulted in ${e}`);
	}
});

async function RollDice(args, msg) {
	try {
		msg.reply(`You rolled a ${await ParseAndRollWrapper(args[0])} on ${args[0]}`);
	} catch {
		msg.reply(`Could not parse ${args[0]}; format should be XdY+Z`)
	}
}

async function DisplayPortrait(args, msg) {
	msg.reply(characterSheet.character_portrait);
}

async function GetSpellInfo(args, msg) {
	var spellName = args.join('-').toLowerCase().replace(/'/g, '').replace(/,/g, '');
	var spellBlob;
	try {
		spellBlob = (await axios.get(config.apiUrl + 'spells/' + spellName)).data;
	} catch {
		msg.reply('Spell not found; I can only show SRD spells.')
	}
	var spellLevel = spellBlob.level;
	if (spellLevel == 1)
		spellLevel += 'st';
	else if (spellLevel == 2)
		spellLevel += 'nd';
	else if (spellLevel == 3)
		spellLevel += '3rd';
	else
		spellLevel += 'th';

	var components = spellBlob.components.join(', ');
	if (spellBlob.material)
		components += ` (${spellBlob.material})`

	var reply = `**${spellBlob.name}** \n*${spellLevel}-level ${spellBlob.school.name}*\n**Casting Time**: ${spellBlob.casting_time}\n**Range**: ${spellBlob.range}`
		+ `\n**Components**: ${components}\n**Duration**: ${spellBlob.duration}`;
	if (spellBlob.concentration) {
		reply += ` (Concentration)`
	}
	reply += `\n${spellBlob.desc}`;
	if (spellBlob.higher_level) {
		reply += `\n${spellBlob.higher_level}`
	}
	var classes = [];
	for (castingClass in spellBlob.classes) {
		classes.push(spellBlob.classes[castingClass].name);
	}
	reply += `\n**Classes**: ${classes.join(', ')}`;

	msg.reply(reply);
}

async function RefreshSheet(args, msg) {
	SetId(characterSheet.id, msg);
}

async function GetInventory(args, msg) {
	var reply = '**' + characterSheet.name + '** has: ';
	var any = false;
	var items = [];
	for (var i = 1; i <= 20; i++) {
		var item = characterSheet['equip' + i + '_'];
		if (item) {
			any = true;
			items.push(item);
		}
	}
	if (!any) {
		reply += 'None.'
	} else {
		reply += items.join(', ');
	}

	reply += `\n **PP**: ${+(characterSheet.currency_pp || '0').replace(/,/g, '')}, **EP**: ${+(characterSheet.currency_ep || '0').replace(/,/g, '')}` +
		`, **GP**: ${+(characterSheet.currency_gp || '0').replace(/,/g, '')}, **SP**: ${ +(characterSheet.currency_sp || '0').replace(/,/g, '')}` +
		`, **CP**: ${+(characterSheet.currency_cp || '0').replace(/,/g, '')}`;
	msg.reply(reply);
}

async function GetOtherProficiencies(args, msg) {
	var reply = `The other things **${characterSheet.name}** is proficient in are: `;
	var any = false;
	var others = [];
	for (var i = 1; i <= 12; i++) {
		var otherProf = characterSheet['proficiency_' + i];
		if (otherProf) {
			any = true;
			others.push(otherProf);
		}
	}
	if (!any) {
		reply += 'None.'
	} else {
		reply += others.join(', ');
	}
	msg.reply(reply);
}

async function GetStats(args, msg) {
	var reply = `**${characterSheet.name}**`;
	reply += `\n*${characterSheet['alignment']} ${characterSheet['race']}*`;
	reply += `\n**AC:** ${characterSheet['armor_class']} | **HP:** ${characterSheet['hp']}/${characterSheet['max_hp']} | **HD:** ${characterSheet['hit_dice']} | **Speed:** ${characterSheet['speed']}`;
	reply += `\n**STR: ** ${characterSheet['strength']} [${characterSheet['strength_mod']}] |`
		+ ` **DEX: ** ${characterSheet['dexterity']} [${characterSheet['dexterity_mod']}] |`
		+ ` **CON: ** ${characterSheet['constitution']} [${characterSheet['constitution_mod']}]`;
	reply += `\n**INT: ** ${characterSheet['intelligence']} [${characterSheet['intelligence_mod']}] |`
		+ ` **WIS: ** ${characterSheet['wisdom']} [${characterSheet['wisdom_mod']}] |`
		+ ` **CHA: ** ${characterSheet['charisma']} [${characterSheet['charisma_mod']}]`;
	reply += '\n**Saving throws:** ';
	for (var attribute in skills) {
		var bonus = characterSheet[attribute + '_save'];
		if (!bonus)
			bonus = '0';
		if (!bonus.startsWith('-') && !bonus.startsWith('+')) {
			bonus = '+' + bonus;
		}
		reply += attribute.charAt(0).toUpperCase() + attribute.charAt(1).toUpperCase() + attribute.charAt(2).toUpperCase() + ' ' + bonus + ', '
	}
	reply += `**Passive Perception:** ${characterSheet['passive_perception']}`;

	msg.reply(reply);
}

async function GetLanguages(args, msg) {
	var reply = `**${characterSheet.name}** knows: `;
	var langs = [];
	for (var i = 1; i <= 18; i++) {
		var lang = characterSheet['language_' + i];
		if (lang != undefined) {
			langs.push(lang);
		}
	}
	reply += langs.join(', ');
	msg.reply(reply);
}

async function RollInit(args, msg) {
	var bonus = characterSheet.initiative || '0';
	if (!bonus.startsWith('-') && !bonus.startsWith('+')) {
		bonus = '+' + bonus;
	}
	var result = await ParseAndRollWrapper('d20' + bonus);
	msg.reply(`**${characterSheet.name}** rolled ${result} on initiative.`);
}

async function RollSave(args, msg) {
	var saveType = args[0];
	if (saveType == 'str') saveType = 'strength';
	if (saveType == 'dex') saveType = 'dexterity';
	if (saveType == 'con') saveType = 'constitution';
	if (saveType == 'int') saveType = 'intelligence';
	if (saveType == 'wis') saveType = 'wisdom';
	if (saveType == 'cha') saveType = 'charisma';
	var bonus = characterSheet[saveType + '_save'] || '0';
	if (!bonus) {
		msg.reply(`Cannot find save "${args[0]}"`)
	}
	if (!bonus.startsWith('-') && !bonus.startsWith('+')) {
		bonus = '+' + bonus;
	}
	var result = await ParseAndRollWrapper('d20' + bonus);
	msg.reply(`**${characterSheet.name}** rolled ${result} on their ${saveType} save.`);
}

async function ListSkills(args, msg) {
	var reply = '';
	for (var attribute in skills) {
		if (attribute == 'constitution') {
			continue;
		}
		var skillList = skills[attribute];
		reply += `\n**${attribute.charAt(0).toUpperCase() + attribute.slice(1)}**`;
		skillList.forEach(skill => {
			var bonus = characterSheet[skill + '_mod'] || '0';
			if (!bonus.startsWith('-') && !bonus.startsWith('+')) {
				bonus = '+' + bonus;
			}
			skill = skill.split('_').join(' ');
			reply += `\n${skill.charAt(0).toUpperCase() + skill.slice(1)}: ${bonus}`;
		})
	}
	msg.reply(reply);
}

async function RollSkill(args, msg) {
	var skill = args[0];
	if (skill == 'sleight') {
		skill = 'sleight_of_hand';
	}
	if (skill == 'animal') {
		skill = 'animal_handling';
	}
	var bonus = characterSheet[skill + '_mod'];
	if (bonus == undefined) {
		msg.reply('Could not find skill named ' + skill);
	}
	if (!bonus.startsWith('-') && !bonus.startsWith('+')) {
		bonus = '+' + bonus;
	}

	var result = await ParseAndRollWrapper('d20' + bonus);

	skill = skill.split('_').join(' ');
	var reply = `**${characterSheet.name}** rolled ${result} on ${skill.charAt(0).toUpperCase() + skill.slice(1)}`;
	msg.reply(reply);
}

async function WhoAmI(args, msg) {
	var reply = `You are **${characterSheet.name}**, a`;
	if (characterSheet.alignment) {
		reply += ` ${characterSheet.alignment}`;
	}
	reply += ` level ${characterSheet.level} ${characterSheet.race} ${characterSheet.class}`;
	if (characterSheet.background) {
		reply += `, with the ${characterSheet.background} background.`;
	}
	else {
		reply += `.`;
	}
	if (characterSheet.campaign) {
		reply += ` You are a character in the ${characterSheet.campaign} campaign.`;
	}
	if (characterSheet.gender) {
		reply += ` Your gender is ${characterSheet.gender}.`;
	}
	if (characterSheet.height) {
		reply += ` Your height is ${characterSheet.height}.`;
	}
	if (characterSheet.weight) {
		reply += ` Your weight is ${characterSheet.weight}.`;
	}
	if (characterSheet.age) {
		reply += ` Your age is ${characterSheet.age}.`;
	}
	if (characterSheet.hair_color) {
		reply += ` You have ${characterSheet.hair_color} hair.`;
	}
	if (characterSheet.skin_color) {
		reply += ` You have ${characterSheet.skin_color} skin.`;
	}
	if (characterSheet.eyes_color) {
		reply += ` You have ${characterSheet.eyes_color} eyes.`;
	}
	if (characterSheet.deity) {
		reply += ` You worship ${characterSheet.deity}.`;
	}

	msg.reply(reply);
}

async function ListSpells(args, msg) {
	var reply = '';
	var spellLevel = args.length > 0 ? parseInt(args[0]) : 10;
	if (isNaN(spellLevel)) {
		msg.reply(`Got ${args[0]} as spell level, but I don't understand what that means.`);
		return;
	}

	var spells = await GetSpells(spellLevel);
	spells.forEach(spell => {
		reply += `\n${spell.level}: ${spell.name}`
	});
	if (reply.length == 0) {
		msg.reply('No spells found.');
	}
	else {
		msg.reply(reply);
	}

}

async function SetId(id, msg) {
	var sheetBlob = await GetSheet(msg, id);
	if (sheetBlob === -1) {
		return;
	}
	if (sheetBlob.sheet_template.id != 12) {
		msg.reply(`Unfortunately, the only sheets I can parse are ${sheetTypes.join(', ')}`);
		return;
	}
	var sheetData = sheetBlob.data;
	sheetData.id = id;

	userSheetIds.set(msg.author.id, sheetData);
	msg.reply(`Your sheet id has been set to ${id} [**${sheetData.name}**]`);
}

async function AttackWithWeapon(args, msg) {
	try {
		var name = characterSheet.name;

		var weaponSlot = parseInt(args[0]);
		if (weaponSlot == NaN)
			weaponSlot = 1;
		weaponSlot--;
		var weapons = await GetWeapons();
		var weapon = weapons[weaponSlot];
		var bonus = weapon.attack;
		if (!bonus.startsWith('-') && !bonus.startsWith('+')) {
			bonus = '+' + bonus;
		}
		var attackToHit = await ParseAndRollWrapper('d20' + bonus);
		var dmg = await ParseAndRollWrapper(weapon.damage);

		var reply = '**' + name + '** attacks with ' + weapon.name;

		if (attackToHit == null) {
			reply += ' [' + weapon.attack + ']';
		}

		reply += ', rolling '

		if (attackToHit != null) {
			reply += attackToHit + ' to hit'
		}
		if (attackToHit != null && dmg != null) {
			reply += ' for '
		}
		if (dmg != null) {
			reply += dmg + ' damage'
		}

		msg.reply(reply + '!');
	}
	catch {
		msg.reply(`Could not roll an attack for weapon in slot ${++weaponSlot}. Please check the formatting on your sheet.`);
	}
}

async function GetName(args, msg) {
	var name = characterSheet.name;
	msg.reply(`The name of this character is: **${name}**`);
}

async function ListWeapons(args, msg) {
	var name = characterSheet.name;

	var weapons = await GetWeapons();

	var reply = `**${name}**'s weapons are:`
	weapons.forEach(weapon => {
		reply += `\n${weapon.slot}: ${weapon.name} - ${weapon.attack} to hit for ${weapon.damage} damage`
	});
	msg.reply(reply);
}

async function ListCommands(msg) {
	var reply = 'The commands I know are: ';
	knownCommands.forEach((a) => {
		reply += '\n ' + a;
	});
	msg.reply(reply);
	return;
}

async function GetSheet(msg, id) {
	try {
		var sheetBlob = (await axios.get(config.sheetUrl + id)).data;
		if (sheetBlob.error) {
			msg.reply('There was an error');
			return -1;
		}
		return sheetBlob.sheetdata;
	}
	catch (e) {
		msg.reply('Unable to load sheet; check the ID and try again.');
		return -1;
	}
}

async function GetWeapons() {
	var weapons = [];
	var weapon1 = {
		"attack": characterSheet.weapon_1_attack,
		"damage": characterSheet.weapon_1_dmg,
		"name": characterSheet.weapon_1_name,
		"slot": 1
	};
	var weapon2 = {
		"attack": characterSheet.weapon_2_attack,
		"damage": characterSheet.weapon_2_dmg,
		"name": characterSheet.weapon_2_name,
		"slot": 2
	};
	var weapon3 = {
		"attack": characterSheet.weapon_3_attack,
		"damage": characterSheet.weapon_3_dmg,
		"name": characterSheet.weapon_3_name,
		"slot": 3
	};
	var weapon4 = {
		"attack": characterSheet.weapon_4_attack,
		"damage": characterSheet.weapon_4_dmg,
		"name": characterSheet.weapon_4_name,
		"slot": 4
	};
	var weapon5 = {
		"attack": characterSheet.weapon_5_attack,
		"damage": characterSheet.weapon_5_dmg,
		"name": characterSheet.weapon_5_name,
		"slot": 5
	};

	weapons.push(weapon1);
	weapons.push(weapon2);
	weapons.push(weapon3);
	weapons.push(weapon4);
	weapons.push(weapon5);
	return weapons;
}

async function GetSpells(level) {
	var spells = [];
	if (level >= 0 && level <= 9) {
		for (var i = 0; i <= 14; i++) {
			var spellName = characterSheet['spell_' + level + '_' + i];
			if (spellName != '' && spellName != undefined) {
				var spell = { "level": level, "name": spellName };
				spells.push(spell);
			}
		}
	}
	if (level >= 10) {
		for (var spellLevel = 0; spellLevel <= 9; spellLevel++)
			for (var i = 0; i <= 14; i++) {
				var spellName = characterSheet['spell_' + spellLevel + '_' + i];
				if (spellName != '' && spellName != undefined) {
					var spell = { "level": spellLevel, "name": spellName };
					spells.push(spell);
				}
			}
	}
	return spells;
}

async function ParseAndRollWrapper(input) {
	var sum = null;
	var listOfRolls = input.split('+');
	for (set in listOfRolls) {
		try {
			var dice = listOfRolls[set];
			if (dice.includes('d'))
				sum += +(parseAndRoll(dice).value);
			if (dice = +dice) {
				sum += +dice;
			}
		} catch {}
	}
	return sum;
}

// to run
// nodemon --inspect index.js


// JSON for Origin
/*
	{"error":false,"sheetdata":{"id":1892900,"name":"Colin's Game | Origin","portrait":"","sheet_template_id":12,"game_id":null,"private":0,"created_at":"2019-04-23 11:49:29","updated_at":"2020-06-08 10:39:08","deleted_at":null,"downloaded_at":"2019-12-21 14:56:12","sheetdata_revision_id":"","sheet_template":{"id":12,"name":"Dungeons & Dragons 5e","path":"dnd5e","game_system_id":79,"created_at":"2014-08-26 07:40:42","updated_at":"2019-09-29 16:37:36","active":1},"sheet_data":{"id":1581062,"sheet_id":1892900,"jsondata":"{\"name\":\"Origin\",\"player\":\"Alexander\",\"class\":\"Bard (Lore) 11 \\\/ Cleric (Order) 1\",\"race\":\"Warforged\",\"_meta_sheet_data_version\":\"1\",\"level\":\"11\",\"proficiency_bonus\":\"4\",\"caster\":\"1\",\"__txt_features_traits\":\"Warforged\\nAdv. vs being poisoned, resist poison\\nImmune to disease\\nNo need to eat, drink, breathe or sleep\\nLong rests are just 6 hours of sitting still.\\nHeavy Plating Armor is 16+Prof\\nBuilt-in cartographer tools\\n\\nAnthropologist\\nAdept Linguist: After observing people for a day, I can learn to communicate with them with on a rudimentary level.\\n\\nWar Caster\\nAdv on Con Saves to Maintain spells\\nCast with hands full\\nCast spells at people who provoke\\n\\nStonespeaker Charges: 10\\\/10\\n\\nCleric\\nVoice of Authority: When I cast a spell on someone, they can use their reaction to attack someone.\\n\\nBard\\nBardic Inspiration 3\\\/5d10\\nJack of All Trades\\nSong of Rest (d8)\\nExpertise (Persuasion, Insight)\\nCounter Charm\\nCutting Words (Reaction to subtract from enemy's attack, ability check or damage roll)\",\"charisma\":\"20\",\"charisma_mod\":\"5\",\"wisdom\":\"16\",\"wisdom_mod\":\"3\",\"intelligence\":\"16\",\"intelligence_mod\":\"3\",\"constitution\":\"16\",\"constitution_mod\":\"3\",\"dexterity\":\"12\",\"dexterity_mod\":\"1\",\"strength\":\"12\",\"strength_mod\":\"1\",\"armor_class\":\"22\",\"proficiency_1\":\"Cartographer Tolls (E)\",\"language_1\":\"Common\",\"language_2\":\"Primordial\",\"character_portrait\":\"https:\\\/\\\/cdn.discordapp.com\\\/attachments\\\/614210536137162753\\\/614302441789325312\\\/Cropped_Origin.png\",\"height\":\"5'8\\\"\",\"weight\":\"290\",\"age\":\"No Idea.\",\"gender\":\"Male\",\"hair_color\":\"Copper\",\"skin_color\":\"Bronze\",\"eyes_color\":\"Amber\",\"persuasion_cc\":\"1\",\"perception_cc\":\"1\",\"background\":\"Anthropologist\",\"__txt_personality\":\"When I arrive at a new settlement for the first time, I must learn all of its customs.\\n\",\"__txt_bonds\":\"Life without purpose is meaningless and so I will help anyone with their purpose or help them find a purpose.\",\"__txt_ideals\":\"I want to see the whole world and the people in it.\",\"__txt_flaws\":\"Sometimes my desire to help others find their purpose borders on impertinence.\",\"spell_0_1\":\"Guidance\",\"spell_0_2\":\"Mending\",\"spell_0_3\":\"Spare the Dying\",\"spell_0_4\":\"Light\",\"spell_0_5\":\"Message\",\"spell_0_6\":\"Vicious Mockery\",\"casting_ability\":\"CHA\",\"insight_cc\":\"1\",\"religion_cc\":\"1\",\"language_3\":\"Sylvan\",\"language_4\":\"Draconic\",\"spell_5_slots\":\"2\",\"spell_4_slots\":\"3\",\"spell_3_slots\":\"3\",\"spell_2_slots\":\"3\",\"spell_1_slots\":\"5\",\"save_dc\":\"17\",\"attack_bonus\":\"9\",\"spell_1_1\":\"\",\"spell_1_2\":\"Healing Word (C)\",\"spell_1_3\":\"Detect Magic (R) (C)\",\"spell_1_4\":\"Guiding Bolt (C)\",\"spell_1_5\":\"Bless (C)\",\"spell_2_1\":\"Silence (R)\",\"spell_2_2\":\"Lesser Restoration\",\"spell_2_3\":\"Zone of Truth\",\"spell_2_4\":\"\",\"spell_3_1\":\"Tiny Hut (R)\",\"spell_3_2\":\"Hypnotic Pattern\",\"spell_3_3\":\"Fear\",\"spell_3_4\":\"Spirit Guardians (MS)\",\"spell_4_1\":\"Greater Invisibility\",\"spell_4_2\":\"Polymorph\",\"spell_4_3\":\"Dimension Door\",\"spell_4_4\":\"Charm Monster\",\"spell_3_5\":\"Counterspell (MS)\",\"spell_3_6\":\"\",\"performance_cc\":\"1\",\"history_cc\":\"1\",\"investigation_cc\":\"1\",\"wisdom_save_cc\":\"1\",\"charisma_save_cc\":\"1\",\"history_mod\":\"10\",\"religion_mod\":\"7\",\"investigation_mod\":\"7a\",\"perception_mod\":\"7\",\"insight_mod\":\"11\",\"performance_mod\":\"9\",\"persuasion_mod\":\"13\",\"wisdom_save\":\"7\",\"charisma_save\":\"9\",\"equip1_\":\"Shield w\\\/ Emblem\",\"proficiency_12\":\"\",\"weapon_1_name\":\"Handaxe\",\"weapon_1_attack\":\"5\",\"weapon_1_dmg\":\"1+d4\",\"equip2_\":\"Lute\",\"equip3_\":\"Scholar Pack\",\"equip4_\":\"Silk Rope (50ft) (2)\",\"equip5_\":\"Books\",\"equip6_\":\"Tools (Literally all)\",\"equip7_\":\"Magnifying Glass\",\"proficiency_10\":\"\",\"equip8_\":\"Astral Diamond Clasped Very Fine Mammoth Skin Cloak\",\"equip9_\":\"Bag of Holding\",\"equip10_\":\"Unlimited Meat Buns\",\"equip11_\":\"Block and Tackle\",\"equip12_\":\"100 Papers, ink and 6 pens\",\"equip13_\":\"5 Ivory Strips worth 50g\",\"equip14_\":\"5 Manacle\",\"equip15_\":\"500ft Hemp Rope\",\"equip16_\":\"3 Stone Speakers Stones\",\"equip17_\":\"10 Whistles\",\"equip18_\":\"Books on the Planes\",\"equip19_\":\"\",\"equip20_\":\"Decanter of Endless Water\",\"alignment\":\"LN\",\"deity\":\"Becoming\",\"athletics_mod\":\"3\",\"acrobatics_mod\":\"3\",\"stealth_mod\":\"3\",\"sleight_of_hand_mod\":\"3\",\"arcana_mod\":\"10\",\"nature_cc\":\"1\",\"nature_mod\":\"7\",\"animal_handling_mod\":\"5\",\"medicine_mod\":\"7\",\"survival_mod\":\"5\",\"deception_mod\":\"7\",\"intimidation_mod\":\"9\",\"initiative\":\"3\",\"hp\":\"105\",\"stealth_cc\":\"\",\"arcana_cc\":\"1\",\"weapon_2_name\":\"Quarter Staff\",\"weapon_2_attack\":\"9\",\"weapon_2_dmg\":\"5+d6\",\"weapon_3_name\":\"Dagger\",\"weapon_3_attack\":\"5\",\"weapon_3_dmg\":\"1+d4\",\"max_hp\":\"105\",\"passive_perception\":\"17\",\"speed\":\"30\",\"weapon_4_name\":\"Vicious Mockery\",\"weapon_4_attack\":\"DC 17\",\"weapon_4_dmg\":\"2d4\",\"__txt_statblock\":\"\",\"__txt_other_notes\":\"Psionic Giant Seed that is starting to grow thanks to that psionic crystal; it needs dirt, water, and sunlight\\nDark Wood Chest with an IMPOSSIBLE check\\nSad Jewelry\\nSad Scepter\\nAmber Gemstone of 10ft Dim Light\\n\\n\",\"__txt_character_5\":\"9 Empty Mindflayer heads\\n2 Illithid Knight Brain\\n4 Mindflayer Brains\\n\\nShreds of Illidthid Dreadnaught Heart\",\"medicine_cc\":\"1\",\"temp_hp\":\"0\",\"strength_save\":\"1\",\"dexterity_save\":\"1\",\"constitution_save\":\"3\",\"intelligence_save\":\"3\",\"campaign\":\"Radiant Warriors\",\"spell_5_1\":\"Greater Restoration\",\"__txt_character_1\":\"Legend Lore on the Raven Queen, Deep One, The Hunter, Orcus\",\"strength_save_cc\":\"\",\"spell_1_slots_left\":\"3\",\"spell_3_slots_left\":\"\",\"currency_gp\":\"36,106\",\"__txt_private_notes\":\"Secret Command Word to blow up the engine core: dinitrious\\n\\nRead The Darkness of the Shadowfel the entire\\nThe Orderer is a machine; the likes of these machines have been used to structure and reshape the world. One created and then destroyed the Shattered Abyss \\\/ 9 Hells. Ormus used one to create the Material Plane. Supposedly one created the Shadowfel, and since that place is so small, I might be able to actually find it! Doing so would grant me immense power.\\n\\n\",\"adventurers_pack\":\"1\",\"spell_4_slots_left\":\"1\",\"spell_2_slots_left\":\"\",\"spell_1_6\":\"Ceremony (R) (C)\",\"equip12_loc\":\"BoH\",\"equip13_loc\":\"\",\"equip14_loc\":\"BoH\",\"equip15_loc\":\"BoH\",\"equip16_loc\":\"BoH\",\"equip17_loc\":\"BoH\",\"__txt_character_6\":\"Jade Tentacles hold Ruby and Copper Eye Amulet\\nEye of the Deep\\nHeal 1d10 HP per round if submerged.\\nCan breathe underwater\\nAttuned\\n\\nStone Speaker Crystal\\nAdv on Investigation\\nFree Components for Legend Lore (5)\\nspeak with animals (2 charges)\\nspeak with dead (4 charges)\\nspeak with plants (3 charges)\\nRegains d6+4 charges\\n\\nDragonstaff:\\n+1 DC, +1 To hit\\nCasts Fireball 1\\\/day\\n\\nFey Composition: Winter's First Kiss(18 seconds to perform)\",\"spell_7_13\":\"\",\"spell_5_2\":\"Legend Lore\",\"spell_1_7\":\"Identify (R)\",\"__txt_character_3\":\"Citadel in a mountain near Cartallan\\n\",\"__txt_character_4\":\"\",\"spell_5_slots_left\":\"\",\"__txt_character_2\":\"Conjure Woodland Beings?\\nDivination?\\nGalder's Speedy Courier?\",\"__txt_character_3_name\":\"Quests!\",\"__txt_character_6_name\":\"Magic Items\",\"currency_cp\":\"15,500\",\"currency_sp\":\"6,750\",\"currency_pp\":\"418\",\"hit_dice\":\"8\\\/12d8\",\"__txt_character_4_name\":\"Place to do maths\",\"survival_cc\":\"\",\"proficiency_5\":\"\",\"proficiency_6\":\"\",\"__txt_character_1_name\":\"Next Session\",\"intimidation_cc\":\"1\",\"__txt_character_2_name\":\"Magic Secret Options?\",\"deathsaves_failures\":\"0\",\"spell_6_slots\":\"1\",\"spell_5_3\":\"Sending\",\"spell_5_4\":\"Find Greater Steed - Almia\",\"spell_0_7\":\"Prestidigitation\",\"spell_5_5\":\"Wall of Force\",\"spell_5_6\":\"Teleportation Circle\",\"spell_5_7\":\"Raise Dead\",\"experience\":\"1\",\"next_level\":\"2\",\"mph\":\"1\",\"mpd\":\"1\",\"weapon_5_name\":\"99\",\"weapon_5_attack\":\"999\",\"weapon_5_dmg\":\"-99\"}"},"data":{"name":"Origin","player":"Alexander","class":"Bard (Lore) 11 \/ Cleric (Order) 1","race":"Warforged","_meta_sheet_data_version":"1","level":"11","proficiency_bonus":"4","caster":"1","__txt_features_traits":"Warforged\nAdv. vs being poisoned, resist poison\nImmune to disease\nNo need to eat, drink, breathe or sleep\nLong rests are just 6 hours of sitting still.\nHeavy Plating Armor is 16+Prof\nBuilt-in cartographer tools\n\nAnthropologist\nAdept Linguist: After observing people for a day, I can learn to communicate with them with on a rudimentary level.\n\nWar Caster\nAdv on Con Saves to Maintain spells\nCast with hands full\nCast spells at people who provoke\n\nStonespeaker Charges: 10\/10\n\nCleric\nVoice of Authority: When I cast a spell on someone, they can use their reaction to attack someone.\n\nBard\nBardic Inspiration 3\/5d10\nJack of All Trades\nSong of Rest (d8)\nExpertise (Persuasion, Insight)\nCounter Charm
	\nCutting Words (Reaction to subtract from enemy's attack, ability check or damage roll)","charisma":"20","charisma_mod":"5","wisdom":"16","wisdom_mod":"3","intelligence":"16","intelligence_mod":"3","constitution":"16","constitution_mod":"3","dexterity":"12","dexterity_mod":"1","strength":"12","strength_mod":"1","armor_class":"22","proficiency_1":"Cartographer Tolls (E)","language_1":"Common","language_2":"Primordial","character_portrait":"https:\/\/cdn.discordapp.com\/attachments\/614210536137162753\/614302441789325312\/Cropped_Origin.png","height":"5'8\"","weight":"290","age":"No Idea.","gender":"Male","hair_color":"Copper","skin_color":"Bronze","eyes_color":"Amber","persuasion_cc":"1","perception_cc":"1","background":"Anthropologist","__txt_personality":"When I arrive at a new settlement for the first time, I must learn all of its customs.\n","__txt_bonds":"Life without purpose is meaningless and so I will help anyone with their purpose or help them find a purpose.","__txt_ideals":"I want to see the whole world and the people in it.","__txt_flaws":"Sometimes my desire to help others find their purpose borders on impertinence.","spell_0_1":"Guidance","spell_0_2":"Mending","spell_0_3":"Spare the Dying","spell_0_4":"Light","spell_0_5":"Message","spell_0_6":"Vicious Mockery","casting_ability":"CHA","insight_cc":"1","religion_cc":"1","language_3":"Sylvan","language_4":"Draconic","spell_5_slots":"2","spell_4_slots":"3","spell_3_slots":"3","spell_2_slots":"3","spell_1_slots":"5","save_dc":"17","attack_bonus":"9","spell_1_1":"","spell_1_2":"Healing Word (C)","spell_1_3":"Detect Magic (R) (C)","spell_1_4":"Guiding Bolt (C)","spell_1_5":"Bless (C)","spell_2_1":"Silence (R)","spell_2_2":"Lesser Restoration","spell_2_3":"Zone of Truth","spell_2_4":"","spell_3_1":"Tiny Hut (R)","spell_3_2":"Hypnotic Pattern","spell_3_3":"Fear","spell_3_4":"Spirit Guardians (MS)","spell_4_1":"Greater Invisibility","spell_4_2":"Polymorph","spell_4_3":"Dimension Door","spell_4_4":"Charm Monster","spell_3_5":"Counterspell (MS)","spell_3_6":"","performance_cc":"1","history_cc":"1","investigation_cc":"1","wisdom_save_cc":"1","charisma_save_cc":"1","history_mod":"10","religion_mod":"7","investigation_mod":"7a","perception_mod":"7","insight_mod":"11","performance_mod":"9","persuasion_mod":"13","wisdom_save":"7","charisma_save":"9","equip1_":"Shield w\/ Emblem","proficiency_12":"","weapon_1_name":"Handaxe","weapon_1_attack":"5","weapon_1_dmg":"1+d4","equip2_":"Lute","equip3_":"Scholar Pack","equip4_":"Silk Rope (50ft) (2)","equip5_":"Books","equip6_":"Tools (Literally all)","equip7_":"Magnifying Glass","proficiency_10":"","equip8_":"Astral Diamond Clasped Very Fine Mammoth Skin Cloak","equip9_":"Bag of Holding","equip10_":"Unlimited Meat Buns","equip11_":"Block and Tackle","equip12_":"100 Papers, ink and 6 pens","equip13_":"5 Ivory Strips worth 50g","equip14_":"5 Manacle","equip15_":"500ft Hemp Rope","equip16_":"3 Stone Speakers Stones","equip17_":"10 Whistles","equip18_":"Books on the Planes","equip19_":"","equip20_":"Decanter of Endless Water","alignment":"LN","deity":"Becoming","athletics_mod":"3","acrobatics_mod":"3","stealth_mod":"3","sleight_of_hand_mod":"3","arcana_mod":"10","nature_cc":"1","nature_mod":"7","animal_handling_mod":"5","medicine_mod":"7","survival_mod":"5","deception_mod":"7","intimidation_mod":"9","initiative":"3","hp":"105","stealth_cc":"","arcana_cc":"1","weapon_2_name":"Quarter Staff","weapon_2_attack":"9","weapon_2_dmg":"5+d6","weapon_3_name":"Dagger","weapon_3_attack":"5","weapon_3_dmg":"1+d4","max_hp":"105","passive_perception":"17","speed":"30","weapon_4_name":"Vicious Mockery","weapon_4_attack":"DC 17","weapon_4_dmg":"2d4","__txt_statblock":"","__txt_other_notes":"Psionic Giant Seed that is starting to grow thanks to that psionic crystal; it needs dirt, water, and sunlight\nDark Wood Chest with an IMPOSSIBLE check\nSad Jewelry\nSad Scepter\nAmber Gemstone of 10ft Dim Light\n\n","__txt_character_5":"9 Empty Mindflayer heads\n2 Illithid Knight Brain\n4 Mindflayer Brains\n\nShreds of Illidthid Dreadnaught Heart","medicine_cc":"1","temp_hp":"0","strength_save":"1","dexterity_save":"1","constitution_save":"3","intelligence_save":"3","campaign":"Radiant Warriors","spell_5_1":"Greater Restoration","__txt_character_1":"Legend Lore on the Raven Queen, Deep One, The Hunter, Orcus","strength_save_cc":"","spell_1_slots_left":"3","spell_3_slots_left":"","currency_gp":"36,106","__txt_private_notes":"Secret Command Word to blow up the engine core: dinitrious\n\nRead The Darkness of the Shadowfel the entire\nThe Orderer is a machine; the likes of these machines have been used to structure and reshape the world. One created and then destroyed the Shattered Abyss \/ 9 Hells. Ormus used one to create the Material Plane. Supposedly one created the Shadowfel, and since that place is so small, I might be able to actually find it! Doing so would grant me immense power.\n\n","adventurers_pack":"1","spell_4_slots_left":"1","spell_2_slots_left":"","spell_1_6":"Ceremony (R) (C)","equip12_loc":"BoH","equip13_loc":"","equip14_loc":"BoH","equip15_loc":"BoH","equip16_loc":"BoH","equip17_loc":"BoH","__txt_character_6":"Jade Tentacles hold Ruby and Copper Eye Amulet\nEye of the Deep\nHeal 1d10 HP per round if submerged.\nCan breathe underwater\nAttuned\n\nStone Speaker Crystal\nAdv on Investigation\nFree Components for Legend Lore (5)\nspeak with animals (2 charges)\nspeak with dead (4 charges)\nspeak with plants (3 charges)\nRegains d6+4 charges\n\nDragonstaff:\n+1 DC, +1 To hit\nCasts Fireball 1\/day\n\nFey Composition: Winter's First Kiss(18 seconds to perform)","spell_7_13":"","spell_5_2":"Legend Lore","spell_1_7":"Identify (R)","__txt_character_3":"Citadel in a mountain near Cartallan\n","__txt_character_4":"","spell_5_slots_left":"","__txt_character_2":"Conjure Woodland Beings?\nDivination?\nGalder's Speedy Courier?","__txt_character_3_name":"Quests!","__txt_character_6_name":"Magic Items","currency_cp":"15,500","currency_sp":"6,750","currency_pp":"418","hit_dice":"8\/12d8","__txt_character_4_name":"Place to do maths","survival_cc":"","proficiency_5":"","proficiency_6":"","__txt_character_1_name":"Next Session","intimidation_cc":"1","__txt_character_2_name":"Magic Secret Options?","deathsaves_failures":"0","spell_6_slots":"1","spell_5_3":"Sending","spell_5_4":"Find Greater Steed - Almia","spell_0_7":"Prestidigitation","spell_5_5":"Wall of Force","spell_5_6":"Teleportation Circle","spell_5_7":"Raise Dead","experience":"1","next_level":"2","mph":"1","mpd":"1","weapon_5_name":"99","weapon_5_attack":"999","weapon_5_dmg":"-99"}},"logged_in":true,"email":"darklink_shadow@hotmail.com","username":"darklink_shadow","can_edit":true,"can_view":true,"can_own":true,"debug":{"memory_usage":"6,038KB"}}
*/