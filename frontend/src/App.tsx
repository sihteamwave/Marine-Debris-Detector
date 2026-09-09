import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Activity,
  Cpu,
  FileText,
  Check,
  X,
  HelpCircle,
  MoreVertical,
  Sliders,
  Download,
  CheckCircle2,
  Navigation,
  Database,
  Scan,
  Layers,
  Sparkles,
  Upload,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  ChevronDown,
  Clock
} from 'lucide-react';
import { GisMiniMap } from './components/GisMiniMap';
import { DatasetModal } from './components/DatasetModal';

export interface DetectionTarget {
  id: string;
  class: string;
  confidence: number;
  shadowStrength: number;
  segmentationQuality: number;
  seabedSimilarity: string;
  dimensions: { width: string; height: string };
  reliability: string;
  status: 'Pending' | 'Confirmed' | 'Rejected' | 'Unknown';
  position: { lat: string; lon: string };
  heading: string;
  depth: string;
  speed: string;
  shadowNote: string;
  segmentation_mask?: [number, number][];
  segmentation_mask_pct?: [number, number][];
  obb: {
    cx: number;
    cy: number;
    width: number;
    height: number;
    angle_deg: number;
    polygon: [number, number][];
    cx_pct: number;
    cy_pct: number;
    w_pct: number;
    h_pct: number;
    left_pct: number;
    top_pct: number;
    polygon_pct: [number, number][];
  };
}

interface ScenarioData {
  id: string;
  name: string;
  class: string;
  confidence: number;
  shadowStrength: number;
  segmentationQuality: number;
  seabedSimilarity: string;
  dimensions: { width: string; height: string };
  reliability: string;
  status: 'Pending' | 'Confirmed' | 'Rejected' | 'Unknown';
  position: { lat: string; lon: string };
  heading: string;
  depth: string;
  speed: string;
  image: string;
  shadowNote: string;
  annotatedImage?: string;
  resolution?: { width: number; height: number; aspectRatio: number };
  segmentation_mask?: [number, number][];
  segmentation_mask_pct?: [number, number][];
  obb?: {
    cx: number;
    cy: number;
    width: number;
    height: number;
    angle_deg: number;
    polygon: [number, number][];
    cx_pct?: number;
    cy_pct?: number;
    w_pct?: number;
    h_pct?: number;
    left_pct?: number;
    top_pct?: number;
    polygon_pct?: [number, number][];
  };
  detections?: DetectionTarget[];
  isLiveInference?: boolean;
}

