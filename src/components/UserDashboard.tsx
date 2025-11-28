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
import CesiumMap from './CesiumMap2';
import profileImg from '../assets/logo.png';
import logo  from '../assets/Logo1.png'
import { apiService } from '../services/api';
import FlightHistory from './flight_history';

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


// ── PREDEFINED COMMAND CENTRES FOR AIRSPACE VISUALIZATION ─────────────────────
const COMMAND_CENTRES = [
{
  name: '1C',
  bounds: {
    sw: { lat: 30.190833, lng: 72.391111 },
    ne: { lat: 37.167778, lng: 81.288889 },
  },
},
{
  name: '2C',
  bounds: {
    sw: { lat: 17.981667, lng: 83.820833 },
    ne: { lat: 29.565000, lng: 98.016111 },
  },
},
{
  name: '3C',
  bounds: {
    sw: { lat: 22.927500, lng: 67.546389 },
    ne: { lat: 30.316667, lng: 77.003611 },
  },
},
{
  name: '4C',
  bounds: {
    sw: { lat: 19.549444, lng: 67.781944 },
    ne: { lat: 23.037778, lng: 76.606389 },
  },
},
{
  name: '5C',
  bounds: {
    sw: { lat: 20.093611, lng: 76.492222 },
    ne: { lat: 30.324167, lng: 83.858889 },
  },
},
{
  name: '6C',
  bounds: {
    sw: { lat: 7.424722, lng: 71.636667 },
    ne: { lat: 20.563056, lng: 84.883889 },
  },
},
];


