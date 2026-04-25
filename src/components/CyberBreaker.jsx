import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import './CyberBreaker.css';

const CyberBreaker = () => {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  
  // Game loop ke andar accurate score track karne ke liye ref
  const scoreRef = useRef(0);

  // Component load hotay hi leaderboard fetch karo
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/leaderboard');
      setLeaderboard(res.data);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    }
  };

  const saveScoreToDB = async (finalScore) => {
    const visitorName = localStorage.getItem("visitorName");
    
    // Agar naam nahi hai (preloader skip kiya) tou score save mat karo
    if (!visitorName) return;

    try {
      await axios.post('http://localhost:5000/api/score', {
        visitor_name: visitorName,
        score: finalScore
      });
      // Score save hone ke baad leaderboard refresh karo
      fetchLeaderboard();
    } catch (err) {
      console.error("Score save error:", err);
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Game Variables
    let ballRadius = 8;
    let x = canvas.width / 2;
    let y = canvas.height - 30;
    let dx = 3;
    let dy = -3;
    
    let paddleHeight = 10;
    let paddleWidth = 80;
    let paddleX = (canvas.width - paddleWidth) / 2;
    
    let rightPressed = false;
    let leftPressed = false;

    // Bricks (Bugs)
    let brickRowCount = 5;
    let brickColumnCount = 6;
    let brickWidth = 55;
    let brickHeight = 20;
    let brickPadding = 10;
    let brickOffsetTop = 40;
    let brickOffsetLeft = 15;

    let bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }

    // Input Handling
    const keyDownHandler = (e) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
      else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
    };
    const keyUpHandler = (e) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
      else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
    };
    const mouseMoveHandler = (e) => {
      const relativeX = e.clientX - canvas.getBoundingClientRect().left;
      if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
      }
    };

    window.addEventListener('keydown', keyDownHandler, false);
    window.addEventListener('keyup', keyUpHandler, false);
    canvas.addEventListener('mousemove', mouseMoveHandler, false);

    // Collision Detection
    const collisionDetection = () => {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          let b = bricks[c][r];
          if (b.status === 1) {
            if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
              dy = -dy;
              b.status = 0;
              scoreRef.current += 10; // Ref ko update kiya
              setScore(scoreRef.current); // UI ko update kiya
            }
          }
        }
      }
    };

    // Drawing Functions
    const drawBall = () => {
      ctx.beginPath();
      ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#00ffcc';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ffcc';
      ctx.fill();
      ctx.closePath();
    };

    const drawPaddle = () => {
      ctx.beginPath();
      ctx.rect(paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00ffcc';
      ctx.fill();
      ctx.closePath();
    };

    const drawBricks = () => {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          if (bricks[c][r].status === 1) {
            let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
            let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.rect(brickX, brickY, brickWidth, brickHeight);
            ctx.fillStyle = r % 2 === 0 ? '#bb1282' : '#291ec4';
            ctx.shadowBlur = 10;
            ctx.shadowColor = r % 2 === 0 ? '#bb1282' : '#291ec4';
            ctx.fill();
            ctx.closePath();
          }
        }
      }
    };

    // Main Game Loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawBricks();
      drawBall();
      drawPaddle();
      collisionDetection();

      // Wall Bounces
      if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
      if (y + dy < ballRadius) dy = -dy;
      else if (y + dy > canvas.height - ballRadius - 10) {
        if (x > paddleX && x < paddleX + paddleWidth) {
          dx = 4 * ((x - (paddleX + paddleWidth / 2)) / paddleWidth);
          dy = -dy;
        } else {
          // 🚨 GAME OVER LOGIC 🚨
          setGameOver(true);
          setIsPlaying(false);
          saveScoreToDB(scoreRef.current); // Database mein score bhejo
          return; // End loop
        }
      }

      // Paddle Movement
      if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
      else if (leftPressed && paddleX > 0) paddleX -= 7;

      x += dx;
      y += dy;

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
      canvas.removeEventListener('mousemove', mouseMoveHandler);
    };
  }, [isPlaying]);

  const startGame = () => {
    scoreRef.current = 0;
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  return (
    <div className="cyber-breaker-container">
      <div className="breaker-header">
        <p>MISSION: <span className="text-white">SMASH BUGS</span></p>
        <p className="score-text">SCORE: {score}</p>
      </div>

      <div className="canvas-wrapper">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={450} 
          className="breaker-canvas"
        />

        {!isPlaying && !gameOver && (
          <div className="game-overlay">
            <h3 className="glitch-text">SYSTEM READY</h3>
            <button className="play-btn" onClick={startGame}>Initialize</button>
            
            {/* Start screen pe Leaderboard */}
            {leaderboard.length > 0 && (
              <div className="leaderboard" style={{ marginTop: '20px', textAlign: 'center' }}>
                <p style={{ color: '#00ffcc', fontSize: '0.9rem', marginBottom: '10px' }}>--- TOP HACKERS ---</p>
                {leaderboard.map((entry, idx) => (
                  <p key={idx} style={{ color: 'white', fontSize: '0.8rem', margin: '3px 0' }}>
                    {idx + 1}. {entry.visitor_name} - <span style={{ color: '#bb1282' }}>{entry.score}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {gameOver && (
          <div className="game-overlay error-state">
            <h3 className="glitch-text text-red">CRITICAL ERROR</h3>
            <p className="final-score">Final Score: {score}</p>
            <button className="play-btn" onClick={startGame}>Reboot System</button>
            
            {/* Game Over pe Leaderboard */}
            {leaderboard.length > 0 && (
              <div className="leaderboard" style={{ marginTop: '20px', textAlign: 'center' }}>
                <p style={{ color: '#00ffcc', fontSize: '0.9rem', marginBottom: '10px' }}>--- TOP HACKERS ---</p>
                {leaderboard.map((entry, idx) => (
                  <p key={idx} style={{ color: 'white', fontSize: '0.8rem', margin: '3px 0' }}>
                    {idx + 1}. {entry.visitor_name} - <span style={{ color: '#bb1282' }}>{entry.score}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <p className="hint-text">Use Mouse or Arrow Keys to move</p>
    </div>
  );
};

export default CyberBreaker;