var animations = [];

function addAnimation(animation)
{
	animations.push(animation);
	if(animations.length === 1) requestAnimationFrame(update);
}

function update()
{
	var i, finishedAnimations = [];
	for(i = 0; i < animations.length; i++)
		if(!animations[i].update())
			finishedAnimations.push(animations[i]);

	for(i = 0; i < finishedAnimations.length; i++)
		animations.splice(animations.indexOf(finishedAnimations[i]),1);

	if(animations.length > 0)
		requestAnimationFrame(update)
}

function Animation(element, attributeName, unit, onFinished, value0, value1, duration, delay)
{
	delay = delay || 0;
	this.element = element;
	this.attributeName = attributeName;
	this.unit = unit;
	this.start = delay + Date.now();
	this.end = delay + duration + Date.now();
	this.value0 = value0;
	this.value1 = value1;
	addAnimation(this);
}

Animation.prototype = {
	update : function(){
		var now = Date.now();
		if(now > this.end)
		{
			this.element[this.attributeName] = this.value1 + this.unit;
			return false;
		}
		else if(now > this.start)
		{
			var x = (now-this.start)/(this.end - this.start);
			var progress = 1 - Math.pow(x - 1, 2);
			this.element[this.attributeName] = (this.value0 * (1-progress) + this.value1 * (progress)) + this.unit;
			return true;
		}
	}
}

