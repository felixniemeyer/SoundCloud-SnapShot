console.log("begin of background page");

function Profile()
{
	this.tabs = {};
	this.urlVsUserId = {};
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

		chrome.tabs.onUpdated.addListener(function(tabId, change, tab){
			if(tab.url.indexOf("https://soundcloud.com/") != -1)
			{
				if( ! (this.tabs[tabId] && this.tabs[tabId].currentUrl == tab.url) ) 
					this.handleUrlChange(tabId, tab.url);
			}
		}.bind(this));

		chrome.tabs.onRemoved.addListener(function(tabId, info){
			if(tabId in this.tabs)
				delete this.tabs[tabId];
		}.bind(this));
	},

	handleUrlChange : function(tabId, newUrl)
	{
		var tab, newId;
		if(!this.tabs[tabId]) 
			this.tabs[tabId] = {};
		this.tabs[tabId].currentUrl = newUrl;
		if(newId = this.urlVsUserId[newUrl])
			this.setUserId(tabId, newId);
	},

	handleProfileRequest : function(details)
	{
		var rqHeaders = details.requestHeaders;
		var userId = details.url.substr(59).split("?")[0];
		var tabId = details.tabId;
		var returnHeaders = null;

		if(!this.tabs[tabId])
			this.tabs[tabId] = {};

		if(this.tabs[tabId].currentUrl)	
			this.urlVsUserId[this.tabs[tabId].currentUrl] = userId;

		if(this.getValueFromHeader(rqHeaders, "scss_sent_from") == "cs")
		{
			if( undefined === (returnHeaders = this.tabs[tabId].headersTemplate )  )
				return { cancel : true };
		}
		else
		{
			this.setUserId(tabId, userId);
			this.tabs[tabId].headersTemplate = returnHeaders = rqHeaders;
		}
		
		return { requestHeaders: returnHeaders };
	},

	getValueFromHeader : function(header, key)
	{
		var i;
		for(i = 0; i < header.length; i++)
		{
			if(header[i].name == key) 
				return header[i].value;
		}
	},

	setUserId : function(tabId, userId)
	{
		if(this.tabs[tabId].userId != userId)
			this.broadcastUserIdChanged(tabId, userId);
		this.tabs[tabId].userId = userId;
	},

	broadcastUserIdChanged : function(tabId, userId)
	{
		chrome.tabs.sendMessage(tabId, {
			event : "user_id_change",
			newUserId : userId
		});
	}
}

console.log("entering background page");
var profile1 = new Profile();