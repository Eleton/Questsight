var osbscenelyNamedVariable= "sträng skriven på svenska";
var Atom = function(name, power, speed, maxSpeedGauge){
    this.name = name;
    this.power = power;
    this.speed = speed;
    this.active = false;
    this.speedGauge = 0;
    this.MAX_SPEED_GAUGE = maxSpeedGauge;
}

Atom.prototype.awaitTurn = function(){
    if(this.speedGauge >= this.MAX_SPEED_GAUGE){
        this.speedGauge = this.MAX_SPEED_GAUGE;
        this.active = true;
    }else{
        this.speedGauge += this.speed;
    }
}

Atom.prototype.use = function(){
    this.active = false;
    this.speedGauge = 0;
}

var Unit = function(name, hp, attack, defence, speed){
    this.name = name;
    this.MAX_HP = hp;
    this.hp = hp;
    this.attack = attack;
    this.defence = defence;
    this.speed = speed;
    this.alive = true;
    this.speedGauge = 0;
    this.MAX_SPEED_GAUGE = 24;
};

Unit.prototype.awaitTurn = function(){
    this.speedGauge += this.speed;
    var hasWaited = this.speedGauge >= this.MAX_SPEED_GAUGE ? true : false;
    if (hasWaited) this.speedGauge -= this.MAX_SPEED_GAUGE;
    return hasWaited;
}

Unit.prototype.attackTarget = function(target){
    damage = this.attack - target.defence;
    target.takeDamage(damage);
}

Unit.prototype.takeDamage = function(damage){
    if (damage >= this.hp){
        this.hp = 0;
        this.alive = false;
        console.log(this.name + " died!");
    }else{
        this.hp -= damage;
        console.log(this.name + " took " + damage + " points of damage, has " + this.hp + "hp left!");
    }
}

Unit.prototype.displaySpeed = function(){
    //if (this.alive) console.log(this.name + " " + this.hp + " " + Array(this.speedGauge + 1).join("-") + Array(this.MAX_SPEED_GAUGE - this.speedGauge + 1).join("."));
}

function Enemy(name, hp, attack, defence, speed){
    Unit.call(this, name, hp, attack, defence, speed);
}

Enemy.prototype = Object.create(Unit.prototype);

//Enemy.prototype.constructor = Unit;

function Player(name, hp, attack, defence, speed, arsenal){
    Unit.call(this, name, hp, attack, defence, speed);
    this.arsenal = arsenal;
    this.currentAtom = null;
    this.waiting = false;
}

Player.prototype = Object.create(Unit.prototype);



Player.prototype.attackTarget = function(target){
    damage = this.attack + this.currentAtom.power - target.defence;
    this.currentAtom.use();
    this.waiting = false;
    target.takeDamage(damage);
}

Player.prototype.awaitTurn = function(){
    if(!this.waiting){
        this.speedGauge += this.speed;
        var hasWaited = this.speedGauge >= this.MAX_SPEED_GAUGE ? true : false;
        if (hasWaited) this.speedGauge -= this.MAX_SPEED_GAUGE;
        return hasWaited;
    }
}


hydrogenium = new Atom("Hydrogenium", 1, 5, 20);

helium = new Atom("Helium", 5, 1, 15);

arsenal = [hydrogenium, helium];


mike = new Player("Mike", 20, 5, 1, 4, arsenal);

rat = new Enemy("Rattigan", 30, 2, 1, 2);

bat = new Enemy("Batshit McCrazy", 10, 2, 1, 5);

var unitArray = [mike, rat, bat];

var paused = false;

var currentTarget = null;


loop = function(){    
    for(var i = 0; i < unitArray.length; i++){
        var unit = unitArray[i];
        if(unit.awaitTurn() && unit.alive){
            if(unit instanceof Player){
                //var target = parseInt(prompt("Who do you want to attack?"));
                if(unit.currentAtom.active){
                    unit.attackTarget(currentTarget);
                }
            }else{
                unit.attackTarget(unitArray[0]);
            }
        }
    }
    if (!unitArray[0].alive || (!unitArray[1].alive && !unitArray[2].alive)){
        console.log("Battle ended!");
        clearInterval(battle);
    }
    
    for(var i = 0; i < unitArray.length; i++){
        unit = unitArray[i];
        unit.displaySpeed();
    }
    
    var atoms = unitArray[0].arsenal;
    for(var i = 0; i < atoms.length; i++){
        var atom = atoms[i];
        var isActive = atom.awaitTurn();
    }
    
    updateStats();
}

