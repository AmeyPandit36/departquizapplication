import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE = process.env.REACT_APP_API_BASE_URL || `${process.env.REACT_APP_API_URL}`;

const useProctoring = ({ enabled, attemptId, onLimitReached }) => {
  const [status, setStatus] = useState({
    enabled: false,
    cameraGranted: false,
    snapshotsTaken: 0,
    focusViolations: 0,
    maxFocusViolations: null,
    error: null
  });
  const settingsRef = useRef(null);
  const snapshotTimerRef = useRef(null);
  const streamRef = useRef(null);

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const logEvent = useCallback(
    async (eventType, details) => {
      if (!attemptId) return;
      try {
        const { data } = await axios.post(`${API_BASE}/api/proctor/event`, {
          attempt_id: attemptId,
          event_type: eventType,
          details
        });

        if (typeof data.focusViolations === 'number') {
          setStatus(prev => ({
            ...prev,
            focusViolations: data.focusViolations
          }));
        }

        if (data.limitExceeded && onLimitReached) {
          onLimitReached();
        }
      } catch (error) {
        console.error('Proctor event error', error);
      }
    },
    [attemptId, onLimitReached]
  );

  const captureSnapshot = useCallback(async () => {
    if (!streamRef.current || !attemptId) return;

    try {
      const video = document.createElement('video');
      video.srcObject = streamRef.current;

      await video.play().catch(() => {});

      const track = streamRef.current.getVideoTracks()[0];
      const settings = track?.getSettings();
      const width = settings?.width || 640;
      const height = settings?.height || 480;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, width, height);

      const imageData = canvas.toDataURL('image/png');
      await axios.post(`${API_BASE}/api/proctor/snapshot`, {
        attempt_id: attemptId,
        image: imageData
      });

      setStatus(prev => ({
        ...prev,
        snapshotsTaken: prev.snapshotsTaken + 1
      }));
    } catch (error) {
      console.error('Snapshot capture failed', error);
      setStatus(prev => ({ ...prev, error: 'Snapshot capture failed' }));
    }
  }, [attemptId]);

  const scheduleNextSnapshot = useCallback(() => {
    if (!settingsRef.current || !streamRef.current) return;

    const min = settingsRef.current.snapshot_interval_min || 60;
    const max = settingsRef.current.snapshot_interval_max || min;
    const intervalSeconds = Math.floor(Math.random() * (max - min + 1)) + min;

    snapshotTimerRef.current = setTimeout(async () => {
      await captureSnapshot();
      scheduleNextSnapshot();
    }, intervalSeconds * 1000);
  }, [captureSnapshot]);

  useEffect(() => {
    if (!enabled || !attemptId) {
      setStatus(prev => ({ ...prev, enabled: false }));
      return undefined;
    }

    let cancelled = false;

    const init = async () => {
      try {
        const { data } = await axios.post(`${API_BASE}/api/proctor/start`, {
          attempt_id: attemptId
        });

        if (cancelled || !data.enabled) {
          setStatus(prev => ({ ...prev, enabled: false }));
          return;
        }

        settingsRef.current = data.settings;
        setStatus(prev => ({
          ...prev,
          enabled: true,
          maxFocusViolations: data.settings?.max_focus_violations || null
        }));

        try {
          streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true });
          setStatus(prev => ({ ...prev, cameraGranted: true }));
          scheduleNextSnapshot();
        } catch (cameraError) {
          console.warn('Camera permission denied', cameraError);
          setStatus(prev => ({ ...prev, cameraGranted: false }));
          toast.warn('Camera access denied. Focus monitoring still active.');
          await logEvent('warning', { reason: 'camera_denied' });
        }
      } catch (error) {
        console.error('Failed to initialize proctoring', error);
        setStatus(prev => ({ ...prev, error: 'Failed to start proctoring' }));
      }
    };

    init();

    const handleVisibility = () => {
      const type = document.hidden ? 'focus_lost' : 'focus_regained';
      logEvent(type, { timestamp: new Date().toISOString() });
    };

    window.addEventListener('blur', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      cleanupStream();
      if (snapshotTimerRef.current) {
        clearTimeout(snapshotTimerRef.current);
      }
      window.removeEventListener('blur', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [attemptId, cleanupStream, enabled, logEvent, scheduleNextSnapshot]);

  return status;
};

export default useProctoring;






