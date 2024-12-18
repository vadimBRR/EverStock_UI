import { View, FlatList, RefreshControl, Text } from 'react-native'
import React, { useCallback, useState } from 'react'
import Container from '@/src/components/Container'
import { Stack, useRouter } from 'expo-router'
import SearchBar from '@/src/components/SearchBar'
import AddButton from '@/src/components/AddButton'
import CardFolder from '@/src/components/home/folder/CardFolder'
import Loading from '@/src/components/Loading'
import { useAccount } from '@/src/providers/AccountProvider'
import * as SystemUI from 'expo-system-ui'

export default function HomeScreen() {
	const [search, setSearch] = useState('')
	const router = useRouter()
	const [refreshing, setRefreshing] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	SystemUI.setBackgroundColorAsync('#1C1A1A')

	const { folders: data } = useAccount()

	const openCreateFolder = () => {
		router.push('/(authenticated)/home/folder/create')
	}
	const handleSearch = (value: string) => {
		setSearch(value)
	}

	const onRefresh = useCallback(async () => {
		setRefreshing(true)

		setRefreshing(false)
	}, [])

	if (isLoading) return <Loading />
	return (
		<Container isPadding={false}>
			<Stack.Screen
				options={{
					headerShown: true,
					title: 'Home',
					headerTitleAlign: 'center',
					headerStyle: {
						backgroundColor: '#242121',
					},
					headerTintColor: '#fff',
				}}
			/>
			<View className='flex-1'>
				<View className='flex-row w-full justify-center my-2 '>
					<SearchBar
						containerStyle='mr-2'
						search={search}
						handleSearch={handleSearch}
					/>
					<AddButton handlePressAdd={openCreateFolder} />
				</View>
				{data.length ? (
          <FlatList
          className='mx-3 '
          data={
            search
              ? data.filter(folder =>
                  folder.name.toLowerCase().includes(search.toLowerCase())
                )
              : data
          }
          keyExtractor={folder => folder.id.toString()}
          renderItem={({ item }) => <CardFolder data={item} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
        ) : (
          <View className='flex-1 justify-center items-center px-2'>
            <Text className='font-lexend_semibold text-[24px] text-white text-center'>No folders found :(</Text>
            <Text className='font-lexend_light text-[16px] text-white text-center'>Click on the + button at the top to add folders</Text>
          </View>

        )}
			</View>
		</Container>
	)
}
