import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Plane } from 'lucide-react-native';

import {
  Button,
  colors,
  Field,
  Logo,
  Screen,
} from '@/components/ui';

import { useAuth } from '@/lib/auth';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rank, setRank] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const auth = useAuth();

  const submit = async () => {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    setError('');

    if (
      parts.length < 2 ||
      !email.trim() ||
      password.length < 8
    ) {
      setError(
        'Enter your full name, a valid email, and an 8 character password.'
      );
      return;
    }

    setSubmitting(true);

    try {
      await auth.register({
        email: email.trim(),
        password,
        firstName: parts[0],
        lastName: parts.slice(1).join(' '),
        ...(rank ? { rank } : {}),
      });

      router.replace('/login');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Registration failed.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <View className="px-7 pb-8 pt-10">

        {/* LOGO */}
        <View className="w-full items-center">
          <Logo compact />
        </View>

        {/* HEADER */}
        <Text className="mt-8 text-2xl font-extrabold text-ink">
          Create your account
        </Text>

        <Text className="mb-7 mt-1.5 text-sm text-muted">
          Join CrewSwap and start swapping smarter.
        </Text>

        {/* FORM */}
        <Field
          label="Full name"
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
        />

        <Field
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Field
          label="Crew rank"
          placeholder="FA, FO, CP..."
          value={rank}
          onChangeText={(value) =>
            setRank(value.toUpperCase())
          }
          autoCapitalize="characters"
        />

        <Field
          label="Password"
          placeholder="Create a password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* PASSWORD HINT */}
        <Text className="-mt-2 mb-[18px] text-[11px] text-muted">
          At least 8 characters with letters and numbers
        </Text>

        {/* ERROR */}
        {error ? (
          <Text className="mb-3 text-xs text-red">
            {error}
          </Text>
        ) : null}

        {/* SIGN UP BUTTON */}
        <Button
          title={
            submitting
              ? 'Creating account...'
              : 'Sign up'
          }
          icon={Plane}
          onPress={submit}
        />

        {/* LOGIN */}
        <View className="mt-[22px] flex-row justify-center">
          <Text className="text-xs text-muted">
            Already have an account?{' '}
          </Text>

          <Pressable
            onPress={() => router.back()}
            hitSlop={6}
          >
            <Text className="text-xs font-extrabold text-amber">
              Log in
            </Text>
          </Pressable>
        </View>

      </View>
    </Screen>
  );
}
