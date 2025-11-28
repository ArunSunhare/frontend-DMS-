
export interface User {
  id: string;
  username: string;
  role: 'ADMINISTRATOR' | 'CONTROLLER' | 'OPERATOR';
  command: string;
  commandName: string;
  division: string;
  divisionName: string;
  brigade: string;
  brigadeName: string;
  corps: string;
  corpsName: string;
  unit?: string;
  operatorCategory: string;
  operatorCategoryName: string;
  createdAt: string;
}

export interface DroneSpec {
  id: string;
  user_id: string;
  droneName: string;
  commandName: string;
}

export interface Flight {
  id: string;
  user_id: string;
  drone_model: string;
  drone_class: string;
  frequency: number;
  clockDrift: number;
  spectralLeakage: number;
  modularshapeId: number;
  command_name: string;
  purpose: string;
  start: string;
  end: string;
  status: 'planned' | 'active' | 'completed';
  cancel_requested: boolean;
}

export interface Corps {
  name: string;
  corps: string[];
}

export interface Brigade {
  name: string;
  brigades: { [key: string]: Corps };
}

export interface Division {
  name: string;
  brigades: { [key: string]: Corps };
}

export interface Command {
  divisions: { [key: string]: Division };
}

export interface HierarchyData {
  [key: string]: Command;
}

export const COMMAND_CENTERS = {
  'EASTERN COMMAND': { name: 'EASTERN COMMAND', lat: 33.7738, lng: 76.5762, shortName: 'EC' },
  'WESTERN COMMAND': { name: 'WESTERN COMMAND', lat: 32.7266, lng: 74.8570, shortName: 'WC' },
  'SOUTHERN COMMAND': { name: 'SOUTHERN COMMAND', lat: 18.5204, lng: 73.8567, shortName: 'SC' },
  'NORTHERN COMMAND': { name: 'NORTHERN COMMAND', lat: 34.0837, lng: 74.7973, shortName: 'NC' },
  'SOUTH WESTERN COMMAND': { name: 'SOUTH WESTERN COMMAND', lat: 26.9124, lng: 75.7873, shortName: 'SWC' },
  'CENTRAL COMMAND': { name: 'CENTRAL COMMAND', lat: 23.1815, lng: 79.9864, shortName: 'CC' },
};

