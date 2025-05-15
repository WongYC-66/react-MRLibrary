import { useEffect, useState } from 'react';

const colorSequence = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#800000', '#008000',
  '#000080', '#808000', '#800080', '#008080',
  '#C0C0C0', '#FFA500', '#A52A2A', '#DEB887',
  '#5F9EA0', '#7FFF00', '#D2691E', '#FF7F50',
  '#6495ED', '#DC143C', '#00FFFF', '#00008B',
  '#008B8B', '#B8860B', '#A9A9A9', '#006400',
  '#BDB76B', '#8B008B', '#556B2F', '#FF8C00',
  '#9932CC', '#8B0000', '#E9967A', '#8FBC8F',
  '#483D8B', '#2F4F4F', '#00CED1', '#9400D3',
  '#FF1493', '#00BFFF', '#696969', '#1E90FF',
  '#B22222', '#FFFAF0', '#228B22', '#DCDCDC',
  '#F8F8FF', '#FFD700', '#DAA520', '#808080',
  '#ADFF2F', '#F0FFF0', '#FF69B4', '#CD5C5C',
  '#4B0082', '#FFFFF0', '#F0E68C', '#E6E6FA',
  '#FFF0F5', '#7CFC00', '#FFFACD', '#ADD8E6'
];

export default function LabelledMap({ mapId, portals, miniMap }) {
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    const image = new Image();
    const imageUrl = `/images/maps/${mapId}.png`;
    image.crossOrigin = "anonymous";
    image.src = imageUrl;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Use the full logical size from miniMap
      const canvasWidth = Number(miniMap.width);
      const canvasHeight = Number(miniMap.height);

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Draw the image stretched to full logical size
      ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);

      // No need to scale, use native coordinates
      const centerX = Number(miniMap.centerX);
      const centerY = Number(miniMap.centerY);

      portals.forEach((p, i) => {
        const x = Math.floor(Number(p.x) + centerX);
        const y = Math.floor(Number(p.y) + centerY);

        // Draw portal dot
        ctx.fillStyle = colorSequence[i % colorSequence.length];
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw label text
        const labelX = x + 28;
        const labelY = y - 28;
        ctx.font = '48px Arial';

        ctx.lineWidth = 12;
        ctx.strokeStyle = 'black';
        ctx.strokeText(p.pn, labelX, labelY);

        ctx.fillStyle = 'white';
        ctx.fillText(p.pn, labelX, labelY);
      });

      // Save canvas to PNG
      setImageData(canvas.toDataURL('image/png'));
    };
  }, [mapId, portals, miniMap]);

  return (
    <div>
      {imageData ? (
        <img
          src={imageData}
          alt={`Map ${mapId}`}
          style={{ width: '100%', height: 'auto', imageRendering: 'auto' }}
        />
      ) : (
        <p>Loading map...</p>
      )}
    </div>
  );
}
