import { View, Text } from 'react-native'
import React from 'react'
import dayjs from 'dayjs'

const TransactionCard = ({
	fullName,
	action,
	date,
	containerStyle,
}: {
	fullName: string
	action: string
	date: string
	containerStyle?: string
}) => {
	return (
		<View className={`bg-black-700 px-3 py-1 ${containerStyle}`}>
      <View className='flex flex-row justify-between'>
			  <Text className='text-gray font-poppins_light text-sm'>{fullName}</Text>
			  <Text className='text-gray font-poppins_light text-sm'>{dayjs(date).format('YYYY-MM-DD')}</Text>

      </View>
			<View className='flex-row justify-between items-center'>
				<Text className='text-white font-poppins_light text-lg flex-1'>
					{action}
				</Text>
				<Text className='text-white font-poppins_light text-sm text-right w-[120px]'>
					{dayjs(date).format('HH:mm:ss')}
				</Text>
			</View>
		</View>
	)
}

export default TransactionCard
