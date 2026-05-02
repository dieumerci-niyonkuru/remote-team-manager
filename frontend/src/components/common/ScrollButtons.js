import React, { useState, useEffect } from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const ScrollButtons = () => {
  const [show, setShow] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 200);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });

  if (!show) return null;
  return (
    <div className="fixed bottom-6 left-6 flex flex-col gap-2 z-50">
      <button onClick={scrollToTop} className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition" title={t('scrollToTop')}>
        <FaArrowUp />
      </button>
      <button onClick={scrollToBottom} className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition" title={t('scrollToBottom')}>
        <FaArrowDown />
      </button>
    </div>
  );
};
export default ScrollButtons;
