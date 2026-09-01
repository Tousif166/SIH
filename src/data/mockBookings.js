// Initial seed bookings
const INITIAL_BOOKINGS = [
  {
    id: 'BK001',
    customerId: 'c1',
    customerName: 'Rahul Sharma',
    workerId: 'w1',
    workerName: 'Suresh Kumar',
    workerRating: 4.8,
    workerPhone: '+91 76543 21098',
    serviceId: 'plumbing',
    serviceName: 'Plumbing',
    description: 'Kitchen sink pipe is leaking badly, water dripping continuously',
    address: '12, Sector 45, Gurugram, Haryana',
    date: '2026-09-01',
    time: '10:00 AM',
    status: 'en-route',
    basePrice: 299,
    weatherMultiplier: 1.3,
    weatherCondition: 'Rainy',
    totalPrice: 389,
    fairnessPosition: 1,
    createdAt: '2026-08-31T14:30:00',
    rating: null,
    photos: []
  },
  {
    id: 'BK002',
    customerId: 'c1',
    customerName: 'Rahul Sharma',
    workerId: 'w2',
    workerName: 'Ramesh Yadav',
    workerRating: 4.6,
    workerPhone: '+91 65432 10987',
    serviceId: 'electrical',
    serviceName: 'Electrical',
    description: 'Multiple switches not working in bedroom',
    address: '12, Sector 45, Gurugram, Haryana',
    date: '2026-08-28',
    time: '2:00 PM',
    status: 'completed',
    basePrice: 349,
    weatherMultiplier: 1.0,
    weatherCondition: 'Clear',
    totalPrice: 349,
    fairnessPosition: 2,
    createdAt: '2026-08-27T09:15:00',
    rating: 5,
    photos: []
  },
  {
    id: 'BK003',
    customerId: 'c1',
    customerName: 'Rahul Sharma',
    workerId: 'w3',
    workerName: 'Meena Devi',
    workerRating: 4.9,
    workerPhone: '+91 54321 09876',
    serviceId: 'cleaning',
    serviceName: 'Cleaning',
    description: 'Full house deep cleaning needed before festival',
    address: '12, Sector 45, Gurugram, Haryana',
    date: '2026-08-25',
    time: '9:00 AM',
    status: 'completed',
    basePrice: 499,
    weatherMultiplier: 1.0,
    weatherCondition: 'Clear',
    totalPrice: 499,
    fairnessPosition: 1,
    createdAt: '2026-08-24T18:00:00',
    rating: 5,
    photos: []
  },
  {
    id: 'BK004',
    customerId: 'c2',
    customerName: 'Priya Patel',
    workerId: 'w4',
    workerName: 'Vikram Singh',
    workerRating: 4.5,
    workerPhone: '+91 43210 98765',
    serviceId: 'ac-repair',
    serviceName: 'AC Repair',
    description: 'AC not cooling properly, makes noise',
    address: '34, MG Road, Bengaluru, Karnataka',
    date: '2026-08-30',
    time: '11:00 AM',
    status: 'in-progress',
    basePrice: 399,
    weatherMultiplier: 1.2,
    weatherCondition: 'Hot (>40°C)',
    totalPrice: 479,
    fairnessPosition: 3,
    createdAt: '2026-08-29T16:45:00',
    rating: null,
    photos: []
  },
  {
    id: 'BK005',
    customerId: 'c1',
    customerName: 'Rahul Sharma',
    workerId: null,
    workerName: null,
    workerRating: null,
    workerPhone: null,
    serviceId: 'pest-control',
    serviceName: 'Pest Control',
    description: 'Cockroach problem in kitchen, need full treatment',
    address: '12, Sector 45, Gurugram, Haryana',
    date: '2026-09-03',
    time: '10:00 AM',
    status: 'cancelled',
    basePrice: 799,
    weatherMultiplier: 1.0,
    weatherCondition: 'Clear',
    totalPrice: 799,
    fairnessPosition: null,
    createdAt: '2026-08-30T12:00:00',
    rating: null,
    photos: []
  }
];

// Load persisted or default bookings
function loadStoredBookings() {
  try {
    const saved = localStorage.getItem('sahakar_bookings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading stored bookings:', e);
  }
  return [...INITIAL_BOOKINGS];
}

export let mockBookings = loadStoredBookings();

export function addBooking(bookingData) {
  const newId = `BK00${mockBookings.length + 1}`;
  const newBooking = {
    id: newId,
    customerId: bookingData.customerId || 'c1',
    customerName: bookingData.customerName || 'Rahul Sharma',
    workerId: bookingData.workerId || 'w1',
    workerName: bookingData.workerName || 'Suresh Kumar',
    workerRating: bookingData.workerRating || 4.8,
    workerPhone: bookingData.workerPhone || '+91 76543 21098',
    serviceId: bookingData.serviceId || 'plumbing',
    serviceName: bookingData.serviceName || 'Home Service',
    description: bookingData.description || 'Standard service request',
    address: bookingData.address || '12, Sector 45, Gurugram, Haryana',
    date: bookingData.date || new Date().toISOString().split('T')[0],
    time: bookingData.time || '10:00 AM',
    status: bookingData.status || 'en-route',
    basePrice: bookingData.basePrice || 299,
    weatherMultiplier: bookingData.weatherMultiplier || 1.0,
    weatherCondition: bookingData.weatherCondition || 'Clear',
    totalPrice: bookingData.totalPrice || 389,
    gst: bookingData.gst || Math.round((bookingData.totalPrice || 389) * 0.18),
    welfareCess: bookingData.welfareCess || Math.round((bookingData.totalPrice || 389) * 0.02),
    fairnessPosition: 1,
    createdAt: new Date().toISOString(),
    rating: null,
    photos: bookingData.photos || []
  };

  mockBookings.unshift(newBooking);
  try {
    localStorage.setItem('sahakar_bookings', JSON.stringify(mockBookings));
  } catch (e) {
    console.error('Error saving booking to localStorage:', e);
  }
  return newBooking;
}

export const getBookingsByCustomer = (customerId) => {
  if (!customerId) return mockBookings;
  if (customerId !== 'c1' && customerId !== 'c2') {
    return mockBookings;
  }
  return mockBookings.filter(b => b.customerId === customerId);
};

export const getBookingsByWorker = (workerId) =>
  mockBookings.filter(b => b.workerId === workerId);

export const getActiveBooking = (customerId) =>
  mockBookings.find(b => ['en-route', 'in-progress', 'assigned'].includes(b.status));

