import React, { useState, useEffect } from 'react';

const ParentStudents = () => {
  const [students, setStudents] = useState([]);
  const [prescriptions, setPrescriptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const parentId = localStorage.getItem('userId');
        if (!parentId) {
          throw new Error('Parent ID not found');
        }

        // Fetch students
        const studentsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/student/parent/${parentId}`);
        if (!studentsResponse.ok) {
          throw new Error('Failed to fetch students');
        }
        const studentsData = await studentsResponse.json();
        setStudents(studentsData);

        // Fetch prescriptions for each student
        const prescriptionsData = {};
        for (const student of studentsData) {
          const prescriptionResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/parent-prescription/student/${student.id}`);
          if (prescriptionResponse.ok) {
            const prescriptionData = await prescriptionResponse.json();
            if (prescriptionData.length > 0) {
              prescriptionsData[student.id] = prescriptionData[0]; // Get the latest prescription
            }
          }
        }
        setPrescriptions(prescriptionsData);
      } catch (err) {
        console.error('Error fetching data: ', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
            {students.map((student) => {
              const prescription = prescriptions[student.id];
              return (
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
                      {prescription && (
                        <>
                          <hr />
                          <p className="card-text">
                            <strong>Ngày tạo:</strong> {new Date(prescription.createdDate).toLocaleDateString()}
                          </p>
                          <p className="card-text">
                            <strong>Lịch uống:</strong> {prescription.schedule}
                          </p>
                          <p className="card-text">
                            <strong>Ghi chú:</strong> {prescription.note || 'Không có ghi chú'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default ParentStudents; 