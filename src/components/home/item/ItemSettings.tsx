import React, { useCallback, useMemo } from 'react'
import { View, Text, Keyboard } from 'react-native'
import {
	BottomSheetModal,
	BottomSheetBackdrop,
	TouchableWithoutFeedback,
} from '@gorhom/bottom-sheet'
import { useModal } from '@/src/providers/ModalProvider'
import OptionSettings from './OptionSettings'
import { useRouter } from 'expo-router'
import { useDeleteItem, useCloneItem } from '@/src/api/item'
import { useGetFoldersWithItems } from '@/src/api/folder'
import { showError } from '@/src/utils/toast'
import { useRolesStore } from '@/src/store/useUserRoles'

type Props = {
	item_id: number
	openConfirmDelete: () => void
}

export default function ItemSettings({ item_id, openConfirmDelete }: Props) {
	const router = useRouter()
	const { handleCloseAnother, modalAnotherRef, handleOpenExport } = useModal()
	const { data: folders } = useGetFoldersWithItems()

	const item = useMemo(() => {
		return folders?.flatMap(f => f.items).find(i => i.id === item_id)
	}, [folders, item_id])

	const { mutate: cloneItem } = useCloneItem()

	const snapPoints = useMemo(() => ['40%', '60%'], [])

	const roles = useRolesStore(state => state.roles)
	const canDelete = roles?.isDeleteItem || roles?.isAdmin
	const canClone = roles?.isAddItem || roles?.isAdmin

	const onDelete = () => {
		if (!item) return
		if (!canDelete) {
			showError("You don't have permission to delete this item.")
			return
		}
		handleCloseAnother()
		openConfirmDelete()
	}

	const onClone = () => {
		if (!item) return
		if (!canClone) {
			showError("You don't have permission to clone this item.")
			return
		}
		cloneItem(item)
		handleCloseAnother()
		router.back()
	}

	const onHistory = () => {
		if (!item) return
		handleCloseAnother()
		router.push(`/(authenticated)/(tabs)/analytics/item/${item.id}`)
	}

	const onExport = () => {
		if (!item) return
		handleCloseAnother()
		handleOpenExport()
		router.push(`/(authenticated)/(tabs)/analytics/item/${item.id}`)
	}

	const renderBackdrop = useCallback(
		(props: any) => (
			<BottomSheetBackdrop
				appearsOnIndex={0}
				disappearsOnIndex={-1}
				{...props}
			/>
		),
		[]
	)

	return (
		<BottomSheetModal
			ref={modalAnotherRef}
			snapPoints={snapPoints}
			backdropComponent={renderBackdrop}
			enablePanDownToClose={true}
			backgroundStyle={{ backgroundColor: '#2A2A2A' }}
		>
			<TouchableWithoutFeedback
				onPress={() => Keyboard.dismiss()}
				className='flex-1 bg-black-600'
			>
				<View className='mx-3 flex-col'>
					<View className='flex-row justify-center items-center mb-2'>
						<Text className='text-2xl font-lexend_regular text-white'>
							Options
						</Text>
					</View>
					<View className='flex-col px-2'>
						<OptionSettings onPress={onDelete} icon='delete' text='Delete' />
						<OptionSettings onPress={onHistory} icon='history' text='History' />
						<OptionSettings onPress={onExport} icon='export' text='Export' />
						<OptionSettings onPress={onClone} icon='clone' text='Clone' />
					</View>
				</View>
			</TouchableWithoutFeedback>
		</BottomSheetModal>
	)
}
