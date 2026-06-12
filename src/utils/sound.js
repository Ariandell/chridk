export const playSelectSound = () => {
  const audio = new Audio('/persona_5_ui_select.mp3');
  audio.volume = 0.5; // Не робимо занадто гучним
  audio.play().catch(e => console.log('Audio play failed (maybe user has not interacted yet):', e));
};
