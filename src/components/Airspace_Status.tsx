import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dbManager, Flight, DroneSpec, User } from '@/lib/database';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
Card,
CardContent,
CardHeader,
CardTitle,
CardDescription,
} from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import CesiumMap from './CesiumMap';
import profileImg from '../assets/logo.png';
import { apiService } from '../services/api';
import FlightHistory from './flight_history';
import logo from '../assets/Logo1.png';
import {
Plane,
MapPin,
Clock,
AlertTriangle,
CheckCircle,
LogOut,
Shield,
Trash2,
ChevronLeft,
ChevronRight,
Globe,
User as UserIcon,
Settings,
Database,
Radio,
Camera,
Navigation,
Gauge,
Edit,
Save,
X
} from 'lucide-react';
import { toast } from 'sonner';


interface Waypoint {
lat: number;
lng: number;
elev: number;
sequence: number;
}


// ── ENHANCED COLLISION DETECTION UTILITIES ─────────────────────


// Calculate distance between two geographic points using Haversine formula
const calculateDistance = (lat1, lng1, lat2, lng2) => {
const R = 6371; // Earth's radius in kilometers
const dLat = (lat2 - lat1) * Math.PI / 180;
const dLng = (lng2 - lng1) * Math.PI / 180;
const a =
  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
  Math.sin(dLng / 2) * Math.sin(dLng / 2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
return R * c; // Distance in kilometers
};


// Convert kilometers to nautical miles
const kmToNauticalMiles = (km) => km * 0.539957;


// Enhanced collision detection function
const checkEnhancedCollision = async (newWaypoint, startDateTime, endDateTime, currentUserId) => {
 // Safety parameters
 const HORIZONTAL_SEPARATION_NM = 5; // Nautical miles
 const VERTICAL_SEPARATION_FT = 300; // Feet
 const TIME_BUFFER_MINUTES = 5; // Minutes buffer for time overlap

 try {
   // Get all flights from API instead of dbManager
   const allFlights = await apiService.getAllFlights();

   const newStart = new Date(startDateTime);
   const newEnd = new Date(endDateTime);

   // Add time buffer
   const bufferedStart = new Date(newStart.getTime() - TIME_BUFFER_MINUTES * 60000);
   const bufferedEnd = new Date(newEnd.getTime() + TIME_BUFFER_MINUTES * 60000);

   const conflicts = [];

   // Check against all existing flights
   for (const flight of allFlights) {
     // Skip own flights
     if (flight.user_id === currentUserId) continue;

     // Only check active/approved flights
     if (!['planned', 'active'].includes(flight.status)) continue;

     const flightStart = new Date(flight.start);
     const flightEnd = new Date(flight.end);

     // Check for time overlap (with buffer)
     const hasTimeOverlap =
       (bufferedStart <= flightEnd && bufferedEnd >= flightStart);

     if (hasTimeOverlap) {
       // Get waypoints for this flight from API
       const existingWaypoints = await apiService.getFlightWaypoints(flight.id);

       existingWaypoints.forEach(existingWp => {
         // Calculate horizontal distance
         const horizontalDistance = calculateDistance(
           newWaypoint.lat, newWaypoint.lng,
           existingWp.lat, existingWp.lng
         );
         const horizontalDistanceNM = kmToNauticalMiles(horizontalDistance);

         // Calculate vertical separation
         const verticalSeparation = Math.abs(newWaypoint.elev - existingWp.elev);

         // Check if within conflict zone
         if (horizontalDistanceNM < HORIZONTAL_SEPARATION_NM &&
           verticalSeparation < VERTICAL_SEPARATION_FT) {

           // Calculate required separation distances
           const requiredHorizontalMove = HORIZONTAL_SEPARATION_NM - horizontalDistanceNM;
           const requiredVerticalMove = VERTICAL_SEPARATION_FT - verticalSeparation;

           conflicts.push({
             conflictingFlight: flight,
             conflictingWaypoint: existingWp,
             currentDistance: {
               horizontal: horizontalDistanceNM.toFixed(2),
               vertical: verticalSeparation.toFixed(0)
             },
             requiredSeparation: {
               horizontal: requiredHorizontalMove.toFixed(2),
               vertical: requiredVerticalMove.toFixed(0)
             },
             timeOverlap: {
               start: Math.max(newStart, flightStart),
               end: Math.min(newEnd, flightEnd)
             }
           });
         }
       });
     }
   }

   return conflicts.length > 0 ? conflicts : null;
 } catch (error) {
   console.error('Error checking collisions:', error);
   return null;
 }
};


// Generate detailed collision warning message
const generateCollisionWarning = (conflicts) => {
if (!conflicts || conflicts.length === 0) return '';


const conflict = conflicts[0]; // Show first conflict for simplicity


const timeOverlapStart = conflict.timeOverlap.start.toLocaleString('en-IN', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
});


const timeOverlapEnd = conflict.timeOverlap.end.toLocaleString('en-IN', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
});


