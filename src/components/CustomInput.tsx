import { View } from 'react-native'
import React from 'react'
import { DefaultTheme, TextInput } from 'react-native-paper'
import { Colors } from '../constants/Colors'
import { Ionicons } from '@expo/vector-icons'

type Props = {
	name: string
	setName: (projectName: string) => void
	label: string
	containerStyle?: string
	inputStyle?: string
	isMultiline?: boolean
	marginTop?: number
	keyboardType?: 'default' | 'numeric' | 'email-address'
	secureTextEntry?: boolean
	isError?: boolean
	disabled?: boolean
	onFocus?: () => void
	onBlur?: () => void
	editable?: boolean
}

export default function CustomInput({
	name,
	setName,
	label,
	containerStyle = '',
	inputStyle = '',
	isMultiline = false,
	marginTop = 0,
	keyboardType = 'default',
	secureTextEntry = false,
	isError = false,
	disabled = false,
	onFocus = () => {},
	onBlur = () => {},
	editable = false,
}: Props) {
	const [borderColor, setBorderColor] = React.useState(
		isError && name.length === 0 ? 'border-red-500' : 'border-dark_gray'
	)

	const [isPasswordVisible, setIsPasswordVisible] =
		React.useState(secureTextEntry)

	return (
		<View
			className={`rounded-2xl bg-black-600 border ${borderColor} overflow-hidden relative ${containerStyle}`}
		>
			<TextInput
				label={label}
				value={name}
				onChangeText={setName}
				className={`bg-black-600 h-[54px] ${inputStyle}`}
				underlineStyle={{
					display: 'none',
				}}
				theme={{
					colors: {
						primary: Colors.light.tabIconSelected,
						onSurfaceVariant:
							isError && name.length === 0
								? 'red'
								: Colors.light.tabIconDefault,
					},
					fonts: {
						...DefaultTheme.fonts,
						bodyLarge: {
							fontFamily: 'LexendDeca-Regular',
						},
					},
				}}
				underlineColor='transparent'
				textColor='white'
				multiline={isMultiline}
				contentStyle={{
					marginTop: marginTop,
				}}
				keyboardType={keyboardType}
				onFocus={() => {
					if (!disabled) {
						setBorderColor('border-main_light')
						onFocus()
					}
				}}
				onBlur={() => {
					if (!disabled) {
						setBorderColor(
							isError && name.length === 0
								? 'border-red-500'
								: 'border-dark_gray'
						)
						onBlur()
					}
				}}
				secureTextEntry={isPasswordVisible}
				numberOfLines={isMultiline ? 8 : 1}
				disabled={disabled}
				editable={!editable}
			/>
			{secureTextEntry && !disabled && (
				<View className='absolute right-[12px] top-0 h-[54px] w-[20px] flex items-center justify-center'>
					<Ionicons
						name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
						size={20}
						color='white'
						onPress={() => setIsPasswordVisible(!isPasswordVisible)}
					/>
				</View>
			)}
		</View>
	)
}
