import { Check } from 'lucide-react';
import './StatusTimeline.css';

const statusOrder = ['booked', 'assigned', 'en-route', 'in-progress', 'completed'];
const statusLabels = {
  booked: 'Booked',
  assigned: 'Assigned',
  'en-route': 'En Route',
  'in-progress': 'In Progress',
  completed: 'Completed'
};

export default function StatusTimeline({ currentStatus }) {
  const currentIdx = statusOrder.indexOf(currentStatus);

  return (
    <div className="status-timeline">
      {statusOrder.map((status, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <div key={status} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
            <div className="timeline-dot-wrapper">
              <div className="timeline-dot">
                {isCompleted ? <Check size={14} /> : <span>{idx + 1}</span>}
              </div>
              {isCurrent && <div className="timeline-dot-ring" />}
            </div>
            {idx < statusOrder.length - 1 && (
              <div className={`timeline-line ${isCompleted ? 'line-completed' : ''}`} />
            )}
            <span className="timeline-label">{statusLabels[status]}</span>
          </div>
        );
      })}
    </div>
  );
}
