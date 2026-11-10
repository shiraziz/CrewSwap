import { useMemo, useState } from 'react';
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
  ArrowRight,
} from 'lucide-react-native';

import { api } from '@/lib/api';
import { Button, colors, Header, Screen } from '@/components/ui';

type DateFieldKey =
  | 'currentStart'
  | 'currentEnd'
  | 'desiredStart'
  | 'desiredEnd';

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
  ).padStart(2, '0')}-${String(date.getDate()).padStart(
    2,
    '0',
  )}`;
}

/**
 * Parse yyyy-mm-dd safely as a LOCAL date.
 *
 * We intentionally do NOT use:
 * new Date("yyyy-mm-dd")
 *
 * because JavaScript interprets that format as UTC,
 * which can cause one-day timezone shifts.
 */
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

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/**
 * Convert yyyy-mm-dd to an ISO date for the API
 * without timezone shifting the selected calendar day.
 *
 * Example:
 * 2026-09-27 -> 2026-09-27T00:00:00.000Z
 */
function toIsoDate(value: string): string | null {
  const date = parseDate(value);

  if (!date) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(
    2,
    '0',
  );
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}T00:00:00.000Z`;
}

function buildCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
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

/**
 * Compare two yyyy-mm-dd dates.
 *
 * Returns:
 * < 0 => first date is before second
 * = 0 => same date
 * > 0 => first date is after second
 */
function compareDates(
  first: string,
  second: string,
) {
  const firstDate = parseDate(first);
  const secondDate = parseDate(second);

  if (!firstDate || !secondDate) {
    return null;
  }

  const firstTime = new Date(
    firstDate.getFullYear(),
    firstDate.getMonth(),
    firstDate.getDate(),
  ).getTime();

  const secondTime = new Date(
    secondDate.getFullYear(),
    secondDate.getMonth(),
    secondDate.getDate(),
  ).getTime();

  return firstTime - secondTime;
}

/* =========================================================
   MAIN SCREEN
========================================================= */

