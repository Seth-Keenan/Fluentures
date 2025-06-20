import React from 'react'

interface Match {
    primary_language: string;
    secondary_language: string;
}

// TODO: Implement data integration with DB
const preMatchedData = [
    {primary_language: "Hello", secondary_language: "Hola"},
    {primary_language: "Thank you", secondary_language: "Gracias"},
    {primary_language: "Please", secondary_language: "Por Favor"},
    {primary_language: "How are you?", secondary_language: "Como Estas"},
    {primary_language: "Goodbye", secondary_language: "Adios"},
];

const WordMatching = () => {
  return (
    <div className={`flex`}>

        <div className={`flex flex-col`}>
      {preMatchedData.map((match, index) => (
        <button className={`btn`} key={index}>{match.primary_language}</button>
        ))}
        </div>

        <div className={`flex flex-col`}>
        {preMatchedData.map((match, index) => (
            <button className={`btn`} key={index}>{match.secondary_language}</button>
            ))}
        </div>

    </div>    
  )
}

export default WordMatching
