import { useEffect, useState,useCallback } from "react";
import { shuffleArray } from "./utils/shuffleArray";
import "./App.css";

function App() {
    const [playingGame, setPlayingGame] = useState(true);
    const [levelCompleted, setLevelCompleted] = useState();
    const [level, setLevel] = useState(1);
    const [lives, setLives] = useState(4);
    const [cards, setCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState();
    const [preloadedImages, setPreloadedImages] = useState();
    const [solvedAmount, setSolvedAmount] = useState(0);
    //Function to restart game
    const handleRestartGame = () => {
        setLevel(1);
        setLives(4);
        setCards([]);
        setSelectedCard();
        setSolvedAmount(0);
        handleFetchImages().catch(console.error);
        setPlayingGame(true);
    };
    //Function to start next Level
    const handleStartNextLevel = () => {
        const newLevel = level + 1;
        setLives(newLevel * 4);
        setLevelCompleted(false);
        setSelectedCard();
        setSolvedAmount(0);
        setCards([]);
        setLevel(newLevel);
    };

    const handleSelect = async (e) => {
        const cardKey = e.target.getAttribute("data-key");
        const currentElement = e.target;
        currentElement.style.transform = "rotateY(180deg)";
        if (selectedCard) {
            //Shows image of selected
            currentElement.appendChild(preloadedImages[cardKey]);
            currentElement.style.pointerEvents = "none";

            //Cards match or else
            if (cards[cardKey].id === cards[selectedCard[1]].id) {
                const solved = solvedAmount + 2;
                //Checks for win condition
                if (solved === cards.length) {
                    return setLevelCompleted(true);
                }
                setSolvedAmount(solved);
                setSelectedCard(null);
            } else {
                if (lives === 1) return setPlayingGame(false);
                //Removes all pointer events from cards so user cant click
                const allCardElements = document.getElementsByClassName("card-con");
                for (let i = 0; i < allCardElements.length; i++) {
                    allCardElements[i].style.pointerEvents = "none";
                }
                await sleep(700);
                currentElement.removeChild(currentElement.firstChild);
                selectedCard[0].removeChild(selectedCard[0].firstChild);
                currentElement.style.pointerEvents = "";
                selectedCard[0].style.pointerEvents = "";
                currentElement.style.transform = "";
                selectedCard[0].style.transform = "";
                setSelectedCard(null);
                setLives(lives - 1);
                //Enable pointer events
                for (let i = 0; i < allCardElements.length; i++) {
                    allCardElements[i].style.pointerEvents = "";
                }
            }
        } else {
            //Shows image of selected and declares selected
            currentElement.appendChild(preloadedImages[cardKey]);
            currentElement.style.pointerEvents = "none";
            setSelectedCard([currentElement, cardKey]);
        }
    };
    const sleep = (time) => {
        return new Promise((resolve) => {
            setTimeout(resolve, time);
        });
    };
    //GETS images from public api (https://picsum.photos)

    //Preload images so images dont need to load when user selects a card
    const preloadImages = (cards) => {
        let images = [];
        for (var i = 0; i < cards.length; i++) {
            images[i] = new Image();
            images[i].className = "card-img";
            images[i].src = cards[i].download_url;
        }
        setPreloadedImages(images);
    };
    const handleFetchImages = useCallback(async () => {
        await fetch(
            `https://picsum.photos/v2/list?page=${Math.floor(
                Math.random() * (10 - 1) + 1
            )}&limit=100`
        )
            .then((res) => res.json())
            .then((data) => {
                let imgarr = [];
                for (let i = 0; i < level * 2; i++) {
                    const img = data.splice(Math.random() * data.length, 1)[0];
                    imgarr.push(img, img);
                }
                imgarr = shuffleArray(imgarr);
                setCards(imgarr);
                preloadImages(imgarr);
            });
    },[level]);
    useEffect(() => {
        handleFetchImages().catch(console.error);
    }, [level,handleFetchImages]);
    return (
        <div className="mid-con align-horz">
            {playingGame ? (
                <>
                    <h1 className="level-title center-text margin-10px">Level {level}</h1>
                    <h2 className="lives-title center-text margin-10px">Lives: {lives}</h2>
                    <div className="card-con">
                        {cards.map((card, idx) => {
                            return (
                                <div
                                    key={idx}
                                    className="card"
                                    data-key={idx}
                                    onClick={handleSelect}
                                >
                                    {/* {<img className="card-img" data-key={idx}></img>} */}
                                </div>
                            );
                        })}
                    </div>
                    {levelCompleted && (
                        <div className="win-con flex-mid align-horz">
                            <span>Congratulations, You beat level {level}!</span>
                            <div>
                                <button className="d-button" onClick={handleStartNextLevel}>
                                    Next Level
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <div className="win-con flex-mid align-horz">
                        <span>Sorry, You lost</span>
                        <button className="d-button" onClick={handleRestartGame}>
                            Play again
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default App;
