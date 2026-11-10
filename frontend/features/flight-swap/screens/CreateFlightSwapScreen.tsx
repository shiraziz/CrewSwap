import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Send,
} from 'lucide-react-native';

import { api, formatDate } from '@/lib/api';
import {
  Button,
  colors,
  Field,
  Header,
  Screen,
} from '@/components/ui';

type Flight = {
  id: string;
  flightNumber: string;
  date: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  fleet: string;
};

const returnPreferences = [
  {
    label: 'Any Offer',
    value: 'ANY_OFFER',
  },
  {
    label: 'Specific Destinations',
    value: 'SPECIFIC_DESTINATION',
  },
  {
    label: 'Specific Days Off',
    value: 'SPECIFIC_DAYS_OFF',
  },
];

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/* =========================================================
   DATE HELPERS
========================================================= */

function formatDisplayDate(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1,
  ).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function parseDate(value: string): Date | null {
  const parts = value.split('-');

  if (parts.length !== 3) {
    return null;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  const date = new Date(
    year,
    month - 1,
    day,
  );

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function dateValue(value?: string) {
  if (!value) {
    return '';
  }

  /*
   * If the backend returns:
   * 2026-10-05T00:00:00.000Z
   *
   * Keep the actual calendar date:
   * 2026-10-05
   */
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const datePart = value.slice(0, 10);

    if (parseDate(datePart)) {
      return datePart;
    }
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return formatDisplayDate(date);
}

function timeValue(value?: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${String(
    date.getHours(),
  ).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
}

function dateTimeIso(
  date: string,
  time: string,
) {
  const parsed = new Date(
    `${date}T${time || '00:00'}:00`,
  );

  return parsed.toISOString();
}

function splitCodes(value: string) {
  return value
    .split(',')
    .map((item) =>
      item.trim().toUpperCase(),
    )
    .filter(Boolean);
}

function splitDates(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) =>
      new Date(item).toISOString(),
    );
}

function isAirportCode(value: string) {
  return /^[A-Z]{3,4}$/.test(value.trim());
}

function isTime(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim());

  if (!match) return false;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

function buildCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDay = new Date(
    year,
    month,
    1,
  ).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0,
  ).getDate();

  return [
    ...Array(firstDay).fill(null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => index + 1,
    ),
  ];
}

/* =========================================================
   MAIN SCREEN
========================================================= */

