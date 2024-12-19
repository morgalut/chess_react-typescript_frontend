// ChessService.tsx
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:5000';

export const getBoard = async () => {
  const response = await axios.get(`${BASE_URL}/board`);
  return response.data;
};

export const makeMove = async (start_pos: string, end_pos: string) => {
  const response = await axios.post(`${BASE_URL}/move`, { start_pos, end_pos });
  return response.data;
};


export const resetGame = async () => {
  const response = await axios.post(`${BASE_URL}/reset`);
  return response.data;
};
