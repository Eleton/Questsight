

//--------Atom prototype-------
var Atom = function (name, power, speed, maxSpeedGauge) {
    this.name = name;
    this.power = power;
    this.speed = speed;
    this.active = false;
    this.speedGauge = 0;
    this.MAX_SPEED_GAUGE = maxSpeedGauge;
};

Atom.prototype.awaitTurn = function () {
    if (this.speedGauge >= this.MAX_SPEED_GAUGE) {
        this.speedGauge = this.MAX_SPEED_GAUGE;
        this.active = true;
    } else {
        this.speedGauge += this.speed;
    }
};

Atom.prototype.use = function () {
    this.active = false;
    this.speedGauge = 0;
};

//---------Unit prototype--------
var Unit = function (name, hp, attack, defence, speed) {
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

Unit.prototype.awaitTurn = function () {
    this.speedGauge += this.speed;
    var hasWaited = this.speedGauge >= this.MAX_SPEED_GAUGE ? true : false;
    if (hasWaited) {
        this.speedGauge -= this.MAX_SPEED_GAUGE;
    }
    return hasWaited;
};

Unit.prototype.attackTarget = function (target) {
    var damage = this.attack - target.defence;
    target.takeDamage(damage);
};

Unit.prototype.takeDamage = function (damage) {
    if (damage >= this.hp) {
        this.hp = 0;
        this.alive = false;
        console.log(this.name + " died!");
    } else {
        this.hp -= damage;
        /*console.log(this.name + " took " + damage + " points of damage, has " + this.hp + "hp left!");*/
    }
};

//-----------Enemy prototype--------
function Enemy(name, hp, attack, defence, speed) {
    Unit.call(this, name, hp, attack, defence, speed);
}

Enemy.prototype = Object.create(Unit.prototype);

//Enemy.prototype.constructor = Unit;

//-----------Player prototype---------
function Player(name, hp, attack, defence, speed, arsenal) {
    Unit.call(this, name, hp, attack, defence, speed);
    this.arsenal = arsenal;
    this.currentAtom = arsenal[0];
    this.active = false;
}

Player.prototype = Object.create(Unit.prototype);

Player.prototype.attackTarget = function (target) {
    var damage = this.attack + this.currentAtom.power - target.defence;
    this.currentAtom.use();
    this.active = false;
    target.takeDamage(damage);
    this.speedGauge = 0;
};

Player.prototype.awaitTurn = function () {
    if (!this.active) {
        this.speedGauge += this.speed;
        if (this.speedGauge >= this.MAX_SPEED_GAUGE) {
            this.speedGauge = this.MAX_SPEED_GAUGE;
            this.active = true;
        }
    }
};

//Initialize atoms, player character and enemies for the battleFrame-function
var hydrogenium = new Atom("Hydrogenium", 1, 5, 20);

var helium = new Atom("Helium", 5, 1, 15);

var arsenal = [hydrogenium, helium];

var mike = new Player("Mike", 20, 5, 1, 4, arsenal);

var rat = new Enemy("Rattigan", 30, 2, 1, 2);

var bat = new Enemy("Batshit McCrazy", 10, 2, 1, 5);

var enemyArray = [rat, bat];




function isAlive(element, index, array) {
    return element.alive;
}

battleFrame(mike, enemyArray);

//This is the start of the battle, initiating a battle with the enemies from the args
function battleFrame(hero, enemies) {


    var paused = false;
    var currentTarget = enemies[0];
    //var battle = setInterval(loop, 1000);

    var gameLoop = function () {
        var aliveEnemies = enemies.some(isAlive);

        console.log("ett" + hero.speedGauge);

        //Ends the battle if one side is defeated
        if (!aliveEnemies) {
            clearInterval(battle);
            console.log("You win!");
        } else if (!hero.alive) {
            clearInterval(battle);
            console.log("You lose...");
        } else {


            var atoms = hero.arsenal;
            for (var i = 0; i < atoms.length; i++) {
                var atom = atoms[i];
                var isActive = atom.awaitTurn();
            }

            console.log(hero.active)
            console.log(hero.currentAtom.active)

            if (hero.active && hero.currentAtom.active) {
                hero.attackTarget(currentTarget);
            } else if (hero.active && !hero.currentAtom.active || hero.active && hero.currentAtom === null) {
                hero.active = true;
            }

            for (var i = 0; i < enemies.length; i++) {
                enemy = enemies[i];
                var enemyTurn = enemy.awaitTurn();
                if (enemyTurn) {
                    enemies[i].attackTarget(hero);
                }
            }


            updateStats();

            hero.awaitTurn();
        }

    }

    var battle = setInterval(gameLoop, 600);

    var main = function () {
        initStats();
        updateStats();
        forceEndBattle();
        selectEnemy();
        selectAtom();
    };

    var initStats = function () {

        var heroBox = $("<ul>").text("Hero").addClass("basicBox");
        var name = $("<li>").addClass("name").text(hero.name);
        var hp = $("<li>").addClass("hp").text(hero.hp + " hp");
        var speed = presentSpeed(hero).addClass("speed");
        name.appendTo(heroBox);
        hp.appendTo(heroBox);
        speed.appendTo(heroBox);
        heroBox.appendTo($(".playerStats").children(".container"));

        var atoms = hero.arsenal;
        for (var i = 0; i < atoms.length; i++) {
            var atomBox = $("<ul>").addClass("basicBox").text("Atom" + i);
            $("<p>").addClass("index").text(i).hide().appendTo(atomBox);
            $("<li>").text(atoms[i].name).appendTo(atomBox);
            presentSpeed(atoms[i]).addClass("speed").appendTo(atomBox);
            atomBox.appendTo(".atomBox");
        }

        for (var i = 0; i < enemies.length; i++) {
            var enemy = enemies[i];
            var enemyBox = $("<ul>").text("Enemy" + i).addClass("basicBox");
            var name = $("<li>").addClass("name").text(enemy.name);
            var hp = $("<li>").addClass("hp").text(enemy.hp + " hp");
            var speed = presentSpeed(enemy).addClass("speed");
            name.appendTo(enemyBox);
            hp.appendTo(enemyBox);
            speed.appendTo(enemyBox);
            $("<p>").addClass("index").text(i).hide().appendTo(enemyBox);
            enemyBox.appendTo($(".enemyStats").children(".container"));
        }
        $(".enemyStats ul").first().addClass("active");
        $(".playerStats .atomBox ul").first().addClass("active");

    }

    var updateStats = function () {
        var playerBox = $(".playerStats .container ul");
        var player = hero;
        playerBox.children(".hp").text(player.hp + " hp");
        playerBox.children(".speed").remove();
        presentSpeed(player).addClass("speed").appendTo(playerBox);

        var enemyBox = $(".enemyStats .container");
        enemyBox.children().each(function () {
            var enemy = enemies[$(this).text().slice(5, 6)];
            $(this).children(".hp").text(enemy.hp + " hp");
            $(this).children(".speed").remove();
            presentSpeed(enemy).addClass("speed").appendTo($(this));
        });

        var atomBox = $(".atomBox");
        atomBox.children().each(function () {
            var atom = hero.arsenal[$(this).text().slice(4, 5)];
            $(this).children(".speed").remove();
            presentSpeed(atom).addClass("speed").appendTo($(this));
        });
    }

    var presentSpeed = function (unit) {
        //console.log(unit.name + " " + unit.speedGauge);
        var elapsedSpeed = 5 * unit.speedGauge + "px";
        var maxSpeed = 5 * unit.MAX_SPEED_GAUGE + "px";
        var lowerDiv = $("<div>").width(elapsedSpeed).height("10px").css("background-color", "yellow");
        var higherDiv = $("<div>").width(maxSpeed).height("10px").css("background-color", "black").append(lowerDiv);
        return higherDiv;
    }

    var forceEndBattle = function () {
        $(document).keypress(function (event) {
            if (event.which === 112) {
                if (paused) {
                    battle = setInterval(gameLoop, 1000);
                    console.log("Unpaused");
                    paused = false;
                } else {
                    clearInterval(battle);
                    console.log("Paused");
                    paused = true;
                }
            }
        });
    }

    var selectEnemy = function () {
        $(".enemyStats ul").click(function () {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                currentTarget = null;
            } else {
                $(this).siblings().removeClass("active");
                $(this).addClass("active");
                var enemyIndex = $(this).text().slice(5, 6); //DEN HÄR GREJEN BÖR ÄNDRAS!
                currentTarget = enemies[enemyIndex];
            }
        });
    }

    var selectAtom = function () {
        $(".atomBox ul").click(function () {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                hero.currentAtom = null;
            } else {
                $(this).siblings().removeClass("active");
                $(this).addClass("active");
                var atomIndex = $(this).text().slice(4, 5); //DEN HÄR GREJEN BÖR ÄNDRAS
                hero.currentAtom = hero.arsenal[atomIndex];
            }
        });
    }

    $(document).ready(main);
}
