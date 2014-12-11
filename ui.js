var download = null;

function startDownload()
{
	var number = parseInt(document.getElementById("numSelector").value, 10);
	var ignoreStreams = document.getElementById("hqCheckbox").checked;
	var target = document.getElementById("directoryBox").value;
	var user_id;
	
	if( ( user_id = getUserId() ) != 0)
	{
		download = new Download(user_id, number, target, ignoreStreams);
		download.setOnFinished(downloadFinished);
		download.start();
	}
	else
	{
		alert("update the extension!");
	}
}

function downloadFinished()
{

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
	document.getElementById("downloadMenu").style.display = downloadMenuActive ? "block" : "none";
}

function injectUi()
{
	var dialogueButton = buildButton();
	
	document.body.appendChild(buildButton());
	document.body.appendChild(buildMenu());	
}

function buildButton()
{
	var dialogueButton = document.createElement("a");
	dialogueButton.id = "dialogueButton";

	dialogueButton.addEventListener("click", toggleMenu);
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
	menu.style.display = "none";
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
