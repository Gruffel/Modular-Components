// SECTION 0__________________________________________
// TABLE OF CONTENTS
  // SECTION 1: LIVE DATA/EXTERNAL SOURCE PLUGINS (VARIABLES)
  // SECTION 2: CLASSES/DATA STRUCTURES
  // SECTION 3: GAMEPLAY FUNCTIONS
  // SECTION 4: LOGISTICAL FUNCTIONS
  // SECTION 5: ON-START PROCEDURE

// SECTION 1__________________________________________
// LIVE DATA/EXTERNAL SOURCE PLUGINS
const monster_Data = {% include /features/contentBlocks/HEN/data/monsters.json %};
const building_Data = {% include /features/contentBlocks/HEN/data/buildings.json %};
const item_Data = {% include /features/contentBlocks/HEN/data/items.json %};
var boss_Data = {% include /features/contentBlocks/HEN/data/bosses.json %};
const actionWrapper = document.getElementById("actionButtons");
const playerStats = document.getElementById("playerStats");
const textBlock = document.getElementById("localDescription");
const nameSubmissionForm = document.getElementById("nameInput");
const nameInput = document.getElementById("name");
const submit = document.getElementById("submitButton");
var player;
var currentRoom;
var day = 0;
var roomsDefeatedSinceLastBoss = 0;
var goldBnsMod = 1.5;
var hasWon = false;