export const hierarchyData: HierarchyData = {
  sc: {
    divisions: {
      ar: {
        name: 'HQ 12 CORPS',
        brigades: {
          bde1: { name: 'HQ JOSA', corps: [] },
          bde2: { name: '11 RAPID', corps: ['cor4', 'cor5', 'cor6', 'cor7', 'cor8'] },
          bde3: { name: '12 RAPID', corps: ['cor9', 'cor10', 'cor11', 'cor12', 'cor13', 'cor14', 'cor15', 'cor16', 'cor17', 'cor18'] },
        },
      },
      cr: {
        name: 'HQ 21 CORPS',
        brigades: {
          bde1: { name: '31 ARMD DIV', corps: ['cor21', 'cor22', 'cor23', 'cor24'] },
          bde2: { name: '36 RAPID', corps: ['cor25', 'cor26', 'cor27', 'cor28'] },
          bde3: { name: '41 ARTY DIV', corps: ['cor29', 'cor30', 'cor31'] },
          bde4: { name: '54 INF DIV', corps: ['cor32', 'cor33', 'cor34', 'cor35', 'cor159', 'cor160', 'cor161'] },
        },
      },
      dr: {
        name: 'HQ DB AREA',
        brigades: {
          bde1: { name: '', corps: [] },
          bde2: { name: '', corps: [] },
        },
      },
      br: {
        name: 'HQ MG&G AREA',
        brigades: {
          bde3: { name: '', corps: [] },
          bde4: { name: '', corps: [] },
          bde5: { name: '', corps: [] },
          bde6: { name: '', corps: [] },
          bde7: { name: '', corps: [] },
          bde8: { name: '', corps: [] },
        },
      },
    },
  },
  ec: {
    divisions: {
      ar: {
        name: '3 CORPS',
        brigades: {
          bde1: { name: '2 MNT DIV', corps: ['cor36', 'cor37', 'cor38', 'cor39'] },
          bde2: { name: '56 INF DIV', corps: ['cor40', 'cor41', 'cor42', 'cor43'] },
          bde3: { name: '57 MNT DIV', corps: ['cor44', 'cor45', 'cor46', 'cor47'] },
        },
      },
      br: {
        name: '4 CORPS',
        brigades: {
          bde1: { name: '5 MNT DIV', corps: ['cor48', 'cor49', 'cor50', 'cor51', 'cor52'] },
          bde2: { name: '21 MTN DIV', corps: [] },
          bde3: { name: '71 INF DIV', corps: ['cor53', 'cor54', 'cor55', 'cor56', 'cor57'] },
        },
      },
      cr: {
        name: '33 CORPS',
        brigades: {
          bde1: { name: '17 MTN DIV', corps: ['cor58', 'cor59', 'cor60', 'cor61', 'cor62'] },
          bde2: { name: '20 MTN DIV', corps: ['cor63', 'cor64', 'cor65', 'cor66'] },
          bde3: { name: '27 MTN DIV', corps: [] },
          bde4: { name: 'HQ 111 SUB AREA', corps: [] },
        },
      },
      dr: {
        name: '17 CORPS',
        brigades: {
          bde1: { name: '59 INF DIV', corps: ['cor67', 'cor68', 'cor69', 'cor70'] },
          bde2: { name: '23 INF DIV', corps: ['cor71', 'cor72', 'cor73', 'cor74', 'cor75', 'cor76'] },
        },
      },
      er: {
        name: '101 AREA',
        brigades: {
          bde1: { name: '101 AREA SIG', corps: [] },
          bde2: { name: '101 AREA PRO', corps: [] },
          bde3: { name: 'MH SHILLONG', corps: [] },
          bde4: { name: '39 COY ASC', corps: [] },
        },
      },
      fr: {
        name: 'BENGAL SUB AREA',
        brigades: {
          bde1: { name: 'BDE 1', corps: [] },
          bde2: { name: 'BDE 2', corps: [] },
        },
      },
      qr: {
        name: '618(I) AD BDE',
        brigades: {
          bde1: { name: 'BDE 1', corps: [] },
          bde2: { name: 'BDE 2', corps: [] },
        },
      },
      Gr: {
        name: '375 CAB',
        brigades: {
          bde1: { name: 'BDE 1', corps: [] },
          bde2: { name: 'BDE 2', corps: [] },
        },
      },
    },
  },
  wc: {
    divisions: {
      ar: {
        name: 'HQ 2 CORPS',
        brigades: {
          bde1: { name: 'HQ 1 ARMD DIV', corps: [] },
          bde2: { name: 'HQ 9 INF DIV ', corps: ['cor77', 'cor78', 'cor79', 'cor80'] },
          bde3: { name: 'HQ 22 RAPID DIV(S)', corps: ['cor81', 'cor82', 'cor83', 'cor84', 'cor1111'] },
          bde4: { name: 'HQ 40 ARTY DIV', corps: ['cor85', 'cor86', 'cor87'] },
          bde5: { name: '474 ENGNR BDE', corps: [] },
          bde6: { name: '785 (I) AD BDE', corps: [] },
          bde7: { name: 'HQ 16(I) ARMD BDE', corps: [] },
        },
      },
      br: {
        name: 'HQ 9 CORPS',
        brigades: {
          bde1: { name: '26 INF DIV', corps: ['cor88', 'cor89', 'cor90', 'cor91', 'cor92'] },
          bde2: { name: '29 INF DIV ', corps: ['cor93', 'cor94', 'cor95', 'cor96', 'cor97'] },
          bde3: { name: '21 SUB AREA', corps: [] },
          bde4: { name: '2(I) ARMD BDE ', corps: [] },
          bde5: { name: '3(I) ARMD BDE', corps: [] },
          bde6: { name: '84 INF BDE', corps: [] },
          bde7: { name: '401 ARTY BDE', corps: [] },
          bde8: { name: '616 (I) AD BDE', corps: [] },
        },
      },
      cr: {
        name: 'HQ 11 CORPS',
        brigades: {
          bde1: { name: '7 INF DIV ', corps: ['cor99', 'cor100', 'cor101', 'cor102', 'cor103'] },
          bde2: { name: '15 INF DIV', corps: [] },
          bde3: { name: '55(I) MECH BDE', corps: [] },
          bde4: { name: '23(I) ARMD BDE', corps: [] },
          bde5: { name: '715(I) AD BDE', corps: [] },
        },
      },
      dr: {
        name: 'HQ DELHI AREA',
        brigades: {
          bde1: { name: '', corps: [] },
          bde2: { name: '', corps: [] },
        },
      },
    },
  },
  nc: {
    divisions: {
      ar: {
        name: '1 CORPS',
        brigades: {
          bde1: { name: '4 INF DI', corps: ['cor104', 'cor105', 'cor106', 'cor107'] },
          bde2: { name: '6 INF DIV', corps: ['cor108', 'cor109', 'cor110', 'cor111'] },
          bde3: { name: '42 ARTY DIV', corps: ['cor112', 'cor113', 'cor114'] },
        },
      },
      br: {
        name: '14 CORPS',
        brigades: {
          bde1: { name: '3 INF DIV ', corps: ['cor115', 'cor116', 'cor117'] },
          bde2: { name: '8 MTN DIV', corps: ['cor118', 'cor119', 'cor120', 'cor121'] },
          bde3: { name: 'UNIFORM FORCE', corps: ['cor122'] },
          bde4: { name: 'HQ 72 SUB AREA', corps: [] },
          bde5: { name: '614(I) AVN BDE', corps: [] },
          bde6: { name: 'N AREA', corps: [] },
          bde7: { name: '102(I) INF BDE', corps: [] },
          bde8: { name: '118 (I) INF BDE', corps: [] },
        },
      },
      cr: {
        name: '15 CORPS',
        brigades: {
          bde1: { name: '19 INF DIV', corps: ['cor123', 'cor124', 'cor125', 'cor126', 'cor127'] },
          bde2: { name: '26 INF DIV', corps: ['cor128', 'cor129', 'cor130', 'cor131', 'cor132', 'cor133'] },
          bde3: { name: 'CIF (K)', corps: [] },
          bde4: { name: 'CIF (V)', corps: [] },
          bde5: { name: '619 (I) AD BDE', corps: [] },
        },
      },
      dr: {
        name: '16 CORPS',
        brigades: {
          bde1: { name: '10 RAPID', corps: ['cor134', 'cor135', 'cor136', 'cor137', 'cor138'] },
          bde2: { name: '25 INF DIV', corps: ['cor139', 'cor140', 'cor141', 'cor142', 'cor143'] },
          bde3: { name: 'CI FORCE (D)', corps: [] },
          bde4: { name: 'CI FORCE (R)', corps: [] },
          bde5: { name: '163 INF BDE', corps: [] },
        },
      },
    },
  },
  swc: {
    divisions: {
      ar: {
        name: '10 CORPS',
        brigades: {
          bde1: { name: '16 RAPID', corps: ['cor144', 'cor145', 'cor146', 'cor147', 'cor148'] },
          bde2: { name: '18 INF DIV', corps: ['cor149', 'cor150', 'cor151', 'cor152', 'cor153'] },
          bde3: { name: '24 RAPID', corps: ['cor154', 'cor155', 'cor156', 'cor157', 'cor158'] },
          bde4: { name: '10 CAB', corps: [] },
          bde5: { name: '615 (I) AD BDE', corps: [] },
          bde6: { name: '6 (I) ARMD BDE', corps: [] },
        },
      },
    },
  },
  anc: {
    divisions: {
      ar: {
        name: 'HQ 14 INF DIV ',
        brigades: {
          bde1: { name: '14 ARTY BDE', corps: [] },
          bde2: { name: '71 MTN BDE', corps: [] },
          bde3: { name: '95 INF BDE', corps: [] },
          bde4: { name: '116 INF BDE', corps: [] },
        },
      },
      br: {
        name: 'HQ MB AREA ',
        brigades: {
          bde1: { name: '', corps: [''] },
          bde2: { name: '', corps: [''] },
        },
      },
      cr: {
        name: 'HQ UB AREA ',
        brigades: {
          bde1: { name: '', corps: [''] },
          bde2: { name: '', corps: [''] },
        },
      },
      dr: {
        name: 'HQ MUPSA',
        brigades: {
          bde1: { name: '', corps: [''] },
          bde2: { name: '', corps: [''] },
        },
      },
      fr: {
        name: 'HQ 50 (I) PARA BDE',
        brigades: {
          bde3: { name: '', corps: [''] },
          bde4: { name: '', corps: [''] },
        },
      },
    },
  },
};

