const canvas = document.querySelector('#canvas')

const c = canvas.getContext('2d')


canvas.setAttribute('width', '500')
canvas.setAttribute('height', '500')

const wallWidth = 30
const innerWidth = canvas.width - 2 * wallWidth

var keys = new Array()


c.fillRect(0, 0, wallWidth, canvas.height)
c.fillRect(canvas.width - wallWidth, 0, wallWidth, canvas.height)

heighestPlatform = 0

function first(array) {
	return array[0]
}

function last(array) {
	return array[array.length - 1]
}


class Platform
{
	static heighestPlatform = 0
	static platformsRemoved = 0
	
	static checkHeightDifference = function()
	{
		if ((last(platforms)).y > Math.random() * 150 + 100) {
			platforms.push(new Platform(5))
		}
		if ((first(platforms)).y > canvas.height) {
			platforms.shift()
			Platform.platformsRemoved++
		}
	}
	
	constructor(y)
	{
		this.y = y || canvas.height - (Math.random() * 75 + 75) - heighestPlatform 
		this.width = Math.random() * (canvas.width / 4) + canvas.width / 4
		this.x = Math.random() * (innerWidth - this.width) + wallWidth
		heighestPlatform = canvas.height - this.y
	}

	update = function()
	{
		Platform.checkHeightDifference()
		
		this.draw()
	}
	
	draw = function()
	{
		c.fillRect(this.x, this.y, this.width, 10)
	}
}


class Player
{
	constructor(radius)
	{
		this.radius = radius
		this.x = canvas.width / 2
		this.y = canvas.height - this.radius
		this.dx = 0
		this.dy = 0
		this.maxAcceleration = 22
		this.heightForSlide = canvas.height * 2 / 5
		this.landed = true
		this.aboveGround = false
		this.pointsByPlatform = 0
		this.slidingSpeed = 0
		this.upArrowFramesCounter = 0
	}
	
	update = function()
	{
		if (this.upArrowFramesCounter > 0) {
			this.upArrowFramesCounter--
		}
		
		if (keys['ArrowLeft']) {
			this.dx -= 0.25
		}
		else if (keys['ArrowRight']) {
			this.dx += 0.25
		}
		
		if (keys['ArrowUp'] && this.landed) {
			this.dy -= 12
			this.landed = false
			this.upArrowFramesCounter = 15
		}
		else if (!this.landed) {
			if (this.upArrowFramesCounter > 0 && keys['ArrowUp']) {
				this.dy -= 0.1
			}
			else {
				this.dy += 1
			}
		}
		else if (!keys['ArrowLeft'] && !keys['ArrowRight'] && !keys['ArrowUp'] && this.landed) {
			if (this.dx > 0)
				this.dx -= 0.5
			
			else if (this.dx < 0)
				this.dx += 0.5
		}
		
		if (this.aboveGround && this.y + this.radius > canvas.height) {
			game.end(this.pointsByPlatform)
		}
		
		if (this.dx >= this.maxAcceleration)
			this.dx = this.maxAcceleration
		
		else if (this.dx <= -1 * this.maxAcceleration)
			this.dx = -1 * this.maxAcceleration
		
		
		if (this.y > canvas.height - this.radius) {
			if (!this.aboveGround) {
				this.landed = true
				this.y = canvas.height - (this.radius)
				this.dy = 0
				//this.y = 0
			}
			else {
				//console.log('Lose')
			}
		}
		
		if (this.x < wallWidth + this.radius) {
			this.dx = 0
			this.x = wallWidth + this.radius
		}
		else if (this.x > canvas.width - (wallWidth + this.radius)) {
			this.dx = 0
			this.x = canvas.width - (wallWidth + this.radius)
		}
		
		this.x += this.dx
		
		if (!this.landed)
			this.y += this.dy
		
		this.checkCollision()
		this.screenSlide()
		this.updatePoints()
		this.draw()
	}
	
	draw = function()
	{
		c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
		c.fill()
	}
	
	checkCollision = function()
	{
		let i = 0
		for (i; i < platforms.length; i++) {
			if (this.x > platforms[i].x &&
			   	this.x < platforms[i].x + platforms[i].width &&
			   	this.dy > 0 &&
				this.y + this.radius > platforms[i].y &&
				
					this.y <= platforms[i].y + 3) {
					this.y = platforms[i].y - this.radius
					this.landed = true
					this.dy = 0
					this.platform = i
					this.pointsByPlatform = i + Platform.platformsRemoved
			}
		}
		
		if (this.platform != undefined) {
			if (platforms[this.platform] != undefined &&
				(this.x < platforms[this.platform].x ||
				this.x > platforms[this.platform].x + platforms[this.platform].width)) {

					this.landed = false
					//this.platform = null
			}
		}
	}
	
	screenSlide = function()
	{
		//console.log(this.heightForSlide)
		this.slideBy = this.heightForSlide - this.y
		this.slidingSpeed = Platform.platformsRemoved * 0.01
		
		if (this.aboveGround) {
			this.y += this.slidingSpeed
			
			let i = 0
			for (i; i < platforms.length; i++) {
				platforms[i].y += this.slidingSpeed
			}
		}
		
		if (this.slideBy > 0 && this.dy < 0) {
			let i = 0
			
			for (i; i < platforms.length; i++) {
				platforms[i].y -= this.dy
			}
			this.aboveGround = true
		}
		//console.log(Platform.platformsRemoved)
	}
	
	updatePoints = function()
	{
		c.font = '28px Arial';
		c.fillText('points: ' + this.pointsByPlatform, canvas.width - 170, canvas.height - 15);
	}
}


class Game
{
	constructor()
	{
		this.points = 0
		
		if (!this.gameStarted || this.gameStarted == undefined) {
			this.start()
		}
	}
	
	update = function()
	{
		if (this.gameStarted) {
			c.beginPath()
			c.clearRect(wallWidth, 0, canvas.width - wallWidth * 2, canvas.height)
			
			platforms.forEach(function(platform) {
				platform.update()
			})
			player.update()
		}
		else if (keys['r'] || keys['R']) {
			this.reset()
		}
	}
	
	start = function()
	{
		heighestPlatform = 0
		this.gameStarted = true
		while (heighestPlatform <= canvas.height) {
			platforms.push(new Platform)
		}
		
		c.fillRect(0, 0, wallWidth, canvas.height)
		c.fillRect(canvas.width - wallWidth, 0, wallWidth, canvas.height)
	}
	
	reset = function()
	{
		player = new Player(20)
		platforms = new Array()
		this.start()
	}
	
	end = function(points)
	{
		this.gameStarted = false
		
		c.beginPath()
		c.clearRect(0, 0, canvas.width, canvas.height)
		c.font = '68px Arial'
		c.textAlign = 'center'
		c.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 40)
		c.font = '40px Arial'
		c.textAlign = 'center'
		c.fillText('You have reached', canvas.width / 2, canvas.height / 2 + 10)
		c.fillText('platform ' + points, canvas.width / 2, canvas.height / 2 + 55)
		c.font = '30px Arial'
		c.textAlign = 'center'
		c.fillText('Press r to reset', canvas.width / 2, canvas.height / 2 + 100)
	}
}


let platforms = new Array()
let player = new Player(20)
let game = new Game()


function animate()
{
	requestAnimationFrame(animate)
	
	game.update()
}

window.addEventListener('keydown', function(e) {
	keys[e.key] = true
})

window.addEventListener('keyup', function(e) {
	keys[e.key] = false
})

animate()