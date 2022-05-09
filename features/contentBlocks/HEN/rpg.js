//VARIABLE INSTANTIATION
var pageHTML = {};                                                              // creates an object that will hold future html
pageHTML.playerStats = document.getElementById("playerStats");                  // holds all of the below labelled player stats and is displayed on the screen
pageHTML.actionButtons = document.getElementById("actionButtons");              // Holds html, buttons are regenerated and build through this
pageHTML.localDescription = document.getElementById("localDescription");        // holds html, this is where the text of the current scene is built
var doorDescriptions = [];                                                      // a blanket array of different different descriptions for doors, built into action buttons for the player to enter the door
var roomDescriptions = [];                                                      // a blanket array of different different descriptions for rooms, built into scene descriptions
var monsterStats;                                                               // used to hold a monster stats temporarily in order to build their actions and responses
var localMonsters = [];                                                         // an array holding every monster within a scene that the player is in
var currentBoss = 1;                                                            // a counter used to indicate which boss the player is currently going to face
var temporaryDungeonDifficultyModifier = 0;                                     // a modifier that increases as the player delves deeper and deeper into the dungeon, increasing the monsters challenge rating and the quantity of monsters along the way
var roomNumber = 0;                                                             // an integer used to further devise where a room is in room generation
var currentActions = [];                                                        // an array that is used to mark which actions the player has currently available
var day =0;                                                                     // an integer used to maintain track of how long the player has been playing, adjusts the dungeon difficulty
var dungeonLocation = 0;                                                        // an unused variable (so far)
var locations = {
  townEntrance: {
    name:"Town Square",
    region: "town",
    description: [
      "A warm breeze greets you as you return to town"
    ],
    doors: {
      toBlacksmith: new Door("The blacksmith is working on a horsehshoe as you approach.","blacksmith"),
      toArmorer: new Door("The armorer shop is alone at the end of the street, a puff of smoke coming out of the chimeny","armorer"),
      toInn: new Door("You make your way to the tavern, pushing asside the door to be greeted by a growing crowd","inn"),
      toTemple: new Door("you travel to the temple, pushing through the large wood doors as you enter the serenity of the house of gods.","temple"),
      toDungeonEntrance: new Door("You travel along the trail on the way to the dungeon, taking in a moment of a peace before descending into the darkness","dungeonEntrance")
    }
  },
  blacksmith:{
    name:"Blacksmith",
    region: "town",
    description: [
      "Would you like to see my stock? Let me know if anything catches your eye."
    ],
    doors: {
      toTownSquare: new Door("Leaving the blacksmith, you return to the calm sight of the town square.","townEntrance"),
      toArmorer: new Door("The armorer shop is alone at the end of the street, a puff of smoke coming out of the chimeny","armorer"),
      toInn: new Door("You make your way to the tavern, pushing asside the door to be greeted by a growing crowd","inn"),
      toTemple: new Door("you travel to the temple, pushing through the large wood doors as you enter the serenity of the house of gods.","temple"),
      toDungeonEntrance: new Door("You travel along the trail on the way to the dungeon, taking in a moment of a peace before descending into the darkness","dungeonEntrance")
    },
    itemsForSale:{
      bowStaff: new Weapon("Bow Staff","A trusty stick",5,5,8,["you hit it with a stick"]),
      shortsword: new Weapon("Short Sword","A short stabby thing",15,5,12,["you hit it with a shortsword"]),
      longsword: new Weapon("Long Sword","A long stabby thing",50,7,17,["you hit it with a longsword"]),
      warAxe: new Weapon("War Axe","A big slashy thing",50,3,23,["you hit it with a axe"]),
      warHammer:  new Weapon("War Hammer","A bit whacky thing",100,4,35,["you hit it with a hammer"]),
      shortbow: new Weapon("Short Bow","A bow, this one is short",50,6,19,["you hit it with an arrow"]),
      longBow: new Weapon("Long Bow","A bow, this one is long",200,9,35,["you hit it with an arrow"]),
      greatsword: new Weapon("Great Sword","Whoa.... that is big",250,7,50,["you hit it with a very big sword"]),
      comicSans: new Weapon("Scroll of Comic Sans","POW",9001,12,125,["Bang! Ker POW"])

    }
  },
  armorer:{
    name:"Armorer",
    region: "town",
    description: [
      "Would you like to see my stock? Let me know if anything catches your eye."
    ],
    doors: {
      toBlacksmith: new Door("The blacksmith is working on a horsehshoe as you approach.","blacksmith"),
      toTownSquare: new Door("Leaving the armorer, you return to the calm sight of the town square.","townEntrance"),
      toInn: new Door("You make your way to the tavern, pushing asside the door to be greeted by a growing crowd","inn"),
      toTemple: new Door("you travel to the temple, pushing through the large wood doors as you enter the serenity of the house of gods.","temple"),
      toDungeonEntrance: new Door("You travel along the trail on the way to the dungeon, taking in a moment of a peace before descending into the darkness","dungeonEntrance")
    },
    itemsForSale: {
      clothes: new Armor("clothes","description",10,8,["dodge description"]),
      leatherArmor: new Armor("Leather Armor","description",20,10,["dodge description"]),
      hideArmor: new Armor("Hide Armor","description",35,12,["dodge description"]),
      paddedCloth: new Armor("Padded Cloth","description",60,13,["dodge description"]),
      chainmail: new Armor("Chainmail","description",120,15,["dodge description"]),
      glassArmor: new Armor("Glass Armor","description",150,16,["dodge description"]),
      platemail: new Armor("Platemail","description",200,17,["dodge description"]),
      hackermail: new Armor("Black Hoodie & Jnco Jeans","description",1337,19,["dodge description"])

    }
  },
  inn:{
    name:"Inn",
    region: "town",
    description: [
      "Any interest in staying the night? or just coming in for a fresh ale?"
    ],
    doors: {
      toBlacksmith: new Door("The blacksmith is working on a horsehshoe as you approach.","blacksmith"),
      toTownSquare: new Door("Leaving the Inn, you return to the calm sight of the town square.","townEntrance"),
      toArmorer: new Door("The armorer shop is alone at the end of the street, a puff of smoke coming out of the chimeny","armorer"),
      toTemple: new Door("you travel to the temple, pushing through the large wood doors as you enter the serenity of the house of gods.","temple"),
      toDungeonEntrance: new Door("You travel along the trail on the way to the dungeon, taking in a moment of a peace before descending into the darkness","dungeonEntrance")
    }
  },
  temple:{
    name:"Temple",
    region: "town",
    description: [
      "the temple has the slight hint of candlefire, the priest greets you and asks if you are here to recieve a blessing."
    ],
    doors: {
      toBlacksmith: new Door("The blacksmith is working on a horsehshoe as you approach.","blacksmith"),
      toArmorer: new Door("The armorer shop is alone at the end of the street, a puff of smoke coming out of the chimeny","armorer"),
      toInn: new Door("You make your way to the tavern, pushing asside the door to be greeted by a growing crowd","inn"),
      toTownSquare: new Door("Leaving the Temple, you return to the calm sight of the town square.","townEntrance"),
      toDungeonEntrance: new Door("You travel along the trail on the way to the dungeon, taking in a moment of a peace before descending into the darkness","dungeonEntrance")
    }
  },
  dungeonEntrance:{
    name: "Dungeon Entrance",
    region: "dungeon",
    description: [
      "you enter the crusty caverns, the silence of a dungeon eerily dominates the room"
    ],
    monsters:[

    ],
    doors: {
      door3: new Door(doorDescriptions[0],"In the Dungeon"),
      toTownSquare: new Door("run away!!","townEntrance")
    }
  },
  bossRoom1:{
    name: "Boss Room!",
    region: "dungeon",
    description: [
      "A boss approaches!"
    ],
    monsters:[
      mason = new Monster("Mason", "A beast beyond understanding", 5,100,16,30,250,250)
    ],
    doors: {
      toTownSquare: new Door("run away!!","townEntrance")
    }
  },
  bossRoom2:{
    name: "Boss Room!",
    region: "dungeon",
    description: [
      "A boss approaches!"
    ],
    monsters:[
      new Monster("Lizzy", "The demon of sloth come to take your soul away", 6,120,17,35,350,350)
    ],
    doors: {
      toTownSquare: new Door("run away!!","townEntrance")
    }
  },
  bossRoom3:{
    name: "Boss Room!",
    region: "dungeon",
    description: [
      "A boss approaches!"
    ],
    monsters:[
      new Monster("Lauren", "the destructive devil king of the Front end developer squad at CAS-IT", 7,150,19,50,350,350)
    ],
    doors: {
      toTownSquare: new Door("run away!!","townEntrance")
    }
  },
  death:{
    name:"The great beyond",
    region: "town",
    description: [
      "you have died..."
    ],
  }
};                                                            // an object that holds all the data of town
var randomDungeonRooms = [];                                                    // an array that holds all of the rooms that the town possesses
var combatdescription = "";                                                     // a string that holds the current description of any actions taken by the player








