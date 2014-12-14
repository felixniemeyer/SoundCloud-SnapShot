var log = "";
var queue = [];

chrome.runtime.onMessage.addListener(handleDownloadRequest);
chrome.downloads.onChanged(handleDownloadStateChange);

function handleDownloadRequest(request, sender, sendResponse)
{
	if(request.action == "soundcloud_snapshot_download")
		new TrackDownload(request.filename, request.download_url);
}

function handleDownloadStateChange(delta)
{
	if(delta.id == activeDownload.id)
	{
		if(delta.error)
		{
			log += "error while downloading " + download.filename + "\n";
			if(activeDownload.attemp < 2)
			{
				log += "\t retrying(" + activeDownload.attemp + ") to download" + dowload.filename + "\n";
				queue.push(activeDownload);
			}
			workOffQueue();
		}
		if(delta.endTime)
		{
			log += delta.endTime": finished " + download.filename + "\n";
			workOffQueue();
		}
	}
}

function addToDownloadQueue(download)
{
	queue.push(download);
	if(queueFinished)
	{
		log = "";
		queueFinished = false;
		workOffQueue();
	}
}

function workOffQueue()
{
	if(queue.length > 0)
	{
		download = queue.shift();
		download.attemp += 1;
		chrome.downloads.download({
			url : download.url,
			filename : download.filename,
			conflictAction : "overwrite"
		}, function getDownloadId(downloadId){
			if(downloadId)
			{	
				download.id = downloadId;
				activeDownload = download;
			}
			else
			{
				log += "Can't create download for " + download.filename + "\n";
				workOffQueue();
			}
		});
	}
	else
	{
		queueFinished = true;
		finished();
	}
}

function finished()
{
	//send log to tabs
}

function TrackDownload(filename, url)
{
	this.attemp = 0;
	this.url = url;
	this.filename = filename;
	this.id = undefined;
	addToDownloadQueue(this);
}