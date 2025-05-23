import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Container from '@/src/components/Container'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import AnalyticsChart from '@/src/components/analytics/AnalyticsChart'
import HistoryContainer from '@/src/components/analytics/HistoryContainer'
import { ScrollView } from 'react-native-gesture-handler'
import { useGetFoldersWithItems } from '@/src/api/folder'
import { useGetTransaction } from '@/src/api/transaction'
import Loading from '@/src/components/Loading'
import { Tables } from '@/src/types/types'
import { useFolderMembersMap } from '@/src/api/users'
import { useModal } from '@/src/providers/ModalProvider'
import ModalExportItem from '@/src/components/ModalExportItem'
import { Ionicons } from '@expo/vector-icons'
import { useIsFocused } from '@react-navigation/native'

export default function AnalyticsItemScreen() {
  const isFocused = useIsFocused()

	const { id: idString } = useLocalSearchParams()
	const itemId = parseInt(
		typeof idString === 'string' ? idString : idString?.[0],
		10
	)

	const { data: folders = [], isLoading } = useGetFoldersWithItems()
	const { handleOpenExport } = useModal()

	const itemWithFolder = React.useMemo(() => {
		for (const folder of folders!) {
			const item = folder.items.find((i: Tables<'items'>) => i.id === itemId)
			if (item) {
				return { folder, item }
			}
		}
		return null
	}, [folders, itemId])

	const { folder, item } = itemWithFolder || {}

	const { data: transaction, isLoading: isTransLoading } = useGetTransaction(
		folder?.id || -1
	)

	// chart
	const [timeRange, setTimeRange] = React.useState<
		'today' | '1_week' | '2_weeks' | '1_month' | 'all' | 'custom'
	>('all')
	const [startDate, setStartDate] = React.useState<Date | null>(null)
	const [endDate, setEndDate] = React.useState<Date | null>(null)

	const filteredTransactions = React.useMemo(() => {
		if (!transaction) return []
		const now = new Date()
		let fromDate: Date | null = null

		switch (timeRange) {
			case 'today':
				fromDate = new Date()
				fromDate.setHours(0, 0, 0, 0)
				break
			case '1_week':
				fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
				break
			case '2_weeks':
				fromDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
				break
			case '1_month':
				fromDate = new Date()
				fromDate.setMonth(now.getMonth() - 1)
				break
			case 'custom':
				fromDate = startDate
				break
			default:
				fromDate = null
		}

		return transaction.info.filter(t => {
			const isCurrentItem = t.item_id === itemId
			const date = new Date(t.date)
			const afterStart = fromDate ? date >= fromDate : true
			const beforeEnd = endDate ? date <= endDate : true
			return isCurrentItem && afterStart && beforeEnd
		})
	}, [transaction, itemId, timeRange, startDate, endDate])

	const totalChanges = React.useMemo(() => {
		let quantityChange = 0
		let priceChange = 0
		const userStats: Record<string, number> = {}

		filteredTransactions.forEach(t => {
			quantityChange += t.changed_item?.quantity - t.prev_item?.quantity || 0
			priceChange += t.changed_item?.price - t.prev_item?.price || 0
			if (t.user_id) {
				userStats[t.user_id] = (userStats[t.user_id] || 0) + 1
			}
		})

		return {
			quantityChange,
			priceChange,
			userStats,
		}
	}, [filteredTransactions])
	const { data: membersMap } = useFolderMembersMap(folder?.id || -1)

  if (!isFocused) return null

	if (isLoading || isTransLoading) {
		return <Loading />
	}

	if (!folder || !item) {
		return (
			<View className='flex-1 justify-center items-center px-2'>
				<Text className='font-lexend_semibold text-[24px] text-white text-center'>
					Item not found
				</Text>
			</View>
		)
	}

	return (
		<Container isPadding={false}>
			<Stack.Screen
				options={{
					headerShown: true,
					title: `${item.name} — ${folder.name}`,
					headerTitleAlign: 'center',
					headerStyle: {
						backgroundColor: '#242121',
					},
					headerTintColor: '#fff',
					headerBackVisible: false,
					headerLeft: () => (
						<TouchableOpacity onPress={() => router.back()}>
							<Ionicons name='chevron-back' size={24} color='white' />
						</TouchableOpacity>
					),
				}}
			/>
			{filteredTransactions.length === 0 ? (
				<View className='flex-1 items-center justify-center px-2'>
					<Text className='font-lexend_semibold text-[24px] text-white text-center'>
						No transactions for this item
					</Text>
				</View>
			) : (
				<ScrollView className='flex-1 mt-2'>
					{/* Chart */}
					<AnalyticsChart
						transaction={filteredTransactions}
						timeRange={timeRange}
						setTimeRange={setTimeRange}
						startDate={startDate}
						setStartDate={setStartDate}
						endDate={endDate}
						setEndDate={setEndDate}
					/>
					{/* Mini Dashboard */}
					<View className='bg-black-600 mx-3 p-4 rounded-xl my-2 mt-4'>
						<Text className='text-white font-lexend_semibold text-lg mb-3'>
							Mini Dashboard
						</Text>

						{/* Quantity Change */}
						<View className='flex-row justify-between mb-2'>
							<Text className='text-gray font-lexend_medium'>
								Total Quantity Change:
							</Text>
							<Text
								className={`font-lexend_medium ${
									totalChanges.quantityChange > 0
										? 'text-green-400'
										: totalChanges.quantityChange < 0
										? 'text-red-400'
										: 'text-gray'
								}`}
							>
								{totalChanges.quantityChange > 0 ? '+' : ''}
								{totalChanges.quantityChange}
							</Text>
						</View>

						{/* Price Change */}
						<View className='flex-row justify-between mb-2'>
							<Text className='text-gray font-lexend_medium'>
								Total Price Change:
							</Text>
							<Text
								className={`font-lexend_medium ${
									totalChanges.priceChange > 0
										? 'text-green-400'
										: totalChanges.priceChange < 0
										? 'text-red-400'
										: 'text-gray'
								}`}
							>
								{totalChanges.priceChange > 0 ? '+' : ''}
								{totalChanges.priceChange.toFixed(2)}
							</Text>
						</View>

						{/* Current / Minimum Quantity */}
						{item.min_quantity !== 0 && (
							<View className='flex-row justify-between'>
								<Text className='text-gray font-lexend_medium'>
									Current / Minimum:
								</Text>
								<Text
									className={`font-lexend_medium ${
										item.quantity! < item.min_quantity!
											? 'text-red-400'
											: 'text-green-400'
									}`}
								>
									{item.quantity} / {item.min_quantity}
								</Text>
							</View>
						)}
					</View>
					{/* User stats */}
					<View className='bg-black-600 mx-3 p-4 rounded-xl mt-3'>
						<Text className='text-white font-lexend_semibold text-lg mb-3'>
							Changes by Users
						</Text>
						{Object.entries(totalChanges.userStats)
							.sort((a, b) => b[1] - a[1])
							.map(([userId, count]) => (
								<View key={userId} className='flex-row justify-between mb-1'>
									<Text className='text-white'>
										{membersMap?.get(userId) || userId}
									</Text>
									<Text className='text-gray'>{count} change(s)</Text>
								</View>
							))}
					</View>
					<View className='w-full mt-1'>
						<HistoryContainer
							transaction={filteredTransactions}
							activeIndex={folder.id}
							folderMap={{ [folder.id]: folder }}
							isDetailedView={false}
							onExport={handleOpenExport}
						/>
					</View>
				</ScrollView>
			)}
			<ModalExportItem transactions={filteredTransactions} />
		</Container>
	)
}
