import { useCallback, useState } from 'react';
import { Image, Platform, Pressable, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import {
  Camera,
  ChevronRight,
  KeyRound,
  LogOut,
  Settings,
  UserRound,
  ShieldCheck,
  Plane,
  CheckCircle2,
} from 'lucide-react-native';

import { api, mediaUrl } from '@/lib/api';
import { useApiResource } from '@/lib/data';
import { useAuth } from '@/lib/auth';
import { colors, Header, Screen } from '@/components/ui';

const menu = [
  {
    label: 'Personal Information',
    description: 'Manage your personal details',
    path: '/personal-info',
    icon: UserRound,
  },
  {
    label: 'Preferences',
    description: 'Customize your CrewSwap experience',
    path: '/preferences',
    icon: Settings,
  },
  {
    label: 'Change Password',
    description: 'Update your account password',
    path: '/change-password',
    icon: KeyRound,
  },
];

type Qualification = {
  fleet: string;
};

type Swap = {
  status: string;
};

const supportedImageTypes = [
  'image/png',
  'image/jpeg',
  'image/webp',
];

function imageMimeType(
  mimeType?: string | null,
  fileName?: string | null
) {
  if (
    mimeType &&
    supportedImageTypes.includes(mimeType)
  ) {
    return mimeType;
  }

  const extension = fileName
    ?.split('.')
    .pop()
    ?.toLowerCase();

  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';

  return 'image/jpeg';
}

export default function Profile() {
  const auth = useAuth();

  const [photoMessage, setPhotoMessage] = useState('');
  const [uploadingPhoto, setUploadingPhoto] =
    useState(false);

  const qualifications = useApiResource(
    () => api<Qualification[]>('/qualifications/me'),
    []
  );

  const active = useApiResource(
    () => api<Swap[]>('/swaps/active'),
    []
  );

  const history = useApiResource(
    () => api<Swap[]>('/swaps/history'),
    []
  );

  const profile = auth.profile;
  const photoUrl = mediaUrl(profile?.photoUrl);

  useFocusEffect(
    useCallback(() => {
      void qualifications.reload();
      void active.reload();
      void history.reload();
    }, [qualifications.reload, active.reload, history.reload])
  );

  const savePhoto = async (
    fileName: string,
    mimeType: string,
    data: string
  ) => {
    setUploadingPhoto(true);

    try {
      await api('/profile/photo', {
        method: 'POST',
        body: JSON.stringify({
          fileName,
          mimeType,
          data,
        }),
      });

      await auth.refreshMe();

      setPhotoMessage('Profile photo updated.');
    } catch (e) {
      setPhotoMessage(
        e instanceof Error
          ? e.message
          : 'Could not upload photo.'
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const uploadPhoto = async () => {
    setPhotoMessage('');

    if (uploadingPhoto) return;

    if (Platform.OS !== 'web') {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setPhotoMessage(
          'Allow photo library access to upload a profile photo.'
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes:
            ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.75,
          base64: true,
        });

      if (
        result.canceled ||
        !result.assets[0]
      ) {
        return;
      }

      const asset = result.assets[0];

      if (!asset.base64) {
        setPhotoMessage(
          'Could not read the selected image. Please try another photo.'
        );
        return;
      }

      const mimeType = imageMimeType(
        asset.mimeType,
        asset.fileName
      );

      await savePhoto(
        asset.fileName ??
          `profile-photo.${
            mimeType === 'image/png' ? 'png' : 'jpg'
          }`,
        mimeType,
        `data:${mimeType};base64,${asset.base64}`
      );

      return;
    }

    if (typeof document === 'undefined') return;

    const input = document.createElement('input');

    input.type = 'file';
    input.accept =
      'image/png,image/jpeg,image/webp';

    input.onchange = async () => {
      const file = input.files?.[0];

      if (!file) return;

      if (
        ![
          'image/png',
          'image/jpeg',
          'image/webp',
        ].includes(file.type)
      ) {
        setPhotoMessage(
          'Choose a PNG, JPG, or WebP image.'
        );
        return;
      }

      const reader = new FileReader();

      reader.onload = async () => {
        await savePhoto(
          file.name,
          file.type,
          String(reader.result)
        );
      };

      reader.readAsDataURL(file);
    };

    input.click();
  };

  const logout = async () => {
    await auth.logout();
    router.replace('/login');
  };

  const completedSwaps =
    history.data?.filter(
      (swap) =>
        swap.status === 'COMPLETED' ||
        swap.status === 'ACCEPTED'
    ).length ?? 0;

  const activeSwaps =
    active.data?.length ?? 0;

  const qualifiedFleets =
    qualifications.data?.map(
      (qualification) => qualification.fleet
    ) ?? [];

  return (
    <Screen scroll>

      {/* Header */}
      <Header
        title="Profile"
        back={() => router.back()}
      />

      {/* Profile Card */}
      <View
        className="mx-5 mb-7 mt-1 items-center rounded-[22px] border pb-5 pt-[18px]"
        style={{
          backgroundColor: colors.paper,
          borderColor: colors.line,
        }}
      >
        {/* Avatar */}
        <View className="relative mb-[13px]">
          <View
            className="h-[102px] w-[102px] items-center justify-center overflow-hidden rounded-full border-4"
            style={{
              backgroundColor: colors.navySoft,
              borderColor: colors.cream,
            }}
          >
            {photoUrl ? (
              <Image
                source={{ uri: photoUrl }}
                className="h-[102px] w-[102px] rounded-full"
              />
            ) : (
              <UserRound
                size={48}
                color={colors.muted}
                strokeWidth={1.7}
              />
            )}
          </View>

          {/* Camera */}
          <Pressable
            onPress={uploadPhoto}
            className="absolute bottom-[3px] right-[-2px] h-[30px] w-[30px] items-center justify-center rounded-full border-[3px]"
            style={{
              backgroundColor: colors.ink,
              borderColor: colors.paper,
            }}
          >
            <Camera
              size={14}
              color="#fff"
              strokeWidth={2.4}
            />
          </Pressable>
        </View>

        {/* Name */}
        <Text
          className="text-[21px] font-extrabold"
          style={{ color: colors.ink }}
        >
          {profile
            ? `${profile.firstName} ${profile.lastName}`
            : 'Crew Member'}
        </Text>

        {/* Role */}
        <View
          className="mt-2 flex-row items-center rounded-full border px-[10px] py-[5px]"
          style={{
            backgroundColor: colors.cream,
            borderColor: colors.line,
            gap: 5,
          }}
        >
          <ShieldCheck
            size={13}
            color={colors.amber}
            strokeWidth={2.4}
          />

          <Text
            className="text-[11px] font-extrabold"
            style={{ color: colors.ink }}
          >
            {profile?.rank ?? 'Rank not set'}
          </Text>
        </View>

        {/* Subtitle */}
        <Text
          className="mt-[7px] text-[11px]"
          style={{ color: colors.muted }}
        >
          {uploadingPhoto
            ? 'Uploading photo...'
            : photoMessage ||
              'CrewSwap Member'}
        </Text>
      </View>

      {/* Qualifications Header */}
      <View className="mx-5 mb-[13px] flex-row items-center justify-between">
        <View>
          <Text
            className="text-[15px] font-extrabold"
            style={{ color: colors.ink }}
          >
            Fleet Qualifications
          </Text>

          <Text
            className="mt-[3px] text-[10.5px]"
            style={{ color: colors.muted }}
          >
            Aircraft you are qualified to operate
          </Text>
        </View>

        {/* Count */}
        <View
          className="h-7 min-w-7 items-center justify-center rounded-full px-[7px]"
          style={{
            backgroundColor: colors.cream,
          }}
        >
          <Text
            className="text-[11px] font-extrabold"
            style={{ color: colors.ink }}
          >
            {qualifiedFleets.length}
          </Text>
        </View>
      </View>

      {/* Fleet Chips */}
      <View className="mb-[25px] flex-row flex-wrap gap-[9px] px-5">
        {qualifiedFleets.map((fleet) => {
          return (
            <View
              key={fleet}
              className="h-[38px] min-w-[72px] flex-row items-center justify-center rounded-[12px] border px-[13px]"
              style={{
                backgroundColor: colors.amber,
                borderColor: colors.amber,
                gap: 5,
              }}
            >
              <CheckCircle2
                size={13}
                color="#fff"
                strokeWidth={2.5}
              />

              <Text
                className="text-[11px] font-extrabold"
                style={{
                  color: '#fff',
                }}
              >
                {fleet}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Qualification Error */}
      {qualifications.error ? (
        <Text
          className="mx-5 mb-[18px] mt-[-15px] text-[11px]"
          style={{ color: colors.red }}
        >
          {qualifications.error}
        </Text>
      ) : null}

      {/* Swap Activity */}
      <View className="mx-5 mb-[13px] mt-[7px]">
        <Text
          className="text-[15px] font-extrabold"
          style={{ color: colors.ink }}
        >
          Swap Activity
        </Text>

        <Text
          className="mt-[3px] text-[10.5px]"
          style={{ color: colors.muted }}
        >
          Your CrewSwap overview
        </Text>
      </View>

      {/* Statistics */}
      <View className="mb-[27px] flex-row gap-3 px-5">

        {/* Active */}
        <View
          className="min-h-[92px] flex-1 flex-row items-center rounded-[16px] border p-[14px]"
          style={{
            backgroundColor: colors.paper,
            borderColor: colors.line,
            gap: 11,
          }}
        >
          <View
            className="h-[38px] w-[38px] items-center justify-center rounded-[12px]"
            style={{
              backgroundColor: colors.cream,
            }}
          >
            <Plane
              size={18}
              color={colors.amber}
              strokeWidth={2.2}
            />
          </View>

          <View className="flex-1">
            <Text
              className="text-[23px] font-extrabold leading-[26px]"
              style={{ color: colors.ink }}
            >
              {activeSwaps}
            </Text>

            <Text
              className="mt-[3px] text-[10.5px] font-semibold"
              style={{ color: colors.muted }}
            >
              Active Swaps
            </Text>
          </View>
        </View>

        {/* Completed */}
        <View
          className="min-h-[92px] flex-1 flex-row items-center rounded-[16px] border p-[14px]"
          style={{
            backgroundColor: colors.paper,
            borderColor: colors.line,
            gap: 11,
          }}
        >
          <View className="h-[38px] w-[38px] items-center justify-center rounded-[12px] bg-[#EAF7EF]">
            <CheckCircle2
              size={18}
              color={colors.green}
              strokeWidth={2.2}
            />
          </View>

          <View className="flex-1">
            <Text
              className="text-[23px] font-extrabold leading-[26px]"
              style={{ color: colors.ink }}
            >
              {completedSwaps}
            </Text>

            <Text
              className="mt-[3px] text-[10.5px] font-semibold"
              style={{ color: colors.muted }}
            >
              Completed
            </Text>
          </View>
        </View>
      </View>

      {/* Account */}
      <View className="mx-5 mb-[13px] mt-[7px]">
        <Text
          className="text-[15px] font-extrabold"
          style={{ color: colors.ink }}
        >
          Account
        </Text>

        <Text
          className="mt-[3px] text-[10.5px]"
          style={{ color: colors.muted }}
        >
          Manage your CrewSwap account
        </Text>
      </View>

      {/* Account Menu */}
      <View
        className="mx-5 overflow-hidden rounded-[18px] border"
        style={{
          backgroundColor: colors.paper,
          borderColor: colors.line,
        }}
      >
        {menu.map(
          (
            {
              label,
              description,
              path,
              icon: Icon,
            },
            index
          ) => {
            const isLast =
              index === menu.length - 1;

            return (
              <Pressable
                key={label}
                onPress={() =>
                  router.push(path as never)
                }
                className={`min-h-[69px] flex-row items-center justify-between px-[14px] ${
                  !isLast ? 'border-b' : ''
                }`}
                style={{
                  borderBottomColor:
                    colors.line,
                }}
              >
                {({ pressed }) => (
                  <>
                    <View
                      className="flex-1 flex-row items-center"
                      style={{
                        opacity: pressed
                          ? 0.65
                          : 1,
                      }}
                    >
                      {/* Icon */}
                      <View
                        className="mr-3 h-[38px] w-[38px] items-center justify-center rounded-[11px]"
                        style={{
                          backgroundColor:
                            colors.cream,
                        }}
                      >
                        <Icon
                          size={18}
                          color={colors.ink}
                          strokeWidth={2}
                        />
                      </View>

                      {/* Text */}
                      <View className="flex-1">
                        <Text
                          className="text-[12px] font-extrabold"
                          style={{
                            color: colors.ink,
                          }}
                        >
                          {label}
                        </Text>

                        <Text
                          className="mt-1 text-[9.5px]"
                          style={{
                            color: colors.muted,
                          }}
                        >
                          {description}
                        </Text>
                      </View>
                    </View>

                    <ChevronRight
                      size={18}
                      color={colors.muted}
                      strokeWidth={2}
                    />
                  </>
                )}
              </Pressable>
            );
          }
        )}
      </View>

      {/* Logout */}
      <Pressable
        onPress={logout}
        className="mt-[25px] flex-row items-center self-center rounded-[13px] border px-[18px] py-[11px]"
        style={{
          backgroundColor: '#FFF3F3',
          borderColor: '#F6DADA',
        }}
      >
        {({ pressed }) => (
          <View
            className="flex-row items-center"
            style={{
              opacity: pressed ? 0.6 : 1,
              gap: 8,
            }}
          >
            <View className="items-center justify-center">
              <LogOut
                size={17}
                color={colors.red}
                strokeWidth={2.2}
              />
            </View>

            <Text
              className="text-[12px] font-extrabold"
              style={{ color: colors.red }}
            >
              Log out
            </Text>
          </View>
        )}
      </Pressable>

      {/* Version */}
      <Text
        className="mb-[18px] mt-[14px] text-center text-[9px]"
        style={{ color: colors.muted }}
      >
        CrewSwap - Account
      </Text>
    </Screen>
  );
}
