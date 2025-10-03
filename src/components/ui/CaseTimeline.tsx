'use client';

import { useState } from 'react';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';
import type { CaseStatus } from '../../types/supabase';

// Re-export the generated type
export type { CaseStatus };

interface CaseTimelineProps {
  currentStatus: CaseStatus;
  onStatusChange: (newStatus: CaseStatus) => void;
  disabled?: boolean;
}

const timelineSteps: { status: CaseStatus; label: string; description: string }[] = [
  { status: 'Zaprimanje', label: 'Zaprimanje', description: 'Početak predmeta' },
  { status: 'Priprema', label: 'Priprema', description: 'Priprema dokumenata' },
  { status: 'Ročište', label: 'Ročište', description: 'Sudsko ročište' },
  { status: 'Presuda', label: 'Presuda', description: 'Konačna presuda' }
];

export default function CaseTimeline({ currentStatus, onStatusChange, disabled = false }: CaseTimelineProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const currentIndex = timelineSteps.findIndex(step => step.status === currentStatus);
  
  const getStepStatus = (index: number) => {
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'upcoming';
  };

  const handleStatusChange = (newStatus: CaseStatus) => {
    onStatusChange(newStatus);
    setIsDropdownOpen(false);
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Status predmeta</h3>
        {!disabled && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200"
            >
              <span>Promijeni status</span>
              <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-90' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                {timelineSteps.map((step) => (
                  <button
                    key={step.status}
                    onClick={() => handleStatusChange(step.status)}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                      step.status === currentStatus ? 'bg-accent text-accent-foreground' : 'text-foreground'
                    }`}
                  >
                    <div className="font-medium">{step.label}</div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timeline Stepper */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-border">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentIndex / (timelineSteps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {timelineSteps.map((step, index) => {
            const stepStatus = getStepStatus(index);
            const isCompleted = stepStatus === 'completed';
            const isCurrent = stepStatus === 'current';
            // const isUpcoming = stepStatus === 'upcoming'; // Currently unused but may be needed for future styling

            return (
              <div key={step.status} className="flex flex-col items-center">
                {/* Step Circle */}
                <div className="relative z-10">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : isCurrent
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-muted border-border text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </div>
                  
                  {/* Step Number */}
                  {!isCompleted && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-xs font-semibold ${
                        isCurrent ? 'text-primary-foreground' : 'text-muted-foreground'
                      }`}>
                        {index + 1}
                      </span>
                    </div>
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-3 text-center">
                  <div className={`text-sm font-medium ${
                    isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </div>
                  <div className={`text-xs mt-1 ${
                    isCompleted || isCurrent ? 'text-muted-foreground' : 'text-muted-foreground/70'
                  }`}>
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Status Info */}
      <div className="mt-6 p-4 bg-accent rounded-lg">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            currentStatus === 'Zaprimanje' ? 'bg-blue-500' :
            currentStatus === 'Priprema' ? 'bg-yellow-500' :
            currentStatus === 'Ročište' ? 'bg-orange-500' :
            'bg-green-500'
          }`} />
          <div>
            <p className="text-sm font-medium text-foreground">
              Trenutni status: {timelineSteps.find(step => step.status === currentStatus)?.label}
            </p>
            <p className="text-xs text-muted-foreground">
              {timelineSteps.find(step => step.status === currentStatus)?.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