// PLAYER STATS
var player = {};                                                                // The object that holds all player stats
    player.maxHP = 100;                                                         // the HP that the player is capable of reaching (aka max HP)
    player.currentHP = player.maxHP;                                            // the current health of a player, the game is supposed to end if the HP uses 0
    player.armor = new Armor("Loin Cloth", "the clothes of a peasant", 0, 7, ["you manage to dodge out of the way before being struck"]);   // holds the armor stats of the character
    player.weapon = new Weapon("Rusty Dagger", "an heirloom from better days", 0, 0, 5, ["hacking and slashing, you strike the creature with your rusty knife", "your rusty knife pierces your foe"]);    // holds the weapon stats of the player
    player.currentWealth = 15;                                                  // holds the amount of wealth that the player possesses
    player.XP = 0;                                                              // holds the amount of xp that the player possesses
    player.location = new Location("Town", "town" ,["In the safey of your village"]);   // holds the current location








//CONSTRUCTORS
function Action(name, functionString, functionParameters){                      // this is the constructor for actions
  this.name = name;
  this.functionString = functionString;
  this.functionParameters = functionParameters;
  this.function = functionString+"('";                                          //

  for (var i = 0; i < functionParameters.length; i++)                           //
  {
    if (i + 1< functionParameters.length)                                       //
    {
      this.function += functionParameters[i] + "', '";                          //
    }
    else
    {
      this.function += functionParameters[i] + "')";                            //
    }
  }

  this.button = createActionButton(name, this.function);                        //
}

