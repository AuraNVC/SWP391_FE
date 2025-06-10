import React from "react";
import "../styles/Manager.css";
import { FaCheck, FaTimes } from "react-icons/fa";

const staffList = [
  { name: "Alice", position: "Loreal", email: "alice@example.com", phone: "0123456789", date: "2020-03-11" },
  { name: "Bob", position: "Olay", email: "alice@example.com", phone: "0123456789", date: "2020-03-22" },
  { name: "Shouma", position: "Acnes", email: "alice@example.com", phone: "0123456789", date: "2019-07-30" },
  { name: "John", position: "La Roche-Posay", email: "alice@example.com", phone: "0123456789", date: "2022-01-10" },
];

const Manager = () => {
  return (
    <div className="admin-main">
      <div className="admin-header">
        <button className="admin-btn">+ Create New Staff</button>
        <input className="admin-search" type="text" placeholder="Search..." />
      </div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Contact email</th>
              <th>Phone Number</th>
              <th>Date of joining</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff, idx) => (
              <tr key={idx}>
                <td>{staff.name}</td>
                <td>{staff.position}</td>
                <td>{staff.email}</td>
                <td>{staff.phone}</td>
                <td>{staff.date}</td>
                <td>
                  <button className="admin-action-btn admin-action-accept">
                    <FaCheck />
                  </button>
                  <button className="admin-action-btn admin-action-reject">
                    <FaTimes />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Manager;