import { useEffect, useState } from "react"
import {
  Button,
  Linking,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
} from "react-native"
import Publications from "./components/Publications"
import Bell from "./components/Bell"
import Item from "./components/Item"
import { defaultPublicationsPreferences } from "./Constants"
import BackgroundFetch from "react-native-background-fetch"
import { Parser, DomHandler, DomUtils } from "htmlparser2"
import notifee, { AndroidImportance, AndroidVisibility, AuthorizationStatus, EventType } from "@notifee/react-native"
import { storage } from "."
import { Label, PublicationContent } from "./types"

function App(): React.JSX.Element {
  const [publicationsLabels, setPublicationsLabels] = useState(defaultPublicationsPreferences)
  const [hidePublications, setHidePublications] = useState(true)
  const isDarkMode = useColorScheme() === "dark"
  async function checkNotificationPermission() {
    await notifee.requestPermission()

    const settings = await notifee.getNotificationSettings();
    if (settings.authorizationStatus == AuthorizationStatus.DENIED) {
      checkNotificationPermission()
    }

    BackgroundFetch.start()
  }

  useEffect(() => {
    checkNotificationPermission()
    
    console.log("App started", new Date().toLocaleTimeString())
    BackgroundFetch.configure(
      {
        forceAlarmManager: true,
        stopOnTerminate: false,
        enableHeadless: true, 
        startOnBoot: true,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
        minimumFetchInterval: 15
      },
      async taskId => {
        // console.log("onEvent", new Date().toLocaleTimeString());

        publicationsLabels.forEach(async publicationsLabel => {
          console.log('asdf222')
          const isReadPublicationsSet = storage.contains("read-publications")
          if (isReadPublicationsSet) {
            const readPublications: any[] = JSON.parse(storage.getString("read-publications") || "")
            const unReadPublications: PublicationContent[] = []

            if (readPublications.length < 1) {
              return fetchPublications(publicationsLabel).then((publicationContent: any) => {
                displayNotification(publicationContent)
              })
            }

            fetchPublications(publicationsLabel).then((publicationContent: any) => {
              readPublications.filter(readPublication => {
                const isPublicationRead = readPublication.link === publicationContent.link
                if (!isPublicationRead) unReadPublications.push(publicationContent)
              })
            })
          }
        })

        BackgroundFetch.finish(taskId)
      },
      async (taskId) => {
        console.log("onTimeout", new Date().toLocaleTimeString());
        displayNotification({ title: "Notification test", body: "onTimeout at: " + new Date().toLocaleTimeString() })
        // displayNotification({ title: "Fetching failed", body: "Try again", link: defaultPublicationsPreferences[0].url })
        BackgroundFetch.finish(taskId)
      }
    )
    BackgroundFetch.scheduleTask({
      forceAlarmManager: true,
      stopOnTerminate: false,
      enableHeadless: true,
      startOnBoot: true,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
      taskId: "Scheduled task",
      delay: 0
    })
    BackgroundFetch.start()

    async function initBackgroundFetch() {
      const onEvent = async (taskId: string) => {
        console.log("[BackgroundFetch] task::: ", taskId);
        BackgroundFetch.finish(taskId);
      }
  
      const onTimeout = async (taskId: string) => {
        console.warn("[BackgroundFetch] TIMEOUT task: ", taskId);
        BackgroundFetch.finish(taskId);
      }
  
      await BackgroundFetch.configure({ requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY, minimumFetchInterval: 15 }, onEvent, onTimeout);
    }

    // initBackgroundFetch()

    async function getData() {
      const isPreferencesSet = storage.contains("preferences")
      const isReadPublicationsSet = storage.contains("read-publications")
      if (!isReadPublicationsSet) {
        storage.set("read-publications", "[]")
      }

      if (isPreferencesSet) {
        const userPublicationsPreferences = JSON.parse(storage.getString("preferences") || "")
        setPublicationsLabels(userPublicationsPreferences)
        return
      }

      storage.set("preferences", JSON.stringify(defaultPublicationsPreferences))
      console.log("default publications have been set")
    }

    getData()
  }, [])

  return (<>
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={"black"}
      />
      <Bell setHidePublications={setHidePublications} />
      {publicationsLabels.map(label => <Item key={label.label} publicationsLabels={publicationsLabels} setPublicationsLabels={setPublicationsLabels} label={label}/>)}
      {/* <Button title="عرض أخر إعلان" onPress={() => {
          displayNotification({ title: "Notification test", body: "Button click at: " + new Date().toLocaleTimeString()}})
          // storage.delete("read-publications")
      }}/> */}
    </SafeAreaView>
    <Publications hidePublications={hidePublications} setHidePublications={setHidePublications} />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    gap: 8,
  },
})

async function createNotificationChannelId() {
  return await notifee.createChannel({
    id: "default",
    name: "Default Channel",
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
  })
}

async function displayNotification({ title, body, link } : { title: string, body: string, link?: string }) {
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
      actions: [
        {
          title: 'فتح',
          pressAction: {
            id: "open",
          }
        }
      ]
    },
  })
  const readPublications = JSON.parse(storage.getString("read-publications") || "")
  storage.set("read-publications", JSON.stringify(Array.from(new Set([...readPublications, { title, body, link }]))))
}

function fetchPublications(label: Label)  {
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

// 111 async function fetchPublications() {
//   console.log("[BackgroundFetch HeadlessTask] start: ", new Date().toLocaleTimeString());
//   const label = defaultPublicationsPreferences[0]
//   let content = {
//     title: label.label,
//     body: "Failed 0",
//   }

//   const handler = new DomHandler((error, dom) => {
//     if (error) return displayNotification(content)
//     const publications = DomUtils.findOne(elem => elem.attribs && elem.attribs.class === "panel-group", dom)
//     if (!publications) return displayNotification(content)
//     // @ts-ignore
    
//     const latestPublicationTitleEl = DomUtils.findOne(elem => elem.attribs.class === "panel-title", publications.children[0].children)

//     if (!latestPublicationTitleEl) return displayNotification(content)

//     const title = label.label
//     const body = DomUtils.textContent(latestPublicationTitleEl).replace(/\n|\t/g, "") || ""
//     const link = DomUtils.getAttributeValue(latestPublicationTitleEl, "href") || label.url
  
//     displayNotification({
//       title,
//       body,
//       link
//     })
//   })

//   const response = await fetch("https://www.flsh.umi.ac.ma/?page_id=2422");
//   const html = await response.text();

//   const parser = new Parser(handler)
//   parser.write(html)
//   parser.end()
// }

export default App
