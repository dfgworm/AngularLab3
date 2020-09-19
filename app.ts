
interface Vector2 {
	x: number;
	y: number;
}

class CollisionGroup {// Класс групп коллизий, который отвечает за логику столкновений объектов.
	//Например в игре могут быть 2 команды. Пули первой команды сталкиваются с врагами, но не
	// сталкиваются с союзниками. Для этого мы можем создать для этих пуль группу коллизий
	// и обозначить что они сталкиваются только с группой коллизий противников.
	collidableGroups: CollisionGroup[]; //Группы, с которыми эта группа может столкнуться
	constructor(public name: string){
		this.collidableGroups = [];
	}
	canCollideWith(c: CollisionGroup):boolean { //Проверяем может эта группа столкнуться с другой
		for (let i = 0; i < this.collidableGroups.length; i++) {
			if (this.collidableGroups[i] == c) return true;
		}
		return false
	}
}

interface Collidable { //Интерфейс для любого объекта, который может с чем-то столкнуться.
	position: Vector2;
	collisionGroup: CollisionGroup;
	canCollideWith(c: Collidable): boolean; //Проверяет саму возможность коллизии с другим объектом
	collidesWith(c: Collidable): boolean; //Проверяет коллизию по координатам
}

class Obstacle implements Collidable { //Препятствие, элементарно стенка
	constructor(public collisionGroup: CollisionGroup, readonly position: Vector2) {} //Содержит неизменяемый параметр позиции
	canCollideWith(c: Collidable): boolean {
		return c.collisionGroup.canCollideWith( this.collisionGroup );
	}
	collidesWith(c: Collidable): boolean {
		if (!this.canCollideWith(c)) return false; //Проверяем группы коллизий
		return this.position.x==c.position.x && this.position.y==c.position.y; //Проверяем координаты
	}
}

class Door extends Obstacle { //Дверь, убираемое препятствие
	isOpen: boolean = false;
	open(): void {
		this.isOpen = true;
	}
	close(): void {
		this.isOpen = false;
	}
	collidesWith(c: Collidable): boolean {
		if (this.isOpen) return false; //Учитываем если она открыта
		return super.collidesWith(c);
	}
}

abstract class Entity implements Collidable { //Класс объектов, которые могут двигаться
	position: Vector2;
	constructor(public collisionGroup: CollisionGroup) {
		this.position = {x: 0, y:0};
	}
	canCollideWith(c: Collidable): boolean {
		return this.collisionGroup.canCollideWith( c.collisionGroup )
			&& c.collisionGroup.canCollideWith( this.collisionGroup ); //В данном случае проверяем коллизию обоюдно
	}
	collidesWith(c: Collidable): boolean {
		if (!this.canCollideWith(c)) return false;
		return this.position.x==c.position.x && this.position.y==c.position.y;
	}
	abstract move(delta?): void;
}

class Bot extends Entity { //Болванки в которые можно стрелять
	health: number;
	constructor(public collisionGroup: CollisionGroup, hp: number) {
		super(collisionGroup);
		this.health = hp;
	}
	move(delta: Vector2): void { 
		this.position.x = this.position.x+delta.x;
		this.position.y = this.position.y+delta.y;
	}
}

class PlayerCharacter extends Bot { //Персонажи игроков, которые могут стрелять
	private bulletCollisionGroup: CollisionGroup;
	constructor(public collisionGroup: CollisionGroup, hp: number, bulletCollisionGroup: CollisionGroup) {
		super(collisionGroup, hp);
		this.bulletCollisionGroup = bulletCollisionGroup; //Группа коллизий для пуль, которые игрок выстреливает
	}
	shoot(dir: Vector2) {
		let bul = new Bullet(this.bulletCollisionGroup, dir);
		bul.position = this.position;
		return bul;
	}
	open(door: Door) {
		door.open();
	}
	close(door: Door) {
		door.close();
	}
}

class Bullet extends Entity { //Класс пули, которыми стреляют игроки
	private velocity: Vector2;
	constructor(public collisionGroup: CollisionGroup, vel: Vector2) {
		super(collisionGroup);
		this.velocity = vel;
	}
	move(): void {
		this.position.x = this.position.x+this.velocity.x;
		this.position.y = this.position.y+this.velocity.y;
	}
	hit(target: Bot) {
		target.health = target.health - 1;
	}
}

let cGroupWalls = new CollisionGroup("walls");
let cGroupBots = new CollisionGroup("bots");
let cGroupPlayers = new CollisionGroup("players");
let cGroupBullets = new CollisionGroup("bullets");

cGroupBullets.collidableGroups[0] = cGroupBots; //Пули попадают по ботам
cGroupBullets.collidableGroups[1] = cGroupWalls; //Пули попадают по стенам

cGroupPlayers.collidableGroups[0] = cGroupBots; //Игроки сталкиваются с ботами
cGroupBots.collidableGroups[0] = cGroupPlayers;

cGroupPlayers.collidableGroups[1] = cGroupPlayers; //Игроки сталкиваются друг с другом

cGroupPlayers.collidableGroups[1] = cGroupWalls; //Игроки и боты сталкиваются со стенами
cGroupBots.collidableGroups[0] = cGroupWalls;

for (let i = 0; i < 10; i++) { //Создаём вертикальную стену
	new Obstacle(cGroupWalls, {x: 5, y: i})
}
let bot = new Bot(cGroupBots, 10)
bot.position = {x: 6, y: 0}
let player = new PlayerCharacter(cGroupPlayers, 10, cGroupBullets);
let bullet = player.shoot({x:0, y:1}) //Стреляет вверх

