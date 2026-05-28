'use client';

import { useState, useEffect } from 'react';

interface MobileInfo {
  isMobile: boolean;
  isWeChat: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isQQBrowser: boolean;
}

export function useMobile(): MobileInfo {
  const [info, setInfo] = useState<MobileInfo>({
    isMobile: false,
    isWeChat: false,
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isQQBrowser: false,
  });

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();

    const isMobile = /android|iphone|ipad|ipod|webos|blackberry|iemobile|opera mini/i.test(ua)
      || (navigator.maxTouchPoints > 0 && /macintosh/i.test(ua));
    const isWeChat = /micromessenger/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isAndroid = /android/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/chrome|crios/i.test(ua) && !/micromessenger/i.test(ua);
    const isQQBrowser = /mqqbrowser|qq\//i.test(ua);

    setInfo({ isMobile, isWeChat, isIOS, isAndroid, isSafari, isQQBrowser });
  }, []);

  return info;
}
