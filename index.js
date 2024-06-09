import { AppRegistry, Linking } from "react-native"
import App from "./App"
import { name as appName } from "./app.json"
import { defaultPublicationsPreferences as publicationsLabels } from "./Constants"
import BackgroundFetch from "react-native-background-fetch"
import { Parser, DomHandler, DomUtils } from "htmlparser2"
import { MMKV } from 'react-native-mmkv'
import notifee, { AndroidImportance, AndroidVisibility, EventType } from "@notifee/react-native"

notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log("BackgroundEvent", { type, detail })
  
  const { notification, pressAction } = detail
  if (type === EventType.ACTION_PRESS || type === 1 || pressAction?.id === "open") {
    // console.log("BackgroundEvent", "OPEN")
    // @ts-ignore
    await Linking.openURL(notification?.data.link)

    // @ts-ignore
    await notifee.cancelNotification(notification?.id)
  }
})

notifee.onForegroundEvent(async ({ type, detail }) => {
  console.log("ForegroundEvent", { type, detail })
  
  const { notification, pressAction } = detail
  if (type === EventType.ACTION_PRESS || type === 1 || pressAction?.id === "open") {
    // console.log("ForegroundEvent", "OPEN")
    // @ts-ignore
    await Linking.openURL(notification?.data.link)

    // @ts-ignore
    await notifee.cancelNotification(notification?.id)
  }
})

function fetchPublications(label)  {
  let defaultContent = {
    title: label.label,
    body: "Fetch failed 0",
    link: label.url
  }

  return new Promise((resolve, reject) => {
    fetch(label.url)
  .then(async r => {
    const html = await r.text()
    const handler = new DomHandler((error, dom) => {
      if (error) return defaultContent
  
      const publications = DomUtils.findOne(elem => elem.attribs && elem.attribs.class === "panel-group", dom)
      if (!publications) return resolve({ ...defaultContent, body: "Fetch failed 1" })
  
      // @ts-ignore
      const latestPublicationTitleEl = DomUtils.findOne(elem => elem.attribs.class === "panel-title", publications.children[0].children)
      if (!latestPublicationTitleEl) return resolve({ ...defaultContent, body: "Fetch failed 2" })
  
      const title = label.label
      const body = DomUtils.textContent(latestPublicationTitleEl).replace(/\n|\t/g, "") || ""
      const link = DomUtils.getAttributeValue(latestPublicationTitleEl, "href") || label.url
    
      resolve({ title, body, link })
    })
  
    const parser = new Parser(handler)
    parser.write(html)
    parser.end()
  })
  .catch(error => {
    console.log({catchError: error})
    resolve({ ...defaultContent, body: "Fetch failed 3" })
  })
  })
}

async function createNotificationChannelId() {
  return await notifee.createChannel({
    id: "default",
    name: "Default Channel",
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
  })
}

async function displayNotification({ title, body, link }) {
  const channelId = await createNotificationChannelId()
  await notifee.displayNotification({
    title,
    body,
    data: { link: link || "https://www.flsh.umi.ac.ma/?page_id=2422" },
    android: {
      channelId,
      timestamp: Date.now(),
      showTimestamp: true,
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      // actions: [
      //   {
      //     title: 'فتح',
      //     pressAction: {
      //       id: "open",
      //     }
      //   }
      // ]
    },
  })
}

async function headlessFetchPublications({ taskId, timeout: isTimeout }) {
  if (isTimeout) {
    displayNotification({ title: "Notification", body: "[BackgroundFetch] Headless TIMEOUT at: " + new Date().toLocaleTimeString() })
    BackgroundFetch.finish(taskId)
    return
  }

  publicationsLabels.forEach(async publicationsLabel => {
    console.log('asdf111')
    const isReadPublicationsSet = storage.contains("read-publications")
    if (isReadPublicationsSet) {
      const readPublications = JSON.parse(storage.getString("read-publications") || "")
      const unReadPublications = []

      if (readPublications.length < 1) {
        return fetchPublications(publicationsLabel).then((publicationContent) => {
          displayNotification(publicationContent)
        })
      }

      fetchPublications(publicationsLabel).then((publicationContent) => {
        readPublications.filter(readPublication => {
          const isPublicationRead = readPublication.link === publicationContent.link
          if (!isPublicationRead) unReadPublications.push(publicationContent)
        })
      })
    }
  })

  BackgroundFetch.finish(taskId)
}

export const storage = new MMKV()

AppRegistry.registerComponent(appName, () => App)

BackgroundFetch.registerHeadlessTask(headlessFetchPublications)
