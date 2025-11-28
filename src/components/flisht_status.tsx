// import React, { useState, useEffect, Component, ErrorInfo } from 'react';
// import { useAuth } from '@/contexts/AuthContext';
// import { Button } from '@/components/ui/button';
// import {
//  Card,
//  CardContent,
//  CardHeader,
//  CardTitle,
//  CardDescription,
// } from '@/components/ui/card';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Shield, LogOut, Users, Plane, MapPin, Map, X, RefreshCw, Filter, Clock, User } from 'lucide-react';
// import { Badge } from '@/components/ui/badge';
// import { toast } from 'sonner';
// import { apiService } from '@/services/api';
// import { Pie } from 'react-chartjs-2';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
// import profileImg from '@/assets/logo.png';
// import CesiumMap, { Waypoint as CesiumWaypoint } from './CesiumMap';

// ChartJS.register(ArcElement, Tooltip, Legend, Title);

// const COMMAND_CENTERS = {
//  'EASTERN COMMAND': { name: 'EASTERN COMMAND', lat: 33.7738, lng: 76.5762, shortName: 'EC' },
//  'WESTERN COMMAND': { name: 'WESTERN COMMAND', lat: 32.7266, lng: 74.8570, shortName: 'WC' },
//  'SOUTHERN COMMAND': { name: 'SOUTHERN COMMAND', lat: 18.5204, lng: 73.8567, shortName: 'SC' },
//  'NORTHERN COMMAND': { name: 'NORTHERN COMMAND', lat: 34.0837, lng: 74.7973, shortName: 'NC' },
//  'SOUTH WESTERN COMMAND': { name: 'SOUTH WESTERN COMMAND', lat: 26.9124, lng: 75.7873, shortName: 'SWC' },
//  'CENTRAL COMMAND': { name: 'CENTRAL COMMAND', lat: 23.1815, lng: 79.9864, shortName: 'CC' },
// };

// interface User {
//  id: string;
//  username: string;
//  role: 'ADMINISTRATOR' | 'CONTROLLER' | 'OPERATOR';
//  command: string;
//  commandName: string;
//  division: string;
//  divisionName: string;
//  brigade: string;
//  brigadeName: string;
//  corps: string;
//  corpsName: string;
//  unit?: string;
//  operatorCategory: string;
//  operatorCategoryName: string;
//  createdAt: string;
// }

// interface DroneSpec {
//  id: string;
//  user_id: string;
//  droneName: string;
//  commandName: string;
// }

// interface Flight {
//  id: string;
//  user_id: string;
//  drone_model: string;
//  drone_class: string;
//  frequency: number;
//  clockDrift: number;
//  spectralLeakage: number;
//  modularshapeId: number;
//  command_name: string;
//  purpose: string;
//  start: string;
//  end: string;
//  status: 'planned' | 'active' | 'completed';
//  cancel_requested: boolean;
// }

// interface Waypoint {
//  id: string;
//  flight_id: string;
//  lat: string;
//  lng: string;
//  elev: number;
// }

// // Hierarchy Data (from registration code)
// interface Corps {
//  name: string;
//  corps: string[];
// }

// interface Brigade {
//  name: string;
//  brigades: { [key: string]: Corps };
// }

// interface Division {
//  name: string;
//  brigades: { [key: string]: Corps };
// }

// interface Command {
//  divisions: { [key: string]: Division };
// }

// interface HierarchyData {
//  [key: string]: Command;
// }

// const hierarchyData: HierarchyData = {
//  sc: { // Southern Command
//    divisions: {
//      ar: {
//        name: "HQ 12 CORPS",
//        brigades: {
//          bde1: { name: "HQ JOSA", corps: [] },
//          bde2: { name: "11 RAPID", corps: ["cor4", "cor5", "cor6","cor7","cor8",] },
//          bde3: { name: "12 RAPID", corps: ["cor9","cor10", "cor11", "cor12","cor13","cor14","cor15","cor16","cor17","cor18",] },
//        }
//      },
//      cr: {
//       name: "HQ 21 CORPS",
//       brigades: {
//         bde1: { name: "31 ARMD DIV", corps: ["cor21", "cor22", "cor23","cor24"] },
//         bde2: { name: "36 RAPID", corps: ["cor25", "cor26", "cor27","cor28"] },
//         bde3: { name: "41 ARTY DIV", corps: ["cor29", "cor30", "cor31"] },
//         bde4: { name: "54 INF DIV", corps: ["cor32", "cor33", "cor34","cor35","cor159","cor160","cor161"] }
//       }
//     },
//     dr: {
//       name: "HQ DB AREA",
//       brigades: {
//         bde1: { name: "", corps: [] },
//         bde2: { name: "", corps: [] },
//       }
//     },
//      br: {
//        name: "HQ MG&G AREA",
//        brigades: {
//          bde3: { name: "", corps: [] },
//          bde4: { name: "", corps: [] },
//          bde5: { name: "", corps: [] },
//          bde6: { name: "", corps: [] },
//          bde7: { name: "", corps: [] },
//          bde8: { name: "", corps: [] },
//        }
//      }
//    }
//  },

//  ec: { // Eastern Command
//    divisions: {
//      ar: {
//        name: "3 CORPS",
//        brigades: {
//          bde1: { name: "2 MNT DIV", corps: ["cor36", "cor37", "cor38","cor39"] },
//          bde2: { name: "56 INF DIV", corps: ["cor40", "cor41", "cor42","cor43"] },
//          bde3: { name: "57 MNT DIV", corps: ["cor44", "cor45", "cor46","cor47",] },
//        }
//      },
//      br: {
//       name: "4 CORPS",
//       brigades: {
//         bde1: { name: "5 MNT DIV", corps: ["cor48", "cor49", "cor50","cor51","cor52"] },
//         bde2: { name: "21 MTN DIV", corps: [] },
//         bde3: { name: "71 INF DIV", corps: ["cor53", "cor54", "cor55","cor56","cor57",] },
//       }
//     },
//      cr: {
//       name: "33 CORPS",
//       brigades: {
//         bde1: { name: "17 MTN DIV", corps: ["cor58", "cor59", "cor60","cor61","cor62",] },
//         bde2: { name: "20 MTN DIV", corps: ["cor63", "cor64", "cor65","cor66",] },
//         bde2: { name: "27 MTN DIV", corps: [] },
//         bde4: { name: "HQ 111 SUB AREA", corps: [] },
//       }
//     }, 
//     dr: {
//       name: "17 CORPS",
//       brigades: {
//         bde1: { name: "59 INF DIV", corps: ["cor67", "cor68", "cor69","cor70",] },
//         bde2: { name: "23 INF DIV", corps: ["cor71", "cor72", "cor73","cor74","cor75","cor76",] }
//       }
//     },
//     er: {
//       name: "101 AREA",
//       brigades: {
//         bde1: { name: "101 AREA SIG", corps: [] },
//         bde2: { name: "101 AREA PRO", corps: [] },
//         bde3: { name: "MH SHILLONG", corps: [] },
//         bde4: { name: "39 COY ASC", corps: [] },
//       }
//     },
//     fr: {
//       name: "BENGAL SUB AREA",
//       brigades: {
//         bde1: { name: "BDE 1", corps: [] },
//         bde2: { name: "BDE 2", corps: [] }
//       }
//     },
//     qr: {
//       name: "618(I) AD BDE",
//       brigades: {
//         bde1: { name: "BDE 1", corps: [] },
//         bde2: { name: "BDE 2", corps: [] }
//       }
//     },
//     Gr: {
//       name: "375 CAB",
//       brigades: {
//         bde1: { name: "BDE 1", corps: [] },
//         bde2: { name: "BDE 2", corps: [] }
//       }
//     },
//    }
//  },

//  wc: { // Western Command
//    divisions: {
//      ar: {
//        name: "HQ 2 CORPS",
//        brigades: {
//          bde1: { name: "HQ 1 ARMD DIV", corps: [] },
//          bde2: { name: "HQ 9 INF DIV ", corps: ["cor77", "cor78", "cor79","cor80"] },
//          bde3: { name: "HQ 22 RAPID DIV(S)", corps: ["cor81", "cor82", "cor83", "cor84","cor1111"] },
//          bde4: { name: "HQ 40 ARTY DIV", corps: ["cor85", "cor86", "cor87"] },
//          bde5: { name: "474 ENGNR BDE", corps: [] },
//          bde6: { name: "785 (I) AD BDE", corps: [] },
//          bde7: { name: "HQ 16(I) ARMD BDE", corps: [] },
//        }
//      },
//      br: {
//       name: "HQ 9 CORPS",
//       brigades: {
//         bde1: { name: "26 INF DIV", corps: ["cor88", "cor89", "cor90","cor91","cor92",] },
//         bde2: { name: "29 INF DIV ", corps: ["cor93", "cor94", "cor95","cor96","cor97",] },
//         bde3: { name: "21 SUB AREA", corps: [] },
//         bde4: { name: "2(I) ARMD BDE ", corps: [] },
//         bde5: { name: "3(I) ARMD BDE", corps: [] },
//         bde6: { name: "84 INF BDE", corps: [] },
//         bde7: { name: "401 ARTY BDE", corps: [] },
//         bde8: { name: "616 (I) AD BDE", corps: [] },
//       }
//     },
//     cr: {
//       name: "HQ 11 CORPS",
//       brigades: {
//         bde1: { name: "7 INF DIV ", corps: ["cor99", "cor100","cor101","cor102","cor103"] },
//         bde2: { name: "15 INF DIV", corps: [] },
//         bde3: { name: "55(I) MECH BDE", corps: [] },
//         bde4: { name: "23(I) ARMD BDE", corps: [] },
//         bde5: { name: "715(I) AD BDE", corps: [] },
//       }
//     },
//     dr: {
//       name: "HQ DELHI AREA",
//       brigades: {
//         bde1: { name: "", corps: [] },
//         bde2: { name: "", corps: [] }
//       }
//     },
//    }
//  },

