import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Line, Svg } from 'react-native-svg'

export default function CloseBtn({ onPress }) {
  return (
    <TouchableOpacity style={{ paddingBottom: 24 }} onPress={onPress}>
      <Svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x">
        <Line x1="18" y1="6" x2="6" y2="18"></Line>
        <Line x1="6" y1="6" x2="18" y2="18"></Line>
      </Svg>
    </TouchableOpacity>
  )
}