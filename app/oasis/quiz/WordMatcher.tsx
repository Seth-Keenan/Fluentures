"use client";

import { Button } from '@/app/components/Button';
import React, { useEffect, useState } from 'react'

interface GoodMatch {
    knownLanguage: string;
    targetLanguage: string;
}

// TODO: We can grob this from the backend or gemini
const preMatchedData = [
        {knownLanguage: "Dog", targetLanguage: "Perro"},
        {knownLanguage: "Cat", targetLanguage: "Gato"},
        {knownLanguage: "Fish", targetLanguage: "Pez"},
        {knownLanguage: "Tiger", targetLanguage: "Tigre"},
        {knownLanguage: "Monkey", targetLanguage: "Mono"},
];

const shuffleArray = (matchingWords: GoodMatch[]) => {
    return matchingWords.slice().sort(() => Math.random() - 0.5);
}

export default function WordMatcher() {
    const [shuffledData, setShuffledData] = useState<GoodMatch[]>(preMatchedData);
    const [selectedWord, setSelectedWord] = useState<GoodMatch | null>(null);
    const [pairedData, setPairedData] = useState<GoodMatch[]>([]);

    const isMatched = (match: GoodMatch) =>
    pairedData.some((pairedMatch) => pairedMatch === match);

    
    useEffect(() => {
        setShuffledData(shuffleArray(preMatchedData));
    }, []);
    
    const handleTargetClick = (match: GoodMatch) => {
        if (selectedWord &&
            match.knownLanguage === selectedWord.knownLanguage &&
            match.targetLanguage === selectedWord.targetLanguage) {
            const newPairedMatch = [...pairedData, match]
            setPairedData(newPairedMatch);
        }
        // Not a match
        setSelectedWord(null);
    }

    const win = pairedData.length === preMatchedData.length

    return (
    win ?
        <>
            <h1>
                You Win
            </h1>
        </>
        :
        <>
            <div className='flex gap-5'>
                <div className='flex flex-col gap-2'>
                    {preMatchedData.map((match, index) => (
                        <Button
                        onClick={() => {setSelectedWord(match)}}
                        className={`${isMatched(match) ? "bg-green-500 cursor-not-allowed hover:bg-green-800 transition: duration-200" : ""}`}
                        disabled={isMatched(match)}
                        key={index}>
                            {match.knownLanguage}
                        </Button>
                    ))}
                </div>
                <div className='flex flex-col gap-2'>
                    {shuffledData.map((match, index) => (
                        <Button
                        onClick={() => {handleTargetClick(match);}}
                        className={`${isMatched(match) ? "bg-green-500 cursor-not-allowed hover:bg-green-800 transition: duration-200" : ""}`}
                        disabled={isMatched(match)}
                        key={index}>
                            {match.targetLanguage}
                        </Button>
                    ))}
                </div>
            </div>    
        </>
  )
}