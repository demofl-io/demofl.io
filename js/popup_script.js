var demoFolder = "demos";

// As soon as the popup is loaded, load the demo list
document.addEventListener('DOMContentLoaded', loadDemoList);

// Loading Demo flows (.json files) from the "demos" folder
function loadDemoList() {
  const sel = document.getElementById("stories");

  chrome.runtime.getPackageDirectoryEntry(
    (directoryEntry) => {

      directoryEntry.getDirectory(demoFolder, {}, function (subDirectoryEntry) {
        var directoryReader = subDirectoryEntry.createReader();

        var filenames = [];
        (function readNext() {
          directoryReader.readEntries(function (entries) {
            if (entries.length) {
              for (var i = 0; i < entries.length; ++i) {
                if (!entries[i].isDirectory && entries[i].name.endsWith(".json")) {
                  const opt = document.createElement("option");
                  opt.value = entries[i].name;
                  opt.text = entries[i].name.replace(".json", "");
                  sel.add(opt, sel.options[1]);
                }
              }
              readNext();
            }
          });
        })();
      });
    }
  )
}

// Edit button click event
const editButton = document.getElementById("editstory");
editButton.addEventListener("click", function () {
  console.log("open new page tab");
  chrome.tabs.create({ active: true, url: "http://google.com" });
});

// Step 0 When clicking on the list of demos, open the Json file
const openDemo = document.getElementById("stories");
openDemo.addEventListener("change", function () {
  openJSONFile(this.value);
});

// Load the JSON file
async function openJSONFile(fileName) {
  var flowurl = chrome.runtime.getURL("/" + demoFolder + "/" + fileName);

  await fetch(flowurl).then(async function (response) {
    const data = await response.json();
    await parseDemoFile(data)
  });
}

// Save demo json file into memory
async function saveDemoToLocalStorage(demoData) {

  console.log(demoData);

  // Saving the JSON file into local storage
  await chrome.storage.local.set({ demo: demoData });
}

// Parse demo json file into memory
async function parseDemoFile(demoData) {

  var currentWindowId = chrome.windows.getCurrent().id

  // Loop through the steps
  for (let i = 0; i < demoData.steps.length; i++) {

    let stepTabIds = [];
    let stepWindowId = currentWindowId;

    if (demoData.steps[i].incognito && demoData.steps[i].urls.length > 0) {
      // Create a new incognito window
      console.log("Creating incognito window");
      await chrome.windows.create({ "incognito": true }).then(windownew => {
        // Save the tab id for this url
        stepWindowId = windownew.id;
      });
    }

    // Loop through the urls for this step
    for (let j = 0; j < demoData.steps[i].urls.length; j++) {

      console.log(demoData.steps[i].urls[j]);
      // Create a new tab for this url
      await chrome.tabs.create({ active: false, url: demoData.steps[i].urls[j], windowId: stepWindowId }).then(tab => {
        // Save the tab id for this url
        stepTabIds.push(tab.id);
      });

      // If this is an incognito window, close the first tab
      if (demoData.steps[i].incognito && j == 0) {
        chrome.tabs.query({ windowId: stepWindowId }).then(tabs => {
          chrome.tabs.remove(tabs[0].id);
        });
      }

    }
    // update the demo data with the new tab ids
    demoData.steps[i].tabIds = stepTabIds;

    // If there are tabs for this step, group them together
    if (stepTabIds.length > 0) {
      // Group all these tabs together for this step part
      await chrome.tabs.group({ tabIds: stepTabIds, createProperties: { windowId: stepWindowId } }).then(group => {
        chrome.tabGroups.update(group, { title: demoData.steps[i].title });
      });
    }
  }

  // Save the demo data to local storage along with the new tab ids
  saveDemoToLocalStorage(demoData)
}