import { View, Text, ScrollView, Dimensions, StyleSheet, Alert } from 'react-native'
import { defaultPublicationsPreferences as publicationsLabels } from "../Constants.js"
import CloseBtn from './CloseBtn.js'
// import { useEffect, useState } from 'react'
import { Parser, DomHandler, DomUtils } from "htmlparser2"

export default function Publications({ hidePublications, setHidePublications }) {
  // const [labelsPublications, setLabelsPublications] = useState([])
  
  // useEffect(() => { publicationsLabels.map(getLabelPublications) }, [])

  async function getLabelPublications(label) {
    fetch(label.url)
    .then(async r => {
      const html = await r.text()
      const handler = new DomHandler((error, dom) => {
        if (error) return setLabelsPublications(prevLabelsPublications => [...prevLabelsPublications, [{ ...label, fetchFailed: true }]])
        const publicationsElems = DomUtils.findAll(elem => elem.attribs && elem.attribs.class === "panel-group", dom)
        if (publicationsElems.length < 1) return setLabelsPublications(prevLabelsPublications => [...prevLabelsPublications, [{ ...label, fetchFailed: true }]])
        // @ts-ignore
        
        // const latestPublicationTitleEl = DomUtils.findOne(elem => elem.attribs.class === "panel-title", publicationsElems.children[0].children)
    
        // if (!latestPublicationTitleEl) return setLabelsPublications(prevLabelsPublications => [...prevLabelsPublications, [{ ...label, fetchFailed: true }]])
    

        const labelPublications = publicationsElems.map(publicationElems => {
          const titleElems = DomUtils.findAll(elem => elem.tagName === "a", publicationElems.children[0].children)
          return titleElems.map(titleElem => {
            const title = label.label
            const body = DomUtils.textContent(titleElem).replace(/\n|\t/g, "") || ""
            const publicationsLink = DomUtils.getAttributeValue(titleElem, "href") || label.url
            return {
              ...label,
              title,
              body,
              publicationsLink,
              fetchFailed: false,
            }
          })
        })

        setLabelsPublications(prevLabelsPublications => [...prevLabelsPublications, labelPublications ])
      })

      const parser = new Parser(handler)
      parser.write(html)
      parser.end()
    })
    .catch(() => setLabelsPublications(prevLabelsPublications => [...prevLabelsPublications, [{ ...label, fetchFailed: true }]]))
  }

// console.log(labelsPublications.length < 1 ? "Loading" : "good to go")
  
  return (
    <ScrollView style={{...publicationsStyles, right: hidePublications ? "-100%" : 0 }}>
      <CloseBtn onPress={() => setHidePublications(prevHidePublications => !prevHidePublications)}/>
      {publicationsLabels.map((label, labelIdx) => <View key={labelIdx}>
        <Text key={label.label} style={{ color: "black", fontWeight: "bold", fontSize: 16 }}>{label.label}</Text>
        {/* <Text style={{ color: "black" }}>{JSON.stringify(labelsPublications.filter(o => o.label === label.label), null, 2)}</Text> */}
        {/* {labelsPublications.length > 0
        ? labelsPublications.filter(o => o[0].label === label.label)
          .map((publication, publicationIdx) => {
            if (publication.fetchFailed) return <Text key={publicationIdx} style={{ color: "black" }}>fetchFailed</Text>
            return <Text key={publicationIdx} style={{ color: "black" }}>{publication.label}</Text>
          })
        : <Text style={{ color: "black" }}>Loading...</Text>} */}
      </View>)}
    </ScrollView>
  )
}

const publicationsStyles = StyleSheet.create({
  position: "absolute",
  top: 0,
  backgroundColor: "#eee",
  width: "85%",
  height: Dimensions.get("window").height,
  padding: 16
})