let warning = `AIRSPACE CONFLICT DETECTED\n`;
warning += `Conflicting with Flight ID: ${conflict.conflictingFlight.id}\n`;
warning += `Drone: ${conflict.conflictingFlight.drone_model}\n`;
warning += `Time Overlap: ${timeOverlapStart} - ${timeOverlapEnd}\n`;
warning += `Current Separation: ${conflict.currentDistance.horizontal} NM horizontal, ${conflict.currentDistance.vertical} ft vertical\n`;


// Provide specific guidance
if (parseFloat(conflict.requiredSeparation.horizontal) > parseFloat(conflict.requiredSeparation.vertical) / 300 * 5) {
  warning += `SOLUTION: Move waypoint ${conflict.requiredSeparation.horizontal} NM away horizontally`;
} else {
  warning += `SOLUTION: Adjust altitude by ${conflict.requiredSeparation.vertical} ft or more`;
}


if (conflicts.length > 1) {
  warning += `\n(+${conflicts.length - 1} more conflicts detected)`;
}


return warning;
};


// Suggest safe waypoint coordinates
const suggestSafeWaypoint = (originalWaypoint, conflicts) => {
if (!conflicts || conflicts.length === 0) return null;


const conflict = conflicts[0];
const requiredDistanceNM = parseFloat(conflict.requiredSeparation.horizontal) + 1; // Add 1 NM buffer
const requiredDistanceKm = requiredDistanceNM / 0.539957;


// Calculate bearing from conflicting waypoint to original waypoint
const lat1 = conflict.conflictingWaypoint.lat * Math.PI / 180;
const lat2 = originalWaypoint.lat * Math.PI / 180;
const deltaLng = (originalWaypoint.lng - conflict.conflictingWaypoint.lng) * Math.PI / 180;


const y = Math.sin(deltaLng) * Math.cos(lat2);
const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
const bearing = Math.atan2(y, x);


// Move the waypoint further in the same direction
const R = 6371; // Earth radius in km


const newLat = Math.asin(
  Math.sin(lat1) * Math.cos(requiredDistanceKm / R) +
  Math.cos(lat1) * Math.sin(requiredDistanceKm / R) * Math.cos(bearing)
);


const newLng = conflict.conflictingWaypoint.lng * Math.PI / 180 + Math.atan2(
  Math.sin(bearing) * Math.sin(requiredDistanceKm / R) * Math.cos(lat1),
  Math.cos(requiredDistanceKm / R) - Math.sin(lat1) * Math.sin(newLat)
);


return {
  lat: newLat * 180 / Math.PI,
  lng: newLng * 180 / Math.PI,
  elev: originalWaypoint.elev + parseFloat(conflict.requiredSeparation.vertical) + 50 // Add 50ft buffer
};
};


