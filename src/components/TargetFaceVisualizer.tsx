import React, { useRef } from 'react';
import { ArrowHit } from '../types';

interface TargetFaceVisualizerProps {
  arrowHits?: ArrowHit[];
  onAddHit?: (hit: ArrowHit) => void;
  interactive?: boolean;
  currentEndNumber?: number;
  currentArrowNumber?: number;
  size?: number; // pixel width/height (default 320)
  targetType?: '10-ring' | '6-ring-80cm' | 'tri-spot';
}

export const TargetFaceVisualizer: React.FC<TargetFaceVisualizerProps> = ({
  arrowHits = [],
  onAddHit,
  interactive = false,
  currentEndNumber = 1,
  currentArrowNumber = 1,
  size = 320,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Target rings config (10 concentric circles)
  // Radii scaled from 1 to 10 where 10 is outer edge (radius = 100)
  const rings = [
    { score: 1, radius: 100, color: '#FFFFFF', stroke: '#CBD5E1', textColor: '#0F172A' },
    { score: 2, radius: 90, color: '#FFFFFF', stroke: '#CBD5E1', textColor: '#0F172A' },
    { score: 3, radius: 80, color: '#1E293B', stroke: '#334155', textColor: '#FFFFFF' },
    { score: 4, radius: 70, color: '#1E293B', stroke: '#334155', textColor: '#FFFFFF' },
    { score: 5, radius: 60, color: '#0284C7', stroke: '#0369A1', textColor: '#FFFFFF' },
    { score: 6, radius: 50, color: '#0284C7', stroke: '#0369A1', textColor: '#FFFFFF' },
    { score: 7, radius: 40, color: '#E11D48', stroke: '#BE123C', textColor: '#FFFFFF' },
    { score: 8, radius: 30, color: '#E11D48', stroke: '#BE123C', textColor: '#FFFFFF' },
    { score: 9, radius: 20, color: '#FACC15', stroke: '#EAB308', textColor: '#0F172A' },
    { score: 10, radius: 10, color: '#FACC15', stroke: '#EAB308', textColor: '#0F172A' },
    { score: 'X', radius: 5, color: '#FACC15', stroke: '#CA8A04', textColor: '#0F172A', isX: true },
  ];

  // Calculate score based on distance from center (0,0) to click point
  const calculateScoreFromDistance = (dist: number): number | 'X' | 'M' => {
    if (dist <= 5) return 'X';
    if (dist <= 10) return 10;
    if (dist <= 20) return 9;
    if (dist <= 30) return 8;
    if (dist <= 40) return 7;
    if (dist <= 50) return 6;
    if (dist <= 60) return 5;
    if (dist <= 70) return 4;
    if (dist <= 80) return 3;
    if (dist <= 90) return 2;
    if (dist <= 100) return 1;
    return 'M'; // Miss
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive || !onAddHit || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert to normalized coordinates (-100 to 100)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const normX = ((clickX - centerX) / (rect.width / 2)) * 100;
    const normY = ((clickY - centerY) / (rect.height / 2)) * 100;

    const dist = Math.sqrt(normX * normX + normY * normY);
    const score = calculateScoreFromDistance(dist);

    const newHit: ArrowHit = {
      id: `hit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      x: Number(normX.toFixed(1)),
      y: Number(normY.toFixed(1)),
      score,
      endNumber: currentEndNumber,
      arrowNumber: currentArrowNumber,
    };

    onAddHit(newHit);
  };

  // Grouping stats
  const totalHits = arrowHits.length;
  let centroidX = 0;
  let centroidY = 0;
  if (totalHits > 0) {
    centroidX = arrowHits.reduce((sum, h) => sum + h.x, 0) / totalHits;
    centroidY = arrowHits.reduce((sum, h) => sum + h.y, 0) / totalHits;
  }

  return (
    <div className="flex flex-col items-center select-none">
      <div
        className="relative bg-slate-900 p-2 sm:p-3 rounded-2xl shadow-xl border border-slate-800"
        style={{ width: size + 24, height: size + 24 }}
      >
        <svg
          ref={svgRef}
          viewBox="-115 -115 230 230"
          width={size}
          height={size}
          onClick={handleSvgClick}
          className={`rounded-full shadow-inner ${interactive ? 'cursor-crosshair' : 'cursor-default'}`}
        >
          {/* Target Background */}
          <rect x="-115" y="-115" width="230" height="230" fill="#0f172a" />
          <circle cx="0" cy="0" r="105" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" />

          {/* Target Rings */}
          {rings.map((ring, idx) => (
            <g key={idx}>
              <circle
                cx="0"
                cy="0"
                r={ring.radius}
                fill={ring.color}
                stroke={ring.stroke}
                strokeWidth={ring.isX ? 0.75 : 1}
              />
              {/* Ring Label Number */}
              {ring.score !== 'X' && ring.radius > 15 && (
                <text
                  x="0"
                  y={-ring.radius + 6.5}
                  textAnchor="middle"
                  fill={ring.textColor}
                  fontSize="5"
                  fontWeight="bold"
                  className="pointer-events-none opacity-80"
                >
                  {ring.score}
                </text>
              )}
            </g>
          ))}

          {/* Crosshairs & Center X */}
          <line x1="-100" y1="0" x2="100" y2="0" stroke="#000000" strokeWidth="0.3" strokeDasharray="1,1" opacity="0.3" />
          <line x1="0" y1="-100" x2="0" y2="100" stroke="#000000" strokeWidth="0.3" strokeDasharray="1,1" opacity="0.3" />
          <line x1="-2.5" y1="0" x2="2.5" y2="0" stroke="#000000" strokeWidth="0.6" />
          <line x1="0" y1="-2.5" x2="0" y2="2.5" stroke="#000000" strokeWidth="0.6" />

          {/* Plotted Arrow Hits */}
          {arrowHits.map((hit, idx) => {
            const isLatest = idx === arrowHits.length - 1;
            return (
              <g key={hit.id || idx}>
                {/* Impact Glow */}
                <circle
                  cx={hit.x}
                  cy={hit.y}
                  r={isLatest ? 5.5 : 4}
                  fill={isLatest ? '#10B981' : '#EC4899'}
                  opacity={isLatest ? 0.4 : 0.25}
                  className="animate-pulse"
                />
                {/* Arrow Point */}
                <circle
                  cx={hit.x}
                  cy={hit.y}
                  r={2.8}
                  fill={isLatest ? '#059669' : '#BE185D'}
                  stroke="#FFFFFF"
                  strokeWidth="0.8"
                />
                {/* Arrow Number Label */}
                <text
                  x={hit.x}
                  y={hit.y + 0.9}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fill="#FFFFFF"
                  fontSize="2.4"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {hit.arrowNumber || idx + 1}
                </text>
              </g>
            );
          })}

          {/* Centroid / Grouping Center Indicator if 3+ arrows */}
          {totalHits >= 3 && (
            <g>
              <circle
                cx={centroidX}
                cy={centroidY}
                r="6"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="0.8"
                strokeDasharray="2,1"
              />
              <circle cx={centroidX} cy={centroidY} r="1.5" fill="#3B82F6" />
            </g>
          )}
        </svg>

        {interactive && (
          <div className="mt-1 text-center">
            <span className="text-[11px] text-amber-400 font-medium">
              🎯 Klik target untuk plot posisi panah #{currentArrowNumber}
            </span>
          </div>
        )}
      </div>

      {/* Grouping Analysis Text */}
      {totalHits >= 3 && (
        <div className="mt-2 text-xs text-slate-400 text-center flex items-center space-x-3 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
          <span>
            Pusat Grouping: <strong className="text-slate-200">({centroidX.toFixed(1)}, {centroidY.toFixed(1)})</strong>
          </span>
          <span>•</span>
          <span className="text-emerald-400 font-medium">
            {Math.abs(centroidX) < 15 && Math.abs(centroidY) < 15
              ? 'Tepat di Pusat (Gold)'
              : centroidY > 15
              ? 'Condong Rendah/Bawah'
              : centroidY < -15
              ? 'Condong Tinggi/Atas'
              : centroidX > 15
              ? 'Condong Kanan'
              : 'Condong Kiri'}
          </span>
        </div>
      )}
    </div>
  );
};
