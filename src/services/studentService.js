const API_URL = 'http://localhost:8080/api';

export const getStudentsByParentId = async (parentId) => {
  try {
    const response = await fetch(`${API_URL}/student/parent/${parentId}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
}; 