var battle = setInterval(loop, 1000);

var main = function(){
    initStats();
    updateStats();
    forceEndBattle();
    selectEnemy();
    selectAtom();
};

var initStats = function(){
    for(var i = 0; i<unitArray.length; i++){
        var unit = unitArray[i];
        var typeOfUnit = unit instanceof Player ? ".playerStats" : ".enemyStats";
        var unitIndex = unit instanceof Player ? "Player" : "Enemy" + i;
        var unitBox = $("<ul>").text(unitIndex).addClass("basicBox");
        var name = $("<li>").addClass("name").text(unit.name);
        var hp = $("<li>").addClass("hp").text(unit.hp + " hp");
        var speed = presentSpeed(unit).addClass("speed");
        name.appendTo(unitBox);
        hp.appendTo(unitBox);
        speed.appendTo(unitBox);
        
        unitBox.appendTo($(typeOfUnit).children(".container"));
    }
    
    var atoms = unitArray[0].arsenal;
    for(var i = 0; i < arsenal.length; i++){
        var atomBox = $("<ul>").addClass("basicBox").text("Atom" + i);
        $("<li>").text(atoms[i].name).appendTo(atomBox);
        presentSpeed(atoms[i]).addClass("speed").appendTo(atomBox);
        atomBox.appendTo(".atomBox");
    }
}

var updateStats = function(){
    var playerBox = $(".playerStats .container ul");
    var player = unitArray[0];
    playerBox.children(".hp").text(player.hp + " hp");
    playerBox.children(".speed").remove();
    presentSpeed(player).addClass("speed").appendTo(playerBox);
    
    var enemyBox = $(".enemyStats .container");
    enemyBox.children().each(function(){
        var enemy = unitArray[$(this).text().slice(5, 6)];
        $(this).children(".hp").text(enemy.hp + " hp");
        $(this).children(".speed").remove();
        presentSpeed(enemy).addClass("speed").appendTo($(this));
    });
    
    var atomBox = $(".atomBox");
    atomBox.children().each(function(){
        var atom = unitArray[0].arsenal[$(this).text().slice(4,5)];
        $(this).children(".speed").remove();
        presentSpeed(atom).addClass("speed").appendTo($(this));
    });
}

var presentSpeed = function(unit){
    //console.log(unit.name + " " + unit.speedGauge);
    var elapsedSpeed = 5*unit.speedGauge + "px";
    var maxSpeed = 5*unit.MAX_SPEED_GAUGE + "px";
    var lowerDiv = $("<div>").width(elapsedSpeed).height("10px").css("background-color","yellow");
    var higherDiv = $("<div>").width(maxSpeed).height("10px").css("background-color","black").append(lowerDiv);
    return higherDiv;
}

var forceEndBattle = function(){
    $(document).keypress(function(event) {
        if(event.which === 112) {
            if(paused){
                battle = setInterval(loop, 1000);
                console.log("Unpaused");
                paused = false;
            }else{
                clearInterval(battle);
                console.log("Paused");
                paused = true;
            }
        }
    });
}

var selectEnemy = function(){
    $(".enemyStats ul").click(function(){
        if($(this).hasClass("active")){
            $(this).removeClass("active");
            currentTarget = null;
        }else{
            $(this).siblings().removeClass("active");
            $(this).addClass("active");
            var enemyIndex = $(this).text().slice(5, 6);
            currentTarget = unitArray[enemyIndex];
        }
    });
}

var selectAtom = function(){
    $(".atomBox ul").click(function(){
        if($(this).hasClass("active")){
            $(this).removeClass("active");
            unitArray[0].currentAtom = null;
        }else{
            $(this).siblings().removeClass("active");
            $(this).addClass("active");
            var atomIndex = $(this).text().slice(4,5);
            unitArray[0].currentAtom = unitArray[0].arsenal[atomIndex];
        }
    });
}

$(document).ready(main);