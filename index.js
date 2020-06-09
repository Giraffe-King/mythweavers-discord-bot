const Discord = require('discord.js');
const client = new Discord.Client();
const axios = require('axios');
const config = require("./config.json");


client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.login(config.token);

client.on('message', async msg => 
{
	console.log('My prefix is: ' + config.prefix);
	console.log('Msg Text was: ' + msg.content)
	if(!msg.content.startsWith(config.prefix))
		return;
	const args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	if(command === 'getname')
	{
		const id = parseInt(args[0]);
		var response = await GetSheet(id);
		if (response === -1)
		{
			return;
		}
		var sheet = response.data;
		var name = sheet.name;
		msg.reply("The name of this character is: " + name);
		return;
	}
	if(command === 'listweapons')
	{
		// WIP
		const id = parseInt(args[0]);
		var response = await GetSheet(id);
		if (response === -1)
		{
			return;
		}
		var sheet = response.data;
		var name = sheet.name;

		var weapons = [];
		var weapon1 = {
			"attack" : sheet.weapon_1_attack,
			"damage" : sheet.weapon_1_dmg,
			"name" : sheet.weapon_1_name,
			"slot" : 1
		};
		var weapon2 = {
			"attack" : sheet.weapon_2_attack,
			"damage" : sheet.weapon_2_dmg,
			"name" : sheet.weapon_2_name,
			"slot" : 2
		};
		var weapon3 = {
			"attack" : sheet.weapon_3_attack,
			"damage" : sheet.weapon_3_dmg,
			"name" : sheet.weapon_3_name,
			"slot" : 3
		};
		var weapon4 = {
			"attack" : sheet.weapon_4_attack,
			"damage" : sheet.weapon_4_dmg,
			"name" : sheet.weapon_4_name,
			"slot" : 4
		};
		var weapon5 = {
			"attack" : sheet.weapon_5_attack,
			"damage" : sheet.weapon_5_dmg,
			"name" : sheet.weapon_5_name,
			"slot" : 5
		};

		weapons.push(weapon1);
		weapons.push(weapon2);
		weapons.push(weapon3);
		weapons.push(weapon4);
		weapons.push(weapon5);

		console.log(JSON.stringify(weapons));

		var response = `${name}'s weapons are:`
		weapons.forEach(weapon => {
			response += `\n${weapon.slot}: ${weapon.name} - ${weapon.attack} to hit for ${weapon.damage} damage`
		});
		msg.reply(response);
	}
	
});

async function GetSheet(id)
{
	console.log('Fetching name from sheet #'+id);
	var response = (await axios.get(config.sheetUrl+id)).data;
	if (response.error)
	{
		msg.reply('There was an error');
		return -1;
	}
	return response.sheetdata;
}


// At least we can login!

// nodemon --inspect index.js