export default function FlightSwap() {
  const today = new Date();

  // ======================================================
  // DATA
  // ======================================================

  const [flights, setFlights] = useState<
    Flight[]
  >([]);

  const [fleets, setFleets] = useState<
    string[]
  >([]);

  const [ranks, setRanks] = useState<
    string[]
  >([]);

  // ======================================================
  // FLIGHT DETAILS
  // ======================================================

  const [selectedId, setSelectedId] =
    useState('');

  const [flightDate, setFlightDate] =
    useState('');

  const [origin, setOrigin] =
    useState('');

  const [destination, setDestination] =
    useState('');

  const [departureTime, setDepartureTime] =
    useState('');

  const [arrivalTime, setArrivalTime] =
    useState('');

  const [flightNumber, setFlightNumber] =
    useState('');

  // ======================================================
  // AIRCRAFT & CABIN
  // ======================================================

  const [fleetType, setFleetType] =
    useState('');

  const [crewRank, setCrewRank] =
    useState('FA');

  // ======================================================
  // TRIP DETAILS
  // ======================================================

  const [tripDuration, setTripDuration] =
    useState('1');

  // ======================================================
  // RETURN PREFERENCE
  // ======================================================

  const [
    returnPreference,
    setReturnPreference,
  ] = useState('ANY_OFFER');

  const [
    specificDestinations,
    setSpecificDestinations,
  ] = useState('');

  const [
    specificDaysOff,
    setSpecificDaysOff,
  ] = useState('');

  // ======================================================
  // OTHER
  // ======================================================

  const [note, setNote] =
    useState('');

  const [error, setError] =
    useState('');

  const [submitting, setSubmitting] =
    useState(false);

  // ======================================================
  // CALENDAR
  // ======================================================

  const [calendarVisible, setCalendarVisible] =
    useState(false);

  const [visibleMonth, setVisibleMonth] =
    useState(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      ),
    );

  const [
    calendarSelectedDate,
    setCalendarSelectedDate,
  ] = useState('');

  const calendarDays = useMemo(
    () =>
      buildCalendarDays(
        visibleMonth,
      ),
    [visibleMonth],
  );

  // ======================================================
  // SELECTED FLIGHT
  // ======================================================

  const selected =
    flights.find(
      (flight) =>
        flight.id === selectedId,
    ) ?? null;

  // ======================================================
  // FILL FORM FROM FLIGHT
  // ======================================================

  const fillFromFlight = (
    flight: Flight,
  ) => {
    setSelectedId(flight.id);

    setFlightDate(
      dateValue(flight.date),
    );

    setOrigin(flight.origin);

    setDestination(
      flight.destination,
    );

    setDepartureTime(
      timeValue(
        flight.departureTime,
      ),
    );

    setArrivalTime(
      timeValue(
        flight.arrivalTime,
      ),
    );

    setFlightNumber(
      flight.flightNumber,
    );

    setFleetType(flight.fleet);
  };

  // ======================================================
  // LOAD BACKEND DATA
  // ======================================================

  useEffect(() => {
    Promise.all([
      api<Flight[]>('/flights/my'),
      api<string[]>(
        '/reference/fleets',
      ),
      api<string[]>(
        '/reference/ranks',
      ),
    ])
      .then(
        ([
          flightItems,
          fleetItems,
          rankItems,
        ]) => {
          setFlights(flightItems);
          setFleets(fleetItems);
          const postableRanks = rankItems.filter(
            (rank) =>
              rank !== 'PURSER' &&
              rank !== 'IN_FLIGHT_SUPERVISOR',
          );

          setRanks(postableRanks);

          setFleetType(
            fleetItems[0] ?? '',
          );

          setCrewRank(
            postableRanks.includes('FA')
              ? 'FA'
              : postableRanks[0] ?? '',
          );

          if (flightItems[0]) {
            fillFromFlight(
              flightItems[0],
            );
          }
        },
      )
      .catch((e) => {
        setError(
          e instanceof Error
            ? e.message
            : 'Could not load flight swap data.',
        );
      });
  }, []);

  // ======================================================
  // OPEN CALENDAR
  // ======================================================

  const openFlightDatePicker =
    () => {
      /*
       * If Flight Date already has a value:
       * open the corresponding month
       * and highlight that date.
       */
      if (flightDate) {
        const parsedDate =
          parseDate(flightDate);

        if (parsedDate) {
          setVisibleMonth(
            new Date(
              parsedDate.getFullYear(),
              parsedDate.getMonth(),
              1,
            ),
          );

          setCalendarSelectedDate(
            flightDate,
          );

          setCalendarVisible(true);
          return;
        }
      }

      /*
       * If Flight Date is empty:
       * open current month
       * and highlight today.
       *
       * Today is NOT inserted into the field.
       */
      setVisibleMonth(
        new Date(
          today.getFullYear(),
          today.getMonth(),
          1,
        ),
      );

      setCalendarSelectedDate(
        formatDisplayDate(today),
      );

      setCalendarVisible(true);
    };

  // ======================================================
  // CHOOSE DATE
  // ======================================================

  const chooseFlightDate = (
    day: number,
  ) => {
    const selectedDate =
      new Date(
        visibleMonth.getFullYear(),
        visibleMonth.getMonth(),
        day,
      );

    const formattedDate =
      formatDisplayDate(
        selectedDate,
      );

    setFlightDate(
      formattedDate,
    );

    setCalendarSelectedDate(
      formattedDate,
    );

    setError('');

    setCalendarVisible(false);
  };

  // ======================================================
  // RETURN PREFERENCE
  // ======================================================

  const showConditionalField =
    returnPreference ===
      'SPECIFIC_DESTINATION' ||
    returnPreference ===
      'SPECIFIC_DAYS_OFF';

  const conditionalValue =
    returnPreference ===
    'SPECIFIC_DAYS_OFF'
      ? specificDaysOff
      : specificDestinations;

  const handleReturnPreferenceChange =
    (value: string) => {
      setReturnPreference(value);

      if (
        value === 'ANY_OFFER'
      ) {
        setSpecificDestinations('');
        setSpecificDaysOff('');
      }
    };

  const handleConditionalChange =
    (value: string) => {
      if (
        returnPreference ===
        'SPECIFIC_DAYS_OFF'
      ) {
        setSpecificDaysOff(
          value,
        );
      } else {
        setSpecificDestinations(
          value,
        );
      }
    };

  // ======================================================
  // SUBMIT
  // ======================================================

  const submit = async () => {
    if (submitting) {
      return;
    }

    if (
      !flightDate ||
      !origin ||
      !destination ||
      !departureTime ||
      !arrivalTime ||
      !flightNumber ||
      !fleetType ||
      !crewRank ||
      !tripDuration
    ) {
      setError(
        'Complete all required flight swap fields.',
      );
      return;
    }

    if (
      returnPreference ===
        'SPECIFIC_DESTINATION' &&
      !specificDestinations.trim()
    ) {
      setError(
        'Please enter at least one specific destination.',
      );
      return;
    }

    if (
      returnPreference ===
        'SPECIFIC_DAYS_OFF' &&
      !specificDaysOff.trim()
    ) {
      setError(
        'Please enter at least one specific day off.',
      );
      return;
    }

    /*
     * Validate the selected calendar date.
     */
    if (!parseDate(flightDate)) {
      setError(
        'Please select a valid flight date.',
      );
      return;
    }

    if (!isAirportCode(origin) || !isAirportCode(destination)) {
      setError('Origin and destination must be 3- or 4-letter airport codes, for example TUN or CDG.');
      return;
    }

    if (!isTime(departureTime) || !isTime(arrivalTime)) {
      setError('Departure and arrival times must use the 24-hour HH:MM format, for example 09:30.');
      return;
    }

    const duration = Number(tripDuration);

    if (!Number.isInteger(duration) || duration <= 0) {
      setError('Trip duration must be a positive whole number.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // ==================================================
      // CREATE FLIGHT IF NEEDED
      // ==================================================

      const flightId =
        selectedId ||
        (
          await api<{
            id: string;
          }>('/flights', {
            method: 'POST',

            body: JSON.stringify({
              flightNumber:
                flightNumber
                  .trim()
                  .toUpperCase(),

              date: dateTimeIso(
                flightDate,
                '00:00',
              ),

              origin:
                origin
                  .trim()
                  .toUpperCase(),

              destination:
                destination
                  .trim()
                  .toUpperCase(),

              departureTime:
                dateTimeIso(
                  flightDate,
                  departureTime,
                ),

              arrivalTime:
                dateTimeIso(
                  flightDate,
                  arrivalTime,
                ),

              fleet: fleetType,
            }),
          })
        ).id;

      // ==================================================
      // CREATE FLIGHT SWAP
      // ==================================================

      const swap =
        await api<{
          id: string;
        }>('/flight-swaps', {
          method: 'POST',

          body: JSON.stringify({
            flightId,

            flightDate:
              dateTimeIso(
                flightDate,
                '00:00',
              ),

            origin:
              origin
                .trim()
                .toUpperCase(),

            destination:
              destination
                .trim()
                .toUpperCase(),

            departureTime:
              dateTimeIso(
                flightDate,
                departureTime,
              ),

            arrivalTime:
              dateTimeIso(
                flightDate,
                arrivalTime,
              ),

            flightNumber:
              flightNumber
                .trim()
                .toUpperCase(),

            fleetType,

            crewRank,

            tripDuration: duration,

            returnPreference,

            specificDestinations:
              returnPreference ===
              'SPECIFIC_DESTINATION'
                ? splitCodes(
                    specificDestinations,
                  )
                : [],

            specificDaysOff:
              returnPreference ===
              'SPECIFIC_DAYS_OFF'
                ? splitDates(
                    specificDaysOff,
                  )
                : [],

            note:
              note.trim() ||
              undefined,
          }),
        });

      // ==================================================
      // PUBLISH
      // ==================================================

      await api(
        `/flight-swaps/${swap.id}/publish`,
        {
          method: 'POST',
        },
      );

      router.replace(
        '/(tabs)/matches',
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not publish the swap.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <Screen scroll>
      <Header
        title="Post Flight Swap"
        back={() => router.back()}
      />

      <View className="px-5 pb-8">

        {/* ==================================================
            FLIGHT DETAILS
        ================================================== */}

        <Text className="mb-3.5 mt-2 text-[15px] font-extrabold text-ink">
          Flight Details
        </Text>

        {/* ==================================================
            FLIGHT DATE
        ================================================== */}

        <View className="mb-3.5">
          <Text className="mb-2 text-xs font-bold text-ink">
            Flight Date
          </Text>

          <Pressable
            onPress={
              openFlightDatePicker
            }
            className="h-[50px] flex-row items-center rounded-xl border border-line bg-paper px-3.5"
          >
            <CalendarDays
              size={18}
              color={
                flightDate
                  ? colors.ink
                  : colors.muted
              }
            />

            <TextInput
              value={flightDate}
              editable={false}
              pointerEvents="none"
              placeholder="yyyy-mm-dd"
              placeholderTextColor="#9BA1A8"
              className={`ml-2 flex-1 p-0 text-[14px] font-semibold ${
                flightDate
                  ? 'text-ink'
                  : 'text-muted'
              }`}
            />

            <View className="h-8 w-8 items-center justify-center rounded-lg bg-cream">
              <ChevronRight
                size={16}
                color={colors.muted}
              />
            </View>
          </Pressable>
        </View>

        {/* ==================================================
            ORIGIN / DESTINATION
        ================================================== */}

        <View className="flex-row gap-2.5">
          <View className="flex-1">
            <Field
              label="Origin"
              placeholder="TUN"
              value={origin}
              onChangeText={(value) =>
                setOrigin(
                  value.toUpperCase(),
                )
              }
              autoCapitalize="characters"
            />
          </View>

          <View className="flex-1">
            <Field
              label="Destination"
              placeholder="CDG"
              value={destination}
              onChangeText={(value) =>
                setDestination(
                  value.toUpperCase(),
                )
              }
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* ==================================================
            TIMES
        ================================================== */}

        <View className="flex-row gap-2.5">
          <View className="flex-1">
            <Field
              label="Departure Time"
              placeholder="09:30"
              value={
                departureTime
              }
              onChangeText={
                setDepartureTime
              }
            />
          </View>

          <View className="flex-1">
            <Field
              label="Arrival Time"
              placeholder="11:50"
              value={
                arrivalTime
              }
              onChangeText={
                setArrivalTime
              }
            />
          </View>
        </View>

        {/* ==================================================
            FLIGHT NUMBER
        ================================================== */}

        <Field
          label="Flight Number"
          placeholder="TU123"
          value={
            flightNumber
          }
          onChangeText={(value) =>
            setFlightNumber(
              value.toUpperCase(),
            )
          }
          autoCapitalize="characters"
        />

        {/* ==================================================
            AIRCRAFT & CABIN
        ================================================== */}

        <Text className="mb-1 mt-5 text-[15px] font-extrabold text-ink">
          Aircraft & Cabin
        </Text>

        <Text className="mb-1 mt-3 text-xs font-bold text-ink">
          Fleet Type
        </Text>

        <Text className="mb-2 text-[11px] leading-4 text-muted">
          Select the aircraft fleet.
        </Text>

        <View className="mb-5 flex-row flex-wrap gap-2">
          {fleets.map(
            (fleet) => (
              <Chip
                key={fleet}
                label={fleet}
                active={
                  fleetType ===
                  fleet
                }
                onPress={() =>
                  setFleetType(
                    fleet,
                  )
                }
              />
            ),
          )}
        </View>

        <Text className="mb-1 text-xs font-bold text-ink">
          Crew Rank
        </Text>

        <Text className="mb-2 text-[11px] leading-4 text-muted">
          Select the professional crew rank.
        </Text>

        <View className="mb-5 flex-row flex-wrap gap-2">
          {ranks.map(
            (rank) => (
              <Chip
                key={rank}
                label={rank}
                active={
                  crewRank ===
                  rank
                }
                onPress={() =>
                  setCrewRank(
                    rank,
                  )
                }
              />
            ),
          )}
        </View>

        {/* ==================================================
            TRIP DETAILS
        ================================================== */}

        <Text className="mb-3.5 mt-1 text-[15px] font-extrabold text-ink">
          Trip Details
        </Text>

        <Field
          label="Trip Duration"
          placeholder="1"
          value={
            tripDuration
          }
          onChangeText={
            setTripDuration
          }
          keyboardType="number-pad"
        />

        {/* ==================================================
            RETURN PREFERENCE
        ================================================== */}

        <Text className="mb-1 mt-2 text-[15px] font-extrabold text-ink">
          Return Preference
        </Text>

        <Text className="mb-3 text-[11px] leading-4 text-muted">
          Choose your preferred return option.
        </Text>

        <View className="mb-4 gap-2">
          {returnPreferences.map(
            (preference) => {
              const active =
                returnPreference ===
                preference.value;

              return (
                <Pressable
                  key={
                    preference.value
                  }
                  onPress={() =>
                    handleReturnPreferenceChange(
                      preference.value,
                    )
                  }
                  className={`flex-row items-center rounded-xl border px-4 py-3.5 ${
                    active
                      ? 'border-amber bg-amberSoft'
                      : 'border-line bg-paper'
                  }`}
                >
                  <View
                    className={`mr-3 h-5 w-5 items-center justify-center rounded-full border-2 ${
                      active
                        ? 'border-amber'
                        : 'border-muted'
                    }`}
                  >
                    {active ? (
                      <View className="h-2.5 w-2.5 rounded-full bg-amber" />
                    ) : null}
                  </View>

                  <Text
                    className={`flex-1 text-sm font-bold ${
                      active
                        ? 'text-ink'
                        : 'text-muted'
                    }`}
                  >
                    {
                      preference.label
                    }
                  </Text>
                </Pressable>
              );
            },
          )}
        </View>

        {/* ==================================================
            CONDITIONAL RETURN FIELD
        ================================================== */}

        {showConditionalField ? (
          <Field
            label={
              returnPreference ===
              'SPECIFIC_DESTINATION'
                ? 'Specific Destinations'
                : 'Specific Days Off'
            }
            placeholder="Specific destinations or days off (if applicable)"
            value={
              conditionalValue
            }
            onChangeText={
              handleConditionalChange
            }
          />
        ) : null}

        {/* ==================================================
            NOTE
        ================================================== */}

        <Field
          label="Optional Note"
          placeholder="Add a note for your swap..."
          value={note}
          onChangeText={setNote}
          multiline
        />

        {/* ==================================================
            LINKED ROSTER TRIP
        ================================================== */}

        {selected ? (
          <View className="mb-3 rounded-xl border border-line bg-paper px-3.5 py-3">
            <Text className="text-xs leading-[18px] text-muted">
              Linked to roster trip{' '}
              <Text className="font-bold text-ink">
                {
                  selected.flightNumber
                }
              </Text>{' '}
              on{' '}
              <Text className="font-bold text-ink">
                {formatDate(
                  selected.date,
                )}
              </Text>
              .
            </Text>
          </View>
        ) : null}

        {/* ==================================================
            ERROR
        ================================================== */}

        {error ? (
          <View className="mb-3 rounded-xl border border-red/20 bg-red/5 px-3 py-2.5">
            <Text className="text-xs leading-[18px] text-red">
              {error}
            </Text>
          </View>
        ) : null}

        {/* ==================================================
            PUBLISH
        ================================================== */}

        <Button
          title={
            submitting
              ? 'Publishing...'
              : 'Publish Swap'
          }
          icon={Send}
          onPress={submit}
          disabled={submitting}
        />
      </View>

      {/* ====================================================
          FLIGHT DATE CALENDAR
      ==================================================== */}

      <Modal
        transparent
        visible={calendarVisible}
        animationType="fade"
        onRequestClose={() =>
          setCalendarVisible(false)
        }
      >
        <Pressable
          className="flex-1 items-center justify-center bg-[#17212B]/45 px-5"
          onPress={() =>
            setCalendarVisible(false)
          }
        >
          <Pressable
            className="w-full max-w-[350px] overflow-hidden rounded-[26px] bg-paper p-4"
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            {/* Calendar header */}

            <View className="mb-5 flex-row items-center justify-between">
              <Pressable
                className="h-10 w-10 items-center justify-center rounded-xl bg-cream"
                onPress={() =>
                  setVisibleMonth(
                    new Date(
                      visibleMonth.getFullYear(),
                      visibleMonth.getMonth() -
                        1,
                      1,
                    ),
                  )
                }
              >
                <ChevronLeft
                  size={19}
                  color={colors.ink}
                />
              </Pressable>

              <View className="items-center">
                <Text className="text-[16px] font-extrabold text-ink">
                  {
                    monthNames[
                      visibleMonth.getMonth()
                    ]
                  }{' '}
                  {
                    visibleMonth.getFullYear()
                  }
                </Text>

                <Text className="mt-1 text-[10px] font-medium text-muted">
                  Today ·{' '}
                  {formatDisplayDate(
                    today,
                  )}
                </Text>
              </View>

              <Pressable
                className="h-10 w-10 items-center justify-center rounded-xl bg-cream"
                onPress={() =>
                  setVisibleMonth(
                    new Date(
                      visibleMonth.getFullYear(),
                      visibleMonth.getMonth() +
                        1,
                      1,
                    ),
                  )
                }
              >
                <ChevronRight
                  size={19}
                  color={colors.ink}
                />
              </Pressable>
            </View>

            {/* Week days */}

            <View className="mb-2 flex-row">
              {weekDays.map(
                (day, index) => (
                  <Text
                    key={`${day}-${index}`}
                    className="flex-1 text-center text-[10px] font-extrabold text-muted"
                  >
                    {day}
                  </Text>
                ),
              )}
            </View>

            {/* Calendar days */}

            <View className="flex-row flex-wrap">
              {calendarDays.map(
                (day, index) => {
                  if (!day) {
                    return (
                      <View
                        key={`empty-${index}`}
                        className="aspect-square w-[14.2857%]"
                      />
                    );
                  }

                  const date =
                    new Date(
                      visibleMonth.getFullYear(),
                      visibleMonth.getMonth(),
                      day,
                    );

                  const value =
                    formatDisplayDate(
                      date,
                    );

                  const isSelected =
                    calendarSelectedDate ===
                    value;

                  const isToday =
                    value ===
                    formatDisplayDate(
                      today,
                    );

                  return (
                    <Pressable
                      key={`${day}-${index}`}
                      className="aspect-square w-[14.2857%] items-center justify-center"
                      onPress={() =>
                        chooseFlightDate(
                          day,
                        )
                      }
                    >
                      <View
                        className={`h-9 w-9 items-center justify-center rounded-full ${
                          isSelected
                            ? 'bg-amber'
                            : isToday
                              ? 'border-2 border-amber'
                              : ''
                        }`}
                      >
                        <Text
                          className={`text-[13px] font-bold ${
                            isSelected
                              ? 'text-white'
                              : 'text-ink'
                          }`}
                        >
                          {day}
                        </Text>
                      </View>
                    </Pressable>
                  );
                },
              )}
            </View>

            {/* Footer */}

            <View className="mt-4 border-t border-line pt-3">
              <Text className="text-center text-[10px] font-medium text-muted">
                {calendarSelectedDate
                  ? `Selected · ${calendarSelectedDate}`
                  : `Today · ${formatDisplayDate(
                      today,
                    )}`}
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

/* ==========================================================
   CHIP
========================================================== */

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-[10px] border px-3.5 py-2.5 ${
        active
          ? 'border-amber bg-amberSoft'
          : 'border-line bg-paper'
      }`}
    >
      <Text
        className={`text-xs font-bold ${
          active
            ? 'text-ink'
            : 'text-muted'
        }`}
      >
        {label.replace(
          /_/g,
          ' ',
        )}
      </Text>
    </Pressable>
  );
}