//  nc: { // Northern Command
//    divisions: {
//      ar: {
//        name: "1 CORPS",
//        brigades: {
//          bde1: { name: "4 INF DI", corps: ["cor104","cor105","cor106","cor107",] },
//          bde2: { name: "6 INF DIV", corps: ["cor108","cor109","cor110","cor111",] },
//          bde3: { name: "42 ARTY DIV", corps: ["cor112","cor113","cor114",] },
//        }
//      },
//      br: {
//       name: "14 CORPS",
//       brigades: {
//         bde1: { name: "3 INF DIV ", corps: ["cor115","cor116","cor117",] },
//         bde2: { name: "8 MTN DIV", corps: ["cor118","cor119","cor120","cor121",] },
//         bde3: { name: "UNIFORM FORCE", corps: ["cor122",] },
//         bde4: { name: "HQ 72 SUB AREA", corps: [] },
//         bde5: { name: "614(I) AVN BDE", corps: [] },
//         bde6: { name: "N AREA", corps: [] },
//         bde7: { name: "102(I) INF BDE", corps: [] },
//         bde8: { name: "118 (I) INF BDE", corps: [] },   
//       }
//     },
//     cr: {
//       name: "15 CORPS",
//       brigades: {
//         bde1: { name: "19 INF DIV", corps: ["cor123","cor124","cor125","cor126","cor127",] },
//         bde2: { name: "26 INF DIV", corps: ["cor128","cor129","cor130","cor131","cor132","cor133",] },
//         bde3: { name: "CIF (K)", corps: [] },
//         bde4: { name: "CIF (V)", corps: [] },
//         bde5: { name: "619 (I) AD BDE", corps: [] },
//       }
//     },
//     dr: {
//       name: "16 CORPS",
//       brigades: {
//         bde1: { name: "10 RAPID", corps: ["cor134","cor135","cor136","cor137","cor138",] },
//         bde2: { name: "25 INF DIV", corps: ["cor139","cor140","cor141","cor142","cor143",] },
//         bde3: { name: "CI FORCE (D)", corps: [] },
//         bde4: { name: "CI FORCE (R)", corps: [] },
//         bde5: { name: "163 INF BDE", corps: [] },
//       }
//     },
//    }
//  },

//  swc: { // South Western Command
//    divisions: {
//      ar: {
//        name: "10 CORPS",
//        brigades: {
//          bde1: { name: "16 RAPID", corps: ["cor144","cor145","cor146","cor147","cor148",] },
//          bde2: { name: "18 INF DIV", corps: ["cor149","cor150","cor151","cor152","cor153",] },
//          bde3: { name: "24 RAPID", corps: ["cor154","cor155","cor156","cor157","cor158",] },
//          bde4: { name: "10 CAB", corps: [] },
//          bde5: { name: "615 (I) AD BDE", corps: [] },
//          bde6: { name: "6 (I) ARMD BDE", corps: [] },
//        }
//      },
//    }
//  },

//  anc: { // Central Command
//    divisions: {
//      ar: {
//        name: "HQ 14 INF DIV ",
//        brigades: {
//          bde1: { name: "14 ARTY BDE", corps: [] },
//          bde2: { name: "71 MTN BDE", corps: [] },
//          bde3: { name: "95 INF BDE", corps: [] },
//          bde4: { name: "116 INF BDE", corps: [] },
//        }
//      },
//      br: {
//       name: "HQ MB AREA ",
//       brigades: {
//         bde1: { name: "", corps: [""] },
//         bde2: { name: "", corps: [""] }
//       }
//     },
//     cr: {
//       name: "HQ UB AREA ",
//       brigades: {
//         bde1: { name: "", corps: [""] },
//         bde2: { name: "", corps: [""] }
//       }
//     },
//     dr: {
//       name: "HQ MUPSA",
//       brigades: {
//         bde1: { name: "", corps: [""] },
//         bde2: { name: "", corps: [""] }
//       }
//     },
//      fr: {
//        name: "HQ 50 (I) PARA BDE",
//        brigades: {
//          bde3: { name: "", corps: [""] },
//          bde4: { name: "", corps: [""] },
//        }
//      }
//    }
//  }
// };

// // Corps names (from registration)
// const corpsNames = {
//  cor4: "85 INF BDE", cor5: "31 INF BDE",
//  cor6: "110 ARMD BDE", cor7: "330 INF BDE", cor8: "11 ARTY BDE", cor9: "12 ARTY BDE", cor10: "20 INF BDE",
//  cor11: "30 INF BDE", cor12: "45 INF BDE", cor13: "140 ARMD BDE", cor14: "4(I) ARMD BDE", cor15: "75 (I) INF BDE",
//  cor16: "340 (I) BDE", cor17: "769 (I) MECH BDE", cor18: "12 CAB",
//  cor19: "COR 19", cor20: "COR 20", cor21: "27 ARMD BDE", cor22: "34 ARMD BDE", cor23: "94 ARMD BDE",
//  cor24: "31 ARTY BDE", cor25: "18 ARMD BDE", cor26: "72 INF BDE", cor27: "115 INF BDE", cor28: "36 ARTY BDE",
//  cor29: "97 ARTY BDE", cor30: "98 ARTY BDE", cor31: "374 COMP ARTY BDE", cor32: "47 INF BDE", cor33: "54 ARTY BDE",
//  cor34: "76 INF BDE", cor35: "91 INF BDE", cor36: "2 ARTY BDE",cor37: "82 MTN BDE",cor38: "117 MTN BDE",cor39: "181 MTN BDE",
//  cor40: "5 INF BDE", cor41: "22 INF BDE", cor42: "56 ARTY BDE", cor43: "103 INF BDE", cor44: "44 MTN BDE",
//  cor45: "57 MTN ARTY BDE", cor46: "59 MTN BDE", cor47: "73 MTN BDE", cor48: "311 MTN BDE", cor49: "351 INF BDE",
//  cor50: "77 MTN BDE", cor51: "5 MTN ARTY BDE",
//  cor52: "190 MTN BDE", cor53:"40 MTN BDE" ,cor54: "46 INF BDE",cor55: "106 INF BDE",cor56: "71 ARTY BDE",cor57: "604(I) AVN BDE",
//  cor58: "63 MTN BDE",cor59: "64 MTN BDE",
//  cor60: "164 MTN BDE", cor61: "166 MTN BDE", cor62: "17 MTN ARTY BDE", cor63: "20 MTN ARTY BDE", cor64: "66 MTN BDE",
//  cor65: "165 MTN BDE", cor66: "202 MTN BDE", cor67: "59 ARTY BDE", cor68: "122 INF BDE", cor69: "124 INF BDE",
//  cor70: "131 INF BDE", cor71: "61 INF BDE", cor72: "167 INF BDE",
//  cor73: "23 ARTY BDE", cor74: "417 ENGNR BDE", cor75: "17 CORPS ARTY BDE", cor76: "788(I) AD BDE", cor77: "9 ARTY BDE",
//  cor78: "32 INF BDE", cor79: "38 INF BDE", cor80: "42 INF BDE", cor81: "35 INF BDE", cor82: "49 INF BDE",
//  cor83: "60 INF BDE", cor84: "58 ARMD BDE", cor85: "261 ARTY BDE", cor86: "371 CAB", cor87: "372 ARTY BDE",
//  cor88: "26 ARTY BDE", cor89: "19 INF BDE", cor90: "162 INF BDE",
//  cor91: "92 INF BDE", cor92: "36 INF BDE", cor93: "168 INF BDE", cor94: "29 ARTY BDE", cor95: "51 INF BDE",
//  cor96: "78 INF BDE", cor97: "19 INF BDE",  cor99: "SARVATRA BDE", cor100: "AGNIVAAN BDE",cor101:"37 INF BDE",
//  cor102: "SEHJRA BDE",cor103: "BAKRI BDE",cor104: "4 ARTY BDE",cor105: "7 INF BDE",cor106: "41 INF BDE",cor107:"146 INF BDE",cor108:"6 MTN BDE",
//  cor109:"69 MTN BDE",cor110:"99 MTN BDE",cor111:"135 IND BDE",cor112:"72 ARTY BDE",cor113:"99 ARTY BDE",cor114:"373 ARTY BDE",cor115:"81 INF BDE",
//  cor116:"4 SECTOR",cor117:"3 ARTY BDE",cor118:"56 MTN BDE",cor119:"121 (I) INF BDE GP",cor120:"192 MTN BDE",cor121:"8 MTN BDE",cor122:"15 SECT RR",
//  cor123:"17 INF BDE",cor124:"12 INF BDE",cor125:"161 INF BDE",cor126:"19 ARTY BDE",cor127:"79 MTN BDE",cor128:"104 INF BDE",
//  cor129:"268 INF BDE",cor130:"53 INF BDE",cor131:"109 INF BDE",cor132:"68 MTN BDE",cor133:"28 ARTY BDE",cor134:"10 ARTY BDE",cor135:"28 INF BDE",
//  cor136:"52 INF BDE ",cor137:"191 INF BDE",cor138:"130 ARMD BDE",cor139:"93 INF BDE",cor140:"10 INF BDE",cor141:"120 INF BDE",cor142:"80 INF BDE",
//  cor143:"25 ARTY BDE",cor144:"15 INF BDE",cor145:"67 INF BDE",cor146:"89 INF BDE",cor147:"16 ARTY BDE",cor148:"62 ARMD BDE",cor149:"18 ARTY BDE",
//  cor150:"74 INF BDE",cor151:"150 ARMD BDE",cor152:"322 INF BDE",cor153:"83 INF BDE",cor154:"8 INF BDE",cor155:"24 ARTY BDE",
//  cor156:"25 INF BDE",cor157:"170 INF BDE",cor158:"180 ARMD BDE",cor159:"475 ENGR BDE",cor160:"787 (I) AD BDE",cor161:"HQ 617 (I) AD BDE",cor162:"",cor163:"",
//  cor1111: "22 ARTY BDE",
// };

