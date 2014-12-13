console.log("begin of background page");

function Profile()
{
	this.requestTemplate = null;
	this.setUpRequestEventListener();
}

Profile.prototype = 
{
	setUpRequestEventListener : function()
	{	
		chrome.webRequest.onBeforeSendHeaders.addListener(
			this.handleProfileRequest.bind(this),
			{urls: ["https://api-v2.soundcloud.com/profile/soundcloud%3Ausers%3A*?limit=*&offset=0&linked_partitioning=1"]},
			["blocking","requestHeaders"]);
	},

	handleProfileRequest : function(details)
	{
		var rq = details.requestHeaders;
		var string;
		for(var key in rq)
		{
			string += rq[key].name + ":\n";
			string += ( rq[key].value || rq[key].binaryValue ) + "\n";
		}

		if(this.requestTemplate === null) //always when origin is soundcloud.com already! => stay up to date, allow tab switches
			this.requestTemplate = details.requestHeaders;
		
		console.log("header treated");

		
		return {requestHeaders: this.requestTemplate};
	}
}

console.log("entering background page");
var profile1 = new Profile();