import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const bookingService = {
  createBooking: async (bookingData) => {
    const response = await axios.post(`${API_URL}/bookings`, bookingData);
    return response.data;
  },

  getUserBookings: async (userId) => {
    const response = await axios.get(`${API_URL}/bookings/user/${userId}`);
    return response.data;
  }
};