// SECTION 2__________________________________________
// CLASSES/DATA STRUCTURES (notably this includes functions tied to classes & actions)
class Monster{
  constructor(referenceName){
    //get monster template stats and save them
    var m;
    if (referenceName == "boss") {
      var allbosses = Object.keys(boss_Data);
      var bossName = allbosses[RandomRange(0,allbosses.length)];
      this.type = bossName;
      this.m = boss_Data[bossName];
      this.Type_Boss();
    }
    else if (referenceName == undefined) {
      var monsterTypes = Object.keys(monster_Data);
      var monsterType = monsterTypes[RandomRange(0,monsterTypes.length)];
      this.type = monsterType;
      this.m = monster_Data[monsterType];
      this.Type_Mob();
    }
    else{
      this.type = referenceName;
      this.m = monster_Data[referenceName];
      this.Type_Mob();
    }
  };
  Type_Mob(){
    var m = this.m;
    // set this monsters stats
    this.name = m.names[RandomRange(0,m.names.length)];
    this.maxHP =  RandomRange(m.HPRange[0],m.HPRange[1]);
    this.currentHP = this.maxHP;
    this.regularDmg = RandomRange(m.dmgRange[0],m.dmgRange[1]);
    this.dodgeChance = m.dodgeChance / 100;
    this.id = RandomRange(0,10000000);
    this.loot = m.loot;
    this.xp = m.xpValue;
    this.difficulty = m.difficulty;
    //must be called after all parameters are set
    this.attackButton = new ActionButton("attack",this);

  }
  Type_Boss(){
    var m = this.m;
    // set this monsters stats
    this.name = m.creatureInfo.names[RandomRange(0,m.creatureInfo.names.length)];
    this.maxHP =  RandomRange(m.creatureInfo.HPRange[0],m.creatureInfo.HPRange[1]) * currentRoom.maxDifficulty;
    this.currentHP = this.maxHP;
    this.regularDmg = RandomRange(m.creatureInfo.dmgRange[0],m.creatureInfo.dmgRange[1]) * currentRoom.maxDifficulty;
    this.dodgeChance = (m.creatureInfo.dodgeChance * currentRoom.maxDifficulty) / 100;
    this.id = RandomRange(0,10000000);
    this.loot = (m.creatureInfo.loot * currentRoom.maxDifficulty);
    this.xp = (m.creatureInfo.xpValue * currentRoom.maxDifficulty);
    //must be called after all parameters are set
    this.person = this.type;
    this.type = this.name;
    this.attackButton = new ActionButton("attack",this);
    this.isboss = true;
  }
  Attack(){
    var attackDmg = Math.floor(this.regularDmg + RandomRange(-this.regularDmg/2,this.regularDmg/2));
    Write(`a ${this.type} attacked you, dealing ${attackDmg} damage!`);
    player.GetAttacked(attackDmg);
  }
  GetAttacked(){

    if (Math.random() < (this.dodgeChance - player.accuracy)) {
      Write(`You swipe at ${this.type} but they dodge out of the way and you miss!`);
      return;
    }

    var attackDmg = Math.ceil(player.attackDmg + RandomRange(-.5 * player.attackDmg, .5 * player.attackDmg));
    if(player.weapon != "sharpened stick") attackDmg += RandomRange(player.weaponBonus[0],player.weaponBonus[1]);
    this.currentHP -= attackDmg;

    if (this.currentHP <= 0) {
      if (this.isboss) {
        delete boss_Data[this.person];
        if (Object.keys(boss_Data).length <= 0) {
          Write('YOU BEAT THE GAME!!!!!!!');
          console.log('YOU BEAT THE GAME!!!!!!!');
        }
      }

      this.Die();
    }
    else{
      Write(`You struck the ${this.type} for ${attackDmg} damage, but they are still standing!`);
    }
  }
  TakeSpecialDamage(damageRange){
    var attackDmg = RandomRange(damageRange[0],damageRange[1]);
    this.currentHP -= attackDmg;

    if (this.currentHP <= 0) {
      this.Die();
    }
    else{
      Write(`</br>You struck the ${this.type} for ${attackDmg} damage, but they are still standing!`);
    }
  }
  Die(){
    Write("you killed a " + this.type);
    currentRoom.monsters = ArrayRemove(currentRoom.monsters,this);


    player.GainXP(this.xp);

      if (this.isBoss) {
        var loot = this.loot[0]
        currentRoom.AddLootToRoom(loot);
      }
      // generate loot 50% chance
      else if (RandomRange(0,100) > 50 - this.m.difficulty * 10) {
        var loot = this.loot[RandomRange(0,this.loot.length)]
        currentRoom.AddLootToRoom(loot);
      }
  }
}
class Room {
  constructor(roomType, numberOfMonstersOrBuildingIndex) {
    this.roomType = roomType;
    this.monsters = [];
    this.loot = [];

    switch (this.roomType) {
      case "dungeon":
        this.Type_Dungeon(numberOfMonstersOrBuildingIndex);
        break;
      case "town":
        this.Type_Town();
        break;
      case "building":
        this.Type_Building(numberOfMonstersOrBuildingIndex);
        break;
      case "death":
        ClearActions();
        ClearDescription();
        Write("<h2>You Died...</h2>");
        break;
    }
  }
  Type_Dungeon(numberOfMonsters){

    this.monsters = [];
    this.isBossRoom = false;

    this.maxDifficulty = Math.max(Math.floor(player.currentLevel/5) + Math.floor(day/14),1);

    var isBossRoomLikelihood = (roomsDefeatedSinceLastBoss - 10)/(15*Object.keys(boss_Data).length);
    if (Math.random() < isBossRoomLikelihood) {
      console.log("BOSS ENCOUNTERED!");
      this.isBossRoom = true;
      roomsDefeatedSinceLastBoss = 0;
    }
    else{
      this.maxDifficulty = Math.max(Math.floor(player.currentLevel/5) + Math.floor(day/14),1);
      roomsDefeatedSinceLastBoss++;

      if (numberOfMonsters != undefined)
      {
        this.numberOfMonsters = numberOfMonsters;
      }
      else
      {
        this.numberOfMonsters =  this.maxDifficulty - 1 + RandomRange(0,5);
        if (this.numberOfMonsters < 0) {
          this.numberOfMonsters =0;
        }
      }
    }

  }
  Type_Town(){
    ClearDescription();
    Write("You are greeted by the watchmen, you are home.");
  }
  Type_Building(buildingIndex){
    var buildingTypes = Object.keys(building_Data);
    var buildingName = buildingTypes[buildingIndex];

    this.building = building_Data[buildingName];
  }
  GenerateMonsters(){
    if (this.roomType == "dungeon") {
      if (this.isBossRoom) {
        ClearDescription();
        Write("the Air thickens, and a creature of untold evil approaches.");

        var randomBoss = new Monster("boss");
        this.monsters.push(randomBoss);
      }
      else{
        ClearDescription();
        if(this.numberOfMonsters > 0)
        Write("Monsters approach...");
        else
        Write("The breeze echos off the stone walls, puncuating only your footsteps and a dim silence. This room appears to be empty.");

        for (var i = 0; i < this.numberOfMonsters; i++)
        {
          i--;

          var newMonster = new Monster();

          if (newMonster.difficulty > this.maxDifficulty) {
            console.log(`skipped a ${newMonster} because it was too strong for the current max difficulty`);
            continue;
          }

          this.monsters.push(newMonster);

          i+= newMonster.difficulty;

        }
      }

    }
  }
  AddLootToRoom(lootObject){
    this.loot.push(lootObject);
  }
  GetRoomActionButtons(){
    this.actionButtonHTML = "";

    // all location changeButtons
    switch (this.roomType) {
      case "dungeon":
        if (this.monsters.length == 0) {
          this.actionButtonHTML += "</br>";
          this.actionButtonHTML += new ActionButton("move","'dungeon'","Delve Deeper Into The Dungeon").GetHTMLString();
          this.actionButtonHTML += new ActionButton("move","'town'","Return To Town").GetHTMLString();
          if(this.loot.length > 0)
            this.actionButtonHTML += new ActionButton("player.LootTheRoom()","Loot The Room").GetHTMLString();
        }
        else{
          // all monster action buttons
          for (var i = 0; i < this.monsters.length; i++) {
            this.actionButtonHTML += this.monsters[i].attackButton.GetHTMLString();
          }
          this.actionButtonHTML += "</br>"

          this.actionButtonHTML += new ActionButton("move","'town'","Flee").GetHTMLString();
        }
        break;
      case "town":
        var buildingTypes = Object.keys(building_Data);
        for (var i = 0; i < buildingTypes.length; i++) {
          this.actionButtonHTML += new ActionButton("move",i).GetHTMLString();
        }
        this.actionButtonHTML += new ActionButton("move","'dungeon'","Travel To The Dungeon").GetHTMLString();
        break;
      case "building":
        // all special actions
        for (var i = 0; i < this.building.actions.length; i++) {
          this.actionButtonHTML += new ActionButton(this.building.actions[i]).GetHTMLString();
        }
        // all item purchasables
        for (var i = 0; i < this.building.items.length; i++) {
          this.actionButtonHTML += new ActionButton('purchase',this.building.items[i]).GetHTMLString();
        }
        if (this.building.willBuyLoot) {
          this.actionButtonHTML += new ActionButton('player.SellLoot()','Sell Dungeon Loot').GetHTMLString();
        }
        // return to town
        this.actionButtonHTML += new ActionButton("move","'town'","Return to Town").GetHTMLString();
        break;
      case "death":
        this.actionButtonHTML += '<button class="actionButton" type="button" name="button" onclick="window.location.reload();">Restart Game</button>'
        break;
    }

    // all special action buttons

    // return action information
    return this.actionButtonHTML;
  }
}
class ActionButton{
  constructor(actionType,subject,buttonText){
    this.name = buttonText;
    this.subject = subject;
    this.actionType = actionType;

    switch (actionType.toLowerCase()) {
      case "consumable":
      case "consume":
        this.Type_Consume();
        break;

      case "break":
      case "attack":
        this.Type_Attack();
        break;

      case "buy":
      case "purchase":
        this.Type_Purchase();
        break;

      case "room":
      case "move":
        this.Type_Move();
        break;

      case "rest":
      case "heal":
        this.Type_Rest();
        break;

      case "won":
        this.Type_Won();
        break;

      default:
        this.Type_CustomAction();
        break;
    }
  }
  Type_Won(){
    this.name = "Record Your Name In the Hall of Adventurers";
    this.function = "WonGame()";
  }
  Type_CustomAction(){
    this.name = this.subject;
    this.function = this.actionType;
  }
  Type_Consume(){
    this.name = `use ${this.subject}`;
    this.function = `new Item('${this.subject}').Consume()`;
  }
  Type_Purchase(){
    var goldValue = new Item(this.subject).itemData.cost;
    this.name = `purchase ${this.subject} (${goldValue})`;
    this.function = `new Item('${this.subject}').Purchase()`
  }
  Type_Attack(){
    //
    this.name = "attack " + this.subject.type;
    this.function = `AttackMonster(${this.subject.id})`;
  }
  Type_Move(){
    // if the move command is being done to a building, then it will take an index instead of a string, this accounts for that...
    if (typeof this.subject == "number") {
      this.name = "visit the " + Object.keys(building_Data)[this.subject];
      this.function = `MoveToNewRoom('building',${this.subject})`;
    }
    else{
      this.function = `MoveToNewRoom(${this.subject})`;
    }
  }
  Type_Rest(){
    this.function = "player.Rest()";
    this.name = "Rest (5sp/1day)";
  }

