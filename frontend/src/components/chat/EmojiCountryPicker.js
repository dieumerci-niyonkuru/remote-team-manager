import React, { useState } from 'react';
import Picker from 'emoji-picker-react';
import Flags from 'react-flags-select';
import { FaSmile, FaGlobe } from 'react-icons/fa';

const flagMap = {
  US: '🇺🇸', GB: '🇬🇧', FR: '🇫🇷', DE: '🇩🇪', IT: '🇮🇹', ES: '🇪🇸', RW: '🇷🇼',
  KE: '🇰🇪', UG: '🇺🇬', TZ: '🇹🇿', ZA: '🇿🇦', NG: '🇳🇬', GH: '🇬🇭', CM: '🇨🇲',
  BR: '🇧🇷', CA: '🇨🇦', MX: '🇲🇽', JP: '🇯🇵', CN: '🇨🇳', IN: '🇮🇳', AU: '🇦🇺',
  NZ: '🇳🇿', SE: '🇸🇪', NO: '🇳🇴', DK: '🇩🇰', FI: '🇫🇮', NL: '🇳🇱', BE: '🇧🇪',
  CH: '🇨🇭', AT: '🇦🇹', PL: '🇵🇱', CZ: '🇨🇿', HU: '🇭🇺', GR: '🇬🇷', TR: '🇹🇷',
  RU: '🇷🇺', UA: '🇺🇦', KR: '🇰🇷', SG: '🇸🇬', MY: '🇲🇾', TH: '🇹🇭', VN: '🇻🇳',
  ID: '🇮🇩', PH: '🇵🇭', PK: '🇵🇰', BD: '🇧🇩', EG: '🇪🇬', SA: '🇸🇦', AE: '🇦🇪',
  IL: '🇮🇱', AR: '🇦🇷', CL: '🇨🇱', CO: '🇨🇴', PE: '🇵🇪', VE: '🇻🇪'
};

const EmojiCountryPicker = ({ onSelect }) => {
  const [showEmoji, setShowEmoji] = useState(false);
  const [showCountry, setShowCountry] = useState(false);

  const onEmojiClick = (emojiObject) => {
    onSelect(emojiObject.emoji);
    setShowEmoji(false);
  };

  const onSelectCountry = (countryCode) => {
    const flag = flagMap[countryCode] || '🏳️';
    onSelect(flag);
    setShowCountry(false);
  };

  return (
    <div className="relative inline-block">
      <button onClick={() => { setShowEmoji(!showEmoji); setShowCountry(false); }} className="p-2 rounded-full hover:bg-gray-200">
        <FaSmile />
      </button>
      {showEmoji && (
        <div className="absolute bottom-10 left-0 z-50">
          <Picker onEmojiClick={onEmojiClick} />
        </div>
      )}
      <button onClick={() => { setShowCountry(!showCountry); setShowEmoji(false); }} className="p-2 rounded-full hover:bg-gray-200 ml-1">
        <FaGlobe />
      </button>
      {showCountry && (
        <div className="absolute bottom-10 left-0 z-50 bg-white shadow-lg rounded p-2 w-64">
          <Flags countries={Object.keys(flagMap)} onSelect={onSelectCountry} />
        </div>
      )}
    </div>
  );
};
export default EmojiCountryPicker;