function Armor(name, description, cost, ac, blockedDescriptions){               //
  this.name = name;
  this.description = description;
  this.cost = cost;
  this.ac = ac;
  this.blockedDescriptions = blockedDescriptions;
}

function Weapon(name, description, cost, attackMod, damage, attackDescriptions){     //
  this.description = description;
  this.cost = cost;
  this.attackMod = attackMod;
  this.damage = damage;
  this.attackDescriptions = attackDescriptions;
}

function Location(name, region, description){                                   //
  this.name = name;
  this.region = region;
  this.description = description;


  if (this.region == "dungeon") {                                               //
    this.treasures = Math.ceil(Math.random()*day*5 +5);

    if (Math.random() >= .95)                                                   //
    {
      //GENERATE DOOR FOR A NAMED ROOM
      console.log("generating a named room");
      this.doors = {};
      this.doors.continue = new Door("","bossRoom" + currentBoss);              //
      this.doors.run = new Door("","townEntrance");                             //
    }
    else
    {
      this.monsters = GenerateRoomMonsters();                                   //
      this.doors = {};
      this.doors.continue = new Door("","In the Dungeon");                      //
      this.doors.run = new Door("","townEntrance");                             //
    }
  }
  else if(this.region == "town")                                                //
  {
    this.itemsForSale = GenerateItemsForSale();
  }
}
function Monster(name, description, challengeRating, hp, ac, damage, treasure, xp){    //
  this.name = name;
  this.description = description;
  this.challengeRating = challengeRating;
  this.stats = {};
  this.stats.hp = hp;
  this.stats.ac = ac;
  this.stats.damage = damage;
  this.stats.treasure = treasure;
  this.stats.xp = xp;
}

