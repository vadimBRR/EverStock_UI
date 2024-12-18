import { View, Text, TouchableOpacity, Image, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import Container from '../../components/Container'
import CustomButton from '../../components/CustomButton'
import CustomInput from '../../components/CustomInput'
import { useRouter } from 'expo-router'
import { useAccount } from '@/src/providers/AccountProvider'
// import { supabase } from '../../lib/supabase'
import * as SystemUI from 'expo-system-ui'

export default function SignUpScreen() {
	const [password, setPassword] = useState('')
	const [email, setEmail] = useState('')
	const [name, setName] = useState('')
	const [code, setCode] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [pendingVerification, setPendingVerification] = useState(false)

	// const { signUpWithEmail, verifyEmailCode, signInWithOAuth } = useAuthService();
	const { handleSignUp: handleLogin, handleSignIn } = useAccount()
	const signUpWithEmail = async (
		email: string,
		password: string,
		name: string
	) => {}
	const verifyEmailCode = async (code: string) => {
		handleLogin({ email, first_name: name, last_name: name })
	}
	const signInWithOAuth = async (provider: string) => {
		handleSignIn({ email: 'admin@gmail.com' })
	}
	const router = useRouter()

	const validateData = () => {
		if (!email || !password || !name) {
			Alert.alert('Error', 'Please fill all fields')
			return false
		}
		return true
	}

	const onSignUpPress = async () => {
		if (!validateData()) return
		setIsLoading(true)
		try {
			const res = await signUpWithEmail(email, password, name)
			setPendingVerification(true)
		} catch (error) {
			Alert.alert(
				'Error',
				typeof error === 'string'
					? error
					: 'An error occurred. Please try again.'
			)
		}
		setIsLoading(false)
	}

	const onPressVerify = async () => {
		setIsLoading(true)
		try {
			await verifyEmailCode(code)
			router.replace('/(authorization)/completed_auth')
		} catch (error) {
			Alert.alert(
				'Error',
				typeof error === 'string'
					? error
					: 'An error occurred. Please try again.'
			)
		} finally {
			setIsLoading(false)
		}
	}
	useEffect(() => {
		SystemUI.setBackgroundColorAsync('#1C1A1A')
	}, [])

	return (
		<Container>
			<View className='flex-1 items-center justify-end mb-10 mx-[33px]'>
				<View className='flex items-center justify-center mb-[70px]'>
					<Text className='font-lexend_semibold text-[32px] text-white'>
						Welcome!
					</Text>
					<View className='flex flex-row'>
						<Text className='font-lexend_semibold text-[32px] text-white'>
							to{' '}
						</Text>
						<Text className='font-lexend_semibold text-[32px] text-main_light'>
							EverStock
						</Text>
					</View>
				</View>

				{!pendingVerification && (
					<View className='w-full'>
						<View className='w-full mb-2'>
							<CustomInput label='Full name' name={name} setName={setName} />
						</View>
						<View className='w-full mb-2'>
							<CustomInput
								label='Email'
								name={email}
								setName={setEmail}
								keyboardType='email-address'
							/>
						</View>
						<View className='w-full'>
							<CustomInput
								label='Password'
								name={password}
								setName={setPassword}
								secureTextEntry
							/>
						</View>
						<View className='w-full my-[30px]'>
							<CustomButton
								text='Sign up'
								onClick={onSignUpPress}
								disabled={isLoading}
								styleContainer='m-0'
							/>
						</View>
					</View>
				)}
				{pendingVerification && (
					<View className='w-full'>
						<Text className='font-lexend_semibold text-xl text-white'>
							Verification Code
						</Text>
						<Text className='font-lexend_semibold text-lg text-dark_gray'>
							We have sent the verification code to your email address
						</Text>
						<View className='w-full mt-[30px] '>
							<CustomInput
								label='Code'
								name={code}
								setName={setCode}
								containerStyle=''
							/>

							<CustomButton
								text='Verify Email'
								onClick={onPressVerify}
								styleContainer='my-[30px] mx-0'
							/>
						</View>
					</View>
				)}

				<View className='w-full'>
					<View className='w-full bg-black/20 h-[1px]' />
					<TouchableOpacity
						className='bg-black-400  w-full my-[30px] rounded-xl overflow-hidden border border-dark_gray'
						onPress={() => signInWithOAuth('oauth_google')}
					>
						<View className='border-black/5 border py-[15px] flex items-center justify-center'>
							<View className='absolute left-3'>
								<Image
									source={require('../../assets/icons/google.png')}
									className=''
								/>
							</View>
							<Text className='font-lexend_regular text-[16px] text-white '>
								Log in with Google
							</Text>
						</View>
					</TouchableOpacity>
					<View className='flex-row items-center justify-center'>
						<Text className='font-lexend_regular text-[16px] text-white'>
							Already have an account?{' '}
						</Text>
						<TouchableOpacity onPress={() => router.back()}>
							<Text className='font-lexend_semibold text-[18px] mb-[1px] text-white'>
								Sign in
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Container>
	)
}
