'use client';
import { useEffect } from 'react';

export default function Toast() {
  useEffect(() => {
    let toastTimer;
    window.showToast = function(message) {
      const toast = document.getElementById('pf-toast');
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 3800);
    };
    return () => { delete window.showToast; };
  }, []);

  return <div className="toast" id="pf-toast"></div>;
}