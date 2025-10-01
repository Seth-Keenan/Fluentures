// app/testing/createWordPage
// To test this comment your name out and visit this page once logged in
// To delete this word later save the WordID from the console

'use client'; 

import { useEffect } from 'react';

export default function CreateWordPage() {
  useEffect(() => {
    async function createWord() {
      
      const wordListID = '550e8400-e29b-41d4-a716-446655440000' // Seth E.
      // const wordListID = '550e8400-e29b-41d4-a716-446655440000' // Evie
      // const wordListID = '550e8400-e29b-41d4-a716-446655440000' // Ang
      // const wordListID = '550e8400-e29b-41d4-a716-446655440000' // Jay
      // const wordListID = '550e8400-e29b-41d4-a716-446655440000' // Kody
      // const wordListID = '550e8400-e29b-41d4-a716-446655440000' // Seth K.

      try {
        const response = await fetch('/api/test/createWord', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            word_list_id: wordListID, 
            word_target: 'こんにちは',
            word_english: 'Hello',
            note: 'Common greeting in Japanese',
            is_favorite: true,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('Error:', result.error);
        } else {
          console.log('Word created:', result.word);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    }

    createWord();
  }, []);

  return (
    <div>
      <h1>Creating Word...</h1>
      <p>Check the console for results.</p>
    </div>
  );
}