export default function LeaveSwap() {
  const today = new Date();

  /*
   * All date fields are empty by default.
   */
  const [currentStart, setCurrentStart] = useState('');
  const [currentEnd, setCurrentEnd] = useState('');
  const [desiredStart, setDesiredStart] = useState('');
  const [desiredEnd, setDesiredEnd] = useState('');

  /*
   * Currently opened date field.
   */
  const [pickerField, setPickerField] =
    useState<DateFieldKey | null>(null);

  /*
   * Month currently displayed by the calendar.
   */
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    ),
  );

  /*
   * Date highlighted inside the calendar.
   *
   * Important:
   * - If field is empty when opening => today
   * - If field already has a date => that date
   */
  const [calendarSelectedDate, setCalendarSelectedDate] =
    useState('');

  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const dates = {
    currentStart,
    currentEnd,
    desiredStart,
    desiredEnd,
  };

  const setters = {
    currentStart: setCurrentStart,
    currentEnd: setCurrentEnd,
    desiredStart: setDesiredStart,
    desiredEnd: setDesiredEnd,
  };

  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth),
    [visibleMonth],
  );

  /* =========================================================
     OPEN CALENDAR
  ========================================================= */

  const openPicker = (field: DateFieldKey) => {
    setPickerField(field);

    const existingDate = dates[field];

    /*
     * CASE 1:
     * The field already contains a date.
     *
     * Example:
     * currentStart = 2026-10-15
     *
     * When reopening:
     * -> show October 2026
     * -> highlight October 15
     */
    if (existingDate) {
      const parsedDate = parseDate(existingDate);

      if (parsedDate) {
        setVisibleMonth(
          new Date(
            parsedDate.getFullYear(),
            parsedDate.getMonth(),
            1,
          ),
        );

        setCalendarSelectedDate(existingDate);
        return;
      }
    }

    /*
     * CASE 2:
     * Field is empty.
     *
     * -> Open current month
     * -> Highlight today
     *
     * But DON'T put today into the input.
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
  };

  /* =========================================================
     CHOOSE DATE
  ========================================================= */

  const chooseDate = (day: number) => {
    if (!pickerField) {
      return;
    }

    const selectedDate = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      day,
    );

    const formattedDate =
      formatDisplayDate(selectedDate);

    /*
     * Highlight selected date.
     */
    setCalendarSelectedDate(formattedDate);

    /*
     * Save selected date in the correct field.
     */
    setters[pickerField](formattedDate);

    /*
     * Clear previous validation error
     * after changing a date.
     */
    setError('');

    /*
     * Close calendar.
     */
    setPickerField(null);
  };

  /* =========================================================
     VALIDATE DATES
  ========================================================= */

  const validateDates = () => {
    /*
     * Check all fields.
     */
    if (
      !currentStart ||
      !currentEnd ||
      !desiredStart ||
      !desiredEnd
    ) {
      return 'Please select all leave dates.';
    }

    /*
     * Validate date format.
     */
    if (
      !parseDate(currentStart) ||
      !parseDate(currentEnd) ||
      !parseDate(desiredStart) ||
      !parseDate(desiredEnd)
    ) {
      return 'Please enter valid dates in yyyy-mm-dd format.';
    }

    /*
     * CURRENT LEAVE
     *
     * End must be AFTER Start.
     *
     * Example:
     * 2026-09-10 -> 2026-09-12  ✅
     * 2026-09-10 -> 2026-09-10  ❌
     * 2026-09-12 -> 2026-09-10  ❌
     */
    const currentComparison = compareDates(
      currentEnd,
      currentStart,
    );

    if (
      currentComparison === null ||
      currentComparison <= 0
    ) {
      return 'Current leave end date must be after start date.';
    }

    /*
     * DESIRED LEAVE
     *
     * End must be AFTER Start.
     */
    const desiredComparison = compareDates(
      desiredEnd,
      desiredStart,
    );

    if (
      desiredComparison === null ||
      desiredComparison <= 0
    ) {
      return 'Desired leave end date must be after start date.';
    }

    return null;
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const submit = async () => {
    /*
     * Validate BEFORE calling the backend.
     */
    const validationError = validateDates();

    if (validationError) {
      setError(validationError);
      return;
    }

    const currentStartIso =
      toIsoDate(currentStart);

    const currentEndIso =
      toIsoDate(currentEnd);

    const desiredStartIso =
      toIsoDate(desiredStart);

    const desiredEndIso =
      toIsoDate(desiredEnd);

    /*
     * Safety check.
     */
    if (
      !currentStartIso ||
      !currentEndIso ||
      !desiredStartIso ||
      !desiredEndIso
    ) {
      setError(
        'Please select valid dates for your leave swap.',
      );
      return;
    }

    const payload = {
      currentStart: currentStartIso,
      currentEnd: currentEndIso,
      desiredStart: desiredStartIso,
      desiredEnd: desiredEndIso,
      note: note.trim() || undefined,
    };

    setSubmitting(true);
    setError('');

    try {
      /*
       * Create leave swap.
       */
      const swap = await api<{ id: string }>(
        '/leave-swaps',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );

      /*
       * Publish leave swap.
       */
      await api(`/leave-swaps/${swap.id}/publish`, {
        method: 'POST',
      });

      /*
       * Go to matches.
       */
      router.replace('/(tabs)/matches');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not publish the leave swap.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <Screen scroll>
      <Header
        title="Post Leave Swap"
        back={() => router.back()}
      />

      <View className="px-5 pb-8">
        {/* =========================
            CURRENT LEAVE
        ========================== */}

        <SectionHeader
          icon={
            <CalendarDays
              size={17}
              color={colors.ink}
            />
          }
          title="Current Leave"
          subtitle="Your existing leave period"
        />

        <View className="mb-6 rounded-2xl border border-line bg-paper p-3.5">
          <DateField
            label="Start date"
            value={currentStart}
            onCalendarPress={() =>
              openPicker('currentStart')
            }
          />

          <DateField
            label="End date"
            value={currentEnd}
            onCalendarPress={() =>
              openPicker('currentEnd')
            }
            last
          />
        </View>

        {/* =========================
            DESIRED LEAVE
        ========================== */}

        <SectionHeader
          icon={
            <ArrowRight
              size={17}
              color={colors.ink}
            />
          }
          title="Desired Leave"
          subtitle="The dates you'd like instead"
        />

        <View className="mb-6 rounded-2xl border border-line bg-paper p-3.5">
          <DateField
            label="Start date"
            value={desiredStart}
            onCalendarPress={() =>
              openPicker('desiredStart')
            }
          />

          <DateField
            label="End date"
            value={desiredEnd}
            onCalendarPress={() =>
              openPicker('desiredEnd')
            }
            last
          />
        </View>

        {/* =========================
            SWAP PREVIEW
        ========================== */}

        <View className="mb-6 rounded-2xl bg-cream p-4">
          <Text className="mb-3 text-[11px] font-extrabold uppercase tracking-wider text-muted">
            Swap Preview
          </Text>

          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="mb-1 text-[10px] font-semibold text-muted">
                CURRENT
              </Text>

              <Text
                className={`text-[14px] font-extrabold ${
                  currentStart
                    ? 'text-ink'
                    : 'text-muted'
                }`}
              >
                {currentStart || 'yyyy-mm-dd'}
              </Text>

              <Text className="mt-0.5 text-[12px] text-muted">
                to {currentEnd || 'yyyy-mm-dd'}
              </Text>
            </View>

            <View className="mx-3 h-9 w-9 items-center justify-center rounded-full bg-white">
              <ArrowRight
                size={16}
                color={colors.ink}
              />
            </View>

            <View className="flex-1 items-end">
              <Text className="mb-1 text-[10px] font-semibold text-muted">
                DESIRED
              </Text>

              <Text
                className={`text-[14px] font-extrabold ${
                  desiredStart
                    ? 'text-ink'
                    : 'text-muted'
                }`}
              >
                {desiredStart || 'yyyy-mm-dd'}
              </Text>

              <Text className="mt-0.5 text-[12px] text-muted">
                to {desiredEnd || 'yyyy-mm-dd'}
              </Text>
            </View>
          </View>
        </View>

        {/* =========================
            NOTE
        ========================== */}

        <View className="mb-5">
          <Text className="mb-2 text-[13px] font-extrabold text-ink">
            Note
            <Text className="font-medium text-muted">
              {' '}
              · Optional
            </Text>
          </Text>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add a note for your leave swap..."
            placeholderTextColor="#9BA1A8"
            multiline
            textAlignVertical="top"
            className="min-h-[105px] rounded-2xl border border-line bg-paper px-4 py-3.5 text-[14px] text-ink"
          />
        </View>

        {/* =========================
            ERROR
        ========================== */}

        {error ? (
          <View className="mb-4 rounded-xl border border-red/20 bg-red/5 px-4 py-3">
            <Text className="text-[12px] font-semibold text-red">
              {error}
            </Text>
          </View>
        ) : null}

        {/* =========================
            SUBMIT
        ========================== */}

        <Button
          title={
            submitting
              ? 'Publishing...'
              : 'Publish Leave Swap'
          }
          icon={Send}
          onPress={submit}
        />

        <Text className="mt-3 text-center text-[10px] leading-4 text-muted">
          Your swap will be visible to crew members
          looking for compatible leave dates.
        </Text>
      </View>

      {/* =====================================================
          CALENDAR MODAL
      ===================================================== */}

      <Modal
        transparent
        visible={pickerField !== null}
        animationType="fade"
        onRequestClose={() =>
          setPickerField(null)
        }
      >
        <Pressable
          className="flex-1 items-center justify-center bg-[#17212B]/45 px-5"
          onPress={() =>
            setPickerField(null)
          }
        >
          <Pressable
            className="w-full max-w-[350px] overflow-hidden rounded-[26px] bg-paper p-4"
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            {/* =========================
                CALENDAR HEADER
            ========================== */}

            <View className="mb-5 flex-row items-center justify-between">
              {/* Previous month */}

              <Pressable
                className="h-10 w-10 items-center justify-center rounded-xl bg-cream"
                onPress={() =>
                  setVisibleMonth(
                    new Date(
                      visibleMonth.getFullYear(),
                      visibleMonth.getMonth() - 1,
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

              {/* Month */}

              <View className="items-center">
                <Text className="text-[16px] font-extrabold text-ink">
                  {monthNames[
                    visibleMonth.getMonth()
                  ]}{' '}
                  {visibleMonth.getFullYear()}
                </Text>

                <Text className="mt-1 text-[10px] font-medium text-muted">
                  Today ·{' '}
                  {formatDisplayDate(today)}
                </Text>
              </View>

              {/* Next month */}

              <Pressable
                className="h-10 w-10 items-center justify-center rounded-xl bg-cream"
                onPress={() =>
                  setVisibleMonth(
                    new Date(
                      visibleMonth.getFullYear(),
                      visibleMonth.getMonth() + 1,
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

            {/* =========================
                WEEKDAYS
            ========================== */}

            <View className="mb-2 flex-row">
              {weekDays.map((day, index) => (
                <Text
                  key={`${day}-${index}`}
                  className="flex-1 text-center text-[10px] font-extrabold text-muted"
                >
                  {day}
                </Text>
              ))}
            </View>

            {/* =========================
                CALENDAR DAYS
            ========================== */}

            <View className="flex-row flex-wrap">
              {calendarDays.map((day, index) => {
                const date = day
                  ? new Date(
                      visibleMonth.getFullYear(),
                      visibleMonth.getMonth(),
                      day,
                    )
                  : null;

                const value = date
                  ? formatDisplayDate(date)
                  : '';

                /*
                 * Selected date.
                 */
                const selected =
                  calendarSelectedDate === value;

                /*
                 * Today's date.
                 */
                const isToday =
                  !!date &&
                  formatDisplayDate(date) ===
                    formatDisplayDate(today);

                if (!day) {
                  return (
                    <View
                      key={`empty-${index}`}
                      className="aspect-square w-[14.2857%]"
                    />
                  );
                }

                return (
                  <Pressable
                    key={`${day}-${index}`}
                    className="aspect-square w-[14.2857%] items-center justify-center"
                    onPress={() =>
                      chooseDate(day)
                    }
                  >
                    <View
                      className={`h-9 w-9 items-center justify-center rounded-full ${
                        selected
                          ? 'bg-amber'
                          : isToday
                            ? 'border-2 border-amber'
                            : ''
                      }`}
                    >
                      <Text
                        className={`text-[13px] font-bold ${
                          selected
                            ? 'text-white'
                            : 'text-ink'
                        }`}
                      >
                        {day}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* =========================
                CALENDAR FOOTER
            ========================== */}

            <View className="mt-4 border-t border-line pt-3">
              <Text className="text-center text-[10px] font-medium text-muted">
                {calendarSelectedDate
                  ? `Selected · ${calendarSelectedDate}`
                  : `Today · ${formatDisplayDate(today)}`}
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <View className="mb-3 flex-row items-center">
      <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-cream">
        {icon}
      </View>

      <View className="flex-1">
        <Text className="text-[14px] font-extrabold text-ink">
          {title}
        </Text>

        <Text className="mt-0.5 text-[10px] text-muted">
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

/* =========================================================
   DATE FIELD
========================================================= */

function DateField({
  label,
  value,
  onCalendarPress,
  last = false,
}: {
  label: string;
  value: string;
  onCalendarPress: () => void;
  last?: boolean;
}) {
  return (
    <View className={!last ? 'mb-3' : ''}>
      <Text className="mb-1.5 text-[11px] font-bold text-muted">
        {label}
      </Text>

      <Pressable
        onPress={onCalendarPress}
        className="h-[50px] flex-row items-center rounded-xl border border-line bg-cream/40 px-3"
      >
        <CalendarDays
          size={17}
          color={colors.muted}
        />

        <TextInput
          value={value}
          editable={false}
          pointerEvents="none"
          placeholder="yyyy-mm-dd"
          placeholderTextColor="#9BA1A8"
          className={`ml-2 flex-1 p-0 text-[13px] font-bold ${
            value
              ? 'text-ink'
              : 'text-muted'
          }`}
        />

        <Pressable
          onPress={onCalendarPress}
          className="h-9 w-9 items-center justify-center rounded-xl bg-white"
        >
          <ChevronRight
            size={16}
            color={colors.muted}
          />
        </Pressable>
      </Pressable>
    </View>
  );
}