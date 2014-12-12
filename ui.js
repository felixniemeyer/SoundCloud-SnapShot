var download = null;

function startDownload()
{
	var user_id;
	
	if(user_id = getUserId())
	{
		download = new Download(user_id);
		download.getTrackIdsAsync(buildSelectionList);
	}
	else
	{
		alert("update the extension!");
	}
}

function buildSelectionList()
{
	console.log("entered buildselectionlist");
	download.downloadTracks("./soundcloud snapshot/");
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

function toggleMenu()
{
	downloadMenuActive = !downloadMenuActive;
	var enclosingDiv = document.getElementById("enclosingDiv");
	var bndRect = enclosingDiv.getBoundingClientRect();
	new Animation(enclosingDiv.style, "width", "px", null, bndRect.width, downloadMenuActive ? 300 : 84, 200);
	new Animation(enclosingDiv.style, "height", "px", null, bndRect.height, downloadMenuActive ? 600 : 46, 200);
}

function injectUi()
{
	var enclosingDiv = document.createElement("div");
	enclosingDiv.id = "enclosingDiv";
	enclosingDiv.appendChild(buildButton());

	enclosingDiv.appendChild(buildMenu());	

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

function buildMenu()
{
	var menu = document.createElement("div")
	menu.id = "downloadMenu";
	menu.appendChild(buildNumSelector());
	menu.appendChild(buildHQCheckbox());
	menu.appendChild(buildDirectoryBox());
	menu.appendChild(buildDownloadButton());
	return menu;
}

function buildNumSelector()
{
	var div = document.createElement("div");
	div.className = "setting";
	div.innerHTML = "Number of tracks <input id='numSelector' class='sc-input' type='text' value='10' />";
	return div;
}

function buildHQCheckbox()
{
	var div = document.createElement("div");
	div.className = "setting";
	div.innerHTML = "Download stream when there's no official download <input id='hqCheckbox' type='checkbox' checked='checked' />";
	return div;
}

function buildDirectoryBox()
{
	var div = document.createElement("div");
	div.className = "setting";
	div.innerHTML = "Save to directory Downloads/<input id='directoryBox' class='sc-input'  type='text' value='' />";
	return div;
}

function buildDownloadButton()
{
	var div = document.createElement("div");
	div.className = "setting";
	div.id = "downloadButton";
	div.innerHTML = "Download!";
	div.addEventListener("click", startDownload);
	return div;
}

downloadMenuActive = false;
injectUi();
