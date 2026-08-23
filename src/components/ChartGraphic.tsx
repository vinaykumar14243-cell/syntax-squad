import { useEffect, useRef, useState } from 'react';
import { MotionValue } from 'motion/react';

const USD_TO_INR_RATE = 86.85;

export default function ChartGraphic({ progress }: { progress?: MotionValue<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [liveData, setLiveData] = useState<number[][]>([]);

  useEffect(() => {
    // Fetch live BTCUSDT 1h klines from Binance and convert to INR (₹)
    const loadKlines = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=50');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) throw new Error('Not JSON');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((d: any) => [
            parseFloat(d[1]) * USD_TO_INR_RATE, // open in INR
            parseFloat(d[2]) * USD_TO_INR_RATE, // high in INR
            parseFloat(d[3]) * USD_TO_INR_RATE, // low in INR
            parseFloat(d[4]) * USD_TO_INR_RATE, // close in INR
            parseFloat(d[5]) * USD_TO_INR_RATE, // volume in INR
          ]);
          setLiveData(formatted);
          return;
        }
      } catch {
        // Synthesize Indian / Forex market candle series if network restricted
      }
      
      const base = 22850;
      const fallbackCandles = Array.from({ length: 45 }, (_, idx) => {
        const step = Math.sin(idx * 0.4) * 120 + idx * 8;
        const open = base + step + (Math.random() * 40 - 20);
        const close = open + (Math.random() * 60 - 25);
        const high = Math.max(open, close) + Math.random() * 30;
        const low = Math.min(open, close) - Math.random() * 30;
        const volume = 500000 + Math.random() * 800000;
        return [open, high, low, close, volume];
      });
      setLiveData(fallbackCandles);
    };

    loadKlines();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawChart = (currentProgress: number) => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const ratio = window.devicePixelRatio || 1;
      canvas.width = parent.clientWidth * ratio;
      canvas.height = parent.clientHeight * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      const width = parent.clientWidth;
      const height = parent.clientHeight;
      ctx.clearRect(0, 0, width, height);

      const data = liveData.length > 0 ? liveData : [];
      if (data.length === 0) {
        ctx.fillStyle = "#8390a6";
        ctx.font = "12px Inter, Arial";
        ctx.textAlign = "center";
        ctx.fillText("CONNECTING TO NSE / BSE & FOREX DATA...", width / 2, height / 2);
        return;
      }

      const left = 28;
      const right = 92;
      const top = 25;
      const bottom = 42;
      const chartHeight = height * 0.68;
      const volumeTop = height * 0.76;
      const plotWidth = width - left - right;
      
      const visibleCount = Math.max(8, Math.floor(data.length * currentProgress));
      const visibleData = data.slice(0, visibleCount);

      const allPrices = data.flatMap(item => [item[1], item[2]]);
      const minPrice = Math.min(...allPrices) * 0.995;
      const maxPrice = Math.max(...allPrices) * 1.005;

      const priceY = (value: number) =>
        top + ((maxPrice - value) / (maxPrice - minPrice)) * chartHeight;

      const candleSpace = plotWidth / data.length;
      const candleWidth = Math.max(2, candleSpace * 0.58);

      // Horizontal price grid and labels in INR (₹)
      ctx.font = "11px Inter, Arial";
      ctx.textAlign = "left";

      for (let i = 0; i <= 5; i++) {
        const y = top + (chartHeight / 5) * i;
        const price = maxPrice - ((maxPrice - minPrice) / 5) * i;

        ctx.strokeStyle = "rgba(180,200,220,0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(width - right, y);
        ctx.stroke();

        ctx.fillStyle = "#8390a6";
        let formattedLabel = '₹' + Math.round(price).toLocaleString('en-IN');
        if (price >= 10000000) {
          formattedLabel = '₹' + (price / 10000000).toFixed(2) + ' Cr';
        } else if (price >= 100000) {
          formattedLabel = '₹' + (price / 100000).toFixed(1) + ' L';
        }
        ctx.fillText(formattedLabel, width - right + 8, y + 4);
      }

      // Vertical grid
      for (let i = 0; i <= 8; i++) {
        const x = left + (plotWidth / 8) * i;
        ctx.strokeStyle = "rgba(180,200,220,0.08)";
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, height - bottom);
        ctx.stroke();

        ctx.fillStyle = "#66748c";
        ctx.fillText(`0${i}:00`, x - 13, height - 16);
      }

      // Volume bars
      const maxVolume = Math.max(...data.map(item => item[4]));

      visibleData.forEach((item, index) => {
        const x = left + candleSpace * index + candleSpace / 2;
        const [open, , , close, volume] = item;
        const bullish = close >= open;
        const barHeight = (volume / maxVolume) * (height - volumeTop - bottom);

        ctx.fillStyle = bullish
          ? "rgba(25,213,139,0.25)"
          : "rgba(255,78,114,0.22)";

        ctx.fillRect(
          x - candleWidth / 2,
          height - bottom - barHeight,
          candleWidth,
          barHeight
        );
      });

      // Moving average line
      ctx.beginPath();

      visibleData.forEach((item, index) => {
        const recent = data.slice(Math.max(0, index - 6), index + 1);
        const average =
          recent.reduce((total, candle) => total + candle[3], 0) / recent.length;

        const x = left + candleSpace * index + candleSpace / 2;
        const y = priceY(average);

        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.strokeStyle = "#e7bd65";
      ctx.lineWidth = 2;
      ctx.shadowColor = "rgba(231,189,101,0.5)";
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Candlestick bodies and wicks
      visibleData.forEach((item, index) => {
        const x = left + candleSpace * index + candleSpace / 2;
        const [open, high, low, close] = item;
        const bullish = close >= open;
        const color = bullish ? "#19d58b" : "#ff4e72";

        const highY = priceY(high);
        const lowY = priceY(low);
        const openY = priceY(open);
        const closeY = priceY(close);
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(2, Math.abs(openY - closeY));

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Candle body
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.fillRect(
          x - candleWidth / 2,
          bodyTop,
          candleWidth,
          bodyHeight
        );
        ctx.shadowBlur = 0;

        // Highlight edge
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 1;
        ctx.strokeRect(
          x - candleWidth / 2,
          bodyTop,
          candleWidth,
          bodyHeight
        );
      });

      // Current price line in INR (₹)
      if (visibleData.length > 0) {
        const currentPrice = visibleData[visibleData.length - 1][3];
        const currentY = priceY(currentPrice);

        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = "rgba(25,213,139,0.7)";
        ctx.beginPath();
        ctx.moveTo(left, currentY);
        ctx.lineTo(width - right, currentY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "#19d58b";
        ctx.fillRect(width - right + 4, currentY - 12, 84, 24);
        ctx.fillStyle = "#04100d";
        ctx.font = "bold 10px Inter, Arial";
        
        let priceStr = '₹' + Math.round(currentPrice).toLocaleString('en-IN');
        if (currentPrice >= 10000000) {
          priceStr = '₹' + (currentPrice / 10000000).toFixed(2) + ' Cr';
        } else if (currentPrice >= 100000) {
          priceStr = '₹' + (currentPrice / 100000).toFixed(1) + ' L';
        }
        ctx.fillText(priceStr, width - right + 8, currentY + 4);
      }

      // Volume label
      ctx.fillStyle = "#66748c";
      ctx.font = "10px Inter, Arial";
      ctx.fillText("VOLUME (INR ₹)", left, volumeTop - 9);
    };

    let unsubscribe: () => void;
    if (progress) {
      unsubscribe = progress.on('change', (latest) => {
        requestAnimationFrame(() => drawChart(latest));
      });
      drawChart(progress.get());
    } else {
      drawChart(1);
    }

    const resizeHandler = () => {
      drawChart(progress ? progress.get() : 1);
    };

    window.addEventListener('resize', resizeHandler);
    
    return () => {
      window.removeEventListener('resize', resizeHandler);
      if (unsubscribe) unsubscribe();
    };
  }, [liveData, progress]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
}
