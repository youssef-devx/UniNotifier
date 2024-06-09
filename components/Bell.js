import { TouchableOpacity } from 'react-native'
import { Svg, Path } from 'react-native-svg'

export default function Bell({ setHidePublications }) {
  return <TouchableOpacity style={{ position: "absolute", top: 24, right: 32 }} onPress={() => setHidePublications(prevHidePublications => !prevHidePublications)}>
    <Svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-bell">
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></Path>
      <Path d="M13.73 21a2 2 0 0 1-3.46 0"></Path>
    </Svg>
  </TouchableOpacity>
}