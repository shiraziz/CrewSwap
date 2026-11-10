export const endpoints = {
  auth: {
    me: '/auth/me',
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    changePassword: '/auth/change-password',
  },
  profile: {
    me: '/profile/me',
    photo: '/profile/photo',
    qualifications: '/qualifications/me',
  },
  reference: {
    fleets: '/reference/fleets',
    ranks: '/reference/ranks',
    accommodations: '/reference/accommodations',
  },
  flights: '/flights',
  flightSwaps: '/flight-swaps',
  leaveSwaps: '/leave-swaps',
  accommodationSwaps: '/accommodation-swaps',
  matches: '/matches',
  requests: '/requests',
  roster: '/roster',
  notifications: '/notifications',
} as const;