const SCENARIOS: ScenarioData[] = [
  {
    id: 'SSS-004',
    name: 'Cargo Container / Tyre / Plane Sector',
    class: 'Container (Intermodal Freight Unit)',
    confidence: 94,
    shadowStrength: 88,
    segmentationQuality: 93,
    seabedSimilarity: 'Low',
    dimensions: { width: '2.4 m', height: '6.1 m' },
    reliability: 'High',
    status: 'Pending',
    position: { lat: '7.8220° N', lon: '77.4847° E' },
    heading: '275° (W)',
    depth: '112 m',
    speed: '3.2 knots',
    image: 'clear_debris_blue.jpg',
    shadowNote: 'Strong',
    resolution: { width: 1376, height: 768, aspectRatio: 1.79 },
    obb: {
      cx: 818.7,
      cy: 422.4,
      width: 96.3,
      height: 245.8,
      cx_pct: 59.5,
      cy_pct: 55.0,
      w_pct: 7.0,
      h_pct: 32.0,
      left_pct: 56.0,
      top_pct: 39.0,
      angle_deg: 79.2,
      polygon: [
        [689.0, 398.1],
        [930.4, 352.1],
        [948.4, 446.7],
        [707.0, 492.7]
      ],
      polygon_pct: [
        [53.06, 39.94],
        [59.94, 38.63],
        [65.94, 70.06],
        [59.06, 71.37]
      ]
    },
    detections: [
      {
        id: 'SSS-004-T1',
        class: 'Container (Intermodal Freight Unit)',
        confidence: 94,
        shadowStrength: 88,
        segmentationQuality: 93,
        seabedSimilarity: 'Low',
        dimensions: { width: '2.4 m', height: '6.1 m' },
        reliability: 'High',
        status: 'Pending',
        position: { lat: '7.8220° N', lon: '77.4847° E' },
        heading: '275° (W)',
        depth: '112 m',
        speed: '3.2 knots',
        shadowNote: 'Sharp rectangular corner reflection & block shadow (88%)',
        segmentation_mask_pct: [
          [53.06, 39.94],
          [59.94, 38.63],
          [65.94, 70.06],
          [59.06, 71.37]
        ],
        obb: {
          cx: 818.7,
          cy: 422.4,
          width: 96.3,
          height: 245.8,
          cx_pct: 59.5,
          cy_pct: 55.0,
          w_pct: 7.0,
          h_pct: 32.0,
          left_pct: 56.0,
          top_pct: 39.0,
          angle_deg: 79.2,
          polygon: [
            [689.0, 398.1],
            [930.4, 352.1],
            [948.4, 446.7],
            [707.0, 492.7]
          ],
          polygon_pct: [
            [53.06, 39.94],
            [59.94, 38.63],
            [65.94, 70.06],
            [59.06, 71.37]
          ]
        }
      },
      {
        id: 'SSS-004-T2',
        class: 'Tyre (Submerged Automotive Debris)',
        confidence: 84,
        shadowStrength: 74,
        segmentationQuality: 82,
        seabedSimilarity: 'Low',
        dimensions: { width: '1.2 m', height: '1.2 m' },
        reliability: 'High',
        status: 'Pending',
        position: { lat: '7.8214° N', lon: '77.4835° E' },
        heading: '165° (S)',
        depth: '115 m',
        speed: '3.2 knots',
        shadowNote: 'Toroidal acoustic highlight with hollow central shadow (74%)',
        segmentation_mask_pct: [
          [32.5, 72.0],
          [34.8, 67.2],
          [42.0, 67.2],
          [46.5, 72.0],
          [45.5, 78.2],
          [40.0, 80.0],
          [34.0, 78.2]
        ],
        obb: {
          cx: 543.5,
          cy: 558.3,
          width: 192.6,
          height: 84.5,
          cx_pct: 39.5,
          cy_pct: 72.7,
          w_pct: 14.0,
          h_pct: 11.0,
          left_pct: 32.5,
          top_pct: 67.2,
          angle_deg: 165.4,
          polygon: [
            [447.2, 600.5],
            [639.8, 600.5],
            [639.8, 516.0],
            [447.2, 516.0]
          ],
          polygon_pct: [
            [32.5, 78.2],
            [46.5, 78.2],
            [46.5, 67.2],
            [32.5, 67.2]
          ]
        }
      },
      {
        id: 'SSS-004-T3',
        class: 'Plane (Downed Aircraft Fuselage Section)',
        confidence: 76,
        shadowStrength: 68,
        segmentationQuality: 74,
        seabedSimilarity: 'Moderate',
        dimensions: { width: '3.6 m', height: '11.2 m' },
        reliability: 'Moderate',
        status: 'Pending',
        position: { lat: '7.8228° N', lon: '77.4860° E' },
        heading: '28° (NNE)',
        depth: '110 m',
        speed: '3.2 knots',
        shadowNote: 'Aluminum aerodynamic return with tapered wing shadow (68%)',
        segmentation_mask_pct: [
          [38.5, 9.5],
          [41.0, 7.8],
          [43.5, 9.5],
          [44.0, 16.0],
          [43.5, 27.5],
          [41.0, 29.2],
          [38.5, 27.5],
          [37.8, 16.0]
        ],
        obb: {
          cx: 564.2,
          cy: 142.1,
          width: 68.8,
          height: 138.2,
          cx_pct: 41.0,
          cy_pct: 18.5,
          w_pct: 5.0,
          h_pct: 18.0,
          left_pct: 38.5,
          top_pct: 9.5,
          angle_deg: 28.0,
          polygon: [
            [529.8, 73.0],
            [598.6, 73.0],
            [598.6, 211.2],
            [529.8, 211.2]
          ],
          polygon_pct: [
            [38.5, 9.5],
            [43.5, 9.5],
            [43.5, 27.5],
            [38.5, 27.5]
          ]
        }
      }
    ]
  },
  {
    id: 'SSS-005',
    name: 'Sunken Shipwreck / Tyre Survey Zone',
    class: 'Shipwreck (Sunken Vessel Hull Keel)',
    confidence: 71,
    shadowStrength: 42,
    segmentationQuality: 65,
    seabedSimilarity: 'Moderate',
    dimensions: { width: '5.4 m', height: '18.2 m' },
    reliability: 'Weak',
    status: 'Pending',
    position: { lat: '7.8185° N', lon: '77.4791° E' },
    heading: '272° (W)',
    depth: '118 m',
    speed: '3.1 knots',
    image: 'weak_candidate_blue.jpg',
    shadowNote: 'Weak',
    resolution: { width: 1376, height: 768, aspectRatio: 1.79 },
    obb: {
      cx: 798.0,
      cy: 407.0,
      width: 110.0,
      height: 169.0,
      cx_pct: 58.0,
      cy_pct: 53.0,
      w_pct: 8.0,
      h_pct: 22.0,
      left_pct: 54.0,
      top_pct: 42.0,
      angle_deg: 14.5,
      polygon: [
        [782.0, 317.0],
        [889.0, 333.0],
        [814.0, 496.0],
        [707.0, 481.0]
      ],
      polygon_pct: [
        [56.88, 41.35],
        [64.63, 43.35],
        [59.12, 64.65],
        [51.37, 62.65]
      ]
    },
    detections: [
      {
        id: 'SSS-005-T1',
        class: 'Shipwreck (Sunken Vessel Hull Keel)',
        confidence: 71,
        shadowStrength: 42,
        segmentationQuality: 65,
        seabedSimilarity: 'Moderate',
        dimensions: { width: '5.4 m', height: '18.2 m' },
        reliability: 'Weak',
        status: 'Pending',
        position: { lat: '7.8185° N', lon: '77.4791° E' },
        heading: '272° (W)',
        depth: '118 m',
        speed: '3.1 knots',
        shadowNote: 'Elongated vessel hull ribbing with lateral shadow (42%)',
        segmentation_mask_pct: [
          [56.88, 41.35],
          [62.5, 39.8],
          [64.63, 43.35],
          [63.2, 54.0],
          [59.12, 64.65],
          [54.0, 65.2],
          [51.37, 62.65],
          [53.2, 49.5]
        ],
        obb: {
          cx: 798.0,
          cy: 407.0,
          width: 110.0,
          height: 169.0,
          cx_pct: 58.0,
          cy_pct: 53.0,
          w_pct: 8.0,
          h_pct: 22.0,
          left_pct: 54.0,
          top_pct: 42.0,
          angle_deg: 14.5,
          polygon: [
            [782.0, 317.0],
            [889.0, 333.0],
            [814.0, 496.0],
            [707.0, 481.0]
          ],
          polygon_pct: [
            [56.88, 41.35],
            [64.63, 43.35],
            [59.12, 64.65],
            [51.37, 62.65]
          ]
        }
      },
      {
        id: 'SSS-005-T2',
        class: 'Tyre (Industrial Equipment Tyre)',
        confidence: 63,
        shadowStrength: 38,
        segmentationQuality: 60,
        seabedSimilarity: 'High',
        dimensions: { width: '1.8 m', height: '1.8 m' },
        reliability: 'Weak',
        status: 'Pending',
        position: { lat: '7.8179° N', lon: '77.4778° E' },
        heading: '48° (NE)',
        depth: '120 m',
        speed: '3.1 knots',
        shadowNote: 'Circular acoustic contour with shadow deficit (38%)',
        segmentation_mask_pct: [
          [40.0, 52.0],
          [42.2, 48.9],
          [45.8, 49.5],
          [46.5, 54.0],
          [45.8, 64.2],
          [43.0, 66.9],
          [40.0, 65.0]
        ],
        obb: {
          cx: 594.4,
          cy: 444.7,
          width: 89.4,
          height: 138.2,
          cx_pct: 43.2,
          cy_pct: 57.9,
          w_pct: 6.5,
          h_pct: 18.0,
          left_pct: 40.0,
          top_pct: 48.9,
          angle_deg: 48.0,
          polygon: [
            [550.4, 375.6],
            [639.8, 375.6],
            [639.8, 513.8],
            [550.4, 513.8]
          ],
          polygon_pct: [
            [40.0, 48.9],
            [46.5, 48.9],
            [46.5, 66.9],
            [40.0, 66.9]
          ]
        }
      }
    ]
  },
  {
    id: 'SSS-006',
    name: 'Submerged Building / Container Complex',
    class: 'Building (Submerged Concrete Foundation / Ruin)',
    confidence: 63,
    shadowStrength: 51,
    segmentationQuality: 58,
    seabedSimilarity: 'High',
    dimensions: { width: '14.2 m', height: '18.6 m' },
    reliability: 'Ambiguous',
    status: 'Pending',
    position: { lat: '7.8230° N', lon: '77.4870° E' },
    heading: '278° (W)',
    depth: '110 m',
    speed: '3.3 knots',
    image: 'unknown_anomaly_blue.jpg',
    shadowNote: 'Ambiguous',
    resolution: { width: 1376, height: 768, aspectRatio: 1.79 },
    obb: {
      cx: 839.0,
      cy: 391.0,
      width: 302.0,
      height: 353.0,
      cx_pct: 61.0,
      cy_pct: 51.0,
      w_pct: 22.0,
      h_pct: 46.0,
      left_pct: 50.0,
      top_pct: 28.0,
      angle_deg: 35.0,
      polygon: [
        [896.0, 198.0],
        [1144.0, 295.0],
        [781.0, 584.0],
        [533.0, 487.0]
      ],
      polygon_pct: [
        [65.18, 25.85],
        [83.2, 38.47],
        [56.82, 76.15],
        [38.8, 63.53]
      ]
    },
    detections: [
      {
        id: 'SSS-006-T1',
        class: 'Building (Submerged Concrete Foundation / Ruin)',
        confidence: 63,
        shadowStrength: 51,
        segmentationQuality: 58,
        seabedSimilarity: 'High',
        dimensions: { width: '14.2 m', height: '18.6 m' },
        reliability: 'Ambiguous',
        status: 'Pending',
        position: { lat: '7.8230° N', lon: '77.4870° E' },
        heading: '278° (W)',
        depth: '110 m',
        speed: '3.3 knots',
        shadowNote: 'Stepped architectural foundation with multi-wall shadow (51%)',
        segmentation_mask_pct: [
          [65.18, 25.85],
          [76.0, 30.0],
          [83.2, 38.47],
          [73.5, 58.0],
          [56.82, 76.15],
          [44.5, 71.2],
          [38.8, 63.53],
          [48.0, 42.0]
        ],
        obb: {
          cx: 839.0,
          cy: 391.0,
          width: 302.0,
          height: 353.0,
          cx_pct: 61.0,
          cy_pct: 51.0,
          w_pct: 22.0,
          h_pct: 46.0,
          left_pct: 50.0,
          top_pct: 28.0,
          angle_deg: 35.0,
          polygon: [
            [896.0, 198.0],
            [1144.0, 295.0],
            [781.0, 584.0],
            [533.0, 487.0]
          ],
          polygon_pct: [
            [65.18, 25.85],
            [83.2, 38.47],
            [56.82, 76.15],
            [38.8, 63.53]
          ]
        }
      },
      {
        id: 'SSS-006-T2',
        class: 'Container (Submerged Cargo Unit)',
        confidence: 68,
        shadowStrength: 61,
        segmentationQuality: 66,
        seabedSimilarity: 'Moderate',
        dimensions: { width: '2.4 m', height: '12.2 m' },
        reliability: 'Moderate',
        status: 'Pending',
        position: { lat: '7.8224° N', lon: '77.4858° E' },
        heading: '92° (E)',
        depth: '113 m',
        speed: '3.3 knots',
        shadowNote: 'Linear 90° acoustic specular reflection (61%)',
        segmentation_mask_pct: [
          [30.9, 43.9],
          [48.9, 43.9],
          [48.9, 55.9],
          [30.9, 55.9]
        ],
        obb: {
          cx: 549.0,
          cy: 383.2,
          width: 247.7,
          height: 92.2,
          cx_pct: 39.9,
          cy_pct: 49.9,
          w_pct: 18.0,
          h_pct: 12.0,
          left_pct: 30.9,
          top_pct: 43.9,
          angle_deg: 92.0,
          polygon: [
            [425.2, 337.1],
            [672.9, 337.1],
            [672.9, 429.3],
            [425.2, 429.3]
          ],
          polygon_pct: [
            [30.9, 43.9],
            [48.9, 43.9],
            [48.9, 55.9],
            [30.9, 55.9]
          ]
        }
      }
    ]
  }
];

