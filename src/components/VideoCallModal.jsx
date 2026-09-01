import { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Video, VideoOff, PhoneOff, Camera, Maximize2 } from 'lucide-react';
import './VideoCallModal.css';

export default function VideoCallModal({ isOpen, onClose, workerName = 'Suresh Kumar', workerRating = 4.8 }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callState, setCallState] = useState('connecting'); // connecting | active | ended
  const [localStream, setLocalStream] = useState(null);
  const localVideoRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setCallState('connecting');
    setCallDuration(0);

    // Get user camera
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        // Simulate connection after 2s
        setTimeout(() => setCallState('active'), 2000);
      })
      .catch(() => {
        // No camera — still show simulated call
        setTimeout(() => setCallState('active'), 2000);
      });

    return () => {
      localStream?.getTracks().forEach(t => t.stop());
      clearInterval(timerRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (callState === 'active') {
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [callState]);

  const formatDuration = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const toggleMute = () => {
    localStream?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsMuted(prev => !prev);
  };

  const toggleCamera = () => {
    localStream?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsCameraOn(prev => !prev);
  };

  const endCall = () => {
    localStream?.getTracks().forEach(t => t.stop());
    setCallState('ended');
    setTimeout(onClose, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="vcall-overlay" onClick={(e) => e.target === e.currentTarget && endCall()}>
      <div className="vcall-modal">
        {/* Simulated remote (worker) video */}
        <div className="vcall-remote-video">
          {callState === 'connecting' ? (
            <div className="vcall-connecting">
              <div className="vcall-avatar-pulse">
                <span>{workerName.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <p>Connecting to {workerName}...</p>
            </div>
          ) : callState === 'ended' ? (
            <div className="vcall-connecting">
              <div className="vcall-avatar-pulse ended">
                <PhoneOff size={28} />
              </div>
              <p>Call Ended</p>
            </div>
          ) : (
            <>
              {/* Worker placeholder */}
              <div className="vcall-worker-placeholder">
                <span className="vcall-worker-avatar">{workerName.split(' ').map(n => n[0]).join('')}</span>
                <p>{workerName}</p>
                <div className="vcall-stars">
                  {'★'.repeat(Math.round(workerRating))} {workerRating}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Call duration */}
        {callState === 'active' && (
          <div className="vcall-duration">{formatDuration(callDuration)}</div>
        )}

        {/* Local (user) video */}
        <div className="vcall-local-video">
          <video ref={localVideoRef} autoPlay muted playsInline />
          {!isCameraOn && (
            <div className="vcall-no-camera"><VideoOff size={20} /></div>
          )}
        </div>

        {/* Worker info */}
        <div className="vcall-info-bar">
          <div>
            <strong>{workerName}</strong>
            <p>Cooperative-Verified Worker • ⭐ {workerRating}</p>
          </div>
          <div className="vcall-live-badge">● LIVE</div>
        </div>

        {/* Controls */}
        <div className="vcall-controls">
          <button className={`vcall-btn ${isMuted ? 'active' : ''}`} onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>
          <button className="vcall-btn end" onClick={endCall} title="End Call">
            <PhoneOff size={22} />
            <span>End</span>
          </button>
          <button className={`vcall-btn ${!isCameraOn ? 'active' : ''}`} onClick={toggleCamera} title={isCameraOn ? 'Camera Off' : 'Camera On'}>
            {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
            <span>Camera</span>
          </button>
        </div>
      </div>
    </div>
  );
}