export const corpsNames = {
  cor4: '85 INF BDE',
  cor5: '31 INF BDE',
  cor6: '110 ARMD BDE',
  cor7: '330 INF BDE',
  cor8: '11 ARTY BDE',
  cor9: '12 ARTY BDE',
  cor10: '20 INF BDE',
  cor11: '30 INF BDE',
  cor12: '45 INF BDE',
  cor13: '140 ARMD BDE',
  cor14: '4(I) ARMD BDE',
  cor15: '75 (I) INF BDE',
  cor16: '340 (I) BDE',
  cor17: '769 (I) MECH BDE',
  cor18: '12 CAB',
  cor19: 'COR 19',
  cor20: 'COR 20',
  cor21: '27 ARMD BDE',
  cor22: '34 ARMD BDE',
  cor23: '94 ARMD BDE',
  cor24: '31 ARTY BDE',
  cor25: '18 ARMD BDE',
  cor26: '72 INF BDE',
  cor27: '115 INF BDE',
  cor28: '36 ARTY BDE',
  cor29: '97 ARTY BDE',
  cor30: '98 ARTY BDE',
  cor31: '374 COMP ARTY BDE',
  cor32: '47 INF BDE',
  cor33: '54 ARTY BDE',
  cor34: '76 INF BDE',
  cor35: '91 INF BDE',
  cor36: '2 ARTY BDE',
  cor37: '82 MTN BDE',
  cor38: '117 MTN BDE',
  cor39: '181 MTN BDE',
  cor40: '5 INF BDE',
  cor41: '22 INF BDE',
  cor42: '56 ARTY BDE',
  cor43: '103 INF BDE',
  cor44: '44 MTN BDE',
  cor45: '57 MTN ARTY BDE',
  cor46: '59 MTN BDE',
  cor47: '73 MTN BDE',
  cor48: '311 MTN BDE',
  cor49: '351 INF BDE',
  cor50: '77 MTN BDE',
  cor51: '5 MTN ARTY BDE',
  cor52: '190 MTN BDE',
  cor53: '40 MTN BDE',
  cor54: '46 INF BDE',
  cor55: '106 INF BDE',
  cor56: '71 ARTY BDE',
  cor57: '604(I) AVN BDE',
  cor58: '63 MTN BDE',
  cor59: '64 MTN BDE',
  cor60: '164 MTN BDE',
  cor61: '166 MTN BDE',
  cor62: '17 MTN ARTY BDE',
  cor63: '20 MTN ARTY BDE',
  cor64: '66 MTN BDE',
  cor65: '165 MTN BDE',
  cor66: '202 MTN BDE',
  cor67: '59 ARTY BDE',
  cor68: '122 INF BDE',
  cor69: '124 INF BDE',
  cor70: '131 INF BDE',
  cor71: '61 INF BDE',
  cor72: '167 INF BDE',
  cor73: '23 ARTY BDE',
  cor74: '417 ENGNR BDE',
  cor75: '17 CORPS ARTY BDE',
  cor76: '788(I) AD BDE',
  cor77: '9 ARTY BDE',
  cor78: '32 INF BDE',
  cor79: '38 INF BDE',
  cor80: '42 INF BDE',
  cor81: '35 INF BDE',
  cor82: '49 INF BDE',
  cor83: '60 INF BDE',
  cor84: '58 ARMD BDE',
  cor85: '261 ARTY BDE',
  cor86: '371 CAB',
  cor87: '372 ARTY BDE',
  cor88: '26 ARTY BDE',
  cor89: '19 INF BDE',
  cor90: '162 INF BDE',
  cor91: '92 INF BDE',
  cor92: '36 INF BDE',
  cor93: '168 INF BDE',
  cor94: '29 ARTY BDE',
  cor95: '51 INF BDE',
  cor96: '78 INF BDE',
  cor97: '19 INF BDE',
  cor99: 'SARVATRA BDE',
  cor100: 'AGNIVAAN BDE',
  cor101: '37 INF BDE',
  cor102: 'SEHJRA BDE',
  cor103: 'BAKRI BDE',
  cor104: '4 ARTY BDE',
  cor105: '7 INF BDE',
  cor106: '41 INF BDE',
  cor107: '146 INF BDE',
  cor108: '6 MTN BDE',
  cor109: '69 MTN BDE',
  cor110: '99 MTN BDE',
  cor111: '135 IND BDE',
  cor112: '72 ARTY BDE',
  cor113: '99 ARTY BDE',
  cor114: '373 ARTY BDE',
  cor115: '81 INF BDE',
  cor116: '4 SECTOR',
  cor117: '3 ARTY BDE',
  cor118: '56 MTN BDE',
  cor119: '121 (I) INF BDE GP',
  cor120: '192 MTN BDE',
  cor121: '8 MTN BDE',
  cor122: '15 SECT RR',
  cor123: '17 INF BDE',
  cor124: '12 INF BDE',
  cor125: '161 INF BDE',
  cor126: '19 ARTY BDE',
  cor127: '79 MTN BDE',
  cor128: '104 INF BDE',
  cor129: '268 INF BDE',
  cor130: '53 INF BDE',
  cor131: '109 INF BDE',
  cor132: '68 MTN BDE',
  cor133: '28 ARTY BDE',
  cor134: '10 ARTY BDE',
  cor135: '28 INF BDE',
  cor136: '52 INF BDE ',
  cor137: '191 INF BDE',
  cor138: '130 ARMD BDE',
  cor139: '93 INF BDE',
  cor140: '10 INF BDE',
  cor141: '120 INF BDE',
  cor142: '80 INF BDE',
  cor143: '25 ARTY BDE',
  cor144: '15 INF BDE',
  cor145: '67 INF BDE',
  cor146: '89 INF BDE',
  cor147: '16 ARTY BDE',
  cor148: '62 ARMD BDE',
  cor149: '18 ARTY BDE',
  cor150: '74 INF BDE',
  cor151: '150 ARMD BDE',
  cor152: '322 INF BDE',
  cor153: '83 INF BDE',
  cor154: '8 INF BDE',
  cor155: '24 ARTY BDE',
  cor156: '25 INF BDE',
  cor157: '170 INF BDE',
  cor158: '180 ARMD BDE',
  cor159: '475 ENGR BDE',
  cor160: '787 (I) AD BDE',
  cor161: 'HQ 617 (I) AD BDE',
  cor1111: '22 ARTY BDE',
};

export const commandNames = {
  ec: 'Eastern Command',
  wc: 'Western Command',
  sc: 'Southern Command',
  nc: 'Northern Command',
  swc: 'South Western Command',
  anc: 'Central Command',
};