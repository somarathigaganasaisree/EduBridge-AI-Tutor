import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { api } from "../api/client";
import "./Home.css";
import ChatbotWidget from "../components/ChatbotWidget";

function Home({ view }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentView =
    view ||
    (location.pathname === "/profile"
      ? "profile"
      : location.pathname === "/performance"
      ? "performance"
      : "dashboard");

  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("edubridge_user") || '{"username":"Student","email":""}'));
  const [performance, setPerformance] = useState(null);
  const [progress, setProgress] = useState(null);
  const [gradeName, setGradeName] = useState(user.grade || user.grade_id || "");

  const [usernameInput, setUsernameInput] = useState(user.username);
  const [passwordInput, setPasswordInput] = useState("");
  const [usernameMsg, setUsernameMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [picMsg, setPicMsg] = useState("");

  useEffect(() => {
    Promise.all([api.get("/profiles/me"), api.get("/performance/summary"), api.get("/progress/me"), api.get("/grades/")])
      .then(([profile, performanceSummary, progressSummary, grades]) => {
        setUser(profile);
        setPerformance(performanceSummary);
        setProgress(progressSummary);
        setGradeName(grades.find((grade) => grade.id === profile.grade_id)?.name || profile.grade_id || "");
        localStorage.setItem("edubridge_user", JSON.stringify(profile));
      })
      .catch(() => {});
  }, []);

  const handleUpdateUsername = (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    setUsernameMsg("Username changes are managed by authentication.");
    setTimeout(() => setUsernameMsg(""), 3000);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!passwordInput) return;
    setPasswordMsg("Password changes are managed by authentication.");
    setTimeout(() => setPasswordMsg(""), 3000);
  };

  const handlePicUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      api.put("/profiles/me", { profile_image_url: reader.result })
        .then((updated) => {
          setUser(updated);
          localStorage.setItem("edubridge_user", JSON.stringify(updated));
          setPicMsg("Profile picture updated!");
        })
        .catch((requestError) => setPicMsg(requestError.message));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation - EXACTLY 3 OPTIONS */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>EduBridge</h2>
          <span>AI Tutor</span>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/home"
            className={`sidebar-link ${currentView === "dashboard" ? "active" : ""}`}
          >
            <span className="sidebar-icon">📊</span>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/performance"
            className={`sidebar-link ${currentView === "performance" ? "active" : ""}`}
          >
            <span className="sidebar-icon">📈</span>
            <span>Performance Analysis</span>
          </Link>

          <Link
            to="/profile"
            className={`sidebar-link ${currentView === "profile" ? "active" : ""}`}
          >
            <span className="sidebar-icon">👤</span>
            <span>Profile</span>
          </Link>
        </nav>
      </aside>

      {/* Main View Container */}
      <main className="dashboard-main">
        {/* 1. DASHBOARD VIEW */}
        {currentView === "dashboard" && (
          <>
            <header className="dashboard-header">
              <div>
                <h1>Welcome back, {user.username}!</h1>
                <p className="dashboard-subtitle">
                  Current Grade: <strong>Grade {gradeName}</strong>
                </p>
              </div>
            </header>

            {/* Basic Performance Summary Cards */}
            <div className="dashboard-cards-grid">
              <div className="dashboard-card">
                <h3>Overall Progress</h3>
                <div className="stat-large">{Math.round(progress?.average_completion || 0)}%</div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${progress?.average_completion || 0}%` }}></div>
                </div>
                <p className="stat-desc">{progress?.total_modules_tracked || 0} modules tracked</p>
              </div>

              <div className="dashboard-card">
                <h3>Quiz Performance</h3>
                <div className="stat-large">{Math.round(performance?.accuracy || 0)}%</div>
                <p className="stat-highlight">Average Score</p>
                <p className="stat-desc">{performance?.total_attempts || 0} attempts</p>
              </div>

              <div className="dashboard-card">
                <h3>Learning Statistics</h3>
                <div className="stat-list">
                  <div className="stat-item">
                    <span>Weekly Hours</span>
                    <strong>{progress?.average_mastery || 0}%</strong>
                  </div>
                  <div className="stat-item">
                    <span>Topics Mastered</span>
                    <strong>{progress?.total_modules_tracked || 0} Modules</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* THREE MAIN DASHBOARD CONTENT OPTIONS: [ Learn ] [ Quiz ] [ Assignment ] */}
            <div className="dashboard-section">
              <h2>What would you like to do?</h2>
              <div className="dashboard-options-grid">
                <div
                  className="dashboard-action-card"
                  onClick={() => navigate(`/learn/${user.grade_id || user.grade}`)}
                >
                  <div className="action-card-header">
                    <span className="action-icon">📖</span>
                    <h3>Learn</h3>
                  </div>
                  <p>Study topics and learning materials</p>
                  <button
                    className="start-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/learn/${user.grade_id || user.grade}`);
                    }}
                  >
                    Start Learning
                  </button>
                </div>

                <div
                  className="dashboard-action-card"
                  onClick={() => navigate(`/quiz/${user.grade_id || user.grade}`)}
                >
                  <div className="action-card-header">
                    <span className="action-icon">📝</span>
                    <h3>Quiz</h3>
                  </div>
                  <p>Practice and test your knowledge</p>
                  <button
                    className="start-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/quiz/${user.grade}`);
                    }}
                  >
                    Take Quiz
                  </button>
                </div>

                <div
                  className="dashboard-action-card"
                  onClick={() => navigate(`/assessment/${user.grade}`)}
                >
                  <div className="action-card-header">
                    <span className="action-icon">🎓</span>
                    <h3>Assignment</h3>
                  </div>
                  <p>Check your overall understanding</p>
                  <button
                    className="start-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/assessment/${user.grade}`);
                    }}
                  >
                    Start Assignment
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 2. PERFORMANCE ANALYSIS VIEW */}
        {currentView === "performance" && (
          <>
            <header className="dashboard-header">
              <div>
                <h1>Performance Analysis</h1>
                <p className="dashboard-subtitle">
                  Student Performance Overview • <strong>Grade {gradeName}</strong>
                </p>
              </div>
            </header>

            <div className="performance-summary-grid">
              <div className="dashboard-card">
                <h3>Overall Progress</h3>
                <div className="stat-large">{Math.round(progress?.average_completion || 0)}%</div>
                <p className="stat-desc">Completed across Grade {gradeName}</p>
              </div>

              <div className="dashboard-card">
                <h3>Lessons Completed</h3>
                <div className="stat-large">{progress?.total_modules_tracked || 0}</div>
                <p className="stat-desc">Modules tracked</p>
              </div>

              <div className="dashboard-card">
                <h3>Quiz Performance</h3>
                <div className="stat-large">{Math.round(performance?.accuracy || 0)}%</div>
                <p className="stat-desc">Average score across quizzes</p>
              </div>

              <div className="dashboard-card">
                <h3>Assignment Score</h3>
                <div className="stat-large">{Math.round(progress?.average_mastery || 0)}%</div>
                <p className="stat-desc">Average module mastery</p>
              </div>
            </div>

            <div className="dashboard-section performance-section">
              <h2>Subject Learning Progress</h2>
              <div className="subject-perf-list">
                {(performance?.module_performances || []).map((record) => (
                  <div className="subject-perf-item" key={record.id}>
                    <div className="subject-perf-info">
                      <span className="subject-perf-name">Module {record.module_id || "Overall"}</span>
                      <span className="subject-perf-stats">{record.correct_answers} / {record.total_questions} correct</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${record.accuracy || 0}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-section performance-section">
              <h2>Recent Quiz & Assignment Results</h2>
              <div className="quiz-history-list">
                {(progress?.progress_records || []).map((record) => (
                  <div className="quiz-history-row" key={record.id}>
                    <div><h4 className="quiz-title">Module {record.module_id} progress</h4></div>
                    <div className="quiz-score-box"><span className="quiz-score">{record.mastery_score}%</span></div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 3. PROFILE VIEW */}
        {currentView === "profile" && (
          <>
            <header className="dashboard-header">
              <div>
                <h1>Student Profile</h1>
                <p className="dashboard-subtitle">Manage your account details</p>
              </div>
            </header>

            <div className="profile-container-card">
              {/* Profile Picture Upload & Display */}
              <div className="profile-picture-section">
                <div className="avatar-preview">
                  {user.profile_image_url ? (
                    <img src={user.profile_image_url} alt="Profile Avatar" className="avatar-img" />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.username ? user.username.charAt(0).toUpperCase() : "S"}
                    </div>
                  )}
                </div>

                <div className="avatar-actions">
                  <input
                    type="file"
                    accept="image/*"
                    id="profile-pic-upload"
                    style={{ display: "none" }}
                    onChange={handlePicUpload}
                  />
                  <label htmlFor="profile-pic-upload" className="profile-btn-small">
                    Change Picture
                  </label>
                  {picMsg && <span className="profile-status-msg">{picMsg}</span>}
                </div>
              </div>

              {/* Profile Fields List */}
              <div className="profile-fields-list">
                {/* Username with specific Update button */}
                <div className="profile-field-group">
                  <label className="profile-label">Username</label>
                  <div className="profile-input-inline">
                    <input
                      type="text"
                      className="profile-input"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="profile-btn-small"
                      onClick={handleUpdateUsername}
                    >
                      Update Username
                    </button>
                  </div>
                  {usernameMsg && <span className="profile-status-msg">{usernameMsg}</span>}
                </div>

                {/* Password with specific Update button */}
                <div className="profile-field-group">
                  <label className="profile-label">Password</label>
                  <div className="profile-input-inline">
                    <input
                      type="password"
                      className="profile-input"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="profile-btn-small"
                      onClick={handleUpdatePassword}
                    >
                      Update Password
                    </button>
                  </div>
                  {passwordMsg && <span className="profile-status-msg">{passwordMsg}</span>}
                </div>

                {/* Email - READ-ONLY */}
                <div className="profile-field-group">
                  <label className="profile-label">
                    Email <span className="readonly-tag">(Cannot be edited)</span>
                  </label>
                  <input
                    type="email"
                    className="profile-input disabled"
                    value={user.email}
                    disabled
                  />
                </div>

                {/* Grade - READ-ONLY */}
                <div className="profile-field-group">
                  <label className="profile-label">
                    Grade <span className="readonly-tag">(Cannot be edited from Profile)</span>
                  </label>
                  <input
                    type="text"
                    className="profile-input disabled"
                    value={`Grade ${gradeName}`}
                    disabled
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* AI Doubt Solver */}
      <ChatbotWidget grade={user?.grade_id} />
    </div>
  );
}

export default Home;