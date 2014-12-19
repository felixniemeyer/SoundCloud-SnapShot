function Download(user_id)
{
	this.user_id = user_id;
	this.req = null;
	this.onFinished = null;
	this.tracks = [];
	this.logString = "";
}

Download.prototype = {

	log : function(line)
	{
		this.logString += line +"\n";
	},

	buildTrackIdsFromJSON : function(jsonResponse)
	{		
		this.tracks = this.extractTracksRec(jsonResponse.collection);
		this.onTrackListReady()
	},

	downloadTracks : function(targetDirectory)
	{
		this.targetDirectory = targetDirectory;
		this.downloadTracksRec(this.tracks);
	},

	downloadTracksRec : function(list)
	{
		var node;
		for(key in list)
		{
			node = list[key];
			if(node.type == "track" && node.selected)
				this.downloadTrack(node, true); //true means force download from stream, loading from official download url causes problems.
			else if(node.type == "list" && node.selected)
				this.downloadTracksRec(node.list);
		}
		chrome.runtime.sendMessage({action : "scss_start_download"});
	},

	downloadTrack : function(track)
	{
		chrome.runtime.sendMessage({
			action : "scss_track_download",
			trackId : track.id,
			trackTitle : track.name,
			dlDirectory : this.targetDirectory
		})
	},

	extractTracksRec : function(inList, isPlaylist)
	{
		var key, node, track, entry, outList = [];
		for(key in inList)
		{
			node = inList[key];
			if(node.type == "track-repost" || node.type == "track" || isPlaylist)
			{
				track = isPlaylist ? node : node.track;
				outList.push({	
					type : "track",
					id : track.id,
					name : track.title,
					dl_mode : this.getDlMode(track),
					selected : true
				});
			}
			else if(node.type == "playlist-repost" ||  node.type == "playlist")
				outList.push({
					type : "list",
					name : node.playlist.title,
					list : this.extractTracksRec(node.playlist.tracks, true),
					selected : false
				});
		}
		return outList;
	},

	getDlMode : function(track)
	{
		if(track.downloadable)
			return "download";
		else if(track.streamable)
			return "stream";
		else 
			return "unavailable";
	},

	getTrackIdsAsync : function(callback)
	{
		this.onTrackListReady = callback;
		this.req = new XMLHttpRequest();
		this.req.onreadystatechange = function(){
			if(this.req.readyState == 4) this.buildTrackIdsFromJSON(JSON.parse(this.req.responseText));
		}.bind(this);
		this.req.open( "GET", "https://api-v2.soundcloud.com/profile/soundcloud%3Ausers%3A"+this.user_id+"?limit=50&offset=0&linked_partitioning=1", true);
		this.req.setRequestHeader("scss_sent_from", "cs");
		this.req.send( null );
	},

	clearSelection : function(state)
	{
		this.clearSelectionRec(this.tracks, state);
	},

	clearSelectionRec : function(list, state)
	{
		var i;
		for(i = 0; i < list.length; i++)
		{
			list[i].selected = state;
			if(list[i].type == "list")
				this.clearSelectionRec(list[i].list, state);
		}
	}
}
