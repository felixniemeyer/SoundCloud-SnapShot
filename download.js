var log = "";
var queue = [];
var queueFinished = true;
var delayOnError = 500;

var progress = {};

chrome.runtime.onMessage.addListener(handleDownloadRequest);
chrome.downloads.onChanged.addListener(handleDownloadStateChange);

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
			log += "error while downloading " + activeDownload.filename;
			if(activeDownload.attemp < 3)
			{
				log += " -> retrying (" + activeDownload.attemp + ")\n";
				queue.push(activeDownload);
			}
			else
			{
				log += " -> finally failed\n";
				addProgress(0,1,0);
			}
			setTimeout(function delayDownload(){ workOffQueue(); }, delayOnError);
			delayOnError *= 2; //Making wait longer and longer on continious error: calm server
		}
		else if(delta.endTime)
		{
			delayOnError = 500; //reset delay on error when successfull download
			log += delta.endTime.current + ": finished " + download.filename + "\n";
			addProgress(0,0,1);
			workOffQueue();
		}
	}
}

function addToDownloadQueue(download)
{
	queue.push(download);
	if(queueFinished) //only push download to queue or start processing queue?
	{
		log = "";
		resetProgress();
		queueFinished = false;
		workOffQueue();
	}
	addProgress(1,0,0);
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
				addProgress(0,1,0);
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
	console.log("Displaying log: " + log);
	console.log("Stats: " + progress.failed + " failed, " + progress.succeeded + " succeeded. " + progress.total + " total");
}

function addProgress(total, failed, succeeded)
{
	progress.total 		+= total;
	progress.failed 	+= failed;
	progress.succeeded 	+= succeeded;
	broadcastProgress();
}

function resetProgress()
{
	progress.total = 0;
	progress.failed = 0;
	progress.succeeded = 0;
	broadcastProgress();
}

function broadcastProgress()
{
	//to be implemented
}

function TrackDownload(filename, url)
{
	this.attemp = 0;
	this.url = url;
	this.filename = filename;
	this.id = undefined;
	addToDownloadQueue(this);
}