  GetHTMLString(){
    if (this.actionType != 'consume') {
      return `<button class="actionButton" type="button" name="button" onclick="${this.function}; ActionTaken();">${this.name}</button>`;
    } else{
      return `<button class="actionButton" type="button" name="button" onclick="${this.function};">${this.name}</button>`;
    }
  }
}
class Player{
  constructor(){
    this.maxHP = 100;
    this.currentHP = 100;
    this.location = "town";
    this.attackDmg = 5;
    this.loot = [];
    this.gold = 20;
    this.xp = 0;
    this.nextLvlXp = 30;
    this.currentLevel = 1;
    this.armor = "rags";
    this.weapon = "sharpened stick";
    this.equipment = [];
    this.weaponBonus = [0,0];
    this.accuracy = this.currentLevel/100;
  }
  Die(){
    MoveToNewRoom('death');
  }
  GetAttacked(dmg){
    this.currentHP -= dmg;
    if (this.currentHP < 0) {
      this.Die();
    } else if(this.currentHP > this.maxHP){
      this.currentHP = this.maxHP;
    }
  }
  LootTheRoom(){
    ClearDescription();

    if (currentRoom.loot.length == 0) {
      Write("Looks like there is no loot to be had here");
    }

    for (var i = 0; i < currentRoom.loot.length; i++) {
      if (currentRoom.loot[i].mustTrade) {
        this.loot.push(currentRoom.loot[i]);

        var description = currentRoom.loot[i].description[RandomRange(0,currentRoom.loot[i].description.length)];

        if(description != "") Write(`</br>${description}`);
        else Write(`amongst the fallen, you find ${currentRoom.loot[i].name}. It probably can be sold at the market for some worth.`)
      }
      else if (!currentRoom.loot[i].mustTrade) {
        var lootValue = goldBnsMod * RandomRange(currentRoom.loot[i].valueRange[0],currentRoom.loot[i].valueRange[1]);
        Write(`</br>found ${lootValue} ${currentRoom.loot[i].name}. `);
        this.GoldEdit(lootValue);
      }
    }

    currentRoom.loot = [];
    ClearActions();
    GenerateActions();
  }
  SellLoot(){
    ClearDescription();
    if (this.loot.length == 0) {
      Write("</br> you have no loot to sell off.");
    }
    for (var i = 0; i < this.loot.length; i++) {
      if(this.loot[i].mustTrade){
        var lootValue = goldBnsMod * RandomRange(this.loot[i].valueRange[0],this.loot[i].valueRange[1]);
        Write(`</br>sold ${this.loot[i].name} for ${lootValue} silver. `);
        this.GoldEdit(lootValue);
      }
    }
    this.loot = [];
    UpdateStats();
  }
  GoldEdit(goldValue){
    if (Math.abs(goldValue) < this.gold || goldValue > 0) {
      this.gold += goldValue;
      return true;
    } else{
      ClearDescription();
      Write("</br> You can't afford this...");
      return false;
    }
  }
  GainXP(xpGained){
    this.xp += xpGained;
    if (this.xp >= this.nextLvlXp) {
      this.LevelUp();
    }
    Write(`</br>Gained ${xpGained} xp.`);
  }
  LevelUp(){
    this.currentLevel++;
    this.xp -= this.nextLvlXp;
    this.nextLvlXp *= 1.25;
    this.nextLvlXp = Math.floor(this.nextLvlXp);
    if (this.armor == "rags") {
      this.maxHP += 15;
    } else {
      this.maxHP += 15 * new Item(this.armor).itemData.protectionRate;
    }
    this.currentHP = this.maxHP;
    this.attackDmg += Math.ceil(this.currentLevel / 3);
    this.accuracy += .01;
    Write("</br><h2> Level Up!</h2>");
  }
  Rest(){
    if (this.GoldEdit(-5)) {
      this.currentHP = this.maxHP;
      ClearDescription();
      Write("You awaken after a full nights rest feeling rejuvinated");
      day++;
    }
  }
}
class Item{
  constructor(itemName){
    this.name = itemName;
    this.i = item_Data[itemName];

    this.itemData = this.i;
  }

