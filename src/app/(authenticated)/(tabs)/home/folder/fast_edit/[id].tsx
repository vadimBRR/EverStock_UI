import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
	View,
	Text,
	FlatList,
	RefreshControl,
	TouchableOpacity,
} from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import Container from '@/src/components/Container'
import SearchBar from '@/src/components/SearchBar'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import CardItemFastEdit from '@/src/components/home/item/CardItemFastEdit'
import Loading from '@/src/components/Loading'
import { Tables } from '@/src/types/types'
import { useGetFoldersWithItems } from '@/src/api/folder'
import { useUpdateItem } from '@/src/api/item'
import { useIsFocused } from '@react-navigation/native'
import { showSuccess } from '@/src/utils/toast'
import ConfirmDialog from '@/src/components/home/ConfirmDialog'

export default function FastEditScreen() {
	const isFocused = useIsFocused()
	const { id: idString } = useLocalSearchParams()
	const id = parseFloat(
		idString ? (typeof idString === 'string' ? idString : idString[0]) : ''
	)

	const { data: folders = [], isLoading, refetch } = useGetFoldersWithItems()
	const updateItem = useUpdateItem()

	const [search, setSearch] = useState('')
	const [refreshing, setRefreshing] = useState(false)
	const [activeItemId, setActiveItemId] = useState<number | null>(null)
	const [editedQuantities, setEditedQuantities] = useState<
		Record<number, number>
	>({})
	const [initialOrder, setInitialOrder] = useState<number[]>([])
	const [isConfirmVisible, setIsConfirmVisible] = useState(false)

	const folder = useMemo(() => folders!.find(f => f.id === id), [folders, id])
	const folderItems = useMemo(() => {
		if (!folder) return []
		const items = folder.items || []
		return search
			? items.filter(item =>
					item.name.toLowerCase().includes(search.toLowerCase())
			  )
			: items
	}, [folder, search])

	useEffect(() => {
		if (folderItems.length && initialOrder.length === 0) {
			setInitialOrder(folderItems.map(item => item.id))
		}
	}, [folderItems])

	const orderedItems = useMemo(() => {
		if (!initialOrder.length) return folderItems
		return [...folderItems].sort(
			(a, b) => initialOrder.indexOf(a.id) - initialOrder.indexOf(b.id)
		)
	}, [folderItems, initialOrder])

	const onRefresh = useCallback(async () => {
		setRefreshing(true)
		await refetch()
		setRefreshing(false)
	}, [refetch])

	const handleSearch = (value: string) => {
		setSearch(value)
	}

	const handleBack = () => {
		const hasUnsavedChanges = Object.entries(editedQuantities).some(
			([itemIdStr, quantity]) => {
				const item = folderItems.find(i => i.id === parseInt(itemIdStr))
				return item && quantity !== item.quantity
			}
		)
		console.log('back function')
		if (hasUnsavedChanges) {
			setIsConfirmVisible(true)
		} else {
			router.back()
		}
	}

	const handleQuantityChange = (id: number, quantity: number) => {
		setEditedQuantities(prev => ({ ...prev, [id]: quantity }))
	}
	const handleApplyChanges = () => {
		Object.entries(editedQuantities).forEach(([itemIdStr, quantity]) => {
			const item = folderItems.find(i => i.id === parseInt(itemIdStr))
			if (item && quantity !== item.quantity) {
				handleSaveItem({ item, quantity })
				showSuccess('Item updated successfully')
			}
		})
		router.back()
	}

	const handleSaveItem = ({
		item,
		quantity,
	}: {
		item: Tables<'items'>
		quantity: number
	}) => {
		if (!item || quantity < 0) return

		updateItem.mutate({
			updatedItem: { ...item, quantity },
			previousItem: item,
		})

		setEditedQuantities(prev => {
			const updated = { ...prev }
			delete updated[item.id]
			return updated
		})
	}

	if (!isFocused) return null
	if (isLoading) return <Loading />
	if (!folder)
		return (
			<Text className='text-white text-center mt-10'>Folder not found</Text>
		)

	return (
		<Container isPadding={false}>
			<Stack.Screen
				options={{
					headerShown: true,
					title: folder.name,
					headerTitleAlign: 'center',
					headerStyle: { backgroundColor: '#242121' },
					headerTintColor: '#fff',
					headerLeft: () => (
						<TouchableOpacity onPress={handleBack} className='pl-4'>
							<MaterialIcons name='close' size={24} color='white' />
						</TouchableOpacity>
					),
					headerRight: () => (
						<TouchableOpacity onPress={handleApplyChanges} className='pr-4'>
							<MaterialIcons name='done' size={24} color='white' />
						</TouchableOpacity>
					),
				}}
			/>

			<View className='w-full items-center my-2 relative'>
				<SearchBar
					containerStyle='w-[95%]'
					search={search}
					handleSearch={handleSearch}
				/>
			</View>

			<FlatList
				className='mx-3'
				data={orderedItems}
				keyExtractor={item => item.id.toString()}
				extraData={activeItemId}
				renderItem={({ item }) => (
					<CardItemFastEdit
						item={item}
						currencyName={folder.currency || 'USD'}
						activeItemId={activeItemId}
						setActiveItemId={setActiveItemId}
						handleQuantityChange={handleQuantityChange}
						handleSaveItem={handleSaveItem}
					/>
				)}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			/>
			<ConfirmDialog
				isVisible={isConfirmVisible}
				onCancel={() => setIsConfirmVisible(false)}
				onConfirm={() => {
					setIsConfirmVisible(false)
					router.back()
				}}
				title='Discard changes?'
				description='You have unsaved changes. Are you sure you want to leave and discard them?'
				confirmText='Leave'
			/>
		</Container>
	)
}
