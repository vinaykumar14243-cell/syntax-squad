import { getAccessToken } from './firebase';

export async function shareToGoogleChat(messageText: string) {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('You must sign in with Google to share to Chat.');
    }

    // Fetch user's spaces
    const spacesRes = await fetch('https://chat.googleapis.com/v1/spaces', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!spacesRes.ok) {
      throw new Error('Failed to fetch Google Chat spaces. Ensure you have authorized Chat permissions.');
    }
    
    const spacesData = await spacesRes.json();
    const spaces = spacesData.spaces || [];
    
    if (spaces.length === 0) {
      throw new Error('No Google Chat spaces found. Please create or join a space first.');
    }
    
    // Default to the first available space
    const spaceName = spaces[0].name;

    // Send the message
    const msgRes = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ text: messageText })
    });
    
    if (!msgRes.ok) {
      throw new Error('Failed to send message to Google Chat.');
    }
    
    return true;
  } catch (error) {
    console.error('Google Chat integration error:', error);
    throw error;
  }
}