// // Command names mapping (from registration)
// const commandNames = {
//  ec: "Eastern Command",
//  wc: "Western Command",
//  sc: "Southern Command",
//  nc: "Northern Command",
//  swc: "South Western Command",
//  anc: "Central Command"
// };

// // Error Boundary
// class MonitoringErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
//  state = { hasError: false };

//  static getDerivedStateFromError(error: Error) {
//    return { hasError: true };
//  }

//  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
//    console.error('Error in Monitoring component:', error, errorInfo);
//    toast.error('An error occurred in the Monitoring dashboard. Please try refreshing.');
//  }

//  render() {
//    if (this.state.hasError) {
//      return (
//        <div className="text-center py-12">
//          <p className="text-red-600 text-lg font-semibold">Something went wrong.</p>
//          <p className="text-gray-600">Please try refreshing the page or contact support.</p>
//          <Button
//            variant="outline"
//            onClick={() => window.location.reload()}
//            className="mt-4 border-blue-300 text-blue-600 hover:bg-blue-50"
//          >
//            <RefreshCw className="w-4 h-4 mr-2" />
//            Refresh Page
//          </Button>
//        </div>
//      );
//    }
//    return this.props.children;
//  }
// }

// const Monitoring: React.FC = () => {
//  const { user, logout } = useAuth() as { user: User | null; logout: () => void };
//  const [selectedCommandKey, setSelectedCommandKey] = useState<string>('all');
//  const [selectedDivision, setSelectedDivision] = useState<string>('');
//  const [selectedBrigade, setSelectedBrigade] = useState<string>('');
//  const [selectedCorps, setSelectedCorps] = useState<string>('');
//  const [users, setUsers] = useState<User[]>([]);
//  const [droneSpecs, setDroneSpecs] = useState<DroneSpec[]>([]);
//  const [allFlights, setAllFlights] = useState<Flight[]>([]);
//  const [waypoints, setWaypoints] = useState<Record<string, Waypoint[]>>({});
//  const [mapModalOpen, setMapModalOpen] = useState(false);
//  const [selectedFlightWaypoints, setSelectedFlightWaypoints] = useState<Waypoint[]>([]);
//  const [selectedFlightDetails, setSelectedFlightDetails] = useState<Flight | null>(null);
//  const [selectedFlightUser, setSelectedFlightUser] = useState<User | null>(null);
//  const [loading, setLoading] = useState(true);
//  const [selectedStatus, setSelectedStatus] = useState<string>('all');
//  const [statusFilter, setStatusFilter] = useState<string>('all');
//  const [currentPage, setCurrentPage] = useState(1);
//  const [flightsPerPage] = useState(10);

//  const loadData = async () => {
//    try {
//      setLoading(true);
//      const [usersData, droneSpecsData, flightsData] = await Promise.all([
//        apiService.getAllUsers().catch(() => []),
//        apiService.getAllDroneSpecs().catch(() => []),
//        apiService.getAllFlights().catch(() => []),
//      ]);

//      const now = new Date();
//      const updatedFlights = (flightsData || []).map((f: Flight) => {
//        const start = new Date(f.start);
//        const end = new Date(f.end);
//        let status = f.status;
//        if (status === 'planned' && !isNaN(start.getTime()) && start <= now && end > now) {
//          status = 'active';
//        } else if (status === 'active' && !isNaN(end.getTime()) && end <= now) {
//          status = 'completed';
//        }
//        return { ...f, status };
//      });

//      setUsers(usersData || []);
//      setDroneSpecs(droneSpecsData || []);
//      setAllFlights(updatedFlights);
//    } catch (error) {
//      console.error('Failed to load data:', error);
//      toast.error('Failed to load monitoring data');
//    } finally {
//      setLoading(false);
//    }
//  };

//  useEffect(() => {
//    loadData();
//  }, []);

//  useEffect(() => {
//    const checkMissionStatus = async () => {
//      const now = new Date();
//      let hasChanges = false;

//      const updatedFlights = await Promise.all(
//        allFlights.map(async (flight) => {
//          const start = new Date(flight.start);
//          const end = new Date(flight.end);
//          let newStatus = flight.status;

//          if (flight.status === 'planned' && !isNaN(start.getTime()) && start <= now && end > now) {
//            newStatus = 'active';
//          } else if (flight.status === 'active' && !isNaN(end.getTime()) && end <= now) {
//            newStatus = 'completed';
//          }

//          if (newStatus !== flight.status) {
//            try {
//              const result = await apiService.updateFlight(flight.id, { ...flight, status: newStatus });
//              if (result.success) {
//                hasChanges = true;
//                return { ...flight, status: newStatus };
//              }
//            } catch (error) {
//              console.error(`Failed to update flight ${flight.id} to ${newStatus}:`, error);
//            }
//          }
//          return flight;
//        })
//      );

//      if (hasChanges) {
//        setAllFlights(updatedFlights);
//        toast.info('Flight statuses updated');
//      }
//    };

//    const interval = setInterval(checkMissionStatus, 30000);
//    checkMissionStatus();

//    return () => clearInterval(interval);
//  }, [allFlights]);

//  // Filter data based on hierarchy
//  const filteredUsers = users.filter(u => {
//    if (selectedCommandKey !== 'all' && u.command !== selectedCommandKey) return false;
//    if (selectedDivision && u.division !== selectedDivision) return false;
//    if (selectedBrigade && u.brigade !== selectedBrigade) return false;
//    if (selectedCorps && u.corps !== selectedCorps) return false;
//    return true;
//  });

//  const filteredDroneSpecs = droneSpecs.filter(d => {
//    const user = users.find(u => u.id === d.user_id);
//    if (!user) return false;
//    if (selectedCommandKey !== 'all' && user.command !== selectedCommandKey) return false;
//    if (selectedDivision && user.division !== selectedDivision) return false;
//    if (selectedBrigade && user.brigade !== selectedBrigade) return false;
//    if (selectedCorps && user.corps !== selectedCorps) return false;
//    return true;
//  });

//  const filteredFlights = allFlights.filter(f => {
//    const user = users.find(u => u.id === f.user_id);
//    if (!user) return false;
//    if (selectedCommandKey !== 'all' && user.command !== selectedCommandKey) return false;
//    if (selectedDivision && user.division !== selectedDivision) return false;
//    if (selectedBrigade && user.brigade !== selectedBrigade) return false;
//    if (selectedCorps && user.corps !== selectedCorps) return false;
//    return true;
//  });

//  // Client-side pagination
//  const indexOfLastFlight = currentPage * flightsPerPage;
//  const indexOfFirstFlight = indexOfLastFlight - flightsPerPage;
//  const currentFlights = filteredFlights
//    .filter(f => statusFilter === 'all' || f.status === statusFilter)
//    .slice(indexOfFirstFlight, indexOfLastFlight);
//  const totalFilteredFlights = filteredFlights.filter(f => statusFilter === 'all' || f.status === statusFilter).length;
//  const totalPages = Math.ceil(totalFilteredFlights / flightsPerPage);

