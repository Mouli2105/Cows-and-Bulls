import React from 'react';
import * as data from './data.json';
import {
    Grid,
    Input,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { CirclePicker } from 'react-color';
import './style.css'

const useStyles =  makeStyles(theme => ({
    wordPanel: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
    },
    historyPanel: {
        textAlign: 'center'
    },
    chancesPanel: {
        position: 'absolute',
        top: '5%',
        left: '5%'
    },
    letter: {
        '&:hover': {
            cursor: 'pointer'
        }
    },
    colorPicker: {
        position: 'absolute',
        top: '5%',
        right: '5%',
        border: '2px solid black',
        padding: '3%'
    }
}));

function CowsAndBulls() {
    const [wordToGuess, changeWordToGuess]   = React.useState('');
    const [wordsGuessed, changeWordsGuessed] = React.useState([]);
    const [guess, changeGuess]               = React.useState('');
    const [chances, setChances]              = React.useState(0);
    const [color, changeColor]               = React.useState('#0000ff');
    const [gameOver, changeGameOver]         = React.useState(false);
    const [gameWon, changeGameWon]           = React.useState(false);

    const isDuplicateGuess = currentInput => {
        for (let i = 0; i < wordsGuessed.length; i++) {
            if (currentInput === wordsGuessed[i].input)
                return true;
        }
        return false;
    };

    const computeCowsAndBulls = wordData => {
        let bulls = 0;
        let cows = 0;
        for (let i = 0; i < wordToGuess.length; i++) {
            for (let j = 0; j < guess.length; j++) {
                if (wordToGuess[i] === guess[j]) {
                    if (i === j) {
                        bulls++;
                    }
                    else {
                        cows++;
                    }
                }
            }
        }
        if (cows === 0 && bulls === 0) {
            Object.keys(wordData.tkns).forEach(letter => wordData.tkns[letter] = { bg: '#ff0000' });
        }
        if (cows === 0 && bulls === 4) {
            Object.keys(wordData.tkns).forEach(letter => wordData.tkns[letter] = { bg: '#00ff00' });
            changeGameOver(true);
            changeGameWon(true);
        }
        return { ...wordData, cows, bulls };
    };

    const prepareGuessObject = guess => {
        let wordData = { guess, tkns: {} };
        guess.split('').forEach(letter => wordData.tkns[letter] = {});
        return computeCowsAndBulls(wordData, guess);
    }

    const handleGuessSubmit = (event) => {
        event.preventDefault();
        if (guess.length === wordToGuess.length && isValidWord(guess)) {
            if (!isDuplicateGuess(guess)) {
                let _wordsGuessed = [...wordsGuessed];
                let wordData = prepareGuessObject(guess);
                _wordsGuessed.push(wordData);
                changeWordsGuessed(_wordsGuessed);
                setChances(chances - 1);
            }
            changeGuess('');
        }
        if (chances <= 0) {
            changeGameOver(true);
        }
    };

    const handleGuessChange = (event) => {
        let input = event.target.value;
        if (input.length > wordToGuess.length) {
            let tkns = input.split('');
            tkns.pop();
            input = tkns.join('');
        }
        changeGuess(input.toLowerCase());
    };

    const loadWord = () => {
        let idx = Math.floor(Math.random() * data.words.length);
        return data.words[idx];
    };

    const isValidWord = word => {
        let wordFound = data.words.indexOf(word) !== -1;
        if (!wordFound) {
            console.log(`Word '${word}' was not found!`);
        }
        return true;
        return wordFound;
    };

    const reset = () => {
        let word = loadWord();
        console.log('reset -> word', word);
        changeWordToGuess(word);
        setChances(word.length * 2);
        changeGameWon(false);
        changeGameOver(false);
    };

    const handleLetterClick = (wordIndex, letter) => {
        if (color) {
            let wordData = { ...wordsGuessed[wordIndex] };
            wordData.tkns[letter] = {
                bg: color
            };
            wordsGuessed[wordIndex] = wordData;
            changeWordsGuessed([...wordsGuessed]);
        }
    };

    const renderGuess = (wordData, wordIndex) => {
        return (
            <Grid container>
                {wordData.guess.split('').map((letter, letterIndex) => {
                    let letterData = wordData.tkns[letter];
                    return (
                        <Grid key={letterIndex} item xs={3} onClick={() => handleLetterClick(wordIndex, letter)} className={classes.letter}>
                            <Typography style={{ color: letterData.bg || '#000000', fontWeight: letterData.bg ? 'bold' : 'normal' }}>
                                {letter.toUpperCase()}
                            </Typography>
                        </Grid>
                    )
                })}
            </Grid>
        );
    };

    const handleColorPicked = color => changeColor(color.hex);

    React.useEffect(reset, []);

    const classes = useStyles();

    return (
        <div>
            {/* <div id='chances-panel' className={classes.chancesPanel}>
                <Typography align='center' variant='h2' component='h2'>
                    {chances > 0 ? chances : 'X'}
                </Typography>
            </div> */}
            <div id='word-panel' className={classes.wordPanel}>
                <Typography align='center' variant='h4'>
                    I'm thinking of a {wordToGuess.length} word. You have {chances > 0 ? chances : 0} chances left to guess it...
                </Typography>
                <br />
                <br />
                {!gameOver &&
                        <form onSubmit={handleGuessSubmit}>
                            <Input type='text' value={guess} onChange={handleGuessChange} fullWidth autoFocus placeholder='Enter you guess..' />
                        </form>
                }
                <br />
                <br />
                <div id='history-panel' className={classes.historyPanel}>
                    {wordsGuessed.length &&
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell align='center'>Word(s)</TableCell>
                                    <TableCell align='center'>Cows</TableCell>
                                    <TableCell align='center'>Bulls</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {wordsGuessed.map((wordData, index) => (
                                    <TableRow key={index}>
                                        <TableCell align='center'>{renderGuess(wordData, index)}</TableCell>
                                        <TableCell align='center'>{wordData.cows ? wordData.cows : 'X'}</TableCell>
                                        <TableCell align='center'>{wordData.bulls ? wordData.bulls : 'X'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    }
                </div>
                <div>
                    {gameOver &&
                        (!gameWon
                            ?
                            <Typography>Chances over! Your word was '{wordToGuess}'!</Typography>
                            :
                            <Typography>Congrats! You won the game!</Typography>
                        )
                    }
                </div>
            </div>
            <div id='color-picker' className={classes.colorPicker}>
                <CirclePicker
                    width='50px'
                    colors={['#ff0000', '#0000ff', '#00ff00']}
                    onChange={handleColorPicked}
                />
            </div>
        </div>

    )
}

export default CowsAndBulls;