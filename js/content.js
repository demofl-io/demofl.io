chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // console.log(
    //     sender.tab
    //         ? "from a content script:" + sender.tab.url
    //         : request.message + " from the extension"
    // );
    // chrome.runtime.sendMessage({ action: "newtab", message: `Opened in new tab` }, function (response) {
    //     console.log(`Opened in new tab message sent`);
    //   });

    //   var div = document.createElement('div');
    //    div.id = "toto424242"
    //    div.innerHTML = `
    //     HELLOOOOOOO
    //   `;
    //    document.body.prepend(div);
});