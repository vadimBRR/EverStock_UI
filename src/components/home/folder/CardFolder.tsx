import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { currency } from '@/src/constants'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Href, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { useSupabase } from '@/src/providers/SupabaseProvider'

dayjs.extend(relativeTime)
dayjs.extend(utc)

dayjs.extend(timezone)

type Props = {
	data: any
}

export default function CardFolder({ data }: Props) {
	const router = useRouter()
	const { userId } = useSupabase()

	const isOwner = data.user_id === userId
	return (
		<View className='w-full bg-black-700 rounded-[17px] py-3 px-4 mb-2 border border-black/10'>
			<View></View>
			<View className='flex-col'>
				<TouchableOpacity
					className='flex-col '
					onPress={() =>
						router.push(
							('/(authenticated)/(tabs)/home/folder/' + data.id) as Href
						)
					}
				>
					<Text className='font-lexend_regular text-xl text-white'>
						{data.name}
					</Text>
					<View className='flex-row '>
						<View className='flex-row  items-center  mr-2'>
							<Image
								source={require('@/src/assets/icons/stats/quantity_opacity.png')}
								className='w-5 h-5 aspect-square'
							/>
							<Text className='font-lexend_regular text-gray text-lg ml-0'>
								{data.totalQuantity}
							</Text>
						</View>
						<View className='flex-row items-center mr-2'>
							<Text className='font-lexend_regular text-gray text-lg'>
								{currency.find(c => c.name === data.currency)?.value || '&'}
								{data.totalPrice.toFixed(2)}
							</Text>
						</View>
						<View className='flex-row items-center '>
							<Image
								source={require('@/src/assets/icons/stats/members_opacity.png')}
								className='w-5 h-5 aspect-square'
							/>
							<Text className='font-lexend_regular text-gray text-lg '>
								{data.totalMembers}
							</Text>
						</View>
					</View>
					<View className='bg-[#B6B6B6]/20 w-full h-[1px] mt-1 mb-[5px]'></View>
				</TouchableOpacity>

				<View className='flex flex-row justify-between items-center'>
					<Text className='font-lexend_extralight text-gray text-md'>
						{/* {dayjs(data.lastUpdated).fromNow()} */}
						{dayjs.utc(data.lastUpdated).local().format('DD.MM.YYYY HH:mm:ss')}
					</Text>
					{isOwner ? (
						<TouchableOpacity
							className='border border-gray p-1 rounded-md'
							onPress={() => {
								router.push(
									'/(authenticated)/(tabs)/home/folder/edit/' + data.id
								)
							}}
						>
							<Ionicons name='pencil-outline' size={16} color='white' />
						</TouchableOpacity>
					) : (
						<View className='border border-[#323232] p-1 rounded-md'>
							{/* <Ionicons name='pencil-outline' size={16} color='#323232' /> */}
						</View>
					)}
				</View>
			</View>
		</View>
	)
}