//  const handlePageChange = (newPage: number) => {
//    if (newPage >= 1 && newPage <= totalPages) {
//      setCurrentPage(newPage);
//    }
//  };

//  const handleCommandChange = (value: string) => {
//    setSelectedCommandKey(value);
//    setSelectedDivision('');
//    setSelectedBrigade('');
//    setSelectedCorps('');
//    setSelectedStatus('all');
//    setStatusFilter('all');
//    setCurrentPage(1);
//  };

//  const handleDivisionChange = (value: string) => {
//    setSelectedDivision(value);
//    setSelectedBrigade('');
//    setSelectedCorps('');
//    setCurrentPage(1);
//  };

//  const handleBrigadeChange = (value: string) => {
//    setSelectedBrigade(value);
//    setSelectedCorps('');
//    setCurrentPage(1);
//  };

//  const handleCorpsChange = (value: string) => {
//    setSelectedCorps(value);
//    setCurrentPage(1);
//  };

//  const handleStatusFilterChange = (value: string) => {
//    setStatusFilter(value);
//    setSelectedStatus(value);
//    setCurrentPage(1);
//    toast.info(`Filtering by ${value} flights`);
//  };

//  const clearStatusSelection = () => {
//    setSelectedStatus('all');
//    setStatusFilter('all');
//    setCurrentPage(1);
//    toast.info('Showing all flights');
//  };

//  // Get available options
//  const getAvailableDivisions = () => {
//    if (selectedCommandKey !== 'all' && hierarchyData[selectedCommandKey]) {
//      return Object.entries(hierarchyData[selectedCommandKey].divisions).map(([key, value]) => ({
//        value: key,
//        label: value.name
//      })).filter(div => div.label.trim() !== '');
//    }
//    return [];
//  };

//  const getAvailableBrigades = () => {
//    if (selectedCommandKey !== 'all' && selectedDivision && hierarchyData[selectedCommandKey]?.divisions[selectedDivision]) {
//      return Object.entries(hierarchyData[selectedCommandKey].divisions[selectedDivision].brigades).map(([key, value]) => ({
//        value: key,
//        label: value.name
//      })).filter(bde => bde.label.trim() !== '');
//    }
//    return [];
//  };

//  const getAvailableCorps = () => {
//    if (selectedCommandKey !== 'all' && selectedDivision && selectedBrigade) {
//      const brigade = hierarchyData[selectedCommandKey]?.divisions[selectedDivision]?.brigades[selectedBrigade];
//      if (brigade) {
//        return brigade.corps.map(corpKey => ({
//          value: corpKey,
//          label: corpsNames[corpKey] || corpKey
//        })).filter(cor => cor.label.trim() !== '');
//      }
//    }
//    return [];
//  };

//  // Prepare statistics pie chart based on selected hierarchy
//  const prepareStatisticsPieChart = () => {
//    const stats = {
//      'Total Users': filteredUsers.length,
//      'Total Drones': filteredDroneSpecs.length,
//      'Total Flights': filteredFlights.length,
//      'Planned Flights': filteredFlights.filter(f => f.status === 'planned').length,
//      'Active Flights': filteredFlights.filter(f => f.status === 'active').length,
//      'Completed Flights': filteredFlights.filter(f => f.status === 'completed').length
//    };

//    // Filter out zero values for better visualization
//    const filteredStats = Object.entries(stats).filter(([_, value]) => value > 0);
  
//    if (filteredStats.length === 0) {
//      return { data: null, title: 'No Data Available' };
//    }

//    const labels = filteredStats.map(([label]) => label);
//    const data = filteredStats.map(([_, value]) => value);

//    const getHierarchyLevel = () => {
//      if (selectedCorps) return `Unit Level (${corpsNames[selectedCorps] || 'Selected Unit'})`;
//      if (selectedBrigade) {
//        const brigade = hierarchyData[selectedCommandKey]?.divisions[selectedDivision]?.brigades[selectedBrigade];
//        return `Brigade Level (${brigade?.name || 'Selected Brigade'})`;
//      }
//      if (selectedDivision) {
//        const division = hierarchyData[selectedCommandKey]?.divisions[selectedDivision];
//        return `Division Level (${division?.name || 'Selected Division'})`;
//      }
//      if (selectedCommandKey !== 'all') {
//        return `Command Level (${commandNames[selectedCommandKey] || 'Selected Command'})`;
//      }
//      return 'All Commands Overview';
//    };

//    return {
//      data: {
//        labels,
//        datasets: [
//          {
//            data,
//            backgroundColor: [
//              '#4F46E5', // Total Users - Indigo
//              '#059669', // Total Drones - Emerald 
//              '#DC2626', // Total Flights - Red
//              '#7C2D12', // Planned - Brown
//              '#1D4ED8', // Active - Blue
//              '#16A34A', // Completed - Green
//            ],
//            borderColor: [
//              '#4F46E5',
//              '#059669',
//              '#DC2626',
//              '#7C2D12',
//              '#1D4ED8',
//              '#16A34A',
//            ],
//            borderWidth: 2,
//          },
//        ],
//      },
//      title: `Statistics Overview - ${getHierarchyLevel()}`
//    };
//  };

//  const { data: statisticsChartData, title: statisticsChartTitle } = prepareStatisticsPieChart();

//  const openMapModal = async (flight: Flight) => {
//    try {
//      const flightWaypoints = waypoints[flight.id] || (await apiService.getFlightWaypoints(flight.id).catch(() => [])) || [];
//      const flightUser = users.find(u => u.id === flight.user_id) || null;
     
//      setSelectedFlightWaypoints(flightWaypoints);
//      setSelectedFlightDetails(flight);
//      setSelectedFlightUser(flightUser);
//      setWaypoints(prev => ({ ...prev, [flight.id]: flightWaypoints }));
//      setMapModalOpen(true);
//    } catch (error) {
//      console.error('Failed to load waypoints:', error);
//      toast.error('Failed to load flight details');
//    }
//  };

//  const transformWaypoints = (waypoints: Waypoint[]): CesiumWaypoint[] => {
//    return waypoints.map((wp, index) => ({
//      lat: parseFloat(wp.lat) || 0,
//      lng: parseFloat(wp.lng) || 0,
//      elev: wp.elev || 0,
//      sequence: index + 1,
//    }));
//  };

//  const getStatusBadgeClass = (status: string) => {
//    switch (status) {
//      case 'active': return 'bg-blue-100 text-blue-800 border-blue-300';
//      case 'planned': return 'bg-purple-100 text-purple-800 border-purple-300';
//      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
//      default: return 'bg-gray-100 text-gray-800 border-gray-300';
//    }
//  };

//  const safeDateFormat = (dateStr: string, format: 'full' | 'date' = 'full') => {
//    if (!dateStr) return 'N/A';
//    const date = new Date(dateStr);
//    if (isNaN(date.getTime())) return 'N/A';
//    return format === 'date' ? date.toLocaleDateString('en-IN') : date.toLocaleString('en-IN');
//  };

//  const calculateDuration = (startStr: string, endStr: string) => {
//    if (!startStr || !endStr) return 'N/A';
//    const start = new Date(startStr);
//    const end = new Date(endStr);
//    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'N/A';
//    return Math.round((end.getTime() - start.getTime()) / (1000 * 60)) + ' min';
//  };

//  return (
//    <MonitoringErrorBoundary>
//      <div className="flex flex-col min-h-screen bg-gray-100">
//        <div className="bg-orange-500 h-1"></div>
//        <header className="bg-white shadow-sm">
//          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
//            <div className="flex items-center gap-4">
//              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
//                <img src={profileImg} alt="Profile" />
//              </div>
//              <div>
//                <h1 className="text-lg font-bold text-gray-800"></h1>
//                <h2 className="text-lg font-bold text-gray-800">Indian Army</h2>
//                <p className="text-sm text-gray-600">Indian Army</p>
//                <p className="text-sm text-blue-600 font-medium">Central Command & Control System</p>
//              </div>
//            </div>
//            <div className="flex items-center gap-6">
//              <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
//                <div className="flex items-center gap-2 text-sm text-green-700">
//                  <Users className="h-4 w-4" />
//                  <span className="font-medium">Active Operations: {filteredFlights.filter(f => f.status === 'active').length}</span>
//                </div>
//              </div>
//              <div className="flex flex-col items-end gap-1">
//                <div className="flex items-center gap-2 text-sm text-gray-600">
//                  <Users className="h-4 w-4" />
//                  <span>Administrator: {user?.username ?? 'Unknown'}</span>
//                </div>
//                <div className="flex items-center gap-2 text-sm text-gray-600">
//                  <Shield className="h-4 h-4 text-green-600" />
//                  <span className="text-green-600">Secure Connection</span>
//                </div>
//              </div>
//              <Button
//                variant="outline"
//                onClick={logout}
//                className="border-red-300 text-red-600 hover:bg-red-50 shadow-sm"
//              >
//                <LogOut className="w-4 h-4 mr-2" />
//                LOGOUT
//              </Button>
//            </div>
//          </div>
//        </header>
//        <nav className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
//        <div className="container mx-auto px-4 flex justify-between items-center">
//          <div className="flex space-x-1">
//            <a href="/monitoring" className="py-3 px-4 text-sm hover:bg-slate-700 bg-slate-700 rounded-t-sm border-b-2 border-blue-400">
//              Command Dashboard
//            </a>
//            <a href="/" className="py-3 px-4 text-sm hover:bg-slate-700 rounded-t-sm">
//              Flight Monitoring
//            </a>
//             <a href="/registrations" className="py-3 px-4 text-sm hover:bg-slate-700 rounded-t-sm">
//              Drone Registrations
//            </a>
//            <a href="/flight_status" className="py-3 px-4 text-sm hover:bg-slate-700 rounded-t-sm">
//              Flight Status
//            </a>
//            <a href="#" className="py-3 px-4 text-sm hover:bg-slate-700 rounded-t-sm">
//              Settings
//            </a>
//          </div>
//          <div className="text-xs text-gray-300 bg-slate-700 px-3 py-1 rounded">
//            System Status: Online | Last Sync: {new Date().toLocaleTimeString('en-IN')}
//          </div>
//        </div>
//      </nav>
//        <main className="flex-1 container mx-auto p-4">
//          <div className="flex justify-between items-center mb-6">
//            <div>
           
