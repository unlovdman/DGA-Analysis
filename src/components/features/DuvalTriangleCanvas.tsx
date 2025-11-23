import React, { useEffect, useRef } from 'react';
import { DUVAL_GEOMETRY, type Point } from '../../utils/duvalGeometry';
import Button from '../ui/Button';
import { Download } from '@mui/icons-material';

interface DuvalTriangleCanvasProps {
    method: 1 | 4 | 5;
    gasConcentrations: {
        gas1: number; // CH4 for T1, H2 for T4, CH4 for T5
        gas2: number; // C2H4 for T1, CH4 for T4, C2H4 for T5
        gas3: number; // C2H2 for T1, C2H6 for T4, C2H6 for T5
    };
    width?: number;
    height?: number;
    showLegend?: boolean;
}

const DuvalTriangleCanvas: React.FC<DuvalTriangleCanvasProps> = ({
    method,
    gasConcentrations,
    width = 400,
    height = 350,
    showLegend = false
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // --- Coordinate System Setup ---
        const padding = 90; // Increased padding for labels
        const normWidth = 100;
        const normHeight = 100 * (Math.sqrt(3) / 2);

        const availWidth = width - padding * 2;
        const availHeight = height - padding * 2;

        const scaleX = availWidth / normWidth;
        const scaleY = availHeight / normHeight;
        const scale = Math.min(scaleX, scaleY);

        const drawWidth = normWidth * scale;
        const drawHeight = normHeight * scale;

        const offsetX = (width - drawWidth) / 2;
        const offsetY = (height - drawHeight) / 2 + drawHeight; // Start from bottom

        const toScreen = (p: Point): Point => {
            return {
                x: offsetX + p.x * scale,
                y: offsetY - p.y * scale
            };
        };

        // Vertices
        const top = toScreen({ x: 50, y: normHeight });
        const right = toScreen({ x: 100, y: 0 });
        const left = toScreen({ x: 0, y: 0 });

        // --- Draw Main Triangle ---
        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.lineTo(right.x, right.y);
        ctx.lineTo(left.x, left.y);
        ctx.closePath();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // --- Draw Ticks & Numbers ---
        ctx.fillStyle = '#000';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000';

        const drawAxisTicks = (start: Point, end: Point, align: 'left' | 'right' | 'bottom') => {
            for (let i = 0; i <= 100; i += 20) {
                // Interpolate position
                const t = i / 100;
                const px = start.x + (end.x - start.x) * t;
                const py = start.y + (end.y - start.y) * t;

                // Tick direction
                let tx = 0, ty = 0;
                const tickLen = 5;

                if (align === 'left') {
                    const dx = end.x - start.x;
                    const dy = end.y - start.y;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    // Normal pointing outward (Left-Up)
                    tx = (dy / len) * tickLen;
                    ty = (-dx / len) * tickLen;
                } else if (align === 'right') {
                    const dx = end.x - start.x;
                    const dy = end.y - start.y;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    // Normal pointing outward (Right-Up)
                    tx = (-dy / len) * tickLen;
                    ty = (dx / len) * tickLen;
                } else { // bottom
                    tx = 0; ty = tickLen; // Down
                }

                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px + tx, py + ty);
                ctx.stroke();

                // Draw Number
                const labelOffset = 22; // Increased offset
                const lx = px + tx * (labelOffset / tickLen);
                const ly = py + ty * (labelOffset / tickLen);

                ctx.fillText(i.toString(), lx, ly);
            }
        };

        drawAxisTicks(left, top, 'left');
        drawAxisTicks(top, right, 'right');
        drawAxisTicks(right, left, 'bottom');

        // --- Draw Internal Regions ---
        const geometry = DUVAL_GEOMETRY[method];
        if (geometry) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.2; // Slightly thinner for internal lines

            geometry.lines.forEach(line => {
                const sStart = toScreen(line.start);
                const sEnd = toScreen(line.end);
                ctx.beginPath();
                ctx.moveTo(sStart.x, sStart.y);
                ctx.lineTo(sEnd.x, sEnd.y);
                ctx.stroke();
            });

            ctx.fillStyle = '#000';
            ctx.font = 'bold 11px Arial'; // Slightly smaller font for regions
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            geometry.labels.forEach(label => {
                const sPos = toScreen(label.position);
                // Optional: Add white halo/stroke to text to make it stand out against lines
                ctx.lineWidth = 3;
                ctx.strokeStyle = 'white';
                ctx.strokeText(label.text, sPos.x, sPos.y);
                ctx.lineWidth = 1; // Reset
                ctx.fillText(label.text, sPos.x, sPos.y);
            });
        }

        // --- Draw Axis Labels & Arrows (Rotated) ---
        ctx.font = 'bold 13px Arial';
        ctx.fillStyle = '#000';

        const drawAxisLabel = (start: Point, end: Point, label: string, align: 'left' | 'right' | 'bottom') => {
            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;

            const dx = end.x - start.x;
            const dy = end.y - start.y;
            let angle = Math.atan2(dy, dx);

            const offset = 55; // Increased offset
            let lx = 0, ly = 0;

            // Calculate normal vector for offset
            const len = Math.sqrt(dx * dx + dy * dy);
            const nx = -dy / len;
            const ny = dx / len;

            if (align === 'left') {
                // Outward is (-nx, -ny)
                lx = midX - nx * offset;
                ly = midY - ny * offset;
            } else if (align === 'right') {
                // Outward is (nx, ny)
                lx = midX + nx * offset;
                ly = midY + ny * offset;
            } else { // bottom
                lx = midX;
                ly = midY + offset;
                // Fix rotation for bottom label
                // Angle is PI (180 deg) because it goes Right -> Left
                // We want text to be readable (0 deg)
                angle = 0;
            }

            ctx.save();
            ctx.translate(lx, ly);
            ctx.rotate(angle);

            // Draw Arrow Line
            const arrowLen = 50;
            ctx.beginPath();
            ctx.moveTo(-arrowLen / 2, 0);
            ctx.lineTo(arrowLen / 2, 0);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Arrowhead
            if (align === 'bottom') {
                // Draw arrow pointing Left
                ctx.beginPath();
                ctx.moveTo(-arrowLen / 2, 0); // Tip
                ctx.lineTo(-arrowLen / 2 + 6, -3);
                ctx.lineTo(-arrowLen / 2 + 6, 3);
                ctx.fillStyle = '#000';
                ctx.fill();
            } else {
                // Standard forward arrow
                ctx.beginPath();
                ctx.moveTo(arrowLen / 2, 0);
                ctx.lineTo(arrowLen / 2 - 6, -3);
                ctx.lineTo(arrowLen / 2 - 6, 3);
                ctx.fillStyle = '#000';
                ctx.fill();
            }

            // Text
            ctx.textAlign = 'center';
            ctx.fillText(label, 0, -12); // Text above arrow

            ctx.restore();
        };

        let label1 = method === 1 ? 'CH4' : method === 4 ? 'H2' : 'CH4';
        let label2 = method === 1 ? 'C2H4' : method === 4 ? 'CH4' : 'C2H4';
        let label3 = method === 1 ? 'C2H2' : method === 4 ? 'C2H6' : 'C2H6';

        // Left Side: Gas 3 -> Gas 1 (Arrow points Up-Right)
        drawAxisLabel(left, top, `% ${label1}`, 'left');

        // Right Side: Gas 1 -> Gas 2 (Arrow points Down-Right)
        drawAxisLabel(top, right, `% ${label2}`, 'right');

        // Bottom Side: Gas 2 -> Gas 3 (Arrow points Left)
        drawAxisLabel(right, left, `% ${label3}`, 'bottom');

        // --- Plot User Data Point ---
        const total = gasConcentrations.gas1 + gasConcentrations.gas2 + gasConcentrations.gas3;
        if (total > 0) {
            const p1 = (gasConcentrations.gas1 / total) * 100;
            const p2 = (gasConcentrations.gas2 / total) * 100;
            const p3 = (gasConcentrations.gas3 / total) * 100;

            const px = p2 + 0.5 * p1;
            const py = (Math.sqrt(3) / 2) * p1;

            const screenPos = toScreen({ x: px, y: py });

            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Legend for point
            ctx.fillStyle = 'black';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'left';

            const text = 'Your Data';
            const tm = ctx.measureText(text);

            // Draw background for text
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.fillRect(screenPos.x + 8, screenPos.y - 8, tm.width + 4, 16);

            ctx.fillStyle = 'black';
            ctx.fillText(text, screenPos.x + 10, screenPos.y);
        }

    }, [method, gasConcentrations, width, height]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = `Duval_Triangle_${method}_${new Date().getTime()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative border rounded-lg shadow-sm bg-white p-4">
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className="max-w-full h-auto"
                />
            </div>

            <div className="mt-4 flex gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download Diagram
                </Button>
            </div>
        </div>
    );
};

export default DuvalTriangleCanvas;
