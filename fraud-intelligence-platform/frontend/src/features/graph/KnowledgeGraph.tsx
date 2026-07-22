import React, { useState, useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import ForceGraph3D from 'react-force-graph-3d';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../lib/api';
import { Search, Activity } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import './KnowledgeGraph.css';

export const KnowledgeGraph: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '9876543210';
  const [phone, setPhone] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [nodeData, setNodeData] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [hoverNode, setHoverNode] = useState<any>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 700 });
  
  const [graphData, setGraphData] = useState<{ nodes: any[], links: any[] }>({ nodes: [], links: [] });
  const fgRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle automatic window resizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: 700
        });
      }
    };
    
    // Initial size
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchGraph = async () => {
    if (!phone) return;
    setLoading(true);
    setNodeData(null);
    setSummary(null);
    setHoverNode(null);
    try {
      const data = await api.getNetwork(phone);
      
      const complaints = (data.nodes || []).filter((n: any) => n.label === 'Complaint');
      const totalLoss = complaints.reduce((sum: number, c: any) => sum + (c.properties?.amount || 0), 0);
      const sharedPhone = (data.nodes || []).find((n: any) => n.label === 'Phone')?.properties?.number || 'N/A';
      const sharedUpi = (data.nodes || []).find((n: any) => n.label === 'UPI')?.id || 'None';
      const sharedWebsite = (data.nodes || []).find((n: any) => n.label === 'Website')?.properties?.url || 'None';
      
      setSummary({
        complaintsFound: complaints.length,
        totalLoss,
        sharedPhone,
        sharedUpi,
        sharedWebsite,
        riskScore: complaints.length > 1 ? 'HIGH 🔴' : 'MEDIUM 🟡'
      });

      // Format data for ForceGraph3D
      const edgeCounts: Record<string, number> = {};
      (data.edges || []).forEach((e: any) => {
        edgeCounts[e.source_id] = (edgeCounts[e.source_id] || 0) + 1;
        edgeCounts[e.target_id] = (edgeCounts[e.target_id] || 0) + 1;
      });

      const formattedNodes = (data.nodes || []).map((n: any) => {
        const type = n.label?.toLowerCase() || 'unknown';
        const degree = edgeCounts[n.id] || 0;
        let baseSize = 4;
        let color = '#9ca3af';
        
        if (type === 'phone' || type === 'complaint') baseSize = 8;
        else if (type === 'website' || type === 'bank') baseSize = 6;
        else if (type === 'status') baseSize = 3;

        if (type === 'complaint') color = '#ef4444';
        if (type === 'phone') color = '#3b82f6';
        if (type === 'upi') color = '#22c55e';
        if (type === 'bank') color = '#eab308';
        if (type === 'website') color = '#a855f7';
        if (type === 'scamtype') color = '#f97316';
        if (type === 'officer') color = '#171717';
        if (type === 'status') color = '#14b8a6';
        if (type === 'district') color = '#a16207';

        return {
          id: n.id,
          name: n.properties?.name || n.properties?.number || n.properties?.url || n.id,
          type: type,
          val: baseSize + (degree * 0.5),
          color: color,
          properties: n.properties || {}
        };
      });

      const formattedLinks = (data.edges || []).map((e: any) => ({
        source: e.source_id,
        target: e.target_id,
        name: e.relationship_type
      }));

      setGraphData({ nodes: formattedNodes, links: formattedLinks });

    } catch (e) {
      console.error(e);
      alert('Failed to load graph data. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleNodeHover = (node: any) => {
    if (node) {
      setHoverNode(node);
      // We will place the tooltip at a fixed position or track mouse if we had global mouse event,
      // but force-graph gives us the node obj. We can just show it on the top right.
      setHoverPos({ x: 20, y: 80 }); 
    } else {
      setHoverNode(null);
    }
  };

  const handleNodeClick = (node: any) => {
    // Find connected nodes manually for the sidebar
    const connectedLinks = graphData.links.filter(l => l.source.id === node.id || l.target.id === node.id);
    const connectedEntities = connectedLinks.map(l => {
      const otherNode = l.source.id === node.id ? l.target : l.source;
      return { id: otherNode.id, type: otherNode.type, label: otherNode.name, amount: otherNode.properties?.amount };
    });

    setNodeData({
      id: node.id,
      type: node.type,
      amount: node.properties?.amount,
      ...node.properties,
      connectedEntities
    });
    
    // Zoom in on the clicked node
    if (fgRef.current) {
      const distance = 100;
      const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
      fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
        node, // lookAt ({ x, y, z })
        2000  // ms transition duration
      );
    }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q !== phone) {
      setPhone(q);
    } else if (phone) {
      fetchGraph();
    }
  }, [searchParams, phone]);

  return (
    <div className="knowledge-graph fade-in">
      <div className="kg-header flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Knowledge Graph</h1>
        <div className="flex gap-2">
          <input 
            type="text" 
            className="kg-search-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Search Phone, UPI..."
          />
          <Button onClick={fetchGraph} disabled={loading} icon={<Search />}>Analyze</Button>
        </div>
      </div>
      
      {summary && (
        <Card style={{ marginBottom: '16px', background: '#FAFAFA' }}>
          <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Network Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '24px', fontSize: '14px' }}>
            <div><span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Complaints</span><strong style={{ fontSize: '20px' }}>{summary.complaintsFound}</strong></div>
            <div><span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Total Loss</span><strong style={{ fontSize: '20px', color: 'var(--critical)' }}>₹{summary.totalLoss.toLocaleString()}</strong></div>
            <div><span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Shared Phone</span><strong style={{ fontFamily: 'monospace' }}>{summary.sharedPhone}</strong></div>
            <div><span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Shared UPI</span><strong style={{ fontFamily: 'monospace' }}>{summary.sharedUpi}</strong></div>
            <div><span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Shared Website</span><strong style={{ wordBreak: 'break-all' }}>{summary.sharedWebsite}</strong></div>
            <div><span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Risk Score</span><strong style={{ fontSize: '18px' }}>{summary.riskScore}</strong></div>
          </div>
        </Card>
      )}

      <div className="kg-layout">
        <Card className="graph-container-card" noPadding>
          {loading && (
            <div className="graph-loading">
              <Activity style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', marginBottom: '8px', color: '#3b82f6' }} size={40}/>
              <span style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '16px' }}>Building Fraud Network...</span>
            </div>
          )}
          <div ref={containerRef} style={{ width: '100%', height: '700px', position: 'relative', overflow: 'hidden', backgroundColor: '#000000', borderRadius: '8px' }}>
            {graphData.nodes.length > 0 && (
              <ForceGraph3D
                ref={fgRef}
                graphData={graphData}
                nodeLabel="name"
                nodeColor="color"
                nodeVal="val"
                linkColor={() => '#ffffff'}
                linkWidth={2}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.005}
                linkDirectionalArrowLength={3.5}
                linkDirectionalArrowRelPos={1}
                backgroundColor="#000000"
                onNodeHover={handleNodeHover}
                onNodeClick={handleNodeClick}
                width={dimensions.width}
                height={dimensions.height}
              />
            )}
          </div>
          
          {hoverNode && (
            <div style={{
              position: 'absolute',
              left: hoverPos.x + 20,
              top: hoverPos.y - 20,
              background: '#111827',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              zIndex: 100,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
              pointerEvents: 'none',
              maxWidth: '300px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #374151', paddingBottom: '4px' }}>
                {hoverNode.type.toUpperCase()}
              </div>
              <div style={{ fontSize: '13px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: hoverNode.color }}>{hoverNode.name}</div>
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {Object.entries(hoverNode.properties || {}).map(([k, v]) => (
                    <div key={k}><strong>{k}:</strong> {String(v)}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="graph-legend">
            <div style={{ fontWeight: 'bold', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>Legend</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
              <div className="legend-item"><div className="legend-dot" style={{ backgroundColor: '#ef4444' }}></div> Complaint</div>
              <div className="legend-item"><div className="legend-dot" style={{ backgroundColor: '#3b82f6' }}></div> Phone</div>
              <div className="legend-item"><div className="legend-dot" style={{ backgroundColor: '#eab308' }}></div> Bank</div>
              <div className="legend-item"><div className="legend-dot" style={{ backgroundColor: '#a855f7' }}></div> Website</div>
              <div className="legend-item"><div className="legend-dot" style={{ backgroundColor: '#22c55e' }}></div> UPI</div>
              <div className="legend-item"><div className="legend-dot" style={{ backgroundColor: '#f97316' }}></div> Scam Type</div>
              <div className="legend-item"><div className="legend-dot" style={{ backgroundColor: '#171717' }}></div> Officer</div>
              <div className="legend-item"><div className="legend-dot" style={{ backgroundColor: '#14b8a6' }}></div> Status</div>
              <div className="legend-item"><div className="legend-dot" style={{ backgroundColor: '#a16207' }}></div> District</div>
            </div>
          </div>
        </Card>

        {nodeData && (
          <Card title="Entity Details" className="node-inspector">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '650px' }}>
              <div className="inspector-field">
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold' }}>Entity ID</span>
                <div style={{ fontFamily: 'monospace', wordBreak: 'break-all', marginTop: '4px' }}>{nodeData.id}</div>
              </div>
              
              <div className="inspector-field">
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold' }}>Type</span>
                <div style={{ marginTop: '8px' }}>
                  <Badge variant={nodeData.type === 'phone' ? 'accent' : 'critical'}>
                    {nodeData.type.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {nodeData.type === 'complaint' && (
                <div className="inspector-field">
                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold' }}>Amount</span>
                  <div style={{ fontWeight: 'bold', color: 'var(--critical)', fontSize: '18px', marginTop: '4px' }}>₹{(nodeData.amount || 0).toLocaleString()}</div>
                </div>
              )}
              
              {Object.entries(nodeData).map(([key, val]) => {
                if (['id', 'label', 'type', 'amount', 'hash', 'size', 'connectedEntities'].includes(key)) return null;
                return (
                  <div className="inspector-field" key={key}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold' }}>{key}</span>
                    <div style={{ wordBreak: 'break-all', marginTop: '4px' }}>{String(val)}</div>
                  </div>
                );
              })}
              
              {nodeData.type === 'phone' && (
                <div style={{ marginTop: '8px', padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--critical)', marginBottom: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
                    HIGH RISK ENTITY
                  </div>
                  <div style={{ fontSize: '13px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Linked Complaints:</strong> 
                    <span>{nodeData.connectedEntities?.filter((e:any) => e.type === 'complaint').length || 0}</span>
                  </div>
                  <div style={{ fontSize: '13px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Total Loss Linked:</strong> 
                    <span style={{ color: 'var(--critical)', fontWeight: 'bold' }}>₹{
                      nodeData.connectedEntities?.filter((e:any) => e.type === 'complaint')
                      .reduce((sum:number, c:any) => sum + (c.amount || 0), 0).toLocaleString() || 0
                    }</span>
                  </div>
                  <Button variant="danger" style={{ width: '100%' }}>Flag for Blocking</Button>
                </div>
              )}

              {nodeData.connectedEntities && nodeData.connectedEntities.length > 0 && (
                <div className="inspector-field" style={{ marginTop: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold' }}>Connected Entities</span>
                  <ul style={{ margin: '8px 0 0 16px', padding: 0, fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {nodeData.connectedEntities.map((ent: any) => (
                      <li key={ent.id}>
                        <strong style={{ color: 'var(--text-primary)' }}>{ent.type.toUpperCase()}:</strong> <span style={{ color: 'var(--text-secondary)' }}>{ent.label.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim() || ent.id}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
