import React, { useState, useEffect } from 'react';

const ParentStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const parentId = localStorage.getItem('userId');
        if (!parentId) {
          throw new Error('Parent ID not found');
        }

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/student/parent/${parentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }

        const data = await response.json();
        setStudents(data);
      } catch (err) {
        console.error('Error fetching students: ', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) {
    return (
      <>
        <div className="container mt-5">
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="container mt-5">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container mt-5">
        <h2 className="mb-4">Danh sách học sinh</h2>
        {students.length === 0 ? (
          <div className="alert alert-info">Không có học sinh nào</div>
        ) : (
          <div className="row">
            {students.map((student) => (
              <div key={student.id} className="col-md-4 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{student.name}</h5>
                    <p className="card-text">
                      <strong>Mã học sinh:</strong> {student.studentCode}
                    </p>
                    <p className="card-text">
                      <strong>Ngày sinh:</strong> {new Date(student.dateOfBirth).toLocaleDateString()}
                    </p>
                    <p className="card-text">
                      <strong>Giới tính:</strong> {student.gender}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ParentStudents; 