  Purchase(){
    var my = this.itemData;

    if (player.GoldEdit(-my.cost)) {
      this.Equip();
    }
  }
  Equip(){
    var my = this.itemData;

    // console.log(my);

    ClearDescription();
    var text = my.textToDisplay[RandomRange(0,my.textToDisplay.length)];
    Write(text)

    switch (my.type) {
      case "armor":
        Write("<br> You equip your new armor, feeling refreshed and ready to adventure");
        if (player.armor != "rags") {
          new Item(player.armor).Unequip();
        }
        player.armor = this.name;
        player.maxHP *= my.protectionRate;
        player.currentHP = player.maxHP;
        break;
      case "weapon":
        Write("<br> You equip your new Weapon, feeling refreshed and ready to adventure");
        if (player.weapon != "sharpened stick") {
          new Item(player.weapon).Unequip();
        }
        player.weapon = this.name;
        player.weaponBonus = my.dmgBonus;
        player.accuracy += my.bonusAccuracy / 100;
        break;
      case "equipment":
        if (!player.equipment.includes(this.name)) {
          player.equipment.push(this.name);
          Write(`</br> You put your new ${this.name} in your pack, this will be very useful later down the line...`);
        }
        else{
          Write(`</br> You look into your pack to see you already have a ${this.name}... Dang... well at least you can keep a spare at home.`);
        }
        break;
      case "consumable":
        if (!player.equipment.includes(this.name)) {
          player.equipment.push(this.name);
          Write(`</br> You put your new ${this.name} in your pack, this will be very useful later down the line...`);
        }
        else{
          Write(`</br> You look into your pack to see you already have a ${this.name}... Dang... well at least you can keep a spare at home.`);
        }
        break;
      default:

    }
    UpdateStats();

  }
  Unequip(){
    var my = this.itemData;
    if (my.type == "armor") {
      player.maxHP /= my.protectionRate;

    }
    else if (my.type == "weapon")
    {
      player.accuracy -= my.bonusAccuracy / 100;

    }
  }
  Consume(){
    var my = this.itemData;

    switch (my.requiredEquipment) {
      case "bow":
        if (player.equipment.includes("bow")) {
          if (currentRoom.monsters.length != 0) {
            var randomMonster = currentRoom.monsters[RandomRange(0,currentRoom.monsters.length)];
            Write("</br> you sling your bow over your shoulder and quickly unleash an arrow at the nearest target!");
            randomMonster.TakeSpecialDamage(my.dmgBonus);
            player.equipment = ArrayRemove(player.equipment,"arrows");
          }
          else{
            Write("</br>there are no enemies to shoot!");
          }
        }
        else{
          Write("you need a bow to use arrows!");
        }
        break;
      case "staff":
        if (player.equipment.includes("staff")) {
          if (currentRoom.monsters.length != 0) {
            if (!healing) {
              var randomMonster = currentRoom.monsters[RandomRange(0,currentRoom.monsters.length)];
              Write("</br> you take our your staff, chant a few words of power, and your staff explodes with natural energy, flying towards the nearest target");
              randomMonster.TakeSpecialDamage(my.dmgBonus);
              player.equipment = ArrayRemove(player.equipment,this.name);
            }
            else{
              var healing = RandomRange(my.dmgBonus[0],my.dmgBonus[1]);
              Write("</br> you take our your staff, chant a few words of power, and your staff glows with life, bathing you in blissful energy");
              player.GetAttacked(-healing);
              Write(`</br> you healed for ${healing} hp.`);
              player.equipment = ArrayRemove(player.equipment,this.name);
            }
          }
          else{
            Write("</br>there are no enemies, why use your magic now?!");
          }
        }
        else{
          Write("you need a staff to use magic essence!");
        }
        break;
      default:
      var healing = RandomRange(my.dmgBonus[0],my.dmgBonus[1]);
      Write("</br> you quickly unveil a potion from your pack and chug it down, its energy magically closing some of your wounds.");
      player.GetAttacked(-healing);
      Write(`</br> you healed for ${healing} hp.`);

      player.equipment = ArrayRemove(player.equipment,"potion of healing");
    }

    ClearActions();
    GenerateActions();

    UpdateStats();
  }
}

