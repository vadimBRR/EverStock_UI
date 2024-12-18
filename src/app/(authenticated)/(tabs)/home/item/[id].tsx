import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
} from 'react-native'
import React, { useState } from 'react'
import Container from '@/src/components/Container'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import CustomInput from '@/src/components/CustomInput'
import CustomButton from '@/src/components/CustomButton'
import { ScrollView } from 'react-native'
import ItemImagesCarusel from '@/src/components/home/item/ItemImagesCarusel'
import { SimpleLineIcons } from '@expo/vector-icons'
import EvilIcons from '@expo/vector-icons/EvilIcons'
import { useAccount } from '@/src/providers/AccountProvider'
import Counter from '@/src/components/home/item/Counter'
import CustomRadioButton from '@/src/components/CustomRadioButton'
import { useModal } from '@/src/providers/ModalProvider'
import ItemSettings from '@/src/components/home/item/ItemSettings'

export default function ItemScreen() {
	const { id: idString } = useLocalSearchParams()
	const item_id = parseFloat(
		idString ? (typeof idString === 'string' ? idString : idString[0]) : ''
	)

	const item = useAccount().items.find(item => item.id === item_id)
	if (!item) return <Text>Item not found</Text>
	const { handleOpenAnother } = useModal()
	const [itemName, setItemName] = useState(item.name || '')
	const [amount, setAmount] = useState(item.amount + '' || '')
	const [price, setPrice] = useState(item.price + '' || '')
	const [note, setNote] = useState(item.note || '')
	const [tag, setTag] = useState<string>(item.tag || '')

	const [images, setImages] = useState<string[]>(item.image_url || [])
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()
	const { handleUpdateItem } = useAccount()
	const [selectedType, setSelectedType] = useState(
		item.typeAmount || 'quantity'
	)
	const typesAmount = ['quantity', 'weight', 'volume']

	const changeImages = ({ images }: { images: string[] }) => {
		setImages(images)
	}

	const updateItem = () => {
		handleUpdateItem({
			id: item_id,
			name: itemName,
			image_url: images,
			typeAmount: selectedType,
			price: parseFloat(price),
			quantity: parseInt(amount),
			note,
			tag,
		})
		router.back()
	}

	if (!item_id) {
		;<View className='flex-1 justify-center items-center'>
			<Text className='font-bold'>Failed to fetch</Text>
		</View>
	}

	return (
		<Container isPadding={false}>
			<Stack.Screen
				options={{
					headerShown: true,
					title: 'Item',
					headerStyle: {
						backgroundColor: '#242121',
					},
					headerTintColor: '#fff',
					headerTitleAlign: 'center',
					headerRight: () => (
						<TouchableOpacity onPress={handleOpenAnother} className='p-2'>
							<SimpleLineIcons
								name='options-vertical'
								size={16}
								color='white'
							/>
						</TouchableOpacity>
					),
				}}
			/>
			<ScrollView
				className='mx-4 mt-3 flex-1'
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ justifyContent: 'space-between' }}
			>
				<View className='flex flex-col flex-1'>
					<View className=''>
						<ItemImagesCarusel
							images={images}
							setImages={setImages}
							isGallery={true}
							handleChangeImages={(images: string[]) =>
								changeImages({ images })
							}
						/>

						<CustomInput
							label={'Item name *'}
							name={itemName}
							setName={setItemName}
							containerStyle='mb-4'
						/>
						<View className='w-full flex flex-row justify-between mb-4 bg-black-600 border border-dark_gray rounded-2xl p-3'>
							{typesAmount.map((type, index) => (
								<CustomRadioButton
									key={index}
									text={type.charAt(0).toUpperCase() + type.slice(1)}
									checked={type === selectedType}
									onPress={() => setSelectedType(type)}
								/>
							))}
						</View>
						<Counter
							type={selectedType}
							quantity={amount}
							item_id={item_id}
							setQuantity={(quantity: number) => setAmount(quantity + '')}
						/>

						<CustomInput
							label={'Price'}
							name={price}
							setName={setPrice}
							containerStyle='mb-3 mt-2'
							keyboardType='numeric'
						/>
						<View className='mb-3 bg-black-600 border border-dark_gray rounded-2xl w-full px-2 flex items-center'>
							<View className='w-full flex flex-row justify-between items-center  '>
								<TextInput
									placeholder='Tag'
									className='h-[54px] w-[90%] font-lexend_regular  text-[17px] text-white'
									placeholderTextColor='#B6B6B6'
									value={tag}
									onChangeText={setTag}
								/>
								<EvilIcons name='tag' size={34} color='white' />

							</View>
						</View>

						<View className='bg-black-600 h-[54px] border border-dark_gray rounded-2xl justify-center  mb-3'>
							<Text className='font-lexend_regular text-lg text-gray mx-3'>
								Total price: {(+price * +amount).toFixed(2)}
							</Text>
						</View>
						<View className='bg-black-600  border border-dark_gray rounded-2xl   mb-2'>
							<Text className='absolute top-2 left-4 font-lexend_regular text-gray'>
								Note
							</Text>
							<TextInput
								value={note}
								onChangeText={setNote}
								className='pt-6 px-4 text-white'
								style={{
									borderRadius: 16,
									padding: 8,
									fontFamily: 'LexendDeca-Light',
									fontSize: 16,
									textAlignVertical: 'top',
								}}
								editable
								multiline
								numberOfLines={6}
							/>
						</View>
					</View>
				</View>
			</ScrollView>
			<View className='mx-4'>
				<CustomButton
					text='Apply'
					onClick={updateItem}
					styleContainer={`my-4 mx-0 `}
					disabled={
						!itemName ||
						(amount ? isNaN(parseFloat(amount)) : false) ||
						(price ? isNaN(parseFloat(price)) : false)
					}
					isLoading={isLoading}
				/>
			</View>
			<ItemSettings item_id={item_id} />
		</Container>
	)
}
