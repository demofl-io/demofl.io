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
  try {
    const currentWindow = await chrome.windows.getCurrent();
    let currentWindowId = currentWindow.id;

    for (let i = 0; i < demoData.steps.length; i++) {
      let stepTabIds = [];
      let stepWindowId = currentWindowId;
      
      if (demoData.steps[i].incognito && demoData.steps[i].urls.length > 0) {
        try {
          const windownew = await chrome.windows.create({ 
            incognito: true,
            focused: false
          });
          stepWindowId = windownew.id;
        } catch (error) {
          console.error("Error creating incognito window:", error);
          continue;
        }
      }
      
      // Create all tabs for this step
      for (let j = 0; j < demoData.steps[i].urls.length; j++) {
        try {
          const tab = await chrome.tabs.create({ 
            active: false, 
            url: demoData.steps[i].urls[j], 
            windowId: stepWindowId 
          });
          
          stepTabIds.push(tab.id);

          if (demoData.steps[i].personna) {
            await new Promise((resolve) => {
              chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                if (tabId === tab.id && info.status === 'complete') {
                  chrome.tabs.onUpdated.removeListener(listener);
                  const personaData = demoData.personnas[demoData.steps[i].personna];
                  chrome.tabs.sendMessage(tab.id, {
                    action: "showPersona",
                    persona: personaData
                  }, (response) => {
                    if (chrome.runtime.lastError) {
                      console.error('Error:', chrome.runtime.lastError);
                    }
                    resolve();
                  });
                }
              });
            });
          }
        } catch (error) {
          console.error("Error creating tab:", error);
        }
      }

      // Close the first tab in incognito window if needed
      if (demoData.steps[i].incognito && demoData.steps[i].urls.length > 0) {
        try {
          const tabs = await chrome.tabs.query({ windowId: stepWindowId });
          await chrome.tabs.remove(tabs[0].id);
        } catch (error) {
          console.error("Error closing initial incognito tab:", error);
        }
      }

      // Update the demo data with the new tab ids
      demoData.steps[i].tabIds = stepTabIds;

      // Group tabs if there are any
      if (stepTabIds.length > 0) {
        try {
          const group = await chrome.tabs.group({ 
            tabIds: stepTabIds, 
            createProperties: { windowId: stepWindowId } 
          });
          await chrome.tabGroups.update(group, { 
            title: demoData.steps[i].title 
          });
        } catch (error) {
          console.error("Error grouping tabs:", error);
        }
      }
    }

    // Save the demo data to local storage
    await saveDemoToLocalStorage(demoData);
    
  } catch (error) {
    console.error("Error in parseDemoFile:", error);
    throw error;
  }
}