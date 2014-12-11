var global_debug_var = null;

function Download(user_id, number, target, ignoreStreams)
{
	alert("user_id: " + user_id + " number: " + number + " target: " + target + " ignoreStreams: " + ignoreStreams);
	this.user_id = user_id;
	this.number = number;
	this.target = target;
	this.ignoreStreams = ignoreStreams;
	this.req = null;
	this.onFinished = null;
}

Download.prototype = {
	start : function()
	{
		this.getTrackIds(this.user_id);
	},

	setOnFinished : function(callback)
	{
		this.onFinished = callback;
	},

	buildTrackIdsFromJSON : function(jsonResponse)
	{
		global_debug_var = jsonResponse;
	},

	getTrackIds : function(user_id)
	{
		this.req = new XMLHttpRequest();
		this.req.onreadystatechange = function(){
			if(this.req.readyState === 4) this.buildTrackIdsFromJSON(JSON.parse(this.req.responseText));
		}.bind(this);
		this.req.open( "GET", "https://api-v2.soundcloud.com/profile/soundcloud%3Ausers%3A87797858?limit=10&offset=0&linked_partitioning=1", true);
		this.req.send( null );

		/*
		GET /profile/soundcloud%3Ausers%3A6043858?offset=4743730270614585344AY9Lx8AKMquclq4k6&limit=50 HTTP/1.1
		Host: api-v2.soundcloud.com
		Connection: keep-alive
		Pragma: no-cache
		Cache-Control: no-cache
		Accept: application/json, text/javascript, ; q=0.01
		Origin: https://soundcloud.com
		User-Agent: Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36
		Referer: https://soundcloud.com/
		Accept-Encoding: gzip, deflate, sdch
		Accept-Language: de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4 */

	}
}