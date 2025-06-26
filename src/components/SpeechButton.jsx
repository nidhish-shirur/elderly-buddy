import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StopIcon from '@mui/icons-material/Stop';
import speechService from '../utils/speechService';

const SpeechButton = ({ text, tooltipText = 'Read aloud', size = 'medium', color = 'primary' }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleClick = () => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
    } else {
      const success = speechService.speak(text);
      if (success) {
        setIsSpeaking(true);
        // Reset speaking state when speech ends
        const checkSpeaking = setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            setIsSpeaking(false);
            clearInterval(checkSpeaking);
          }
        }, 100);
      }
    }
  };

  if (!speechService.isSupported()) {
    return null;
  }

  return (
    <Tooltip title={tooltipText}>
      <IconButton
        onClick={handleClick}
        size={size}
        color={color}
        aria-label={tooltipText}
      >
        {isSpeaking ? <StopIcon /> : <VolumeUpIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default SpeechButton; 