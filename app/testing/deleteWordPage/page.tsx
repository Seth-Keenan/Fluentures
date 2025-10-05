'use client';

import { useState } from 'react';

export default function DeleteWordPage() {
  const [wordId, setWordId] = useState('');
  const [message, setMessage] = useState('');

  async function deleteWord() {
    if (!wordId) {
      setMessage('Please enter a Word ID');
      return;
    }

    try {
      const response = await fetch('/api/test/deleteWord', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word_id: wordId }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error:', result.error);
        setMessage(`Error: ${result.error}`);
      } else {
        console.log('Word deleted:', result.word);
        setMessage(`Word deleted: ${JSON.stringify(result.word)}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setMessage('Fetch error. Check console.');
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Delete Word</h1>
      <input
        type="text"
        placeholder="Enter Word ID to delete"
        value={wordId}
        onChange={(e) => setWordId(e.target.value)}
        style={{ marginRight: '1rem' }}
      />
      <button onClick={deleteWord}>Delete Word</button>
      <p>{message}</p>
    </div>
  );
}