function Door(doorDescription, doorLocation){                                   //
  this.description = doorDescription;
  this.location = doorLocation;
  this.action = new Action("go to " + doorLocation,"ChangeLocation",[doorLocation] )     //
}









//DEFINING ACTION BUTTONS
  // Creates a default html button with a given function
  function createActionButton(buttonText, onclickFunction){
    newButtonHTML = '<button id="actionButton" type="button" name="button" onclick="' + onclickFunction + '">' + buttonText + '</button>'
    return newButtonHTML;
  }
  // Adds an action from a global list of actions to the current list of actions
  function addActionOption(actionName){
    var newAction;

    for (var action in allActions) {
      if (action.name == actionName) {
        newAction = action;
      }
    }

    currentActions.push(newAction);
  }
  //removes a specific action from the local list of actions
  function removeActionOption(actionName){
    for (var i = 0; i < currentActions.length; i++) {
      if (currentActions[i].name == actionName) {
        currentActions.splice(i,1);
      }
    }
  }








// COMBAT FUNCTIONS
  function StartCombat(monsters) {
    localMonsters = monsters;
    UpdateCombat();
  }
function UpdateCombat(){
    for (var i = 0; i < localMonsters.length; i++) {
      if (RollTest(0,player.armor.ac))
      {
        combatdescription += "<p>a " + localMonsters[i][0] + " hit you and did " + localMonsters[i][5] + " damage!</p>";
        player.currentHP -= localMonsters[i][5];
        displayPlayerStats();
        if (player.currentHP <= 0) {
          console.log("the player is dead");
          ChangeLocation("death");
        }
      }
      else
      {
        if (player.armor.ac >= 10)
        {
          combatdescription += "<p>your armor blocked the attack from a " + localMonsters[i][0] + "! </p>";
        }
        else
        {
          combatdescription += "<p>you dodged out of the way of the attack from a " + localMonsters[i][0] + "! </p>";
        }
      }
    }
    combatdescription += "<p>--------------CURRENT MONSTERS--------------</p>"
    DisplayMonsters(combatdescription);
    combatdescription = "";
}
  function RollTest(rollModifier,difficultyCheck){
    var roll = rollModifier + Math.ceil(Math.random()*20);

    if (roll >= difficultyCheck)
    {
      return true;
    }
    else
    {
      return false;
    }
  }
function attack(monsterIndex){
  if (RollTest(player.weapon.attackMod,localMonsters[monsterIndex][4])) {
    combatdescription += player.weapon.attackDescriptions[RandomRange(0,player.weapon.attackDescriptions.length)];
    localMonsters[monsterIndex][3] -= player.weapon.damage;
    if (localMonsters[monsterIndex][3] <= 0 ) {

      die(localMonsters[monsterIndex]);
      localMonsters.splice(monsterIndex,1);
    }
  }
  else
  {
    combatdescription += "you swing at " + localMonsters[monsterIndex][0] + " and miss";
  }

  UpdateCombat();
}
function die(monster){
  combatdescription += "<p>" +monster[0] + " died. You gained: " + monster[6] +" gold &   " + monster[7] + " xp</p>";
  player.xp += monster[7];
  player.currentWealth += monster[6];
  displayPlayerStats();

}









