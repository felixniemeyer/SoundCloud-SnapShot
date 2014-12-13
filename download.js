chrome.runtime.onMessage.addListener(handleDownloadRequest);

function handleDownloadRequest(request, sender, sendResponse)
{
	if(request.action == "soundcloud_snapshot_download")
	{
		chrome.downloads.download({
			url : request.download_url,
			filename : request.filename,
			conflictAction : "overwrite"
		});
	}
}