// JSON for Origin
// {"error":false,"sheetdata":{"id":1892900,"name":"Colin's Game | Origin","portrait":"","sheet_template_id":12,"game_id":null,"private":0,"created_at":"2019-04-23 11:49:29","updated_at":"2020-06-08 10:39:08","deleted_at":null,"downloaded_at":"2019-12-21 14:56:12","sheetdata_revision_id":"","sheet_template":{"id":12,"name":"Dungeons & Dragons 5e","path":"dnd5e","game_system_id":79,"created_at":"2014-08-26 07:40:42","updated_at":"2019-09-29 16:37:36","active":1},"sheet_data":{"id":1581062,"sheet_id":1892900,"jsondata":"{\"name\":\"Origin\",\"player\":\"Alexander\",\"class\":\"Bard (Lore) 11 \\\/ Cleric (Order) 1\",\"race\":\"Warforged\",\"_meta_sheet_data_version\":\"1\",\"level\":\"11\",\"proficiency_bonus\":\"4\",\"caster\":\"1\",\"__txt_features_traits\":\"Warforged\\nAdv. vs being poisoned, resist poison\\nImmune to disease\\nNo need to eat, drink, breathe or sleep\\nLong rests are just 6 hours of sitting still.\\nHeavy Plating Armor is 16+Prof\\nBuilt-in cartographer tools\\n\\nAnthropologist\\nAdept Linguist: After observing people for a day, I can learn to communicate with them with on a rudimentary level.\\n\\nWar Caster\\nAdv on Con Saves to Maintain spells\\nCast with hands full\\nCast spells at people who provoke\\n\\nStonespeaker Charges: 10\\\/10\\n\\nCleric\\nVoice of Authority: When I cast a spell on someone, they can use their reaction to attack someone.\\n\\nBard\\nBardic Inspiration 3\\\/5d10\\nJack of All Trades\\nSong of Rest (d8)\\nExpertise (Persuasion, Insight)\\nCounter Charm\\nCutting Words (Reaction to subtract from enemy's attack, ability check or damage roll)\",\"charisma\":\"20\",\"charisma_mod\":\"5\",\"wisdom\":\"16\",\"wisdom_mod\":\"3\",\"intelligence\":\"16\",\"intelligence_mod\":\"3\",\"constitution\":\"16\",\"constitution_mod\":\"3\",\"dexterity\":\"12\",\"dexterity_mod\":\"1\",\"strength\":\"12\",\"strength_mod\":\"1\",\"armor_class\":\"22\",\"proficiency_1\":\"Cartographer Tolls (E)\",\"language_1\":\"Common\",\"language_2\":\"Primordial\",\"character_portrait\":\"https:\\\/\\\/cdn.discordapp.com\\\/attachments\\\/614210536137162753\\\/614302441789325312\\\/Cropped_Origin.png\",\"height\":\"5'8\\\"\",\"weight\":\"290\",\"age\":\"No Idea.\",\"gender\":\"Male\",\"hair_color\":\"Copper\",\"skin_color\":\"Bronze\",\"eyes_color\":\"Amber\",\"persuasion_cc\":\"1\",\"perception_cc\":\"1\",\"background\":\"Anthropologist\",\"__txt_personality\":\"When I arrive at a new settlement for the first time, I must learn all of its customs.\\n\",\"__txt_bonds\":\"Life without purpose is meaningless and so I will help anyone with their purpose or help them find a purpose.\",\"__txt_ideals\":\"I want to see the whole world and the people in it.\",\"__txt_flaws\":\"Sometimes my desire to help others find their purpose borders on impertinence.\",\"spell_0_1\":\"Guidance\",\"spell_0_2\":\"Mending\",\"spell_0_3\":\"Spare the Dying\",\"spell_0_4\":\"Light\",\"spell_0_5\":\"Message\",\"spell_0_6\":\"Vicious Mockery\",\"casting_ability\":\"CHA\",\"insight_cc\":\"1\",\"religion_cc\":\"1\",\"language_3\":\"Sylvan\",\"language_4\":\"Draconic\",\"spell_5_slots\":\"2\",\"spell_4_slots\":\"3\",\"spell_3_slots\":\"3\",\"spell_2_slots\":\"3\",\"spell_1_slots\":\"5\",\"save_dc\":\"17\",\"attack_bonus\":\"9\",\"spell_1_1\":\"\",\"spell_1_2\":\"Healing Word (C)\",\"spell_1_3\":\"Detect Magic (R) (C)\",\"spell_1_4\":\"Guiding Bolt (C)\",\"spell_1_5\":\"Bless (C)\",\"spell_2_1\":\"Silence (R)\",\"spell_2_2\":\"Lesser Restoration\",\"spell_2_3\":\"Zone of Truth\",\"spell_2_4\":\"\",\"spell_3_1\":\"Tiny Hut (R)\",\"spell_3_2\":\"Hypnotic Pattern\",\"spell_3_3\":\"Fear\",\"spell_3_4\":\"Spirit Guardians (MS)\",\"spell_4_1\":\"Greater Invisibility\",\"spell_4_2\":\"Polymorph\",\"spell_4_3\":\"Dimension Door\",\"spell_4_4\":\"Charm Monster\",\"spell_3_5\":\"Counterspell (MS)\",\"spell_3_6\":\"\",\"performance_cc\":\"1\",\"history_cc\":\"1\",\"investigation_cc\":\"1\",\"wisdom_save_cc\":\"1\",\"charisma_save_cc\":\"1\",\"history_mod\":\"10\",\"religion_mod\":\"7\",\"investigation_mod\":\"7a\",\"perception_mod\":\"7\",\"insight_mod\":\"11\",\"performance_mod\":\"9\",\"persuasion_mod\":\"13\",\"wisdom_save\":\"7\",\"charisma_save\":\"9\",\"equip1_\":\"Shield w\\\/ Emblem\",\"proficiency_12\":\"\",\"weapon_1_name\":\"Handaxe\",\"weapon_1_attack\":\"5\",\"weapon_1_dmg\":\"1+d4\",\"equip2_\":\"Lute\",\"equip3_\":\"Scholar Pack\",\"equip4_\":\"Silk Rope (50ft) (2)\",\"equip5_\":\"Books\",\"equip6_\":\"Tools (Literally all)\",\"equip7_\":\"Magnifying Glass\",\"proficiency_10\":\"\",\"equip8_\":\"Astral Diamond Clasped Very Fine Mammoth Skin Cloak\",\"equip9_\":\"Bag of Holding\",\"equip10_\":\"Unlimited Meat Buns\",\"equip11_\":\"Block and Tackle\",\"equip12_\":\"100 Papers, ink and 6 pens\",\"equip13_\":\"5 Ivory Strips worth 50g\",\"equip14_\":\"5 Manacle\",\"equip15_\":\"500ft Hemp Rope\",\"equip16_\":\"3 Stone Speakers Stones\",\"equip17_\":\"10 Whistles\",\"equip18_\":\"Books on the Planes\",\"equip19_\":\"\",\"equip20_\":\"Decanter of Endless Water\",\"alignment\":\"LN\",\"deity\":\"Becoming\",\"athletics_mod\":\"3\",\"acrobatics_mod\":\"3\",\"stealth_mod\":\"3\",\"sleight_of_hand_mod\":\"3\",\"arcana_mod\":\"10\",\"nature_cc\":\"1\",\"nature_mod\":\"7\",\"animal_handling_mod\":\"5\",\"medicine_mod\":\"7\",\"survival_mod\":\"5\",\"deception_mod\":\"7\",\"intimidation_mod\":\"9\",\"initiative\":\"3\",\"hp\":\"105\",\"stealth_cc\":\"\",\"arcana_cc\":\"1\",\"weapon_2_name\":\"Quarter Staff\",\"weapon_2_attack\":\"9\",\"weapon_2_dmg\":\"5+d6\",\"weapon_3_name\":\"Dagger\",\"weapon_3_attack\":\"5\",\"weapon_3_dmg\":\"1+d4\",\"max_hp\":\"105\",\"passive_perception\":\"17\",\"speed\":\"30\",\"weapon_4_name\":\"Vicious Mockery\",\"weapon_4_attack\":\"DC 17\",\"weapon_4_dmg\":\"2d4\",\"__txt_statblock\":\"\",\"__txt_other_notes\":\"Psionic Giant Seed that is starting to grow thanks to that psionic crystal; it needs dirt, water, and sunlight\\nDark Wood Chest with an IMPOSSIBLE check\\nSad Jewelry\\nSad Scepter\\nAmber Gemstone of 10ft Dim Light\\n\\n\",\"__txt_character_5\":\"9 Empty Mindflayer heads\\n2 Illithid Knight Brain\\n4 Mindflayer Brains\\n\\nShreds of Illidthid Dreadnaught Heart\",\"medicine_cc\":\"1\",\"temp_hp\":\"0\",\"strength_save\":\"1\",\"dexterity_save\":\"1\",\"constitution_save\":\"3\",\"intelligence_save\":\"3\",\"campaign\":\"Radiant Warriors\",\"spell_5_1\":\"Greater Restoration\",\"__txt_character_1\":\"Legend Lore on the Raven Queen, Deep One, The Hunter, Orcus\",\"strength_save_cc\":\"\",\"spell_1_slots_left\":\"3\",\"spell_3_slots_left\":\"\",\"currency_gp\":\"36,106\",\"__txt_private_notes\":\"Secret Command Word to blow up the engine core: dinitrious\\n\\nRead The Darkness of the Shadowfel the entire\\nThe Orderer is a machine; the likes of these machines have been used to structure and reshape the world. One created and then destroyed the Shattered Abyss \\\/ 9 Hells. Ormus used one to create the Material Plane. Supposedly one created the Shadowfel, and since that place is so small, I might be able to actually find it! Doing so would grant me immense power.\\n\\n\",\"adventurers_pack\":\"1\",\"spell_4_slots_left\":\"1\",\"spell_2_slots_left\":\"\",\"spell_1_6\":\"Ceremony (R) (C)\",\"equip12_loc\":\"BoH\",\"equip13_loc\":\"\",\"equip14_loc\":\"BoH\",\"equip15_loc\":\"BoH\",\"equip16_loc\":\"BoH\",\"equip17_loc\":\"BoH\",\"__txt_character_6\":\"Jade Tentacles hold Ruby and Copper Eye Amulet\\nEye of the Deep\\nHeal 1d10 HP per round if submerged.\\nCan breathe underwater\\nAttuned\\n\\nStone Speaker Crystal\\nAdv on Investigation\\nFree Components for Legend Lore (5)\\nspeak with animals (2 charges)\\nspeak with dead (4 charges)\\nspeak with plants (3 charges)\\nRegains d6+4 charges\\n\\nDragonstaff:\\n+1 DC, +1 To hit\\nCasts Fireball 1\\\/day\\n\\nFey Composition: Winter's First Kiss(18 seconds to perform)\",\"spell_7_13\":\"\",\"spell_5_2\":\"Legend Lore\",\"spell_1_7\":\"Identify (R)\",\"__txt_character_3\":\"Citadel in a mountain near Cartallan\\n\",\"__txt_character_4\":\"\",\"spell_5_slots_left\":\"\",\"__txt_character_2\":\"Conjure Woodland Beings?\\nDivination?\\nGalder's Speedy Courier?\",\"__txt_character_3_name\":\"Quests!\",\"__txt_character_6_name\":\"Magic Items\",\"currency_cp\":\"15,500\",\"currency_sp\":\"6,750\",\"currency_pp\":\"418\",\"hit_dice\":\"8\\\/12d8\",\"__txt_character_4_name\":\"Place to do maths\",\"survival_cc\":\"\",\"proficiency_5\":\"\",\"proficiency_6\":\"\",\"__txt_character_1_name\":\"Next Session\",\"intimidation_cc\":\"1\",\"__txt_character_2_name\":\"Magic Secret Options?\",\"deathsaves_failures\":\"0\",\"spell_6_slots\":\"1\",\"spell_5_3\":\"Sending\",\"spell_5_4\":\"Find Greater Steed - Almia\",\"spell_0_7\":\"Prestidigitation\",\"spell_5_5\":\"Wall of Force\",\"spell_5_6\":\"Teleportation Circle\",\"spell_5_7\":\"Raise Dead\",\"experience\":\"1\",\"next_level\":\"2\",\"mph\":\"1\",\"mpd\":\"1\",\"weapon_5_name\":\"99\",\"weapon_5_attack\":\"999\",\"weapon_5_dmg\":\"-99\"}"},"data":{"name":"Origin","player":"Alexander","class":"Bard (Lore) 11 \/ Cleric (Order) 1","race":"Warforged","_meta_sheet_data_version":"1","level":"11","proficiency_bonus":"4","caster":"1","__txt_features_traits":"Warforged\nAdv. vs being poisoned, resist poison\nImmune to disease\nNo need to eat, drink, breathe or sleep\nLong rests are just 6 hours of sitting still.\nHeavy Plating Armor is 16+Prof\nBuilt-in cartographer tools\n\nAnthropologist\nAdept Linguist: After observing people for a day, I can learn to communicate with them with on a rudimentary level.\n\nWar Caster\nAdv on Con Saves to Maintain spells\nCast with hands full\nCast spells at people who provoke\n\nStonespeaker Charges: 10\/10\n\nCleric\nVoice of Authority: When I cast a spell on someone, they can use their reaction to attack someone.\n\nBard\nBardic Inspiration 3\/5d10\nJack of All Trades\nSong of Rest (d8)\nExpertise (Persuasion, Insight)\nCounter Charm\nCutting Words (Reaction to subtract from enemy's attack,
// ability check or damage roll)","charisma":"20","charisma_mod":"5","wisdom":"16","wisdom_mod":"3","intelligence":"16","intelligence_mod":"3","constitution":"16","constitution_mod":"3","dexterity":"12","dexterity_mod":"1","strength":"12","strength_mod":"1","armor_class":"22","proficiency_1":"Cartographer Tolls (E)","language_1":"Common","language_2":"Primordial","character_portrait":"https:\/\/cdn.discordapp.com\/attachments\/614210536137162753\/614302441789325312\/Cropped_Origin.png","height":"5'8\"","weight":"290","age":"No Idea.","gender":"Male","hair_color":"Copper","skin_color":"Bronze","eyes_color":"Amber","persuasion_cc":"1","perception_cc":"1","background":"Anthropologist","__txt_personality":"When I arrive at a new settlement for the first time, I must learn all of its customs.\n","__txt_bonds":"Life without purpose is meaningless and so I will help anyone with their purpose or help them find a purpose.","__txt_ideals":"I want to see the whole world and the people in it.","__txt_flaws":"Sometimes my desire to help others find their purpose borders on impertinence.","spell_0_1":"Guidance","spell_0_2":"Mending","spell_0_3":"Spare the Dying","spell_0_4":"Light","spell_0_5":"Message","spell_0_6":"Vicious Mockery","casting_ability":"CHA","insight_cc":"1","religion_cc":"1","language_3":"Sylvan","language_4":"Draconic","spell_5_slots":"2","spell_4_slots":"3","spell_3_slots":"3","spell_2_slots":"3","spell_1_slots":"5","save_dc":"17","attack_bonus":"9","spell_1_1":"","spell_1_2":"Healing Word (C)","spell_1_3":"Detect Magic (R) (C)","spell_1_4":"Guiding Bolt (C)","spell_1_5":"Bless (C)","spell_2_1":"Silence (R)","spell_2_2":"Lesser Restoration","spell_2_3":"Zone of Truth","spell_2_4":"","spell_3_1":"Tiny Hut (R)","spell_3_2":"Hypnotic Pattern","spell_3_3":"Fear","spell_3_4":"Spirit Guardians (MS)","spell_4_1":"Greater Invisibility","spell_4_2":"Polymorph","spell_4_3":"Dimension Door","spell_4_4":"Charm Monster","spell_3_5":"Counterspell (MS)","spell_3_6":"","performance_cc":"1","history_cc":"1","investigation_cc":"1","wisdom_save_cc":"1","charisma_save_cc":"1","history_mod":"10","religion_mod":"7","investigation_mod":"7a","perception_mod":"7","insight_mod":"11","performance_mod":"9","persuasion_mod":"13","wisdom_save":"7","charisma_save":"9","equip1_":"Shield w\/ Emblem","proficiency_12":"","weapon_1_name":"Handaxe","weapon_1_attack":"5","weapon_1_dmg":"1+d4","equip2_":"Lute","equip3_":"Scholar Pack","equip4_":"Silk Rope (50ft) (2)","equip5_":"Books","equip6_":"Tools (Literally all)","equip7_":"Magnifying Glass","proficiency_10":"","equip8_":"Astral Diamond Clasped Very Fine Mammoth Skin Cloak","equip9_":"Bag of Holding","equip10_":"Unlimited Meat Buns","equip11_":"Block and Tackle","equip12_":"100 Papers, ink and 6 pens","equip13_":"5 Ivory Strips worth 50g","equip14_":"5 Manacle","equip15_":"500ft Hemp Rope","equip16_":"3 Stone Speakers Stones","equip17_":"10 Whistles","equip18_":"Books on the Planes","equip19_":"","equip20_":"Decanter of Endless Water","alignment":"LN","deity":"Becoming","athletics_mod":"3","acrobatics_mod":"3","stealth_mod":"3","sleight_of_hand_mod":"3","arcana_mod":"10","nature_cc":"1","nature_mod":"7","animal_handling_mod":"5","medicine_mod":"7","survival_mod":"5","deception_mod":"7","intimidation_mod":"9","initiative":"3","hp":"105","stealth_cc":"","arcana_cc":"1","weapon_2_name":"Quarter Staff","weapon_2_attack":"9","weapon_2_dmg":"5+d6","weapon_3_name":"Dagger","weapon_3_attack":"5","weapon_3_dmg":"1+d4","max_hp":"105","passive_perception":"17","speed":"30","weapon_4_name":"Vicious Mockery","weapon_4_attack":"DC 17","weapon_4_dmg":"2d4","__txt_statblock":"","__txt_other_notes":"Psionic Giant Seed that is starting to grow thanks to that psionic crystal; it needs dirt, water, and sunlight\nDark Wood Chest with an IMPOSSIBLE check\nSad Jewelry\nSad Scepter\nAmber Gemstone of 10ft Dim Light\n\n","__txt_character_5":"9 Empty Mindflayer heads\n2 Illithid Knight Brain\n4 Mindflayer Brains\n\nShreds of Illidthid Dreadnaught Heart","medicine_cc":"1","temp_hp":"0","strength_save":"1","dexterity_save":"1","constitution_save":"3","intelligence_save":"3","campaign":"Radiant Warriors","spell_5_1":"Greater Restoration","__txt_character_1":"Legend Lore on the Raven Queen, Deep One, The Hunter, Orcus","strength_save_cc":"","spell_1_slots_left":"3","spell_3_slots_left":"","currency_gp":"36,106","__txt_private_notes":"Secret Command Word to blow up the engine core: dinitrious\n\nRead The Darkness of the Shadowfel the entire\nThe Orderer is a machine; the likes of these machines have been used to structure and reshape the world. One created and then destroyed the Shattered Abyss \/ 9 Hells. Ormus used one to create the Material Plane. Supposedly one created the Shadowfel, and since that place is so small, I might be able to actually find it! Doing so would grant me immense power.\n\n","adventurers_pack":"1","spell_4_slots_left":"1","spell_2_slots_left":"","spell_1_6":"Ceremony (R) (C)","equip12_loc":"BoH","equip13_loc":"","equip14_loc":"BoH","equip15_loc":"BoH","equip16_loc":"BoH","equip17_loc":"BoH","__txt_character_6":"Jade Tentacles hold Ruby and Copper Eye Amulet\nEye of the Deep\nHeal 1d10 HP per round if submerged.\nCan breathe underwater\nAttuned\n\nStone Speaker Crystal\nAdv on Investigation\nFree Components for Legend Lore (5)\nspeak with animals (2 charges)\nspeak with dead (4 charges)\nspeak with plants (3 charges)\nRegains d6+4 charges\n\nDragonstaff:\n+1 DC, +1 To hit\nCasts Fireball 1\/day\n\nFey Composition: Winter's First Kiss(18 seconds to perform)","spell_7_13":"","spell_5_2":"Legend Lore","spell_1_7":"Identify (R)","__txt_character_3":"Citadel in a mountain near Cartallan\n","__txt_character_4":"","spell_5_slots_left":"","__txt_character_2":"Conjure Woodland Beings?\nDivination?\nGalder's Speedy Courier?","__txt_character_3_name":"Quests!","__txt_character_6_name":"Magic Items","currency_cp":"15,500","currency_sp":"6,750","currency_pp":"418","hit_dice":"8\/12d8","__txt_character_4_name":"Place to do maths","survival_cc":"","proficiency_5":"","proficiency_6":"","__txt_character_1_name":"Next Session","intimidation_cc":"1","__txt_character_2_name":"Magic Secret Options?","deathsaves_failures":"0","spell_6_slots":"1","spell_5_3":"Sending","spell_5_4":"Find Greater Steed - Almia","spell_0_7":"Prestidigitation","spell_5_5":"Wall of Force","spell_5_6":"Teleportation Circle","spell_5_7":"Raise Dead","experience":"1","next_level":"2","mph":"1","mpd":"1","weapon_5_name":"99","weapon_5_attack":"999","weapon_5_dmg":"-99"}},"logged_in":true,"email":"darklink_shadow@hotmail.com","username":"darklink_shadow","can_edit":true,"can_view":true,"can_own":true,"debug":{"memory_usage":"6,038KB"}}