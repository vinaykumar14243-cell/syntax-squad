/**
 * Image Validation & Statistical Analysis Engine
 * Detects blank, solid color, corrupted, low contrast, or non-chart images
 * before/during AI trading analysis.
 */

export interface ImagePixelStats {
  isUniformOrBlank: boolean;
  averageBrightness: number;
  variance: number;
  edgeDensity: number;
  dominantColorRatio: number;
  rejectionReason?: string;
}

export interface ClientImageValidationResult extends ImagePixelStats {
  isValid: boolean;
  chartLikelihoodScore: number;
}

export function generateValidationDiagnosticReport(stats: ImagePixelStats): string {
  if (stats.isUniformOrBlank) {
    return stats.rejectionReason || 'Unable to analyze this image. Please upload a clear screenshot containing the complete trading chart.';
  }
  return 'Visual chart structure detected with sufficient contrast and edges.';
}

/**
 * Fast byte-level entropy and variance analysis for server-side buffers
 */
export function analyzeBufferStatistics(buffer: Buffer): {
  isLikelyBlank: boolean;
  variance: number;
  entropy: number;
  reason?: string;
} {
  if (!buffer || buffer.length < 64) {
    return { isLikelyBlank: true, variance: 0, entropy: 0, reason: "File is empty or corrupted" };
  }

  // Calculate byte frequency distribution
  const frequencies = new Array(256).fill(0);
  let sum = 0;
  const sampleStep = Math.max(1, Math.floor(buffer.length / 5000));
  let sampleCount = 0;

  for (let i = 0; i < buffer.length; i += sampleStep) {
    const byte = buffer[i];
    frequencies[byte]++;
    sum += byte;
    sampleCount++;
  }

  const mean = sum / sampleCount;
  let varianceSum = 0;
  let entropy = 0;

  for (let i = 0; i < buffer.length; i += sampleStep) {
    const byte = buffer[i];
    varianceSum += Math.pow(byte - mean, 2);
  }

  const variance = varianceSum / sampleCount;

  // Shannon entropy
  for (let i = 0; i < 256; i++) {
    if (frequencies[i] > 0) {
      const p = frequencies[i] / sampleCount;
      entropy -= p * Math.log2(p);
    }
  }

  // A completely white, black, or flat image (even compressed) will have extremely low entropy or tiny size
  if (buffer.length < 500 && entropy < 2.5) {
    return {
      isLikelyBlank: true,
      variance,
      entropy,
      reason: "Image payload is extremely small or completely uniform (solid color/blank)"
    };
  }

  return {
    isLikelyBlank: false,
    variance,
    entropy
  };
}

/**
 * Client-side browser canvas analyzer for raw RGBA pixel examination
 * Accepts either an HTMLImageElement, File, or Blob
 */