const UserDashboard = () => {
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
    toast.error('Please set mission details first');
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

  const [selectedCentres, setSelectedCentres] = useState(
    COMMAND_CENTRES.map((c) => c.name)
  );
  const toggleCentre = (name) => {
    setSelectedCentres((prev) =>
      prev.includes(name)
        ? prev.filter((x) => x !== name)
        : [...prev, name]
    );
    // if the currently selected flight no longer matches, clear it
    if (
      selectedFlight &&
      !selectedCentres.includes(selectedFlight.command_name)
    ) {
      setSelectedFlight(null);
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

  const selectedBounds = useMemo(
    () =>
      COMMAND_CENTRES
        .filter((c) => selectedCentres.includes(c.name))
        .map((c) => c.bounds),
    [selectedCentres]
  );

  // Helper function to determine drone class based on weight or specs
  const getDroneClass = (spec: DroneSpec): string => {
    // You can implement your own logic here based on drone specifications
    // For now, using weight ranges as example
    if (spec.maxRange < 1000) return 'MICRO';
    if (spec.maxRange < 5000) return 'SMALL';
    return 'MEDIUM';
  };

  // Show loading state while full user data is being loaded
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

      <div className="flex h-[calc(100vh-200px)]">
        {/* MAP */}
        <div className={`flex-1 p-4 transition-all duration-300 ${sidebarCollapsed ? 'mr-2' : ''}`}>
          <Card className="h-full border-gray-300 shadow-lg">
            <CardHeader className="pb-2 bg-slate-50 rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-800">Tactical Map View - {userCommandCenter.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="text-gray-600 hover:bg-gray-200"
                >
                  {sidebarCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              </CardTitle>
              <CardDescription className="text-gray-600">
                {missionDetailsSet
                  ? `Mission Active: Click on the map to add waypoints (${waypoints.length} added)`
                  : 'Complete mission details in the control panel to begin planning'}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)] p-0">
              <CesiumMap
                waypoints={waypoints}
                onMapClick={handleMapClick}
                center={mapCenter}
              />
            </CardContent>
          </Card>
        </div>

        {/* SIDEBAR */}
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-12' : 'w-96'} p-4 space-y-4 overflow-y-auto bg-gray-50 border-l border-gray-300`}>
          {sidebarCollapsed ? (
            <div className="flex flex-col items-center space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(false)}
                className="text-blue-600 hover:bg-blue-100 rotate-180"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="writing-mode-vertical text-sm text-blue-600 font-semibold transform -rotate-90">
                CONTROL PANEL
              </div>
            </div>
          ) : (
            <>
              {/* Control Panel Header */}
              <div className="bg-blue-600 text-white p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <h3 className="font-semibold">Mission Control Panel</h3>
                </div>
                <p className="text-xs text-blue-100 mt-1">Configure your drone operation parameters</p>
              </div>

              {!missionDetailsSet ? (
                <>
                  {/* MISSION TIMING */}
                  <Card className="border-gray-300 shadow-sm">
                    <CardHeader className="bg-gray-50 rounded-t-lg">
                      <CardTitle className="text-gray-800 flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span>Mission Schedule</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4 bg-white">
                      <div>
                        <label className="text-sm font-semibold mb-2 block text-gray-700">Start Date & Time</label>
                        <Input
                          type="datetime-local"
                          value={startDateTime}
                          onChange={e => setStartDateTime(e.target.value)}
                          className="bg-gray-50 border-gray-300 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold mb-2 block text-gray-700">End Date & Time</label>
                        <Input
                          type="datetime-local"
                          value={endDateTime}
                          onChange={e => setEndDateTime(e.target.value)}
                          className="bg-gray-50 border-gray-300 focus:border-blue-500"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* DRONE ID SELECTION */}
                  <Card className="border-gray-300 shadow-sm">
                    <CardHeader className="bg-gray-50 rounded-t-lg">
                      <CardTitle className="text-gray-800 flex items-center space-x-2">
                        <Database className="w-5 h-5 text-blue-600" />
                        <span>Select Registered Drone</span>
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Choose from your registered drone assets
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 bg-white">
                      <Select value={selectedDroneId} onValueChange={setSelectedDroneId}>
                        <SelectTrigger className="bg-gray-50 border-gray-300 focus:border-blue-500">
                          <SelectValue placeholder={
                            availableDroneIds.length > 0
                              ? "Select your drone ID"
                              : "No registered drones found"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDroneIds.map(drone => (
                            <SelectItem key={drone.droneId} value={drone.droneId}>
                              <div className="flex flex-col">
                                <span className="font-medium">{drone.droneId}</span>
                                <span className="text-xs text-gray-500">{drone.droneName}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {availableDroneIds.length === 0 && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="text-sm text-yellow-800">
                            <AlertTriangle className="w-4 h-4 inline mr-2" />
                            No registered drones found. Please contact your administrator.
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* DRONE SPECIFICATIONS DISPLAY */}
                  {selectedDroneSpec && (
                    <Card className="border-green-300 shadow-sm bg-green-50">
                      <CardHeader className="bg-green-100 rounded-t-lg">
                        <CardTitle className="text-green-800 flex items-center space-x-2">
                          <Shield className="w-5 h-5" />
                          <span>Drone Specifications</span>
                        </CardTitle>
                        <CardDescription className="text-green-700">
                          {selectedDroneSpec.droneName} - {selectedDroneId}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 bg-white space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <Gauge className="w-4 h-4 text-blue-600" />
                            <div>
                              <div className="font-semibold text-gray-700">Max Height</div>
                              <div className="text-gray-600">{selectedDroneSpec.maxHeight} ft</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Navigation className="w-4 h-4 text-blue-600" />
                            <div>
                              <div className="font-semibold text-gray-700">Max Speed</div>
                              <div className="text-gray-600">{selectedDroneSpec.maxSpeed} kts</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <div>
                              <div className="font-semibold text-gray-700">Max Range</div>
                              <div className="text-gray-600">{selectedDroneSpec.maxRange} km</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <div>
                              <div className="font-semibold text-gray-700">Max Duration</div>
                              <div className="text-gray-600">{selectedDroneSpec.maxDuration} min</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Radio className="w-4 h-4 text-blue-600" />
                            <div>
                              <div className="font-semibold text-gray-700">Frequency</div>
                              <div className="text-gray-600">{selectedDroneSpec.frequency} MHz</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Camera className="w-4 h-4 text-blue-600" />
                            <div>
                              <div className="font-semibold text-gray-700">Camera</div>
                              <div className="text-gray-600">
                                {selectedDroneSpec.cameraEnabled === 'yes' ?
                                  (selectedDroneSpec.cameraResolution || 'Enabled') : 'Disabled'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-4 mt-4">
                          <div className="text-sm text-gray-800 space-y-2 leading-relaxed">
                            <div><span className="font-semibold">GPS:</span> {selectedDroneSpec.gpsEnabled}</div>
                            <div><span className="font-semibold">Autonomous:</span> {selectedDroneSpec.autonomous}</div>
                            <div><span className="font-semibold">Controlled:</span> {selectedDroneSpec.controlled}</div>
                            <div><span className="font-semibold">Clock Drift:</span> {selectedDroneSpec.clockDrift} PPM</div>
                            <div><span className="font-semibold">Spectral Leakage:</span> {selectedDroneSpec.spectralLeakage} DFT</div>
                            <div><span className="font-semibold">Modular Shape ID:</span> {selectedDroneSpec.modularshapeId}</div>
                            {selectedDroneSpec.operatingFrequency && (
                              <div><span className="font-semibold">Operating Frequency:</span> {selectedDroneSpec.operatingFrequency}</div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* COMMAND CENTER - Fixed to use database fields */}
                  <Card className="border-gray-300 shadow-sm">
                    <CardHeader className="bg-gray-50 rounded-t-lg">
                      <CardTitle className="text-gray-800 flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span>Command Details</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 bg-white">
                      <div className="space-y-3">
                        {/* Command Center Assignment */}
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                          <div className="text-sm font-semibold text-blue-800 mb-2">Assigned Command Center</div>
                          <div className="text-lg font-bold text-blue-900">{userCommandCenter.name}</div>
                          <div className="text-xs text-blue-700 mt-1">
                            Coordinates: {userCommandCenter.lat.toFixed(4)}°N, {userCommandCenter.lng.toFixed(4)}°E
                          </div>
                        </div>

                        {/* User Registration Details - FIXED FIELD MAPPING */}
                        <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 p-3 rounded border">
                          <div>
                            <span className="font-semibold text-gray-700">OPR CAT:</span>
                            <div className="text-gray-900">{fullUser?.operatorCategoryName || 'Not specified'}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">COMD:</span>
                            <div className="text-gray-900">{fullUser?.commandName?.toUpperCase() || 'Not specified'}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">DIV:</span>
                            <div className="text-gray-900">{fullUser?.divisionName || 'Not specified'}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">BDE:</span>
                            <div className="text-gray-900">{fullUser?.brigadeName || 'Not specified'}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">CORPS:</span>
                            <div className="text-gray-900">{fullUser?.corpsName || 'Not specified'}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Unit:</span>
                            <div className="text-gray-900">{fullUser?.unit || 'Not assigned'}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* MISSION PURPOSE */}
                  <Card className="border-gray-300 shadow-sm">
                    <CardHeader className="bg-gray-50 rounded-t-lg">
                      <CardTitle className="text-gray-800">Mission Objective</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 bg-white space-y-4">
                      {/* Dropdown */}
                      <Select value={selectedOption} onValueChange={setSelectedOption}>
                        <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 bg-gray-50">
                          <SelectValue placeholder="Select an objective..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mapping">Mapping</SelectItem>
                          <SelectItem value="targeting">Targeting</SelectItem>
                          <SelectItem value="svl">SVL</SelectItem>
                          <SelectItem value="kamakagee">Kamakagee</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Show text box only when "Other" is selected */}
                      {selectedOption === "other" && (
                        <Textarea
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          placeholder="Describe your custom objective..."
                          className="bg-gray-50 border-gray-300 focus:border-blue-500"
                          rows={3}
                        />
                      )}
                    </CardContent>
                  </Card>

                  <Button
                    onClick={handleMissionDetailsSubmit}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                    size="lg"
                    disabled={!selectedDroneId || availableDroneIds.length === 0}
                  >
                    VALIDATE & PROCEED TO PLANNING
                  </Button>

                  {(!selectedDroneId && availableDroneIds.length > 0) && (
                    <p className="text-xs text-gray-500 text-center">
                      Please select a registered drone to proceed
                    </p>
                  )}

                  {availableDroneIds.length === 0 && (
                    <p className="text-xs text-red-500 text-center">
                      No registered drones available. Contact your administrator.
                    </p>
                  )}
                </>
              ) : (
                <>
                  {/* MISSION CONFIRMED */}
                  <Card className="border-green-300 shadow-sm bg-green-50">
                    <CardHeader className="bg-green-100 rounded-t-lg">
                      <CardTitle className="text-green-800 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5" />
                          <span>Mission Approved</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetMissionPlanning}
                          className="text-orange-600 hover:bg-orange-100 text-xs"
                        >
                          RESET
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2 p-4 bg-white">
                      <div className="grid grid-cols-2 gap-2">
                        <div><strong>Drone ID:</strong> {selectedDroneId}</div>
                        <div><strong>Model:</strong> {selectedDroneSpec?.droneName}</div>
                        <div><strong>Command:</strong> {userCommandCenter.name}</div>
                        <div><strong>Status:</strong> <Badge className="bg-green-100 text-green-800">Active</Badge></div>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div><strong>Start:</strong> {new Date(startDateTime).toLocaleString('en-IN')}</div>
                        <div><strong>End:</strong> {new Date(endDateTime).toLocaleString('en-IN')}</div>
                        <div><strong>Purpose:</strong> {purpose}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* FLIGHT PATH PLANNING */}
                  <Card className="border-gray-300 shadow-sm">
                    <CardHeader className="bg-gray-50 rounded-t-lg">
                      <CardTitle className="text-gray-800 flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span>Flight Path Waypoints</span>
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Click on map to add waypoints. Minimum altitude: 500ft
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 bg-white">
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {waypoints.map((wp, i) => (
                          <div key={i} className="p-3 bg-gray-50 rounded border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
                                Waypoint {i + 1}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeWaypoint(i)}
                                className="h-6 w-6 p-0 text-red-600 hover:bg-red-100"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="text-xs space-y-1 text-gray-700">
                              <div className="grid grid-cols-2 gap-2">
                                <div>LAT: {wp.lat.toFixed(6)}</div>
                                <div>LNG: {wp.lng.toFixed(6)}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span>Altitude:</span>
                                <Input
                                  type="number"
                                  value={wp.elev}
                                  onChange={e => handleWaypointElevationChange(i, parseInt(e.target.value, 10))}
                                  className="h-6 text-xs bg-white border-gray-300 w-20"
                                  min={500}
                                  max={selectedDroneSpec?.maxHeight || 15000}
                                />
                                <span>ft AGL</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {waypoints.length === 0 && (
                          <div className="text-center text-gray-500 py-6 bg-gray-50 rounded border-2 border-dashed border-gray-300">
                            <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <div className="text-sm">No waypoints defined</div>
                            <div className="text-xs">Click on the map to add waypoints</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* ENHANCED COLLISION WARNING */}
                  {collisionWarning && (
                    <Alert className="border-red-300 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700 text-sm">
                        <div className="space-y-2">
                          <div className="font-semibold text-red-800">AIRSPACE CONFLICT DETECTED</div>
                          <div className="text-xs whitespace-pre-line bg-red-100 p-2 rounded border">
                            {collisionWarning}
                          </div>
                          <div className="text-xs text-red-600 font-medium">
                            ⚠️ Please resolve conflicts before submitting flight plan
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* AUTO-RESOLVE CONFLICT BUTTON */}
                  {collisionWarning && (
                    <Button
                      onClick={handleAutoResolveConflict}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs py-2"
                      size="sm"
                    >
                      AUTO-RESOLVE CONFLICT
                    </Button>
                  )}

                  {/* SUBMIT FLIGHT PLAN */}
                  <div className="space-y-2">
                    <Button
                      onClick={handleSubmitFlight}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                      size="lg"
                      disabled={waypoints.length === 0 || !!collisionWarning}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      SUBMIT FLIGHT PLAN
                    </Button>
                    {waypoints.length === 0 && (
                      <p className="text-xs text-gray-500 text-center">
                        Add at least one waypoint to submit
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* MY FLIGHTS SECTION */}
              {myFlights.length > 0 && (
                <Card className="border-gray-300 shadow-sm">
                  <CardHeader className="bg-gray-50 rounded-t-lg">
                    <CardTitle className="text-gray-800 flex items-center space-x-2">
                      <Plane className="w-5 h-5 text-blue-600" />
                      <span>My Recent Flights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 bg-white">
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {myFlights.slice(0, 5).map(flight => (
                        <div key={flight.id} className="p-2 bg-gray-50 rounded border border-gray-200 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge
                                className={`text-xs ${
                                  flight.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                  flight.status === 'planned' ? 'bg-purple-100 text-purple-800' :
                                  flight.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                {flight.status.toUpperCase()}
                              </Badge>
                              <span className="font-medium">{flight.drone_model}</span>
                            </div>
                            <div className="flex space-x-1">
                              {canEditMission(flight) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditMission(flight)}
                                  className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                              )}
                              {flight.status === 'planned' && !flight.cancel_requested && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => requestCancel(flight.id)}
                                  className="h-6 w-6 p-0 text-red-600 hover:bg-red-100"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="text-gray-600 mt-1">
                            <div>Purpose: {flight.purpose}</div>
                            <div>Start: {new Date(flight.start).toLocaleDateString('en-IN')}</div>
                            {flight.cancel_requested && (
                              <div className="text-orange-600 font-medium">Cancel Requested</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Government Footer */}
      <footer className="bg-slate-900 text-white py-6 px-4 mt-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Plane className="h-6 w-6 text-orange-400" />
              <div>
                <div className="text-sm font-semibold">Drone Management System</div>
                <div className="text-xs text-gray-400">Ministry of Defence, Government of India</div>
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
      </footer>
    </div>
  );
};

export default UserDashboard;

