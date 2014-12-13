var download = null;

function toggleMenu()
{
	var tracklist = document.getElementById("tracklist");
	if( tracklist.undloaded ) 
	{
		tracklist.undloaded = false;
		loadTrackList();
	}
	var enclosingDiv = document.getElementById("enclosingDiv");
	var bndRect = enclosingDiv.getBoundingClientRect();
	enclosingDiv.expanded = !enclosingDiv.expanded;
	new Animation(enclosingDiv.style, "width", "px", null, bndRect.width, enclosingDiv.expanded ? 300 : 84, 400);
	new Animation(enclosingDiv.style, "height", "px", null, bndRect.height, enclosingDiv.expanded ? 600 : 46, 400);
}

function loadTrackList()
{
	var user_id;
	if(user_id = getUserId())
	{
		download = new Download(user_id);
		download.getTrackIdsAsync(fillTrackList);
	}
}

function injectUi()
{
	var enclosingDiv = document.createElement("div");
	enclosingDiv.id = "enclosingDiv";
	enclosingDiv.appendChild(buildButton());
	enclosingDiv.appendChild(buildSelectAllButton());
	enclosingDiv.appendChild(buildSelectNoneButton());
	enclosingDiv.appendChild(buildDownloadButton());
	enclosingDiv.appendChild(buildTrackList());	
	enclosingDiv.expanded = false;
	enclosingDiv.style.width = "84px";
	enclosingDiv.style.height = "46px";

	var logoDiv = document.getElementsByClassName("header__logo left")[0];
	logoDiv.style.position = "relative";
	logoDiv.appendChild(enclosingDiv);
}

function buildButton()
{
	var dialogueButton = document.createElement("div");
	dialogueButton.className = "scss_button";
	dialogueButton.id = "dialogueButton";
	
	var link = document.createElement("a");
	link.style.backgroundImage = "url('" + chrome.extension.getURL("./img/logo.png") + "')";
	link.addEventListener("click", toggleMenu);

	dialogueButton.appendChild(link);		

	return dialogueButton;
}

function buildSelectAllButton()
{
	var allDiv = document.createElement("div");
	allDiv.className = "scss_button"
	allDiv.style.left = "84px";
	allDiv.style.top = "0px";
	allDiv.style.width = (100 - 2) + "px";
	allDiv.innerText = "Select All";
	allDiv.addEventListener("click", function(){setAllTracklistItemsSelected(true)}); 
	return allDiv;
}

function buildSelectNoneButton()
{
	var noneDiv = document.createElement("div");
	noneDiv.className = "scss_button"
	noneDiv.style.left = (84 + 100) + "px";
	noneDiv.style.top = "0px";
	noneDiv.style.width = ((300-84-100) - 2) + "px";
	noneDiv.innerText = "Select None";
	noneDiv.addEventListener("click", function(){setAllTracklistItemsSelected(false)});
	return noneDiv;
}

function setAllTracklistItemsSelected(state)
{
	var i, items = document.getElementsByClassName("tracklist__item");
	for(i = 0; i < items.length; i++) 
		setTrackDivBg(items[i], state);
	download.clearSelection(state);
}

function buildDownloadButton()
{
	var div = document.createElement("div");
	div.className = "scss_button";
	div.id = "downloadButton";
	div.innerText = "Download!";
	div.addEventListener("click", startDownload);
	return div;
}

function buildTrackList()
{
	var div = document.createElement("div");
	div.id = "tracklist";
	div.undloaded = true;
	// init with loading image
	return div;
}

function getUserId()
{
	var metas = document.getElementsByTagName("meta");
	var content, user_id;
	for(var i = 0; i < metas.length; i++)
	{
		if( ( content = metas[i].getAttribute("content") ) && content.substr(0,19) === "soundcloud://users:" )
		{
			user_id = content.substr(19);
			break;
		}
	}
	return user_id;
}

function fillTrackList()
{
	var i, k, track, list;
	var tracks = download.tracks;
	var content = document.getElementById("tracklist");
	for(i = 0; i < tracks.length; i++)
	{
		track = tracks[i];
		if(track.type == "track")
			content.appendChild(buildTrackDiv(track, [i], 0));
		else if(track.type == "list")
			content.appendChild(buildPlaylistDiv(track, i));
	}
	//make list with tracks / plalists: each with name (shortened: "..."), checkbox. Checkbox als grafik, onclick: toggleSelection([id1,id2]) => updated event.sender.grafik + tracks[id1].selected
	//subtracks have bigger left
}

function buildTrackDiv(track, ids, sub)
{
	var trackDiv = document.createElement("div");
	trackDiv.className = "tracklist__item trackDiv";
	trackDiv.addEventListener("click", function(){toggleSelection(event, ids[0], ids[1])});
	trackDiv.style.width = (300 - 16 - 6 - 29 - (sub ? 29 : 0)) + "px";
	trackDiv.innerText = track.name;
	setTrackDivBg(trackDiv, track.selected);
	return trackDiv;
}

function buildPlaylistDiv(playlist, tid)
{
	var playlistDiv = document.createElement("div");
	playlistDiv.className = "tracklist__item playlistDiv";
	playlistDiv.addEventListener("click", function(){toggleSelection(event, tid)});
	playlistDiv.style.width = (300 - 16 - 29 - 29) + "px";
	playlistDiv.expandedHeight = (playlist.list.length + 1) * (23+1) - 1; //23+1 = "width + border"
	playlistDiv.height = playlistDiv.expandedHeight + "px";
	playlistDiv.innerText = "(" + playlist.list.length + ")" + playlist.name
	setTrackDivBg(playlistDiv, playlist.selected);
	
	playlistDiv.appendChild(buildExpandButton());
	for(i = 0; i < playlist.list.length; i++)
		playlistDiv.appendChild(buildTrackDiv(playlist.list[i], [i, tid], true));
	return playlistDiv;
}

function buildExpandButton()
{
	var colExp = document.createElement("div");
	colExp.className = "expandButton";
	colExp.expanded = false;
	colExp.style.backgroundImage = "url('" + chrome.extension.getURL("./img/collapsed.png") + "')"
	colExp.addEventListener("click", togglePlaylistExpansion);
	return colExp;
}

function togglePlaylistExpansion()
{
	var colExp = event.target
	colExp.expanded = !colExp.expanded;
	colExp.style.backgroundImage = "url('" + chrome.extension.getURL(colExp.expanded ? "./img/expanded.png" : "./img/collapsed.png") + "')";
	var playlistDiv = colExp.parentNode;
	new Animation(playlistDiv.style, "height", "px", null, playlistDiv.getBoundingClientRect().height, colExp.expanded ? playlistDiv.expandedHeight : 23, 400);
	event.stopPropagation()
}

function toggleSelection(event, trackId, listId)
{
	var track;
	if(listId)
		track = download.tracks[listId].list[trackId];
	else
		track = download.tracks[trackId];
	setTrackDivBg(event.target, track.selected = !track.selected);
	event.stopPropagation();
}

function setTrackDivBg(trackDiv, selected)
{
	var url = chrome.extension.getURL(selected ? "./img/selected.png" : "./img/deselected.png");
	trackDiv.style.backgroundImage = "url('" + url + "')";
}


function startDownload()
{
	download.downloadTracks("./SoundCloudSnapShot/");
}

injectUi();
