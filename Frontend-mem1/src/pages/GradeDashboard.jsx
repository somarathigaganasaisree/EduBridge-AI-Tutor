import { Link, useParams } from "react-router-dom";
import ChatbotWidget from "../components/ChatbotWidget";
import "./GradeDashboard.css";

function GradeDashboard() {
  const { grade } = useParams();

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1>Grade {grade}</h1>

        <p className="dashboard-subtitle">
          What would you like to do?
        </p>

        <div className="dashboard-options">
          <Link
            to={`/learn/${grade}`}
            className="dashboard-card"
          >
            <h2>Learn</h2>
            <p>Study topics and learning materials</p>
          </Link>

          <Link
            to={`/quiz/${grade}`}
            className="dashboard-card"
          >
            <h2>Quiz</h2>
            <p>Practice your knowledge</p>
          </Link>

          <Link
            to={`/assessment/${grade}`}
            className="dashboard-card"
          >
            <h2>Assessment</h2>
            <p>Check your overall understanding</p>
          </Link>
        </div>
      </div>

      {/* AI CHATBOT */}
      <ChatbotWidget />
    </div>
  );
}

export default GradeDashboard;