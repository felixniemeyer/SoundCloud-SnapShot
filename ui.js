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
	dialogueButton.className = "header__logo";
	dialogueButton.id = "dialogueButton";
	
	var link = document.createElement("a");
	link.className = "header__logoLink sc-border-box sc-ir";
	link.addEventListener("click", toggleMenu);

	dialogueButton.appendChild(link);		

	return dialogueButton;
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
		if(track.type = "track")
			addTrackDiv(content, [i], track, 0);
		else if(track.type = "list")
		{
			list = track.list;
			for(j = 0; j < list.length; j++)
				addTrackDiv(content, [i, j], track, 40);
		}
	}
	//make list with tracks / plalists: each with name (shortened: "..."), checkbox. Checkbox als grafik, onclick: toggleSelection([id1,id2]) => updated event.sender.grafik + tracks[id1].selected
	//subtracks have bigger left
}

function addTrackDiv(content, ids, track, left)
{
	var trackDiv = document.createElement("div");
	trackDiv.className = "trackDiv";
	trackDiv.addEventListener("click", function(){toggleSelection(event.target, ids[0], ids[1])});
	trackDiv.style.marginLeft = left + "px";
	trackDiv.style.width = (300 - 16 - 6 - 29 - left) + "px";
	trackDiv.innerText = track.name;
	setTrackDivBg(trackDiv, track.selected);
	content.appendChild(trackDiv);
}

function toggleSelection(trackDiv, trackId, listId)
{
	var track;
	if(listId)
		track = download.tracks[listId].list[trackId];
	else
		track = download.tracks[trackId];
	setTrackDivBg(trackDiv, track.selected = !track.selected);
}

function setTrackDivBg(trackDiv, selected)
{
	var url = chrome.extension.getURL(selected ? "./img/selected.png" : "./img/deselected.png");
	trackDiv.style.backgroundImage = "url('" + url + "')";
}

function buildDownloadButton()
{
	var div = document.createElement("div");
	div.className = "sc-button sc-button-cta";
	div.id = "downloadButton";
	div.innerHTML = "Download!";
	div.addEventListener("click", startDownload);
	return div;
}

function startDownload()
{
	download.downloadTracks("./SoundCloudSnapShot/");
}

injectUi();