//              <p className="text-gray-600 mt-1">Monitor and analyze all drone missions</p>
//            </div>
//            <Button
//              variant="outline"
//              onClick={loadData}
//              className="border-blue-300 text-blue-600 hover:bg-blue-50"
//              disabled={loading}
//            >
//              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
//              Refresh Data
//            </Button>
//          </div>
        
//          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
           
//          </div>

        

//          {loading ? (
//            <div className="text-center py-12">
//              <RefreshCw className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
//              <p className="text-gray-600">Loading monitoring data...</p>
//            </div>
//          ) : (
//            <Card className="border-gray-300 shadow-sm">
//              <CardHeader className="bg-gray-50">
//                <CardTitle className="text-gray-800 text-sm flex items-center space-x-2">
//                  <Plane className="w-4 h-4 text-blue-600" />
//                  <span>Flight Monitoring</span>
//                </CardTitle>
//                <CardDescription className="text-xs text-blue-600 flex items-center gap-2">
//                  View all flights and their routes
//                  {selectedStatus !== 'all' && (
//                    <Badge className={getStatusBadgeClass(selectedStatus)}>
//                      {selectedStatus.toUpperCase()}
//                    </Badge>
//                  )}
//                </CardDescription>
//              </CardHeader>
//              <CardContent className="p-4">
//                <div className="flex items-center justify-between mb-4">
//                  <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
//                    <SelectTrigger className="bg-gray-50 border-gray-300 focus:border-blue-500" style={{ width: '150px' }}>
//                      <SelectValue placeholder="Filter by status" />
//                    </SelectTrigger>
//                    <SelectContent>
//                      <SelectItem value="all">All Status</SelectItem>
//                      <SelectItem value="planned">Planned</SelectItem>
//                      <SelectItem value="active">Active</SelectItem>
//                      <SelectItem value="completed">Completed</SelectItem>
//                    </SelectContent>
//                  </Select>
//                  {selectedStatus !== 'all' && (
//                    <Button
//                      variant="outline"
//                      onClick={clearStatusSelection}
//                      className="border-orange-300 text-orange-600 hover:bg-orange-50"
//                    >
//                      <X className="w-4 h-4 mr-2" />
//                      Clear Selection
//                    </Button>
//                  )}
//                </div>
//                {currentFlights.length === 0 ? (
//                  <p className="text-gray-500 text-center">No flights available for the selected filters</p>
//                ) : (
//                  <div className="space-y-2">
//                    {currentFlights.map(flight => (
//                      <div
//                        key={flight.id}
//                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer border border-gray-200"
//                        onClick={() => openMapModal(flight)}
//                        title={`View route for ${flight.drone_model} - ${flight.purpose}`}
//                      >
//                        <div className="flex-1">
//                          <div className="flex items-center space-x-2 mb-1">
//                            <p className="text-sm font-medium text-gray-800">{flight.drone_model || 'Unknown'} - {flight.purpose || 'N/A'}</p>
//                            <Badge className={`text-xs ${getStatusBadgeClass(flight.status)}`}>
//                              {flight.status.toUpperCase()}
//                            </Badge>
//                            {flight.cancel_requested && (
//                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 text-xs">
//                                Cancel Requested
//                              </Badge>
//                            )}
//                          </div>
//                          <div className="flex items-center space-x-4 text-xs text-gray-600">
//                            <div className="flex items-center space-x-1">
//                              <MapPin className="w-4 h-4" />
//                              <span>{flight.command_name || 'Unknown'}</span>
//                            </div>
//                            <div className="flex items-center space-x-1">
//                              <Clock className="w-4 h-4" />
//                              <span>{safeDateFormat(flight.start, 'date')}</span>
//                            </div>
//                            <div className="flex items-center space-x-1">
//                              <Clock className="w-4 h-4" />
//                              <span>Duration: {calculateDuration(flight.start, flight.end)}</span>
//                            </div>
//                          </div>
//                        </div>
//                        <Map className="w-4 h-4 text-blue-600" />
//                      </div>
//                    ))}
//                  </div>
//                )}
//                {totalFilteredFlights > 0 && (
//                  <div className="flex justify-center items-center space-x-2 mt-4">
//                    <Button
//                      variant="outline"
//                      onClick={() => handlePageChange(currentPage - 1)}
//                      disabled={currentPage === 1}
//                    >
//                      Previous
//                    </Button>
//                    <span className="px-3 py-1 bg-white rounded border">
//                      {currentPage} / {totalPages}
//                    </span>
//                    <Button
//                      variant="outline"
//                      onClick={() => handlePageChange(currentPage + 1)}
//                      disabled={currentPage === totalPages}
//                    >
//                      Next
//                    </Button>
//                  </div>
//                )}
//              </CardContent>
//            </Card>
//          )}
//        </main>
//        {mapModalOpen && selectedFlightDetails && (
//          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//            <div className="bg-white rounded-lg w-11/12 h-5/6 max-w-6xl flex flex-col">
//              <div className="flex justify-between items-center p-4 border-b bg-gray-50">
//                <div className="flex-1">
//                  <div className="flex items-start justify-between">
//                    <div className="flex-1">
//                      <h2 className="text-xl font-semibold text-gray-800 mb-2">Flight Route Visualization</h2>
//                      <div className="grid grid-cols-2 gap-4 text-sm">
//                        <div>
//                          <p className="font-medium text-gray-700">Mission Details:</p>
//                          <p className="text-gray-600">{selectedFlightDetails?.drone_model || 'N/A'} - {selectedFlightDetails?.purpose || 'N/A'}</p>
//                          <p className="text-gray-600">Status:
//                            <Badge className={`ml-2 text-xs ${getStatusBadgeClass(selectedFlightDetails.status)}`}>
//                              {selectedFlightDetails.status.toUpperCase()}
//                            </Badge>
//                          </p>
//                        </div>
//                        {selectedFlightUser && (
//                          <div>
//                            <p className="font-medium text-gray-700">Operator Details:</p>
//                            <div className="flex items-center gap-2 text-gray-600">
//                              <User className="w-4 h-4" />
//                              <span>{selectedFlightUser.username}</span>
//                            </div>
//                            <p className="text-gray-600">{selectedFlightUser.commandName}</p>
//                            <p className="text-gray-600">{selectedFlightUser.unit || selectedFlightUser.corpsName}</p>
//                          </div>
//                        )}
//                      </div>
//                    </div>
//                  </div>
//                </div>
//                <Button variant="ghost" onClick={() => setMapModalOpen(false)}>
//                  <X className="w-5 h-5" />
//                </Button>
//              </div>
//              <div className="flex-1 p-4">
//                <CesiumMap
//                  waypoints={transformWaypoints(selectedFlightWaypoints)}
//                  center={selectedFlightWaypoints.length > 0 ? {
//                    lat: parseFloat(selectedFlightWaypoints[0].lat) || 28.12000,
//                    lng: parseFloat(selectedFlightWaypoints[0].lng) || 77.900,
//                  } : { lat: 28.12000, lng: 77.900 }}
//                  zoom={10}
//                />
//                {(!selectedFlightWaypoints || selectedFlightWaypoints.length === 0) && (
//                  <div className="flex items-center justify-center h-full">
//                    <div className="text-center text-gray-500">
//                      <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
//                      <p>No waypoints available for this flight</p>
//                    </div>
//                  </div>
//                )}
//              </div>
//            </div>
//          </div>
//        )}
//        <footer className="bg-slate-900 text-white py-6 px-4 mt-auto">
//          <div className="container mx-auto">
//            <div className="flex justify-between items-center">
//              <div className="flex items-center gap-2">
//                <Plane className="h-6 w-6 text-orange-400" />
//                <div>
//                  <div className="text-sm font-semibold">Drone Management System</div>
//                  <div className="text-xs text-gray-400">Ministry of Civil Aviation, Government of India</div>
//                </div>
//              </div>
//              <div className="text-right">
//                <div className="flex items-center gap-2 text-xs text-gray-400">
//                  <Shield className="h-4 w-4" />
//                  <span>Version 2.1.0 | Build: DMS-2025</span>
//                </div>
//                <div className="text-xs text-gray-500 mt-1">
//                  © 2025 All Rights Reserved | Designed & Maintained by NIC
//                </div>
//              </div>
//            </div>
//          </div>
//        </footer>
//      </div>
//    </MonitoringErrorBoundary>
//  );
// }

