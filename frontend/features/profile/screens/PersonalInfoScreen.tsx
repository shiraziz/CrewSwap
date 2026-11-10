import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Save } from 'lucide-react-native';

import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

import {
  Button,
  Field,
  Header,
  Screen,
} from '@/components/ui';

import { FleetQualificationSelect } from '@/components/FleetQualificationSelect';

const fallbackFleets = [
  'A320',
  'A330',
  'A350',
  'B737',
  'B777',
  'B787',
];

export default function PersonalInfo() {
  const auth = useAuth();

  const [firstName, setFirstName] = useState(
    auth.profile?.firstName ?? '',
  );

  const [lastName, setLastName] = useState(
    auth.profile?.lastName ?? '',
  );

  const [rank, setRank] = useState(
    auth.profile?.rank ?? 'FA',
  );

  const [fleets, setFleets] =
    useState<string[]>(fallbackFleets);

  const [selectedFleets, setSelectedFleets] =
    useState<string[]>([]);

  const [qualificationOpen, setQualificationOpen] =
    useState(false);

  const [error, setError] = useState('');

  const [saving, setSaving] = useState(false);

  /* =========================================================
     LOAD PROFILE + FLEET QUALIFICATIONS
  ========================================================= */

  useEffect(() => {
    const loadQualifications = async () => {
      try {
        const items = await api<{ fleet: string }[]>(
          '/qualifications/me',
        );

        /*
         * Single fleet only.
         *
         * If the backend returns several fleets,
         * we keep only the first one.
         */
        setSelectedFleets(
          items.length > 0
            ? [items[0].fleet]
            : [],
        );
      } catch {
        setSelectedFleets([]);
      }
    };

    const loadFleets = async () => {
      try {
        const result = await api<string[]>(
          '/reference/fleets',
        );

        setFleets(result);
      } catch {
        setFleets(fallbackFleets);
      }
    };

    loadQualifications();
    loadFleets();
  }, []);

  /* =========================================================
     SELECT FLEET
  ========================================================= */

  const selectFleet = (fleet: string) => {
    /*
     * IMPORTANT:
     * Only one fleet can be selected.
     *
     * A350 -> B777
     * Result = ['B777']
     */
    setSelectedFleets([fleet]);

    /*
     * Close dropdown after selection.
     */
    setQualificationOpen(false);
  };

  /* =========================================================
     REMOVE FLEET
  ========================================================= */

  const removeFleet = (fleet: string) => {
    setSelectedFleets((current) =>
      current.filter((item) => item !== fleet),
    );
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const save = async () => {
    setError('');

    if (
      !firstName.trim() ||
      !lastName.trim()
    ) {
      setError(
        'First name and last name are required.',
      );
      return;
    }

    setSaving(true);

    try {
      /* =============================================
         UPDATE PROFILE
      ============================================= */

      await api('/profile/me', {
        method: 'PATCH',
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          rank,
        }),
      });

      /* =============================================
         UPDATE FLEET QUALIFICATION
         
         selectedFleets contains:
         []       OR
         ['A350'] OR
         ['B777']
         
         Never more than one fleet.
      ============================================= */

      await api('/qualifications/me', {
        method: 'PUT',
        body: JSON.stringify({
          fleets: selectedFleets,
        }),
      });

      /* =============================================
         REFRESH AUTH PROFILE
      ============================================= */

      await auth.refreshMe();

      router.back();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not save your profile.',
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <Screen scroll>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <Header
        title="Personal Information"
        back={() => router.back()}
      />

      <View className="px-5">

        {/* ===================================================
            FIRST NAME
        =================================================== */}

        <Field
          label="First Name"
          placeholder="Enter your first name"
          value={firstName}
          onChangeText={setFirstName}
        />

        {/* ===================================================
            LAST NAME
        =================================================== */}

        <Field
          label="Last Name"
          placeholder="Enter your last name"
          value={lastName}
          onChangeText={setLastName}
        />

        {/* ===================================================
            EMAIL
        =================================================== */}

        <Field
          label="Email"
          placeholder="Email"
          value={auth.user?.email ?? ''}
          editable={false}
        />

        {/* ===================================================
            CREW RANK
        =================================================== */}

        <Field
          label="Crew Rank"
          placeholder="FA, FO, CP..."
          value={rank}
          onChangeText={(value) =>
            setRank(value.toUpperCase())
          }
          autoCapitalize="characters"
        />

        {/* ===================================================
            FLEET QUALIFICATIONS
        =================================================== */}

        <Text className="mb-3 text-sm font-extrabold text-ink">
          Fleet Qualifications
        </Text>

        <FleetQualificationSelect
          options={fleets}
          selected={selectedFleets}
          open={qualificationOpen}

          onOpen={() =>
            setQualificationOpen(true)
          }

          onClose={() =>
            setQualificationOpen(false)
          }

          /*
           * Single selection:
           * selecting a new fleet replaces
           * the previous one.
           */
          onSelect={selectFleet}

          onRemove={removeFleet}
        />

        {/* ===================================================
            ERROR
        =================================================== */}

        {error ? (
          <Text className="mb-3 text-xs text-red">
            {error}
          </Text>
        ) : null}

        {/* ===================================================
            SAVE BUTTON
        =================================================== */}

        <View className="mt-3.5">

          <Button
            title={
              saving
                ? 'Saving...'
                : 'Save Changes'
            }
            icon={Save}
            onPress={save}
          />

        </View>

      </View>
    </Screen>
  );
}