// SECTION 3__________________________________________
// GAMEPLAY FUNCTIONS
function GenerateActions(){
  var actionHTML;

  if (!hasWon) {
    //check for actions in the room
    actionHTML = currentRoom.GetRoomActionButtons();

    actionHTML += "</br>";

    //check for consumables & inventory items
    if (currentRoom.roomType == "dungeon") {
      for (var i = 0; i < player.equipment.length; i++) {
        if (new Item(player.equipment[i]).itemData.type == "consumable") {
          actionHTML += new ActionButton("consume", player.equipment[i]).GetHTMLString();
        }
      }
    }
  }
  else{
    actionHTML += new ActionButton("won").GetHTMLString();
  }
  // build buttons
  actionWrapper.innerHTML = actionHTML;
}
function AttackMonster(monsterID){
  ClearDescription();

  for (var i = 0; i < currentRoom.monsters.length; i++) {
    if(currentRoom.monsters[i].id == monsterID){
      currentRoom.monsters[i].GetAttacked();
      break;
    }
  }
}
function ActionTaken(){
  if (currentRoom.monsters.length > 0) {
    for (var i = 0; i < currentRoom.monsters.length; i++) {
      currentRoom.monsters[i].Attack();
    }
  }
  UpdateStats();
  GenerateActions();
}
function MoveToNewRoom(roomType, numberOfMonstersOrBuildingIndex){
  if (numberOfMonstersOrBuildingIndex != undefined) {
    var buildingLocation = Object.keys(building_Data)[numberOfMonstersOrBuildingIndex];
    player.location = buildingLocation;

    currentRoom = new Room(roomType, numberOfMonstersOrBuildingIndex);
  }
  else{
    player.location = roomType;
    currentRoom = new Room(roomType);
  }
  currentRoom.GenerateMonsters();
}
function WonGame(){
  nameSubmissionForm.setAttribute("style", "");
  ClearActions();
  ClearDescription();
  Write(`submit your hero's name to the records`);
}
function SubmitCharacter(){
  submit.setAttribute('style','display:none;');
  tryName();
}

