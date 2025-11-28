import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { ArrowLeft, Plane, Shield, CheckCircle, AlertCircle, Plus, Trash2, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "../components/ui/alert";
import { dbManager } from "@/lib/database";
import govSeal from "@/assets/gov-seal.png";
import profileImg from '../assets/logo.png';
import { Eye, EyeOff } from "lucide-react";
import { User, Lock, Globe, UserPlus, LogIn, UserCog } from 'lucide-react';
import { RegistrationData } from '@/lib/database';

// Updated form schema with confirm password and multiple drones support
const formSchema = z.object({
  // User Details Section
  abc: z.string().min(1, "Please select an option"),
  yeDiv: z.string().min(1, "Please select an option"),
  zxc: z.string().min(1, "Please select an option"),
  bde: z.string().min(1, "Please select an option"),
  corps: z.string().min(1, "Please select an option"),
  unit: z.string().min(1, "Unit is required"),
  username: z.string().min(3, "Username must be at least 3 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Drone specification schema
const droneSpecSchema = z.object({
  droneName: z.string().min(1, "Drone name is required"),
  droneIds: z.array(z.string().min(1, "Drone ID is required")).min(1, "At least one drone ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  frequency: z.number().positive("Frequency must be positive"),
  clockDrift: z.number(),
  spectralLeakage:z.number(),
  modularshapeId:z.number(), 
  maxHeight: z.number().positive("Max height must be positive"),
  maxSpeed: z.number().positive("Max speed must be positive"),
  maxRange: z.number().min(0, "Range must be positive"),
  maxDuration: z.number().min(0, "Duration must be positive"),
  gpsEnabled: z.string().min(1, "Please select Yes or No"),
  autonomous: z.string().min(1, "Please select Yes or No"),
  controlled: z.string().min(1, "Please select Yes or No"),
  cameraEnabled: z.string().min(1, "Please select Yes or No"),
  cameraResolution: z.string().optional(),
  operatingFrequency: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;
type DroneSpec = z.infer<typeof droneSpecSchema>;

// TypeScript interfaces for hierarchy data
interface Corps {
  name: string;
  corps: string[];
}

interface Brigade {
  name: string;
  brigades: { [key: string]: Corps };
}

interface Division {
  name: string;
  brigades: { [key: string]: Corps };
}

interface Command {
  divisions: { [key: string]: Division };
}

interface HierarchyData {
  [key: string]: Command;
}

// Operator category names mapping
const operatorCategoryNames = {
  a: "Army",
  b: "Navy", 
  c: "Air Force",
  d: "Other"
};

// Command names mapping
const commandNames = {
  ec: "Eastern Command",
  wc: "Western Command", 
  sc: "Southern Command",
  nc: "Northern Command",
  swc: "South Western Command",
  anc: "Central Command"
};

// Complete Hierarchical data structure for all commands
const hierarchyData: HierarchyData = {
  sc: { // Southern Command
    divisions: {
      ar: {
        name: "HQ 12 CORPS",
        brigades: {
          bde1: { name: "HQ JOSA", corps: [] },
          bde2: { name: "11 RAPID", corps: ["cor4", "cor5", "cor6","cor7","cor8",] },
          bde3: { name: "12 RAPID", corps: ["cor9","cor10", "cor11", "cor12","cor13","cor14","cor15","cor16","cor17","cor18",] },
        }
      },
      cr: {
       name: "HQ 21 CORPS",
       brigades: {
         bde1: { name: "31 ARMD DIV", corps: ["cor21", "cor22", "cor23","cor24"] },
         bde2: { name: "36 RAPID", corps: ["cor25", "cor26", "cor27","cor28"] },
         bde3: { name: "41 ARTY DIV", corps: ["cor29", "cor30", "cor31"] },
         bde4: { name: "54 INF DIV", corps: ["cor32", "cor33", "cor34","cor35","cor159","cor160","cor161"] }
       }
     },
     dr: {
       name: "HQ DB AREA",
       brigades: {
         bde1: { name: "", corps: [] },
         bde2: { name: "", corps: [] },
       }
     },
      br: {
        name: "HQ MG&G AREA",
        brigades: {
          bde3: { name: "", corps: [] },
          bde4: { name: "", corps: [] },
          bde5: { name: "", corps: [] },
          bde6: { name: "", corps: [] },
          bde7: { name: "", corps: [] },
          bde8: { name: "", corps: [] },
        }
      }
    }
  },

  ec: { // Eastern Command
    divisions: {
      ar: {
        name: "3 CORPS",
        brigades: {
          bde1: { name: "2 MNT DIV", corps: ["cor36", "cor37", "cor38","cor39"] },
          bde2: { name: "56 INF DIV", corps: ["cor40", "cor41", "cor42","cor43"] },
          bde3: { name: "57 MNT DIV", corps: ["cor44", "cor45", "cor46","cor47",] },
        }
      },
      br: {
       name: "4 CORPS",
       brigades: {
         bde1: { name: "5 MNT DIV", corps: ["cor48", "cor49", "cor50","cor51","cor52"] },
         bde2: { name: "21 MTN DIV", corps: [] },
         bde3: { name: "71 INF DIV", corps: ["cor53", "cor54", "cor55","cor56","cor57",] },
     
     
       }
     },  
      cr: {
       name: "33 CORPS",
       brigades: {
         bde1: { name: "17 MTN DIV", corps: ["cor58", "cor59", "cor60","cor61","cor62",] },
         bde2: { name: "20 MTN DIV", corps: ["cor63", "cor64", "cor65","cor66",] },
         bde3: { name: "27 MTN DIV", corps: [] },
         bde4: { name: "HQ 111 SUB AREA", corps: [] },
       }
     },   
     dr: {
       name: "17 CORPS",
       brigades: {
         bde1: { name: "59 INF DIV", corps: ["cor67", "cor68", "cor69","cor70",] },
         bde2: { name: "23 INF DIV", corps: ["cor71", "cor72", "cor73","cor74","cor75","cor76",] }
       }
     },
     er: {
       name: "101 AREA",
       brigades: {
         bde1: { name: "101 AREA SIG", corps: [] },
         bde2: { name: "101 AREA PRO", corps: [] },
         bde3: { name: "MH SHILLONG", corps: [] },
         bde4: { name: "39 COY ASC", corps: [] },
       }
     },
     fr: {
       name: "BENGAL SUB AREA",
       brigades: {
         bde1: { name: "BDE 1", corps: [] },
         bde2: { name: "BDE 2", corps: [] }
       }
     },
     qr: {
       name: "618(I) AD BDE",
       brigades: {
         bde1: { name: "BDE 1", corps: [] },
         bde2: { name: "BDE 2", corps: [] }
       }
     },
     Gr: {
       name: "375 CAB",
       brigades: {
         bde1: { name: "BDE 1", corps: [] },
         bde2: { name: "BDE 2", corps: [] }
       }
     },
    }
  },

  wc: { // Western Command
    divisions: {
      ar: {
        name: "HQ 2 CORPS",
        brigades: {
          bde1: { name: "HQ 1 ARMD DIV", corps: [] },
          bde2: { name: "HQ 9 INF DIV ", corps: ["cor77", "cor78", "cor79","cor80"] },
          bde3: { name: "HQ 22 RAPID DIV(S)", corps: ["cor81", "cor82", "cor83", "cor84","cor1111"] },
          bde4: { name: "HQ 40 ARTY DIV", corps: ["cor85", "cor86", "cor87"] },
          bde5: { name: "474 ENGNR BDE", corps: [] },
          bde6: { name: "785 (I) AD BDE", corps: [] },
          bde7: { name: "HQ 16(I) ARMD BDE", corps: [] },
        }
      },
      br: {
       name: "HQ 9 CORPS",
       brigades: {
         bde1: { name: "26 INF DIV", corps: ["cor88", "cor89", "cor90","cor91","cor92",] },
         bde2: { name: "29 INF DIV ", corps: ["cor93", "cor94", "cor95","cor96","cor97",] },
         bde3: { name: "21 SUB AREA", corps: [] },
         bde4: { name: "2(I) ARMD BDE ", corps: [] },
         bde5: { name: "3(I) ARMD BDE", corps: [] },
         bde6: { name: "84 INF BDE", corps: [] },
         bde7: { name: "401 ARTY BDE", corps: [] },
         bde8: { name: "616 (I) AD BDE", corps: [] },
       }
     },
     cr: {
       name: "HQ 11 CORPS",
       brigades: {
         bde1: { name: "7 INF DIV ", corps: ["cor99", "cor100","cor101","cor102","cor103"] },
         bde2: { name: "15 INF DIV", corps: [] },
         bde3: { name: "55(I) MECH BDE", corps: [] },
         bde4: { name: "23(I) ARMD BDE", corps: [] },
         bde5: { name: "715(I) AD BDE", corps: [] },
       }
     },
     dr: {
       name: "HQ DELHI AREA",
       brigades: {
         bde1: { name: "", corps: [] },
         bde2: { name: "", corps: [] }
       }
     },
   
    }
  },

  nc: { // Northern Command
    divisions: {
      ar: {
        name: "1 CORPS",
        brigades: {
          bde1: { name: "4 INF DI", corps: ["cor104","cor105","cor106","cor107",] },
          bde2: { name: "6 INF DIV", corps: ["cor108","cor109","cor110","cor111",] },
          bde3: { name: "42 ARTY DIV", corps: ["cor112","cor113","cor114",] },
        }
      },
      br: {
       name: "14 CORPS",
       brigades: {
         bde1: { name: "3 INF DIV ", corps: ["cor115","cor116","cor117",] },
         bde2: { name: "8 MTN DIV", corps: ["cor118","cor119","cor120","cor121",] },
         bde3: { name: "UNIFORM FORCE", corps: ["cor122",] },
         bde4: { name: "HQ 72 SUB AREA", corps: [] },
         bde5: { name: "614(I) AVN BDE", corps: [] },
         bde6: { name: "N AREA", corps: [] },
         bde7: { name: "102(I) INF BDE", corps: [] },
         bde8: { name: "118 (I) INF BDE", corps: [] },     
       }
     },
     cr: {
       name: "15 CORPS",
       brigades: {
         bde1: { name: "19 INF DIV", corps: ["cor123","cor124","cor125","cor126","cor127",] },
         bde2: { name: "26 INF DIV", corps: ["cor128","cor129","cor130","cor131","cor132","cor133",] },
         bde3: { name: "CIF (K)", corps: [] },
         bde4: { name: "CIF (V)", corps: [] },
         bde5: { name: "619 (I) AD BDE", corps: [] },

       }
     },
     dr: {
       name: "16 CORPS",
       brigades: {
         bde1: { name: "10 RAPID", corps: ["cor134","cor135","cor136","cor137","cor138",] },
         bde2: { name: "25 INF DIV", corps: ["cor139","cor140","cor141","cor142","cor143",] },
         bde3: { name: "CI FORCE (D)", corps: [] },
         bde4: { name: "CI FORCE (R)", corps: [] },
         bde5: { name: "163 INF BDE", corps: [] },
       }
     },
    }
  },

  swc: { // South Western Command
    divisions: {
      ar: {
        name: "10 CORPS",
        brigades: {
          bde1: { name: "16 RAPID", corps: ["cor144","cor145","cor146","cor147","cor148",] },
          bde2: { name: "18 INF DIV", corps: ["cor149","cor150","cor151","cor152","cor153",] },
          bde3: { name: "24 RAPID", corps: ["cor154","cor155","cor156","cor157","cor158",] },
          bde4: { name: "10 CAB", corps: [] },
          bde5: { name: "615 (I) AD BDE", corps: [] },
          bde6: { name: "6 (I) ARMD BDE", corps: [] },
        }
      },
    }
  },

  anc: { // Central Command
    divisions: {
      ar: {
        name: "HQ 14 INF DIV ",
        brigades: {
          bde1: { name: "14 ARTY BDE", corps: [] },
          bde2: { name: "71 MTN BDE", corps: [] },
          bde3: { name: "95 INF BDE", corps: [] },
          bde4: { name: "116 INF BDE", corps: [] },
        }
      },
      br: {
       name: "HQ MB AREA ",
       brigades: {
         bde1: { name: "", corps: [""] },
         bde2: { name: "", corps: [""] }
       }
     },
     cr: {
       name: "HQ UB AREA ",
       brigades: {
         bde1: { name: "", corps: [""] },
         bde2: { name: "", corps: [""] }
       }
     },
     dr: {
       name: "HQ MUPSA",
       brigades: {
         bde1: { name: "", corps: [""] },
         bde2: { name: "", corps: [""] }
       }
     },
   
      fr: {
        name: "HQ 50 (I) PARA BDE",
        brigades: {
          bde3: { name: "", corps: [""] },
          bde4: { name: "", corps: [""] },
        }
      }
    }
  }
};

// Extended corps names mapping
const corpsNames = {
  // Southern Command Corps
  cor4: "85 INF BDE", cor5: "31 INF BDE",
  cor6: "110 ARMD BDE", cor7: "330 INF BDE", cor8: "11 ARTY BDE", cor9: "12 ARTY BDE", cor10: "20 INF BDE",
  cor11: "30 INF BDE", cor12: "45 INF BDE", cor13: "140 ARMD BDE", cor14: "4(I) ARMD BDE", cor15: "75 (I) INF BDE",
  cor16: "340 (I) BDE", cor17: "769 (I) MECH BDE", cor18: "12 CAB",
  // Eastern Command Corps
  cor19: "COR 19", cor20: "COR 20", cor21: "27 ARMD BDE", cor22: "34 ARMD BDE", cor23: "94 ARMD BDE",
  cor24: "31 ARTY BDE", cor25: "18 ARMD BDE", cor26: "72 INF BDE", cor27: "115 INF BDE", cor28: "36 ARTY BDE",
  cor29: "97 ARTY BDE", cor30: "98 ARTY BDE", cor31: "374 COMP ARTY BDE", cor32: "47 INF BDE", cor33: "54 ARTY BDE",
  cor34: "76 INF BDE", cor35: "91 INF BDE", cor36: "2 ARTY BDE",cor37: "82 MTN BDE",cor38: "117 MTN BDE",cor39: "181 MTN BDE",
  // Western Command Corps
  cor40: "5 INF BDE", cor41: "22 INF BDE", cor42: "56 ARTY BDE", cor43: "103 INF BDE", cor44: "44 MTN BDE",
  cor45: "57 MTN ARTY BDE", cor46: "59 MTN BDE", cor47: "73 MTN BDE", cor48: "311 MTN BDE", cor49: "351 INF BDE",
  cor50: "77 MTN BDE", cor51: "5 MTN ARTY BDE",
  cor52: "190 MTN BDE", cor53:"40 MTN BDE" ,cor54: "46 INF BDE",cor55: "106 INF BDE",cor56: "71 ARTY BDE",cor57: "604(I) AVN BDE",
  cor58: "63 MTN BDE",cor59: "64 MTN BDE",
  // Northern Command Corps
  cor60: "164 MTN BDE", cor61: "166 MTN BDE", cor62: "17 MTN ARTY BDE", cor63: "20 MTN ARTY BDE", cor64: "66 MTN BDE",
  cor65: "165 MTN BDE", cor66: "202 MTN BDE", cor67: "59 ARTY BDE", cor68: "122 INF BDE", cor69: "124 INF BDE",
  cor70: "131 INF BDE", cor71: "61 INF BDE", cor72: "167 INF BDE",
  // South Western Command Corps
  cor73: "23 ARTY BDE", cor74: "417 ENGNR BDE", cor75: "17 CORPS ARTY BDE", cor76: "788(I) AD BDE", cor77: "9 ARTY BDE",
  cor78: "32 INF BDE", cor79: "38 INF BDE", cor80: "42 INF BDE", cor81: "35 INF BDE", cor82: "49 INF BDE",
  cor83: "60 INF BDE", cor84: "58 ARMD BDE", cor85: "261 ARTY BDE", cor86: "371 CAB", cor87: "372 ARTY BDE",
  cor88: "26 ARTY BDE", cor89: "19 INF BDE", cor90: "162 INF BDE",
  // Andaman and Nicobar Command Corps
  cor91: "92 INF BDE", cor92: "36 INF BDE", cor93: "168 INF BDE", cor94: "29 ARTY BDE", cor95: "51 INF BDE",
  cor96: "78 INF BDE", cor97: "19 INF BDE",  cor99: "SARVATRA BDE", cor100: "AGNIVAAN BDE",cor101:"37 INF BDE",
  cor102: "SEHJRA BDE",cor103: "BAKRI BDE",cor104: "4 ARTY BDE",cor105: "7 INF BDE",cor106: "41 INF BDE",cor107:"146 INF BDE",cor108:"6 MTN BDE",
  cor109:"69 MTN BDE",cor110:"99 MTN BDE",cor111:"135 IND BDE",cor112:"72 ARTY BDE",cor113:"99 ARTY BDE",cor114:"373 ARTY BDE",cor115:"81 INF BDE",
  cor116:"4 SECTOR",cor117:"3 ARTY BDE",cor118:"56 MTN BDE",cor119:"121 (I) INF BDE GP",cor120:"192 MTN BDE",cor121:"8 MTN BDE",cor122:"15 SECT RR",
  cor123:"17 INF BDE",cor124:"12 INF BDE",cor125:"161 INF BDE",cor126:"19 ARTY BDE",cor127:"79 MTN BDE",cor128:"104 INF BDE",
  cor129:"268 INF BDE",cor130:"53 INF BDE",cor131:"109 INF BDE",cor132:"68 MTN BDE",cor133:"28 ARTY BDE",cor134:"10 ARTY BDE",cor135:"28 INF BDE",
  cor136:"52 INF BDE ",cor137:"191 INF BDE",cor138:"130 ARMD BDE",cor139:"93 INF BDE",cor140:"10 INF BDE",cor141:"120 INF BDE",cor142:"80 INF BDE",
  cor143:"25 ARTY BDE",cor144:"15 INF BDE",cor145:"67 INF BDE",cor146:"89 INF BDE",cor147:"16 ARTY BDE",cor148:"62 ARMD BDE",cor149:"18 ARTY BDE",
  cor150:"74 INF BDE",cor151:"150 ARMD BDE",cor152:"322 INF BDE",cor153:"83 INF BDE",cor154:"8 INF BDE",cor155:"24 ARTY BDE",
  cor156:"25 INF BDE",cor157:"170 INF BDE",cor158:"180 ARMD BDE",cor159:"475 ENGR BDE",cor160:"787 (I) AD BDE",cor161:"HQ 617 (I) AD BDE",cor162:"",cor163:"",
  // MISSING 
  cor1111: "22 ARTY BDE",
};

export default function UserRegistration() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // State for multiple drones
  const [droneSpecs, setDroneSpecs] = useState<DroneSpec[]>([{
    droneName: "",
    droneIds: [""],
    quantity: 0,
    frequency: 0,
    clockDrift: 0,
    spectralLeakage: 0,
    modularshapeId: 0,
    maxHeight: 0,
    maxSpeed: 0,
    maxRange: 0,
    maxDuration: 0,
    gpsEnabled: "",
    autonomous: "",
    controlled: "",
    cameraEnabled: "",
    cameraResolution: "",
    operatingFrequency: "",
  }]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      abc: "",
      yeDiv: "",
      zxc: "",
      bde: "",
      corps: "",
      unit: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Watch for changes in hierarchy
  const selectedCommand = form.watch("yeDiv");
  const selectedDivision = form.watch("zxc");
  const selectedBrigade = form.watch("bde");

  // Helper functions to get human-readable names
  const getOperatorCategoryName = (key: string) => operatorCategoryNames[key] || key;
  const getCommandName = (key: string) => commandNames[key] || key;
  const getDivisionName = (commandKey: string, divisionKey: string) => {
    return hierarchyData[commandKey]?.divisions[divisionKey]?.name || divisionKey;
  };
  const getBrigadeName = (commandKey: string, divisionKey: string, brigadeKey: string) => {
    return hierarchyData[commandKey]?.divisions[divisionKey]?.brigades[brigadeKey]?.name || brigadeKey;
  };
  const getCorpsName = (corpsKey: string) => corpsNames[corpsKey] || corpsKey;

  // Get available options based on selections
  const getAvailableDivisions = () => {
    if (selectedCommand && hierarchyData[selectedCommand]) {
      return Object.entries(hierarchyData[selectedCommand].divisions).map(([key, value]) => ({
        value: key,
        label: value.name
      }));
    }
    return [];
  };

  const getAvailableBrigades = () => {
    if (selectedCommand && selectedDivision && hierarchyData[selectedCommand]?.divisions[selectedDivision]) {
      return Object.entries(hierarchyData[selectedCommand].divisions[selectedDivision].brigades).map(([key, value]) => ({
        value: key,
        label: value.name
      }));
    }
    return [];
  };

  const getAvailableCorps = () => {
    if (selectedCommand && selectedDivision && selectedBrigade) {
      const brigade = hierarchyData[selectedCommand]?.divisions[selectedDivision]?.brigades[selectedBrigade];
      if (brigade) {
        return brigade.corps.map(corpKey => ({
          value: corpKey,
          label: corpsNames[corpKey] || corpKey
        }));
      }
    }
    return [];
  };

  // Reset dependent fields when parent changes
  useEffect(() => {
    form.setValue("zxc", "");
    form.setValue("bde", "");
    form.setValue("corps", "");
  }, [selectedCommand]);

  useEffect(() => {
    form.setValue("bde", "");
    form.setValue("corps", "");
  }, [selectedDivision]);

  useEffect(() => {
    form.setValue("corps", "");
  }, [selectedBrigade]);

  // Drone management functions
  const addDrone = () => {
    setDroneSpecs([...droneSpecs, {
      droneName: "",
      droneIds: [""],
      quantity: 0,
      frequency: 0,
      clockDrift: 0,
      spectralLeakage: 0,
      modularshapeId: 0,
      maxHeight: 0,
      maxSpeed: 0,
      maxRange: 0,
      maxDuration: 0,
      gpsEnabled: "",
      autonomous: "",
      controlled: "",
      cameraEnabled: "",
      cameraResolution: "",
      operatingFrequency: "",
    }]);
  };

  const removeDrone = (index: number) => {
    if (droneSpecs.length > 1) {
      const newSpecs = droneSpecs.filter((_, i) => i !== index);
      setDroneSpecs(newSpecs);
    }
  };

  const updateDroneSpec = (index: number, field: keyof DroneSpec, value: any) => {
    const newSpecs = [...droneSpecs];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setDroneSpecs(newSpecs);
  };

  const addDroneId = (droneIndex: number) => {
    const newSpecs = [...droneSpecs];
    newSpecs[droneIndex].droneIds.push("");
    setDroneSpecs(newSpecs);
  };

  const removeDroneId = (droneIndex: number, idIndex: number) => {
    if (droneSpecs[droneIndex].droneIds.length > 1) {
      const newSpecs = [...droneSpecs];
      newSpecs[droneIndex].droneIds = newSpecs[droneIndex].droneIds.filter((_, i) => i !== idIndex);
      setDroneSpecs(newSpecs);
    }
  };

  const updateDroneId = (droneIndex: number, idIndex: number, value: string) => {
    const newSpecs = [...droneSpecs];
    newSpecs[droneIndex].droneIds[idIndex] = value;
    setDroneSpecs(newSpecs);
  };

  // UPDATED SUBMIT FUNCTION - Now saves both keys and human-readable names
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // Validate drone specs
      for (let i = 0; i < droneSpecs.length; i++) {
        const spec = droneSpecs[i];
        const result = droneSpecSchema.safeParse(spec);
        if (!result.success) {
          setSubmitStatus({
            type: 'error',
            message: `Drone ${i + 1}: ${result.error.errors[0].message}`
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare data with both keys and human-readable names
      const registrationData = {
        // User Authentication Data
        username: data.username,
        password: data.password,

        // Military Hierarchy Data - STORE BOTH KEYS AND NAMES
        operatorCategory: {
          key: data.abc,
          name: getOperatorCategoryName(data.abc)
        },
        command: {
          key: data.yeDiv,
          name: getCommandName(data.yeDiv)
        },
        division: {
          key: data.zxc,
          name: getDivisionName(data.yeDiv, data.zxc)
        },
        brigade: {
          key: data.bde,
          name: getBrigadeName(data.yeDiv, data.zxc, data.bde)
        },
        corps: {
          key: data.corps,
          name: getCorpsName(data.corps)
        },
        unit: data.unit,

        // Multiple Drone Specifications
        droneSpecs: droneSpecs
      };

      console.log("Registration Data with Names:", JSON.stringify(registrationData, null, 2));

      // Save to database
      const result = await dbManager.registerUser(registrationData);

      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Registration successful! Your drone operator registration has been submitted and saved. You can now login with your credentials.'
        });

        // Reset form
        form.reset();
        setDroneSpecs([{
          droneName: "",
          droneIds: [""],
          quantity: 0,
          frequency: 0,
          clockDrift: 0,
          spectralLeakage: 0,
          modularshapeId: 0,
          maxHeight: 0,
          maxSpeed: 0,
          maxRange: 0,
          maxDuration: 0,
          gpsEnabled: "",
          autonomous: "",
          controlled: "",
          cameraEnabled: "",
          cameraResolution: "",
          operatingFrequency: "",
        }]);

        // Redirect to login page after 4 seconds
        setTimeout(() => {
          navigate('/');
        }, 4000);
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.message || 'Registration failed. Please check your information and try again.'
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Registration failed due to a system error. Please check your network connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Official Government Header */}
      <header className="bg--800 text-white border-b-4 border-yellow-600">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center  ">
          {/* Left - Logo + Titles */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <img src={profileImg} alt="Profile" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">रक्षा मंत्रालय</h1>
              <h2 className="text-lg font-bold text-gray-800">
                Ministry of Defence
              </h2>
              <p className="text-sm text-gray-600">Ministry of Civil Aviation</p>
              <p className="text-sm text-blue-600 font-medium">
                Drone Management Portal
              </p>
            </div>
          </div>

          {/* Right - Info */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="h-4 w-4" />
              <span>www.gov.in</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Secure Portal</span>
            </div>
          </div>
        </div>
      </header>

      {/* Official Notice Banner */}
      <div className="bg-yellow-600 text-slate-800 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <Shield className="h-4 w-4" />
            OFFICIAL GOVERNMENT REGISTRATION PORTAL - SECURE CONNECTION
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Official Form Header */}
          <div className="bg-white border border-slate-300 rounded-lg p-8 mb-8 shadow-lg animate-fade-in">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 tracking-wide">OFFICIAL USER REGISTRATION</h1>
                  <p className="text-slate-600 font-medium"></p>
                </div>
              </div>
              <div className="bg-slate-100 border-l-4 border-slate-800 p-4 text-left">
                <p className="text-slate-700 text-sm leading-relaxed">
                  <strong>NOTICE:</strong> Registration is required for all drone operators pursuant to Federal Aviation Regulation 14 CFR Part 107.
                  All information provided is subject to verification and must be accurate and complete. False statements may result in penalties.
                </p>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {submitStatus.type && (
            <div className="mb-8">
              <Alert className={submitStatus.type === 'success' ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}>
                {submitStatus.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={submitStatus.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                  {submitStatus.message}
                </AlertDescription>
              </Alert>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Section 1: User Details */}
              <div className="bg-white border border-slate-300 rounded-lg shadow-lg overflow-hidden animate-scale-in">
                <div className="bg-slate-800 text-white px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-600 text-slate-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">SECTION I - OPERATOR INFORMATION</h3>
                      <p className="text-slate-300 text-sm">Required information for all drone operators</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="abc"
                      render={({ field }) => (
                        <FormItem className="animate-fade-in">
                          <FormLabel className="text-slate-700 font-semibold text-sm uppercase tracking-wide">Operator Category *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-slate-400 focus:border-slate-800 h-12">
                                <SelectValue placeholder="Select operator category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="a">Army</SelectItem>
                              <SelectItem value="b">Navy</SelectItem>
                              <SelectItem value="c">Air Force</SelectItem>
                              <SelectItem value="d">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="yeDiv"
                      render={({ field }) => (
                        <FormItem className="animate-fade-in">
                          <FormLabel className="text-slate-700 font-semibold text-sm uppercase tracking-wide">COMD *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-slate-400 focus:border-slate-800 h-12">
                                <SelectValue placeholder="Select command" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ec">Eastern Command</SelectItem>
                              <SelectItem value="wc">Western Command</SelectItem>
                              <SelectItem value="sc">Southern Command</SelectItem>
                              <SelectItem value="nc">Northern Command</SelectItem>
                              <SelectItem value="swc">South Western Command</SelectItem>
                              <SelectItem value="anc">Central Command</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zxc"
                      render={({ field }) => (
                        <FormItem className="animate-fade-in">
                          <FormLabel className="text-slate-700 font-semibold text-sm uppercase tracking-wide">CORPS *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={!selectedCommand}
                          >
                            <FormControl>
                              <SelectTrigger className="border-slate-400 focus:border-slate-800 h-12">
                                <SelectValue placeholder="Select Corps" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {getAvailableDivisions().map((division) => (
                                <SelectItem key={division.value} value={division.value}>
                                  {division.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bde"
                      render={({ field }) => (
                        <FormItem className="animate-fade-in">
                          <FormLabel className="text-slate-700 font-semibold text-sm uppercase tracking-wide">DIV *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={!selectedDivision}
                          >
                            <FormControl>
                              <SelectTrigger className="border-slate-400 focus:border-slate-800 h-12">
                                <SelectValue placeholder="Select Div" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {getAvailableBrigades().map((brigade) => (
                                <SelectItem key={brigade.value} value={brigade.value}>
                                  {brigade.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="corps"
                      render={({ field }) => (
                        <FormItem className="animate-fade-in">
                          <FormLabel className="text-slate-700 font-semibold text-sm uppercase tracking-wide">BDE *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={!selectedBrigade}
                          >
                            <FormControl>
                              <SelectTrigger className="border-slate-400 focus:border-slate-800 h-12">
                                <SelectValue placeholder="Select BDE" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {getAvailableCorps().map((corp) => (
                                <SelectItem key={corp.value} value={corp.value}>
                                  {corp.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem className="animate-fade-in">
                          <FormLabel className="text-slate-700 font-semibold text-sm uppercase tracking-wide">Unit *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="EG.. 76 FD REGT"
                              className="border-slate-400 focus:border-slate-800 h-12"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem className="animate-fade-in">
                          <FormLabel className="text-slate-700 font-semibold text-sm uppercase tracking-wide">Username *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Enter username"
                              className="border-slate-400 focus:border-slate-800 h-12"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="animate-fade-in">
                          <FormLabel className="text-slate-700 font-semibold text-sm uppercase tracking-wide">
                            Password *
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter password"
                                className="border-slate-400 focus:border-slate-800 h-12 pr-12"
                                {...field}
                              />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                ) : (
                                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem className="animate-fade-in">
                          <FormLabel className="text-slate-700 font-semibold text-sm uppercase tracking-wide">
                            Confirm Password *
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm password"
                                className="border-slate-400 focus:border-slate-800 h-12 pr-12"
                                {...field}
                              />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                ) : (
                                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Multiple Drone Specifications */}
               <div className="bg-white border border-slate-300 rounded-lg shadow-lg overflow-hidden animate-scale-in">
                              <div className="bg-slate-800 text-white px-6 py-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-yellow-600 text-slate-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                                      2
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-bold">SECTION II - DRONE SPECIFICATIONS</h3>
                                      <p className="text-slate-300 text-sm">Technical specifications and operational parameters</p>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    onClick={addDrone}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center gap-2"
                                  >
                                    <Plus className="h-4 w-4" />
                                    Add Drone
                                  </Button>
                                </div>
                              </div>
              
                              <div className="p-6 space-y-8">
                                {droneSpecs.map((droneSpec, droneIndex) => (
                                  <div key={droneIndex} className="border border-slate-200 rounded-lg p-6 bg-slate-50 relative">
                                    {droneSpecs.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeDrone(droneIndex)}
                                        className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                                      >
                                        <X className="h-5 w-5" />
                                      </button>
                                    )}
                                    
                                    <div className="flex items-center gap-2 mb-4">
                                      <Plane className="h-5 w-5 text-slate-600" />
                                      <h4 className="text-lg font-semibold text-slate-800">Drone {droneIndex + 1}</h4>
                                    </div>
              
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div>
                                        <label className="text-slate-700 font-semibold text-sm uppercase tracking-wide block mb-2">
                                          Drone Name *
                                        </label>
                                        <Input
                                          placeholder="Enter drone model"
                                          className="border-slate-400 focus:border-slate-800 h-12"
                                          value={droneSpec.droneName}
                                          onChange={(e) => updateDroneSpec(droneIndex, 'droneName', e.target.value)}
                                        />
                                      </div>
              
                                      <div>
                                        <label className="text-slate-700 font-semibold text-sm uppercase tracking-wide block mb-2">
                                          Quantity *
                                        </label>
                                        <Input
                                          type="number"
                                          min="0"
                                          step="1"
                                          placeholder="Quantity"
                                          className="border-slate-400 focus:border-slate-800 h-12"
                                          value={droneSpec.quantity || ""}
                                          onChange={(e) => updateDroneSpec(droneIndex, 'quantity', parseInt(e.target.value) || 0)}
                                        />
                                      </div>
              
                                      <div className="md:col-span-2">
                                        <label className="text-slate-700 font-semibold text-sm uppercase tracking-wide block mb-2">
                                          Drone IDs *
                                        </label>
                                        <div className="space-y-2">
                                          {droneSpec.droneIds.map((droneId, idIndex) => (
                                            <div key={idIndex} className="flex items-center gap-2">
                                              <Input
                                                placeholder={`Enter drone ID ${idIndex + 1}`}
                                                className="border-slate-400 focus:border-slate-800 h-12 flex-1"
                                                value={droneId}
                                                onChange={(e) => updateDroneId(droneIndex, idIndex, e.target.value)}
                                              />
                                              {droneSpec.droneIds.length > 1 && (
                                                <button
                                                  type="button"
                                                  onClick={() => removeDroneId(droneIndex, idIndex)}
                                                  className="text-red-500 hover:text-red-700 p-2"
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </button>
                                              )}
                                            </div>
                                          ))}
                                          <Button
                                            type="button"
                                            onClick={() => addDroneId(droneIndex)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm flex items-center gap-1"
                                          >
                                            <Plus className="h-3 w-3" />
                                            Add Drone ID
                                          </Button>
                                        </div>
                                      </div>
              
                                      <div>
                                        <label className="text-slate-700 font-semibold text-sm uppercase tracking-wide block mb-2">
                                          Frequency *
                                        </label>
                                        <Input
                                          type="number"
                                          min="0"
                                          step="1"
                                          placeholder="Operating frequency"
                                          className="border-slate-400 focus:border-slate-800 h-12"
                                          value={droneSpec.frequency || ""}
                                          onChange={(e) => updateDroneSpec(droneIndex, 'frequency', parseInt(e.target.value) || 0)}
                                        />
                                      </div>
              
                                      <div>
                                        <label className="text-slate-700 font-semibold text-sm uppercase tracking-wide block mb-2">
                                          Clock Drift
                                        </label>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          placeholder="Clock drift value"
                                          className="border-slate-400 focus:border-slate-800 h-12"
                                          value={droneSpec.clockDrift || ""}
                                          onChange={(e) => updateDroneSpec(droneIndex, 'clockDrift', parseFloat(e.target.value) || 0)}
                                        />
                                      </div>
              
                                      <div>
                                        <label className="text-slate-700 font-semibold text-sm uppercase tracking-wide block mb-2">
                                         spectral Leakage
                                        </label>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          placeholder="spectralLeakage value"
                                          className="border-slate-400 focus:border-slate-800 h-12"
                                          value={droneSpec.spectralLeakage || ""}
                                          onChange={(e) => updateDroneSpec(droneIndex, 'spectralLeakage', parseFloat(e.target.value) || 0)}
                                        />
                                      </div>
              
                                      <div>
                                        <label className="text-slate-700 font-semibold text-sm uppercase tracking-wide block mb-2">
                                         modular shape Id
                                        </label>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          placeholder="spectralLeakage value"
                                          className="border-slate-400 focus:border-slate-800 h-12"
                                          value={droneSpec.modularshapeId || ""}
                                          onChange={(e) => updateDroneSpec(droneIndex, 'modularshapeId', parseFloat(e.target.value) || 0)}
                                        />
                                      </div>
              
                                      <div>
                                        <label className="text-slate-700 font-semibold text-sm uppercase tracking-wide block mb-2">
                                          Maximum Speed (m/s) *
                                        </label>
                                        <Input
                                          type="number"
                                          min="0"
                                          step="0.1"
                                          placeholder="Max drone speed"
                                          className="border-slate-400 focus:border-slate-800 h-12"
                                          value={droneSpec.maxSpeed || ""}
                                          onChange={(e) => updateDroneSpec(droneIndex, 'maxSpeed', parseFloat(e.target.value) || 0)}
                                        />
                                      </div>
              
                                      <div>
                                        <label className="text-slate-700 font-semibold text-sm uppercase tracking-wide block mb-2">
                                          Maximum Altitude (m AGL) *
                                        </label>
                                        <Input
                                          type="number"
                                          min="0"
                                          step="0.1"
                                          placeholder="Max flight height"
                                          className="border-slate-400 focus:border-slate-800 h-12"
                                          value={droneSpec.maxHeight || ""}
                                          onChange={(e) => updateDroneSpec(droneIndex, 'maxHeight', parseFloat(e.target.value) || 0)}
                                        />
                                      </div>
              
                                      <div>
                                        <label className="text-slate-700 font-semibold text-sm uppercase tracking-wide block mb-2">
                                          Max Horizontal Distance/Range (km) *
                                        </label>
                                        <Input
                                          type="number"
                                          min="0"
                                          step="0.1"
                                          placeholder="Max flight range"
                                          className="border-slate-400 focus:border-slate-800 h-12"
                                          value={droneSpec.maxRange || ""}
                                          onChange={(e) => updateDroneSpec(droneIndex, 'maxRange', parseFloat(e.target.value) || 0)}
                                        />
                                      </div>
              
                                      <div>
                                        <label className="text-slate-700 font-semibold text-sm uppercase tracking-wide block mb-2">
                                          Max Duration (minutes) *
                                        </label>
                                        <Input
                                          type="number"
                                          min="0"
                                          step="1"
                                          placeholder="Maximum flight time"
                                          className="border-slate-400 focus:border-slate-800 h-12"
                                          value={droneSpec.maxDuration || ""}
                                          onChange={(e) => updateDroneSpec(droneIndex, 'maxDuration', parseInt(e.target.value) || 0)}
                                        />
                                      </div>
              
                                      <div>
                                        <label className="text-slate-700 font-semibold text-sm uppercase tracking-wide block mb-2">
                                          GPS Enabled *
                                        </label>
                                        <Select
                                          onValueChange={(value) => updateDroneSpec(droneIndex, 'gpsEnabled', value)}
                                          value={droneSpec.gpsEnabled}
                                        >
                                          <SelectTrigger className="border-slate-400 focus:border-slate-800 h-12">
                                            <SelectValue placeholder="Select Yes/No" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="yes">Yes</SelectItem>
                                            <SelectItem value="no">No</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
              
                                      <div>
                                        <label className="text-slate-700 font-semibold text-sm uppercase tracking-wide block mb-2">
                                          Autonomous *
                                        </label>
                                        <Select
                                          onValueChange={(value) => updateDroneSpec(droneIndex, 'autonomous', value)}
                                          value={droneSpec.autonomous}
                                        >
                                          <SelectTrigger className="border-slate-400 focus:border-slate-800 h-12">
                                            <SelectValue placeholder="Select Yes/No" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="yes">Yes</SelectItem>
                                            <SelectItem value="no">No</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
              
                                      <div>
                                        <label className="text-slate-700 font-semibold text-sm uppercase tracking-wide block mb-2">
                                          Controlled *
                                        </label>
                                        <Select
                                          onValueChange={(value) => updateDroneSpec(droneIndex, 'controlled', value)}
                                          value={droneSpec.controlled}
                                        >
                                          <SelectTrigger className="border-slate-400 focus:border-slate-800 h-12">
                                            <SelectValue placeholder="Select Yes/No" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="yes">Yes</SelectItem>
                                            <SelectItem value="no">No</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
              
                                      <div>
                                        <label className="text-slate-700 font-semibold text-sm uppercase tracking-wide block mb-2">
                                          Camera Enabled *
                                        </label>
                                        <Select
                                          onValueChange={(value) => updateDroneSpec(droneIndex, 'cameraEnabled', value)}
                                          value={droneSpec.cameraEnabled}
                                        >
                                          <SelectTrigger className="border-slate-400 focus:border-slate-800 h-12">
                                            <SelectValue placeholder="Select Yes/No" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="yes">Yes</SelectItem>
                                            <SelectItem value="no">No</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
              
                                      <div>
                                        <label className="text-slate-700 font-semibold text-sm uppercase tracking-wide block mb-2">
                                          Camera Resolution
                                        </label>
                                        <Input
                                          placeholder="e.g. 1080p, 4K"
                                          className="border-slate-400 focus:border-slate-800 h-12"
                                          value={droneSpec.cameraResolution}
                                          onChange={(e) => updateDroneSpec(droneIndex, 'cameraResolution', e.target.value)}
                                        />
                                      </div>
              
                                      <div>
                                        <label className="text-slate-700 font-semibold text-sm uppercase tracking-wide block mb-2">
                                          Operating Frequency (GHz)
                                        </label>
                                        <Input
                                          type="text"
                                          placeholder="e.g. 2.4 GHz to 5.8 GHz"
                                          className="border-slate-400 focus:border-slate-800 h-12"
                                          value={droneSpec.operatingFrequency}
                                          onChange={(e) => updateDroneSpec(droneIndex, 'operatingFrequency', e.target.value)}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
              

              {/* Submit Section */}
              <div className="bg-white border border-slate-300 rounded-lg shadow-lg p-6 animate-scale-in">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <p className="font-medium text-sm">
                      By submitting this form, you certify that all information is accurate and complete under penalty of law.
                    </p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-slate-800 hover:bg-slate-700 text-white px-12 py-4 text-lg font-bold tracking-wide uppercase shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                       SUBMITTING REGISTRATION...
                     </div>
                   ) : (
                     'Submit Official Registration'
                   )}
                 </Button>
               </div>
             </div>
           </form>
         </Form>
       </div>
     </main>
   </div>
 );
}