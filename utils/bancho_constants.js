module.exports = {
	client_changeAction: 0,
	client_sendPublicMessage: 1,
	client_logout: 2,
	client_requestStatusUpdate: 3,
	client_pong: 4,
	server_userID: 5,
	server_commandError: 6,
	server_sendMessage: 7,
	server_ping: 8,
	server_handleIRCUsernameChange: 9,
	server_handleIRCQuit: 10,
	server_userStats: 11,
	server_userLogout: 12,
	server_spectatorJoined: 13,
	server_spectatorLeft: 14,
	server_spectateFrames: 15,
	client_startSpectating: 16,
	client_stopSpectating: 17,
	client_spectateFrames: 18,
	server_versionUpdate: 19,
	client_errorReport: 20,
	client_cantSpectate: 21,
	server_spectatorCantSpectate: 22,
	server_getAttention: 23,
	server_notification: 24,
	client_sendPrivateMessage: 25,
	server_updateMatch: 26,
	server_newMatch: 27,
	server_disposeMatch: 28,
	client_partLobby: 29,
	client_joinLobby: 30,
	client_createMatch: 31,
	client_joinMatch: 32,
	client_partMatch: 33,
	server_matchJoinSuccess: 36,
	server_matchJoinFail: 37,
	client_matchChangeSlot: 38,
	client_matchReady: 39,
	client_matchLock: 40,
	client_matchChangeSettings: 41,
	server_fellowSpectatorJoined: 42,
	server_fellowSpectatorLeft: 43,
	client_matchStart: 44,
	AllPlayersLoaded: 45,
	server_matchStart: 46,
	client_matchScoreUpdate: 47,
	server_matchScoreUpdate: 48,
	client_matchComplete: 49,
	server_matchTransferHost: 50,
	client_matchChangeMods: 51,
	client_matchLoadComplete: 52,
	server_matchAllPlayersLoaded: 53,
	client_matchNoBeatmap: 54,
	client_matchNotReady: 55,
	client_matchFailed: 56,
	server_matchPlayerFailed: 57,
	server_matchComplete: 58,
	client_matchHasBeatmap: 59,
	client_matchSkipRequest: 60,
	server_matchSkip: 61,
	server_unauthorised: 62,
	client_channelJoin: 63,
	server_channelJoinSuccess: 64,
	server_channelInfo: 65,
	server_channelKicked: 66,
	server_channelAvailableAutojoin: 67,
	client_beatmapInfoRequest: 68,
	server_beatmapInfoReply: 69,
	client_matchTransferHost: 70,
	server_supporterGMT: 71,
	server_friendsList: 72,
	client_friendAdd: 73,
	client_friendRemove: 74,
	server_protocolVersion: 75,
	server_mainMenuIcon: 76,
	client_matchChangeTeam: 77,
	client_channelPart: 78,
	client_receiveUpdates: 79,
	server_topBotnet: 80,
	server_matchPlayerSkipped: 81,
	client_setAwayMessage: 82,
	server_userPanel: 83,
	IRC_only: 84,
	client_userStatsRequest: 85,
	server_restart: 86,
	client_invite: 87,
	server_invite: 88,
	server_channelInfoEnd: 89,
	client_matchChangePassword: 90,
	server_matchChangePassword: 91,
	server_silenceEnd: 92,
	client_specialMatchInfoRequest: 93,
	server_userSilenced: 94,
	server_userPresenceSingle: 95,
	server_userPresenceBundle: 96,
	client_userPresenceRequest: 97,
	client_userPresenceRequestAll: 98,
	client_userToggleBlockNonFriendPM: 99,
	server_userPMBlocked: 100,
	server_targetIsSilenced: 101,
	server_versionUpdateForced: 102,
	server_switchServer: 103,
	server_accountRestricted: 104,
	server_jumpscare: 105,
	client_matchAbort: 106,
	server_switchTourneyServer: 107,
	client_specialJoinMatchChannel: 108,
	client_specialLeaveMatchChannel: 109,
	countryCodes: {
			"LV": 132,
			"AD": 3,
			"LT": 130,
			"KM": 116,
			"QA": 182,
			"VA": 0,
			"PK": 173,
			"KI": 115,
			"SS": 0,
			"KH": 114,
			"NZ": 166,
			"TO": 215,
			"KZ": 122,
			"GA": 76,
			"BW": 35,
			"AX": 247,
			"GE": 79,
			"UA": 222,
			"CR": 50,
			"AE": 0,
			"NE": 157,
			"ZA": 240,
			"SK": 196,
			"BV": 34,
			"SH": 0,
			"PT": 179,
			"SC": 189,
			"CO": 49,
			"GP": 86,
			"GY": 93,
			"CM": 47,
			"TJ": 211,
			"AF": 5,
			"IE": 101,
			"AL": 8,
			"BG": 24,
			"JO": 110,
			"MU": 149,
			"PM": 0,
			"LA": 0,
			"IO": 104,
			"KY": 121,
			"SA": 187,
			"KN": 0,
			"OM": 167,
			"CY": 54,
			"BQ": 0,
			"BT": 33,
			"WS": 236,
			"ES": 67,
			"LR": 128,
			"RW": 186,
			"AQ": 12,
			"PW": 180,
			"JE": 250,
			"TN": 214,
			"ZW": 243,
			"JP": 111,
			"BB": 20,
			"VN": 233,
			"HN": 96,
			"KP": 0,
			"WF": 235,
			"EC": 62,
			"HU": 99,
			"GF": 80,
			"GQ": 87,
			"TW": 220,
			"MC": 135,
			"BE": 22,
			"PN": 176,
			"SZ": 205,
			"CZ": 55,
			"LY": 0,
			"IN": 103,
			"FM": 0,
			"PY": 181,
			"PH": 172,
			"MN": 142,
			"GG": 248,
			"CC": 39,
			"ME": 242,
			"DO": 60,
			"KR": 0,
			"PL": 174,
			"MT": 148,
			"MM": 141,
			"AW": 17,
			"MV": 150,
			"BD": 21,
			"NR": 164,
			"AT": 15,
			"GW": 92,
			"FR": 74,
			"LI": 126,
			"CF": 41,
			"DZ": 61,
			"MA": 134,
			"VG": 0,
			"NC": 156,
			"IQ": 105,
			"BN": 0,
			"BF": 23,
			"BO": 30,
			"GB": 77,
			"CU": 51,
			"LU": 131,
			"YT": 238,
			"NO": 162,
			"SM": 198,
			"GL": 83,
			"IS": 107,
			"AO": 11,
			"MH": 138,
			"SE": 191,
			"ZM": 241,
			"FJ": 70,
			"SL": 197,
			"CH": 43,
			"RU": 0,
			"CW": 0,
			"CX": 53,
			"TF": 208,
			"NL": 161,
			"AU": 16,
			"FI": 69,
			"MS": 147,
			"GH": 81,
			"BY": 36,
			"IL": 102,
			"VC": 0,
			"NG": 159,
			"HT": 98,
			"LS": 129,
			"MR": 146,
			"YE": 237,
			"MP": 144,
			"SX": 0,
			"RE": 183,
			"RO": 184,
			"NP": 163,
			"CG": 0,
			"FO": 73,
			"CI": 0,
			"TH": 210,
			"HK": 94,
			"TK": 212,
			"XK": 0,
			"DM": 59,
			"LC": 0,
			"ID": 100,
			"MG": 137,
			"JM": 109,
			"IT": 108,
			"CA": 38,
			"TZ": 221,
			"GI": 82,
			"KG": 113,
			"NU": 165,
			"TV": 219,
			"LB": 124,
			"SY": 0,
			"PR": 177,
			"NI": 160,
			"KE": 112,
			"MO": 0,
			"SR": 201,
			"VI": 0,
			"SV": 203,
			"HM": 0,
			"CD": 0,
			"BI": 26,
			"BM": 28,
			"MW": 151,
			"TM": 213,
			"GT": 90,
			"AG": 0,
			"UM": 0,
			"US": 225,
			"AR": 13,
			"DJ": 57,
			"KW": 120,
			"MY": 153,
			"FK": 71,
			"EG": 64,
			"BA": 0,
			"CN": 48,
			"GN": 85,
			"PS": 178,
			"SO": 200,
			"IM": 249,
			"GS": 0,
			"BR": 31,
			"GM": 84,
			"PF": 170,
			"PA": 168,
			"PG": 171,
			"BH": 25,
			"TG": 209,
			"GU": 91,
			"CK": 45,
			"MF": 252,
			"VE": 230,
			"CL": 46,
			"TR": 217,
			"UG": 223,
			"GD": 78,
			"TT": 218,
			"TL": 0,
			"MD": 0,
			"MK": 0,
			"ST": 202,
			"CV": 52,
			"MQ": 145,
			"GR": 88,
			"HR": 97,
			"BZ": 37,
			"UZ": 227,
			"DK": 58,
			"SN": 199,
			"ET": 68,
			"VU": 234,
			"ER": 66,
			"BJ": 27,
			"LK": 127,
			"NA": 155,
			"AS": 14,
			"SG": 192,
			"PE": 169,
			"IR": 0,
			"MX": 152,
			"TD": 207,
			"AZ": 18,
			"AM": 9,
			"BL": 0,
			"SJ": 195,
			"SB": 188,
			"NF": 158,
			"RS": 239,
			"DE": 56,
			"EH": 65,
			"EE": 63,
			"SD": 190,
			"ML": 140,
			"TC": 206,
			"MZ": 154,
			"BS": 32,
			"UY": 226,
			"SI": 194,
			"AI": 7
	},
	"userActions": {
		"idle": 0,
		"afk": 1,
		"playing": 2,
		"editing": 3,
		"modding": 4,
		"multiplayer": 5,
		"watching": 6,
		"unknown": 7,
		"testing": 8,
		"submitting": 9,
		"paused": 10,
		"lobby": 11,
		"multiplaying": 2,
		"osuDirect": 13
	},
	"slot_status": {
		"free": 1,
		"locked": 2,
		"notReady": 4,
		"ready": 8,
		"noMap": 16,
		"playing": 32,
		"occupied": 124,
		"playingQuit": 128,
	}
};
