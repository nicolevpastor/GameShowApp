import { useState, useEffect } from 'react'
import './App.css'
import React from "react"
import Box from '@mui/material/Box';
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Modal from '@mui/material/Modal';


//TEAMS
const frenchTeams = ["Paris SG", "Marseille", "Lyon", "AS Monaco", "Lille",
  "Rennes", "Nice", "Nantes", "Toulouse"];


 // const englishTeams = [ "Birmingham City",  "Bristol City", "Charlton Athletic",
  //  "Hull City", "Ipswich Town", "Leicester City", "Middlesbrough" ];
const englishTeams = [
  "Leicester",
  "Bristol City",
  "Hull City",
  "Middlesbrough",
  "Sunderland",
  "West Brom",
  "Stoke City",
  "Coventry City"
];
function App() {
  // const [count, setCount] = useState(0)
//frenchTeams = ["Arsenal", "Chelsea", ""]

const [league, setLeague] = useState("");
const [selectedTeam, setSelectedTeam] = useState(null);
const [teamData, setTeamData] = useState(null);
const [question, setQuestion] = useState("");
const [correctAnswer, setCorrectAnswer] = useState("");
const [score, setScore] = useState(0);
const [gameStarted, setGameStarted] = useState(false);
const [choices, setChoices] = useState([]);
const [modalOpen, setModalOpen] = useState(false);
const [modalMessage, setModalMessage] = useState("");
const [showInstructions, setShowInstructions] = useState(true);
const [questionCount, setQuestionCount] = useState(0);
const [gameTimer, setGameTimer] = useState(60);

const stuffs = {fieldA: "somevalue", fieldB: 70}
const [stuff, setStuff] = useState(stuffs);



// async function getData(){
//     const response= await fetch(`https://api.ipgeolocation.io/v2/astronomy?apiKey=1912bf22fd64476e831969b2cf254d02&fields=latitude&location=${name}`, requestOptions)
//     const data = await response.json();
//     setAstroData(data);

//}
  // countdown timer  ends game when timer hits 0
  useEffect(() => {
    if (!gameStarted || gameTimer <= 0) return;

    const interval = setInterval(() => {
      setGameTimer(prev => {
        if (prev <= 1) {
          setGameStarted(false);
          setModalMessage("⏳ Time's up. Final score: " + score);
          setModalOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted]);

    // update league when user selects dropdown
  function handleLeagueChange(e) {
    setLeague(e.target.value);
  }
  // shuffles an array randomly

  function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  //starting Game
  //TIMER, SCORE IS SET TO 0, COUNT = 0 , STARTING TRIVIA(QUESTIONS)
  function startGame() {
    setScore(0);
    setGameTimer(30);
    setGameStarted(true);
    setQuestionCount(0);
    startTrivia();
  }

  //user choice determines if selected is correct or incorrect 
  function handleChoiceClick(choice) {
    if (choice === correctAnswer) {
      setScore(score + 1);
      setModalMessage("Correct!");
    } else {
      setModalMessage("Incorrect!");
    }
    // clear current question and show modal
    setQuestion("");
  setChoices([]);
    setModalOpen(true);
  }
  // closes modal and starts next question OR ends game
  function handleCloseModal() {
    setModalOpen(false);

      setTimeout(() => {
    if (gameTimer > 0 && gameStarted) {
      if (questionCount < 4) {
        startTrivia(); // start the next one
      } else {
        setGameStarted(false);
        setModalMessage(`🎉 Game Over! You scored ${score} out of 4`);
        setModalOpen(true);
      }
    }
  }, 100);
}

  // main function to fetch team and create question

  async function startTrivia() {
    if (!league) {
      alert("Please select a league!");
      return;

    }

    setChoices([]);
    const teamArray = league === "english" ? englishTeams : frenchTeams;
    const randomIndex = Math.floor(Math.random() * teamArray.length);
    const teamName = teamArray[randomIndex];
    setSelectedTeam(teamName);

    try {
      const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamName)}`);
     // const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=Marseille`);
      const data = await response.json();
    const team = data.teams ? data.teams[0] : null;
// no data found for team
    if (!team) {
      alert(`⚠️ Could not find data for: ${teamName}. Trying another team...`);
      startTrivia(); //starting next one
      return;
    }

    //only asking questions about stadium and when it was founded
    const { strStadium, intFormedYear } = team;

//     if (!strStadium || !intFormedYear) {
//       alert(`⚠️ Skipping ${team.strTeam} — missing data.
// Stadium: ${strStadium || ""}
// Year: ${intFormedYear || ""}`);
//       startTrivia();
//       return;
//     }

    setTeamData(team);

    const types = ["stadium", "year"];
    const randType = types[Math.floor(Math.random() * types.length)];

    let ques = "";
    let a = "";

    if (randType === "stadium") {
      ques = `What is the name of ${team.strTeam}'s stadium?`;
      a = team.strStadium; //???
      if(!a){
        //Skip
      }
    } else if (randType === "year") {
      ques = `In what year was ${team.strTeam} founded?`;
      a = team.intFormedYear;
    }

    if (!a || typeof a !== "string" || a.trim() === "") {
      startTrivia();
      return;
    }
      // build answer choices
    const allAnswers = new Set();
    if (a) allAnswers.add(a);

    let safetyCounter = 0;
    while (allAnswers.size < 4 && safetyCounter < 10) {
      const randomTeamName = teamArray[Math.floor(Math.random() * teamArray.length)];
      const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(randomTeamName)}`);
      const resData = await res.json();
      const randTeam = resData.teams ? resData.teams[0] : null;

      let wrongAnswer = null;
      if (randTeam) {
        if (randType === "stadium") wrongAnswer = randTeam.strStadium;
        else if (randType === "year") wrongAnswer = randTeam.intFormedYear;

        if (wrongAnswer && wrongAnswer !== a && typeof wrongAnswer === "string" && wrongAnswer.trim() !== "") {
          allAnswers.add(wrongAnswer);
        }
      }
      safetyCounter++;
    }
//// if 4 choices are generated, set question
    if (allAnswers.size === 4) {
      setQuestion(ques);
      setCorrectAnswer(a);
      setChoices(shuffleArray(Array.from(allAnswers)));
      setQuestionCount(prev => prev + 1);
    } else {
      setModalMessage("Trying again...");
      setModalOpen(true);
      setTimeout(() => {
        if (gameStarted && questionCount < 4) startTrivia();
      }, 800);
      return;
    }
  } catch {
    alert(" Error getting data. Please try again.");
  }
}

  return (
    <Container sx={{ bgcolor: '#fff4e6', fontFamily: 'Sora', minHeight: '100vh', py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#001f3f', letterSpacing: '1px', textShadow: '1px 1px 2px rgba(0,0,0,0.1)', mb: 2 }}>
        Soccer Trivia Game ⚽
      </Typography>
{/* DROPDOWN MENU */}
      <label>Choose League: </label>
      <select value={league} onChange={handleLeagueChange}>
        <option value="">--Select--</option>
        <option value="english">English League Championship</option>
        <option value="french">French Ligue 1</option>
      </select>

      <Button onClick={startGame} variant="contained" sx={{ ml: 2, backgroundColor: '#001f3f', '&:hover': { backgroundColor: '#001530' } }}>
        Start Game
      </Button>

      {gameStarted && (
        <>
           <Typography sx={{ mt: 2 }}>⏱️ Time Left: {gameTimer}s</Typography> 
          <Typography>⭐ Score: {score}</Typography>
        </>
      )}

      {question && (
        <>
          <Typography variant="h6" sx={{ mt: 2 }}>{question}</Typography>
          {choices.map((choice, index) => (
            <Button
              key={index}
              onClick={() => handleChoiceClick(choice)}
              sx={{ m: 1, bgcolor: '#001f3f', color: 'white', '&:hover': { bgcolor: '#001533' } }}
              variant="contained"
              disabled={!gameStarted}
            >
              {choice}
            </Button>
          ))}
        </>
      )}

      {teamData && (
        <Box sx={{ mt: 3 }}>
          <img src={teamData.strTeamBadge} alt="badge" width="100" />
        </Box>
      )}
{/* POP UP MESSAGE - MODAL */}
      {showInstructions && (
        <Modal open={showInstructions} onClose={() => setShowInstructions(false)}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 300, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Welcome to Soccer Trivia Game!</Typography>
            <Typography sx={{ mb: 2 }}>Choose your league, then click Start to begin. You will score points if you get it correct!</Typography>
            <Button onClick={() => setShowInstructions(false)} variant="contained" sx={{ backgroundColor: '#001f3f', color: 'white' }}>
              Let’s Begin
            </Button>
          </Box>
        </Modal>
      )}
{/* NEXT BUTTON  INISDE */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 300, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Typography sx={{ mb: 2 }}>{modalMessage}</Typography>
          <Button onClick={handleCloseModal} variant="contained">Next</Button>
        </Box>
      </Modal>
    </Container>
  );
}

export default App;














































//       <h1>i</h1>

    //   <div>
        
    //     {/* <a href="https://react.dev" target="_blank">
    //       <img src={reactLogo} className="logo react" alt="React logo" />
    //     </a> */}
    //   </div>
    //   <div className="card">
    //     <button onClick={() => setCount((count) => count + 1)}>
    //       count is {count}
    //     </button>
    //     <p>
    //       Edit <code>src/App.jsx</code> and save to test HMR
    //     </p>
    //   </div>
    //   <p className="read-the-docs">
    //     Click on the Vite and React logos to learn more
    //   </p>