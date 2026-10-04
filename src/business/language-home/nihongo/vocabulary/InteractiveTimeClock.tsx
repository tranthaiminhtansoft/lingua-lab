import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { clockWords, hours, minutes } from './content/time';
import type { ReadingPart, TimeWord } from './content/time';
import { Reading } from './TimeReading';

type Hand = 'hour' | 'minute';
const zeroMinutes: TimeWord = { japanese: '0分', kana: 'れいふん', romaji: 'reifun', meaning: '0 minutes · on the hour', parts: [{ kana: 'れい', romaji: 'rei', role: 'base' }, { kana: 'ふん', romaji: 'fun', role: 'fun' }] };
const point = (angle: number, radius: number) => ({ x: 160 + Math.sin(angle * Math.PI / 180) * radius, y: 160 - Math.cos(angle * Math.PI / 180) * radius });
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
function callout(tip: { x: number; y: number }) {
  const width = 138, height = 72;
  return { width, height, x: clamp(tip.x < 160 ? tip.x + 8 : tip.x - width - 8, 4, 178), y: clamp(tip.y - height / 2, 4, 244) };
}

export function InteractiveTimeClock() {
  const [hour, setHour] = useState(4);
  const [minute, setMinute] = useState(30);
  const [period, setPeriod] = useState<'am' | 'pm'>('pm');
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ hand: Hand; pointerId: number } | null>(null);
  const hourEntry = hours[hour - 1], minuteEntry = minute ? minutes[minute - 1] : zeroMinutes;
  const periodEntry = clockWords[period === 'am' ? 0 : 1];
  const combinedParts: ReadingPart[] = [
    { kana: periodEntry.kana, romaji: periodEntry.romaji, role: 'base' },
    ...hourEntry.parts!, ...(minute ? minuteEntry.parts! : []),
  ];
  const digitalTime = `${hour}:${String(minute).padStart(2, '0')} ${period === 'am' ? 'a.m.' : 'p.m.'}`;
  const combined: TimeWord = {
    japanese: periodEntry.japanese + hourEntry.japanese + (minute ? minuteEntry.japanese : ''),
    kana: periodEntry.kana + hourEntry.kana + (minute ? minuteEntry.kana : ''),
    romaji: `${periodEntry.romaji} ${hourEntry.romaji}${minute ? ` ${minuteEntry.romaji}` : ''}`,
    meaning: digitalTime, parts: combinedParts,
  };
  const halfPast: TimeWord = {
    japanese: `${periodEntry.japanese}${hourEntry.japanese}半`, kana: `${periodEntry.kana}${hourEntry.kana}はん`,
    romaji: `${periodEntry.romaji} ${hourEntry.romaji} han`, meaning: 'Also: half past',
    parts: [{ kana: periodEntry.kana, romaji: periodEntry.romaji, role: 'base' }, ...hourEntry.parts!, { kana: 'はん', romaji: 'han', role: 'shared' }],
  };
  const hourTip = point((hour % 12 + minute / 60) * 30, 78);
  const minuteTip = point(minute * 6, 114);
  let hourCallout = callout(hourTip), minuteCallout = callout(minuteTip);
  const overlap = hourCallout.x < minuteCallout.x + minuteCallout.width + 6
    && hourCallout.x + hourCallout.width + 6 > minuteCallout.x
    && hourCallout.y < minuteCallout.y + minuteCallout.height + 6
    && hourCallout.y + hourCallout.height + 6 > minuteCallout.y;
  if (overlap) {
    hourCallout = { ...hourCallout, y: 4 };
    minuteCallout = { ...minuteCallout, y: 244 };
  }

  function updateHand(hand: Hand, clientX: number, clientY: number) {
    const bounds = svgRef.current!.getBoundingClientRect();
    const x = clientX - bounds.left - bounds.width / 2, y = clientY - bounds.top - bounds.height / 2;
    if (Math.hypot(x, y) < bounds.width * .06) return;
    const angle = (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360;
    if (hand === 'minute') setMinute(Math.round(angle / 6) % 60);
    else setHour(Math.round(angle / 30) % 12 || 12);
  }
  function startDrag(hand: Hand, event: PointerEvent<SVGGElement>) {
    if (event.button !== 0 || drag.current) return;
    event.preventDefault();
    drag.current = { hand, pointerId: event.pointerId };
    svgRef.current!.setPointerCapture(event.pointerId);
    // Retain the current value until the pointer moves so an off-center grab does not jump.
  }
  function stopDrag(event: PointerEvent<SVGSVGElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return <section className="time-interactive-clock" aria-labelledby="interactive-clock-title">
    <h4 id="interactive-clock-title">Turn the hands. Read the time.</h4>
    <p>Drag either hand, or use the compact sliders below the clock. The matching reading card follows each hand. Explore all 60 minute positions.</p>
    <div className="time-clock-workspace">
      <div className="time-clock-face-panel">
        <fieldset className="time-period-choice"><legend>Time of day</legend>{(['am', 'pm'] as const).map((value) => <label key={value}><input type="radio" name="clock-period" value={value} checked={period === value} onChange={() => setPeriod(value)} />{value === 'am' ? 'a.m.' : 'p.m.'}</label>)}</fieldset>
        <div className="time-clock-stage">
        <svg ref={svgRef} className="time-clock-face" viewBox="0 0 320 320" aria-hidden="true"
          onPointerMove={(event) => { if (drag.current?.pointerId === event.pointerId) updateHand(drag.current.hand, event.clientX, event.clientY); }}
          onPointerUp={stopDrag} onPointerCancel={stopDrag} onLostPointerCapture={() => { drag.current = null; }}>
          <circle cx="160" cy="160" r="152" fill="var(--washi)" stroke="var(--ink)" strokeWidth="3" />
          {Array.from({ length: 60 }, (_, index) => { const start = point(index * 6, index % 5 ? 143 : 136), end = point(index * 6, 148); return <line key={index} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="var(--ink)" strokeWidth={index % 5 ? 1 : 3} />; })}
          {Array.from({ length: 12 }, (_, index) => { const position = point((index + 1) * 30, 122); return <text key={index} x={position.x} y={position.y} textAnchor="middle" dominantBaseline="central" fontSize="20" fill="var(--ink)">{index + 1}</text>; })}
          <g data-hand="hour" className="time-clock-hand" onPointerDown={(event) => startDrag('hour', event)}>
            <line x1="160" y1="160" x2={hourTip.x} y2={hourTip.y} stroke="transparent" strokeWidth="28" />
            <line x1="160" y1="160" x2={hourTip.x} y2={hourTip.y} stroke="var(--indigo)" strokeWidth="9" strokeLinecap="round" />
            <circle cx={hourTip.x} cy={hourTip.y} r="9" fill="var(--indigo)" stroke="var(--paper)" strokeWidth="2" />
          </g>
          <g data-hand="minute" className="time-clock-hand" onPointerDown={(event) => startDrag('minute', event)}>
            <line x1="160" y1="160" x2={minuteTip.x} y2={minuteTip.y} stroke="transparent" strokeWidth="24" />
            <line x1="160" y1="160" x2={minuteTip.x} y2={minuteTip.y} stroke="var(--verm)" strokeWidth="5" strokeLinecap="round" />
            <circle cx={minuteTip.x} cy={minuteTip.y} r="8" fill="var(--verm)" stroke="var(--paper)" strokeWidth="2" />
          </g>
          <circle cx="160" cy="160" r="7" fill="var(--ink)" pointerEvents="none" />
        </svg>
        <div className="time-clock-callout time-hour-callout" style={{ left: `${hourCallout.x / 320 * 100}%`, top: `${hourCallout.y / 320 * 100}%` }} aria-hidden="true">
          <b>{hour} o’clock</b><Reading entry={hourEntry} meaning={false} />
        </div>
        <div className="time-clock-callout time-minute-callout" style={{ left: `${minuteCallout.x / 320 * 100}%`, top: `${minuteCallout.y / 320 * 100}%` }} aria-hidden="true">
          <b>{minute} {minute === 1 ? 'minute' : 'minutes'}</b><Reading entry={minuteEntry} meaning={false} />
        </div>
        </div>
        <output className="time-digital-display" aria-label="Selected time">{digitalTime}</output>
      </div>
      <div className="time-hand-sliders" aria-label="Adjust clock hands">
        <label className="time-hand-slider time-hour-reading" htmlFor="clock-hour"><span>Hour hand · {hour} o’clock</span><input id="clock-hour" aria-label="Hour hand" type="range" min="1" max="12" value={hour} onChange={(event) => setHour(Number(event.target.value))} /></label>
        <label className="time-hand-slider time-minute-reading" htmlFor="clock-minute"><span>Minute hand · {minute} {minute === 1 ? 'minute' : 'minutes'}</span><input id="clock-minute" aria-label="Minute hand" type="range" min="0" max="59" value={minute} onChange={(event) => setMinute(Number(event.target.value))} /></label>
      </div>
    </div>
    <div className="time-combined-reading" aria-live="polite" aria-atomic="true"><b>Hours + minutes together</b><Reading entry={combined} />{minute === 30 && <Reading entry={halfPast} />}{minute === 0 && <p>On the hour: say the hour with no minutes.</p>}</div>
  </section>;
}