// ROOM GENERATION & LOCATION MOVING
// Takes a location object  and changes actions based on the location type
function ChangeLocation(newLocation){

  if (newLocation != "In the Dungeon")
  {
    var location = locations[newLocation];
    temporaryDungeonDifficultyModifier = 0;

    if (player.location.region == "dungeon" && player.location.name != "dungeonEntrance") {
      day++;
    }
  }
  else
  {
    var location = BuildRandomRoom();
    player.location.name = "In the Dungeon";
    temporaryDungeonDifficultyModifier += .25;
  }
  player.location = location;

  if (location.monsters != undefined && location.monsters.length >0)
  {
    StartCombat(location.monsters);
  }
  else if(location.itemsForSale != undefined && Object.keys(location.itemsForSale).length > 0)
  {
    DisplayItemsForSale(newLocation);
    displayDescriptionText(player.location.description);
    reloadUI();
  }
  else
  {
    DisplayLocationMovement();
    displayDescriptionText(player.location.description);

    if (player.location.name == "Temple" || player.location.name == "Inn") {
      currentActions.push(new Action("Rest","resetPlayerStats",[""]))
    }
    reloadUI();
  }
}









//Display the actions and texts of each respective room interactable
function DisplayMonsters(startingdescription){
  if (startingdescription != undefined) {
    var newDisplayHTML = startingdescription;
  } else{
    var newDisplayHTML = "";
  }

  if (localMonsters.length <= 0) {
    DisplayLocationMovement();
  }
  else
  {
    console.log("Monsters remaining: " + localMonsters.length);
    for (var i = 0; i < localMonsters.length; i++) {
      newDisplayHTML += "<p><span class='monstername'>" + localMonsters[i][0] + "</p>";
      currentActions.push(new Action("Attack " + localMonsters[i][0], "attack",[i]));
    }
  }
  currentActions.push(new Action("run away!!!" ,"ChangeLocation",["townEntrance"]));

  displayDescriptionText(newDisplayHTML);
  reloadUI();
}
function DisplayItemsForSale(newLocation){
  for (var i = 0; i < Object.keys(player.location.itemsForSale).length; i++) {
    var buyAction = new Action("Buy " + player.location.itemsForSale[Object.keys(player.location.itemsForSale)[i]].name + " (" + player.location.itemsForSale[Object.keys(player.location.itemsForSale)[i]].cost + "gp) ","BuyItemForSale",[Object.keys(player.location.itemsForSale)[i],newLocation]);
    currentActions.push(buyAction);
  }
  currentActions.push(locations.blacksmith.doors["toTownSquare"].action);

}
function DisplayLocationMovement(){
  for (var door in player.location.doors) {
    if (player.location.doors[door].action != undefined)
    {
      currentActions.push(player.location.doors[door].action);
    }
    else
    {
      console.log("There is no action attached to the door!");
    }
  }
}

// build a random room
function BuildRandomRoom(){
  var randomRoom;
  randomRoom = new Location("In the Dungeon", "dungeon", roomDescriptions[RandomRange(0,roomDescriptions.length)]);
  roomNumber++;
  return randomRoom;
}

// generate the monsters in a dungeon room based on the array
function GenerateRoomMonsters(){
  var newMonsters = [];
  var roomDifficulty = temporaryDungeonDifficultyModifier + Math.ceil(Math.random()*(day +1))/4;
  var areMonstersReady = false;

  while (!areMonstersReady) {
    var availableMonsters = [];

    for (var i = 0; i < monsterStats.length; i++)
    {
      if (monsterStats[i][2] <= roomDifficulty)
      {
        availableMonsters.push(monsterStats[i]);
      }
    }

    if (availableMonsters.length == 0)
    {
      break;
    }

    var myMonster = availableMonsters[RandomRange(0,availableMonsters.length)];

    newMonsters.push(myMonster);

    roomDifficulty -= myMonster[2];
  }
  return newMonsters;
}

