// Sound effects for the quiz app

// Helper function to create an audio object from a data URI
export const createAudio = (dataUri: string): HTMLAudioElement => {
  const audio = new Audio(dataUri);
  audio.volume = 0.2; // Set default volume to 20%
  return audio;
};

// Hover sound - soft beep
export const hoverSound = createAudio(
  "data:audio/wav;base64,UklGRnQGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YVAGAACAgICAgICAgICAgICAgICAgICAgICBgIGAgYCAgH9+fXt6eXh4eHl6e3x+f4GDhoiKjI6QkZKTk5OSkZCPjo2Mioq..."
);

// Click sound - button press
export const clickSound = createAudio(
  "data:audio/wav;base64,UklGRpYGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXIGAABBgpKfpKmssLGvraqlnpeTjomEgHx4dXJwbm1tb3Byc3Z5fICDh4qNkJKUlZaWlpWUk5KQj42MioiGhIOBgH9/..."
);

// Correct answer sound - happy chime
export const correctSound = createAudio(
  "data:audio/wav;base64,UklGRnoHAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXAHAAAAAAA/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/P39/f39/f39/f39/f39/f39/f39/f39/f39/f3..."
);

// Wrong answer sound - low buzz
export const wrongSound = createAudio(
  "data:audio/wav;base64,UklGRpQGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXAGAAADCBkePSk0KSEZDAQCBRAbKDApIRcKAQAEESAyQkg+KxIEAAQTKD5QVkYqEQAABBYuRVpfSisSAQAEFi9GW..."
);

// Transition sound - woosh effect
export const transitionSound = createAudio(
  "data:audio/wav;base64,UklGRowGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YWgGAAAAAAEDBAUGBwgICQkJCQkICAcGBQUDAgEAAAAAgX58enl3d3d4eHp7fX+Bg4WGiImKioqKiYiHhoWDgoB/fXx..."
);

// Play a sound with optional volume control
export const playSound = (sound: HTMLAudioElement, volume: number = 0.2) => {
  try {
    const soundClone = sound.cloneNode(true) as HTMLAudioElement;
    soundClone.volume = volume;
    soundClone.play().catch(err => console.log('Audio play failed:', err));
  } catch (err) {
    console.log('Error playing sound:', err);
  }
};