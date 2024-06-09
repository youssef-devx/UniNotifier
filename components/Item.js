import { Text, View } from "react-native"
// import AsyncStorage from "@react-native-async-storage/async-storage"
// import Checkbox from "expo-checkbox";
import ExternalLink from "./ExternalLink.js"
// import { useState } from "react";
// import { preferences } from "../utils/localStorage.js";

export default function Item({ publicationsLabels, setPublicationsLabels, label }) {
  // const [isChecked, setChecked] = useState(label.fetchPublications)

  return (
    <View key={label.label} style={{ padding: 16, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: 8, height: "auto", borderRadius: 8, borderWidth: 1, }}>
      <Text style={{ color: "black"}}>{label.label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {/* <Checkbox
          style={{ borderWidth: 1 }}
          value={isChecked}
          onValueChange={() => {
            const newPreferences = JSON.stringify(publicationsLabels.map(o => {
              if (o.label !== label.label) return o
              return { ...o, fetchPublications: !isChecked }
            }), null, 2)

            storage.set("preferences", newPreferences)
            // setChecked(prevIsChecked => !prevIsChecked)
            setPublicationsLabels(newPreferences)
            console.log("new preferences Set")

            // AsyncStorage.setItem("preferences", newPreferences, (error) => {
            //   if (error) return console.log(error)
            //   setPublicationsLabels(newPreferences)
            //   console.log("new preferences Set")
            // })
          }}
          color={isChecked ? "#4630EB" : "black"}
        /> */}
        <ExternalLink url={label.url}/>
      </View>
    </View>
  )
}