import { WhamoNode, WhamoEdge } from './store';

export function generateSystemDiagram(nodes: WhamoNode[], edges: WhamoEdge[]) {
  const svgWidth = 1300;
  const svgHeight = 750;

  // Helper to find node by React Flow ID
  const findNode = (id: string) => nodes.find(n => n.id === id);

  // Markers and SVG header
  let svgContent = `
    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="#3498db" />
        </marker>
      </defs>
  `;

  // Draw Edges (Pipes)
  edges.forEach(edge => {
    const sourceNode = findNode(edge.source);
    const targetNode = findNode(edge.target);
    if (!sourceNode || !targetNode) return;

    const x1 = sourceNode.position.x;
    const y1 = sourceNode.position.y;
    const x2 = targetNode.position.x;
    const y2 = targetNode.position.y;

    const isDummy = edge.data?.type === 'dummy';
    const className = isDummy ? 'stroke="#95a5a6" stroke-width="2" stroke-dasharray="5,5"' : 'stroke="#3498db" stroke-width="3"';
    const marker = isDummy ? '' : 'marker-end="url(#arrowhead)"';

    svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${className} ${marker} fill="none" />`;
    
    // Label
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2 - 10;
    svgContent += `<text x="${midX}" y="${midY}" font-size="10" fill="#2c3e50" font-weight="bold" text-anchor="middle">${edge.data?.label || ''}</text>`;
  });

  // Draw Nodes
  nodes.forEach(node => {
    const { x, y } = node.position;
    const label = node.data.label || '';
    const nodeNum = node.data.nodeNumber;
    const elev = node.data.elevation !== undefined ? node.data.elevation : '';

    if (node.type === 'reservoir') {
      svgContent += `
        <g>
          <rect x="${x - 25}" y="${y - 20}" width="50" height="40" fill="#3498db" stroke="#2980b9" stroke-width="2" />
          <text x="${x}" y="${y + 5}" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${label}</text>
          <text x="${x}" y="${y - 30}" text-anchor="middle" fill="#2c3e50" font-size="11">Node ${nodeNum || node.id}</text>
          <text x="${x}" y="${y + 35}" text-anchor="middle" fill="#2c3e50" font-size="9">Elev: ${elev}</text>
        </g>
      `;
    } else if (node.type === 'surgeTank') {
      svgContent += `
        <g>
          <rect x="${x - 20}" y="${y - 40}" width="40" height="80" fill="#f39c12" stroke="#e67e22" stroke-width="2" />
          <text x="${x}" y="${y + 5}" text-anchor="middle" fill="white" font-size="11" font-weight="bold">ST</text>
          <text x="${x}" y="${y + 50}" text-anchor="middle" fill="#2c3e50" font-size="9">Node ${nodeNum || node.id}</text>
        </g>
      `;
    } else if (node.type === 'flowBoundary') {
      svgContent += `
        <g>
          <polygon points="${x},${y - 10} ${x + 20},${y} ${x},${y + 10}" fill="#2ecc71" stroke="#27ae60" stroke-width="2" />
          <text x="${x + 25}" y="${y + 5}" text-anchor="start" fill="#2c3e50" font-size="11" font-weight="bold">${label}</text>
          <text x="${x + 25}" y="${y + 18}" text-anchor="start" fill="#2c3e50" font-size="9">Node ${nodeNum || node.id}</text>
        </g>
      `;
    } else if (node.type === 'junction') {
      svgContent += `
        <g>
          <circle cx="${x}" cy="${y}" r="6" fill="#e74c3c" stroke="#c0392b" stroke-width="2" />
          <text x="${x}" y="${y + 30}" text-anchor="middle" fill="#2c3e50" font-size="11">Node ${nodeNum || node.id}</text>
          <text x="${x}" y="${y + 45}" text-anchor="middle" fill="#2c3e50" font-size="9">Junction</text>
          <text x="${x}" y="${y + 60}" text-anchor="middle" fill="#2c3e50" font-size="9">Elev: ${elev}</text>
        </g>
      `;
    } else {
      svgContent += `
        <g>
          <circle cx="${x}" cy="${y}" r="5" fill="#95a5a6" stroke="#7f8c8d" stroke-width="2" />
          <text x="${x}" y="${y - 25}" text-anchor="middle" fill="#2c3e50" font-size="10">Node ${nodeNum || node.id}</text>
          <text x="${x}" y="${y - 12}" text-anchor="middle" fill="#2c3e50" font-size="9">Elev: ${elev}</text>
        </g>
      `;
    }
  });

  svgContent += `</svg>`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WHAMO System Diagram</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; margin-bottom: 30px; }
        .diagram-container { position: relative; width: 100%; height: 800px; background: #fafafa; border: 2px solid #ddd; border-radius: 8px; overflow: auto; }
        svg { width: 100%; height: 100%; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌊 WHAMO Water Distribution System Diagram</h1>
        <div class="diagram-container">
            ${svgContent}
        </div>
    </div>
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  return blob;
}