// ── COMMAND CENTER MAPPINGS ─────────────────────
const COMMAND_CENTERS = {
'ec': { name: 'EASTERN COMMAND', lat: 33.7738, lng: 76.5762 }, // Udhampur
'wc': { name: 'WESTERN COMMAND', lat: 32.7266, lng: 74.8570 }, // Jammu
'sc': { name: 'SOUTHERN COMMAND', lat: 18.5204, lng: 73.8567 }, // Pune
'nc': { name: 'NORTHERN COMMAND', lat: 34.0837, lng: 74.7973 }, // Srinagar
'swc': { name: 'SOUTH WESTERN COMMAND', lat: 26.9124, lng: 75.7873 }, // Jaipur
'anc': { name: 'CENTRAL COMMAND', lat: 23.1815, lng: 79.9864 }, // Jabalpur
};


// // ── PREDEFINED COMMAND CENTRES FOR AIRSPACE VISUALIZATION ─────────────────────
// const COMMAND_CENTRES = [
// {
//   name: '1C',
//   bounds: {
//     sw: { lat: 30.190833, lng: 72.391111 },
//     ne: { lat: 37.167778, lng: 81.288889 },
//   },
// },
// {
//   name: '2C',
//   bounds: {
//     sw: { lat: 17.981667, lng: 83.820833 },
//     ne: { lat: 29.565000, lng: 98.016111 },
//   },
// },
// {
//   name: '3C',
//   bounds: {
//     sw: { lat: 22.927500, lng: 67.546389 },
//     ne: { lat: 30.316667, lng: 77.003611 },
//   },
// },
// {
//   name: '4C',
//   bounds: {
//     sw: { lat: 19.549444, lng: 67.781944 },
//     ne: { lat: 23.037778, lng: 76.606389 },
//   },
// },
// {
//   name: '5C',
//   bounds: {
//     sw: { lat: 20.093611, lng: 76.492222 },
//     ne: { lat: 30.324167, lng: 83.858889 },
//   },
// },
// {
//   name: '6C',
//   bounds: {
//     sw: { lat: 7.424722, lng: 71.636667 },
//     ne: { lat: 20.563056, lng: 84.883889 },
//   },
// },
// ];


