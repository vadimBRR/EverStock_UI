import React from 'react'
import { Stack } from 'expo-router'
import * as SystemUI from 'expo-system-ui'

export default function HomeLayout() {
	SystemUI.setBackgroundColorAsync('#1C1A1A')

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				animationDuration: 500,
				contentStyle: { backgroundColor: '#1C1A1A' },
			}}
		></Stack>
	)
}
