import { Linking } from "react-native"
import { Svg, Path, Polyline, Line } from "react-native-svg"

export default function ExternalLink({ url }) {
  return <Svg onPress={() => Linking.openURL(url)} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-external-link">
      <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></Path>
      <Polyline points="15 3 21 3 21 9"></Polyline>
      <Line x1="10" y1="14" x2="21" y2="3"></Line>
    </Svg>
}