var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var CollisionGroup = /** @class */ (function () {
    function CollisionGroup(name) {
        this.name = name;
        this.collidableGroups = [];
    }
    CollisionGroup.prototype.canCollideWith = function (c) {
        for (var i = 0; i < this.collidableGroups.length; i++) {
            if (this.collidableGroups[i] == c)
                return true;
        }
        return false;
    };
    return CollisionGroup;
}());
var Obstacle = /** @class */ (function () {
    function Obstacle(collisionGroup, position) {
        this.collisionGroup = collisionGroup;
        this.position = position;
    } //Содержит неизменяемый параметр позиции
    Obstacle.prototype.canCollideWith = function (c) {
        return c.collisionGroup.canCollideWith(this.collisionGroup);
    };
    Obstacle.prototype.collidesWith = function (c) {
        if (!this.canCollideWith(c))
            return false; //Проверяем группы коллизий
        return this.position.x == c.position.x && this.position.y == c.position.y; //Проверяем координаты
    };
    return Obstacle;
}());
var Door = /** @class */ (function (_super) {
    __extends(Door, _super);
    function Door() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isOpen = false;
        return _this;
    }
    Door.prototype.open = function () {
        this.isOpen = true;
    };
    Door.prototype.close = function () {
        this.isOpen = false;
    };
    Door.prototype.collidesWith = function (c) {
        if (this.isOpen)
            return false; //Учитываем если она открыта
        return _super.prototype.collidesWith.call(this, c);
    };
    return Door;
}(Obstacle));
var Entity = /** @class */ (function () {
    function Entity(collisionGroup) {
        this.collisionGroup = collisionGroup;
        this.position = { x: 0, y: 0 };
    }
    Entity.prototype.canCollideWith = function (c) {
        return this.collisionGroup.canCollideWith(c.collisionGroup)
            && c.collisionGroup.canCollideWith(this.collisionGroup); //В данном случае проверяем коллизию обоюдно
    };
    Entity.prototype.collidesWith = function (c) {
        if (!this.canCollideWith(c))
            return false;
        return this.position.x == c.position.x && this.position.y == c.position.y;
    };
    return Entity;
}());
var Bot = /** @class */ (function (_super) {
    __extends(Bot, _super);
    function Bot(collisionGroup, hp) {
        var _this = _super.call(this, collisionGroup) || this;
        _this.collisionGroup = collisionGroup;
        _this.health = hp;
        return _this;
    }
    Bot.prototype.move = function (delta) {
        this.position.x = this.position.x + delta.x;
        this.position.y = this.position.y + delta.y;
    };
    return Bot;
}(Entity));
var PlayerCharacter = /** @class */ (function (_super) {
    __extends(PlayerCharacter, _super);
    function PlayerCharacter(collisionGroup, hp, bulletCollisionGroup) {
        var _this = _super.call(this, collisionGroup, hp) || this;
        _this.collisionGroup = collisionGroup;
        _this.bulletCollisionGroup = bulletCollisionGroup; //Группа коллизий для пуль, которые игрок выстреливает
        return _this;
    }
    PlayerCharacter.prototype.shoot = function (dir) {
        var bul = new Bullet(this.bulletCollisionGroup, dir);
        bul.position = this.position;
        return bul;
    };
    PlayerCharacter.prototype.open = function (door) {
        door.open();
    };
    PlayerCharacter.prototype.close = function (door) {
        door.close();
    };
    return PlayerCharacter;
}(Bot));
var Bullet = /** @class */ (function (_super) {
    __extends(Bullet, _super);
    function Bullet(collisionGroup, vel) {
        var _this = _super.call(this, collisionGroup) || this;
        _this.collisionGroup = collisionGroup;
        _this.velocity = vel;
        return _this;
    }
    Bullet.prototype.move = function () {
        this.position.x = this.position.x + this.velocity.x;
        this.position.y = this.position.y + this.velocity.y;
    };
    Bullet.prototype.hit = function (target) {
        target.health = target.health - 1;
    };
    return Bullet;
}(Entity));
var cGroupWalls = new CollisionGroup("walls");
var cGroupBots = new CollisionGroup("bots");
var cGroupPlayers = new CollisionGroup("players");
var cGroupBullets = new CollisionGroup("bullets");
cGroupBullets.collidableGroups[0] = cGroupBots; //Пули попадают по ботам
cGroupBullets.collidableGroups[1] = cGroupWalls; //Пули попадают по стенам
cGroupPlayers.collidableGroups[0] = cGroupBots; //Игроки сталкиваются с ботами
cGroupBots.collidableGroups[0] = cGroupPlayers;
cGroupPlayers.collidableGroups[1] = cGroupPlayers; //Игроки сталкиваются друг с другом
cGroupPlayers.collidableGroups[1] = cGroupWalls; //Игроки и боты сталкиваются со стенами
cGroupBots.collidableGroups[0] = cGroupWalls;
for (var i = 0; i < 10; i++) { //Создаём вертикальную стену
    new Obstacle(cGroupWalls, { x: 5, y: i });
}
var bot = new Bot(cGroupBots, 10);
bot.position = { x: 6, y: 0 };
var player = new PlayerCharacter(cGroupPlayers, 10, cGroupBullets);
var bullet = player.shoot({ x: 0, y: 1 }); //Стреляет вверх
