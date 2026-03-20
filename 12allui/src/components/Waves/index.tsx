import React, {useEffect, useRef, useState} from 'react';
import './styles.scss';

const RED = 102;
const GREEN = 44;
const BLUE = 75;

class Wave {
  color: string = `rgba(${RED}, ${GREEN}, ${BLUE}, .15)`;
  nodes: number[][] = [];

  constructor(nodes: number, cvsWidth: number) {
    const length = nodes * 2;
    for (let i = 0; i < length; i++) {
      this.nodes.push([
        (i - 1) * cvsWidth / nodes,
        0,
        Math.random() * 200,
        .3
      ]);
    }
  }
}

const Waves: React.FC = () => {
  const topWaveRef = useRef<HTMLCanvasElement>(null);
  const bottomWaveRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!topWaveRef.current || !bottomWaveRef.current) {
      return;
    }

    const topCanvas = topWaveRef.current;
    const topContext = topCanvas.getContext('2d') as CanvasRenderingContext2D;

    const bottomCanvas = bottomWaveRef.current;
    const bottomContext = bottomCanvas.getContext('2d') as CanvasRenderingContext2D;

    const waves: Wave[] = [];
    const waveHeight = 32;
    const nodes = 3;
    let waveWidth = 1920;

    if (window.innerWidth > 1920) {
      waveWidth = window.innerWidth;
    }

    topCanvas.width = bottomCanvas.width = waveWidth;
    topCanvas.height = bottomCanvas.height = waveHeight;

    for (let i = 0; i < nodes; i++) {
      waves.push(new Wave(nodes, waveWidth));
    }

    const bounce = (nodeArr: number[]) => {
      nodeArr[1] = waveHeight / 2 * Math.sin(nodeArr[2] / 20) + waveHeight / 2;
      nodeArr[2] = nodeArr[2] + nodeArr[3];
    };

    const drawWave = (wave: Wave, context: CanvasRenderingContext2D) => {
      const diff = (a: number, b: number) => (b - a) / 2 + a;

      context.fillStyle = wave.color;
      context.beginPath();
      context.moveTo(0, waveHeight);
      context.lineTo(wave.nodes[0][0], wave.nodes[0][1]);

      for (let i = 0; i < wave.nodes.length; i++) {
        if (wave.nodes[i + 1]) {
          context.quadraticCurveTo(
            wave.nodes[i][0],
            wave.nodes[i][1],
            diff(wave.nodes[i][0], wave.nodes[i + 1][0]),
            diff(wave.nodes[i][1], wave.nodes[i + 1][1])
          );
        } else {
          context.lineTo(wave.nodes[i][0], wave.nodes[i][1]);
          context.lineTo(waveWidth, waveHeight);
        }
      }
      context.closePath();
      context.fill();
    };

    const animate = () => {
      topContext.fillStyle = '#000';
      topContext.globalCompositeOperation = 'source-over';
      topContext.fillRect(0, 0, waveWidth, waveHeight);
      topContext.globalCompositeOperation = 'screen';

      bottomContext.fillStyle = '#000';
      bottomContext.globalCompositeOperation = 'source-over';
      bottomContext.fillRect(0, 0, waveWidth, waveHeight);
      bottomContext.globalCompositeOperation = 'screen';

      for (let i = 0; i < waves.length; i++) {
        for (let j = 0; j < waves[i].nodes.length; j++) {
          bounce(waves[i].nodes[j]);
        }
        drawWave(waves[i], topContext);
        drawWave(waves[i], bottomContext);
      }
    };

    animate();
    setInterval(() => requestAnimationFrame(animate), 1000 / 5);
  }, []);

  const pathName = window?.location?.pathname?.split('/');
  const [isTvStreamPage, setIsTvStreamPage] = useState(false);
  useEffect(() => {
    if (pathName.length > 1 && pathName[1] === 'tvStream') {
      setIsTvStreamPage(true);
    }
  }, [pathName]);

  return !isTvStreamPage ? (
    <>
      <div className="canvas-wrap top">
        <canvas ref={topWaveRef}/>
      </div>

      <div className="canvas-wrap bottom">
        <canvas ref={bottomWaveRef}/>
      </div>
    </>
  ) : null;
};

export default Waves;
