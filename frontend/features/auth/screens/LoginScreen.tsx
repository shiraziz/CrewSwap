import { useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, Mail, Lock, Plane } from 'lucide-react-native';

import { Logo, Screen } from '@/components/ui';
import { useAuth } from '@/lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const auth = useAuth();

  const submit = async () => {
    setError('');

    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setSubmitting(true);

    try {
      await auth.login(email.trim(), password);
      router.replace('/(tabs)/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <View className="flex-1 px-[18px] pt-[38px] pb-8">
        {/* LOGO */}
        <View className="w-full items-center justify-center">
  <Logo compact />
</View>

        {/* HEADER */}
        <View className="mt-[36px] items-center">
          <Text className="text-[23px] font-extrabold text-[#171717]">
            Welcome back!
          </Text>

          <Text className="mt-[5px] text-[15px] text-[#8A8A8A]">
            Sign in to your account
          </Text>
        </View>

        {/* FORM */}
        <View className="mt-[27px]">
          {/* EMAIL */}
          <View>
            <Text className="mb-[8px] text-[13px] font-semibold text-[#333333]">
              Email 
            </Text>

            <View className="h-[51px] flex-row items-center rounded-[12px] border border-[#E5E5E5] bg-white px-[15px] shadow-sm">
              <Mail size={20} color="#F5A900" strokeWidth={1.8} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="youremail@airline.com"
                placeholderTextColor="#A5A5A5"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="h-full flex-1 ml-[12px] text-[14px] text-[#333333]"
              />
            </View>
          </View>

          {/* PASSWORD */}
          <View className="mt-[20px]">
            <Text className="mb-[8px] text-[13px] font-semibold text-[#333333]">
              Password
            </Text>

            <View className="h-[51px] flex-row items-center rounded-[12px] border border-[#E5E5E5] bg-white px-[15px] shadow-sm">
              <Lock size={20} color="#F5A900" strokeWidth={1.8} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#A5A5A5"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                className="h-full flex-1 ml-[12px] text-[14px] text-[#333333]"
              />

              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                className="h-[40px] w-[40px] items-center justify-center"
                hitSlop={8}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#8A8A8A" strokeWidth={1.8} />
                ) : (
                  <Eye size={20} color="#8A8A8A" strokeWidth={1.8} />
                )}
              </Pressable>
            </View>
          </View>

         

          {/* ERROR */}
          {error ? (
            <Text className="mt-[12px] text-[12px] text-red-500">
              {error}
            </Text>
          ) : null}

          {/* LOGIN BUTTON */}
          <Pressable
            onPress={submit}
            disabled={submitting}
            className={`mt-[42px] h-[52px] flex-row items-center justify-center rounded-[14px] bg-[#F5A900] ${
              submitting ? 'opacity-80' : ''
            }`}
            style={{
              shadowColor: '#F5A900',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            <Plane size={20} color="#FFFFFF" style={{ transform: [{ rotate: '45deg' }] }} />
            <Text className="ml-[8px] text-[16px] font-bold text-white">
              {submitting ? 'Logging in...' : 'Log in'}
            </Text>
          </Pressable>

          {/* Sign up */}
          <View className="mt-[32px] flex-row justify-center">
            <Text className="text-[13px] text-[#555555]">
              Don't have an account?{' '}
            </Text>

            <Pressable onPress={() => router.push('/register')}>
              <Text className="text-[13px] font-bold text-[#F5A900]">
                 Sign up
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Screen>
  );
}