// SECTION 4__________________________________________
// LOGISTICAL FUNCTIONS
function UpdateStats(){
  var html = ""
  html += `HP: <b>${player.currentHP}/${player.maxHP}</b>`;
  html += `  |  Atk: <b>${Math.ceil(-.5 * player.attackDmg + player.attackDmg + player.weaponBonus[0])}-${Math.ceil(.5 * player.attackDmg + player.attackDmg + player.weaponBonus[1])}</b>`;
  html += `  |  Weapon: <b>${player.weapon}</b>`;
  html += `  |  Armor: <b>${player.armor}</b>`;
  html += `  |  Equipment:<b> `;
  if (player.equipment.length == 0) {
    html += "-";
  }
  for (var i = 0; i < player.equipment.length; i++) {
    html += `${player.equipment[i]}`;
    if (i +1 < player.equipment.length) {
      html += ", ";
    }
  }
  html += "</b></br>";
  html += `Location: <b>${player.location}</b>`;
  html += `  |  silver: <b>${player.gold}</b>`;
  html += `  |  XP: <b>${player.xp}/${player.nextLvlXp}</b>`;
  html += `  |  Level: <b>${player.currentLevel}</b>`;
  html += `  |  Day: <b>${day}</b>`;
  playerStats.innerHTML = html;
}
function ClearDescription(){ textBlock.innerHTML = ""; }
function ClearActions(){ actionWrapper.innerHTML = ""; }
function Write(string){ textBlock.innerHTML += string + "</br>";}
function RandomRange(min, max) {return Math.floor(Math.random() * (max - min) ) + min;}
function ArrayRemove(arr, value) {
  return arr.filter(function(ele){
    return ele != value;
  });
}
//gameWon, submitting a new hero (feeds to node-coinshandler)
function tryName(){
  $.ajax({
      method: "GET",
      url: `https://casit.illinoisstate.edu/coins/HEN/${nameInput.value}/html`
  }).done(function(html){
      if (html == "false") {
        addHero();
      }
      else if (html == "true")
      {
        submit.setAttribute('style','display:block;');
      }
  });
  return false;
}
function addHero(){
  $.ajax({
      method: "GET",
      url: `https://casit.illinoisstate.edu/coins/HEN/${nameInput.value}/${player.currentLevel}/${player.gold}/${day}/html`
  }).done(function(html){
      listHeroes();
  });
}
function listHeroes(){
   $.ajax({
       method: "GET",
       url: "https://casit.illinoisstate.edu/coins/HEN/listHeroes/html"
   }).done(function(html){
       $("#localDescription").append(html);
   });
}


// SECTION 5__________________________________________
// ON-START PROCEDURE
function StartGame(){
  player = new Player();
  UpdateStats();

  currentRoom = new Room ("town");
  currentRoom.GenerateMonsters();

  GenerateActions();
}
