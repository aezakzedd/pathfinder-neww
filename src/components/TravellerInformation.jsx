import { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function TravellerInformation({ onCreateItinerary, onGetStarted }) {
  const [step, setStep] = useState(1); // 1: Dates, 2: Budget, 3: Preferences
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [budget, setBudget] = useState(10000);
  
  // Support both callbacks for backward compatibility
  const callbackRef = useRef(onCreateItinerary || onGetStarted);

  useEffect(() => {
    callbackRef.current = onCreateItinerary || onGetStarted;
  }, [onCreateItinerary, onGetStarted]);

  const [preferences, setPreferences] = useState({
    beach: false,
    hiking: false,
    sightseeing: false,
    waterfalls: false,
    historical: false,
    adventure: false,
    relaxation: false,
    cultural: false
  });
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1)); // January 2026

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const togglePreference = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isInRange = (date, start, end) => {
    if (!start || !end) return false;
    return date >= start && date <= end;
  };

  const handleDateClick = (date) => {
    if (!startDate) {
      // First click: set start date
      setStartDate(date);
      setEndDate(null);
    } else if (!endDate) {
      // Second click: set end date
      if (date < startDate) {
        // If clicked date is before start, swap them
        setEndDate(startDate);
        setStartDate(date);
      } else {
        // Check if range is more than 7 days
        const diffTime = Math.abs(date - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 6) {
          // Range too large, reset and set as new start date
          setStartDate(date);
          setEndDate(null);
        } else {
          setEndDate(date);
        }
      }
    } else {
      // Both dates already set, start new selection
      setStartDate(date);
      setEndDate(null);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate total cells needed (always show 6 rows for consistency)
    const totalCells = 42; // 6 rows × 7 days

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div 
          key={`empty-start-${i}`} 
          style={{ 
            padding: '6px',
            minHeight: '28px'
          }} 
        />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isStart = isSameDay(currentDate, startDate);
      const isEnd = isSameDay(currentDate, endDate);
      const inRange = isInRange(currentDate, startDate, endDate);
      const isPast = currentDate < today;

      days.push(
        <div
          key={day}
          onClick={() => !isPast && handleDateClick(currentDate)}
          style={{
            padding: '6px',
            textAlign: 'center',
            cursor: isPast ? 'not-allowed' : 'pointer',
            borderRadius: (isStart || isEnd) ? '50%' : '0',
            backgroundColor: 
              (isStart || isEnd) ? '#16a34a' : 
              inRange ? '#dcfce7' : 
              'transparent',
            color: 
              (isStart || isEnd) ? 'white' : 
              isPast ? '#9ca3af' : 
              '#1f2937',
            fontWeight: (isStart || isEnd) ? '700' : '400',
            fontSize: '12px',
            opacity: isPast ? 0.4 : 1,
            transition: 'all 0.2s ease',
            minHeight: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            if (!isPast && !isStart && !isEnd) {
              e.target.style.backgroundColor = '#f3f4f6';
            }
          }}
          onMouseLeave={(e) => {
            if (!isPast && !isStart && !isEnd && !inRange) {
              e.target.style.backgroundColor = 'transparent';
            } else if (inRange && !isStart && !isEnd) {
              e.target.style.backgroundColor = '#dcfce7';
            }
          }}
        >
          {day}
        </div>
      );
    }

    // Fill remaining cells to reach 42 total (6 rows)
    const remainingCells = totalCells - days.length;
    for (let i = 0; i < remainingCells; i++) {
      days.push(
        <div 
          key={`empty-end-${i}`} 
          style={{ 
            padding: '6px',
            minHeight: '28px'
          }} 
        />
      );
    }

    return (
      <div style={{ width: '100%' }}>
        {/* Calendar Header with Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <button
            onClick={previousMonth}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              color: '#1f2937'
            }}
          >
            <ChevronLeft size={18} />
          </button>
          
          <div style={{
            fontWeight: '600',
            fontSize: '14px',
            color: '#1f2937'
          }}>
            {monthName}
          </div>
          
          <button
            onClick={nextMonth}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              color: '#1f2937'
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridTemplateRows: 'repeat(7, auto)', // 1 header row + 6 date rows
          gap: '2px'
        }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div
              key={index}
              style={{
                padding: '6px 4px',
                textAlign: 'center',
                fontSize: '10px',
                fontWeight: '600',
                color: '#6b7280'
              }}
            >
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  // Calculate days between dates
  const calculateDays = () => {
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const days = calculateDays();

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '12px 20px',
      boxSizing: 'border-box',
      overflow: 'auto'
    }}>
      {/* Step Indicator - Fixed at top with more spacing */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '36px',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            style={{
              width: step === s ? '32px' : '8px',
              height: '8px',
              borderRadius: '4px',
              backgroundColor: step >= s ? '#84cc16' : '#374151',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>

      {/* Content area - flex grow to push buttons to bottom */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 0
      }}>
        {/* Step 1: Journey Dates with Calendar */}
        {step === 1 && (
          <div style={{
            width: '100%',
            maxWidth: '380px',
            textAlign: 'center',
            animation: 'fadeIn 0.3s ease-in'
          }}>
            <h2 style={{
              color: 'white',
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '6px',
              margin: '0 0 6px 0'
            }}>When are you going?</h2>
            <p style={{
              color: '#9ca3af',
              fontSize: '12px',
              marginBottom: '16px',
              margin: '0 0 16px 0'
            }}>Choose a date range, up to 7 days.</p>

            {/* Calendar Container */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '14px',
              padding: '16px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              {renderCalendar()}
            </div>
          </div>
        )}

        {/* Step 2: Budget */}
        {step === 2 && (
          <div style={{
            width: '100%',
            maxWidth: '400px',
            textAlign: 'center',
            animation: 'fadeIn 0.3s ease-in'
          }}>
            <h2 style={{
              color: 'white',
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '6px',
              margin: '0 0 6px 0'
            }}>What's your budget?</h2>
            <p style={{
              color: '#9ca3af',
              fontSize: '12px',
              marginBottom: '16px',
              margin: '0 0 16px 0'
            }}>Set your budget range for the trip</p>

            <div style={{
              backgroundColor: '#1f2937',
              padding: '32px',
              borderRadius: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                fontSize: '48px',
                fontWeight: '700',
                color: '#84cc16',
                marginBottom: '24px'
              }}>
                ₱{budget.toLocaleString()}
              </div>

              <input
                type="range"
                min="5000"
                max="50000"
                step="500"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: '#374151',
                  outline: 'none',
                  cursor: 'pointer',
                  WebkitAppearance: 'none',
                  appearance: 'none'
                }}
              />
              
              <style>{`
                input[type='range']::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #84cc16;
                  cursor: pointer;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                input[type='range']::-moz-range-thumb {
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #84cc16;
                  cursor: pointer;
                  border: none;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                input[type='range']::-webkit-slider-runnable-track {
                  background: linear-gradient(to right, #84cc16 0%, #84cc16 ${((budget - 5000) / (50000 - 5000)) * 100}%, #374151 ${((budget - 5000) / (50000 - 5000)) * 100}%, #374151 100%);
                  height: 8px;
                  border-radius: 4px;
                }
              `}</style>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '12px'
              }}>
                <span style={{ color: '#9ca3af', fontSize: '12px' }}>₱5,000</span>
                <span style={{ color: '#9ca3af', fontSize: '12px' }}>₱50,000</span>
              </div>
            </div>

            {days > 0 && (
              <div style={{
                backgroundColor: '#1f2937',
                padding: '12px',
                borderRadius: '8px'
              }}>
                <p style={{
                  color: '#9ca3af',
                  fontSize: '12px',
                  margin: 0
                }}>
                  ₱{Math.round(budget / days).toLocaleString()} per day
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Preferences */}
        {step === 3 && (
          <div style={{
            width: '100%',
            maxWidth: '500px',
            textAlign: 'center',
            animation: 'fadeIn 0.3s ease-in'
          }}>
            <h2 style={{
              color: 'white',
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '6px',
              margin: '0 0 6px 0'
            }}>What interests you?</h2>
            <p style={{
              color: '#9ca3af',
              fontSize: '12px',
              marginBottom: '16px',
              margin: '0 0 16px 0'
            }}>Select your preferences for the trip</p>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              {Object.keys(preferences).map((key) => (
                <button
                  key={key}
                  onClick={() => togglePreference(key)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '24px',
                    border: preferences[key] ? '2px solid #84cc16' : '2px solid #374151',
                    backgroundColor: preferences[key] ? '#84cc16' : '#1f2937',
                    color: preferences[key] ? '#000000' : 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!preferences[key]) {
                      e.target.style.borderColor = '#84cc16';
                      e.target.style.backgroundColor = '#374151';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!preferences[key]) {
                      e.target.style.borderColor = '#374151';
                      e.target.style.backgroundColor = '#1f2937';
                    }
                  }}
                >
                  {key}
                </button>
              ))}
            </div>

            <div style={{
              backgroundColor: '#1f2937',
              padding: '12px',
              borderRadius: '8px'
            }}>
              <p style={{
                color: '#9ca3af',
                fontSize: '12px',
                margin: 0
              }}>
                {Object.values(preferences).filter(Boolean).length} preferences selected
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons - Fixed at bottom */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '16px',
        paddingTop: '12px',
        width: '100%',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {step > 1 && (
          <button
            onClick={handlePrevious}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#374151',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#374151'}
          >
            <ChevronLeft size={18} />
            Previous
          </button>
        )}
        
        {step < 3 ? (
          <button
            onClick={handleNext}
            disabled={step === 1 && (!startDate || !endDate)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: (step === 1 && (!startDate || !endDate)) ? '#374151' : '#84cc16',
              color: (step === 1 && (!startDate || !endDate)) ? '#9ca3af' : '#000000',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: (step === 1 && (!startDate || !endDate)) ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              opacity: (step === 1 && (!startDate || !endDate)) ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!(step === 1 && (!startDate || !endDate))) {
                e.target.style.backgroundColor = '#a3e635';
              }
            }}
            onMouseLeave={(e) => {
              if (!(step === 1 && (!startDate || !endDate))) {
                e.target.style.backgroundColor = '#84cc16';
              }
            }}
          >
            Next
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={() => {
              const data = { startDate, endDate, budget, preferences };
              console.log('Create Itinerary clicked with data:', data);
              console.log('callbackRef.current:', callbackRef.current);
              if (callbackRef.current) {
                try {
                  callbackRef.current(data);
                  console.log('Create Itinerary callback invoked successfully');
                } catch (error) {
                  console.error('Error in Create Itinerary callback:', error);
                }
              } else {
                console.warn('callbackRef.current is not defined');
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 32px',
              backgroundColor: '#84cc16',
              color: '#000000',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#a3e635'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#84cc16'}
          >
            Create Itinerary
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}