// export default Monitoring;

import React, { useState, useEffect, Component, ErrorInfo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
 CardDescription,
} from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Shield, LogOut, Users, Plane, MapPin, Map, X, RefreshCw, Filter, Clock, User, Moon, Sun } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiService } from '@/services/api';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import profileImg from '@/assets/logo.png';
import CesiumMap, { Waypoint as CesiumWaypoint } from '../components/CesiumMap2';
import HeaderNav from '../components/Admin_Header&Nav/Header&Nav';
import {

  DroneSpec,
  Flight,

  HierarchyData,
  hierarchyData,
  corpsNames,
  commandNames,
  COMMAND_CENTERS,
} from '@/components/hierarchy';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

// Error Boundary
class MonitoringErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
 state = { hasError: false };

 static getDerivedStateFromError(error: Error) {
   return { hasError: true };
 }

 componentDidCatch(error: Error, errorInfo: ErrorInfo) {
   console.error('Error in Monitoring component:', error, errorInfo);
   toast.error('An error occurred in the Monitoring dashboard. Please try refreshing.');
 }

 render() {
   if (this.state.hasError) {
     return (
       <div className="text-center py-12">
         <p className="text-red-600 dark:text-red-400 text-lg font-semibold">Something went wrong.</p>
         <p className="text-gray-600 dark:text-gray-300">Please try refreshing the page or contact support.</p>
         <Button
           variant="outline"
           onClick={() => window.location.reload()}
           className="mt-4 border-blue-300 text-blue-600 dark:border-blue-500 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900"
         >
           <RefreshCw className="w-4 h-4 mr-2" />
           Refresh Page
         </Button>
       </div>
     );
   }
   return this.props.children;
 }
}

