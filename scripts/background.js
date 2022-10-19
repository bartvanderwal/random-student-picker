chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({
        text: "UIT",
    })
})

chrome.action.onClicked.addListener(async (tab) => {
    const urlPrefix = 'https://isas.han.nl'
    const localhost = 'http://localhost'
    console.log("tab.url: ", tab.url)

    if (tab.url.startsWith(urlPrefix) || tab.url.startsWith(localhost)) {
      // Retrieve the action badge to check if the extension is 'AAN' or 'UIT'
      const prevState = await chrome.action.getBadgeText({ tabId: tab.id })
      // Next state will always be the opposite
      const nextState = prevState === 'AAN' ? 'UIT' : 'AAN'
  
      // Set the action badge to the next state
      await chrome.action.setBadgeText({
        tabId: tab.id,
        text: nextState,
      })

      scripting.executeScript( {
        target: {tabId: tab.id},
        files: ['index.js'],
      },() => { console.log('script executed (?)') }) 

      if (nextState === "AAN") {
        // Insert the CSS file when the user turns the extension on
        await chrome.scripting.insertCSS({
          files: ["css/style.css"],
          target: { tabId: tab.id },
        })
      } else if (nextState === "UIT") {
        // Remove the CSS file when the user turns the extension off
        await chrome.scripting.removeCSS({
          files: ["css/style.css"],
          target: { tabId: tab.id },
        })
      }
    } else {
        console.log(`De iSAS pick random student plugin werkt alleen op url's met prefix '${urlPrefix}', niet op '${tab.url}'.`)
    }
  })
