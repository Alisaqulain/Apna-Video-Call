import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const History = () => {
  const [meetings, setMeetings] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("/api/get_all_activity", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setMeetings(data);
        } else {
          setError(data.message || "Failed to fetch history");
        }
      } catch (error) {
        setError("An error occurred. Please try again.");
      }
    };

    fetchHistory();
  }, [navigate]);

  return (
    <div>
      <h1>Meeting History</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {meetings.length > 0 ? (
        meetings.map((meeting) => (
          <div key={meeting._id}>
            <p>Meeting Code: {meeting.meetingCode}</p>
            <p>Date: {new Date(meeting.date).toLocaleString()}</p>
          </div>
        ))
      ) : (
        <p>No meetings found.</p>
      )}
    </div>
  );
};

export default History;