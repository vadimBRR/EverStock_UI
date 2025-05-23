import { View, Text, TouchableOpacity } from 'react-native'
import React, { useMemo } from 'react'
import Container from '@/src/components/Container'
import { router, Stack, usePathname } from 'expo-router'
import HeaderAnalytics from '@/src/components/analytics/HeaderAnalytics'
import AnalyticsChart from '@/src/components/analytics/AnalyticsChart'
import HistoryContainer from '@/src/components/analytics/HistoryContainer'
import { RefreshControl, ScrollView } from 'react-native-gesture-handler'
import { useGetFoldersWithItems } from '@/src/api/folder'
import { useGetTransaction } from '@/src/api/transaction'
import { useSyncUserRoles } from '@/src/hooks/useSyncUserRoles'
import Loading from '@/src/components/Loading'
import { useFolderMembersMap } from '@/src/api/users'
import ModalExport from '@/src/components/ModalExport'
import { useModal } from '@/src/providers/ModalProvider'
import { useIsFocused } from '@react-navigation/native'
import TimeRangeSelector from '@/src/components/analytics/TimeRangeSelector'

const AnalyticsScreen = () => {
	const isFocused = useIsFocused()
	const { data: folders = [], isLoading, refetch: refetchFolders } = useGetFoldersWithItems()
	const [activeIndex, setActiveIndex] = React.useState<number>(-1)
	const [isReady, setIsReady] = React.useState(false)
  const [refreshing, setRefreshing] = React.useState(false)

	const { handleOpenExport } = useModal()
	const pathname = usePathname()
	console.log('pathname', pathname)
	console.log('isFocused', isFocused)

	const folders_id = useMemo(() => folders!.map(folder => folder.id), [folders])

	const folderMap = useMemo(() => {
		return folders!.reduce((acc: { [key: number]: any }, folder) => {
			acc[folder.id] = folder
			return acc
		}, {})
	}, [folders])

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        refetchFolders(),
        refetchTransaction(),
      ])
    } finally {
      setRefreshing(false)
    }
  }
  

	React.useEffect(() => {
		if (folders_id.length > 0 && activeIndex === -1) {
			setActiveIndex(folders_id[0])
		}
	}, [folders_id])

	const activeFolder = folderMap[activeIndex]
	useSyncUserRoles(activeFolder as any)

	const { data: transaction, isLoading: isTransLoading,  refetch: refetchTransaction, } =
		useGetTransaction(activeIndex)
	const { data: membersMap, isLoading: isMembersLoading } =
		useFolderMembersMap(activeIndex)

	const belowMinItems = useMemo(() => {
		const folderItems = activeFolder?.items || []
		return folderItems.filter(
			(item: any) =>
				item.min_quantity &&
				item.min_quantity !== 0 &&
				item.quantity < item.min_quantity
		)
	}, [activeFolder])

	// from charts
	const [timeRange, setTimeRange] = React.useState<
		'today' | '1_week' | '2_weeks' | '1_month' | 'all' | 'custom'
	>('all')
	const [startDate, setStartDate] = React.useState<Date | null>(null)
	const [endDate, setEndDate] = React.useState<Date | null>(null)

	const filteredTransactions = useMemo(() => {
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
			const date = new Date(t.date)
			const afterStart = fromDate ? date >= fromDate : true
			const beforeEnd = endDate ? date <= endDate : true
			return afterStart && beforeEnd
		})
	}, [transaction, timeRange, startDate, endDate])

	const totalChanges = useMemo(() => {
		if (!filteredTransactions.length)
			return { quantityChange: 0, priceChange: 0, userStats: {} }

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
	React.useEffect(() => {
		if (isFocused) {
			setIsReady(false)
			const timeout = setTimeout(() => {
				setIsReady(true)
			}, 200)
			return () => clearTimeout(timeout)
		}
	}, [isFocused])

	if (!isFocused) return null

	if (
		!isFocused ||
		!isReady ||
		isLoading ||
		isTransLoading ||
		isMembersLoading
	) {
		return <Loading />
	}

	return (
		<Container isPadding={false} container_style='mx-'>
			<Stack.Screen
				options={{
					headerShown: true,
					title: 'Analytics',
					headerTitleAlign: 'center',
					headerStyle: {
						backgroundColor: '#242121',
					},
					headerTintColor: '#fff',
				}}
			/>
			{transaction?.info.length === 0 ? (
				<View className='flex-1 mt-2 items-center px-2'>
					<HeaderAnalytics
						activeIndex={activeIndex}
						setActiveIndex={setActiveIndex}
						folders_id={folders_id}
						folderMap={folderMap}
					/>
					<View className='mt-24'>
						<Text className='font-lexend_semibold text-[24px] text-white text-center'>
							No transactions found
						</Text>
						<Text className='font-lexend_light text-[16px] text-white text-center'>
							In the "Home" tab, you can create a folder and add items
						</Text>
					</View>
				</View>
			) : (
				<ScrollView className='flex-1 mt-2' refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }>
					<HeaderAnalytics
						activeIndex={activeIndex}
						setActiveIndex={setActiveIndex}
						folders_id={folders_id}
						folderMap={folderMap}
					/>
					<TimeRangeSelector
						timeRange={timeRange}
						setTimeRange={setTimeRange}
						startDate={startDate}
						setStartDate={setStartDate}
						endDate={endDate}
						setEndDate={setEndDate}
					/>

					{filteredTransactions.length > 0 ? (
						<>
							{pathname.includes('/analytics') && (
								<AnalyticsChart
									transaction={filteredTransactions}
									timeRange={timeRange}
									startDate={startDate}
									endDate={endDate}
								/>
							)}
							{/* Mini Dashboard */}
							<View className='bg-black-600 mx-3 p-4 rounded-xl my-2 mt-4'>
								<Text className='text-white font-lexend_semibold text-lg mb-3'>
									Mini Dashboard
								</Text>
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
								<View className='flex-row justify-between '>
									<Text className='text-gray font-lexend_medium'>
										Items below minimum:
									</Text>
									<Text className='text-white font-lexend_medium'>
										{belowMinItems.length}
									</Text>
								</View>
							</View>

							{/* Low Stock Overview */}
							<View className='bg-black-600 mx-3 p-4 rounded-xl my-2'>
								<Text className='text-white font-lexend_semibold text-lg mb-3'>
									Low Stock Overview
								</Text>

								{belowMinItems.length > 0 ? (
									<View className='mt-2'>
										{belowMinItems.slice(0, 3).map((item: any) => (
											<TouchableOpacity
												key={item.id}
												className='flex-row justify-between mb-1'
												onPress={() =>
													router.push(
														`/(authenticated)/(tabs)/home/item/${item.id}`
													)
												}
											>
												<Text className='text-sm text-gray font-lexend_medium'>
													{item.name.length > 28
														? item.name.slice(0, 28) + '...'
														: item.name}
													:
												</Text>
												<Text className='text-white font-lexend_medium text-sm'>
													{item.quantity} / {item.min_quantity}
												</Text>
											</TouchableOpacity>
										))}
										{belowMinItems.length > 3 && (
											<Text className='text-gray text-xs mt-1 italic'>
												+ {belowMinItems.length - 3} more
											</Text>
										)}
									</View>
								) : (
									<Text className='text-gray text-sm italic'>
										No low-stock items
									</Text>
								)}
							</View>

							{/* User stats */}
							<View className='bg-black-600 mx-3 p-4 rounded-xl mt-3'>
								<Text className='text-white font-lexend_semibold text-lg mb-3'>
									Changes by Users
								</Text>
								{Object.keys(totalChanges.userStats).length > 0 ? (
									Object.entries(totalChanges.userStats)
										.sort((a, b) => b[1] - a[1])
										.map(([userId, count]) => (
											<View
												key={userId}
												className='flex-row justify-between mb-1'
											>
												<Text className='text-white'>
													{membersMap?.get(userId) || userId}
												</Text>
												<Text className='text-gray'>{count} change(s)</Text>
											</View>
										))
								) : (
									<Text className='text-gray text-sm italic'>
										No user activity
									</Text>
								)}
							</View>

							<View className='w-full mt-2'>
								<HistoryContainer
									transaction={filteredTransactions}
									activeIndex={activeIndex}
									folderMap={folderMap}
									onExport={handleOpenExport}
								/>
							</View>
						</>
					) : (
						<View className='mt-24 items-center'>
							<Text className='font-lexend_semibold text-[24px] text-white text-center'>
								No data for selected filters
							</Text>
							<Text className='font-lexend_light text-[16px] text-white text-center'>
								Try changing the time range or filters
							</Text>
						</View>
					)}
				</ScrollView>
			)}
			<ModalExport folderId={activeIndex} />
		</Container>
	)
}

export default AnalyticsScreen