const Monitoring: React.FC = () => {
 const { user, logout } = useAuth() as { user: User | null; logout: () => void };
 const [selectedCommandKey, setSelectedCommandKey] = useState<string>('all');
 const [selectedDivision, setSelectedDivision] = useState<string>('');
 const [selectedBrigade, setSelectedBrigade] = useState<string>('');
 const [selectedCorps, setSelectedCorps] = useState<string>('');
 const [users, setUsers] = useState<User[]>([]);
 const [droneSpecs, setDroneSpecs] = useState<DroneSpec[]>([]);
 const [allFlights, setAllFlights] = useState<Flight[]>([]);
 const [waypoints, setWaypoints] = useState<Record<string, Waypoint[]>>({});
 const [mapModalOpen, setMapModalOpen] = useState(false);
 const [selectedFlightWaypoints, setSelectedFlightWaypoints] = useState<Waypoint[]>([]);
 const [selectedFlightDetails, setSelectedFlightDetails] = useState<Flight | null>(null);
 const [selectedFlightUser, setSelectedFlightUser] = useState<User | null>(null);
 const [loading, setLoading] = useState(true);
 const [selectedStatus, setSelectedStatus] = useState<string>('all');
 const [statusFilter, setStatusFilter] = useState<string>('all');
 const [dateFilter, setDateFilter] = useState<string>('all');
 const [customStartDate, setCustomStartDate] = useState<string>('');
 const [customEndDate, setCustomEndDate] = useState<string>('');
 const [currentPage, setCurrentPage] = useState(1);
 const [flightsPerPage] = useState(10);
 const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
   const savedTheme = localStorage.getItem('theme');
   return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
 });

 const toggleDarkMode = () => {
   const newTheme = !isDarkMode ? 'dark' : 'light';
   setIsDarkMode(!isDarkMode);
   localStorage.setItem('theme', newTheme);
   if (newTheme === 'dark') {
     document.documentElement.classList.add('dark');
   } else {
     document.documentElement.classList.remove('dark');
   }
 };

 useEffect(() => {
   if (isDarkMode) {
     document.documentElement.classList.add('dark');
     localStorage.setItem('theme', 'dark');
   } else {
     document.documentElement.classList.remove('dark');
     localStorage.setItem('theme', 'light');
   }
 }, [isDarkMode]);

 const activeOperations = allFlights.filter(f => f.status === 'active').length;

 const getDateFilterRange = () => {
   const now = new Date();
   let start: Date, end: Date = now;

   switch (dateFilter) {
     case 'all':
       start = new Date(0);
       break;
     case 'today':
       start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
       break;
     case 'yesterday':
       const yesterday = new Date(now);
       yesterday.setDate(now.getDate() - 1);
       start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0);
       end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1, 0, 0, 0);
       break;
     case 'last1h':
       start = new Date(now.getTime() - 60 * 60 * 1000);
       break;
     case 'last24h':
       start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
       break;
     case 'last7d':
       start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
       break;
     case 'custom':
       start = customStartDate ? new Date(customStartDate) : new Date(0);
       end = customEndDate ? new Date(customEndDate) : now;
       break;
     default:
       start = new Date(0);
   }

   return { start, end };
 };

 const loadData = async () => {
   try {
     setLoading(true);
     const [usersData, droneSpecsData, flightsData] = await Promise.all([
       apiService.getAllUsers().catch(() => []),
       apiService.getAllDroneSpecs().catch(() => []),
       apiService.getAllFlights().catch(() => []),
     ]);

     const now = new Date();
     const updatedFlights = (flightsData || []).map((f: Flight) => {
       const start = new Date(f.start);
       const end = new Date(f.end);
       let status = f.status;
       if (status === 'planned' && !isNaN(start.getTime()) && start <= now && end > now) {
         status = 'active';
       } else if (status === 'active' && !isNaN(end.getTime()) && end <= now) {
         status = 'completed';
       }
       return { ...f, status };
     });

     setUsers(usersData || []);
     setDroneSpecs(droneSpecsData || []);
     setAllFlights(updatedFlights);
   } catch (error) {
     console.error('Failed to load data:', error);
     toast.error('Failed to load monitoring data');
   } finally {
     setLoading(false);
   }
 };

 useEffect(() => {
   loadData();
 }, []);

 useEffect(() => {
   const checkMissionStatus = async () => {
     const now = new Date();
     let hasChanges = false;

     const updatedFlights = await Promise.all(
       allFlights.map(async (flight) => {
         const start = new Date(flight.start);
         const end = new Date(flight.end);
         let newStatus = flight.status;

         if (flight.status === 'planned' && !isNaN(start.getTime()) && start <= now && end > now) {
           newStatus = 'active';
         } else if (flight.status === 'active' && !isNaN(end.getTime()) && end <= now) {
           newStatus = 'completed';
         }

         if (newStatus !== flight.status) {
           try {
             const result = await apiService.updateFlight(flight.id, { ...flight, status: newStatus });
             if (result.success) {
               hasChanges = true;
               return { ...flight, status: newStatus };
             }
           } catch (error) {
             console.error(`Failed to update flight ${flight.id} to ${newStatus}:`, error);
           }
         }
         return flight;
       })
     );

     if (hasChanges) {
       setAllFlights(updatedFlights);
       toast.info('Flight statuses updated');
     }
   };

   const interval = setInterval(checkMissionStatus, 30000);
   checkMissionStatus();

   return () => clearInterval(interval);
 }, [allFlights]);

 // Filter data based on hierarchy
 const filteredUsers = users.filter(u => {
   if (selectedCommandKey !== 'all' && u.command !== selectedCommandKey) return false;
   if (selectedDivision && u.division !== selectedDivision) return false;
   if (selectedBrigade && u.brigade !== selectedBrigade) return false;
   if (selectedCorps && u.corps !== selectedCorps) return false;
   return true;
 });

 const filteredDroneSpecs = droneSpecs.filter(d => {
   const user = users.find(u => u.id === d.user_id);
   if (!user) return false;
   if (selectedCommandKey !== 'all' && user.command !== selectedCommandKey) return false;
   if (selectedDivision && user.division !== selectedDivision) return false;
   if (selectedBrigade && user.brigade !== selectedBrigade) return false;
   if (selectedCorps && user.corps !== selectedCorps) return false;
   return true;
 });

 const filteredFlights = allFlights.filter(f => {
   const user = users.find(u => u.id === f.user_id);
   if (!user) return false;
   if (selectedCommandKey !== 'all' && user.command !== selectedCommandKey) return false;
   if (selectedDivision && user.division !== selectedDivision) return false;
   if (selectedBrigade && user.brigade !== selectedBrigade) return false;
   if (selectedCorps && u.corps !== selectedCorps) return false;

   // Date filter
   const flightStart = new Date(f.start);
   const { start: filterStart, end: filterEnd } = getDateFilterRange();
   if (isNaN(flightStart.getTime()) || flightStart < filterStart || flightStart > filterEnd) return false;

   return true;
 });

 // Client-side pagination
 const indexOfLastFlight = currentPage * flightsPerPage;
 const indexOfFirstFlight = indexOfLastFlight - flightsPerPage;
 const currentFlights = filteredFlights
   .filter(f => statusFilter === 'all' || f.status === statusFilter)
   .slice(indexOfFirstFlight, indexOfLastFlight);
 const totalFilteredFlights = filteredFlights.filter(f => statusFilter === 'all' || f.status === statusFilter).length;
 const totalPages = Math.ceil(totalFilteredFlights / flightsPerPage);

 const handlePageChange = (newPage: number) => {
   if (newPage >= 1 && newPage <= totalPages) {
     setCurrentPage(newPage);
   }
 };

 const handleCommandChange = (value: string) => {
   setSelectedCommandKey(value);
   setSelectedDivision('');
   setSelectedBrigade('');
   setSelectedCorps('');
   setSelectedStatus('all');
   setStatusFilter('all');
   setCurrentPage(1);
 };

 const handleDivisionChange = (value: string) => {
   setSelectedDivision(value);
   setSelectedBrigade('');
   setSelectedCorps('');
   setCurrentPage(1);
 };

 const handleBrigadeChange = (value: string) => {
   setSelectedBrigade(value);
   setSelectedCorps('');
   setCurrentPage(1);
 };

 const handleCorpsChange = (value: string) => {
   setSelectedCorps(value);
   setCurrentPage(1);
 };

 const handleStatusFilterChange = (value: string) => {
   setStatusFilter(value);
   setSelectedStatus(value);
   setCurrentPage(1);
   toast.info(`Filtering by ${value} flights`);
 };

 const clearStatusSelection = () => {
   setSelectedStatus('all');
   setStatusFilter('all');
   setCurrentPage(1);
   toast.info('Showing all flights');
 };

 const handleDateFilterChange = (value: string) => {
   setDateFilter(value);
   if (value !== 'custom') {
     setCustomStartDate('');
     setCustomEndDate('');
   }
   setCurrentPage(1);
   toast.info(`Filtering by ${value} period`);
 };

 const clearDateSelection = () => {
   setDateFilter('all');
   setCustomStartDate('');
   setCustomEndDate('');
   setCurrentPage(1);
   toast.info('Showing all dates');
 };

 // Get available options
 const getAvailableDivisions = () => {
   if (selectedCommandKey !== 'all' && hierarchyData[selectedCommandKey as keyof HierarchyData]) {
     return Object.entries(hierarchyData[selectedCommandKey as keyof HierarchyData].divisions).map(([key, value]) => ({
       value: key,
       label: value.name
     })).filter(div => div.label.trim() !== '');
   }
   return [];
 };

 const getAvailableBrigades = () => {
   if (selectedCommandKey !== 'all' && selectedDivision && hierarchyData[selectedCommandKey as keyof HierarchyData]?.divisions[selectedDivision]) {
     return Object.entries(hierarchyData[selectedCommandKey as keyof HierarchyData].divisions[selectedDivision].brigades).map(([key, value]) => ({
       value: key,
       label: value.name
     })).filter(bde => bde.label.trim() !== '');
   }
   return [];
 };

 const getAvailableCorps = () => {
   if (selectedCommandKey !== 'all' && selectedDivision && selectedBrigade) {
     const brigade = hierarchyData[selectedCommandKey as keyof HierarchyData]?.divisions[selectedDivision]?.brigades[selectedBrigade];
     if (brigade) {
       return brigade.corps.map(corpKey => ({
         value: corpKey,
         label: corpsNames[corpKey as keyof typeof corpsNames] || corpKey
       })).filter(cor => cor.label.trim() !== '');
     }
   }
   return [];
 };

 // Prepare statistics pie chart based on selected hierarchy
 const prepareStatisticsPieChart = () => {
   const stats = {
     'Total Users': filteredUsers.length,
     'Total Drones': filteredDroneSpecs.length,
     'Total Flights': filteredFlights.length,
     'Planned Flights': filteredFlights.filter(f => f.status === 'planned').length,
     'Active Flights': filteredFlights.filter(f => f.status === 'active').length,
     'Completed Flights': filteredFlights.filter(f => f.status === 'completed').length
   };

   // Filter out zero values for better visualization
   const filteredStats = Object.entries(stats).filter(([_, value]) => value > 0);
  
   if (filteredStats.length === 0) {
     return { data: null, title: 'No Data Available' };
   }

   const labels = filteredStats.map(([label]) => label);
   const data = filteredStats.map(([_, value]) => value);

   const getHierarchyLevel = () => {
     if (selectedCorps) return `Unit Level (${corpsNames[selectedCorps as keyof typeof corpsNames] || 'Selected Unit'})`;
     if (selectedBrigade) {
       const brigade = hierarchyData[selectedCommandKey as keyof HierarchyData]?.divisions[selectedDivision]?.brigades[selectedBrigade];
       return `Brigade Level (${brigade?.name || 'Selected Brigade'})`;
     }
     if (selectedDivision) {
       const division = hierarchyData[selectedCommandKey as keyof HierarchyData]?.divisions[selectedDivision];
       return `Division Level (${division?.name || 'Selected Division'})`;
     }
     if (selectedCommandKey !== 'all') {
       return `Command Level (${commandNames[selectedCommandKey as keyof typeof commandNames] || 'Selected Command'})`;
     }
     return 'All Commands Overview';
   };

   return {
     data: {
       labels,
       datasets: [
         {
           data,
           backgroundColor: [
             '#4F46E5', // Total Users - Indigo
             '#059669', // Total Drones - Emerald 
             '#DC2626', // Total Flights - Red
             '#7C2D12', // Planned - Brown
             '#1D4ED8', // Active - Blue
             '#16A34A', // Completed - Green
           ],
           borderColor: isDarkMode ? '#ffffff' : '#000000',
           borderWidth: 2,
         },
       ],
     },
    
   };
 };

 const { data: statisticsChartData, title: statisticsChartTitle } = prepareStatisticsPieChart();

 const openMapModal = async (flight: Flight) => {
   try {
     const flightWaypoints = waypoints[flight.id] || (await apiService.getFlightWaypoints(flight.id).catch(() => [])) || [];
     const flightUser = users.find(u => u.id === flight.user_id) || null;
     
     setSelectedFlightWaypoints(flightWaypoints);
     setSelectedFlightDetails(flight);
     setSelectedFlightUser(flightUser);
     setWaypoints(prev => ({ ...prev, [flight.id]: flightWaypoints }));
     setMapModalOpen(true);
   } catch (error) {
     console.error('Failed to load waypoints:', error);
     toast.error('Failed to load flight details');
   }
 };

 const transformWaypoints = (waypoints: Waypoint[]): CesiumWaypoint[] => {
   return waypoints.map((wp, index) => ({
     lat: parseFloat(wp.lat) || 0,
     lng: parseFloat(wp.lng) || 0,
     elev: wp.elev || 0,
     sequence: index + 1,
   }));
 };

 const getStatusBadgeClass = (status: string) => {
   switch (status) {
     case 'active': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600';
     case 'planned': return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-600';
     case 'completed': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-600';
     default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600';
   }
 };

 const safeDateFormat = (dateStr: string, format: 'full' | 'date' = 'full') => {
   if (!dateStr) return 'N/A';
   const date = new Date(dateStr);
   if (isNaN(date.getTime())) return 'N/A';
   return format === 'date' ? date.toLocaleDateString('en-IN') : date.toLocaleString('en-IN');
 };

 const calculateDuration = (startStr: string, endStr: string) => {
   if (!startStr || !endStr) return 'N/A';
   const start = new Date(startStr);
   const end = new Date(endStr);
   if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'N/A';
   return Math.round((end.getTime() - start.getTime()) / (1000 * 60)) + ' min';
 };

 return (
   <MonitoringErrorBoundary>
     <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
       <HeaderNav
         user={user}
         logout={logout}
         isDarkMode={isDarkMode}
         toggleDarkMode={toggleDarkMode}
         activeOperations={activeOperations}
       />
       <main className="flex-1 container mx-auto p-4">
         <div className="flex justify-between items-center mb-6">
           <div>
            
           </div>
           <Button
             variant="outline"
             onClick={loadData}
             className="border-blue-300 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900"
             disabled={loading}
           >
             <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
             Refresh Data
           </Button>
         </div>
        
         <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
           
         </div>

        

         {loading ? (
           <div className="text-center py-12">
             <RefreshCw className="w-8 h-8 mx-auto mb-4 text-blue-600 dark:text-blue-400 animate-spin" />
             <p className="text-gray-600 dark:text-gray-300">Loading monitoring data...</p>
           </div>
         ) : (
           <Card className="border-gray-300 dark:border-gray-600 shadow-sm">
             <CardHeader className="bg-gray-50 dark:bg-gray-700">
               <CardTitle className="text-gray-800 dark:text-gray-200 text-sm flex items-center space-x-2">
                 <Plane className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                 <span>Flight Monitoring</span>
               </CardTitle>
               <CardDescription className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
                 View all flights and their routes
                 {selectedStatus !== 'all' && (
                   <Badge className={getStatusBadgeClass(selectedStatus)}>
                     {selectedStatus.toUpperCase()}
                   </Badge>
                 )}
                 {dateFilter !== 'all' && (
                   <Badge variant="secondary" className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                     {dateFilter.toUpperCase()}
                   </Badge>
                 )}
               </CardDescription>
             </CardHeader>
             <CardContent className="p-4">
               <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                 <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                   <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400" style={{ width: '180px' }}>
                     <SelectValue placeholder="Filter by date" />
                   </SelectTrigger>
                   <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                     <SelectItem value="all">All Time</SelectItem>
                     <SelectItem value="today">Today</SelectItem>
                     <SelectItem value="yesterday">Yesterday</SelectItem>
                     <SelectItem value="last1h">Last 1 Hour</SelectItem>
                     <SelectItem value="last24h">Last 24 Hours</SelectItem>
                     <SelectItem value="last7d">Last 7 Days</SelectItem>
                     <SelectItem value="custom">Custom Range</SelectItem>
                   </SelectContent>
                 </Select>
                 {dateFilter === 'custom' && (
                   <div className="flex items-center gap-2">
                     <Input
                       type="datetime-local"
                       value={customStartDate}
                       onChange={(e) => setCustomStartDate(e.target.value)}
                       className="w-48 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                     />
                     <span className="text-gray-500 dark:text-gray-400">to</span>
                     <Input
                       type="datetime-local"
                       value={customEndDate}
                       onChange={(e) => setCustomEndDate(e.target.value)}
                       className="w-48 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                     />
                   </div>
                 )}
                 {dateFilter !== 'all' && (
                   <Button
                     variant="outline"
                     onClick={clearDateSelection}
                     className="border-orange-300 dark:border-orange-500 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900"
                   >
                     <X className="w-4 h-4 mr-2" />
                     Clear Date
                   </Button>
                 )}
               </div>
               <div className="flex items-center justify-between mb-4">
                 <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                   <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400" style={{ width: '150px' }}>
                     <SelectValue placeholder="Filter by status" />
                   </SelectTrigger>
                   <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                     <SelectItem value="all">All Status</SelectItem>
                     <SelectItem value="planned">Planned</SelectItem>
                     <SelectItem value="active">Active</SelectItem>
                     <SelectItem value="completed">Completed</SelectItem>
                   </SelectContent>
                 </Select>
                 {selectedStatus !== 'all' && (
                   <Button
                     variant="outline"
                     onClick={clearStatusSelection}
                     className="border-orange-300 dark:border-orange-500 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900"
                   >
                     <X className="w-4 h-4 mr-2" />
                     Clear Selection
                   </Button>
                 )}
               </div>
               {currentFlights.length === 0 ? (
                 <p className="text-gray-500 dark:text-gray-400 text-center">No flights available for the selected filters</p>
               ) : (
                 <div className="space-y-2">
                   {currentFlights.map(flight => (
                     <div
                       key={flight.id}
                       className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border border-gray-200 dark:border-gray-600"
                       onClick={() => openMapModal(flight)}
                       title={`View route for ${flight.drone_model} - ${flight.purpose}`}
                     >
                       <div className="flex-1">
                         <div className="flex items-center space-x-2 mb-1">
                           <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{flight.drone_model || 'Unknown'} - {flight.purpose || 'N/A'}</p>
                           <Badge className={`text-xs ${getStatusBadgeClass(flight.status)}`}>
                             {flight.status.toUpperCase()}
                           </Badge>
                           {flight.cancel_requested && (
                             <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-600 text-xs">
                               Cancel Requested
                             </Badge>
                           )}
                         </div>
                         <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                           <div className="flex items-center space-x-1">
                             <MapPin className="w-4 h-4" />
                             <span>{flight.command_name || 'Unknown'}</span>
                           </div>
                           <div className="flex items-center space-x-1">
                             <Clock className="w-4 h-4" />
                             <span>{safeDateFormat(flight.start, 'date')}</span>
                           </div>
                           <div className="flex items-center space-x-1">
                             <Clock className="w-4 h-4" />
                             <span>Duration: {calculateDuration(flight.start, flight.end)}</span>
                           </div>
                         </div>
                       </div>
                       <Map className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                     </div>
                   ))}
                 </div>
               )}
               {totalFilteredFlights > 0 && (
                 <div className="flex justify-center items-center space-x-2 mt-4">
                   <Button
                     variant="outline"
                     onClick={() => handlePageChange(currentPage - 1)}
                     disabled={currentPage === 1}
                     className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                   >
                     Previous
                   </Button>
                   <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                     {currentPage} / {totalPages}
                   </span>
                   <Button
                     variant="outline"
                     onClick={() => handlePageChange(currentPage + 1)}
                     disabled={currentPage === totalPages}
                     className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                   >
                     Next
                   </Button>
                 </div>
               )}
             </CardContent>
           </Card>
         )}
       </main>
       {mapModalOpen && selectedFlightDetails && (
         <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-75 flex items-center justify-center z-50">
           <div className="bg-white dark:bg-gray-800 rounded-lg w-11/12 h-5/6 max-w-6xl flex flex-col">
             <div className="flex justify-between items-center p-4 border-b bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
               <div className="flex-1">
                 <div className="flex items-start justify-between">
                   <div className="flex-1">
                     <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Flight Route Visualization</h2>
                     <div className="grid grid-cols-2 gap-4 text-sm">
                       <div>
                         <p className="font-medium text-gray-700 dark:text-gray-300">Mission Details:</p>
                         <p className="text-gray-600 dark:text-gray-400">{selectedFlightDetails?.drone_model || 'N/A'} - {selectedFlightDetails?.purpose || 'N/A'}</p>
                         <p className="text-gray-600 dark:text-gray-400">Status:
                           <Badge className={`ml-2 text-xs ${getStatusBadgeClass(selectedFlightDetails.status)}`}>
                             {selectedFlightDetails.status.toUpperCase()}
                           </Badge>
                         </p>
                       </div>
                       {selectedFlightUser && (
                         <div>
                           <p className="font-medium text-gray-700 dark:text-gray-300">Operator Details:</p>
                           <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                             <User className="w-4 h-4" />
                             <span>{selectedFlightUser.username}</span>
                           </div>
                           <p className="text-gray-600 dark:text-gray-400">{selectedFlightUser.commandName}</p>
                           <p className="text-gray-600 dark:text-gray-400">{selectedFlightUser.unit || selectedFlightUser.corpsName}</p>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               </div>
               <Button variant="ghost" onClick={() => setMapModalOpen(false)} className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                 <X className="w-5 h-5" />
               </Button>
             </div>
             <div className="flex-1 p-4">
               <CesiumMap
                 waypoints={transformWaypoints(selectedFlightWaypoints)}
                 center={selectedFlightWaypoints.length > 0 ? {
                   lat: parseFloat(selectedFlightWaypoints[0].lat) || 28.12000,
                   lng: parseFloat(selectedFlightWaypoints[0].lng) || 77.900,
                 } : { lat: 28.12000, lng: 77.900 }}
                 zoom={10}
               />
               {(!selectedFlightWaypoints || selectedFlightWaypoints.length === 0) && (
                 <div className="flex items-center justify-center h-full">
                   <div className="text-center text-gray-500 dark:text-gray-400">
                     <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                     <p>No waypoints available for this flight</p>
                   </div>
                 </div>
               )}
             </div>
           </div>
         </div>
       )}
       <footer className="bg-slate-900 dark:bg-slate-950 text-white py-6 px-4 mt-auto">
         <div className="container mx-auto">
           <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
               <Plane className="h-6 w-6 text-orange-400" />
               <div>
                 <div className="text-sm font-semibold">Drone Management System</div>
                 <div className="text-xs text-gray-400">Ministry of Civil Aviation, Government of India</div>
               </div>
             </div>
             <div className="text-right">
               <div className="flex items-center gap-2 text-xs text-gray-400">
                 <Shield className="h-4 w-4" />
                 <span>Version 2.1.0 | Build: DMS-2025</span>
               </div>
               <div className="text-xs text-gray-500 mt-1">
                 © 2025 All Rights Reserved | Designed & Maintained by NIC
               </div>
             </div>
           </div>
         </div>
       </footer>
     </div>
   </MonitoringErrorBoundary>
 );
};

export default Monitoring;