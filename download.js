var log = "";
var queue = [];
var queueFinished = true;
var delayOnError = 20000
var delayBeforeNextDownload = 0;

var activeDownloads = {};
var numberOfStartedDownloads = 0;

var progress = {};


chrome.runtime.onMessage.addListener(handleDownloadRequest);
chrome.downloads.onChanged.addListener(handleDownloadStateChange);


function handleDownloadRequest(request, sender, sendResponse)
{
	if(request.action == "scss_track_download")
		new TrackDownload(request, sender.tab);
	if(request.action == "scss_start_download")
		workOffQueue();
}

function succeedDownload(download)
{
	numberOfStartedDownloads--;
	log += "Completed " + download.trackTitle + "\n";
	addProgress(download, 0, 0, 1);
	workOffQueue();
}

function failDownload(message, download, retry)
{
	numberOfStartedDownloads--;
	log += message + ": " + download.trackTitle + "\n";
	if(download.id)
		delete activeDownloads[download.id];

	if(download.attemp < 3 && retry)
	{
		log += " -> retrying (" + download.attemp + ")\n";
		download.id = undefined;
		queue.push(download);
	}
	else
	{
		log += " -> finally failed\n";
		addProgress(download, 0, 1, 0);
	}
	delayBeforeNextDownload += delayOnError;
	workOffQueue();
}

function startDownload(download)
{
	numberOfStartedDownloads++;
	var url;
	var forceStream = true;
	if(download.dlMode == "stream" || forceStream)
	{
		url = "https://api.soundcloud.com/i1/tracks/" + download.trackId + "/streams?client_id=b45b1aa10f1ac2941910a7f0d10f8e28&app_version=cefbe6b";
		download.urlReq = new XMLHttpRequest();
		download.urlReq.onreadystatechange = function(){
			if(download.urlReq.readyState == 4) 
			{
				if(download.urlReq.status = 200)
					getFile(JSON.parse(download.urlReq.responseText), download);
				else
					failDownload("failed to get file URL for track", download, true);
			}
		};
		try
		{
			download.urlReq.open( "GET", url, true);
			download.urlReq.send( null );
		}
		catch(e)
		{
			failDownload("failed due to network problems", download, true);
		}
	}
}

function getFile(urlJson, download)
{
	var url;
	if( (url = urlJson["http_mp3_128_url"]) )
	{

		chrome.downloads.download({
			url : url,
			filename : download.dlDirectory + download.trackTitle.replace(/[\\\/:\*\?"<>\|]/gi, '_') + ".mp3",
			conflictAction : "overwrite"
		}, function getDownloadId(downloadId){
			if(downloadId)
			{	
				download.id = downloadId;
				activeDownloads[downloadId] = download;
			}
			else
				failDownload("Can't create download for", download, true);
		});
	}
	else
	{
		failDownload("Skipped because no http_mp3_123_url available", download, false);
	}
}

function handleDownloadStateChange(delta)
{
	var activeDownload;
	if(delta.state && (activeDownload = activeDownloads[delta.id]) ) 
	{
		if(delta.state.current == "complete")
			succeedDownload(activeDownload);
		else if(delta.state.current == "interrupted")
			failDownload("Error on download state change", activeDownload, true);
	}
}

function addToDownloadQueue(download)
{
	queue.push(download);
	addProgress(download, 1, 0, 0);
}

function workOffQueue()
{
	if(delayBeforeNextDownload == 0)
	{
		if(numberOfStartedDownloads < 6) //max 5 downloads in parallel
		{
			if(queue.length > 0)
			{
				download = queue.shift();
				download.attemp += 1;
				startDownload(download);		
				workOffQueue();
			}
		}
	}
	else
	{
		if(numberOfStartedDownloads == 0) //wait until all downloads come back (fail or succeed)
		{
			var temp = delayBeforeNextDownload;
			delayBeforeNextDownload = 0;
			setTimeout(workOffQueue, temp);
		}
	}
}

function finished()
{
	console.log("Displaying log: " + log);
	console.log("Stats: " + progress.failed + " failed, " + progress.succeeded + " succeeded. " + progress.total + " total");
}

function addProgress(download, total, failed, succeeded)
{
	if(!progress[download.tab])
		progress[download.tab] = {};
	if(!progress[download.tab][download.origin])
		progress[download.tab][download.origin] = {
			total : 0,
			failed : 0,
			succeeded : 0
		};
	
	var p = progress[download.tab][download.origin];

	p.total 	+= total;
	p.failed 	+= failed;
	p.succeeded += succeeded;
	
	broadcastProgress(progress[download.tab], download.tab);
}

function broadcastProgress(tabProgress, tabId)
{
	chrome.tabs.sendMessage(tabId, {
		event : "progress_change",
		progress : tabProgress
	});
}

function TrackDownload(info, tabInfo)
{
	this.trackId = info.trackId;
	this.trackTitle = info.trackTitle;
	this.dlDirectory = info.dlDirectory;

	this.attemp = 0;
	this.id = undefined;

	//for dynmaically managing progress per tab and profile
	this.tab = tabInfo.id;
	var urlSplit = tabInfo.url.split("/");
	this.origin = urlSplit[urlSplit.length - 1];

	addToDownloadQueue(this);
}