export default function App() {
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number>(0);
  const [selectedTargetIdx, setSelectedTargetIdx] = useState<number>(0);
  const [scenarios, setScenarios] = useState<ScenarioData[]>(SCENARIOS);
  const [filterMode, setFilterMode] = useState<'Raw' | 'CLAHE Enhanced'>('CLAHE Enhanced');
  const [currentTime, setCurrentTime] = useState<string>('10:21:05 AM IST');
  const [exporting, setExporting] = useState<string | null>(null);
  const [uploadLogName, setUploadLogName] = useState<string>('survey_26057_alpha.sss');
  const [showIdDropdown, setShowIdDropdown] = useState<boolean>(false);
  const [showMissionDropdown, setShowMissionDropdown] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<{ msg: string; type: string } | null>(null);
  const [showDatasetModal, setShowDatasetModal] = useState<boolean>(false);

  // Dynamic Side Containers Toggling & Overlays
  const [showLeftPanel, setShowLeftPanel] = useState<boolean>(true);
  const [showRightPanel, setShowRightPanel] = useState<boolean>(true);
  const [showOverlay, setShowOverlay] = useState<boolean>(true);

  // Resolution & View Fit Mode
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const [currentResolution, setCurrentResolution] = useState<{
    width: number;
    height: number;
    aspectRatio: number;
  }>({
    width: 1376,
    height: 768,
    aspectRatio: 1.79
  });

  // Live YOLO11-SEG Inference States
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [modelLatencyMs, setModelLatencyMs] = useState<number>(164);
  const [modelFps] = useState<number>(15.2);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeItem = scenarios[activeScenarioIndex] || scenarios[0];

  // Derive all detected targets for current scenario
  const activeDetections: DetectionTarget[] =
    activeItem.detections && activeItem.detections.length > 0
      ? activeItem.detections
      : [
          {
            id: activeItem.id,
            class: activeItem.class,
            confidence: activeItem.confidence,
            shadowStrength: activeItem.shadowStrength,
            segmentationQuality: activeItem.segmentationQuality,
            seabedSimilarity: activeItem.seabedSimilarity,
            dimensions: activeItem.dimensions,
            reliability: activeItem.reliability,
            status: activeItem.status,
            position: activeItem.position,
            heading: activeItem.heading,
            depth: activeItem.depth,
            speed: activeItem.speed,
            shadowNote: activeItem.shadowNote,
            segmentation_mask_pct: activeItem.segmentation_mask_pct,
            obb: (activeItem.obb || {
              cx: 500,
              cy: 500,
              width: 100,
              height: 100,
              angle_deg: 0,
              polygon: [],
              cx_pct: 50,
              cy_pct: 50,
              w_pct: 10,
              h_pct: 10,
              left_pct: 45,
              top_pct: 45,
              polygon_pct: [
                [45, 45],
                [55, 45],
                [55, 55],
                [45, 55]
              ]
            }) as any
          }
        ];

  // Active target currently inspected in Evidence Board
  const currentTarget = activeDetections[selectedTargetIdx] || activeDetections[0];

  // Reset selected target index when switching scenarios
  useEffect(() => {
    setSelectedTargetIdx(0);
    if (activeItem.resolution) {
      setCurrentResolution({
        width: activeItem.resolution.width,
        height: activeItem.resolution.height,
        aspectRatio: activeItem.resolution.aspectRatio
      });
    }
  }, [activeScenarioIndex]);

  // Live system clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: true });
      setCurrentTime(`${timeStr} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Action handlers
  const handleConfirm = () => {
    setScenarios((prev) =>
      prev.map((s, idx) => {
        if (idx !== activeScenarioIndex) return s;
        const updatedDets = s.detections?.map((d, dIdx) =>
          dIdx === selectedTargetIdx ? { ...d, status: 'Confirmed' as const } : d
        );
        return { ...s, status: 'Confirmed', detections: updatedDets };
      })
    );
    triggerToast(`✓ Target ${currentTarget.id} confirmed as Verified Finding. Geolocated on chart.`, 'success');
  };

  const handleReject = () => {
    setScenarios((prev) =>
      prev.map((s, idx) => {
        if (idx !== activeScenarioIndex) return s;
        const updatedDets = s.detections?.map((d, dIdx) =>
          dIdx === selectedTargetIdx ? { ...d, status: 'Rejected' as const } : d
        );
        return { ...s, status: 'Rejected', detections: updatedDets };
      })
    );
    triggerToast(`✕ Target ${currentTarget.id} rejected: Insufficient acoustic evidence.`, 'error');
  };

  const handleMarkUnknown = () => {
    setScenarios((prev) =>
      prev.map((s, idx) => {
        if (idx !== activeScenarioIndex) return s;
        const updatedDets = s.detections?.map((d, dIdx) =>
          dIdx === selectedTargetIdx ? { ...d, status: 'Unknown' as const } : d
        );
        return { ...s, status: 'Unknown', detections: updatedDets };
      })
    );
    triggerToast(`? Target ${currentTarget.id} flagged for secondary hydrographic review.`, 'warning');
  };

  const triggerToast = (msg: string, type: string) => {
    setFeedbackToast({ msg, type });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleExport = (type: 'JSON' | 'CSV') => {
    setExporting(type);
    setTimeout(() => {
      const dataStr =
        type === 'JSON'
          ? 'data:text/json;charset=utf-8,' +
            encodeURIComponent(
              JSON.stringify(
                {
                  model: 'YOLO11-SEG (Instance Segmentation)',
                  scenario: activeItem.id,
                  name: activeItem.name,
                  resolution: currentResolution,
                  totalDetections: activeDetections.length,
                  detections: activeDetections
                },
                null,
                2
              )
            )
          : 'data:text/csv;charset=utf-8,' +
            encodeURIComponent(
              `TargetID,Class,Confidence,ShadowStrength,SegmentationQuality,Status,Latitude,Longitude\n` +
                activeDetections
                  .map(
                    (d) =>
                      `${d.id},"${d.class}",${d.confidence}%,${d.shadowStrength}%,${d.segmentationQuality}%,${d.status},${d.position.lat},${d.position.lon}`
                  )
                  .join('\n')
            );
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute('href', dataStr);
      dlAnchor.setAttribute('download', `sonar_seg_report_${activeItem.id}.${type.toLowerCase()}`);
      document.body.appendChild(dlAnchor);
      dlAnchor.click();
      dlAnchor.remove();
      setExporting(null);
      triggerToast(`Downloaded ${type} report for ${activeItem.id} (${activeDetections.length} targets)`, 'success');
    }, 600);
  };

  // Live YOLO11-SEG Inference on upload (supports .jpg, .jpeg, .png, .sss)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const blobUrl = URL.createObjectURL(file);
      setUploadLogName(file.name);

      const newId = `SSS-${String(scenarios.length + 4).padStart(3, '0')}`;
      const newIdx = scenarios.length;

      // 1. Inspect image dimensions
      const imgTester = new Image();
      imgTester.onload = () => {
        const nw = imgTester.naturalWidth;
        const nh = imgTester.naturalHeight;
        const ar = Number((nw / nh).toFixed(2));

        setCurrentResolution({
          width: nw,
          height: nh,
          aspectRatio: ar
        });

        // Adaptive Container Toggling for custom/wide sonar imagery resolutions
        if (ar >= 1.8 || nw >= 1600) {
          setShowLeftPanel(false);
          setShowRightPanel(false);
          triggerToast(`Wide-format imagery (${nw}×${nh}, ${ar}:1): side containers toggled for wide view`, 'info');
        }
      };
      imgTester.src = blobUrl;

      const initialScenario: ScenarioData = {
        id: newId,
        name: file.name.replace(/\.[^.]+$/, ''),
        class: 'Analyzing with YOLO11-SEG...',
        confidence: 0,
        shadowStrength: 0,
        segmentationQuality: 0,
        seabedSimilarity: 'Evaluating...',
        dimensions: { width: '—', height: '—' },
        reliability: 'Processing',
        status: 'Pending',
        position: { lat: '7.8242° N', lon: '77.4855° E' },
        heading: '276° (W)',
        depth: '114 m',
        speed: '3.2 knots',
        image: blobUrl,
        shadowNote: 'Analyzing acoustic backscatter and segmentation masks...',
        isLiveInference: true
      };

      setScenarios((prev) => [...prev, initialScenario]);
      setActiveScenarioIndex(newIdx);
      setSelectedTargetIdx(0);

      setIsAnalyzing(true);
      setAnalysisStep('Ingesting Sonar Waterfall Ping Matrix...');
      const startTime = performance.now();

      try {
        const formData = new FormData();
        formData.append('file', file);

        setAnalysisStep('Executing YOLO11-SEG Instance Segmentation (PyTorch)...');
        const res = await fetch('/api/analyze', {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          throw new Error(`Inference returned HTTP ${res.status}`);
        }

        setAnalysisStep('Computing Pixel Masks & Acoustic Highlight-Shadow Contrast...');
        const data = await res.json();
        const duration = Math.round(performance.now() - startTime);
        setModelLatencyMs(duration);

        if (data.image_resolution) {
          setCurrentResolution({
            width: data.image_resolution.width,
            height: data.image_resolution.height,
            aspectRatio: data.image_resolution.aspect_ratio
          });
        }

        if (data.success && data.detections && data.detections.length > 0) {
          const detList: DetectionTarget[] = data.detections;
          const det = data.primary_detection || detList[0];
          const updatedScenario: ScenarioData = {
            id: newId,
            name: file.name.replace(/\.[^.]+$/, ''),
            class: `${det.class}`,
            confidence: det.confidence,
            shadowStrength: det.shadowStrength || 70,
            segmentationQuality: det.segmentationQuality || 85,
            seabedSimilarity: det.seabedSimilarity || 'Moderate',
            dimensions: det.dimensions || { width: '3.2 m', height: '6.4 m' },
            reliability: det.reliability || 'High',
            status: 'Pending',
            position: det.position || { lat: '7.8242° N', lon: '77.4855° E' },
            heading: det.heading || '276° (W)',
            depth: det.depth || '114 m',
            speed: det.speed || '3.2 knots',
            image: blobUrl,
            annotatedImage: data.annotated_image,
            shadowNote: det.shadowNote || 'Acoustic highlight with shadow verification',
            obb: det.obb,
            segmentation_mask_pct: det.segmentation_mask_pct,
            detections: detList,
            isLiveInference: true
          };

          setScenarios((prev) => prev.map((s, i) => (i === newIdx ? updatedScenario : s)));
          setSelectedTargetIdx(0);
          triggerToast(`✓ YOLO11-SEG detected ${detList.length} debris targets with pixel masks (${duration}ms)`, 'success');
        } else {
          triggerToast(`Image uploaded (${file.name}).`, 'info');
        }
      } catch (err: any) {
        console.error('YOLO11-SEG inference error:', err);
        triggerToast(`Inference notice: using local acoustic telemetry (${err.message || 'offline'})`, 'warning');
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  // Run live inference on CURRENT active scenario
  const handleRunLiveInference = async () => {
    setIsAnalyzing(true);
    setAnalysisStep('Routing Sonar Waterfall to YOLO11-SEG Engine...');
    const startTime = performance.now();

    try {
      let res;
      if (activeItem.image.startsWith('blob:')) {
        const blob = await fetch(activeItem.image).then((r) => r.blob());
        const formData = new FormData();
        formData.append('file', blob, `${activeItem.id}.jpg`);
        setAnalysisStep('Running YOLO11-SEG Instance Segmentation on Waterfall...');
        res = await fetch('/api/analyze', {
          method: 'POST',
          body: formData
        });
      } else {
        setAnalysisStep('Executing YOLO11-SEG Multi-Target Segmentation & Shadow Verification...');
        res = await fetch('/api/analyze_filename', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: activeItem.image })
        });
      }

      if (!res.ok) {
        throw new Error(`Inference returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const duration = Math.round(performance.now() - startTime);
      setModelLatencyMs(duration);

      if (data.image_resolution) {
        setCurrentResolution({
          width: data.image_resolution.width,
          height: data.image_resolution.height,
          aspectRatio: data.image_resolution.aspect_ratio
        });
      }

      if (data.success && data.detections && data.detections.length > 0) {
        const detList: DetectionTarget[] = data.detections;
        const det = data.primary_detection || detList[0];
        setScenarios((prev) =>
          prev.map((s, idx) =>
            idx === activeScenarioIndex
              ? {
                  ...s,
                  class: det.class,
                  confidence: det.confidence,
                  shadowStrength: det.shadowStrength || s.shadowStrength,
                  segmentationQuality: det.segmentationQuality || s.segmentationQuality,
                  seabedSimilarity: det.seabedSimilarity || s.seabedSimilarity,
                  dimensions: det.dimensions || s.dimensions,
                  reliability: det.reliability || s.reliability,
                  annotatedImage: data.annotated_image,
                  obb: det.obb || s.obb,
                  segmentation_mask_pct: det.segmentation_mask_pct || s.segmentation_mask_pct,
                  shadowNote: det.shadowNote || s.shadowNote,
                  detections: detList,
                  isLiveInference: true
                }
              : s
          )
        );
        setSelectedTargetIdx(0);
        triggerToast(`⚡ YOLO11-SEG Live: Detected ${detList.length} debris targets (${duration}ms)`, 'success');
      }
    } catch (err: any) {
      console.error('Live inference error:', err);
      triggerToast(`Live inference: ${err.message}`, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Dynamic Side Containers & Canvas Layout Spans
  const centerColSpan =
    !showLeftPanel && !showRightPanel
      ? 'col-span-12'
      : !showLeftPanel || !showRightPanel
      ? 'col-span-9'
      : 'col-span-6';

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070f1e] text-slate-100 font-sans select-none overflow-hidden text-[13px]">
      {/* ── PRIMARY NAVIGATION BAR: SIDE-SCAN SONAR ANALYSIS ──────────────────── */}
      <header className="h-14 px-3 sm:px-4 bg-[#081326]/95 backdrop-blur-md border-b border-[#142a47] flex items-center justify-between flex-shrink-0 z-30 shadow-lg relative select-none">
        {/* Left: Tactical Sonar Branding & Mission Navigation Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Sonar Icon with Ping Animation */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-950 via-[#0a1e38] to-[#061224] border border-cyan-500/50 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.35)] relative overflow-hidden flex-shrink-0">
              <span className="absolute inset-0 rounded-lg bg-cyan-400/10 animate-ping opacity-30"></span>
              <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.4" />
                <circle cx="12" cy="12" r="6" strokeOpacity="0.7" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
                <line x1="12" y1="12" x2="19" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black tracking-wider text-slate-100 uppercase font-mono">
                  SIDE-SCAN SONAR
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-500/50 px-1.5 py-0.5 rounded shadow-[0_0_6px_rgba(6,182,212,0.25)] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  AI ACTIVE
                </span>
              </div>
              <span className="text-[8px] tracking-widest text-sky-400/70 uppercase font-mono hidden md:block mt-0.5">
                Marine Anomaly & Debris Detection
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-[#193252] hidden md:block"></div>

          {/* Mission Dropdown Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowMissionDropdown(!showMissionDropdown)}
              className="flex items-center gap-1.5 bg-[#051122] hover:bg-[#0b1f3b] border border-[#173559] hover:border-cyan-500/60 px-2.5 py-1 rounded-md text-xs font-mono text-slate-200 transition-all cursor-pointer shadow-inner"
              title="Switch Active Sonar Mission / Dataset Scenario"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse flex-shrink-0"></span>
              <span className="text-cyan-300 font-bold">{activeItem.id}:</span>
              <span className="text-slate-200 font-semibold max-w-[90px] sm:max-w-[130px] truncate">
                {activeItem.name.split('/')[0]}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showMissionDropdown ? 'rotate-180 text-cyan-300' : ''}`} />
            </button>

            {showMissionDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMissionDropdown(false)} />
                <div className="absolute left-0 top-9 w-72 bg-[#06152b]/95 backdrop-blur-md border border-cyan-500/60 rounded-xl shadow-2xl p-1.5 z-50 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase tracking-wider border-b border-[#142d4f] flex items-center justify-between">
                    <span>Select Mission</span>
                    <span className="text-cyan-400 font-bold">{scenarios.length} Scenarios</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-0.5 custom-scrollbar">
                    {scenarios.map((sc, idx) => (
                      <button
                        key={sc.id}
                        onClick={() => {
                          setActiveScenarioIndex(idx);
                          setShowMissionDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          idx === activeScenarioIndex
                            ? 'bg-gradient-to-r from-blue-700 to-cyan-700 text-white font-bold shadow-md'
                            : 'text-slate-300 hover:bg-[#0e274a] hover:text-cyan-200'
                        }`}
                      >
                        <div>
                          <div className="font-mono text-[11px] font-bold text-cyan-300">{sc.id}</div>
                          <div className="text-[11px] text-slate-200 truncate max-w-[170px]">{sc.name}</div>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-cyan-300 flex-shrink-0">
                          {sc.confidence}%
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center: Consolidated Display Toolbar (Raw/CLAHE, Overlay, Aspect, Target Count) */}
        <div className="hidden lg:flex items-center bg-[#051020]/90 border border-[#132c4d] rounded-lg p-0.5 shadow-inner gap-1">
          {/* Raw / CLAHE Toggle */}
          <div className="flex items-center bg-[#08172c] rounded-md p-0.5">
            <button
              onClick={() => setFilterMode('Raw')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                filterMode === 'Raw'
                  ? 'bg-cyan-600 text-white shadow-[0_0_6px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Display original acoustic sonar waterfall"
            >
              RAW
            </button>
            <button
              onClick={() => setFilterMode('CLAHE Enhanced')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                filterMode === 'CLAHE Enhanced'
                  ? 'bg-cyan-600 text-white shadow-[0_0_6px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Apply Contrast Limited Adaptive Histogram Equalization"
            >
              CLAHE
            </button>
          </div>

          <div className="w-px h-3.5 bg-[#173255]"></div>

          {/* Overlay Toggle */}
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className={`px-2 py-1 rounded text-[10px] font-mono font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              showOverlay
                ? 'bg-[#0d274c] text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle AI Detection Polygons & Bounding Outlines"
          >
            {showOverlay ? <Eye className="w-3 h-3 text-cyan-400" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
            <span>OVERLAY</span>
          </button>

          <div className="w-px h-3.5 bg-[#173255]"></div>

          {/* Fit Mode Toggle */}
          <button
            onClick={() => {
              const next = fitMode === 'contain' ? 'cover' : 'contain';
              setFitMode(next);
              triggerToast(`Image Scaling: ${next === 'contain' ? 'Preserve Aspect (Contain)' : 'Fill Screen (Cover)'}`, 'info');
            }}
            className="px-2 py-1 rounded text-[10px] font-mono text-slate-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer transition-colors"
            title={`Native: ${currentResolution.width}×${currentResolution.height} px (${currentResolution.aspectRatio}:1). Click to toggle Fit`}
          >
            <span className="text-slate-400">{currentResolution.width}×{currentResolution.height}</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-[#0b1f38] text-cyan-300 border border-cyan-600/40 uppercase font-bold">
              {fitMode}
            </span>
          </button>

          <div className="w-px h-3.5 bg-[#173255]"></div>

          {/* Targets Counter Badge */}
          <div className="px-2 py-0.5 flex items-center gap-1.5 text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-cyan-300 font-bold">{activeDetections.length} Targets</span>
          </div>
        </div>

        {/* Right: Tactical Actions & Panel Layout */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Run Live AI Action Button */}
          <button
            onClick={handleRunLiveInference}
            disabled={isAnalyzing}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400/50 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.35)] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Run Real-Time Acoustic Detection Analysis"
          >
            <Zap className={`w-3.5 h-3.5 text-cyan-200 fill-cyan-200 ${isAnalyzing ? 'animate-spin' : 'animate-pulse'}`} />
            <span className="font-mono text-xs">{isAnalyzing ? 'Analyzing...' : 'Run Live AI'}</span>
          </button>

          {/* Datasets Trigger */}
          <button
            onClick={() => setShowDatasetModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#071930] hover:bg-[#0c274c] border border-[#183961] hover:border-cyan-500/50 text-xs text-cyan-200 transition-all cursor-pointer"
            title="Open SIH26057 Multi-Dataset & Training Architecture"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[11px]">Datasets</span>
          </button>

          {/* Panel Layout Control Segmented Group */}
          <div className="flex items-center bg-[#051020] p-0.5 rounded-lg border border-[#142c4d]">
            <button
              onClick={() => setShowLeftPanel(!showLeftPanel)}
              className={`p-1.5 rounded text-xs transition-all cursor-pointer ${
                showLeftPanel
                  ? 'bg-[#0d274c] text-cyan-300 border border-cyan-500/50 shadow-[0_0_6px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Left Telemetry Panel"
            >
              <PanelLeftOpen className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowRightPanel(!showRightPanel)}
              className={`p-1.5 rounded text-xs transition-all cursor-pointer ${
                showRightPanel
                  ? 'bg-[#0d274c] text-cyan-300 border border-cyan-500/50 shadow-[0_0_6px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Right Decision & GIS Panel"
            >
              <PanelRightOpen className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                if (showLeftPanel || showRightPanel) {
                  setShowLeftPanel(false);
                  setShowRightPanel(false);
                } else {
                  setShowLeftPanel(true);
                  setShowRightPanel(true);
                }
              }}
              className={`p-1.5 rounded text-xs transition-all cursor-pointer ${
                !showLeftPanel && !showRightPanel
                  ? 'bg-cyan-950 text-cyan-200 border border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)] font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Wide Display Mode"
            >
              {!showLeftPanel && !showRightPanel ? (
                <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 text-slate-300" />
              )}
            </button>
          </div>

          {/* Live Clock */}
          <div className="hidden xl:flex items-center gap-1 px-2 py-1 rounded bg-[#061427] border border-[#142f54] text-[11px] font-mono text-slate-300">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{currentTime}</span>
          </div>
        </div>
      </header>

      {/* ── MAIN DASHBOARD: THREE COLUMNS ────────────────────────────────────── */}
      <div className="flex-1 p-3 grid grid-cols-12 gap-3 overflow-hidden relative">
        {/* Floating Left Panel Expand Tab when collapsed */}
        {!showLeftPanel && (
          <button
            onClick={() => setShowLeftPanel(true)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 px-1.5 py-3 rounded-r-lg bg-[#09182d]/90 backdrop-blur-md border border-cyan-500/40 hover:border-cyan-400 hover:bg-[#0f2a47] text-cyan-400 hover:text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)] flex flex-col items-center gap-1.5 cursor-pointer group transition-all"
            title="Expand Telemetry Container"
          >
            <PanelLeftOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-mono font-bold tracking-widest uppercase [writing-mode:vertical-lr] text-slate-400 group-hover:text-cyan-300">
              Telemetry
            </span>
          </button>
        )}

        {/* ══ COLUMN 1: MISSION CONTROL & TELEMETRY (cols 1-3) ════════════════ */}
        {showLeftPanel && (
          <section className="col-span-3 flex flex-col gap-2 overflow-y-auto transition-all duration-300">
            {/* Main Card: Mission Control & Telemetry */}
            <div className="bg-gradient-to-b from-[#0d223f] to-[#0a1b32] border border-[#18365d] rounded-xl p-3 flex flex-col gap-2 shadow-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-100 tracking-wide uppercase font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  Mission Control &amp; Telemetry
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowLeftPanel(false)}
                    className="p-1 rounded hover:bg-[#15345d] text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                    title="Collapse Telemetry Container"
                  >
                    <PanelLeftClose className="w-3.5 h-3.5" />
                  </button>
                  <MoreVertical className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-200" />
                </div>
              </div>

              {/* Upload Sonar Log Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-sky-700 via-blue-600 to-cyan-600 hover:from-sky-600 hover:to-cyan-500 border border-cyan-400/40 text-white font-semibold text-xs flex items-center justify-between shadow-[0_0_12px_rgba(14,165,233,0.25)] transition-all group cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5 text-cyan-200 group-hover:scale-110 transition-transform" />
                  <span>Upload Sonar Imagery (.sss / .jpg / .png)</span>
                </div>
                <FileText className="w-3.5 h-3.5 text-cyan-200/80" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".sss,.xtf,.raw,.jpg,.png,.jpeg,.tif"
                className="hidden"
                onChange={handleFileUpload}
              />

              {/* Current Log Status */}
              <div className="flex items-center justify-between text-xs px-2.5 py-1 bg-[#061426] rounded-md border border-[#142a4a] text-slate-400">
                <div className="flex items-center gap-1.5 font-mono text-[11px] truncate">
                  <span className="text-slate-400">Active Log:</span>
                  <span className="text-cyan-200 truncate max-w-[150px] font-semibold">{uploadLogName}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <div className="w-2.5 h-2.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            </div>

            {/* Subcard: Simulated Telemetry Pipeline */}
            <div className="bg-gradient-to-b from-[#0d223f] to-[#0a1b32] border border-[#18365d] rounded-xl p-3 flex flex-col gap-1.5 shadow-lg">
              <div className="flex items-center justify-between pb-1 border-b border-[#142845]">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-sky-400" />
                  Simulated Telemetry Pipeline
                </span>
                <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/80 px-1 py-0.2 rounded border border-cyan-800/40">
                  AUV-07
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-400">Vehicle Position:</span>
                  <span className="font-mono text-slate-200 font-medium bg-[#061426] px-1.5 py-0.5 rounded border border-[#142a4a] text-[11px]">
                    Lat {activeItem.position.lat}, Lon {activeItem.position.lon}
                  </span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-400">Heading:</span>
                  <span className="font-mono text-slate-200 font-medium bg-[#061426] px-1.5 py-0.5 rounded border border-[#142a4a] text-[11px]">{activeItem.heading}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-400">Depth:</span>
                  <span className="font-mono text-slate-200 font-medium bg-[#061426] px-1.5 py-0.5 rounded border border-[#142a4a] text-[11px]">{activeItem.depth}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-400">Speed:</span>
                  <span className="font-mono text-slate-200 font-medium bg-[#061426] px-1.5 py-0.5 rounded border border-[#142a4a] text-[11px]">{activeItem.speed}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-400">Sonar Mode:</span>
                  <span className="font-mono text-slate-200 font-medium bg-[#061426] px-1.5 py-0.5 rounded border border-[#142a4a] text-[11px]">455 / 900 kHz Chirp</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-400">Data Source:</span>
                  <span className="font-mono text-cyan-300 font-medium bg-[#061426] px-1.5 py-0.5 rounded border border-[#142a4a] text-[11px]">
                    {activeItem.isLiveInference ? 'Uploaded Waterfall' : 'Recorded SSS Log'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-400">Vehicle:</span>
                  <span className="font-mono text-slate-200 font-medium bg-[#061426] px-1.5 py-0.5 rounded border border-[#142a4a] text-[11px]">Blueye X3 AUV</span>
                </div>
              </div>

              <div className="h-px bg-[#142845] my-0.5"></div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">AI Model:</span>
                  <span className="font-semibold text-emerald-400 font-mono">YOLO11-SEG</span>
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-semibold text-emerald-400">Ready</span>
                </div>
              </div>
            </div>

            {/* Subcard: Software Performance Metrics */}
            <div className="bg-gradient-to-b from-[#0d223f] to-[#0a1b32] border border-[#18365d] rounded-xl p-3 flex flex-col gap-2 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  Software Performance Metrics
                </h3>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* Tile 1: Latency */}
                <div className="bg-[#061426] border border-[#19375e] hover:border-cyan-500/60 rounded-lg p-2 flex flex-col items-center text-center shadow-inner transition-colors group">
                  <Zap className="w-3.5 h-3.5 text-sky-400 mb-0.5 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] text-slate-400 leading-tight">YOLO11-SEG</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{modelLatencyMs} ms</span>
                </div>

                {/* Tile 2: FPS */}
                <div className="bg-[#061426] border border-[#19375e] hover:border-cyan-500/60 rounded-lg p-2 flex flex-col items-center text-center shadow-inner transition-colors group">
                  <Activity className="w-3.5 h-3.5 text-sky-400 mb-0.5 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] text-slate-400 leading-tight">Pipeline Rate</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{modelFps} FPS</span>
                </div>

                {/* Tile 3: VRAM / Engine */}
                <div className="bg-[#061426] border border-[#19375e] hover:border-cyan-500/60 rounded-lg p-2 flex flex-col items-center text-center shadow-inner transition-colors group">
                  <Cpu className="w-3.5 h-3.5 text-sky-400 mb-0.5 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] text-slate-400 leading-tight">Torch Engine</span>
                  <span className="text-sm font-bold text-sky-400 font-mono mt-0.5">CPU / SEG</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ══ COLUMN 2: SIDE-SCAN SONAR ANALYSIS (Center Waterfall) ════════════ */}
        <section className={`${centerColSpan} bg-[#0b1b32] border border-[#173053] rounded-xl flex flex-col overflow-hidden shadow-lg transition-all duration-300`}>
          {/* Streamlined Mission Status Header Bar */}
          <div className="h-8 px-3.5 bg-[#081426] border-b border-[#132742] flex items-center justify-between flex-shrink-0 select-none">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse"></span>
              <span className="font-mono font-bold text-slate-200 text-[11px] tracking-wide uppercase">
                MISSION {activeItem.id}: {activeItem.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                | Swath: 100m | Range: 50m Stbd/Port | 455 kHz
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300">
              <span className="text-cyan-300 font-semibold flex items-center gap-1">
                <span>Targets Detected:</span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-600/40 text-cyan-200 font-bold">
                  {activeDetections.length}
                </span>
              </span>
              <span className="hidden md:inline text-slate-400">
                Primary: <strong className="text-slate-200">{activeDetections.length > 0 ? `Detection #1 (${activeDetections[0].confidence}%)` : 'None'}</strong>
              </span>
            </div>
          </div>

          {/* Main Sonar Waterfall Canvas Display */}
          <div className="flex-1 relative sonar-waterfall-bg flex items-center justify-center overflow-hidden p-2">
            {/* Acoustic Range Ruler Scale along Top Edge */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-[#030914]/85 backdrop-blur-xs border-b border-[#142845]/80 flex items-center justify-between px-3 text-[9px] font-mono text-slate-400 pointer-events-none z-20 select-none">
              <div className="flex items-center gap-1 text-sky-400 font-semibold">
                <span>◄ PORT CH</span>
                <span className="text-slate-400">50m</span>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-slate-500 text-[8px]">
                <span>37.5m</span>
                <span>25.0m</span>
                <span>12.5m</span>
              </div>
              <div className="flex items-center gap-1 text-cyan-300 font-bold bg-[#07172b] px-1.5 py-0.2 rounded border border-cyan-500/40 text-[8px]">
                <span>▼ 0m NADIR</span>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-slate-500 text-[8px]">
                <span>12.5m</span>
                <span>25.0m</span>
                <span>37.5m</span>
              </div>
              <div className="flex items-center gap-1 text-sky-400 font-semibold">
                <span className="text-slate-400">50m</span>
                <span>STBD CH ►</span>
              </div>
            </div>

            {/* Top-Left Floating Badge: Ping & Sonar Frequency */}
            <div className="absolute top-6 left-3 bg-[#030914]/90 backdrop-blur-sm border border-[#162c4a] rounded-lg px-2.5 py-1 text-[10px] font-mono text-slate-200 shadow-lg pointer-events-none z-20 space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>PING #1450</span>
                <span className="text-slate-400 font-normal">| 455 kHz</span>
              </div>
              <div className="text-slate-400 text-[9px]">PORT SWATH: 50.0m</div>
            </div>

            {/* Top-Right Floating Badge: Altitude & Attitude */}
            <div className="absolute top-6 right-3 bg-[#030914]/90 backdrop-blur-sm border border-[#162c4a] rounded-lg px-2.5 py-1 text-[10px] font-mono text-slate-200 shadow-lg pointer-events-none z-20 space-y-0.5 text-right">
              <div className="font-bold text-slate-100">ALT: 12.4m | PITCH: +0.4°</div>
              <div className="text-slate-400 text-[9px]">STARBOARD SWATH: 50.0m</div>
            </div>

            {/* Bottom-Left Floating Badge: Vehicle & Navigation */}
            <div className="absolute bottom-3 left-3 bg-[#030914]/90 backdrop-blur-sm border border-[#162c4a] rounded-lg px-2.5 py-1 text-[10px] font-mono text-slate-200 shadow-lg pointer-events-none z-20 space-y-0.5">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span>AUV-07</span>
                <span className="text-slate-300 font-normal">| SPEED: {activeItem.speed}</span>
              </div>
              <div className="text-slate-400 text-[9px]">HDG: {activeItem.heading} | DEPTH: {activeItem.depth}</div>
            </div>

            {/* Bottom-Right Floating Badge: Targets & WGS84 Coords */}
            <div className="absolute bottom-3 right-3 bg-[#030914]/90 backdrop-blur-sm border border-[#162c4a] rounded-lg px-2.5 py-1 text-[10px] font-mono text-slate-200 shadow-lg pointer-events-none z-20 space-y-0.5 text-right">
              <div className="font-bold text-cyan-300 flex items-center justify-end gap-1.5">
                <span>TARGETS: {activeDetections.length} SEGMENTED</span>
              </div>
              <div className="text-slate-400 text-[9px]">WGS84: {activeItem.position.lat}, {activeItem.position.lon}</div>
            </div>

            {/* ── IMAGE-BOUNDED STAGE: Perfectly locked to image dimensions so overlays never go out of frame ── */}
            <div
              className="relative max-w-full max-h-full flex items-center justify-center select-none shadow-2xl rounded-sm overflow-hidden"
              style={{
                aspectRatio: `${currentResolution.width} / ${currentResolution.height}`,
                width: fitMode === 'cover' ? '100%' : undefined,
                height: fitMode === 'cover' ? '100%' : undefined,
              }}
            >
              {/* The False-Color Side-Scan Sonar Waterfall Image */}
              <img
                src={activeItem.image.startsWith('blob:') ? activeItem.image : `/sonar/${activeItem.image}`}
                alt="Side-Scan Sonar Display"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  if (img.naturalWidth && img.naturalHeight) {
                    setCurrentResolution({
                      width: img.naturalWidth,
                      height: img.naturalHeight,
                      aspectRatio: parseFloat((img.naturalWidth / img.naturalHeight).toFixed(2))
                    });
                  }
                }}
                className={`w-full h-full object-fill select-none block transition-all duration-300 ${
                  filterMode === 'CLAHE Enhanced'
                    ? 'contrast-[1.35] brightness-[1.08] saturate-125'
                    : 'contrast-100 brightness-95'
                }`}
              />

              {/* Nadir Gap: Dead acoustic zone vertical line right down the center of the image */}
              <div className="absolute top-0 bottom-0 left-[49.75%] w-[3px] bg-[#01050e]/95 pointer-events-none z-10 border-x border-[#020b18] flex flex-col justify-center items-center">
                <span className="text-[7px] font-mono text-cyan-500/25 uppercase tracking-widest [writing-mode:vertical-lr] select-none py-6">
                  NADIR BLIND ZONE
                </span>
              </div>

              {/* ── SIMULTANEOUS MULTI-TARGET DETECTION OVERLAYS (PRIMARY IN BOTH RAW AND CLAHE) ── */}
              {showOverlay && (
                <div className="absolute inset-0 pointer-events-none z-10">
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                <defs>
                  <linearGradient id="gradTarget0" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a3e635" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.32" />
                  </linearGradient>
                  <linearGradient id="gradTarget1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0.32" />
                  </linearGradient>
                  <linearGradient id="gradTarget2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.32" />
                  </linearGradient>
                  <linearGradient id="gradTarget3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c084fc" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#9333ea" stopOpacity="0.32" />
                  </linearGradient>
                  <linearGradient id="maskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c026d3" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.85" />
                  </linearGradient>
                </defs>

                {/* Render All Detected Debris Targets Simultaneously */}
                {activeDetections.map((target, tIdx) => {
                  if (!target.obb) return null;
                  const isSelected = tIdx === selectedTargetIdx;

                  const theme = [
                    {
                      stroke: '#a3e635',
                      fill: 'url(#gradTarget0)',
                      anchor: '#a3e635',
                      glow: 'drop-shadow-[0_0_8px_rgba(163,230,53,0.8)]',
                      dimGlow: 'drop-shadow-[0_0_4px_rgba(163,230,53,0.4)]'
                    },
                    {
                      stroke: '#fbbf24',
                      fill: 'url(#gradTarget1)',
                      anchor: '#fbbf24',
                      glow: 'drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]',
                      dimGlow: 'drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]'
                    },
                    {
                      stroke: '#38bdf8',
                      fill: 'url(#gradTarget2)',
                      anchor: '#38bdf8',
                      glow: 'drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]',
                      dimGlow: 'drop-shadow-[0_0_4px_rgba(56,189,248,0.4)]'
                    },
                    {
                      stroke: '#e879f9',
                      fill: 'url(#gradTarget3)',
                      anchor: '#e879f9',
                      glow: 'drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]',
                      dimGlow: 'drop-shadow-[0_0_4px_rgba(232,121,249,0.4)]'
                    }
                  ][tIdx % 4];

                  const polyPoints = target.obb.polygon_pct
                    ? target.obb.polygon_pct.map(([x, y]) => `${x},${y}`).join(' ')
                    : `${target.obb.left_pct || 40},${target.obb.top_pct || 40} ${
                        (target.obb.left_pct || 40) + (target.obb.w_pct || 10)
                      },${target.obb.top_pct || 40} ${
                        (target.obb.left_pct || 40) + (target.obb.w_pct || 10)
                      },${(target.obb.top_pct || 40) + (target.obb.h_pct || 10)} ${
                        target.obb.left_pct || 40
                      },${(target.obb.top_pct || 40) + (target.obb.h_pct || 10)}`;

                  const anchors = target.obb.polygon_pct || [
                    [target.obb.left_pct || 40, target.obb.top_pct || 40],
                    [(target.obb.left_pct || 40) + (target.obb.w_pct || 10), target.obb.top_pct || 40],
                    [(target.obb.left_pct || 40) + (target.obb.w_pct || 10), (target.obb.top_pct || 40) + (target.obb.h_pct || 10)],
                    [target.obb.left_pct || 40, (target.obb.top_pct || 40) + (target.obb.h_pct || 10)]
                  ];

                  const cx = target.obb.cx_pct ?? 50;
                  const cy = target.obb.cy_pct ?? 50;
                  const angRad = ((target.obb.angle_deg ?? 0) * Math.PI) / 180;
                  const vecLen = isSelected ? 4.2 : 3.2;

                  return (
                    <g
                      key={target.id || tIdx}
                      className="pointer-events-auto cursor-pointer"
                      onClick={() => setSelectedTargetIdx(tIdx)}
                    >
                      {/* Instance Segmentation Mask / Rotated Box Polygon */}
                      <polygon
                        points={polyPoints}
                        fill={theme.fill}
                        stroke={theme.stroke}
                        strokeWidth={isSelected ? '0.48' : '0.32'}
                        strokeDasharray={isSelected ? 'none' : '1.5,0.8'}
                        className={`filter ${isSelected ? theme.glow : theme.dimGlow} transition-all`}
                      />

                      {/* Corner Anchors */}
                      {anchors.map(([x, y], i) => (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r={isSelected ? '0.65' : '0.45'}
                          fill={theme.anchor}
                          stroke="#041226"
                          strokeWidth="0.18"
                        />
                      ))}

                      {/* Orientation Heading Vector & Centroid */}
                      <line
                        x1={cx}
                        y1={cy}
                        x2={cx + vecLen * Math.cos(angRad)}
                        y2={cy + vecLen * Math.sin(angRad)}
                        stroke={theme.stroke}
                        strokeWidth={isSelected ? '0.42' : '0.3'}
                        strokeLinecap="round"
                      />
                      <circle cx={cx} cy={cy} r={isSelected ? '0.55' : '0.4'} fill="#ffffff" stroke={theme.stroke} strokeWidth="0.15" />
                    </g>
                  );
                })}

                {/* Primary Special Callouts for SSS-004 Target 1 */}
                {activeItem.id === 'SSS-004' && selectedTargetIdx === 0 && (
                  <>
                    {/* Organic contour polygon representing pixel mask */}
                    <polygon
                      points="59.6,42.0 61.2,43.0 62.0,46.3 61.6,51.7 61.4,57.0 60.2,62.3 58.8,66.3 58.0,64.7 58.4,58.7 58.8,51.7 59.4,45.3"
                      fill="url(#maskGrad)"
                      stroke="#e879f9"
                      strokeWidth="0.32"
                      strokeLinejoin="round"
                      className="filter drop-shadow-[0_0_5px_#c026d3]"
                    />

                    {/* Magenta Pointer Line to Segmentation Mask */}
                    <path d="M 60.5,52.5 L 63.8,52.5" stroke="#f472b6" strokeWidth="0.3" fill="none" />
                    <circle cx="60.5" cy="52.5" r="0.45" fill="#f472b6" />

                    {/* Cyan Shadow Region Contour */}
                    <path
                      d="M 58.8,59.7 Q 62.5,59.2 62.8,65.0 Q 63.2,70.8 61.5,72.5 Q 58.5,74.2 57.2,66.7 Z"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="0.32"
                      strokeDasharray="0.8,0.4"
                      className="filter drop-shadow-[0_0_5px_#0284c7]"
                    />

                    {/* Cyan Pointer Line to Acoustic Shadow */}
                    <path d="M 60.5,66.7 L 63.0,66.7" stroke="#38bdf8" strokeWidth="0.3" fill="none" />
                    <circle cx="60.5" cy="66.7" r="0.45" fill="#38bdf8" />
                  </>
                )}
              </svg>

              {/* Individual HTML Badges for ALL detected targets */}
              {activeDetections.map((target, tIdx) => {
                if (!target.obb) return null;
                const isSelected = tIdx === selectedTargetIdx;
                const theme = [
                  { border: 'border-[#a3e635]', text: 'text-[#a3e635]', dot: 'bg-[#a3e635]', bg: 'bg-[#030813]/95' },
                  { border: 'border-amber-400', text: 'text-amber-300', dot: 'bg-amber-400', bg: 'bg-[#030813]/95' },
                  { border: 'border-sky-400', text: 'text-sky-300', dot: 'bg-sky-400', bg: 'bg-[#030813]/95' },
                  { border: 'border-fuchsia-400', text: 'text-fuchsia-300', dot: 'bg-fuchsia-400', bg: 'bg-[#030813]/95' }
                ][tIdx % 4];

                    const rawX = target.obb.cx_pct ?? (target.obb.left_pct ? target.obb.left_pct + 5 : 50);
                    const rawY = target.obb.top_pct ?? 30;
                    const posX = Math.max(3, Math.min(93, rawX));
                    const posY = Math.max(6, Math.min(94, rawY - 2));

                    return (
                      <div
                        key={target.id || tIdx}
                        onClick={() => setSelectedTargetIdx(tIdx)}
                        style={{
                          left: `${posX}%`,
                          top: `${posY}%`,
                          transform: posX > 65 ? 'translate(-85%, -100%)' : posX < 25 ? 'translate(-10%, -100%)' : 'translate(-50%, -100%)'
                        }}
                        className={`absolute pointer-events-auto cursor-pointer border px-2 py-0.5 rounded text-[11px] font-bold whitespace-nowrap shadow-2xl flex items-center gap-1.5 transition-all ${
                          theme.bg
                        } ${theme.border} ${theme.text} ${
                          isSelected
                            ? 'scale-105 ring-2 ring-cyan-400/80 z-20 font-extrabold'
                            : 'opacity-85 hover:opacity-100 z-10'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${theme.dot} ${isSelected ? 'animate-pulse' : ''}`}></span>
                        <span className="font-mono text-[10px] font-bold">Detection #{tIdx + 1}</span>
                        <span className="font-mono text-emerald-400 font-normal">({target.confidence}%)</span>
                        <span className="text-[9px] text-slate-300 bg-[#0b1c33] px-1 py-0.5 rounded border border-white/10 font-mono">
                          ∠ {target.obb.angle_deg}°
                        </span>
                        {isSelected && (
                          <span className="text-[9px] text-cyan-300 bg-cyan-950/90 px-1 py-0.2 rounded border border-cyan-500/50 font-mono font-normal">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* SSS-004 Target 1 Callout Boxes */}
                  {activeItem.id === 'SSS-004' && selectedTargetIdx === 0 && (
                    <>
                      <div
                        style={{ left: '64%', top: '48.5%' }}
                        className="absolute bg-[#050e1c]/95 border border-[#ec4899] px-2.5 py-1 rounded text-[11px] font-sans text-[#f472b6] shadow-xl whitespace-nowrap leading-tight pointer-events-none"
                      >
                        <div className="font-semibold">Segmentation Mask</div>
                        <div className="text-[10px] text-[#f9a8d4]">Pixel-level Segmentation</div>
                      </div>

                      <div
                        style={{ left: '63.2%', top: '62.5%' }}
                        className="absolute bg-[#050e1c]/95 border border-[#38bdf8] px-2.5 py-1 rounded text-[11px] font-sans text-sky-300 shadow-xl whitespace-nowrap font-medium pointer-events-none"
                      >
                        Acoustic Shadow Analysis: Strong (88%)
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── LIVE INFERENCE SCANNING HUD OVERLAY ── */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-[#030914]/85 backdrop-blur-sm flex flex-col items-center justify-center z-30 transition-all">
                <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-ping"></div>
                  <div className="absolute inset-2 rounded-full border border-cyan-400/50 animate-pulse"></div>
                  <div className="w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center shadow-[0_0_15px_#22d3ee]">
                    <Zap className="w-6 h-6 text-cyan-300 animate-bounce" />
                  </div>
                </div>

                <div className="text-sm font-bold tracking-wider text-cyan-300 font-mono uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  YOLO11-SEG Sonar Engine
                </div>
                <div className="text-xs text-slate-300 font-mono mt-1 text-center max-w-sm px-4">
                  {analysisStep || 'Analyzing Acoustic Backscatter Matrix...'}
                </div>
                <div className="w-64 h-1.5 bg-[#0a182d] rounded-full mt-3 overflow-hidden border border-cyan-500/30">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full animate-pulse w-3/4"></div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ══ COLUMN 3: DECISION WORKFLOW & GIS (cols 10-12, Right) ═══════════ */}
        {showRightPanel && (
          <section className="col-span-3 flex flex-col gap-2 overflow-y-auto transition-all duration-300">
            {/* Card: Evidence Board */}
            <div className="bg-gradient-to-b from-[#0d223f] to-[#0a1b32] border border-[#18365d] rounded-xl p-3 flex flex-col gap-2 shadow-lg relative">
              <div className="flex items-center justify-between pb-1 border-b border-[#142845]">
                <h2 className="text-xs font-bold text-slate-100 tracking-wide uppercase font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  Decision Workflow &amp; Evidence
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowRightPanel(false)}
                    className="p-1 rounded hover:bg-[#15345d] text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                    title="Collapse Evidence & GIS Container"
                  >
                    <PanelRightClose className="w-3.5 h-3.5" />
                  </button>
                  <MoreVertical className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Target Classification</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-700/50">
                  Target {selectedTargetIdx + 1} / {activeDetections.length}
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                  currentTarget.status === 'Confirmed'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
                    : currentTarget.status === 'Rejected'
                    ? 'bg-rose-950 text-rose-300 border-rose-500/60'
                    : currentTarget.status === 'Unknown'
                    ? 'bg-amber-950 text-amber-300 border-amber-500/60'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}>
                  {currentTarget.status}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              {/* Scan Log ID with interactive selector */}
              <div className="flex justify-between items-center relative">
                <span className="text-slate-400">Scan Log ID</span>
                <div className="relative">
                  <button
                    onClick={() => setShowIdDropdown(!showIdDropdown)}
                    className="flex items-center gap-1.5 font-mono text-slate-200 font-bold bg-[#061426] hover:bg-[#0c2340] px-2 py-0.5 rounded border border-[#183a63] transition-colors cursor-pointer text-[11px]"
                  >
                    <Sliders className="w-3 h-3 text-sky-400" />
                    <span>{activeItem.id}</span>
                  </button>

                  {/* Dropdown to switch targets/scenarios */}
                  {showIdDropdown && (
                    <div className="absolute right-0 top-7 w-48 bg-[#0a182d] border border-sky-500/50 rounded-lg shadow-2xl p-1 z-30 space-y-1">
                      {scenarios.map((sc, idx) => (
                        <button
                          key={sc.id}
                          onClick={() => {
                            setActiveScenarioIndex(idx);
                            setShowIdDropdown(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between cursor-pointer ${
                            idx === activeScenarioIndex
                              ? 'bg-blue-600 text-white font-bold'
                              : 'text-slate-300 hover:bg-[#132c4e]'
                          }`}
                        >
                          <span className="font-mono">{sc.id}</span>
                          <span className="text-[10px] opacity-80">{sc.name.split('/')[0]}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Multi-Target Selector in Evidence Board */}
              {activeDetections.length > 1 && (
                <div className="flex items-center justify-between bg-[#061426] px-2.5 py-1.5 rounded-lg border border-[#142c4c] my-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span className="text-[11px] text-slate-300 font-medium">Debris Targets:</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {activeDetections.map((tgt, idx) => {
                      const colors = [
                        { active: 'bg-lime-500 text-slate-950 border-lime-400 shadow-[0_0_8px_#a3e635]', idle: 'border-lime-500/40 text-lime-300 hover:bg-lime-950/40' },
                        { active: 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_8px_#fbbf24]', idle: 'border-amber-500/40 text-amber-300 hover:bg-amber-950/40' },
                        { active: 'bg-sky-400 text-slate-950 border-sky-300 shadow-[0_0_8px_#38bdf8]', idle: 'border-sky-500/40 text-sky-300 hover:bg-sky-950/40' },
                        { active: 'bg-fuchsia-500 text-white border-fuchsia-400 shadow-[0_0_8px_#e879f9]', idle: 'border-fuchsia-500/40 text-fuchsia-300 hover:bg-fuchsia-950/40' }
                      ][idx % 4];

                      const isSelected = idx === selectedTargetIdx;

                      return (
                        <button
                          key={tgt.id || idx}
                          onClick={() => setSelectedTargetIdx(idx)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                            isSelected
                              ? `${colors.active} ring-1 ring-white/50 scale-105`
                              : `bg-[#0b1b32] ${colors.idle}`
                          }`}
                          title={`Detection #${idx + 1}`}
                        >
                          #{idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-start pt-0.5">
                <span className="text-slate-400">Detection</span>
                <span className="font-semibold text-cyan-200 text-right max-w-[170px] leading-tight">
                  Detection #{selectedTargetIdx + 1}
                </span>
              </div>

              {/* AI Confidence with mini progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">AI Confidence</span>
                  <span className="font-mono font-bold text-emerald-400">{currentTarget.confidence}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#061426] rounded-full overflow-hidden border border-[#142c4c]">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    style={{ width: `${currentTarget.confidence}%` }}
                  ></div>
                </div>
              </div>

              {/* Shadow Strength with mini progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Shadow Strength</span>
                  <span className="font-mono font-bold text-sky-400">{currentTarget.shadowStrength}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#061426] rounded-full overflow-hidden border border-[#142c4c]">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                    style={{ width: `${currentTarget.shadowStrength}%` }}
                  ></div>
                </div>
              </div>

              {/* Segmentation Quality with mini progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Segmentation Quality</span>
                  <span className="font-mono font-bold text-cyan-400">{currentTarget.segmentationQuality}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#061426] rounded-full overflow-hidden border border-[#142c4c]">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-600 to-teal-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                    style={{ width: `${currentTarget.segmentationQuality}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Seabed Similarity</span>
                <span className="font-bold text-rose-400">{currentTarget.seabedSimilarity}</span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-slate-400">Target Dimensions</span>
                <div className="text-right font-mono text-slate-200">
                  <div>Width: {currentTarget.dimensions.width}</div>
                  <div>Height: {currentTarget.dimensions.height}</div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-0.5">
                <span className="text-slate-400">Overall Reliability</span>
                <span className="font-bold text-emerald-400">{currentTarget.reliability}</span>
              </div>

              {/* OBB / Seg Telemetry metrics */}
              {currentTarget.obb && (
                <div className="mt-1 p-2 rounded-lg bg-[#061426] border border-cyan-500/30 space-y-1 font-mono text-[11px] shadow-inner">
                  <div className="flex justify-between items-center text-cyan-300 font-bold border-b border-cyan-900/60 pb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                      YOLO11-SEG Telemetry
                    </span>
                    <span className="text-[10px] font-sans text-cyan-400 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-700/50">
                      Target #{selectedTargetIdx + 1}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Heading Angle:</span>
                    <span className="text-emerald-400 font-bold">∠ {currentTarget.obb.angle_deg}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Centroid (cx, cy):</span>
                    <span className="text-slate-200">({Math.round(currentTarget.obb.cx)}, {Math.round(currentTarget.obb.cy)}) px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Swath Bounding:</span>
                    <span className="text-slate-200">{Math.round(currentTarget.obb.width)} × {Math.round(currentTarget.obb.height)} px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Est. Target Span:</span>
                    <span className="text-sky-300 font-semibold">{currentTarget.dimensions.width} × {currentTarget.dimensions.height}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ── 3 ACTION BUTTONS (CONFIRM / REJECT / MARK UNKNOWN) ── */}
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              {/* Confirm (Green) */}
              <button
                onClick={handleConfirm}
                className={`py-1.5 px-1 rounded-lg text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer ${
                  currentTarget.status === 'Confirmed'
                    ? 'bg-emerald-600 ring-2 ring-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.5)]'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 border border-emerald-400/40'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Confirm</span>
              </button>

              {/* Reject (Coral Red) */}
              <button
                onClick={handleReject}
                className={`py-1.5 px-1 rounded-lg text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer ${
                  currentTarget.status === 'Rejected'
                    ? 'bg-rose-700 ring-2 ring-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                    : 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 border border-rose-400/40'
                }`}
              >
                <X className="w-3.5 h-3.5 stroke-[3]" />
                <span>Reject</span>
              </button>

              {/* Mark Unknown (Orange/Amber) */}
              <button
                onClick={handleMarkUnknown}
                className={`py-1.5 px-1 rounded-lg text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer ${
                  currentTarget.status === 'Unknown'
                    ? 'bg-amber-600 ring-2 ring-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 border border-amber-400/40'
                }`}
              >
                <HelpCircle className="w-3 h-3 stroke-[2.5]" />
                <span className="text-[11px]">Unknown</span>
              </button>
            </div>
          </div>

          {/* Card: GIS Mini-Map */}
          <div className="bg-gradient-to-b from-[#0d223f] to-[#0a1b32] border border-[#18365d] rounded-xl p-3 flex flex-col gap-1.5 shadow-lg">
            <div className="flex items-center justify-between pb-1 border-b border-[#142845]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200">GIS Mini-Map</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                  Live Telemetry
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] font-mono text-slate-300">WGS84</span>
              </div>
            </div>

            {/* Tactical Interactive Map */}
            <GisMiniMap
              currentTarget={currentTarget}
              allTargets={activeDetections}
              selectedTargetIdx={selectedTargetIdx}
              onSelectTarget={(idx) => setSelectedTargetIdx(idx)}
            />
          </div>

          {/* Card: Reporting */}
          <div className="bg-gradient-to-b from-[#0d223f] to-[#0a1b32] border border-[#18365d] rounded-xl p-3 flex flex-col gap-2 shadow-lg">
            <div className="flex items-center justify-between pb-1 border-b border-[#142845]">
              <span className="text-xs font-bold text-slate-200">Export Hydrographic Report</span>
              <Download className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* JSON export button */}
              <button
                onClick={() => handleExport('JSON')}
                className="flex items-center justify-between bg-[#061426] hover:bg-[#0c2340] border border-[#183a63] rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-200 transition-all cursor-pointer group"
              >
                <span className="font-mono">JSON</span>
                <div className="w-14 h-2 bg-[#081527] rounded-full overflow-hidden border border-[#142d4f]">
                  <div
                    className={`h-full bg-sky-400 rounded-full transition-all duration-500 ${
                      exporting === 'JSON' ? 'w-full animate-pulse' : 'w-4/5'
                    }`}
                  ></div>
                </div>
              </button>

              {/* CSV export button */}
              <button
                onClick={() => handleExport('CSV')}
                className="flex items-center justify-between bg-[#061426] hover:bg-[#0c2340] border border-[#183a63] rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-200 transition-all cursor-pointer group"
              >
                <span className="font-mono">CSV</span>
                <div className="w-14 h-2 bg-[#081527] rounded-full overflow-hidden border border-[#142d4f]">
                  <div
                    className={`h-full bg-sky-400 rounded-full transition-all duration-500 ${
                      exporting === 'CSV' ? 'w-full animate-pulse' : 'w-4/5'
                    }`}
                  ></div>
                </div>
              </button>
            </div>
          </div>
        </section>
        )}

        {/* Floating Right Panel Expand Tab when collapsed */}
        {!showRightPanel && (
          <button
            onClick={() => setShowRightPanel(true)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 px-1.5 py-3 rounded-l-lg bg-[#09182d]/90 backdrop-blur-md border border-cyan-500/40 hover:border-cyan-400 hover:bg-[#0f2a47] text-cyan-400 hover:text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)] flex flex-col items-center gap-1.5 cursor-pointer group transition-all"
            title="Expand Evidence & GIS Container"
          >
            <PanelRightOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-mono font-bold tracking-widest uppercase [writing-mode:vertical-lr] text-slate-400 group-hover:text-cyan-300">
              Evidence &amp; GIS
            </span>
          </button>
        )}
      </div>

      {/* ── INTERACTIVE NOTIFICATION TOAST ────────────────────────────────────── */}
      {feedbackToast && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-2.5 rounded-xl border shadow-2xl flex items-center gap-2.5 text-xs font-medium ${
            feedbackToast.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200'
              : feedbackToast.type === 'error'
              ? 'bg-rose-950/95 border-rose-500 text-rose-200'
              : 'bg-amber-950/95 border-amber-500 text-amber-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{feedbackToast.msg}</span>
        </div>
      )}

      {/* ── SIH26057 DATASET & TRAINING ARCHITECTURE MODAL ─────────────────────────── */}
      <DatasetModal
        isOpen={showDatasetModal}
        onClose={() => setShowDatasetModal(false)}
      />
    </div>
  );
}