// generate the items in a town building
function GenerateItemsForSale(){
  var itemsForSale;
  return itemsForSale;
}







// UI FUNCTIONS
// resets all UI functions
function reloadUI(){
  displayPlayerStats();
  displayActionOptions();
}

// Changes the innerHTML of a text scene to a new scene (effectively swaps the text)
function displayDescriptionText(newDescription){
  pageHTML.localDescription.innerHTML = newDescription;
}

//  build an html element for For each playerstat
function displayPlayerStats(){
  var newStatsHTML = "";
      newStatsHTML = "<span class='stat'>HP: <strong>" +player.currentHP+ "</strong>/<strong>"+player.maxHP +"</strong></span>" +
                     "<span class='stat'>XP: <strong>" +player.XP+ "</strong></span>" +
                     "<span class='stat'>GOLD: <strong>" +player.currentWealth+ "</strong></span>" +
                     "<span class='stat'>Location: <strong>" +player.location.name+ "</strong></span>" +
                     "<span class='stat'>Armor: <strong>" +player.armor.name+ "</strong></span>" +
                     "<span class='stat'>Weapon: <strong>" +player.weapon.name+ "</strong></span>" +
                     "<span class='stat'>    Day: <strong>" +day+ "</strong></span>";
  pageHTML.playerStats.innerHTML = newStatsHTML;
}

// Have a list of actions that the player can access and display that given list
function displayActionOptions(){
  var newActionsHTML = "";
  for (var i = 0; i < currentActions.length; i++) {
    newActionsHTML += currentActions[i].button;
  }
  pageHTML.actionButtons.innerHTML = newActionsHTML;
  currentActions = [];
}

// BUY ITEMFORSALE
function BuyItemForSale(itemToBuyName, currentlocationName){

  var itemToBuy = locations[currentlocationName].itemsForSale[itemToBuyName];

  if (player.currentWealth >= itemToBuy.cost) {
    if (currentlocationName == "blacksmith") {
      player.currentWealth += player.weapon.cost;
      player.weapon = itemToBuy;
      player.currentWealth -= player.weapon.cost;
    }
    else if (currentlocationName == "armorer")
    {
      player.currentWealth += player.armor.cost;
      player.armor = itemToBuy;
      player.currentWealth -= player.armor.cost;
    }

    displayPlayerStats();
  }
  else
  {
      console.log("nope! it costs: " + itemToBuy.cost + ". and you only have: " + player.currentWealth);
  }
}
function resetPlayerStats(){
  if (player.currentWealth >= 5) {
    player.currentHP = player.maxHP;
    player.currentWealth -= 5;
    DisplayLocationMovement();
    reloadUI();
  } else{
    player.currentWealth
    console.log("you don't have enough money");
  }
}










// ONLOAD FUNCTIONS
document.body.onload = function(){
  var pageHTML = {};
  pageHTML.playerStats = document.getElementById("playerStats");
  pageHTML.actionButtons = document.getElementById("actionButtons");
  pageHTML.localDescription = document.getElementById("localDescription");

  doorDescriptions = ["Continue deeper into the dungeon"];
  roomDescriptions = ["its a dungeon room made out of white stone", "It's a cavern with a flat floor and a small pool of gross water", "it is a small wooden room that looks like it used to house a person"];
  monsterStats = [["goblin",["its a young goblin","its an old goblin","its a goblin with an axe"],.25,15,12,12,15,5],
                  ["slime",["its a young slime"],.5,20,14,23,25,15],
                  ["troll",["its a young troll"],.75,50,12,12,30,35],
                  ["rat",["its a young rat"],.1,5,8,4,15,5],
                  ["vampire",["its a young vampire"],2,60,17,45,230,200],
                  ["knoll",["its a young knoll"],1,35,14,20,40,50]];
  day = 0;



ChangeLocation("townEntrance");

}







// USEFUL LOGISTICAL FUNCTIONS
function RandomRange(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}