export async function analyzeImagePixelsOnClient(input: HTMLImageElement | File | Blob): Promise<ClientImageValidationResult> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return resolve({
        isValid: true,
        chartLikelihoodScore: 80,
        isUniformOrBlank: false,
        averageBrightness: 128,
        variance: 500,
        edgeDensity: 0.1,
        dominantColorRatio: 0.5
      });
    }

    const processElement = (imageElement: HTMLImageElement) => {
      try {
        const canvas = document.createElement('canvas');
        const width = Math.min(imageElement.naturalWidth || 300, 300);
        const height = Math.min(imageElement.naturalHeight || 300, 300);
        
        if (width <= 0 || height <= 0) {
          return resolve({
            isValid: false,
            chartLikelihoodScore: 0,
            isUniformOrBlank: true,
            averageBrightness: 0,
            variance: 0,
            edgeDensity: 0,
            dominantColorRatio: 1,
            rejectionReason: "Unable to analyze this image. Image has invalid dimensions."
          });
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        if (!ctx) {
          return resolve({
            isValid: true,
            chartLikelihoodScore: 60,
            isUniformOrBlank: false,
            averageBrightness: 128,
            variance: 500,
            edgeDensity: 0.1,
            dominantColorRatio: 0.5
          });
        }

        ctx.drawImage(imageElement, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const totalPixels = width * height;

        let totalLuma = 0;
        const lumaValues: number[] = new Float32Array(totalPixels) as any;
        const colorBuckets: Record<string, number> = {};
        let maxBucketCount = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Perceived luminance
          const luma = a === 0 ? 255 : 0.299 * r + 0.587 * g + 0.114 * b;
          const pixelIdx = i / 4;
          lumaValues[pixelIdx] = luma;
          totalLuma += luma;

          // Color bucket quantization (step of 16)
          const qKey = `${Math.floor(r / 16)}_${Math.floor(g / 16)}_${Math.floor(b / 16)}`;
          colorBuckets[qKey] = (colorBuckets[qKey] || 0) + 1;
          if (colorBuckets[qKey] > maxBucketCount) {
            maxBucketCount = colorBuckets[qKey];
          }
        }

        const avgLuma = totalLuma / totalPixels;
        let varianceSum = 0;
        for (let i = 0; i < totalPixels; i++) {
          varianceSum += Math.pow(lumaValues[i] - avgLuma, 2);
        }
        const variance = varianceSum / totalPixels;

        // Edge detection: difference with right & bottom neighbors
        let edgeCount = 0;
        for (let y = 0; y < height - 1; y += 2) {
          for (let x = 0; x < width - 1; x += 2) {
            const curr = lumaValues[y * width + x];
            const right = lumaValues[y * width + (x + 1)];
            const bottom = lumaValues[(y + 1) * width + x];
            if (Math.abs(curr - right) > 18 || Math.abs(curr - bottom) > 18) {
              edgeCount++;
            }
          }
        }
        const edgeDensity = edgeCount / ((width / 2) * (height / 2));
        const dominantColorRatio = maxBucketCount / totalPixels;

        // Strict blank image criteria
        const isSolidWhite = avgLuma > 248 && variance < 30;
        const isSolidBlack = avgLuma < 8 && variance < 30;
        const isUniformColor = dominantColorRatio > 0.985 && edgeDensity < 0.005;
        const isExtremelyLowContrast = variance < 20 && edgeDensity < 0.005;

        if (isSolidWhite) {
          return resolve({
            isValid: false,
            chartLikelihoodScore: 0,
            isUniformOrBlank: true,
            averageBrightness: avgLuma,
            variance,
            edgeDensity,
            dominantColorRatio,
            rejectionReason: "Unable to analyze this image. The image is completely white / blank. No chart or price action detected."
          });
        }

        if (isSolidBlack) {
          return resolve({
            isValid: false,
            chartLikelihoodScore: 0,
            isUniformOrBlank: true,
            averageBrightness: avgLuma,
            variance,
            edgeDensity,
            dominantColorRatio,
            rejectionReason: "Unable to analyze this image. The image is completely black / blank. No chart or price action detected."
          });
        }

        if (isUniformColor || isExtremelyLowContrast) {
          return resolve({
            isValid: false,
            chartLikelihoodScore: 10,
            isUniformOrBlank: true,
            averageBrightness: avgLuma,
            variance,
            edgeDensity,
            dominantColorRatio,
            rejectionReason: "Unable to analyze this image. The image is a solid/uniform color with no discernible trading candles or price scale."
          });
        }

        const chartLikelihoodScore = Math.min(100, Math.round((variance > 50 ? 40 : 10) + (edgeDensity * 400)));

        return resolve({
          isValid: true,
          chartLikelihoodScore,
          isUniformOrBlank: false,
          averageBrightness: avgLuma,
          variance,
          edgeDensity,
          dominantColorRatio
        });
      } catch {
        return resolve({
          isValid: true,
          chartLikelihoodScore: 50,
          isUniformOrBlank: false,
          averageBrightness: 128,
          variance: 500,
          edgeDensity: 0.1,
          dominantColorRatio: 0.5
        });
      }
    };

    if (typeof HTMLImageElement !== 'undefined' && input instanceof HTMLImageElement) {
      if (input.complete && input.naturalWidth > 0) {
        processElement(input);
      } else {
        input.onload = () => processElement(input);
        input.onerror = () => resolve({
          isValid: false,
          chartLikelihoodScore: 0,
          isUniformOrBlank: true,
          averageBrightness: 0,
          variance: 0,
          edgeDensity: 0,
          dominantColorRatio: 1,
          rejectionReason: "Unable to load the image element for validation."
        });
      }
    } else if (typeof Blob !== 'undefined' && input instanceof Blob) {
      const img = new Image();
      const objUrl = URL.createObjectURL(input);
      img.onload = () => {
        URL.revokeObjectURL(objUrl);
        processElement(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objUrl);
        resolve({
          isValid: false,
          chartLikelihoodScore: 0,
          isUniformOrBlank: true,
          averageBrightness: 0,
          variance: 0,
          edgeDensity: 0,
          dominantColorRatio: 1,
          rejectionReason: "Unable to decode the uploaded image file."
        });
      };
      img.src = objUrl;
    } else {
      resolve({
        isValid: true,
        chartLikelihoodScore: 50,
        isUniformOrBlank: false,
        averageBrightness: 128,
        variance: 500,
        edgeDensity: 0.1,
        dominantColorRatio: 0.5
      });
    }
  });
}