const Airspace = () => {
const { user: authUser, logout } = useAuth();

// ── FIXED: Add state for full user data from database ─────────────────────
const [fullUser, setFullUser] = useState<User | null>(null);

// ── Load full user data from database ─────────────────────
useEffect(() => {
  const loadFullUserData = async () => {
    if (authUser?.id) {
      try {
        await dbManager.initialize();
        const userData = await dbManager.getUserById(authUser.id);
        if (userData) {
          setFullUser(userData);
        } else {
          console.warn('User data not found in database for ID:', authUser.id);
          // Fallback to auth user data
          setFullUser(authUser as User);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        // Fallback to auth user data
        setFullUser(authUser as User);
      }
    }
  };

  loadFullUserData();
}, [authUser?.id]);

// ─── Get user's command center based on their registered command
const getUserCommandCenter = () => {
  if (!fullUser?.command) return COMMAND_CENTERS['ec']; // Default to Eastern Command
  return COMMAND_CENTERS[fullUser.command] || COMMAND_CENTERS['ec'];
};

const userCommandCenter = getUserCommandCenter();

// ─── mission-planning state
const [waypoints, setWaypoints] = useState([]);
const [selectedFlight, setSelectedFlight] = useState(null);
const [selectedDroneId, setSelectedDroneId] = useState('');
const [selectedDroneSpec, setSelectedDroneSpec] = useState<DroneSpec | null>(null);
const [mapCenter, setMapCenter] = useState({
  lat: userCommandCenter.lat,
  lng: userCommandCenter.lng
});
const [purpose, setPurpose] = useState('');

const [startDateTime, setStartDateTime] = useState('');
const [endDateTime, setEndDateTime] = useState('');
const [collisionWarning, setCollisionWarning] = useState('');
const [missionDetailsSet, setMissionDetailsSet] = useState(false);
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

// ─── user's drone specifications
const [userDroneSpecs, setUserDroneSpecs] = useState<DroneSpec[]>([]);
const [availableDroneIds, setAvailableDroneIds] = useState<{ droneId: string, specId: string, droneName: string }[]>([]);

// ─── mission objective state
const [selectedOption, setSelectedOption] = useState("");
const [customText, setCustomText] = useState("");

// ─── edit mission state
const [editingMission, setEditingMission] = useState(null);
const [editForm, setEditForm] = useState({
  drone_model: '',
  command_name: '',
  purpose: '',
  start: '',
  end: ''
});

// Load user's drone specs on component mount
useEffect(() => {
  const loadUserDroneSpecs = async () => {
    if (fullUser?.id) {
      try {
        const specs = await apiService.getUserDroneSpecs(fullUser.id);
        setUserDroneSpecs(specs);

        // Create flat list of all drone IDs for selection
        const droneIdsList = specs.flatMap(spec =>
          spec.droneIds.map(droneId => ({
            droneId: droneId,
            specId: spec.id,
            droneName: spec.droneName
          }))
        );
        setAvailableDroneIds(droneIdsList);
      } catch (error) {
        console.error('Failed to load user drone specs:', error);
        setUserDroneSpecs([]);
        setAvailableDroneIds([]);
      }
    }
  };

  loadUserDroneSpecs();
}, [fullUser?.id]);

// When drone ID is selected, load its specifications
useEffect(() => {
  if (selectedDroneId) {
    const droneInfo = availableDroneIds.find(d => d.droneId === selectedDroneId);
    if (droneInfo) {
      const spec = userDroneSpecs.find(s => s.id === droneInfo.specId);
      setSelectedDroneSpec(spec || null);
    }
  } else {
    setSelectedDroneSpec(null);
  }
}, [selectedDroneId, availableDroneIds, userDroneSpecs]);

// Update purpose when selectedOption or customText changes
useEffect(() => {
  if (selectedOption === "other") {
    setPurpose(customText);
  } else if (selectedOption) {
    setPurpose(selectedOption);
  }
}, [selectedOption, customText]);

// ─── user's flights
const [myFlights, setMyFlights] = useState([]);
const loadMyFlights = async () => {
  if (fullUser?.id) {
    try {
      const allFlights = await apiService.getAllFlights();
      const userFlights = allFlights
        .filter(f => f.user_id === fullUser?.id)
        .map(flight => {
          const now = new Date();
          const start = new Date(flight.start);
          const end = new Date(flight.end);
          let status = flight.status;
          if (status === 'planned' && start <= now && end > now) {
            status = 'active';
          } else if (status === 'active' && end <= now) {
            status = 'completed';
          }
          return { ...flight, status };
        });
      setMyFlights(userFlights);
    } catch (error) {
      console.error('Failed to load flights:', error);
      setMyFlights([]);
    }
  }
};

useEffect(() => {
  loadMyFlights();
}, [fullUser?.id]);

// ─── Auto-update mission status based on start and end times
useEffect(() => {
  const checkMissionStatus = async () => {
    if (!fullUser?.id) return;

    const now = new Date();
    let hasChanges = false;

    const updatedFlights = await Promise.all(
      myFlights.map(async (flight) => {
        const start = new Date(flight.start);
        const end = new Date(flight.end);
        let newStatus = flight.status;

        if (flight.status === 'planned' && start <= now && end > now) {
          newStatus = 'active';
        } else if (flight.status === 'active' && end <= now) {
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
      setMyFlights(updatedFlights);
      toast.info('Mission statuses updated');
    }
  };

  // Check every 30 seconds
  const interval = setInterval(checkMissionStatus, 30000);

  // Run immediately on mount
  checkMissionStatus();

  return () => clearInterval(interval);
}, [myFlights, fullUser?.id]);

// ─── handlers
const handleMissionDetailsSubmit = () => {
  // Check if purpose is set (either from dropdown or custom text)
  const finalPurpose = selectedOption === "other" ? customText : selectedOption;

  if (
    !selectedDroneId ||
    !selectedDroneSpec ||
    !finalPurpose ||
    !startDateTime ||
    !endDateTime
  ) {
    toast.error('Please fill all mission details');
    return;
  }

  const start = new Date(startDateTime),
    end = new Date(endDateTime);
  if (start >= end) {
    toast.error('End time must be after start time');
    return;
  }
  if (start < new Date()) {
    toast.error('Start time cannot be in the past');
    return;
  }

  // Update purpose with final value
  setPurpose(finalPurpose);

  setMissionDetailsSet(true);
  setCollisionWarning('');
  toast.success('Mission details set! Now click on the map to add waypoints.');
};

// ENHANCED MAP CLICK HANDLER
const handleMapClick = async (lat, lng, elev) => {
  if (!missionDetailsSet) {
   // toast.error('Please set mission details first');
    return;
  }

  const wp = {
    lat,
    lng,
    elev: Math.max(elev, 500),
    sequence: waypoints.length + 1
  };

  // Use async enhanced collision detection
  try {
    const conflicts = await checkEnhancedCollision(wp, startDateTime, endDateTime, fullUser?.id);
    const warningMessage = generateCollisionWarning(conflicts);

    setCollisionWarning(warningMessage);
    setWaypoints([...waypoints, wp]);

    if (warningMessage) {
      toast.error('Airspace conflict detected! Check details in the control panel.');
    } else {
      toast.success(`Waypoint ${wp.sequence} added successfully`);
    }
  } catch (error) {
    console.error('Error checking collision:', error);
    setWaypoints([...waypoints, wp]);
    toast.success(`Waypoint ${wp.sequence} added successfully`);
    }
  };

  // Update the handleWaypointElevationChange function
  const handleWaypointElevationChange = async (i, elev) => {
    const updated = waypoints.map((w, idx) => idx === i ? { ...w, elev } : w);
    setWaypoints(updated);

    // Check collision for the modified waypoint using API
    try {
      const conflicts = await checkEnhancedCollision(updated[i], startDateTime, endDateTime, fullUser?.id);
      const warningMessage = generateCollisionWarning(conflicts);

      setCollisionWarning(warningMessage);

      if (warningMessage) {
        toast.warning(`Conflict detected at Waypoint ${i + 1}`);
      } else {
        toast.success(`Waypoint ${i + 1} altitude updated - No conflicts`);
      }
    } catch (error) {
      console.error('Error checking collision:', error);
      toast.success(`Waypoint ${i + 1} altitude updated`);
    }
  };

  const removeWaypoint = (i) => {
    const updated = waypoints
      .filter((_, idx) => idx !== i)
      .map((w, idx) => ({ ...w, sequence: idx + 1 }));
    setWaypoints(updated);
    setCollisionWarning('');
  };

  const handleSubmitFlight = async () => {
    if (!missionDetailsSet || waypoints.length === 0) {
      toast.error('Set details & at least one waypoint');
      return;
    }
    if (collisionWarning) {
      toast.error('Cannot submit with collision');
      return;
    }
    if (!selectedDroneSpec || !fullUser) {
      toast.error('No drone specification found');
      return;
    }

    try {
      // Create flight using API
      const flightData = {
        user_id: fullUser.id,
        drone_model: selectedDroneSpec.droneName,
        drone_class: getDroneClass(selectedDroneSpec),
        command_name: userCommandCenter.name,
        frequency: selectedDroneSpec.frequency,
        clockDrift: selectedDroneSpec.clockDrift,
        spectralLeakage: selectedDroneSpec.spectralLeakage,
        modularshapeId: selectedDroneSpec.modularshapeId,
        purpose,
        start: startDateTime,
        end: endDateTime,
        status: new Date(startDateTime) <= new Date() && new Date(endDateTime) > new Date() ? 'active' : 'planned',
      };
      const result = await apiService.createFlight(flightData, waypoints);

      if (result.success) {
        toast.success('Flight plan submitted!');
        // Reset form
        setWaypoints([]);
        setSelectedDroneId('');
        setSelectedDroneSpec(null);
        setSelectedOption('');
        setCustomText('');
        setPurpose('');
        setStartDateTime('');
        setEndDateTime('');
        setMissionDetailsSet(false);
        await loadMyFlights(); // Reload flights
      } else {
        toast.error(result.message || 'Failed to submit flight plan');
      }
    } catch (error) {
      console.error('Failed to submit flight:', error);
      toast.error('Failed to submit flight plan');
    }
  };

  const resetMissionPlanning = () => {
    setWaypoints([]);
    setSelectedDroneId('');
    setSelectedDroneSpec(null);
    setSelectedOption('');
    setCustomText('');
    setPurpose('');
    setStartDateTime('');
    setEndDateTime('');
    setCollisionWarning('');
    setMissionDetailsSet(false);
    toast.info('Mission planning reset');
  };

  // AUTO-RESOLVE CONFLICT HANDLER
  const handleAutoResolveConflict = () => {
    const lastWaypoint = waypoints[waypoints.length - 1];
    const conflicts = checkEnhancedCollision(lastWaypoint, startDateTime, endDateTime, fullUser?.id, dbManager);
    const safeSuggestion = suggestSafeWaypoint(lastWaypoint, conflicts);

    if (safeSuggestion) {
      const updated = [...waypoints];
      updated[updated.length - 1] = { ...safeSuggestion, sequence: updated.length };
      setWaypoints(updated);
      setCollisionWarning('');
      toast.success('Waypoint moved to safe location');
    }
  };

  const requestCancel = async (flightId) => {
    try {
      const result = await apiService.requestCancelFlight(flightId);
      if (result.success) {
        toast.success('Cancel requested');
        await loadMyFlights(); // Reload flights
      } else {
        toast.error(result.message || 'Failed to request cancellation');
      }
    } catch (error) {
      console.error('Failed to request cancel:', error);
      toast.error('Failed to request cancellation');
    }
  };

  // ─── Enhanced Edit mission functions with validation

  // Helper function to check if a mission can be edited
  const canEditMission = (flight) => {
    // Only allow editing if:
    // 1. Mission has all required fields filled
    // 2. Status is 'planned' (not active, completed, or rejected)
    // 3. No cancel request is pending
    // 4. Start time is in the future
    const hasAllDetails = flight.drone_model &&
      flight.command_name &&
      flight.purpose &&
      flight.start &&
      flight.end;

    const editableStatus = flight.status === 'planned';
    const noCancelRequest = !flight.cancel_requested;
    const futureStart = new Date(flight.start) > new Date();

    return hasAllDetails && editableStatus && noCancelRequest && futureStart;
  };

  const startEditMission = (flight) => {
    if (!canEditMission(flight)) {
      toast.error('This mission cannot be edited at this time');
      return;
    }

    setEditingMission(flight.id);
    setEditForm({
      drone_model: flight.drone_model,
      command_name: flight.command_name,
      purpose: flight.purpose,
      start: flight.start,
      end: flight.end
    });
  };

  const cancelEditMission = () => {
    setEditingMission(null);
    setEditForm({
      drone_model: '',
      command_name: '',
      purpose: '',
      start: '',
      end: ''
    });
  };

  const saveEditMission = async (flightId) => {
    // Validate edit form
    if (!editForm.drone_model || !editForm.command_name || !editForm.purpose ||
      !editForm.start || !editForm.end) {
      toast.error('Please fill all fields');
      return;
    }

    const start = new Date(editForm.start);
    const end = new Date(editForm.end);

    if (start >= end) {
      toast.error('End time must be after start time');
      return;
    }

    if (start < new Date()) {
      toast.error('Start time cannot be in the past');
      return;
    }

    // Update flight using API
    try {
      const result = await apiService.updateFlight(flightId, {
        drone_model: editForm.drone_model,
        command_name: editForm.command_name,
        purpose: editForm.purpose,
        start: editForm.start,
        end: editForm.end
      });

      if (result.success) {
        toast.success('Mission updated successfully');
        setEditingMission(null);
        setEditForm({
          drone_model: '',
          command_name: '',
          purpose: '',
          start: '',
          end: ''
        });
        await loadMyFlights(); // Reload flights
      } else {
        toast.error(result.message || 'Failed to update mission');
      }
    } catch (error) {
      console.error('Failed to update mission:', error);
      toast.error('Failed to update mission');
    }
  };


  if (!fullUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Orange Top Bar */}
      <div className="bg-orange-500 h-1"></div>

      {/* Government Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Left - Logo + Titles */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <img src={profileImg} alt="Profile" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800"></h1>
              <h2 className="text-lg font-bold text-gray-800">
                Indian Army
              </h2>
              <p className="text-sm text-gray-600">
                
              </p>
              <p className="text-sm text-blue-600 font-medium">
                Drone Management Portal - Operator Dashboard
              </p>
            </div>
          </div>

          {/* Right - User Info & Logout */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UserIcon className="h-4 w-4" />
                <span>Operator: {fullUser?.username}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Unit: {fullUser?.unit || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Database className="h-4 w-4" />
                <span>Registered Drones: {availableDroneIds.length}</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              LOGOUT
            </Button>
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <img src={logo} alt="Profile" />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-slate-800 text-white">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex space-x-8">
            <a href="/" className="py-3 px-2 text-sm hover:bg-slate-700 bg-slate-700">
              Mission Planning
            </a>
            <a href="FlightHistory" className="py-3 px-2 text-sm hover:bg-slate-700">
              Flight History
            </a>
            <a href="Airspace" className="py-3 px-2 text-sm hover:bg-slate-700">
              Airspace Status
            </a>
            <a href="#" className="py-3 px-2 text-sm hover:bg-slate-700">
              Documentation
            </a>
            <a href="#" className="py-3 px-2 text-sm hover:bg-slate-700">
              Support
            </a>
          </div>
          <div className="text-xs text-gray-300">
            Last Updated: {new Date().toLocaleDateString('en-IN')}
          </div>
        </div>
      </nav>

      <div className="flex mx-auto h-screen w-[90vw]">
        {/* MAP */}
        <div className={`flex-1 p-0 transition-all duration-300 ${sidebarCollapsed ? 'mr-2' : ''}`}>
          <Card className="h-full border-gray-300 shadow-lg overflow-hidden">
            <CardHeader className="bg-slate-50 rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-10 text-blue-600" />
                  <span className="text-gray-800">Tactical Map View - {userCommandCenter.name}</span>
                </div>
                {/* <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="text-gray-600 hover:bg-gray-200"
                >
                  {sidebarCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button> */}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {missionDetailsSet
                  ? `Mission Active: Click on the map to add waypoints (${waypoints.length} added)`
                  : 'Complete mission details in the control panel to begin planning'}
              </CardDescription>
            </CardHeader>
            <CardContent  className="h-[calc(100%)] p-0">
              <CesiumMap
                waypoints={waypoints}
                onMapClick={handleMapClick}
              
              />
            </CardContent>
          </Card>
        </div>

      
      {/* Government Footer */}
  {/* <footer className="bg-slate-900 text-white py-6 px-4 mt-8">
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
                 <Globe className="h-4 w-4" />
                 <span>Version 2.1.0 | Build: DMS-2025</span>
               </div>
               <div className="text-xs text-gray-500 mt-1">
                 © 2025 All Rights Reserved | Designed & Maintained by NIC
               </div>
             </div>
           </div>
         </div>
       </footer> */}
    </div>
    </div>
  
  );
};

export default Airspace;

