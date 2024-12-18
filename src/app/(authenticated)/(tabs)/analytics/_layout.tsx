import React from 'react'
import { Stack } from 'expo-router'

const AnalyticsLayout = () => {
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

export default AnalyticsLayout
